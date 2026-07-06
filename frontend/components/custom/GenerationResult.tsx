"use client";

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function GenerationResult() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "70vh",
        gap: 4,
      }}
    >
      <Typography
        component={motion.h2}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          fontFamily: '"Kanit", sans-serif',
          fontWeight: 700,
          fontSize: "1.2rem",
          color: "#1B2A4A",
          textAlign: "center",
        }}
      >
        กำลังถักทอจินตนาการของคุณ...
      </Typography>

      {/* Simulated 512x512 Generation Canvas */}
      <Box
        sx={{
          width: 256, // scaled down for mobile from 512
          height: 256,
          bgcolor: "#E5DFD6",
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          border: "4px solid #FFFFFF",
        }}
      >
        {/* Animated Scanning Line */}
        <Box
          component={motion.div}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, transparent, #C5A55A, transparent)",
            boxShadow: "0 0 10px #C5A55A",
            zIndex: 10,
          }}
        />
        
        {/* Animated Background Gradients to simulate pixel generation */}
        <Box
          component={motion.div}
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(197,165,90,0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 70%, rgba(27,42,74,0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 50%, rgba(197,165,90,0.3) 0%, transparent 70%)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.8,
            mixBlendMode: "multiply",
          }}
        />

        {/* Placeholder fading into "generated" image */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: [0, 0.2, 0.8, 1], scale: 1 }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/images/fabric1.webp')", // Example pattern
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </Box>

      <Typography
        component={motion.p}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          fontFamily: '"Kanit", sans-serif',
          fontSize: "0.85rem",
          color: "#6B7280",
          textAlign: "center",
        }}
      >
        AI กำลังสร้างลวดลาย 512x512 px แบบ Seamless...
      </Typography>
    </Box>
  );
}
