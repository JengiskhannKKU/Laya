"use client";

import { useState, useEffect, Suspense } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/lib/auth-context";
import { formatPromptPayIdDisplay } from "@/lib/promptpay";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import SlipUploadBox from "@/components/checkout/SlipUploadBox";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AutoAwesomeMosaicRoundedIcon from "@mui/icons-material/AutoAwesomeMosaicRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ── Data ───────────────────────────────────────────────────────────────────────
const COLOR_TONES = [
  { id: "natural",   label: "โทนธรรมชาติ",   colors: ["#8B6914", "#C4A35A", "#D4B896"] },
  { id: "earth",     label: "โทนดิน",        colors: ["#6B4423", "#8B5A2B", "#A0785A"] },
  { id: "navy",      label: "โทนน้ำเงิน",    colors: ["#1B2A4A", "#2B4575", "#4A6FA5"] },
  { id: "jewel",     label: "โทนอัญมณี",     colors: ["#4B0082", "#006400", "#8B0000"] },
  { id: "pastel",    label: "โทนพาสเทล",     colors: ["#FFB3BA", "#FFDAB9", "#B5EAD7"] },
  { id: "monochrome",label: "โทนขาวดำ",       colors: ["#2D2D2D", "#6B6B6B", "#D4D4D4"] },
];

