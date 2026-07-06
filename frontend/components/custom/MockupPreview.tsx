"use client";

import { useState } from "react";
import { Box, Typography, Button, Tabs, Tab, IconButton, Alert } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import { type CustomPatternData } from "@/lib/mock-data";

interface MockupPreviewProps {
  patternData: CustomPatternData;
  onStartMatching: () => void;
}

export default function MockupPreview({ patternData, onStartMatching }: MockupPreviewProps) {
  const [tabValue, setTabValue] = useState(0);

  // Use AI-generated image from Nano Banana 2, fallback to placeholder
  const generatedImage = patternData.generatedImageUrl ?? "/images/fabric1.webp";
  const isAIGenerated = !!patternData.generatedImageUrl && !patternData.isMock;


  return (
    <Box sx={{ pt: 2, display: "flex", flexDirection: "column", height: "100%", gap: 3 }}>
      {patternData.isMock && (
        <Alert severity="warning" sx={{ mb: -1, borderRadius: 2 }}>
          API key out of credits! Displaying a placeholder mock fabric for demo purposes.
        </Alert>
      )}

      <Box>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            fontSize: "1.4rem",
            color: "#1B2A4A",
            mb: 0.5,
          }}
        >
          Your Pattern ✨
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontSize: "0.85rem",
            color: "#6B7280",
          }}
        >
          {patternData.promptText
            ? "ลายผ้าที่สร้างจาก Prompt ของคุณ"
            : `แรงบันดาลใจจากสไตล์ ${patternData.patternStyle || "ดั้งเดิม"} โทนสี ${patternData.colors?.[0] || ""}`}
        </Typography>
      </Box>

      {/* Mockup Display Area */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          borderRadius: 4,
          border: "1px solid #E5DFD6",
          p: 1.5,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="fullWidth"
          sx={{
            minHeight: 36,
            mb: 2,
            "& .MuiTab-root": {
              minHeight: 36,
              fontFamily: '"Kanit", sans-serif',
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "none",
              color: "#6B7280",
              "&.Mui-selected": { color: "#1B2A4A" },
            },
            "& .MuiTabs-indicator": { bgcolor: "#C5A55A", height: 3, borderRadius: 1.5 },
          }}
        >
          <Tab label="ผืนผ้า" />
          <Tab label="เสื้อผ้า" />
          <Tab label="โปสเตอร์" />
        </Tabs>

        <Box sx={{ height: 320, position: "relative", borderRadius: 3, overflow: "hidden", bgcolor: "#FAF6F0" }}>
          <AnimatePresence mode="wait">
            {tabValue === 0 && (
              <Box
                key="fabric"
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${generatedImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}

            {tabValue === 1 && (
              <Box
                key="shirt"
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Simulated T-Shirt Mask */}
                <Box
                  sx={{
                    width: 220,
                    height: 280,
                    backgroundImage: `url(${generatedImage})`,
                    backgroundSize: "200%",
                    backgroundPosition: "center",
                    maskImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg"><path d="M20,10 C30,0 70,0 80,10 L100,40 C100,40 90,50 80,45 L75,60 L75,120 L25,120 L25,60 L20,45 C10,50 0,40 0,40 Z"/></svg>')`,
                    WebkitMaskImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg"><path d="M20,10 C30,0 70,0 80,10 L100,40 C100,40 90,50 80,45 L75,60 L75,120 L25,120 L25,60 L20,45 C10,50 0,40 0,40 Z"/></svg>')`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.2))",
                  }}
                />
              </Box>
            )}

            {tabValue === 2 && (
              <Box
                key="poster"
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                }}
              >
                <Box sx={{ width: "100%", height: "100%", bgcolor: "white", p: 1, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <Box sx={{ width: "100%", height: "80%", backgroundImage: `url(${generatedImage})`, backgroundSize: "cover" }} />
                  <Typography sx={{ textAlign: "center", mt: 1, fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A" }}>
                    LAYA EXCLUSIVE
                  </Typography>
                </Box>
              </Box>
            )}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<EngineeringRoundedIcon />}
          sx={{
            flex: { xs: "unset", md: 1 },
            bgcolor: "#C5A55A",
            color: "#1B2A4A",
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            py: 1.5,
            borderRadius: 3,
            "&:hover": { bgcolor: "#B89545" },
          }}
          onClick={onStartMatching}
        >
          Weaver Matching
        </Button>
        <Box sx={{ display: "flex", gap: 1.5, flex: { xs: "unset", md: 1 } }}>
          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            sx={{
              flex: 1,
              borderColor: "#1B2A4A",
              color: "#1B2A4A",
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              py: 1.2,
              borderRadius: 3,
              "&:hover": { bgcolor: "rgba(27,42,74,0.05)", borderColor: "#1B2A4A" }
            }}
          >
            Save Tile
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareRoundedIcon />}
            sx={{
              flex: 1,
              borderColor: "#1B2A4A",
              color: "#1B2A4A",
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              py: 1.2,
              borderRadius: 3,
              "&:hover": { bgcolor: "rgba(27,42,74,0.05)", borderColor: "#1B2A4A" }
            }}
          >
            Share
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
