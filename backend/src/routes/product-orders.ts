import { Router, Request, Response } from "express";
import { query, getClient } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

/** เปลี่ยนสถานะต่อได้ตามลำดับเดียวกับ orders.ts (ใช้ order_status enum ร่วมกัน) */
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
  in_progress: "กำลังเตรียมสินค้า",
  ready: "แพ็คสินค้าเสร็จแล้ว พร้อมจัดส่ง",
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

interface CartItemInput {
  productId: string;
  quantity: number;
}
interface ShippingInput {
  recipientName: string;
  phone: string;
  addressLine1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  note?: string;
  lat?: number;
  lng?: number;
}

/**
 * POST /api/product-orders
 * สร้างออเดอร์จากตะกร้า — validate ราคา/สต็อกจาก DB จริง (ไม่เชื่อราคาจาก client)
 * แยกเป็น product_orders ตามร้าน (คนละ shop = คนละออเดอร์) ภายใต้ product_order_groups เดียว
 * body: { items: [{ productId, quantity }], shipping: {...}, shippingFee? }
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const client = await getClient();
  try {
    const { userId } = req.user!;
    const { items, shipping, shippingFee = 0 } = req.body as {
      items: CartItemInput[];
      shipping: ShippingInput;
      shippingFee?: number;
    };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "ตะกร้าว่างเปล่า" });
      return;
    }
    if (!shipping?.recipientName || !shipping?.phone || !shipping?.addressLine1 ||
        !shipping?.subdistrict || !shipping?.district || !shipping?.province || !shipping?.postalCode) {
      res.status(400).json({ error: "กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน" });
      return;
    }

    await client.query("BEGIN");

    // ดึงข้อมูลสินค้าจริงจาก DB (ราคา/สต็อก/ร้าน) — กันลูกค้าปลอมยอด
    const productIds = items.map((i) => i.productId);
    const productRows = await client.query(
      `SELECT id, shop_id, name, price, stock, images
       FROM products WHERE id = ANY($1::uuid[]) AND is_active = true FOR UPDATE`,
      [productIds]
    );
    const productMap = new Map(productRows.rows.map((r: Record<string, unknown>) => [r.id, r]));

    for (const item of items) {
      const p = productMap.get(item.productId);
      if (!p) throw new Error(`ไม่พบสินค้า ${item.productId}`);
      if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error("จำนวนสินค้าไม่ถูกต้อง");
      if ((p as Record<string, unknown>).stock as number < item.quantity) {
        throw new Error(`"${(p as Record<string, unknown>).name}" เหลือสต็อกไม่พอ (คงเหลือ ${(p as Record<string, unknown>).stock})`);
      }
    }

    // จัดกลุ่มตามร้าน
    const byShop = new Map<string, { item: CartItemInput; product: Record<string, unknown> }[]>();
    for (const item of items) {
      const p = productMap.get(item.productId) as Record<string, unknown>;
      const shopId = p.shop_id as string;
      if (!byShop.has(shopId)) byShop.set(shopId, []);
      byShop.get(shopId)!.push({ item, product: p });
    }

    const subtotal = items.reduce((sum, item) => {
      const p = productMap.get(item.productId) as Record<string, unknown>;
      return sum + Number(p.price) * item.quantity;
    }, 0);
    const total = subtotal + Number(shippingFee);

    const groupRows = await client.query(
      `INSERT INTO product_order_groups
         (customer_id, recipient_name, phone, address_line1, subdistrict, district, province, postal_code, note, subtotal, shipping_fee, total, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id, created_at`,
      [
        userId, shipping.recipientName, shipping.phone, shipping.addressLine1,
        shipping.subdistrict, shipping.district, shipping.province, shipping.postalCode,
        shipping.note ?? null, subtotal, shippingFee, total,
        shipping.lat ?? null, shipping.lng ?? null,
      ]
    );
    const groupId = groupRows.rows[0].id;

    const createdOrders: Record<string, unknown>[] = [];
    for (const [shopId, shopItems] of byShop) {
      const shopSubtotal = shopItems.reduce((sum, { item, product }) => sum + Number(product.price) * item.quantity, 0);
      // ค่าส่งแบ่งตามสัดส่วนยอดร้าน (ปัดเศษที่ร้านสุดท้ายให้ตรงยอดรวม — ทำแบบง่ายด้วยการหารเท่าๆ กันพอสำหรับ MVP)
      const shopShipping = Math.round((shopSubtotal / subtotal) * Number(shippingFee) * 100) / 100;
      const shopTotal = shopSubtotal + shopShipping;

      const orderRows = await client.query(
        `INSERT INTO product_orders (order_group_id, customer_id, shop_id, status, subtotal, shipping_fee, total)
         VALUES ($1,$2,$3,'draft',$4,$5,$6)
         RETURNING id`,
        [groupId, userId, shopId, shopSubtotal, shopShipping, shopTotal]
      );
      const orderId = orderRows.rows[0].id;

      for (const { item, product } of shopItems) {
        const lineSubtotal = Number(product.price) * item.quantity;
        await client.query(
          `INSERT INTO product_order_items (product_order_id, product_id, product_name, product_image, unit_price, quantity, subtotal)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            orderId, product.id, product.name,
            Array.isArray(product.images) ? product.images[0] ?? null : null,
            product.price, item.quantity, lineSubtotal,
          ]
        );
        await client.query("UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2", [item.quantity, product.id]);
      }

      createdOrders.push({ id: orderId, shopId, subtotal: shopSubtotal, shippingFee: shopShipping, total: shopTotal });
    }

    await client.query("COMMIT");

    res.status(201).json({
      id: groupId,
      subtotal,
      shippingFee: Number(shippingFee),
      total,
      orders: createdOrders,
      createdAt: groupRows.rows[0].created_at,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(400).json({ error: err instanceof Error ? err.message : "สร้างออเดอร์ไม่สำเร็จ" });
  } finally {
    client.release();
  }
});

/**
 * GET /api/product-orders/group/:groupId
 * สรุป checkout group + ออเดอร์ย่อยรายร้าน + รายการสินค้า (ใช้หน้า checkout/สรุปออเดอร์)
 */
