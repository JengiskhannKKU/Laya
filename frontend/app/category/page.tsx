"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import {
  Layers,
  Shirt,
  Wind,
  ShoppingBag,
  Gift,
  Armchair,
  LayoutGrid,
} from "lucide-react";

import MobileLayout from "@/components/layout/MobileLayout";
import { categories, type Product } from "@/lib/mock-data";
import { fetchLiveProducts } from "@/lib/live-products";

const getCategoryIcon = (id: string, color: string) => {
  const props = { size: 22, color, strokeWidth: 1.4 };
  switch (id) {
    case "fabric": return <Layers {...props} />;
    case "clothing": return <Shirt {...props} />;
    case "scarf": return <Wind {...props} />;
    case "bag": return <ShoppingBag {...props} />;
    case "premium": return <Gift {...props} />;
    case "decor": return <Armchair {...props} />;
    case "others": return <LayoutGrid {...props} />;
    default: return <LayoutGrid {...props} />;
  }
};

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("c") || "";

  const [selected, setSelected] = useState(initialCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLiveProducts(selected ? { category: selected } : undefined)
      .then((list) => { if (!cancelled) setProducts(list); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selected]);

  const activeLabel = useMemo(
    () => categories.find((c) => c.id === selected)?.name ?? "ทั้งหมด",
    [selected]
  );

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ px: 2, pt: 4, pb: 2, bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #E5DFD6" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A" }}>
              หมวดหมู่สินค้า
            </Typography>
          </Box>

          {/* Category chip rail */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <Box
              onClick={() => setSelected("")}
              sx={{
                display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0,
                px: 1.6, py: 0.9, borderRadius: "999px", cursor: "pointer",
                bgcolor: selected === "" ? "#1B2A4A" : "#F0EBE3",
                transition: "background 0.2s",
              }}
            >
              <LayoutGrid size={18} color={selected === "" ? "#FFFFFF" : "#1B2A4A"} strokeWidth={1.4} />
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", fontWeight: 600, color: selected === "" ? "#FFFFFF" : "#1B2A4A" }}>
                ทั้งหมด
              </Typography>
            </Box>
            {categories.map((cat) => {
              const active = selected === cat.id;
              return (
                <Box
                  key={cat.id}
                  onClick={() => setSelected(cat.id)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0,
                    px: 1.6, py: 0.9, borderRadius: "999px", cursor: "pointer",
                    bgcolor: active ? "#1B2A4A" : "#F0EBE3",
                    transition: "background 0.2s",
                  }}
                >
                  {getCategoryIcon(cat.id, active ? "#FFFFFF" : "#1B2A4A")}
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", fontWeight: 600, color: active ? "#FFFFFF" : "#1B2A4A", whiteSpace: "nowrap" }}>
                    {cat.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Results */}
        <Box sx={{ px: 2, pt: 2, pb: 10 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280", mb: 1.5 }}>
            {activeLabel} · {loading ? "กำลังโหลด..." : `${products.length} รายการ`}
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress size={28} sx={{ color: "#C5A55A" }} />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1rem", fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
                ยังไม่มีสินค้าในหมวดนี้
              </Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>
                ลองเลือกหมวดหมู่อื่น
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <AnimatePresence>
                {products.map((product, idx) => (
                  <Box
                    key={product.id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => router.push(`/product/${product.id}`)}
                    sx={{
                      bgcolor: "#FFFFFF", borderRadius: "16px", overflow: "hidden", cursor: "pointer",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid #E5DFD6",
                      transition: "transform 0.2s", "&:active": { transform: "scale(0.98)" },
                    }}
                  >
                    <Box sx={{ position: "relative", height: 140 }}>
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
                    </Box>
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
                    </Box>
                  </Box>
                ))}
              </AnimatePresence>
            </Box>
          )}
        </Box>
      </Box>
    </MobileLayout>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <MobileLayout>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography sx={{ color: "#6B7280" }}>กำลังโหลด...</Typography>
        </Box>
      </MobileLayout>
    }>
      <CategoryContent />
    </Suspense>
  );
}
