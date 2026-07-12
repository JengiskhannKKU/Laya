import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

/** GET /api/reviews/shop/mine — รีวิวของร้านตัวเอง (สำหรับหน้ารีวิวของร้านค้า) */
router.get("/shop/mine", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT r.id, r.shop_id, r.reviewer_id, r.order_id, r.rating, r.comment,
              r.shop_reply, r.shop_reply_at, r.created_at,
              u.display_name AS reviewer_name
       FROM shop_reviews r
       JOIN shops s ON s.id = r.shop_id
       JOIN users u ON u.id = r.reviewer_id
       WHERE s.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user!.userId]
    );
    res.json(rows.map(mapReview));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/** PATCH /api/reviews/:id/reply — ร้านตอบกลับรีวิว */
router.patch("/:id/reply", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { reply } = req.body as { reply?: string };
    if (!reply || !reply.trim()) { res.status(400).json({ error: "กรุณากรอกข้อความตอบกลับ" }); return; }

    const rows = await query<{ shop_user_id: string }>(
      `SELECT s.user_id AS shop_user_id FROM shop_reviews r JOIN shops s ON s.id = r.shop_id WHERE r.id = $1`,
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบรีวิว" }); return; }
    if (rows[0].shop_user_id !== req.user!.userId) { res.status(403).json({ error: "Forbidden" }); return; }

    await query(
      "UPDATE shop_reviews SET shop_reply = $1, shop_reply_at = NOW() WHERE id = $2",
      [reply.trim(), req.params.id]
    );
    res.json({ id: req.params.id, shopReply: reply.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ตอบกลับรีวิวไม่สำเร็จ" });
  }
});

function mapReview(row: Record<string, unknown>) {
  return {
    id: row.id,
    shopId: row.shop_id,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    orderId: row.order_id ?? null,
    rating: Number(row.rating),
    comment: row.comment ?? null,
    shopReply: row.shop_reply ?? null,
    shopReplyAt: row.shop_reply_at ?? null,
    createdAt: row.created_at,
  };
}

export default router;
