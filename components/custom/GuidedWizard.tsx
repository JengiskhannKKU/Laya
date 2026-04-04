"use client";

import { useState } from "react";
import { Box, Typography, Button, LinearProgress, Slider, Chip } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { motion, AnimatePresence } from "framer-motion";
import { type CustomPatternData } from "@/lib/mock-data";
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

const WEAVER_COLORS = [
  { name: "แดงเลือด", hex: "#8B0000" },
  { name: "แดงสด", hex: "#D32F2F" },
  { name: "เหลืองทอง", hex: "#D4AF37" },
  { name: "น้ำตาลเข้ม", hex: "#654321" },
  { name: "น้ำเงินเข้ม", hex: "#003366" },
  { name: "เขียวป่า", hex: "#1A5239" },
  { name: "ม่วงเข้ม", hex: "#4B0082" },
  { name: "กรมท่า", hex: "#000080" },
  { name: "ดำ", hex: "#1A1A1A" },
  { name: "ครีม", hex: "#F5F5DC" },
  { name: "ส้มอ่อน", hex: "#DDA77B" },
  { name: "ฟ้า", hex: "#5Cacee" },
  { name: "เขียวตอง", hex: "#a4c639" },
  { name: "ชมพู", hex: "#ffb6c1" },
  { name: "เทา", hex: "#a9a9a9" },
  { name: "ขาว", hex: "#f0f0f0" },
  { name: "ม่วงอ่อน", hex: "#dda0dd" },
  { name: "บานเย็น", hex: "#ff1493" },
];
const WEAVE_TYPES = [
  { name: "มัดหมี่ (Mudmee)", image: "/patterns/weave_mudmee.png", color: "#e8d5c4" },
  { name: "ขิด (Khit)", image: "/patterns/weave_khit.png", color: "#d5e8c4" },
  { name: "ยกดอก (Yok Dok)", image: "/patterns/weave_yokdok.png", color: "#e8c4c4" },
  { name: "จก (Jok)", image: "/patterns/weave_jok.png", color: "#c4d5e8" },
];

