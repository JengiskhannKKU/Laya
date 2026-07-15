"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Avatar, Skeleton, Chip, InputBase } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const IVORY = "#FAF6F0";

interface TailorShop {
  id: string;
  name: string;
  description?: string;
  rating: number;
  reviewCount: number;
  province: string;
  profileImageUrl?: string | null;
  specialties: string[];
}

function ShopCardSkeleton() {
  return (
    <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "18px", border: "1px solid #EFE9DD", overflow: "hidden" }}>
      <Skeleton variant="rectangular" width="100%" height={110} />
      <Box sx={{ p: 1.5 }}>
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="text" width="45%" height={14} sx={{ mt: 0.5 }} />
      </Box>
    </Box>
  );
}

// จำนวน skeleton ระหว่างโหลด — คงเลย์เอาต์กริดไว้ไม่ให้หน้ากระโดดตอนข้อมูลมาจริง
const SKELETON_COUNT = 6;

export default function SelectTailorShopStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  const [shops, setShops] = useState<TailorShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // ใช้ path สัมพัทธ์ผ่าน Next.js rewrite proxy (next.config.mjs) แทนการยิงตรงไป backend
    // ด้วย absolute URL — กันปัญหาเดียวกับที่เจอใน ChooseShapeStep ก่อนหน้านี้ (เบราว์เซอร์ต่อ localhost:4000 ตรงไม่ได้)
    fetch(`/api/shops?service=tailor`)
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log("Shops API response:", data);
        const list = Array.isArray(data) ? data : [];
        setShops(list.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description ?? undefined,
          rating: Number(s.rating ?? 0),
          reviewCount: Number(s.review_count ?? s.reviewCount ?? 0),
          province: s.province,
          profileImageUrl: s.profile_image_url ?? s.profileImageUrl ?? null,
          specialties: Array.isArray(s.specialties) ? s.specialties : [],
        })));
      })
      .catch((err) => {
        console.error("❌ โหลดร้านตัดเย็บไม่สำเร็จ:", err.message);
        setShops([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (shop: TailorShop) => {
    setOrderState({ ...orderState, shop });
  };

  // ค้นหาจากชื่อร้าน, จังหวัด, หรือความเชี่ยวชาญ — จำเป็นเมื่อตลาดมีร้านจำนวนมาก
  const filteredShops = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.province ?? "").toLowerCase().includes(q) ||
      s.specialties.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [shops, search]);

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>

      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: "0.95rem" }}>
          เลือกร้านตัดเย็บ
        </Typography>
        <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.8rem', mt: 0.3 }}>
          เลือกร้านที่คุณไว้ใจ — ทรงที่เลือกได้ในขั้นถัดไปจะขึ้นอยู่กับร้านนี้
        </Typography>
      </Box>

      {/* ช่องค้นหาร้าน — จำเป็นเมื่อตลาดมีร้านค้าเยอะ */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #EFE9DD",
        borderRadius: "14px", px: 1.75, py: 0.9,
      }}>
        <SearchRoundedIcon sx={{ fontSize: 20, color: "#9CA3AF" }} />
        <InputBase
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาร้าน ชื่อจังหวัด หรือความเชี่ยวชาญ..."
          sx={{ flex: 1, fontFamily: FONT, fontSize: "0.85rem", color: NAVY }}
        />
      </Box>

      {loading && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => <ShopCardSkeleton key={i} />)}
        </Box>
      )}

      {!loading && shops.length === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 6 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: `${NAVY}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <StorefrontRoundedIcon sx={{ fontSize: 32, color: "#9CA3AF" }} />
          </Box>
          <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
            ยังไม่มีร้านตัดเย็บให้เลือกในขณะนี้
          </Typography>
        </Box>
      )}

      {!loading && shops.length > 0 && filteredShops.length === 0 && (
        <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem', py: 4 }}>
          ไม่พบร้านที่ตรงกับคำค้นหา
        </Typography>
      )}

      {!loading && filteredShops.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
          {filteredShops.map((shop) => {
            const selected = orderState.shop?.id === shop.id;
            return (
              <Box
                key={shop.id}
                component={motion.div}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(shop)}
                sx={{
                  position: "relative",
                  display: 'flex',
                  flexDirection: "column",
                  bgcolor: '#FFFFFF',
                  borderRadius: '18px',
                  boxShadow: selected ? '0 8px 24px rgba(197,165,90,0.22)' : '0 4px 16px rgba(27,42,74,0.06)',
                  cursor: 'pointer',
                  border: selected ? `1.5px solid ${GOLD}` : '1px solid #EFE9DD',
                  transition: 'all 0.25s',
                  overflow: "hidden",
                  "&:hover": { borderColor: selected ? GOLD : "#D9CDBA" },
                }}
              >
                {/* รูปร้าน / avatar เต็มความกว้างด้านบน */}
                <Box sx={{ width: "100%", height: 100, position: "relative", bgcolor: `${NAVY}0D`, flexShrink: 0 }}>
                  {shop.profileImageUrl ? (
                    <Image src={shop.profileImageUrl} alt={shop.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 600px) 50vw, 200px" />
                  ) : (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Avatar sx={{ width: 44, height: 44, bgcolor: NAVY, fontFamily: FONT, fontWeight: 600 }}>
                        {shop.name[0]}
                      </Avatar>
                    </Box>
                  )}
                  {selected && (
                    <Box sx={{
                      position: "absolute", top: 8, right: 8, bgcolor: "rgba(255,255,255,0.95)", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 20, color: GOLD }} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
                  <Typography sx={{
                    fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.85rem', lineHeight: 1.3,
                    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {shop.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexWrap: "wrap" }}>
                    <StarRoundedIcon sx={{ fontSize: 14, color: GOLD }} />
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>
                      {shop.rating.toFixed(1)}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: '#9CA3AF' }}>
                      ({shop.reviewCount})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <PlaceRoundedIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                    <Typography sx={{
                      fontFamily: FONT, fontSize: '0.72rem', color: '#9CA3AF',
                      display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {shop.province || "ไม่ระบุจังหวัด"}
                    </Typography>
                  </Box>

                  {shop.specialties.length > 0 && (
                    <Box sx={{ display: "flex", gap: 0.4, flexWrap: "wrap", mt: 0.3 }}>
                      {shop.specialties.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            height: 20, bgcolor: IVORY, color: NAVY, fontFamily: FONT, fontSize: "0.62rem", fontWeight: 600,
                            border: "1px solid #EFE9DD", "& .MuiChip-label": { px: 0.8 },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        disabled={!orderState.shop}
        onClick={onNext}
        sx={{
          bgcolor: NAVY,
          color: 'white',
          py: 1.7,
          borderRadius: '14px',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: '0.95rem',
          boxShadow: orderState.shop ? '0 4px 14px rgba(27,42,74,0.25)' : 'none',
          '&:hover': { bgcolor: '#0F1A30' },
          '&:disabled': { bgcolor: '#EFE9DD', color: '#A09C95' },
        }}
      >
        {t("tailorFlow.selectShop.confirmButton")}
      </Button>

    </Box>
  );
}
