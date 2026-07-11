"use client";

import { useState, useMemo, type ReactNode, type ReactElement } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Rating from "@mui/material/Rating";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

import {
  mockReports, AdminReport,
  mockAdminReviews, AdminReview,
  mockModerationSuggestions,
} from "@/lib/mock-admin-data";

type ModerationTab = "reports" | "reviews";

const reportStatusStyles: Record<string, { label: string; color: string; bg: string; icon: ReactElement }> = {
  pending: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.15)", icon: <CircleRoundedIcon sx={{ fontSize: 10 }} /> },
  investigating: { label: "Investigating", color: "#3B82F6", bg: "rgba(59,130,246,0.15)", icon: <CircleRoundedIcon sx={{ fontSize: 10 }} /> },
  resolved: { label: "Resolved", color: "#22C55E", bg: "rgba(34,197,94,0.15)", icon: <CircleRoundedIcon sx={{ fontSize: 10 }} /> },
  rejected: { label: "Rejected", color: "#6B7280", bg: "rgba(107,114,128,0.15)", icon: <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 10 }} /> },
};
const reviewStatusStyles: Record<string, { label: string; color: string; bg: string; icon: ReactElement }> = {
  approved: { label: "Approved", color: "#22C55E", bg: "rgba(34,197,94,0.15)", icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> },
  pending: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.15)", icon: <CircleRoundedIcon sx={{ fontSize: 10 }} /> },
  hidden: { label: "Hidden", color: "#6B7280", bg: "rgba(107,114,128,0.15)", icon: <VisibilityOffRoundedIcon sx={{ fontSize: 14 }} /> },
  deleted: { label: "Deleted", color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: <DeleteRoundedIcon sx={{ fontSize: 14 }} /> },
};
const typeIcons: Record<string, ReactNode> = {
  product: <Inventory2RoundedIcon sx={{ fontSize: 16 }} />,
  user: <PersonRoundedIcon sx={{ fontSize: 16 }} />,
  review: <ChatBubbleRoundedIcon sx={{ fontSize: 16 }} />,
};
const priorityStyles: Record<string, { label: string; color: string; bg: string; icon?: ReactElement }> = {
  high: { label: "High", color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 12 }} /> },
  medium: { label: "Medium", color: "#F59E0B", bg: "rgba(245,158,11,0.15)", icon: <BoltRoundedIcon sx={{ fontSize: 12 }} /> },
  low: { label: "Low", color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
};

