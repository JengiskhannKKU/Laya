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
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { downloadBlob } from "@/lib/download-file";

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
  kind: "cutting" | "weaving" | "product";
  trackingNo?: string;
  courier?: string;
  /** สถานะขนส่งละเอียด (เฉพาะ product order ที่ shipped แล้ว) */
  shippingStatus?: string | null;
}

/** สถานะขนส่งละเอียด + ขั้นถัดไปที่ร้านเลือกได้ (ตรงกับ SHIPPING_TRANSITIONS ฝั่ง backend) */
const SHIPPING_LABELS: Record<string, string> = {
  pending: "รอขนส่งเข้ารับ",
  picked_up: "ขนส่งรับพัสดุแล้ว",
  in_transit: "อยู่ระหว่างขนส่ง",
  delivered: "จัดส่งสำเร็จ",
  failed: "จัดส่งไม่สำเร็จ",
  returned: "พัสดุตีกลับ",
};
const SHIPPING_NEXT: Record<string, string[]> = {
  pending: ["picked_up", "failed"],
  picked_up: ["in_transit", "failed", "returned"],
  in_transit: ["delivered", "failed", "returned"],
  failed: ["picked_up", "in_transit", "returned"],
  delivered: [],
  returned: [],
};

const COURIERS = ["Kerry", "Flash", "ไปรษณีย์ไทย", "J&T", "อื่นๆ"];

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
const NEXT_ACTION: Record<string, { label: string; cutting: string; weaving: string; product: string } | undefined> = {
  pending: { label: "ยืนยันออเดอร์", cutting: "confirmed", weaving: "confirmed", product: "confirmed" },
  confirmed: { label: "เริ่มเตรียมสินค้า", cutting: "in_progress", weaving: "weaving", product: "in_progress" },
  in_progress: { label: "เตรียมเสร็จแล้ว", cutting: "ready", weaving: "ready", product: "ready" },
  ready: { label: "ส่งพัสดุ", cutting: "shipped", weaving: "shipped", product: "shipped" },
  shipped: { label: "จัดส่งสำเร็จ", cutting: "delivered", weaving: "delivered", product: "delivered" },
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
  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [selected, setSelected] = useState<UIOrder | null>(null);
  const [trackingNo, setTrackingNo] = useState("");
  const [courier, setCourier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [menuOrder, setMenuOrder] = useState<UIOrder | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [rejectTarget, setRejectTarget] = useState<UIOrder | null>(null);
  const [rejecting, setRejecting] = useState(false);
  // ── สถานะขนส่งละเอียด (product order ที่ shipped แล้ว) ──
  const [shippingTarget, setShippingTarget] = useState<UIOrder | null>(null);
  const [shippingChoice, setShippingChoice] = useState("");
  const [shippingNote, setShippingNote] = useState("");
  const [shippingSubmitting, setShippingSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!session?.access_token) { setLoading(false); return; }
    try {
      const [cutRes, weaveRes, productRes] = await Promise.all([
        authFetch(`${API_BASE}/api/orders`),
        authFetch(`${API_BASE}/api/weaving-orders`),
        authFetch(`${API_BASE}/api/product-orders`),
      ]);
      if (!cutRes.ok || !weaveRes.ok || !productRes.ok) throw new Error("โหลดรายการออเดอร์ไม่สำเร็จ");

      const cutting = (await cutRes.json()) as Record<string, unknown>[];
      const weaving = (await weaveRes.json()) as Record<string, unknown>[];
      const productOrders = (await productRes.json()) as Record<string, unknown>[];

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
          trackingNo: (o.trackingNo as string) ?? undefined,
          courier: (o.courier as string) ?? undefined,
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
          trackingNo: (o.trackingNo as string) ?? undefined,
          courier: (o.courier as string) ?? undefined,
        })),
        ...productOrders.map((o): UIOrder => {
          const items = (o.items as { productName: string; quantity: number }[]) ?? [];
          const addr = o.shippingAddress as { recipientName?: string } | undefined;
          return {
            id: String(o.id),
            displayId: `PRD-${String(o.id).slice(0, 8).toUpperCase()}`,
            customer: addr?.recipientName ?? "-",
            product: items.map((it) => `${it.productName} ×${it.quantity}`).join(", ") || "สินค้าพร้อมขาย",
            meters: null,
            amount: Number(o.total ?? 0),
            status: toUIStatus(String(o.status)),
            date: new Date(String(o.createdAt)).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }),
            kind: "product",
            trackingNo: (o.trackingNo as string) ?? undefined,
            courier: (o.courier as string) ?? undefined,
            shippingStatus: (o.shippingStatus as string | null) ?? null,
          };
        }),
      ].sort((a, b) => (a.date < b.date ? 1 : -1));

      setOrders(mapped);
    } catch (err) {
      setActionError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดรายการออเดอร์ไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSubmitAction = async () => {
    if (!selected) return;
    const action = NEXT_ACTION[selected.status];
    if (!action) return;

    if (!session?.access_token) return;

    setSubmitting(true);
    setActionError("");
    try {
      // product-orders ไม่มี endpoint /confirm แยก — ใช้ PATCH /status เสมอ
      const isConfirm = selected.status === "pending" && selected.kind !== "product";
      const base = selected.kind === "weaving" ? "weaving-orders" : selected.kind === "product" ? "product-orders" : "orders";
      const nextStatus = selected.kind === "weaving" ? action.weaving : selected.kind === "product" ? action.product : action.cutting;
      const isShipping = nextStatus === "shipped";

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
          body: JSON.stringify(
            isConfirm
              ? {}
              : {
                  status: nextStatus,
                  trackingNo: isShipping && trackingNo ? trackingNo : undefined,
                  courier: isShipping && courier ? courier : undefined,
                }
          ),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปเดตไม่สำเร็จ");

      await fetchOrders();
      setSelected(null);
      setTrackingNo("");
      setCourier("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "อัปเดตไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const orderBase = (kind: UIOrder["kind"]) => (kind === "weaving" ? "weaving-orders" : kind === "product" ? "product-orders" : "orders");

  const handleUpdateShipping = async () => {
    if (!shippingTarget || !shippingChoice || !session?.access_token) return;
    setShippingSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`${API_BASE}/api/product-orders/${shippingTarget.id}/shipping-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ shippingStatus: shippingChoice, note: shippingNote || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปเดตสถานะขนส่งไม่สำเร็จ");
      await fetchOrders();
      setShippingTarget(null);
      setShippingChoice("");
      setShippingNote("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "อัปเดตสถานะขนส่งไม่สำเร็จ");
    } finally {
      setShippingSubmitting(false);
    }
  };

  const printDoc = async (order: UIOrder, doc: "slip" | "packing-slip" | "shipping-label") => {
    setMenuAnchor(null);
    if (!session?.access_token) return;
    try {
      const res = await fetch(`${API_BASE}/api/${orderBase(order.kind)}/${order.id}/${doc}.pdf`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      await downloadBlob(res, `${doc}-${order.displayId}.pdf`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "ดาวน์โหลดเอกสารไม่สำเร็จ");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !session?.access_token) return;
    setRejecting(true);
    setActionError("");
    try {
      const res = await fetch(`${API_BASE}/api/${orderBase(rejectTarget.kind)}/${rejectTarget.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ status: "cancelled", note: "ร้านปฏิเสธออเดอร์" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ปฏิเสธออเดอร์ไม่สำเร็จ");
      await fetchOrders();
      setRejectTarget(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "ปฏิเสธออเดอร์ไม่สำเร็จ");
    } finally {
      setRejecting(false);
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
                        {order.kind === "product" && " · สินค้าพร้อมขาย"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                      <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem" }} />
                      <IconButton size="small" onClick={(e) => { setMenuOrder(order); setMenuAnchor(e.currentTarget); }} sx={{ color: "#6B7280" }}>
                        <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
                      ฿{order.amount.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {order.status === "pending" && (
                        <Button size="small" onClick={() => setRejectTarget(order)}
                          sx={{ color: "#EF4444", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none", fontSize: "0.78rem" }}
                        >
                          ปฏิเสธ
                        </Button>
                      )}
                      {order.kind === "product" && order.status === "shipped" && (SHIPPING_NEXT[order.shippingStatus ?? "pending"] ?? []).length > 0 && (
                        <Button size="small" variant="outlined"
                          onClick={() => { setShippingTarget(order); setShippingChoice(""); setShippingNote(""); }}
                          sx={{ borderColor: "#C5A55A", color: "#8E601C", borderRadius: "8px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none", fontSize: "0.78rem" }}
                        >
                          สถานะขนส่ง{order.shippingStatus ? `: ${SHIPPING_LABELS[order.shippingStatus] ?? order.shippingStatus}` : ""}
                        </Button>
                      )}
                      {action && (
                        <Button size="small" variant="contained" onClick={() => { setSelected(order); setTrackingNo(order.trackingNo ?? ""); setCourier(order.courier ?? ""); }}
                          sx={{ bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "8px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none", fontSize: "0.78rem" }}
                        >
                          {action.label}
                        </Button>
                      )}
                    </Box>
                    {order.trackingNo && !action && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocalShippingRoundedIcon sx={{ fontSize: 16, color: "#10B981" }} />
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#10B981" }}>
                          {order.courier ? `${order.courier} · ` : ""}{order.trackingNo}
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
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>บริษัทขนส่ง</InputLabel>
                    <Select
                      value={courier} label="บริษัทขนส่ง" onChange={(e) => setCourier(e.target.value)}
                      sx={{ borderRadius: "10px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5DFD6" } }}
                    >
                      {COURIERS.map((c) => (
                        <MenuItem key={c} value={c} sx={{ fontFamily: '"Kanit", sans-serif' }}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth label="เลขพัสดุ" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", "& fieldset": { borderColor: "#E5DFD6" }, "&.Mui-focused fieldset": { borderColor: "#C5A55A" } } }}
                  />
                </Box>
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

      {/* Print/download menu */}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => menuOrder && printDoc(menuOrder, "slip")} sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem" }}>
          พิมพ์ใบสั่งซื้อ
        </MenuItem>
        {menuOrder?.kind === "product" && (
          <MenuItem onClick={() => menuOrder && printDoc(menuOrder, "packing-slip")} sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem" }}>
            พิมพ์ใบแพ็คสินค้า
          </MenuItem>
        )}
        {menuOrder?.kind === "product" && (
          menuOrder.trackingNo && menuOrder.courier ? (
            <MenuItem onClick={() => menuOrder && printDoc(menuOrder, "shipping-label")} sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem" }}>
              พิมพ์ใบปะหน้า
            </MenuItem>
          ) : (
            <Tooltip title="ต้องระบุเลขพัสดุและบริษัทขนส่งก่อน" placement="left">
              <span>
                <MenuItem disabled sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem" }}>
                  พิมพ์ใบปะหน้า
                </MenuItem>
              </span>
            </Tooltip>
          )
        )}
      </Menu>

      {/* Shipping status dialog (product orders ที่ shipped แล้ว) */}
      <Dialog open={!!shippingTarget} onClose={() => !shippingSubmitting && setShippingTarget(null)} PaperProps={{ sx: { borderRadius: "20px", mx: 2, width: "100%" } }}>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>อัปเดตสถานะขนส่ง</DialogTitle>
        <DialogContent>
          {shippingTarget && (
            <>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 2 }}>
                {shippingTarget.displayId} · สถานะปัจจุบัน: {SHIPPING_LABELS[shippingTarget.shippingStatus ?? "pending"]}
              </Typography>
              <FormControl fullWidth sx={{ mt: 0.5 }}>
                <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>สถานะใหม่</InputLabel>
                <Select
                  value={shippingChoice} label="สถานะใหม่" onChange={(e) => setShippingChoice(e.target.value)}
                  sx={{ borderRadius: "10px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5DFD6" } }}
                >
                  {(SHIPPING_NEXT[shippingTarget.shippingStatus ?? "pending"] ?? []).map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontFamily: '"Kanit", sans-serif' }}>{SHIPPING_LABELS[s]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth label="หมายเหตุ (ไม่บังคับ)" value={shippingNote} onChange={(e) => setShippingNote(e.target.value)}
                sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: "10px", "& fieldset": { borderColor: "#E5DFD6" }, "&.Mui-focused fieldset": { borderColor: "#C5A55A" } } }}
              />
              {shippingChoice === "delivered" && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: "10px", fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem" }}>
                  เมื่อยืนยัน "จัดส่งสำเร็จ" ออเดอร์จะเปลี่ยนเป็นสถานะสำเร็จโดยอัตโนมัติ
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setShippingTarget(null)} disabled={shippingSubmitting} sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleUpdateShipping} disabled={shippingSubmitting || !shippingChoice}
            sx={{ bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "10px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
          >
            {shippingSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject confirm dialog */}
      <Dialog open={!!rejectTarget} onClose={() => !rejecting && setRejectTarget(null)} PaperProps={{ sx: { borderRadius: "20px", mx: 2, width: "100%" } }}>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>ปฏิเสธออเดอร์</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>
            {rejectTarget?.displayId} · {rejectTarget?.product} — ยืนยันปฏิเสธออเดอร์นี้ใช่ไหม? ลูกค้าจะได้รับการแจ้งเตือน และไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setRejectTarget(null)} disabled={rejecting} sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleReject} disabled={rejecting}
            sx={{ bgcolor: "#EF4444", color: "#FFFFFF", borderRadius: "10px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
          >
            {rejecting ? "กำลังบันทึก..." : "ปฏิเสธออเดอร์"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
