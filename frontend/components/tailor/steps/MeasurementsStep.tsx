import { Box, Typography, Button, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";

export default function MeasurementsStep({ onNext }: any) {
  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      
      <Box sx={{ width: '100%', height: 400, bgcolor: '#E5DFD6', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '2px dashed #1B2A4A' }}>
        <CameraAltRoundedIcon sx={{ fontSize: 48, color: '#1B2A4A', mb: 2 }} />
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A', textAlign: 'center', px: 3 }}>
          ยืนให้เต็มตัวเพื่อให้ AI วัดสัดส่วนของคุณ
        </Typography>
      </Box>

      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', textAlign: 'center', color: '#6B7280' }}>
        ถ่ายรูปและส่งข้อมูลสัดส่วนของคุณ
      </Typography>

      <Button 
        variant="contained" 
        fullWidth 
        onClick={onNext}
        sx={{ 
          bgcolor: '#1B2A4A', 
          color: 'white', 
          py: 1.5, 
          borderRadius: '12px',
          fontFamily: '"Noto Serif Thai", serif',
          fontWeight: 700,
          '&:hover': { bgcolor: '#0f182b' }
        }}
      >
        ส่งให้ร้านค้า
      </Button>

    </Box>
  );
}
