import { Box, Typography, Button, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import Image from "next/image";

export default function UploadFabricStep({ orderState, setOrderState, onNext }: any) {
  const handleSimulateUpload = () => {
    // Simulate uploading and capturing image
    setOrderState({ ...orderState, fabricImage: "/images/fabric1.jpg" });
    // In a real app, this would open file picker/camera
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      
      <Box 
        onClick={handleSimulateUpload}
        sx={{ 
          width: '100%', 
          height: 350, 
          bgcolor: '#E5DFD6', 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          border: '2px dashed #C5A55A'
        }}
      >
        {orderState.fabricImage ? (
          <Image src={orderState.fabricImage} alt="Uploaded Fabric" fill style={{ objectFit: 'cover' }} />
        ) : (
          <>
            <CameraAltRoundedIcon sx={{ fontSize: 48, color: '#C5A55A', mb: 1 }} />
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: '#6B7280' }}>
              แตะเพื่อถ่ายรูปหรืออัปโหลด
            </Typography>
          </>
        )}
      </Box>

      {orderState.fabricImage && (
        <Button 
          variant="contained" 
          fullWidth 
          onClick={onNext}
          sx={{ 
            bgcolor: '#1B2A4A', 
            color: 'white', 
            py: 1.5, 
            borderRadius: '12px',
            fontFamily: '"Noto Serif Thai", serif',
            fontWeight: 700,
            '&:hover': { bgcolor: '#0f182b' }
          }}
        >
          วิเคราะห์ผ้าด้วย AI
        </Button>
      )}
    </Box>
  );
}
