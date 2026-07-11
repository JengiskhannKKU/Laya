import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

interface RequestRow {
  id: string;
  user_id: string;
  shop_id: string;
  pattern_id: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  shop_name?: string;
  shop_province?: string;
  shop_profile_image_url?: string;
  pattern_image_url?: string | null;
}

function mapRequest(r: RequestRow) {
  return {
    id: r.id,
    shopId: r.shop_id,
    shopName: r.shop_name,
    shopProvince: r.shop_province,
    shopProfileImageUrl: r.shop_profile_image_url,
    patternId: r.pattern_id,
    patternImageUrl: r.pattern_image_url ?? null,
    note: r.note,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/**
 * POST /api/weaving-requests
 * body: { shopId, patternId?, note? }
 * คำขอสั่งทออย่างไม่เป็นทางการ (ยังไม่ชำระเงิน) — แอดมินติดต่อช่างและแจ้งยอด/เงื่อนไขภายหลัง
 * ต่างจาก /api/weaving-orders ที่เป็นออเดอร์ยืนยันแล้วพร้อมสถานะการผลิตเต็มรูปแบบ
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { shopId, patternId, note } = req.body as { shopId?: string; patternId?: string; note?: string };
    if (!shopId) { res.status(400).json({ error: "ต้องระบุ shopId" }); return; }

    const shop = await query<{ id: string }>("SELECT id FROM shops WHERE id = $1 AND status = 'approved'", [shopId]);
    if (!shop.length) { res.status(404).json({ error: "ไม่พบร้านนี้ หรือร้านยังไม่ได้รับการอนุมัติ" }); return; }

    if (patternId) {
      const pattern = await query<{ id: string }>(
        "SELECT id FROM generated_patterns WHERE id = $1 AND user_id = $2",
        [patternId, req.user!.userId]
      );
      if (!pattern.length) { res.status(404).json({ error: "ไม่พบลายผ้านี้" }); return; }
    }

    const rows = await query<RequestRow>(
      `INSERT INTO weaving_requests (user_id, shop_id, pattern_id, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user!.userId, shopId, patternId ?? null, note ?? null]
    );

    res.status(201).json(mapRequest(rows[0]));
  } catch (err: any) {
    console.error("[weaving-requests] create error:", err.message);
    res.status(500).json({ error: "ส่งคำขอทอผ้าไม่สำเร็จ" });
  }
});

/** GET /api/weaving-requests/mine — คำขอของลูกค้าที่ล็อกอินอยู่ (ใหม่สุดก่อน) */
router.get("/mine", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<RequestRow>(
      `SELECT wr.*, s.name AS shop_name, s.province AS shop_province, s.profile_image_url AS shop_profile_image_url,
              gp.full_image_url AS pattern_image_url
       FROM weaving_requests wr
       JOIN shops s ON s.id = wr.shop_id
       LEFT JOIN generated_patterns gp ON gp.id = wr.pattern_id
       WHERE wr.user_id = $1
       ORDER BY wr.created_at DESC`,
      [req.user!.userId]
    );
    res.json(rows.map(mapRequest));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "โหลดคำขอทอผ้าไม่สำเร็จ" });
  }
});

/** GET /api/weaving-requests/:id — รายละเอียดคำขอเดียว (เจ้าของคำขอเท่านั้น) */
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<RequestRow>(
      `SELECT wr.*, s.name AS shop_name, s.province AS shop_province, s.profile_image_url AS shop_profile_image_url,
              gp.full_image_url AS pattern_image_url
       FROM weaving_requests wr
       JOIN shops s ON s.id = wr.shop_id
       LEFT JOIN generated_patterns gp ON gp.id = wr.pattern_id
       WHERE wr.id = $1 AND wr.user_id = $2`,
      [req.params.id, req.user!.userId]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบคำขอนี้" }); return; }
    res.json(mapRequest(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "โหลดคำขอทอผ้าไม่สำเร็จ" });
  }
});

export default router;
