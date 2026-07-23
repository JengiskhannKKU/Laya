"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SparklesIcon from "@mui/icons-material/AutoAwesomeRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { motion } from "framer-motion";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  badge: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: "advise",
    title: "LAYA Platform Advice & Guidance",
    subtitle: "คำแนะนำการใช้งานแพลตฟอร์มและการออกแบบผ้าไทยด้วย AI",
    src: "/images/video/Advise.mp4",
    badge: "คำแนะนำการใช้งาน",
  },
  {
    id: "showcase",
    title: "Heritage & Innovation Showcase",
    subtitle: "เรื่องราวหัตถศิลป์ผ้าไทยและนวัตกรรมลองชุดเสมือนจริง",
    src: "/images/video/video1.mp4",
    badge: "เรื่องราว & นวัตกรรม",
  },
];

export default function VideoShowcaseSection() {
  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{
        py: { xs: 5, md: 8 },
        bgcolor: "#FAF7F2",
        borderTop: "1px solid #EFE8DA",
        borderBottom: "1px solid #EFE8DA",
        position: "relative",
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2.5, sm: 3, md: 5 } }}>
        {/* ─── Header ─── */}
        <Box sx={{ textAlign: "center", mb: { xs: 3.5, md: 5.5 } }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 1 }}>
            <SparklesIcon sx={{ fontSize: 16, color: GOLD }} />
            <Typography
              sx={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.8rem",
                color: GOLD,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              VIDEO SHOWCASE
            </Typography>
            <SparklesIcon sx={{ fontSize: 16, color: GOLD }} />
          </Box>

          <Typography
            component="h2"
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2.1rem", md: "2.5rem" },
              color: NAVY,
              letterSpacing: "-0.01em",
            }}
          >
            วิดีโอแนะนำ & เรื่องราว LAYA
          </Typography>

          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: { xs: "0.88rem", md: "1rem" },
              color: "#6B7280",
              mt: 1,
              maxWidth: 560,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            รับชมวิดีโอคำแนะนำการใช้งานแพลตฟอร์ม นวัตกรรม AI และบรรยากาศหัตถศิลป์ผ้าไทยทรงคุณค่า
          </Typography>
        </Box>

        {/* ─── 2 Video Players Grid ─── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 3, md: 4 },
          }}
        >
          {VIDEOS.map((video) => (
            <Box
              key={video.id}
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #EFE8DA",
                boxShadow: "0 10px 30px rgba(27,42,74,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 16px 40px rgba(27,42,74,0.16)",
                },
              }}
            >
              {/* Video Container */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/9",
                  bgcolor: "#0B1326",
                  overflow: "hidden",
                }}
              >
                <video
                  controls
                  playsInline
                  preload="metadata"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                >
                  <source src={video.src} type="video/mp4" />
                  เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                </video>

                {/* Badge Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    bgcolor: "rgba(15,26,48,0.85)",
                    color: GOLD,
                    border: "1px solid rgba(197,165,90,0.4)",
                    fontFamily: FONT,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    px: 1.5,
                    py: 0.4,
                    borderRadius: "999px",
                    backdropFilter: "blur(6px)",
                    pointerEvents: "none",
                  }}
                >
                  {video.badge}
                </Box>
              </Box>

              {/* Video Info Footer */}
              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography
                  component="h3"
                  sx={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                    color: NAVY,
                    mb: 0.75,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PlayCircleOutlineRoundedIcon sx={{ color: GOLD, fontSize: 22 }} />
                  {video.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: "0.86rem",
                    color: "#6B7280",
                    lineHeight: 1.6,
                  }}
                >
                  {video.subtitle}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
