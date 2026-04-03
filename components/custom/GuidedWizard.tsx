"use client";

import { useState } from "react";
import { Box, Typography, Button, LinearProgress, Slider, Chip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomPatternData } from "./CustomGenerator";
import PatternGallery from "./PatternGallery";

interface GuidedWizardProps {
  onGenerate: (data: CustomPatternData) => void;
}

const steps = [
  "Pattern Style",
  "Color Palette",
  "Weave Type",
  "Region",
  "Complexity",
  "Mood",
  "Summary",
];

const colors = [
  { name: "Earthy", value: "#8B5A2B", secondary: "#D2B48C" },
  { name: "Bold", value: "#8B0000", secondary: "#FF4500" },
  { name: "Pastel", value: "#FFB6C1", secondary: "#E6E6FA" },
  { name: "Monochrome", value: "#4A4A4A", secondary: "#A9A9A9" },
];
const weaves = ["มัดหมี่ (Mudmee)", "ขิด (Khit)", "ยกดอก (Yok Dok)", "จก (Jok)"];
const regions = ["Lanna", "Isan", "South", "GI Certified"];
const moods = ["Wedding", "Formal", "Casual", "Streetwear"];

export default function GuidedWizard({ onGenerate }: GuidedWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [patternData, setPatternData] = useState<CustomPatternData>({
    complexity: 50,
    colors: [],
    selectedPatterns: [],
  });

  const progress = ((activeStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onGenerate(patternData);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const updateData = (key: keyof CustomPatternData, value: any) => {
    setPatternData((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return (patternData.selectedPatterns?.length ?? 0) > 0;
      case 1: return (patternData.colors?.length ?? 0) > 0;
      case 2: return !!patternData.weaveType;
      case 3: return !!patternData.region;
      case 4: return true;
      case 5: return !!patternData.mood;
      case 6: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0: // Pattern Style (Gallery)
        return (
           <PatternGallery
             selectedPatterns={patternData.selectedPatterns || []}
             onChange={(patterns) => updateData("selectedPatterns", patterns)}
             onNext={handleNext}
           />
        );

      case 1: // Color Palette
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2 }}>
              เลือกโทนสี
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {colors.map((color) => {
                const isSelected = patternData.colors?.includes(color.name);
                return (
                  <Box
                    key={color.name}
                    onClick={() => updateData("colors", [color.name])} // simplified to single choice for now
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      bgcolor: isSelected ? "#FDF8EF" : "#FFFFFF",
                      border: `2px solid ${isSelected ? "#C5A55A" : "#E5DFD6"}`,
                      borderRadius: 3,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <Box sx={{ display: "flex" }}>
                      <Box sx={{ width: 24, height: 24, bgcolor: color.value, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }} />
                      <Box sx={{ width: 24, height: 24, bgcolor: color.secondary, borderTopRightRadius: 12, borderBottomRightRadius: 12 }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: isSelected ? "#1B2A4A" : "#6B7280", fontWeight: isSelected ? 600 : 400 }}>
                      {color.name}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </motion.div>
        );

      case 2: // Weave Type
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
             <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2 }}>
              สไตล์การทอ (Weave Type)
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5 }}>
              {weaves.map((weave) => (
                <Box
                  key={weave}
                  onClick={() => updateData("weaveType", weave)}
                  sx={{
                    p: 2,
                    bgcolor: patternData.weaveType === weave ? "#FDF8EF" : "#FFFFFF",
                    border: `2px solid ${patternData.weaveType === weave ? "#C5A55A" : "#E5DFD6"}`,
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: patternData.weaveType === weave ? "#1B2A4A" : "#6B7280", fontWeight: patternData.weaveType === weave ? 600 : 400 }}>
                    {weave}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        );
      
      case 3: // Region
         return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
             <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2 }}>
              ภูมิภาค / อัตลักษณ์
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              {regions.map((region) => (
                <Box
                  key={region}
                  onClick={() => updateData("region", region)}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: patternData.region === region ? "#FDF8EF" : "#FFFFFF",
                    border: `2px solid ${patternData.region === region ? "#C5A55A" : "#E5DFD6"}`,
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: patternData.region === region ? "#1B2A4A" : "#6B7280", fontWeight: patternData.region === region ? 600 : 400 }}>
                    {region}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        );

      case 4: // Complexity Slider
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 4 }}>
              ความละเอียด / ความซับซ้อน
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={patternData.complexity}
                onChange={(_, v) => updateData("complexity", v)}
                min={0}
                max={100}
                sx={{
                  color: "#C5A55A",
                  "& .MuiSlider-thumb": { border: "2px solid #FFF" },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>Simple</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>{patternData.complexity}%</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>Intricate</Typography>
              </Box>
            </Box>
          </motion.div>
        );

      case 5: // Mood
        return (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2 }}>
              อารมณ์ / การใช้งาน
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5 }}>
               {moods.map((mood) => (
                <Box
                  key={mood}
                  onClick={() => updateData("mood", mood)}
                  sx={{
                    p: 2,
                    bgcolor: patternData.mood === mood ? "#FDF8EF" : "#FFFFFF",
                    border: `2px solid ${patternData.mood === mood ? "#C5A55A" : "#E5DFD6"}`,
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: patternData.mood === mood ? "#1B2A4A" : "#6B7280", fontWeight: patternData.mood === mood ? 600 : 400 }}>
                    {mood}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        );

      case 6: // Summary
        return (
          <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A", mb: 3 }}>
              🧠 สรุปแบบลายผ้าของคุณ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, bgcolor: "#FFFFFF", p: 3, borderRadius: 4, border: "1px solid #E5DFD6" }}>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Pattern (Blended)</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {patternData.selectedPatterns?.map(p => (
                    <Chip key={p} label={p} size="small" sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
                  ))}
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Color</Typography>
                <Chip label={patternData.colors?.[0]} size="small" sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Weave</Typography>
                <Chip label={patternData.weaveType} size="small" sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
              </Box>
              <Box>
                 <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Region</Typography>
                <Chip label={patternData.region} size="small" sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
              </Box>
              <Box>
                 <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Mood</Typography>
                <Chip label={patternData.mood} size="small" sx={{ bgcolor: "rgba(197,165,90,0.1)", color: "#1B2A4A", fontWeight: 600 }} />
              </Box>
            </Box>
          </motion.div>
        );

      default: return null;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>
            ขั้นตอนที่ {activeStep + 1} จาก {steps.length}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#C5A55A", fontWeight: 600 }}>
            {steps[activeStep]}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 6, borderRadius: 3, bgcolor: "#E5DFD6", "& .MuiLinearProgress-bar": { bgcolor: "#C5A55A", borderRadius: 3 } }}
        />
      </Box>

      {/* Step Content Area (Adjusted for absolute positioning in PatternGallery) */}
      {activeStep === 0 ? (
         <Box sx={{ flex: 1, position: "relative", mx: -2 }}>
            {renderStep()}
         </Box>
      ) : (
         <Box sx={{ flex: 1, minHeight: 300 }}>
           <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
         </Box>
      )}

      {/* Navigation Buttons (Hidden inside Step 0 since PatternGallery has its own) */}
      {activeStep > 0 && (
        <Box sx={{ display: "flex", gap: 1.5, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ flex: 1, borderColor: "#E5DFD6", color: "#1B2A4A", py: 1.5, borderRadius: 3, fontWeight: 600 }}
          >
            ย้อนกลับ
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed()}
            sx={{
              flex: 2,
              bgcolor: "#1B2A4A",
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              "&:hover": { bgcolor: "#0F1A30" },
              "&.Mui-disabled": { bgcolor: "#E5DFD6", color: "#9CA3AF" },
            }}
          >
            {activeStep === steps.length - 1 ? "✅ ยืนยัน (Generate)" : "ถัดไป"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
