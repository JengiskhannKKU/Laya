import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

const recommendedPatterns = [
  { id: 1, name: "ชุดไทยเรือนต้น", image: "/images/mock_pattern_1.jpg" },
  { id: 2, name: "ชุดไทยจิตรลดา", image: "/images/mock_pattern_2.jpg" },
  { id: 3, name: "ชุดไทยอมรินทร์", image: "/images/mock_pattern_3.jpg" },
];

export default function PatternRecommendationStep({ orderState, setOrderState, onNext }: any) {
  const handleSelect = (pattern: any) => {
    setOrderState({ ...orderState, pattern });
    onNext();
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', textAlign: 'center', color: '#6B7280', mb: 1 }}>
        ทรงที่แนะนำสำหรับคุณ
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recommendedPatterns.map((pat) => (
          <Box 
            key={pat.id} 
            onClick={() => handleSelect(pat)}
            sx={{ 
              display: 'flex', 
              bgcolor: '#FFFFFF', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              border: orderState.pattern?.id === pat.id ? '2px solid #C5A55A' : '2px solid transparent'
            }}
          >
            <Box sx={{ width: 100, height: 140, position: 'relative', bgcolor: '#E5DFD6' }}>
              {/* Fallback to fabric1 if mock_pattern doesn't exist to prevent broken images */}
              <Image src={"/images/fabric1.jpg"} alt={pat.name} fill style={{ objectFit: 'cover' }} />
            </Box>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, color: '#1B2A4A' }}>
                {pat.name}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      
    </Box>
  );
}
