import { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { motion } from "framer-motion";
import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

/**
 * ปรับรายละเอียดเพิ่มเติม — ตามสเปค services.jpg ข้อ 4 "หลักการทำงานของ Preview Engine" ขั้นที่ 5:
 * คอเสื้อ / แขนเสื้อ / กระเป๋า / กระดุม / ความยาว / ทรง / ซับใน-อื่นๆ
 * มาหลังขั้นอัปโหลดผ้า (เห็น Preview การออกแบบแล้ว) — ทุกฟิลด์ไม่บังคับเลือก ปุ่มถัดไปกดได้เสมอ
 * เก็บที่ orderState.garmentDetails ให้ร้านตัดเย็บใช้ประกอบการตัดจริง (โชว์ต่อใน OrderSummaryStep)
 */
export default function CustomizeDetailsStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  const existing = orderState.garmentDetails ?? {};

  const [collar, setCollar] = useState<string | undefined>(existing.collar);
  const [sleeve, setSleeve] = useState<string | undefined>(existing.sleeve);
  const [pocket, setPocket] = useState<string | undefined>(existing.pocket);
  const [button, setButton] = useState<string | undefined>(existing.button);
  const [length, setLength] = useState<string | undefined>(existing.length);
  const [silhouette, setSilhouette] = useState<string | undefined>(existing.silhouette);
  const [lining, setLining] = useState<string | undefined>(existing.lining);
  const [otherNotes, setOtherNotes] = useState(existing.otherNotes ?? "");

  const COLLAR_OPTIONS = [
    { id: "shirt", label: t("tailorFlow.customizeDetails.collarShirt") },
    { id: "round", label: t("tailorFlow.customizeDetails.collarRound") },
    { id: "v", label: t("tailorFlow.customizeDetails.collarV") },
    { id: "mandarin", label: t("tailorFlow.customizeDetails.collarMandarin") },
    { id: "none", label: t("tailorFlow.customizeDetails.collarNone") },
  ];
  const SLEEVE_OPTIONS = [
    { id: "short", label: t("tailorFlow.customizeDetails.sleeveShort") },
    { id: "long", label: t("tailorFlow.customizeDetails.sleeveLong") },
    { id: "three_quarter", label: t("tailorFlow.customizeDetails.sleeveThreeQuarter") },
    { id: "none", label: t("tailorFlow.customizeDetails.sleeveNone") },
  ];
  const POCKET_OPTIONS = [
    { id: "none", label: t("tailorFlow.customizeDetails.pocketNone") },
    { id: "one", label: t("tailorFlow.customizeDetails.pocketOne") },
    { id: "two", label: t("tailorFlow.customizeDetails.pocketTwo") },
    { id: "chest", label: t("tailorFlow.customizeDetails.pocketChest") },
  ];
  const BUTTON_OPTIONS = [
    { id: "hidden", label: t("tailorFlow.customizeDetails.buttonHidden") },
    { id: "single", label: t("tailorFlow.customizeDetails.buttonSingle") },
    { id: "double", label: t("tailorFlow.customizeDetails.buttonDouble") },
    { id: "zipper", label: t("tailorFlow.customizeDetails.buttonZipper") },
    { id: "none", label: t("tailorFlow.customizeDetails.buttonNone") },
  ];
  const LENGTH_OPTIONS = [
    { id: "short", label: t("tailorFlow.customizeDetails.lengthShort") },
    { id: "regular", label: t("tailorFlow.customizeDetails.lengthRegular") },
    { id: "long", label: t("tailorFlow.customizeDetails.lengthLong") },
  ];
  const SILHOUETTE_OPTIONS = [
    { id: "straight", label: t("tailorFlow.customizeDetails.silhouetteStraight") },
    { id: "fitted", label: t("tailorFlow.customizeDetails.silhouetteFitted") },
    { id: "a_line", label: t("tailorFlow.customizeDetails.silhouetteALine") },
  ];
  const LINING_OPTIONS = [
    { id: "yes", label: t("tailorFlow.customizeDetails.liningYes") },
    { id: "no", label: t("tailorFlow.customizeDetails.liningNo") },
  ];

  const buildDetails = () => ({
    ...(collar ? { collar } : {}),
    ...(sleeve ? { sleeve } : {}),
    ...(pocket ? { pocket } : {}),
    ...(button ? { button } : {}),
    ...(length ? { length } : {}),
    ...(silhouette ? { silhouette } : {}),
    ...(lining ? { lining } : {}),
    ...(otherNotes ? { otherNotes } : {}),
  });

  const handleNext = () => {
    setOrderState({ ...orderState, garmentDetails: buildDetails() });
    onNext();
  };

  const handleSkip = () => {
    setOrderState({ ...orderState, garmentDetails: buildDetails() });
    onNext();
  };

  const ChipGroup = ({
    label, options, value, onChange,
  }: { label: string; options: { id: string; label: string }[]; value?: string; onChange: (id: string) => void }) => (
    <Box>
      <Typography sx={{ fontFamily: FONT, color: NAVY, fontWeight: 600, fontSize: '0.85rem', mb: 0.8 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <Box
              key={opt.id}
              onClick={() => onChange(selected ? "" : opt.id)}
              sx={{
                px: 1.4, py: 0.6, borderRadius: '999px', cursor: 'pointer',
                fontFamily: FONT, fontSize: '0.78rem', fontWeight: 600,
                bgcolor: selected ? NAVY : '#F3EFE7', color: selected ? '#FFFFFF' : NAVY,
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
        <CheckroomRoundedIcon sx={{ color: GOLD, fontSize: 20 }} />
        <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
          {t("tailorFlow.customizeDetails.subtitle")}
        </Typography>
      </Box>

      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #EFE9DD', borderRadius: '18px', boxShadow: '0 4px 20px rgba(27,42,74,0.06)', p: 2.2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ChipGroup label={t("tailorFlow.customizeDetails.collarLabel")} options={COLLAR_OPTIONS} value={collar} onChange={setCollar} />
        <ChipGroup label={t("tailorFlow.customizeDetails.sleeveLabel")} options={SLEEVE_OPTIONS} value={sleeve} onChange={setSleeve} />
        <ChipGroup label={t("tailorFlow.customizeDetails.pocketLabel")} options={POCKET_OPTIONS} value={pocket} onChange={setPocket} />
        <ChipGroup label={t("tailorFlow.customizeDetails.buttonLabel")} options={BUTTON_OPTIONS} value={button} onChange={setButton} />
        <ChipGroup label={t("tailorFlow.customizeDetails.lengthLabel")} options={LENGTH_OPTIONS} value={length} onChange={setLength} />
        <ChipGroup label={t("tailorFlow.customizeDetails.silhouetteLabel")} options={SILHOUETTE_OPTIONS} value={silhouette} onChange={setSilhouette} />
        <ChipGroup label={t("tailorFlow.customizeDetails.liningLabel")} options={LINING_OPTIONS} value={lining} onChange={setLining} />

        <Box>
          <Typography sx={{ fontFamily: FONT, color: NAVY, fontWeight: 600, fontSize: '0.85rem', mb: 0.8 }}>
            {t("tailorFlow.customizeDetails.otherNotesLabel")}
          </Typography>
          <TextField
            placeholder={t("tailorFlow.customizeDetails.otherNotesPlaceholder")}
            multiline
            minRows={2}
            fullWidth
            size="small"
            value={otherNotes}
            onChange={(e) => setOtherNotes(e.target.value)}
            sx={{ '& .MuiInputBase-input': { fontFamily: FONT, fontSize: '0.85rem' } }}
          />
        </Box>
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={handleNext}
        sx={{
          bgcolor: NAVY, color: 'white', py: 1.7, borderRadius: '14px', fontFamily: FONT, fontWeight: 600, fontSize: '0.95rem',
          boxShadow: '0 4px 14px rgba(27,42,74,0.25)', '&:hover': { bgcolor: '#0F1A30' },
        }}
      >
        {t("tailorFlow.customizeDetails.nextButton")}
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
