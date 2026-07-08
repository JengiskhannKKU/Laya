import { Router, Request, Response } from "express";
import { query } from "../db";

const router = Router();

/**
 * "ชุมชน" ในมุมมองลูกค้า = ร้านค้า/วิสาหกิจชุมชนที่ผ่านการอนุมัติแล้ว (ตาราง shops)
 * เดิม route นี้ query ตาราง `communities` ที่ไม่มีอยู่จริงในฐานข้อมูล (ลิงก์ค้างจาก schema เก่า) — แก้ให้ดึงจาก shops จริง
 */
function mapCommunity(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    province: row.province,
    image: (row.cover_image_url as string) || (row.profile_image_url as string) || (row.sample_image as string) || null,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    productCount: Number(row.product_count ?? 0),
  };
}

/** GET /api/communities — รายการชุมชน (ร้านค้าที่อนุมัติแล้ว) */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT
         s.id, s.name, s.province, s.cover_image_url, s.profile_image_url, s.rating, s.review_count,
         (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id AND p.is_active = true) AS product_count,
         (SELECT images[1] FROM products p WHERE p.shop_id = s.id AND p.is_active = true AND array_length(images, 1) > 0 ORDER BY p.created_at ASC LIMIT 1) AS sample_image
       FROM shops s
       WHERE s.status = 'approved'
       ORDER BY s.created_at DESC`
    );
    res.json(rows.map(mapCommunity));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});

/** GET /api/communities/:id — รายละเอียดชุมชนเดียว (สำหรับหน้า /community/[id]) */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT
         s.id, s.name, s.province, s.address, s.description, s.cover_image_url, s.profile_image_url,
         s.rating, s.review_count,
         (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id AND p.is_active = true) AS product_count,
         (SELECT images[1] FROM products p WHERE p.shop_id = s.id AND p.is_active = true AND array_length(images, 1) > 0 ORDER BY p.created_at ASC LIMIT 1) AS sample_image
       FROM shops s
       WHERE s.id = $1 AND s.status = 'approved'`,
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบชุมชนนี้" }); return; }

    res.json({
      ...mapCommunity(rows[0]),
      address: rows[0].address ?? null,
      description: rows[0].description ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch community" });
  }
});

export default router;
