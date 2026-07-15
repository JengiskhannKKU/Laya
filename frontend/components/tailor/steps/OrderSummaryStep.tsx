import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: '#FFFFFF', p: 2.5, borderRadius: '18px', border: '1px solid #EFE9DD', boxShadow: '0 4px 20px rgba(27,42,74,0.06)' }}>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, mb: 1.75, color: NAVY, fontSize: '0.92rem' }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.83rem' }}>{label}</Typography>
      <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.83rem', textAlign: 'right' }}>{value}</Typography>
    </Box>
  );
}

export default function OrderSummaryStep({ orderState, onNext }: any) {
  const shape = orderState.shape;
  const total = shape?.price ?? 990;

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

      {/* ข้อมูลผ้า */}
      <SectionCard title="ข้อมูลผ้า">
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ width: 64, height: 84, position: 'relative', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid #EFE9DD' }}>
            <Image src={orderState.fabricImage || "/images/fabric1.webp"} alt="ผ้าของคุณ" fill style={{ objectFit: 'cover' }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, flex: 1 }}>
            <Row label="ประเภทผ้า" value={orderState.analysisResult?.type || "ไม่ระบุ"} />
            <Row label="เทคนิค" value={orderState.analysisResult?.technique || "ไม่ระบุ"} />
          </Box>
        </Box>
      </SectionCard>

      {/* ข้อมูลแบบ (Template) */}
      <SectionCard title="ข้อมูลแบบ (Template)">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
          <Row label="ร้านตัดเย็บ" value={orderState.shop?.name || "ไม่ระบุ"} />
          <Row label="เทมเพลต" value={shape?.name || "ไม่ระบุ"} />
          <Row label="โอกาสใช้งาน" value={orderState.occasion || "ไม่ระบุ"} />
        </Box>
      </SectionCard>

      {/* ราคา */}
      <SectionCard title="ราคาโดยประมาณ">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
          <Row label="ค่าตัดเย็บ (เทมเพลตนี้)" value={`${total.toLocaleString()} บาท`} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5, pt: 1.75, borderTop: '1px solid #F3EFE7' }}>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontWeight: 600, fontSize: '0.88rem' }}>ราคาโดยประมาณ</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: GOLD, fontSize: '1.3rem' }}>
              {total.toLocaleString()} <Typography component="span" sx={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600 }}>บาท</Typography>
            </Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* Design Visualization disclaimer */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", bgcolor: `${GOLD}0F`, border: `1px solid ${GOLD}40`, borderRadius: "12px", px: 1.5, py: 1.1 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16, color: GOLD, mt: 0.15, flexShrink: 0 }} />
        <Typography sx={{ fontFamily: FONT, color: "#8A6D3B", fontSize: "0.7rem", lineHeight: 1.6 }}>
          ราคาและภาพเป็นเพียงการประมาณการและการจำลองการออกแบบเท่านั้น ร้านที่รับออเดอร์จะยืนยันราคาและรายละเอียดจริงอีกครั้งก่อนเริ่มผลิต
        </Typography>
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={onNext}
        sx={{
          bgcolor: NAVY,
          color: 'white',
          py: 1.7,
          borderRadius: '14px',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: '0.95rem',
          boxShadow: '0 4px 14px rgba(27,42,74,0.25)',
          '&:hover': { bgcolor: '#0F1A30' },
        }}
      >
        ยืนยันสั่งตัด
      </Button>

    </Box>
  );
}
