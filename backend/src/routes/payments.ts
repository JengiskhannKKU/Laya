import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";
import { generatePromptPayPayload } from "../utils/promptpay";

const router = Router();

const PROMPTPAY_ID = process.env.PROMPTPAY_ID ?? "0812345678";
const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 5);

/** คิดค่าธรรมเนียมแพลตฟอร์ม (US-605): ปัดเป็นทศนิยม 2 ตำแหน่ง */
function calcFee(amount: number): { platformFee: number; shopPayout: number } {
  const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT) / 100;
  return { platformFee, shopPayout: Math.round((amount - platformFee) * 100) / 100 };
}

/**
 * MVP: ลูกค้าจ่ายเงินเข้าร้านค้าโดยตรง — คืน PromptPay ของร้าน (shops.promptpay_id)
 * ถ้าร้านยังไม่ได้ตั้งค่า ให้ fallback ไปที่ PROMPTPAY_ID ของแพลตฟอร์ม (กันร้านเก่าใช้งานไม่ได้)
 */
async function resolveShopPromptPay(shopId: string | null | undefined): Promise<string> {
  if (!shopId) return PROMPTPAY_ID;
  const rows = await query<{ promptpay_id: string | null }>(
    "SELECT promptpay_id FROM shops WHERE id = $1",
    [shopId]
  );
  return rows[0]?.promptpay_id || PROMPTPAY_ID;
}

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

/**
 * GET /api/payments/qr?amount=1234.50
 * Public: สร้าง PromptPay QR payload ตามยอด (ไม่บันทึก DB) — ใช้แสดง QR ในหน้า checkout
 */
router.get("/qr", (req: Request, res: Response) => {
  const amount = Number(req.query.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 2_000_000) {
    res.status(400).json({ error: "amount ไม่ถูกต้อง (ต้องมากกว่า 0 และไม่เกิน 2,000,000)" });
    return;
  }
  const rounded = Math.round(amount * 100) / 100;
  res.json({
    promptpayId: PROMPTPAY_ID,
    amount: rounded,
    payload: generatePromptPayPayload(PROMPTPAY_ID, rounded),
  });
});

