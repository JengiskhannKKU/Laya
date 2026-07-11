"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Button, Avatar, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

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
              onClick={() => handleSelect(shop)}
              sx={{
                display: 'flex',
                alignItems: 'center',
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

      <Button
        variant="contained"
        fullWidth
        disabled={!orderState.shop}
        onClick={onNext}
        sx={{
          bgcolor: '#1B2A4A',
          color: 'white',
          py: 1.5,
          borderRadius: '12px',
          fontFamily: '"Noto Serif Thai", serif',
          fontWeight: 700,
          '&:hover': { bgcolor: '#0f182b' },
          '&:disabled': { bgcolor: '#E5DFD6', color: '#A09C95' }
        }}
      >
        ยืนยันการเลือกร้าน
      </Button>

    </Box>
  );
}
