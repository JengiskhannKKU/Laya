"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SparklesIcon from "@mui/icons-material/AutoAwesomeRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const STORAGE_KEY = "laya_demo_poster_seen_v2";

const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const CREAM = "#FAF6F0";
const FONT = '"Kanit", sans-serif';

const INSTAGRAM_URL = "https://www.instagram.com/laya_thailand/";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590235357496";

export default function DemoPosterModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // เช็กว่าผู้ใช้เคยเห็น/ปิดป๊อบอัพนี้แล้วหรือยังใน sessionStorage
    const hasSeen = sessionStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          bgcolor: NAVY,
          border: "1.5px solid #D6C29A",
          boxShadow: "0 24px 60px rgba(15,26,48,0.5)",
          overflow: "hidden",
          m: { xs: 1.5, sm: 2 },
          maxWidth: 410, // ปรับขนาดกว้างพอดีทรงแนวตั้งมือถือ
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(15,26,48,0.85)",
            backdropFilter: "blur(10px)",
          },
        },
      }}
    >
      {/* ─── 1. แถบ Header ด้านบนสีกรมท่า ─── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.25,
          py: 1.25,
          bgcolor: "#13223F",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Typography
          sx={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: "0.92rem",
            color: GOLD,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          🎬 วิดีโอสาธิตแพลตฟอร์ม LAYA
        </Typography>

        {/* ปุ่มปิด ✕ */}
        <IconButton
          onClick={handleClose}
          aria-label="close video"
          sx={{
            color: "#FFFFFF",
            width: 32,
            height: 32,
            bgcolor: "rgba(255,255,255,0.12)",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.25)",
              color: GOLD,
              transform: "rotate(90deg)",
            },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ─── 2. ส่วนวิดีโอ demo.mp4 เล่นในทรงหน้าจอมือถือ ─── */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "min(56vh, 480px)",
          bgcolor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <video
          controls
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        >
          <source src="/images/video/demo.mp4" type="video/mp4" />
          <source src="/images/video/video1.mp4" type="video/mp4" />
          เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
        </video>
      </Box>

      {/* ─── 3. ส่วนอธิบายฟีเจอร์ LAYA, ปุ่มโซเชียล & ปุ่มเข้าสู่เว็บไซต์ด้านล่าง ─── */}
      <Box
        sx={{
          p: 2.25,
          bgcolor: CREAM,
          borderTop: "1.5px solid #D6C29A",
          textAlign: "center",
        }}
      >
        {/* หัวข้อโปรโมต */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, mb: 0.25 }}>
          <SparklesIcon sx={{ fontSize: 16, color: GOLD }} />
          <Typography
            sx={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
              fontWeight: 700,
              fontSize: "1.3rem",
              color: NAVY,
            }}
          >
            LAYA — AI Fashion Tech
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: "0.8rem",
            color: "#6B7280",
            mb: 2,
          }}
        >
          สัมผัสอนาคตผ้าไทย เมื่อมรดกทรงคุณค่า เจอ AI ระดับโลก
        </Typography>

        {/* ปุ่มเข้าสู่เว็บไซต์ */}
        <Button
          onClick={handleClose}
          variant="contained"
          fullWidth
          sx={{
            bgcolor: NAVY,
            color: "#FFFFFF",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: "0.9rem",
            borderRadius: "999px",
            py: 1.1,
            textTransform: "none",
            boxShadow: "0 6px 20px rgba(27,42,74,0.25)",
            border: "1px solid #C5A55A",
            "&:hover": {
              bgcolor: "#132342",
              transform: "scale(1.01)",
            },
          }}
        >
          เข้าสู่เว็บไซต์ LAYA
        </Button>
      </Box>
    </Dialog>
  );
}
