import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// ทุก endpoint เฉพาะ admin
router.use(requireAuth, requireRole("admin"));

/** GET /api/admin/stats — สรุปภาพรวมแพลตฟอร์มสำหรับ Dashboard แอดมิน */
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `WITH usr AS (
         SELECT COUNT(*) AS total_users,
                COUNT(*) FILTER (WHERE u.id NOT IN (SELECT user_id FROM shops)) AS customers,
                COUNT(*) FILTER (WHERE u.id IN (SELECT user_id FROM shops)) AS merchants
         FROM users u
       ),
       shp AS (
         SELECT COUNT(*) AS total_shops,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending_shops,
                COUNT(*) FILTER (WHERE status = 'approved') AS approved_shops
         FROM shops
       ),
       all_orders AS (
         SELECT status::text AS status FROM orders
         UNION ALL SELECT status::text FROM weaving_orders
         UNION ALL SELECT status::text FROM product_orders
       ),
       ord AS (
         SELECT COUNT(*) AS total_orders,
                COUNT(*) FILTER (WHERE status IN ('pending_confirm', 'confirmed')) AS active_orders
         FROM all_orders
       ),
       prod AS (SELECT COUNT(*) AS total_products FROM products),
       pay AS (
         SELECT
           COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) AS gmv,
           COALESCE(SUM(platform_fee) FILTER (WHERE status = 'paid'), 0) AS platform_fees,
           COALESCE(SUM(amount) FILTER (WHERE status = 'paid' AND date_trunc('month', paid_at) = date_trunc('month', NOW())), 0) AS gmv_this_month
         FROM payments
       )
       SELECT usr.total_users, usr.customers, usr.merchants,
              shp.total_shops, shp.pending_shops, shp.approved_shops,
              ord.total_orders, ord.active_orders, prod.total_products,
              pay.gmv, pay.platform_fees, pay.gmv_this_month
       FROM usr, shp, ord, prod, pay`
    );
    const s = rows[0] ?? {};
    res.json({
      totalUsers: Number(s.total_users ?? 0),
      customers: Number(s.customers ?? 0),
      merchants: Number(s.merchants ?? 0),
      totalShops: Number(s.total_shops ?? 0),
      pendingShops: Number(s.pending_shops ?? 0),
      approvedShops: Number(s.approved_shops ?? 0),
      totalOrders: Number(s.total_orders ?? 0),
      activeOrders: Number(s.active_orders ?? 0),
      totalProducts: Number(s.total_products ?? 0),
      gmv: Number(s.gmv ?? 0),
      platformFees: Number(s.platform_fees ?? 0),
      gmvThisMonth: Number(s.gmv_this_month ?? 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

/** GET /api/admin/users — รายชื่อผู้ใช้ทั้งหมด */
router.get("/users", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 200), 500);
    const rows = await query<Record<string, unknown>>(
      `SELECT id, display_name, email, phone, role, is_active, created_at
       FROM users ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    res.json(rows.map((r) => ({
      id: r.id,
      displayName: r.display_name ?? null,
      email: r.email,
      phone: r.phone ?? null,
      role: r.role,
      isActive: r.is_active,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/** GET /api/admin/shops — ร้านค้าทั้งหมด (ทุกสถานะ รวม pending) สำหรับคิวอนุมัติ */
router.get("/shops", async (_req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT s.id, s.name, s.province, s.status, s.merchant_type, s.rating, s.review_count,
              s.created_at, s.approved_at, u.email AS owner_email, u.display_name AS owner_name,
              (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id) AS product_count
       FROM shops s JOIN users u ON u.id = s.user_id
       ORDER BY (s.status = 'pending') DESC, s.created_at DESC`
    );
    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      province: r.province ?? null,
      status: r.status,
      merchantType: r.merchant_type ?? null,
      rating: Number(r.rating ?? 0),
      reviewCount: Number(r.review_count ?? 0),
      productCount: Number(r.product_count ?? 0),
      ownerEmail: r.owner_email,
      ownerName: r.owner_name ?? null,
      createdAt: r.created_at,
      approvedAt: r.approved_at ?? null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

/** GET /api/admin/products — สินค้าทั้งหมด (ทุกร้าน ทุกสถานะ) */
router.get("/products", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 300), 1000);
    const rows = await query<Record<string, unknown>>(
      `SELECT p.id, p.name, p.category, p.price, p.price_unit, p.stock, p.is_active,
              p.created_at, s.name AS shop_name, s.province
       FROM products p JOIN shops s ON s.id = p.shop_id
       ORDER BY p.created_at DESC LIMIT $1`,
      [limit]
    );
    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      price: Number(r.price),
      priceUnit: r.price_unit,
      stock: Number(r.stock),
      isActive: r.is_active,
      shopName: r.shop_name,
      province: r.province ?? null,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/** GET /api/admin/reviews — รีวิวร้านค้าทั้งหมด (ทุกร้าน รวมที่ซ่อนไว้) สำหรับตรวจสอบ */
router.get("/reviews", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 300), 1000);
    const rows = await query<Record<string, unknown>>(
      `SELECT r.id, r.shop_id, r.rating, r.comment, r.is_hidden, r.created_at,
              s.name AS shop_name, u.display_name AS reviewer_name
       FROM shop_reviews r
       JOIN shops s ON s.id = r.shop_id
       JOIN users u ON u.id = r.reviewer_id
       ORDER BY r.created_at DESC LIMIT $1`,
      [limit]
    );
    res.json(rows.map((r) => ({
      id: r.id,
      shopId: r.shop_id,
      shopName: r.shop_name,
      reviewerName: r.reviewer_name ?? "-",
      rating: Number(r.rating),
      comment: r.comment ?? null,
      isHidden: r.is_hidden,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/** PATCH /api/admin/reviews/:id/hide — ซ่อน/แสดงรีวิว */
router.patch("/reviews/:id/hide", async (req: Request, res: Response) => {
  try {
    const { hidden } = req.body as { hidden?: boolean };
    if (typeof hidden !== "boolean") { res.status(400).json({ error: "hidden ต้องเป็น true/false" }); return; }
    await query("UPDATE shop_reviews SET is_hidden = $1 WHERE id = $2", [hidden, req.params.id]);
    res.json({ id: req.params.id, isHidden: hidden });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

/** DELETE /api/admin/reviews/:id — ลบรีวิวถาวร */
router.delete("/reviews/:id", async (req: Request, res: Response) => {
  try {
    await query("DELETE FROM shop_reviews WHERE id = $1", [req.params.id]);
    res.json({ id: req.params.id, deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
