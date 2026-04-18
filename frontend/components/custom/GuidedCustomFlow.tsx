"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Slider,
  Chip,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// Data options
const patternStyles = [
  { id: "geometry", name: "เรขาคณิต", nameEn: "Geometric", image: "/images/patterns/geometry.png", description: "ลายเหลี่ยม วงกลม สามเหลี่ยม" },
  { id: "flower", name: "ดอกไม้", nameEn: "Floral", image: "/images/patterns/flower.png", description: "ดอกไม้ พวงมาลา ลายกิ่ง" },
  { id: "nature", name: "ธรรมชาติ", nameEn: "Nature", image: "/images/patterns/nature.png", description: "ใบไม้ คลื่น ภูเขา" },
  { id: "traditional", name: "ดั้งเดิม", nameEn: "Traditional", image: "/images/patterns/traditional.png", description: "ลายไทย ลายโบราณ" },
  { id: "abstract", name: "นามธรรม", nameEn: "Abstract", image: "/images/patterns/abstract.png", description: "ลายอิสระ ไร้รูปทรง" },
];

const colorPalettes = [
  { id: "earthy", name: "Earthy", colors: ["#8B6914", "#6B8E23", "#A0522D", "#D2691E"], description: "โทนดิน เขียวมอส น้ำตาล" },
  { id: "bold", name: "Bold", colors: ["#8B2C2C", "#1B2A4A", "#C5A55A", "#2D5A3D"], description: "แดงเข้ม น้ำเงินเข้ม ทอง" },
  { id: "pastel", name: "Pastel", colors: ["#F4C2C2", "#B5EAD7", "#C7CEEA", "#E2F0CB"], description: "ชมพูอ่อน เขียวมิ้นต์ ฟ้าอ่อน" },
  { id: "monochrome", name: "Monochrome", colors: ["#1A1A1A", "#4A4A4A", "#8A8A8A", "#D4D4D4"], description: "ดำ เทา ขาว" },
];

const weaveTypes = [
  { id: "mudmee", name: "มัดหมี่", description: "ผ้ามัดหมี่ ลายจัดทะเลสาบ", texture: "ลายซ้อนกันหลายชั้น" },
  { id: "khid", name: "ขิด", description: "ผ้าขิด ลายบนเส้นยืน", texture: "ลายเล็กเรียบร้อย" },
  { id: "yokdok", name: "ยกดอก", description: "ผ้ายกดอก ยกลายขึ้นมา", texture: "ลายนูนฟู่ฟ่อง" },
  { id: "chok", name: "จก", description: "ผ้าจก ถักเปียหัวจก", texture: "ลายถักทอมือ" },
];

const regions = [
  { id: "north", name: "ล้านนา", description: "ภาคเหนือ", story: "ความงามของวัฒนธรรมล้านนา ลายผ้าสืบทอดจากอาณาจักรล้านนา" },
  { id: "isan", name: "อีสาน", description: "ภาคตะวันออกเฉียงเหนือ", story: "ผ้าไหมมัดหมี่อีสาน มรดกแห่งแผ่นดินอีสาน" },
  { id: "south", name: "ภาคใต้", description: "ภาคใต้ฝั่งอันดามัน", story: "ลายผ้าภาคใต้ สะท้อนวิถีชีวิตริมทะเล" },
  { id: "gi", name: "GI", description: "Geographical Indication", story: "ผ้าที่ได้รับการรับรอง GI จากกรมทรัพย์สินทรัพย์ทางปัญญา" },
];

const moods = [
  { id: "wedding", name: "Wedding", icon: "💒", description: "งานแต่งงาน พิธีการ" },
  { id: "formal", name: "Formal", icon: "👔", description: "ชุดทางการ สุภาพบุรุษ" },
  { id: "casual", name: "Casual", icon: "🏖️", description: "ลำลอง ใส่ทุกวัน" },
  { id: "streetwear", name: "Streetwear", icon: "🎽", description: "สไตล์วัยรุ่น มินิมอล" },
];

interface GuidedCustomFlowProps {
  onBack: () => void;
}

