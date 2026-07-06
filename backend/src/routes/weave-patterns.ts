import { Router, Request, Response } from "express";
import { query } from "../db";

const router = Router();

/** GET /api/weave-patterns — ลายทอทั้งหมดพร้อมโทนสี (US-401, US-402) */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT p.id, p.name, p.description, p.origin_province, p.thumbnail_url,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', cv.id,
                    'colorName', cv.color_name,
                    'colorHex', cv.color_hex,
                    'previewUrl', cv.preview_url,
                    'isNaturalDye', cv.is_natural_dye
                  )
                ) FILTER (WHERE cv.id IS NOT NULL), '[]'
              ) AS color_variants
       FROM weave_patterns p
       LEFT JOIN weave_color_variants cv ON cv.pattern_id = p.id
       WHERE p.is_active = TRUE
       GROUP BY p.id
       ORDER BY p.name`
    );

    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      originProvince: r.origin_province,
      thumbnailUrl: r.thumbnail_url,
      colorVariants: r.color_variants,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weave patterns" });
  }
});

export default router;