router.get("/group/:groupId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!;

    const groupRows = await query<Record<string, unknown>>(
      "SELECT * FROM product_order_groups WHERE id = $1",
      [req.params.groupId]
    );
    if (!groupRows.length) { res.status(404).json({ error: "ไม่พบออเดอร์" }); return; }
    const group = groupRows[0];
    if (group.customer_id !== userId && role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }

    const orderRows = await query<Record<string, unknown>>(
      `SELECT po.*, s.name AS shop_name
       FROM product_orders po JOIN shops s ON s.id = po.shop_id
       WHERE po.order_group_id = $1 ORDER BY po.created_at`,
      [req.params.groupId]
    );
    const itemRows = await query<Record<string, unknown>>(
      `SELECT * FROM product_order_items WHERE product_order_id = ANY($1::uuid[])`,
      [orderRows.map((o) => o.id)]
    );

    const payment = await query<Record<string, unknown>>(
      "SELECT id, status, method, paid_at FROM payments WHERE product_order_group_id = $1 ORDER BY created_at DESC LIMIT 1",
      [req.params.groupId]
    );

    res.json({
      ...mapGroup(group),
      orders: orderRows.map((o) => ({
        ...mapOrder(o),
        items: itemRows.filter((it) => it.product_order_id === o.id).map(mapItem),
      })),
      payment: payment.length ? { id: payment[0].id, status: payment[0].status, method: payment[0].method, paidAt: payment[0].paid_at } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order group" });
  }
});