// ════════════════════════════════════════════════════════════════
export default function ModerationPage() {
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, transition: tr };

  const [activeTab, setActiveTab] = useState<ModerationTab>("reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // Reports
  const [reports, setReports] = useState<AdminReport[]>([...mockReports]);
  const [viewReport, setViewReport] = useState<AdminReport | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: string; target: AdminReport | null }>({ type: "", target: null });
  const [adminNote, setAdminNote] = useState("");
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());

  // Reviews
  const [reviews, setReviews] = useState<AdminReview[]>([...mockAdminReviews]);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => { setToastMsg(msg); setToastType(type); };

  // ── KPI counts ──
  const pendingReports = reports.filter(r => r.status === "pending").length;
  const resolvedReports = reports.filter(r => r.status === "resolved").length;
  const highPriority = reports.filter(r => r.priority === "high" && r.status !== "resolved").length;
  const pendingReviews = reviews.filter(r => r.status === "pending").length;
  const flaggedReviews = reviews.filter(r => r.flagged).length;

  // ── Filtered ──
  const filteredReports = useMemo(() => {
    return reports
      .filter(r => {
        const q = searchQuery.toLowerCase();
        return (r.id.toLowerCase().includes(q) || r.targetName.toLowerCase().includes(q) || r.reporterName.toLowerCase().includes(q)) &&
          (statusFilter === "all" || r.status === statusFilter) &&
          (typeFilter === "all" || r.type === typeFilter);
      })
      .sort((a, b) => {
        const prio = { high: 0, medium: 1, low: 2 };
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return (prio[a.priority] || 2) - (prio[b.priority] || 2);
      });
  }, [reports, searchQuery, statusFilter, typeFilter]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const q = searchQuery.toLowerCase();
      return (r.userName.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q)) &&
        (statusFilter === "all" || r.status === statusFilter) &&
        (ratingFilter === "all" || r.rating === Number(ratingFilter));
    });
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  // ── Report Actions ──
  const resolveReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" as const, adminNote: adminNote || r.adminNote, timeline: [...r.timeline, { time: new Date().toLocaleString("th-TH"), action: "Mark as Resolved", actor: "Admin A" }] } : r));
    setViewReport(null); setAdminNote(""); showToast("Report resolved");
  };
  const rejectReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" as const, adminNote: adminNote || r.adminNote, timeline: [...r.timeline, { time: new Date().toLocaleString("th-TH"), action: "Rejected report", actor: "Admin A" }] } : r));
    setViewReport(null); setAdminNote(""); showToast("Report rejected");
  };
  const confirmAction = () => {
    if (!confirmDialog.target) return;
    if (confirmDialog.type === "suspend") {
      showToast(`ระงับบัญชี "${confirmDialog.target.targetName}" แล้ว`, "error");
    } else if (confirmDialog.type === "remove") {
      showToast(`ลบสินค้า "${confirmDialog.target.targetName}" แล้ว`, "error");
    }
    resolveReport(confirmDialog.target.id);
    setConfirmDialog({ type: "", target: null });
  };
  const bulkResolve = () => {
    setReports(prev => prev.map(r => selectedReports.has(r.id) ? { ...r, status: "resolved" as const, timeline: [...r.timeline, { time: new Date().toLocaleString("th-TH"), action: "Bulk resolved", actor: "Admin A" }] } : r));
    showToast(`Resolved ${selectedReports.size} reports`);
    setSelectedReports(new Set());
  };
  const toggleReportSelect = (id: string) => {
    setSelectedReports(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // ── Review Actions ──
  const approveReview = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: "approved" as const, flagged: false } : r));
    showToast("Review approved");
  };
  const hideReview = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: "hidden" as const } : r));
    showToast("Review hidden");
  };
  const deleteReview = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: "deleted" as const } : r));
    showToast("Review deleted", "error");
  };

  const tabs: { key: ModerationTab; label: string; icon: ReactNode; badge?: number }[] = [
    { key: "reports", label: "Reports", icon: <ReportRoundedIcon sx={{ fontSize: 16 }} />, badge: pendingReports > 0 ? pendingReports : undefined },
    { key: "reviews", label: "Reviews", icon: <StarRoundedIcon sx={{ fontSize: 16 }} />, badge: pendingReviews > 0 ? pendingReviews : undefined },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <SecurityRoundedIcon sx={{ fontSize: 20, color: c.textPrimary }} />
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary }}>
            Moderation
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted, mb: 2.5 }}>
          จัดการรายงานปัญหา, ตรวจสอบรีวิว และปกป้องคุณภาพของ platform
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, bgcolor: c.bgCard, borderRadius: "12px", p: 0.5, border: `1px solid ${c.borderCard}` }}>
          {tabs.map(tab => (
            <Box key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchQuery(""); setStatusFilter("all"); setTypeFilter("all"); setRatingFilter("all"); }}
              sx={{
                px: 2.5, py: 1, borderRadius: "10px", cursor: "pointer",
                bgcolor: activeTab === tab.key ? c.goldSubtle : "transparent",
                color: activeTab === tab.key ? c.gold : c.textMuted,
                fontWeight: activeTab === tab.key ? 700 : 500, fontSize: "0.85rem", transition: tr,
                display: "flex", alignItems: "center", gap: 1,
                "&:hover": { bgcolor: activeTab === tab.key ? c.goldSubtle : c.bgCardHover },
              }}>
              {tab.icon} {tab.label}
              {tab.badge && (
                <Box sx={{ minWidth: 20, height: 20, borderRadius: "10px", px: 0.5, bgcolor: "#EF4444", color: "#FFF", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {tab.badge}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: REPORTS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "reports" && (
          <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* KPI Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
              {[
                { label: "Pending", value: pendingReports, color: "#F59E0B", icon: <CircleRoundedIcon sx={{ fontSize: 10 }} /> },
                { label: "Resolved", value: resolvedReports, color: "#22C55E", icon: <CircleRoundedIcon sx={{ fontSize: 10 }} /> },
                { label: "High Priority", value: highPriority, color: "#EF4444", icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 12 }} /> },
              ].map(kpi => (
                <Box key={kpi.label} sx={{ ...card, p: 2, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    <Box component="span" sx={{ display: "flex", color: kpi.color }}>{kpi.icon}</Box> {kpi.label}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.6rem", color: kpi.color }}>{kpi.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* AI Suggestion Box */}
            {mockModerationSuggestions.length > 0 && (
              <Box sx={{ ...card, p: 2, mb: 3, border: `1px solid ${c.gold}33`, background: `linear-gradient(135deg, ${c.bgCard}, rgba(197,165,90,0.05))` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: c.gold }} />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: c.gold }}>AI Smart Suggestions</Typography>
                </Box>
                {mockModerationSuggestions.map((s, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1.5, py: 0.8, borderBottom: i < mockModerationSuggestions.length - 1 ? `1px solid ${c.borderCard}` : "none" }}>
                    <Typography sx={{ fontSize: "0.9rem" }}>{s.icon}</Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary, lineHeight: 1.5 }}>{s.text}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Filter Bar */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
              <Box sx={{ bgcolor: c.bgInputField, borderRadius: "10px", px: 1.5, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, flex: 1, minWidth: 200 }}>
                <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
                <TextField fullWidth variant="standard" placeholder="ค้นหา Report ID / ชื่อ..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{ disableUnderline: true }} sx={{ "& input": { color: c.textPrimary, fontSize: "0.85rem", py: 1.2 } }} />
              </Box>
              <Select size="small" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                sx={{ minWidth: 110, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
                <MenuItem value="all">ทุกประเภท</MenuItem>
                <MenuItem value="product"><Inventory2RoundedIcon sx={{ fontSize: 16, mr: 0.75 }} />Product</MenuItem>
                <MenuItem value="user"><PersonRoundedIcon sx={{ fontSize: 16, mr: 0.75 }} />User</MenuItem>
                <MenuItem value="review"><ChatBubbleRoundedIcon sx={{ fontSize: 16, mr: 0.75 }} />Review</MenuItem>
              </Select>
              <Select size="small" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                sx={{ minWidth: 130, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
                <MenuItem value="all">ทุกสถานะ</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="investigating">Investigating</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
              {selectedReports.size > 0 && (
                <Button variant="contained" size="small" onClick={bulkResolve} startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ bgcolor: "#22C55E", color: "#FFF", borderRadius: "8px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#16A34A" } }}>
                  Resolve {selectedReports.size} รายการ
                </Button>
              )}
            </Box>

            {/* Reports Table */}
            <Box sx={{ ...card, overflow: "hidden" }}>
              <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "30px 0.8fr 0.6fr 1.5fr 1fr 0.8fr 0.8fr", px: 3, py: 1.5, bgcolor: c.bgTableHeader, borderBottom: `1px solid ${c.borderCard}` }}>
                <Box />
                {["Report ID", "Type", "Target", "Reporter", "Date", "Status"].map(h => (
                  <Typography key={h} sx={{ fontSize: "0.65rem", fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
                ))}
              </Box>
              {filteredReports.length === 0 ? (
                <Box sx={{ p: 5, textAlign: "center" }}>
                  <CelebrationRoundedIcon sx={{ fontSize: 32, mb: 1, color: c.gold }} />
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: c.textPrimary }}>ไม่มีรายงานปัญหา</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>ยินดีด้วย! ไม่มีปัญหาที่ต้องจัดการ</Typography>
                </Box>
              ) : filteredReports.map((rpt, idx) => {
                const sts = reportStatusStyles[rpt.status];
                const pri = priorityStyles[rpt.priority];
                return (
                  <Box key={rpt.id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                    onClick={() => { setViewReport(rpt); setAdminNote(rpt.adminNote || ""); }}
                    sx={{
                      display: { xs: "flex", md: "grid" }, flexDirection: "column",
                      gridTemplateColumns: { md: "30px 0.8fr 0.6fr 1.5fr 1fr 0.8fr 0.8fr" },
                      alignItems: "center", px: 3, py: 2, cursor: "pointer",
                      borderBottom: `1px solid ${c.borderCard}`, gap: { xs: 0.5, md: 0 },
                      "&:hover": { bgcolor: c.bgCardHover },
                      ...(rpt.priority === "high" && rpt.status === "pending" && { borderLeft: "3px solid #EF4444" }),
                    }}>
                    <Checkbox size="small" checked={selectedReports.has(rpt.id)} onClick={e => { e.stopPropagation(); toggleReportSelect(rpt.id); }}
                      sx={{ p: 0, color: c.textMuted, "&.Mui-checked": { color: c.gold } }} />
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: c.textPrimary, fontFamily: "monospace" }}>{rpt.id}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: c.textSecondary }}>
                      {typeIcons[rpt.type]}
                      <Typography sx={{ fontSize: "0.75rem", color: c.textSecondary, textTransform: "capitalize" }}>{rpt.type}</Typography>
                    </Box>
                    <Box>
                      <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary }}>{rpt.targetName}</Typography>
                      <Chip icon={pri.icon} label={pri.label} size="small" sx={{ bgcolor: pri.bg, color: pri.color, fontWeight: 700, fontSize: "0.6rem", height: 18, mt: 0.3, "& .MuiChip-icon": { color: pri.color } }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>{rpt.reporterName}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>{rpt.date}</Typography>
                    <Chip icon={sts.icon} label={sts.label} size="small" sx={{ bgcolor: sts.bg, color: sts.color, fontWeight: 700, fontSize: "0.65rem", height: 24, "& .MuiChip-icon": { color: sts.color } }} />
                  </Box>
                );
              })}
            </Box>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: REVIEWS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "reviews" && (
          <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* KPIs */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
              {[
                { label: "Pending Reviews", value: pendingReviews, color: "#F59E0B", icon: <CircleRoundedIcon sx={{ fontSize: 10 }} /> },
                { label: "Flagged", value: flaggedReviews, color: "#EF4444", icon: <FlagRoundedIcon sx={{ fontSize: 12 }} /> },
                { label: "Approved", value: reviews.filter(r => r.status === "approved").length, color: "#22C55E", icon: <CheckCircleRoundedIcon sx={{ fontSize: 12 }} /> },
              ].map(kpi => (
                <Box key={kpi.label} sx={{ ...card, p: 2, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    <Box component="span" sx={{ display: "flex", color: kpi.color }}>{kpi.icon}</Box> {kpi.label}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.6rem", color: kpi.color }}>{kpi.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Filter Bar */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
              <Box sx={{ bgcolor: c.bgInputField, borderRadius: "10px", px: 1.5, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, flex: 1, minWidth: 200 }}>
                <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
                <TextField fullWidth variant="standard" placeholder="ค้นหา review..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{ disableUnderline: true }} sx={{ "& input": { color: c.textPrimary, fontSize: "0.85rem", py: 1.2 } }} />
              </Box>
              <Select size="small" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
                sx={{ minWidth: 100, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
                <MenuItem value="all">ทุก <StarRoundedIcon sx={{ fontSize: 14, ml: 0.5 }} /></MenuItem>
                {[5, 4, 3, 2, 1].map(r => <MenuItem key={r} value={r}>{r} <StarRoundedIcon sx={{ fontSize: 14, ml: 0.5 }} /></MenuItem>)}
              </Select>
              <Select size="small" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                sx={{ minWidth: 120, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
                <MenuItem value="all">ทุกสถานะ</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="hidden">Hidden</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </Select>
            </Box>

            {/* Reviews List */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {filteredReviews.map((rv, idx) => {
                const sts = reviewStatusStyles[rv.status];
                return (
                  <Box key={rv.id} component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                    sx={{
                      ...card, p: 2.5,
                      ...(rv.flagged && { borderColor: "#EF444444", boxShadow: "0 0 12px rgba(239,68,68,0.1)" }),
                    }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: rv.flagged ? "#EF4444" : c.gold, fontSize: "0.85rem", fontWeight: 700, color: "#FFF" }}>{rv.userAvatar}</Avatar>
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary }}>{rv.userName}</Typography>
                            {rv.flagged && (
                              <Chip icon={<FlagRoundedIcon sx={{ fontSize: 12, color: "#EF4444 !important" }} />} label="Reported" size="small"
                                sx={{ bgcolor: "rgba(239,68,68,0.15)", color: "#EF4444", fontWeight: 700, fontSize: "0.6rem", height: 20 }} />
                            )}
                          </Box>
                          <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>{rv.productName} • {rv.date}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Rating value={rv.rating} readOnly size="small" sx={{ fontSize: "0.9rem" }} />
                        <Chip icon={sts.icon} label={sts.label} size="small" sx={{ bgcolor: sts.bg, color: sts.color, fontWeight: 700, fontSize: "0.65rem", height: 22, "& .MuiChip-icon": { color: sts.color } }} />
                      </Box>
                    </Box>

                    {/* Comment */}
                    <Typography sx={{
                      fontSize: "0.85rem", color: c.textSecondary, lineHeight: 1.6, mb: 1.5,
                      p: 1.5, borderRadius: "8px", bgcolor: c.bgStatBox,
                      ...(rv.flagged && { borderLeft: "3px solid #EF4444" }),
                    }}>
                      &ldquo;{rv.comment}&rdquo;
                    </Typography>

                    {/* Flag Reason */}
                    {rv.flagged && rv.flagReason && (
                      <Box sx={{ display: "flex", gap: 1, mb: 1.5, p: 1, borderRadius: "6px", bgcolor: "rgba(239,68,68,0.06)" }}>
                        <WarningAmberRoundedIcon sx={{ fontSize: 14, color: "#EF4444", mt: 0.2 }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#EF4444" }}>{rv.flagReason} ({rv.reportCount} reports)</Typography>
                      </Box>
                    )}

                    {/* Actions */}
                    {rv.status !== "deleted" && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {rv.status === "pending" && (
                          <Button size="small" startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />} onClick={() => approveReview(rv.id)}
                            sx={{ fontSize: "0.75rem", color: "#22C55E", borderColor: "rgba(34,197,94,0.3)", textTransform: "none" }} variant="outlined">
                            Approve
                          </Button>
                        )}
                        {rv.status !== "hidden" && (
                          <Button size="small" startIcon={<VisibilityOffRoundedIcon sx={{ fontSize: 14 }} />} onClick={() => hideReview(rv.id)}
                            sx={{ fontSize: "0.75rem", color: c.textMuted, borderColor: c.borderInput, textTransform: "none" }} variant="outlined">
                            Hide
                          </Button>
                        )}
                        <Button size="small" startIcon={<DeleteRoundedIcon sx={{ fontSize: 14 }} />} onClick={() => deleteReview(rv.id)}
                          sx={{ fontSize: "0.75rem", color: "#EF4444", borderColor: "rgba(239,68,68,0.2)", textTransform: "none" }} variant="outlined">
                          Delete
                        </Button>
                      </Box>
                    )}
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

      {/* Report Detail Dialog */}
      <Dialog open={!!viewReport} onClose={() => setViewReport(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ReportRoundedIcon sx={{ fontSize: 18, color: "#EF4444" }} />
            Report Detail — {viewReport?.id}
          </Box>
          {viewReport && <Chip icon={reportStatusStyles[viewReport.status]?.icon} label={reportStatusStyles[viewReport.status]?.label} size="small" sx={{ bgcolor: reportStatusStyles[viewReport.status]?.bg, color: reportStatusStyles[viewReport.status]?.color, fontWeight: 700, "& .MuiChip-icon": { color: reportStatusStyles[viewReport.status]?.color } }} />}
        </DialogTitle>
        <DialogContent>
          {viewReport && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" }, gap: 3 }}>
              {/* Left: Report Info */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box sx={{ display: "flex", color: c.textSecondary }}>{typeIcons[viewReport.type]}</Box>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textSecondary, textTransform: "capitalize" }}>{viewReport.type} Report</Typography>
                  <Chip icon={priorityStyles[viewReport.priority]?.icon} label={priorityStyles[viewReport.priority]?.label} size="small" sx={{ bgcolor: priorityStyles[viewReport.priority]?.bg, color: priorityStyles[viewReport.priority]?.color, fontWeight: 700, fontSize: "0.65rem", height: 20, "& .MuiChip-icon": { color: priorityStyles[viewReport.priority]?.color } }} />
                </Box>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: c.textPrimary, mb: 1 }}>{viewReport.targetName}</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, lineHeight: 1.6, p: 2, borderRadius: "10px", bgcolor: c.bgStatBox, mb: 2 }}>
                  {viewReport.description}
                </Typography>

                {/* Evidence */}
                {viewReport.evidence.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AttachFileRoundedIcon sx={{ fontSize: 14 }} /> Evidence
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {viewReport.evidence.map((ev, i) => (
                        <Box key={i} sx={{ width: 120, height: 80, borderRadius: "8px", overflow: "hidden", border: `1px solid ${c.borderCard}` }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ev} alt="evidence" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>ผู้รายงาน: {viewReport.reporterName} ({viewReport.reporterEmail})</Typography>

                {/* Admin Note */}
                <Divider sx={{ borderColor: c.borderDivider, my: 2 }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EditNoteRoundedIcon sx={{ fontSize: 16 }} /> Admin Note
                </Typography>
                <TextField fullWidth multiline minRows={2} placeholder="เขียน note สำหรับ report นี้..." value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { color: c.dialogText, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } }} />
              </Box>

              {/* Right: Timeline + Actions */}
              <Box>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary, mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <TimelineRoundedIcon sx={{ fontSize: 16 }} /> Timeline
                </Typography>
                <Box sx={{ pl: 2, borderLeft: `2px solid ${c.borderCard}` }}>
                  {viewReport.timeline.map((t, i) => (
                    <Box key={i} sx={{ mb: 2, position: "relative" }}>
                      <Box sx={{ position: "absolute", left: -11, top: 4, width: 8, height: 8, borderRadius: "50%", bgcolor: i === viewReport.timeline.length - 1 ? c.gold : c.textMuted }} />
                      <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontFamily: "monospace" }}>{t.time}</Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: c.textPrimary, fontWeight: 500 }}>{t.action}</Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>by {t.actor}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Action Buttons */}
                {(viewReport.status === "pending" || viewReport.status === "investigating") && (
                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                      <BoltRoundedIcon sx={{ fontSize: 14 }} /> Actions
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Button variant="contained" fullWidth startIcon={<CheckCircleRoundedIcon />} onClick={() => resolveReport(viewReport.id)}
                        sx={{ bgcolor: "#22C55E", color: "#FFF", textTransform: "none", fontWeight: 700, borderRadius: "8px", justifyContent: "flex-start", "&:hover": { bgcolor: "#16A34A" } }}>
                        Mark as Resolved
                      </Button>
                      <Button variant="outlined" fullWidth startIcon={<CancelRoundedIcon />} onClick={() => rejectReport(viewReport.id)}
                        sx={{ color: c.textMuted, borderColor: c.borderInput, textTransform: "none", fontWeight: 600, borderRadius: "8px", justifyContent: "flex-start" }}>
                        Reject Report
                      </Button>
                      {viewReport.type === "user" && (
                        <Button variant="contained" fullWidth startIcon={<BlockRoundedIcon />} onClick={() => { setViewReport(null); setConfirmDialog({ type: "suspend", target: viewReport }); }}
                          sx={{ bgcolor: "#EF4444", color: "#FFF", textTransform: "none", fontWeight: 700, borderRadius: "8px", justifyContent: "flex-start", "&:hover": { bgcolor: "#DC2626" } }}>
                          Suspend User
                        </Button>
                      )}
                      {viewReport.type === "product" && (
                        <Button variant="contained" fullWidth startIcon={<DeleteRoundedIcon />} onClick={() => { setViewReport(null); setConfirmDialog({ type: "remove", target: viewReport }); }}
                          sx={{ bgcolor: "#EF4444", color: "#FFF", textTransform: "none", fontWeight: 700, borderRadius: "8px", justifyContent: "flex-start", "&:hover": { bgcolor: "#DC2626" } }}>
                          Remove Product
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewReport(null)} sx={{ color: c.textMuted, textTransform: "none" }}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog.target} onClose={() => setConfirmDialog({ type: "", target: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WarningAmberRoundedIcon sx={{ color: "#EF4444", fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem" }}>
            {confirmDialog.type === "suspend" ? "ยืนยันระงับบัญชี?" : "ยืนยันลบสินค้า?"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>
            {confirmDialog.type === "suspend"
              ? `คุณต้องการระงับบัญชี "${confirmDialog.target?.targetName}" หรือไม่?`
              : `คุณต้องการลบสินค้า "${confirmDialog.target?.targetName}" หรือไม่?`}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#EF4444", mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 14 }} /> การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDialog({ type: "", target: null })} sx={{ color: c.textMuted, textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={confirmAction}
            sx={{ bgcolor: "#EF4444", color: "#FFF", borderRadius: "8px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#DC2626" } }}>
            ยืนยัน
          </Button>
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
