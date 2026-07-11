/**
 * ค่าคงที่ UI สำหรับ flow ออกแบบลายผ้า/สั่งทอ (ไม่ใช่ mock ข้อมูลธุรกิจ — ใช้เป็นตัวเลือกในฟอร์มจริง)
 */

export interface CustomPatternData {
  selectedPatterns?: string[];
  colors?: string[];
  weaveType?: string;
  region?: string;
  requiresGI?: boolean;
  complexity?: number;
  mood?: string;
  promptText?: string;
  patternStyle?: string;
  generatedImageUrl?: string;   // result from Nano Banana 2 API
  isMock?: boolean;             // true if Nano Banana ran out of credits
  dyeType?: 'natural' | 'chemical';
  /** id ของแถวใน generated_patterns หลัง generate สำเร็จ — ใช้ผูกกับ weaving_requests ตอนสั่งทอ */
  patternId?: string;
}

/** สีด้ายที่ช่างทอในระบบมีพร้อมทอจริง (ใช้ทั้งใน GuidedWizard และตอนสร้าง prompt/ผูกกับคำขอสั่งทอ) */
export const WEAVER_COLORS: { name: string; hex: string }[] = [
  { name: "แดงเลือด", hex: "#8B0000" },
  { name: "แดงสด", hex: "#D32F2F" },
  { name: "เหลืองทอง", hex: "#D4AF37" },
  { name: "น้ำตาลเข้ม", hex: "#654321" },
  { name: "น้ำเงินเข้ม", hex: "#003366" },
  { name: "เขียวป่า", hex: "#1A5239" },
  { name: "ม่วงเข้ม", hex: "#4B0082" },
  { name: "กรมท่า", hex: "#000080" },
  { name: "ดำ", hex: "#1A1A1A" },
  { name: "ครีม", hex: "#F5F5DC" },
  { name: "ส้มอ่อน", hex: "#DDA77B" },
  { name: "ฟ้า", hex: "#5Cacee" },
  { name: "เขียวตอง", hex: "#a4c639" },
  { name: "ชมพู", hex: "#ffb6c1" },
  { name: "เทา", hex: "#a9a9a9" },
  { name: "ขาว", hex: "#f0f0f0" },
  { name: "ม่วงอ่อน", hex: "#dda0dd" },
  { name: "บานเย็น", hex: "#ff1493" },
];
