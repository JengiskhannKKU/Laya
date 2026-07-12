"use client";

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface UIOrder {
  id: string;
  displayId: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  date: string;
  kind: "cutting" | "weaving" | "product";
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgcolor: string }> = {
  pending: { label: "รอยืนยัน", color: "#F59E0B", bgcolor: "rgba(245,158,11,0.15)" },
  confirmed: { label: "ยืนยันแล้ว", color: "#3B82F6", bgcolor: "rgba(59,130,246,0.15)" },
  in_progress: { label: "กำลังผลิต", color: "#8B5CF6", bgcolor: "rgba(139,92,246,0.15)" },
  ready: { label: "พร้อมจัดส่ง", color: "#06B6D4", bgcolor: "rgba(6,182,212,0.15)" },
  shipped: { label: "จัดส่งแล้ว", color: "#06B6D4", bgcolor: "rgba(6,182,212,0.15)" },
  delivered: { label: "สำเร็จ", color: "#22C55E", bgcolor: "rgba(34,197,94,0.15)" },
  cancelled: { label: "ยกเลิก", color: "#EF4444", bgcolor: "rgba(239,68,68,0.15)" },
};

const KIND_LABEL: Record<string, string> = { cutting: "ตัดผ้า", weaving: "ทอผ้า", product: "สินค้า" };

