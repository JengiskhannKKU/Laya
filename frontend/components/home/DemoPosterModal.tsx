"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import SparklesIcon from "@mui/icons-material/AutoAwesomeRounded";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const LOCAL_STORAGE_KEY = "laya_demo_poster_seen_v1";

const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const CREAM = "#FAF6F0";
const FONT = '"Kanit", sans-serif';

export default function DemoPosterModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // เช็กว่าผู้ใช้เคยเห็น/ปิดป๊อบอัพนี้แล้วหรือยังใน localStorage
    const hasSeen = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!hasSeen) {
      // หน่วงเวลา 0.8 วินาทีให้หน้าเว็บโหลดเสร็จสวยงามก่อนเด้งป๊อบอัพขึ้นมา
      const timer = setTimeout(() => {
        setOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // บันทึกลง localStorage ว่าเคยปิดแล้ว ครั้งต่อไปจะไม่แสดงซ้ำอีก
    localStorage.setItem(LOCAL_STORAGE_KEY, "true");
    setOpen(false);
    setShowVideo(false);
  };

  const handleWatchDemo = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, "true");
    setShowVideo(true);
  };

  return (
    <>
      {/* ═══ 1. โปสเตอร์ป๊อบอัพต้อนรับ (Welcome Promo Poster Dialog) ═══ */}
      <Dialog
        open={open && !showVideo}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "28px",
            bgcolor: CREAM,
            border: "1.5px solid #D6C29A",
            boxShadow: "0 24px 60px rgba(15,26,48,0.35)",
            overflow: "hidden",
            m: 2,
            position: "relative",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: "rgba(15,26,48,0.75)",
              backdropFilter: "blur(8px)",
            },
          },
        }}
      >
        {/* ปุ่มปิด ✕ มุมขวาบน */}
        <IconButton
          onClick={handleClose}
          aria-label="close"
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 10,
            width: 36,
            height: 36,
            bgcolor: "rgba(15,26,48,0.75)",
            color: "#FFFFFF",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.2)",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: NAVY,
              color: GOLD,
              transform: "rotate(90deg)",
            },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* เนื้อหาในโปสเตอร์ */}
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column" }}>

          {/* ส่วนภาพโปสเตอร์ด้านบน */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 230,
              bgcolor: NAVY,
              overflow: "hidden",
            }}
          >
            <Image
              src="/img_hero.png"
              alt="LAYA Platform Demo Poster"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            {/* Scrim Overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(15,26,48,0.35) 0%, rgba(15,26,48,0.85) 100%)",
              }}
            />

            {/* แบดจ์พิเศษมุมซ้ายบน */}
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                bgcolor: "rgba(197,165,90,0.9)",
                color: NAVY,
                px: 1.5,
                py: 0.5,
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              <SparklesIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.72rem" }}>
                PLATFORM DEMO
              </Typography>
            </Box>

            {/* ข้อความบนภาพโปสเตอร์ */}
            <Box sx={{ position: "absolute", bottom: 16, left: 18, right: 18 }}>
              <Typography
                sx={{
                  fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
                  fontWeight: 700,
                  fontSize: "1.45rem",
                  color: "#FFFFFF",
                  lineHeight: 1.15,
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                LAYA — AI Fashion Tech
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontWeight: 400,
                  fontSize: "0.82rem",
                  color: "#D8BC82",
                  mt: 0.25,
                }}
              >
                สัมผัสอนาคตผ้าไทย เมื่อมรดกทรงคุณค่า เจอ AI ระดับโลก
              </Typography>
            </Box>
          </Box>

          {/* ส่วนเนื้อหาหลักและปุ่มด้านล่าง */}
          <Box sx={{ p: 2.75, pt: 2.25, textAlign: "center" }}>
            
            {/* จุดขาย 3 ข้อในโปสเตอร์ */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                mb: 2.5,
                textAlign: "left",
                bgcolor: "#FFFFFF",
                p: 1.75,
                borderRadius: "16px",
                border: "1px solid #EFE8DA",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "0.95rem" }}>🎨</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.83rem", color: NAVY, fontWeight: 600 }}>
                  AI Design & Virtual Try-On ลองชุดเสมือนจริง
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "0.95rem" }}>✨</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.83rem", color: NAVY, fontWeight: 600 }}>
                  AI Pattern Generator สร้างลายผ้าไทยไม่ซ้ำใคร
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "0.95rem" }}>🧵</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.83rem", color: NAVY, fontWeight: 600 }}>
                  สั่งตัด & สั่งทอผ้าโดยตรงกับชุมชนช่างฝีมือ
                </Typography>
              </Box>
            </Box>

            {/* ปุ่ม CTA: รับชมคลิป Demo */}
            <Button
              onClick={handleWatchDemo}
              variant="contained"
              fullWidth
              startIcon={<PlayCircleFilledRoundedIcon sx={{ fontSize: 22 }} />}
              sx={{
                bgcolor: NAVY,
                color: "#FFFFFF",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: "999px",
                py: 1.25,
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(27,42,74,0.28)",
                border: "1px solid #C5A55A",
                "&:hover": {
                  bgcolor: "#132342",
                  transform: "scale(1.02)",
                },
              }}
            >
              🎬 รับชมคลิป Demo (2 นาที)
            </Button>

            {/* ปุ่มปิดหน้าต่าง */}
            <Button
              onClick={handleClose}
              sx={{
                mt: 1,
                color: "#718096",
                fontFamily: FONT,
                fontSize: "0.8rem",
                textTransform: "none",
                "&:hover": { bgcolor: "transparent", color: NAVY },
              }}
            >
              เข้าสู่เว็บไซต์ (ปิดหน้าต่างนี้)
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* ═══ 2. ป๊อบอัพวิดีโอเล่นคลิป Demo (Local video: /demo.mp4) ═══ */}
      <Dialog
        open={showVideo}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            bgcolor: NAVY,
            overflow: "hidden",
            m: { xs: 1.5, sm: 3 },
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: "rgba(15,26,48,0.9)",
              backdropFilter: "blur(12px)",
            },
          },
        }}
      >
        <Box sx={{ position: "relative", pt: "56.25%", width: "100%", bgcolor: "#000000" }}>
          {/* ปุ่มปิด ✕ มุมขวาบน */}
          <IconButton
            onClick={handleClose}
            aria-label="close video"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 20,
              color: "#FFFFFF",
              bgcolor: "rgba(0,0,0,0.75)",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(4px)",
              "&:hover": { bgcolor: "#000000", color: GOLD },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>

          {/* HTML5 Video Player playing /demo.mp4 */}
          <video
            controls
            autoPlay
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          >
            <source src="/demo.mp4" type="video/mp4" />
            <source src="/video1.mp4" type="video/mp4" />
            เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
          </video>
        </Box>
      </Dialog>
    </>
  );
}
