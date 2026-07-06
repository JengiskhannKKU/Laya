import { useRef } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import Image from "next/image";

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

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', pt: 2 }}>
      
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
          height: 400, 
          bgcolor: '#F0EBE3', 
          borderRadius: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
        }}
      >
        {orderState.fabricImage ? (
          <>
            <Image src={orderState.fabricImage} alt="Uploaded Fabric" fill style={{ objectFit: 'cover' }} />
            <Box sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: 'rgba(255,255,255,0.9)', p: 1, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CameraAltRoundedIcon sx={{ color: '#1B2A4A' }} />
            </Box>
          </>
        ) : (
          <>
            <Image src="/images/fabric1.webp" alt="Fabric placeholder" fill style={{ objectFit: 'cover', opacity: 0.3 }} />
            <Box sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: '#FFFFFF', p: 1.5, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CameraAltRoundedIcon sx={{ color: '#1B2A4A', fontSize: 28 }} />
            </Box>
          </>
        )}
      </Box>

      <Button 
        variant="outlined" 
        fullWidth 
        onClick={handleClickUpload}
        sx={{ 
          bgcolor: '#FFFFFF', 
          color: '#1B2A4A', 
          borderColor: '#E5DFD6',
          py: 2, 
          borderRadius: '16px',
          fontFamily: '"Noto Serif Thai", serif',
          fontWeight: 600,
          '&:hover': { bgcolor: '#F0EBE3', borderColor: '#C5A55A' }
        }}
      >
        ถ่ายหรือเลือกจากแกลเลอรี่
      </Button>

    </Box>
  );
}
