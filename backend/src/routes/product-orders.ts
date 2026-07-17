import { Router, Request, Response } from "express";
import { query, getClient } from "../db";
import { requireAuth } from "../middleware/auth";
import { createThaiDoc, drawDocHeader, drawKeyValueBlock, drawTable, formatDocNumber, streamPdf } from "../utils/pdf";
import { notifyShopInfo } from "../utils/line";

const router = Router();
const MERCHANT_APP_URL = process.env.MERCHANT_APP_URL ?? "http://localhost:3000";

/** ดึงข้อมูลออเดอร์ + ร้าน + ที่อยู่จัดส่ง + รายการสินค้า สำหรับใช้สร้างเอกสาร PDF (ตรวจสิทธิ์ก่อนเรียก) */
async function loadOrderForDocument(orderId: string) {
  const rows = await query<Record<string, unknown>>(
    `SELECT po.*, s.name AS shop_name, s.address AS shop_address, s.phone AS shop_phone,
            g.recipient_name, g.phone AS ship_phone, g.address_line1, g.subdistrict, g.district, g.province, g.postal_code
     FROM product_orders po
     JOIN shops s ON s.id = po.shop_id
     JOIN product_order_groups g ON g.id = po.order_group_id
     WHERE po.id = $1`,
    [orderId]
  );
  if (!rows.length) return null;
  const order = rows[0];
  const items = await query<Record<string, unknown>>(
    "SELECT * FROM product_order_items WHERE product_order_id = $1",
    [orderId]
  );
  return { order, items };
}

function checkOrderAccess(order: Record<string, unknown>, req: Request, res: Response): boolean {
  const { userId, role, shopId } = req.user!;
  if (role === "customer" && order.customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return false; }
  if (role === "merchant" && order.shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return false; }
  return true;
}

function shipToLines(order: Record<string, unknown>): string[] {
  return [
    (order.recipient_name as string) ?? "",
    (order.ship_phone as string) ?? "",
    [order.address_line1, order.subdistrict, order.district, order.province, order.postal_code].filter(Boolean).join(" "),
  ];
}

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
  /** SKU ที่ลูกค้าเลือก — บังคับเมื่อสินค้าเปิดใช้หลายตัวเลือก (has_variants) */
  variantId?: string;
  quantity: number;
}

