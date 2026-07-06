import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

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
         o.confirmed_at, o.completed_at,
         o.created_at, o.updated_at,
         u.display_name  AS customer_name,
         u.email         AS customer_email,
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
         o.confirmed_at, o.completed_at,
         o.created_at, o.updated_at,
         u.display_name  AS customer_name,
         u.email         AS customer_email,
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
      fabricMetersUsed,
      measurementId,
      fabricSource = "shop", // enum fabric_source: 'own' | 'shop'
      specialInstructions,
      estimatedPrice,
    } = req.body as {
      shopId: string;
      shopFabricId?: string;
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

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO orders
         (customer_id, shop_id, shop_fabric_id, fabric_meters_used,
          measurement_id, fabric_source, special_instructions, estimated_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
       RETURNING id, customer_id, shop_id, status, estimated_price, created_at`,
      [
        userId, shopId,
        shopFabricId ?? null,
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
 * POST /api/orders/:id/confirm
 * ร้านยืนยันรับออเดอร์ (US-212: pending_confirm → confirmed)
 */
router.post("/:id/confirm", requireAuth, async (req: Request, res: Response) => {
  req.body = { ...req.body, status: "confirmed" };
  await changeStatus(req, res);
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
    const { status, note, finalPrice } = req.body as { status: string; note?: string; finalPrice?: number };

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
      const customerAllowed =
        (status === "cancelled" && ["draft", "pending_confirm"].includes(order.status)) ||
        (status === "pending_confirm" && order.status === "draft");
      if (!customerAllowed) {
        res.status(403).json({ error: "ลูกค้ายกเลิกได้เฉพาะออเดอร์ที่ร้านยังไม่ยืนยัน" });
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
         updated_at = NOW()
       WHERE id = $3`,
      [status, finalPrice ?? null, req.params.id]
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
        await notify(
          shopOwner[0].user_id,
          status === "cancelled" ? "ลูกค้ายกเลิกออเดอร์" : "ออเดอร์ใหม่รอยืนยัน",
          note ?? `ออเดอร์ ${req.params.id.slice(0, 8)} — ${STATUS_LABELS[status] ?? status}`,
          { orderId: req.params.id, status }
        );
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
  return {
    id: row.id,
    customerId: row.customer_id,
    shopId: row.shop_id,
    status: row.status,
    fabricSource: row.fabric_source,
    fabricMetersUsed: row.fabric_meters_used ? Number(row.fabric_meters_used) : null,
    estimatedPrice: row.estimated_price ? Number(row.estimated_price) : null,
    finalPrice: row.final_price ? Number(row.final_price) : null,
    specialInstructions: row.special_instructions ?? null,
    confirmedAt: row.confirmed_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Joined fields
    customerName: row.customer_name ?? null,
    customerEmail: row.customer_email ?? null,
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
