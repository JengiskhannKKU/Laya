"use client";

/**
 * รายการโปรด — ดึงจริงจาก /api/wishlist (แทน mockFavoriteIds เดิมทั้งหมด)
 */

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Skeleton from "@mui/material/Skeleton";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/api-auth";
import { useWishlist } from "@/lib/wishlist-context";
import { useCartStore } from "@/lib/cart-store";
import { mapLiveProduct, type LiveProduct, type Product } from "@/lib/live-products";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading, session } = useAuth();
  const { toggle } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const [loading, setLoading] = useState(true);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (authLoading) return; // รอ auth โหลดเสร็จก่อน — กัน redirect ทั้งที่ล็อกอินอยู่
    if (!user) { router.push("/auth/login"); return; }
  }, [authLoading, user, router]);

  const fetchWishlist = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/wishlist`);
      const data = (await res.json()) as LiveProduct[];
      if (!res.ok) throw new Error();
      setFavoriteProducts(data.map(mapLiveProduct));
    } catch {
      setFavoriteProducts([]);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const removeFromWishlist = (id: string) => {
    setFavoriteProducts((prev) => prev.filter((p) => p.id !== id));
    toggle(id);
    setToastMsg("นำออกจากรายการโปรดแล้ว");
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      image: product.images[0] ?? null,
      price: product.price,
      priceUnit: product.priceUnit,
      shopName: product.community,
      stock: product.availableLength,
    });
    setToastMsg("เพิ่มลงตะกร้าแล้ว");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Wishlist ของฉัน — LAYA",
        text: "ดูรายการผ้าไทยที่ฉันชอบ!",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToastMsg("คัดลอกลิงก์สำเร็จ");
    }
  };

  if (authLoading || !user) return null;

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #E5DFD6" }}>
          <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ flex: 1, textAlign: "center", fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A" }}>
            รายการโปรด
          </Typography>
          <IconButton onClick={handleShare} sx={{ color: "#1B2A4A" }}>
            <ShareRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ px: 2, pt: 3 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={240} sx={{ borderRadius: "16px" }} />
              ))}
            </Box>
          </Box>
        ) : favoriteProducts.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 4, pb: 10 }}>
            <Box sx={{ width: 100, height: 100, borderRadius: "50%", bgcolor: "#E5DFD6", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
              <FavoriteBorderRoundedIcon sx={{ fontSize: 40, color: "#9CA3AF" }} />
            </Box>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              ยังไม่มีรายการโปรด
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", textAlign: "center", mb: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>
              กดหัวใจ <FavoriteRoundedIcon sx={{ fontSize: 14, color: "#EF4444" }} /> ที่สินค้าที่ชอบเพื่อบันทึกไว้ดูภายหลัง
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/community")}
              sx={{
                py: 1.5, px: 4, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "24px",
                fontWeight: 700, fontFamily: '"Kanit", sans-serif',
                "&:hover": { bgcolor: "#0F1A30" }
              }}
            >
              เริ่มค้นหาสินค้า
            </Button>
          </Box>
        ) : (
          <Box sx={{ px: 2, pt: 2, pb: 10 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 2 }}>
              {favoriteProducts.length} รายการ
            </Typography>

            {/* Grid View */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <AnimatePresence>
                {favoriteProducts.map((product, idx) => (
                  <Box
                    key={product.id}
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: idx * 0.05 }}
                    sx={{
                      bgcolor: "#FFFFFF",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                      border: "1px solid #E5DFD6",
                    }}
                  >
                    {/* Image */}
                    <Box
                      onClick={() => router.push(`/product/${product.id}`)}
                      sx={{ position: "relative", height: 160, cursor: "pointer" }}
                    >
                      <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: "cover" }} />
                      {product.hasGI && (
                        <Box sx={{
                          position: "absolute", top: 8, left: 8, bgcolor: "rgba(197,165,90,0.9)",
                          px: 1, py: 0.2, borderRadius: "6px", display: "flex", alignItems: "center", gap: 0.3,
                        }}>
                          <VerifiedRoundedIcon sx={{ fontSize: 10, color: "#FFFFFF" }} />
                          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#FFFFFF" }}>GI</Typography>
                        </Box>
                      )}
                      {/* Remove from wishlist */}
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }}
                        sx={{
                          position: "absolute", top: 6, right: 6,
                          bgcolor: "rgba(255,255,255,0.9)", width: 30, height: 30,
                          "&:hover": { bgcolor: "#FFFFFF" },
                        }}
                      >
                        <FavoriteRoundedIcon sx={{ fontSize: 16, color: "#EF4444" }} />
                      </IconButton>
                    </Box>

                    {/* Info */}
                    <Box sx={{ p: 1.5 }}>
                      <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.8rem", color: "#1B2A4A", lineHeight: 1.3 }}>
                        {product.name}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#6B7280", mt: 0.3 }}>
                        {product.community}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#C5A55A" }}>
                          ฿{product.price.toLocaleString()}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                          <StarRoundedIcon sx={{ fontSize: 12, color: "#C5A55A" }} />
                          <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{product.rating}</Typography>
                        </Box>
                      </Box>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        startIcon={<ShoppingCartRoundedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleAddToCart(product)}
                        sx={{
                          mt: 1, borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600,
                          borderColor: "#1B2A4A", color: "#1B2A4A", textTransform: "none",
                          fontFamily: '"Kanit", sans-serif',
                          "&:hover": { bgcolor: "rgba(27,42,74,0.05)" },
                        }}
                      >
                        เพิ่มลงตะกร้า
                      </Button>
                    </Box>
                  </Box>
                ))}
              </AnimatePresence>
            </Box>
          </Box>
        )}

        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={!!toastMsg}
          autoHideDuration={3000}
          onClose={() => setToastMsg("")}
          message={toastMsg}
          sx={{ bottom: { xs: 80, sm: 24 } }}
        />
      </Box>
    </MobileLayout>
  );
}
