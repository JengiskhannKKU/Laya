"use client";

import { useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import { motion } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}

// ════════════════════════════════════════════════════════════════
// Dashboard Content
// ════════════════════════════════════════════════════════════════
import {
  mockKPIs, mockDailyRevenue, mockMonthlyRevenue,
  mockCategoryRevenue, mockPaymentMix,
  mockTopProducts, mockTopWeavers, mockAIUsage,
  mockRevenueBreakdown, mockFabricTypeSales,
  mockDemandHeatmap, mockTrendInsights,
  mockUserActivity, mockCustomerFunnel,
  mockSearchKeywords, mockWishlistData,
  mockCommunityPerformance, mockProductionInsight,
  mockSupplyDemandGap,
  mockAIInsights, mockPredictiveAnalytics, mockRecommendations,
} from "@/lib/mock-admin-data";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import TextureRoundedIcon from "@mui/icons-material/TextureRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AgricultureRoundedIcon from "@mui/icons-material/AgricultureRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import GpsFixedRoundedIcon from "@mui/icons-material/GpsFixedRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, FunnelChart, Funnel, LabelList,
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────
const SectionTitle = ({ children, icon }: { children: string; icon: ReactNode }) => {
  const { c } = useAdminTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, mt: 1 }}>
      {icon}
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
        {children}
      </Typography>
    </Box>
  );
};

const CardTitle = ({ children, icon }: { children: string; icon?: ReactNode }) => {
  const { c } = useAdminTheme();
  return (
    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2, display: "flex", alignItems: "center", gap: 0.75 }}>
      {icon}{children}
    </Typography>
  );
};

