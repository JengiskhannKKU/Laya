import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

export default function OrderSummaryStep({ orderState, onNext }: any) {
  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      <Box sx={{ bgcolor: '#FFFFFF', p: 3, borderRadius: '16px', border: '1px solid #E5DFD6' }}>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, mb: 3, color: '#1B2A4A' }}>
          รายละเอียดการสั่งตัด
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ width: 60, height: 80, position: 'relative', borderRadius: '8px', overflow: 'hidden', bgcolor: '#E5DFD6' }}>
            <Image src={orderState.fabricImage || "/images/fabric1.webp"} alt="Pattern" fill style={{ objectFit: 'cover' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.8rem', color: '#6B7280' }}>ทรงที่เลือก</Typography>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A' }}>
              {orderState.pattern?.name || "ชุดไทยจิตรลดา"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#6B7280', fontSize: '0.9rem' }}>ผ้าที่ใช้</Typography>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A', fontSize: '0.9rem' }}>
              {orderState.analysisResult?.type || "ผ้าไหมมัดหมี่"}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#6B7280', fontSize: '0.9rem' }}>โอกาสใช้งาน</Typography>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A', fontSize: '0.9rem' }}>
              {orderState.occasion || "ทำงานราชการ"}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid #E5DFD6' }}>
            <Typography sx={{ color: '#6B7280', fontWeight: 600 }}>ราคาโดยประมาณ</Typography>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, color: '#C5A55A', fontSize: '1.2rem' }}>
              2,590 บาท
            </Typography>
          </Box>
        </Box>
      </Box>

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
        เลือกร้านค้าที่จะตัด
      </Button>

    </Box>
  );
}
