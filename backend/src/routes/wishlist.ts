import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

function mapProduct(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    category: row.category,
    price: Number(row.price),
    priceUnit: row.price_unit,
    stock: Number(row.stock),
    images: Array.isArray(row.images) ? row.images : [],
    fabricType: row.fabric_type ?? null,
    hasGI: row.has_gi ?? false,
    shopId: row.shop_id,
    shopName: row.shop_name,
    province: row.province,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    createdAt: row.created_at,
  };
}

/** GET /api/wishlist/ids — เฉพาะ product_id ที่บันทึกไว้ (เบา ใช้เช็คสถานะหัวใจได้ทั่วแอป) */
router.get("/ids", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<{ product_id: string }>(
      "SELECT product_id FROM wishlist_items WHERE user_id = $1",
      [req.user!.userId]
    );
    res.json(rows.map((r) => r.product_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist ids" });
  }
});

/** GET /api/wishlist — รายการโปรดพร้อมข้อมูลสินค้าเต็ม (สำหรับหน้า /wishlist) */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT
         p.id, p.name, p.description, p.category, p.price, p.price_unit, p.stock,
         p.images, p.fabric_type, p.has_gi, p.shop_id, p.created_at,
         s.name AS shop_name, s.province, s.rating, s.review_count,
         w.created_at AS wishlisted_at
       FROM wishlist_items w
       JOIN products p ON p.id = w.product_id
       JOIN shops s ON s.id = p.shop_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user!.userId]
    );
    res.json(rows.map(mapProduct));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

/** POST /api/wishlist — เพิ่มสินค้าลงรายการโปรด (idempotent) */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { productId } = req.body as { productId?: string };
    if (!productId) { res.status(400).json({ error: "ต้องระบุ productId" }); return; }

    const product = await query<{ id: string }>("SELECT id FROM products WHERE id = $1", [productId]);
    if (!product.length) { res.status(404).json({ error: "ไม่พบสินค้า" }); return; }

    await query(
      `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [req.user!.userId, productId]
    );
    res.status(201).json({ productId, wishlisted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เพิ่มรายการโปรดไม่สำเร็จ" });
  }
});

/** DELETE /api/wishlist/:productId — นำออกจากรายการโปรด */
router.delete("/:productId", requireAuth, async (req: Request, res: Response) => {
  try {
    await query(
      "DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2",
      [req.user!.userId, req.params.productId]
    );
    res.json({ productId: req.params.productId, wishlisted: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "นำออกจากรายการโปรดไม่สำเร็จ" });
  }
});

export default router;
