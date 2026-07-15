import { Router, Request, Response } from "express";
import { query } from "../db";

const router = Router();

/** GET /api/templates — all templates available in system */
router.get("/", async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT id, name, category, base_price, front_asset_url, back_asset_url, description
       FROM templates WHERE is_active = true
       ORDER BY category, name`
    );
    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      basePrice: Number(r.base_price),
      frontAssetUrl: r.front_asset_url,
      backAssetUrl: r.back_asset_url,
      description: r.description,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

/**
 * GET /api/templates/shop/:shopId — templates available for a specific shop
 * Public endpoint: any shop can view which templates any other shop supports
 */
router.get("/shop/:shopId", async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT t.id, t.name, t.category, t.base_price, t.front_asset_url, t.back_asset_url, t.description
       FROM templates t
       JOIN shop_templates st ON st.template_id = t.id
       WHERE st.shop_id = $1 AND st.is_available = true AND t.is_active = true
       ORDER BY t.category, t.name`,
      [req.params.shopId]
    );
    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      basePrice: Number(r.base_price),
      frontAssetUrl: r.front_asset_url,
      backAssetUrl: r.back_asset_url,
      description: r.description,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shop templates" });
  }
});

export default router;
