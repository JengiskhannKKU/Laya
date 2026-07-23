import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { notifyShopInfo } from "../utils/line";

const router = Router();

const MERCHANT_APP_URL = process.env.MERCHANT_APP_URL ?? "http://localhost:3000";

// ทุก endpoint เฉพาะ admin
router.use(requireAuth, requireRole("admin"));

async function notify(userId: string, type: string, title: string, body: string, data: unknown) {
  try {
    await query(
      "INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1, $2, $3, $4, $5)",
      [userId, type, title, body, JSON.stringify(data)]
    );
  } catch (err) {
    console.error("notify failed:", err);
  }
}

/** GET /api/admin/withdrawals?status=pending — คำขอถอนเงินทั้งหมด (filter ตามสถานะได้) */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    const rows = await query<Record<string, unknown>>(
      status
        ? `SELECT w.*, s.name AS shop_name
           FROM withdrawal_requests w JOIN shops s ON s.id = w.shop_id
           WHERE w.status = $1 ORDER BY w.created_at DESC`
        : `SELECT w.*, s.name AS shop_name
           FROM withdrawal_requests w JOIN shops s ON s.id = w.shop_id
           ORDER BY (w.status = 'pending') DESC, w.created_at DESC`,
      status ? [status] : []
    );
    res.json(rows.map(mapWithdrawal));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "โหลดคำขอถอนเงินไม่สำเร็จ" });
  }
});

/** โหลดคำขอถอนเงิน + shop_id/user_id ของร้าน สำหรับ transition ทุกแบบ */
async function loadRequestWithShop(id: string) {
  const rows = await query<Record<string, unknown>>(
    `SELECT w.*, s.user_id AS shop_user_id, s.name AS shop_name
     FROM withdrawal_requests w JOIN shops s ON s.id = w.shop_id
     WHERE w.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/** PATCH /api/admin/withdrawals/:id/approve — body: { note? } */
router.patch("/:id/approve", async (req: Request, res: Response) => {
  try {
    const wr = await loadRequestWithShop(req.params.id);
    if (!wr) { res.status(404).json({ error: "ไม่พบคำขอถอนเงิน" }); return; }
    if (wr.status !== "pending") { res.status(409).json({ error: `คำขอนี้อยู่ในสถานะ ${wr.status} แล้ว` }); return; }

    const { note } = req.body as { note?: string };
    await query(
      `UPDATE withdrawal_requests SET status = 'approved', admin_note = $1,
       processed_by = $2, processed_at = NOW(), updated_at = NOW() WHERE id = $3`,
      [note ?? null, req.user!.userId, req.params.id]
    );

    await notify(
      wr.shop_user_id as string, "system",
      "คำขอถอนเงินได้รับการอนุมัติ",
      `คำขอถอน ฿${Number(wr.amount).toLocaleString()} ได้รับการอนุมัติแล้ว — รอโอนเงิน`,
      { withdrawalRequestId: wr.id }
    );
    await notifyShopInfo(wr.shop_id as string, {
      title: "คำขอถอนเงินได้รับการอนุมัติ",
      body: `฿${Number(wr.amount).toLocaleString()} — รอ LAYA โอนเงินเข้าบัญชี`,
      detailUrl: `${MERCHANT_APP_URL}/merchant/payouts`,
    });

    res.json({ id: req.params.id, status: "approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "อนุมัติคำขอถอนเงินไม่สำเร็จ" });
  }
});

/** PATCH /api/admin/withdrawals/:id/reject — body: { note } (จำเป็น) */
router.patch("/:id/reject", async (req: Request, res: Response) => {
  try {
    const wr = await loadRequestWithShop(req.params.id);
    if (!wr) { res.status(404).json({ error: "ไม่พบคำขอถอนเงิน" }); return; }
    if (wr.status !== "pending") { res.status(409).json({ error: `คำขอนี้อยู่ในสถานะ ${wr.status} แล้ว` }); return; }

    const { note } = req.body as { note?: string };
    if (!note) { res.status(400).json({ error: "กรุณาระบุเหตุผลที่ปฏิเสธ" }); return; }

    await query(
      `UPDATE withdrawal_requests SET status = 'rejected', admin_note = $1,
       processed_by = $2, processed_at = NOW(), updated_at = NOW() WHERE id = $3`,
      [note, req.user!.userId, req.params.id]
    );

    await notify(
      wr.shop_user_id as string, "system",
      "คำขอถอนเงินถูกปฏิเสธ",
      `คำขอถอน ฿${Number(wr.amount).toLocaleString()} ถูกปฏิเสธ — เหตุผล: ${note}`,
      { withdrawalRequestId: wr.id }
    );
    await notifyShopInfo(wr.shop_id as string, {
      title: "คำขอถอนเงินถูกปฏิเสธ",
      body: `฿${Number(wr.amount).toLocaleString()} — เหตุผล: ${note}`,
      detailUrl: `${MERCHANT_APP_URL}/merchant/payouts`,
    });

    res.json({ id: req.params.id, status: "rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ปฏิเสธคำขอถอนเงินไม่สำเร็จ" });
  }
});

/** PATCH /api/admin/withdrawals/:id/paid — แอดมินยืนยันว่าโอนเงินให้ร้านเองนอกระบบเรียบร้อยแล้ว */
router.patch("/:id/paid", async (req: Request, res: Response) => {
  try {
    const wr = await loadRequestWithShop(req.params.id);
    if (!wr) { res.status(404).json({ error: "ไม่พบคำขอถอนเงิน" }); return; }
    if (wr.status !== "approved") { res.status(409).json({ error: "ต้องอนุมัติคำขอก่อนจึงจะมาร์คว่าโอนแล้วได้" }); return; }

    const { note } = req.body as { note?: string };
    await query(
      `UPDATE withdrawal_requests SET status = 'paid', admin_note = COALESCE($1, admin_note),
       processed_by = $2, processed_at = NOW(), updated_at = NOW() WHERE id = $3`,
      [note ?? null, req.user!.userId, req.params.id]
    );

    await notify(
      wr.shop_user_id as string, "system",
      "โอนเงินสำเร็จ",
      `LAYA โอนเงิน ฿${Number(wr.amount).toLocaleString()} เข้าบัญชีร้านเรียบร้อยแล้ว`,
      { withdrawalRequestId: wr.id }
    );
    await notifyShopInfo(wr.shop_id as string, {
      title: "โอนเงินสำเร็จ",
      body: `฿${Number(wr.amount).toLocaleString()} เข้าบัญชีร้านเรียบร้อยแล้ว`,
      detailUrl: `${MERCHANT_APP_URL}/merchant/payouts`,
    });

    res.json({ id: req.params.id, status: "paid" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "อัปเดตสถานะโอนเงินไม่สำเร็จ" });
  }
});

function mapWithdrawal(row: Record<string, unknown>) {
  return {
    id: row.id,
    shopId: row.shop_id,
    shopName: row.shop_name ?? null,
    amount: Number(row.amount),
    status: row.status,
    payoutBankName: row.payout_bank_name ?? null,
    payoutBankAccountNo: row.payout_bank_account_no ?? null,
    payoutBankAccountName: row.payout_bank_account_name ?? null,
    payoutPromptpayId: row.payout_promptpay_id ?? null,
    adminNote: row.admin_note ?? null,
    processedAt: row.processed_at ?? null,
    createdAt: row.created_at,
  };
}

export default router;
