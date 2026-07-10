import { Router, Request, Response } from "express";
import { generateImage } from "../utils/kieImage";

const router = Router();

/**
 * POST /api/nanobanana/generate
 * Body: { prompt: string }
 *
 * สร้างลายผ้า/รูปจาก text prompt (text-to-image เท่านั้น) — ใช้ helper กลางที่ src/utils/kieImage.ts
 * (สำหรับ image-to-image ที่ต้องใส่รูปอ้างอิงจริง ดู routes/tryon.ts)
 */
router.post("/generate", async (req: Request, res: Response) => {
  const { prompt } = req.body as { prompt?: string };

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    const result = await generateImage({ prompt, size: "1:1" });
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[nanobanana] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
