"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * แถวคู่ตาม mockup — ซ้าย: การ์ดขาว The Story Behind Thai Silk (ภาพ + ข้อความ)
 * ขวา: การ์ด navy คำคมพระราชปณิธาน (ย้ายมาจาก MissionSection เดิม เนื้อหาเดิมครบ)
 */
export default function EditorialSection() {
  const { t } = useLanguage();
  return (
<Box
  component={motion.div}
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  sx={{
    py: { xs: 4, md: 6 },
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: { xs: 2.5, md: 3 },
    alignItems: "stretch",
  }}
>
      {/* ───── Story card (white) ───── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "0.9fr 1.1fr" },
          borderRadius: { xs: "20px", md: "24px" },
          overflow: "hidden",
          bgcolor: "#FFFFFF",
          boxShadow: "0 10px 40px rgba(27,42,74,0.08)",
          minHeight: { md: 400 },
        }}
      >
        <Box sx={{ position: "relative", height: { xs: 220, sm: "auto" }, minHeight: { sm: 300 } }}>
          <Image
            src="/Thai.webp"
            alt="The story behind Thai silk"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 900px) 100vw, 30vw"
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 3, md: 4.5 },
            py: { xs: 3.5, md: 5 },
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C5A55A",
              mb: 1.25,
            }}
          >
            {t("home.editorial.eyebrow")}
          </Typography>

          <Typography
            sx={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Georgia", serif',
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: { xs: "1.7rem", md: "2rem" },
              color: "#13284B",
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            {t("home.editorial.title")}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: { xs: "0.88rem", md: "0.92rem" },
              color: "#4A5468",
              lineHeight: 1.85,
              mb: 3,
            }}
          >
            {t("home.editorial.body")}
          </Typography>

          <Box>
            <Link href="/community/heritage" style={{ textDecoration: "none" }}>
              <Button
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />}
                sx={{
                  bgcolor: "#1B2A4A",
                  color: "#FFFFFF",
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.82rem",
                  borderRadius: "999px",
                  px: 2.75,
                  py: 1.05,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#14213a", boxShadow: "none" },
                }}
              >
                {t("home.editorial.cta")}
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>

     
    </Box>
  );
}
