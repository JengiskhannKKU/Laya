"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { motion } from "framer-motion";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import { useAdminTheme } from "@/lib/admin-theme-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import RoleGuard from "@/components/auth/RoleGuard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

type WithdrawalStatus = "pending" | "approved" | "rejected" | "paid";

interface WithdrawalRequest {
  id: string;
  shopId: string;
  shopName: string;
  amount: number;
  status: WithdrawalStatus;
  payoutBankName: string | null;
  payoutBankAccountNo: string | null;
  payoutBankAccountName: string | null;
  payoutPromptpayId: string | null;
  adminNote: string | null;
  processedAt: string | null;
  createdAt: string;
}

const STATUS_CHIP: Record<WithdrawalStatus, { label: string; color: "success" | "warning" | "info" | "error" }> = {
  pending: { label: "รอตรวจสอบ", color: "warning" },
  approved: { label: "อนุมัติแล้ว รอโอน", color: "info" },
  paid: { label: "โอนแล้ว", color: "success" },
  rejected: { label: "ถูกปฏิเสธ", color: "error" },
};

const TABS: { value: "all" | WithdrawalStatus; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: "รอตรวจสอบ" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "paid", label: "โอนแล้ว" },
  { value: "rejected", label: "ถูกปฏิเสธ" },
];

function formatThaiDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

function payoutDestination(w: WithdrawalRequest): string {
  if (w.payoutBankAccountNo) {
    return `${w.payoutBankName ?? "ธนาคาร"} ${w.payoutBankAccountNo} (${w.payoutBankAccountName ?? "-"})`;
  }
  if (w.payoutPromptpayId) return `พร้อมเพย์ ${w.payoutPromptpayId}`;
  return "ไม่มีข้อมูลบัญชีรับเงิน";
}

export default function AdminWithdrawalsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminWithdrawalsContent />
    </RoleGuard>
  );
}

function AdminWithdrawalsContent() {
  const { c } = useAdminTheme();
  const [tab, setTab] = useState<"all" | WithdrawalStatus>("pending");
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<WithdrawalRequest | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/withdrawals`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดคำขอถอนเงินไม่สำเร็จ");
      setWithdrawals(data);
    } catch (err) {
      setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดคำขอถอนเงินไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runAction = async (id: string, action: "approve" | "reject" | "paid", note?: string) => {
    setActioningId(id);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/admin/withdrawals/${id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note !== undefined ? { note } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "อัปเดตสถานะไม่สำเร็จ");
      await load();
      setRejectTarget(null);
      setRejectNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  };

  const filtered = tab === "all" ? withdrawals : withdrawals.filter((w) => w.status === tab);
  const card = { bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, transition: "all 0.3s ease" };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <PaymentsRoundedIcon sx={{ fontSize: 20, color: c.gold }} />
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
          คำขอถอนเงิน
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>{error}</Alert>}

      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { fontFamily: FONT, textTransform: "none", minHeight: 36, fontSize: "0.85rem" } }}
      >
        {TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: c.gold }} /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ ...card, p: 4, textAlign: "center" }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: c.textMuted }}>ไม่มีคำขอในหมวดนี้</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.map((w) => (
            <Box key={w.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} sx={{ ...card, p: 2.5 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary }}>
                      {w.shopName}
                    </Typography>
                    <Chip label={STATUS_CHIP[w.status].label} color={STATUS_CHIP[w.status].color} size="small" sx={{ fontSize: "0.68rem", height: 20 }} />
                  </Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: c.textMuted }}>
                    #{w.id.slice(0, 8)} • ยื่นเมื่อ {formatThaiDate(w.createdAt)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
                    <AccountBalanceRoundedIcon sx={{ fontSize: 16, color: c.textMuted }} />
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: c.textSecondary }}>
                      {payoutDestination(w)}
                    </Typography>
                  </Box>
                  {w.adminNote && (
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: c.textMuted, mt: 0.5 }}>
                      หมายเหตุ: {w.adminNote}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ textAlign: "right", minWidth: 140 }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.2rem", color: c.gold }}>
                    ฿{w.amount.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    {w.status === "pending" && (
                      <>
                        <Button
                          size="small" startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                          disabled={actioningId === w.id}
                          onClick={() => runAction(w.id, "approve")}
                          sx={{ color: "#22C55E", fontWeight: 700, fontSize: "0.75rem", textTransform: "none" }}
                        >
                          อนุมัติ
                        </Button>
                        <Button
                          size="small" startIcon={<CancelRoundedIcon sx={{ fontSize: 16 }} />}
                          disabled={actioningId === w.id}
                          onClick={() => { setRejectTarget(w); setRejectNote(""); }}
                          sx={{ color: "#EF4444", fontWeight: 700, fontSize: "0.75rem", textTransform: "none" }}
                        >
                          ปฏิเสธ
                        </Button>
                      </>
                    )}
                    {w.status === "approved" && (
                      <Button
                        size="small" startIcon={<PaymentsRoundedIcon sx={{ fontSize: 16 }} />}
                        disabled={actioningId === w.id}
                        onClick={() => runAction(w.id, "paid")}
                        sx={{ color: c.gold, fontWeight: 700, fontSize: "0.75rem", textTransform: "none" }}
                      >
                        มาร์คว่าโอนแล้ว
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700 }}>ปฏิเสธคำขอถอนเงิน</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280", mb: 2 }}>
            กรุณาระบุเหตุผลที่ปฏิเสธคำขอของร้าน {rejectTarget?.shopName} (ร้านจะเห็นข้อความนี้)
          </Typography>
          <TextField
            label="เหตุผล" fullWidth multiline minRows={2}
            value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRejectTarget(null)} sx={{ fontFamily: FONT, textTransform: "none" }}>ยกเลิก</Button>
          <Button
            variant="contained" color="error"
            disabled={!rejectNote || actioningId === rejectTarget?.id}
            onClick={() => rejectTarget && runAction(rejectTarget.id, "reject", rejectNote)}
            sx={{ fontFamily: FONT, textTransform: "none" }}
          >
            ยืนยันปฏิเสธ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
