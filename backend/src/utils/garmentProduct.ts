/**
 * สร้างรูป "ชุดจริง" จากทรงเทมเพลต + ลายผ้าของลูกค้า ด้วย AI (kie.ai image-to-image) —
 * ใช้แทนวิธี sharp mask compositing เดิม (ปูผ้าทับ silhouette ทึบ) เพราะขอบภาพเบลอ/หยาบมาก
 * เนื่องจาก mask ต้นฉบับมีขนาดเล็ก AI generate ให้ผลลัพธ์ที่เนียนและสมจริงกว่ามาก
 *
 * ใช้ทั้งใน /api/tryon/composite-preview (โชว์ตัวอย่างหลังอัปโหลดผ้า) และใน /api/tryon/generate
 * (สร้าง product image ป้อนให้ FASHN virtual try-on)
 */

import { generateImage } from "./kieImage";
import { getTemplateArtworkUrl, uploadImageAsWebP, BUCKETS } from "./imageUtils";

export interface GarmentProductImageResult {
  url: string;
  /** true = kie.ai หมดเครดิต ได้รูปตัวอย่างในเครื่องแทน (ไม่ใช่รูปจริงที่ generate) */
  mock?: boolean;
}

export async function generateGarmentProductImage(
  templateId: string,
  perspective: "front" | "back" | "side",
  fabricImageUrl: string
): Promise<GarmentProductImageResult> {
  const artworkUrl = await getTemplateArtworkUrl(templateId, perspective === "back" ? "back" : "front");

  const prompt = [
    "Using the first reference image as the exact garment shape, cut, silhouette, and construction details (neckline, sleeves, seams, proportions) — keep this exact outline unchanged,",
    "and the second reference image as the fabric pattern, weave, and color reference —",
    "generate a clean, photorealistic product photograph of this exact garment made entirely from that fabric.",
    "Still-life product shot (flat lay or on an invisible mannequin), no person wearing it, plain white studio background, soft even lighting, sharp focus, accurate fabric colors and pattern scale, high quality fashion e-commerce photography.",
  ].join(" ");

  const result = await generateImage({ prompt, filesUrl: [artworkUrl, fabricImageUrl], size: "2:3" });

  if (result.mock) return { url: result.imageUrl, mock: true };

  // โหลดรูปที่ kie.ai generate เสร็จแล้ว มาเก็บไว้ที่ Supabase Storage ของเราเอง (โดเมนที่ next/image
  // whitelist ไว้อยู่แล้ว) แทนที่จะฝากอ้างอิง URL ของ kie.ai ตรงๆ — กัน CDN โดเมนที่ยังไม่ได้ whitelist
  // และกันปัญหา URL หมดอายุ/ลบทิ้งฝั่ง kie.ai ในภายหลัง
  const res = await fetch(result.imageUrl, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`โหลดรูปผลลัพธ์จาก AI ไม่สำเร็จ: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const upload = await uploadImageAsWebP(buffer, BUCKETS.tryonUploads, "garment-products");
  return { url: upload.url };
}
