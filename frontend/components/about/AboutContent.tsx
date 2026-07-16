"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import MissionSection from "@/components/home/MissionSection";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Pillar {
  title: string;
  body: string;
}

/** ไอคอนเส้นบาง 3 ชิ้น เรียงตาม about.pillars ใน dictionary */
const pillarIcons = [
  // ของแท้จากชุมชน — กี่ทอ
  <svg key="loom" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5h18M3 9h18M3 15h18M3 19h18" />
    <path d="M7 3v18M12 3v18M17 3v18" opacity="0.55" />
  </svg>,
  // เทคโนโลยีรับใช้งานฝีมือ — เพชร/ปัญญา
  <svg key="tech" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L22 12L12 22L2 12Z" />
    <path d="M12 7L17 12L12 17L7 12Z" opacity="0.55" />
  </svg>,
  // รายได้กลับสู่ช่างทอ — มือ/หัวใจ
  <svg key="fair" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8.2c1.2-2.4 4.8-2.2 5.4.4.5 2.1-2.1 4.4-5.4 6.6-3.3-2.2-5.9-4.5-5.4-6.6.6-2.6 4.2-2.8 5.4-.4z" />
    <path d="M3 12v5.5c2.5 2 5.5 3.2 9 3.2s6.5-1.2 9-3.2V12" opacity="0.55" />
  </svg>,
];

export default function AboutContent() {
  const { t } = useLanguage();
  const pillars = t<Pillar[]>("about.pillars");

  return (
    <>
      {/* ───── Hero ───── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        sx={{ pt: { xs: 5, md: 9 }, pb: { xs: 4, md: 6 }, textAlign: "center" }}
      >
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 600,
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            color: "#C5A55A",
            textTransform: "uppercase",
            mb: 2,
          }}
        >
          {t("about.eyebrow")}
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
            fontWeight: 700,
            fontSize: { xs: "2.4rem", md: "3.4rem" },
            color: "#13284B",
            lineHeight: 1.1,
          }}
        >
          {t("about.title")}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 300,
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            color: "#7A7468",
            mt: 2.5,
            maxWidth: 620,
            mx: "auto",
            lineHeight: 1.85,
          }}
        >
          {t("about.lede")}
        </Typography>
      </Box>

      {/* ───── Our Story ───── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        sx={{
          py: { xs: 3, md: 5 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1.1fr" },
          gap: { xs: 3, md: 7 },
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: { xs: 260, md: 420 },
            borderRadius: { xs: "20px", md: "24px" },
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(19,40,75,0.16)",
          }}
        >
          <Image
            src="/Thai.webp"
            alt={t("about.storyTitle")}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 900px) 100vw, 45vw"
          />
        </Box>

        <Box>
          <Typography
            component="h2"
            sx={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              color: "#13284B",
              lineHeight: 1.15,
              mb: 2.5,
            }}
          >
            {t("about.storyTitle")}
          </Typography>
          <Box sx={{ width: 56, height: "1px", bgcolor: "rgba(197,165,90,0.55)", mb: 2.5 }} />
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: { xs: "0.9rem", md: "0.98rem" },
              color: "#4A5468",
              lineHeight: 1.9,
              mb: 2,
            }}
          >
            {t("about.storyBody1")}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: { xs: "0.9rem", md: "0.98rem" },
              color: "#4A5468",
              lineHeight: 1.9,
            }}
          >
            {t("about.storyBody2")}
          </Typography>
        </Box>
      </Box>

      {/* ───── Mission pillars ───── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        sx={{ py: { xs: 4, md: 6 } }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 600,
            fontSize: { xs: "0.82rem", md: "0.95rem" },
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#13284B",
            mb: { xs: 2.5, md: 3.5 },
          }}
        >
          {t("about.missionTitle")}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: { xs: 2, md: 3 },
          }}
        >
          {pillars.map((pillar, i) => (
            <Box
              key={pillar.title}
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "20px",
                border: "1px solid #EFE9DF",
                boxShadow: "0 4px 18px rgba(27,42,74,0.04)",
                px: { xs: 3, md: 3.5 },
                py: { xs: 3, md: 4 },
                transition: "transform 0.3s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 14px 34px rgba(27,42,74,0.1)",
                },
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "14px",
                  bgcolor: "rgba(197,165,90,0.1)",
                  color: "#C5A55A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                {pillarIcons[i]}
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#13284B",
                  mb: 1,
                }}
              >
                {pillar.title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 300,
                  fontSize: "0.85rem",
                  color: "#7A7468",
                  lineHeight: 1.8,
                }}
              >
                {pillar.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ───── Royal Vision quote — ใช้ MissionSection full-bleed เดิม ───── */}
      <MissionSection />

      {/* ───── CTA ───── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        sx={{ py: { xs: 4, md: 6 }, pb: { xs: 8, md: 10 }, textAlign: "center" }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: { xs: "1.8rem", md: "2.3rem" },
            color: "#13284B",
            mb: 1.5,
          }}
        >
          {t("about.ctaTitle")}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 300,
            fontSize: { xs: "0.9rem", md: "0.98rem" },
            color: "#7A7468",
            mb: 3.5,
          }}
        >
          {t("about.ctaBody")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/search" style={{ textDecoration: "none" }}>
            <Button
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />}
              sx={{
                bgcolor: "#13284B",
                color: "#FFFFFF",
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 500,
                fontSize: "0.88rem",
                borderRadius: "999px",
                px: 3.5,
                py: 1.3,
                textTransform: "none",
                boxShadow: "0 12px 28px rgba(19,40,75,0.22)",
                "&:hover": { bgcolor: "#0e1f3c" },
              }}
            >
              {t("about.ctaExplore")}
            </Button>
          </Link>
          <Link href="/community" style={{ textDecoration: "none" }}>
            <Button
              sx={{
                bgcolor: "transparent",
                color: "#13284B",
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 500,
                fontSize: "0.88rem",
                borderRadius: "999px",
                px: 3.5,
                py: 1.3,
                textTransform: "none",
                border: "1px solid #D8CFC0",
                "&:hover": { borderColor: "#C5A55A", bgcolor: "rgba(197,165,90,0.07)" },
              }}
            >
              {t("about.ctaCommunities")}
            </Button>
          </Link>
        </Box>
      </Box>
    </>
  );
}
