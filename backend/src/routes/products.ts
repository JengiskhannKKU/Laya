import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

/** หมวดหมู่สินค้าที่รองรับ — ใช้ตรวจตอนสร้าง/แก้ไข และใช้เป็นตัวกรองหน้าเว็บ (แยกจาก "ชุมชน") */
export const PRODUCT_CATEGORIES = ["fabric", "clothing", "scarf", "bag", "premium", "decor", "others"] as const;

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
         p.id, p.name, p.name_en, p.description, p.description_en, p.category, p.price, p.price_unit, p.stock,
         p.images, p.fabric_type, p.has_gi, p.low_stock_threshold, p.has_variants, p.shop_id, p.created_at,
         s.name AS shop_name, s.province, s.rating, s.review_count,
         v.variant_count, v.price_min, v.price_max, v.stock_total
       FROM products p
       JOIN shops s ON s.id = p.shop_id
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS variant_count, MIN(price) AS price_min, MAX(price) AS price_max, SUM(stock) AS stock_total
         FROM product_variants WHERE product_id = p.id
       ) v ON p.has_variants
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
      `SELECT p.id, p.name, p.name_en, p.description, p.description_en, p.category, p.price, p.price_unit, p.stock,
              p.images, p.fabric_type, p.has_gi, p.is_active, p.shop_id, p.created_at,
              p.low_stock_threshold, p.has_variants,
              v.variant_count, v.price_min, v.price_max, v.stock_total
       FROM products p
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS variant_count, MIN(price) AS price_min, MAX(price) AS price_max, SUM(stock) AS stock_total
         FROM product_variants WHERE product_id = p.id
       ) v ON true
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

    const { name, nameEn, description, descriptionEn, category, price, priceUnit, stock, images, fabricType, hasGI, lowStockThreshold, hasVariants } = req.body as {
      name?: string; nameEn?: string; description?: string; descriptionEn?: string; category?: string; price?: number; priceUnit?: string;
      stock?: number; images?: string[]; fabricType?: string; hasGI?: boolean; lowStockThreshold?: number; hasVariants?: boolean;
    };

    if (!name || !name.trim()) { res.status(400).json({ error: "กรุณากรอกชื่อสินค้า" }); return; }
    if (!Number.isFinite(price) || Number(price) <= 0) { res.status(400).json({ error: "ราคาต้องมากกว่า 0" }); return; }
    if (!Number.isInteger(stock) || Number(stock) < 0) { res.status(400).json({ error: "จำนวนสต็อกไม่ถูกต้อง" }); return; }
    const cat = PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number]) ? category : "others";

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO products (shop_id, name, name_en, description, description_en, category, price, price_unit, stock, images, fabric_type, has_gi, low_stock_threshold, has_variants)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        shopId, name.trim(), nameEn?.trim() || null, description?.trim() || null, descriptionEn?.trim() || null, cat, price, priceUnit || "ชิ้น",
        stock, Array.isArray(images) ? images.filter(Boolean) : [], fabricType || null, !!hasGI,
        Number.isInteger(lowStockThreshold) && Number(lowStockThreshold) >= 0 ? lowStockThreshold : 5,
        !!hasVariants,
      ]
    );

    res.status(201).json({ ...mapProduct(rows[0]), isActive: rows[0].is_active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เพิ่มสินค้าไม่สำเร็จ" });
  }
});

/**
 * POST /api/products/bulk — ลงขายสินค้าหลายชิ้นพร้อมกัน (ใช้กับหน้า "เพิ่มหลายรายการ" / นำเข้า CSV)
 * body: { products: [{ name, description?, category?, price, priceUnit?, stock, fabricType?, hasGI?, lowStockThreshold? }] }
 */
router.post("/bulk", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า — สมัครร้านค้าก่อนลงขายสินค้า" }); return; }

    const { products } = req.body as {
      products?: {
        name?: string; nameEn?: string; description?: string; descriptionEn?: string; category?: string; price?: number; priceUnit?: string;
        stock?: number; fabricType?: string; hasGI?: boolean; lowStockThreshold?: number;
      }[];
    };
    if (!Array.isArray(products) || products.length === 0) { res.status(400).json({ error: "products ต้องมีอย่างน้อย 1 รายการ" }); return; }

    for (const p of products) {
      if (!p.name || !p.name.trim()) { res.status(400).json({ error: "ทุกแถวต้องกรอกชื่อสินค้า" }); return; }
      if (!Number.isFinite(p.price) || Number(p.price) <= 0) { res.status(400).json({ error: `"${p.name}": ราคาต้องมากกว่า 0` }); return; }
      if (!Number.isInteger(p.stock) || Number(p.stock) < 0) { res.status(400).json({ error: `"${p.name}": จำนวนสต็อกไม่ถูกต้อง` }); return; }
    }

    const created: Record<string, unknown>[] = [];
    for (const p of products) {
      const cat = PRODUCT_CATEGORIES.includes(p.category as (typeof PRODUCT_CATEGORIES)[number]) ? p.category : "others";
      const rows = await query<Record<string, unknown>>(
        `INSERT INTO products (shop_id, name, name_en, description, description_en, category, price, price_unit, stock, fabric_type, has_gi, low_stock_threshold)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          shopId, p.name!.trim(), p.nameEn?.trim() || null, p.description?.trim() || null, p.descriptionEn?.trim() || null, cat, p.price, p.priceUnit || "ชิ้น",
          p.stock, p.fabricType || null, !!p.hasGI,
          Number.isInteger(p.lowStockThreshold) && Number(p.lowStockThreshold) >= 0 ? p.lowStockThreshold : 5,
        ]
      );
      created.push({ ...mapProduct(rows[0]), isActive: rows[0].is_active });
    }

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เพิ่มสินค้าหลายรายการไม่สำเร็จ" });
  }
});