const REGION_TYPES = [
  { name: "ล้านนา (Lanna)", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=400", color: "#4f6b55" },
  { name: "อีสาน (Isan)", image: "https://images.unsplash.com/photo-1604107147774-67dd88b8e3ea?auto=format&fit=crop&q=80&w=400", color: "#8b5a2b" },
  { name: "ภาคใต้ (South)", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=400", color: "#2e5b7c" },
  { name: "ภาคกลาง (Central)", image: "https://images.unsplash.com/photo-1583307525389-98ee3b0a701a?auto=format&fit=crop&q=80&w=400", color: "#c89f53" },
];

const MOOD_TYPES = [
  { name: "งานแต่ง / พิธี", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400", color: "#f8e1e7" },
  { name: "ทางการ", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400", color: "#d1c4e9" },
  { name: "ลำลอง", image: "https://images.unsplash.com/photo-1434389678369-182cb1477759?auto=format&fit=crop&q=80&w=400", color: "#b3e5fc" },
  { name: "แฟชั่น", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400", color: "#ffccbc" },
  { name: "ของขวัญ", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400", color: "#c8e6c9" },
  { name: "ของแต่งบ้าน", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400", color: "#fff9c4" },
  { name: "พรีเมียม", image: "https://images.unsplash.com/photo-1600725514690-394dd38b0ab3?auto=format&fit=crop&q=80&w=400", color: "#cfd8dc" },
];

export default function GuidedWizard({ onGenerate }: GuidedWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [patternData, setPatternData] = useState<CustomPatternData>({
    complexity: 50,
    colors: [],
    selectedPatterns: [],
    requiresGI: false,
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

  const toggleColor = (colorName: string) => {
    const currentColors = patternData.colors || [];
    if (currentColors.includes(colorName)) {
      updateData("colors", currentColors.filter((c) => c !== colorName));
    } else {
      // Limit to 3 colors for practicality
      if (currentColors.length < 3) {
        updateData("colors", [...currentColors, colorName]);
      }
    }
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
              สีที่ช่างมีพร้อมทอ ({WEAVER_COLORS.length} สี)
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2, mb: 4, justifyItems: "center" }}>
              {WEAVER_COLORS.map((color) => {
                const isSelected = patternData.colors?.includes(color.name);
                return (
                  <Box
                    key={color.name}
                    onClick={() => toggleColor(color.name)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: color.hex,
                        border: isSelected ? "3px solid #1B2A4A" : "1px solid #E5DFD6",
                        boxShadow: isSelected ? "0 4px 10px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.2s",
                        position: "relative",
                      }}
                    >
                      {isSelected && (
                        <CheckCircleRoundedIcon
                          sx={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            color: "#1B2A4A",
                            fontSize: 20,
                            bgcolor: "white",
                            borderRadius: "50%"
                          }}
                        />
                      )}
                    </Box>
                    <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.7rem", color: isSelected ? "#1B2A4A" : "#6B7280", fontWeight: isSelected ? 600 : 400, textAlign: "center" }}>
                      {color.name}
                    </Typography>
                  </Box>
                )
              })}
            </Box>

            {/* Disclaimer */}
            <Box sx={{ bgcolor: "#FDF8EF", border: "1px solid #E5DFD6", borderRadius: 3, p: 2, mb: 2 }}>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", color: "#8B5A2B" }}>
                <b>สีจากธรรมชาติ</b> — สีที่เห็นอาจต่างจากสีจริงเล็กน้อย ขึ้นอยู่กับล็อตการย้อมและวัตถุดิบตามฤดูกาล
              </Typography>
            </Box>

            {/* Selection Summary */}
            <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5DFD6", borderRadius: 3, p: 2 }}>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#6B7280", mb: 1 }}>
                สีที่เลือก ({(patternData.colors || []).length} สี)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: -1 }}>
                  {patternData.colors?.map(colorName => {
                    const hex = WEAVER_COLORS.find(c => c.name === colorName)?.hex;
                    return (
                      <Box key={colorName} sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: hex, border: "2px solid #FFF", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", ml: -1 }} />
                    )
                  })}
                </Box>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 600, ml: 1 }}>
                  {(patternData.colors || []).join(" + ")}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        );

      case 2: // Weave Type
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2 }}>
              เทคนิคการทอ (Weave Type)
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1.5, flex: 1, minHeight: 350, mb: 2 }}>
              {WEAVE_TYPES.map((weave) => {
                const isSelected = patternData.weaveType === weave.name;
                return (
                  <Box
                    key={weave.name}
                    onClick={() => updateData("weaveType", weave.name)}
                    sx={{
                      position: "relative",
                      borderRadius: 4,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: isSelected ? "3px solid #1B2A4A" : "1px solid #E5DFD6",
                      boxShadow: isSelected ? "0 8px 20px rgba(27,42,74,0.15)" : "none",
                      transition: "all 0.2s",
                      bgcolor: weave.color, // Fallback color
                      backgroundImage: `url(${weave.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    {/* Dark gradient overlay for text readability */}
                    <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(27,42,74,0.8) 0%, rgba(27,42,74,0) 60%)" }} />

                    {/* Checkmark icon */}
                    {isSelected && (
                      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
                        <CheckCircleRoundedIcon sx={{ color: "#FFFFFF", fontSize: 24, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                      </Box>
                    )}

                    <Typography
                      sx={{
                        position: "relative",
                        zIndex: 2,
                        p: 1.5,
                        width: "100%",
                        fontFamily: '"Noto Serif Thai", serif',
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        textAlign: "center"
                      }}
                    >
                      {weave.name}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </motion.div>
        );

      case 3: // Region
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2 }}>
              สไตล์การทอผ้าไทย
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1.5, flex: 1, minHeight: 280, mb: 2 }}>
              {REGION_TYPES.map((region) => {
                const isSelected = patternData.region === region.name;
                return (
                  <Box
                    key={region.name}
                    onClick={() => updateData("region", region.name)}
                    sx={{
                      position: "relative",
                      borderRadius: 4,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: isSelected ? "3px solid #1B2A4A" : "1px solid #E5DFD6",
                      boxShadow: isSelected ? "0 8px 20px rgba(27,42,74,0.15)" : "none",
                      transition: "all 0.2s",
                      bgcolor: region.color, // Fallback color
                      backgroundImage: `url(${region.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    {/* Dark gradient overlay */}
                    <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(27,42,74,0.8) 0%, rgba(27,42,74,0) 60%)" }} />
                    
                    {isSelected && (
                      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
                        <CheckCircleRoundedIcon sx={{ color: "#FFFFFF", fontSize: 24, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                      </Box>
                    )}
                    
                    <Typography 
                      sx={{ 
                        position: "relative", 
                        zIndex: 2, 
                        p: 1.5, 
                        width: "100%", 
                        fontFamily: '"Noto Serif Thai", serif', 
                        color: "#FFFFFF", 
                        fontWeight: 600, 
                        fontSize: "0.85rem",
                        textAlign: "center"
                      }}
                    >
                      {region.name}
                    </Typography>
                  </Box>
                )
              })}
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
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 2 }}>
              อารมณ์ / การใช้งาน
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, flex: 1, overflowY: "auto", pb: 2, px: 0.5, mx: -0.5, mb: 2 }}>
              {MOOD_TYPES.map((mood) => {
                const isSelected = patternData.mood === mood.name;
                return (
                  <Box
                    key={mood.name}
                    onClick={() => updateData("mood", mood.name)}
                    sx={{
                      position: "relative",
                      borderRadius: 4,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: isSelected ? "3px solid #1B2A4A" : "1px solid #E5DFD6",
                      boxShadow: isSelected ? "0 8px 20px rgba(27,42,74,0.15)" : "none",
                      transition: "all 0.2s",
                      bgcolor: mood.color,
                      backgroundImage: `url(${mood.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "flex-end",
                      minHeight: 120,
                    }}
                  >
                    <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(27,42,74,0.8) 0%, rgba(27,42,74,0) 60%)" }} />
                    {isSelected && (
                      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
                        <CheckCircleRoundedIcon sx={{ color: "#FFFFFF", fontSize: 24, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                      </Box>
                    )}
                    <Typography 
                      sx={{ 
                        position: "relative", 
                        zIndex: 2, 
                        p: 1.5, 
                        width: "100%", 
                        fontFamily: '"Noto Serif Thai", serif', 
                        color: "#FFFFFF", 
                        fontWeight: 600, 
                        fontSize: "0.85rem",
                        textAlign: "center"
                      }}
                    >
                      {mood.name}
                    </Typography>
                  </Box>
                )
              })}
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
