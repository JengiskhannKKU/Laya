"use client";

/**
 * Checkout สินค้าจากตะกร้า — premium redesign (2-column บนเดสก์ท็อป, sticky order summary)
 * - 3 ขั้นในหน้าเดียว: ที่อยู่ → ตรวจสอบ → สแกนจ่าย (PromptPay)
 * - จัดกลุ่มสินค้าตามร้านค้า (ตะกร้ารวมหลายร้าน จ่าย QR เดียว)
 * - ใช้ authFetch: token สดเสมอ + auto-refresh แก้ปัญหา "Invalid or expired token"
 */

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { QRCodeSVG } from "qrcode.react";
import { formatPromptPayIdDisplay } from "@/lib/promptpay";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import AddressGeoFields from "@/components/checkout/AddressGeoFields";
import SlipUploadBox from "@/components/checkout/SlipUploadBox";
import type { LatLng } from "@/components/checkout/LocationPickerMap";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Collapse from "@mui/material/Collapse";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCartStore, cartSubtotal, cartLineKey, CartLine } from "@/lib/cart-store";
import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";

// Leaflet ต้องรันฝั่ง client เท่านั้น (ใช้ window) — โหลดแบบ dynamic ปิด SSR
const LocationPickerMap = dynamic(() => import("@/components/checkout/LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 220, borderRadius: "14px", bgcolor: "#F3EDE2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress size={22} sx={{ color: "#C5A55A" }} />
    </Box>
  ),
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SHIPPING_FEE = 50;
const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const IVORY = "#FAF6F0";
const CARD_BORDER = "#EFE9DD";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    bgcolor: "#FFFFFF",
    fontFamily: FONT,
    fontSize: "0.9rem",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&:hover fieldset": { borderColor: "#C5A55A" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A", borderWidth: 1.5 },
  },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "0.85rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#C5A55A" },
};

/** การ์ดหลัก — ขาว มุมโค้ง 18px เงานุ่ม padding กว้างขึ้นตามสเปกพรีเมียม */
const cardSx = {
  bgcolor: "#FFFFFF",
  borderRadius: "18px",
  border: `1px solid ${CARD_BORDER}`,
  boxShadow: "0 2px 14px rgba(27,42,74,0.05)",
};

const STEPS = ["ที่อยู่จัดส่ง", "ตรวจสอบคำสั่งซื้อ", "ชำระเงิน"];

const PAYMENT_METHODS = [
  { id: "promptpay", label: "PromptPay QR", icon: QrCode2RoundedIcon, active: true },
  { id: "card", label: "บัตรเครดิต", icon: CreditCardRoundedIcon, active: false },
  { id: "transfer", label: "โอนผ่านธนาคาร", icon: AccountBalanceRoundedIcon, active: false },
  { id: "wallet", label: "e-Wallet", icon: AccountBalanceWalletRoundedIcon, active: false },
];

const TRUST_BADGES = [
  { icon: LockOutlinedIcon, label: "เข้ารหัส SSL" },
  { icon: GppGoodRoundedIcon, label: "ชำระเงินปลอดภัย" },
  { icon: VerifiedUserRoundedIcon, label: "รับประกันความพึงพอใจ" },
  { icon: LocalShippingRoundedIcon, label: "จัดส่งติดตามได้" },
];

interface PaymentInfo {
  id: string;
  shopName: string;
  amount: number;
  qrPayload: string;
  promptpayId: string;
  confirmed: boolean;
  slipUrl?: string;
}

interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0); // 0 address, 1 review, 2 payment
  const [shipping, setShipping] = useState({
    recipientName: "", phone: "", addressLine1: "", subdistrict: "", district: "",
    province: "", postalCode: "", note: "",
  });
  const [pin, setPin] = useState<LatLng | null>(null);
  const [addressGuess, setAddressGuess] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [fieldError, setFieldError] = useState("");

  // ── สมุดที่อยู่ ──
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [paying, setPaying] = useState(false);
  const [orderGroupId, setOrderGroupId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);

  // ── คูปอง (UI เตรียมไว้ — ยังไม่มี backend รองรับจริง) ──
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!hydrated || authLoading) return; // รอ auth โหลดเสร็จก่อน — กัน redirect ทั้งที่ล็อกอินอยู่
    if (!user) { router.push("/auth/login"); return; }
    if (items.length === 0 && payments.length === 0) router.push("/cart");
  }, [hydrated, authLoading, user, items.length, payments.length, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && payments.length > 0 && timeLeft > 0) timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [step, payments.length, timeLeft]);

  /** โหลดสมุดที่อยู่ — เลือก default (หรือใบแรก) ให้อัตโนมัติ, ถ้าไม่มีเลยให้เปิดฟอร์มใหม่ทันที */
  useEffect(() => {
    if (!user || !session?.access_token) return;
    authFetch(`${API_BASE}/api/addresses`)
      .then((res) => res.json())
      .then((data: SavedAddress[]) => {
        setSavedAddresses(data);
        if (data.length > 0) {
          const def = data.find((a) => a.isDefault) ?? data[0];
          applyAddress(def);
          setShowNewForm(false);
        } else {
          setShowNewForm(true);
        }
      })
      .catch(() => setShowNewForm(true))
      .finally(() => setAddressesLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session?.access_token]);

  const applyAddress = (a: SavedAddress) => {
    setSelectedAddressId(a.id);
    setShipping({
      recipientName: a.recipientName, phone: a.phone, addressLine1: a.addressLine1,
      subdistrict: a.subdistrict, district: a.district, province: a.province,
      postalCode: a.postalCode, note: "",
    });
    setPin(a.lat != null && a.lng != null ? { lat: a.lat, lng: a.lng } : null);
  };

  const startNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewForm(true);
    setShipping({ recipientName: "", phone: "", addressLine1: "", subdistrict: "", district: "", province: "", postalCode: "", note: "" });
    setPin(null);
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await authFetch(`${API_BASE}/api/addresses/${id}`, { method: "DELETE" });
      const next = savedAddresses.filter((a) => a.id !== id);
      setSavedAddresses(next);
      if (selectedAddressId === id) {
        if (next.length > 0) applyAddress(next[0]);
        else startNewAddress();
      }
    } catch {
      // ลบไม่สำเร็จ — เงียบไว้ ผู้ใช้กดใหม่ได้
    }
  };

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const total = subtotal + (items.length > 0 ? SHIPPING_FEE : 0);

  /** จัดกลุ่มสินค้าตามร้าน — ให้ลูกค้าเห็นชัดว่าตะกร้ามาจากกี่ร้าน */
  const byShop = useMemo(() => {
    const groups = new Map<string, CartLine[]>();
    for (const line of items) {
      const key = line.product.shopName ?? "LAYA";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(line);
    }
    return [...groups.entries()];
  }, [items]);

  const handleSessionExpired = () => {
    setError("เซสชันหมดอายุ กำลังพาไปเข้าสู่ระบบใหม่...");
    setTimeout(() => router.push("/auth/login"), 1500);
  };

  const validateAddress = () => {
    const { recipientName, phone, addressLine1, subdistrict, district, province, postalCode } = shipping;
    if (!recipientName || !phone || !addressLine1 || !province || !district || !subdistrict || !postalCode) {
      setFieldError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }
    if (!/^0\d{9}$/.test(phone)) {
      setFieldError("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0");
      return false;
    }
    if (postalCode.length !== 5) {
      setFieldError("รหัสไปรษณีย์ต้องมี 5 หลัก");
      return false;
    }
    setFieldError("");
    return true;
  };

  /** บันทึกที่อยู่ใหม่ไว้ในสมุดที่อยู่ (best-effort — ไม่บล็อกการสั่งซื้อถ้าบันทึกไม่สำเร็จ) */
  const persistNewAddressIfNeeded = async () => {
    if (!showNewForm || !saveNewAddress) return;
    try {
      await authFetch(`${API_BASE}/api/addresses`, {
        method: "POST",
        body: JSON.stringify({
          label: savedAddresses.length === 0 ? "บ้าน" : "ที่อยู่ใหม่",
          recipientName: shipping.recipientName,
          phone: shipping.phone,
          addressLine1: shipping.addressLine1,
          subdistrict: shipping.subdistrict,
          district: shipping.district,
          province: shipping.province,
          postalCode: shipping.postalCode,
          lat: pin?.lat,
          lng: pin?.lng,
        }),
      });
    } catch {
      // บันทึกที่อยู่ไม่สำเร็จ — ไม่กระทบการสั่งซื้อ ผู้ใช้บันทึกเองทีหลังได้
    }
  };

  /** สร้างออเดอร์ + payment (คนละ QR ต่อร้าน จ่ายตรงเข้าบัญชีร้าน) แล้วเข้าขั้นสแกนจ่าย */
  const handleSubmitOrder = async () => {
    setLoading(true);
    setError("");
    try {
      await persistNewAddressIfNeeded();

      const orderRes = await authFetch(`${API_BASE}/api/product-orders`, {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
          shipping: {
            recipientName: shipping.recipientName,
            phone: shipping.phone,
            addressLine1: shipping.addressLine1,
            subdistrict: shipping.subdistrict,
            district: shipping.district,
            province: shipping.province,
            postalCode: shipping.postalCode,
            note: shipping.note || undefined,
            lat: pin?.lat,
            lng: pin?.lng,
          },
          shippingFee: SHIPPING_FEE,
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? "สร้างออเดอร์ไม่สำเร็จ");
      setOrderGroupId(order.id);

      const payRes = await authFetch(`${API_BASE}/api/payments`, {
        method: "POST",
        body: JSON.stringify({ productOrderGroupId: order.id }),
      });
      const pay = await payRes.json();
      if (!payRes.ok) throw new Error(pay.error ?? "สร้างรายการชำระเงินไม่สำเร็จ");

      const list: PaymentInfo[] = (pay.payments ?? []).map((p: {
        id: string; shopName: string; amount: number; qrPayload: string; promptpayId: string;
      }) => ({
        id: p.id, shopName: p.shopName, amount: p.amount, qrPayload: p.qrPayload, promptpayId: p.promptpayId,
        confirmed: false,
      }));
      if (!list.length) throw new Error("สร้างรายการชำระเงินไม่สำเร็จ");
      setPayments(list);
      setTimeLeft(900);
      setStep(2);
    } catch (err) {
      if (err instanceof SessionExpiredError) { handleSessionExpired(); return; }
      setError(err instanceof Error ? err.message : "ดำเนินการไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  /** ยืนยันจ่ายแล้วทุกร้านที่ยังไม่ยืนยัน — ต้องแนบสลิปทุกร้านก่อน (ตรวจผ่าน SlipOk ฝั่ง backend) */
  const handleConfirmPaid = async () => {
    const pending = payments.filter((p) => !p.confirmed);
    if (!pending.length) return;
    if (pending.some((p) => !p.slipUrl)) { setError("กรุณาแนบสลิปการโอนเงินให้ครบทุกร้านก่อนยืนยัน"); return; }
    setPaying(true);
    setError("");
    try {
      for (const p of pending) {
        const res = await authFetch(`${API_BASE}/api/payments/${p.id}/confirm`, {
          method: "POST",
          body: JSON.stringify({ slipUrl: p.slipUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `ยืนยันการชำระเงินร้าน ${p.shopName} ไม่สำเร็จ`);
      }
      clearCart();
      router.push(`/orders/product/${orderGroupId}/success`);
    } catch (err) {
      if (err instanceof SessionExpiredError) { handleSessionExpired(); return; }
      setError(err instanceof Error ? err.message : "ยืนยันการชำระเงินไม่สำเร็จ");
    } finally {
      setPaying(false);
    }
  };

  const setPaymentSlip = (paymentId: string, slipUrl: string) => {
    setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, slipUrl } : p)));
  };

  const handleBack = () => {
    if (step === 2) { setStep(1); return; } // QR ยังอยู่ กลับมาดูรายการได้
    if (step === 1) { setStep(0); return; }
    router.back();
  };

  const handlePrimary = () => {
    if (step === 0) { if (validateAddress()) setStep(1); return; }
    if (step === 1) { handleSubmitOrder(); return; }
    handleConfirmPaid();
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponMsg("ระบบคูปองส่วนลดยังไม่เปิดให้ใช้งานในขณะนี้");
  };

  const primaryLabel = loading ? "กำลังสร้างออเดอร์..." : paying ? "กำลังตรวจสอบ..."
    : step === 0 ? "ดำเนินการต่อ"
    : step === 1 ? `ยืนยันและชำระ ฿${total.toLocaleString()}`
    : "ฉันโอนเงินแล้ว";

  // ต้องแนบสลิปครบทุกร้านที่ยังไม่ยืนยันก่อนกดยืนยันได้
  const allSlipsAttached = payments.filter((p) => !p.confirmed).every((p) => !!p.slipUrl);

  if (!hydrated || authLoading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: IVORY, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={30} sx={{ color: GOLD }} />
      </Box>
    );
  }
  if (!user) return null;

  /** สรุปคำสั่งซื้อ + คูปอง + CTA + trust badges — ใช้ซ้ำทั้ง sidebar เดสก์ท็อป (sticky) และแถบล่างมือถือ */
  const orderSummaryCard = (
    <Box sx={{ ...cardSx, p: { xs: 2, md: 2.5 } }}>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.05rem", color: NAVY, mb: 2 }}>
        สรุปคำสั่งซื้อ
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>
          ยอดรวมสินค้า ({items.reduce((n, i) => n + i.quantity, 0)} ชิ้น)
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: NAVY, fontWeight: 600 }}>฿{subtotal.toLocaleString()}</Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>ค่าจัดส่ง</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: NAVY, fontWeight: 600 }}>฿{SHIPPING_FEE.toLocaleString()}</Typography>
      </Box>

      {/* คูปอง */}
      <Box
        onClick={() => setShowCoupon((v) => !v)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", py: 0.6 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <LocalOfferOutlinedIcon sx={{ fontSize: 15, color: GOLD }} />
          <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: NAVY, fontWeight: 600 }}>มีโค้ดส่วนลด?</Typography>
        </Box>
        <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: "#9CA3AF", transform: showCoupon ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </Box>
      <Collapse in={showCoupon}>
        <Box sx={{ display: "flex", gap: 1, mt: 1, mb: 0.5 }}>
          <TextField
            size="small" placeholder="กรอกโค้ดส่วนลด" value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value); setCouponMsg(""); }}
            sx={{ ...fieldSx, flex: 1 }}
          />
          <Button
            onClick={handleApplyCoupon}
            sx={{ px: 2, borderRadius: "10px", bgcolor: "#F0EBE3", color: NAVY, fontFamily: FONT, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#E5DFD1" } }}
          >
            ใช้
          </Button>
        </Box>
        {couponMsg && <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF", mb: 0.5 }}>{couponMsg}</Typography>}
      </Collapse>

      <Divider sx={{ my: 1.5, borderColor: "#F3EDE2" }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.95rem", color: NAVY, fontWeight: 700 }}>ยอดรวมทั้งสิ้น</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.6rem", color: GOLD, fontWeight: 700, lineHeight: 1 }}>฿{total.toLocaleString()}</Typography>
      </Box>

      <Button
        variant="contained" fullWidth
        disabled={loading || paying || (step === 2 && (timeLeft <= 0 || !allSlipsAttached))}
        onClick={handlePrimary}
        startIcon={loading || paying ? <CircularProgress size={18} color="inherit" /> : step === 2 ? <CheckCircleRoundedIcon /> : null}
        sx={{
          py: 1.6, bgcolor: step === 2 ? GOLD : NAVY, color: "#FFFFFF", borderRadius: "14px",
          fontWeight: 700, fontSize: "0.98rem", fontFamily: FONT, textTransform: "none",
          boxShadow: step === 2 ? "0 6px 18px rgba(197,165,90,0.35)" : "0 6px 18px rgba(27,42,74,0.22)",
          transition: "all 0.2s",
          "&:hover": { bgcolor: step === 2 ? "#B8964D" : "#0F1A30", transform: "translateY(-1px)" },
          "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.35)", color: "#FFFFFF" },
        }}
      >
        {primaryLabel}
      </Button>

      {/* Trust badges */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 2.5 }}>
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Icon sx={{ fontSize: 15, color: GOLD }} />
            <Typography sx={{ fontFamily: FONT, fontSize: "0.66rem", color: "#9CA3AF", lineHeight: 1.2 }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: IVORY, minHeight: "100vh" }}>

        {/* ── Header ── */}
        <Box sx={{
          px: { xs: 1.5, md: 4 }, pt: { xs: 4, md: 3 }, pb: { xs: 1.5, md: 2 }, display: "flex", alignItems: "center",
          bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #EFE9DD",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", maxWidth: 1280, width: "100%", mx: "auto" }}>
            <IconButton onClick={handleBack} sx={{ color: NAVY }}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, ml: { md: 1 }, fontFamily: FONT, fontSize: { xs: "1.05rem", md: "1.25rem" }, fontWeight: 700, color: NAVY }}>
              ชำระเงิน
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pr: 1 }}>
              <LockOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
              <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "#9CA3AF" }}>การชำระเงินที่ปลอดภัย</Typography>
            </Box>
          </Box>
        </Box>

        {/* ── เนื้อหา — จำกัดความกว้างสูงสุด 1280px กึ่งกลางจอ ── */}
        <Box sx={{ maxWidth: 1280, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 1, md: 4 }, pb: { xs: 13, md: 6 }, flex: 1 }}>

          {/* ── Stepper ── */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 1, md: 0 }, pt: { xs: 2, md: 0 }, pb: { xs: 2, md: 4 } }}>
            {STEPS.map((label, idx) => {
              const done = step > idx;
              const active = step === idx;
              return (
                <Box key={label} sx={{ display: "flex", alignItems: "center", flex: { md: idx < STEPS.length - 1 ? 1 : "0 0 auto" } }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.6 }}>
                    <Box sx={{
                      width: { xs: 32, md: 42 }, height: { xs: 32, md: 42 }, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      bgcolor: done ? GOLD : active ? NAVY : "#FFFFFF",
                      border: done || active ? "none" : "1.5px solid #E5DFD6",
                      color: done || active ? "#FFFFFF" : "#9CA3AF",
                      fontWeight: 700, fontSize: { xs: "0.8rem", md: "1rem" }, fontFamily: FONT,
                      boxShadow: active ? "0 4px 14px rgba(27,42,74,0.28)" : done ? "0 4px 14px rgba(197,165,90,0.3)" : "none",
                      transition: "all 0.3s",
                    }}>
                      {done ? <CheckRoundedIcon sx={{ fontSize: { xs: 16, md: 20 } }} /> : idx + 1}
                    </Box>
                    <Typography sx={{ fontFamily: FONT, fontSize: { xs: "0.65rem", md: "0.8rem" }, fontWeight: active ? 700 : 400, color: active ? NAVY : done ? GOLD : "#9CA3AF", whiteSpace: "nowrap" }}>
                      {label}
                    </Typography>
                  </Box>
                  {idx < STEPS.length - 1 && (
                    <Box sx={{ flex: 1, minWidth: { xs: 32, md: 60 }, height: 2, borderRadius: 1, bgcolor: step > idx ? GOLD : "#E5DFD6", mx: { xs: 1, md: 2 }, mb: { xs: 2.2, md: 2.8 }, transition: "all 0.3s" }} />
                  )}
                </Box>
              );
            })}
          </Box>

          {error && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" sx={{ borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>
            </Box>
          )}

          {/* ── 2-column layout: เนื้อหาซ้าย 66% / สรุปคำสั่งซื้อขวา sticky 34% (เดสก์ท็อป) ── */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 0, md: 4 }, alignItems: "flex-start" }}>

            {/* ── LEFT: เนื้อหาตามขั้น ── */}
            <Box sx={{ flex: { md: "1 1 0" }, minWidth: 0, width: "100%" }}>
              <AnimatePresence initial={false}>

                {/* ── STEP 1: ที่อยู่ ── */}
                {step === 0 && (
                  <motion.div key="addr" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    {/* แถบสรุปตะกร้าย่อ — เฉพาะมือถือ (เดสก์ท็อปเห็นสรุปเต็มในคอลัมน์ขวาอยู่แล้ว) */}
                    <Box sx={{ display: { xs: "flex", md: "none" }, ...cardSx, p: 1.5, mb: 2, alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ display: "flex" }}>
                        {items.slice(0, 3).map((line, i) => (
                          <Box key={cartLineKey(line.productId, line.variantId)} sx={{
                            width: 38, height: 38, borderRadius: "10px", overflow: "hidden", position: "relative",
                            border: "2px solid #FFFFFF", ml: i > 0 ? -1.2 : 0, boxShadow: "0 1px 4px rgba(27,42,74,0.15)",
                            bgcolor: "#F0EBE3",
                          }}>
                            {line.product.image && <Image src={line.product.image} alt="" fill style={{ objectFit: "cover" }} />}
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 600, color: NAVY }}>
                          {items.reduce((n, i) => n + i.quantity, 0)} ชิ้น · {byShop.length} ร้านค้า
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF" }}>จ่ายครั้งเดียวด้วย QR พร้อมเพย์</Typography>
                      </Box>
                      <Typography sx={{ fontFamily: FONT, fontSize: "1rem", fontWeight: 700, color: GOLD }}>
                        ฿{total.toLocaleString()}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: { xs: "1rem", md: "1.15rem" }, color: NAVY, mb: 1.8, display: "flex", alignItems: "center" }}>
                      <LocationOnOutlinedIcon sx={{ mr: 0.8, fontSize: 22, color: GOLD }} /> จัดส่งไปที่ไหน?
                    </Typography>

                    {/* ── สมุดที่อยู่ที่บันทึกไว้ ── */}
                    {!addressesLoaded ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                        <CircularProgress size={20} sx={{ color: GOLD }} />
                      </Box>
                    ) : savedAddresses.length > 0 && !showNewForm ? (
                      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1.2 }}>
                        {savedAddresses.map((a) => {
                          const active = selectedAddressId === a.id;
                          return (
                            <Box
                              key={a.id}
                              onClick={() => applyAddress(a)}
                              sx={{
                                ...cardSx, p: 2, cursor: "pointer",
                                border: active ? `1.5px solid ${GOLD}` : `1px solid ${CARD_BORDER}`,
                                boxShadow: active ? "0 4px 16px rgba(197,165,90,0.2)" : "0 2px 14px rgba(27,42,74,0.05)",
                                display: "flex", alignItems: "flex-start", gap: 1.4, transition: "all 0.2s",
                                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(27,42,74,0.1)" },
                              }}
                            >
                              <Box sx={{
                                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                                bgcolor: active ? NAVY : "#F5F1E8", display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <HomeRoundedIcon sx={{ fontSize: 18, color: active ? GOLD : "#9CA3AF" }} />
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                                  <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>{a.label}</Typography>
                                  {a.isDefault && (
                                    <Box sx={{ bgcolor: "#FDF8F0", color: "#8E601C", fontSize: "0.65rem", fontFamily: FONT, fontWeight: 600, px: 0.8, py: 0.15, borderRadius: "6px" }}>
                                      ค่าเริ่มต้น
                                    </Box>
                                  )}
                                </Box>
                                <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: NAVY, mt: 0.3 }}>
                                  {a.recipientName} · {a.phone}
                                </Typography>
                                <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#9CA3AF", lineHeight: 1.6 }}>
                                  {a.addressLine1} {a.subdistrict} {a.district} {a.province} {a.postalCode}
                                </Typography>
                              </Box>
                              {active && <CheckCircleRoundedIcon sx={{ fontSize: 20, color: GOLD, flexShrink: 0 }} />}
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleDeleteAddress(a.id); }}
                                sx={{ color: "#D1D5DB", flexShrink: 0, "&:hover": { color: "#D32F2F" } }}
                              >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Box>
                          );
                        })}

                        {/* Add New Address — outlined dashed card */}
                        <Box
                          onClick={startNewAddress}
                          sx={{
                            border: "1.5px dashed #C9BFA8", borderRadius: "18px", py: 1.8, textAlign: "center",
                            cursor: "pointer", color: NAVY, transition: "all 0.2s",
                            "&:hover": { bgcolor: "#FDF8F0", borderColor: GOLD },
                          }}
                        >
                          <AddRoundedIcon sx={{ fontSize: 18, verticalAlign: "middle", mr: 0.5, color: GOLD }} />
                          <Typography component="span" sx={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600 }}>เพิ่มที่อยู่ใหม่</Typography>
                        </Box>
                      </Box>
                    ) : null}

                    {/* ── ฟอร์มที่อยู่ใหม่ (แสดงตอนไม่มีที่อยู่บันทึกไว้ หรือกด "เพิ่มที่อยู่ใหม่") ── */}
                    {addressesLoaded && showNewForm && (
                      <>
                        {savedAddresses.length > 0 && (
                          <Button
                            onClick={() => { setShowNewForm(false); const def = savedAddresses.find(a => a.isDefault) ?? savedAddresses[0]; applyAddress(def); }}
                            sx={{ mb: 1.5, color: "#8E9199", fontFamily: FONT, fontSize: "0.78rem", textTransform: "none", p: 0.5 }}
                          >
                            ← ใช้ที่อยู่ที่บันทึกไว้
                          </Button>
                        )}

                        {/* แผนที่ปักหมุด — ช่วยยืนยันตำแหน่งให้ร้าน/คนส่งของแม่นขึ้น (ไม่บังคับ) */}
                        <Box sx={{ mb: 2 }}>
                          <LocationPickerMap
                            value={pin}
                            onChange={setPin}
                            onAddressGuess={setAddressGuess}
                            onGeoResolved={(addr) => setShipping((prev) => ({
                              ...prev,
                              ...(addr.province ? { province: addr.province } : {}),
                              ...(addr.district ? { district: addr.district } : {}),
                              ...(addr.subdistrict ? { subdistrict: addr.subdistrict } : {}),
                              ...(addr.postalCode ? { postalCode: addr.postalCode } : {}),
                            }))}
                          />
                          {addressGuess && (
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.6, mt: 1, px: 0.5 }}>
                              <PlaceRoundedIcon sx={{ fontSize: 14, color: GOLD, mt: 0.2, flexShrink: 0 }} />
                              <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#6B7280", lineHeight: 1.5 }}>
                                ตำแหน่งที่ปักหมุด: {addressGuess}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ ...cardSx, p: { xs: 2, md: 2.8 }, display: "flex", flexDirection: "column", gap: 1.8 }}>
                          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.8 }}>
                            <TextField size="small" label="ชื่อ-นามสกุลผู้รับ" sx={fieldSx} required
                              value={shipping.recipientName} onChange={(e) => setShipping({ ...shipping, recipientName: e.target.value })} />
                            <TextField size="small" label="เบอร์โทรศัพท์" inputProps={{ maxLength: 10, inputMode: "numeric" }} sx={fieldSx} required
                              value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g, "") })} />
                          </Box>
                          <TextField size="small" label="บ้านเลขที่ ซอย ถนน" sx={fieldSx} required
                            value={shipping.addressLine1} onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })} />

                          <Divider sx={{ borderColor: "#F3EDE2" }} />

                          <AddressGeoFields
                            fieldSx={fieldSx}
                            value={{
                              province: shipping.province, district: shipping.district,
                              subdistrict: shipping.subdistrict, postalCode: shipping.postalCode,
                            }}
                            onChange={(next) => setShipping({ ...shipping, ...next })}
                          />

                          {fieldError && <Alert severity="warning" sx={{ borderRadius: "10px", fontFamily: FONT }}>{fieldError}</Alert>}

                          {!showNote ? (
                            <Button
                              onClick={() => setShowNote(true)} startIcon={<AddCommentOutlinedIcon sx={{ fontSize: 16 }} />}
                              sx={{ alignSelf: "flex-start", color: "#8E9199", fontFamily: FONT, fontSize: "0.78rem", textTransform: "none", p: 0.5 }}
                            >
                              เพิ่มหมายเหตุถึงร้านค้า
                            </Button>
                          ) : (
                            <TextField fullWidth multiline rows={2} label="หมายเหตุถึงร้านค้า (ถ้ามี)" autoFocus
                              value={shipping.note} onChange={(e) => setShipping({ ...shipping, note: e.target.value })} sx={fieldSx} />
                          )}

                          <Divider sx={{ borderColor: "#F3EDE2" }} />

                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={saveNewAddress}
                                onChange={(e) => setSaveNewAddress(e.target.checked)}
                                sx={{ color: "#D1D5DB", "&.Mui-checked": { color: GOLD }, p: 0.6 }}
                              />
                            }
                            label={<Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#4A5468" }}>บันทึกที่อยู่นี้ไว้ใช้ครั้งหน้า</Typography>}
                            sx={{ m: 0 }}
                          />
                        </Box>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── STEP 2: ตรวจสอบ ── */}
                {step === 1 && (
                  <motion.div key="review" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: { xs: "1rem", md: "1.15rem" }, color: NAVY, mb: 1.8 }}>
                      รายการสินค้า
                    </Typography>

                    {/* สินค้าจัดกลุ่มตามร้าน */}
                    {byShop.map(([shopName, lines]) => (
                      <Box key={shopName} sx={{ ...cardSx, p: { xs: 2, md: 2.4 }, mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
                          <StorefrontOutlinedIcon sx={{ fontSize: 17, color: GOLD }} />
                          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.9rem", color: NAVY }}>{shopName}</Typography>
                        </Box>
                        {lines.map((line) => {
                          const lineKey = cartLineKey(line.productId, line.variantId);
                          return (
                          <Box key={lineKey} sx={{
                            display: "flex", gap: 1.6, mb: 1.4, pb: 1.4,
                            borderBottom: "1px solid #F5F1E8", "&:last-child": { borderBottom: "none", mb: 0, pb: 0 },
                          }}>
                            <Box sx={{ width: { xs: 64, md: 76 }, height: { xs: 64, md: 76 }, borderRadius: "14px", overflow: "hidden", position: "relative", flexShrink: 0, bgcolor: "#F0EBE3" }}>
                              {line.product.image && <Image src={line.product.image} alt="" fill style={{ objectFit: "cover" }} />}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                              <Typography noWrap sx={{ fontFamily: FONT, fontSize: "0.9rem", fontWeight: 600, color: NAVY }}>{line.product.name}</Typography>
                              {line.variantLabel && (
                                <Typography sx={{ fontFamily: FONT, fontSize: "0.74rem", color: "#8E601C", mt: 0.2 }}>
                                  ตัวเลือก: {line.variantLabel}
                                </Typography>
                              )}
                              <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#9CA3AF", mt: 0.2 }}>
                                ฿{line.product.price.toLocaleString()} / {line.product.priceUnit}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.8 }}>
                                <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #E5DFD6", borderRadius: "8px", bgcolor: "#FFFFFF" }}>
                                  <IconButton
                                    size="small" sx={{ p: 0.4 }}
                                    onClick={() => updateQuantity(lineKey, line.quantity - 1)}
                                  >
                                    <RemoveRoundedIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                  <Typography sx={{ px: 1.2, fontWeight: 600, fontSize: "0.82rem", color: NAVY, minWidth: 22, textAlign: "center" }}>
                                    {line.quantity}
                                  </Typography>
                                  <IconButton
                                    size="small" sx={{ p: 0.4 }}
                                    onClick={() => updateQuantity(lineKey, Math.min(line.quantity + 1, line.product.stock || 99))}
                                  >
                                    <AddRoundedIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Box>
                                <IconButton size="small" onClick={() => removeItem(lineKey)} sx={{ color: "#D1D5DB", "&:hover": { color: "#D32F2F" } }}>
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            </Box>
                            <Typography sx={{ fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700, color: NAVY, alignSelf: "center", flexShrink: 0 }}>
                              ฿{(line.product.price * line.quantity).toLocaleString()}
                            </Typography>
                          </Box>
                          );
                        })}
                      </Box>
                    ))}

                    {/* ที่อยู่ */}
                    <Box sx={{ ...cardSx, p: { xs: 2, md: 2.4 }, mb: 1.5, display: "flex", gap: 1.2 }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 19, color: GOLD, mt: 0.3 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.88rem", fontWeight: 600, color: NAVY }}>
                          {shipping.recipientName} · {shipping.phone}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.6 }}>
                          {shipping.addressLine1} {shipping.subdistrict} {shipping.district} {shipping.province} {shipping.postalCode}
                        </Typography>
                        {shipping.note && (
                          <Typography sx={{ fontFamily: FONT, fontSize: "0.74rem", color: "#9CA3AF", mt: 0.3 }}>หมายเหตุ: {shipping.note}</Typography>
                        )}
                      </Box>
                      <Button
                        size="small" onClick={() => setStep(0)} startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{ color: NAVY, border: `1px solid ${CARD_BORDER}`, borderRadius: "10px", fontFamily: FONT, fontSize: "0.75rem", textTransform: "none", flexShrink: 0, alignSelf: "flex-start", "&:hover": { bgcolor: "#FDF8F0", borderColor: GOLD } }}
                      >
                        แก้ไข
                      </Button>
                    </Box>

                    {/* hint บนมือถือ (เดสก์ท็อปมี order summary column ขวาอยู่แล้ว) */}
                    <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 0.6, bgcolor: "#FDF8F0", borderRadius: "10px", px: 1.2, py: 0.8 }}>
                      <QrCode2RoundedIcon sx={{ fontSize: 15, color: "#8E601C" }} />
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#8E601C" }}>
                        กดยืนยันแล้วสแกน QR พร้อมเพย์ได้เลย — จ่ายครั้งเดียวครบทุกร้าน
                      </Typography>
                    </Box>
                  </motion.div>
                )}

                {/* ── STEP 3: สแกนจ่าย (คนละ QR ต่อร้าน จ่ายตรงเข้าบัญชีร้านนั้นๆ) ── */}
                {step === 2 && payments.length > 0 && (
                  <motion.div key="pay" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: { xs: "1rem", md: "1.15rem" }, color: NAVY, mb: 1.8 }}>
                      {payments.length > 1 ? `เลือกวิธีชำระเงิน (${payments.length} ร้านค้า)` : "เลือกวิธีชำระเงิน"}
                    </Typography>

                    {/* Payment method tabs — ตอนนี้เปิดใช้เฉพาะ PromptPay */}
                    <Box sx={{ display: "flex", gap: 1, mb: 2.5, overflowX: "auto", pb: 0.5 }}>
                      {PAYMENT_METHODS.map((m) => (
                        <Box
                          key={m.id}
                          sx={{
                            display: "flex", alignItems: "center", gap: 0.7, flexShrink: 0,
                            px: 1.8, py: 1, borderRadius: "12px",
                            bgcolor: m.active ? NAVY : "#F5F1E8",
                            color: m.active ? "#FFFFFF" : "#B0AA9C",
                            border: m.active ? "none" : "1px solid #EFE9DD",
                            cursor: m.active ? "default" : "not-allowed",
                            opacity: m.active ? 1 : 0.75,
                          }}
                        >
                          <m.icon sx={{ fontSize: 17 }} />
                          <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>{m.label}</Typography>
                          {!m.active && (
                            <Typography sx={{ fontFamily: FONT, fontSize: "0.62rem", color: "#B0AA9C", ml: 0.3 }}>เร็วๆ นี้</Typography>
                          )}
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {/* การ์ด QR — คนละใบต่อร้าน จ่ายตรงเข้าบัญชีร้านนั้นๆ */}
                      {payments.map((p) => (
                        <Box key={p.id} sx={{
                          width: "100%", maxWidth: 380, bgcolor: "#FFFFFF", borderRadius: "20px", overflow: "hidden",
                          border: `1px solid ${CARD_BORDER}`, boxShadow: "0 10px 34px rgba(27,42,74,0.12)", mb: 2.5,
                        }}>
                          <Box sx={{ bgcolor: NAVY, py: 1.3, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8 }}>
                            <StorefrontOutlinedIcon sx={{ fontSize: 16, color: GOLD }} />
                            <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.06em" }}>
                              {p.shopName}
                            </Typography>
                          </Box>
                          <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 1.4 }}>
                              <QrCode2RoundedIcon sx={{ fontSize: 15, color: GOLD }} />
                              <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF", letterSpacing: "0.04em" }}>
                                THAI QR PAYMENT · พร้อมเพย์
                              </Typography>
                            </Box>
                            <Box sx={{ position: "relative", p: 1.8, borderRadius: "16px", border: `1.5px dashed ${GOLD}` }}>
                              <QRCodeSVG value={p.qrPayload} size={200} level="M" style={{ opacity: timeLeft <= 0 ? 0.12 : 1, transition: "opacity .3s" }} />
                              {timeLeft <= 0 && (
                                <Button onClick={() => setTimeLeft(900)} startIcon={<ReplayRoundedIcon />}
                                  sx={{ position: "absolute", inset: 0, m: "auto", width: "fit-content", height: "fit-content", bgcolor: NAVY, color: "#FFF", borderRadius: "10px", px: 2, fontFamily: FONT, "&:hover": { bgcolor: "#0F1A30" } }}>
                                  แสดง QR อีกครั้ง
                                </Button>
                              )}
                            </Box>
                            <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280", mt: 1.8 }}>
                              พร้อมเพย์: {formatPromptPayIdDisplay(p.promptpayId)} · {p.shopName}
                            </Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: "1.75rem", color: NAVY, fontWeight: 700, mt: 0.4 }}>
                              ฿{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Typography>
                            <SlipUploadBox
                              paymentId={p.id}
                              slipUrl={p.slipUrl}
                              onUploaded={(url) => setPaymentSlip(p.id, url)}
                              onError={(msg) => setError(msg)}
                            />
                          </Box>
                        </Box>
                      ))}

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, bgcolor: timeLeft <= 60 ? "#FDF0F0" : "#FDF8F0", px: 1.6, py: 0.5, borderRadius: "999px" }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: timeLeft <= 60 ? "#D32F2F" : "#8E601C", fontWeight: 600 }}>
                          ชำระภายใน {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")} นาที
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.2 }}>
                        <GppGoodRoundedIcon sx={{ fontSize: 15, color: GOLD }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF" }}>Secure Payment · เข้ารหัสมาตรฐาน EMVCo</Typography>
                      </Box>

                      {/* วิธีจ่าย */}
                      <Box sx={{ width: "100%", maxWidth: 380, mt: 2, ...cardSx, p: 2.2 }}>
                        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.85rem", color: NAVY, mb: 1.4 }}>วิธีการชำระเงิน</Typography>
                        {["เปิดแอปธนาคารของคุณ", "สแกน QR ด้านบน แล้วตรวจชื่อผู้รับ LAYA", "โอนเงินให้ครบตามยอด", "แนบสลิปการโอนในกล่องใต้ QR ของแต่ละร้าน", "กดปุ่ม “ฉันโอนเงินแล้ว” ด้านล่าง"].map((t, i, arr) => (
                          <Box key={t} sx={{ display: "flex", gap: 1.2, mb: i < arr.length - 1 ? 1.1 : 0 }}>
                            <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: "#FDF8F0", color: "#8E601C", fontSize: "0.68rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, flexShrink: 0, mt: 0.1 }}>
                              {i + 1}
                            </Box>
                            <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#4A5468" }}>{t}</Typography>
                          </Box>
                        ))}
                      </Box>

                      <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF", textAlign: "center", mt: 1.5, maxWidth: 340 }}>
                        หลังยืนยัน ร้านค้าจะได้รับแจ้งเตือนและเริ่มเตรียมสินค้าของคุณ
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>

            {/* ── RIGHT: สรุปคำสั่งซื้อ sticky (เดสก์ท็อปเท่านั้น) ── */}
            <Box sx={{ display: { xs: "none", md: "block" }, flex: "0 0 360px", width: 360, position: "sticky", top: 100 }}>
              {orderSummaryCard}
            </Box>
          </Box>
        </Box>

        {/* ── Sticky CTA (มือถือเท่านั้น — เดสก์ท็อปมีปุ่มอยู่ใน order summary column ขวาแล้ว) ── */}
        <Box sx={{
          display: { xs: "block", md: "none" },
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430, zIndex: 1300, bgcolor: "#FFFFFF",
          px: 2, pt: 1.5, pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
          borderTop: "1px solid #EFE9DD", boxShadow: "0 -4px 16px rgba(27,42,74,0.06)",
        }}>
          {step < 2 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#9CA3AF" }}>ยอดรวมทั้งสิ้น</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "1.1rem", fontWeight: 700, color: NAVY }}>฿{total.toLocaleString()}</Typography>
            </Box>
          )}
          <Button
            variant="contained" fullWidth
            disabled={loading || paying || (step === 2 && (timeLeft <= 0 || !allSlipsAttached))}
            onClick={handlePrimary}
            startIcon={loading || paying ? <CircularProgress size={18} color="inherit" /> : step === 2 ? <CheckCircleRoundedIcon /> : null}
            sx={{
              py: 1.5, bgcolor: step === 2 ? GOLD : NAVY, color: "#FFFFFF", borderRadius: "14px",
              fontWeight: 700, fontSize: "0.95rem", fontFamily: FONT, textTransform: "none",
              "&:hover": { bgcolor: step === 2 ? "#B8964D" : "#0F1A30" },
              "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.4)", color: "#FFFFFF" },
            }}
          >
            {primaryLabel}
          </Button>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 1.2 }}>
            {TRUST_BADGES.slice(0, 2).map(({ icon: Icon, label }) => (
              <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <Icon sx={{ fontSize: 12, color: GOLD }} />
                <Typography sx={{ fontFamily: FONT, fontSize: "0.62rem", color: "#9CA3AF" }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </MobileLayout>
  );
}
