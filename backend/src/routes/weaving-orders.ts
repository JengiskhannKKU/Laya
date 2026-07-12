import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";
import { createThaiDoc, drawDocHeader, drawKeyValueBlock, formatDocNumber, streamPdf } from "../utils/pdf";

const router = Router();

/** สถานะที่เปลี่ยนต่อได้ (US-406: pending_confirm → confirmed → weaving → ready → ...) */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending_confirm: ["confirmed", "cancelled"],
  confirmed: ["weaving", "cancelled"],
  weaving: ["ready"],
  ready: ["shipped"],
  shipped: ["delivered"],
};

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

/** GET /api/weaving-orders — ลูกค้าเห็นของตัวเอง, ร้านเห็นของร้าน, admin เห็นทั้งหมด */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;
    const { status } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (role === "admin") {
      // ทั้งหมด
    } else if (role === "merchant" && shopId) {
      conditions.push(`w.shop_id = $${idx++}`);
      params.push(shopId);
    } else {
      conditions.push(`w.customer_id = $${idx++}`);
      params.push(userId);
    }
    if (status) {
      conditions.push(`w.status = $${idx++}`);
      params.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await query<Record<string, unknown>>(
      `SELECT w.*, u.display_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              s.name AS shop_name, p.name AS pattern_name, cv.color_name
       FROM weaving_orders w
       JOIN users u ON u.id = w.customer_id
       JOIN shops s ON s.id = w.shop_id
       JOIN weave_patterns p ON p.id = w.pattern_id
       LEFT JOIN weave_color_variants cv ON cv.id = w.color_variant_id
       ${where}
       ORDER BY w.created_at DESC`,
      params
    );

    res.json(rows.map(mapWeavingOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weaving orders" });
  }
});

