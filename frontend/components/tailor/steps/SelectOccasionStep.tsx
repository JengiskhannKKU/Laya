import { useState } from "react";
import { Box, Typography, Paper, Button, TextField, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

const OTHER_ID = "__other__";

/**
 * บรีฟการใช้งานและดีไซน์ — ตามสเปค custom_design_flow.jpg (step "บริฟการใช้งานและดีไซน์"):
 * เดิมมีแค่เลือกโอกาสใช้งาน (คลิกแล้ว onNext ทันที) เพิ่มสไตล์/ความพอดี/หมายเหตุเข้ามาในหน้าเดียวกัน
 * จึงเปลี่ยนพฤติกรรมโอกาสใช้งานจาก "คลิกแล้วไปต่อทันที" เป็น "เลือกไว้ก่อน" แล้วกดปุ่มถัดไปทีเดียว
 * เก็บที่ orderState.occasion (เดิม) และ orderState.designBrief = {style, fit, notes} (ใหม่)
 *
 * รูปการ์ดแต่ละโอกาส (Unsplash, ใช้ได้ฟรีเชิงพาณิชย์ตาม Unsplash License) แทนไอคอน lucide เดิม
 * เพิ่มตัวเลือก "อื่นๆ" — เลือกแล้วกรอกโอกาสใช้งานเองได้ (เก็บเป็นข้อความที่พิมพ์จริงลง orderState.occasion
 * ไม่ใช่ค่าคงที่ "อื่นๆ" เฉยๆ เพื่อให้ร้านตัดเย็บเห็นข้อมูลที่ลูกค้าตั้งใจสื่อจริงๆ)
 */
export default function SelectOccasionStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  // id คงเป็นภาษาไทยเสมอ (ใช้เป็นค่าที่เก็บ/แสดงใน OrderSummaryStep) — แปลแค่ title ที่แสดงบนปุ่ม
  const occasions = [
    { id: "ทำงานราชการ", title: t("tailorFlow.selectOccasion.government"), image: "https://images.unsplash.com/photo-1758518729929-8210d3b0839e?w=400&q=75&auto=format&fit=crop" },
    { id: "งานแต่ง / งานพิธี", title: t("tailorFlow.selectOccasion.wedding"), image: "https://images.unsplash.com/photo-1774024872647-c3b57c420eab?w=400&q=75&auto=format&fit=crop" },
    { id: "งานบุญ", title: t("tailorFlow.selectOccasion.merit"), image: "https://images.unsplash.com/photo-1770234849093-a18146f44bc0?w=400&q=75&auto=format&fit=crop" },
    { id: "ประชุม / สัมมนา", title: t("tailorFlow.selectOccasion.meeting"), image: "https://images.unsplash.com/photo-1769740333462-9a63bfa914bc?w=400&q=75&auto=format&fit=crop" },
    { id: "Casual / ออกงาน", title: t("tailorFlow.selectOccasion.casual"), image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&q=75&auto=format&fit=crop" },
    { id: OTHER_ID, title: t("tailorFlow.selectOccasion.other"), image: "https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?w=400&q=75&auto=format&fit=crop" },
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

  // ถ้าโอกาสที่เคยเลือกไว้ไม่ตรงกับตัวเลือกมาตรฐานอันไหนเลย แปลว่าเป็นโอกาสที่กรอกเองไว้ — ถือว่าเลือก "อื่นๆ" อยู่
  const existingIsCustom = !!orderState.occasion && !occasions.some((o) => o.id === orderState.occasion);
  const [occasion, setOccasion] = useState<string | undefined>(
    existingIsCustom ? OTHER_ID : orderState.occasion
  );
  const [customOccasion, setCustomOccasion] = useState(existingIsCustom ? orderState.occasion : "");
  const [style, setStyle] = useState(orderState.designBrief?.style ?? STYLE_OPTIONS[0].id);
  const [fit, setFit] = useState(orderState.designBrief?.fit ?? FIT_OPTIONS[1].id);
  const [notes, setNotes] = useState(orderState.designBrief?.notes ?? "");

  const isOtherSelected = occasion === OTHER_ID;
  const resolvedOccasion = isOtherSelected ? customOccasion.trim() : occasion;
  const canProceed = isOtherSelected ? customOccasion.trim().length > 0 : !!occasion;

  const handleNext = () => {
    if (!canProceed) return;
    setOrderState({ ...orderState, occasion: resolvedOccasion, designBrief: { style, fit, notes } });
    onNext();
  };

  // ข้ามขั้นตอนนี้ — ใช้โอกาสใช้งาน/สไตล์/ความพอดีที่เลือกไว้แล้ว (หรือค่าเริ่มต้น ถ้ายังไม่ได้เลือกโอกาสเลย)
  const handleSkip = () => {
    setOrderState({
      ...orderState,
      occasion: resolvedOccasion || occasions[0].id,
      designBrief: { style, fit, notes },
    });
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
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: selected ? '0 8px 24px rgba(197,165,90,0.2)' : '0 4px 16px rgba(27,42,74,0.06)',
                transition: 'box-shadow 0.25s, border-color 0.25s',
                '&:hover': { borderColor: GOLD, boxShadow: '0 10px 28px rgba(197,165,90,0.16)' },
              }}
            >
              <Box sx={{ width: '100%', height: 96, position: 'relative' }}>
                <Image src={occ.image} alt={occ.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 600px) 50vw, 300px" />
                <Box sx={{ position: 'absolute', inset: 0, bgcolor: selected ? 'rgba(27,42,74,0.15)' : 'rgba(27,42,74,0.25)', transition: 'background-color 0.25s' }} />
              </Box>
              <Typography sx={{
                fontFamily: FONT,
                fontWeight: 600,
                color: NAVY,
                fontSize: '0.9rem',
                textAlign: 'center',
                py: 1.4,
                px: 1,
              }}>
                {occ.title}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {isOtherSelected && (
        <TextField
          label={t("tailorFlow.selectOccasion.otherLabel")}
          placeholder={t("tailorFlow.selectOccasion.otherPlaceholder")}
          fullWidth
          size="small"
          autoFocus
          value={customOccasion}
          onChange={(e) => setCustomOccasion(e.target.value)}
          sx={{ bgcolor: '#FFFFFF', borderRadius: '12px', '& .MuiInputBase-input': { fontFamily: FONT, fontSize: '0.85rem' } }}
          InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
        />
      )}

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
        disabled={!canProceed}
        onClick={handleNext}
        sx={{
          bgcolor: NAVY, color: 'white', py: 1.7, borderRadius: '14px', fontFamily: FONT, fontWeight: 600, fontSize: '0.95rem',
          boxShadow: canProceed ? '0 4px 14px rgba(27,42,74,0.25)' : 'none',
          '&:hover': { bgcolor: '#0F1A30' },
          '&:disabled': { bgcolor: '#EFE9DD', color: '#A09C95' },
        }}
      >
        {t("tailorFlow.selectOccasion.nextButton")}
      </Button>

      <Button
        onClick={handleSkip}
        sx={{ color: '#9B958A', fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600, textTransform: 'none' }}
      >
        {t("tailorFlow.common.skipStep")}
      </Button>

    </Box>
  );
}
