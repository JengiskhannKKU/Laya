"use client";

import { useState } from "react";
import { Box, Typography, TextField, InputAdornment, Checkbox, IconButton, Button } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { motion, AnimatePresence } from "framer-motion";

export interface PatternItem {
  id: string;
  name: string;
  province: string;
  categoryId: string;
  categoryName: string;
  placeholderColor: string;
  iconType: "geo" | "flower" | "circle" | "abstract" | "animal" | "flow";
}

const CATEGORIES = [
  { id: "all", name: "ทั้งหมด" },
  { id: "floral", name: "ดอกไม้/ธรรมชาติ" },
  { id: "animal", name: "สัตว์/สิ่งมีชีวิต" },
  { id: "geo", name: "เรขาคณิต" },
  { id: "trad", name: "กง/วง/ซ้ำ" },
  { id: "mudmee", name: "ลายหมี่" },
  { id: "royal", name: "ชาววัง/ประณีต" },
  { id: "flow", name: "ขอ/เกี่ยว" },
  { id: "ceremony", name: "พิธี/ความเชื่อ" },
  { id: "local", name: "พื้นบ้าน" },
];

const PATTERN_DATA: PatternItem[] = [
  // 1. Floral
  { id: "p1", name: "ลายดอกแก้ว", province: "สระแก้ว", categoryId: "floral", categoryName: "ดอกไม้", placeholderColor: "#e6f0e6", iconType: "flower" },
  { id: "p2", name: "ลายหมี่สร้อยดอกหมาก", province: "มหาสารคาม", categoryId: "floral", categoryName: "ดอกไม้", placeholderColor: "#fbeef5", iconType: "flower" },
  // 2. Animal
  { id: "p3", name: "ลายนาคเกี้ยว", province: "หนองคาย", categoryId: "animal", categoryName: "สัตว์", placeholderColor: "#fff4e6", iconType: "animal" },
  { id: "p4", name: "ลายแมงมุม", province: "ขอนแก่น", categoryId: "animal", categoryName: "สัตว์", placeholderColor: "#e6e6f0", iconType: "animal" },
  // 3. Geo
  { id: "p5", name: "ลายตาคั่น", province: "ทั่วไป", categoryId: "geo", categoryName: "เรขาคณิต", placeholderColor: "#f0f0f0", iconType: "geo" },
  { id: "p6", name: "ลายข้าวหลามตัด", province: "สุรินทร์", categoryId: "geo", categoryName: "เรขาคณิต", placeholderColor: "#e6f0fa", iconType: "geo" },
  // 4. Trad Core
  { id: "p7", name: "ลายกงห้าวง", province: "ร้อยเอ็ด", categoryId: "trad", categoryName: "ดั้งเดิม", placeholderColor: "#fef0e6", iconType: "circle" },
  { id: "p8", name: "ลายกงเจ็ดสาย", province: "กาฬสินธุ์", categoryId: "trad", categoryName: "ดั้งเดิม", placeholderColor: "#f0e6fa", iconType: "circle" },
  // 5. Mudmee
  { id: "p9", name: "ลายหมี่ขอกระดูก", province: "บุรีรัมย์", categoryId: "mudmee", categoryName: "มัดหมี่", placeholderColor: "#fae6e6", iconType: "abstract" },
  { id: "p10", name: "ลายหมี่ตาคั่น", province: "อุดรธานี", categoryId: "mudmee", categoryName: "มัดหมี่", placeholderColor: "#e6fae6", iconType: "geo" },
  // 6. Royal
  { id: "p11", name: "ลายขอชาววัง", province: "สุโขทัย", categoryId: "royal", categoryName: "ประณีต", placeholderColor: "#fafae6", iconType: "flow" },
  // 7. Flow
  { id: "p12", name: "ลายขอเกี่ยว", province: "แพร่", categoryId: "flow", categoryName: "ต่อเนื่อง", placeholderColor: "#e6fafa", iconType: "flow" },
  // 8. Ceremony
  { id: "p13", name: "ลายขันหมากเบ็ง", province: "สกลนคร", categoryId: "ceremony", categoryName: "พิธี", placeholderColor: "#fae6fa", iconType: "abstract" },
  // 9. Local
  { id: "p14", name: "ลายทิวไหมตีนจก", province: "ราชบุรี", categoryId: "local", categoryName: "พื้นบ้าน", placeholderColor: "#f5f5f5", iconType: "geo" },
  { id: "p15", name: "ลายโฮล", province: "สุรินทร์", categoryId: "local", categoryName: "พื้นบ้าน", placeholderColor: "#fff0f5", iconType: "geo" },
];

