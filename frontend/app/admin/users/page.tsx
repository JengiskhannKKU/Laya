"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { motion } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface AdminUser {
  id: string;
  displayName: string | null;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const roleStyles: Record<string, { label: string; color: string; bgcolor: string }> = {
  customer: { label: "ลูกค้า", color: "#3B82F6", bgcolor: "rgba(59,130,246,0.15)" },
  merchant: { label: "ร้านค้า", color: "#C5A55A", bgcolor: "rgba(197,165,90,0.15)" },
  admin: { label: "แอดมิน", color: "#8B5CF6", bgcolor: "rgba(139,92,246,0.15)" },
};

export default function UsersManagementPage() {
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/api/admin/users`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดข้อมูลผู้ใช้ไม่สำเร็จ"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || (u.displayName ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
          <GroupsRoundedIcon sx={{ fontSize: 20 }} /> ผู้ใช้ทั้งหมด ({users.length})
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>
          รายชื่อผู้ใช้งานทั้งหมดในระบบ
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 200, bgcolor: c.bgInputField, borderRadius: "10px", px: 1.5, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, transition: tr }}>
          <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
          <TextField fullWidth variant="standard" placeholder="ค้นหาชื่อ / อีเมล..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ "& input": { color: c.textPrimary, fontSize: "0.85rem", py: 1.2 } }}
          />
        </Box>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} size="small"
          sx={{
            minWidth: 150, bgcolor: c.bgInputField, color: c.textPrimary, borderRadius: "10px",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: c.borderInput },
            "& .MuiSvgIcon-root": { color: c.textMuted },
          }}
        >
          <MenuItem value="all">ทุกบทบาท</MenuItem>
          <MenuItem value="customer">ลูกค้า</MenuItem>
          <MenuItem value="merchant">ร้านค้า</MenuItem>
          <MenuItem value="admin">แอดมิน</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: c.gold }} /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, py: 6, textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.85rem", color: c.textMuted }}>ไม่พบผู้ใช้</Typography>
        </Box>
      ) : (
        <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, overflow: "hidden", transition: tr }}>
          <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "2.5fr 2fr 1fr 1fr 1fr", px: 3, py: 1.5, bgcolor: c.bgTableHeader, borderBottom: `1px solid ${c.borderCard}` }}>
            {["ผู้ใช้", "อีเมล", "เบอร์โทร", "บทบาท", "สมัครเมื่อ"].map((h) => (
              <Typography key={h} sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
            ))}
          </Box>
          {filtered.map((u, idx) => {
            const rs = roleStyles[u.role] || roleStyles.customer;
            const initial = (u.displayName ?? u.email).charAt(0).toUpperCase();
            return (
              <Box key={u.id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                sx={{ display: { xs: "flex", md: "grid" }, flexDirection: { xs: "column" }, gridTemplateColumns: { md: "2.5fr 2fr 1fr 1fr 1fr" }, alignItems: "center", px: 3, py: 2, borderBottom: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover }, gap: { xs: 0.5, md: 0 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: c.gold, fontSize: "0.85rem", fontWeight: 700, color: c.textOnGold }}>{initial}</Avatar>
                  <Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{u.displayName ?? "-"}</Typography>
                    {!u.isActive && <Typography sx={{ fontSize: "0.65rem", color: "#EF4444", fontWeight: 700 }}>ปิดใช้งาน</Typography>}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary }}>{u.email}</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary }}>{u.phone ?? "-"}</Typography>
                <Chip label={rs.label} size="small" sx={{ bgcolor: rs.bgcolor, color: rs.color, fontWeight: 700, fontSize: "0.7rem", height: 24, width: "fit-content" }} />
                <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>
                  {new Date(u.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
