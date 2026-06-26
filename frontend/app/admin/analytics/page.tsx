"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

import {
  mockKPIs, mockTopProducts,
  mockRevenueBreakdown, mockFabricTypeSales,
  mockDemandHeatmap, mockTrendInsights,
  mockSearchKeywords,
  mockCommunityPerformance,
  mockSupplyDemandGap,
  mockAIInsights, mockPredictiveAnalytics, mockRecommendations,
  mockSearchTrendsOverTime, mockColorPopularity,
  mockRevenue7Days, mockRevenue30Days, mockRevenue1Year,
  mockCommunityOpportunity, mockDemandVsSupply,
  mockCategoryRevenue,
} from "@/lib/mock-admin-data";

type AnalyticsTab = "sales" | "trends" | "insights";

// ─── Reusable Components ──────────────────────────────────────
const CardTitle = ({ children, emoji }: { children: string; emoji?: string }) => {
  const { c } = useAdminTheme();
  return (
    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
      {emoji && <span>{emoji}</span>}{children}
    </Typography>
  );
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "เร่งด่วน", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  high: { label: "สำคัญ", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  medium: { label: "ปานกลาง", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
};
const recTypeIcons: Record<string, string> = { product: "📦", pricing: "💰", marketing: "📣", stock: "🏭", community: "🤝" };

const searchTrendLines = [
  { key: "ผ้าไหมมัดหมี่", color: "#C5A55A" },
  { key: "ผ้าฝ้ายย้อมคราม", color: "#0284C7" },
  { key: "ผ้าไหมสีฟ้า", color: "#89CFF0" },
  { key: "ชุดผ้าไทย วัยรุ่น", color: "#22C55E" },
];

// ════════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: tr };
  const cardAnim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  const [activeTab, setActiveTab] = useState<AnalyticsTab>("sales");
  const [revenueRange, setRevenueRange] = useState<"7d" | "30d" | "1y">("30d");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");

  const revenueData = revenueRange === "7d" ? mockRevenue7Days : revenueRange === "30d" ? mockRevenue30Days : mockRevenue1Year;

  const tabs: { key: AnalyticsTab; label: string; icon: string }[] = [
    { key: "sales", label: "Sales Dashboard", icon: "💰" },
    { key: "trends", label: "Trends Dashboard", icon: "🔥" },
    { key: "insights", label: "Insights Dashboard", icon: "🧠" },
  ];

  // ─── KPI values for Sales ───────────────────────────────────
  const salesKPIs = [
    { label: "Total Revenue", value: `฿${(mockRevenueBreakdown.totalGMV / 1000000).toFixed(1)}M`, change: 12, trend: "up" },
    { label: "Orders", value: mockRevenueBreakdown.totalOrders.toLocaleString(), change: 8, trend: "up" },
    { label: "AOV", value: `฿${mockRevenueBreakdown.avgOrderValue.toLocaleString()}`, change: 3.2, trend: "up" },
    { label: "Conversion Rate", value: "3.8%", change: 0.5, trend: "up" },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, mb: 0.5 }}>
          📊 Analytics
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
          <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>
            วิเคราะห์ข้อมูลการขาย, เทรนด์, และ insight เชิงลึก
          </Typography>
          <Chip label="Updated 5 mins ago" size="small" sx={{ bgcolor: "rgba(34,197,94,0.15)", color: "#22C55E", fontWeight: 600, fontSize: "0.65rem", height: 20,
            animation: "pulse 3s infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
          }} />
        </Box>

        {/* Tabs */}
        <Box sx={{ display: "flex", gap: 0.5, bgcolor: c.bgCard, borderRadius: "12px", p: 0.5, border: `1px solid ${c.borderCard}`, overflow: "auto" }}>
          {tabs.map(tab => (
            <Box key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                px: 2.5, py: 1, borderRadius: "10px", cursor: "pointer",
                bgcolor: activeTab === tab.key ? c.goldSubtle : "transparent",
                color: activeTab === tab.key ? c.gold : c.textMuted,
                fontWeight: activeTab === tab.key ? 700 : 500,
                fontSize: "0.85rem", transition: tr, whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 1,
                "&:hover": { bgcolor: activeTab === tab.key ? c.goldSubtle : c.bgCardHover },
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </Box>
          ))}
        </Box>
      </Box>

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: SALES DASHBOARD */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "sales" && (
          <motion.div key="sales" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Filter Bar */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
              <Select size="small" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{ minWidth: 140, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
                <MenuItem value="all">ทุกประเภท</MenuItem>
                <MenuItem value="silk">ผ้าไหม</MenuItem>
                <MenuItem value="cotton">ผ้าฝ้าย</MenuItem>
                <MenuItem value="praewa">แพรวา</MenuItem>
              </Select>
              <Select size="small" value={provinceFilter} onChange={(e) => setProvinceFilter(e.target.value)}
                sx={{ minWidth: 140, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
                <MenuItem value="all">ทุกจังหวัด</MenuItem>
                <MenuItem value="bkk">กรุงเทพฯ</MenuItem>
                <MenuItem value="cm">เชียงใหม่</MenuItem>
                <MenuItem value="kk">ขอนแก่น</MenuItem>
              </Select>
            </Box>

            {/* KPI Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
              {salesKPIs.map((kpi) => (
                <Box key={kpi.label} component={motion.div} {...cardAnim} sx={card}>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, mb: 1 }}>{kpi.label}</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.5rem", color: c.textPrimary }}>{kpi.value}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <TrendingUpRoundedIcon sx={{ fontSize: 14, color: "#22C55E" }} />
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#22C55E" }}>+{kpi.change}%</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Revenue Chart */}
            <Box sx={{ ...card, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
                <CardTitle emoji="📈">Revenue</CardTitle>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {(["7d", "30d", "1y"] as const).map(r => (
                    <Box key={r} onClick={() => setRevenueRange(r)}
                      sx={{ px: 2, py: 0.5, borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                        bgcolor: revenueRange === r ? c.goldSubtle : "transparent",
                        color: revenueRange === r ? c.gold : c.textMuted, transition: tr }}>
                      {r === "7d" ? "7 วัน" : r === "30d" ? "30 วัน" : "1 ปี"}
                    </Box>
                  ))}
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C5A55A" stopOpacity={0.3} /><stop offset="95%" stopColor="#C5A55A" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
                  <XAxis dataKey="date" tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} formatter={(value: number) => [`฿${value.toLocaleString()}`, "รายรับ"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#C5A55A" fill="url(#salesGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            {/* Top Products + Sales by Location */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
              {/* Top Products */}
              <Box sx={card}>
                <CardTitle emoji="🏆">Top Products</CardTitle>
                {mockTopProducts.map((p, i) => (
                  <Box key={p.id} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, borderBottom: i < mockTopProducts.length - 1 ? `1px solid ${c.borderCard}` : "none" }}>
                    <Typography sx={{ color: c.textMuted, fontWeight: 700, fontSize: "0.9rem", width: 20 }}>{i + 1}</Typography>
                    <Box sx={{ width: 40, height: 40, borderRadius: "8px", overflow: "hidden", bgcolor: c.bgStatBox }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>{p.unitsSold} sold</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.gold }}>฿{(p.revenue / 1000).toFixed(0)}k</Typography>
                  </Box>
                ))}
              </Box>

              {/* Sales by Location */}
              <Box sx={card}>
                <CardTitle emoji="🌍">Sales by Location (จังหวัด)</CardTitle>
                {mockDemandHeatmap.map((pv, i) => (
                  <Box key={pv.province} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.2 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: c.textMuted, width: 18, textAlign: "right" }}>{i + 1}</Typography>
                    <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, width: 110, flexShrink: 0 }}>{pv.province}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress variant="determinate" value={pv.pct * (100 / 26)}
                        sx={{ height: 14, borderRadius: 7, bgcolor: c.bgStatBox, "& .MuiLinearProgress-bar": { borderRadius: 7, background: `linear-gradient(90deg, ${c.gold}, #D4BA7A)` } }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: c.gold, width: 55, textAlign: "right" }}>฿{(pv.revenue / 1000).toFixed(0)}k</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Category Revenue Pie */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
              <Box sx={card}>
                <CardTitle emoji="📊">สัดส่วนประเภทสินค้า</CardTitle>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={mockCategoryRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {mockCategoryRevenue.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Legend verticalAlign="bottom" formatter={(value: string) => <span style={{ color: c.legendText, fontSize: 11 }}>{value}</span>} />
                    <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} formatter={(value: number) => [`${value}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={card}>
                <CardTitle emoji="🧵">ยอดขายตามประเภทผ้า</CardTitle>
                <ResponsiveContainer width="100%" height={240}>
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
            </Box>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 2: TRENDS DASHBOARD */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "trends" && (
          <motion.div key="trends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Trending Now — Hero Card */}
            <Box component={motion.div} {...cardAnim}
              sx={{
                mb: 3, p: 0, borderRadius: "16px", overflow: "hidden",
                background: `linear-gradient(135deg, ${c.bgCard} 0%, rgba(197,165,90,0.1) 100%)`,
                border: `1px solid ${c.gold}44`,
              }}>
              <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5, borderBottom: `1px solid ${c.borderCard}` }}>
                <Typography sx={{ fontSize: "1rem" }}>🔥</Typography>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: c.gold }}>Trending Now</Typography>
                <Chip label="LIVE" size="small" sx={{ bgcolor: "rgba(34,197,94,0.2)", color: "#22C55E", fontWeight: 700, fontSize: "0.65rem", height: 20, ml: "auto",
                  animation: "pulse 2s infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
                }} />
              </Box>
              <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: c.bgCardHover, border: `1px solid ${c.borderCard}` }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: "6px", bgcolor: "#9CAF88" }} />
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary }}>โทนเขียว Sage Green</Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>ยอดค้นหาเพิ่ม</Typography>
                  <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: "#22C55E" }}>+32%</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: c.bgCardHover, border: `1px solid ${c.borderCard}` }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary, mb: 1 }}>🧵 ลายยอดนิยม</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>ลายที่ Growth สูงสุด</Typography>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: c.gold }}>ลายนาคราช +45%</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: c.bgCardHover, border: `1px solid ${c.borderCard}` }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary, mb: 1 }}>🔍 Keyword ร้อนแรง</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>เติบโตเร็วที่สุด</Typography>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#EF4444" }}>&ldquo;ชุดผ้าไทย วัยรุ่น&rdquo; +65%</Typography>
                </Box>
              </Box>
            </Box>

            {/* Color Trends + Fabric Pie */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
              {/* Color Bar Chart */}
              <Box sx={card}>
                <CardTitle emoji="🎨">Color Trends (ความนิยมตามสี)</CardTitle>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={mockColorPopularity}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
                    <XAxis dataKey="color" tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} formatter={(value: number) => [`${value.toLocaleString()} searches`, ""]} />
                    <Bar dataKey="searches" radius={[4, 4, 0, 0]}>
                      {mockColorPopularity.map((entry, i) => <Cell key={i} fill={entry.hex} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Fabric Type Pie */}
              <Box sx={card}>
                <CardTitle emoji="🧵">Fabric Type Trends</CardTitle>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={mockFabricTypeSales.map(f => ({ name: f.type, value: f.pct }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {mockFabricTypeSales.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Legend verticalAlign="bottom" formatter={(value: string) => <span style={{ color: c.legendText, fontSize: 11 }}>{value}</span>} />
                    <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} formatter={(value: number) => [`${value}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* Search Trends (Chips + Line Chart) */}
            <Box sx={{ ...card, mb: 3 }}>
              <CardTitle emoji="📊">Search Trends (keyword ยอดนิยม)</CardTitle>
              {/* Keyword Chips */}
              <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 3 }}>
                {mockSearchKeywords.slice(0, 6).map(kw => (
                  <Chip key={kw.keyword} label={`"${kw.keyword}" (${kw.count.toLocaleString()})`} size="small"
                    sx={{ bgcolor: c.goldSubtle, color: c.gold, fontWeight: 600, fontSize: "0.7rem" }}
                  />
                ))}
              </Box>
            </Box>

            {/* Trend Over Time */}
            <Box sx={card}>
              <CardTitle emoji="⏳">Trend Over Time (keyword vs time)</CardTitle>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockSearchTrendsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
                  <XAxis dataKey="week" tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: c.chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} />
                  {searchTrendLines.map(ln => (
                    <Line key={ln.key} type="monotone" dataKey={ln.key} stroke={ln.color} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                  <Legend formatter={(value: string) => <span style={{ color: c.legendText, fontSize: 10 }}>{value}</span>} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 3: INSIGHTS DASHBOARD */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "insights" && (
          <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* AI Insight Box — Hero */}
            <Box component={motion.div} {...cardAnim}
              sx={{
                mb: 3, p: 0, borderRadius: "16px", overflow: "hidden",
                background: `linear-gradient(135deg, ${c.bgCard} 0%, rgba(197,165,90,0.08) 100%)`,
                border: `1px solid ${c.gold}33`,
              }}>
              <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5, borderBottom: `1px solid ${c.borderCard}` }}>
                <AutoAwesomeRoundedIcon sx={{ color: c.gold, fontSize: 22 }} />
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: c.gold }}>
                  🧠 AI Insight วันนี้
                </Typography>
                <Chip label="LIVE" size="small" sx={{ bgcolor: "rgba(34,197,94,0.2)", color: "#22C55E", fontWeight: 700, fontSize: "0.65rem", height: 20, ml: "auto",
                  animation: "pulse 2s infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
                }} />
              </Box>
              <Box sx={{ px: 3, py: 2.5 }}>
                <Box sx={{ p: 2.5, borderRadius: "12px", background: `linear-gradient(135deg, rgba(197,165,90,0.15), rgba(197,165,90,0.05))`, mb: 2 }}>
                  {mockAIInsights.slice(0, 4).map((insight, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 1.5, py: 1, borderBottom: i < 3 ? `1px solid ${c.borderCard}` : "none" }}>
                      <Typography sx={{ fontSize: "1rem" }}>{insight.icon}</Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, lineHeight: 1.6 }}>{insight.text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Demand vs Supply + Predictive */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
              {/* Demand vs Supply */}
              <Box sx={card}>
                <CardTitle emoji="📉">Demand vs Supply</CardTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={mockDemandVsSupply}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.chartGrid} />
                    <XAxis dataKey="category" tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: c.chartTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: c.chartTooltipBg, border: "none", borderRadius: "8px", color: c.chartTooltipText, fontSize: 12 }} />
                    <Bar dataKey="demand" fill="#EF4444" radius={[4, 4, 0, 0]} name="Demand" />
                    <Bar dataKey="supply" fill="#22C55E" radius={[4, 4, 0, 0]} name="Supply" />
                    <Legend formatter={(value: string) => <span style={{ color: c.legendText, fontSize: 11 }}>{value}</span>} />
                  </BarChart>
                </ResponsiveContainer>
                <Typography sx={{ fontSize: "0.75rem", color: c.textMuted, mt: 1, textAlign: "center" }}>
                  🔴 แดง = Demand (ต้องการ)&nbsp;&nbsp;🟢 เขียว = Supply (มีของ)&nbsp;&nbsp;→ ช่องว่าง = โอกาส!
                </Typography>
              </Box>

              {/* Predictive Analytics */}
              <Box sx={card}>
                <CardTitle emoji="📊">Predictive Analytics</CardTitle>
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
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: c.textPrimary, mb: 1 }}>⚠️ Risk Factors</Typography>
                {mockPredictiveAnalytics.riskFactors.map((risk, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, mb: 0.8 }}>
                    <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>•</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: c.textSecondary, lineHeight: 1.5 }}>{risk}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Recommendations */}
            <Box sx={{ ...card, mb: 3 }}>
              <CardTitle emoji="💡">AI Recommendations</CardTitle>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
                {mockRecommendations.map((rec, i) => {
                  const pr = priorityConfig[rec.priority] || priorityConfig.medium;
                  return (
                    <Box key={i} component={motion.div} {...cardAnim} transition={{ delay: i * 0.06 }}
                      sx={{ p: 2, borderRadius: "12px", border: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover }, transition: tr }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.8 }}>
                        <Typography sx={{ fontSize: "1.1rem" }}>{recTypeIcons[rec.type]}</Typography>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary, flex: 1 }}>{rec.title}</Typography>
                        <Chip label={pr.label} size="small" sx={{ bgcolor: pr.bg, color: pr.color, fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                      </Box>
                      <Typography sx={{ fontSize: "0.75rem", color: c.textSecondary, lineHeight: 1.5, pl: 3.5 }}>{rec.reason}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Community Opportunity */}
            <Box sx={card}>
              <CardTitle emoji="🧑‍🌾">Community Opportunity (โอกาสชุมชน)</CardTitle>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                {mockCommunityOpportunity.map((co, i) => (
                  <Box key={i} component={motion.div} {...cardAnim} transition={{ delay: i * 0.06 }}
                    sx={{ p: 2.5, borderRadius: "12px", border: `1px solid ${c.borderCard}`, "&:hover": { borderColor: c.gold }, transition: tr }}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: c.textPrimary, mb: 0.5 }}>{co.community}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>ควรผลิต:</Typography>
                      <Chip label={co.shouldProduce} size="small" sx={{ bgcolor: c.goldSubtle, color: c.gold, fontWeight: 600, fontSize: "0.7rem" }} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: "0.65rem", color: c.textMuted }}>Revenue Potential</Typography>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: c.gold }}>฿{(co.potentialRevenue / 1000).toFixed(0)}k</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.65rem", color: c.textMuted }}>Demand Growth</Typography>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#22C55E" }}>+{co.demandGrowth}%</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: "0.7rem", color: c.textSecondary, lineHeight: 1.5, p: 1.5, borderRadius: "8px", bgcolor: c.bgCardHover }}>
                      💡 {co.reason}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
