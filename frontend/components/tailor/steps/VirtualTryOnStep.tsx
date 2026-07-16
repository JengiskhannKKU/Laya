"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import type { Perspective } from "./MeasurementsStep";

// ตัด trailing slash กัน URL เพี้ยนเป็น // (NEXT_PUBLIC_API_URL ใน .env.local ลงท้ายด้วย / อยู่)
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

type SlotState = { status: "idle" | "loading" | "done" | "error"; url?: string; mock?: boolean; error?: string };

/**
 * ลองใส่เสมือนจริงของจริง — AI (kie.ai gpt4o-image ผ่าน backend /api/tryon/*) ใส่ชุดจากผ้าที่อัปโหลดไว้
 * ลงบนรูปตัวเองของผู้ใช้ ทีละมุม (หน้า/หลัง/ข้าง) จริง ไม่ใช่ placeholder แบบเดิมอีกต่อไป
 *
 * ผู้ใช้กดเลือกสร้างเองทีละมุม (ไม่ auto-generate ทั้ง 3 มุมพร้อมกันตอนเข้าหน้า) เพื่อประหยัด
 * resource การเรียก AI — สร้างเฉพาะมุมที่ผู้ใช้อยากดูจริงๆ เท่านั้น
 * ยังคงห้ามยิงพร้อมกันหลายมุม (ทดสอบจริงแล้วพบว่ายิงพร้อมกันทำให้ kie.ai คืน error เพราะแอคเคาท์นี้
 * จำกัด concurrency) — ปุ่ม generate จะถูก disable ระหว่างมุมอื่นกำลังสร้างอยู่
 * ถ้า API หมดเครดิต backend จะ fallback เป็นรูปตัวอย่างเองแบบ graceful (mock:true) — โชว์ label บอกตรงๆ
 */
