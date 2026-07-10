import { useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import Image from "next/image";

/**
 * ถ่ายรูปตัวเอง + ส่งขนาด — เดิมเป็นกล่องตกแต่งเฉยๆ ไม่มี input ไฟล์จริงเลย (ปุ่มกด onNext ตรงๆ ไม่เก็บรูปอะไร)
 * แก้ให้อัปโหลดรูปจริง (เทคนิคเดียวกับ UploadFabricStep: resize+compress เป็น base64) เก็บที่ orderState.bodyPhoto
 * เพื่อให้ VirtualTryOnStep เอาไปใช้ต่อได้จริง — ต้องมาก่อน virtual try-on เสมอ (ตามลำดับใน flow_1.png ข้อ 11 ก่อน 8)
 */
export default function MeasurementsStep({ orderState, setOrderState, onNext }: any) {
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

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setOrderState({ ...orderState, bodyPhoto: compressedBase64 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleClickUpload = () => fileInputRef.current?.click();

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>

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
          width: '100%', height: 400, bgcolor: '#E5DFD6', borderRadius: '16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
          border: orderState.bodyPhoto ? 'none' : '2px dashed #1B2A4A',
        }}
      >
        {orderState.bodyPhoto ? (
          <>
            <Image src={orderState.bodyPhoto} alt="รูปตัวเองที่อัปโหลด" fill style={{ objectFit: 'cover' }} />
            <Box sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: 'rgba(255,255,255,0.9)', p: 1, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CameraAltRoundedIcon sx={{ color: '#1B2A4A' }} />
            </Box>
          </>
        ) : (
          <>
            <CameraAltRoundedIcon sx={{ fontSize: 48, color: '#1B2A4A', mb: 2 }} />
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#1B2A4A', textAlign: 'center', px: 3 }}>
              ยืนให้เต็มตัวเพื่อให้ AI วัดสัดส่วนของคุณ
            </Typography>
          </>
        )}
      </Box>

      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', textAlign: 'center', color: '#6B7280' }}>
        ถ่ายรูปและส่งข้อมูลสัดส่วนของคุณ
      </Typography>

      <Button
        variant="contained"
        fullWidth
        disabled={!orderState.bodyPhoto}
        onClick={onNext}
        sx={{
          bgcolor: '#1B2A4A',
          color: 'white',
          py: 1.5,
          borderRadius: '12px',
          fontFamily: '"Noto Serif Thai", serif',
          fontWeight: 700,
          '&:hover': { bgcolor: '#0f182b' },
          '&:disabled': { bgcolor: '#E5DFD6', color: '#A09C95' },
        }}
      >
        ถัดไป — ลองใส่เสมือนจริง
      </Button>

    </Box>
  );
}
