"use client";

import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import LinearProgress from "@mui/material/LinearProgress";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputAdornment from "@mui/material/InputAdornment";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import {
  mockPromotions, AdminPromotion,
  mockCampaigns, AdminCampaign,
} from "@/lib/mock-admin-data";

type MarketingTab = "promotions" | "campaigns";

// ─── Status Styles ────────────────────────────────────────────
const promoStatusStyles: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  expired: { label: "Expired", color: "#6B7280", bg: "rgba(107,114,128,0.15)" },
  draft: { label: "Draft", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
};
const campaignStatusStyles: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "🟢 Active", color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  upcoming: { label: "🔵 Upcoming", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  ended: { label: "⚪ Ended", color: "#6B7280", bg: "rgba(107,114,128,0.15)" },
};

// ═══════════════════════════════════════════════════════════════
export default function MarketingPage() {
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, transition: tr };

  const [activeTab, setActiveTab] = useState<MarketingTab>("promotions");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // ── Promotions State ──
  const [promotions, setPromotions] = useState<AdminPromotion[]>([...mockPromotions]);
  const [createPromoOpen, setCreatePromoOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({
    name: "", code: "", type: "percent" as "percent" | "fixed", value: "",
    minSpend: "", usageLimit: "", perUserLimit: "1",
    startDate: "", endDate: "", applyTo: "all" as "all" | "category" | "weaver", applyTarget: "",
  });
  const [promoErrors, setPromoErrors] = useState<Record<string, string>>({});

  // ── Campaigns State ──
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([...mockCampaigns]);
  const [viewCampaign, setViewCampaign] = useState<AdminCampaign | null>(null);
  const [createCampOpen, setCreateCampOpen] = useState(false);
  const [campForm, setCampForm] = useState({
    name: "", description: "", startDate: "", endDate: "", visibility: "public" as "public" | "private",
    linkedPromoCode: "",
  });

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => { setToastMsg(msg); setToastType(type); };

  // ── Filtered Promos ──
  const filteredPromos = useMemo(() => promotions.filter(p => {
    const q = searchQuery.toLowerCase();
    return (p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) &&
      (statusFilter === "all" || p.status === statusFilter) &&
      (typeFilter === "all" || p.type === typeFilter);
  }), [promotions, searchQuery, statusFilter, typeFilter]);

  // ── Filtered Campaigns ──
  const filteredCampaigns = useMemo(() => campaigns.filter(cam => {
    const q = searchQuery.toLowerCase();
    return cam.name.toLowerCase().includes(q) && (statusFilter === "all" || cam.status === statusFilter);
  }), [campaigns, searchQuery, statusFilter]);

  // ── Generate Code ──
  const autoGenerateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "LAYA";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setPromoForm(f => ({ ...f, code }));
  };

  // ── Validate & Create Promo ──
  const validatePromo = () => {
    const errs: Record<string, string> = {};
    if (!promoForm.name.trim()) errs.name = "กรุณากรอกชื่อ";
    if (!promoForm.code.trim()) errs.code = "กรุณากรอก Code";
    if (!promoForm.value || Number(promoForm.value) <= 0) errs.value = "กรุณากรอกมูลค่า";
    if (promoForm.type === "percent" && Number(promoForm.value) > 100) errs.value = "ส่วนลด % ต้องไม่เกิน 100";
    if (!promoForm.startDate) errs.startDate = "กรุณาเลือกวันเริ่มต้น";
    if (!promoForm.endDate) errs.endDate = "กรุณาเลือกวันสิ้นสุด";
    setPromoErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const createPromo = () => {
    if (!validatePromo()) return;
    const conflict = promotions.find(p => p.status === "active" && p.code !== promoForm.code &&
      new Date(p.startDate) <= new Date(promoForm.endDate) && new Date(p.endDate) >= new Date(promoForm.startDate));

    const newP: AdminPromotion = {
      id: `p${Date.now()}`, name: promoForm.name, code: promoForm.code.toUpperCase(),
      type: promoForm.type, value: Number(promoForm.value),
      minSpend: Number(promoForm.minSpend) || 0,
      usageLimit: Number(promoForm.usageLimit) || 999,
      usageCount: 0, perUserLimit: Number(promoForm.perUserLimit) || 1,
      startDate: promoForm.startDate, endDate: promoForm.endDate, status: "draft",
      applyTo: promoForm.applyTo, applyTarget: promoForm.applyTarget || undefined,
    };
    setPromotions(prev => [newP, ...prev]);
    setCreatePromoOpen(false);
    setPromoForm({ name: "", code: "", type: "percent", value: "", minSpend: "", usageLimit: "", perUserLimit: "1", startDate: "", endDate: "", applyTo: "all", applyTarget: "" });
    showToast(`สร้างโปรโมชั่น "${newP.code}" สำเร็จ! ${conflict ? "⚠️ อาจซ้อนกับโปรอื่น" : ""}`, conflict ? "info" : "success");
  };

  // ── Create Campaign ──
  const createCampaign = () => {
    if (!campForm.name.trim() || !campForm.startDate || !campForm.endDate) return;
    const nc: AdminCampaign = {
      id: `cam${Date.now()}`, name: campForm.name, description: campForm.description,
      bannerImage: "/images/fabric5.jpg", startDate: campForm.startDate, endDate: campForm.endDate,
      status: "upcoming", linkedPromoCode: campForm.linkedPromoCode || undefined,
      visibility: campForm.visibility, productCount: 0,
      stats: { revenue: 0, orders: 0, conversion: 0 },
    };
    setCampaigns(prev => [nc, ...prev]);
    setCreateCampOpen(false);
    setCampForm({ name: "", description: "", startDate: "", endDate: "", visibility: "public", linkedPromoCode: "" });
    showToast(`สร้างแคมเปญ "${nc.name}" สำเร็จ!`);
  };

  // ── Countdown helper ──
  const daysRemaining = (end: string) => {
    const diff = Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const tabs: { key: MarketingTab; label: string; icon: string }[] = [
    { key: "promotions", label: "Promotions", icon: "🎫" },
    { key: "campaigns", label: "Campaigns", icon: "📣" },
  ];

  const inputSx = { "& .MuiOutlinedInput-root": { color: c.textPrimary, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } };

  // ════════════════════════════════════════════════════════════════
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, mb: 0.5 }}>
          📣 Marketing
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted, mb: 2.5 }}>
          จัดการโปรโมชั่น, คูปอง และแคมเปญเพื่อเพิ่มยอดขาย
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, bgcolor: c.bgCard, borderRadius: "12px", p: 0.5, border: `1px solid ${c.borderCard}` }}>
          {tabs.map(tab => (
            <Box key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchQuery(""); setStatusFilter("all"); setTypeFilter("all"); }}
              sx={{
                px: 2.5, py: 1, borderRadius: "10px", cursor: "pointer",
                bgcolor: activeTab === tab.key ? c.goldSubtle : "transparent",
                color: activeTab === tab.key ? c.gold : c.textMuted,
                fontWeight: activeTab === tab.key ? 700 : 500, fontSize: "0.85rem", transition: tr,
                display: "flex", alignItems: "center", gap: 1,
                "&:hover": { bgcolor: activeTab === tab.key ? c.goldSubtle : c.bgCardHover },
              }}>
              <span>{tab.icon}</span> {tab.label}
            </Box>
          ))}
        </Box>
      </Box>

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: PROMOTIONS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "promotions" && (
          <motion.div key="promotions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Top Bar */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flex: 1, flexWrap: "wrap" }}>
                <Box sx={{ bgcolor: c.bgInputField, borderRadius: "10px", px: 1.5, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, flex: 1, minWidth: 200 }}>
                  <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
                  <TextField fullWidth variant="standard" placeholder="ค้นหา Code / ชื่อ..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    InputProps={{ disableUnderline: true }} sx={{ "& input": { color: c.textPrimary, fontSize: "0.85rem", py: 1.2 } }} />
                </Box>
                <Select size="small" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  sx={{ minWidth: 110, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
                  <MenuItem value="all">ทุกสถานะ</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
                <Select size="small" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  sx={{ minWidth: 110, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
                  <MenuItem value="all">ทุกประเภท</MenuItem>
                  <MenuItem value="percent">% Discount</MenuItem>
                  <MenuItem value="fixed">Fixed ฿</MenuItem>
                </Select>
              </Box>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreatePromoOpen(true)}
                sx={{ bgcolor: c.gold, color: c.textOnGold, borderRadius: "10px", fontWeight: 700, textTransform: "none", px: 2.5, "&:hover": { bgcolor: c.goldHover } }}>
                + สร้างโปรโมชั่น
              </Button>
            </Box>

            {/* Promos Table */}
            <Box sx={{ ...card, overflow: "hidden" }}>
              <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "1.5fr 1fr 0.8fr 1.2fr 1fr 0.8fr", px: 3, py: 1.5, bgcolor: c.bgTableHeader, borderBottom: `1px solid ${c.borderCard}` }}>
                {["โปรโมชั่น", "Code", "ส่วนลด", "Usage", "วันหมดอายุ", "สถานะ"].map(h => (
                  <Typography key={h} sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
                ))}
              </Box>
              {filteredPromos.length === 0 ? (
                <Box sx={{ p: 5, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "1.5rem", mb: 1 }}>🎫</Typography>
                  <Typography sx={{ fontSize: "0.9rem", color: c.textMuted }}>ยังไม่มีโปรโมชั่น</Typography>
                </Box>
              ) : filteredPromos.map((promo, idx) => {
                const sts = promoStatusStyles[promo.status];
                const usagePct = (promo.usageCount / promo.usageLimit) * 100;
                return (
                  <Box key={promo.id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                    sx={{ display: { xs: "flex", md: "grid" }, flexDirection: "column", gridTemplateColumns: { md: "1.5fr 1fr 0.8fr 1.2fr 1fr 0.8fr" }, alignItems: "center", px: 3, py: 2, borderBottom: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover }, gap: { xs: 0.5, md: 0 } }}>
                    {/* Name */}
                    <Box>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{promo.name}</Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>
                        {promo.applyTo === "all" ? "ทั้งหมด" : promo.applyTarget}
                      </Typography>
                    </Box>
                    {/* Code */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Chip label={promo.code} size="small" sx={{ bgcolor: c.goldSubtle, color: c.gold, fontWeight: 700, fontSize: "0.75rem", fontFamily: "monospace" }} />
                      <ContentCopyRoundedIcon sx={{ fontSize: 14, color: c.textMuted, cursor: "pointer", "&:hover": { color: c.gold } }}
                        onClick={() => { navigator.clipboard.writeText(promo.code); showToast(`คัดลอก ${promo.code}`, "info"); }} />
                    </Box>
                    {/* Discount */}
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: c.gold }}>
                      {promo.type === "percent" ? `${promo.value}%` : `฿${promo.value}`}
                    </Typography>
                    {/* Usage */}
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: c.textMuted, mb: 0.3 }}>{promo.usageCount}/{promo.usageLimit}</Typography>
                      <LinearProgress variant="determinate" value={Math.min(usagePct, 100)}
                        sx={{ height: 6, borderRadius: 3, bgcolor: c.bgStatBox, "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: usagePct >= 100 ? "#EF4444" : usagePct >= 80 ? "#F59E0B" : "#22C55E" } }} />
                    </Box>
                    {/* Expiry */}
                    <Box>
                      <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary }}>{promo.endDate}</Typography>
                      {promo.status === "active" && (
                        <Typography sx={{ fontSize: "0.65rem", color: daysRemaining(promo.endDate) <= 7 ? "#EF4444" : c.textMuted }}>
                          เหลือ {daysRemaining(promo.endDate)} วัน
                        </Typography>
                      )}
                    </Box>
                    {/* Status */}
                    <Chip label={sts.label} size="small" sx={{ bgcolor: sts.bg, color: sts.color, fontWeight: 700, fontSize: "0.7rem", height: 24 }} />
                  </Box>
                );
              })}
            </Box>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: CAMPAIGNS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "campaigns" && (
          <motion.div key="campaigns" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Top Bar */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1.5, flex: 1, flexWrap: "wrap" }}>
                <Box sx={{ bgcolor: c.bgInputField, borderRadius: "10px", px: 1.5, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, flex: 1, minWidth: 200 }}>
                  <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
                  <TextField fullWidth variant="standard" placeholder="ค้นหาแคมเปญ..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    InputProps={{ disableUnderline: true }} sx={{ "& input": { color: c.textPrimary, fontSize: "0.85rem", py: 1.2 } }} />
                </Box>
                <Select size="small" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  sx={{ minWidth: 120, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
                  <MenuItem value="all">ทุกสถานะ</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="ended">Ended</MenuItem>
                </Select>
              </Box>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateCampOpen(true)}
                sx={{ bgcolor: c.gold, color: c.textOnGold, borderRadius: "10px", fontWeight: 700, textTransform: "none", px: 2.5, "&:hover": { bgcolor: c.goldHover } }}>
                + สร้างแคมเปญ
              </Button>
            </Box>

            {/* Campaign Grid */}
            {filteredCampaigns.length === 0 ? (
              <Box sx={{ ...card, p: 5, textAlign: "center" }}>
                <Typography sx={{ fontSize: "2rem", mb: 1 }}>📣</Typography>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: c.textPrimary, mb: 0.5 }}>ยังไม่มีแคมเปญ</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: c.textMuted }}>เริ่มสร้างแคมเปญแรกของคุณ!</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                {filteredCampaigns.map((cam, idx) => {
                  const sts = campaignStatusStyles[cam.status];
                  const days = daysRemaining(cam.endDate);
                  return (
                    <Box key={cam.id} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      sx={{ ...card, overflow: "hidden", "&:hover": { borderColor: c.gold } }}>
                      {/* Banner */}
                      <Box sx={{ position: "relative", height: 160, overflow: "hidden" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cam.bannerImage} alt={cam.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
                        <Chip label={sts.label} size="small" sx={{ position: "absolute", top: 12, right: 12, bgcolor: sts.bg, color: sts.color, fontWeight: 700, fontSize: "0.7rem" }} />
                        {cam.status === "active" && days > 0 && (
                          <Chip label={`⏳ เหลือ ${days} วัน`} size="small"
                            sx={{ position: "absolute", top: 12, left: 12, bgcolor: "rgba(0,0,0,0.6)", color: "#FFF", fontWeight: 600, fontSize: "0.65rem" }} />
                        )}
                        <Typography sx={{ position: "absolute", bottom: 12, left: 16, fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: "#FFF" }}>
                          {cam.name}
                        </Typography>
                      </Box>

                      {/* Content */}
                      <Box sx={{ p: 2.5 }}>
                        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted, mb: 2, lineHeight: 1.5 }}>{cam.description}</Typography>

                        {/* Stats */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, mb: 2 }}>
                          <Box sx={{ textAlign: "center", py: 1, bgcolor: c.bgStatBox, borderRadius: "8px" }}>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.gold }}>฿{(cam.stats.revenue / 1000).toFixed(0)}k</Typography>
                            <Typography sx={{ fontSize: "0.6rem", color: c.textMuted }}>Revenue</Typography>
                          </Box>
                          <Box sx={{ textAlign: "center", py: 1, bgcolor: c.bgStatBox, borderRadius: "8px" }}>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>{cam.stats.orders}</Typography>
                            <Typography sx={{ fontSize: "0.6rem", color: c.textMuted }}>Orders</Typography>
                          </Box>
                          <Box sx={{ textAlign: "center", py: 1, bgcolor: c.bgStatBox, borderRadius: "8px" }}>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#22C55E" }}>{cam.stats.conversion}%</Typography>
                            <Typography sx={{ fontSize: "0.6rem", color: c.textMuted }}>Conversion</Typography>
                          </Box>
                        </Box>

                        {/* Meta */}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                          {cam.linkedPromoCode && (
                            <Chip label={`🎫 ${cam.linkedPromoCode}`} size="small" sx={{ bgcolor: c.goldSubtle, color: c.gold, fontWeight: 600, fontSize: "0.7rem" }} />
                          )}
                          <Chip label={`📦 ${cam.productCount} สินค้า`} size="small" sx={{ bgcolor: c.bgStatBox, color: c.textSecondary, fontSize: "0.7rem" }} />
                          <Chip label={cam.visibility === "public" ? "🌐 Public" : "🔒 Private"} size="small" sx={{ bgcolor: c.bgStatBox, color: c.textSecondary, fontSize: "0.7rem" }} />
                        </Box>

                        {/* Date */}
                        <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>
                          📅 {cam.startDate} — {cam.endDate}
                        </Typography>

                        {/* Actions */}
                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                          <Button size="small" startIcon={<VisibilityRoundedIcon sx={{ fontSize: 14 }} />} onClick={() => setViewCampaign(cam)}
                            sx={{ flex: 1, fontSize: "0.75rem", color: c.textSecondary, borderColor: c.borderInput, textTransform: "none" }} variant="outlined">
                            ดูรายละเอียด
                          </Button>
                          <Button size="small" startIcon={<EditRoundedIcon sx={{ fontSize: 14 }} />}
                            sx={{ flex: 1, fontSize: "0.75rem", color: c.gold, borderColor: `${c.gold}44`, textTransform: "none" }} variant="outlined">
                            แก้ไข
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DIALOGS */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* Create Promotion Dialog */}
      <Dialog open={createPromoOpen} onClose={() => setCreatePromoOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700 }}>🎫 สร้างโปรโมชั่นใหม่</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {/* Basic */}
            <TextField fullWidth label="ชื่อโปรโมชั่น" value={promoForm.name} onChange={e => setPromoForm(f => ({ ...f, name: e.target.value }))}
              error={!!promoErrors.name} helperText={promoErrors.name} sx={inputSx} />
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField fullWidth label="Code" placeholder="LAYA10" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                error={!!promoErrors.code} helperText={promoErrors.code}
                sx={{ ...inputSx, "& input": { fontFamily: "monospace", letterSpacing: 2 } }} />
              <Button variant="outlined" onClick={autoGenerateCode}
                sx={{ color: c.gold, borderColor: `${c.gold}44`, textTransform: "none", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                Auto
              </Button>
            </Box>

            {/* Discount Type */}
            <FormControl>
              <FormLabel sx={{ fontSize: "0.8rem", color: c.textMuted, mb: 0.5 }}>ประเภทส่วนลด</FormLabel>
              <RadioGroup row value={promoForm.type} onChange={e => setPromoForm(f => ({ ...f, type: e.target.value as "percent" | "fixed" }))}>
                <FormControlLabel value="percent" control={<Radio sx={{ color: c.textMuted, "&.Mui-checked": { color: c.gold } }} />} label={<Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>% Discount</Typography>} />
                <FormControlLabel value="fixed" control={<Radio sx={{ color: c.textMuted, "&.Mui-checked": { color: c.gold } }} />} label={<Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>Fixed ฿</Typography>} />
              </RadioGroup>
            </FormControl>

            <TextField fullWidth type="number" label={promoForm.type === "percent" ? "ส่วนลด (%)" : "ส่วนลด (฿)"}
              value={promoForm.value} onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))}
              error={!!promoErrors.value} helperText={promoErrors.value}
              InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: c.textMuted }}>{promoForm.type === "percent" ? "%" : "฿"}</Typography></InputAdornment> }}
              sx={inputSx} />

            {/* Preview */}
            {promoForm.value && (
              <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: c.goldSubtle, border: `1px solid ${c.gold}33` }}>
                <Typography sx={{ fontSize: "0.8rem", color: c.gold, fontWeight: 600 }}>
                  👁 Preview: ลูกค้าจะได้ส่วนลด {promoForm.type === "percent" ? `${promoForm.value}%` : `฿${promoForm.value}`}
                </Typography>
              </Box>
            )}

            {/* Conditions */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
              <TextField fullWidth type="number" label="ขั้นต่ำ (฿)" value={promoForm.minSpend} onChange={e => setPromoForm(f => ({ ...f, minSpend: e.target.value }))} sx={inputSx} />
              <TextField fullWidth type="number" label="จำกัดใช้ (ครั้ง)" value={promoForm.usageLimit} onChange={e => setPromoForm(f => ({ ...f, usageLimit: e.target.value }))} sx={inputSx} />
              <TextField fullWidth type="number" label="ต่อคน" value={promoForm.perUserLimit} onChange={e => setPromoForm(f => ({ ...f, perUserLimit: e.target.value }))} sx={inputSx} />
            </Box>

            {/* Dates */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <TextField fullWidth type="date" label="วันเริ่มต้น" value={promoForm.startDate} onChange={e => setPromoForm(f => ({ ...f, startDate: e.target.value }))}
                error={!!promoErrors.startDate} helperText={promoErrors.startDate} InputLabelProps={{ shrink: true }} sx={inputSx} />
              <TextField fullWidth type="date" label="วันสิ้นสุด" value={promoForm.endDate} onChange={e => setPromoForm(f => ({ ...f, endDate: e.target.value }))}
                error={!!promoErrors.endDate} helperText={promoErrors.endDate} InputLabelProps={{ shrink: true }} sx={inputSx} />
            </Box>

            {/* Apply To */}
            <FormControl>
              <FormLabel sx={{ fontSize: "0.8rem", color: c.textMuted, mb: 0.5 }}>ใช้กับ</FormLabel>
              <RadioGroup row value={promoForm.applyTo} onChange={e => setPromoForm(f => ({ ...f, applyTo: e.target.value as "all" | "category" | "weaver" }))}>
                <FormControlLabel value="all" control={<Radio sx={{ color: c.textMuted, "&.Mui-checked": { color: c.gold } }} />} label={<Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>ทั้งหมด</Typography>} />
                <FormControlLabel value="category" control={<Radio sx={{ color: c.textMuted, "&.Mui-checked": { color: c.gold } }} />} label={<Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>ประเภท</Typography>} />
                <FormControlLabel value="weaver" control={<Radio sx={{ color: c.textMuted, "&.Mui-checked": { color: c.gold } }} />} label={<Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>ช่างทอ</Typography>} />
              </RadioGroup>
            </FormControl>
            {promoForm.applyTo !== "all" && (
              <TextField fullWidth label={promoForm.applyTo === "category" ? "ประเภท" : "ชื่อช่างทอ/ชุมชน"}
                value={promoForm.applyTarget} onChange={e => setPromoForm(f => ({ ...f, applyTarget: e.target.value }))} sx={inputSx} />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setCreatePromoOpen(false)} sx={{ color: c.textMuted, textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={createPromo}
            sx={{ bgcolor: c.gold, color: c.textOnGold, borderRadius: "8px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: c.goldHover } }}>
            สร้างโปรโมชั่น
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={createCampOpen} onClose={() => setCreateCampOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700 }}>📣 สร้างแคมเปญใหม่</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField fullWidth label="ชื่อแคมเปญ" value={campForm.name} onChange={e => setCampForm(f => ({ ...f, name: e.target.value }))} sx={inputSx} />
            <TextField fullWidth label="คำอธิบาย" multiline minRows={2} value={campForm.description} onChange={e => setCampForm(f => ({ ...f, description: e.target.value }))} sx={inputSx} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <TextField fullWidth type="date" label="วันเริ่มต้น" value={campForm.startDate} onChange={e => setCampForm(f => ({ ...f, startDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={inputSx} />
              <TextField fullWidth type="date" label="วันสิ้นสุด" value={campForm.endDate} onChange={e => setCampForm(f => ({ ...f, endDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={inputSx} />
            </Box>
            <Select fullWidth value={campForm.linkedPromoCode} displayEmpty onChange={e => setCampForm(f => ({ ...f, linkedPromoCode: e.target.value }))}
              sx={{ color: c.textPrimary, "& fieldset": { borderColor: c.borderInput }, "& .MuiSelect-icon": { color: c.textMuted } }}
              MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
              <MenuItem value="">ไม่เลือก Coupon</MenuItem>
              {promotions.filter(p => p.status !== "expired").map(p => (
                <MenuItem key={p.id} value={p.code}>{p.code} — {p.name}</MenuItem>
              ))}
            </Select>
            <FormControl>
              <FormLabel sx={{ fontSize: "0.8rem", color: c.textMuted, mb: 0.5 }}>Visibility</FormLabel>
              <RadioGroup row value={campForm.visibility} onChange={e => setCampForm(f => ({ ...f, visibility: e.target.value as "public" | "private" }))}>
                <FormControlLabel value="public" control={<Radio sx={{ color: c.textMuted, "&.Mui-checked": { color: c.gold } }} />} label={<Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>🌐 Public</Typography>} />
                <FormControlLabel value="private" control={<Radio sx={{ color: c.textMuted, "&.Mui-checked": { color: c.gold } }} />} label={<Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>🔒 Private</Typography>} />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setCreateCampOpen(false)} sx={{ color: c.textMuted, textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={createCampaign} disabled={!campForm.name.trim()}
            sx={{ bgcolor: c.gold, color: c.textOnGold, borderRadius: "8px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: c.goldHover } }}>
            สร้างแคมเปญ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Campaign Detail Dialog */}
      <Dialog open={!!viewCampaign} onClose={() => setViewCampaign(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          📣 {viewCampaign?.name}
          {viewCampaign && <Chip label={campaignStatusStyles[viewCampaign.status]?.label} size="small" sx={{ bgcolor: campaignStatusStyles[viewCampaign.status]?.bg, color: campaignStatusStyles[viewCampaign.status]?.color, fontWeight: 700 }} />}
        </DialogTitle>
        <DialogContent>
          {viewCampaign && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" }, gap: 3 }}>
              {/* Left: Content */}
              <Box>
                <Box sx={{ borderRadius: "12px", overflow: "hidden", mb: 2 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={viewCampaign.bannerImage} alt="" style={{ width: "100%", height: 200, objectFit: "cover" }} />
                </Box>
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, lineHeight: 1.6, mb: 2 }}>{viewCampaign.description}</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip label={`📅 ${viewCampaign.startDate} — ${viewCampaign.endDate}`} size="small" sx={{ bgcolor: c.bgStatBox, color: c.textSecondary, fontSize: "0.7rem" }} />
                  {viewCampaign.linkedPromoCode && <Chip label={`🎫 ${viewCampaign.linkedPromoCode}`} size="small" sx={{ bgcolor: c.goldSubtle, color: c.gold, fontSize: "0.7rem" }} />}
                  <Chip label={`📦 ${viewCampaign.productCount} สินค้า`} size="small" sx={{ bgcolor: c.bgStatBox, color: c.textSecondary, fontSize: "0.7rem" }} />
                  <Chip label={viewCampaign.visibility === "public" ? "🌐 Public" : "🔒 Private"} size="small" sx={{ bgcolor: c.bgStatBox, color: c.textSecondary, fontSize: "0.7rem" }} />
                </Box>
              </Box>

              {/* Right: Performance */}
              <Box>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary, mb: 1.5 }}>📊 Performance</Typography>
                {[
                  { label: "Revenue", value: `฿${viewCampaign.stats.revenue.toLocaleString()}`, color: c.gold },
                  { label: "Orders", value: viewCampaign.stats.orders.toString(), color: c.textPrimary },
                  { label: "Conversion Rate", value: `${viewCampaign.stats.conversion}%`, color: "#22C55E" },
                ].map(item => (
                  <Box key={item.label} sx={{ p: 2, borderRadius: "10px", bgcolor: c.bgStatBox, mb: 1.5 }}>
                    <Typography sx={{ fontSize: "0.65rem", color: c.textMuted }}>{item.label}</Typography>
                    <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: "1.2rem", color: item.color }}>{item.value}</Typography>
                  </Box>
                ))}
                {viewCampaign.status === "active" && (
                  <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <Typography sx={{ fontSize: "0.75rem", color: "#22C55E", fontWeight: 600 }}>
                      ⏳ เหลือเวลาอีก {daysRemaining(viewCampaign.endDate)} วัน
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewCampaign(null)} sx={{ color: c.textMuted, textTransform: "none" }}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }} open={!!toastMsg} autoHideDuration={3000} onClose={() => setToastMsg("")}>
        <Alert severity={toastType} sx={{
          borderRadius: "12px", fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          bgcolor: toastType === "success" ? "#065F46" : toastType === "error" ? "#7F1D1D" : "#1E3A5F", color: "#FFF",
          "& .MuiAlert-icon": { color: toastType === "success" ? "#34D399" : toastType === "error" ? "#F87171" : "#93C5FD" },
        }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
