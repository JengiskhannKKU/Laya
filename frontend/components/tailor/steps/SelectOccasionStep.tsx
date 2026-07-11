import { Box, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { Building2, PartyPopper, Flower2, Presentation, Coffee } from "lucide-react";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

const occasions = [
  { id: "ทำงานราชการ", title: "ทำงานราชการ", icon: Building2 },
  { id: "งานแต่ง / งานพิธี", title: "งานแต่ง / งานพิธี", icon: PartyPopper },
  { id: "งานบุญ", title: "งานบุญ / ไปวัด", icon: Flower2 },
  { id: "ประชุม / สัมมนา", title: "ประชุม / สัมมนา", icon: Presentation },
  { id: "Casual / ออกงาน", title: "Casual / ลำลอง", icon: Coffee },
];

export default function SelectOccasionStep({ orderState, setOrderState, onNext }: any) {
  const handleSelect = (occ: string) => {
    setOrderState({ ...orderState, occasion: occ });
    onNext();
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>

      <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#6B7280', fontSize: '0.88rem' }}>
        เลือกโอกาสที่คุณต้องการใส่ชุดนี้ เพื่อให้ AI แนะนำทรงที่เหมาะสมที่สุด
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.75 }}>
        {occasions.map((occ, index) => {
          const isLastOdd = index === occasions.length - 1 && occasions.length % 2 !== 0;
          const Icon = occ.icon;

          return (
            <Paper
              key={occ.id}
              elevation={0}
              component={motion.div}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(occ.id)}
              sx={{
                gridColumn: isLastOdd ? 'span 2' : 'span 1',
                bgcolor: '#FFFFFF',
                border: '1px solid #EFE9DD',
                borderRadius: '18px',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(27,42,74,0.06)',
                transition: 'box-shadow 0.25s, border-color 0.25s',
                '&:hover': { borderColor: GOLD, boxShadow: '0 10px 28px rgba(197,165,90,0.16)' },
              }}
            >
              <Box sx={{
                width: 54, height: 54, borderRadius: '50%', bgcolor: `${NAVY}0D`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={24} color={GOLD} />
              </Box>
              <Typography sx={{
                fontFamily: FONT,
                fontWeight: 600,
                color: NAVY,
                fontSize: '0.9rem',
                textAlign: 'center',
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
