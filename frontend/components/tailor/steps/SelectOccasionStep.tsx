import { Box, Typography, Button, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { Building2, PartyPopper, Flower2, Presentation, Coffee } from "lucide-react";

const occasions = [
  { id: "ทำงานราชการ", title: "ทำงานราชการ", icon: <Building2 size={28} /> },
  { id: "งานแต่ง / งานพิธี", title: "งานแต่ง / งานพิธี", icon: <PartyPopper size={28} /> },
  { id: "งานบุญ", title: "งานบุญ / ไปวัด", icon: <Flower2 size={28} /> },
  { id: "ประชุม / สัมมนา", title: "ประชุม / สัมมนา", icon: <Presentation size={28} /> },
  { id: "Casual / ออกงาน", title: "Casual / ลำลอง", icon: <Coffee size={28} /> }
];

export default function SelectOccasionStep({ orderState, setOrderState, onNext }: any) {
  const handleSelect = (occ: string) => {
    setOrderState({ ...orderState, occasion: occ });
    onNext();
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
      
      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', textAlign: 'center', color: '#6B7280', fontSize: '0.95rem' }}>
        เลือกโอกาสที่คุณต้องการใส่ชุดนี้<br />เพื่อให้ AI แนะนำทรงที่เหมาะสมที่สุด
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        {occasions.map((occ, index) => {
          // Make the last item span 2 columns if the total is odd
          const isLastOdd = index === occasions.length - 1 && occasions.length % 2 !== 0;
          
          return (
            <Paper
              key={occ.id}
              elevation={0}
              component={motion.div}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(occ.id)}
              sx={{
                gridColumn: isLastOdd ? 'span 2' : 'span 1',
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E5DFD6',
                borderRadius: '16px',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#C5A55A',
                  bgcolor: '#FDFBFA',
                  boxShadow: '0 4px 12px rgba(197, 165, 90, 0.1)'
                }
              }}
            >
              <Box sx={{ color: '#1B2A4A' }}>
                {occ.icon}
              </Box>
              <Typography sx={{ 
                fontFamily: '"Noto Serif Thai", serif', 
                fontWeight: 600, 
                color: '#1B2A4A',
                fontSize: '0.95rem',
                textAlign: 'center'
              }}>
                {occ.title}
              </Typography>
            </Paper>
          );
        })}
      </Box>
      
    </Box>
  );
}
