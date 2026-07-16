import { useState } from "react";
import { Box, Typography, Paper, Button, TextField, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import { Building2, PartyPopper, Flower2, Presentation, Coffee } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

/**
 * บรีฟการใช้งานและดีไซน์ — ตามสเปค custom_design_flow.jpg (step "บริฟการใช้งานและดีไซน์"):
 * เดิมมีแค่เลือกโอกาสใช้งาน (คลิกแล้ว onNext ทันที) เพิ่มสไตล์/ความพอดี/หมายเหตุเข้ามาในหน้าเดียวกัน
 * จึงเปลี่ยนพฤติกรรมโอกาสใช้งานจาก "คลิกแล้วไปต่อทันที" เป็น "เลือกไว้ก่อน" แล้วกดปุ่มถัดไปทีเดียว
 * เก็บที่ orderState.occasion (เดิม) และ orderState.designBrief = {style, fit, notes} (ใหม่)
 */
export default function SelectOccasionStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  // id คงเป็นภาษาไทยเสมอ (ใช้เป็นค่าที่เก็บ/แสดงใน OrderSummaryStep) — แปลแค่ title ที่แสดงบนปุ่ม
  const occasions = [
    { id: "ทำงานราชการ", title: t("tailorFlow.selectOccasion.government"), icon: Building2 },
    { id: "งานแต่ง / งานพิธี", title: t("tailorFlow.selectOccasion.wedding"), icon: PartyPopper },
    { id: "งานบุญ", title: t("tailorFlow.selectOccasion.merit"), icon: Flower2 },
    { id: "ประชุม / สัมมนา", title: t("tailorFlow.selectOccasion.meeting"), icon: Presentation },
    { id: "Casual / ออกงาน", title: t("tailorFlow.selectOccasion.casual"), icon: Coffee },
  ];

  const STYLE_OPTIONS = [
    { id: "Minimal", label: t("tailorFlow.selectOccasion.styleMinimal") },
    { id: "Casual", label: t("tailorFlow.selectOccasion.styleCasual") },
    { id: "Elegant", label: t("tailorFlow.selectOccasion.styleElegant") },
    { id: "Vintage", label: t("tailorFlow.selectOccasion.styleVintage") },
    { id: "Modern", label: t("tailorFlow.selectOccasion.styleModern") },
  ];
  const FIT_OPTIONS = [
    { id: "Slim Fit", label: t("tailorFlow.selectOccasion.fitSlim") },
    { id: "Regular Fit", label: t("tailorFlow.selectOccasion.fitRegular") },
    { id: "Loose Fit", label: t("tailorFlow.selectOccasion.fitLoose") },
  ];

  const [occasion, setOccasion] = useState<string | undefined>(orderState.occasion);
  const [style, setStyle] = useState(orderState.designBrief?.style ?? STYLE_OPTIONS[0].id);
  const [fit, setFit] = useState(orderState.designBrief?.fit ?? FIT_OPTIONS[1].id);
  const [notes, setNotes] = useState(orderState.designBrief?.notes ?? "");

  const handleNext = () => {
    if (!occasion) return;
    setOrderState({ ...orderState, occasion, designBrief: { style, fit, notes } });
    onNext();
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>

      <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#6B7280', fontSize: '0.88rem' }}>
        {t("tailorFlow.selectOccasion.subtitle")}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.75 }}>
        {occasions.map((occ, index) => {
          const isLastOdd = index === occasions.length - 1 && occasions.length % 2 !== 0;
          const Icon = occ.icon;
          const selected = occasion === occ.id;

          return (
            <Paper
              key={occ.id}
              elevation={0}
              component={motion.div}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOccasion(occ.id)}
              sx={{
                gridColumn: isLastOdd ? 'span 2' : 'span 1',
                bgcolor: '#FFFFFF',
                border: selected ? `1.5px solid ${GOLD}` : '1px solid #EFE9DD',
                borderRadius: '18px',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                boxShadow: selected ? '0 8px 24px rgba(197,165,90,0.2)' : '0 4px 16px rgba(27,42,74,0.06)',
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

      {/* สไตล์ / ความพอดี / หมายเหตุ — บรีฟการใช้งานและดีไซน์ */}
      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #EFE9DD', borderRadius: '18px', boxShadow: '0 4px 20px rgba(27,42,74,0.06)', p: 2.2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            select
            label={t("tailorFlow.selectOccasion.styleLabel")}
            fullWidth
            size="small"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontFamily: FONT, fontSize: '0.85rem' } }}
            InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
          >
            {STYLE_OPTIONS.map((opt) => (
              <MenuItem key={opt.id} value={opt.id} sx={{ fontFamily: FONT }}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label={t("tailorFlow.selectOccasion.fitLabel")}
            fullWidth
            size="small"
            value={fit}
            onChange={(e) => setFit(e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontFamily: FONT, fontSize: '0.85rem' } }}
            InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
          >
            {FIT_OPTIONS.map((opt) => (
              <MenuItem key={opt.id} value={opt.id} sx={{ fontFamily: FONT }}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          label={t("tailorFlow.selectOccasion.notesLabel")}
          placeholder={t("tailorFlow.selectOccasion.notesPlaceholder")}
          multiline
          minRows={2}
          fullWidth
          size="small"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ '& .MuiInputBase-input': { fontFamily: FONT, fontSize: '0.85rem' } }}
          InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
        />
      </Box>

      <Button
        variant="contained"
        fullWidth
        disabled={!occasion}
        onClick={handleNext}
        sx={{
          bgcolor: NAVY, color: 'white', py: 1.7, borderRadius: '14px', fontFamily: FONT, fontWeight: 600, fontSize: '0.95rem',
          boxShadow: occasion ? '0 4px 14px rgba(27,42,74,0.25)' : 'none',
          '&:hover': { bgcolor: '#0F1A30' },
          '&:disabled': { bgcolor: '#EFE9DD', color: '#A09C95' },
        }}
      >
        {t("tailorFlow.selectOccasion.nextButton")}
      </Button>

    </Box>
  );
}
