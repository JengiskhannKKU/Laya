import { Router, Request, Response } from "express";
import { uploadBase64AsWebP, BUCKETS, BucketName } from "../utils/imageUtils";
import { requireAuth } from "../middleware/auth";

const router = Router();

const ALLOWED_BUCKETS = new Set<BucketName>(Object.values(BUCKETS));

/**
 * POST /api/upload/image
 * body: {
 *   imageBase64: string   — base64 data URL หรือ raw base64
 *   bucket:      string   — ชื่อ bucket ปลายทาง (avatars | shop-images | product-images | ...)
 *   folder?:     string   — subfolder ใน bucket (optional)
 * }
 * returns: { url, width, height, sizeBytes }
 *
 * ใช้สำหรับทุก upload flow ยกเว้น /api/tryon/upload (ที่มี endpoint ตัวเอง)
 */
router.post("/image", requireAuth, async (req: Request, res: Response) => {
  try {
    const { imageBase64, bucket, folder } = req.body as {
      imageBase64?: string;
      bucket?: string;
      folder?: string;
    };

    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    if (!bucket || !ALLOWED_BUCKETS.has(bucket as BucketName)) {
      res.status(400).json({
        error: `bucket must be one of: ${[...ALLOWED_BUCKETS].join(", ")}`,
      });
      return;
    }

    const result = await uploadBase64AsWebP(
      imageBase64,
      bucket as BucketName,
      folder
    );

    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[upload/image] error:", err.message);
    res.status(500).json({ error: err.message ?? "Upload failed" });
  }
});

export default router;
