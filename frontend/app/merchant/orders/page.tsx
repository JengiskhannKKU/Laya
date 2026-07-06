"use client";

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Types ──────────────────────────────────────────────────────────────────────
interface UIOrder {
  id: string;
  displayId: string;
  customer: string;
  product: string;
  meters: number | null;
  amount: number;
  status: string; // pending | confirmed | in_progress | ready | shipped | delivered | cancelled
  date: string;
  kind: "cutting" | "weaving" | "mock";
  trackingNo?: string;
}

// ── Mock fallback (แสดงเมื่อยังไม่ได้ล็อกอินด้วยบัญชีจริง) ─────────────────────
const MOCK_ORDERS: UIOrder[] = [
  { id: "ORD-1042", displayId: "ORD-1042", customer: "สมชาย ใจดี", product: "ผ้าไหมมัดหมี่ ลายขอ", meters: 3, amount: 3200, status: "pending", date: "26 มิ.ย. 67", kind: "mock" },
  { id: "ORD-1041", displayId: "ORD-1041", customer: "มาลี สวย", product: "ผ้าขิดลายดอก", meters: 2, amount: 1800, status: "confirmed", date: "25 มิ.ย. 67", kind: "mock" },
  { id: "ORD-1040", displayId: "ORD-1040", customer: "อนันต์ รัก", product: "ผ้าทอมือลายน้ำ", meters: 5, amount: 4500, status: "shipped", date: "24 มิ.ย. 67", kind: "mock", trackingNo: "TH123456789" },
  { id: "ORD-1039", displayId: "ORD-1039", customer: "ประภา แก้ว", product: "ผ้าซิ่นลายขอ", meters: 4, amount: 2800, status: "delivered", date: "20 มิ.ย. 67", kind: "mock" },
];

const STATUS_CONFIG: Record<string, { label: string; color: "warning" | "info" | "success" | "default" | "error" | "secondary" }> = {
  pending: { label: "รอยืนยัน", color: "warning" },
  confirmed: { label: "ยืนยันแล้ว", color: "info" },
  in_progress: { label: "กำลังผลิต", color: "secondary" },
  ready: { label: "พร้อมจัดส่ง", color: "info" },
  shipped: { label: "จัดส่งแล้ว", color: "success" },
  delivered: { label: "สำเร็จ", color: "default" },
  cancelled: { label: "ยกเลิก", color: "error" },
};

/** action ถัดไปของแต่ละสถานะ → สถานะ API ที่จะส่ง */
const NEXT_ACTION: Record<string, { label: string; cutting: string; weaving: string } | undefined> = {
  pending: { label: "ยืนยันออเดอร์", cutting: "confirmed", weaving: "confirmed" },
  confirmed: { label: "เริ่มผลิต", cutting: "in_progress", weaving: "weaving" },
  in_progress: { label: "ผลิตเสร็จแล้ว", cutting: "ready", weaving: "ready" },
  ready: { label: "ส่งพัสดุ", cutting: "shipped", weaving: "shipped" },
  shipped: { label: "จัดส่งสำเร็จ", cutting: "delivered", weaving: "delivered" },
};

const TABS = ["ทั้งหมด", "รอยืนยัน", "กำลังผลิต", "จัดส่งแล้ว", "สำเร็จ"];
const TAB_STATUS: Record<number, string[] | null> = {
  0: null,
  1: ["pending"],
  2: ["confirmed", "in_progress", "ready"],
  3: ["shipped"],
  4: ["delivered"],
};

/** map สถานะจาก API → สถานะ UI */
function toUIStatus(apiStatus: string): string {
  if (apiStatus === "pending_confirm" || apiStatus === "draft") return "pending";
  if (apiStatus === "weaving") return "in_progress";
  return apiStatus;
}

