import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

// map id ที่เก็บใน orderState.garmentDetails กลับเป็น i18n key suffix ให้ตรงกับ CustomizeDetailsStep.tsx
const DETAIL_KEY_MAP: Record<string, Record<string, string>> = {
  collar: { shirt: "collarShirt", round: "collarRound", v: "collarV", mandarin: "collarMandarin", none: "collarNone" },
  sleeve: { short: "sleeveShort", long: "sleeveLong", three_quarter: "sleeveThreeQuarter", none: "sleeveNone" },
  pocket: { none: "pocketNone", one: "pocketOne", two: "pocketTwo", chest: "pocketChest" },
  button: { hidden: "buttonHidden", single: "buttonSingle", double: "buttonDouble", zipper: "buttonZipper", none: "buttonNone" },
  length: { short: "lengthShort", regular: "lengthRegular", long: "lengthLong" },
  silhouette: { straight: "silhouetteStraight", fitted: "silhouetteFitted", a_line: "silhouetteALine" },
  lining: { yes: "liningYes", no: "liningNo" },
};

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
  const { t } = useLanguage();
  const shape = orderState.shape;
  const total = shape?.price ?? 990;
  const unspecified = t("tailorFlow.orderSummary.unspecified");
  const brief = orderState.designBrief;
  const measurementNotes = orderState.bodyMeasurements?.notes;
  const details = orderState.garmentDetails ?? {};

  const detailLabel = (category: keyof typeof DETAIL_KEY_MAP, id?: string): string | undefined => {
    if (!id) return undefined;
    const suffix = DETAIL_KEY_MAP[category]?.[id];
    return suffix ? t(`tailorFlow.customizeDetails.${suffix}`) : undefined;
  };

  const detailRows: { label: string; value: string }[] = [
    { label: t("tailorFlow.customizeDetails.collarLabel"), value: detailLabel("collar", details.collar) },
    { label: t("tailorFlow.customizeDetails.sleeveLabel"), value: detailLabel("sleeve", details.sleeve) },
    { label: t("tailorFlow.customizeDetails.pocketLabel"), value: detailLabel("pocket", details.pocket) },
    { label: t("tailorFlow.customizeDetails.buttonLabel"), value: detailLabel("button", details.button) },
    { label: t("tailorFlow.customizeDetails.lengthLabel"), value: detailLabel("length", details.length) },
    { label: t("tailorFlow.customizeDetails.silhouetteLabel"), value: detailLabel("silhouette", details.silhouette) },
    { label: t("tailorFlow.customizeDetails.liningLabel"), value: detailLabel("lining", details.lining) },
  ].filter((row): row is { label: string; value: string } => !!row.value);

  // สถานะวิธีลองใส่เสมือนจริง — โชว์ให้ร้านเห็นว่าลูกค้าใช้ทางไหน (รูปจริง/สัดส่วน/AR) หรือยังไม่ได้ระบุเลย (ข้ามขั้นตอน)
  const bodyMode = orderState.bodyInputMode;
  const bodyPhotosCount = Object.values(orderState.bodyPhotos ?? {}).filter(Boolean).length;
  const bodyModeText =
    bodyMode === "photo"
      ? (bodyPhotosCount >= 3 ? t("tailorFlow.orderSummary.bodyModePhoto") : t("tailorFlow.orderSummary.bodyModePhotoPartial").replace("{n}", String(bodyPhotosCount)))
      : bodyMode === "measurements"
      ? t("tailorFlow.orderSummary.bodyModeMeasurements")
      : bodyMode === "ar3d"
      ? t("tailorFlow.orderSummary.bodyModeAR")
      : t("tailorFlow.orderSummary.bodyModeNone");

  const m = orderState.bodyMeasurements;
  const skinToneLabel = m?.skinTone ? t(`tailorFlow.measurements.skinTones.${m.skinTone}`) : undefined;

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

      {/* ข้อมูลผ้า */}
      <SectionCard title={t("tailorFlow.orderSummary.fabricInfoTitle")}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ width: 64, height: 84, position: 'relative', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid #EFE9DD' }}>
            <Image src={orderState.fabricImage || "/images/fabric1.webp"} alt="Your fabric" fill style={{ objectFit: 'cover' }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, flex: 1 }}>
            <Row label={t("tailorFlow.orderSummary.fabricType")} value={orderState.analysisResult?.type || unspecified} />
            <Row label={t("tailorFlow.orderSummary.technique")} value={orderState.analysisResult?.technique || unspecified} />
          </Box>
        </Box>
      </SectionCard>

      {/* ข้อมูลแบบ (Template) */}
      <SectionCard title={t("tailorFlow.orderSummary.templateInfoTitle")}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {shape?.front && (
            <Box sx={{ width: 64, height: 84, position: 'relative', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid #EFE9DD', bgcolor: '#FBF9F5' }}>
              <Image src={shape.front} alt={shape.name} fill style={{ objectFit: 'contain' }} />
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1, flex: 1 }}>
            <Row label={t("tailorFlow.orderSummary.shopLabel")} value={orderState.shop?.name || unspecified} />
            <Row label={t("tailorFlow.orderSummary.template")} value={shape?.name || unspecified} />
            <Row label={t("tailorFlow.orderSummary.occasion")} value={orderState.occasion || unspecified} />
            <Row label={t("tailorFlow.orderSummary.style")} value={brief?.style || unspecified} />
            <Row label={t("tailorFlow.orderSummary.fit")} value={brief?.fit || unspecified} />
            {brief?.notes && <Row label={t("tailorFlow.orderSummary.briefNotes")} value={brief.notes} />}
          </Box>
        </Box>
      </SectionCard>

      {/* รายละเอียดที่ปรับแต่ง — คอ/แขน/กระเป๋า/กระดุม/ความยาว/ทรง/ซับใน จาก CustomizeDetailsStep */}
      <SectionCard title={t("tailorFlow.orderSummary.customizationTitle")}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
          {detailRows.length === 0 ? (
            <Typography sx={{ fontFamily: FONT, color: '#9CA3AF', fontSize: '0.8rem', fontStyle: 'italic' }}>
              {t("tailorFlow.orderSummary.noCustomization")}
            </Typography>
          ) : (
            detailRows.map((row) => <Row key={row.label} label={row.label} value={row.value} />)
          )}
          {details.otherNotes && <Row label={t("tailorFlow.orderSummary.otherNotes")} value={details.otherNotes} />}
        </Box>
      </SectionCard>

      {/* ข้อมูลลูกค้า — วิธีลองใส่เสมือนจริงที่เลือก + สัดส่วน/สีผิว (ถ้ามี) */}
      <SectionCard title={t("tailorFlow.orderSummary.customerInfoTitle")}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
          <Row label={t("tailorFlow.orderSummary.bodyModeLabel")} value={bodyModeText} />
          {bodyMode === "measurements" && m && (
            <>
              <Row label={t("tailorFlow.measurements.height")} value={`${m.height} ซม.`} />
              <Row label={t("tailorFlow.measurements.weight")} value={`${m.weight} กก.`} />
              <Row label={t("tailorFlow.measurements.chest")} value={`${m.chest} ซม.`} />
              <Row label={t("tailorFlow.measurements.waist")} value={`${m.waist} ซม.`} />
              <Row label={t("tailorFlow.measurements.hip")} value={`${m.hip} ซม.`} />
              {skinToneLabel && <Row label={t("tailorFlow.orderSummary.skinTone")} value={skinToneLabel} />}
            </>
          )}
          {measurementNotes && <Row label={t("tailorFlow.orderSummary.measurementNotes")} value={measurementNotes} />}
        </Box>
      </SectionCard>

      {/* ราคา */}
      <SectionCard title={t("tailorFlow.orderSummary.priceTitle")}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
          <Row label={t("tailorFlow.orderSummary.tailoringFee")} value={`${total.toLocaleString()} ${t("tailorFlow.orderSummary.baht")}`} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5, pt: 1.75, borderTop: '1px solid #F3EFE7' }}>
            <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontWeight: 600, fontSize: '0.88rem' }}>{t("tailorFlow.orderSummary.estimatedPrice")}</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: GOLD, fontSize: '1.3rem' }}>
              {total.toLocaleString()} <Typography component="span" sx={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600 }}>{t("tailorFlow.orderSummary.baht")}</Typography>
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: FONT, color: '#9CA3AF', fontSize: '0.72rem', mt: 0.5, lineHeight: 1.6 }}>
            {t("tailorFlow.orderSummary.priceDisclaimer")}
          </Typography>
        </Box>
      </SectionCard>

      {/* Design Visualization disclaimer */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", bgcolor: `${GOLD}0F`, border: `1px solid ${GOLD}40`, borderRadius: "12px", px: 1.5, py: 1.1 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16, color: GOLD, mt: 0.15, flexShrink: 0 }} />
        <Typography sx={{ fontFamily: FONT, color: "#8A6D3B", fontSize: "0.7rem", lineHeight: 1.6 }}>
          {t("tailorFlow.orderSummary.disclaimer")}
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
        {t("tailorFlow.orderSummary.confirmOrderButton")}
      </Button>

    </Box>
  );
}
