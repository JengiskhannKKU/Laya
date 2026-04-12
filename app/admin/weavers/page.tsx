"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

import { mockAdminWeavers, AdminWeaver } from "@/lib/mock-admin-data";

const statusStyles: Record<string, { label: string; color: string; bgcolor: string }> = {
  active: { label: "Active", color: "#22C55E", bgcolor: "rgba(34,197,94,0.15)" },
  pending: { label: "รอตรวจสอบ", color: "#F59E0B", bgcolor: "rgba(245,158,11,0.15)" },
  suspended: { label: "ระงับ", color: "#EF4444", bgcolor: "rgba(239,68,68,0.15)" },
};

export default function AdminWeaversPage() {
  const router = useRouter();
  const { mode, toggleMode, c } = useAdminTheme();
  const tr = "all 0.3s ease";

  const [weavers, setWeavers] = useState<AdminWeaver[]>([...mockAdminWeavers]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [viewWeaver, setViewWeaver] = useState<AdminWeaver | null>(null);

  const filtered = weavers.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.community.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const approveWeaver = (id: string) => {
    setWeavers((prev) => prev.map((w) => w.id === id ? { ...w, status: "active" as const, kycVerified: true } : w));
    setToastMsg("อนุมัติช่างทอสำเร็จ");
  };

  const suspendWeaver = (id: string) => {
    setWeavers((prev) => prev.map((w) => w.id === id ? { ...w, status: "suspended" as const } : w));
    setToastMsg("ระงับช่างทอแล้ว");
  };

  const pendingCount = weavers.filter((w) => w.status === "pending").length;
  const activeCount = weavers.filter((w) => w.status === "active").length;

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
            จัดการช่างทอ
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
        {/* Stats */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
          <Box sx={{ bgcolor: c.bgCard, borderRadius: "12px", p: 2.5, border: `1px solid ${c.borderCard}`, transition: tr }}>
            <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, transition: tr }}>ช่างทอที่ Active</Typography>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: "1.8rem", color: "#22C55E" }}>{activeCount}</Typography>
          </Box>
          <Box sx={{ bgcolor: c.bgCard, borderRadius: "12px", p: 2.5, border: `1px solid ${c.borderCard}`, transition: tr }}>
            <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, transition: tr }}>รอตรวจสอบ KYC</Typography>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: "1.8rem", color: "#F59E0B" }}>{pendingCount}</Typography>
          </Box>
        </Box>

        {/* Search */}
        <Box sx={{ bgcolor: c.bgInputField, borderRadius: "10px", px: 1.5, mb: 3, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, transition: tr }}>
          <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
          <TextField fullWidth variant="standard" placeholder="ค้นหาช่างทอ, ชุมชน, จังหวัด..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ "& input": { color: c.textPrimary, fontSize: "0.85rem", py: 1.2 } }}
          />
        </Box>

        {/* Weaver Cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          {filtered.map((w, idx) => {
            const sts = statusStyles[w.status] || statusStyles.active;
            return (
              <Box key={w.id} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                sx={{
                  bgcolor: c.bgCard, borderRadius: "14px", p: 2.5, border: `1px solid ${c.borderCard}`,
                  "&:hover": { borderColor: c.gold }, transition: "border-color 0.3s, background-color 0.3s",
                }}
              >
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Avatar sx={{
                    width: 48, height: 48,
                    bgcolor: w.status === "pending" ? "#F59E0B" : w.status === "suspended" ? "#EF4444" : c.gold,
                    fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF",
                  }}>
                    {w.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary, transition: tr }}>{w.name}</Typography>
                      {w.kycVerified && <VerifiedRoundedIcon sx={{ fontSize: 14, color: "#22C55E" }} />}
                    </Box>
                    <Typography sx={{ fontSize: "0.75rem", color: c.textMuted, transition: tr }}>{w.community} • {w.province}</Typography>
                  </Box>
                  <Chip label={sts.label} size="small" sx={{ bgcolor: sts.bgcolor, color: sts.color, fontWeight: 700, fontSize: "0.7rem" }} />
                </Box>

                {/* Stats */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, mb: 2 }}>
                  <Box sx={{ textAlign: "center", py: 1, bgcolor: c.bgStatBox, borderRadius: "8px", transition: tr }}>
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.gold }}>฿{(w.totalRevenue / 1000).toFixed(0)}k</Typography>
                    <Typography sx={{ fontSize: "0.6rem", color: c.textMuted, transition: tr }}>รายรับ</Typography>
                  </Box>
                  <Box sx={{ textAlign: "center", py: 1, bgcolor: c.bgStatBox, borderRadius: "8px", transition: tr }}>
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary, transition: tr }}>{w.totalOrders}</Typography>
                    <Typography sx={{ fontSize: "0.6rem", color: c.textMuted, transition: tr }}>ออเดอร์</Typography>
                  </Box>
                  <Box sx={{ textAlign: "center", py: 1, bgcolor: c.bgStatBox, borderRadius: "8px", transition: tr }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3 }}>
                      <StarRoundedIcon sx={{ fontSize: 14, color: c.gold }} />
                      <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary, transition: tr }}>{w.rating || "-"}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.6rem", color: c.textMuted, transition: tr }}>Rating</Typography>
                  </Box>
                </Box>

                {/* Techniques */}
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
                  {w.techniques.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ bgcolor: c.bgStatBox, color: c.textSecondary, fontSize: "0.7rem", height: 22, transition: tr }} />
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
                    <Button size="small" startIcon={<BlockRoundedIcon sx={{ fontSize: 14 }} />} onClick={() => suspendWeaver(w.id)}
                      sx={{ flex: 1, fontSize: "0.75rem", color: "#EF4444", borderColor: "rgba(239,68,68,0.2)", textTransform: "none" }} variant="outlined">
                      ระงับ
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Weaver Detail Dialog */}
      <Dialog open={!!viewWeaver} onClose={() => setViewWeaver(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700 }}>ข้อมูลช่างทอ</DialogTitle>
        <DialogContent>
          {viewWeaver && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: c.gold, fontSize: "1.5rem", fontWeight: 700, color: c.textOnGold }}>{viewWeaver.avatar}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: c.dialogText }}>{viewWeaver.name}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: c.textMuted }}>{viewWeaver.community}</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>{viewWeaver.province} • เข้าร่วม {viewWeaver.joinDate}</Typography>
                </Box>
              </Box>
              <Divider sx={{ borderColor: c.borderDivider, mb: 2 }} />
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, mb: 0.5 }}>โทรศัพท์</Typography>
                  <Typography sx={{ fontSize: "0.9rem", color: c.dialogText }}>{viewWeaver.phone}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, mb: 0.5 }}>KYC</Typography>
                  <Typography sx={{ fontSize: "0.9rem", color: viewWeaver.kycVerified ? "#22C55E" : "#F59E0B" }}>
                    {viewWeaver.kycVerified ? "✓ ยืนยันแล้ว" : "รอตรวจสอบ"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, mb: 0.5 }}>รายรับรวม</Typography>
                  <Typography sx={{ fontSize: "0.9rem", color: c.gold, fontWeight: 700 }}>฿{viewWeaver.totalRevenue.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, mb: 0.5 }}>ออเดอร์</Typography>
                  <Typography sx={{ fontSize: "0.9rem", color: c.dialogText }}>{viewWeaver.totalOrders} ออเดอร์</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, mb: 0.5 }}>เทคนิค</Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {viewWeaver.techniques.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ bgcolor: c.goldSubtle, color: c.gold, fontWeight: 600, fontSize: "0.75rem" }} />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewWeaver(null)} sx={{ color: c.textMuted }}>ปิด</Button>
        </DialogActions>
      </Dialog>

      <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }} open={!!toastMsg} autoHideDuration={3000} onClose={() => setToastMsg("")} message={toastMsg} />
    </Box>
  );
}
