import sharp from "sharp";
import path from "path";
import { randomUUID } from "crypto";
import { supabaseAdmin, supabaseAdminConfigured } from "./supabaseAdmin";

/**
 * Supabase Storage buckets ที่ใช้ในโปรเจค
 * แต่ละ bucket เป็น public bucket — URL เข้าถึงได้โดยตรงไม่ต้อง signed URL
 */
export const BUCKETS = {
  avatars:       "avatars",          // รูป avatar ผู้ใช้
  shopImages:    "shop-images",      // รูปร้านค้า (profile + cover)
  productImages: "product-images",   // รูปสินค้า
  fabricUploads: "fabric-uploads",   // รูปผ้าที่ลูกค้า/ร้านค้าอัปโหลด
  postImages:    "post-images",      // รูปโพสต์ชุมชน
  tryonUploads:  "tryon-uploads",    // รูปสำหรับ Virtual Try-On
  patternImages: "pattern-images",   // รูปลายผ้า + รูปกระบวนการทอ
  chatAttachments: "chat-attachments", // ไฟล์/รูปที่แนบในแชท
  paymentSlips:  "payment-slips",     // สลิปการโอนเงิน (สำหรับตรวจสอบผ่าน EasySlip)
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/** ขนาด output สูงสุด (px) แต่ละ bucket */
const BUCKET_MAX_SIZE: Record<BucketName, number> = {
  "avatars":         800,
  "shop-images":     1600,
  "product-images":  2000,
  "fabric-uploads":  2000,
  "post-images":     1800,
  "tryon-uploads":   2000,
  "pattern-images":  2000,
  "chat-attachments": 2000,
  "payment-slips":   2000,
};

/** คุณภาพ WebP แต่ละ bucket (0–100) */
const BUCKET_QUALITY: Record<BucketName, number> = {
  "avatars":         82,
  "shop-images":     85,
  "product-images":  88,
  "fabric-uploads":  88,
  "post-images":     85,
  "tryon-uploads":   90,
  "pattern-images":  88,
  "chat-attachments": 88,
  "payment-slips":   90,
};

/**
 * แปลง image buffer (ทุกฟอร์แมต) → WebP แล้ว upload ขึ้น Supabase Storage
 *
 * @param inputBuffer - raw image buffer (PNG / JPG / WEBP / GIF / TIFF ฯลฯ)
 * @param bucket      - ชื่อ bucket ปลายทาง
 * @param folder      - subfolder ภายใน bucket (ถ้าไม่ระบุ จะใส่ root)
 * @returns { url, width, height, sizeBytes }
 */
export async function uploadImageAsWebP(
  inputBuffer: Buffer,
  bucket: BucketName,
  folder?: string
): Promise<{ url: string; width: number; height: number; sizeBytes: number }> {
  if (!supabaseAdminConfigured) {
    throw new Error("Supabase storage ยังไม่ได้ตั้งค่า (ต้องมี SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน .env)");
  }

  const maxSize = BUCKET_MAX_SIZE[bucket] ?? 2000;
  const quality = BUCKET_QUALITY[bucket] ?? 85;

  // แปลงเป็น WebP ด้วย sharp (resize ถ้าใหญ่กว่า maxSize, คงอัตราส่วน)
  const sharpInstance = sharp(inputBuffer)
    .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 4 });

  const { data: outputBuffer, info } = await sharpInstance.toBuffer({ resolveWithObject: true });

  await ensureBucket(bucket);

  const filename = `${randomUUID()}.webp`;
  const path = folder ? `${folder.replace(/\/$/, "")}/${filename}` : filename;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, outputBuffer, {
      contentType: "image/webp",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  return {
    url: pub.publicUrl,
    width: info.width ?? 0,
    height: info.height ?? 0,
    sizeBytes: outputBuffer.length,
  };
}

/**
 * แปลง base64 data URL (หรือ raw base64) → WebP แล้ว upload
 * Convenience wrapper สำหรับ frontend ที่ส่ง base64 มา
 */
export async function uploadBase64AsWebP(
  imageBase64: string,
  bucket: BucketName,
  folder?: string
): Promise<{ url: string; width: number; height: number; sizeBytes: number }> {
  // รองรับ "data:image/xxx;base64,..." และ raw base64
  const match = imageBase64.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  const base64Data = match ? match[1] : imageBase64;
  const buffer = Buffer.from(base64Data, "base64");
  return uploadImageAsWebP(buffer, bucket, folder);
}

/**
 * อัปโหลดไฟล์ดิบ (ไม่ผ่าน sharp/WebP) — ใช้กับไฟล์ที่ไม่ใช่รูป เช่น ไฟล์แนบในแชท (PDF ฯลฯ)
 * @param inputBuffer - raw file buffer
 * @param bucket      - ชื่อ bucket ปลายทาง
 * @param folder      - subfolder ภายใน bucket
 * @param contentType - MIME type ของไฟล์ต้นฉบับ
 * @param filename    - ชื่อไฟล์ต้นฉบับ (ใช้ต่อท้าย path เพื่อคงนามสกุลไว้)
 */
