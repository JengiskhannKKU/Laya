import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

/** ต้องตรงกับ REGIONS ใน frontend/lib/fabric-origins.ts (แหล่งข้อมูลภูมิภาคชุดเดียวของระบบ) */
const REGIONS = ["north", "northeast", "central", "east", "west", "south"] as const;

interface PatternPayload {
  name?: string;
  description?: string;
  originProvince?: string;
  region?: string;
  community?: string;
  storyHistory?: string;
  storyWeaving?: string;
  thumbnailUrl?: string;
  patternImages?: string[];
  weavingProcessImages?: string[];
}

function validatePayload(body: PatternPayload, res: Response): boolean {
  if (!body.name || !body.name.trim()) { res.status(400).json({ error: "กรุณากรอกชื่อลายผ้า" }); return false; }
  if (body.region && !REGIONS.includes(body.region as (typeof REGIONS)[number])) {
    res.status(400).json({ error: `region ต้องเป็นหนึ่งใน ${REGIONS.join(", ")}` });
    return false;
  }
  return true;
}

const PATTERN_SELECT = `SELECT p.*, s.name AS shop_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', cv.id, 'colorName', cv.color_name, 'colorHex', cv.color_hex,
                    'previewUrl', cv.preview_url, 'isNaturalDye', cv.is_natural_dye
                  )
                ) FILTER (WHERE cv.id IS NOT NULL), '[]'
              ) AS color_variants
       FROM weave_patterns p
       LEFT JOIN shops s ON s.id = p.shop_id
       LEFT JOIN weave_color_variants cv ON cv.pattern_id = p.id`;

/** Postgres "relation does not exist" — migration 018 (shop_pattern_capabilities) ยังไม่ apply */
const isMissingTable = (err: unknown) => (err as { code?: string })?.code === "42P01";

/**
 * GET /api/weave-patterns — ลายทอทั้งหมดที่เปิดใช้งาน (ระบบ + ร้านค้า) พร้อมโทนสี
 * ?shopId= กรองเฉพาะลายของชุมชนนั้น = ลายที่ตัวเองสร้าง (shop_id ตรง) + ลายระบบที่ประกาศว่าทอได้
 * (shop_pattern_capabilities) — ถ้า migration 018 ยังไม่ apply จะ fallback เหลือแค่ลายของตัวเอง
 * แทนที่จะ 500 ทั้ง endpoint (กันหน้า CommunityDetailView พังก่อน migration รัน)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { shopId } = req.query as { shopId?: string };
    let rows: Record<string, unknown>[];

    if (shopId) {
      try {
        rows = await query<Record<string, unknown>>(
          `${PATTERN_SELECT}
           WHERE p.is_active = TRUE
             AND (p.shop_id = $1 OR p.id IN (SELECT pattern_id FROM shop_pattern_capabilities WHERE shop_id = $1))
           GROUP BY p.id, s.name
           ORDER BY p.name`,
          [shopId]
        );
      } catch (err) {
        if (!isMissingTable(err)) throw err;
        rows = await query<Record<string, unknown>>(
          `${PATTERN_SELECT} WHERE p.is_active = TRUE AND p.shop_id = $1 GROUP BY p.id, s.name ORDER BY p.name`,
          [shopId]
        );
      }
    } else {
      rows = await query<Record<string, unknown>>(
        `${PATTERN_SELECT} WHERE p.is_active = TRUE GROUP BY p.id, s.name ORDER BY p.name`
      );
    }
    res.json(rows.map(mapPattern));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weave patterns" });
  }
});

/**
 * GET /api/weave-patterns/mine — ลายผ้าของร้านตัวเอง (รวมที่ปิดใช้งานอยู่)
 * ต้องอยู่ก่อน "/:id" ไม่งั้น express จะจับ "mine" เป็น :id
 */
router.get("/mine", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า" }); return; }

    const rows = await query<Record<string, unknown>>(
      `SELECT p.* FROM weave_patterns p WHERE p.shop_id = $1 ORDER BY p.created_at DESC`,
      [shopId]
    );
    res.json(rows.map(mapPattern));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your patterns" });
  }
});

