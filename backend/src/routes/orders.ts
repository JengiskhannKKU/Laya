import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";
import { createThaiDoc, drawDocHeader, drawKeyValueBlock, formatDocNumber, streamPdf } from "../utils/pdf";
import { notifyShopInfo, notifyShopCancelRequest } from "../utils/line";

const MERCHANT_APP_URL = process.env.MERCHANT_APP_URL ?? "http://localhost:3000";

const router = Router();

/** สถานะที่เปลี่ยนต่อได้ (US-212: pending_confirm → confirmed ก่อนเริ่มงาน) */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["pending_confirm", "cancelled"],
  pending_confirm: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["ready"],
  ready: ["shipped"],
  shipped: ["delivered"],
};

const STATUS_LABELS: Record<string, string> = {
  pending_confirm: "รอร้านยืนยัน",
  confirmed: "ร้านยืนยันออเดอร์แล้ว",
  in_progress: "กำลังตัดเย็บ",
  ready: "ตัดเสร็จแล้ว พร้อมจัดส่ง",
  shipped: "จัดส่งแล้ว",
  delivered: "จัดส่งสำเร็จ",
  cancelled: "ออเดอร์ถูกยกเลิก",
};

/** ออเดอร์ที่ยังยกเลิกได้ในหลักการ (ยังไม่ส่งของ/จบงาน/ถูกยกเลิกไปแล้ว) */
const CANCEL_REQUESTABLE_STATUSES = new Set(["pending_confirm", "confirmed", "in_progress", "ready"]);

async function notify(userId: string, title: string, body: string, data: unknown) {
  try {
    await query(
      "INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1, 'order_update', $2, $3, $4)",
      [userId, title, body, JSON.stringify(data)]
    );
  } catch (err) {
    console.error("notify failed:", err);
  }
}

