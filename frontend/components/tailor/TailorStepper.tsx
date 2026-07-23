"use client";

/**
 * Stepper แนวนอนสำหรับ flow สั่งตัดด้วยผ้าที่มีอยู่แล้ว (8 ขั้น) — ดีไซน์เดียวกับ checkout
 * (วงกลมเลขลำดับ → เช็คถูกสีทองเมื่อผ่านแล้ว, เส้นเชื่อมระหว่างจุด, active = navy)
 *
 * บนมือถือซ่อน label รายจุด (label เต็มยาวเกินความกว้างจอ ทำให้ขั้นแรกๆ เลื่อนหลุดจอไปเอง
 * เจอบั๊กจริงตอนทดสอบ) เหลือแค่วงกลม+เส้น ให้พอดีความกว้างจอเสมอ แล้วโชว์ "ขั้นตอนที่ X จาก N"
 * เป็นบรรทัดเดียวด้านล่างแทน — เดสก์ท็อปมีที่พอถึงโชว์ label เต็มได้
 */

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

const STEP_INDEX: Record<string, number> = {
  select_shop: 0,
  choose_shape: 1,
  upload: 2,
  ai_analysis: 3,
  customize_details: 4,
  select_occasion: 5,
  measurements: 6,
  virtual_try_on: 7,
  order_summary: 8,
};

// เรียงลำดับ key เดียวกับ STEP_INDEX/tailorFlow.stepLabels เป๊ะ — ใช้แปล index ที่คลิกกลับเป็นชื่อ step
// ให้ TailorWithFabricFlow.tsx เรียก goNext ตรงๆ ได้ (คลิกจุดไหนในสเต็ปเปอร์ ไปหน้านั้นได้ทันที ไม่ต้องกด "ถัดไป" ไล่ทีละขั้น)
const STEP_ORDER = [
  "select_shop", "choose_shape", "upload", "ai_analysis", "customize_details",
  "select_occasion", "measurements", "virtual_try_on", "order_summary",
] as const;

export default function TailorStepper({ currentStep, onStepClick }: { currentStep: string; onStepClick?: (step: string) => void }) {
  const { t } = useLanguage();
  const TAILOR_STEPS = t<string[]>("tailorFlow.stepLabels");
  const activeIdx = STEP_INDEX[currentStep] ?? 0;

  return (
    <Box sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 1, md: 0 } }}>
        {TAILOR_STEPS.map((label, idx) => {
          const done = activeIdx > idx;
          const active = activeIdx === idx;
          const handleClick = () => onStepClick?.(STEP_ORDER[idx]);
          return (
            <Box key={label} sx={{ display: "flex", alignItems: "center", flex: idx < TAILOR_STEPS.length - 1 ? { xs: 1, md: "0 0 auto" } : "0 0 auto" }}>
              <Box onClick={handleClick} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, minWidth: { xs: "auto", md: 64 }, cursor: onStepClick ? "pointer" : "default" }}>
                <Box sx={{
                  width: { xs: 24, md: 36 }, height: { xs: 24, md: 36 }, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: done ? GOLD : active ? NAVY : "#FFFFFF",
                  border: done || active ? "none" : "1.5px solid #E5DFD6",
                  color: done || active ? "#FFFFFF" : "#9CA3AF",
                  fontWeight: 700, fontSize: { xs: "0.6rem", md: "0.8rem" }, fontFamily: FONT,
                  boxShadow: active ? "0 3px 10px rgba(27,42,74,0.28)" : done ? "0 3px 10px rgba(197,165,90,0.3)" : "none",
                  transition: "all 0.3s",
                  "&:hover": onStepClick ? { boxShadow: "0 3px 10px rgba(27,42,74,0.35)", transform: "scale(1.08)" } : undefined,
                }}>
                  {done ? <CheckRoundedIcon sx={{ fontSize: { xs: 12, md: 17 } }} /> : idx + 1}
                </Box>
                <Typography sx={{
                  display: { xs: "none", md: "block" },
                  fontFamily: FONT, fontSize: "0.7rem", textAlign: "center", lineHeight: 1.15,
                  fontWeight: active ? 700 : 400, color: active ? NAVY : done ? GOLD : "#9CA3AF", whiteSpace: "nowrap",
                }}>
                  {label}
                </Typography>
              </Box>
              {idx < TAILOR_STEPS.length - 1 && (
                <Box sx={{ flex: { xs: 1, md: "0 0 auto" }, width: { md: 32 }, height: 2, borderRadius: 1, bgcolor: activeIdx > idx ? GOLD : "#E5DFD6", mx: { xs: 0.75, md: 1 }, mb: { xs: 0, md: 2.5 }, transition: "all 0.3s" }} />
              )}
            </Box>
          );
        })}
      </Box>
      <Typography sx={{
        display: { xs: "block", md: "none" },
        fontFamily: FONT, fontSize: "0.78rem", fontWeight: 600, color: NAVY, textAlign: "center", mt: 1.25,
      }}>
        {t("tailorFlow.stepOfN")
          .replace("{n}", String(activeIdx + 1))
          .replace("{total}", String(TAILOR_STEPS.length))
          .replace("{label}", TAILOR_STEPS[activeIdx])}
      </Typography>
    </Box>
  );
}
