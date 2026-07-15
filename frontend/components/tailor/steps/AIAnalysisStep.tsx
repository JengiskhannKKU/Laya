import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import HiveRoundedIcon from "@mui/icons-material/HiveRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// เดิม hardcode ผิดเป็น localhost:5000 (backend จริงรันที่ 4000 ทั้ง local dev และ production ผ่าน nginx /api/)
// ตัด trailing slash กัน URL เพี้ยนเป็น // เหมือนบั๊กที่เจอใน VirtualTryOnStep.tsx ก่อนหน้านี้
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

export default function AIAnalysisStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  const ATTRIBUTES = [
    { key: "type", label: t("tailorFlow.aiAnalysis.attrType"), icon: CheckroomRoundedIcon },
    { key: "technique", label: t("tailorFlow.aiAnalysis.attrTechnique"), icon: GridOnRoundedIcon },
    { key: "pattern", label: t("tailorFlow.aiAnalysis.attrPattern"), icon: HiveRoundedIcon },
    { key: "tone", label: t("tailorFlow.aiAnalysis.attrTone"), icon: ColorLensRoundedIcon },
    { key: "thickness", label: t("tailorFlow.aiAnalysis.attrThickness"), icon: LayersRoundedIcon },
  ] as const;
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const analyzeFabric = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/ai/analyze-fabric`, {
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
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'center', pt: 1 }}>

      {/* รูปผ้า */}
      <Box sx={{ width: '100%', height: 190, borderRadius: '18px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 16px rgba(27,42,74,0.1)' }}>
        <Image src={orderState.fabricImage || "/images/fabric1.webp"} alt="Fabric" fill style={{ objectFit: 'cover' }} />
      </Box>

      {analyzing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 3, height: 220, justifyContent: 'center' }}>
          <CircularProgress sx={{ color: NAVY }} />
          <Typography sx={{ fontFamily: FONT, color: NAVY, textAlign: 'center', fontSize: '0.9rem' }}>
            {t("tailorFlow.aiAnalysis.analyzing").split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Box sx={{
            bgcolor: '#FFFFFF', border: '1px solid #EFE9DD', borderRadius: '18px',
            boxShadow: '0 4px 20px rgba(27,42,74,0.06)', p: 1,
          }}>
            {ATTRIBUTES.map(({ key, label, icon: Icon }, i) => (
              <Box key={key} sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1.6,
                borderBottom: i < ATTRIBUTES.length - 1 ? '1px solid #F3EFE7' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: `${NAVY}0D`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ color: GOLD, fontSize: 18 }} />
                  </Box>
                  <Typography sx={{ fontFamily: FONT, color: NAVY, fontWeight: 600, fontSize: '0.9rem' }}>{label}</Typography>
                </Box>
                <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.85rem', textAlign: 'right', maxWidth: '55%' }}>
                  {orderState.analysisResult?.[key]}
                </Typography>
              </Box>
            ))}
          </Box>
          <Button
            variant="contained"
            fullWidth
            onClick={onNext}
            sx={{
              mt: 3,
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
            เลือกร้านตัดเย็บ
          </Button>
        </Box>
      )}
    </Box>
  );
}