/**
 * GET /api/orders
 * Requires Bearer token. Returns orders for the current user.
 * Merchant (shopId in token) sees orders for their shop.
 * Admin sees all.
 * Query: ?status=draft|pending_confirm|in_progress|...
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const { userId, role, shopId } = req.user!;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (role === "admin") {
      // admin sees all
    } else if (role === "merchant" && shopId) {
      conditions.push(`o.shop_id = $${idx++}`);
      params.push(shopId);
    } else {
      conditions.push(`o.customer_id = $${idx++}`);
      params.push(userId);
    }

    if (status) {
      conditions.push(`o.status = $${idx++}`);
      params.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query<Record<string, unknown>>(
      `SELECT
         o.id, o.customer_id, o.shop_id, o.status,
         o.fabric_source, o.fabric_meters_used,
         o.estimated_price, o.final_price,
         o.special_instructions,
         o.tracking_no, o.courier,
         o.confirmed_at, o.completed_at,
         o.cancel_requested_at, o.cancel_request_note,
         o.created_at, o.updated_at,
         u.display_name  AS customer_name,
         u.email         AS customer_email,
         u.phone         AS customer_phone,
         s.name          AS shop_name,
         sf.name         AS fabric_name,
         sf.color_name   AS fabric_color
       FROM orders o
       JOIN users  u  ON u.id = o.customer_id
       JOIN shops  s  ON s.id = o.shop_id
       LEFT JOIN shop_fabrics sf ON sf.id = o.shop_fabric_id
       ${where}
       ORDER BY o.created_at DESC`,
      params
    );

    res.json(rows.map(mapOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/** GET /api/orders/:id */
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;

    const rows = await query<Record<string, unknown>>(
      `SELECT
         o.id, o.customer_id, o.shop_id, o.status,
         o.fabric_source, o.fabric_meters_used,
         o.estimated_price, o.final_price,
         o.special_instructions,
         o.tracking_no, o.courier,
         o.confirmed_at, o.completed_at,
         o.cancel_requested_at, o.cancel_request_note,
         o.created_at, o.updated_at,
         u.display_name  AS customer_name,
         u.email         AS customer_email,
         u.phone         AS customer_phone,
         s.name          AS shop_name,
         sf.name         AS fabric_name,
         sf.color_name   AS fabric_color,
         sf.price_per_meter,
         m.chest_cm, m.waist_cm, m.hip_cm, m.height_cm, m.shoulder_cm
       FROM orders o
       JOIN users  u  ON u.id = o.customer_id
       JOIN shops  s  ON s.id = o.shop_id
       LEFT JOIN shop_fabrics   sf ON sf.id = o.shop_fabric_id
       LEFT JOIN body_measurements m  ON m.id  = o.measurement_id
       WHERE o.id = $1`,
      [req.params.id]
    );

    if (!rows.length) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const order = rows[0];

    // Access check: customer sees own orders, merchant sees shop orders
    if (role === "customer" && order.customer_id !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (role === "merchant" && order.shop_id !== shopId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Fetch status log
    const logs = await query<Record<string, unknown>>(
      `SELECT old_status, new_status, note, created_at
       FROM order_status_logs WHERE order_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json({ ...mapOrder(order), statusLogs: logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

/** GET /api/orders/:id/slip.pdf — ใบสั่งซื้อ (ออเดอร์ตัดเย็บ) */
router.get("/:id/slip.pdf", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;

    const rows = await query<Record<string, unknown>>(
      `SELECT o.id, o.customer_id, o.shop_id, o.status, o.fabric_source, o.fabric_meters_used,
              o.estimated_price, o.final_price, o.special_instructions, o.created_at,
              u.display_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              s.name AS shop_name, s.address AS shop_address, s.phone AS shop_phone,
              sf.name AS fabric_name, sf.color_name AS fabric_color
       FROM orders o
       JOIN users u ON u.id = o.customer_id
       JOIN shops s ON s.id = o.shop_id
       LEFT JOIN shop_fabrics sf ON sf.id = o.shop_fabric_id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "Order not found" }); return; }
    const o = rows[0];

    if (role === "customer" && o.customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
    if (role === "merchant" && o.shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return; }

    const createdAt = new Date(o.created_at as string);
    const doc = createThaiDoc();
    drawDocHeader(doc, {
      shopName: o.shop_name as string,
      shopAddress: o.shop_address as string | null,
      shopPhone: o.shop_phone as string | null,
      docTitle: "ใบสั่งซื้อ",
      docNumber: formatDocNumber("ORD", o.id as string, createdAt),
      docDate: createdAt,
    });

    const y = drawKeyValueBlock(doc, doc.page.margins.left, doc.y, "ลูกค้า", [
      (o.customer_name as string) ?? "-",
      (o.customer_email as string) ?? "",
      (o.customer_phone as string) ?? "",
    ]);
    doc.y = y + 16;

    doc.font("Sarabun-Bold").fontSize(11).fillColor("#1B2A4A").text("รายละเอียดงานตัดเย็บ", doc.page.margins.left, doc.y);
    doc.moveDown(0.5);
    doc.font("Sarabun").fontSize(10).fillColor("#374151");
    doc.text(`ผ้า: ${(o.fabric_name as string) ?? (o.fabric_source === "own" ? "ลูกค้านำผ้ามาเอง" : "-")}${o.fabric_color ? ` (สี${o.fabric_color})` : ""}`);
    if (o.fabric_meters_used) doc.text(`จำนวนผ้าที่ใช้: ${Number(o.fabric_meters_used)} เมตร`);
    if (o.special_instructions) doc.text(`หมายเหตุ: ${o.special_instructions}`);
    doc.moveDown(1);

    const price = Number(o.final_price ?? o.estimated_price ?? 0);
    doc.font("Sarabun-Bold").fontSize(12).fillColor("#1B2A4A")
      .text(`ยอดรวม: ฿${price.toLocaleString()}`, doc.page.margins.left, doc.y, { align: "right", width: doc.page.width - doc.page.margins.left - doc.page.margins.right });

    streamPdf(res, doc, `order-slip-${(o.id as string).slice(0, 8)}.pdf`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สร้างเอกสารไม่สำเร็จ" });
  }
});

