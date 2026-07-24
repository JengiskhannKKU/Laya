import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";
import { uploadBase64AsWebP, BUCKETS } from "../utils/imageUtils";

const router = Router();

/**
 * POST /api/fabric-uploads
 * เก็บรูปผ้าที่ลูกค้าอัปโหลดเองลง Supabase Storage + แถวใน fabric_uploads —
 * orders.chk_fabric_source บังคับว่า fabric_source='own' ต้องมี fabric_upload_id เสมอ
 * (เดิม bucket "fabric-uploads" กับตาราง fabric_uploads มีอยู่แล้วแต่ไม่มี endpoint ใดสร้างแถวเลย)
 * body: { imageBase64 } — data URL จาก UploadFabricStep.tsx (orderState.fabricImage)
 *   หรือ { imageUrl } — กรณีเป็น URL/asset path อยู่แล้ว (เช่น placeholder จากปุ่มข้ามขั้นตอนทดสอบ)
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { imageBase64, imageUrl, name } = req.body as { imageBase64?: string; imageUrl?: string; name?: string };
    if (!imageBase64 && !imageUrl) {
      res.status(400).json({ error: "imageBase64 or imageUrl is required" });
      return;
    }

    const url = imageBase64
      ? (await uploadBase64AsWebP(imageBase64, BUCKETS.fabricUploads, req.user!.userId)).url
      : imageUrl!;

    const rows = await query<{ id: string }>(
      `INSERT INTO fabric_uploads (user_id, image_url, name) VALUES ($1, $2, $3) RETURNING id`,
      [req.user!.userId, url, name ?? null]
    );

    res.status(201).json({ id: rows[0].id, imageUrl: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "อัปโหลดรูปผ้าไม่สำเร็จ" });
  }
});

export default router;
