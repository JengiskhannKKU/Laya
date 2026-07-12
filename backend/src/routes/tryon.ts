import { Router, Request, Response } from "express";
import { uploadBase64AsWebP, BUCKETS } from "../utils/imageUtils";
import { supabaseAdminConfigured } from "../utils/supabaseAdmin";
import { generateImage } from "../utils/kieImage";

const router = Router();

/**
 * POST /api/tryon/upload — body: { imageBase64 } → { url }
 * แปลงรูปเป็น WebP แล้วเก็บไว้ที่ Supabase Storage (public bucket "tryon-uploads")
 * เพราะ kie.ai gpt4o-image ต้องการ URL ที่เข้าถึงได้จากอินเทอร์เน็ต ไม่รับ base64 ตรงๆ
 */
router.post("/upload", async (req: Request, res: Response) => {
  try {
    if (!supabaseAdminConfigured) {
      console.error("[tryon/upload] Supabase storage not configured (missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)");
      res.status(500).json({ error: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จ กรุณาติดต่อฝ่ายบริการลูกค้า" });
      return;
    }
    const { imageBase64 } = req.body as { imageBase64?: string };
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    // แปลงเป็น WebP ก่อน upload (sharp resize + compress)
    const result = await uploadBase64AsWebP(imageBase64, BUCKETS.tryonUploads);
    res.json({ url: result.url });
  } catch (err: any) {
    console.error("[tryon/upload] error:", err.message);
    res.status(500).json({ error: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จ กรุณาติดต่อฝ่ายบริการลูกค้า" });
  }
});

type Perspective = "front" | "back" | "side";

const PERSPECTIVE_DESC: Record<Perspective, string> = {
  front: "front-facing, looking directly at the camera, full body visible head to toe",
  back: "from behind, back view, full body visible head to toe",
  side: "from the side, profile / side view, full body visible head to toe",
};

/**
 * POST /api/tryon/generate
 * body: { bodyPhotoUrl, fabricImageUrl?, perspective, analysisResult?, occasion? }
 * ให้ AI (kie.ai gpt4o-image, image-to-image) ใส่ชุดจากผ้าอ้างอิงลงบนรูปคนจริงตามมุมที่ระบุ
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { bodyPhotoUrl, fabricImageUrl, perspective, analysisResult, occasion } = req.body as {
      bodyPhotoUrl?: string;
      fabricImageUrl?: string;
      perspective?: Perspective;
      analysisResult?: { type?: string; technique?: string; pattern?: string; tone?: string };
      occasion?: string;
    };

    if (!bodyPhotoUrl) {
      res.status(400).json({ error: "bodyPhotoUrl is required" });
      return;
    }
    if (!perspective || !PERSPECTIVE_DESC[perspective]) {
      res.status(400).json({ error: "perspective must be one of: front, back, side" });
      return;
    }

    const fabricDesc = analysisResult
      ? `${analysisResult.type ?? "ผ้าไทย"} ลาย${analysisResult.pattern ?? "ทอมือ"} โทนสี${analysisResult.tone ?? ""} เทคนิค${analysisResult.technique ?? ""}`.trim()
      : "the Thai fabric shown in the reference image";

    const prompt = [
      "Using the first reference image as the exact person — preserve their face, hair, skin tone, and body proportions exactly, do not change their identity —",
      fabricImageUrl ? "and the second reference image as the fabric texture and color reference," : "",
      `generate a photorealistic full-body fashion photograph of this person wearing an elegant tailored Thai-style outfit made from ${fabricDesc}`,
      occasion ? `, appropriate for the occasion: ${occasion}` : "",
      `. Camera angle: ${PERSPECTIVE_DESC[perspective]}. Studio lighting, professional fashion photography, plain neutral background, natural standing pose.`,
    ].filter(Boolean).join(" ");

    const filesUrl = [bodyPhotoUrl, fabricImageUrl].filter(Boolean) as string[];

    const result = await generateImage({ prompt, filesUrl, size: "2:3" });
    res.json({ success: true, perspective, ...result });
  } catch (err: any) {
    console.error("[tryon/generate] error:", err.message);
    res.status(500).json({ error: err.message ?? "Generation failed" });
  }
});

export default router;
