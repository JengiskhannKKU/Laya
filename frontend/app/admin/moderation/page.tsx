"use client";

import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Rating from "@mui/material/Rating";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { useAppModal } from "@/components/providers/AppModalProvider";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface AdminReview {
  id: string;
  shopId: string;
  shopName: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
}

export default function ModerationPage() {
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, transition: tr };

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const { showAlert } = useAppModal();

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    showAlert({ title: msg, tone: type === "error" ? "error" : "success" });
  };

  const fetchReviews = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/reviews`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดรีวิวไม่สำเร็จ");
      setReviews(data);
      setError("");
    } catch (err) {
      setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดรีวิวไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleHide = async (review: AdminReview) => {
    const nextHidden = !review.isHidden;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/reviews/${review.id}/hide`, {
        method: "PATCH",
        body: JSON.stringify({ hidden: nextHidden }),
      });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, isHidden: nextHidden } : r));
      showToast(nextHidden ? "ซ่อนรีวิวแล้ว" : "แสดงรีวิวอีกครั้งแล้ว");
    } catch {
      showToast("อัปเดตรีวิวไม่สำเร็จ", "error");
    }
  };

  const deleteReview = async (review: AdminReview) => {
    if (!confirm(`ลบรีวิวของ "${review.reviewerName}" ถาวร?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/reviews/${review.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      showToast("ลบรีวิวแล้ว", "error");
    } catch {
      showToast("ลบรีวิวไม่สำเร็จ", "error");
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || r.reviewerName.toLowerCase().includes(q) || r.shopName.toLowerCase().includes(q) || (r.comment ?? "").toLowerCase().includes(q);
      const matchRating = ratingFilter === "all" || r.rating === Number(ratingFilter);
      const matchVisibility = visibilityFilter === "all" || (visibilityFilter === "hidden" ? r.isHidden : !r.isHidden);
      return matchSearch && matchRating && matchVisibility;
    });
  }, [reviews, searchQuery, ratingFilter, visibilityFilter]);

  const hiddenCount = reviews.filter((r) => r.isHidden).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <SecurityRoundedIcon sx={{ fontSize: 20, color: c.textPrimary }} />
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary }}>
            ตรวจสอบรีวิว
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>
          ตรวจสอบและจัดการรีวิวร้านค้าทั้งหมดในระบบ
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* KPIs */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, mb: 3 }}>
        <Box sx={{ ...card, p: 2, textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600 }}>รีวิวทั้งหมด</Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.6rem", color: c.textPrimary }}>{reviews.length}</Typography>
        </Box>
        <Box sx={{ ...card, p: 2, textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600 }}>ซ่อนอยู่</Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.6rem", color: "#EF4444" }}>{hiddenCount}</Typography>
        </Box>
      </Box>

      {/* Filter Bar */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ bgcolor: c.bgInputField, borderRadius: "10px", px: 1.5, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, flex: 1, minWidth: 200 }}>
          <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
          <TextField fullWidth variant="standard" placeholder="ค้นหารีวิว, ร้านค้า, ผู้รีวิว..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ disableUnderline: true }} sx={{ "& input": { color: c.textPrimary, fontSize: "0.85rem", py: 1.2 } }} />
        </Box>
        <Select size="small" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}
          sx={{ minWidth: 100, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
          MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
          <MenuItem value="all">ทุกดาว</MenuItem>
          {[5, 4, 3, 2, 1].map((r) => <MenuItem key={r} value={r}>{r} ดาว</MenuItem>)}
        </Select>
        <Select size="small" value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}
          sx={{ minWidth: 120, color: c.textPrimary, fontSize: "0.8rem", bgcolor: c.bgCard, borderRadius: "10px", "& fieldset": { borderColor: c.borderCard }, "& .MuiSelect-icon": { color: c.textMuted } }}
          MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}>
          <MenuItem value="all">ทั้งหมด</MenuItem>
          <MenuItem value="visible">แสดงอยู่</MenuItem>
          <MenuItem value="hidden">ซ่อนอยู่</MenuItem>
        </Select>
      </Box>

      {/* Reviews List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: c.gold }} /></Box>
      ) : filteredReviews.length === 0 ? (
        <Box sx={{ ...card, p: 5, textAlign: "center" }}>
          <CelebrationRoundedIcon sx={{ fontSize: 32, mb: 1, color: c.gold }} />
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: c.textPrimary }}>ไม่พบรีวิว</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filteredReviews.map((rv, idx) => (
            <Box key={rv.id} component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
              sx={{ ...card, p: 2.5, ...(rv.isHidden && { opacity: 0.6 }) }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: c.gold, fontSize: "0.85rem", fontWeight: 700, color: "#FFF" }}>
                    {rv.reviewerName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.textPrimary }}>{rv.reviewerName}</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>
                      {rv.shopName} • {new Date(rv.createdAt).toLocaleDateString("th-TH")}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Rating value={rv.rating} readOnly size="small" sx={{ fontSize: "0.9rem" }} />
                  {rv.isHidden && (
                    <Chip icon={<VisibilityOffRoundedIcon sx={{ fontSize: 14 }} />} label="ซ่อนอยู่" size="small"
                      sx={{ bgcolor: "rgba(239,68,68,0.15)", color: "#EF4444", fontWeight: 700, fontSize: "0.65rem", height: 22 }} />
                  )}
                </Box>
              </Box>

              {rv.comment && (
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, lineHeight: 1.6, mb: 1.5, p: 1.5, borderRadius: "8px", bgcolor: c.bgStatBox }}>
                  &ldquo;{rv.comment}&rdquo;
                </Typography>
              )}

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" startIcon={rv.isHidden ? <VisibilityRoundedIcon sx={{ fontSize: 14 }} /> : <VisibilityOffRoundedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => toggleHide(rv)}
                  sx={{ fontSize: "0.75rem", color: c.textMuted, borderColor: c.borderInput, textTransform: "none" }} variant="outlined">
                  {rv.isHidden ? "แสดงรีวิว" : "ซ่อนรีวิว"}
                </Button>
                <Button size="small" startIcon={<DeleteRoundedIcon sx={{ fontSize: 14 }} />} onClick={() => deleteReview(rv)}
                  sx={{ fontSize: "0.75rem", color: "#EF4444", borderColor: "rgba(239,68,68,0.2)", textTransform: "none" }} variant="outlined">
                  ลบ
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