// Simple SVG generator for placeholders
const PlaceholderSVG = ({ type, color }: { type: string; color: string }) => {
  const getIcon = () => {
    switch (type) {
      case "geo": return <path d="M 10 10 h 80 v 80 h -80 Z M 50 10 v 80 M 10 50 h 80" stroke="rgba(0,0,0,0.2)" strokeWidth="4" fill="none" />;
      case "flower": return <circle cx="50" cy="50" r="30" stroke="rgba(0,0,0,0.2)" strokeWidth="4" fill="none" />;
      case "circle": return <circle cx="50" cy="50" r="40" stroke="rgba(0,0,0,0.2)" strokeWidth="4" fill="none" strokeDasharray="10 5" />;
      case "animal": return <path d="M 20 50 Q 50 10 80 50 T 80 90" stroke="rgba(0,0,0,0.2)" strokeWidth="4" fill="none" />;
      case "flow": return <path d="M 20 80 Q 50 20 80 80" stroke="rgba(0,0,0,0.2)" strokeWidth="6" fill="none" />;
      default: return <circle cx="50" cy="50" r="20" stroke="rgba(0,0,0,0.2)" strokeWidth="4" fill="none" />;
    }
  };
  return (
    <svg width="60%" height="60%" viewBox="0 0 100 100" style={{ margin: "auto", display: "block" }}>
      {getIcon()}
    </svg>
  );
};

interface PatternGalleryProps {
  selectedPatterns: string[]; // names of patterns
  onChange: (patterns: string[]) => void;
  onNext: () => void;
}

