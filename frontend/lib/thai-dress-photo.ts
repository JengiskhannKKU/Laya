/**
 * Photo model — ชุดไทยร่วมสมัย (thai-contemporary) เท่านั้น
 * แทนที่ live SVG render ด้วยภาพถ่ายจริงเมื่อ pattern/สี ตรงกับที่มีภาพเตรียมไว้
 * (ดู public/studio/thai-dress/image-prompts.md สำหรับรายการภาพที่ต้อง generate)
 *
 * ถ้าไม่ตรง (สีที่ไม่ได้ถ่ายไว้ หรือปรับชิ้นส่วนออกจากทรงเดิม) ต้อง fallback ไป SVG renderer
 * เดิมเสมอ — ห้ามโชว์ภาพที่ไม่ตรงกับตัวเลือกจริงของผู้ใช้
 */

import type { GarmentDesign } from '@/components/design-clothes/builder/types';

export const THAI_DRESS_TEMPLATE_ID = 'thai-contemporary';

/** เฉพาะ 4 สีที่ generate ภาพไว้ (ดู image-prompts.md) — สีอื่นไม่มีภาพ ต้อง fallback */
const COLOR_SLUGS: Record<string, string> = {
  '#C9A227': 'gold',
  '#8B1A2D': 'red',
  '#1B2A4A': 'navy',
  '#F5E6D3': 'cream',
};

/** ชิ้นส่วนดั้งเดิมของทรง thai-contemporary — ใช้เช็คว่าผู้ใช้ยังไม่ได้ปรับชิ้นส่วนออกจากทรงในภาพ */
const DEFAULT_PARTS: Record<string, string> = {
  body: 'blouse',
  collar: 'mandarin',
  sleeves: 'long',
  pocket: 'none',
  buttons: 'wood',
  decoration: 'trim',
};

function partsMatchDefault(parts: Record<string, string>): boolean {
  return Object.entries(DEFAULT_PARTS).every(([key, val]) => (parts[key] ?? 'none') === val);
}

/** true ถ้าทรง (ชิ้นส่วน) ยังตรงกับที่ถ่ายภาพไว้ — ใช้แยกเหตุผลตอน fallback (ทรงตรงแต่สีไม่มีภาพ vs ปรับทรงเอง) */
export function hasThaiDressPhotoShape(design: GarmentDesign): boolean {
  return design.category === 'top'
    && partsMatchDefault(design.parts)
    && Object.keys(design.partPattern).length === 0
    && Object.keys(design.partColor).length === 0;
}

/**
 * คืน URL ภาพถ่ายจริงถ้า design ตรงกับทรง+สีที่มีภาพเตรียมไว้พอดี ไม่งั้นคืน null
 * (null = ต้อง fallback ไปพรีวิว SVG เดิม)
 */
export function getThaiDressPhotoUrl(design: GarmentDesign): string | null {
  if (design.category !== 'top') return null;
  if (!partsMatchDefault(design.parts)) return null;
  if (Object.keys(design.partPattern).length > 0 || Object.keys(design.partColor).length > 0) return null;

  const colorSlug = COLOR_SLUGS[design.color.toUpperCase()];
  if (!colorSlug) return null;

  return `/studio/thai-dress/thai-contemporary_${design.pattern}_${colorSlug}.webp`;
}
