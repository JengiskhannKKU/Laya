"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Badge from "@mui/material/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import {
  mockAdminWeavers, AdminWeaver,
  mockAdminCustomers, AdminCustomer,
  mockKYCSubmissions, KYCSubmission,
  mockAdminRoles, AdminRole,
  mockActivityLog,
} from "@/lib/mock-admin-data";

// ─── Status Styles ────────────────────────────────────────────
const weaverStatusStyles: Record<string, { label: string; color: string; bgcolor: string }> = {
  active: { label: "Active", color: "#22C55E", bgcolor: "rgba(34,197,94,0.15)" },
  pending: { label: "รอตรวจสอบ", color: "#F59E0B", bgcolor: "rgba(245,158,11,0.15)" },
  suspended: { label: "ระงับ", color: "#EF4444", bgcolor: "rgba(239,68,68,0.15)" },
};

const kycStatusStyles: Record<string, { label: string; color: string; bgcolor: string }> = {
  pending: { label: "รอตรวจ", color: "#F59E0B", bgcolor: "rgba(245,158,11,0.15)" },
  approved: { label: "อนุมัติ", color: "#22C55E", bgcolor: "rgba(34,197,94,0.15)" },
  rejected: { label: "ปฏิเสธ", color: "#EF4444", bgcolor: "rgba(239,68,68,0.15)" },
};

const logTypeIcons: Record<string, { icon: string; color: string }> = {
  approve: { icon: "✅", color: "#22C55E" },
  reject: { icon: "❌", color: "#EF4444" },
  suspend: { icon: "⛔", color: "#EF4444" },
  create: { icon: "➕", color: "#3B82F6" },
  update: { icon: "✏️", color: "#F59E0B" },
  delete: { icon: "🗑️", color: "#EF4444" },
};

type TabType = "customers" | "weavers" | "kyc" | "roles";