/**
 * GET /api/product-orders
 * ลูกค้าเห็นออเดอร์ของตัวเอง, ร้านเห็นออเดอร์ของร้าน, admin เห็นทั้งหมด
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (role === "admin") {
      // all
    } else if (role === "merchant" && shopId) {
      conditions.push(`po.shop_id = $${idx++}`);
      params.push(shopId);
    } else {
      conditions.push(`po.customer_id = $${idx++}`);
      params.push(userId);
    }
    if (req.query.status) {
      conditions.push(`po.status = $${idx++}`);
      params.push(req.query.status);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const orderRows = await query<Record<string, unknown>>(
      `SELECT po.*, s.name AS shop_name, g.recipient_name, g.address_line1, g.subdistrict, g.district, g.province, g.postal_code
       FROM product_orders po
       JOIN shops s ON s.id = po.shop_id
       JOIN product_order_groups g ON g.id = po.order_group_id
       ${where}
       ORDER BY po.created_at DESC`,
      params
    );
    const itemRows = orderRows.length
      ? await query<Record<string, unknown>>(
          `SELECT * FROM product_order_items WHERE product_order_id = ANY($1::uuid[])`,
          [orderRows.map((o) => o.id)]
        )
      : [];

    res.json(orderRows.map((o) => ({
      ...mapOrder(o),
      shippingAddress: {
        recipientName: o.recipient_name, addressLine1: o.address_line1, subdistrict: o.subdistrict,
        district: o.district, province: o.province, postalCode: o.postal_code,
      },
      items: itemRows.filter((it) => it.product_order_id === o.id).map(mapItem),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product orders" });
  }
});

/** PATCH /api/product-orders/:id/status — ร้าน/แอดมินอัปเดตสถานะจัดส่ง */
router.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, userId, shopId } = req.user!;
    const { status, note } = req.body as { status: string; note?: string };
    if (!status) { res.status(400).json({ error: "status is required" }); return; }

    const current = await query<{ id: string; status: string; shop_id: string; customer_id: string }>(
      "SELECT id, status, shop_id, customer_id FROM product_orders WHERE id = $1",
      [req.params.id]
    );
    if (!current.length) { res.status(404).json({ error: "Order not found" }); return; }
    const order = current[0];

    if (role === "merchant" && order.shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return; }
    if (role === "customer") {
      if (order.customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
      const customerAllowed = status === "cancelled" && ["draft", "pending_confirm"].includes(order.status);
      if (!customerAllowed) { res.status(403).json({ error: "ลูกค้ายกเลิกได้เฉพาะออเดอร์ที่ร้านยังไม่ยืนยัน" }); return; }
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: `เปลี่ยนสถานะจาก ${order.status} เป็น ${status} ไม่ได้` });
      return;
    }

    await query(
      `UPDATE product_orders SET
         status = ($1::text)::order_status,
         confirmed_at = CASE WHEN $1::text = 'confirmed' THEN NOW() ELSE confirmed_at END,
         completed_at = CASE WHEN $1::text = 'delivered' THEN NOW() ELSE completed_at END,
         updated_at = NOW()
       WHERE id = $2`,
      [status, req.params.id]
    );
    await query(
      `INSERT INTO product_order_status_logs (product_order_id, old_status, new_status, changed_by, note)
       VALUES ($1,$2,$3,$4,$5)`,
      [req.params.id, order.status, status, userId, note ?? null]
    );

    if (role === "customer") {
      const shopOwner = await query<{ user_id: string }>("SELECT user_id FROM shops WHERE id = $1", [order.shop_id]);
      if (shopOwner.length) {
        await notify(shopOwner[0].user_id, "ลูกค้ายกเลิกออเดอร์", note ?? `ออเดอร์ ${req.params.id.slice(0, 8)} ถูกยกเลิก`, { productOrderId: req.params.id, status });
      }
    } else {
      await notify(order.customer_id, STATUS_LABELS[status] ?? status, note ?? `ออเดอร์ของคุณอัปเดตเป็น ${STATUS_LABELS[status] ?? status}`, { productOrderId: req.params.id, status });
    }

    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

function mapGroup(row: Record<string, unknown>) {
  return {
    id: row.id,
    customerId: row.customer_id,
    recipientName: row.recipient_name,
    phone: row.phone,
    addressLine1: row.address_line1,
    subdistrict: row.subdistrict,
    district: row.district,
    province: row.province,
    postalCode: row.postal_code,
    note: row.note ?? null,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    createdAt: row.created_at,
  };
}
function mapOrder(row: Record<string, unknown>) {
  return {
    id: row.id,
    orderGroupId: row.order_group_id,
    customerId: row.customer_id,
    shopId: row.shop_id,
    shopName: row.shop_name ?? null,
    status: row.status,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    confirmedAt: row.confirmed_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function mapItem(row: Record<string, unknown>) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image ?? null,
    unitPrice: Number(row.unit_price),
    quantity: Number(row.quantity),
    subtotal: Number(row.subtotal),
  };
}

export default router;
