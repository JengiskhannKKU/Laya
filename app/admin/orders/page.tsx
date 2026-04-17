"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

import { mockAdminOrders, AdminOrder } from "@/lib/mock-admin-data";

const statusStyles: Record<string, { label: string; color: string; bgcolor: string }> = {
  pending: { label: "รอยืนยัน", color: "#F59E0B", bgcolor: "rgba(245,158,11,0.15)" },
  paid: { label: "ยืนยันแล้ว", color: "#3B82F6", bgcolor: "rgba(59,130,246,0.15)" },
  producing: { label: "กำลังผลิต", color: "#8B5CF6", bgcolor: "rgba(139,92,246,0.15)" },
  shipped: { label: "จัดส่งแล้ว", color: "#06B6D4", bgcolor: "rgba(6,182,212,0.15)" },
  delivered: { label: "สำเร็จ", color: "#22C55E", bgcolor: "rgba(34,197,94,0.15)" },
  cancelled: { label: "ยกเลิก", color: "#EF4444", bgcolor: "rgba(239,68,68,0.15)" },
};

const paymentStyles: Record<string, { color: string }> = {
  paid: { color: "#22C55E" },
  pending: { color: "#F59E0B" },
  failed: { color: "#EF4444" },
  refunded: { color: "#9CA3AF" },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { mode, toggleMode, c } = useAdminTheme();
  const tr = "all 0.3s ease";

  const [orders, setOrders] = useState<AdminOrder[]>([...mockAdminOrders]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState("");

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, newStatus: AdminOrder["status"]) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
    setToastMsg(`อัปเดตสถานะ ${id} → ${statusStyles[newStatus]?.label || newStatus}`);
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const producingCount = orders.filter((o) => o.status === "producing" || o.status === "paid").length;
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
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: c.textPrimary, transition: tr }}>
            จัดการคำสั่งซื้อ
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"}>
            <IconButton onClick={toggleMode} sx={{ color: c.textSecondary, bgcolor: c.goldSubtle, width: 36, height: 36, "&:hover": { bgcolor: c.gold, color: c.textOnGold } }}>
              {mode === "dark" ? <LightModeRoundedIcon sx={{ fontSize: 20 }} /> : <DarkModeRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>
          <IconButton sx={{ color: c.textSecondary }}><NotificationsRoundedIcon sx={{ fontSize: 22 }} /></IconButton>
          <Avatar sx={{ width: 32, height: 32, bgcolor: c.gold, fontSize: "0.8rem", fontWeight: 700, color: c.textOnGold }}>A</Avatar>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
        {/* Quick Stats */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
          {[
            { label: "รอดำเนินการ", count: pendingCount, color: "#F59E0B" },
            { label: "กำลังผลิต", count: producingCount, color: "#8B5CF6" },
            { label: "จัดส่งแล้ว", count: shippedCount, color: "#06B6D4" },
          ].map((s) => (
            <Box key={s.label} sx={{ bgcolor: c.bgCard, borderRadius: "12px", p: 2, border: `1px solid ${c.borderCard}`, transition: tr }}>
              <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, transition: tr }}>{s.label}</Typography>
              <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: "1.6rem", color: s.color }}>{s.count}</Typography>
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
            <MenuItem value="paid">ยืนยันแล้ว</MenuItem>
            <MenuItem value="producing">กำลังผลิต</MenuItem>
            <MenuItem value="shipped">จัดส่งแล้ว</MenuItem>
            <MenuItem value="delivered">สำเร็จ</MenuItem>
            <MenuItem value="cancelled">ยกเลิก</MenuItem>
          </Select>
        </Box>

        {/* Orders Table */}
        <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, overflow: "hidden", transition: tr }}>
          <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "1.2fr 1.5fr 0.5fr 1fr 1fr 1fr 1.2fr", px: 3, py: 1.5, bgcolor: c.bgTableHeader, borderBottom: `1px solid ${c.borderCard}` }}>
            {["Order ID", "ลูกค้า", "Items", "ยอดรวม", "การชำระ", "สถานะ", "จัดการ"].map((h) => (
              <Typography key={h} sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
            ))}
          </Box>

          {filtered.map((order, idx) => {
            const sts = statusStyles[order.status] || statusStyles.pending;
            const pay = paymentStyles[order.paymentStatus] || paymentStyles.pending;
            return (
              <Box key={order.id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                sx={{
                  display: { xs: "flex", md: "grid" }, flexDirection: "column",
                  gridTemplateColumns: { md: "1.2fr 1.5fr 0.5fr 1fr 1fr 1fr 1.2fr" }, alignItems: "center",
                  px: 3, py: 2, borderBottom: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover }, gap: { xs: 1, md: 0 },
                }}
              >
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary, fontFamily: "monospace", transition: tr }}>{order.id}</Typography>
                <Box>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary, transition: tr }}>{order.customerName}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, transition: tr }}>{order.date} • {order.community}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, transition: tr }}>{order.items.length}</Typography>
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: c.gold }}>฿{order.total.toLocaleString()}</Typography>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: pay.color }}>{order.paymentStatus}</Typography>
                <Chip label={sts.label} size="small" sx={{ bgcolor: sts.bgcolor, color: sts.color, fontWeight: 700, fontSize: "0.7rem", height: 24 }} />
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Button size="small" onClick={() => router.push(`/admin/orders/${order.id}`)}
                    sx={{ fontSize: "0.75rem", color: c.gold, borderColor: `${c.gold}50`, textTransform: "none", borderRadius: "8px" }} variant="outlined">
                    รายละเอียด
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }} open={!!toastMsg} autoHideDuration={3000} onClose={() => setToastMsg("")} message={toastMsg} />
    </Box>
  );
}