/**
 * GET /api/weave-patterns/capabilities/mine — ลายระบบทั้งหมด + สถานะว่าร้านตัวเองทอได้ไหม
 * ต้องอยู่ก่อน "/:id" ไม่งั้น express จะจับ "capabilities" เป็น :id (ตามแบบ "/mine" ด้านบน)
 */
router.get("/capabilities/mine", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า" }); return; }

    const rows = await query<Record<string, unknown>>(
      `SELECT p.id, p.name, p.thumbnail_url, p.region, p.origin_province,
              (spc.id IS NOT NULL) AS is_capable
       FROM weave_patterns p
       LEFT JOIN shop_pattern_capabilities spc ON spc.pattern_id = p.id AND spc.shop_id = $1
       WHERE p.shop_id IS NULL AND p.is_active = TRUE
       ORDER BY p.name`,
      [shopId]
    );
    res.json(rows.map((r) => ({
      id: r.id, name: r.name, thumbnailUrl: r.thumbnail_url,
      region: r.region, originProvince: r.origin_province, isCapable: r.is_capable === true,
    })));
  } catch (err) {
    if (isMissingTable(err)) {
      // migration 018 ยังไม่ apply — ยังไม่มีร้านไหนประกาศความสามารถได้เลย
      try {
        const rows = await query<Record<string, unknown>>(
          `SELECT id, name, thumbnail_url, region, origin_province FROM weave_patterns WHERE shop_id IS NULL AND is_active = TRUE ORDER BY name`
        );
        res.json(rows.map((r) => ({
          id: r.id, name: r.name, thumbnailUrl: r.thumbnail_url,
          region: r.region, originProvince: r.origin_province, isCapable: false,
        })));
        return;
      } catch (fallbackErr) {
        console.error(fallbackErr);
      }
    }
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pattern capabilities" });
  }
});

