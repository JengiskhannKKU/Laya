import { Router, Request, Response } from "express";
import { uploadBase64AsWebP, uploadRawFile, BUCKETS, BucketName } from "../utils/imageUtils";
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
    res.status(500).json({ error: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จ กรุณาติดต่อฝ่ายบริการลูกค้า" });
  }
});

/**
 * POST /api/upload/file — อัปโหลดไฟล์แนบ (ไม่ใช่รูป เช่น PDF) สำหรับแชท — ไม่ผ่าน sharp/WebP
 * body: { fileBase64: string, filename: string, contentType: string, folder?: string }
 * returns: { url, sizeBytes, filename }
 * bucket ตายตัวเป็น chat-attachments เท่านั้น (ไม่ให้ client เลือก bucket เอง)
 */
router.post("/file", requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileBase64, filename, contentType, folder } = req.body as {
      fileBase64?: string; filename?: string; contentType?: string; folder?: string;
    };

    if (!fileBase64) { res.status(400).json({ error: "fileBase64 is required" }); return; }
    if (!filename) { res.status(400).json({ error: "filename is required" }); return; }
    if (!contentType) { res.status(400).json({ error: "contentType is required" }); return; }

    const match = fileBase64.match(/^data:[^;]+;base64,(.+)$/);
    const buffer = Buffer.from(match ? match[1] : fileBase64, "base64");
    if (buffer.length > 20 * 1024 * 1024) { res.status(400).json({ error: "ไฟล์ขนาดใหญ่เกินไป (สูงสุด 20MB)" }); return; }

    const result = await uploadRawFile(buffer, BUCKETS.chatAttachments, folder, contentType, filename);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[upload/file] error:", err.message);
    res.status(500).json({ error: "อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จ กรุณาติดต่อฝ่ายบริการลูกค้า" });
  }
});

export default router;
