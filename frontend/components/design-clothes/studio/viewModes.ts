/**
 * "มุมมองตัวอย่าง" ของสตูดิโอเดสก์ท็อป — 4 มุมมองที่ตรงกับข้อมูลจริงที่มี (ไม่ปั้นภาพหลอก)
 * ทุกฟังก์ชันเป็น pure: layers เข้า → layers ออก ผ่าน GarmentRenderer เดิมได้เลย ไม่แตะ business logic
 */

import type { RenderLayer } from '../builder/types';

/** ชิ้นส่วนที่มองไม่เห็นจากด้านหลัง (คอ/กระเป๋า/กระดุม/ตกแต่ง อยู่ด้านหน้าเสมอ) */
const FRONT_ONLY_PARTS = new Set(['collar', 'pocket', 'buttons', 'decoration']);

/**
 * มุมมองด้านหลัง — เอาชิ้นส่วนที่เห็นเฉพาะด้านหน้าออก แล้วพลิกชิ้นที่เหลือ (ลำตัว/แขน)
 * เป็นการลดทอนที่จงใจและมีเอกสารกำกับ ("ชิ้นส่วนฝั่งหลังที่เหลือ พลิกซ้าย-ขวา") ไม่ใช่ภาพหลังปลอม
 */
export function buildBackLayers(layers: RenderLayer[]): RenderLayer[] {
  return layers
    .filter(l => !FRONT_ONLY_PARTS.has(l.partKey))
    .map(l => ({
      ...l,
      id: `${l.id}-back`,
      mirror: !l.mirror,
    }));
}

/** มุมมองแพทเทิร์น/ร่าง — ล้างสี/ลายผ้าออกเหลือแค่เส้นทรงขาว (technical flat) */
export function toSketchLayers(layers: RenderLayer[]): RenderLayer[] {
  return layers.map(l => ({
    ...l,
    id: `${l.id}-sketch`,
    color: '#ffffff',
    patternImage: null,
  }));
}