/** POST /api/weave-patterns/capabilities/mine — เพิ่มลายระบบที่ร้านทอได้ (upsert, ไม่ลบรายการเดิม) */
router.post("/capabilities/mine", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า" }); return; }

    const { patternIds } = req.body as { patternIds?: string[] };
    if (!Array.isArray(patternIds) || !patternIds.length) { res.status(400).json({ error: "patternIds ต้องเป็น array ที่ไม่ว่าง" }); return; }

    // เฉพาะลายระบบ (shop_id IS NULL) เท่านั้นที่ประกาศความสามารถได้ — ตรวจที่ชั้น application
    const valid = await query<{ id: string }>(
      `SELECT id FROM weave_patterns WHERE id = ANY($1::uuid[]) AND shop_id IS NULL AND is_active = TRUE`,
      [patternIds]
    );
    if (valid.length !== patternIds.length) { res.status(400).json({ error: "มีลายผ้าที่ไม่ใช่ลายระบบ หรือไม่พบ" }); return; }

    for (const pid of patternIds) {
      await query(
        `INSERT INTO shop_pattern_capabilities (shop_id, pattern_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [shopId, pid]
      );
    }
    res.json({ success: true, count: patternIds.length });
  } catch (err) {
    if (isMissingTable(err)) { res.status(503).json({ error: "ฟีเจอร์นี้ยังไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง" }); return; }
    console.error(err);
    res.status(500).json({ error: "บันทึกความสามารถทอผ้าไม่สำเร็จ" });
  }
});

/** DELETE /api/weave-patterns/capabilities/mine/:patternId — ถอนความสามารถทอลายระบบนี้ */
router.delete("/capabilities/mine/:patternId", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า" }); return; }

    await query(
      `DELETE FROM shop_pattern_capabilities WHERE shop_id = $1 AND pattern_id = $2`,
      [shopId, req.params.patternId]
    );
    res.json({ success: true });
  } catch (err) {
    if (isMissingTable(err)) { res.status(503).json({ error: "ฟีเจอร์นี้ยังไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง" }); return; }
    console.error(err);
    res.status(500).json({ error: "ถอนความสามารถทอผ้าไม่สำเร็จ" });
  }
});

/**
 * GET /api/weave-patterns/:id/producers — ชุมชน/ร้านที่ทอลายนี้ได้
 * ลายที่มีเจ้าของ (shop_id ตั้งไว้) → มีผู้ผลิตแค่เจ้าของรายเดียว
 * ลายระบบ (shop_id NULL) → ผู้ผลิต = ร้านทั้งหมดที่ประกาศความสามารถไว้ใน shop_pattern_capabilities
 */
router.get("/:id/producers", async (req: Request, res: Response) => {
  try {
    const patternRows = await query<{ shop_id: string | null }>(
      "SELECT shop_id FROM weave_patterns WHERE id = $1 AND is_active = TRUE",
      [req.params.id]
    );
    if (!patternRows.length) { res.status(404).json({ error: "ไม่พบลายผ้า" }); return; }
    const ownerShopId = patternRows[0].shop_id;

    let rows: Record<string, unknown>[];
    if (ownerShopId) {
      rows = await query<Record<string, unknown>>(
        `SELECT id, name, province, profile_image_url, rating, review_count, lead_time_days
         FROM shops WHERE id = $1 AND status = 'approved' AND is_open = true`,
        [ownerShopId]
      );
    } else {
      try {
        rows = await query<Record<string, unknown>>(
          `SELECT s.id, s.name, s.province, s.profile_image_url, s.rating, s.review_count, s.lead_time_days
           FROM shop_pattern_capabilities spc
           JOIN shops s ON s.id = spc.shop_id
           WHERE spc.pattern_id = $1 AND s.status = 'approved' AND s.is_open = true
           ORDER BY s.rating DESC, s.review_count DESC`,
          [req.params.id]
        );
      } catch (err) {
        if (!isMissingTable(err)) throw err;
        rows = []; // migration 018 ยังไม่ apply — ยังไม่มีร้านไหนประกาศว่าทอลายระบบนี้ได้
      }
    }

    res.json({
      patternId: req.params.id,
      patternOwnerShopId: ownerShopId,
      producers: rows.map((r) => ({
        id: r.id, name: r.name, province: r.province,
        profileImageUrl: r.profile_image_url, rating: Number(r.rating ?? 0),
        reviewCount: Number(r.review_count ?? 0), leadTimeDays: r.lead_time_days ?? null,
        isCustomPatternOwner: !!ownerShopId,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch producers" });
  }
});

/** GET /api/weave-patterns/:id */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT p.*, s.name AS shop_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', cv.id, 'colorName', cv.color_name, 'colorHex', cv.color_hex,
                    'previewUrl', cv.preview_url, 'isNaturalDye', cv.is_natural_dye
                  )
                ) FILTER (WHERE cv.id IS NOT NULL), '[]'
              ) AS color_variants
       FROM weave_patterns p
       LEFT JOIN shops s ON s.id = p.shop_id
       LEFT JOIN weave_color_variants cv ON cv.pattern_id = p.id
       WHERE p.id = $1
       GROUP BY p.id, s.name`,
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบลายผ้า" }); return; }
    res.json(mapPattern(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pattern" });
  }
});

/** ตรวจว่าลายผ้านี้เป็นของร้านผู้เรียกจริง — ลายระบบ (shop_id เป็น null) แก้ไข/ลบไม่ได้ */
async function assertPatternOwnership(patternId: string, shopId: string | undefined, res: Response): Promise<boolean> {
  if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า" }); return false; }
  const rows = await query<{ shop_id: string | null }>("SELECT shop_id FROM weave_patterns WHERE id = $1", [patternId]);
  if (!rows.length) { res.status(404).json({ error: "ไม่พบลายผ้า" }); return false; }
  if (rows[0].shop_id !== shopId) { res.status(403).json({ error: "Forbidden" }); return false; }
  return true;
}

/** POST /api/weave-patterns — ร้านค้าสร้างลายผ้าใหม่ */
router.post("/", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!shopId) { res.status(403).json({ error: "บัญชีนี้ยังไม่มีร้านค้า — สมัครร้านค้าก่อนเพิ่มลายผ้า" }); return; }

    const body = req.body as PatternPayload;
    if (!validatePayload(body, res)) return;

    const images = Array.isArray(body.patternImages) ? body.patternImages.filter(Boolean) : [];
    const rows = await query<Record<string, unknown>>(
      `INSERT INTO weave_patterns
         (shop_id, name, description, origin_province, region, community, story_history, story_weaving,
          thumbnail_url, pattern_images, weaving_process_images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        shopId, body.name!.trim(), body.description?.trim() || null, body.originProvince || null,
        body.region || null, body.community?.trim() || null, body.storyHistory?.trim() || null,
        body.storyWeaving?.trim() || null, body.thumbnailUrl || images[0] || null,
        images, Array.isArray(body.weavingProcessImages) ? body.weavingProcessImages.filter(Boolean) : [],
      ]
    );
    res.status(201).json(mapPattern(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เพิ่มลายผ้าไม่สำเร็จ" });
  }
});

/** PUT /api/weave-patterns/:id — แก้ไขลายผ้า (เฉพาะร้านเจ้าของ) */
router.put("/:id", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertPatternOwnership(req.params.id, shopId, res))) return;

    const body = req.body as PatternPayload;
    if (!validatePayload(body, res)) return;

    const images = Array.isArray(body.patternImages) ? body.patternImages.filter(Boolean) : [];
    const rows = await query<Record<string, unknown>>(
      `UPDATE weave_patterns SET
         name = $1, description = $2, origin_province = $3, region = $4, community = $5,
         story_history = $6, story_weaving = $7, thumbnail_url = $8,
         pattern_images = $9, weaving_process_images = $10, updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        body.name!.trim(), body.description?.trim() || null, body.originProvince || null,
        body.region || null, body.community?.trim() || null, body.storyHistory?.trim() || null,
        body.storyWeaving?.trim() || null, body.thumbnailUrl || images[0] || null,
        images, Array.isArray(body.weavingProcessImages) ? body.weavingProcessImages.filter(Boolean) : [],
        req.params.id,
      ]
    );
    res.json(mapPattern(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "แก้ไขลายผ้าไม่สำเร็จ" });
  }
});

