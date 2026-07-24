"use client";

import { useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // เลื่อนตำแหน่ง Chevron Step ที่กำลังทำงานให้อยู่ตรงกลางหน้าจอมือถืออัตโนมัติ
  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeIdx]);

  return (
    <Box sx={{ py: { xs: 1.5, md: 2.5 }, px: { xs: 1, sm: 2 } }}>
      
      {/* ─── 1. Modern 9-Chevron Arrow Stepper Bar (สไตล์รูป Ref ของผู้ใช้ ครบทั้ง 9 ขั้นตอน) ─── */}
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: 960,
          mx: "auto",
          height: { xs: 44, md: 48 },
          borderRadius: "14px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          boxShadow: "0 4px 16px rgba(27,42,74,0.08)",
          bgcolor: "#FFFFFF",
          border: "1px solid #E6DAC8",
          p: "3px",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
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

          const textColor = isActive || isDone ? "#FFFFFF" : "#5C6470";

          return (
            <Box
              key={stepKey}
              ref={isActive ? activeItemRef : null}
              onClick={() => onStepClick?.(stepKey)}
              sx={{
                flex: { xs: "0 0 auto", md: 1 },
                minWidth: { xs: 110, sm: 120, md: "auto" },
                height: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: bgColor,
                color: textColor,
                cursor: onStepClick ? "pointer" : "default",
                transition: "all 0.3s ease",
                scrollSnapAlign: "center",
                // มุมลูกศรแหลมชี้ขวา Chevron Arrow Cutout สไตล์รูป Ref ของผู้ใช้
                clipPath: isLast
                  ? isFirst
                    ? "none"
                    : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 10px 50%)"
                  : isFirst
                  ? "polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%)"
                  : "polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)",
                borderRadius: isFirst
                  ? "10px 0 0 10px"
                  : isLast
                  ? "0 10px 10px 0"
                  : "0",
                mr: isLast ? 0 : "-3px",
                zIndex: TAILOR_STEPS.length - idx,
                px: { xs: 1.25, sm: 1.75 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, whiteSpace: "nowrap" }}>
                {isDone ? (
                  <CheckRoundedIcon sx={{ fontSize: { xs: 14, md: 16 }, color: "#FFFFFF" }} />
                ) : (
                  <Typography
                    sx={{
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: { xs: "0.78rem", md: "0.85rem" },
                      letterSpacing: "0.01em",
                    }}
                  >
                    Step {idx + 1}
                  </Typography>
                )}

                {/* ชื่อขั้นตอนแบบย่อบนจอใหญ่ */}
                <Typography
                  sx={{
                    display: { xs: "none", lg: "inline-block" },
                    fontFamily: FONT,
                    fontWeight: isActive ? 600 : 400,
                    fontSize: "0.72rem",
                    opacity: isActive || isDone ? 0.95 : 0.75,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 70,
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
          mt: 1.5,
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
