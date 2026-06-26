import { Box, Typography, Button, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

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
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockShops.map((shop) => (
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
                  {shop.rating} ({shop.reviews})
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, color: '#1B2A4A' }}>
              ฿{shop.price.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>

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
