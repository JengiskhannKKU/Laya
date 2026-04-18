"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import { motion } from "framer-motion";
import Link from "next/link";

export default function InspirationSection() {
  return (
    <Box
      sx={{
        mt: 6,
        px: 2,
        pb: 10, // Extra padding for the last section
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Noto Serif Thai", serif',
          fontWeight: 700,
          fontSize: "1.2rem",
          color: "#1B2A4A",
          mb: 2,
          pl: 0.5,
        }}
      >
        แรงบันดาลใจของ Laya
      </Typography>

      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        sx={{
          width: "100%",
          height: 400,
          borderRadius: "24px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        }}
      >
        {/* Main Video Background */}
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
            filter: "brightness(0.65)",
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
            p: 3,
            background: "linear-gradient(to top, rgba(27,42,74,0.95) 0%, transparent 60%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1.5,
              opacity: 0.9,
            }}
          >
            <PlayCircleFilledRoundedIcon sx={{ color: "#D8BC82", fontSize: 32 }} />
            <Typography
              sx={{
                color: "#FFFFFF",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              โครงการในพระราชดำริ
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.4rem",
              color: "#FFFFFF",
              lineHeight: 1.4,
              mb: 1,
            }}
          >
            แรงบันดาลใจของ Laya
          </Typography>

          <Typography
            sx={{
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              mb: 1, // Adjusted margin since button is gone
            }}
          >
            จากพระราชดำริ…สู่ผ้าไหมที่คุณออกแบบได้วันนี้
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
