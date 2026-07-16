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
  { id: "all",      name: "ทั้งหมด" },
  { id: "floral",   name: "ดอกไม้/ธรรมชาติ" },
  { id: "animal",   name: "สัตว์/สิ่งมีชีวิต" },
  { id: "geo",      name: "เรขาคณิต" },
  { id: "trad",     name: "โบราณ/พิธี" },
  { id: "mudmee",   name: "ลายหมี่" },
  { id: "royal",    name: "ชาววัง/ประณีต" },
  { id: "local",    name: "พื้นบ้าน" },
];

const PATTERN_DATA: PatternItem[] = [
  { id: "p1",  name: "ลายดอกบัว",         province: "เชียงใหม่",    categoryId: "floral",  categoryName: "ดอกไม้",   placeholderColor: "#fdf4f6", iconType: "flower" },
  { id: "p2",  name: "ลายนาค",            province: "ลำพูน",        categoryId: "animal",  categoryName: "สัตว์",    placeholderColor: "#fdf8ec", iconType: "animal" },
  { id: "p3",  name: "ลายเพชร",           province: "น่าน",          categoryId: "geo",     categoryName: "เรขาคณิต", placeholderColor: "#eff3f8", iconType: "geo" },
  { id: "p4",  name: "ลายหงส์",           province: "อุบลราชธานี",  categoryId: "animal",  categoryName: "สัตว์",    placeholderColor: "#fdf8ec", iconType: "animal" },
  { id: "p5",  name: "ลายขอ",             province: "ขอนแก่น",      categoryId: "geo",     categoryName: "เรขาคณิต", placeholderColor: "#eff3f8", iconType: "geo" },
  { id: "p6",  name: "ลายช้าง",           province: "เชียงราย",     categoryId: "animal",  categoryName: "สัตว์",    placeholderColor: "#fdf8ec", iconType: "animal" },
  { id: "p7",  name: "ลายซิกแซก",         province: "แพร่",          categoryId: "mudmee",  categoryName: "มัดหมี่",  placeholderColor: "#f3f0fc", iconType: "abstract" },
  { id: "p8",  name: "ลายกินนร",          province: "สุโขทัย",      categoryId: "royal",   categoryName: "ประณีต",   placeholderColor: "#faf6df", iconType: "flow" },
  { id: "p9",  name: "ลายใบไม้",          province: "นครราชสีมา",   categoryId: "local",   categoryName: "พื้นบ้าน", placeholderColor: "#edf6ec", iconType: "flow" },
  { id: "p10", name: "ลายดาวล้อมเดือน",   province: "สุโขทัย",      categoryId: "trad",    categoryName: "โบราณ",    placeholderColor: "#faf1ed", iconType: "circle" },
];

// Direct pattern id → pixel-art image (one unique image per pattern)
export const PATTERN_IMAGE: Record<string, string> = {
  p1:  "/patterns/lotus.webp",
  p2:  "/patterns/naga.webp",
  p3:  "/patterns/diamond.webp",
  p4:  "/patterns/swan.webp",
  p5:  "/patterns/hook.webp",
  p6:  "/patterns/elephant.webp",
  p7:  "/patterns/zigzag.webp",
  p8:  "/patterns/kinnara.webp",
  p9:  "/patterns/leaf.webp",
  p10: "/patterns/star_moon.webp",
};

export { PATTERN_DATA };

function getPatternImage(item: PatternItem): string {
  return PATTERN_IMAGE[item.id] ?? "/patterns/lotus.webp";
}

/** หา path รูปลายจาก "ชื่อ" ลาย (ค่าที่เก็บใน CustomPatternData.selectedPatterns) — ใช้ตอนส่งไป generate จริง */
export function getPatternImageByName(name: string): string | undefined {
  const item = PATTERN_DATA.find((p) => p.name === name);
  return item ? PATTERN_IMAGE[item.id] : undefined;
}

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

  // เลือกได้ทีละ 1 ลายเท่านั้น (single-select) — เพราะตอนนี้ flow คือ "ใช้ลายเทมเพลตนี้จริง แล้วแค่เปลี่ยนสี"
  // ไม่ใช่ให้ AI ผสม (blend) หลายลายเป็นดีไซน์ใหม่แบบเดิมอีกต่อไป เลือกลายใหม่จะแทนที่ลายเดิมทันที
  const togglePattern = (name: string) => {
    if (selectedPatterns.includes(name)) {
      onChange([]);
    } else {
      onChange([name]);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      
      {/* 1. Search Bar */}
      <Box sx={{ px: { xs: 2, md: 6, lg: 8 }, pb: 1 }}>
        <TextField
          placeholder="ค้นหาลาย..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#9CA3AF" }} /></InputAdornment>,
            sx: { borderRadius: 6, bgcolor: "#FFFFFF", fontFamily: '"Kanit", sans-serif' }
          }}
        />
      </Box>

      {/* 2. Filter Pills */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          px: { xs: 2, md: 6, lg: 8 },
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
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", fontWeight: activeCategory === cat.id ? 600 : 400 }}>
              {cat.id === "all" ? `ทั้งหมด (${PATTERN_DATA.length})` : cat.name}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 3. Grid Gallery (Remove fixed height overflow so it scrolls normally) */}
      <Box sx={{ px: { xs: 2, md: 6, lg: 8 }, pb: 8, flex: 1 }}>
        <Typography sx={{ textAlign: "center", fontSize: "0.75rem", color: "#9CA3AF", mb: 2 }}>
          {filteredPatterns.length > 0 ? "เลื่อนดูเพิ่มเติม ›" : "ไม่พบลายที่ตรงกับการค้นหา"}
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" }, gap: 1.5 }}>
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
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <Box
                        component="img"
                        src={getPatternImage(pattern)}
                        alt={pattern.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 0.3s",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                      />
                    </Box>

                    {/* Text Area */}
                    <Box sx={{ p: 1.5 }}>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.85rem", color: "#1B2A4A", lineHeight: 1.2 }}>
                        {pattern.name}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280", mt: 0.2 }}>
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
          position: "sticky",
          bottom: 0,
          width: "100%",
          bgcolor: "#FFFFFF",
          borderTopLeftRadius: { xs: 24, md: 24 },
          borderTopRightRadius: { xs: 24, md: 24 },
          boxShadow: "0 -10px 40px rgba(0,0,0,0.08)",
          p: { xs: 3, md: 4 },
          pt: 3,
          pb: { xs: 4, md: 8 }, // Give padding on bottom to clear Desktop Login Footer (≈64px)
          zIndex: 10,
          mt: "auto",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>
            แสดง {filteredPatterns.length} จาก {PATTERN_DATA.length} ลาย
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A" }}>
            ลายที่เลือก
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
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#A68A3A", fontWeight: 600 }}>
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
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#A68A3A" }}>
                  + กดเลือกลายเทมเพลตที่ต้องการ
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
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            py: 1.5,
            borderRadius: 3,
            "&:hover": { bgcolor: "#B89545" },
            "&.Mui-disabled": { bgcolor: "#E5DFD6", color: "#9CA3AF" },
          }}
        >
          {selectedPatterns.length > 0 ? `ดำเนินการต่อ (${selectedPatterns[0]})` : "โปรดเลือกลาย"}
        </Button>
      </Box>
    </Box>
  );
}