/**
 * POST /api/payments
 * ลูกค้าสร้างรายการชำระเงินสำหรับออเดอร์ตัด (orderId) หรือออเดอร์ทอ (weavingOrderId)
 * → คืน payment เดียว จ่ายตรงเข้า PromptPay ของร้านนั้น
 *
 * ตะกร้าสินค้าพร้อมขาย (productOrderGroupId) อาจมีหลายร้านในตะกร้าเดียว
 * → แยกเป็นคนละ payment ต่อร้าน (คนละ QR) จ่ายตรงเข้าบัญชีร้านนั้นๆ โดยตรง — คืน { payments: [...] }
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { orderId, weavingOrderId, productOrderGroupId, method = "promptpay" } = req.body as {
      orderId?: string;
      weavingOrderId?: string;
      productOrderGroupId?: string;
      method?: string;
    };

    if (!orderId && !weavingOrderId && !productOrderGroupId) {
      res.status(400).json({ error: "ต้องระบุ orderId, weavingOrderId หรือ productOrderGroupId" });
      return;
    }

    // ── ตะกร้าสินค้าพร้อมขาย: แยก payment ต่อร้าน จ่ายตรงเข้าบัญชีร้าน ──
    if (productOrderGroupId) {
      const groupRows = await query<{ customer_id: string }>(
        "SELECT customer_id FROM product_order_groups WHERE id = $1",
        [productOrderGroupId]
      );
      if (!groupRows.length) { res.status(404).json({ error: "ไม่พบออเดอร์สินค้า" }); return; }
      if (groupRows[0].customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

      const shopOrders = await query<{ id: string; shop_id: string; shop_name: string; total: string }>(
        `SELECT po.id, po.shop_id, s.name AS shop_name, po.total
         FROM product_orders po JOIN shops s ON s.id = po.shop_id
         WHERE po.order_group_id = $1`,
        [productOrderGroupId]
      );
      if (!shopOrders.length) { res.status(400).json({ error: "ออเดอร์นี้ยังไม่มีรายการสินค้า" }); return; }

      const payments = [];
      for (const so of shopOrders) {
        const amount = Number(so.total);
        if (!amount || !Number.isFinite(amount) || amount <= 0) continue;

        const existing = await query<Record<string, unknown>>(
          `SELECT * FROM payments WHERE status = 'pending' AND payer_id = $1 AND product_order_id = $2 LIMIT 1`,
          [userId, so.id]
        );

        let row: Record<string, unknown>;
        if (existing.length) {
          row = existing[0];
        } else {
          const { platformFee, shopPayout } = calcFee(amount);
          const inserted = await query<Record<string, unknown>>(
            `INSERT INTO payments (product_order_group_id, product_order_id, payer_id, amount, platform_fee, shop_payout, method, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
             RETURNING *`,
            [productOrderGroupId, so.id, userId, amount, platformFee, shopPayout, method]
          );
          row = inserted[0];
        }

        const promptpayId = await resolveShopPromptPay(so.shop_id);
        payments.push({
          ...mapPayment(row),
          shopId: so.shop_id,
          shopName: so.shop_name,
          promptpayId,
          qrPayload: method === "promptpay" ? generatePromptPayPayload(promptpayId, Number(row.amount)) : null,
        });
      }

      res.status(201).json({ payments });
      return;
    }

    // ── ออเดอร์ตัด/ออเดอร์ทอ: payment เดียว จ่ายตรงเข้าบัญชีร้าน ──
    let amount: number | null = null;
    let shopId: string | null = null;
    if (orderId) {
      const rows = await query<{ customer_id: string; shop_id: string; final_price: string | null; estimated_price: string | null }>(
        "SELECT customer_id, shop_id, final_price, estimated_price FROM orders WHERE id = $1",
        [orderId]
      );
      if (!rows.length) { res.status(404).json({ error: "ไม่พบออเดอร์" }); return; }
      if (rows[0].customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
      amount = Number(rows[0].final_price ?? rows[0].estimated_price);
      shopId = rows[0].shop_id;
    } else if (weavingOrderId) {
      const rows = await query<{ customer_id: string; shop_id: string; final_price: string | null; estimated_price: string | null }>(
        "SELECT customer_id, shop_id, final_price, estimated_price FROM weaving_orders WHERE id = $1",
        [weavingOrderId]
      );
      if (!rows.length) { res.status(404).json({ error: "ไม่พบออเดอร์ทอผ้า" }); return; }
      if (rows[0].customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
      amount = Number(rows[0].final_price ?? rows[0].estimated_price);
      shopId = rows[0].shop_id;
    }

    if (!amount || !Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: "ออเดอร์นี้ยังไม่มีราคา (estimated/final price)" });
      return;
    }

    const promptpayId = await resolveShopPromptPay(shopId);

    // ถ้ามี payment pending อยู่แล้ว ใช้รายการเดิม (กันสร้างซ้ำ)
    const existing = await query<Record<string, unknown>>(
      `SELECT * FROM payments
       WHERE status = 'pending' AND payer_id = $1
         AND (order_id = $2 OR weaving_order_id = $3)
       LIMIT 1`,
      [userId, orderId ?? null, weavingOrderId ?? null]
    );

    if (existing.length) {
      const p = existing[0];
      res.json({
        ...mapPayment(p),
        promptpayId,
        qrPayload: generatePromptPayPayload(promptpayId, Number(p.amount)),
      });
      return;
    }

    const { platformFee, shopPayout } = calcFee(amount);

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO payments (order_id, weaving_order_id, payer_id, amount, platform_fee, shop_payout, method, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [orderId ?? null, weavingOrderId ?? null, userId, amount, platformFee, shopPayout, method]
    );

    res.status(201).json({
      ...mapPayment(rows[0]),
      promptpayId,
      qrPayload: method === "promptpay" ? generatePromptPayPayload(promptpayId, amount) : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สร้างรายการชำระเงินไม่สำเร็จ" });
  }
});

/**
 * POST /api/payments/:id/confirm
 * ลูกค้ายืนยันว่าโอนแล้ว (mock gateway — ยังไม่มี webhook ธนาคารจริง)
 * → mark paid, อัปเดตออเดอร์เป็น pending_confirm, แจ้งเตือนร้านค้า
 */
