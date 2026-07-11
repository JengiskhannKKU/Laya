import { Box, Typography, Button, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

const mockShops = [
  { id: 1, name: "ช่างมิตรผ้าไทย", rating: 4.9, reviews: 128, price: 1990 },
  { id: 2, name: "ร้านตัดเย็บคุณหญิง", rating: 4.8, reviews: 96, price: 2490 },
  { id: 3, name: "ศิลย์ผ้าไทย", rating: 4.7, reviews: 73, price: 1890 },
];

export default function SelectTailorShopStep({ orderState, setOrderState, onNext }: any) {
  const handleSelect = (shop: any) => {
    setOrderState({ ...orderState, shop });
  };

  return (
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
              onClick={() => handleSelect(shop)}
              sx={{
                display: 'flex',
                alignItems: 'center',
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
        ยืนยันการเลือกร้าน
      </Button>

    </Box>
  );
}
