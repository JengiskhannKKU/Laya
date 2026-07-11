/**
 * Prompt Builder — ประกอบ prompt ภาษาอังกฤษสำหรับ AI image generation จากตัวเลือกของผู้ใช้ใน
 * Guided Fabric Pattern Generator (/gen-silk) ผู้ใช้ไม่เห็น prompt นี้เลย เห็นแค่ตัวเลือกที่กดในแต่ละขั้น
 */

export interface AdvancedSettings {
  density?: "low" | "medium" | "high";
  complexity?: "simple" | "medium" | "detailed";
  repeat?: "seamless" | "half-drop" | "brick" | "mirror";
  fabricType?: "cotton" | "silk" | "linen" | "polyester" | "satin";
  texture?: "flat" | "woven" | "printed" | "embroidery";
  mood?: string[];
  resolution?: 1024 | 2048 | 4096;
  aspectRatio?: "square" | "portrait" | "landscape";
}

export interface PatternPromptInput {
  colors: string[];
  colorNames?: string[];
  references: string[];
  style: string;
  advanced?: AdvancedSettings;
  /** ฟิลด์เฉพาะโฟลว์ /custom (Guided Wizard สั่งทอ) — ไม่บังคับ ใช้เมื่อมีจริงเท่านั้น */
  weaveType?: string;
  region?: string;
  dyeType?: "natural" | "chemical";
  moodText?: string;
}

const DENSITY_TEXT: Record<NonNullable<AdvancedSettings["density"]>, string> = {
  low: "sparse, generously spaced motifs",
  medium: "balanced, evenly distributed motifs",
  high: "densely packed, all-over motifs",
};

const COMPLEXITY_TEXT: Record<NonNullable<AdvancedSettings["complexity"]>, string> = {
  simple: "clean and simple linework",
  medium: "moderate intricacy",
  detailed: "highly intricate, richly detailed",
};

const REPEAT_TEXT: Record<NonNullable<AdvancedSettings["repeat"]>, string> = {
  seamless: "seamless full-drop repeat",
  "half-drop": "half-drop repeat",
  brick: "brick repeat",
  mirror: "mirrored repeat",
};

/** kie.ai gpt4o-image รองรับแค่สามอัตราส่วนนี้ */
export function aspectRatioToSize(ratio?: AdvancedSettings["aspectRatio"]): "1:1" | "3:2" | "2:3" {
  if (ratio === "landscape") return "3:2";
  if (ratio === "portrait") return "2:3";
  return "1:1";
}

/** คำสำคัญที่ต้องมีทุกครั้งเพื่อให้เอาไปพิมพ์ผ้าได้จริง */
const MANDATORY_KEYWORDS =
  "Seamless pattern, tileable, repeating textile, high detail, premium quality, print-ready quality. No text. No watermark. No logo.";

export function buildPatternPrompt(input: PatternPromptInput): string {
  const colorDesc = input.colors
    .map((hex, i) => (input.colorNames?.[i] ? `${input.colorNames[i]} (${hex})` : hex))
    .join(", ");
  const advanced = input.advanced ?? {};

  const lines = [
    "Create a premium seamless textile pattern for fabric printing.",
    `Style: ${input.style}.`,
    input.references.length ? `Inspired by: ${input.references.join(", ")}.` : "",
    colorDesc ? `Primary colors: ${colorDesc}.` : "",
    input.weaveType ? `Weaving technique: ${input.weaveType}.` : "",
    input.region ? `Regional style: ${input.region}.` : "",
    input.dyeType ? `Dyeing technique: ${input.dyeType === "natural" ? "natural plant-based dye, subtle organic color variation" : "chemical dye, precise saturated color"}.` : "",
    input.moodText ? `Occasion / mood: ${input.moodText}.` : "",
    advanced.fabricType ? `Fabric: ${advanced.fabricType}.` : "",
    advanced.texture ? `Texture: ${advanced.texture}.` : "",
    advanced.mood?.length ? `Mood: ${advanced.mood.join(", ")}.` : "",
    advanced.density ? `Pattern density: ${DENSITY_TEXT[advanced.density]}.` : "",
    advanced.complexity ? `Detail level: ${COMPLEXITY_TEXT[advanced.complexity]}.` : "",
    advanced.repeat ? `Repeat style: ${REPEAT_TEXT[advanced.repeat]}.` : "",
    advanced.resolution ? `Render at ultra-high resolution, approximately ${advanced.resolution}px, crisp fine detail.` : "",
    MANDATORY_KEYWORDS,
  ].filter(Boolean);

  return lines.join(" ");
}
