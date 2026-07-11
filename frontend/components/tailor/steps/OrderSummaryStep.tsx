import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

export default function OrderSummaryStep({ orderState, onNext }: any) {
  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>

      <Box sx={{ bgcolor: '#FFFFFF', p: 3, borderRadius: '18px', border: '1px solid #EFE9DD', boxShadow: '0 4px 20px rgba(27,42,74,0.06)' }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, mb: 2.5, color: NAVY, fontSize: '1rem' }}>
          รายละเอียดการสั่งตัด
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'center' }}>
          <Box sx={{ width: 64, height: 84, position: 'relative', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid #EFE9DD' }}>
            <Image src={orderState.fabricImage || "/images/fabric1.webp"} alt="Pattern" fill style={{ objectFit: 'cover' }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#9CA3AF' }}>ทรงที่เลือก</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '1rem' }}>
              {orderState.shape?.name || "ชุดไทยจิตรลดา"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.85rem' }}>ผ้าที่ใช้</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.85rem' }}>
              {orderState.analysisResult?.type || "ผ้าไหมมัดหมี่"}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.85rem' }}>โอกาสใช้งาน</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.85rem' }}>
              {orderState.occasion || "ทำงานราชการ"}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 2, borderTop: '1px solid #F3EFE7' }}>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontWeight: 600, fontSize: '0.88rem' }}>ราคาโดยประมาณ</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: GOLD, fontSize: '1.3rem' }}>
              2,590 <Typography component="span" sx={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600 }}>บาท</Typography>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={onNext}
        sx={{
          bgcolor: NAVY,
          color: 'white',
          py: 1.7,
          borderRadius: '14px',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: '0.95rem',
          boxShadow: '0 4px 14px rgba(27,42,74,0.25)',
          '&:hover': { bgcolor: '#0F1A30' },
        }}
      >
        เลือกร้านค้าที่จะตัด
      </Button>

    </Box>
  );
}
