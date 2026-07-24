"use client";

import { useState } from "react";
import { Box, Typography, Button, Alert, CircularProgress } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { motion } from "framer-motion";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { formatPromptPayIdDisplay } from "@/lib/promptpay";
import SlipUploadBox from "@/components/checkout/SlipUploadBox";
import { useAuth } from "@/lib/auth-context";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

// ขั้นชำระเงินพร้อมเพย์ของออเดอร์สั่งตัด — เกิดหลัง OrderSummaryStep สร้าง order + payment จริงกับ backend แล้ว
// (orderState.payment มาจาก POST /api/orders → POST /api/payments)
export default function PaymentStep({ orderState, onNext }: any) {
  const { openAuthModal } = useAuth();
  const [slipUrl, setSlipUrl] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const payment = orderState.payment;
  if (!payment) return null;

  const handleConfirmPaid = async () => {
    if (!slipUrl) { setError("กรุณาแนบสลิปการโอนเงินก่อนยืนยัน"); return; }
    setPaying(true);
    setError("");
    try {
      const res = await authFetch(`/api/payments/${payment.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({ slipUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ยืนยันการชำระเงินไม่สำเร็จ");
      onNext();
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        setError("เซสชันหมดอายุ กำลังพาไปเข้าสู่ระบบใหม่...");
        setTimeout(() => openAuthModal(), 1500);
        return;
      }
      setError(err instanceof Error ? err.message : "ยืนยันการชำระเงินไม่สำเร็จ");
    } finally {
      setPaying(false);
    }
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, pt: 2 }}>

      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.05rem", color: NAVY, textAlign: "center" }}>
        ชำระเงินด้วยพร้อมเพย์
      </Typography>
      <Typography sx={{ fontFamily: FONT, color: "#6B7280", fontSize: "0.85rem", textAlign: "center" }}>
        สแกน QR ด้วยแอปธนาคารเพื่อชำระเงิน
      </Typography>

      <Box sx={{ bgcolor: "#FFFFFF", p: 2, borderRadius: "16px", boxShadow: "0 2px 12px rgba(27,42,74,0.08)" }}>
        <QRCodeSVG value={payment.qrPayload} size={200} level="M" />
      </Box>

      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: NAVY, fontWeight: 600 }}>
          พร้อมเพย์: {formatPromptPayIdDisplay(payment.promptpayId)} · LAYA Platform
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.4rem", color: GOLD, fontWeight: 700 }}>
          ฿{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Typography>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 360 }}>
        <SlipUploadBox paymentId={payment.id} slipUrl={slipUrl || undefined} onUploaded={setSlipUrl} onError={setError} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: "10px", fontFamily: FONT, width: "100%" }} onClose={() => setError("")}>{error}</Alert>
      )}

      <Button
        variant="contained" fullWidth disabled={paying || !slipUrl} onClick={handleConfirmPaid}
        startIcon={paying ? <CircularProgress size={18} color="inherit" /> : <CheckCircleRoundedIcon />}
        sx={{
          mt: 1, py: 1.7, bgcolor: NAVY, color: "white", borderRadius: "14px", fontFamily: FONT,
          fontWeight: 600, fontSize: "0.95rem", boxShadow: "0 4px 14px rgba(27,42,74,0.25)",
          textTransform: "none", "&:hover": { bgcolor: "#0F1A30" },
        }}
      >
        {paying ? "กำลังตรวจสอบ..." : "ฉันโอนเงินแล้ว"}
      </Button>
      <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center" }}>
        หลังยืนยัน ร้านจะได้รับแจ้งเตือนและตรวจสอบออเดอร์ของคุณ
      </Typography>
    </Box>
  );
}
