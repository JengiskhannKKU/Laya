import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

/** หมวดหมู่สินค้าที่รองรับ — ใช้ตรวจตอนสร้าง/แก้ไข และใช้เป็นตัวกรองหน้าเว็บ (แยกจาก "ชุมชน") */
export const PRODUCT_CATEGORIES = ["fabric", "clothing", "scarf", "bag", "premium", "decor", "others"] as const;

/**
 * GET /api/products
 * สินค้าพร้อมขาย (ไม่ต้องสั่งตัด/custom) — สำหรับ marketplace/ตะกร้า/checkout
 * Query params: ?category=  ?province=  ?search=  ?shopId=
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, province, search, shopId } = req.query;
    const conditions: string[] = ["p.is_active = true", "s.status = 'approved'"];
    const params: unknown[] = [];
    let idx = 1;

    if (category) {
      conditions.push(`p.category = $${idx++}`);
      params.push(category);
    }
    if (province) {
      conditions.push(`s.province = $${idx++}`);
      params.push(province);
    }
    if (shopId) {
      conditions.push(`p.shop_id = $${idx++}`);
      params.push(shopId);
    }
    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR s.province ILIKE $${idx} OR s.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const rows = await query<Record<string, unknown>>(
      `SELECT
         p.id, p.name, p.description, p.category, p.price, p.price_unit, p.stock,
         p.images, p.fabric_type, p.has_gi, p.shop_id, p.created_at,
         s.name AS shop_name, s.province, s.rating, s.review_count
       FROM products p
       JOIN shops s ON s.id = p.shop_id
       ${where}
       ORDER BY p.created_at DESC`,
      params
    );

    res.json(rows.map(mapProduct));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * GET /api/products/mine
 * สินค้าของร้านตัวเอง (รวมที่ปิดขายอยู่) — สำหรับหน้าจัดการสินค้าของร้านค้า
 * ต้องอยู่ก่อน "/:id" ไม่งั้น express จะจับ "mine" เป็น :id
 */
router.get("/mine", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า" }); return; }

    const rows = await query<Record<string, unknown>>(
      `SELECT p.id, p.name, p.description, p.category, p.price, p.price_unit, p.stock,
              p.images, p.fabric_type, p.has_gi, p.is_active, p.shop_id, p.created_at
       FROM products p
       WHERE p.shop_id = $1
       ORDER BY p.created_at DESC`,
      [shopId]
    );

    res.json(rows.map((r) => ({ ...mapProduct(r), isActive: r.is_active })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your products" });
  }
});

/**
 * POST /api/products — ร้านค้าลงขายสินค้าใหม่
 */
router.post("/", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า — สมัครร้านค้าก่อนลงขายสินค้า" }); return; }

    const { name, description, category, price, priceUnit, stock, images, fabricType, hasGI } = req.body as {
      name?: string; description?: string; category?: string; price?: number; priceUnit?: string;
      stock?: number; images?: string[]; fabricType?: string; hasGI?: boolean;
    };

    if (!name || !name.trim()) { res.status(400).json({ error: "กรุณากรอกชื่อสินค้า" }); return; }
    if (!Number.isFinite(price) || Number(price) <= 0) { res.status(400).json({ error: "ราคาต้องมากกว่า 0" }); return; }
    if (!Number.isInteger(stock) || Number(stock) < 0) { res.status(400).json({ error: "จำนวนสต็อกไม่ถูกต้อง" }); return; }
    const cat = PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number]) ? category : "others";

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO products (shop_id, name, description, category, price, price_unit, stock, images, fabric_type, has_gi)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        shopId, name.trim(), description?.trim() || null, cat, price, priceUnit || "ชิ้น",
        stock, Array.isArray(images) ? images.filter(Boolean) : [], fabricType || null, !!hasGI,
      ]
    );

    res.status(201).json({ ...mapProduct(rows[0]), isActive: rows[0].is_active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เพิ่มสินค้าไม่สำเร็จ" });
  }
});

