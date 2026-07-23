"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { motion } from "framer-motion";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { downloadBlob } from "@/lib/download-file";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

interface Payment {
  id: string;
  amount: number;
  shopPayout: number;
  status: "pending" | "paid" | "refunded" | "failed";
  paidAt: string | null;
  createdAt: string;
  slipUrl?: string | null;
  slipVerified?: boolean;
}

const STATUS_CHIP: Record<Payment["status"], { label: string; color: "success" | "warning" | "default" | "error" }> = {
  paid: { label: "โอนแล้ว", color: "success" },
  pending: { label: "รอโอน", color: "warning" },
  refunded: { label: "คืนเงิน", color: "default" },
  failed: { label: "ไม่สำเร็จ", color: "error" },
};

interface WalletBalance {
  available: number;
  totalEarned: number;
  totalWithdrawn: number;
  pending: number;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  adminNote: string | null;
  processedAt: string | null;
  createdAt: string;
}

const WITHDRAWAL_STATUS_CHIP: Record<WithdrawalRequest["status"], { label: string; color: "success" | "warning" | "info" | "error" }> = {
  pending: { label: "รอตรวจสอบ", color: "warning" },
  approved: { label: "อนุมัติแล้ว รอโอน", color: "info" },
  paid: { label: "โอนแล้ว", color: "success" },
  rejected: { label: "ถูกปฏิเสธ", color: "error" },
};

function formatThaiDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