/**
 * POST /api/orders
 * Customer creates a new order (status = draft initially).
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const {
      shopId,
      shopFabricId,
      fabricUploadId,
      fabricMetersUsed,
      measurementId,
      fabricSource = "shop", // enum fabric_source: 'own' | 'shop'
      specialInstructions,
      estimatedPrice,
    } = req.body as {
      shopId: string;
      shopFabricId?: string;
      fabricUploadId?: string;
      fabricMetersUsed?: number;
      measurementId?: string;
      fabricSource?: string;
      specialInstructions?: string;
      estimatedPrice?: number;
    };

    if (!shopId) {
      res.status(400).json({ error: "shopId is required" });
      return;
    }
    // chk_fabric_source: fabric_source='own' ต้องมี fabric_upload_id, ='shop' ต้องมี shop_fabric_id
    if (fabricSource === "own" && !fabricUploadId) {
      res.status(400).json({ error: "fabricUploadId is required when fabricSource is 'own'" });
      return;
    }
    if (fabricSource === "shop" && !shopFabricId) {
      res.status(400).json({ error: "shopFabricId is required when fabricSource is 'shop'" });
      return;
    }

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO orders
         (customer_id, shop_id, shop_fabric_id, fabric_upload_id, fabric_meters_used,
          measurement_id, fabric_source, special_instructions, estimated_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft')
       RETURNING id, customer_id, shop_id, status, estimated_price, created_at`,
      [
        userId, shopId,
        shopFabricId ?? null,
        fabricUploadId ?? null,
        fabricMetersUsed ?? null,
        measurementId ?? null,
        fabricSource,
        specialInstructions ?? null,
        estimatedPrice ?? null,
      ]
    );

    res.status(201).json(mapOrder(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

/**
 * ยืนยันออเดอร์ pending_confirm → confirmed — logic ล้วนๆ ไม่ผูกกับ req/res
 * ใช้ร่วมกันทั้ง HTTP route (POST /:id/confirm) และ LINE webhook (postback "ยืนยันออเดอร์")
 */
