import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * เดิมโชว์ /images/fabric1.webp (รูปผ้าตัวอย่างที่ไม่เกี่ยวอะไรเลย) แทนที่จะเป็นรูปตัวผู้ใช้เอง — แก้ให้ใช้
 * orderState.bodyPhoto จริงที่เก็บมาจาก MeasurementsStep (ย้ายมาก่อนขั้นนี้แล้วตาม flow_1.png ข้อ 11→8)
 * ยังไม่มี AI compositing ใส่ชุดบนรูปจริง (ดู deflect.md: /api/ai/tryon ยัง TODO) — โชว์รูปจริงของผู้ใช้ตรงๆ
 * พร้อมสวอตช์ผ้าที่เลือกไว้มุมล่าง ไม่ปั้นภาพลองใส่ปลอม
 */
export default function VirtualTryOnStep({ orderState, onNext }: any) {
  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>

      <Box sx={{ width: '100%', height: 450, borderRadius: '16px', overflow: 'hidden', position: 'relative', bgcolor: '#E5DFD6' }}>
        {orderState.bodyPhoto ? (
          <Image src={orderState.bodyPhoto} alt="รูปตัวเองของคุณ" fill style={{ objectFit: 'cover' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#6B7280', textAlign: 'center', px: 3 }}>
              ยังไม่มีรูปตัวเอง — ย้อนกลับไปถ่ายรูปก่อน
            </Typography>
          </Box>
        )}

        {orderState.fabricImage && (
          <Box sx={{ position: 'absolute', bottom: 16, right: 16, width: 64, height: 64, borderRadius: '12px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <Image src={orderState.fabricImage} alt="ผ้าที่เลือก" fill style={{ objectFit: 'cover' }} />
          </Box>
        )}
      </Box>

      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', textAlign: 'center', color: '#6B7280', fontSize: '0.8rem' }}>
        ระบบลองใส่เสมือนจริงแบบเต็มรูปแบบกำลังพัฒนาอยู่ — ตอนนี้แสดงรูปตัวเองพร้อมผ้าที่เลือกไว้ให้เทียบกันก่อน
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
        ถัดไป — สรุปออเดอร์
      </Button>

    </Box>
  );
}