/** GET /api/products/:id */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT
         p.id, p.name, p.description, p.category, p.price, p.price_unit, p.stock,
         p.images, p.fabric_type, p.has_gi, p.shop_id, p.created_at,
         s.name AS shop_name, s.province, s.rating, s.review_count
       FROM products p
       JOIN shops s ON s.id = p.shop_id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (!rows.length) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(mapProduct(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

/** ตรวจว่าสินค้านี้เป็นของร้านผู้เรียกจริง — คืน 404/403 ให้เลยถ้าไม่ผ่าน */
async function assertOwnership(productId: string, shopId: string | undefined, res: Response): Promise<boolean> {
  if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า" }); return false; }
  const rows = await query<{ shop_id: string }>("SELECT shop_id FROM products WHERE id = $1", [productId]);
  if (!rows.length) { res.status(404).json({ error: "ไม่พบสินค้า" }); return false; }
  if (rows[0].shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return false; }
  return true;
}

/** PUT /api/products/:id — แก้ไขสินค้า (เฉพาะร้านเจ้าของ) */
router.put("/:id", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertOwnership(req.params.id, shopId, res))) return;

    const { name, description, category, price, priceUnit, stock, images, fabricType, hasGI } = req.body as {
      name?: string; description?: string; category?: string; price?: number; priceUnit?: string;
      stock?: number; images?: string[]; fabricType?: string; hasGI?: boolean;
    };

    if (!name || !name.trim()) { res.status(400).json({ error: "กรุณากรอกชื่อสินค้า" }); return; }
    if (!Number.isFinite(price) || Number(price) <= 0) { res.status(400).json({ error: "ราคาต้องมากกว่า 0" }); return; }
    if (!Number.isInteger(stock) || Number(stock) < 0) { res.status(400).json({ error: "จำนวนสต็อกไม่ถูกต้อง" }); return; }
    const cat = PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number]) ? category : "others";

    const rows = await query<Record<string, unknown>>(
      `UPDATE products SET
         name = $1, description = $2, category = $3, price = $4, price_unit = $5,
         stock = $6, images = $7, fabric_type = $8, has_gi = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        name.trim(), description?.trim() || null, cat, price, priceUnit || "ชิ้น",
        stock, Array.isArray(images) ? images.filter(Boolean) : [], fabricType || null, !!hasGI,
        req.params.id,
      ]
    );

    res.json({ ...mapProduct(rows[0]), isActive: rows[0].is_active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "แก้ไขสินค้าไม่สำเร็จ" });
  }
});

/** PATCH /api/products/:id/status — เปิด/ปิดการขาย (ไม่ลบข้อมูล) */
router.patch("/:id/status", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertOwnership(req.params.id, shopId, res))) return;

    const { isActive } = req.body as { isActive?: boolean };
    if (typeof isActive !== "boolean") { res.status(400).json({ error: "isActive ต้องเป็น true/false" }); return; }

    await query("UPDATE products SET is_active = $1, updated_at = NOW() WHERE id = $2", [isActive, req.params.id]);
    res.json({ id: req.params.id, isActive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "อัปเดตสถานะไม่สำเร็จ" });
  }
});

/**
 * DELETE /api/products/:id — ลบสินค้า
 * ถ้าเคยมีคำสั่งซื้ออ้างอิงอยู่ (FK constraint) จะซ่อนแทนการลบถาวร เพื่อไม่ให้ประวัติออเดอร์เดิมพัง
 */
router.delete("/:id", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertOwnership(req.params.id, shopId, res))) return;

    try {
      await query("DELETE FROM products WHERE id = $1", [req.params.id]);
      res.json({ id: req.params.id, deleted: true });
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "23503") {
        // foreign key violation — เคยมีออเดอร์อ้างอิงสินค้านี้ ลบถาวรไม่ได้
        await query("UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1", [req.params.id]);
        res.json({ id: req.params.id, deleted: false, hidden: true, message: "สินค้านี้เคยมีคำสั่งซื้อแล้ว จึงซ่อนจากการขายแทนการลบถาวร" });
        return;
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ลบสินค้าไม่สำเร็จ" });
  }
});

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

export default router;
