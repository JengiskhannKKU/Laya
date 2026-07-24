"use client";

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { fetchBanners, type Banner } from "@/lib/banners";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

const INSTAGRAM_URL = "https://www.instagram.com/laya_thailand/";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590235357496";

/**
 * Hero สองเวอร์ชันตามขนาดจอ (สลับด้วย CSS ล้วน — ไม่มี hydration mismatch):
 * - Desktop (md+): split 45/55 ตาม mockup — ข้อความ serif ซ้ายบนพื้นครีม ภาพชนขอบขวาจอ
 * - Mobile (xs–sm): immersive เต็มความกว้าง ภาพ cinematic สูง ~50vh พร้อม scrim navy
 *   ข้อความซ้อนบนภาพด้านล่าง สไตล์แอป luxury — FloatingSearch จะลอยคาบขอบล่างต่อ
 * ภาพหมุนวนจาก backend banners ทั้งสองเวอร์ชัน
 */
export default function HeroSearch() {
  const { t } = useLanguage();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetchBanners().then(setBanners).catch(() => setBanners([]));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (banners.length ? (prev + 1) % banners.length : 0));
  }, [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, banners.length]);

  const activeBanner = banners[current];

  const bannerLayers = (
    <Image
      src={activeBanner ? activeBanner.image : "/img_hero.webp"}
      alt={activeBanner ? activeBanner.title : "Thai silk heritage"}
      fill
      style={{ objectFit: "cover" }}
      priority
      sizes="(max-width: 3000px) 100vw, 55vw"
    />
  );

  const renderDots = (dark: boolean) =>
    banners.length > 1 && (
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-start" }}>
        {banners.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrent(index)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              cursor: "pointer",
              border: dark
                ? "1px solid rgba(255,255,255,0.7)"
                : "1px solid #C9A86A",
              bgcolor: index === current ? "#C9A86A" : "transparent",
              borderColor: index === current ? "#C9A86A" : undefined,
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}
          />
        ))}
      </Box>
    );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{
        mx: "calc(50% - 50vw)",
      }}
    >
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "relative",
          height: "min(50vh, 460px)",
          minHeight: 360,
          overflow: "hidden",
        }}
      >
        {bannerLayers}

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,26,48,0.65) 0%, rgba(15,26,48,0.45) 40%, rgba(15,26,48,0.85) 100%)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: 3,
            pt: 2,
            pb: 6.5,
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
              fontWeight: 700,
              fontSize: "2.3rem",
              color: "#FFFFFF",
              lineHeight: 1.08,
              textShadow: "0 2px 18px rgba(0,0,0,0.35)",
            }}
          >
            {t("home.hero.title")}
          </Typography>

          <Typography
            sx={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Georgia", serif',
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "1.15rem",
              color: "#D8BC82",
              mt: 0.75,
            }}
          >
            {t("home.hero.accent")}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: "0.83rem",
              color: "rgba(255,255,255,0.85)",
              mt: 1.25,
              maxWidth: 340,
              lineHeight: 1.7,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {t("home.hero.subtitle")}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2.25, flexWrap: "wrap" }}>
            <Link href="/search" style={{ textDecoration: "none" }}>
              <Button
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: "#FFFFFF",
                  color: "#13284B",
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.84rem",
                  borderRadius: "999px",
                  px: 2.75,
                  py: 1,
                  textTransform: "none",
                  boxShadow: "0 10px 26px rgba(0,0,0,0.28)",
                  "&:hover": { bgcolor: "#F3EDE2" },
                }}
              >
                {t("home.hero.ctaPrimary")}
              </Button>
            </Link>

            <Button
              component="a"
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<InstagramIcon sx={{ fontSize: 16, color: "#E1306C" }} />}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                color: "#13284B",
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 500,
                fontSize: "0.78rem",
                borderRadius: "999px",
                px: 1.75,
                py: 0.85,
                textTransform: "none",
                backdropFilter: "blur(4px)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              }}
            >
              Instagram
            </Button>
            <Button
              component="a"
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<FacebookIcon sx={{ fontSize: 16, color: "#1877F2" }} />}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                color: "#13284B",
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 500,
                fontSize: "0.78rem",
                borderRadius: "999px",
                px: 1.75,
                py: 0.85,
                textTransform: "none",
                backdropFilter: "blur(4px)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              }}
            >
              Facebook
            </Button>

            {renderDots(true)}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: "auto 1fr",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            textAlign: "left",
            pl: "max(calc((100vw - 1440px) / 2 + 100px), 100px)",
            pt: 6,
            pb: 6,
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
              fontWeight: 700,
              fontSize: { md: "3.4rem", lg: "4rem" },
              color: "#13284B",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
            }}
          >
            {t("home.hero.title")}
          </Typography>

          <Typography
            sx={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Georgia", serif',
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "1.75rem",
              color: "#B8954A",
              mt: 1.25,
              letterSpacing: "0.01em",
            }}
          >
            {t("home.hero.accent")}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: "0.98rem",
              color: "#7A7468",
              mt: 2.5,
              maxWidth: 430,
              lineHeight: 1.85,
            }}
          >
            {t("home.hero.subtitle")}
          </Typography>

          <Box sx={{ mt: 3.5, display: "flex", alignItems: "center", gap: 1.75, flexWrap: "wrap" }}>
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
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "#0e1f3c",
                    boxShadow: "0 14px 32px rgba(19,40,75,0.3)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {t("home.hero.ctaPrimary")}
              </Button>
            </Link>

            {/* ปุ่ม Social Media: Instagram & Facebook */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Button
                component="a"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<InstagramIcon sx={{ fontSize: 18, color: "#E1306C" }} />}
                sx={{
                  bgcolor: "#FFFFFF",
                  color: "#13284B",
                  border: "1px solid #EFE9DD",
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.84rem",
                  borderRadius: "999px",
                  px: 2.25,
                  py: 1.1,
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    bgcolor: "#FFF5F8",
                    borderColor: "#E1306C",
                    color: "#E1306C",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Instagram
              </Button>
              <Button
                component="a"
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<FacebookIcon sx={{ fontSize: 18, color: "#1877F2" }} />}
                sx={{
                  bgcolor: "#FFFFFF",
                  color: "#13284B",
                  border: "1px solid #EFE9DD",
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.84rem",
                  borderRadius: "999px",
                  px: 2.25,
                  py: 1.1,
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    bgcolor: "#F0F6FF",
                    borderColor: "#1877F2",
                    color: "#1877F2",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Facebook
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 5 }}>{renderDots(false)}</Box>
        </Box>

        {/* Right: silk photography bleeding to the right edge — เหลี่ยมคมทุกมุม
            สไตล์ fashion editorial spread แทนการ์ดโค้งมน */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            height: 560,
            borderRadius: 0,
          }}
        >
          {bannerLayers}
        </Box>
      </Box>
    </Box>
  );
}
