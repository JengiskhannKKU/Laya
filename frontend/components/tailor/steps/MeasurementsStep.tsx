import { useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import Image from "next/image";

export type Perspective = "front" | "back" | "side";

const PERSPECTIVES: { key: Perspective; label: string; hint: string }[] = [
  { key: "front", label: "ด้านหน้า", hint: "ยืนหันหน้าเข้ากล้องตรงๆ" },
  { key: "back", label: "ด้านหลัง", hint: "หันหลังให้กล้อง" },
  { key: "side", label: "ด้านข้าง", hint: "หันข้างลำตัว 90 องศา" },
];

/**
 * ถ่ายรูปตัวเอง 3 มุม (หน้า/หลัง/ข้าง) — เดิมมีแค่มุมเดียวและเป็นกล่องตกแต่งเฉยๆ ไม่มี input จริง
 * ตอนนี้ต้องอัปโหลดครบ 3 มุมก่อนไปขั้นลองใส่เสมือนจริง เพราะ AI ต้อง compositing ชุดแยกทีละมุมจริง
 * เก็บที่ orderState.bodyPhotos = { front, back, side } (base64 ไว้พรีวิว — VirtualTryOnStep จะอัปโหลด
 * ขึ้น Supabase Storage เพื่อได้ URL public ส่งให้ AI ต่อเอง)
 */
export default function MeasurementsStep({ orderState, setOrderState, onNext }: any) {
  const photos: Partial<Record<Perspective, string>> = orderState.bodyPhotos ?? {};
  const allDone = PERSPECTIVES.every((p) => !!photos[p.key]);

  const setPhoto = (key: Perspective, dataUrl: string) => {
    setOrderState({ ...orderState, bodyPhotos: { ...photos, [key]: dataUrl } });
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'stretch' }}>

      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', textAlign: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
        ถ่ายรูปตัวเองให้ครบ 3 มุม เพื่อให้ AI ลองใส่ชุดให้เห็นทุกด้านก่อนตัดจริง
      </Typography>

      {PERSPECTIVES.map((p) => (
        <PhotoSlot key={p.key} label={p.label} hint={p.hint} value={photos[p.key]} onCapture={(dataUrl) => setPhoto(p.key, dataUrl)} />
      ))}

      <Button
        variant="contained"
        fullWidth
        disabled={!allDone}
        onClick={onNext}
        sx={{
          bgcolor: '#1B2A4A',
          color: 'white',
          py: 1.5,
          borderRadius: '12px',
          fontFamily: '"Noto Serif Thai", serif',
          fontWeight: 700,
          mt: 1,
          '&:hover': { bgcolor: '#0f182b' },
          '&:disabled': { bgcolor: '#E5DFD6', color: '#A09C95' },
        }}
      >
        {allDone ? 'ถัดไป — ลองใส่เสมือนจริง' : `ถ่ายให้ครบ 3 มุม (${Object.values(photos).filter(Boolean).length}/3)`}
      </Button>

    </Box>
  );
}

function PhotoSlot({ label, hint, value, onCapture }: {
  label: string; hint: string; value?: string; onCapture: (dataUrl: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        onCapture(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box
      onClick={() => fileInputRef.current?.click()}
      sx={{
        width: '100%', height: 190, bgcolor: '#E5DFD6', borderRadius: '16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        border: value ? 'none' : '2px dashed #1B2A4A',
      }}
    >
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

      {value ? (
        <>
          <Image src={value} alt={label} fill style={{ objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(27,42,74,0.85)', color: 'white', px: 1.5, py: 0.5, borderRadius: '999px' }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: '0.7rem', fontWeight: 600 }}>{label}</Typography>
          </Box>
          <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(255,255,255,0.9)', p: 1, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CameraAltRoundedIcon sx={{ color: '#1B2A4A', fontSize: 20 }} />
          </Box>
        </>
      ) : (
        <>
          <CameraAltRoundedIcon sx={{ fontSize: 32, color: '#1B2A4A', mb: 1 }} />
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A', fontWeight: 600, fontSize: '0.9rem' }}>
            {label}
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#6B7280', fontSize: '0.7rem', textAlign: 'center', px: 2 }}>
            {hint}
          </Typography>
        </>
      )}
    </Box>
  );
}