export default function MerchantPayoutsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadWallet = async () => {
    try {
      const [balanceRes, withdrawalsRes] = await Promise.all([
        authFetch(`${API_BASE}/api/wallet/balance`),
        authFetch(`${API_BASE}/api/wallet/withdrawals`),
      ]);
      const balanceData = await balanceRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      if (!balanceRes.ok) throw new Error(balanceData.error ?? "โหลดยอดเงินใน wallet ไม่สำเร็จ");
      if (!withdrawalsRes.ok) throw new Error(withdrawalsData.error ?? "โหลดประวัติการถอนเงินไม่สำเร็จ");
      setWallet(balanceData);
      setWithdrawals(withdrawalsData);
    } catch (err) {
      setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดข้อมูล wallet ไม่สำเร็จ"));
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/api/payments`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "โหลดข้อมูลรายได้ไม่สำเร็จ");
        if (!cancelled) setPayments(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดข้อมูลรายได้ไม่สำเร็จ"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    loadWallet();
    return () => { cancelled = true; };
  }, []);

  const openWithdrawDialog = () => {
    setWithdrawError("");
    setWithdrawAmount(wallet && wallet.available > 0 ? String(wallet.available) : "");
    setWithdrawDialogOpen(true);
  };

  const submitWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) { setWithdrawError("กรุณาระบุจำนวนเงินที่ต้องการถอน"); return; }
    if (wallet && amount > wallet.available) { setWithdrawError(`ยอดที่ถอนได้สูงสุดคือ ฿${wallet.available.toLocaleString()}`); return; }

    setSubmitting(true);
    setWithdrawError("");
    try {
      const res = await authFetch(`${API_BASE}/api/wallet/withdrawals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ยื่นคำขอถอนเงินไม่สำเร็จ");
      setWithdrawDialogOpen(false);
      await loadWallet();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "ยื่นคำขอถอนเงินไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();
  const totalReceived = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.shopPayout, 0);
  const totalThisMonth = payments
    .filter((p) => p.status === "paid" && p.paidAt && new Date(p.paidAt).getMonth() === now.getMonth() && new Date(p.paidAt).getFullYear() === now.getFullYear())
    .reduce((sum, p) => sum + p.shopPayout, 0);
  const history = [...payments].sort((a, b) => new Date(b.paidAt ?? b.createdAt).getTime() - new Date(a.paidAt ?? a.createdAt).getTime());

  const downloadDoc = async (paymentId: string, doc: "receipt" | "invoice") => {
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/payments/${paymentId}/${doc}.pdf`);
      await downloadBlob(res, `${doc}-${paymentId.slice(0, 8)}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ดาวน์โหลดเอกสารไม่สำเร็จ");
    }
  };

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT, fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
        รายได้และการโอนเงิน
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#C5A55A" }} />
        </Box>
      ) : (
        <>
          {/* Summary cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
            <Card component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              sx={{ border: "1px solid #E5DFD6", borderRadius: "16px", boxShadow: "none", background: "linear-gradient(135deg, #1B2A4A, #2C3E6B)" }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <AccountBalanceWalletRoundedIcon sx={{ color: "#C5A55A", fontSize: 28, mb: 1 }} />
                <Typography sx={{ fontFamily: FONT, fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF" }}>
                  ฿{(wallet?.available ?? 0).toLocaleString()}
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  ยอดคงเหลือใน Wallet
                </Typography>
                <Button
                  size="small"
                  onClick={openWithdrawDialog}
                  disabled={!wallet || wallet.available <= 0}
                  sx={{
                    mt: 1.5, fontFamily: FONT, fontSize: "0.75rem", textTransform: "none",
                    bgcolor: "#C5A55A", color: "#1B2A4A", fontWeight: 700, borderRadius: "8px", px: 1.5,
                    "&:hover": { bgcolor: "#D4BA7A" },
                    "&.Mui-disabled": { bgcolor: "rgba(197,165,90,0.3)", color: "rgba(27,42,74,0.5)" },
                  }}
                >
                  ถอนเงิน
                </Button>
              </CardContent>
            </Card>
            <Card component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              sx={{ border: "1px solid #E5DFD6", borderRadius: "16px", boxShadow: "none" }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <TrendingUpRoundedIcon sx={{ color: "#10B981", fontSize: 28, mb: 1 }} />
                <Typography sx={{ fontFamily: FONT, fontSize: "1.5rem", fontWeight: 700, color: "#1B2A4A" }}>
                  ฿{totalThisMonth.toLocaleString()}
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6B7280" }}>
                  รายได้เดือนนี้
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", color: "#9CA3AF", mt: 0.25 }}>
                  ยอดรับแล้วทั้งหมด ฿{totalReceived.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Info */}
          <Box sx={{ bgcolor: "#FFF8E7", border: "1px solid #F0D080", borderRadius: "12px", p: 2, mb: 3, display: "flex", alignItems: "flex-start", gap: 1 }}>
            <EventRoundedIcon sx={{ color: "#92700A", fontSize: "1.1rem", mt: 0.2, flexShrink: 0 }} />
            <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: "#92700A" }}>
              ลูกค้าชำระเงินเข้าบัญชี LAYA ก่อน ยอดจะเข้า Wallet ร้านหลังหักค่าบริการแพลตฟอร์ม 5% — กด &quot;ถอนเงิน&quot; เมื่อต้องการรับเงินเข้าบัญชี แอดมินจะตรวจสอบและโอนให้
            </Typography>
          </Box>

          {/* Withdrawal history */}
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: "#1B2A4A", mb: 1.5 }}>
            ประวัติการถอนเงิน
          </Typography>
          {withdrawals.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3, color: "#9CA3AF" }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem" }}>ยังไม่มีคำขอถอนเงิน</Typography>
            </Box>
          ) : (
            <Card sx={{ border: "1px solid #E5DFD6", borderRadius: "16px", boxShadow: "none", mb: 3 }}>
              {withdrawals.map((w, i) => (
                <Box key={w.id}>
                  {i > 0 && <Divider sx={{ borderColor: "#F0EBE3" }} />}
                  <Box sx={{ px: 2.5, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.88rem", color: "#1B2A4A" }}>
                        #{w.id.slice(0, 8)}
                      </Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6B7280" }}>
                        {formatThaiDate(w.createdAt)}
                      </Typography>
                      {w.adminNote && (
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "#9CA3AF", mt: 0.25 }}>
                          {w.adminNote}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: "#1B2A4A" }}>
                        ฿{w.amount.toLocaleString()}
                      </Typography>
                      <Chip
                        label={WITHDRAWAL_STATUS_CHIP[w.status]?.label ?? w.status}
                        color={WITHDRAWAL_STATUS_CHIP[w.status]?.color ?? "default"}
                        size="small"
                        sx={{ fontFamily: FONT, fontSize: "0.68rem", height: 20 }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Card>
          )}

          {/* History */}
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: "#1B2A4A", mb: 1.5 }}>
            ประวัติรายรับ
          </Typography>
          {history.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, color: "#9CA3AF" }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem" }}>ยังไม่มีรายการ</Typography>
            </Box>
          ) : (
            <Card sx={{ border: "1px solid #E5DFD6", borderRadius: "16px", boxShadow: "none" }}>
              {history.map((p, i) => (
                <Box key={p.id}>
                  {i > 0 && <Divider sx={{ borderColor: "#F0EBE3" }} />}
                  <Box sx={{ px: 2.5, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.88rem", color: "#1B2A4A" }}>
                        #{p.id.slice(0, 8)}
                      </Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6B7280" }}>
                        {formatThaiDate(p.paidAt ?? p.createdAt)}
                      </Typography>
                      {p.status === "paid" && (
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5, alignItems: "center", flexWrap: "wrap" }}>
                          <Button size="small" onClick={() => downloadDoc(p.id, "receipt")}
                            sx={{ p: 0, minWidth: 0, fontFamily: FONT, fontSize: "0.7rem", color: "#C5A55A", textTransform: "none" }}>
                            ใบเสร็จ
                          </Button>
                          <Button size="small" onClick={() => downloadDoc(p.id, "invoice")}
                            sx={{ p: 0, minWidth: 0, fontFamily: FONT, fontSize: "0.7rem", color: "#C5A55A", textTransform: "none" }}>
                            Invoice
                          </Button>
                          {p.slipUrl && (
                            <Button size="small" component="a" href={p.slipUrl} target="_blank" rel="noopener noreferrer"
                              sx={{ p: 0, minWidth: 0, fontFamily: FONT, fontSize: "0.7rem", color: "#3B82F6", textTransform: "none" }}>
                              ดูสลิป
                            </Button>
                          )}
                          {p.slipUrl && !p.slipVerified && (
                            <Chip label="รอตรวจสอบ" size="small" sx={{ fontFamily: FONT, fontSize: "0.6rem", height: 16, bgcolor: "#FEF3C7", color: "#92700A" }} />
                          )}
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: "#1B2A4A" }}>
                        ฿{p.shopPayout.toLocaleString()}
                      </Typography>
                      <Chip
                        label={STATUS_CHIP[p.status]?.label ?? p.status}
                        color={STATUS_CHIP[p.status]?.color ?? "default"}
                        size="small"
                        sx={{ fontFamily: FONT, fontSize: "0.68rem", height: 20 }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Card>
          )}
        </>
      )}

      <Dialog open={withdrawDialogOpen} onClose={() => !submitting && setWithdrawDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, color: "#1B2A4A" }}>ถอนเงินจาก Wallet</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280", mb: 2 }}>
            ยอดถอนได้สูงสุด ฿{(wallet?.available ?? 0).toLocaleString()} — แอดมินจะตรวจสอบและโอนเข้าบัญชี/พร้อมเพย์ที่ตั้งค่าไว้ในหน้าตั้งค่าร้านค้า
          </Typography>
          {withdrawError && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>{withdrawError}</Alert>}
          <TextField
            label="จำนวนเงิน (บาท)"
            type="number"
            fullWidth
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={submitting}
            inputProps={{ min: 0, max: wallet?.available ?? 0, step: "0.01" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setWithdrawDialogOpen(false)} disabled={submitting} sx={{ fontFamily: FONT, textTransform: "none", color: "#6B7280" }}>
            ยกเลิก
          </Button>
          <Button
            onClick={submitWithdraw}
            disabled={submitting}
            variant="contained"
            sx={{ fontFamily: FONT, textTransform: "none", bgcolor: "#C5A55A", color: "#1B2A4A", fontWeight: 700, "&:hover": { bgcolor: "#D4BA7A" } }}
          >
            {submitting ? <CircularProgress size={18} sx={{ color: "#1B2A4A" }} /> : "ยืนยันการถอนเงิน"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
