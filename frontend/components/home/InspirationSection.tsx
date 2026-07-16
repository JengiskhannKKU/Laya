"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function InspirationSection() {
  const { t } = useLanguage();
  return (
    <Box
      sx={{
        py: { xs: 4, md: 7.5 },
        pb: { xs: 8, md: 11 },
      }}
    >
      {/* หัวข้อสไตล์เดียวกับ section อื่นตาม mockup — OUR INSPIRATION ตัวพิมพ์ใหญ่ */}
      <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
        <Typography
          component="h2"
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 600,
            fontSize: { xs: "0.82rem", md: "0.95rem" },
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#13284B",
          }}
        >
          {t("home.inspiration.eyebrow")}
        </Typography>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        sx={{
          width: "100%",
          height: { xs: 320, md: 400 },
          borderRadius: { xs: "20px", md: "24px" },
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 24px 60px rgba(15,26,48,0.24)",
        }}
      >
        {/* Cinematic video background */}
        <Box
          component="video"
          src="/video1.mp4"
          autoPlay={true}
          muted={true}
          loop={true}
          playsInline={true}
          suppressHydrationWarning
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.6)",
          }}
        />

        {/* Content Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            p: { xs: 3, md: 6 },
            background:
              "linear-gradient(to top, rgba(15,26,48,0.92) 0%, rgba(15,26,48,0.2) 55%, transparent 80%)",
          }}
        >
          <Box sx={{ maxWidth: 640 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                mb: { xs: 1.5, md: 2 },
                opacity: 0.92,
              }}
            >
              <PlayCircleFilledRoundedIcon sx={{ color: "#D8BC82", fontSize: 28 }} />
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  color: "#FFFFFF",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                }}
              >
                {t("home.inspiration.tag")}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
                fontWeight: 700,
                fontSize: { xs: "1.6rem", md: "2.3rem" },
                color: "#FFFFFF",
                lineHeight: 1.25,
                mb: 1,
                textShadow: "0 2px 16px rgba(0,0,0,0.35)",
              }}
            >
              {t("home.inspiration.heading")}
            </Typography>

            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 300,
                fontSize: { xs: "0.88rem", md: "1.02rem" },
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.7,
                mb: { xs: 2.5, md: 3 },
              }}
            >
              {t("home.inspiration.body")}
            </Typography>

            <Link href="/community/heritage" style={{ textDecoration: "none" }}>
              <Button
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />}
                sx={{
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.45)",
                  backdropFilter: "blur(8px)",
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  borderRadius: "999px",
                  px: 3.25,
                  py: 1.1,
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "#C89A3D",
                    borderColor: "#C89A3D",
                    color: "#13284B",
                  },
                }}
              >
                {t("home.inspiration.cta")}
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