export default function MerchantOrdersPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<UIOrder[]>(MOCK_ORDERS);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [selected, setSelected] = useState<UIOrder | null>(null);
  const [trackingNo, setTrackingNo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    const token = session?.access_token;
    if (!token) {
      setOrders(MOCK_ORDERS);
      setIsLive(false);
      setLoading(false);
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [cutRes, weaveRes] = await Promise.all([
        fetch(`${API_BASE}/api/orders`, { headers }),
        fetch(`${API_BASE}/api/weaving-orders`, { headers }),
      ]);
      if (!cutRes.ok || !weaveRes.ok) throw new Error("fetch failed");

      const cutting = (await cutRes.json()) as Record<string, unknown>[];
      const weaving = (await weaveRes.json()) as Record<string, unknown>[];

      const mapped: UIOrder[] = [
        ...cutting.map((o): UIOrder => ({
          id: String(o.id),
          displayId: `CUT-${String(o.id).slice(0, 8).toUpperCase()}`,
          customer: (o.customerName as string) ?? "-",
          product: (o.fabricName as string) ?? "ออเดอร์ตัดเย็บ",
          meters: o.fabricMetersUsed ? Number(o.fabricMetersUsed) : null,
          amount: Number(o.finalPrice ?? o.estimatedPrice ?? 0),
          status: toUIStatus(String(o.status)),
          date: new Date(String(o.createdAt)).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }),
          kind: "cutting",
        })),
        ...weaving.map((o): UIOrder => ({
          id: String(o.id),
          displayId: `WEV-${String(o.id).slice(0, 8).toUpperCase()}`,
          customer: (o.customerName as string) ?? "-",
          product: `ทอผ้า${o.patternName ?? ""}${o.colorName ? ` โทน${o.colorName}` : ""}`,
          meters: Number(o.metersRequested),
          amount: Number(o.finalPrice ?? o.estimatedPrice ?? 0),
          status: toUIStatus(String(o.status)),
          date: new Date(String(o.createdAt)).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }),
          kind: "weaving",
        })),
      ].sort((a, b) => (a.date < b.date ? 1 : -1));

      setOrders(mapped);
      setIsLive(true);
    } catch {
      // Backend ยังไม่รัน หรือบัญชีนี้ไม่ใช่ merchant — ใช้ข้อมูลตัวอย่าง
      setOrders(MOCK_ORDERS);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSubmitAction = async () => {
    if (!selected) return;
    const action = NEXT_ACTION[selected.status];
    if (!action) return;

    // Demo mode: อัปเดตเฉพาะใน state
    if (selected.kind === "mock" || !session?.access_token) {
      const next = action.cutting === "in_progress" ? "in_progress" : action.cutting;
      setOrders((prev) => prev.map((o) => (o.id === selected.id ? { ...o, status: next, trackingNo: trackingNo || o.trackingNo } : o)));
      setSelected(null);
      setTrackingNo("");
      return;
    }

    setSubmitting(true);
    setActionError("");
    try {
      const isConfirm = selected.status === "pending";
      const base = selected.kind === "weaving" ? "weaving-orders" : "orders";
      const nextStatus = selected.kind === "weaving" ? action.weaving : action.cutting;
      const note = nextStatus === "shipped" && trackingNo ? `เลขพัสดุ: ${trackingNo}` : undefined;

      const res = await fetch(
        isConfirm
          ? `${API_BASE}/api/${base}/${selected.id}/confirm`
          : `${API_BASE}/api/${base}/${selected.id}/status`,
        {
          method: isConfirm ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(isConfirm ? { note } : { status: nextStatus, note }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปเดตไม่สำเร็จ");

      await fetchOrders();
      setSelected(null);
      setTrackingNo("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "อัปเดตไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = orders.filter((o) => {
    const tabStatuses = TAB_STATUS[tab];
    if (tabStatuses && !tabStatuses.includes(o.status)) return false;
    if (search && !o.displayId.toLowerCase().includes(search.toLowerCase()) && !o.customer.includes(search)) return false;
    return true;
  });

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
        จัดการออเดอร์
      </Typography>

      {!isLive && !loading && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem" }}>
          กำลังแสดงข้อมูลตัวอย่าง — ล็อกอินด้วยบัญชีร้านค้า (และรัน backend) เพื่อจัดการออเดอร์จริง
        </Alert>
      )}
      {actionError && (
        <Alert severity="error" onClose={() => setActionError("")} sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem" }}>
          {actionError}
        </Alert>
      )}

      <TextField
        fullWidth placeholder="ค้นหา รหัสออเดอร์ หรือ ชื่อลูกค้า"
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#9CA3AF" }} /></InputAdornment> }}
        sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: "12px", "& fieldset": { borderColor: "#E5DFD6" } } }}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
        sx={{ mb: 2, "& .MuiTab-root": { fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", minWidth: "auto", textTransform: "none" }, "& .Mui-selected": { color: "#1B2A4A", fontWeight: 600 }, "& .MuiTabs-indicator": { bgcolor: "#C5A55A" } }}
      >
        {TABS.map((t) => <Tab key={t} label={t} />)}
      </Tabs>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress size={32} sx={{ color: "#C5A55A" }} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const action = NEXT_ACTION[order.status];
            return (
              <Card key={order.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none" }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", fontSize: "0.9rem" }}>
                        {order.displayId} · {order.customer}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.78rem" }}>
                        {order.product}{order.meters ? ` · ${order.meters} เมตร` : ""} · {order.date}
                        {order.kind === "weaving" && " · สั่งทอ"}
                      </Typography>
                    </Box>
                    <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem" }} />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
                      ฿{order.amount.toLocaleString()}
                    </Typography>
                    {action && (
                      <Button size="small" variant="contained" onClick={() => { setSelected(order); setTrackingNo(order.trackingNo ?? ""); }}
                        sx={{ bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "8px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none", fontSize: "0.78rem" }}
                      >
                        {action.label}
                      </Button>
                    )}
                    {order.trackingNo && !action && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocalShippingRoundedIcon sx={{ fontSize: 16, color: "#10B981" }} />
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#10B981" }}>
                          {order.trackingNo}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#9CA3AF" }}>ไม่พบออเดอร์</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Action Dialog */}
      <Dialog open={!!selected} onClose={() => !submitting && setSelected(null)} PaperProps={{ sx: { borderRadius: "20px", mx: 2, width: "100%" } }}>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
          {selected ? NEXT_ACTION[selected.status]?.label : ""}
        </DialogTitle>
        <DialogContent>
          {selected && (
            <>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 2 }}>
                {selected.displayId} · {selected.product} · ฿{selected.amount.toLocaleString()}
              </Typography>
              {selected.status === "pending" && (
                <Alert severity="info" sx={{ borderRadius: "10px", fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", mb: 1 }}>
                  เมื่อยืนยันแล้ว ลูกค้าจะได้รับการแจ้งเตือนและออเดอร์จะเริ่มดำเนินการ
                </Alert>
              )}
              {selected.status === "ready" && (
                <TextField
                  fullWidth label="เลขพัสดุ" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)}
                  sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: "10px", "& fieldset": { borderColor: "#E5DFD6" }, "&.Mui-focused fieldset": { borderColor: "#C5A55A" } } }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setSelected(null)} disabled={submitting} sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSubmitAction} disabled={submitting}
            sx={{ bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "10px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
          >
            {submitting ? "กำลังบันทึก..." : "ยืนยัน"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
