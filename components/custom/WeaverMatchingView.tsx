"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Avatar, Rating, Button, LinearProgress, Chip, IconButton, Skeleton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { weavers, type Weaver, type CustomPatternData } from "@/lib/mock-data";

interface WeaverMatchingViewProps {
  patternData: CustomPatternData;
  onSelectWeaver: (weaver: Weaver) => void;
}

export default function WeaverMatchingView({ patternData, onSelectWeaver }: WeaverMatchingViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");

  useEffect(() => {
    // Simulate AI analysis delay
    const timer = setTimeout(() => setIsAnalyzing(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const matchedWeavers = useMemo(() => {
    // Normalize complexity from 0-100 scale to 1-10 scale
    const normalizedComplexity = (patternData.complexity || 50) / 10;

    // 1. Must-match filtering
    let filtered = weavers.filter(weaver => {
      // Must match technique (check if patternData.weaveType includes the technique keyword)
      const techniqueMatch = !patternData.weaveType || 
        weaver.techniques.some(t => patternData.weaveType?.toLowerCase().includes(t.toLowerCase()));
      
      // Must match complexity (weaver's limit should handle the pattern's request)
      const complexityMatch = weaver.complexityLimit >= normalizedComplexity;

      // Must have at least some overlapping colors (Relaxed for prototype, but can be strict)
      // For this demo, we'll allow all but show the "Thread Status"
      
      return techniqueMatch && complexityMatch;
    });

    if (filtered.length === 0) {
       // Fallback for mockup: if no weavers match the exact combination, just show all weavers
       filtered = weavers;
    }

    // 2. Scoring
    const scored = filtered.map(weaver => {
      let score = 0;
      
      // Technique compatibility (100% if matched)
      const techniqueScore = 100;
      
      // Complexity score
      const complexityScore = Math.round(Math.min(100, Math.max(60, 100 - Math.abs(weaver.complexityLimit - normalizedComplexity) * 5)));
      
      // Color score (based on colors in stock)
      const patternColors = patternData.colors || [];
      const colorsInStock = patternColors.filter((c: string) => weaver.colorsInStock.includes(c));
      const colorScore = patternColors.length > 0 ? (colorsInStock.length / patternColors.length) * 100 : 100;
      
      // Heritage/Experience score
      const experienceScore = Math.min(100, (weaver.experienceYears / 40) * 100);

      // Total Match Score (weighted)
      const totalScore = Math.round(
        (techniqueScore * 0.3) + 
        (complexityScore * 0.2) + 
        (colorScore * 0.3) + 
        (experienceScore * 0.2)
      );

      return {
        ...weaver,
        matchScore: totalScore,
        techniqueScore,
        complexityScore,
        colorScore,
        experienceScore,
        missingColors: patternColors.filter((c: string) => !weaver.colorsInStock.includes(c))
      };
    });

    // 3. Sorting & Final Filters
    let finalResults = scored.sort((a, b) => b.matchScore - a.matchScore);

    if (activeFilter === "พร้อมทอเร็ว") {
      finalResults = [...finalResults].sort((a, b) => a.leadTimeDays - b.leadTimeDays);
    } else if (activeFilter === "GI รับรอง") {
      finalResults = finalResults.filter(w => w.isGI);
    } else if (activeFilter === "ราคาต่ำสุด") {
      finalResults = [...finalResults].sort((a, b) => a.basePrice - b.basePrice);
    }

    return finalResults;
  }, [patternData, activeFilter]);

  if (isAnalyzing) {
    return (
      <Box sx={{ p: 3, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, pt: 8 }}>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A" }}>
          AI กำลังวิเคราะห์ลายผ้าของคุณ...
        </Typography>
        <Box sx={{ width: "100%", position: "relative", height: 80, display: "flex", justifyContent: "center" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ width: 60, height: 60, border: "4px solid #F0F0F0", borderTop: "4px solid #C5A55A", borderRadius: "50%" }}
          />
        </Box>
        <Box sx={{ width: "100%", maxWidth: 300 }}>
          <LinearProgress variant="indeterminate" sx={{ height: 6, borderRadius: 3, bgcolor: "#E5DFD6", "& .MuiLinearProgress-bar": { bgcolor: "#C5A55A" } }} />
          <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", mt: 2 }}>
            ตรวจสอบความซับซ้อนของลาย และเทคนิคการทอที่เหมาะสม
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0, pb: 12 }}>
      {/* 1. Pattern Summary Header */}
      <Box sx={{ p: 2, bgcolor: "#FFFFFF", borderBottom: "1px solid #E5DFD6" }}>
        <Box sx={{ display: "flex", gap: 2, p: 1.5, bgcolor: "#FAF6F0", borderRadius: "16px", border: "1px solid #E5DFD6" }}>
          <Box sx={{ width: 80, height: 80, borderRadius: "12px", bgcolor: "#FFFFFF", p: 0.5, border: "1px solid #E5DFD6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <Box sx={{ width: "100%", height: "100%", backgroundImage: `url(${patternData.generatedImageUrl || "/images/fabric1.jpg"})`, backgroundSize: "cover", borderRadius: "8px" }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#1B2A4A", fontSize: "1rem" }}>Your Pattern</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>
              {patternData.mood || 'ดั้งเดิม'} • {(patternData.colors || []).join(" + ") || "หลากสี"} • ซับซ้อน {patternData.complexity || 50}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
              {[patternData.weaveType || "ลายทอ", ...(patternData.colors || []).slice(0, 1), (patternData.complexity || 50) >= 75 ? "Intricate" : "Standard"].map((tag, idx) => (
                <Chip key={`${tag}-${idx}`} label={tag} size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#E5DFD6", color: "#6B7280" }} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 2. Filters */}
      <Box sx={{ display: "flex", gap: 1, p: 2, overflowX: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
        {["ทั้งหมด", "พร้อมทอเร็ว", "GI รับรอง", "ราคาต่ำสุด"].map(f => (
          <Chip
            key={f}
            label={f}
            onClick={() => setActiveFilter(f)}
            sx={{
              bgcolor: activeFilter === f ? "#1B2A4A" : "#FFFFFF",
              color: activeFilter === f ? "#FFFFFF" : "#1B2A4A",
              border: "1px solid",
              borderColor: activeFilter === f ? "#1B2A4A" : "#E5DFD6",
              fontWeight: activeFilter === f ? 700 : 500,
              "&:hover": { bgcolor: activeFilter === f ? "#1B2A4A" : "#F8F8F8" }
            }}
          />
        ))}
      </Box>

      {/* 3. Results Header */}
      <Box sx={{ px: 2, mb: 1 }}>
        <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>
          พบ <Box component="span" sx={{ fontWeight: 700, color: "#1B2A4A" }}>{matchedWeavers.length} ช่างทอ</Box> ที่จับคู่ได้ · เรียงตาม Match Score
        </Typography>
      </Box>

      {/* 4. Weaver List */}
      <Box sx={{ px: 2, display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
        {matchedWeavers.map((weaver, idx) => (
          <Box 
            key={weaver.id}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            sx={{ 
              bgcolor: "#FFFFFF", 
              borderRadius: "20px", 
              border: "1px solid #E5DFD6", 
              overflow: "hidden",
              position: "relative",
              boxShadow: idx === 0 ? "0 10px 25px rgba(197,165,90,0.15)" : "none",
              borderColor: idx === 0 ? "#C5A55A" : "#E5DFD6"
            }}
          >
            {idx === 0 && (
              <Box sx={{ bgcolor: "#C5A55A", py: 0.8, px: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#FFFFFF" }}>
                  ★ แนะนำอันดับ 1 - Match Score {weaver.matchScore}%
                </Typography>
              </Box>
            )}

            <Box sx={{ p: 2 }}>
              {/* Profile Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Avatar 
                    src={weaver.avatar?.startsWith("http") ? weaver.avatar : undefined}
                    sx={{ width: 56, height: 56, bgcolor: "#1B2A4A", fontWeight: 700 }}
                  >
                    {!weaver.avatar?.startsWith("http") && weaver.avatar}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#1B2A4A", fontSize: "1.05rem" }}>{weaver.name}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{weaver.community} • {weaver.province}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, mt: 0.5 }}>
                      <Rating value={weaver.rating} readOnly size="small" sx={{ fontSize: "0.9rem", color: "#C5A55A" }} />
                      <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>({weaver.rating}) {weaver.reviewCount} รีวิว</Typography>
                    </Box>
                  </Box>
                </Box>
                {idx !== 0 && (
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: "#4B7355" }}>{weaver.matchScore}%</Typography>
                    <Typography sx={{ fontSize: "0.6rem", color: "#9CA3AF" }}>match</Typography>
                  </Box>
                )}
              </Box>

              {/* Match Bars */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}>
                {[
                  { label: "เทคนิคการทอ", value: weaver.techniqueScore },
                  { label: "ความซับซ้อน", value: weaver.complexityScore },
                  { label: "สีด้ายตรง", value: weaver.colorScore },
                  { label: "ลายคล้ายที่เคยทำ", value: 85 } // Mocked similarity
                ].map(bar => (
                  <Box key={bar.label} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography sx={{ minWidth: 90, fontSize: "0.75rem", color: "#6B7280" }}>{bar.label}</Typography>
                    <Box sx={{ flex: 1, height: 6, bgcolor: "#F0F0F0", borderRadius: 3, overflow: "hidden" }}>
                      <Box sx={{ height: "100%", bgcolor: bar.value > 90 ? "#4B7355" : "#C5A55A", width: `${bar.value}%` }} />
                    </Box>
                    <Typography sx={{ minWidth: 35, fontSize: "0.75rem", fontWeight: 700, color: "#1B2A4A", textAlign: "right" }}>{bar.value}%</Typography>
                  </Box>
                ))}
              </Box>

              {/* Color Status */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {(patternData.colors || []).map((color: string, i: number) => (
                    <Box key={i} sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: color, border: "1px solid rgba(0,0,0,0.1)" }} />
                  ))}
                </Box>
                {weaver.missingColors.length === 0 ? (
                  <Typography sx={{ fontSize: "0.75rem", color: "#4B7355", fontWeight: 600 }}>
                    ✓ มีครบทุกสี
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: "0.75rem", color: "#8E601C" }}>
                    ขาด {weaver.missingColors.join(", ")} (สั่งได้ +3 วัน)
                  </Typography>
                )}
              </Box>

              {/* Tags */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 2.5 }}>
                {weaver.techniques.slice(0, 1).map(t => (
                  <Chip key={t} label={t + " ✓"} size="small" sx={{ height: 24, bgcolor: "#E9F2E9", color: "#4B7355", fontSize: "0.7rem", fontWeight: 600 }} />
                ))}
                <Chip label={`ประสบการณ์ ${weaver.experienceYears} ปี`} size="small" sx={{ height: 24, bgcolor: "#FDF8F0", color: "#8E601C", fontSize: "0.7rem" }} />
                {weaver.isGI && (
                  <Chip label="GI รับรอง ✓" size="small" sx={{ height: 24, bgcolor: "#F0F4F8", color: "#1B2A4A", fontSize: "0.7rem", fontWeight: 600 }} />
                )}
              </Box>

              {/* Status Box */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, mb: 2.5 }}>
                <Box sx={{ bgcolor: "#F8F8F8", p: 1, borderRadius: "12px", textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1B2A4A" }}>{weaver.leadTimeDays}-{weaver.leadTimeDays + 3} วัน</Typography>
                  <Typography sx={{ fontSize: "0.6rem", color: "#9CA3AF" }}>ส่งภายใน</Typography>
                </Box>
                <Box sx={{ bgcolor: "#F8F8F8", p: 1, borderRadius: "12px", textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1B2A4A" }}>{weaver.basePrice.toLocaleString()} ฿/ม.</Typography>
                  <Typography sx={{ fontSize: "0.6rem", color: "#9CA3AF" }}>ราคาเริ่มต้น</Typography>
                </Box>
                <Box sx={{ bgcolor: weaver.status === "available" ? "#E9F2E9" : "#FDF8F0", p: 1, borderRadius: "12px", textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: weaver.status === "available" ? "#4B7355" : "#8E601C" }}>
                    {weaver.status === "available" ? "ว่าง" : "รอคิว"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", color: "#9CA3AF" }}>สถานะ</Typography>
                </Box>
              </Box>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  sx={{ borderRadius: "12px", color: "#1B2A4A", borderColor: "#E5DFD6", textTransform: "none", py: 1 }}
                >
                  ดูโปรไฟล์
                </Button>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => onSelectWeaver(weaver)}
                  sx={{ borderRadius: "12px", bgcolor: idx === 0 ? "#1B2A4A" : "#8E887D", textTransform: "none", py: 1 }}
                >
                  เลือกช่างนี้ ›
                </Button>
              </Box>
            </Box>
          </Box>
        ))}

        <Button 
          fullWidth 
          variant="outlined" 
          sx={{ py: 2, borderRadius: "20px", color: "#8E601C", borderColor: "#8E601C", borderStyle: "dashed", "&:hover": { borderStyle: "dashed", bgcolor: "rgba(142,96,28,0.05)" } }}
        >
          ดูช่างทอเพิ่มอีก {matchedWeavers.length > 2 ? matchedWeavers.length - 2 : 0} คน ›
        </Button>
      </Box>
    </Box>
  );
}