export default function GuidedCustomFlow({ onBack }: GuidedCustomFlowProps) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    patternStyle: "",
    colorPalette: "",
    weaveType: "",
    region: "",
    complexity: 50,
    mood: "",
  });
  const [showRegionPopup, setShowRegionPopup] = useState(false);
  const [selectedRegionForPopup, setSelectedRegionForPopup] = useState<string>("");
  const [generatedPattern, setGeneratedPattern] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalSteps = 10;
  const progress = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 0: return !!selections.patternStyle;
      case 1: return !!selections.colorPalette;
      case 2: return !!selections.weaveType;
      case 3: return !!selections.region;
      case 4: return true;
      case 5: return !!selections.mood;
      default: return true;
    }
  };

  const getPatternName = () => patternStyles.find(p => p.id === selections.patternStyle)?.name || "";
  const getPaletteName = () => colorPalettes.find(p => p.id === selections.colorPalette)?.name || "";
  const getWeaveName = () => weaveTypes.find(w => w.id === selections.weaveType)?.name || "";
  const getRegionName = () => regions.find(r => r.id === selections.region)?.name || "";
  const getMoodName = () => moods.find(m => m.id === selections.mood)?.name || "";

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedPattern("/images/fabric-generated.jpg");
      setIsGenerating(false);
    }, 2000);
  };

  const handleRegionClick = (regionId: string) => {
    setSelectedRegionForPopup(regionId);
    setShowRegionPopup(true);
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Pattern Style
        return (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              เลือกลายผ้า (Pattern Style)
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              เลือกแบบลายที่คุณชอบ
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
              {patternStyles.map((style) => (
                <Box
                  key={style.id}
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelections({ ...selections, patternStyle: style.id })}
                  sx={{
                    border: "2px solid",
                    borderColor: selections.patternStyle === style.id ? "#C5A55A" : "#E5DFD6",
                    borderRadius: 2,
                    p: 1.5,
                    cursor: "pointer",
                    bgcolor: selections.patternStyle === style.id ? "#FDF8EF" : "#FFFFFF",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: 60,
                      bgcolor: "#F5F5F5",
                      borderRadius: 1,
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: 24 }}>🎨</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>
                    {style.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.65rem", color: "#6B7280" }}>
                    {style.nameEn}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        );

      case 1: // Color Palette
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              เลือกโทนสี (Color Palette)
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              เลือกโทนสีที่คุณชอบ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {colorPalettes.map((palette) => (
                <Box
                  key={palette.id}
                  component={motion.div}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelections({ ...selections, colorPalette: palette.id })}
                  sx={{
                    border: "2px solid",
                    borderColor: selections.colorPalette === palette.id ? "#C5A55A" : "#E5DFD6",
                    borderRadius: 2,
                    p: 2,
                    cursor: "pointer",
                    bgcolor: selections.colorPalette === palette.id ? "#FDF8EF" : "#FFFFFF",
                    transition: "all 0.2s",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: "#1B2A4A" }}>{palette.name}</Typography>
                    {selections.colorPalette === palette.id && (
                      <CheckRoundedIcon sx={{ color: "#C5A55A" }} />
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
                    {palette.colors.map((color, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: color,
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{palette.description}</Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        );

      case 2: // Weave Type
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              เลือกวิธีทอ (Weave Type)
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              เลือกเทคนิคการทอที่ต้องการ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {weaveTypes.map((weave) => (
                <Box
                  key={weave.id}
                  component={motion.div}
                  whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelections({ ...selections, weaveType: weave.id })}
                  sx={{
                    border: "2px solid",
                    borderColor: selections.weaveType === weave.id ? "#C5A55A" : "#E5DFD6",
                    borderRadius: 2,
                    p: 2,
                    cursor: "pointer",
                    bgcolor: selections.weaveType === weave.id ? "#FDF8EF" : "#FFFFFF",
                    transition: "all 0.2s",
                    "&:hover .weave-preview": {
                      opacity: 1,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#1B2A4A", fontSize: "1.1rem" }}>
                        {weave.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>{weave.description}</Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#C5A55A", mt: 0.5 }}>
                        {weave.texture}
                      </Typography>
                    </Box>
                    <Box
                      className="weave-preview"
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: "#F5F5F5",
                        borderRadius: 1,
                        opacity: 0.7,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "opacity 0.2s",
                      }}
                    >
                      <Typography sx={{ fontSize: 24 }}>🧵</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </motion.div>
        );

      case 3: // Region
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              เลือกภูมิภาค / เรื่องราว (Region / Story)
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              เลือกแหล่งที่มาและเรื่องราวของผ้า
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {regions.map((region) => (
                <Box
                  key={region.id}
                  component={motion.div}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelections({ ...selections, region: region.id })}
                  onDoubleClick={() => handleRegionClick(region.id)}
                  sx={{
                    border: "2px solid",
                    borderColor: selections.region === region.id ? "#C5A55A" : "#E5DFD6",
                    borderRadius: 2,
                    p: 2,
                    cursor: "pointer",
                    bgcolor: selections.region === region.id ? "#FDF8EF" : "#FFFFFF",
                    transition: "all 0.2s",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#1B2A4A", fontSize: "1.1rem" }}>
                        {region.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>{region.description}</Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegionClick(region.id);
                      }}
                      sx={{
                        fontSize: "0.7rem",
                        color: "#C5A55A",
                        textTransform: "none",
                      }}
                    >
                      📖 เรื่องราว
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Storytelling Popup */}
            <AnimatePresence>
              {showRegionPopup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Box
                    sx={{
                      position: "fixed",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1300,
                      p: 2,
                    }}
                    onClick={() => setShowRegionPopup(false)}
                  >
                    <Box
                      component={motion.div}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        bgcolor: "#FFFFFF",
                        borderRadius: 3,
                        p: 3,
                        maxWidth: 400,
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A" }}>
                          {regions.find(r => r.id === selectedRegionForPopup)?.name}
                        </Typography>
                        <IconButton size="small" onClick={() => setShowRegionPopup(false)}>
                          <CloseRoundedIcon />
                        </IconButton>
                      </Box>
                      <Typography sx={{ color: "#6B7280", lineHeight: 1.7 }}>
                        {regions.find(r => r.id === selectedRegionForPopup)?.story}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 4: // Complexity Selection
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 1 }}>
              ระดับความซับซ้อนของลวดลาย
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              เลือกระดับความซับซ้อนที่ต้องการ
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                { label: "เรียบง่าย", value: 25 },
                { label: "ปานกลาง", value: 50 },
                { label: "ซับซ้อน", value: 75 },
                { label: "วิจิตรประณีต", value: 100 },
              ].map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => setSelections({ ...selections, complexity: opt.value })}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: selections.complexity === opt.value ? "2px solid #1B2A4A" : "1px solid #E5DFD6",
                    bgcolor: selections.complexity === opt.value ? "#FDF8EF" : "#FFFFFF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    transition: "all 0.2s",
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "6px",
                      border: "2px solid",
                      borderColor: selections.complexity === opt.value ? "#1B2A4A" : "#D1D5DB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: selections.complexity === opt.value ? "#1B2A4A" : "transparent",
                    }}
                  >
                    {selections.complexity === opt.value && <CheckRoundedIcon sx={{ color: "white", fontSize: 16 }} />}
                  </Box>
                  <Typography sx={{ 
                    fontWeight: selections.complexity === opt.value ? 700 : 400,
                    color: "#1B2A4A" 
                  }}>
                    {opt.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        );

      case 5: // Mood
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              โอกาสใช้งาน (Mood / Occasion)
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              เลือกวันที่จะใช้งาน
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
              {moods.map((mood) => (
                <Box
                  key={mood.id}
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelections({ ...selections, mood: mood.id })}
                  sx={{
                    border: "2px solid",
                    borderColor: selections.mood === mood.id ? "#C5A55A" : "#E5DFD6",
                    borderRadius: 2,
                    p: 2,
                    cursor: "pointer",
                    bgcolor: selections.mood === mood.id ? "#FDF8EF" : "#FFFFFF",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <Typography sx={{ fontSize: 32, mb: 1 }}>{mood.icon}</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#1B2A4A" }}>{mood.name}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{mood.description}</Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        );

      case 6: // AI Summary
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              📋 AI สรุปความต้องการ
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              ตรวจสอบความถูกต้องก่อน Generate
            </Typography>
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                border: "2px solid #C5A55A",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                <Chip label={`Pattern: ${getPatternName()}`} size="small" sx={{ bgcolor: "#FDF8EF", color: "#A68A3A" }} />
                <Chip label={`Color: ${getPaletteName()}`} size="small" sx={{ bgcolor: "#FDF8EF", color: "#A68A3A" }} />
                <Chip label={`Weave: ${getWeaveName()}`} size="small" sx={{ bgcolor: "#FDF8EF", color: "#A68A3A" }} />
                <Chip label={`Region: ${getRegionName()}`} size="small" sx={{ bgcolor: "#FDF8EF", color: "#A68A3A" }} />
                <Chip label={`Mood: ${getMoodName()}`} size="small" sx={{ bgcolor: "#FDF8EF", color: "#A68A3A" }} />
              </Box>
              <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>
                Complexity: {
                  selections.complexity === 25 ? "เรียบง่าย" :
                  selections.complexity === 50 ? "ปานกลาง" :
                  selections.complexity === 75 ? "ซับซ้อน" :
                  selections.complexity === 100 ? "วิจิตรประณีต" : "ปานกลาง"
                }
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<CheckRoundedIcon />}
                sx={{
                  flex: 1,
                  bgcolor: "#1B2A4A",
                  "&:hover": { bgcolor: "#0F1A30" },
                }}
                onClick={() => setStep(7)}
              >
                ✅ Confirm
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditRoundedIcon />}
                sx={{
                  flex: 1,
                  borderColor: "#E5DFD6",
                  color: "#1B2A4A",
                }}
                onClick={() => setStep(0)}
              >
                ✏️ Edit
              </Button>
            </Box>
          </motion.div>
        );

      case 7: // Generate
        return (
          <motion.div
            key="step7"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              🎨 AI กำลังสร้างลายผ้า
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              กรุณารอสักครู่...
            </Typography>
            <Box
              sx={{
                height: 300,
                bgcolor: "#F5F5F5",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              {isGenerating ? (
                <Box sx={{ textAlign: "center" }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 64, color: "#C5A55A", animation: "spin 2s linear infinite", "@keyframes spin": { from: { rotate: 0 }, to: { rotate: 360 } } }} />
                  <Typography sx={{ mt: 2, color: "#6B7280" }}>กำลัง Generate...</Typography>
                </Box>
              ) : generatedPattern ? (
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: "#FFFFFF",
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    backgroundImage: `url(${generatedPattern})`,
                    backgroundSize: "cover",
                  }}
                />
              ) : null}
            </Box>
            <Button
              fullWidth
              variant="contained"
              disabled={isGenerating}
              onClick={handleGenerate}
              sx={{
                bgcolor: "#C5A55A",
                color: "#1B2A4A",
                fontWeight: 700,
                py: 1.5,
                "&:hover": { bgcolor: "#B89545" },
              }}
            >
              {isGenerating ? "กำลังสร้าง..." : "🎨 Generate"}
            </Button>
          </motion.div>
        );

      case 8: // Preview
        return (
          <motion.div
            key="step8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              👗 Preview
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              ดูตัวอย่างผ้าในรูปแบบต่างๆ
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
              {[
                { name: "Fabric Swatch", icon: "🧵" },
                { name: "เสื้อ", icon: "👕" },
                { name: "ผ้าพันคอ", icon: "🧣" },
                { name: "Poster", icon: "🖼️" },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    bgcolor: "#FFFFFF",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    border: "1px solid #E5DFD6",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography sx={{ fontSize: 36, mb: 1 }}>{item.icon}</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600 }}>{item.name}</Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        );

      case 9: // Action
        return (
          <motion.div
            key="step9"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              💾 เลือกการดำเนินการ
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
              บันทึกหรือแชร์ผลงานของคุณ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                sx={{
                  bgcolor: "#1B2A4A",
                  py: 2,
                  justifyContent: "flex-start",
                  "&:hover": { bgcolor: "#0F1A30" },
                }}
              >
                Download (512×512)
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SendRoundedIcon />}
                sx={{
                  bgcolor: "#C5A55A",
                  color: "#1B2A4A",
                  py: 2,
                  justifyContent: "flex-start",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#B89545" },
                }}
              >
                Send to Weaver
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ShareRoundedIcon />}
                sx={{
                  borderColor: "#E5DFD6",
                  color: "#1B2A4A",
                  py: 2,
                  justifyContent: "flex-start",
                }}
              >
                Share
              </Button>
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 2, pb: 1 }}>
        <IconButton size="small" onClick={onBack}>
          <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18, color: "#1B2A4A" }} />
        </IconButton>
        <Typography sx={{ flex: 1, fontWeight: 700, color: "#1B2A4A", textAlign: "center" }}>
          Guided Custom
        </Typography>
        <Box sx={{ width: 32 }} />
      </Box>

      {/* Progress */}
      <Box sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>
            ขั้นตอนที่ {step + 1} จาก {totalSteps}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: "#C5A55A", fontWeight: 600 }}>
            {step === 6 ? "AI Summary" :
             step === 7 ? "Generate" :
             step === 8 ? "Preview" :
             step === 9 ? "Action" :
             `Step ${step + 1}`}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: "#E5DFD6",
            "& .MuiLinearProgress-bar": { bgcolor: "#C5A55A", borderRadius: 2 },
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 2, py: 2, minHeight: 400 }}>
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </Box>

      {/* Navigation */}
      {step < 6 && (
        <Box sx={{ px: 2, pb: 3, display: "flex", gap: 1.5 }}>
          {step > 0 && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setStep(step - 1)}
              sx={{
                borderColor: "#E5DFD6",
                color: "#1B2A4A",
                py: 1.5,
                borderRadius: 2,
              }}
            >
              ย้อนกลับ
            </Button>
          )}
          <Button
            fullWidth
            variant="contained"
            disabled={!canProceed()}
            onClick={() => setStep(step + 1)}
            sx={{
              bgcolor: "#1B2A4A",
              py: 1.5,
              borderRadius: 2,
              "&:hover": { bgcolor: "#0F1A30" },
            }}
          >
            ถัดไป
          </Button>
        </Box>
      )}
    </Box>
  );
}