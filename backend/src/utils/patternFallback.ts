/**
 * ผลวิเคราะห์ผ้าสำรอง เมื่อยังไม่ได้ตั้งค่า AI vision key หรือเรียก LLM ไม่สำเร็จ
 * แทนที่จะยัดค่าปลอมคงที่ ("ผ้าไหม (Mock)"/"ลายดอกแก้ว" ทุกครั้งไม่ว่าอัปโหลดผ้าอะไร) — สุ่มลายผ้าจริงจาก
 * weave_patterns (77 จังหวัด, ข้อมูลจริงจากกรมส่งเสริมวัฒนธรรม) แล้วดึง type/technique จากคำที่มีอยู่จริง
 * ในชื่อลาย/บทความ ไม่เดาเอง — ฟิลด์ที่ดึงจากข้อความไม่ได้ (tone/thickness) จะตอบตรงๆ ว่าไม่ระบุ แทนการมั่ว
 */

import { query } from "../db";

export interface FabricAnalysisResult {
  type: string;
  technique: string;
  pattern: string;
  tone: string;
  thickness: string;
}

const TYPE_KEYWORDS = ["ผ้าไหม", "ผ้าฝ้าย", "ผ้าลินิน", "ผ้าขนสัตว์", "ผ้าใยสังเคราะห์"];
const TECHNIQUE_KEYWORDS = ["มัดหมี่", "ยกดอก", "ยกขิด", "ขิด", "จก", "บาติก", "ทอมือ", "แพรวา"];

function findKeyword(text: string, keywords: string[]): string | null {
  return keywords.find((k) => text.includes(k)) ?? null;
}

export async function getPatternFallback(): Promise<FabricAnalysisResult> {
  const rows = await query<{ name: string; description: string | null; story_weaving: string | null; origin_province: string }>(
    `SELECT name, description, story_weaving, origin_province
     FROM weave_patterns WHERE shop_id IS NULL AND is_active = true
     ORDER BY RANDOM() LIMIT 1`
  );

  if (!rows.length) {
    // ยังไม่มีลายระบบใน DB เลย (ยังไม่ได้ seed) — ตอบตรงๆ ว่าวิเคราะห์อัตโนมัติไม่ได้ แทนข้อมูลปลอม
    return { type: "ไม่ระบุ", technique: "ไม่ระบุ", pattern: "ไม่ระบุ — กรุณากรอกเอง", tone: "ไม่ระบุ", thickness: "ไม่ระบุ" };
  }

  const p = rows[0];
  const haystack = `${p.name} ${p.description ?? ""} ${p.story_weaving ?? ""}`;

  return {
    type: findKeyword(haystack, TYPE_KEYWORDS) ?? "ไม่ระบุ",
    technique: findKeyword(haystack, TECHNIQUE_KEYWORDS) ?? "ไม่ระบุ",
    pattern: p.name,
    tone: "ไม่ระบุ (โปรดดูจากภาพ)",
    thickness: "ไม่ระบุ (โปรดดูจากภาพ)",
  };
}
