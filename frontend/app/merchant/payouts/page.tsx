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
}

const STATUS_CHIP: Record<Payment["status"], { label: string; color: "success" | "warning" | "default" | "error" }> = {
  paid: { label: "โอนแล้ว", color: "success" },
  pending: { label: "รอโอน", color: "warning" },
  refunded: { label: "คืนเงิน", color: "default" },
  failed: { label: "ไม่สำเร็จ", color: "error" },
};

function formatThaiDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

export default function MerchantPayoutsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    return () => { cancelled = true; };
  }, []);

  const now = new Date();
  const pending = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.shopPayout, 0);
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
                  ฿{pending.toLocaleString()}
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  รอโอนเงินรอบถัดไป
                </Typography>
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
              LAYA โอนเงินทุกวันที่ 1 และ 20 ของเดือน หลังหักค่าบริการแพลตฟอร์ม 5%
            </Typography>
          </Box>

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
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                          <Button size="small" onClick={() => downloadDoc(p.id, "receipt")}
                            sx={{ p: 0, minWidth: 0, fontFamily: FONT, fontSize: "0.7rem", color: "#C5A55A", textTransform: "none" }}>
                            ใบเสร็จ
                          </Button>
                          <Button size="small" onClick={() => downloadDoc(p.id, "invoice")}
                            sx={{ p: 0, minWidth: 0, fontFamily: FONT, fontSize: "0.7rem", color: "#C5A55A", textTransform: "none" }}>
                            Invoice
                          </Button>
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
    </Box>
  );
}