export async function confirmOrder(
  orderId: string,
  actingUserId: string,
  note: string | null = null
): Promise<{ ok: boolean; error?: string; customerId?: string; alreadyConfirmed?: boolean }> {
  const current = await query<{ id: string; status: string; shop_id: string; customer_id: string }>(
    "SELECT id, status, shop_id, customer_id FROM orders WHERE id = $1",
    [orderId]
  );
  if (!current.length) return { ok: false, error: "ไม่พบออเดอร์" };
  const order = current[0];

  // กดยืนยันซ้ำหลังยืนยันไปแล้ว — ตอบแบบสุภาพว่ายืนยันไปแล้ว ไม่ใช่ error สถานะ
  if (order.status === "confirmed") {
    return { ok: false, alreadyConfirmed: true, error: "ออเดอร์นี้ได้รับการยืนยันไปแล้ว", customerId: order.customer_id };
  }
  if (!(ALLOWED_TRANSITIONS[order.status] ?? []).includes("confirmed")) {
    return { ok: false, error: `เปลี่ยนสถานะจาก ${order.status} เป็น confirmed ไม่ได้` };
  }

  await query(
    `UPDATE orders SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [orderId]
  );
  await query(
    `INSERT INTO order_status_logs (order_id, old_status, new_status, changed_by, note)
     VALUES ($1, $2, 'confirmed', $3, $4)`,
    [orderId, order.status, actingUserId, note]
  );
  await notify(order.customer_id, STATUS_LABELS.confirmed, `ออเดอร์ของคุณอัปเดตเป็น ${STATUS_LABELS.confirmed}`, {
    orderId,
    status: "confirmed",
  });

  return { ok: true, customerId: order.customer_id };
}

/**
 * POST /api/orders/:id/request-cancel
 * ลูกค้าขอยกเลิกออเดอร์ที่จ่ายเงินแล้ว — ต้องรอร้านกดยินยอมผ่าน LINE ก่อนจึงจะยกเลิกจริง
 */
router.post("/:id/request-cancel", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { note } = req.body as { note?: string };

    const current = await query<{ id: string; status: string; shop_id: string; customer_id: string; cancel_requested_at: string | null }>(
      "SELECT id, status, shop_id, customer_id, cancel_requested_at FROM orders WHERE id = $1",
      [req.params.id]
    );
    if (!current.length) { res.status(404).json({ error: "Order not found" }); return; }
    const order = current[0];
    if (order.customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

    if (order.cancel_requested_at) {
      res.status(200).json({ id: order.id, alreadyRequested: true, message: "ท่านได้ส่งคำขอยกเลิกไปแล้ว รอร้านตอบกลับ" });
      return;
    }
    if (order.status === "draft") {
      res.status(400).json({ error: "ออเดอร์นี้ยังไม่ชำระเงิน ยกเลิกได้ทันทีโดยไม่ต้องรอร้านยินยอม" });
      return;
    }
    if (!CANCEL_REQUESTABLE_STATUSES.has(order.status)) {
      res.status(400).json({ error: `ออเดอร์สถานะ ${order.status} ไม่สามารถขอยกเลิกได้` });
      return;
    }

    await query(
      "UPDATE orders SET cancel_requested_at = NOW(), cancel_request_note = $1, updated_at = NOW() WHERE id = $2",
      [note ?? null, order.id]
    );

    const shopOwner = await query<{ user_id: string }>("SELECT user_id FROM shops WHERE id = $1", [order.shop_id]);
    if (shopOwner.length) {
      await notify(shopOwner[0].user_id, "ลูกค้าขอยกเลิกออเดอร์", note ?? `ออเดอร์ ${order.id.slice(0, 8)} ขอยกเลิก — รอการยินยอมจากร้าน`, { orderId: order.id });
    }
    const customerRows = await query<{ display_name: string | null; email: string }>("SELECT display_name, email FROM users WHERE id = $1", [userId]);
    await notifyShopCancelRequest(order.shop_id, {
      domainLabel: "ขอยกเลิกออเดอร์ตัดเย็บ",
      orderId: order.id,
      customerName: customerRows[0]?.display_name || customerRows[0]?.email || "ลูกค้า",
      note: note ?? null,
      approvePostbackData: `action=cancel_approve&domain=orders&id=${order.id}`,
      rejectPostbackData: `action=cancel_reject&domain=orders&id=${order.id}`,
      detailUrl: `${MERCHANT_APP_URL}/merchant/orders`,
    });

    res.json({ id: order.id, cancelRequestedAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ส่งคำขอยกเลิกไม่สำเร็จ" });
  }
});

/**
 * ร้านตอบรับ/ปฏิเสธคำขอยกเลิก — ใช้จาก LINE postback (ไม่ต้องคืนสต็อก เพราะ orders ไม่ตัดสต็อกสินค้า)
 */
export async function respondCancelRequest(
  orderId: string,
  approve: boolean,
  actingUserId: string
): Promise<{ ok: boolean; error?: string; customerId?: string; alreadyResolved?: boolean }> {
  const current = await query<{ id: string; status: string; shop_id: string; customer_id: string; cancel_requested_at: string | null }>(
    "SELECT id, status, shop_id, customer_id, cancel_requested_at FROM orders WHERE id = $1",
    [orderId]
  );
  if (!current.length) return { ok: false, error: "ไม่พบออเดอร์" };
  const order = current[0];

  if (!order.cancel_requested_at) {
    return { ok: false, alreadyResolved: true, error: "คำขอนี้ถูกดำเนินการไปแล้ว", customerId: order.customer_id };
  }

  if (approve) {
    await query(
      "UPDATE orders SET status = 'cancelled', cancel_requested_at = NULL, cancel_request_note = NULL, updated_at = NOW() WHERE id = $1",
      [orderId]
    );
    await query(
      `INSERT INTO order_status_logs (order_id, old_status, new_status, changed_by, note)
       VALUES ($1, $2, 'cancelled', $3, 'ร้านยินยอมยกเลิกออเดอร์')`,
      [orderId, order.status, actingUserId]
    );
  } else {
    await query(
      "UPDATE orders SET cancel_requested_at = NULL, cancel_request_note = NULL, updated_at = NOW() WHERE id = $1",
      [orderId]
    );
  }

  await notify(
    order.customer_id,
    approve ? "ร้านยินยอมยกเลิกออเดอร์แล้ว" : "ร้านไม่ยินยอมยกเลิกออเดอร์",
    approve ? "ออเดอร์ของคุณถูกยกเลิกแล้ว" : "คำขอยกเลิกถูกปฏิเสธ ออเดอร์จะดำเนินการต่อตามปกติ",
    { orderId, status: approve ? "cancelled" : order.status }
  );

  return { ok: true, customerId: order.customer_id };
}

/**
 * POST /api/orders/:id/confirm
 * ร้านยืนยันรับออเดอร์ (US-212: pending_confirm → confirmed)
 */
router.post("/:id/confirm", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, shopId, userId } = req.user!;
    const current = await query<{ shop_id: string }>("SELECT shop_id FROM orders WHERE id = $1", [req.params.id]);
    if (!current.length) { res.status(404).json({ error: "Order not found" }); return; }
    if (role === "customer") { res.status(403).json({ error: "Forbidden" }); return; }
    if (role === "merchant" && current[0].shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return; }

    const result = await confirmOrder(req.params.id, userId);
    if (!result.ok) { res.status(400).json({ error: result.error }); return; }
    res.json({ id: req.params.id, status: "confirmed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to confirm order" });
  }
});

/**
 * PATCH /api/orders/:id/status
 * เปลี่ยนสถานะตามลำดับที่กำหนด + log + แจ้งเตือน (US-212, US-601, US-602)
 * ร้าน/แอดมินเปลี่ยนได้ทุกขั้น, ลูกค้ายกเลิกได้เฉพาะก่อนร้านยืนยัน (US-603)
 */
router.patch("/:id/status", requireAuth, changeStatus);

async function changeStatus(req: Request, res: Response) {
  try {
    const { role, userId, shopId } = req.user!;
    const { status, note, finalPrice, trackingNo, courier } = req.body as {
      status: string; note?: string; finalPrice?: number; trackingNo?: string; courier?: string;
    };

    if (!status) {
      res.status(400).json({ error: "status is required" });
      return;
    }

    // Fetch current order
    const current = await query<{ id: string; status: string; shop_id: string; customer_id: string }>(
      "SELECT id, status, shop_id, customer_id FROM orders WHERE id = $1",
      [req.params.id]
    );
    if (!current.length) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const order = current[0];

    if (role === "merchant" && order.shop_id !== shopId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (role === "customer") {
      if (order.customer_id !== userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      // pending_confirm ของ orders (งานตัดเย็บ) หมายถึง "จ่ายเงินแล้ว" เสมอ (draft → pending_confirm เกิดตอน payment confirm เท่านั้น)
      // ลูกค้ายกเลิกเองทันทีได้เฉพาะตอนยังไม่จ่าย — ออเดอร์ที่จ่ายแล้วต้องขอผ่าน /request-cancel ให้ร้านยินยอม
      const customerAllowed =
        (status === "cancelled" && order.status === "draft") ||
        (status === "pending_confirm" && order.status === "draft");
      if (!customerAllowed) {
        res.status(403).json({ error: "ลูกค้ายกเลิกได้เฉพาะออเดอร์ที่ยังไม่ชำระเงิน — ออเดอร์ที่จ่ายแล้วต้องขอให้ร้านยินยอมยกเลิก" });
        return;
      }
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: `เปลี่ยนสถานะจาก ${order.status} เป็น ${status} ไม่ได้` });
      return;
    }

    await query(
      `UPDATE orders SET
         status = ($1::text)::order_status,
         confirmed_at = CASE WHEN $1::text = 'confirmed' THEN NOW() ELSE confirmed_at END,
         completed_at = CASE WHEN $1::text = 'delivered' THEN NOW() ELSE completed_at END,
         final_price = COALESCE($2, final_price),
         tracking_no = COALESCE($4, tracking_no),
         courier = COALESCE($5, courier),
         updated_at = NOW()
       WHERE id = $3`,
      [status, finalPrice ?? null, req.params.id, trackingNo ?? null, courier ?? null]
    );

    await query(
      `INSERT INTO order_status_logs (order_id, old_status, new_status, changed_by, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.id, order.status, status, userId, note ?? null]
    );

    // แจ้งเตือนอีกฝั่ง: ร้านเปลี่ยน → แจ้งลูกค้า, ลูกค้าเปลี่ยน → แจ้งร้าน
    if (role === "customer") {
      const shopOwner = await query<{ user_id: string }>("SELECT user_id FROM shops WHERE id = $1", [order.shop_id]);
      if (shopOwner.length) {
        const title = status === "cancelled" ? "ลูกค้ายกเลิกออเดอร์" : "ออเดอร์ใหม่รอยืนยัน";
        await notify(
          shopOwner[0].user_id,
          title,
          note ?? `ออเดอร์ ${req.params.id.slice(0, 8)} — ${STATUS_LABELS[status] ?? status}`,
          { orderId: req.params.id, status }
        );
        await notifyShopInfo(order.shop_id, {
          title,
          body: note ?? `ออเดอร์ ${req.params.id.slice(0, 8)} — ${STATUS_LABELS[status] ?? status}`,
          detailUrl: `${MERCHANT_APP_URL}/merchant/orders`,
        });
      }
    } else {
      await notify(
        order.customer_id,
        STATUS_LABELS[status] ?? `สถานะออเดอร์: ${status}`,
        note ?? `ออเดอร์ของคุณอัปเดตเป็น ${STATUS_LABELS[status] ?? status}`,
        { orderId: req.params.id, status }
      );
    }

    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
}

