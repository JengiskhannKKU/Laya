import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, TextField, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import HiveRoundedIcon from "@mui/icons-material/HiveRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// เดิม hardcode ผิดเป็น localhost:5000 (backend จริงรันที่ 4000 ทั้ง local dev และ production ผ่าน nginx /api/)
// ตัด trailing slash กัน URL เพี้ยนเป็น // เหมือนบั๊กที่เจอใน VirtualTryOnStep.tsx ก่อนหน้านี้
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

type AnalysisResult = {
  type: string;
  technique: string;
  pattern: string;
  tone: string;
  thickness: string;
};

export default function AIAnalysisStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  const ATTRIBUTES = [
    { key: "type", label: t("tailorFlow.aiAnalysis.attrType"), icon: CheckroomRoundedIcon },
    { key: "technique", label: t("tailorFlow.aiAnalysis.attrTechnique"), icon: GridOnRoundedIcon },
    { key: "pattern", label: t("tailorFlow.aiAnalysis.attrPattern"), icon: HiveRoundedIcon },
    { key: "tone", label: t("tailorFlow.aiAnalysis.attrTone"), icon: ColorLensRoundedIcon },
    { key: "thickness", label: t("tailorFlow.aiAnalysis.attrThickness"), icon: LayersRoundedIcon },
  ] as const;
  // ประเภทผ้าที่ผู้ใช้เลือกแก้ไขได้ — id คงเป็นภาษาไทยเสมอ (ค่าที่เก็บจริงใน analysisResult.type)
  // ตามคอนเวนชันเดียวกับ SelectOccasionStep แปลแค่ label ที่แสดง
  const TYPE_OPTIONS = [
    { id: "ผ้าไหม", label: t("tailorFlow.aiAnalysis.typeSilk") },
    { id: "ผ้าฝ้าย", label: t("tailorFlow.aiAnalysis.typeCotton") },
    { id: "ผ้าลินิน", label: t("tailorFlow.aiAnalysis.typeLinen") },
    { id: "ผ้าขนสัตว์", label: t("tailorFlow.aiAnalysis.typeWool") },
    { id: "ผ้าใยสังเคราะห์", label: t("tailorFlow.aiAnalysis.typeSynthetic") },
  ];

  const [analyzing, setAnalyzing] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<AnalysisResult | null>(null);
  const [customType, setCustomType] = useState(false);

  useEffect(() => {
    const analyzeFabric = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/ai/analyze-fabric`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: orderState.fabricImage })
        });

        if (!response.ok) throw new Error("API failed");

        const data = await response.json();
        setOrderState((prev: any) => ({ ...prev, analysisResult: data }));
      } catch (err) {
        console.error("Fabric analysis error:", err);
        // เชื่อมต่อ backend ไม่ได้จริงๆ (ไม่ใช่แค่ยังไม่ได้ตั้งค่า AI key — เคสนั้น backend ตอบข้อมูลลายผ้าจริงมาแล้ว)
        // ไม่ยัดค่าปลอมให้ผู้ใช้เข้าใจผิด — เปิดโหมดแก้ไขให้กรอกเองแทน
        setOrderState((prev: any) => ({ ...prev, analysisResult: null }));
        setIsEditing(true);
        setDraft({ type: "", technique: "", pattern: "", tone: "", thickness: "" });
        setCustomType(true);
      } finally {
        setAnalyzing(false);
      }
    };

    analyzeFabric();
  }, [orderState.fabricImage, setOrderState]);

  const startEditing = () => {
    const current: AnalysisResult = {
      type: orderState.analysisResult?.type ?? "",
      technique: orderState.analysisResult?.technique ?? "",
      pattern: orderState.analysisResult?.pattern ?? "",
      tone: orderState.analysisResult?.tone ?? "",
      thickness: orderState.analysisResult?.thickness ?? "",
    };
    setDraft(current);
    setCustomType(!TYPE_OPTIONS.some((opt) => opt.id === current.type));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft(null);
  };

  const saveEditing = () => {
    if (!draft) return;
    setOrderState((prev: any) => ({ ...prev, analysisResult: draft }));
    setIsEditing(false);
    setDraft(null);
  };

  const updateDraft = (key: keyof AnalysisResult, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // ข้ามขั้นตอนนี้ — ไม่ต้องรอ AI วิเคราะห์เสร็จ ใช้ค่า fallback ทั่วไปแทนถ้ายังไม่มีผลวิเคราะห์
  const handleSkip = () => {
    setOrderState((prev: any) => ({
      ...prev,
      analysisResult: prev.analysisResult ?? {
        type: "ผ้าไหม", technique: "ทอมือ", pattern: "ลายทั่วไป", tone: "หลากสี", thickness: "ปานกลาง",
      },
    }));
    onNext();
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'center', pt: 1 }}>

      {/* รูปผ้า */}
      <Box sx={{ width: '100%', height: 190, borderRadius: '18px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 16px rgba(27,42,74,0.1)' }}>
        <Image src={orderState.fabricImage || "/images/fabric1.webp"} alt="Fabric" fill style={{ objectFit: 'cover' }} />
      </Box>

      {analyzing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 3, height: 220, justifyContent: 'center' }}>
          <CircularProgress sx={{ color: NAVY }} />
          <Typography sx={{ fontFamily: FONT, color: NAVY, textAlign: 'center', fontSize: '0.9rem' }}>
            {t("tailorFlow.aiAnalysis.analyzing").split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </Typography>
          <Button onClick={handleSkip} sx={{ color: '#9B958A', fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600, textTransform: 'none' }}>
            {t("tailorFlow.common.skipStep")}
          </Button>
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5, mb: 1 }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: '0.88rem' }}>
              {t("tailorFlow.aiAnalysis.resultTitle")}
            </Typography>
            {!isEditing && (
              <Box
                onClick={startEditing}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer',
                  color: GOLD, fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600,
                }}
              >
                <EditRoundedIcon sx={{ fontSize: 16 }} />
                {t("tailorFlow.aiAnalysis.edit")}
              </Box>
            )}
          </Box>

          {!isEditing && (
            <Typography sx={{ fontFamily: FONT, color: '#9CA3AF', fontSize: '0.74rem', px: 0.5, mb: 1 }}>
              {t("tailorFlow.aiAnalysis.editHint")}
            </Typography>
          )}

          <Box sx={{
            bgcolor: '#FFFFFF', border: '1px solid #EFE9DD', borderRadius: '18px',
            boxShadow: '0 4px 20px rgba(27,42,74,0.06)', p: 1,
          }}>
            {ATTRIBUTES.map(({ key, label, icon: Icon }, i) => (
              <Box key={key} sx={{
                display: 'flex', alignItems: isEditing ? 'flex-start' : 'center', justifyContent: 'space-between', px: 1.5, py: 1.6, gap: 1.5,
                borderBottom: i < ATTRIBUTES.length - 1 ? '1px solid #F3EFE7' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: isEditing ? 0.6 : 0, flexShrink: 0 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: `${NAVY}0D`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon sx={{ color: GOLD, fontSize: 18 }} />
                  </Box>
                  <Typography sx={{ fontFamily: FONT, color: NAVY, fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{label}</Typography>
                </Box>

                {!isEditing ? (
                  <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.85rem', textAlign: 'right', maxWidth: '55%' }}>
                    {orderState.analysisResult?.[key]}
                  </Typography>
                ) : key === "type" ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.6, flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end' }}>
                      {TYPE_OPTIONS.map((opt) => {
                        const selected = !customType && draft?.type === opt.id;
                        return (
                          <Box
                            key={opt.id}
                            onClick={() => { setCustomType(false); updateDraft("type", opt.id); }}
                            sx={{
                              px: 1.2, py: 0.5, borderRadius: '999px', cursor: 'pointer',
                              fontFamily: FONT, fontSize: '0.72rem', fontWeight: 600,
                              bgcolor: selected ? NAVY : '#F3EFE7', color: selected ? '#FFFFFF' : NAVY,
                              transition: 'all 0.15s',
                            }}
                          >
                            {opt.label}
                          </Box>
                        );
                      })}
                      <Box
                        onClick={() => { setCustomType(true); updateDraft("type", ""); }}
                        sx={{
                          px: 1.2, py: 0.5, borderRadius: '999px', cursor: 'pointer',
                          fontFamily: FONT, fontSize: '0.72rem', fontWeight: 600,
                          bgcolor: customType ? NAVY : '#F3EFE7', color: customType ? '#FFFFFF' : NAVY,
                          transition: 'all 0.15s',
                        }}
                      >
                        {t("tailorFlow.aiAnalysis.otherTypeOption")}
                      </Box>
                    </Box>
                    {customType && (
                      <TextField
                        size="small"
                        value={draft?.type ?? ""}
                        onChange={(e) => updateDraft("type", e.target.value)}
                        placeholder={t("tailorFlow.aiAnalysis.otherTypePlaceholder")}
                        sx={{
                          width: '100%',
                          '& .MuiInputBase-input': { fontFamily: FONT, fontSize: '0.85rem', textAlign: 'right', py: 0.9 },
                        }}
                      />
                    )}
                  </Box>
                ) : (
                  <TextField
                    size="small"
                    value={draft?.[key] ?? ""}
                    onChange={(e) => updateDraft(key, e.target.value)}
                    placeholder={t("tailorFlow.aiAnalysis.fieldPlaceholder").replace("{field}", label)}
                    sx={{
                      flex: 1, minWidth: 0,
                      '& .MuiInputBase-input': { fontFamily: FONT, fontSize: '0.85rem', textAlign: 'right', py: 0.9 },
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={cancelEditing}
                startIcon={<CloseRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  py: 1.5, borderRadius: '14px', fontFamily: FONT, fontWeight: 600, fontSize: '0.9rem',
                  color: NAVY, borderColor: '#D9CDBA', '&:hover': { borderColor: NAVY, bgcolor: 'transparent' },
                }}
              >
                {t("tailorFlow.aiAnalysis.cancel")}
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={saveEditing}
                startIcon={<CheckRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  py: 1.5, borderRadius: '14px', fontFamily: FONT, fontWeight: 600, fontSize: '0.9rem',
                  bgcolor: NAVY, color: 'white', '&:hover': { bgcolor: '#0F1A30' },
                }}
              >
                {t("tailorFlow.aiAnalysis.save")}
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={onNext}
              sx={{
                mt: 3,
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
              {t("tailorFlow.aiAnalysis.nextButton")}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
