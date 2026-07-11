"use client";

import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/lib/auth-context";
import { formatPromptPayIdDisplay } from "@/lib/promptpay";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ── Data ───────────────────────────────────────────────────────────────────────
const WEAVE_PATTERNS = [
  { id: "mudmee",     label: "ผ้ามัดหมี่",      region: "อีสาน",      preview: "#8B4513" },
  { id: "pha_sin",    label: "ผ้าซิ่น",          region: "ภาคเหนือ",  preview: "#4B0082" },
  { id: "pha_khao",   label: "ผ้าขาวม้า",        region: "ทั่วไป",    preview: "#DC143C" },
  { id: "pha_thai",   label: "ผ้าไหมไทย",        region: "ภาคกลาง",  preview: "#DAA520" },
  { id: "pha_yok",    label: "ผ้ายกดอก",         region: "ภาคใต้",   preview: "#2E8B57" },
  { id: "pha_cotton", label: "ผ้าฝ้ายทอมือ",     region: "เชียงใหม่", preview: "#8FBC8F" },
];

const COLOR_TONES = [
  { id: "natural",   label: "โทนธรรมชาติ",   colors: ["#8B6914", "#C4A35A", "#D4B896"] },
  { id: "earth",     label: "โทนดิน",        colors: ["#6B4423", "#8B5A2B", "#A0785A"] },
  { id: "navy",      label: "โทนน้ำเงิน",    colors: ["#1B2A4A", "#2B4575", "#4A6FA5"] },
  { id: "jewel",     label: "โทนอัญมณี",     colors: ["#4B0082", "#006400", "#8B0000"] },
  { id: "pastel",    label: "โทนพาสเทล",     colors: ["#FFB3BA", "#FFDAB9", "#B5EAD7"] },
  { id: "monochrome",label: "โทนขาวดำ",       colors: ["#2D2D2D", "#6B6B6B", "#D4D4D4"] },
];

const COMMUNITIES = [
  { id: "c1", name: "ชุมชนทอผ้าบ้านนาข่า", province: "อุดรธานี",  rating: 4.9, specialty: "มัดหมี่", leadTime: "3-4 สัปดาห์" },
  { id: "c2", name: "กลุ่มทอผ้าไหมบ้านเขว้า", province: "ชัยภูมิ", rating: 4.8, specialty: "ผ้าไหมไทย", leadTime: "4-6 สัปดาห์" },
  { id: "c3", name: "วิสาหกิจชุมชนผ้าฝ้ายเชียงใหม่", province: "เชียงใหม่", rating: 4.7, specialty: "ผ้าฝ้ายทอมือ", leadTime: "2-3 สัปดาห์" },
  { id: "c4", name: "ชุมชนทอผ้าซิ่นลำพูน", province: "ลำพูน",   rating: 4.8, specialty: "ผ้าซิ่น", leadTime: "3-5 สัปดาห์" },
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

// ── Component ──────────────────────────────────────────────────────────────────
export default function WeavingOrderPage() {
  const router = useRouter();
  const { session } = useAuth();

  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const [colorWarning, setColorWarning] = useState(false);
  const [acceptedWarning, setAcceptedWarning] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [pattern, setPattern]   = useState("");
  const [colorTone, setColorTone] = useState("");
  const [meters, setMeters]     = useState(3);
  const [community, setCommunity] = useState("");
  const [notes, setNotes]       = useState("");

  // ข้อมูลจริงจาก API (fallback เป็น mock ถ้า backend ไม่พร้อม)
  const [patterns, setPatterns] = useState(WEAVE_PATTERNS);
  const [communities, setCommunities] = useState(COMMUNITIES);
  const [isLive, setIsLive] = useState(false);

  // ขั้นตอนชำระเงิน PromptPay (US-604)
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [patRes, shopRes] = await Promise.all([
          fetch(`${API_BASE}/api/weave-patterns`),
          fetch(`${API_BASE}/api/shops/match?service=weave`),
        ]);
        if (!patRes.ok || !shopRes.ok) return;
        const pats = (await patRes.json()) as { id: string; name: string; originProvince?: string }[];
        const shops = (await shopRes.json()) as { id: string; name: string; province: string; rating: number; specialties: string[] }[];
        if (!pats.length || !shops.length) return;

        setPatterns(pats.map((p, i) => ({
          id: p.id,
          label: p.name,
          region: p.originProvince ?? "-",
          preview: PATTERN_PREVIEW_COLORS[i % PATTERN_PREVIEW_COLORS.length],
        })));
        setCommunities(shops.map((s) => ({
          id: s.id,
          name: s.name,
          province: s.province,
          rating: s.rating,
          specialty: s.specialties?.[0] ?? "ทอผ้า",
          leadTime: "3-5 สัปดาห์",
        })));
        setIsLive(true);
      } catch {
        // backend ไม่พร้อม — ใช้ mock ต่อไป
      }
    })();
  }, []);

  const selectedCommunity = communities.find((c) => c.id === community);

  const estimatedPrice = meters * 320; // ราคาประเมินเบื้องต้น 320 บาท/เมตร

  const canNext = [
    !!pattern,
    !!colorTone,
    !!community,
    acceptedWarning,
  ][step] ?? true;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (session && isLive) {
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
      } else {
        // Demo mode — ยังไม่ได้ล็อกอิน/backend ไม่พร้อม
        await new Promise((r) => setTimeout(r, 1500));
        setSuccess(true);
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

  /** ลูกค้ากด "โอนเงินแล้ว" → ยืนยันการชำระ (mock gateway) แล้วเข้าสถานะรอร้านคอนเฟิร์ม */
  const handleConfirmPaid = async () => {
    if (!payment) return;
    setPaying(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/payments/${payment.id}/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ยืนยันการชำระเงินไม่สำเร็จ");
      setPayment(null);
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

        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px", fontFamily: '"Kanit", sans-serif', width: "100%" }} onClose={() => setError("")}>{error}</Alert>
        )}

        <Button
          variant="contained" fullWidth disabled={paying} onClick={handleConfirmPaid}
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

      <Box sx={{ px: 3 }}>
        <AnimatePresence mode="wait">
          {/* ── Step 0: เลือกลาย ── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
                เลือกลายผ้าพื้นฐาน
              </Typography>
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
                    <Box sx={{ height: 80, bgcolor: p.preview, opacity: 0.85 }} />
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
              onClick={() => setStep((s) => s - 1)}
              sx={{ flex: 1, py: 1.4, borderColor: "#E5DFD6", color: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
            >
              ย้อนกลับ
            </Button>
          )}

          {step < 3 ? (
            <Button
              variant="contained"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              sx={{ flex: 2, py: 1.4, bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none" }}
            >
              ถัดไป
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={!acceptedWarning || loading}
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ flex: 2, py: 1.4, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none" }}
            >
              {loading ? "กำลังส่งออเดอร์..." : "ยืนยันการสั่งทอผ้า"}
            </Button>
          )}
        </Box>
      </Box>
    </Box></MobileLayout>
  );
}
