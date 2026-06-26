import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

const occasions = [
  "ทำงานราชการ",
  "งานแต่ง / งานพิธี",
  "งานบุญ",
  "ประชุม / สัมมนา",
  "Casual / ออกงาน"
];

export default function SelectOccasionStep({ orderState, setOrderState, onNext }: any) {
  const handleSelect = (occ: string) => {
    setOrderState({ ...orderState, occasion: occ });
    onNext();
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      
      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', textAlign: 'center', color: '#6B7280', mb: 2 }}>
        เลือกโอกาสที่คุณต้องการใส่ชุดนี้
      </Typography>

      {occasions.map((occ) => (
        <Button 
          key={occ}
          variant="outlined" 
          onClick={() => handleSelect(occ)}
          sx={{ 
            bgcolor: '#FFFFFF',
            borderColor: '#E5DFD6',
            color: '#1B2A4A', 
            py: 2, 
            borderRadius: '12px',
            fontFamily: '"Noto Serif Thai", serif',
            fontWeight: 600,
            fontSize: '1rem',
            '&:hover': { bgcolor: '#F0EBE3', borderColor: '#C5A55A' }
          }}
        >
          {occ}
        </Button>
      ))}
      
    </Box>
  );
}
