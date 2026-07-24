"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SparklesIcon from "@mui/icons-material/AutoAwesomeRounded";
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

const STEP_ORDER = [
  "select_shop",
  "choose_shape",
  "upload",
  "ai_analysis",
  "customize_details",
  "select_occasion",
  "measurements",
  "virtual_try_on",
  "order_summary",
] as const;

/** 3 กลุ่มขั้นตอนหลักสำหรับ Chevron Step Bar (สไตล์รูป Reference ของผู้ใช้) */
const MACRO_STEPS = [
  { id: 1, label: "Step 1", title: "เลือกร้าน & ทรงชุด", targetStep: "select_shop" },
  { id: 2, label: "Step 2", title: "อัปโหลด & AI ลองชุด", targetStep: "upload" },
  { id: 3, label: "Step 3", title: "สรุปสั่งซื้อ", targetStep: "order_summary" },
];

export default function TailorStepper({
  currentStep,
  onStepClick,
}: {
  currentStep: string;
  onStepClick?: (step: string) => void;
}) {
  const { t } = useLanguage();
  const TAILOR_STEPS = t<string[]>("tailorFlow.stepLabels");
  const activeIdx = STEP_INDEX[currentStep] ?? 0;

  // คำนวณว่าสเต็ปปัจจุบันอยู่ใน Macro Phase ไหน (1, 2, หรือ 3)
  const currentMacroPhase = activeIdx <= 1 ? 1 : activeIdx <= 7 ? 2 : 3;

  return (
    <Box sx={{ py: { xs: 1.5, md: 2.5 }, px: { xs: 1, sm: 2 } }}>
      
      {/* ─── 1. Modern Chevron Arrow Stepper (สไตล์รูป Ref ของผู้ใช้) ─── */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          maxWidth: 680,
          mx: "auto",
          height: { xs: 44, md: 48 },
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(27,42,74,0.08)",
          bgcolor: "#FFFFFF",
          border: "1px solid #E6DAC8",
          p: "3px",
        }}
      >
        {MACRO_STEPS.map((macro, idx) => {
          const isActive = currentMacroPhase === macro.id;
          const isDone = currentMacroPhase > macro.id;
          const isFirst = idx === 0;
          const isLast = idx === MACRO_STEPS.length - 1;

          // โทนสี Chevron ตามสถานะ (Active = Navy, Done = Gold, Upcoming = Soft White/Gray)
          const bgColor = isActive
            ? NAVY
            : isDone
            ? GOLD
            : "#FAF6F0";

          const textColor = isActive || isDone ? "#FFFFFF" : "#6B7280";

          return (
            <Box
              key={macro.id}
              onClick={() => onStepClick?.(macro.targetStep)}
              sx={{
                flex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: bgColor,
                color: textColor,
                cursor: onStepClick ? "pointer" : "default",
                transition: "all 0.3s ease",
                // มุมลูกศรแหลมชี้ขวา Chevron Arrow Cutout สไตล์รูป Ref ของผู้ใช้
                clipPath: isLast
                  ? isFirst
                    ? "none"
                    : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 12px 50%)"
                  : isFirst
                  ? "polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)"
                  : "polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%, 12px 50%)",
                borderRadius: isFirst
                  ? "10px 0 0 10px"
                  : isLast
                  ? "0 10px 10px 0"
                  : "0",
                mr: isLast ? 0 : "-4px",
                zIndex: MACRO_STEPS.length - idx,
                px: { xs: 1, sm: 2 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                {isDone ? (
                  <CheckRoundedIcon sx={{ fontSize: { xs: 15, md: 17 }, color: "#FFFFFF" }} />
                ) : (
                  <Typography
                    sx={{
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: { xs: "0.82rem", md: "0.92rem" },
                      letterSpacing: "0.02em",
                    }}
                  >
                    {macro.label}
                  </Typography>
                )}

                {/* ชื่อกลุ่มขั้นตอน */}
                <Typography
                  sx={{
                    display: { xs: "none", sm: "inline-block" },
                    fontFamily: FONT,
                    fontWeight: isActive ? 600 : 400,
                    fontSize: { xs: "0.72rem", md: "0.78rem" },
                    opacity: isActive || isDone ? 0.95 : 0.75,
                    whiteSpace: "nowrap",
                  }}
                >
                  · {macro.title}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ─── 2. Sub-step detail status line ─── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mt: 1.5,
        }}
      >
        <SparklesIcon sx={{ fontSize: 14, color: GOLD }} />
        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: { xs: "0.78rem", md: "0.86rem" },
            fontWeight: 600,
            color: NAVY,
            textAlign: "center",
          }}
        >
          {t("tailorFlow.stepOfN")
            .replace("{n}", String(activeIdx + 1))
            .replace("{total}", String(TAILOR_STEPS.length))
            .replace("{label}", TAILOR_STEPS[activeIdx])}
        </Typography>
      </Box>

    </Box>
  );
}
