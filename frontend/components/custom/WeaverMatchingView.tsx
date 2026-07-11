"use client";

/**
 * WeaverMatchingView — จับคู่กับร้าน/ชุมชนทอผ้าจริงที่เปิดรับบริการทอ (shop_services.service_type = 'weave'/'all')
 * ดึงจาก GET /api/shops/match (backend/src/routes/shops.ts) — ของจริงทั้งหมด ไม่ใช่ mock
 * match_score จริงมีแค่ 0/1/2/3 (ตรงลาย +2, ตรงจังหวัด +1) จึงแสดงเป็น badge ไม่ใช่เปอร์เซ็นต์ที่ปั้นขึ้นมา
 */

import { useEffect, useState } from "react";
import { Box, Typography, Avatar, Rating, Button, Chip, Skeleton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "@/lib/api-auth";
import type { CustomPatternData } from "@/lib/custom-order-config";
import type { ShopMatch } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface WeaverMatchingViewProps {
  patternData: CustomPatternData;
  onSelectWeaver: (weaver: ShopMatch) => void;
  onBack?: () => void;
}

/** ดึงคำไทยตัวแรกจาก "มัดหมี่ (Mudmee)" -> "มัดหมี่" ให้ตรงกับ shop_specialties.pattern_tag จริง */
function thaiPrefix(text?: string): string | undefined {
  return text?.split(" (")[0]?.trim();
}

export default function WeaverMatchingView({ patternData, onSelectWeaver, onBack }: WeaverMatchingViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shops, setShops] = useState<ShopMatch[]>([]);

  useEffect(() => {
    const patternTag = thaiPrefix(patternData.weaveType) ?? patternData.selectedPatterns?.[0];
    const params = new URLSearchParams({ service: "weave" });
    if (patternTag) params.set("patternTag", patternTag);

    setLoading(true);
    setError(null);
    authFetch(`${API_BASE}/api/shops/match?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "โหลดรายชื่อร้านทอผ้าไม่สำเร็จ");
        setShops(json as ShopMatch[]);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [patternData.weaveType, patternData.selectedPatterns]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A", textAlign: "center", mb: 1 }}>
          กำลังค้นหาร้าน/ชุมชนทอผ้าที่รับงานนี้...
        </Typography>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: "20px" }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography sx={{ color: "#D32F2F", fontSize: "0.9rem", mb: 2 }}>{error}</Typography>
        {onBack && <Button onClick={onBack} sx={{ color: "#1B2A4A" }}>ย้อนกลับ</Button>}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0, pb: 12 }}>
      {/* 1. Pattern Summary Header */}
      <Box sx={{ p: 2, bgcolor: "#FFFFFF", borderBottom: "1px solid #E5DFD6" }}>
        <Box sx={{ display: "flex", gap: 2, p: 1.5, bgcolor: "#FAF6F0", borderRadius: "16px", border: "1px solid #E5DFD6" }}>
          <Box sx={{ width: 80, height: 80, borderRadius: "12px", bgcolor: "#FFFFFF", p: 0.5, border: "1px solid #E5DFD6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <Box sx={{ width: "100%", height: "100%", backgroundImage: `url(${patternData.generatedImageUrl || "/images/fabric1.webp"})`, backgroundSize: "cover", borderRadius: "8px" }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#1B2A4A", fontSize: "1rem" }}>Your Pattern</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>
              {patternData.mood || "ดั้งเดิม"} • {(patternData.colors || []).join(" + ") || "หลากสี"}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
              {[patternData.weaveType, patternData.region].filter(Boolean).map((tag, idx) => (
                <Chip key={`${tag}-${idx}`} label={tag} size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#E5DFD6", color: "#6B7280" }} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 2. Results Header */}
      <Box sx={{ px: 2, mb: 1, mt: 2 }}>
        <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>
          พบ <Box component="span" sx={{ fontWeight: 700, color: "#1B2A4A" }}>{shops.length} ร้าน/ชุมชนทอผ้า</Box> ที่รับงานทอ
        </Typography>
      </Box>

      {shops.length === 0 && (
        <Box sx={{ px: 2, py: 6, textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
            ยังไม่มีร้านที่เปิดรับบริการทอในระบบขณะนี้ ลองกลับมาใหม่ภายหลัง หรือติดต่อทีมงาน LAYA
          </Typography>
        </Box>
      )}

      {/* 3. Shop List */}
      <Box sx={{ px: 2, display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
        <AnimatePresence>
          {shops.map((shop, idx) => (
            <Box
              key={shop.id}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "20px",
                border: "1px solid #E5DFD6",
                overflow: "hidden",
                position: "relative",
                boxShadow: idx === 0 && shop.matchScore > 0 ? "0 10px 25px rgba(197,165,90,0.15)" : "none",
                borderColor: idx === 0 && shop.matchScore > 0 ? "#C5A55A" : "#E5DFD6",
              }}
            >
              {idx === 0 && shop.matchScore > 0 && (
                <Box sx={{ bgcolor: "#C5A55A", py: 0.8, px: 2 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#FFFFFF" }}>
                    ★ แนะนำอันดับ 1 — เชี่ยวชาญลายที่คุณเลือก
                  </Typography>
                </Box>
              )}

              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Avatar src={shop.profileImageUrl ?? undefined} sx={{ width: 56, height: 56, bgcolor: "#1B2A4A", fontWeight: 700 }}>
                      {shop.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#1B2A4A", fontSize: "1.05rem" }}>{shop.name}</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{shop.province ?? "ไม่ระบุจังหวัด"}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, mt: 0.5 }}>
                        <Rating value={shop.rating} readOnly size="small" precision={0.1} sx={{ fontSize: "0.9rem", color: "#C5A55A" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>({shop.rating.toFixed(1)}) {shop.reviewCount} รีวิว</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {shop.description && (
                  <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", mb: 2, lineHeight: 1.5 }}>{shop.description}</Typography>
                )}

                {shop.specialties.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 2.5 }}>
                    {shop.specialties.slice(0, 4).map((tag) => (
                      <Chip key={tag} label={tag} size="small" sx={{ height: 24, bgcolor: "#E9F2E9", color: "#4B7355", fontSize: "0.7rem", fontWeight: 600 }} />
                    ))}
                  </Box>
                )}

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => onSelectWeaver(shop)}
                    sx={{ borderRadius: "12px", bgcolor: idx === 0 ? "#1B2A4A" : "#8E887D", textTransform: "none", py: 1 }}
                  >
                    เลือกร้านนี้ ›
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
