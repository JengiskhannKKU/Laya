"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/** ลายไทยเรขาคณิตแบบ minimal (ขนมเปียกปูน/ลายตาราง) — สีทองจางมากบนพื้น navy */
const THAI_LATTICE = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><g fill="none" stroke="#C9A86A" stroke-width="0.7" opacity="0.1"><path d="M28 2L54 28L28 54L2 28Z"/><path d="M28 14L42 28L28 42L14 28Z"/></g></svg>',
)}")`;

/**
 * Royal Vision Quote — แถบ navy เต็มความกว้างจอ (full-bleed ออกนอก container กลาง)
 * คำคมกลางจอ อัญประกาศทอง + ลายไทยจางๆ ทำหน้าที่เป็น visual break ของหน้า
 */
export default function MissionSection() {
  const { t } = useLanguage();
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      sx={{
        py: { xs: 4, md: 7.5 },
        // ดันออกเต็มความกว้าง viewport — MobileLayout ครอบด้วย container กลาง 1440 + padding
        mx: "calc(50% - 50vw)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg, #13284B 0%, #0F1A30 100%)",
          px: { xs: 3.5, md: 12 },
          py: { xs: 7, md: 12 },
          textAlign: "center",
        }}
      >
        {/* ลายไทยเรขาคณิต — จางมากพอเป็น texture ไม่แย่งสายตา */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: THAI_LATTICE,
            backgroundSize: "56px 56px",
            pointerEvents: "none",
          }}
        />

        {/* Gold hairline บน-ล่างของแถบ */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,168,106,0.5) 50%, transparent 100%)",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 780, mx: "auto" }}>
          {/* Serif quotation mark ornament */}
          <Typography
            aria-hidden
            sx={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontSize: { xs: "3.5rem", md: "4.5rem" },
              lineHeight: 0.6,
              color: "#C89A3D",
              mb: { xs: 2, md: 3 },
              userSelect: "none",
            }}
          >
            &ldquo;
          </Typography>

          <Typography
            component="blockquote"
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 400,
              fontSize: { xs: "1.1rem", md: "1.6rem" },
              color: "#FFFFFF",
              lineHeight: 2,
              letterSpacing: "0.01em",
              m: 0,
            }}
          >
            {t("home.mission.quote")}
          </Typography>

          {/* Gold hairline */}
          <Box
            sx={{
              width: 72,
              height: "1px",
              background:
                "linear-gradient(to right, transparent, #C89A3D, transparent)",
              mx: "auto",
              mt: { xs: 3, md: 4 },
            }}
          />

          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontStyle: "italic",
              fontSize: { xs: "0.85rem", md: "1rem" },
              color: "rgba(212,186,122,0.75)",
              letterSpacing: "0.14em",
              mt: 2,
            }}
          >
            LAYA — Every Pattern Tells a Story
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