/** PATCH /api/weave-patterns/:id/status — เปิด/ปิดการแสดงผล */
router.patch("/:id/status", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertPatternOwnership(req.params.id, shopId, res))) return;

    const { isActive } = req.body as { isActive?: boolean };
    if (typeof isActive !== "boolean") { res.status(400).json({ error: "isActive ต้องเป็น true/false" }); return; }

    await query("UPDATE weave_patterns SET is_active = $1 WHERE id = $2", [isActive, req.params.id]);
    res.json({ id: req.params.id, isActive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "อัปเดตสถานะไม่สำเร็จ" });
  }
});

/**
 * DELETE /api/weave-patterns/:id — ลบลายผ้า
 * ถ้าเคยมีออเดอร์สั่งทออ้างอิงอยู่ (FK constraint) จะซ่อนแทนการลบถาวร
 */
router.delete("/:id", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { shopId } = req.user!;
    if (!(await assertPatternOwnership(req.params.id, shopId, res))) return;

    try {
      await query("DELETE FROM weave_patterns WHERE id = $1", [req.params.id]);
      res.json({ id: req.params.id, deleted: true });
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "23503") {
        await query("UPDATE weave_patterns SET is_active = false WHERE id = $1", [req.params.id]);
        res.json({ id: req.params.id, deleted: false, hidden: true, message: "ลายผ้านี้เคยมีออเดอร์สั่งทอแล้ว จึงซ่อนแทนการลบถาวร" });
        return;
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ลบลายผ้าไม่สำเร็จ" });
  }
});

function mapPattern(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    originProvince: row.origin_province ?? null,
    region: row.region ?? null,
    community: row.community ?? null,
    storyHistory: row.story_history ?? null,
    storyWeaving: row.story_weaving ?? null,
    thumbnailUrl: row.thumbnail_url ?? null,
    patternImages: Array.isArray(row.pattern_images) ? row.pattern_images : [],
    weavingProcessImages: Array.isArray(row.weaving_process_images) ? row.weaving_process_images : [],
    isActive: row.is_active,
    shopId: row.shop_id ?? null,
    shopName: row.shop_name ?? null,
    colorVariants: row.color_variants ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? null,
  };
}

export default router;