export default function PatternGallery({ selectedPatterns, onChange, onNext }: PatternGalleryProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPatterns = PATTERN_DATA.filter((p) => {
    const matchSearch = p.name.includes(search) || p.province.includes(search);
    const matchCat = activeCategory === "all" || p.categoryId === activeCategory;
    return matchSearch && matchCat;
  });

  const togglePattern = (name: string) => {
    if (selectedPatterns.includes(name)) {
      onChange(selectedPatterns.filter(p => p !== name));
    } else {
      if (selectedPatterns.length < 3) {
        onChange([...selectedPatterns, name]);
      } else {
        alert("เบลนด์(Blend) ลายได้สูงสุด 3 ลาย");
      }
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      
      {/* 1. Search Bar */}
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          placeholder="ค้นหาลาย..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#9CA3AF" }} /></InputAdornment>,
            sx: { borderRadius: 6, bgcolor: "#FFFFFF", fontFamily: '"Noto Serif Thai", serif' }
          }}
        />
      </Box>

      {/* 2. Filter Pills */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          px: 2,
          pb: 2,
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((cat) => (
          <Box
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            sx={{
              px: activeCategory === cat.id ? 2 : 1.5,
              py: 0.8,
              borderRadius: 6,
              bgcolor: activeCategory === cat.id ? "#1B2A4A" : "#FFFFFF",
              border: `1px solid ${activeCategory === cat.id ? "#1B2A4A" : "#E5DFD6"}`,
              color: activeCategory === cat.id ? "#FFFFFF" : "#6B7280",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
              boxShadow: activeCategory === cat.id ? "0 4px 10px rgba(27,42,74,0.2)" : "none",
            }}
          >
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", fontWeight: activeCategory === cat.id ? 600 : 400 }}>
              {cat.id === "all" ? `ทั้งหมด (${PATTERN_DATA.length})` : cat.name}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 3. Grid Gallery */}
      <Box sx={{ px: 2, pb: 20, flex: 1, overflowY: "auto" }}>
        <Typography sx={{ textAlign: "center", fontSize: "0.75rem", color: "#9CA3AF", mb: 2 }}>
          {filteredPatterns.length > 0 ? "เลื่อนดูเพิ่มเติม ›" : "ไม่พบลายที่ตรงกับการค้นหา"}
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <AnimatePresence>
            {filteredPatterns.map((pattern) => {
              const isSelected = selectedPatterns.includes(pattern.name);
              return (
                <motion.div
                  key={pattern.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    onClick={() => togglePattern(pattern.name)}
                    sx={{
                      bgcolor: "#FFFFFF",
                      borderRadius: 4,
                      overflow: "hidden",
                      border: `2px solid ${isSelected ? "#1B2A4A" : "transparent"}`,
                      boxShadow: isSelected ? "0 8px 16px rgba(27,42,74,0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.2s",
                    }}
                  >
                    {/* Checkbox Overlay */}
                    <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
                      {isSelected ? (
                        <CheckCircleRoundedIcon sx={{ color: "#1B2A4A", fontSize: 24, bgcolor: "rgba(255,255,255,0.8)", borderRadius: "50%" }} />
                      ) : (
                        <RadioButtonUncheckedRoundedIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 24 }} />
                      )}
                    </Box>

                    {/* Image Area */}
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: "1/1",
                        bgcolor: pattern.placeholderColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PlaceholderSVG type={pattern.iconType} color={pattern.placeholderColor} />
                    </Box>

                    {/* Text Area */}
                    <Box sx={{ p: 1.5 }}>
                      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "0.85rem", color: "#1B2A4A", lineHeight: 1.2 }}>
                        {pattern.name}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.75rem", color: "#6B7280", mt: 0.2 }}>
                        {pattern.province}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      </Box>

      {/* 4. Bottom Selection Tray */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "#FFFFFF",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: "0 -10px 40px rgba(0,0,0,0.08)",
          p: 3,
          pt: 2,
          pb: 4,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#6B7280" }}>
            แสดง {filteredPatterns.length} จาก {PATTERN_DATA.length} ลาย
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A" }}>
            ลายที่เลือก (Blend)
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, minHeight: 40, mb: 3 }}>
          <AnimatePresence>
            {selectedPatterns.map((p) => (
              <motion.div key={p} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                <Box
                  onClick={() => togglePattern(p)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: "rgba(197, 165, 90, 0.15)",
                    border: "1px solid rgba(197, 165, 90, 0.3)",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", color: "#A68A3A", fontWeight: 600 }}>
                    {p}
                  </Typography>
                  <CloseRoundedIcon sx={{ fontSize: 14, color: "#A68A3A" }} />
                </Box>
              </motion.div>
            ))}
            {selectedPatterns.length === 0 && (
               <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px dashed #A68A3A",
                  px: 2,
                  py: 0.5,
                  borderRadius: 4,
                  opacity: 0.6,
                }}
              >
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", color: "#A68A3A" }}>
                  + กดเลือกรูปเพื่อเพิ่มลาย
                </Typography>
              </Box>
            )}
          </AnimatePresence>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={onNext}
          disabled={selectedPatterns.length === 0}
          sx={{
            bgcolor: "#C5A55A",
            color: "#1B2A4A",
            fontFamily: '"Noto Serif Thai", serif',
            fontWeight: 700,
            py: 1.5,
            borderRadius: 3,
            "&:hover": { bgcolor: "#B89545" },
            "&.Mui-disabled": { bgcolor: "#E5DFD6", color: "#9CA3AF" },
          }}
        >
          {selectedPatterns.length > 0 ? `ดำเนินการต่อ (${selectedPatterns.length} ลาย)` : "โปรดเลือกลาย"}
        </Button>
      </Box>
    </Box>
  );
}
