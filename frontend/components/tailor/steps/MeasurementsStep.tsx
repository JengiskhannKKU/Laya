import { useRef, useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { motion } from "framer-motion";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

export type Perspective = "front" | "back" | "side";
export type BodyInputMode = "photo" | "measurements";

export interface BodyMeasurements {
  gender: "male" | "female";
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hip: number;
  // เพิ่มตามสเปค custom_design_flow.jpg — ไม่บังคับกรอก (ให้ AI/ร้านใช้ค่าประมาณถ้าไม่ระบุ)
  shoulderWidth?: number;
  armLength?: number;
  garmentLength?: number;
  notes?: string;
}

/**
 * ถ่ายรูปตัวเอง / กรอกสัดส่วนร่างกาย — ให้ผู้ใช้เลือกได้ 2 ทาง ก่อนไปขั้นลองใส่เสมือนจริง:
 *  - photo: ถ่ายรูปตัวเองจริง 3 มุม (หน้า/หลัง/ข้าง) — AI ใช้รูปจริง compositing ชุดลงบนตัวผู้ใช้เอง
 *  - measurements: กรอกสัดส่วนร่างกาย (ส่วนสูง/น้ำหนัก/รอบอก/รอบเอว/รอบสะโพก) แทนการถ่ายรูป — AI จะสร้าง
 *    แบบจำลอง (ไม่ใช่ตัวผู้ใช้เอง) ที่มีสัดส่วนใกล้เคียงคุณ เหมาะกับคนที่ไม่สะดวกถ่ายรูปตัวเอง
 * เก็บที่ orderState.bodyInputMode บอกว่าเลือกทางไหน, orderState.bodyPhotos หรือ orderState.bodyMeasurements
 * ตามโหมดที่เลือก — VirtualTryOnStep จะแตกกิ่งใช้ข้อมูลจากโหมดที่ถูกต้อง
 */
export default function MeasurementsStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  const mode: BodyInputMode | undefined = orderState.bodyInputMode;

  const PERSPECTIVES: { key: Perspective; label: string; hint: string }[] = [
    { key: "front", label: t("tailorFlow.measurements.front"), hint: t("tailorFlow.measurements.hintFront") },
    { key: "back", label: t("tailorFlow.measurements.back"), hint: t("tailorFlow.measurements.hintBack") },
    { key: "side", label: t("tailorFlow.measurements.side"), hint: t("tailorFlow.measurements.hintSide") },
  ];
  const photos: Partial<Record<Perspective, string>> = orderState.bodyPhotos ?? {};
  const allPhotosDone = PERSPECTIVES.every((p) => !!photos[p.key]);
  const doneCount = Object.values(photos).filter(Boolean).length;

  const setPhoto = (key: Perspective, dataUrl: string) => {
    setOrderState({ ...orderState, bodyPhotos: { ...photos, [key]: dataUrl } });
  };

  const setMode = (next: BodyInputMode) => {
    setOrderState({ ...orderState, bodyInputMode: next });
  };

  const backToModePicker = () => {
    setOrderState({ ...orderState, bodyInputMode: undefined });
  };

  // ---- โหมดยังไม่ได้เลือก: การ์ดเลือกวิธี ----
  if (!mode) {
    return (
      <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: '0.95rem' }}>
            {t("tailorFlow.measurements.modeTitle")}
          </Typography>
          <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.8rem', mt: 0.3 }}>
            {t("tailorFlow.measurements.modeSubtitle")}
          </Typography>
        </Box>

        <Box
          component={motion.div}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode("photo")}
          sx={{
            display: 'flex', alignItems: 'center', gap: 2, p: 2.4, bgcolor: '#FFFFFF', borderRadius: '18px',
            border: '1px solid #EFE9DD', cursor: 'pointer', boxShadow: '0 4px 16px rgba(27,42,74,0.06)',
            '&:hover': { borderColor: GOLD },
          }}
        >
          <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: `${NAVY}0D`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CameraAltRoundedIcon sx={{ fontSize: 26, color: GOLD }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.9rem' }}>
              {t("tailorFlow.measurements.modePhotoTitle")}
            </Typography>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.76rem', mt: 0.3 }}>
              {t("tailorFlow.measurements.modePhotoDesc")}
            </Typography>
          </Box>
        </Box>

        <Box
          component={motion.div}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode("measurements")}
          sx={{
            display: 'flex', alignItems: 'center', gap: 2, p: 2.4, bgcolor: '#FFFFFF', borderRadius: '18px',
            border: '1px solid #EFE9DD', cursor: 'pointer', boxShadow: '0 4px 16px rgba(27,42,74,0.06)',
            '&:hover': { borderColor: GOLD },
          }}
        >
          <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: `${NAVY}0D`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <StraightenRoundedIcon sx={{ fontSize: 26, color: GOLD }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: '0.9rem' }}>
              {t("tailorFlow.measurements.modeMeasureTitle")}
            </Typography>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.76rem', mt: 0.3 }}>
              {t("tailorFlow.measurements.modeMeasureDesc")}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // ---- โหมดถ่ายรูปตัวเอง ----
  if (mode === "photo") {
    return (
      <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'stretch', pt: 1 }}>

        <ChangeModeLink onClick={backToModePicker} label={t("tailorFlow.measurements.changeMode")} />

        <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#6B7280', fontSize: '0.88rem' }}>
          {t("tailorFlow.measurements.subtitle")}
        </Typography>

        {PERSPECTIVES.map((p) => (
          <PhotoSlot key={p.key} label={p.label} hint={p.hint} value={photos[p.key]} onCapture={(dataUrl) => setPhoto(p.key, dataUrl)} />
        ))}

        <Button
          variant="contained"
          fullWidth
          disabled={!allPhotosDone}
          onClick={onNext}
          sx={{
            bgcolor: NAVY,
            color: 'white',
            py: 1.7,
            borderRadius: '14px',
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: '0.95rem',
            mt: 0.5,
            boxShadow: allPhotosDone ? '0 4px 14px rgba(27,42,74,0.25)' : 'none',
            '&:hover': { bgcolor: '#0F1A30' },
            '&:disabled': { bgcolor: '#EFE9DD', color: '#A09C95' },
          }}
        >
          {allPhotosDone ? t("tailorFlow.measurements.nextReady") : t("tailorFlow.measurements.nextProgress").replace("{n}", String(doneCount))}
        </Button>

      </Box>
    );
  }

  // ---- โหมดกรอกสัดส่วนร่างกาย ----
  return (
    <MeasurementsForm
      orderState={orderState}
      setOrderState={setOrderState}
      onBack={backToModePicker}
      onNext={onNext}
    />
  );
}

function ChangeModeLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 0.3, cursor: 'pointer', color: NAVY, alignSelf: 'flex-start' }}>
      <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
      <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600 }}>{label}</Typography>
    </Box>
  );
}

function MeasurementsForm({ orderState, setOrderState, onBack, onNext }: any) {
  const { t } = useLanguage();
  const existing: Partial<BodyMeasurements> = orderState.bodyMeasurements ?? {};
  const [gender, setGender] = useState<"male" | "female" | undefined>(existing.gender);
  const [height, setHeight] = useState(existing.height ? String(existing.height) : "");
  const [weight, setWeight] = useState(existing.weight ? String(existing.weight) : "");
  const [chest, setChest] = useState(existing.chest ? String(existing.chest) : "");
  const [waist, setWaist] = useState(existing.waist ? String(existing.waist) : "");
  const [hip, setHip] = useState(existing.hip ? String(existing.hip) : "");
  // ฟิลด์เพิ่มเติมตามสเปค custom_design_flow.jpg — ไม่บังคับกรอก ซ่อนไว้หลังปุ่ม "+ เพิ่มรายละเอียดเพิ่มเติม"
  const [showMore, setShowMore] = useState(
    !!(existing.shoulderWidth || existing.armLength || existing.garmentLength || existing.notes)
  );
  const [shoulderWidth, setShoulderWidth] = useState(existing.shoulderWidth ? String(existing.shoulderWidth) : "");
  const [armLength, setArmLength] = useState(existing.armLength ? String(existing.armLength) : "");
  const [garmentLength, setGarmentLength] = useState(existing.garmentLength ? String(existing.garmentLength) : "");
  const [notes, setNotes] = useState(existing.notes ?? "");

  const allFilled = !!gender && [height, weight, chest, waist, hip].every((v) => Number(v) > 0);

  const handleNext = () => {
    if (!allFilled || !gender) return;
    setOrderState({
      ...orderState,
      bodyMeasurements: {
        gender,
        height: Number(height),
        weight: Number(weight),
        chest: Number(chest),
        waist: Number(waist),
        hip: Number(hip),
        ...(shoulderWidth ? { shoulderWidth: Number(shoulderWidth) } : {}),
        ...(armLength ? { armLength: Number(armLength) } : {}),
        ...(garmentLength ? { garmentLength: Number(garmentLength) } : {}),
        ...(notes ? { notes } : {}),
      },
    });
    onNext();
  };

  const numberFieldSx = {
    '& .MuiInputBase-input': { fontFamily: FONT, fontSize: '0.9rem' },
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

      <ChangeModeLink onClick={onBack} label={t("tailorFlow.measurements.changeMode")} />

      <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
        {t("tailorFlow.measurements.formSubtitle")}
      </Typography>

      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #EFE9DD', borderRadius: '18px', boxShadow: '0 4px 20px rgba(27,42,74,0.06)', p: 2.2, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* เพศ */}
        <Box>
          <Typography sx={{ fontFamily: FONT, color: NAVY, fontWeight: 600, fontSize: '0.85rem', mb: 0.8 }}>
            {t("tailorFlow.measurements.gender")}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(["male", "female"] as const).map((g) => (
              <Box
                key={g}
                onClick={() => setGender(g)}
                sx={{
                  flex: 1, py: 1.1, textAlign: 'center', borderRadius: '12px', cursor: 'pointer',
                  bgcolor: gender === g ? NAVY : '#F9F6F0', color: gender === g ? 'white' : NAVY,
                  border: gender === g ? 'none' : '1px solid #EFE9DD',
                  fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6,
                }}
              >
                <PersonRoundedIcon sx={{ fontSize: 18 }} />
                {g === "male" ? t("tailorFlow.measurements.genderMale") : t("tailorFlow.measurements.genderFemale")}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ส่วนสูง / น้ำหนัก */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label={t("tailorFlow.measurements.height")}
            type="number"
            fullWidth
            size="small"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            sx={numberFieldSx}
            InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
          />
          <TextField
            label={t("tailorFlow.measurements.weight")}
            type="number"
            fullWidth
            size="small"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            sx={numberFieldSx}
            InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
          />
        </Box>

        {/* รอบอก / รอบเอว / รอบสะโพก */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label={t("tailorFlow.measurements.chest")}
            type="number"
            fullWidth
            size="small"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            sx={numberFieldSx}
            InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
          />
          <TextField
            label={t("tailorFlow.measurements.waist")}
            type="number"
            fullWidth
            size="small"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            sx={numberFieldSx}
            InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
          />
          <TextField
            label={t("tailorFlow.measurements.hip")}
            type="number"
            fullWidth
            size="small"
            value={hip}
            onChange={(e) => setHip(e.target.value)}
            sx={numberFieldSx}
            InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
          />
        </Box>

        {!showMore ? (
          <Box
            onClick={() => setShowMore(true)}
            sx={{ cursor: 'pointer', color: GOLD, fontFamily: FONT, fontWeight: 600, fontSize: '0.82rem', textAlign: 'center' }}
          >
            {t("tailorFlow.measurements.addDetails")}
          </Box>
        ) : (
          <>
            {/* ไหล่กว้าง / ความยาวแขน / ความยาวเสื้อ — ไม่บังคับกรอก */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                label={t("tailorFlow.measurements.shoulderWidth")}
                type="number"
                fullWidth
                size="small"
                value={shoulderWidth}
                onChange={(e) => setShoulderWidth(e.target.value)}
                sx={numberFieldSx}
                InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
              />
              <TextField
                label={t("tailorFlow.measurements.armLength")}
                type="number"
                fullWidth
                size="small"
                value={armLength}
                onChange={(e) => setArmLength(e.target.value)}
                sx={numberFieldSx}
                InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
              />
              <TextField
                label={t("tailorFlow.measurements.garmentLength")}
                type="number"
                fullWidth
                size="small"
                value={garmentLength}
                onChange={(e) => setGarmentLength(e.target.value)}
                sx={numberFieldSx}
                InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.85rem' } }}
              />
            </Box>

            <TextField
              placeholder={t("tailorFlow.measurements.notesPlaceholder")}
              multiline
              minRows={2}
              fullWidth
              size="small"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ '& .MuiInputBase-input': { fontFamily: FONT, fontSize: '0.85rem' } }}
            />
          </>
        )}
      </Box>

      <Button
        variant="contained"
        fullWidth
        disabled={!allFilled}
        onClick={handleNext}
        startIcon={<CheckRoundedIcon sx={{ fontSize: 18 }} />}
        sx={{
          bgcolor: NAVY,
          color: 'white',
          py: 1.7,
          borderRadius: '14px',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: '0.95rem',
          boxShadow: allFilled ? '0 4px 14px rgba(27,42,74,0.25)' : 'none',
          '&:hover': { bgcolor: '#0F1A30' },
          '&:disabled': { bgcolor: '#EFE9DD', color: '#A09C95' },
        }}
      >
        {t("tailorFlow.measurements.nextReady")}
      </Button>

    </Box>
  );
}

function PhotoSlot({ label, hint, value, onCapture }: {
  label: string; hint: string; value?: string; onCapture: (dataUrl: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        onCapture(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box
      onClick={() => fileInputRef.current?.click()}
      sx={{
        width: '100%', height: 180, bgcolor: '#FFFFFF', borderRadius: '18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        border: value ? `1px solid ${GOLD}` : '1.5px dashed #D8CFC0',
        boxShadow: value ? '0 4px 16px rgba(197,165,90,0.15)' : 'none',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
    >
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

      {value ? (
        <>
          <Image src={value} alt={label} fill style={{ objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(27,42,74,0.85)', color: 'white', px: 1.5, py: 0.5, borderRadius: '999px' }}>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', fontWeight: 600 }}>{label}</Typography>
          </Box>
          <Box sx={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: '50%', bgcolor: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <CheckRoundedIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
          <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(255,255,255,0.92)', p: 1, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CameraAltRoundedIcon sx={{ color: NAVY, fontSize: 18 }} />
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: `${NAVY}0D`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <CameraAltRoundedIcon sx={{ fontSize: 24, color: GOLD }} />
          </Box>
          <Typography sx={{ fontFamily: FONT, color: NAVY, fontWeight: 600, fontSize: '0.9rem' }}>
            {label}
          </Typography>
          <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.72rem', textAlign: 'center', px: 2, mt: 0.3 }}>
            {hint}
          </Typography>
        </>
      )}
    </Box>
  );
}
