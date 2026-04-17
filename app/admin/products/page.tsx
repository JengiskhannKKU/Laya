"use client";

import { useState, useEffect } from "react";
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
import Tooltip from "@mui/material/Tooltip";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

import { mockAdminProducts, AdminProduct } from "@/lib/mock-admin-data";

const statusStyles: Record<string, { label: string; color: string; bgcolor: string }> = {
  active: { label: "Active", color: "#22C55E", bgcolor: "rgba(34,197,94,0.15)" },
  draft: { label: "Draft", color: "#F59E0B", bgcolor: "rgba(245,158,11,0.15)" },
  out_of_stock: { label: "หมดสต็อก", color: "#EF4444", bgcolor: "rgba(239,68,68,0.15)" },
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { mode, toggleMode, c } = useAdminTheme();
  const tr = "all 0.3s ease";

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([...mockAdminProducts]);

  // Load custom products from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("laya-custom-products") || "[]");
      if (stored.length > 0) {
        setProducts([...[...stored].reverse(), ...mockAdminProducts]);
      }
    } catch { /* ignore parse errors */ }
  }, []);
  const [toastMsg, setToastMsg] = useState("");
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.community.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: p.status === "active" ? "draft" : "active" } : p));
    setToastMsg("อัปเดตสถานะสินค้าแล้ว");
  };

  return (
    <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, transition: tr }}>
                สินค้าทั้งหมด ({products.length})
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: c.textMuted, transition: tr }}>
                จัดการสินค้า, สต็อก, และราคาจากหน้านี้
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => router.push("/admin/products/create")}
              sx={{ bgcolor: c.gold, color: c.textOnGold, borderRadius: "10px", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: c.goldHover } }}>
              เพิ่มสินค้า
            </Button>
          </Box>

          {/* Search */}
          <Box sx={{ bgcolor: c.bgInputField, borderRadius: "12px", p: 1.5, mb: 3, display: "flex", alignItems: "center", gap: 1, border: `1px solid ${c.borderInput}`, transition: tr }}>
            <SearchRoundedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
            <TextField fullWidth variant="standard" placeholder="ค้นหาสินค้า..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{ "& input": { color: c.textPrimary, fontSize: "0.9rem" } }}
            />
          </Box>

          {/* Product Table */}
          <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, overflow: "hidden", transition: tr }}>
            <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "3fr 1.5fr 1fr 1fr 1fr 1fr 100px", px: 3, py: 1.5, bgcolor: c.bgTableHeader, borderBottom: `1px solid ${c.borderCard}` }}>
              {["สินค้า", "ชุมชน", "ราคา", "สต็อก", "ขายแล้ว", "สถานะ", ""].map((h) => (
                <Typography key={h} sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
              ))}
            </Box>

            {filtered.map((p, idx) => {
              const sts = statusStyles[p.status] || statusStyles.active;
              return (
                <Box key={p.id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                  sx={{
                    display: { xs: "flex", md: "grid" }, flexDirection: { xs: "column", md: "row" },
                    gridTemplateColumns: { md: "3fr 1.5fr 1fr 1fr 1fr 1fr 100px" }, alignItems: "center",
                    px: 3, py: 2, borderBottom: `1px solid ${c.borderCard}`, "&:hover": { bgcolor: c.bgCardHover }, gap: { xs: 1, md: 0 },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "8px", overflow: "hidden", bgcolor: c.bgStatBox, flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary, transition: tr }}>{p.name}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {p.hasGI && <VerifiedRoundedIcon sx={{ fontSize: 12, color: c.gold }} />}
                        <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>{p.province} • ⭐ {p.rating}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary, display: { xs: "none", md: "block" } }}>{p.community}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: c.gold }}>฿{p.price.toLocaleString()}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: p.stock === 0 ? "#EF4444" : c.textSecondary, fontWeight: p.stock === 0 ? 700 : 400 }}>
                    {p.stock === 0 ? "หมด" : p.stock}
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, display: { xs: "none", md: "block" } }}>{p.soldCount}</Typography>
                  <Chip label={sts.label} size="small" sx={{ bgcolor: sts.bgcolor, color: sts.color, fontWeight: 700, fontSize: "0.7rem", height: 24 }} />
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton size="small" onClick={() => setEditProduct(p)} sx={{ color: c.textMuted, "&:hover": { color: c.gold } }}>
                      <EditRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => toggleStatus(p.id)} sx={{ color: c.textMuted, "&:hover": { color: "#EF4444" } }}>
                      <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>


      {/* Edit Dialog */}
      <Dialog open={!!editProduct} onClose={() => setEditProduct(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700 }}>แก้ไขสินค้า</DialogTitle>
        <DialogContent>
          {editProduct && (
            <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField fullWidth label="ชื่อสินค้า" defaultValue={editProduct.name} variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { color: c.dialogText, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } }}
              />
              <TextField fullWidth label="ราคา (บาท)" defaultValue={editProduct.price} type="number" variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { color: c.dialogText, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } }}
              />
              <TextField fullWidth label="จำนวนสต็อก" defaultValue={editProduct.stock} type="number" variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { color: c.dialogText, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditProduct(null)} sx={{ color: c.textMuted }}>ยกเลิก</Button>
          <Button variant="contained" onClick={() => { setEditProduct(null); setToastMsg("บันทึกการเปลี่ยนแปลงสำเร็จ (Mock)"); }}
            sx={{ bgcolor: c.gold, "&:hover": { bgcolor: c.goldHover }, borderRadius: "8px", fontWeight: 700 }}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }} open={!!toastMsg} autoHideDuration={3000} onClose={() => setToastMsg("")} message={toastMsg} />
    </Box>
  );
}