const STEPS = ["เลือกลาย", "เลือกสี", "เลือกชุมชน", "สรุปออเดอร์"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const PATTERN_PREVIEW_COLORS = ["#8B4513", "#4B0082", "#DC143C", "#DAA520", "#2E8B57", "#8FBC8F", "#1B2A4A", "#92652A"];

interface PaymentInfo {
  id: string;
  amount: number;
  qrPayload: string;
  promptpayId: string;
}

interface PatternCard {
  id: string;
  label: string;
  region: string;
  preview: string;
  image: string | null;
}

interface CommunityCard {
  id: string;
  name: string;
  province: string;
  rating: number;
  specialty: string;
  leadTime: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
function WeavingOrderContent() {
  const router = useRouter();
  const { session } = useAuth();
  const searchParams = useSearchParams();

  const initialPatternId = searchParams.get("patternId") ?? "";
  const initialShopId = searchParams.get("shopId") ?? "";

  // เริ่มด้วยหน้าเลือกเส้นทาง (ลายก่อน/ชุมชนก่อน) เฉพาะตอนที่ไม่มี deep-link มาก่อน
  const [pathChosen, setPathChosen] = useState(!!(initialPatternId || initialShopId));
  const [step, setStep]         = useState(initialPatternId ? 1 : 0);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const [acceptedWarning, setAcceptedWarning] = useState(false);

  const [pattern, setPattern]   = useState(initialPatternId);
  const [colorTone, setColorTone] = useState("");
  const [meters, setMeters]     = useState(3);
  const [community, setCommunity] = useState(initialShopId);
  const [notes, setNotes]       = useState("");

  // ข้อมูลจริงจาก API เท่านั้น — ไม่มี fallback เป็นข้อมูลปลอมอีกต่อไป (id ปลอมเช่น "mudmee"/"c1"
  // จะทำให้กด next ผ่านได้ทั้ง 4 ขั้น แล้วไปพังตอนสร้างออเดอร์จริงเพราะ FK ไม่ตรง)
  const [patterns, setPatterns] = useState<PatternCard[]>([]);
  const [communities, setCommunities] = useState<CommunityCard[]>([]);
  const [patternsLoading, setPatternsLoading] = useState(true);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  // ขั้นตอนชำระเงิน PromptPay (US-604)
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [slipUrl, setSlipUrl] = useState("");
  const [paying, setPaying] = useState(false);

  // โหลดลายผ้า — ถ้ามาจาก deep-link ?shopId= จะกรองเฉพาะลายของชุมชนนั้น (ของตัวเอง + ลายระบบที่ทอได้)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPatternsLoading(true);
      try {
        const qs = initialShopId ? `?shopId=${initialShopId}` : "";
        const res = await fetch(`${API_BASE}/api/weave-patterns${qs}`);
        if (!res.ok) throw new Error();
        const pats = (await res.json()) as { id: string; name: string; originProvince?: string; thumbnailUrl?: string | null }[];

        // กันเคส deep-link มาด้วยลายที่ query ข้างบนกรองไม่เจอ (เช่น shopId filter ยังไม่รองรับที่ backend)
        let list = pats;
        if (initialPatternId && !pats.some((p) => p.id === initialPatternId)) {
          const single = await fetch(`${API_BASE}/api/weave-patterns/${initialPatternId}`);
          if (single.ok) list = [...pats, await single.json()];
        }

        if (cancelled) return;
        setPatterns(list.map((p, i) => ({
          id: p.id,
          label: p.name,
          region: p.originProvince ?? "-",
          preview: PATTERN_PREVIEW_COLORS[i % PATTERN_PREVIEW_COLORS.length],
          image: p.thumbnailUrl ?? null,
        })));
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setPatternsLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTick]);

  // โหลดชุมชนที่ทอ "ลายที่เลือกไว้" ได้จริง (GET /:id/producers) — กรองตามลายเสมอ ไม่ใช่รายชื่อ
  // ร้านทอผ้าทั่วไปแบบเดิมอีกต่อไป ถ้ามาจาก deep-link ?shopId= ระบุชุมชนไว้แล้ว ไม่ต้องโหลด
  useEffect(() => {
    if (initialShopId) { setCommunitiesLoading(false); return; }
    if (!pattern) { setCommunities([]); setCommunitiesLoading(false); return; }
    let cancelled = false;
    (async () => {
      setCommunitiesLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/weave-patterns/${pattern}/producers`);
        if (!res.ok) throw new Error();
        const data = (await res.json()) as {
          producers: { id: string; name: string; province: string; rating: number; reviewCount: number; leadTimeDays: number | null }[];
        };
        if (cancelled) return;
        const patternLabel = patterns.find((p) => p.id === pattern)?.label ?? "ทอผ้า";
        setCommunities(data.producers.map((s) => ({
          id: s.id,
          name: s.name,
          province: s.province,
          rating: s.rating,
          specialty: patternLabel,
          leadTime: s.leadTimeDays ? `${s.leadTimeDays} วัน` : "3-5 สัปดาห์",
        })));
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setCommunitiesLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, initialShopId, reloadTick]);

  const selectedCommunity = communities.find((c) => c.id === community);

  const estimatedPrice = meters * 320; // ราคาประเมินเบื้องต้น 320 บาท/เมตร

  const canNext = [
    !!pattern,
    !!colorTone,
    !!community,
    acceptedWarning,
  ][step] ?? true;

  const goNext = () => {
    let next = step + 1;
    // ถ้ามาจาก deep-link แล้วเลือกชุมชนไว้แล้ว ข้ามขั้น "เลือกชุมชน" ไปเลย
    if (next === 2 && community) next = 3;
    setStep(next);
  };

  const goBack = () => {
    let prev = step - 1;
    if (prev === 2 && community && initialShopId) prev = 1;
    setStep(Math.max(prev, 0));
  };

  const handleSubmit = async () => {
    if (!session) { router.push("/auth/login"); return; }
    setLoading(true);
    setError("");
    try {
      {
        // สร้างออเดอร์ทอจริง (US-404, US-406) — authFetch จัดการ token สด + auto-refresh
        const orderRes = await authFetch(`${API_BASE}/api/weaving-orders`, {
          method: "POST",
          body: JSON.stringify({
            shopId: community,
            patternId: pattern,
            customColorNote: COLOR_TONES.find((t) => t.id === colorTone)?.label,
            metersRequested: meters,
            estimatedPrice,
            specialInstructions: notes || undefined,
            colorDisclaimerAccepted: acceptedWarning,
          }),
        });
        const order = await orderRes.json();
        if (!orderRes.ok) throw new Error(order.error ?? "สร้างออเดอร์ไม่สำเร็จ");

        // สร้างรายการชำระเงิน → ได้ PromptPay QR ตามยอด (US-604)
        const payRes = await authFetch(`${API_BASE}/api/payments`, {
          method: "POST",
          body: JSON.stringify({ weavingOrderId: order.id }),
        });
        const pay = await payRes.json();
        if (!payRes.ok) throw new Error(pay.error ?? "สร้างรายการชำระเงินไม่สำเร็จ");

        setPayment({ id: pay.id, amount: pay.amount, qrPayload: pay.qrPayload, promptpayId: pay.promptpayId });
      }
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        setError("เซสชันหมดอายุ กำลังพาไปเข้าสู่ระบบใหม่...");
        setTimeout(() => router.push("/auth/login"), 1500);
        return;
      }
      setError(err instanceof Error ? err.message : "ส่งออเดอร์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  /** ลูกค้าแนบสลิป → ยืนยันการชำระ (ตรวจผ่าน SlipOk) แล้วเข้าสถานะรอร้านคอนเฟิร์ม */
  const handleConfirmPaid = async () => {
    if (!payment) return;
    if (!slipUrl) { setError("กรุณาแนบสลิปการโอนเงินก่อนยืนยัน"); return; }
    setPaying(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/payments/${payment.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({ slipUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ยืนยันการชำระเงินไม่สำเร็จ");
      setPayment(null);
      setSlipUrl("");
      setSuccess(true);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        setError("เซสชันหมดอายุ กำลังพาไปเข้าสู่ระบบใหม่...");
        setTimeout(() => router.push("/auth/login"), 1500);
        return;
      }
      setError(err instanceof Error ? err.message : "ยืนยันการชำระเงินไม่สำเร็จ");
    } finally {
      setPaying(false);
    }
  };

  // ── หน้าชำระเงิน PromptPay (หลังสร้างออเดอร์จริง) ──
  if (payment) {
    return (
      <Box sx={{ flex: 1, bgcolor: "#FAF6F0", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 3, gap: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
          ชำระเงินด้วยพร้อมเพย์
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.85rem", textAlign: "center" }}>
          สแกน QR ด้วยแอปธนาคารเพื่อชำระเงิน
        </Typography>

        <Box sx={{ bgcolor: "#FFFFFF", p: 2, borderRadius: "16px", boxShadow: "0 2px 12px rgba(27,42,74,0.08)" }}>
          <QRCodeSVG value={payment.qrPayload} size={200} level="M" />
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 600 }}>
            พร้อมเพย์: {formatPromptPayIdDisplay(payment.promptpayId)} · LAYA Platform
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.4rem", color: "#C5A55A", fontWeight: 700 }}>
            ฿{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 360 }}>
          <SlipUploadBox paymentId={payment.id} slipUrl={slipUrl || undefined} onUploaded={setSlipUrl} onError={setError} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px", fontFamily: '"Kanit", sans-serif', width: "100%" }} onClose={() => setError("")}>{error}</Alert>
        )}

        <Button
          variant="contained" fullWidth disabled={paying || !slipUrl} onClick={handleConfirmPaid}
          startIcon={paying ? <CircularProgress size={18} color="inherit" /> : <CheckCircleRoundedIcon />}
          sx={{ mt: 1, py: 1.4, bgcolor: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none", maxWidth: 360 }}
        >
          {paying ? "กำลังตรวจสอบ..." : "ฉันโอนเงินแล้ว"}
        </Button>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center" }}>
          หลังยืนยัน ร้านจะได้รับแจ้งเตือนและตรวจสอบออเดอร์ของคุณ
        </Typography>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ flex: 1, bgcolor: "#FAF6F0", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, gap: 2 }}>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 80, color: "#22C55E" }} />
        </motion.div>
        <Typography variant="h6" sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", textAlign: "center" }}>
          ส่งออเดอร์ทอผ้าสำเร็จ
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.9rem", textAlign: "center" }}>
          ชุมชนจะติดต่อกลับภายใน 48 ชั่วโมง
          คุณสามารถติดตามสถานะได้ที่ประวัติออเดอร์
        </Typography>
        <Button
          variant="contained" onClick={() => router.push("/orders")}
          sx={{ mt: 2, px: 4, py: 1.4, bgcolor: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none" }}
        >
          ดูสถานะออเดอร์
        </Button>
        <Button variant="text" onClick={() => router.push("/")} sx={{ fontFamily: '"Kanit", sans-serif', color: "#9CA3AF", textTransform: "none" }}>
          กลับหน้าหลัก
        </Button>
      </Box>
    );
  }

  return (
    <MobileLayout><Box sx={{ pb: 8 }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A" }}>
          สั่งทอผ้า
        </Typography>
      </Box>

      {!pathChosen ? (
        // ── หน้าเลือกเส้นทาง: เลือกลายก่อน หรือ เลือกชุมชนก่อน ──
        <Box sx={{ px: 3, pt: 1 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#6B7280", mb: 3 }}>
            จะเริ่มต้นอย่างไรดี? ไม่ว่าจะเลือกทางไหน สุดท้ายคุณจะได้ทั้งลายผ้าและชุมชนผู้ทอ
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              component={motion.div} whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }}
              onClick={() => setPathChosen(true)}
              sx={{
                p: 3, borderRadius: "20px", bgcolor: "#FFFFFF", border: "1px solid #EFE9DD",
                boxShadow: "0 4px 20px rgba(27,42,74,0.06)", display: "flex", alignItems: "center", gap: 2.5,
                cursor: "pointer", transition: "box-shadow 0.25s, border-color 0.25s",
                "&:hover": { boxShadow: "0 12px 32px rgba(27,42,74,0.12)", borderColor: "#C5A55A" },
              }}
            >
              <Box sx={{ width: 56, height: 56, borderRadius: "16px", flexShrink: 0, bgcolor: "#1B2A4A0D", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AutoAwesomeMosaicRoundedIcon sx={{ fontSize: 26, color: "#C5A55A" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
                  เลือกลายผ้าก่อน
                </Typography>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280", mt: 0.3 }}>
                  ดูลายผ้าที่มีในระบบ แล้วให้เราแนะนำชุมชนที่ทอลายนี้ได้
                </Typography>
              </Box>
              <ArrowForwardRoundedIcon sx={{ color: "#C9C2B4", fontSize: 20, flexShrink: 0 }} />
            </Box>

            <Box
              component={motion.div} whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }}
              onClick={() => router.push("/community")}
              sx={{
                p: 3, borderRadius: "20px", bgcolor: "#FFFFFF", border: "1px solid #EFE9DD",
                boxShadow: "0 4px 20px rgba(27,42,74,0.06)", display: "flex", alignItems: "center", gap: 2.5,
                cursor: "pointer", transition: "box-shadow 0.25s, border-color 0.25s",
                "&:hover": { boxShadow: "0 12px 32px rgba(27,42,74,0.12)", borderColor: "#C5A55A" },
              }}
            >
              <Box sx={{ width: 56, height: 56, borderRadius: "16px", flexShrink: 0, bgcolor: "#1B2A4A0D", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Diversity3RoundedIcon sx={{ fontSize: 26, color: "#C5A55A" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
                  เลือกชุมชนก่อน
                </Typography>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280", mt: 0.3 }}>
                  ดูผลงาน เรื่องราว และเอกลักษณ์ของแต่ละชุมชน แล้วเลือกลายที่ชุมชนนั้นทอได้
                </Typography>
              </Box>
              <ArrowForwardRoundedIcon sx={{ color: "#C9C2B4", fontSize: 20, flexShrink: 0 }} />
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              onClick={() => router.push("/custom")}
              startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} />}
              sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#8A7B5C", textTransform: "none" }}
            >
              หรือออกแบบลายผ้าใหม่ด้วย AI
            </Button>
          </Box>
        </Box>
      ) : (
      <>
      {/* Stepper */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((s) => (
            <Step key={s}>
              <StepLabel sx={{
                "& .MuiStepLabel-label": { fontFamily: '"Kanit", sans-serif', fontSize: "0.68rem" },
                "& .MuiStepIcon-root.Mui-active": { color: "#C5A55A" },
                "& .MuiStepIcon-root.Mui-completed": { color: "#1B2A4A" },
              }}>
                {s}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {error && (
        <Box sx={{ px: 3, mb: 2 }}>
          <Alert severity="error" sx={{ borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }} onClose={() => setError("")}>{error}</Alert>
        </Box>
      )}

      {loadError && (
        <Box sx={{ px: 3, mb: 2 }}>
          <Alert
            severity="warning" sx={{ borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }}
            action={
              <Button size="small" startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />} onClick={() => { setLoadError(false); setReloadTick((t) => t + 1); }} sx={{ fontFamily: '"Kanit", sans-serif', textTransform: "none" }}>
                ลองใหม่
              </Button>
            }
          >
            โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
          </Alert>
        </Box>
      )}

      <Box sx={{ px: 3 }}>
        <AnimatePresence mode="wait">
          {/* ── Step 0: เลือกลาย ── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
                เลือกลายผ้าพื้นฐาน
              </Typography>
              {patternsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress sx={{ color: "#C5A55A" }} />
                </Box>
              ) : patterns.length === 0 ? (
                !loadError && (
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#9CA3AF", textAlign: "center", py: 4 }}>
                    ยังไม่มีลายผ้าให้เลือกในขณะนี้
                  </Typography>
                )
              ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                  {patterns.map((p) => (
                    <Box
                      key={p.id}
                      onClick={() => setPattern(p.id)}
                      sx={{
                        borderRadius: "14px", overflow: "hidden", cursor: "pointer",
                        border: "2px solid", borderColor: pattern === p.id ? "#C5A55A" : "#E5DFD6",
                        bgcolor: "#FFFFFF", transition: "all 0.15s",
                      }}
                    >
                      {p.image ? (
                        <Box sx={{ position: "relative", width: "100%", height: 80 }}>
                          <Image src={p.image} alt={p.label} fill style={{ objectFit: "cover" }} sizes="200px" />
                        </Box>
                      ) : (
                        <Box sx={{ height: 80, bgcolor: p.preview, opacity: 0.85 }} />
                      )}
                      <Box sx={{ p: 1.5 }}>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.85rem", color: "#1B2A4A" }}>
                          {p.label}
                        </Typography>
                        <Chip label={p.region} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.65rem", height: 18, bgcolor: "#F3F4F6", color: "#6B7280", mt: 0.5 }} />
                      </Box>
                      {pattern === p.id && (
                        <Box sx={{ px: 1.5, pb: 1 }}>
                          <CheckCircleRoundedIcon sx={{ color: "#C5A55A", fontSize: 18 }} />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </motion.div>
          )}

          {/* ── Step 1: เลือกสี ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
                เลือกโทนสี
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {COLOR_TONES.map((tone) => (
                  <Box
                    key={tone.id}
                    onClick={() => setColorTone(tone.id)}
                    sx={{
                      p: 2, borderRadius: "14px", cursor: "pointer",
                      border: "2px solid", borderColor: colorTone === tone.id ? "#C5A55A" : "#E5DFD6",
                      bgcolor: "#FFFFFF", display: "flex", alignItems: "center", gap: 2,
                      transition: "all 0.15s",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {tone.colors.map((c, i) => (
                        <Box key={i} sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: c }} />
                      ))}
                    </Box>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#374151", flex: 1 }}>
                      {tone.label}
                    </Typography>
                    {colorTone === tone.id && <CheckCircleRoundedIcon sx={{ color: "#C5A55A", fontSize: 20 }} />}
                  </Box>
                ))}
              </Box>

              {/* Meters */}
              <Box sx={{ mt: 4 }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
                  จำนวนเมตร — <Box component="span" sx={{ color: "#C5A55A" }}>{meters} เมตร</Box>
                </Typography>
                <Slider
                  value={meters} min={1} max={20} step={0.5}
                  onChange={(_, v) => setMeters(v as number)}
                  sx={{ color: "#C5A55A", "& .MuiSlider-thumb": { bgcolor: "#C5A55A" } }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#9CA3AF" }}>1 เมตร</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#9CA3AF" }}>20 เมตร</Typography>
                </Box>
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "#FDF8EE", borderRadius: "10px" }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#92652A", textAlign: "center" }}>
                    ราคาประมาณ <strong>฿{estimatedPrice.toLocaleString()}</strong> ({meters} ม. × ฿320/ม.)
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          )}

          {/* ── Step 2: เลือกชุมชน ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
                เลือกชุมชนทอผ้า
              </Typography>
              {communitiesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress sx={{ color: "#C5A55A" }} />
                </Box>
              ) : communities.length === 0 ? (
                !loadError && (
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#9CA3AF", textAlign: "center", py: 4 }}>
                    ยังไม่มีชุมชนที่ทอลายนี้ได้ในขณะนี้
                  </Typography>
                )
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {communities.map((c) => (
                    <Box
                      key={c.id}
                      onClick={() => setCommunity(c.id)}
                      sx={{
                        p: 2, borderRadius: "14px", cursor: "pointer",
                        border: "2px solid", borderColor: community === c.id ? "#C5A55A" : "#E5DFD6",
                        bgcolor: "#FFFFFF", transition: "all 0.15s",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", fontSize: "0.9rem" }}>
                            {c.name}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                            <LocationOnRoundedIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
                            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#9CA3AF" }}>
                              {c.province}
                            </Typography>
                          </Box>
                        </Box>
                        {community === c.id && <CheckCircleRoundedIcon sx={{ color: "#C5A55A", fontSize: 20 }} />}
                      </Box>
                      <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                              <StarRoundedIcon sx={{ fontSize: 12 }} />
                              {c.rating}
                            </Box>
                          }
                          size="small"
                          sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", bgcolor: "#FDF8EE", color: "#92652A", fontWeight: 700 }}
                        />
                        <Chip label={c.specialty} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", bgcolor: "#EEF3FF", color: "#1B2A4A" }} />
                        <Chip label={`ใช้เวลา ${c.leadTime}`} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", bgcolor: "#F3F4F6", color: "#6B7280" }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              <TextField
                fullWidth multiline rows={2} label="หมายเหตุเพิ่มเติม (ถ้ามี)"
                value={notes} onChange={(e) => setNotes(e.target.value)}
                sx={{
                  mt: 3,
                  "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: "12px", "& fieldset": { borderColor: "#E5DFD6" }, "&.Mui-focused fieldset": { borderColor: "#C5A55A" } },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#C5A55A" },
                  "& label, & input, & textarea": { fontFamily: '"Kanit", sans-serif' },
                }}
              />
            </motion.div>
          )}

          {/* ── Step 3: สรุป + คำเตือน ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Color Warning */}
              <Box sx={{ p: 2.5, bgcolor: "#FFF7ED", borderRadius: "14px", border: "1.5px solid #FED7AA", mb: 3 }}>
                <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                  <WarningAmberRoundedIcon sx={{ color: "#D97706", mt: 0.2, flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#92400E" }}>
                    คำเตือนเรื่องสีผ้าจริง
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.83rem", color: "#92400E", lineHeight: 1.7 }}>
                  สีของผ้าที่ทอจริงอาจแตกต่างจากที่แสดงบนหน้าจอ เนื่องจากความแตกต่างของจอภาพและกระบวนการย้อมสีธรรมชาติ
                  ซึ่งขึ้นอยู่กับวัตถุดิบในแต่ละฤดูกาล ชุมชนจะส่งตัวอย่างสีให้อนุมัติก่อนเริ่มทอ
                </Typography>
                <FormControlLabel
                  sx={{ mt: 1.5, alignItems: "flex-start" }}
                  control={
                    <Switch
                      checked={acceptedWarning}
                      onChange={(e) => setAcceptedWarning(e.target.checked)}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#92400E", fontWeight: 600 }}>
                      ฉันเข้าใจและยอมรับเงื่อนไขนี้
                    </Typography>
                  }
                />
              </Box>

              {/* Summary */}
              <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "14px", p: 2.5, border: "1.5px solid #E5DFD6" }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
                  สรุปออเดอร์ทอผ้า
                </Typography>
                {[
                  ["ลายผ้า", patterns.find((p) => p.id === pattern)?.label],
                  ["โทนสี", COLOR_TONES.find((t) => t.id === colorTone)?.label],
                  ["จำนวน", `${meters} เมตร`],
                  ["ชุมชน", selectedCommunity?.name],
                  ["จังหวัด", selectedCommunity?.province],
                  ["ระยะเวลา", selectedCommunity?.leadTime],
                ].map(([k, v]) => (
                  <Box key={k} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#9CA3AF" }}>{k}</Typography>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>{v ?? "-"}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1.5, borderColor: "#E5DFD6" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>ราคาประมาณ</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#C5A55A", fontSize: "1.1rem" }}>
                    ฿{estimatedPrice.toLocaleString()}
                  </Typography>
                </Box>
                {notes && (
                  <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "#F9FAFB", borderRadius: "8px" }}>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>
                      หมายเหตุ: {notes}
                    </Typography>
                  </Box>
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <Box sx={{ mt: 4, display: "flex", gap: 1.5 }}>
          {step > 0 && (
            <Button
              variant="outlined"
              onClick={goBack}
              sx={{ flex: 1, py: 1.4, borderColor: "#E5DFD6", color: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
            >
              ย้อนกลับ
            </Button>
          )}

          {step < 3 ? (
            <Button
              variant="contained"
              disabled={!canNext}
              onClick={goNext}
              sx={{ flex: 2, py: 1.4, bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none" }}
            >
              ถัดไป
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={!acceptedWarning || loading || !pattern || !community}
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ flex: 2, py: 1.4, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none" }}
            >
              {loading ? "กำลังส่งออเดอร์..." : "ยืนยันการสั่งทอผ้า"}
            </Button>
          )}
        </Box>
      </Box>
      </>
      )}
    </Box></MobileLayout>
  );
}

function WeavingOrderFallback() {
  return (
    <MobileLayout>
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: "#C5A55A" }} />
      </Box>
    </MobileLayout>
  );
}

export default function WeavingOrderPage() {
  return (
    <Suspense fallback={<WeavingOrderFallback />}>
      <WeavingOrderContent />
    </Suspense>
  );
}