// ═══════════════════════════════════════════════════════════════
export default function UsersManagementPage() {
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, transition: tr };

  // ── State ──
  const [activeTab, setActiveTab] = useState<TabType>("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // Weavers
  const [weavers, setWeavers] = useState<AdminWeaver[]>([...mockAdminWeavers]);
  const [viewWeaver, setViewWeaver] = useState<AdminWeaver | null>(null);
  const [suspendDialog, setSuspendDialog] = useState<AdminWeaver | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // KYC
  const [kycList, setKycList] = useState<KYCSubmission[]>([...mockKYCSubmissions]);
  const [previewKYC, setPreviewKYC] = useState<KYCSubmission | null>(null);
  const [rejectDialog, setRejectDialog] = useState<KYCSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Roles
  const [roles, setRoles] = useState<AdminRole[]>([...mockAdminRoles]);
  const [createRoleDialog, setCreateRoleDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState({
    manageProducts: false, manageOrders: false, manageUsers: false,
    viewAnalytics: false, manageSettings: false, manageCommunities: false,
  });

  // ── Tab counts ──
  const pendingKYC = kycList.filter(k => k.status === "pending").length;
  const pendingWeavers = weavers.filter(w => w.status === "pending").length;

  // ── Toast helper ──
  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg(msg); setToastType(type);
  };

  // ── Weaver actions ──
  const approveWeaver = (id: string) => {
    setWeavers(prev => prev.map(w => w.id === id ? { ...w, status: "active" as const, kycVerified: true } : w));
    showToast("อนุมัติช่างทอสำเร็จ ✅");
  };
  const confirmSuspend = () => {
    if (!suspendDialog) return;
    setWeavers(prev => prev.map(w => w.id === suspendDialog.id ? { ...w, status: "suspended" as const } : w));
    setSuspendDialog(null); setSuspendReason("");
    showToast("ระงับบัญชีช่างทอแล้ว");
  };

  // ── KYC actions ──
  const approveKYC = (id: string) => {
    setKycList(prev => prev.map(k => k.id === id ? { ...k, status: "approved" as const, reviewedBy: "Admin A", reviewedDate: new Date().toISOString().slice(0, 10) } : k));
    showToast("อนุมัติ KYC สำเร็จ ✅");
  };
  const confirmRejectKYC = () => {
    if (!rejectDialog) return;
    setKycList(prev => prev.map(k => k.id === rejectDialog.id ? { ...k, status: "rejected" as const, rejectedReason: rejectReason, reviewedBy: "Admin A", reviewedDate: new Date().toISOString().slice(0, 10) } : k));
    setRejectDialog(null); setRejectReason("");
    showToast("ปฏิเสธ KYC แล้ว", "error");
  };

  // ── Role actions ──
  const createRole = () => {
    if (!newRoleName.trim()) return;
    const nr: AdminRole = {
      id: `r${Date.now()}`, name: newRoleName.trim(), description: "", usersCount: 0,
      permissions: { ...newRolePerms },
    };
    setRoles(prev => [...prev, nr]);
    setCreateRoleDialog(false); setNewRoleName(""); setNewRolePerms({ manageProducts: false, manageOrders: false, manageUsers: false, viewAnalytics: false, manageSettings: false, manageCommunities: false });
    showToast(`สร้าง Role "${nr.name}" สำเร็จ`);
  };

  // ── Filtered data ──
  const filteredWeavers = weavers.filter(w => {
    const q = searchQuery.toLowerCase();
    const matchSearch = w.name.toLowerCase().includes(q) || w.community.toLowerCase().includes(q) || w.province.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredCustomers = mockAdminCustomers.filter(c2 =>
    c2.name.toLowerCase().includes(searchQuery.toLowerCase()) || c2.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Tabs Config ──
  const tabs: { key: TabType; label: string; badge?: number }[] = [
    { key: "customers", label: "Customers" },
    { key: "weavers", label: "Weavers", badge: pendingWeavers > 0 ? pendingWeavers : undefined },
    { key: "kyc", label: "KYC Verification", badge: pendingKYC > 0 ? pendingKYC : undefined },
    { key: "roles", label: "Roles & Permissions" },
  ];

  // ════════════════════════════════════════════════════════════════
  return (
    <Box>
      {/* ── Header + Tabs ── */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, mb: 0.5 }}>
          👥 User Management
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted, mb: 2.5 }}>
          จัดการลูกค้า, ช่างทอ, ยืนยันตัวตน และสิทธิ์การใช้งาน
        </Typography>

        {/* Tabs */}
        <Box sx={{ display: "flex", gap: 0.5, bgcolor: c.bgCard, borderRadius: "12px", p: 0.5, border: `1px solid ${c.borderCard}`, overflow: "auto" }}>
          {tabs.map(tab => (
            <Box
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearchQuery(""); }}
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
              {tab.label}
              {tab.badge && (
                <Box sx={{
                  minWidth: 20, height: 20, borderRadius: "10px", px: 0.5,
                  bgcolor: "#EF4444", color: "#FFF", fontSize: "0.65rem",
                  fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {tab.badge}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Search (shared) ── */}
      {activeTab !== "roles" && (
        <Box sx={{ bgcolor: c.bgInputField, borderRadius: "10px", px: 1.5, mb: 3, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, transition: tr }}>
          <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
          <TextField fullWidth variant="standard"
            placeholder={activeTab === "customers" ? "ค้นหาลูกค้า..." : activeTab === "weavers" ? "ค้นหาช่างทอ, ชุมชน, จังหวัด..." : "ค้นหา KYC..."}
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ "& input": { color: c.textPrimary, fontSize: "0.85rem", py: 1.2 } }}
          />
          {activeTab === "weavers" && (
            <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 120, color: c.textPrimary, fontSize: "0.8rem", "& fieldset": { borderColor: c.borderInput }, "& .MuiSelect-icon": { color: c.textMuted } }}
              MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          )}
        </Box>
      )}

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: CUSTOMERS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "customers" && (
          <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Box sx={{ ...card, overflow: "hidden" }}>
              {/* Header */}
              <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "2.5fr 2fr 1fr 1fr 1fr 0.8fr", px: 3, py: 1.5, bgcolor: c.bgTableHeader, borderBottom: `1px solid ${c.borderCard}` }}>
                {["ลูกค้า", "อีเมล", "คำสั่งซื้อ", "ยอดใช้จ่าย", "เข้าระบบล่าสุด", "สถานะ"].map(h => (
                  <Typography key={h} sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
                ))}
              </Box>
              {filteredCustomers.map((cust, idx) => (
                <Box key={cust.id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                  sx={{ display: { xs: "flex", md: "grid" }, flexDirection: { xs: "column" }, gridTemplateColumns: { md: "2.5fr 2fr 1fr 1fr 1fr 0.8fr" }, alignItems: "center", px: 3, py: 2, borderBottom: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover }, gap: { xs: 0.5, md: 0 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: c.gold, fontSize: "0.85rem", fontWeight: 700, color: c.textOnGold }}>{cust.avatar}</Avatar>
                    <Box>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{cust.name}</Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>{cust.province}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary }}>{cust.email}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{cust.totalOrders}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.gold }}>฿{cust.totalSpent.toLocaleString()}</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>{cust.lastActive}</Typography>
                  <Chip label={cust.status === "active" ? "Active" : "Inactive"} size="small"
                    sx={{ bgcolor: cust.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.15)", color: cust.status === "active" ? "#22C55E" : "#6B7280", fontWeight: 700, fontSize: "0.7rem", height: 24 }} />
                </Box>
              ))}
            </Box>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: WEAVERS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "weavers" && (
          <motion.div key="weavers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Stats */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
              {[
                { label: "Active", value: weavers.filter(w => w.status === "active").length, color: "#22C55E" },
                { label: "Pending", value: pendingWeavers, color: "#F59E0B" },
                { label: "Suspended", value: weavers.filter(w => w.status === "suspended").length, color: "#EF4444" },
              ].map(s => (
                <Box key={s.label} sx={{ ...card, p: 2, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600 }}>{s.label}</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.6rem", color: s.color }}>{s.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Cards Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              {filteredWeavers.map((w, idx) => {
                const sts = weaverStatusStyles[w.status] || weaverStatusStyles.active;
                return (
                  <Box key={w.id} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    sx={{
                      ...card, p: 2.5, position: "relative",
                      "&:hover": { borderColor: c.gold },
                      ...(w.status === "pending" && { boxShadow: `0 0 0 1px ${weaverStatusStyles.pending.color}40`, borderColor: `${weaverStatusStyles.pending.color}60` }),
                    }}>
                    {/* Status Badge (top right) */}
                    <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                      <Chip label={sts.label} size="small" sx={{ bgcolor: sts.bgcolor, color: sts.color, fontWeight: 700, fontSize: "0.7rem" }} />
                    </Box>

                    {/* Header */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Avatar sx={{
                        width: 48, height: 48,
                        bgcolor: w.status === "pending" ? "#F59E0B" : w.status === "suspended" ? "#EF4444" : c.gold,
                        fontSize: "1.1rem", fontWeight: 700, color: "#FFF",
                      }}>{w.avatar}</Avatar>
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>{w.name}</Typography>
                          {w.kycVerified && (
                            <Tooltip title="บัญชีนี้ได้รับการยืนยันแล้ว">
                              <VerifiedRoundedIcon sx={{ fontSize: 14, color: "#22C55E" }} />
                            </Tooltip>
                          )}
                        </Box>
                        <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>{w.community} • {w.province}</Typography>
                      </Box>
                    </Box>

                    {/* Stats */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, mb: 2 }}>
                      <Box sx={{ textAlign: "center", py: 1, bgcolor: c.bgStatBox, borderRadius: "8px" }}>
                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.gold }}>฿{(w.totalRevenue / 1000).toFixed(0)}k</Typography>
                        <Typography sx={{ fontSize: "0.6rem", color: c.textMuted }}>รายรับ</Typography>
                      </Box>
                      <Box sx={{ textAlign: "center", py: 1, bgcolor: c.bgStatBox, borderRadius: "8px" }}>
                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>{w.totalOrders}</Typography>
                        <Typography sx={{ fontSize: "0.6rem", color: c.textMuted }}>ออเดอร์</Typography>
                      </Box>
                      <Box sx={{ textAlign: "center", py: 1, bgcolor: c.bgStatBox, borderRadius: "8px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3 }}>
                          <StarRoundedIcon sx={{ fontSize: 14, color: c.gold }} />
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>{w.rating || "-"}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.6rem", color: c.textMuted }}>Rating</Typography>
                      </Box>
                    </Box>

                    {/* Techniques */}
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
                      {w.techniques.map(tech => (
                        <Chip key={tech} label={tech} size="small" sx={{ bgcolor: c.bgStatBox, color: c.textSecondary, fontSize: "0.7rem", height: 22 }} />
                      ))}
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button size="small" startIcon={<VisibilityRoundedIcon sx={{ fontSize: 14 }} />} onClick={() => setViewWeaver(w)}
                        sx={{ flex: 1, fontSize: "0.75rem", color: c.textSecondary, borderColor: c.borderInput, textTransform: "none" }} variant="outlined">
                        ดูรายละเอียด
                      </Button>
                      {w.status === "pending" && (
                        <Button size="small" startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />} onClick={() => approveWeaver(w.id)}
                          sx={{ flex: 1, fontSize: "0.75rem", color: "#22C55E", borderColor: "rgba(34,197,94,0.3)", textTransform: "none" }} variant="outlined">
                          อนุมัติ
                        </Button>
                      )}
                      {w.status === "active" && (
                        <Button size="small" startIcon={<BlockRoundedIcon sx={{ fontSize: 14 }} />} onClick={() => setSuspendDialog(w)}
                          sx={{ flex: 1, fontSize: "0.75rem", color: "#EF4444", borderColor: "rgba(239,68,68,0.2)", textTransform: "none" }} variant="outlined">
                          ระงับ
                        </Button>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: KYC VERIFICATION */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "kyc" && (
          <motion.div key="kyc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {kycList.map((kyc, idx) => {
                const sts = kycStatusStyles[kyc.status];
                const isPending = kyc.status === "pending";
                return (
                  <Box key={kyc.id} component={motion.div} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    sx={{
                      ...card, p: 2.5,
                      ...(isPending && { boxShadow: `0 0 12px ${weaverStatusStyles.pending.color}20`, borderColor: `${weaverStatusStyles.pending.color}40` }),
                    }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ width: 44, height: 44, bgcolor: isPending ? "#F59E0B" : c.gold, fontSize: "1rem", fontWeight: 700, color: "#FFF" }}>{kyc.avatar}</Avatar>
                        <Box>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>{kyc.weaverName}</Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>{kyc.community} • {kyc.province}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>สมัคร: {kyc.submittedDate}</Typography>
                        <Chip label={sts.label} size="small" sx={{ bgcolor: sts.bgcolor, color: sts.color, fontWeight: 700, fontSize: "0.7rem" }} />
                      </Box>
                    </Box>

                    {/* Document Preview */}
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
                      <Box sx={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${c.borderCard}`, cursor: "pointer", position: "relative", "&:hover .overlay": { opacity: 1 } }}
                        onClick={() => setPreviewKYC(kyc)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={kyc.idCardImage} alt="ID Card" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                        <Box className="overlay" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: tr }}>
                          <Typography sx={{ color: "#FFF", fontSize: "0.8rem", fontWeight: 600 }}>🔍 ดูเต็ม</Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, textAlign: "center", py: 0.5, bgcolor: c.bgStatBox }}>📄 บัตรประชาชน</Typography>
                      </Box>
                      <Box sx={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${c.borderCard}`, cursor: "pointer", position: "relative", "&:hover .overlay": { opacity: 1 } }}
                        onClick={() => setPreviewKYC(kyc)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={kyc.selfieImage} alt="Selfie" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                        <Box className="overlay" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: tr }}>
                          <Typography sx={{ color: "#FFF", fontSize: "0.8rem", fontWeight: 600 }}>🔍 ดูเต็ม</Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, textAlign: "center", py: 0.5, bgcolor: c.bgStatBox }}>🤳 รูปหน้าตรง</Typography>
                      </Box>
                    </Box>

                    {/* Reject Reason */}
                    {kyc.status === "rejected" && kyc.rejectedReason && (
                      <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "rgba(239,68,68,0.08)", mb: 2, display: "flex", gap: 1 }}>
                        <WarningAmberRoundedIcon sx={{ fontSize: 16, color: "#EF4444", mt: 0.2 }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#EF4444" }}>เหตุผล: {kyc.rejectedReason}</Typography>
                      </Box>
                    )}

                    {kyc.reviewedBy && (
                      <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, mb: 1.5 }}>
                        ตรวจสอบโดย: {kyc.reviewedBy} • {kyc.reviewedDate}
                      </Typography>
                    )}

                    {/* Actions */}
                    {isPending && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button size="small" variant="contained" startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => approveKYC(kyc.id)}
                          sx={{ flex: 1, bgcolor: "#22C55E", color: "#FFF", textTransform: "none", fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#16A34A" } }}>
                          อนุมัติ
                        </Button>
                        <Button size="small" variant="contained" startIcon={<CloseRoundedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => { setRejectDialog(kyc); setRejectReason(""); }}
                          sx={{ flex: 1, bgcolor: "#EF4444", color: "#FFF", textTransform: "none", fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#DC2626" } }}>
                          ปฏิเสธ
                        </Button>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: ROLES & PERMISSIONS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "roles" && (
          <motion.div key="roles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateRoleDialog(true)}
                sx={{ bgcolor: c.gold, color: c.textOnGold, borderRadius: "10px", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: c.goldHover } }}>
                สร้าง Role ใหม่
              </Button>
            </Box>

            {/* Roles Table */}
            <Box sx={{ ...card, overflow: "hidden", mb: 3 }}>
              <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "1.5fr 2fr 0.7fr 1fr 1fr 1fr 1fr 1fr 1fr", px: 3, py: 1.5, bgcolor: c.bgTableHeader, borderBottom: `1px solid ${c.borderCard}` }}>
                {["Role", "คำอธิบาย", "Users", "Products", "Orders", "Users", "Analytics", "Settings", "Communities"].map(h => (
                  <Typography key={h} sx={{ fontSize: "0.65rem", fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
                ))}
              </Box>
              {roles.map((role) => (
                <Box key={role.id} sx={{ display: { xs: "flex", md: "grid" }, flexDirection: "column", gridTemplateColumns: { md: "1.5fr 2fr 0.7fr 1fr 1fr 1fr 1fr 1fr 1fr" }, alignItems: "center", px: 3, py: 2, borderBottom: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover }, gap: { xs: 0.5, md: 0 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SecurityRoundedIcon sx={{ fontSize: 18, color: c.gold }} />
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary }}>{role.name}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>{role.description}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textSecondary }}>{role.usersCount}</Typography>
                  {Object.values(role.permissions).map((perm, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-start" } }}>
                      <Box sx={{
                        width: 20, height: 20, borderRadius: "6px",
                        bgcolor: perm ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Typography sx={{ fontSize: "0.7rem" }}>{perm ? "✅" : "—"}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>

            {/* Activity Log */}
            <Box sx={card}>
              <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${c.borderCard}`, display: "flex", alignItems: "center", gap: 1 }}>
                <HistoryRoundedIcon sx={{ fontSize: 18, color: c.gold }} />
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary }}>
                  Activity Log
                </Typography>
              </Box>
              {mockActivityLog.map((log) => {
                const lt = logTypeIcons[log.type] || logTypeIcons.update;
                return (
                  <Box key={log.id} sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${c.borderCard}`, display: "flex", alignItems: "center", gap: 2, "&:hover": { bgcolor: c.bgCardHover } }}>
                    <Typography sx={{ fontSize: "1rem" }}>{lt.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: "0.8rem", color: c.textPrimary }}>
                        <strong>{log.actor}</strong> {log.action} <strong style={{ color: c.gold }}>{log.target}</strong>
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, whiteSpace: "nowrap" }}>{log.timestamp}</Typography>
                  </Box>
                );
              })}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DIALOGS */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* Weaver Detail Dialog */}
      <Dialog open={!!viewWeaver} onClose={() => setViewWeaver(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          ข้อมูลช่างทอ
          <Chip label={viewWeaver ? (weaverStatusStyles[viewWeaver.status]?.label || "") : ""} size="small"
            sx={{ bgcolor: viewWeaver ? weaverStatusStyles[viewWeaver.status]?.bgcolor : "", color: viewWeaver ? weaverStatusStyles[viewWeaver.status]?.color : "", fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent>
          {viewWeaver && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.5fr" }, gap: 3 }}>
              {/* Left: Profile */}
              <Box sx={{ textAlign: "center" }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: c.gold, fontSize: "2rem", fontWeight: 700, color: c.textOnGold, mx: "auto", mb: 2 }}>{viewWeaver.avatar}</Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: c.dialogText }}>{viewWeaver.name}</Typography>
                {viewWeaver.kycVerified && (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 0.5 }}>
                    <VerifiedRoundedIcon sx={{ fontSize: 14, color: "#22C55E" }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "#22C55E", fontWeight: 600 }}>Verified</Typography>
                  </Box>
                )}
                <Typography sx={{ fontSize: "0.8rem", color: c.textMuted, mt: 0.5 }}>{viewWeaver.community}</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>{viewWeaver.province}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: c.textMuted, mt: 1 }}>เข้าร่วม: {viewWeaver.joinDate}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>โทร: {viewWeaver.phone}</Typography>

                <Box sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "center" }}>
                  {viewWeaver.status === "pending" && (
                    <Button size="small" variant="contained" onClick={() => { approveWeaver(viewWeaver.id); setViewWeaver(null); }}
                      sx={{ bgcolor: "#22C55E", color: "#FFF", textTransform: "none", fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#16A34A" } }}>
                      ✅ Approve
                    </Button>
                  )}
                  {viewWeaver.status === "active" && (
                    <Button size="small" variant="contained" onClick={() => { setViewWeaver(null); setSuspendDialog(viewWeaver); }}
                      sx={{ bgcolor: "#EF4444", color: "#FFF", textTransform: "none", fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#DC2626" } }}>
                      ⛔ Suspend
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Right: Data */}
              <Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                  {[
                    { label: "รายรับรวม", value: `฿${viewWeaver.totalRevenue.toLocaleString()}`, color: c.gold },
                    { label: "ออเดอร์", value: `${viewWeaver.totalOrders}`, color: c.textPrimary },
                    { label: "Rating", value: `⭐ ${viewWeaver.rating || "-"}`, color: c.textPrimary },
                    { label: "KYC", value: viewWeaver.kycVerified ? "✓ ยืนยัน" : "รอตรวจ", color: viewWeaver.kycVerified ? "#22C55E" : "#F59E0B" },
                  ].map(item => (
                    <Box key={item.label} sx={{ p: 2, borderRadius: "10px", bgcolor: c.bgStatBox }}>
                      <Typography sx={{ fontSize: "0.65rem", color: c.textMuted, mb: 0.3 }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: item.color }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ borderColor: c.borderDivider, my: 2 }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: c.textPrimary, mb: 1 }}>เทคนิคการทอ</Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {viewWeaver.techniques.map(t => (
                    <Chip key={t} label={t} size="small" sx={{ bgcolor: c.goldSubtle, color: c.gold, fontWeight: 600 }} />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewWeaver(null)} sx={{ color: c.textMuted, textTransform: "none" }}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={!!suspendDialog} onClose={() => setSuspendDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BlockRoundedIcon sx={{ color: "#EF4444", fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem" }}>ระงับบัญชีช่างทอ</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, mb: 2 }}>
            ระงับบัญชี <strong>{suspendDialog?.name}</strong>?
          </Typography>
          <TextField fullWidth multiline minRows={2} label="เหตุผล" placeholder="ระบุเหตุผลในการระงับ..." value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { color: c.dialogText, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setSuspendDialog(null)} sx={{ color: c.textMuted, textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={confirmSuspend}
            sx={{ bgcolor: "#EF4444", color: "#FFF", borderRadius: "8px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#DC2626" } }}>
            ยืนยันระงับ
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Reject Dialog */}
      <Dialog open={!!rejectDialog} onClose={() => setRejectDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WarningAmberRoundedIcon sx={{ color: "#EF4444", fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem" }}>ปฏิเสธการยืนยันตัวตน</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, mb: 2 }}>
            ปฏิเสธ KYC ของ <strong>{rejectDialog?.weaverName}</strong>?
          </Typography>
          <TextField fullWidth multiline minRows={2} label="เหตุผล" placeholder="เช่น รูปบัตรไม่ชัด..." value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { color: c.dialogText, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setRejectDialog(null)} sx={{ color: c.textMuted, textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={confirmRejectKYC}
            sx={{ bgcolor: "#EF4444", color: "#FFF", borderRadius: "8px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#DC2626" } }}>
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Preview Dialog */}
      <Dialog open={!!previewKYC} onClose={() => setPreviewKYC(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
          เอกสาร KYC — {previewKYC?.weaverName}
          <Chip label={previewKYC ? kycStatusStyles[previewKYC.status]?.label : ""} size="small"
            sx={{ bgcolor: previewKYC ? kycStatusStyles[previewKYC.status]?.bgcolor : "", color: previewKYC ? kycStatusStyles[previewKYC.status]?.color : "", fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent>
          {previewKYC && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, mb: 1 }}>📄 บัตรประชาชน</Typography>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewKYC.idCardImage} alt="ID Card" style={{ width: "100%", borderRadius: 12, objectFit: "cover" }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, mb: 1 }}>🤳 รูปหน้าตรง</Typography>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewKYC.selfieImage} alt="Selfie" style={{ width: "100%", borderRadius: 12, objectFit: "cover" }} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {previewKYC?.status === "pending" && (
            <>
              <Button variant="contained" onClick={() => { approveKYC(previewKYC.id); setPreviewKYC(null); }}
                sx={{ bgcolor: "#22C55E", color: "#FFF", textTransform: "none", fontWeight: 700, borderRadius: "8px" }}>
                ✅ อนุมัติ
              </Button>
              <Button variant="contained" onClick={() => { setPreviewKYC(null); setRejectDialog(previewKYC); }}
                sx={{ bgcolor: "#EF4444", color: "#FFF", textTransform: "none", fontWeight: 700, borderRadius: "8px" }}>
                ❌ ปฏิเสธ
              </Button>
            </>
          )}
          <Button onClick={() => setPreviewKYC(null)} sx={{ color: c.textMuted, textTransform: "none" }}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={createRoleDialog} onClose={() => setCreateRoleDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700 }}>➕ สร้าง Role ใหม่</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="ชื่อ Role" placeholder="e.g. Community Manager" value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
            sx={{ mb: 2, mt: 1, "& .MuiOutlinedInput-root": { color: c.dialogText, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } }} />
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, mb: 1 }}>Permissions</Typography>
          {[
            { key: "manageProducts" as const, label: "จัดการสินค้า" },
            { key: "manageOrders" as const, label: "จัดการออเดอร์" },
            { key: "manageUsers" as const, label: "จัดการผู้ใช้" },
            { key: "viewAnalytics" as const, label: "ดู Analytics" },
            { key: "manageSettings" as const, label: "จัดการตั้งค่า" },
            { key: "manageCommunities" as const, label: "จัดการชุมชน" },
          ].map(perm => (
            <FormControlLabel key={perm.key}
              control={<Checkbox checked={newRolePerms[perm.key]} onChange={e => setNewRolePerms(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                sx={{ color: c.textMuted, "&.Mui-checked": { color: c.gold } }} />}
              label={<Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>{perm.label}</Typography>}
            />
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setCreateRoleDialog(false)} sx={{ color: c.textMuted, textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={createRole} disabled={!newRoleName.trim()}
            sx={{ bgcolor: c.gold, color: c.textOnGold, borderRadius: "8px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: c.goldHover } }}>
            สร้าง Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }} open={!!toastMsg} autoHideDuration={3000} onClose={() => setToastMsg("")}>
        <Alert severity={toastType} sx={{
          borderRadius: "12px", fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          bgcolor: toastType === "success" ? "#065F46" : toastType === "error" ? "#7F1D1D" : "#1E3A5F",
          color: "#FFF",
          "& .MuiAlert-icon": { color: toastType === "success" ? "#34D399" : toastType === "error" ? "#F87171" : "#93C5FD" },
        }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
