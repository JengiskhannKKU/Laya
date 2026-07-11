import { useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import Image from "next/image";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

export default function UploadFabricStep({ orderState, setOrderState, onNext }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        setTimeout(() => {
          onNext();
        }, 500);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
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
        ถ่ายภาพผ้าของคุณให้เห็นลายและสีชัดเจน — AI จะวิเคราะห์ประเภท ลาย และเทคนิคการทอให้อัตโนมัติ
      </Typography>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Box
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
              แตะเพื่อถ่ายรูปผ้า
            </Typography>
          </>
        )}
      </Box>

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
        ถ่ายหรือเลือกจากแกลเลอรี่
      </Button>

      <Button
        onClick={handleSkip}
        sx={{
          color: '#9B958A',
          fontFamily: FONT,
          fontSize: '0.75rem',
          textTransform: 'none',
        }}
      >
        ข้ามขั้นตอนนี้ (สำหรับทดสอบ)
      </Button>

    </Box>
  );
}
