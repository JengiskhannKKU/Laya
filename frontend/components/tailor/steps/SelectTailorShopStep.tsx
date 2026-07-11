"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Button, Avatar, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface TailorShop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  province: string;
}

export default function SelectTailorShopStep({ orderState, setOrderState, onNext }: any) {
  const [shops, setShops] = useState<TailorShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/shops?service=tailor`)
      .then((res) => res.json())
      .then((data) => setShops(Array.isArray(data) ? data.map((s) => ({
        id: s.id, name: s.name, rating: Number(s.rating ?? 0), reviewCount: Number(s.review_count ?? s.reviewCount ?? 0), province: s.province,
      })) : []))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (shop: TailorShop) => {
    setOrderState({ ...orderState, shop });
  };

  return (
<<<<<<< HEAD
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: '#C5A55A' }} />
        </Box>
      ) : shops.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: '#6B7280', py: 4, fontFamily: '"Noto Serif Thai", serif' }}>
          ยังไม่มีร้านตัดเย็บให้เลือกในขณะนี้
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {shops.map((shop) => (
            <Box
              key={shop.id}
=======
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>

      <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#6B7280', fontSize: '0.88rem' }}>
        เลือกร้านที่คุณไว้ใจให้ตัดเย็บชุดของคุณ
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {mockShops.map((shop) => {
          const selected = orderState.shop?.id === shop.id;
          return (
            <Box
              key={shop.id}
              component={motion.div}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
>>>>>>> refs/remotes/origin/main
              onClick={() => handleSelect(shop)}
              sx={{
                display: 'flex',
                alignItems: 'center',
<<<<<<< HEAD
                p: 2,
                bgcolor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                border: orderState.shop?.id === shop.id ? '2px solid #C5A55A' : '2px solid transparent'
              }}
            >
              <Avatar sx={{ width: 50, height: 50, mr: 2, bgcolor: '#1B2A4A' }}>{shop.name[0]}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A' }}>
                  {shop.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <StarRoundedIcon sx={{ fontSize: 16, color: '#C5A55A' }} />
                  <Typography sx={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    {shop.rating.toFixed(1)} ({shop.reviewCount}) · {shop.province}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
=======
                p: 2.2,
                bgcolor: '#FFFFFF',
                borderRadius: '18px',
                boxShadow: selected ? '0 8px 24px rgba(197,165,90,0.2)' : '0 4px 16px rgba(27,42,74,0.06)',
                cursor: 'pointer',
                border: selected ? `1.5px solid ${GOLD}` : '1px solid #EFE9DD',
                transition: 'all 0.25s',
              }}
            >
              <Avatar sx={{ width: 50, height: 50, mr: 2, bgcolor: NAVY, fontFamily: FONT, fontWeight: 600 }}>{shop.name[0]}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.95rem' }}>
                  {shop.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.4 }}>
                  <StarRoundedIcon sx={{ fontSize: 16, color: GOLD }} />
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: '#6B7280' }}>
                    {shop.rating} ({shop.reviews} รีวิว)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: '0.95rem' }}>
                  ฿{shop.price.toLocaleString()}
                </Typography>
                {selected && <CheckCircleRoundedIcon sx={{ fontSize: 20, color: GOLD }} />}
              </Box>
            </Box>
          );
        })}
      </Box>
>>>>>>> refs/remotes/origin/main

      <Button
        variant="contained"
        fullWidth
        disabled={!orderState.shop}
        onClick={onNext}
        sx={{
<<<<<<< HEAD
          bgcolor: '#1B2A4A',
          color: 'white',
          py: 1.5,
          borderRadius: '12px',
          fontFamily: '"Noto Serif Thai", serif',
          fontWeight: 700,
          '&:hover': { bgcolor: '#0f182b' },
          '&:disabled': { bgcolor: '#E5DFD6', color: '#A09C95' }
=======
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
>>>>>>> refs/remotes/origin/main
        }}
      >
        ยืนยันการเลือกร้าน
      </Button>

    </Box>
  );
}
