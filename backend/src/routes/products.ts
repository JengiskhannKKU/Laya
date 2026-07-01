import { Router, Request, Response } from "express";
import { query } from "../db";

const router = Router();

/**
 * GET /api/products
 * Maps shop_fabrics → Product shape the frontend expects.
 * Query params: ?patternTag=มัดหมี่  ?province=เชียงใหม่  ?search=  ?shopId=
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { patternTag, province, search, shopId } = req.query;
    const conditions: string[] = ["f.is_active = true", "s.status = 'active'"];
    const params: unknown[] = [];
    let idx = 1;

    if (patternTag) {
      conditions.push(`f.pattern_tag = $${idx++}`);
      params.push(patternTag);
    }
    if (province) {
      conditions.push(`s.province = $${idx++}`);
      params.push(province);
    }
    if (shopId) {
      conditions.push(`f.shop_id = $${idx++}`);
      params.push(shopId);
    }
    if (search) {
      conditions.push(
        `(f.name ILIKE $${idx} OR f.pattern_tag ILIKE $${idx} OR s.province ILIKE $${idx} OR s.name ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx++;
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const sql = `
      SELECT
        f.id,
        f.name,
        f.description,
        f.pattern_tag,
        f.color_name,
        f.color_hex,
        f.width_cm,
        f.price_per_meter  AS price,
        f.stock_meters     AS stock,
        f.shop_id,
        s.name             AS shop_name,
        s.province,
        s.rating,
        s.review_count,
        COALESCE(
          json_agg(fi.image_url ORDER BY fi.sort_order) FILTER (WHERE fi.id IS NOT NULL),
          '[]'::json
        ) AS images
      FROM shop_fabrics f
      JOIN shops s ON s.id = f.shop_id
      LEFT JOIN shop_fabric_images fi ON fi.fabric_id = f.id
      ${where}
      GROUP BY f.id, s.name, s.province, s.rating, s.review_count
      ORDER BY s.rating DESC, f.created_at DESC
    `;

    const rows = await query<Record<string, unknown>>(sql, params);
    res.json(rows.map(mapFabric));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/** GET /api/products/:id */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT
         f.id, f.name, f.description, f.pattern_tag, f.color_name, f.color_hex,
         f.width_cm, f.price_per_meter AS price, f.stock_meters AS stock, f.shop_id,
         s.name AS shop_name, s.province, s.rating, s.review_count,
         COALESCE(
           json_agg(fi.image_url ORDER BY fi.sort_order) FILTER (WHERE fi.id IS NOT NULL),
           '[]'::json
         ) AS images
       FROM shop_fabrics f
       JOIN shops s ON s.id = f.shop_id
       LEFT JOIN shop_fabric_images fi ON fi.fabric_id = f.id
       WHERE f.id = $1
       GROUP BY f.id, s.name, s.province, s.rating, s.review_count`,
      [req.params.id]
    );

    if (!rows.length) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(mapFabric(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

function mapFabric(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    patternTag: row.pattern_tag ?? null,
    colorName: row.color_name ?? null,
    colorHex: row.color_hex ?? null,
    widthCm: row.width_cm ? Number(row.width_cm) : null,
    price: Number(row.price),
    priceUnit: "เมตร",
    stock: Number(row.stock),
    shopId: row.shop_id,
    shopName: row.shop_name,
    province: row.province,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    images: Array.isArray(row.images) ? row.images : [],
  };
}

export default router;
