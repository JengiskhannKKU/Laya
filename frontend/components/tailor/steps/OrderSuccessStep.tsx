import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Link from "next/link";

export default function OrderSuccessStep({ orderState }: any) {
  return (
    <Box component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', pt: 4 }}>
      
      <CheckCircleRoundedIcon sx={{ fontSize: 80, color: '#C5A55A' }} />
      
      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: '1.5rem', color: '#1B2A4A', textAlign: 'center' }}>
        ร้านคอนเฟิร์มออเดอร์แล้ว!
      </Typography>

      <Box sx={{ width: '100%', bgcolor: '#FFFFFF', p: 3, borderRadius: '16px', border: '1px solid #E5DFD6', mt: 2 }}>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, mb: 2, color: '#1B2A4A' }}>
          รายละเอียดออเดอร์
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ color: '#6B7280', fontSize: '0.9rem' }}>ร้านค้า</Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A', fontSize: '0.9rem' }}>
            {orderState.shop?.name || "ร้านตัดเย็บคุณหญิง"}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ color: '#6B7280', fontSize: '0.9rem' }}>ราคา</Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A', fontSize: '0.9rem' }}>
            {orderState.shop?.price.toLocaleString() || "2,590"} บาท
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ color: '#6B7280', fontSize: '0.9rem' }}>ระยะเวลาผลิต</Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A', fontSize: '0.9rem' }}>
            7-10 วันทำการ
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: '100%', bgcolor: '#F0EBE3', p: 3, borderRadius: '16px', mt: 2 }}>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, mb: 1, color: '#1B2A4A', textAlign: 'center' }}>
          ส่งผ้าทางไปรษณีย์
        </Typography>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: '0.85rem', color: '#6B7280', textAlign: 'center' }}>
          คุณส่งผ้าให้ร้านตามที่อยู่ที่ระบบให้ไว้
          <br/>
          (มีวิธีแพ็กผ้าและที่อยู่ในแอป)
        </Typography>
      </Box>

      <Link href="/" style={{ textDecoration: 'none', width: '100%', marginTop: '16px' }}>
        <Button 
          variant="contained" 
          fullWidth 
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
          กลับสู่หน้าหลัก
        </Button>
      </Link>

    </Box>
  );
}