function toUIStatus(apiStatus: string): string {
  if (apiStatus === "pending_confirm" || apiStatus === "draft") return "pending";
  if (apiStatus === "weaving") return "in_progress";
  return apiStatus;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { mode, toggleMode, c } = useAdminTheme();
  const tr = "all 0.3s ease";

  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [cutRes, weaveRes, productRes] = await Promise.all([
        authFetch(`${API_BASE}/api/orders`),
        authFetch(`${API_BASE}/api/weaving-orders`),
        authFetch(`${API_BASE}/api/product-orders`),
      ]);
      if (!cutRes.ok || !weaveRes.ok || !productRes.ok) throw new Error("โหลดรายการคำสั่งซื้อไม่สำเร็จ");

      const cutting = (await cutRes.json()) as Record<string, unknown>[];
      const weaving = (await weaveRes.json()) as Record<string, unknown>[];
      const productOrders = (await productRes.json()) as Record<string, unknown>[];

      const mapped: UIOrder[] = [
        ...cutting.map((o): UIOrder => ({
          id: String(o.id),
          displayId: `CUT-${String(o.id).slice(0, 8).toUpperCase()}`,
          customer: (o.customerName as string) ?? "-",
          product: (o.fabricName as string) ?? "ออเดอร์ตัดเย็บ",
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
          amount: Number(o.finalPrice ?? o.estimatedPrice ?? 0),
          status: toUIStatus(String(o.status)),
          date: new Date(String(o.createdAt)).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }),
          kind: "weaving",
        })),
        ...productOrders.map((o): UIOrder => {
          const items = (o.items as { productName: string; quantity: number }[]) ?? [];
          const addr = o.shippingAddress as { recipientName?: string } | undefined;
          return {
            id: String(o.id),
            displayId: `PRD-${String(o.id).slice(0, 8).toUpperCase()}`,
            customer: addr?.recipientName ?? "-",
            product: items.length ? `${items[0].productName}${items.length > 1 ? ` +${items.length - 1}` : ""}` : "สินค้า",
            amount: Number(o.totalAmount ?? 0),
            status: toUIStatus(String(o.status)),
            date: new Date(String(o.createdAt)).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }),
            kind: "product",
          };
        }),
      ].sort((a, b) => (a.date < b.date ? 1 : -1));

      setOrders(mapped);
      setError("");
    } catch (err) {
      setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดรายการคำสั่งซื้อไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || o.displayId.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const producingCount = orders.filter((o) => o.status === "confirmed" || o.status === "in_progress" || o.status === "ready").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Bar */}
      <Box sx={{
        px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
        bgcolor: c.bgTopbar, borderBottom: `1px solid ${c.borderCard}`,
        position: "sticky", top: 0, zIndex: 50, transition: tr,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.push("/admin")} sx={{ color: c.textPrimary }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: c.textPrimary, transition: tr }}>
            คำสั่งซื้อทั้งหมด
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"}>
            <IconButton onClick={toggleMode} sx={{ color: c.textSecondary, bgcolor: c.goldSubtle, width: 36, height: 36, "&:hover": { bgcolor: c.gold, color: c.textOnGold } }}>
              {mode === "dark" ? <LightModeRoundedIcon sx={{ fontSize: 20 }} /> : <DarkModeRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>
          <Avatar sx={{ width: 32, height: 32, bgcolor: c.gold, fontSize: "0.8rem", fontWeight: 700, color: c.textOnGold }}>A</Avatar>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Quick Stats */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
          {[
            { label: "รอดำเนินการ", count: pendingCount, color: "#F59E0B" },
            { label: "กำลังผลิต", count: producingCount, color: "#8B5CF6" },
            { label: "จัดส่งแล้ว", count: shippedCount, color: "#06B6D4" },
          ].map((s) => (
            <Box key={s.label} sx={{ bgcolor: c.bgCard, borderRadius: "12px", p: 2, border: `1px solid ${c.borderCard}`, transition: tr }}>
              <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, transition: tr }}>{s.label}</Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.6rem", color: s.color }}>{s.count}</Typography>
            </Box>
          ))}
        </Box>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 200, bgcolor: c.bgInputField, borderRadius: "10px", px: 1.5, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, transition: tr }}>
            <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
            <TextField fullWidth variant="standard" placeholder="ค้นหา Order ID / ชื่อลูกค้า..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{ "& input": { color: c.textPrimary, fontSize: "0.85rem", py: 1 } }}
            />
          </Box>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small"
            sx={{
              minWidth: 150, bgcolor: c.bgInputField, color: c.textPrimary, borderRadius: "10px",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: c.borderInput },
              "& .MuiSvgIcon-root": { color: c.textMuted },
              transition: tr,
            }}
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="pending">รอยืนยัน</MenuItem>
            <MenuItem value="confirmed">ยืนยันแล้ว</MenuItem>
            <MenuItem value="in_progress">กำลังผลิต</MenuItem>
            <MenuItem value="ready">พร้อมจัดส่ง</MenuItem>
            <MenuItem value="shipped">จัดส่งแล้ว</MenuItem>
            <MenuItem value="delivered">สำเร็จ</MenuItem>
            <MenuItem value="cancelled">ยกเลิก</MenuItem>
          </Select>
        </Box>

        {/* Orders Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: c.gold }} /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, py: 6, textAlign: "center" }}>
            <Typography sx={{ fontSize: "0.85rem", color: c.textMuted }}>ไม่พบคำสั่งซื้อ</Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, overflow: "hidden", transition: tr }}>
            <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr 1fr 1fr", px: 3, py: 1.5, bgcolor: c.bgTableHeader, borderBottom: `1px solid ${c.borderCard}` }}>
              {["Order ID", "ลูกค้า", "สินค้า", "ประเภท", "ยอดรวม", "สถานะ"].map((h) => (
                <Typography key={h} sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
              ))}
            </Box>

            {filtered.map((order, idx) => {
              const sts = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <Box key={order.id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                  sx={{
                    display: { xs: "flex", md: "grid" }, flexDirection: "column",
                    gridTemplateColumns: { md: "1.2fr 1.5fr 1fr 1fr 1fr 1fr" }, alignItems: "center",
                    px: 3, py: 2, borderBottom: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover }, gap: { xs: 0.5, md: 0 },
                  }}
                >
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary, fontFamily: "monospace", transition: tr }}>{order.displayId}</Typography>
                  <Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary, transition: tr }}>{order.customer}</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, transition: tr }}>{order.date}</Typography>
                  </Box>
                  <Typography noWrap sx={{ fontSize: "0.8rem", color: c.textSecondary, transition: tr, maxWidth: { md: 160 } }}>{order.product}</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>{KIND_LABEL[order.kind]}</Typography>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: c.gold }}>฿{order.amount.toLocaleString()}</Typography>
                  <Chip label={sts.label} size="small" sx={{ bgcolor: sts.bgcolor, color: sts.color, fontWeight: 700, fontSize: "0.7rem", height: 24, width: "fit-content" }} />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
