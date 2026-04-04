"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MissionSection() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      sx={{ px: 2.5, py: 3 }}
    >
      <Box
        sx={{
          position: "relative",
          minHeight: 240,
          borderRadius: "28px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 20px 40px rgba(27,42,74,0.18)",
        }}
      >
        {/* Background Image - Impactful Heritage */}
        <Image
          src="/thai.jpg"
          alt="Thai Silk Heritage"
          fill
          style={{ objectFit: "cover", filter: "brightness(0.55)" }}
        />
        
        {/* Elegant Gradient Overlay */}
        <Box 
          sx={{ 
            position: "absolute", 
            inset: 0, 
            background: "linear-gradient(135deg, rgba(27,42,74,0.95) 0%, rgba(27,42,74,0.4) 100%)",
            zIndex: 1
          }} 
        />

        {/* Content */}
        <Box 
          sx={{ 
            position: "relative", 
            zIndex: 2, 
            px: 3, 
            py: 4,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2
          }}
        >
          {/* Decorative Icon */}
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              borderRadius: "50%",
              bgcolor: "rgba(216, 188, 130, 0.15)",
              border: "1px solid rgba(216, 188, 130, 0.3)",
              color: "#D8BC82",
              mb: 1
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </Box>

          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.25rem",
              color: "#FFFFFF",
              lineHeight: 1.8,
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              letterSpacing: "0.2px",
              maxWidth: "90%",
              mx: "auto"
            }}
          >
            “แพลตฟอร์ม Laya มีเป้าหมายในการต่อยอดพระราชปณิธานในการอนุรักษ์และส่งเสริมผ้าไหมไทย”
          </Typography>

          <Box 
            sx={{ 
              width: 60, 
              height: 2, 
              background: "linear-gradient(to right, transparent, #D8BC82, transparent)",
              mt: 1
            }} 
          />
        </Box>
      </Box>
    </Box>
  );
}