export default function VirtualTryOnStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  const PERSPECTIVES: { key: Perspective; label: string }[] = [
    { key: "front", label: t("tailorFlow.virtualTryOn.front") },
    { key: "back", label: t("tailorFlow.virtualTryOn.back") },
    { key: "side", label: t("tailorFlow.virtualTryOn.side") },
  ];
  const bodyPhotos = orderState.bodyPhotos as Record<Perspective, string> | undefined;
  const bodyMeasurements = orderState.bodyMeasurements;
  const isMeasurementMode = orderState.bodyInputMode === "measurements";
  const [active, setActive] = useState<Perspective>("front");
  const [slots, setSlots] = useState<Record<Perspective, SlotState>>({
    front: { status: "idle" }, back: { status: "idle" }, side: { status: "idle" },
  });
  const uploadedUrls = useRef<{ body: Partial<Record<Perspective, string>>; fabric?: string }>({ body: {} });
  const [elapsedSec, setElapsedSec] = useState(0);

  const anyLoading = PERSPECTIVES.some((p) => slots[p.key].status === "loading");
  const loadingPerspective = PERSPECTIVES.find((p) => slots[p.key].status === "loading")?.key;

  // นับเวลาที่ผ่านไปตอนกำลัง generate — AI ใช้เวลาจริงได้ 2-5 นาทีต่อมุม (บางครั้งนานกว่านั้น) กันคนคิดว่าค้าง
  useEffect(() => {
    if (!loadingPerspective) { setElapsedSec(0); return; }
    setElapsedSec(0);
    const t = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loadingPerspective]);

  const uploadOnce = async (dataUrl: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/tryon/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: dataUrl }),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error ?? t("tailorFlow.virtualTryOn.uploadFailed"));
    return json.url as string;
  };

  const runPerspective = async (p: Perspective) => {
    setSlots((s) => ({ ...s, [p]: { status: "loading" } }));
    try {
      // โหมด measurements ไม่มีรูปตัวเองจริง — ให้ AI สร้างแบบจำลองจากสัดส่วนแทน ไม่ต้องอัปโหลด/ส่ง bodyPhotoUrl
      let bodyUrl: string | undefined;
      if (!isMeasurementMode) {
        bodyUrl = uploadedUrls.current.body[p];
        if (!bodyUrl && bodyPhotos?.[p]) {
          bodyUrl = await uploadOnce(bodyPhotos[p]);
          uploadedUrls.current.body[p] = bodyUrl;
        }
        if (!bodyUrl) throw new Error(t("tailorFlow.virtualTryOn.bodyPhotoMissing"));
      }

      if (!uploadedUrls.current.fabric && orderState.fabricImage) {
        uploadedUrls.current.fabric = await uploadOnce(orderState.fabricImage);
      }

      const res = await fetch(`${API_BASE}/api/tryon/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyPhotoUrl: bodyUrl,
          bodyMeasurements: isMeasurementMode ? bodyMeasurements : undefined,
          fabricImageUrl: uploadedUrls.current.fabric,
          perspective: p,
          analysisResult: orderState.analysisResult,
          occasion: orderState.occasion,
          // ทรง/เทมเพลตที่เลือกไว้ (ChooseShapeStep) — ให้ AI ใส่ทรงนี้จริงๆ แทนคำว่า "outfit" กว้างๆ เดิม
          shape: orderState.shape ? { id: orderState.shape.id, name: orderState.shape.name } : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? t("tailorFlow.virtualTryOn.generateFailed"));

      setSlots((s) => ({ ...s, [p]: { status: "done", url: json.imageUrl, mock: json.mock } }));
      setOrderState((prev: any) => ({
        ...prev,
        tryOnResults: { ...prev.tryOnResults, [p]: json.imageUrl },
      }));
    } catch (err: any) {
      setSlots((s) => ({ ...s, [p]: { status: "error", error: err.message ?? t("tailorFlow.virtualTryOn.genericError") } }));
    }
  };

  const activeSlot = slots[active];
  const hasAnyMock = PERSPECTIVES.some((p) => slots[p.key].mock);
  const anyDone = PERSPECTIVES.some((p) => slots[p.key].status === "done");

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'stretch', pt: 1 }}>

      {isMeasurementMode && (
        <Box sx={{ bgcolor: `${NAVY}0A`, borderRadius: '14px', px: 2, py: 1.2 }}>
          <Typography sx={{ fontFamily: FONT, color: NAVY, fontSize: '0.78rem', textAlign: 'center' }}>
            {t("tailorFlow.virtualTryOn.measurementModeNote")}
          </Typography>
        </Box>
      )}

      {anyLoading && (
        <Box sx={{ bgcolor: `${GOLD}14`, border: `1px solid ${GOLD}40`, borderRadius: '14px', px: 2, py: 1.4 }}>
          <Typography sx={{ fontFamily: FONT, color: NAVY, fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.6 }}>
            {t("tailorFlow.virtualTryOn.estimateNote").split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </Typography>
        </Box>
      )}

      {/* มุมสลับ */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {PERSPECTIVES.map((p) => {
          const s = slots[p.key];
          return (
            <Box key={p.key} onClick={() => setActive(p.key)}
              sx={{
                flex: 1, py: 1.1, textAlign: 'center', borderRadius: '12px', cursor: 'pointer',
                bgcolor: active === p.key ? NAVY : '#FFFFFF',
                color: active === p.key ? 'white' : NAVY,
                border: active === p.key ? 'none' : '1px solid #EFE9DD',
                boxShadow: active === p.key ? '0 4px 14px rgba(27,42,74,0.25)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6,
                transition: 'all 0.25s',
              }}>
              {s.status === 'loading' && <CircularProgress size={12} sx={{ color: 'inherit' }} />}
              {s.status === 'done' && (
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: GOLD }} />
              )}
              <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600 }}>
                {p.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* พรีวิวหลัก */}
      <Box sx={{ width: '100%', height: 450, borderRadius: '20px', overflow: 'hidden', position: 'relative', bgcolor: '#FFFFFF', border: '1px solid #EFE9DD', boxShadow: '0 4px 20px rgba(27,42,74,0.06)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%', position: 'relative' }}>
            {activeSlot.status === 'idle' && (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, px: 3 }}>
                <Typography sx={{ fontFamily: FONT, color: '#6B7280', textAlign: 'center', fontSize: '0.88rem' }}>
                  {anyLoading
                    ? t("tailorFlow.virtualTryOn.waitingForOther").replace("{label}", PERSPECTIVES.find(p => p.key === loadingPerspective)?.label ?? "")
                    : t("tailorFlow.virtualTryOn.notGeneratedYet").replace("{label}", PERSPECTIVES.find(p => p.key === active)?.label ?? "")}
                </Typography>
                <Button
                  variant="contained"
                  disabled={anyLoading}
                  onClick={() => runPerspective(active)}
                  sx={{
                    bgcolor: NAVY, color: 'white', px: 3, py: 1.1, borderRadius: '12px',
                    fontFamily: FONT, fontWeight: 600, textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(27,42,74,0.2)',
                    '&:hover': { bgcolor: '#0F1A30' },
                    '&:disabled': { bgcolor: '#EFE9DD', color: '#A09C95' },
                  }}
                >
                  {t("tailorFlow.virtualTryOn.generateButton").replace("{label}", PERSPECTIVES.find(p => p.key === active)?.label ?? "")}
                </Button>
              </Box>
            )}
            {activeSlot.status === 'loading' && (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <CircularProgress sx={{ color: NAVY }} />
                <Typography sx={{ fontFamily: FONT, color: NAVY, textAlign: 'center', px: 3, fontSize: '0.9rem' }}>
                  {t("tailorFlow.virtualTryOn.generating")}
                </Typography>
                <Typography sx={{ fontFamily: FONT, color: '#6B7280', fontSize: '0.75rem', textAlign: 'center' }}>
                  {t("tailorFlow.virtualTryOn.elapsed")
                    .replace("{mm}", String(Math.floor(elapsedSec / 60)).padStart(2, '0'))
                    .replace("{ss}", String(elapsedSec % 60).padStart(2, '0'))}
                </Typography>
              </Box>
            )}
            {activeSlot.status === 'error' && (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, px: 3 }}>
                <Typography sx={{ fontFamily: FONT, color: '#B3261E', textAlign: 'center', fontSize: '0.9rem' }}>
                  {t("tailorFlow.virtualTryOn.failedLabel")
                    .replace("{label}", PERSPECTIVES.find(p => p.key === active)?.label ?? "")
                    .replace("{error}", activeSlot.error ?? "")}
                </Typography>
                <Button startIcon={<RefreshRoundedIcon />} onClick={() => runPerspective(active)}
                  sx={{ color: NAVY, fontFamily: FONT, fontWeight: 600, textTransform: 'none' }}>
                  {t("tailorFlow.virtualTryOn.retry")}
                </Button>
              </Box>
            )}
            {activeSlot.status === 'done' && activeSlot.url && (
              <>
                <Image src={activeSlot.url} alt={`Virtual try-on - ${active}`} fill style={{ objectFit: 'cover' }} />
                {activeSlot.mock && (
                  <Box sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(197,165,90,0.95)', color: NAVY, px: 1.5, py: 0.5, borderRadius: '999px' }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', fontWeight: 700 }}>{t("tailorFlow.virtualTryOn.mockBadge")}</Typography>
                  </Box>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {hasAnyMock && (
        <Typography sx={{ fontFamily: FONT, textAlign: 'center', color: '#6B7280', fontSize: '0.75rem' }}>
          {t("tailorFlow.virtualTryOn.mockNote")}
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        disabled={anyLoading}
        onClick={onNext}
        sx={{
          bgcolor: NAVY,
          color: 'white',
          py: 1.7,
          borderRadius: '14px',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: '0.95rem',
          boxShadow: anyLoading ? 'none' : '0 4px 14px rgba(27,42,74,0.25)',
          '&:hover': { bgcolor: '#0F1A30' },
          '&:disabled': { bgcolor: '#EFE9DD', color: '#A09C95' },
        }}
      >
        {anyLoading ? t("tailorFlow.virtualTryOn.generatingButton") : anyDone ? t("tailorFlow.virtualTryOn.nextDone") : t("tailorFlow.virtualTryOn.nextSkip")}
      </Button>

    </Box>
  );
}
