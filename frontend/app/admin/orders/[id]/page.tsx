"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import { mockAdminOrders, AdminOrder, AdminOrderTimelineEvent } from "@/lib/mock-admin-data";

const statusStyles: Record<string, { label: string; color: string; bgcolor: string }> = {
  pending: { label: "🟡 Pending Payment", color: "#F59E0B", bgcolor: "rgba(245,158,11,0.15)" },
  paid: { label: "🟢 Paid", color: "#22C55E", bgcolor: "rgba(34,197,94,0.15)" },
  producing: { label: "🟣 In Production", color: "#8B5CF6", bgcolor: "rgba(139,92,246,0.15)" },
  shipped: { label: "🔵 Shipped", color: "#06B6D4", bgcolor: "rgba(6,182,212,0.15)" },
  delivered: { label: "⚫ Delivered", color: "#4B5563", bgcolor: "rgba(75,85,99,0.15)" },
  completed: { label: "✅ Completed", color: "#059669", bgcolor: "rgba(5,150,105,0.15)" },
  cancelled: { label: "❌ Cancelled", color: "#EF4444", bgcolor: "rgba(239,68,68,0.15)" },
};

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: tr };

  const [order, setOrder] = useState<AdminOrder | null>(null);

  // States
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  
  // Modals
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const [showAddTracking, setShowAddTracking] = useState(false);
  
  // Forms
  const [trackingNo, setTrackingNo] = useState("");
  const [shippingProvider, setShippingProvider] = useState("");

  useEffect(() => {
    const found = mockAdminOrders.find(o => o.id === id);
    if (found) setOrder({ ...found }); // Clone to allow local state mutation
  }, [id]);

  if (!order) return <Box sx={{ p: 4, color: c.textPrimary }}>Loading Order Details...</Box>;

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => { setToastMsg(msg); setToastType(type); };

  const pushTimeline = (status: AdminOrder["status"], desc: string) => {
    const ts = new Date().toLocaleString("th-TH");
    return { status, timestamp: ts, description: desc } as AdminOrderTimelineEvent;
  };

  // ── Actions ──
  const confirmPayment = () => {
    setOrder(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: "paid",
        paymentStatus: "paid",
        timeline: [...prev.timeline, pushTimeline("paid", "Payment Confirmed by Admin")]
      };
    });
    setShowConfirmPayment(false);
    showToast("ยืนยันการชำระเงินสำเร็จ (Paid)", "success");
  };

  const startProduction = () => {
    setOrder(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: "producing",
        timeline: [...prev.timeline, pushTimeline("producing", "Weaver started production")]
      };
    });
    showToast("สถานะเปลี่ยนเป็น In Production 🧵");
  };

  const submitTracking = () => {
    if (!trackingNo.trim() || !shippingProvider.trim()) {
      showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
      return;
    }
    setOrder(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: "shipped",
        trackingNumber: trackingNo,
        shippingProvider: shippingProvider,
        timeline: [...prev.timeline, pushTimeline("shipped", `Parcel shipped via ${shippingProvider} (${trackingNo})`)]
      };
    });
    setShowAddTracking(false);
    showToast("บันทึกการจัดส่งสำเร็จ 🚚");
  };

  const markDelivered = () => {
    setOrder(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: "delivered",
        timeline: [...prev.timeline, pushTimeline("delivered", "Order marked as Delivered")]
      };
    });
    showToast("ออเดอร์ถูกทำเครื่องหมายว่าได้รับแล้ว ✅");
  };

  const sts = statusStyles[order.status] || statusStyles.pending;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ── HEADER ── */}
      <Box sx={{
        px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
        bgcolor: c.bgTopbar, borderBottom: `1px solid ${c.borderCard}`,
        position: "sticky", top: 0, zIndex: 50, transition: tr,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.push("/admin/orders")} sx={{ color: c.textPrimary }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary }}>
            Order {order.id}
          </Typography>
          <Chip label={sts.label} size="small" sx={{ bgcolor: sts.bgcolor, color: sts.color, fontWeight: 700, fontSize: "0.75rem", height: 26, ml: 2 }} />
        </Box>
      </Box>

      {/* ── MAIN GRID (12 columns) ── */}
      <Box sx={{ p: { xs: 2, md: 4 }, flex: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr", lg: "8fr 4fr" }, gap: 3, alignItems: "start" }}>

        {/* ── LEFT SIDE (8 col) ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Items Card */}
          <Box sx={card}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Inventory2RoundedIcon sx={{ color: c.gold }} />
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
                Order Items
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {order.items.map(item => (
                <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: "10px", bgcolor: c.bgStatBox }}>
                  <Box sx={{ width: 60, height: 60, borderRadius: "8px", overflow: "hidden", flexShrink: 0, border: `1px solid ${c.borderCard}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: c.textSecondary }}>{item.type} • ทอโดย: {item.weaver}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>฿{item.price.toLocaleString()}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>จำนวน: {item.qty}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
            {/* Customer Info */}
            <Box sx={card}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <PersonRoundedIcon sx={{ color: c.gold }} />
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
                  Customer Info
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: c.textPrimary }}>{order.customerName}</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>📞 {order.customerPhone}</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>✉️ {order.customerEmail}</Typography>
              </Box>
            </Box>

            {/* Shipping Address */}
            <Box sx={card}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <LocationOnRoundedIcon sx={{ color: c.gold }} />
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
                  Shipping Address
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography sx={{ fontSize: "0.9rem", color: c.textPrimary, lineHeight: 1.6 }}>
                  {order.shippingAddress.fullAddress}
                </Typography>
                <Typography sx={{ fontSize: "0.9rem", color: c.textPrimary, fontWeight: 600 }}>
                  {order.shippingAddress.province} {order.shippingAddress.zipCode}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Timeline Card */}
          <Box sx={{ ...card, position: "relative" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
              <InfoRoundedIcon sx={{ color: c.gold }} />
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
                Order Timeline
              </Typography>
            </Box>

            <Box sx={{ ml: 2, position: "relative" }}>
              {/* Vertical line connecting steps */}
              <Box sx={{ position: "absolute", top: 10, bottom: 20, left: 15, width: 2, bgcolor: c.borderCard, zIndex: 0 }} />
              
              {/* All possible steps */}
              {["pending", "paid", "producing", "shipped", "delivered"].map((step, idx) => {
                const isCompleted = order.timeline.some(t => t.status === step);
                const isActive = order.status === step;
                const eventData = order.timeline.find(t => t.status === step);

                // Determine styling based on state
                let color = c.borderCard;
                let dotColor = c.bgCard;
                let labelStyle = { color: c.textMuted, fontWeight: 500 };
                
                if (isActive) {
                  color = c.gold;
                  dotColor = c.gold;
                  labelStyle = { color: c.textPrimary, fontWeight: 700 };
                } else if (isCompleted) {
                  color = "#22C55E";
                  dotColor = "#22C55E";
                  labelStyle = { color: c.textSecondary, fontWeight: 600 };
                }

                const displayLabels: Record<string, string> = { pending: "Order Created", paid: "Payment Confirmed", producing: "In Production", shipped: "Shipped", delivered: "Delivered" };

                return (
                  <Box key={step} sx={{ display: "flex", gap: 3, mb: 4, position: "relative", zIndex: 1 }}>
                    <Box sx={{ 
                      width: 32, height: 32, borderRadius: "50%", border: `3px solid ${color}`, bgcolor: dotColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      ...(isActive && { boxShadow: `0 0 0 4px ${color}33` })
                    }}>
                      {isCompleted && !isActive && <CheckCircleRoundedIcon sx={{ color: "#FFF", fontSize: 18 }} />}
                    </Box>
                    <Box sx={{ mt: 0.5 }}>
                      <Typography sx={{ fontSize: "0.95rem", ...labelStyle }}>
                        {displayLabels[step]} {isActive && "📍"}
                      </Typography>
                      {eventData && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary }}>{eventData.description}</Typography>
                          <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontFamily: "monospace", display: "inline-block", bgcolor: c.bgStatBox, px: 1, py: 0.2, borderRadius: "4px", mt: 0.5 }}>
                            {eventData.timestamp}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Box>

        {/* ── RIGHT SIDEBAR (4 col) ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, position: "sticky", top: 88 }}>
          
          {/* Action Panel */}
          <Box sx={{ ...card, background: `linear-gradient(135deg, ${c.bgCard}, ${c.gold}0A)`, border: `2px solid ${order.status === "pending" ? "#F59E0B" : order.status === "paid" ? "#22C55E" : c.borderCard}` }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textMuted, mb: 2, textTransform: "uppercase", letterSpacing: 1 }}>
              Next Action
            </Typography>
            
            {order.status === "pending" && (
              <Button fullWidth variant="contained" onClick={() => setShowConfirmPayment(true)}
                sx={{ bgcolor: "#22C55E", color: "#FFF", fontWeight: 700, borderRadius: "8px", py: 1.5, "&:hover": { bgcolor: "#16A34A" } }}>
                ✅ Confirm Payment
              </Button>
            )}
            
            {order.status === "paid" && (
              <Button fullWidth variant="contained" onClick={startProduction}
                sx={{ bgcolor: "#8B5CF6", color: "#FFF", fontWeight: 700, borderRadius: "8px", py: 1.5, "&:hover": { bgcolor: "#7C3AED" } }}>
                🧵 Start Production
              </Button>
            )}

            {order.status === "producing" && (
              <Button fullWidth variant="contained" onClick={() => setShowAddTracking(true)}
                sx={{ bgcolor: "#06B6D4", color: "#FFF", fontWeight: 700, borderRadius: "8px", py: 1.5, "&:hover": { bgcolor: "#0891B2" } }}>
                🚚 Add Tracking Info
              </Button>
            )}

            {order.status === "shipped" && (
              <Button fullWidth variant="contained" onClick={markDelivered}
                sx={{ bgcolor: "#4B5563", color: "#FFF", fontWeight: 700, borderRadius: "8px", py: 1.5, "&:hover": { bgcolor: "#374151" } }}>
                📦 Mark as Delivered
              </Button>
            )}

            {(order.status === "delivered" || order.status === "completed") && (
              <Box sx={{ p: 1.5, bgcolor: c.bgStatBox, borderRadius: "8px", textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.9rem", color: c.textSecondary, fontWeight: 600 }}>🎉 Order is Complete</Typography>
              </Box>
            )}
          </Box>

          {/* Payment Card */}
          <Box sx={card}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <AccountBalanceWalletRoundedIcon sx={{ color: c.gold }} />
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
                Payment
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>Method</Typography>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{order.paymentMethod || "-"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>Status</Typography>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: order.paymentStatus === "paid" ? "#22C55E" : "#F59E0B", textTransform: "capitalize" }}>
                  {order.paymentStatus}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>Amount Paid</Typography>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.gold }}>฿{order.paymentProof?.amount?.toLocaleString() || order.total.toLocaleString()}</Typography>
              </Box>
            </Box>

            {order.paymentProof?.image ? (
              <Box>
                <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary, mb: 1 }}>Payment Proof</Typography>
                <Box 
                  onClick={() => setShowPaymentProof(true)}
                  sx={{ 
                    height: 120, borderRadius: "10px", border: `1px solid ${c.borderCard}`, overflow: "hidden", cursor: "zoom-in",
                    position: "relative", "&:hover::after": { content: '""', position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.1)" }
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.paymentProof.image} alt="Proof" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
                <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, mt: 1, textAlign: "center" }}>Paid: {order.paymentProof.date}</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2, bgcolor: c.bgStatBox, borderRadius: "10px", textAlign: "center", border: `1px dashed ${c.borderInput}` }}>
                <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>No payment proof uploaded yet.</Typography>
              </Box>
            )}
          </Box>

          {/* Shipping Card */}
          <Box sx={card}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <LocalShippingRoundedIcon sx={{ color: c.gold }} />
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
                Shipping
              </Typography>
            </Box>

            {order.trackingNumber ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>Provider</Typography>
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>{order.shippingProvider}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>Tracking Number</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#3B82F6", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
                      {order.trackingNumber}
                    </Typography>
                    <IconButton size="small" onClick={() => { navigator.clipboard.writeText(order.trackingNumber!); showToast("Copied tracking tracking number!"); }}>
                      <ContentCopyRoundedIcon sx={{ fontSize: 16, color: c.textMuted }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 2, bgcolor: c.bgStatBox, borderRadius: "10px", textAlign: "center", border: `1px dashed ${c.borderInput}` }}>
                <Typography sx={{ fontSize: "0.8rem", color: c.textMuted, mb: 1.5 }}>Shipping pending production completion.</Typography>
                <Button size="small" variant="outlined" onClick={() => setShowAddTracking(true)} disabled={order.status === "pending" || order.status === "paid"}
                  sx={{ textTransform: "none", color: c.textPrimary, borderColor: c.borderInput, borderRadius: "8px" }}>
                  Add Details Now
                </Button>
              </Box>
            )}
          </Box>

          {/* Summary */}
          <Box sx={card}>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary, mb: 2 }}>Summary</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>Subtotal</Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>฿{order.subtotal.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>Shipping Fee</Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>฿{order.shippingFee.toLocaleString()}</Typography>
            </Box>
            <Divider sx={{ borderColor: c.borderDivider, mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>Total</Typography>
              <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: c.gold }}>฿{order.total.toLocaleString()}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── MODALS ── */}

      {/* Payment Proof Modals */}
      <Dialog open={showPaymentProof} onClose={() => setShowPaymentProof(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none" }}}>
        {order.paymentProof && (
          <Box sx={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.paymentProof.image} alt="Proof" style={{ width: "100%", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }} />
            <Button variant="contained" onClick={() => setShowPaymentProof(false)} sx={{ position: "absolute", top: 16, right: 16, bgcolor: "rgba(0,0,0,0.5)", color: "#FFF", borderRadius: "20px" }}>Close</Button>
          </Box>
        )}
      </Dialog>

      {/* Confirm Payment Dialog */}
      <Dialog open={showConfirmPayment} onClose={() => setShowConfirmPayment(false)} PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "14px" }}}>
        <DialogTitle sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700 }}>ยืนยันการชำระเงิน?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.9rem", color: c.textSecondary }}>
            คุณได้ตรวจสอบสลิปการโอนเงินแล้ว และยืนยันว่าได้รับยอดเงิน <strong>฿{order.paymentProof?.amount?.toLocaleString()}</strong> เรียบร้อยแล้วใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowConfirmPayment(false)} sx={{ color: c.textMuted }}>ยกเลิก</Button>
          <Button variant="contained" onClick={confirmPayment} sx={{ bgcolor: "#22C55E", "&:hover": { bgcolor: "#16A34A" }, borderRadius: "8px", px: 3, fontWeight: 700 }}>ยืนยัน</Button>
        </DialogActions>
      </Dialog>

      {/* Add Tracking Modal */}
      <Dialog open={showAddTracking} onClose={() => setShowAddTracking(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "14px", p: 1 }}}>
        <DialogTitle sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700 }}>เพิ่มข้อมูลการจัดส่ง</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField fullWidth label="บริษัทขนส่ง (Provider)" placeholder="เช่น Kerry, Flash" value={shippingProvider} onChange={e => setShippingProvider(e.target.value)} size="small" 
            sx={{ "& .MuiOutlinedInput-root": { color: c.dialogText, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } }} />
          <TextField fullWidth label="หมายเลขพัสดุ (Tracking Number)" value={trackingNo} onChange={e => setTrackingNo(e.target.value)} size="small"
            sx={{ "& .MuiOutlinedInput-root": { color: c.dialogText, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowAddTracking(false)} sx={{ color: c.textMuted }}>ยกเลิก</Button>
          <Button variant="contained" onClick={submitTracking} sx={{ bgcolor: c.gold, "&:hover": { bgcolor: c.goldHover }, borderRadius: "8px", px: 3, fontWeight: 700 }}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notifier */}
      <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }} open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg("")}>
        <Alert severity={toastType} sx={{
          borderRadius: "12px", fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          bgcolor: toastType === "success" ? "#065F46" : toastType === "error" ? "#7F1D1D" : "#1E3A5F", color: "#FFF",
          "& .MuiAlert-icon": { color: toastType === "success" ? "#34D399" : toastType === "error" ? "#F87171" : "#93C5FD" },
        }}>
          {toastMsg}
        </Alert>
      </Snackbar>

    </Box>
  );
}
