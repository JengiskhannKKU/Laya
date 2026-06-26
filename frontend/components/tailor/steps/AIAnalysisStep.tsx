import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import HiveRoundedIcon from "@mui/icons-material/HiveRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";

export default function AIAnalysisStep({ orderState, setOrderState, onNext }: any) {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const analyzeFabric = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/ai/analyze-fabric", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: orderState.fabricImage })
        });
        
        if (!response.ok) throw new Error("API failed");
        
        const data = await response.json();
        setOrderState((prev: any) => ({ ...prev, analysisResult: data }));
      } catch (err) {
        console.error("Fabric analysis error:", err);
        // Fallback mockup
        setOrderState((prev: any) => ({
          ...prev,
          analysisResult: {
            type: "ผ้าไหม (Fallback)",
            technique: "มัดหมี่",
            pattern: "ลายดอกแก้ว",
            tone: "ม่วง, ชมพู",
            thickness: "ปานกลาง"
          }
        }));
      } finally {
        setAnalyzing(false);
      }
    };

    analyzeFabric();
  }, [orderState.fabricImage, setOrderState]);

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', pt: 2 }}>
      
      {/* Fabric Thumbnail - Wide aspect ratio matching mockup */}
      <Box sx={{ width: '100%', height: 200, borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Image src={orderState.fabricImage || "/images/fabric1.jpg"} alt="Fabric" fill style={{ objectFit: 'cover' }} />
      </Box>

      {analyzing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 4, height: 250, justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#1B2A4A' }} />
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A', textAlign: 'center', mt: 2 }}>
            AI กำลังวิเคราะห์ประเภทผ้า<br/>ลาย สี ความหนา และ<br/>เทคนิคการทอ
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 1 }}>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5DFD6', pb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckroomRoundedIcon sx={{ color: '#8B7355', fontSize: 20 }} />
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A', fontWeight: 600 }}>ประเภทผ้า</Typography>
              </Box>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#6B7280' }}>{orderState.analysisResult?.type}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5DFD6', pb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <GridOnRoundedIcon sx={{ color: '#8B7355', fontSize: 20 }} />
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A', fontWeight: 600 }}>เทคนิคการทอ</Typography>
              </Box>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#6B7280' }}>{orderState.analysisResult?.technique}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5DFD6', pb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <HiveRoundedIcon sx={{ color: '#8B7355', fontSize: 20 }} />
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A', fontWeight: 600 }}>ลาย</Typography>
              </Box>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#6B7280' }}>{orderState.analysisResult?.pattern}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5DFD6', pb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ColorLensRoundedIcon sx={{ color: '#8B7355', fontSize: 20 }} />
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A', fontWeight: 600 }}>โทนสี</Typography>
              </Box>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#6B7280' }}>{orderState.analysisResult?.tone}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LayersRoundedIcon sx={{ color: '#8B7355', fontSize: 20 }} />
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A', fontWeight: 600 }}>ความหนา</Typography>
              </Box>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#6B7280' }}>{orderState.analysisResult?.thickness}</Typography>
            </Box>

          </Box>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={onNext}
            sx={{ 
              mt: 5,
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
