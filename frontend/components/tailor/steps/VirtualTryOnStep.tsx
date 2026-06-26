import { Box, Typography, Button, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";

export default function VirtualTryOnStep({ orderState, onNext }: any) {
  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      
      <Box sx={{ width: '100%', height: 450, borderRadius: '16px', overflow: 'hidden', position: 'relative', bgcolor: '#E5DFD6' }}>
        {/* Placeholder for Virtual Try-On image showing user face and fabric on body */}
        <Image src={"/images/fabric1.jpg"} alt="Virtual Try-On" fill style={{ objectFit: 'cover' }} />
        
        {/* Mock camera overlay icons */}
        <Box sx={{ position: 'absolute', bottom: 16, width: '100%', display: 'flex', justifyContent: 'center', gap: 2 }}>
          <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}>
            <AccountCircleRoundedIcon />
          </IconButton>
          <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}>
            <CameraAltRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', textAlign: 'center', color: '#6B7280' }}>
        ลองใส่เสมือนจริงเพื่อดูภาพก่อนตัด
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
        ยืนยันออเดอร์
      </Button>

    </Box>
  );
}