/** GET /api/products/:id */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT
         p.id, p.name, p.name_en, p.description, p.description_en, p.category, p.price, p.price_unit, p.stock,
         p.images, p.fabric_type, p.has_gi, p.low_stock_threshold, p.has_variants, p.shop_id, p.created_at,
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

    // สินค้าที่มีหลายตัวเลือก — แนบรายการ SKU ให้หน้าร้านใช้เลือกก่อนซื้อ
    let variants: Record<string, unknown>[] = [];
    if (rows[0].has_variants) {
      variants = await query<Record<string, unknown>>(
        "SELECT * FROM product_variants WHERE product_id = $1 ORDER BY created_at ASC",
        [req.params.id]
      );
    }

    res.json({ ...mapProduct(rows[0]), variants: variants.map(mapVariant) });
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

    const { name, nameEn, description, descriptionEn, category, price, priceUnit, stock, images, fabricType, hasGI, lowStockThreshold, hasVariants } = req.body as {
      name?: string; nameEn?: string; description?: string; descriptionEn?: string; category?: string; price?: number; priceUnit?: string;
      stock?: number; images?: string[]; fabricType?: string; hasGI?: boolean; lowStockThreshold?: number; hasVariants?: boolean;
    };

    if (!name || !name.trim()) { res.status(400).json({ error: "กรุณากรอกชื่อสินค้า" }); return; }
    if (!Number.isFinite(price) || Number(price) <= 0) { res.status(400).json({ error: "ราคาต้องมากกว่า 0" }); return; }
    if (!Number.isInteger(stock) || Number(stock) < 0) { res.status(400).json({ error: "จำนวนสต็อกไม่ถูกต้อง" }); return; }
    const cat = PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number]) ? category : "others";

    const rows = await query<Record<string, unknown>>(
      `UPDATE products SET
         name = $1, name_en = $2, description = $3, description_en = $4, category = $5, price = $6, price_unit = $7,
         stock = $8, images = $9, fabric_type = $10, has_gi = $11,
         low_stock_threshold = $12, has_variants = $13, updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        name.trim(), nameEn?.trim() || null, description?.trim() || null, descriptionEn?.trim() || null, cat, price, priceUnit || "ชิ้น",
        stock, Array.isArray(images) ? images.filter(Boolean) : [], fabricType || null, !!hasGI,
        Number.isInteger(lowStockThreshold) && Number(lowStockThreshold) >= 0 ? lowStockThreshold : 5,
        !!hasVariants,
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
 * POST /api/products/:id/stock — ปรับสต็อกแบบ +/- (แยกจาก PUT ที่ overwrite ทั้งแถว)
 * body: { delta: number, reason?: string } — บันทึกประวัติใน stock_adjustments และแจ้งเตือนถ้าสต็อกต่ำ
 */
router.post("/:id/stock", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId, userId } = req.user!;
    if (!(await assertOwnership(req.params.id, shopId, res))) return;

    const { delta, reason } = req.body as { delta?: number; reason?: string };
    if (!Number.isInteger(delta) || delta === 0) { res.status(400).json({ error: "delta ต้องเป็นจำนวนเต็มที่ไม่ใช่ 0" }); return; }

    const before = await query<{ stock: number; low_stock_threshold: number; shop_user_id: string }>(
      `SELECT p.stock, p.low_stock_threshold, s.user_id AS shop_user_id
       FROM products p JOIN shops s ON s.id = p.shop_id WHERE p.id = $1`,
      [req.params.id]
    );
    const prevStock = before[0].stock;
    const threshold = before[0].low_stock_threshold;

    const rows = await query<{ stock: number }>(
      `UPDATE products SET stock = GREATEST(stock + $1, 0), updated_at = NOW() WHERE id = $2 RETURNING stock`,
      [delta, req.params.id]
    );
    const newStock = rows[0].stock;

    await query(
      `INSERT INTO stock_adjustments (product_id, shop_id, delta, new_stock, reason, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.id, shopId, delta, newStock, reason ?? null, userId]
    );

    if (newStock <= threshold && prevStock > threshold) {
      await notify(
        before[0].shop_user_id,
        "system",
        "สินค้าใกล้หมด",
        `สินค้าเหลือ ${newStock} ชิ้น (เกณฑ์แจ้งเตือน ${threshold} ชิ้น)`,
        { productId: req.params.id, stock: newStock }
      );
    }

    res.json({ id: req.params.id, stock: newStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ปรับสต็อกไม่สำเร็จ" });
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

/** GET /api/products/:id/variants — รายการ SKU ของสินค้า (เฉพาะร้านเจ้าของ) */
router.get("/:id/variants", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertOwnership(req.params.id, shopId, res))) return;

    const rows = await query<Record<string, unknown>>(
      `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json(rows.map(mapVariant));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch variants" });
  }
});

/**
 * POST /api/products/:id/variants/bulk — เพิ่ม/แก้ไข SKU หลายรายการพร้อมกัน (upsert)
 * body: { variants: [{ id?, sku?, color?, size?, pattern?, length?, material?, price, stock }] }
 * แถวที่มี id → UPDATE, ไม่มี id → INSERT ใหม่ — ใช้ทั้งกับ "เพิ่มหลายแถว" และ "นำเข้า CSV"
 */
router.post("/:id/variants/bulk", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertOwnership(req.params.id, shopId, res))) return;

    const { variants } = req.body as {
      variants?: { id?: string; sku?: string; color?: string; size?: string; pattern?: string; length?: string; material?: string; price?: number; stock?: number }[];
    };
    if (!Array.isArray(variants) || variants.length === 0) { res.status(400).json({ error: "variants ต้องมีอย่างน้อย 1 รายการ" }); return; }

    for (const v of variants) {
      if (!Number.isFinite(v.price) || Number(v.price) <= 0) { res.status(400).json({ error: "ราคาต้องมากกว่า 0" }); return; }
      if (!Number.isInteger(v.stock) || Number(v.stock) < 0) { res.status(400).json({ error: "จำนวนสต็อกไม่ถูกต้อง" }); return; }
    }

    for (const v of variants) {
      if (v.id) {
        await query(
          `UPDATE product_variants SET
             sku=$1, color=$2, size=$3, pattern=$4, length=$5, material=$6, price=$7, stock=$8, updated_at=NOW()
           WHERE id=$9 AND product_id=$10`,
          [v.sku || null, v.color || null, v.size || null, v.pattern || null, v.length || null, v.material || null, v.price, v.stock, v.id, req.params.id]
        );
      } else {
        await query(
          `INSERT INTO product_variants (product_id, sku, color, size, pattern, length, material, price, stock)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [req.params.id, v.sku || null, v.color || null, v.size || null, v.pattern || null, v.length || null, v.material || null, v.price, v.stock]
        );
      }
    }

    const rows = await query<Record<string, unknown>>(
      `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json(rows.map(mapVariant));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "บันทึก SKU ไม่สำเร็จ" });
  }
});

/** PATCH /api/products/:id/variants/bulk — แก้ไขราคา/สต็อกของ SKU ที่เลือกพร้อมกัน */
router.patch("/:id/variants/bulk", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertOwnership(req.params.id, shopId, res))) return;

    const { variantIds, price, stock } = req.body as { variantIds?: string[]; price?: number; stock?: number };
    if (!Array.isArray(variantIds) || variantIds.length === 0) { res.status(400).json({ error: "variantIds ต้องมีอย่างน้อย 1 รายการ" }); return; }
    if (price === undefined && stock === undefined) { res.status(400).json({ error: "ต้องระบุ price หรือ stock อย่างน้อย 1 อย่าง" }); return; }
    if (price !== undefined && (!Number.isFinite(price) || Number(price) <= 0)) { res.status(400).json({ error: "ราคาต้องมากกว่า 0" }); return; }
    if (stock !== undefined && (!Number.isInteger(stock) || Number(stock) < 0)) { res.status(400).json({ error: "จำนวนสต็อกไม่ถูกต้อง" }); return; }

    await query(
      `UPDATE product_variants SET
         price = COALESCE($1, price), stock = COALESCE($2, stock), updated_at = NOW()
       WHERE product_id = $3 AND id = ANY($4::uuid[])`,
      [price ?? null, stock ?? null, req.params.id, variantIds]
    );

    const rows = await query<Record<string, unknown>>(
      `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json(rows.map(mapVariant));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "แก้ไข SKU ไม่สำเร็จ" });
  }
});

