"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

// เอฟเฟกต์ demo จาก DeepAR CDN (แว่นตา) ใช้พิสูจน์ pipeline เท่านั้น — LAYA ยังไม่มี custom effect
// สำหรับเทมเพลตเสื้อผ้าจริง (ต้องสร้างด้วย DeepAR Studio โดยใช้ body tracking 17 จุด เป็น asset แยกต่างหาก
// ซึ่งเป็นงาน 3D content เพิ่มเติม ไม่ใช่โค้ดฝั่งนี้) — เมื่อมี effect จริงของแต่ละ template แล้ว ค่อยแทนที่
// ตรงนี้ด้วย mapping จาก orderState.shape.id -> URL ของไฟล์ .deepar ที่ตรงกัน
const DEMO_EFFECT_URL = "https://cdn.jsdelivr.net/npm/deepar/effects/aviators";

type ARStatus = "missing-key" | "loading" | "ready" | "error";

/**
 * ตัวเลือกที่ 3 ของขั้นสัดส่วนร่างกาย: AR ลองใส่เสมือนจริง 3D ผ่าน DeepAR Web SDK
 * (https://docs.deepar.ai/deepar-sdk/platforms/web/getting-started)
 *
 * สถานะปัจจุบันคือ "shell" integration เท่านั้น:
 *  - ใช้ license key จาก NEXT_PUBLIC_DEEPAR_LICENSE_KEY (ต้องไปสมัคร DeepAR developer portal เอง
 *    แล้วผูกกับโดเมนจริงของเว็บ — คนละเรื่องกับโค้ด ทำให้ตรงนี้ไม่มี key ให้ล่วงหน้าได้)
 *  - เอฟเฟกต์ที่โหลดคือ demo แว่นตาจาก DeepAR (พิสูจน์ camera + body tracking pipeline ทำงานจริง)
 *    ไม่ใช่เสื้อผ้าจาก template ที่ลูกค้าเลือกไว้ — ต้องสร้าง custom effect ต่อ template ใน DeepAR Studio ก่อน
 *    ถึงจะเอาชุดจริงมาลองใส่ได้ (งาน 3D content แยกจากงานโค้ด)
 */
export default function ARTryOnView({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { t } = useLanguage();
  const previewRef = useRef<HTMLDivElement>(null);
  const deepARRef = useRef<any>(null);
  const [status, setStatus] = useState<ARStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const licenseKey = process.env.NEXT_PUBLIC_DEEPAR_LICENSE_KEY;

  useEffect(() => {
    if (!licenseKey) {
      setStatus("missing-key");
      return;
    }

    let cancelled = false;

    const init = async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const deepar = await import("deepar");
        if (cancelled || !previewRef.current) return;

        const deepAR = await deepar.initialize({
          licenseKey,
          previewElement: previewRef.current,
          effect: DEMO_EFFECT_URL,
        });

        if (cancelled) {
          deepAR.shutdown();
          return;
        }
        deepARRef.current = deepAR;
        setStatus("ready");
      } catch (err: any) {
        if (cancelled) return;
        console.error("[ARTryOnView] DeepAR init error:", err);
        setErrorMessage(err?.message ?? String(err));
        setStatus("error");
      }
    };

    init();

    return () => {
      cancelled = true;
      if (deepARRef.current) {
        deepARRef.current.shutdown();
        deepARRef.current = null;
      }
    };
  }, [licenseKey, retryCount]);

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: '0.95rem' }}>
          {t("tailorFlow.measurements.ar3dViewTitle")}
        </Typography>
        <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.8rem', mt: 0.3 }}>
          {t("tailorFlow.measurements.ar3dViewSubtitle")}
        </Typography>
      </Box>

      {/* คำเตือน: นี่คือเอฟเฟกต์ demo ไม่ใช่ชุดจริงจากเทมเพลตที่เลือกไว้ */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", bgcolor: `${GOLD}0F`, border: `1px solid ${GOLD}40`, borderRadius: "12px", px: 1.5, py: 1.1 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16, color: GOLD, mt: 0.15, flexShrink: 0 }} />
        <Typography sx={{ fontFamily: FONT, color: "#8A6D3B", fontSize: "0.7rem", lineHeight: 1.6 }}>
          {t("tailorFlow.measurements.ar3dDemoDisclaimer")}
        </Typography>
      </Box>

      <Box sx={{
        width: '100%', aspectRatio: '3/4', borderRadius: '18px', bgcolor: '#111', border: '1px solid #EFE9DD',
        boxShadow: '0 4px 20px rgba(27,42,74,0.06)', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {status === "missing-key" && (
          <Box sx={{ px: 3, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: FONT, color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
              {t("tailorFlow.measurements.ar3dMissingKeyTitle")}
            </Typography>
            <Typography sx={{ fontFamily: FONT, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', lineHeight: 1.6 }}>
              {t("tailorFlow.measurements.ar3dMissingKeyDesc")}
            </Typography>
          </Box>
        )}

        {status === "loading" && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress sx={{ color: GOLD }} />
            <Typography sx={{ fontFamily: FONT, color: '#FFFFFF', fontSize: '0.8rem' }}>
              {t("tailorFlow.measurements.ar3dLoading")}
            </Typography>
          </Box>
        )}

        {status === "error" && (
          <Box sx={{ px: 3, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: FONT, color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
              {t("tailorFlow.measurements.ar3dErrorTitle")}
            </Typography>
            {errorMessage && (
              <Typography sx={{ fontFamily: FONT, color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', mb: 1.5 }}>
                {errorMessage}
              </Typography>
            )}
            <Button
              startIcon={<RefreshRoundedIcon />}
              onClick={() => setRetryCount((n) => n + 1)}
              sx={{ color: GOLD, fontFamily: FONT, fontWeight: 600, textTransform: 'none' }}
            >
              {t("tailorFlow.virtualTryOn.retry")}
            </Button>
          </Box>
        )}

        {/* DeepAR จะแทรก <canvas> ของตัวเองเข้ามาใน div นี้เอง — ต้อง mount div ไว้เสมอไม่ว่า status ไหน
            ไม่งั้น previewRef.current จะเป็น null ตอน initialize() ทำงาน */}
        <Box
          ref={previewRef}
          sx={{
            width: '100%', height: '100%', position: 'absolute', inset: 0,
            visibility: status === "ready" ? "visible" : "hidden",
          }}
        />
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={onNext}
        sx={{
          bgcolor: NAVY, color: 'white', py: 1.7, borderRadius: '14px', fontFamily: FONT, fontWeight: 600,
          fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(27,42,74,0.25)', '&:hover': { bgcolor: '#0F1A30' },
        }}
      >
        {t("tailorFlow.measurements.ar3dNextButton")}
      </Button>

      <Button onClick={onBack} sx={{ color: '#9B958A', fontFamily: FONT, fontSize: '0.8rem', textTransform: 'none' }}>
        {t("tailorFlow.measurements.changeMode")}
      </Button>
    </Box>
  );
}
