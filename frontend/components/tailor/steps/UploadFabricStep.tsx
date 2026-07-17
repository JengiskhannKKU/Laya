import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// ตัด trailing slash กัน URL เพี้ยนเป็น // (NEXT_PUBLIC_API_URL ใน .env.local ลงท้ายด้วย /)
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

type PreviewStatus = "idle" | "loading" | "done" | "error";

/**
 * ขั้นอัปโหลดรูปผ้า — เดิมอัปโหลดเสร็จแล้วเด้งไปขั้นถัดไปทันที (ไม่เห็นว่าผ้าจริงจะออกมาเป็นชุดแบบไหน)
 * ตอนนี้หลังอัปโหลด จะเรียก backend ผสมลายผ้าลงบนทรงเทมเพลตที่เลือกไว้แล้ว (ChooseShapeStep มาก่อนขั้นนี้เสมอ)
 * แล้วโชว์ตัวอย่างจริงให้ลูกค้าดูก่อน ค่อยกดยืนยันไปขั้นถัดไป — ไม่ auto-advance อีกต่อไป
 */
export default function UploadFabricStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("idle");
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
  const [elapsedSec, setElapsedSec] = useState(0);

  const shapeName = orderState.shape?.name ?? "";

  // นับเวลาที่ผ่านไปตอนกำลังสร้างตัวอย่าง — AI generate ใช้เวลาจริงได้ถึง ~5 นาที (kie.ai image-to-image
  // ใช้ 2 รูปอ้างอิง) กันคนคิดว่าค้าง เหมือนที่ทำไว้แล้วใน VirtualTryOnStep.tsx
  useEffect(() => {
    if (previewStatus !== 'loading') { setElapsedSec(0); return; }
    setElapsedSec(0);
    const timer = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [previewStatus]);

  const runCompositePreview = async (fabricImageBase64: string) => {
    if (!orderState.shape?.id) {
      // ไม่ควรเกิดขึ้นจริงเพราะ ChooseShapeStep บังคับเลือกทรงมาก่อนขั้นนี้เสมอ — กันไว้เผื่อเข้าถึงตรงๆ
      onNext();
      return;
    }
    setPreviewStatus("loading");
    try {
      // กัน fetch ค้างตลอดไปฝั่ง browser ถ้า connection มีปัญหาแบบไม่ error ชัดเจน (10 นาที > เวลาที่ใช้จริงสูงสุด
      // ~5 นาที ของ backend เผื่อไว้พอสมควร) — ให้จบด้วย error state แทนสปินเนอร์ค้างตลอดไปแบบไม่มีทางออก
      const res = await fetch(`${API_BASE}/api/tryon/composite-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabricImageBase64,
          shape: { id: orderState.shape.id },
          perspective: "front",
        }),
        signal: AbortSignal.timeout(600_000),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "preview failed");
      setPreviewImage(json.previewImage as string);
      setPreviewStatus("done");
    } catch {
      setPreviewStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        // Create canvas to resize and compress image
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // Resize to max 800px width
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress as JPEG with 0.6 quality to drastically reduce base64 payload size
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);

        setOrderState({ ...orderState, fabricImage: compressedBase64 });
        runCompositePreview(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleChangeFabric = () => {
    setPreviewStatus("idle");
    setPreviewImage(undefined);
    handleClickUpload();
  };

  // ดาวน์โหลดรูปตัวอย่างที่ AI generate ไว้ — fetch เป็น blob ก่อนแล้วค่อยสร้างลิงก์ดาวน์โหลด
  // (ใช้ <a href={url} download> ตรงๆ ไม่ได้ผลเพราะรูปมาจากคนละโดเมน (Supabase) บางเบราว์เซอร์จะเปิดแท็บใหม่แทน
  // การดาวน์โหลด — fetch มาเป็น blob ก่อนแก้ปัญหานี้ได้ เพราะ bucket เปิด CORS ไว้อยู่แล้ว)
  const handleSaveImage = async () => {
    if (!previewImage) return;
    try {
      const res = await fetch(previewImage);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `laya-${orderState.shape?.id ?? 'garment'}-preview.webp`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(previewImage, '_blank');
    }
  };

  // ปุ่มข้าม (debug) — ใส่รูปผ้าตัวอย่างแทนของจริง ให้ทดสอบขั้นถัดๆ ไปได้เร็วโดยไม่ต้องอัปโหลดจริงทุกรอบ
  const handleSkip = () => {
    setOrderState({ ...orderState, fabricImage: orderState.fabricImage ?? "/images/fabric1.webp" });
    onNext();
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'center', pt: 1 }}>

      <Typography sx={{ fontFamily: FONT, fontSize: '0.88rem', color: '#6B7280', textAlign: 'center' }}>
        {previewStatus === 'idle' ? t("tailorFlow.upload.instruction") : ""}
      </Typography>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Box sx={{ width: '100%', minHeight: 380, borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {(previewStatus === 'idle') && (
            <Box
              key="idle"
              component={motion.div}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClickUpload}
              sx={{
                width: '100%',
                height: 380,
                bgcolor: '#FFFFFF',
                border: '1px solid #EFE9DD',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(27,42,74,0.06)',
                transition: 'box-shadow 0.25s, border-color 0.25s',
                '&:hover': { boxShadow: '0 12px 32px rgba(27,42,74,0.12)', borderColor: GOLD },
              }}
            >
              {orderState.fabricImage ? (
                <>
                  <Image src={orderState.fabricImage} alt="Uploaded Fabric" fill style={{ objectFit: 'cover' }} />
                  <Box sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: 'rgba(255,255,255,0.92)', p: 1, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                    <CameraAltRoundedIcon sx={{ color: NAVY }} />
                  </Box>
                </>
              ) : (
                <>
                  <Image src="/images/fabric1.webp" alt="Fabric placeholder" fill style={{ objectFit: 'cover', opacity: 0.18 }} />
                  <Box sx={{
                    position: 'relative', width: 72, height: 72, borderRadius: '50%', bgcolor: `${NAVY}0D`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
                  }}>
                    <CameraAltRoundedIcon sx={{ color: GOLD, fontSize: 32 }} />
                  </Box>
                  <Typography sx={{ position: 'relative', fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.95rem' }}>
                    {t("tailorFlow.upload.tapToPhoto")}
                  </Typography>
                </>
              )}
            </Box>
          )}

          {previewStatus === 'loading' && (
            <Box key="loading" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              sx={{
                width: '100%', height: 380, bgcolor: '#FFFFFF', border: '1px solid #EFE9DD', borderRadius: '20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                boxShadow: '0 4px 20px rgba(27,42,74,0.06)', px: 3,
              }}>
              <CircularProgress sx={{ color: NAVY }} />
              <Typography sx={{ fontFamily: FONT, color: NAVY, textAlign: 'center', fontSize: '0.9rem' }}>
                {t("tailorFlow.upload.previewGenerating").replace("{shape}", shapeName)}
              </Typography>
              <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.75rem', textAlign: 'center' }}>
                {t("tailorFlow.virtualTryOn.elapsed")
                  .replace("{mm}", String(Math.floor(elapsedSec / 60)).padStart(2, '0'))
                  .replace("{ss}", String(elapsedSec % 60).padStart(2, '0'))}
              </Typography>
            </Box>
          )}

          {(previewStatus === 'done' && previewImage) && (
            <Box key="done" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              sx={{
                width: '100%', height: 380, bgcolor: '#FFFFFF', border: '1px solid #EFE9DD', borderRadius: '20px',
                position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(27,42,74,0.06)',
              }}>
              <Image src={previewImage} alt="Fabric on shape preview" fill style={{ objectFit: 'contain' }} />
              <Box
                onClick={handleSaveImage}
                sx={{
                  position: 'absolute', bottom: 16, right: 16, bgcolor: 'rgba(255,255,255,0.92)', p: 1,
                  borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <DownloadRoundedIcon sx={{ color: NAVY }} />
              </Box>
            </Box>
          )}

          {previewStatus === 'error' && (
            <Box key="error" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              sx={{
                width: '100%', height: 380, bgcolor: '#FFFFFF', border: '1px solid #EFE9DD', borderRadius: '20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                boxShadow: '0 4px 20px rgba(27,42,74,0.06)', px: 3,
              }}>
              {orderState.fabricImage && (
                <Box sx={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                  <Image src={orderState.fabricImage} alt="Uploaded Fabric" fill style={{ objectFit: 'cover' }} />
                </Box>
              )}
              <Typography sx={{ fontFamily: FONT, color: '#6B7280', textAlign: 'center', fontSize: '0.85rem', position: 'relative' }}>
                {t("tailorFlow.upload.previewFailed")}
              </Typography>
            </Box>
          )}
        </AnimatePresence>
      </Box>

      {previewStatus === 'done' && (
        <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.9rem', textAlign: 'center' }}>
          {t("tailorFlow.upload.previewTitle").replace("{shape}", shapeName)}
        </Typography>
      )}

      {(previewStatus === 'idle') && (
        <Button
          variant="contained"
          fullWidth
          onClick={handleClickUpload}
          sx={{
            bgcolor: NAVY,
            color: '#FFFFFF',
            py: 1.7,
            borderRadius: '14px',
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 4px 14px rgba(27,42,74,0.25)',
            '&:hover': { bgcolor: '#0F1A30' },
          }}
        >
          {t("tailorFlow.upload.uploadCta")}
        </Button>
      )}

      {(previewStatus === 'done' || previewStatus === 'error') && (
        <>
          <Button
            variant="contained"
            fullWidth
            onClick={onNext}
            sx={{
              bgcolor: NAVY, color: '#FFFFFF', py: 1.7, borderRadius: '14px', fontFamily: FONT, fontWeight: 600,
              fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(27,42,74,0.25)', '&:hover': { bgcolor: '#0F1A30' },
            }}
          >
            {t("tailorFlow.upload.continueCta")}
          </Button>
          <Button
            startIcon={<RefreshRoundedIcon />}
            onClick={handleChangeFabric}
            sx={{ color: NAVY, fontFamily: FONT, fontWeight: 600, textTransform: 'none' }}
          >
            {t("tailorFlow.upload.changeFabric")}
          </Button>
        </>
      )}

      {previewStatus === 'idle' && (
        <Button
          onClick={handleSkip}
          sx={{
            color: '#9B958A',
            fontFamily: FONT,
            fontSize: '0.75rem',
            textTransform: 'none',
          }}
        >
          {t("tailorFlow.upload.skip")}
        </Button>
      )}

    </Box>
  );
}
