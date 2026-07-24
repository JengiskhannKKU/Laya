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

  return (
    <Box sx={{ py: { xs: 1.25, md: 2.5 }, px: { xs: 0.5, sm: 2 } }}>
      
      {/* ─── 1. Modern 9-Chevron Arrow Stepper Bar (แสดงผลครบทั้ง 9 ช่องบนหน้าจอ) ─── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: 980,
          mx: "auto",
          height: { xs: 38, sm: 44, md: 48 },
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(27,42,74,0.08)",
          bgcolor: "#FFFFFF",
          border: "1px solid #E6DAC8",
          p: "2px",
        }}
      >
        {TAILOR_STEPS.map((label, idx) => {
          const isActive = activeIdx === idx;
          const isDone = activeIdx > idx;
          const isFirst = idx === 0;
          const isLast = idx === TAILOR_STEPS.length - 1;
          const stepKey = STEP_ORDER[idx];

          // โทนสี Chevron ตามสถานะ (Active = Navy, Done = Gold, Upcoming = Soft White)
          const bgColor = isActive
            ? NAVY
            : isDone
            ? GOLD
            : "#FAF6F0";

          const textColor = isActive || isDone ? "#FFFFFF" : "#6B7280";

          return (
            <Box
              key={stepKey}
              onClick={() => onStepClick?.(stepKey)}
              sx={{
                flex: 1,
                minWidth: 0, // กระจายตัวครบทั้ง 9 ช่องตามความกว้างจอโดยไม่ดันล้น
                height: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: bgColor,
                color: textColor,
                cursor: onStepClick ? "pointer" : "default",
                transition: "all 0.25s ease",
                // มุมลูกศรแหลมชี้ขวา Chevron Arrow Cutout สไตล์รูป Ref ของผู้ใช้
                clipPath: isLast
                  ? isFirst
                    ? "none"
                    : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 6px 50%)"
                  : isFirst
                  ? "polygon(0% 0%, calc(100% - 6px) 0%, 100% 50%, calc(100% - 6px) 100%, 0% 100%)"
                  : "polygon(0% 0%, calc(100% - 6px) 0%, 100% 50%, calc(100% - 6px) 100%, 0% 100%, 6px 50%)",
                borderRadius: isFirst
                  ? "9px 0 0 9px"
                  : isLast
                  ? "0 9px 9px 0"
                  : "0",
                mr: isLast ? 0 : "-2px",
                zIndex: TAILOR_STEPS.length - idx,
                px: { xs: 0.2, sm: 0.5, md: 1 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3, width: "100%" }}>
                {isDone ? (
                  <CheckRoundedIcon sx={{ fontSize: { xs: 13, sm: 15, md: 17 }, color: "#FFFFFF" }} />
                ) : (
                  <Typography
                    sx={{
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: { xs: "0.68rem", sm: "0.78rem", md: "0.88rem" },
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}
                  >
                    {/* บนจอมือถือเล็ก แสดงตัวเลข 1, 2, 3... 9 ชัดเจนครบ 9 ช่อง */}
                    <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                      {idx + 1}
                    </Box>
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Step {idx + 1}
                    </Box>
                  </Typography>
                )}

                {/* ชื่อขั้นตอนบนหน้าจอใหญ่ */}
                <Typography
                  sx={{
                    display: { xs: "none", md: "inline-block" },
                    fontFamily: FONT,
                    fontWeight: isActive ? 600 : 400,
                    fontSize: "0.72rem",
                    opacity: isActive || isDone ? 0.95 : 0.75,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: { md: 60, lg: 85 },
                  }}
                >
                  · {label}
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
          mt: 1.25,
        }}
      >
        <SparklesIcon sx={{ fontSize: 14, color: GOLD }} />
        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: { xs: "0.82rem", md: "0.9rem" },
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
