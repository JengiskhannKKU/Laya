"use client";

import { useState } from "react";
import { Box, Typography, Button, Fade } from "@mui/material";
import { motion } from "framer-motion";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

type CustomMode = "guided" | "prompt" | null;

interface CustomDesignEntryProps {
  onSelectMode: (mode: "guided" | "prompt") => void;
}

export default function CustomDesignEntry({ onSelectMode }: CustomDesignEntryProps) {
  const [selectedMode, setSelectedMode] = useState<CustomMode>(null);

  const handleSelect = (mode: "guided" | "prompt") => {
    setSelectedMode(mode);
    setTimeout(() => {
      onSelectMode(mode);
    }, 300);
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 6,
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-kanit), "Kanit", sans-serif',
              fontSize: { xs: "1.8rem", sm: "2.2rem" },
              fontWeight: 700,
              color: "#1B2A4A",
              mb: 1,
            }}
          >
            ออกแบบผ้าของคุณเอง
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-kanit), "Kanit", sans-serif',
              fontSize: { xs: "0.9rem", sm: "1rem" },
              color: "#6B7280",
            }}
          >
            เลือกวิธีการออกแบบที่เหมาะกับคุณ
          </Typography>
        </Box>
      </motion.div>

      {/* Mode Selection Cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", maxWidth: 400 }}>
        {/* Guided Custom Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box
            component={motion.div}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect("guided")}
            sx={{
              bgcolor: selectedMode === "prompt" ? "#F5F5F5" : "#FFFFFF",
              border: "2px solid",
              borderColor: selectedMode === "guided" ? "#C5A55A" : "#E5DFD6",
              borderRadius: 3,
              p: 3,
              cursor: "pointer",
              transition: "all 0.3s ease",
              opacity: selectedMode && selectedMode !== "guided" ? 0.5 : 1,
              "&:hover": {
                borderColor: "#C5A55A",
                boxShadow: "0 8px 24px rgba(197,165,90,0.15)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(197, 165, 90, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 28, color: "#C5A55A" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-kanit), "Kanit", sans-serif',
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1B2A4A",
                  }}
                >
                  Guided Custom
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-kanit), "Kanit", sans-serif',
                    fontSize: "0.8rem",
                    color: "#6B7280",
                  }}
                >
                  สำหรับมือใหม่ / UX friendly
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {["เลือกลาย", "เลือกสี", "เลือกผ้า", "เลือกภูมิภาค"].map((item) => (
                <Box
                  key={item}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: "#FDF8EF",
                    borderRadius: 1,
                    fontSize: "0.7rem",
                    color: "#A68A3A",
                    fontFamily: 'var(--font-kanit), "Kanit", sans-serif',
                  }}
                >
                  {item}
                </Box>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* Prompt Custom Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box
            component={motion.div}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect("prompt")}
            sx={{
              bgcolor: selectedMode === "guided" ? "#F5F5F5" : "#FFFFFF",
              border: "2px solid",
              borderColor: selectedMode === "prompt" ? "#C5A55A" : "#E5DFD6",
              borderRadius: 3,
              p: 3,
              cursor: "pointer",
              transition: "all 0.3s ease",
              opacity: selectedMode && selectedMode !== "prompt" ? 0.5 : 1,
              "&:hover": {
                borderColor: "#C5A55A",
                boxShadow: "0 8px 24px rgba(197,165,90,0.15)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(27, 42, 74, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EditRoundedIcon sx={{ fontSize: 28, color: "#1B2A4A" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-kanit), "Kanit", sans-serif',
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1B2A4A",
                  }}
                >
                  Prompt Custom
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-kanit), "Kanit", sans-serif',
                    fontSize: "0.8rem",
                    color: "#6B7280",
                  }}
                >
                  สำหรับ advanced user
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {["พิมพ์ Prompt", "AI วิเคราะห์", "แก้ไข Tag", "Generate"].map((item) => (
                <Box
                  key={item}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: "rgba(27, 42, 74, 0.08)",
                    borderRadius: 1,
                    fontSize: "0.7rem",
                    color: "#1B2A4A",
                    fontFamily: 'var(--font-kanit), "Kanit", sans-serif',
                  }}
                >
                  {item}
                </Box>
              ))}
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}