router.post("/:id/confirm", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!;

    const rows = await query<Record<string, unknown>>(
      "SELECT * FROM payments WHERE id = $1",
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบรายการชำระเงิน" }); return; }

    const payment = rows[0];
    if (payment.payer_id !== userId && role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (payment.status !== "pending") {
      res.status(409).json({ error: `รายการนี้อยู่ในสถานะ ${payment.status} แล้ว` });
      return;
    }

    const txRef = `MOCK-${Date.now()}`;
    await query(
      "UPDATE payments SET status = 'paid', paid_at = NOW(), transaction_ref = $1, updated_at = NOW() WHERE id = $2",
      [txRef, req.params.id]
    );

    // อัปเดตออเดอร์ตัด: draft → pending_confirm (รอร้านคอนเฟิร์ม, US-212)
    if (payment.order_id) {
      const orderRows = await query<{ status: string; shop_id: string; customer_id: string }>(
        "SELECT status, shop_id, customer_id FROM orders WHERE id = $1",
        [payment.order_id]
      );
      if (orderRows.length && orderRows[0].status === "draft") {
        await query(
          "UPDATE orders SET status = 'pending_confirm', updated_at = NOW() WHERE id = $1",
          [payment.order_id]
        );
        await query(
          `INSERT INTO order_status_logs (order_id, old_status, new_status, changed_by, note)
           VALUES ($1, 'draft', 'pending_confirm', $2, 'ชำระเงินแล้ว — รอร้านยืนยัน')`,
          [payment.order_id, userId]
        );
      }
      if (orderRows.length) {
        const shopOwner = await query<{ user_id: string }>(
          "SELECT user_id FROM shops WHERE id = $1",
          [orderRows[0].shop_id]
        );
        if (shopOwner.length) {
          await notify(
            shopOwner[0].user_id, "order_update",
            "มีออเดอร์ใหม่รอยืนยัน",
            `ลูกค้าชำระเงิน ฿${Number(payment.amount).toLocaleString()} แล้ว กรุณายืนยันออเดอร์`,
            { orderId: payment.order_id, paymentId: payment.id }
          );
        }
      }
    }

    // ตะกร้าสินค้าพร้อมขาย — payment ผูกกับ product_order เดียว (ร้านเดียว): อัปเดตเฉพาะร้านนั้น
    if (payment.product_order_id) {
      const poRows = await query<{ id: string; status: string; shop_id: string }>(
        "SELECT id, status, shop_id FROM product_orders WHERE id = $1",
        [payment.product_order_id]
      );
      if (poRows.length && poRows[0].status === "draft") {
        await query(
          "UPDATE product_orders SET status = 'pending_confirm', updated_at = NOW() WHERE id = $1",
          [poRows[0].id]
        );
        await query(
          `INSERT INTO product_order_status_logs (product_order_id, old_status, new_status, changed_by, note)
           VALUES ($1, 'draft', 'pending_confirm', $2, 'ชำระเงินแล้ว — รอร้านยืนยัน')`,
          [poRows[0].id, userId]
        );
      }
      if (poRows.length) {
        const shopOwner = await query<{ user_id: string }>("SELECT user_id FROM shops WHERE id = $1", [poRows[0].shop_id]);
        if (shopOwner.length) {
          await notify(
            shopOwner[0].user_id, "order_update",
            "มีออเดอร์สินค้าใหม่รอยืนยัน",
            `ลูกค้าชำระเงิน ฿${Number(payment.amount).toLocaleString()} แล้ว กรุณายืนยันออเดอร์`,
            { productOrderId: poRows[0].id, paymentId: payment.id }
          );
        }
      }
    } else if (payment.product_order_group_id) {
      // ── legacy: payment เก่าก่อนย้ายมาผูกรายร้าน (product_order_id เป็น null) — คงพฤติกรรมเดิมไว้ ──
      const productOrders = await query<{ id: string; status: string; shop_id: string }>(
        "SELECT id, status, shop_id FROM product_orders WHERE order_group_id = $1",
        [payment.product_order_group_id]
      );
      for (const po of productOrders) {
        if (po.status === "draft") {
          await query(
            "UPDATE product_orders SET status = 'pending_confirm', updated_at = NOW() WHERE id = $1",
            [po.id]
          );
          await query(
            `INSERT INTO product_order_status_logs (product_order_id, old_status, new_status, changed_by, note)
             VALUES ($1, 'draft', 'pending_confirm', $2, 'ชำระเงินแล้ว — รอร้านยืนยัน')`,
            [po.id, userId]
          );
        }
        const shopOwner = await query<{ user_id: string }>("SELECT user_id FROM shops WHERE id = $1", [po.shop_id]);
        if (shopOwner.length) {
          await notify(
            shopOwner[0].user_id, "order_update",
            "มีออเดอร์สินค้าใหม่รอยืนยัน",
            `ลูกค้าชำระเงินแล้ว กรุณายืนยันออเดอร์`,
            { productOrderId: po.id, paymentId: payment.id }
          );
        }
      }
    }

    // ออเดอร์ทอ: สร้างมาเป็น pending_confirm อยู่แล้ว — แจ้งเตือนร้านอย่างเดียว
    if (payment.weaving_order_id) {
      const wo = await query<{ shop_id: string }>(
        "SELECT shop_id FROM weaving_orders WHERE id = $1",
        [payment.weaving_order_id]
      );
      if (wo.length) {
        const shopOwner = await query<{ user_id: string }>(
          "SELECT user_id FROM shops WHERE id = $1",
          [wo[0].shop_id]
        );
        if (shopOwner.length) {
          await notify(
            shopOwner[0].user_id, "order_update",
            "มีออเดอร์ทอผ้าใหม่รอยืนยัน",
            `ลูกค้าชำระเงิน ฿${Number(payment.amount).toLocaleString()} แล้ว กรุณายืนยันออเดอร์ทอผ้า`,
            { weavingOrderId: payment.weaving_order_id, paymentId: payment.id }
          );
        }
      }
    }

    await notify(
      userId as string, "order_update",
      "ชำระเงินสำเร็จ",
      `ยอด ฿${Number(payment.amount).toLocaleString()} — รอร้านยืนยันออเดอร์`,
      { paymentId: payment.id, orderId: payment.order_id, weavingOrderId: payment.weaving_order_id, productOrderGroupId: payment.product_order_group_id }
    );

    res.json({ id: req.params.id, status: "paid", transactionRef: txRef });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ยืนยันการชำระเงินไม่สำเร็จ" });
  }
});