/** GET /api/weaving-orders/:id — พร้อม status logs */
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;
    const rows = await query<Record<string, unknown>>(
      `SELECT w.*, u.display_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              s.name AS shop_name, p.name AS pattern_name, cv.color_name
       FROM weaving_orders w
       JOIN users u ON u.id = w.customer_id
       JOIN shops s ON s.id = w.shop_id
       JOIN weave_patterns p ON p.id = w.pattern_id
       LEFT JOIN weave_color_variants cv ON cv.id = w.color_variant_id
       WHERE w.id = $1`,
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบออเดอร์ทอผ้า" }); return; }

    const order = rows[0];
    if (role === "customer" && order.customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
    if (role === "merchant" && order.shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return; }

    const logs = await query(
      `SELECT old_status, new_status, note, created_at
       FROM weaving_order_status_logs WHERE order_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json({ ...mapWeavingOrder(order), statusLogs: logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weaving order" });
  }
});

/** GET /api/weaving-orders/:id/slip.pdf — ใบสั่งซื้อ (ออเดอร์สั่งทอ) */
router.get("/:id/slip.pdf", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;
    const rows = await query<Record<string, unknown>>(
      `SELECT w.id, w.customer_id, w.shop_id, w.status, w.meters_requested, w.width_cm,
              w.estimated_price, w.final_price, w.special_instructions, w.custom_color_note, w.created_at,
              u.display_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              s.name AS shop_name, s.address AS shop_address, s.phone AS shop_phone,
              p.name AS pattern_name, cv.color_name
       FROM weaving_orders w
       JOIN users u ON u.id = w.customer_id
       JOIN shops s ON s.id = w.shop_id
       JOIN weave_patterns p ON p.id = w.pattern_id
       LEFT JOIN weave_color_variants cv ON cv.id = w.color_variant_id
       WHERE w.id = $1`,
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบออเดอร์ทอผ้า" }); return; }
    const w = rows[0];

    if (role === "customer" && w.customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
    if (role === "merchant" && w.shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return; }

    const createdAt = new Date(w.created_at as string);
    const doc = createThaiDoc();
    drawDocHeader(doc, {
      shopName: w.shop_name as string,
      shopAddress: w.shop_address as string | null,
      shopPhone: w.shop_phone as string | null,
      docTitle: "ใบสั่งซื้อ",
      docNumber: formatDocNumber("WEV", w.id as string, createdAt),
      docDate: createdAt,
    });

    const y = drawKeyValueBlock(doc, doc.page.margins.left, doc.y, "ลูกค้า", [
      (w.customer_name as string) ?? "-",
      (w.customer_email as string) ?? "",
      (w.customer_phone as string) ?? "",
    ]);
    doc.y = y + 16;

    doc.font("Sarabun-Bold").fontSize(11).fillColor("#1B2A4A").text("รายละเอียดงานสั่งทอ", doc.page.margins.left, doc.y);
    doc.moveDown(0.5);
    doc.font("Sarabun").fontSize(10).fillColor("#374151");
    doc.text(`ลาย: ${(w.pattern_name as string) ?? "-"}${w.color_name ? ` โทน${w.color_name}` : (w.custom_color_note ? ` (${w.custom_color_note})` : "")}`);
    doc.text(`จำนวนที่สั่ง: ${Number(w.meters_requested)} เมตร${w.width_cm ? ` × หน้ากว้าง ${w.width_cm} ซม.` : ""}`);
    if (w.special_instructions) doc.text(`หมายเหตุ: ${w.special_instructions}`);
    doc.moveDown(1);

    const price = Number(w.final_price ?? w.estimated_price ?? 0);
    doc.font("Sarabun-Bold").fontSize(12).fillColor("#1B2A4A")
      .text(`ยอดรวม: ฿${price.toLocaleString()}`, doc.page.margins.left, doc.y, { align: "right", width: doc.page.width - doc.page.margins.left - doc.page.margins.right });

    streamPdf(res, doc, `order-slip-${(w.id as string).slice(0, 8)}.pdf`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สร้างเอกสารไม่สำเร็จ" });
  }
});

/**
 * POST /api/weaving-orders — ลูกค้าสร้างออเดอร์ทอ (US-404, US-407)
 * ต้อง accept color disclaimer ก่อน (สีจริงอาจคลาดเคลื่อนจากจอ)
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const {
      shopId, patternId, colorVariantId, customColorNote,
      metersRequested, widthCm, estimatedPrice, specialInstructions,
      colorDisclaimerAccepted,
    } = req.body as {
      shopId: string; patternId: string; colorVariantId?: string; customColorNote?: string;
      metersRequested: number; widthCm?: number; estimatedPrice?: number;
      specialInstructions?: string; colorDisclaimerAccepted?: boolean;
    };

    if (!shopId || !patternId || !metersRequested) {
      res.status(400).json({ error: "shopId, patternId, metersRequested จำเป็นต้องระบุ" });
      return;
    }
    if (!colorDisclaimerAccepted) {
      res.status(400).json({ error: "ต้องยอมรับเงื่อนไขเรื่องสีจริงอาจคลาดเคลื่อนจากหน้าจอก่อนสั่ง" });
      return;
    }

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO weaving_orders
         (customer_id, shop_id, pattern_id, color_variant_id, custom_color_note,
          meters_requested, width_cm, estimated_price, special_instructions,
          color_disclaimer_accepted, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, 'pending_confirm')
       RETURNING *`,
      [
        userId, shopId, patternId, colorVariantId ?? null, customColorNote ?? null,
        metersRequested, widthCm ?? null, estimatedPrice ?? null, specialInstructions ?? null,
      ]
    );

    await query(
      `INSERT INTO weaving_order_status_logs (order_id, old_status, new_status, changed_by, note)
       VALUES ($1, NULL, 'pending_confirm', $2, 'สร้างออเดอร์ทอผ้า')`,
      [rows[0].id, userId]
    );

    // แจ้งเตือนร้านทอ
    const shopOwner = await query<{ user_id: string }>("SELECT user_id FROM shops WHERE id = $1", [shopId]);
    if (shopOwner.length) {
      await notify(
        shopOwner[0].user_id, "order_update",
        "มีออเดอร์ทอผ้าใหม่",
        `ออเดอร์ทอผ้า ${metersRequested} เมตร รอการยืนยันจากร้าน`,
        { weavingOrderId: rows[0].id }
      );
    }

    res.status(201).json(mapWeavingOrder(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สร้างออเดอร์ทอผ้าไม่สำเร็จ" });
  }
});

/** POST /api/weaving-orders/:id/confirm — ร้านยืนยันรับงาน (US-406) */
router.post("/:id/confirm", requireAuth, async (req: Request, res: Response) => {
  req.body = { ...req.body, status: "confirmed" };
  await changeStatus(req, res);
});

/** PATCH /api/weaving-orders/:id/status — เปลี่ยนสถานะตามลำดับที่กำหนด + log + แจ้งเตือน */
router.patch("/:id/status", requireAuth, changeStatus);

async function changeStatus(req: Request, res: Response) {
  try {
    const { userId, role, shopId } = req.user!;
    const { status, note, finalPrice, estimatedWeeks, trackingNo, courier } = req.body as {
      status: string; note?: string; finalPrice?: number; estimatedWeeks?: number; trackingNo?: string; courier?: string;
    };

    if (!status) { res.status(400).json({ error: "status is required" }); return; }

    const current = await query<{ id: string; status: string; shop_id: string; customer_id: string }>(
      "SELECT id, status, shop_id, customer_id FROM weaving_orders WHERE id = $1",
      [req.params.id]
    );
    if (!current.length) { res.status(404).json({ error: "ไม่พบออเดอร์ทอผ้า" }); return; }

    const order = current[0];

    // สิทธิ์: ร้านเปลี่ยนได้เฉพาะออเดอร์ร้านตัวเอง, ลูกค้ายกเลิกได้เฉพาะก่อนร้านยืนยัน
    if (role === "merchant" && order.shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return; }
    if (role === "customer") {
      if (order.customer_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
      if (!(status === "cancelled" && order.status === "pending_confirm")) {
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
      `UPDATE weaving_orders SET
         status = ($1::text)::weaving_order_status,
         confirmed_at = CASE WHEN $1::text = 'confirmed' THEN NOW() ELSE confirmed_at END,
         completed_at = CASE WHEN $1::text = 'delivered' THEN NOW() ELSE completed_at END,
         final_price = COALESCE($2, final_price),
         estimated_weeks = COALESCE($3, estimated_weeks),
         tracking_no = COALESCE($5, tracking_no),
         courier = COALESCE($6, courier),
         updated_at = NOW()
       WHERE id = $4`,
      [status, finalPrice ?? null, estimatedWeeks ?? null, req.params.id, trackingNo ?? null, courier ?? null]
    );

    await query(
      `INSERT INTO weaving_order_status_logs (order_id, old_status, new_status, changed_by, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.id, order.status, status, userId, note ?? null]
    );

    // แจ้งเตือนอีกฝั่ง (US-602)
    const STATUS_LABELS: Record<string, string> = {
      confirmed: "ร้านยืนยันออเดอร์แล้ว",
      weaving: "เริ่มทอผ้าแล้ว",
      ready: "ทอเสร็จแล้ว พร้อมจัดส่ง",
      shipped: "จัดส่งแล้ว",
      delivered: "จัดส่งสำเร็จ",
      cancelled: "ออเดอร์ถูกยกเลิก",
    };
    const targetUser = role === "customer" ? null : order.customer_id;
    if (targetUser) {
      await notify(
        targetUser, "order_update",
        STATUS_LABELS[status] ?? `สถานะออเดอร์: ${status}`,
        note ?? `ออเดอร์ทอผ้าของคุณอัปเดตเป็นสถานะ ${STATUS_LABELS[status] ?? status}`,
        { weavingOrderId: req.params.id, status }
      );
    } else {
      // ลูกค้ายกเลิก → แจ้งร้าน
      const shopOwner = await query<{ user_id: string }>("SELECT user_id FROM shops WHERE id = $1", [order.shop_id]);
      if (shopOwner.length) {
        await notify(
          shopOwner[0].user_id, "order_update",
          "ลูกค้ายกเลิกออเดอร์ทอผ้า",
          note ?? "ออเดอร์ถูกยกเลิกก่อนการยืนยัน",
          { weavingOrderId: req.params.id, status }
        );
      }
    }

    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "อัปเดตสถานะไม่สำเร็จ" });
  }
}

function mapWeavingOrder(row: Record<string, unknown>) {
  return {
    id: row.id,
    customerId: row.customer_id,
    shopId: row.shop_id,
    patternId: row.pattern_id,
    colorVariantId: row.color_variant_id ?? null,
    customColorNote: row.custom_color_note ?? null,
    metersRequested: Number(row.meters_requested),
    widthCm: row.width_cm ? Number(row.width_cm) : null,
    status: row.status,
    colorDisclaimerAccepted: row.color_disclaimer_accepted,
    estimatedPrice: row.estimated_price ? Number(row.estimated_price) : null,
    finalPrice: row.final_price ? Number(row.final_price) : null,
    specialInstructions: row.special_instructions ?? null,
    estimatedWeeks: row.estimated_weeks ?? null,
    trackingNo: row.tracking_no ?? null,
    courier: row.courier ?? null,
    confirmedAt: row.confirmed_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customerName: row.customer_name ?? null,
    customerEmail: row.customer_email ?? null,
    customerPhone: row.customer_phone ?? null,
    shopName: row.shop_name ?? null,
    patternName: row.pattern_name ?? null,
    colorName: row.color_name ?? null,
  };
}

export default router;