/** ป้ายกำกับ SKU สำหรับแสดงในออเดอร์/เอกสาร เช่น "สีแดง · M" */
function variantLabel(v: Record<string, unknown>): string {
  return [v.color, v.size, v.pattern, v.length, v.material]
    .filter(Boolean)
    .join(" · ") || (v.sku as string) || "";
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
      `SELECT id, shop_id, name, price, stock, images, low_stock_threshold, has_variants
       FROM products WHERE id = ANY($1::uuid[]) AND is_active = true FOR UPDATE`,
      [productIds]
    );
    const productMap = new Map(productRows.rows.map((r: Record<string, unknown>) => [r.id, r]));

    // ล็อกแถว SKU ที่ลูกค้าเลือก (ราคา/สต็อกอ่านจาก variant ไม่ใช่สินค้าหลัก)
    const variantIds = items.map((i) => i.variantId).filter(Boolean) as string[];
    const variantMap = new Map<string, Record<string, unknown>>();
    if (variantIds.length) {
      const variantRows = await client.query(
        "SELECT id, product_id, sku, color, size, pattern, length, material, price, stock FROM product_variants WHERE id = ANY($1::uuid[]) FOR UPDATE",
        [variantIds]
      );
      for (const v of variantRows.rows as Record<string, unknown>[]) variantMap.set(v.id as string, v);
    }

    for (const item of items) {
      const p = productMap.get(item.productId) as Record<string, unknown> | undefined;
      if (!p) throw new Error(`ไม่พบสินค้า ${item.productId}`);
      if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error("จำนวนสินค้าไม่ถูกต้อง");

      if (p.has_variants) {
        if (!item.variantId) throw new Error(`"${p.name}" ต้องเลือกตัวเลือกสินค้า (สี/ไซซ์) ก่อนสั่งซื้อ`);
        const v = variantMap.get(item.variantId);
        if (!v || v.product_id !== item.productId) throw new Error(`ไม่พบตัวเลือกสินค้าของ "${p.name}"`);
        if ((v.stock as number) < item.quantity) {
          throw new Error(`"${p.name} (${variantLabel(v)})" เหลือสต็อกไม่พอ (คงเหลือ ${v.stock})`);
        }
      } else {
        if (item.variantId) throw new Error(`"${p.name}" ไม่มีตัวเลือกสินค้าให้เลือก`);
        if ((p.stock as number) < item.quantity) {
          throw new Error(`"${p.name}" เหลือสต็อกไม่พอ (คงเหลือ ${p.stock})`);
        }
      }
    }

    /** ราคาต่อหน่วยจริงของแต่ละแถวในตะกร้า — จาก SKU ถ้ามี ไม่งั้นจากสินค้าหลัก */
    const unitPriceOf = (item: CartItemInput): number => {
      if (item.variantId) return Number(variantMap.get(item.variantId)!.price);
      return Number((productMap.get(item.productId) as Record<string, unknown>).price);
    };

    // จัดกลุ่มตามร้าน
    const byShop = new Map<string, { item: CartItemInput; product: Record<string, unknown> }[]>();
    for (const item of items) {
      const p = productMap.get(item.productId) as Record<string, unknown>;
      const shopId = p.shop_id as string;
      if (!byShop.has(shopId)) byShop.set(shopId, []);
      byShop.get(shopId)!.push({ item, product: p });
    }

    const subtotal = items.reduce((sum, item) => sum + unitPriceOf(item) * item.quantity, 0);
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

    const lowStockAlerts: { shopId: string; productId: string; name: string; newStock: number; threshold: number }[] = [];
    const createdOrders: Record<string, unknown>[] = [];
    for (const [shopId, shopItems] of byShop) {
      const shopSubtotal = shopItems.reduce((sum, { item }) => sum + unitPriceOf(item) * item.quantity, 0);
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
        const unitPrice = unitPriceOf(item);
        const lineSubtotal = unitPrice * item.quantity;
        const variant = item.variantId ? variantMap.get(item.variantId)! : null;

        await client.query(
          `INSERT INTO product_order_items (product_order_id, product_id, product_name, product_image, unit_price, quantity, subtotal, variant_id, variant_label)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            orderId, product.id, product.name,
            Array.isArray(product.images) ? product.images[0] ?? null : null,
            unitPrice, item.quantity, lineSubtotal,
            variant ? variant.id : null,
            variant ? variantLabel(variant) : null,
          ]
        );

        // ตัดสต็อกตาม SKU ถ้าลูกค้าเลือก variant — ไม่งั้นตัดจากสินค้าหลักเหมือนเดิม
        const threshold = (product.low_stock_threshold as number) ?? 5;
        if (variant) {
          await client.query("UPDATE product_variants SET stock = stock - $1, updated_at = NOW() WHERE id = $2", [item.quantity, variant.id]);
          const prevStock = variant.stock as number;
          const newStock = prevStock - item.quantity;
          variant.stock = newStock; // กันกรณีลูกค้าสั่ง SKU เดิมซ้ำหลายแถว
          if (newStock <= threshold && prevStock > threshold) {
            lowStockAlerts.push({ shopId, productId: product.id as string, name: `${product.name} (${variantLabel(variant)})`, newStock, threshold });
          }
        } else {
          await client.query("UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2", [item.quantity, product.id]);
          const prevStock = product.stock as number;
          const newStock = prevStock - item.quantity;
          product.stock = newStock;
          if (newStock <= threshold && prevStock > threshold) {
            lowStockAlerts.push({ shopId, productId: product.id as string, name: product.name as string, newStock, threshold });
          }
        }
      }

      createdOrders.push({ id: orderId, shopId, subtotal: shopSubtotal, shippingFee: shopShipping, total: shopTotal });
    }

    await client.query("COMMIT");

    for (const alert of lowStockAlerts) {
      const shopOwner = await query<{ user_id: string }>("SELECT user_id FROM shops WHERE id = $1", [alert.shopId]);
      if (shopOwner.length) {
        try {
          await query(
            "INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1, 'system', $2, $3, $4)",
            [
              shopOwner[0].user_id,
              "สินค้าใกล้หมด",
              `"${alert.name}" เหลือ ${alert.newStock} ชิ้น (เกณฑ์แจ้งเตือน ${alert.threshold} ชิ้น)`,
              JSON.stringify({ productId: alert.productId, stock: alert.newStock }),
            ]
          );
        } catch (notifyErr) {
          console.error("low-stock notify failed:", notifyErr);
        }
      }
    }

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
 * GET /api/product-orders/:id
 * รายละเอียดออเดอร์รายร้านเดียว (ใช้หน้ารายละเอียดออเดอร์ของลูกค้า/ร้าน)
 */
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;

    const rows = await query<Record<string, unknown>>(
      `SELECT po.*, s.name AS shop_name, g.recipient_name, g.phone, g.address_line1, g.subdistrict, g.district, g.province, g.postal_code, g.note
       FROM product_orders po
       JOIN shops s ON s.id = po.shop_id
       JOIN product_order_groups g ON g.id = po.order_group_id
       WHERE po.id = $1`,
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบออเดอร์" }); return; }
    const order = rows[0];

    if (role === "customer" && order.customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
    if (role === "merchant" && order.shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return; }

    const itemRows = await query<Record<string, unknown>>(
      "SELECT * FROM product_order_items WHERE product_order_id = $1",
      [req.params.id]
    );
    const logs = await query<Record<string, unknown>>(
      `SELECT old_status, new_status, note, created_at
       FROM product_order_status_logs WHERE product_order_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    const shippingLogs = await query<Record<string, unknown>>(
      `SELECT old_status, new_status, note, created_at
       FROM product_order_shipping_logs WHERE product_order_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json({
      ...mapOrder(order),
      shippingLogs,
      shippingAddress: {
        recipientName: order.recipient_name, phone: order.phone, addressLine1: order.address_line1,
        subdistrict: order.subdistrict, district: order.district, province: order.province,
        postalCode: order.postal_code, note: order.note ?? null,
      },
      items: itemRows.map(mapItem),
      statusLogs: logs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product order" });
  }
});

/** GET /api/product-orders/:id/slip.pdf — ใบสั่งซื้อ (มีรายการสินค้า+ราคา) */
router.get("/:id/slip.pdf", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await loadOrderForDocument(req.params.id);
    if (!data) { res.status(404).json({ error: "ไม่พบออเดอร์" }); return; }
    const { order, items } = data;
    if (!checkOrderAccess(order, req, res)) return;

    const createdAt = new Date(order.created_at as string);
    const doc = createThaiDoc();
    drawDocHeader(doc, {
      shopName: order.shop_name as string,
      shopAddress: order.shop_address as string | null,
      shopPhone: order.shop_phone as string | null,
      docTitle: "ใบสั่งซื้อ",
      docNumber: formatDocNumber("ORD", order.id as string, createdAt),
      docDate: createdAt,
    });

    const y = drawKeyValueBlock(doc, doc.page.margins.left, doc.y, "จัดส่งถึง", shipToLines(order));
    doc.y = y + 16;

    const tableY = drawTable(
      doc, doc.page.margins.left, doc.y,
      [
        { header: "สินค้า", width: 240 },
        { header: "ราคา/หน่วย", width: 80, align: "right" },
        { header: "จำนวน", width: 60, align: "right" },
        { header: "รวม", width: 80, align: "right" },
      ],
      items.map((it) => [
        docItemName(it),
        `฿${Number(it.unit_price).toLocaleString()}`,
        String(it.quantity),
        `฿${Number(it.subtotal).toLocaleString()}`,
      ])
    );
    doc.y = tableY;

    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.font("Sarabun").fontSize(10).fillColor("#374151")
      .text(`ค่าจัดส่ง: ฿${Number(order.shipping_fee).toLocaleString()}`, doc.page.margins.left, doc.y, { align: "right", width });
    doc.font("Sarabun-Bold").fontSize(12).fillColor("#1B2A4A")
      .text(`ยอดรวม: ฿${Number(order.total).toLocaleString()}`, doc.page.margins.left, doc.y, { align: "right", width });

    streamPdf(res, doc, `order-slip-${(order.id as string).slice(0, 8)}.pdf`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สร้างเอกสารไม่สำเร็จ" });
  }
});

/** GET /api/product-orders/:id/packing-slip.pdf — ใบแพ็คสินค้า (ไม่มีราคา ใช้สำหรับแพ็ค/ตรวจของ) */
router.get("/:id/packing-slip.pdf", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await loadOrderForDocument(req.params.id);
    if (!data) { res.status(404).json({ error: "ไม่พบออเดอร์" }); return; }
    const { order, items } = data;
    if (!checkOrderAccess(order, req, res)) return;

    const createdAt = new Date(order.created_at as string);
    const doc = createThaiDoc();
    drawDocHeader(doc, {
      shopName: order.shop_name as string,
      shopAddress: order.shop_address as string | null,
      shopPhone: order.shop_phone as string | null,
      docTitle: "ใบแพ็คสินค้า",
      docNumber: formatDocNumber("PAK", order.id as string, createdAt),
      docDate: createdAt,
    });

    const y = drawKeyValueBlock(doc, doc.page.margins.left, doc.y, "จัดส่งถึง", shipToLines(order));
    doc.y = y + 16;

    drawTable(
      doc, doc.page.margins.left, doc.y,
      [
        { header: "สินค้า", width: 340 },
        { header: "จำนวน", width: 120, align: "right" },
      ],
      items.map((it) => [docItemName(it), String(it.quantity)])
    );

    streamPdf(res, doc, `packing-slip-${(order.id as string).slice(0, 8)}.pdf`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สร้างเอกสารไม่สำเร็จ" });
  }
});

/** GET /api/product-orders/:id/shipping-label.pdf — ใบปะหน้าพัสดุ (ขนาดกะทัดรัด) */
router.get("/:id/shipping-label.pdf", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await loadOrderForDocument(req.params.id);
    if (!data) { res.status(404).json({ error: "ไม่พบออเดอร์" }); return; }
    const { order } = data;
    if (!checkOrderAccess(order, req, res)) return;

    const doc = createThaiDoc({ size: [297, 420], margin: 24 }); // ~A6-ish label
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.font("Sarabun").fontSize(9).fillColor("#6B7280").text("จาก", doc.page.margins.left, doc.y);
    doc.font("Sarabun-Bold").fontSize(12).fillColor("#1B2A4A").text((order.shop_name as string) ?? "-", { width });
    doc.font("Sarabun").fontSize(9).fillColor("#374151");
    if (order.shop_address) doc.text(order.shop_address as string, { width });
    if (order.shop_phone) doc.text(`โทร ${order.shop_phone}`, { width });
    doc.moveDown(1);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor("#E5DFD6").stroke();
    doc.moveDown(1);

    doc.font("Sarabun").fontSize(9).fillColor("#6B7280").text("ถึง", doc.page.margins.left, doc.y);
    doc.font("Sarabun-Bold").fontSize(16).fillColor("#1B2A4A").text((order.recipient_name as string) ?? "-", { width });
    doc.font("Sarabun").fontSize(12).fillColor("#374151").text((order.ship_phone as string) ?? "", { width });
    doc.fontSize(11).text([order.address_line1, order.subdistrict, order.district, order.province, order.postal_code].filter(Boolean).join(" "), { width });
    doc.moveDown(1.5);

    doc.font("Sarabun-Bold").fontSize(11).fillColor("#1B2A4A").text(`ขนส่ง: ${(order.courier as string) ?? "-"}`, { width });
    doc.fontSize(14).text(`เลขพัสดุ: ${(order.tracking_no as string) ?? "-"}`, { width });
    doc.font("Sarabun").fontSize(9).fillColor("#9CA3AF").text(`ออเดอร์ #${(order.id as string).slice(0, 8).toUpperCase()}`, { width });

    streamPdf(res, doc, `shipping-label-${(order.id as string).slice(0, 8)}.pdf`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สร้างเอกสารไม่สำเร็จ" });
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
/**
 * ยืนยันออเดอร์ pending_confirm → confirmed — logic ล้วนๆ ไม่ผูกกับ req/res
 * ใช้จาก LINE webhook (postback "ยืนยันออเดอร์") — PATCH /:id/status ด้านล่างยังใช้เส้นทางเดิมสำหรับ HTTP ปกติ
 */
export async function confirmOrder(
  orderId: string,
  actingUserId: string,
  note: string | null = null
): Promise<{ ok: boolean; error?: string; customerId?: string }> {
  const current = await query<{ id: string; status: string; shop_id: string; customer_id: string }>(
    "SELECT id, status, shop_id, customer_id FROM product_orders WHERE id = $1",
    [orderId]
  );
  if (!current.length) return { ok: false, error: "ไม่พบออเดอร์" };
  const order = current[0];

  if (!(ALLOWED_TRANSITIONS[order.status] ?? []).includes("confirmed")) {
    return { ok: false, error: `เปลี่ยนสถานะจาก ${order.status} เป็น confirmed ไม่ได้` };
  }

  await query(
    `UPDATE product_orders SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [orderId]
  );
  await query(
    `INSERT INTO product_order_status_logs (product_order_id, old_status, new_status, changed_by, note)
     VALUES ($1, $2, 'confirmed', $3, $4)`,
    [orderId, order.status, actingUserId, note]
  );
  await notify(order.customer_id, STATUS_LABELS.confirmed, `ออเดอร์ของคุณอัปเดตเป็น ${STATUS_LABELS.confirmed}`, {
    productOrderId: orderId,
    status: "confirmed",
  });

  return { ok: true, customerId: order.customer_id };
}

router.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, userId, shopId } = req.user!;
    const { status, note, trackingNo, courier } = req.body as { status: string; note?: string; trackingNo?: string; courier?: string };
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
         shipping_status = CASE
           WHEN $1::text = 'shipped' AND shipping_status IS NULL THEN 'pending'::shipment_status
           WHEN $1::text = 'delivered' THEN 'delivered'::shipment_status
           ELSE shipping_status END,
         tracking_no = COALESCE($3, tracking_no),
         courier = COALESCE($4, courier),
         updated_at = NOW()
       WHERE id = $2`,
      [status, req.params.id, trackingNo ?? null, courier ?? null]
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
        await notifyShopInfo(order.shop_id, {
          title: "ลูกค้ายกเลิกออเดอร์",
          body: note ?? `ออเดอร์ ${req.params.id.slice(0, 8)} ถูกยกเลิก`,
          detailUrl: `${MERCHANT_APP_URL}/merchant/orders`,
        });
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

// ── สถานะการขนส่งแบบละเอียด (แยกจากสถานะออเดอร์) ─────────────────────────────
const SHIPPING_TRANSITIONS: Record<string, string[]> = {
  pending: ["picked_up", "failed"],
  picked_up: ["in_transit", "failed", "returned"],
  in_transit: ["delivered", "failed", "returned"],
  failed: ["picked_up", "in_transit", "returned"], // ส่งไม่สำเร็จ → ลองส่งใหม่ หรือ ตีกลับ
  delivered: [],
  returned: [],
};

const SHIPPING_LABELS: Record<string, string> = {
  pending: "รอขนส่งเข้ารับพัสดุ",
  picked_up: "ขนส่งรับพัสดุแล้ว",
  in_transit: "พัสดุอยู่ระหว่างขนส่ง",
  delivered: "จัดส่งสำเร็จ",
  failed: "จัดส่งไม่สำเร็จ",
  returned: "พัสดุถูกตีกลับ",
};

/**
 * PATCH /api/product-orders/:id/shipping-status — ร้าน/แอดมินอัปเดตสถานะขนส่งละเอียด
 * ใช้ได้เมื่อออเดอร์อยู่สถานะ shipped ขึ้นไป — เมื่อขนส่งถึงมือลูกค้า (delivered)
 * จะเลื่อนสถานะออเดอร์เป็น delivered ให้อัตโนมัติ
 */
router.patch("/:id/shipping-status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, userId, shopId } = req.user!;
    if (role === "customer") { res.status(403).json({ error: "Forbidden" }); return; }

    const { shippingStatus, note } = req.body as { shippingStatus?: string; note?: string };
    if (!shippingStatus || !(shippingStatus in SHIPPING_LABELS)) {
      res.status(400).json({ error: "shippingStatus ต้องเป็น pending/picked_up/in_transit/delivered/failed/returned" });
      return;
    }

    const current = await query<{ id: string; status: string; shipping_status: string | null; shop_id: string; customer_id: string }>(
      "SELECT id, status, shipping_status, shop_id, customer_id FROM product_orders WHERE id = $1",
      [req.params.id]
    );
    if (!current.length) { res.status(404).json({ error: "Order not found" }); return; }
    const order = current[0];
    if (role === "merchant" && order.shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return; }

    if (!["shipped", "delivered"].includes(order.status)) {
      res.status(400).json({ error: "อัปเดตสถานะขนส่งได้เมื่อออเดอร์อยู่ในขั้นจัดส่งแล้วเท่านั้น" });
      return;
    }

    const from = order.shipping_status ?? "pending";
    const allowed = SHIPPING_TRANSITIONS[from] ?? [];
    if (!allowed.includes(shippingStatus)) {
      res.status(400).json({ error: `เปลี่ยนสถานะขนส่งจาก "${SHIPPING_LABELS[from]}" เป็น "${SHIPPING_LABELS[shippingStatus]}" ไม่ได้` });
      return;
    }

    await query(
      `UPDATE product_orders SET
         shipping_status = ($1::text)::shipment_status,
         status = CASE WHEN $1::text = 'delivered' THEN 'delivered'::order_status ELSE status END,
         completed_at = CASE WHEN $1::text = 'delivered' THEN NOW() ELSE completed_at END,
         updated_at = NOW()
       WHERE id = $2`,
      [shippingStatus, req.params.id]
    );
    await query(
      `INSERT INTO product_order_shipping_logs (product_order_id, old_status, new_status, changed_by, note)
       VALUES ($1, $2::shipment_status, $3::shipment_status, $4, $5)`,
      [req.params.id, order.shipping_status, shippingStatus, userId, note ?? null]
    );
    if (shippingStatus === "delivered" && order.status !== "delivered") {
      await query(
        `INSERT INTO product_order_status_logs (product_order_id, old_status, new_status, changed_by, note)
         VALUES ($1,$2,'delivered',$3,$4)`,
        [req.params.id, order.status, userId, "ขนส่งยืนยันการจัดส่งสำเร็จ"]
      );
    }

    await notify(
      order.customer_id,
      SHIPPING_LABELS[shippingStatus],
      note ?? `สถานะการจัดส่งอัปเดตเป็น "${SHIPPING_LABELS[shippingStatus]}"`,
      { productOrderId: req.params.id, shippingStatus }
    );

    res.json({ id: req.params.id, shippingStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update shipping status" });
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
    shippingStatus: row.shipping_status ?? null,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    trackingNo: row.tracking_no ?? null,
    courier: row.courier ?? null,
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
    variantId: row.variant_id ?? null,
    variantLabel: row.variant_label ?? null,
    unitPrice: Number(row.unit_price),
    quantity: Number(row.quantity),
    subtotal: Number(row.subtotal),
  };
}

/** ชื่อสินค้าในเอกสาร PDF — ต่อท้ายตัวเลือก SKU ถ้ามี */
function docItemName(it: Record<string, unknown>): string {
  const label = it.variant_label as string | null;
  return label ? `${it.product_name} (${label})` : (it.product_name as string);
}

export default router;
