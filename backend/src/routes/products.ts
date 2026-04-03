import { Router, Request, Response } from "express";
import { query } from "../db";
import { Product } from "../types";

const router = Router();

// GET /api/products
// Supports: ?fabricType=ผ้าไหม  ?hasGI=true  ?search=กินรี  ?province=ลำพูน
router.get("/", async (req: Request, res: Response) => {
  try {
    const { fabricType, hasGI, search, province } = req.query;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (fabricType) {
      conditions.push(`fabric_type = $${idx++}`);
      params.push(fabricType);
    }
    if (hasGI !== undefined) {
      conditions.push(`has_gi = $${idx++}`);
      params.push(hasGI === "true");
    }
    if (province) {
      conditions.push(`province = $${idx++}`);
      params.push(province);
    }
    if (search) {
      conditions.push(
        `(name ILIKE $${idx} OR community ILIKE $${idx} OR province ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT id, name, community, province, price, price_unit,
             rating, review_count, images, has_gi, production_time,
             available_length, fabric_type, story, weaver_name,
             certificate_id, passport
      FROM products
      ${where}
      ORDER BY rating DESC
    `;

    const rows = await query<Record<string, unknown>>(sql, params);
    res.json(rows.map(mapProduct));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT id, name, community, province, price, price_unit,
              rating, review_count, images, has_gi, production_time,
              available_length, fabric_type, story, weaver_name,
              certificate_id, passport
       FROM products WHERE id = $1`,
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

/** Map snake_case DB row to camelCase Product */
function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    community: row.community as string,
    province: row.province as string,
    price: Number(row.price),
    priceUnit: row.price_unit as string,
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    images: row.images as string[],
    hasGI: row.has_gi as boolean,
    productionTime: row.production_time as string,
    availableLength: Number(row.available_length),
    fabricType: row.fabric_type as string,
    story: row.story as string,
    weaverName: row.weaver_name as string,
    certificateId: row.certificate_id as string,
    passport: row.passport as Product["passport"],
  };
}

export default router;