const urgencyColor: Record<string, { color: string; bg: string }> = {
  critical: { color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  high: { color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  medium: { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  low: { color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "เร่งด่วน", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  high: { label: "สำคัญ", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  medium: { label: "ปานกลาง", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
};

const recTypeIcons: Record<string, ReactNode> = {
  product: <Inventory2RoundedIcon sx={{ fontSize: 18 }} />,
  pricing: <AttachMoneyRoundedIcon sx={{ fontSize: 18 }} />,
  marketing: <CampaignRoundedIcon sx={{ fontSize: 18 }} />,
  stock: <FactoryRoundedIcon sx={{ fontSize: 18 }} />,
  community: <HandshakeRoundedIcon sx={{ fontSize: 18 }} />,
};

// ════════════════════════════════════════════════════════════════
function AdminDashboardContent() {
  const [revenueView, setRevenueView] = useState<"daily" | "monthly">("daily");
  const { c } = useAdminTheme();
  const t = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: t };
  const cardAnim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <Box>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* AI INSIGHT BOX (Hero Highlight) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Box
        component={motion.div} {...cardAnim}
        sx={{
          mb: 3, p: 0, borderRadius: "16px", overflow: "hidden",
          background: `linear-gradient(135deg, ${c.bgCard} 0%, rgba(197,165,90,0.08) 100%)`,
          border: `1px solid ${c.gold}33`,
        }}
      >
        <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5, borderBottom: `1px solid ${c.borderCard}` }}>
          <AutoAwesomeRoundedIcon sx={{ color: c.gold, fontSize: 22 }} />
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: c.gold, display: "flex", alignItems: "center", gap: 0.75 }}>
            <PsychologyRoundedIcon sx={{ fontSize: 18 }} /> AI Insights วันนี้
          </Typography>
          <Chip label="LIVE" size="small" sx={{ bgcolor: "rgba(34,197,94,0.2)", color: "#22C55E", fontWeight: 700, fontSize: "0.65rem", height: 20, ml: "auto",
            animation: "pulse 2s infinite",
            "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
          }} />
        </Box>
        <Box sx={{ px: 3, py: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 1.5 }}>
          {mockAIInsights.map((insight, i) => (
            <Box
              key={i}
              component={motion.div}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              sx={{
                display: "flex", alignItems: "flex-start", gap: 1.5, px: 2, py: 1.5,
                borderRadius: "10px", bgcolor: c.bgCardHover, transition: t,
                "&:hover": { bgcolor: c.goldSubtle },
              }}
            >
              <Typography sx={{ fontSize: "1.1rem", mt: 0.2 }}>{insight.icon}</Typography>
              <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary, lineHeight: 1.5 }}>{insight.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BUSINESS KPIs */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<AttachMoneyRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>Business KPIs</SectionTitle>

      {/* KPI Cards (existing) */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr", md: "repeat(6, 1fr)" }, gap: 2, mb: 3 }}>
        {mockKPIs.map((kpi) => (
          <Box key={kpi.label} component={motion.div} {...cardAnim} sx={card}>
            <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, mb: 1 }}>{kpi.label}</Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.4rem", color: c.textPrimary, mb: 0.5 }}>{kpi.value}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {kpi.trend === "up" ? <TrendingUpRoundedIcon sx={{ fontSize: 14, color: "#22C55E" }} /> : <TrendingDownRoundedIcon sx={{ fontSize: 14, color: "#EF4444" }} />}
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: kpi.trend === "up" ? "#22C55E" : "#EF4444" }}>
                {kpi.change > 0 ? "+" : ""}{kpi.change}%
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Revenue Breakdown Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {[
          { label: "Laya Commission", value: `฿${(mockRevenueBreakdown.layaCommission / 1000).toFixed(0)}k`, sub: `${mockRevenueBreakdown.commissionRate}% of GMV`, color: c.gold },
          { label: "Net Revenue", value: `฿${(mockRevenueBreakdown.netRevenue / 1000).toFixed(0)}k`, sub: "หลังหักค่าใช้จ่าย", color: "#22C55E" },
          { label: "Refunds", value: `฿${(mockRevenueBreakdown.refunds / 1000).toFixed(0)}k`, sub: `${((mockRevenueBreakdown.refunds / mockRevenueBreakdown.totalGMV) * 100).toFixed(1)}% of GMV`, color: "#EF4444" },
          { label: "Total Orders", value: mockRevenueBreakdown.totalOrders.toLocaleString(), sub: `AOV ฿${mockRevenueBreakdown.avgOrderValue.toLocaleString()}`, color: "#3B82F6" },
        ].map((item) => (
          <Box key={item.label} component={motion.div} {...cardAnim} sx={card}>
            <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, mb: 1 }}>{item.label}</Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.3rem", color: item.color }}>{item.value}</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, mt: 0.5 }}>{item.sub}</Typography>
          </Box>
        ))}
      </Box>

      {/* Revenue Chart + Category Pie (existing) */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2, mb: 3 }}>
        <Box sx={card}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <CardTitle>รายรับ (Revenue)</CardTitle>
            <Box sx={{ display: "flex", gap: 1 }}>
              {(["daily", "monthly"] as const).map((v) => (
                <Box key={v} onClick={() => setRevenueView(v)}
                  sx={{ px: 2, py: 0.5, borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, bgcolor: revenueView === v ? c.goldSubtle : "transparent", color: revenueView === v ? c.gold : c.textMuted, transition: t }}>
                  {v === "daily" ? "รายวัน" : "รายเดือน"}
                </Box>
              ))}
            </Box>
          </Box>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueView === "daily" ? mockDailyRevenue : mockMonthlyRevenue.map(d => ({ date: d.month, revenue: d.revenue }))}>
              <defs><linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C5A55A" stopOpacity={0.3} /><stop offset="95%" stopColor="#C5A55A" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
              <XAxis dataKey="date" tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} formatter={(value: number) => [`฿${value.toLocaleString()}`, "รายรับ"]} />
              <Area type="monotone" dataKey="revenue" stroke="#C5A55A" fill="url(#revGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={card}>
          <CardTitle>สัดส่วนประเภทสินค้า</CardTitle>
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SALES PERFORMANCE */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<TrendingUpRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>Sales Performance</SectionTitle>

      {/* Fabric Type Sales + Demand Heatmap */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
        {/* Fabric Type */}
        <Box sx={card}>
          <CardTitle>ยอดขายตามประเภทผ้า</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockFabricTypeSales} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
              <XAxis type="number" tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="type" tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} formatter={(value: number) => [`฿${value.toLocaleString()}`, "รายรับ"]} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {mockFabricTypeSales.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Demand Heatmap */}
        <Box sx={card}>
          <CardTitle icon={<MapRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Demand Heatmap (จังหวัด)</CardTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {mockDemandHeatmap.slice(0, 8).map((pv, i) => (
              <Box key={pv.province} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: c.textMuted, width: 18, textAlign: "right" }}>{i + 1}</Typography>
                <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, width: 110, flexShrink: 0 }}>{pv.province}</Typography>
                <Box sx={{ flex: 1, position: "relative" }}>
                  <LinearProgress
                    variant="determinate"
                    value={pv.pct * (100 / 26)}
                    sx={{
                      height: 14, borderRadius: 7, bgcolor: c.bgStatBox,
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 7,
                        background: `linear-gradient(90deg, ${c.gold}, #D4BA7A)`,
                      },
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: c.gold, width: 55, textAlign: "right" }}>
                  ฿{(pv.revenue / 1000).toFixed(0)}k
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TREND INSIGHTS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<PaletteRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>Trend Insights</SectionTitle>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
        {/* Trending Colors */}
        <Box sx={card}>
          <CardTitle icon={<PaletteRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>สีที่กำลังมา</CardTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {mockTrendInsights.trendingColors.map((cl) => (
              <Box key={cl.name} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: cl.hex, border: `2px solid ${c.borderCard}`, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary }}>{cl.name}</Typography>
                </Box>
                <Chip label={`+${cl.growth}%`} size="small" sx={{ bgcolor: "rgba(34,197,94,0.15)", color: "#22C55E", fontWeight: 700, fontSize: "0.7rem", height: 22 }} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Trending Patterns */}
        <Box sx={card}>
          <CardTitle icon={<TextureRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>ลายที่ค้นหาเยอะ</CardTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {mockTrendInsights.trendingPatterns.map((pt, i) => (
              <Box key={pt.name} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: c.textMuted, width: 18 }}>{i + 1}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary }}>{pt.name}</Typography>
                  <Typography sx={{ fontSize: "0.65rem", color: c.textMuted }}>{pt.searches.toLocaleString()} searches</Typography>
                </Box>
                <Chip label={`+${pt.growth}%`} size="small" sx={{ bgcolor: "rgba(34,197,94,0.15)", color: "#22C55E", fontWeight: 700, fontSize: "0.7rem", height: 22 }} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Seasonal Trends */}
        <Box sx={card}>
          <CardTitle icon={<CalendarMonthRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Seasonal Trends</CardTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {mockTrendInsights.seasonalTrends.map((st) => {
              const demandColor = st.demand === "สูงมาก" ? "#22C55E" : st.demand === "สูง" ? c.gold : "#3B82F6";
              return (
                <Box key={st.season} sx={{ p: 1.5, borderRadius: "10px", bgcolor: c.bgCardHover }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: c.textPrimary }}>{st.season}</Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                    <Typography sx={{ fontSize: "0.75rem", color: c.textSecondary }}>{st.topCategory}</Typography>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: demandColor }}>{st.demand}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* USER & BEHAVIOR */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<GroupRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>User & Behavior</SectionTitle>

      {/* User Activity KPIs */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" }, gap: 2, mb: 3 }}>
        {[
          { label: "DAU", value: mockUserActivity.dau.toLocaleString(), icon: <VisibilityRoundedIcon sx={{ fontSize: 20, color: c.textMuted }} /> },
          { label: "MAU", value: mockUserActivity.mau.toLocaleString(), icon: <BarChartRoundedIcon sx={{ fontSize: 20, color: c.textMuted }} /> },
          { label: "Session Time", value: mockUserActivity.avgSessionTime, icon: <TimerRoundedIcon sx={{ fontSize: 20, color: c.textMuted }} /> },
          { label: "Bounce Rate", value: `${mockUserActivity.bounceRate}%`, icon: <UndoRoundedIcon sx={{ fontSize: 20, color: c.textMuted }} /> },
          { label: "Returning Users", value: `${mockUserActivity.returningUsers}%`, icon: <AutorenewRoundedIcon sx={{ fontSize: 20, color: c.textMuted }} /> },
        ].map((item) => (
          <Box key={item.label} component={motion.div} {...cardAnim} sx={card}>
            <Box sx={{ mb: 0.5 }}>{item.icon}</Box>
            <Typography sx={{ fontSize: "0.65rem", color: c.textMuted, fontWeight: 600 }}>{item.label}</Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary }}>{item.value}</Typography>
          </Box>
        ))}
      </Box>

      {/* DAU Chart + Customer Funnel */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
        {/* DAU Trend */}
        <Box sx={card}>
          <CardTitle icon={<VisibilityRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Daily Active Users (สัปดาห์นี้)</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockUserActivity.dauTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
              <XAxis dataKey="date" tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} />
              <Bar dataKey="users" fill={c.gold} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Customer Funnel */}
        <Box sx={card}>
          <CardTitle icon={<ShoppingCartRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Customer Journey Funnel</CardTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {mockCustomerFunnel.map((step, i) => (
              <Box key={step.stage}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary }}>{step.stage}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: c.textSecondary }}>{step.count.toLocaleString()} ({step.pct}%)</Typography>
                </Box>
                <LinearProgress variant="determinate" value={step.pct}
                  sx={{
                    height: 16, borderRadius: 8, bgcolor: c.bgStatBox,
                    "& .MuiLinearProgress-bar": { borderRadius: 8, bgcolor: step.color },
                  }}
                />
                {i < mockCustomerFunnel.length - 1 && (
                  <Typography sx={{ fontSize: "0.65rem", color: "#EF4444", textAlign: "right", mt: 0.3 }}>
                    ↓ drop {((1 - mockCustomerFunnel[i + 1].count / step.count) * 100).toFixed(0)}%
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Search Keywords + Wishlist */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
        {/* Search Keywords */}
        <Box sx={card}>
          <CardTitle icon={<SearchRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Search Keywords ยอดนิยม</CardTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {mockSearchKeywords.map((kw, i) => (
              <Box key={kw.keyword} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.8, borderBottom: i < mockSearchKeywords.length - 1 ? `1px solid ${c.borderCard}` : "none" }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: c.textMuted, width: 18 }}>{i + 1}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary }}>&quot;{kw.keyword}&quot;</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.75rem", color: c.textMuted, mr: 1 }}>{kw.count.toLocaleString()}</Typography>
                <Chip label={`+${kw.growth}%`} size="small" sx={{
                  bgcolor: kw.growth > 30 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                  color: kw.growth > 30 ? "#EF4444" : "#22C55E",
                  fontWeight: 700, fontSize: "0.65rem", height: 20,
                }} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Wishlist vs Purchase */}
        <Box sx={card}>
          <CardTitle icon={<FavoriteRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Wishlist vs ซื้อจริง</CardTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {mockWishlistData.map((item, i) => (
              <Box key={item.name} sx={{ py: 1, borderBottom: i < mockWishlistData.length - 1 ? `1px solid ${c.borderCard}` : "none" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, maxWidth: "60%" }}>{item.name}</Typography>
                  <Chip label={`${item.convRate}%`} size="small" sx={{
                    bgcolor: item.convRate > 30 ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                    color: item.convRate > 30 ? "#22C55E" : "#F59E0B",
                    fontWeight: 700, fontSize: "0.65rem", height: 20,
                  }} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, display: "flex", alignItems: "center", gap: 0.4 }}>
                    <FavoriteRoundedIcon sx={{ fontSize: 12 }} /> Save: {item.saves}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, display: "flex", alignItems: "center", gap: 0.4 }}>
                    <ShoppingCartRoundedIcon sx={{ fontSize: 12 }} /> ซื้อ: {item.purchases}
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={item.convRate}
                  sx={{ height: 6, borderRadius: 3, mt: 0.8, bgcolor: c.bgStatBox, "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: item.convRate > 30 ? "#22C55E" : "#F59E0B" } }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SUPPLY SIDE (Community) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<HomeRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>Supply Side (ฝั่งชุมชน)</SectionTitle>

      {/* Community Performance */}
      <Box sx={{ ...card, mb: 3, overflow: "hidden" }}>
        <CardTitle icon={<AgricultureRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Community Performance</CardTitle>
        {/* Header */}
        <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "2.5fr 1fr 1fr 0.7fr 0.7fr", gap: 2, px: 1, pb: 1.5, borderBottom: `1px solid ${c.borderCard}` }}>
          {["ชุมชน", "รายรับ", "คำสั่งซื้อ", "ช่างทอ", "Growth"].map((h) => (
            <Typography key={h} sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
          ))}
        </Box>
        {mockCommunityPerformance.map((cm, i) => (
          <Box key={cm.name} component={motion.div} {...cardAnim} transition={{ delay: i * 0.04 }}
            sx={{ display: { xs: "flex", md: "grid" }, flexDirection: { xs: "column", md: "row" }, gridTemplateColumns: { md: "2.5fr 1fr 1fr 0.7fr 0.7fr" }, gap: { xs: 0.5, md: 2 }, px: 1, py: 1.5, borderBottom: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover } }}>
            <Box>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{cm.name}</Typography>
              <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>{cm.province}</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.gold }}>฿{(cm.revenue / 1000).toFixed(0)}k</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>{cm.orders}</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>{cm.weavers} คน</Typography>
            <Chip label={`${cm.growth > 0 ? "+" : ""}${cm.growth}%`} size="small" sx={{
              bgcolor: cm.growth > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: cm.growth > 0 ? "#22C55E" : "#EF4444",
              fontWeight: 700, fontSize: "0.7rem", height: 22, width: "fit-content",
            }} />
          </Box>
        ))}
      </Box>

      {/* Production Insight + Supply vs Demand */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
        {/* Production */}
        <Box sx={card}>
          <CardTitle icon={<TimerRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Production vs Sales</CardTitle>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: c.bgCardHover, textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.65rem", color: c.textMuted }}>เฉลี่ยทอ</Typography>
              <Typography sx={{ fontWeight: 700, color: c.textPrimary, fontSize: "1.1rem" }}>{mockProductionInsight.avgProductionDays} วัน</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: c.bgCardHover, textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.65rem", color: c.textMuted }}>เร็วสุด</Typography>
              <Typography sx={{ fontWeight: 700, color: "#22C55E", fontSize: "1.1rem" }}>{mockProductionInsight.fastestCommunity.days} วัน</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: c.bgCardHover, textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.65rem", color: c.textMuted }}>Stock Turnover</Typography>
              <Typography sx={{ fontWeight: 700, color: c.gold, fontSize: "1.1rem" }}>{mockProductionInsight.stockTurnover}x</Typography>
            </Box>
          </Box>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockProductionInsight.productionByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
              <XAxis dataKey="month" tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} />
              <Line type="monotone" dataKey="produced" stroke="#3B82F6" strokeWidth={2} dot={false} name="ผลิต" />
              <Line type="monotone" dataKey="sold" stroke="#22C55E" strokeWidth={2} dot={false} name="ขาย" />
              <Legend formatter={(value: string) => <span style={{ color: c.legendText, fontSize: 11 }}>{value}</span>} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Supply vs Demand Gap */}
        <Box sx={card}>
          <CardTitle icon={<TrendingDownRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Supply vs Demand Gap</CardTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {mockSupplyDemandGap.map((item) => {
              const u = urgencyColor[item.urgency] || urgencyColor.medium;
              const pct = (item.supply / item.demand) * 100;
              return (
                <Box key={item.product} sx={{ p: 1.5, borderRadius: "10px", border: `1px solid ${c.borderCard}` }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                    <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, maxWidth: "60%" }}>{item.product}</Typography>
                    <Chip label={item.urgency} size="small" sx={{ bgcolor: u.bg, color: u.color, fontWeight: 700, fontSize: "0.65rem", height: 20, textTransform: "capitalize" }} />
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, fontSize: "0.7rem", color: c.textMuted, mb: 0.8 }}>
                    <span>Demand: {item.demand}</span>
                    <span>Supply: {item.supply}</span>
                    <span style={{ color: u.color, fontWeight: 700 }}>Gap: {item.gap}</span>
                  </Box>
                  <LinearProgress variant="determinate" value={pct}
                    sx={{ height: 8, borderRadius: 4, bgcolor: c.bgStatBox, "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: pct > 70 ? "#22C55E" : pct > 40 ? "#F59E0B" : "#EF4444" } }}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* AI Usage & Payment Mix (existing) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<SmartToyRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>AI & Payments</SectionTitle>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
        <Box sx={card}>
          <CardTitle>AI Pattern Generation</CardTitle>
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
        <Box sx={card}>
          <CardTitle>สัดส่วนช่องทางชำระเงิน</CardTitle>
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Top Products & Top Weavers (existing) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<EmojiEventsRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>Top Performers</SectionTitle>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
        <Box sx={card}>
          <CardTitle>สินค้าขายดี</CardTitle>
          {mockTopProducts.map((p, i) => (
            <Box key={p.id} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, borderBottom: i < mockTopProducts.length - 1 ? `1px solid ${c.borderCard}` : "none" }}>
              <Typography sx={{ color: c.textMuted, fontWeight: 700, fontSize: "0.9rem", width: 20 }}>{i + 1}</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: "8px", overflow: "hidden", bgcolor: c.bgStatBox }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{p.name}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>{p.community}</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.gold }}>฿{(p.revenue / 1000).toFixed(0)}k</Typography>
                <Typography sx={{ fontSize: "0.65rem", color: c.textMuted }}>{p.unitsSold} sold</Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={card}>
          <CardTitle>ช่างทอยอดเยี่ยม</CardTitle>
          {mockTopWeavers.map((w, i) => (
            <Box key={w.id} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, borderBottom: i < mockTopWeavers.length - 1 ? `1px solid ${c.borderCard}` : "none" }}>
              <Typography sx={{ color: c.textMuted, fontWeight: 700, fontSize: "0.9rem", width: 20 }}>{i + 1}</Typography>
              <Avatar sx={{ width: 36, height: 36, bgcolor: i === 0 ? c.gold : c.bgStatBox, fontSize: "0.85rem", fontWeight: 700, color: i === 0 ? c.textOnGold : c.textPrimary }}>{w.avatar}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{w.name}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, display: "flex", alignItems: "center", gap: 0.3 }}>{w.province} • <StarRoundedIcon sx={{ fontSize: 12, color: c.gold }} /> {w.rating}</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.gold }}>฿{(w.revenue / 1000).toFixed(0)}k</Typography>
                <Typography sx={{ fontSize: "0.65rem", color: c.textMuted }}>{w.completionRate}% complete</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SMART DASHBOARD */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<GpsFixedRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>Smart Dashboard</SectionTitle>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
        {/* Predictive Analytics */}
        <Box sx={card}>
          <CardTitle icon={<BarChartRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>Predictive Analytics</CardTitle>
          <Box sx={{ p: 2, borderRadius: "12px", background: `linear-gradient(135deg, rgba(197,165,90,0.1), rgba(197,165,90,0.03))`, border: `1px solid ${c.gold}33`, mb: 2 }}>
            <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, mb: 0.5 }}>คาดการณ์รายรับเดือนหน้า</Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.6rem", color: c.gold }}>
                ฿{(mockPredictiveAnalytics.nextMonthRevenue.predicted / 1000000).toFixed(1)}M
              </Typography>
              <Chip label={`${mockPredictiveAnalytics.nextMonthRevenue.confidence}% confidence`} size="small"
                sx={{ bgcolor: c.goldSubtle, color: c.gold, fontWeight: 600, fontSize: "0.65rem", height: 20 }} />
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: c.textPrimary, mb: 0.5 }}>แนวโน้ม Q1/68</Typography>
            <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary, lineHeight: 1.6, p: 1.5, borderRadius: "8px", bgcolor: c.bgCardHover }}>
              {mockPredictiveAnalytics.nextQuarterTrend}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: c.textPrimary, mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 14 }} /> Risk Factors
          </Typography>
          {mockPredictiveAnalytics.riskFactors.map((risk, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.8 }}>
              <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>•</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: c.textSecondary, lineHeight: 1.5 }}>{risk}</Typography>
            </Box>
          ))}
        </Box>

        {/* Recommendations */}
        <Box sx={card}>
          <CardTitle icon={<LightbulbRoundedIcon sx={{ fontSize: 16, color: c.gold }} />}>AI Recommendations</CardTitle>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {mockRecommendations.map((rec, i) => {
              const pr = priorityConfig[rec.priority] || priorityConfig.medium;
              return (
                <Box key={i} component={motion.div} {...cardAnim} transition={{ delay: i * 0.06 }}
                  sx={{ p: 2, borderRadius: "12px", border: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover }, transition: t }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.8 }}>
                    <Box sx={{ display: "flex", alignItems: "center", color: c.textSecondary }}>{recTypeIcons[rec.type]}</Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary, flex: 1 }}>{rec.title}</Typography>
                    <Chip label={pr.label} size="small" sx={{ bgcolor: pr.bg, color: pr.color, fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: c.textSecondary, lineHeight: 1.5, pl: 3.5 }}>{rec.reason}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
