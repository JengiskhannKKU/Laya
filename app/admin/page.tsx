"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

const navItems = [
  { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/admin" },
  { label: "Products", icon: <Inventory2RoundedIcon />, path: "/admin/products" },
  { label: "Orders", icon: <ShoppingCartRoundedIcon />, path: "/admin/orders" },
  { label: "Weavers", icon: <PeopleRoundedIcon />, path: "/admin/weavers" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mode, toggleMode, c } = useAdminTheme();

  const t = "all 0.3s ease"; // transition shorthand

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Sidebar ── */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== "undefined") && (
          <>
            {sidebarOpen && (
              <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                sx={{ position: "fixed", inset: 0, bgcolor: c.sidebarOverlay, zIndex: 998, display: { md: "none" } }}
              />
            )}
            <Box
              component={motion.aside}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              sx={{
                width: 260,
                bgcolor: c.bgSidebar,
                display: { xs: sidebarOpen ? "flex" : "none", md: "flex" },
                flexDirection: "column",
                position: { xs: "fixed", md: "sticky" },
                top: 0, left: 0, height: "100vh", zIndex: 999,
                borderRight: `1px solid ${c.borderCard}`,
                overflowY: "auto",
                transition: t,
              }}
            >
              {/* Brand */}
              <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: "10px",
                    background: "linear-gradient(145deg, #C5A55A, #D4BA7A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: "1rem", color: "#FFFFFF" }}>L</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: "1.1rem", color: c.textPrimary, letterSpacing: 2, transition: t }}>
                      LAYA
                    </Typography>
                    <Typography sx={{ fontSize: "0.6rem", color: c.textMuted, letterSpacing: 1, transition: t }}>
                      ADMIN PANEL
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setSidebarOpen(false)} sx={{ color: c.textMuted, display: { md: "none" } }}>
                  <CloseRoundedIcon />
                </IconButton>
              </Box>

              <Divider sx={{ borderColor: c.borderDivider, mx: 2 }} />

              {/* Nav Items */}
              <Box sx={{ px: 2, pt: 3, flex: 1 }}>
                <Typography sx={{ px: 1, mb: 1.5, fontSize: "0.65rem", color: c.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", transition: t }}>
                  เมนูหลัก
                </Typography>
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Box
                      key={item.path}
                      component={motion.div}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { router.push(item.path); setSidebarOpen(false); }}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.2, mb: 0.5,
                        borderRadius: "10px", cursor: "pointer",
                        bgcolor: isActive ? c.goldSubtle : "transparent",
                        color: isActive ? c.gold : c.textSecondary,
                        transition: t,
                        "&:hover": {
                          bgcolor: isActive ? c.goldSubtle : c.bgCardHover,
                          color: isActive ? c.gold : c.textPrimary,
                        },
                        "& .MuiSvgIcon-root": { fontSize: 20 },
                      }}
                    >
                      {item.icon}
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: isActive ? 700 : 500 }}>{item.label}</Typography>
                      {isActive && <Box sx={{ ml: "auto", width: 6, height: 6, borderRadius: "50%", bgcolor: c.gold }} />}
                    </Box>
                  );
                })}
              </Box>

              {/* Bottom */}
              <Box sx={{ px: 2, pb: 3 }}>
                <Divider sx={{ borderColor: c.borderDivider, mb: 2 }} />
                <Box
                  onClick={() => router.push("/")}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, borderRadius: "10px",
                    cursor: "pointer", color: c.textMuted, transition: t,
                    "&:hover": { bgcolor: c.bgCardHover, color: c.textPrimary },
                    "& .MuiSvgIcon-root": { fontSize: 20 },
                  }}
                >
                  <HomeRoundedIcon />
                  <Typography sx={{ fontSize: "0.85rem" }}>กลับหน้าหลัก</Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top Bar */}
        <Box sx={{
          px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
          bgcolor: c.bgTopbar, borderBottom: `1px solid ${c.borderCard}`,
          position: "sticky", top: 0, zIndex: 50, transition: t,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => setSidebarOpen(true)} sx={{ color: c.textPrimary, display: { md: "none" } }}>
              <MenuRoundedIcon />
            </IconButton>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: c.textPrimary, transition: t }}>
              Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Theme Toggle */}
            <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"}>
              <IconButton
                onClick={toggleMode}
                sx={{
                  color: c.textSecondary,
                  bgcolor: c.goldSubtle,
                  width: 36, height: 36,
                  transition: t,
                  "&:hover": { bgcolor: c.gold, color: c.textOnGold },
                }}
              >
                {mode === "dark" ? <LightModeRoundedIcon sx={{ fontSize: 20 }} /> : <DarkModeRoundedIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>
            <IconButton sx={{ color: c.textSecondary }}>
              <NotificationsRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Avatar sx={{ width: 32, height: 32, bgcolor: c.gold, fontSize: "0.8rem", fontWeight: 700, color: c.textOnGold }}>A</Avatar>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          <AdminDashboardContent />
        </Box>
      </Box>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════
// Dashboard Content (Charts + KPIs)
// ════════════════════════════════════════════════════════════════
import {
  mockKPIs, mockDailyRevenue, mockMonthlyRevenue,
  mockCategoryRevenue, mockPaymentMix,
  mockTopProducts, mockTopWeavers, mockAIUsage,
} from "@/lib/mock-admin-data";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

function AdminDashboardContent() {
  const [revenueView, setRevenueView] = useState<"daily" | "monthly">("daily");
  const { c } = useAdminTheme();
  const t = "all 0.3s ease";

  return (
    <Box>
      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr", md: "repeat(6, 1fr)" }, gap: 2, mb: 3 }}>
        {mockKPIs.map((kpi) => (
          <Box
            key={kpi.label}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ bgcolor: c.bgCard, borderRadius: "14px", p: 2.5, border: `1px solid ${c.borderCard}`, transition: t }}
          >
            <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, mb: 1, transition: t }}>{kpi.label}</Typography>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: "1.4rem", color: c.textPrimary, mb: 0.5, transition: t }}>{kpi.value}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {kpi.trend === "up" ? <TrendingUpRoundedIcon sx={{ fontSize: 14, color: "#22C55E" }} /> : <TrendingDownRoundedIcon sx={{ fontSize: 14, color: "#EF4444" }} />}
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: kpi.trend === "up" ? "#22C55E" : "#EF4444" }}>
                {kpi.change > 0 ? "+" : ""}{kpi.change}%
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Revenue + Category */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2, mb: 3 }}>
        <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: t }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, transition: t }}>
              รายรับ (Revenue)
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {(["daily", "monthly"] as const).map((v) => (
                <Box key={v} onClick={() => setRevenueView(v)}
                  sx={{
                    px: 2, py: 0.5, borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                    bgcolor: revenueView === v ? c.goldSubtle : "transparent",
                    color: revenueView === v ? c.gold : c.textMuted,
                    transition: t,
                  }}
                >
                  {v === "daily" ? "รายวัน" : "รายเดือน"}
                </Box>
              ))}
            </Box>
          </Box>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueView === "daily" ? mockDailyRevenue : mockMonthlyRevenue.map(d => ({ date: d.month, revenue: d.revenue }))}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A55A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C5A55A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
              <XAxis dataKey="date" tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} formatter={(value: number) => [`฿${value.toLocaleString()}`, "รายรับ"]} />
              <Area type="monotone" dataKey="revenue" stroke="#C5A55A" fill="url(#revGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        {/* Category Pie */}
        <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: t }}>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 2, transition: t }}>
            สัดส่วนประเภทสินค้า
          </Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={mockCategoryRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {mockCategoryRevenue.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend verticalAlign="bottom" formatter={(value: string) => <span style={{ color: c.legendText, fontSize: 11 }}>{value}</span>} />
              <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} formatter={(value: number) => [`${value}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* AI Usage & Payment Mix */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
        <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: t }}>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 2, transition: t }}>AI Pattern Generation</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockAIUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
              <XAxis dataKey="date" tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} />
              <Bar dataKey="generations" fill="#C5A55A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: t }}>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 2, transition: t }}>สัดส่วนช่องทางชำระเงิน</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={mockPaymentMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                {mockPaymentMix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend verticalAlign="bottom" formatter={(value: string) => <span style={{ color: c.legendText, fontSize: 11 }}>{value}</span>} />
              <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} formatter={(value: number) => [`${value}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Top Products & Top Weavers */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
        <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: t }}>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 2, transition: t }}>สินค้าขายดี</Typography>
          {mockTopProducts.map((p, i) => (
            <Box key={p.id} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, borderBottom: i < mockTopProducts.length - 1 ? `1px solid ${c.borderCard}` : "none" }}>
              <Typography sx={{ color: c.textMuted, fontWeight: 700, fontSize: "0.9rem", width: 20 }}>{i + 1}</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: "8px", overflow: "hidden", bgcolor: c.bgStatBox, position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary, transition: t }}>{p.name}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, transition: t }}>{p.community}</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.gold }}>฿{(p.revenue / 1000).toFixed(0)}k</Typography>
                <Typography sx={{ fontSize: "0.65rem", color: c.textMuted, transition: t }}>{p.unitsSold} sold</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: t }}>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 2, transition: t }}>ช่างทอยอดเยี่ยม</Typography>
          {mockTopWeavers.map((w, i) => (
            <Box key={w.id} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, borderBottom: i < mockTopWeavers.length - 1 ? `1px solid ${c.borderCard}` : "none" }}>
              <Typography sx={{ color: c.textMuted, fontWeight: 700, fontSize: "0.9rem", width: 20 }}>{i + 1}</Typography>
              <Avatar sx={{ width: 36, height: 36, bgcolor: i === 0 ? c.gold : c.bgStatBox, fontSize: "0.85rem", fontWeight: 700, color: i === 0 ? c.textOnGold : c.textPrimary }}>{w.avatar}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary, transition: t }}>{w.name}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, transition: t }}>{w.province} • ⭐ {w.rating}</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.gold }}>฿{(w.revenue / 1000).toFixed(0)}k</Typography>
                <Typography sx={{ fontSize: "0.65rem", color: c.textMuted, transition: t }}>{w.completionRate}% complete</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
