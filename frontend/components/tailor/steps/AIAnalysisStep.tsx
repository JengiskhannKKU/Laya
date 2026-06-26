import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Chip } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AIAnalysisStep({ orderState, setOrderState, onNext }: any) {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI loading
    const timer = setTimeout(() => {
      setAnalyzing(false);
      setOrderState((prev: any) => ({
        ...prev,
        analysisResult: {
          type: "ผ้าไหม",
          technique: "มัดหมี่",
          pattern: "ลายดอกแก้ว",
          tone: "ม่วง, ชมพู",
          thickness: "ปานกลาง"
        }
      }));
    }, 2000);
    return () => clearTimeout(timer);
  }, [setOrderState]);

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      
      {/* Fabric Thumbnail */}
      <Box sx={{ width: 120, height: 120, borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {orderState.fabricImage && (
          <Image src={orderState.fabricImage} alt="Fabric" fill style={{ objectFit: 'cover' }} />
        )}
      </Box>

      {analyzing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 4 }}>
          <CircularProgress sx={{ color: '#C5A55A' }} />
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A' }}>
            AI กำลังวิเคราะห์ประเภทผ้า ลาย สี ความหนา และเทคนิคการทอ...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', mt: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: '12px', border: '1px solid #E5DFD6' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>ประเภทผ้า</Typography>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A' }}>{orderState.analysisResult?.type}</Typography>
            </Box>
            <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: '12px', border: '1px solid #E5DFD6' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>เทคนิคการทอ</Typography>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A' }}>{orderState.analysisResult?.technique}</Typography>
            </Box>
            <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: '12px', border: '1px solid #E5DFD6' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>ลาย</Typography>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A' }}>{orderState.analysisResult?.pattern}</Typography>
            </Box>
            <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: '12px', border: '1px solid #E5DFD6' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>โทนสี</Typography>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A' }}>{orderState.analysisResult?.tone}</Typography>
            </Box>
            <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: '12px', border: '1px solid #E5DFD6', gridColumn: 'span 2' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>ความหนา</Typography>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A' }}>{orderState.analysisResult?.thickness}</Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={onNext}
            sx={{ 
              mt: 4,
              bgcolor: '#1B2A4A', 
              color: 'white', 
              py: 1.5, 
              borderRadius: '12px',
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              '&:hover': { bgcolor: '#0f182b' }
            }}
          >
            เลือกโอกาสใช้งาน
          </Button>
        </Box>
      )}
    </Box>
  );
}