/** DELETE /api/products/:id/variants/bulk — ลบ SKU ที่เลือกพร้อมกัน */
router.delete("/:id/variants/bulk", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertOwnership(req.params.id, shopId, res))) return;

    const { variantIds } = req.body as { variantIds?: string[] };
    if (!Array.isArray(variantIds) || variantIds.length === 0) { res.status(400).json({ error: "variantIds ต้องมีอย่างน้อย 1 รายการ" }); return; }

    await query(
      `DELETE FROM product_variants WHERE product_id = $1 AND id = ANY($2::uuid[])`,
      [req.params.id, variantIds]
    );

    const rows = await query<Record<string, unknown>>(
      `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json(rows.map(mapVariant));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ลบ SKU ไม่สำเร็จ" });
  }
});

function mapVariant(row: Record<string, unknown>) {
  return {
    id: row.id,
    productId: row.product_id,
    sku: row.sku ?? null,
    color: row.color ?? null,
    size: row.size ?? null,
    pattern: row.pattern ?? null,
    length: row.length ?? null,
    material: row.material ?? null,
    price: Number(row.price),
    stock: Number(row.stock),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProduct(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en ?? null,
    description: row.description ?? null,
    descriptionEn: row.description_en ?? null,
    category: row.category,
    price: Number(row.price),
    priceUnit: row.price_unit,
    stock: Number(row.stock),
    images: Array.isArray(row.images) ? row.images : [],
    fabricType: row.fabric_type ?? null,
    hasGI: row.has_gi ?? false,
    lowStockThreshold: row.low_stock_threshold != null ? Number(row.low_stock_threshold) : undefined,
    hasVariants: row.has_variants ?? false,
    variantCount: row.variant_count != null ? Number(row.variant_count) : undefined,
    priceMin: row.price_min != null ? Number(row.price_min) : undefined,
    priceMax: row.price_max != null ? Number(row.price_max) : undefined,
    stockTotal: row.stock_total != null ? Number(row.stock_total) : undefined,
    shopId: row.shop_id,
    shopName: row.shop_name,
    province: row.province,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    createdAt: row.created_at,
  };
}

export default router;
