"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SectionHeaderProps {
  /** แสดงเฉพาะ variant="editorial" — ป้ายทองตัวพิมพ์ใหญ่เหนือหัวข้อ */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  actionLabel?: string;
  /** "editorial" = eyebrow ทอง + หัวข้อ serif ใหญ่ (mockup หน้าแรกล่าสุด) —
   * default คงสไตล์เดิม (uppercase tracking) ไว้ให้ผู้ใช้ component นี้หน้าอื่นไม่กระทบ */
  variant?: "default" | "editorial";
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  actionLabel,
  variant = "default",
}: SectionHeaderProps) {
  const { t } = useLanguage();
  const resolvedActionLabel = actionLabel ?? t("common.seeAll");
  const isEditorial = variant === "editorial";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 2,
        mb: { xs: 2, md: 2.5 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {isEditorial && eyebrow && (
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: "0.66rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#C5A55A",
              lineHeight: 1.4,
              mb: 0.5,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        {/* editorial: หัวข้อ serif navy ใหญ่ตาม mockup / default: uppercase tracking เดิม */}
        <Typography
          component="h2"
          sx={
            isEditorial
              ? {
                  fontFamily:
                    'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
                  fontWeight: 700,
                  fontSize: { xs: "1.45rem", md: "1.8rem" },
                  color: "#13284B",
                  lineHeight: 1.2,
                }
              : {
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 600,
                  fontSize: { xs: "0.82rem", md: "0.95rem" },
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#13284B",
                  lineHeight: 1.4,
                }
          }
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: { xs: "0.78rem", md: isEditorial ? "0.85rem" : "0.9rem" },
              color: isEditorial ? "#A89F94" : "#7A7468",
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {href && (
        <Link href={href} style={{ textDecoration: "none", flexShrink: 0 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              position: "relative",
              pb: "3px",
              color: "#1B2A4A",
              "&:hover .laya-seeall-underline": { width: "100%" },
              "&:hover .laya-seeall-text": { color: "#C5A55A" },
            }}
          >
            <Typography
              className="laya-seeall-text"
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: { xs: "0.72rem", md: "0.8rem" },
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: "#1B2A4A",
                whiteSpace: "nowrap",
                transition: "color 0.25s ease",
              }}
            >
              {resolvedActionLabel}
            </Typography>
            <Box
              className="laya-seeall-underline"
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: 0,
                height: "1px",
                bgcolor: "#C5A55A",
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Link>
      )}
    </Box>
  );
}
