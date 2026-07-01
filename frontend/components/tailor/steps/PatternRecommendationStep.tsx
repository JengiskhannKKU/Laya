import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

// Icons
import WomanIcon from '@mui/icons-material/Woman';
import ManIcon from '@mui/icons-material/Man';
import WcIcon from '@mui/icons-material/Wc';
import CompressIcon from '@mui/icons-material/Compress';
import StraightIcon from '@mui/icons-material/Straight';
import ExpandIcon from '@mui/icons-material/Expand';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import CropSquareIcon from '@mui/icons-material/CropSquare';

// Mocking 2D preview images based on selection
const getPreviewImage = (gender: string, shape: string, collar: string) => {
  if (gender === 'women') {
    if (shape === 'fitted') return '/mom1.png';
    if (shape === 'loose') return '/mom3.png';
    return '/teenager1.png';
  }
  return '/teenager2.png'; // Fallback
};

export default function PatternRecommendationStep({ orderState, setOrderState, onNext }: any) {
  const [gender, setGender] = useState('women');
  const [shape, setShape] = useState('fitted');
  const [collar, setCollar] = useState('chinese');

  const handleConfirm = () => {
    setOrderState({ 
      ...orderState, 
      pattern: { gender, shape, collar, image: getPreviewImage(gender, shape, collar) } 
    });
    onNext();
  };

  const OptionButton = ({ active, onClick, icon, label }: any) => (
    <Box 
      onClick={onClick}
      sx={{ 
        flex: '0 0 auto',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 0.5,
        width: '76px',
        height: '76px',
        borderRadius: '12px',
        border: active ? '2px solid #1B2A4A' : '1px solid #E5DFD6',
        bgcolor: active ? '#F0EBE3' : '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <Box sx={{ color: active ? '#1B2A4A' : '#6B7280', display: 'flex' }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: active ? 600 : 400, color: active ? '#1B2A4A' : '#6B7280', fontFamily: '"Noto Serif Thai", serif' }}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      
      {/* 2D Image Preview */}
      <Box sx={{ position: 'relative', width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', bgcolor: '#F0EBE3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box 
          component={motion.img}
          key={`${gender}-${shape}-${collar}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={getPreviewImage(gender, shape, collar)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        />
        
        {/* Mockup Labels */}
        <Box sx={{ position: 'absolute', top: '20%', right: '10%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ bgcolor: 'rgba(255,255,255,0.9)', px: 1, py: 0.5, borderRadius: 2, fontSize: '0.65rem', fontWeight: 600, fontFamily: '"Noto Serif Thai", serif' }}>คอเสื้อ</Typography>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1B2A4A', border: '1px solid white' }} />
        </Box>
        <Box sx={{ position: 'absolute', top: '50%', left: '10%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1B2A4A', border: '1px solid white' }} />
          <Typography sx={{ bgcolor: 'rgba(255,255,255,0.9)', px: 1, py: 0.5, borderRadius: 2, fontSize: '0.65rem', fontWeight: 600, fontFamily: '"Noto Serif Thai", serif' }}>ทรงเสื้อ</Typography>
        </Box>
      </Box>

      {/* Selectors */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 10 }}>
        
        <Box>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: '0.85rem', fontWeight: 700, color: '#1B2A4A', mb: 1.5 }}>
            ประเภทเสื้อ
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            <OptionButton active={gender === 'women'} onClick={() => setGender('women')} icon={<WomanIcon />} label="เสื้อผู้หญิง" />
            <OptionButton active={gender === 'men'} onClick={() => setGender('men')} icon={<ManIcon />} label="เสื้อผู้ชาย" />
            <OptionButton active={gender === 'unisex'} onClick={() => setGender('unisex')} icon={<WcIcon />} label="ยูนิเซ็กส์" />
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: '0.85rem', fontWeight: 700, color: '#1B2A4A', mb: 1.5 }}>
            ทรงเสื้อ
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            <OptionButton active={shape === 'fitted'} onClick={() => setShape('fitted')} icon={<CompressIcon />} label="ทรงเข้ารูป" />
            <OptionButton active={shape === 'straight'} onClick={() => setShape('straight')} icon={<StraightIcon />} label="ทรงตรง" />
            <OptionButton active={shape === 'loose'} onClick={() => setShape('loose')} icon={<ExpandIcon />} label="ทรงปล่อย" />
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: '0.85rem', fontWeight: 700, color: '#1B2A4A', mb: 1.5 }}>
            รายละเอียดคอเสื้อ
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            <OptionButton active={collar === 'round'} onClick={() => setCollar('round')} icon={<RadioButtonUncheckedIcon />} label="คอกลม" />
            <OptionButton active={collar === 'v-neck'} onClick={() => setCollar('v-neck')} icon={<KeyboardArrowDownIcon />} label="คอวี" />
            <OptionButton active={collar === 'chinese'} onClick={() => setCollar('chinese')} icon={<HorizontalRuleIcon />} label="คอจีน" />
            <OptionButton active={collar === 'square'} onClick={() => setCollar('square')} icon={<CropSquareIcon />} label="คอเหลี่ยม" />
          </Box>
        </Box>
        
      </Box>

      {/* Sticky Bottom Action */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'white', borderTop: '1px solid #E5DFD6', zIndex: 10 }}>
        <Button 
          variant="contained"
          onClick={handleConfirm}
          fullWidth
          sx={{ 
            borderRadius: '24px', 
            py: 1.5, 
            bgcolor: '#1B2A4A', 
            color: '#FFFFFF',
            fontFamily: '"Noto Serif Thai", serif',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(27, 42, 74, 0.2)',
            '&:hover': { bgcolor: '#0F1A30' }
          }}
        >
          ยืนยันแบบนี้
        </Button>
      </Box>

    </Box>
  );
}