function mapOrder(row: Record<string, unknown>) {
  const status = row.status as string;
  // pending_confirm ขึ้นไปหมายถึงจ่ายเงินแล้วเสมอ (draft → pending_confirm เกิดตอน payment confirm เท่านั้น)
  const isPaid = status !== "draft";
  const cancelRequestedAt = row.cancel_requested_at ?? null;
  return {
    id: row.id,
    customerId: row.customer_id,
    shopId: row.shop_id,
    status: row.status,
    isPaid,
    cancellable: status === "draft",
    cancelRequestable: isPaid && !cancelRequestedAt && CANCEL_REQUESTABLE_STATUSES.has(status),
    cancelRequestedAt,
    cancelRequestNote: row.cancel_request_note ?? null,
    fabricSource: row.fabric_source,
    fabricMetersUsed: row.fabric_meters_used ? Number(row.fabric_meters_used) : null,
    estimatedPrice: row.estimated_price ? Number(row.estimated_price) : null,
    finalPrice: row.final_price ? Number(row.final_price) : null,
    specialInstructions: row.special_instructions ?? null,
    trackingNo: row.tracking_no ?? null,
    courier: row.courier ?? null,
    confirmedAt: row.confirmed_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Joined fields
    customerName: row.customer_name ?? null,
    customerEmail: row.customer_email ?? null,
    customerPhone: row.customer_phone ?? null,
    shopName: row.shop_name ?? null,
    fabricName: row.fabric_name ?? null,
    fabricColor: row.fabric_color ?? null,
    measurements: row.chest_cm ? {
      chestCm: Number(row.chest_cm),
      waistCm: Number(row.waist_cm),
      hipCm: Number(row.hip_cm),
      heightCm: Number(row.height_cm),
      shoulderCm: Number(row.shoulder_cm),
    } : null,
  };
}

export default router;
