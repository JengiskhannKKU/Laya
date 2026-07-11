"use client";

import { useState } from "react";
import { Box, Typography, TextField, Button, CircularProgress, Chip } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GpsFixedRoundedIcon from "@mui/icons-material/GpsFixedRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { motion, AnimatePresence } from "framer-motion";
import { type CustomPatternData } from "@/lib/custom-order-config";

interface PromptWizardProps {
  onGenerate: (data: CustomPatternData) => void;
}

export default function PromptWizard({ onGenerate }: PromptWizardProps) {
  const [prompt, setPrompt] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<CustomPatternData | null>(null);

  const handleParse = () => {
    if (!prompt.trim()) return;
    
    setIsParsing(true);
    
    // Simulate AI extraction delay
    setTimeout(() => {
      setIsParsing(false);
      // Hardcoded simulation based on common keywords, or fallback
      const lowerPrompt = prompt.toLowerCase();
      
      setParsedData({
        promptText: prompt,
        patternStyle: lowerPrompt.includes("floral") ? "Floral" : (lowerPrompt.includes("geo") ? "Geometric" : "Traditional"),
        colors: lowerPrompt.includes("pink") || lowerPrompt.includes("pastel") ? ["Pastel"] : ["Earthy"],
        weaveType: lowerPrompt.includes("mudmee") ? "Mudmee" : "Yok Dok",
        region: lowerPrompt.includes("isan") ? "Isan" : "Lanna",
        mood: lowerPrompt.includes("wedding") || lowerPrompt.includes("elegant") ? "Wedding" : "Casual",
      });
    }, 2000);
  };

  const handleConfirm = () => {
    if (parsedData) {
      onGenerate(parsedData);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pt: 2 }}>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A", mb: 1, display: "flex", alignItems: "center", gap: 0.6 }}>
        สร้างลายผ้าด้วย Prompt <EditRoundedIcon sx={{ fontSize: "1.1rem", color: "#C5A55A" }} />
      </Typography>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 3 }}>
        พิมพ์สิ่งที่คุณจินตนาการ เช่น "Thai silk, mudmee pattern, pastel pink floral, Isan style, elegant wedding"
      </Typography>

      <TextField
        multiline
        rows={4}
        placeholder="พิมพ์คำอธิบายภาษาไทยหรืออังกฤษ..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isParsing || !!parsedData}
        sx={{
          bgcolor: "#FFFFFF",
          borderRadius: 3,
          "& .MuiOutlinedInput-root": {
             borderRadius: 3,
             fontFamily: "monospace",
             fontSize: "0.9rem",
             "& fieldset": { borderColor: "#E5DFD6" },
             "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
          }
        }}
      />

      <AnimatePresence mode="wait">
        {!parsedData && !isParsing && (
          <motion.div key="btn-parse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              variant="contained"
              onClick={handleParse}
              disabled={!prompt.trim()}
              startIcon={<AutoAwesomeRoundedIcon />}
              sx={{
                width: "100%",
                mt: 3,
                bgcolor: "#1B2A4A",
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                "&:hover": { bgcolor: "#0F1A30" },
                "&.Mui-disabled": { bgcolor: "#E5DFD6", color: "#9CA3AF" },
              }}
            >
              ให้ AI วิเคราะห์ Prompt
            </Button>
          </motion.div>
        )}

        {isParsing && (
          <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", marginTop: 40 }}>
            <CircularProgress size={32} sx={{ color: "#C5A55A", mb: 2 }} />
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#1B2A4A", fontSize: "0.9rem" }}>
              กำลังดึงข้อมูล Pattern, Color, และ Region...
            </Typography>
          </motion.div>
        )}

        {parsedData && !isParsing && (
          <motion.div key="parsed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ mt: 4, bgcolor: "#FFFFFF", p: 3, borderRadius: 4, border: "1px solid #E5DFD6" }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", mb: 2, display: "flex", alignItems: "center", gap: 0.6 }}>
                <GpsFixedRoundedIcon sx={{ fontSize: "1.1rem", color: "#C5A55A" }} /> AI เข้าใจความต้องการของคุณดังนี้:
              </Typography>
              
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip label={`Pattern: ${parsedData.patternStyle}`} sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
                <Chip label={`Color: ${parsedData.colors?.[0]}`} sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
                <Chip label={`Weave: ${parsedData.weaveType}`} sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
                <Chip label={`Region: ${parsedData.region}`} sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
                <Chip label={`Mood: ${parsedData.mood}`} sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setParsedData(null)}
                  startIcon={<EditRoundedIcon />}
                  sx={{ flex: 1, borderColor: "#E5DFD6", color: "#1B2A4A", borderRadius: 3 }}
                >
                  แก้ไข Prompt
                </Button>
                <Button
                  variant="contained"
                  onClick={handleConfirm}
                  startIcon={<CheckRoundedIcon />}
                  sx={{ flex: 1.5, bgcolor: "#1B2A4A", borderRadius: 3, "&:hover": { bgcolor: "#0F1A30" } }}
                >
                  Confirm (Generate)
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
