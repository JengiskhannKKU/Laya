import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { supabaseAdmin, supabaseAdminConfigured } from "../utils/supabaseAdmin";
import { generateImage } from "../utils/kieImage";

const router = Router();

const BUCKET = "tryon-uploads";
let bucketReady: Promise<void> | null = null;

/** สร้าง bucket แบบ public ครั้งแรกที่ใช้งาน (idempotent) — kie.ai ต้องการ URL รูปที่เข้าถึงได้จากอินเทอร์เน็ตจริง ไม่รับ base64 */
function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
      if (!data) {
        const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
          public: true,
          fileSizeLimit: "10MB",
        });
        // เผื่อสองรีเควสต์ชนกันสร้างซ้ำพร้อมกัน — ไม่ throw ถ้า error บอกว่ามีอยู่แล้ว
        if (error && !/already exists/i.test(error.message)) throw error;
      }
    })();
  }
  return bucketReady;
}

/**
 * POST /api/tryon/upload — body: { imageBase64 } → { url }
 * เก็บรูปจริงไว้ที่ Supabase Storage (public bucket) เพราะ kie.ai gpt4o-image ต้องการ URL
 * ที่เข้าถึงได้จากอินเทอร์เน็ตจริงเป็น image reference ไม่รับ base64/data URL ตรงๆ
 */
router.post("/upload", async (req: Request, res: Response) => {
  try {
    if (!supabaseAdminConfigured) {
      res.status(500).json({ error: "Supabase storage ยังไม่ได้ตั้งค่า (ต้องมี SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน .env)" });
      return;
    }
    const { imageBase64 } = req.body as { imageBase64?: string };
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    await ensureBucket();

    const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    const contentType = match?.[1] ?? "image/jpeg";
    const base64Data = match?.[2] ?? imageBase64;
    const ext = contentType.split("/")[1]?.replace("+xml", "") ?? "jpg";
    const buffer = Buffer.from(base64Data, "base64");
    const path = `${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType, upsert: false });
    if (uploadError) throw uploadError;

    const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    res.json({ url: pub.publicUrl });
  } catch (err: any) {
    console.error("[tryon/upload] error:", err.message);
    res.status(500).json({ error: err.message ?? "Upload failed" });
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
