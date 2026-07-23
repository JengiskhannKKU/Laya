import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// ทุก endpoint เฉพาะร้านค้า (เจ้าของ wallet) หรือแอดมิน (ซัพพอร์ต)
router.use(requireAuth, requireRole("merchant", "admin"));

/** payments ของร้านนี้ — ใช้ WHERE clause เดียวกับ GET /api/payments (รวม legacy product_order_group_id) */
const SHOP_PAYMENTS_WHERE = `
  p.order_id IN (SELECT id FROM orders WHERE shop_id = $1)
     OR p.weaving_order_id IN (SELECT id FROM weaving_orders WHERE shop_id = $1)
     OR p.product_order_id IN (SELECT id FROM product_orders WHERE shop_id = $1)
     OR (p.product_order_id IS NULL AND p.product_order_group_id IN (
           SELECT order_group_id FROM product_orders WHERE shop_id = $1
         ))
`;

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

async function resolveShopId(req: Request, res: Response): Promise<string | null> {
  const { role, shopId } = req.user!;
  const requested = (req.query.shopId as string) ?? (req.body as { shopId?: string })?.shopId;
  if (role === "admin") {
    if (!requested) { res.status(400).json({ error: "แอดมินต้องระบุ shopId" }); return null; }
    return requested;
  }
  if (!shopId) { res.status(403).json({ error: "บัญชีนี้ไม่มีร้านค้า" }); return null; }
  return shopId;
}

async function loadBalance(shopId: string) {
  const earnedRows = await query<{ total_earned: string }>(
    `SELECT COALESCE(SUM(p.shop_payout) FILTER (WHERE p.status = 'paid'), 0) AS total_earned
     FROM payments p WHERE ${SHOP_PAYMENTS_WHERE}`,
    [shopId]
  );
  const withdrawalRows = await query<{ total_withdrawn: string; reserved: string }>(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) AS total_withdrawn,
       COALESCE(SUM(amount) FILTER (WHERE status IN ('pending', 'approved')), 0) AS reserved
     FROM withdrawal_requests WHERE shop_id = $1`,
    [shopId]
  );

  const totalEarned = Number(earnedRows[0]?.total_earned ?? 0);
  const totalWithdrawn = Number(withdrawalRows[0]?.total_withdrawn ?? 0);
  const pending = Number(withdrawalRows[0]?.reserved ?? 0);
  const available = Math.max(0, Math.round((totalEarned - totalWithdrawn - pending) * 100) / 100);

  return { available, totalEarned, totalWithdrawn, pending };
}

/** GET /api/wallet/balance */
router.get("/balance", async (req: Request, res: Response) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;
    res.json(await loadBalance(shopId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "โหลดยอดเงินใน wallet ไม่สำเร็จ" });
  }
});

/** GET /api/wallet/withdrawals — ประวัติคำขอถอนของร้านนี้ */
router.get("/withdrawals", async (req: Request, res: Response) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;
    const rows = await query<Record<string, unknown>>(
      "SELECT * FROM withdrawal_requests WHERE shop_id = $1 ORDER BY created_at DESC",
      [shopId]
    );
    res.json(rows.map(mapWithdrawal));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "โหลดประวัติการถอนเงินไม่สำเร็จ" });
  }
});

/**
 * POST /api/wallet/withdrawals
 * ร้านยื่นคำขอถอนเงิน — snapshot บัญชีรับเงินของร้าน ณ ตอนยื่นคำขอ กันแก้บัญชีทีหลังแล้วเงินไปผิดที่
 * body: { amount }
 */
router.post("/withdrawals", async (req: Request, res: Response) => {
  try {
    const shopId = await resolveShopId(req, res);
    if (!shopId) return;

    const { amount } = req.body as { amount?: number };
    if (!amount || !Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: "กรุณาระบุจำนวนเงินที่ต้องการถอน" });
      return;
    }

    const shopRows = await query<{
      name: string; bank_name: string | null; bank_account_no: string | null;
      bank_account_name: string | null; promptpay_id: string | null;
    }>(
      "SELECT name, bank_name, bank_account_no, bank_account_name, promptpay_id FROM shops WHERE id = $1",
      [shopId]
    );
    if (!shopRows.length) { res.status(404).json({ error: "ไม่พบร้านค้า" }); return; }
    const shop = shopRows[0];
    if (!shop.bank_account_no && !shop.promptpay_id) {
      res.status(400).json({ error: "กรุณาตั้งค่าบัญชีธนาคาร/พร้อมเพย์สำหรับรับเงินก่อน (ตั้งค่าร้านค้า)" });
      return;
    }

    const { available } = await loadBalance(shopId);
    const rounded = Math.round(amount * 100) / 100;
    if (rounded > available) {
      res.status(400).json({ error: `ยอดที่ถอนได้สูงสุดคือ ฿${available.toLocaleString()}` });
      return;
    }

    const inserted = await query<Record<string, unknown>>(
      `INSERT INTO withdrawal_requests
         (shop_id, amount, payout_bank_name, payout_bank_account_no, payout_bank_account_name, payout_promptpay_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [shopId, rounded, shop.bank_name, shop.bank_account_no, shop.bank_account_name, shop.promptpay_id]
    );

    const admins = await query<{ id: string }>("SELECT id FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await notify(
        admin.id, "system",
        "มีคำขอถอนเงินใหม่",
        `ร้าน ${shop.name} ขอถอน ฿${rounded.toLocaleString()}`,
        { withdrawalRequestId: inserted[0].id, shopId }
      );
    }

    res.status(201).json(mapWithdrawal(inserted[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ยื่นคำขอถอนเงินไม่สำเร็จ" });
  }
});

function mapWithdrawal(row: Record<string, unknown>) {
  return {
    id: row.id,
    shopId: row.shop_id,
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
