"use client";

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";

interface ModeSelectionProps {
  onSelectMode: (mode: "guided" | "prompt") => void;
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        pt: 4,
      }}
    >
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          sx={{
            fontFamily: '"Noto Serif Thai", serif',
            fontWeight: 700,
            fontSize: "1.3rem",
            color: "#1B2A4A",
            mb: 1,
          }}
        >
          ออกแบบลายผ้าของคุณเอง
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Noto Serif Thai", serif',
            fontSize: "0.85rem",
            color: "#6B7280",
          }}
        >
          เลือกวิธีเริ่มต้นสร้างผลงานสุดพิเศษในแบบคุณ
        </Typography>
      </Box>

      {/* Guided Custom Mode */}
      <Box
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectMode("guided")}
        sx={{
          width: "100%",
          bgcolor: "#FFFFFF",
          border: "2px solid #E5DFD6",
          borderRadius: 4,
          p: 3,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 2,
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "#C5A55A",
            boxShadow: "0 10px 30px rgba(197, 165, 90, 0.15)",
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "rgba(197, 165, 90, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ color: "#C5A55A", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#1B2A4A",
            }}
          >
            Guided Custom ✨
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.8rem",
              color: "#6B7280",
              mt: 0.5,
              lineHeight: 1.4,
            }}
          >
            สำหรับมือใหม่ ทำตามทีละขั้นตอน เลือกสไตล์ สี และเรื่องราว ง่ายดายและสนุก
          </Typography>
        </Box>
      </Box>

      {/* Prompt Custom Mode */}
      <Box
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectMode("prompt")}
        sx={{
          width: "100%",
          bgcolor: "#FFFFFF",
          border: "2px solid #E5DFD6",
          borderRadius: 4,
          p: 3,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 2,
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "#1B2A4A",
            boxShadow: "0 10px 30px rgba(27, 42, 74, 0.1)",
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "rgba(27, 42, 74, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CreateRoundedIcon sx={{ color: "#1B2A4A", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#1B2A4A",
            }}
          >
            Prompt Custom ✍️
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.8rem",
              color: "#6B7280",
              mt: 0.5,
              lineHeight: 1.4,
            }}
          >
            สำหรับสาย Pro พิมพ์ความต้องการของคุณอย่างอิสระ แล้วให้ AI จัดการให้
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
