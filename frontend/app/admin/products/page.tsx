"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

import { AdminProduct } from "@/lib/admin-types";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const statusStyles: Record<string, { label: string; color: string; bgcolor: string }> = {
  active: { label: "Active", color: "#22C55E", bgcolor: "rgba(34,197,94,0.15)" },
  draft: { label: "Draft", color: "#F59E0B", bgcolor: "rgba(245,158,11,0.15)" },
  out_of_stock: { label: "หมดสต็อก", color: "#EF4444", bgcolor: "rgba(239,68,68,0.15)" },
};

export default function AdminProductsPage() {
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/api/admin/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (cancelled) return;
        setProducts(data.map((p: Record<string, unknown>): AdminProduct => ({
          id: p.id as string,
          name: p.name as string,
          image: "",
          community: (p.shopName as string) ?? "-",
          province: (p.province as string) ?? "-",
          price: Number(p.price ?? 0),
          stock: Number(p.stock ?? 0),
          status: !p.isActive ? "draft" : (Number(p.stock ?? 0) <= 0 ? "out_of_stock" : "active"),
          hasGI: false,
          soldCount: 0,
          rating: 0,
        })));
      } catch (err) {
        if (!cancelled) setToastMsg(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : "โหลดข้อมูลสินค้าไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.community.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, transition: tr }}>
                สินค้าทั้งหมด ({products.length})
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: c.textMuted, transition: tr }}>
                ภาพรวมสินค้าทุกร้านค้าในระบบ
              </Typography>
            </Box>
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
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: c.gold }} /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`, py: 6, textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.85rem", color: c.textMuted }}>ไม่พบสินค้า</Typography>
            </Box>
          ) : (
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
                  <Box />
                </Box>
              );
            })}
          </Box>
          )}

      <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }} open={!!toastMsg} autoHideDuration={3000} onClose={() => setToastMsg("")} message={toastMsg} />
    </Box>
  );
}
