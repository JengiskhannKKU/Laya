import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";
import { generateImage } from "../utils/kieImage";
import { buildPatternPrompt, aspectRatioToSize, type AdvancedSettings } from "../utils/patternPrompt";

const router = Router();

interface PatternRow {
  id: string;
  user_id: string;
  prompt: string;
  style: string;
  color_palette: string[];
  inspiration: string[];
  advanced_settings: AdvancedSettings;
  thumbnail_url: string | null;
  preview_image_url: string | null;
  full_image_url: string;
  is_favorite: boolean;
  is_mock: boolean;
  created_at: string;
}

function mapPattern(r: PatternRow) {
  return {
    id: r.id,
    ownerId: r.user_id,
    prompt: r.prompt,
    style: r.style,
    colorPalette: r.color_palette,
    references: r.inspiration,
    advancedSettings: r.advanced_settings,
    thumbnailUrl: r.thumbnail_url,
    previewImageUrl: r.preview_image_url,
    fullImageUrl: r.full_image_url,
    isFavorite: r.is_favorite,
    isMock: r.is_mock,
    createdAt: r.created_at,
  };
}

/**
 * POST /api/patterns/generate
 * body: { colors: string[], colorNames?: string[], references: string[], style: string, advanced?: AdvancedSettings,
 *         referenceImageUrl?: string }
 * Guided wizard ไม่ให้ผู้ใช้พิมพ์ prompt เอง — ประกอบ prompt ฝั่ง server จากตัวเลือกที่ผู้ใช้กด แล้วยิงเข้า kie.ai จริง
 *
 * referenceImageUrl: URL รูปเทมเพลตลายจริงที่ผู้ใช้เลือกไว้ (ดู PatternGallery.tsx ฝั่ง frontend) — ถ้ามี จะยิงเป็น
 * image-to-image ให้ AI recolor เทมเพลตเดิมเท่านั้น (ไม่เปลี่ยนลาย) แทนการ generate ลายใหม่จากชื่อแบบเดิม
 * (เดิมส่งแค่ "references" เป็นชื่อลาย ไม่เคยส่งรูปจริงไปเลย ทำให้ AI ต้องเดาลายเอาเองจากชื่อ ไม่ตรงกับเทมเพลตจริง)
 */
router.post("/generate", requireAuth, async (req: Request, res: Response) => {
  const started = Date.now();
  try {
    const { colors, colorNames, references, style, advanced, weaveType, region, dyeType, moodText, referenceImageUrl } = req.body as {
      colors?: string[];
      colorNames?: string[];
      references?: string[];
      style?: string;
      advanced?: AdvancedSettings;
      weaveType?: string;
      region?: string;
      dyeType?: "natural" | "chemical";
      moodText?: string;
      referenceImageUrl?: string;
    };

    if (!colors?.length) { res.status(400).json({ error: "ต้องเลือกโทนสีอย่างน้อย 1 สี" }); return; }
    if (!style) { res.status(400).json({ error: "ต้องเลือกสไตล์ลาย" }); return; }

    const prompt = buildPatternPrompt({
      colors, colorNames, references: references ?? [], style, advanced, weaveType, region, dyeType, moodText,
      hasReferenceImage: !!referenceImageUrl,
    });
    const size = aspectRatioToSize(advanced?.aspectRatio);

    const { imageUrl, mock } = await generateImage({
      prompt,
      size,
      filesUrl: referenceImageUrl ? [referenceImageUrl] : undefined,
    });

    // ฟิลด์เฉพาะโฟลว์ /custom เก็บรวมไว้ใน advanced_settings JSONB (ไม่ต้อง migrate schema เพิ่ม)
    const storedSettings = { ...(advanced ?? {}), weaveType, region, dyeType, moodText };

    const rows = await query<PatternRow>(
      `INSERT INTO generated_patterns
         (user_id, prompt, style, color_palette, inspiration, advanced_settings, full_image_url, is_mock)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8)
       RETURNING *`,
      [
        req.user!.userId,
        prompt,
        style,
        JSON.stringify(colors),
        JSON.stringify(references ?? []),
        JSON.stringify(storedSettings),
        imageUrl,
        mock ?? false,
      ]
    );

    res.status(201).json({ success: true, generationTimeMs: Date.now() - started, ...mapPattern(rows[0]) });
  } catch (err: any) {
    console.error("[patterns/generate] error:", err.message);
    res.status(500).json({ error: err.message ?? "สร้างลายผ้าไม่สำเร็จ" });
  }
});

/** GET /api/patterns/mine — ลายผ้าที่ผู้ใช้เคยสร้างไว้ (ใหม่สุดก่อน) */
router.get("/mine", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<PatternRow>(
      "SELECT * FROM generated_patterns WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100",
      [req.user!.userId]
    );
    res.json(rows.map(mapPattern));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "โหลดรายการลายผ้าไม่สำเร็จ" });
  }
});

/** POST /api/patterns/:id/favorite — สลับสถานะรายการโปรด (เฉพาะเจ้าของ) */
router.post("/:id/favorite", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<PatternRow>(
      `UPDATE generated_patterns SET is_favorite = NOT is_favorite
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user!.userId]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบลายผ้านี้" }); return; }
    res.json(mapPattern(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "อัปเดตรายการโปรดไม่สำเร็จ" });
  }
});

/** DELETE /api/patterns/:id — ลบลายผ้าของตัวเอง */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await query("DELETE FROM generated_patterns WHERE id = $1 AND user_id = $2", [req.params.id, req.user!.userId]);
    res.json({ id: req.params.id, deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ลบลายผ้าไม่สำเร็จ" });
  }
});

export default router;