export async function uploadRawFile(
  inputBuffer: Buffer,
  bucket: BucketName,
  folder: string | undefined,
  contentType: string,
  filename: string
): Promise<{ url: string; sizeBytes: number; filename: string }> {
  if (!supabaseAdminConfigured) {
    throw new Error("Supabase storage ยังไม่ได้ตั้งค่า (ต้องมี SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน .env)");
  }

  await ensureBucket(bucket);

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = folder ? `${folder.replace(/\/$/, "")}/${randomUUID()}-${safeName}` : `${randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, inputBuffer, { contentType, upsert: false });

  if (uploadError) throw uploadError;

  const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  return { url: pub.publicUrl, sizeBytes: inputBuffer.length, filename };
}

/**
 * Template silhouette masks (solid navy fill, transparent bg) ที่ slice ไว้จาก shapes.png/Shapes-2.png
 * เก็บอยู่ฝั่ง frontend (frontend/public/assets/garments/tops/templates) — backend อ่านตรงจาก
 * disk ได้เลยเพราะ frontend/backend อยู่ใน monorepo เดียวกัน ไม่ต้องยิง HTTP
 */
const TEMPLATES_DIR = path.join(process.cwd(), "..", "frontend", "public", "assets", "garments", "tops", "templates");

/**
 * ผสมลายผ้าของลูกค้าเข้ากับทรงเทมเพลตที่เลือกไว้ (mask) เพื่อสร้าง "product image" จริง
 * ให้ FASHN virtual try-on ใช้เป็นชุดอ้างอิง — FASHN ต้องการรูปเสื้อผ้าจริง ไม่ใช่ line art เปล่าๆ
 *
 * @param fabricBuffer - buffer ของรูปลายผ้า (จะถูกปูซ้ำ/ครอบให้เต็มทรง)
 * @param templateId   - id เทมเพลต (shirt/blazer/jacket/dress/polo/crop/vest/kimono)
 * @param perspective  - front หรือ back — เลือก mask คนละไฟล์ (ไม่มี mask สำหรับ side ใช้ front แทน)
 * @returns buffer ของรูป PNG พื้นหลังขาว มีทรงเสื้อผ้าลายผ้าเต็มตัว พร้อมส่งให้ FASHN
 */
export async function compositeFabricOntoTemplate(
  fabricBuffer: Buffer,
  templateId: string,
  perspective: "front" | "back" | "side"
): Promise<Buffer> {
  const maskFile = perspective === "back" ? `${templateId}-back-mask.png` : `${templateId}-mask.png`;
  const maskPath = path.join(TEMPLATES_DIR, maskFile);

  const maskMeta = await sharp(maskPath).metadata();
  const rawWidth = maskMeta.width ?? 512;
  const rawHeight = maskMeta.height ?? 512;

  // มาสก์ต้นฉบับที่ slice ไว้มีขนาดเล็กมาก (~100-250px) — FASHN ต้องการรูปอย่างน้อย 128px ต่อด้าน
  // (เจอจริงตอนทดสอบ: "Product image dimensions must be at least 128px on each side") ต้อง upscale
  // ก่อนเสมอให้ด้านสั้นสุดอย่างน้อย ~1024px เพื่อความคมชัดของลายผ้าด้วย ไม่ใช่แค่ผ่านเกณฑ์ขั้นต่ำ
  const MIN_SIDE = 1024;
  const scale = MIN_SIDE / Math.min(rawWidth, rawHeight);
  const width = Math.round(rawWidth * scale);
  const height = Math.round(rawHeight * scale);

  const maskResizedBuffer = await sharp(maskPath)
    .resize(width, height, { fit: "fill" })
    .toBuffer();

  // ปูลายผ้าให้ครอบทรงเต็ม (cover) แล้ว clip ด้วย alpha ของ mask (dest-in)
  const fabricResized = await sharp(fabricBuffer)
    .resize(width, height, { fit: "cover" })
    .ensureAlpha()
    .toBuffer();

  const clipped = await sharp(fabricResized)
    .composite([{ input: maskResizedBuffer, blend: "dest-in" }])
    .png()
    .toBuffer();

  // วางลงพื้นขาว (FASHN ต้องการรูปทึบ ไม่ใช่พื้นหลังโปร่งใส)
  const finalBuffer = await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: clipped }])
    .png()
    .toBuffer();

  return finalBuffer;
}

// ── Bucket bootstrap (idempotent) ────────────────────────────────────────────

const _bucketReady = new Map<string, Promise<void>>();

async function ensureBucket(bucket: BucketName): Promise<void> {
  if (!_bucketReady.has(bucket)) {
    const p = (async () => {
      const { data } = await supabaseAdmin.storage.getBucket(bucket);
      if (!data) {
        const { error } = await supabaseAdmin.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: "20MB",
        });
        // ถ้า race condition สร้างซ้ำพร้อมกัน — ignore "already exists"
        if (error && !/already exists/i.test(error.message)) throw error;
      }
    })();
    _bucketReady.set(bucket, p);
  }
  return _bucketReady.get(bucket)!;
}