/**
 * GET /api/payments
 * ลูกค้าเห็นรายการของตัวเอง, ร้านเห็น payout ของออเดอร์ร้านตัวเองเท่านั้น
 * (payment ที่ผูกกับ product_order ของร้านอื่นในตะกร้าเดียวกันจะไม่แสดง), admin เห็นทั้งหมด
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;

    let rows: Record<string, unknown>[];
    if (role === "admin") {
      rows = await query("SELECT * FROM payments ORDER BY created_at DESC LIMIT 200");
    } else if (role === "merchant" && shopId) {
      rows = await query(
        `SELECT p.* FROM payments p
         WHERE p.order_id IN (SELECT id FROM orders WHERE shop_id = $1)
            OR p.weaving_order_id IN (SELECT id FROM weaving_orders WHERE shop_id = $1)
            OR p.product_order_id IN (SELECT id FROM product_orders WHERE shop_id = $1)
            OR (p.product_order_id IS NULL AND p.product_order_group_id IN (
                  SELECT order_group_id FROM product_orders WHERE shop_id = $1
                ))
         ORDER BY p.created_at DESC`,
        [shopId]
      );
    } else {
      rows = await query(
        "SELECT * FROM payments WHERE payer_id = $1 ORDER BY created_at DESC",
        [userId]
      );
    }

    res.json(rows.map(mapPayment));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

/** GET /api/payments/:id */
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;
    const rows = await query<Record<string, unknown>>(
      `SELECT p.*, o.shop_id AS order_shop_id, w.shop_id AS weaving_shop_id, po.shop_id AS product_order_shop_id
       FROM payments p
       LEFT JOIN orders o ON o.id = p.order_id
       LEFT JOIN weaving_orders w ON w.id = p.weaving_order_id
       LEFT JOIN product_orders po ON po.id = p.product_order_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบรายการชำระเงิน" }); return; }

    const p = rows[0];
    const isOwner = p.payer_id === userId;
    let isShop = role === "merchant" && shopId && (
      p.order_shop_id === shopId || p.weaving_shop_id === shopId || p.product_order_shop_id === shopId
    );
    if (!isShop && role === "merchant" && shopId && p.product_order_group_id && !p.product_order_id) {
      // legacy group-wide payment (ไม่ได้ผูกร้านใดร้านหนึ่งชัดเจน) — เดิมทีเดียวจ่ายได้ทุกร้านในตะกร้า
      const linked = await query<{ id: string }>(
        "SELECT id FROM product_orders WHERE order_group_id = $1 AND shop_id = $2 LIMIT 1",
        [p.product_order_group_id, shopId]
      );
      isShop = linked.length > 0;
    }
    if (!isOwner && !isShop && role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const resolvedShopId = (p.order_shop_id ?? p.weaving_shop_id ?? p.product_order_shop_id ?? null) as string | null;
    const promptpayId = await resolveShopPromptPay(resolvedShopId);

    res.json({
      ...mapPayment(p),
      promptpayId,
      qrPayload: p.status === "pending" && p.method === "promptpay"
        ? generatePromptPayPayload(promptpayId, Number(p.amount))
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

function mapPayment(row: Record<string, unknown>) {
  return {
    id: row.id,
    orderId: row.order_id ?? null,
    weavingOrderId: row.weaving_order_id ?? null,
    productOrderGroupId: row.product_order_group_id ?? null,
    productOrderId: row.product_order_id ?? null,
    payerId: row.payer_id,
    amount: Number(row.amount),
    platformFee: Number(row.platform_fee),
    shopPayout: Number(row.shop_payout),
    method: row.method,
    status: row.status,
    transactionRef: row.transaction_ref ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at,
  };
}

export default router;
