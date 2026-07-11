import { useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Image from "next/image";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

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
  const doneCount = Object.values(photos).filter(Boolean).length;

  const setPhoto = (key: Perspective, dataUrl: string) => {
    setOrderState({ ...orderState, bodyPhotos: { ...photos, [key]: dataUrl } });
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'stretch', pt: 1 }}>

      <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#6B7280', fontSize: '0.88rem' }}>
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
          bgcolor: NAVY,
          color: 'white',
          py: 1.7,
          borderRadius: '14px',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: '0.95rem',
          mt: 0.5,
          boxShadow: allDone ? '0 4px 14px rgba(27,42,74,0.25)' : 'none',
          '&:hover': { bgcolor: '#0F1A30' },
          '&:disabled': { bgcolor: '#EFE9DD', color: '#A09C95' },
        }}
      >
        {allDone ? 'ถัดไป — ลองใส่เสมือนจริง' : `ถ่ายให้ครบ 3 มุม (${doneCount}/3)`}
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
        width: '100%', height: 180, bgcolor: '#FFFFFF', borderRadius: '18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        border: value ? `1px solid ${GOLD}` : '1.5px dashed #D8CFC0',
        boxShadow: value ? '0 4px 16px rgba(197,165,90,0.15)' : 'none',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
    >
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

      {value ? (
        <>
          <Image src={value} alt={label} fill style={{ objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(27,42,74,0.85)', color: 'white', px: 1.5, py: 0.5, borderRadius: '999px' }}>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', fontWeight: 600 }}>{label}</Typography>
          </Box>
          <Box sx={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: '50%', bgcolor: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <CheckRoundedIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(255,255,255,0.92)', p: 1, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CameraAltRoundedIcon sx={{ color: NAVY, fontSize: 18 }} />
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: `${NAVY}0D`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <CameraAltRoundedIcon sx={{ fontSize: 24, color: GOLD }} />
          </Box>
          <Typography sx={{ fontFamily: FONT, color: NAVY, fontWeight: 600, fontSize: '0.9rem' }}>
            {label}
          </Typography>
          <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.72rem', textAlign: 'center', px: 2, mt: 0.3 }}>
            {hint}
          </Typography>
        </>
      )}
    </Box>
  );
}
