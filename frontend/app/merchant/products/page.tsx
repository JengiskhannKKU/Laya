"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { PRODUCT_CATEGORIES } from "@/components/merchant/ProductForm";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

interface MerchantProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  priceUnit: string;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  isActive: boolean;
  hasVariants: boolean;
  variantCount?: number;
  priceMin?: number;
  priceMax?: number;
  stockTotal?: number;
}

const categoryLabel = (v: string) => PRODUCT_CATEGORIES.find((c) => c.value === v)?.label ?? v;

export default function MerchantProductsPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    if (!session?.access_token) { setLoading(false); return; }
    try {
      const res = await authFetch(`${API_BASE}/api/products/mine`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดรายการสินค้าไม่สำเร็จ");
      setProducts(data);
    } catch (err) {
      setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดรายการสินค้าไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) => !search || p.name.includes(search) || categoryLabel(p.category).includes(search));

  const toggleActive = async (product: MerchantProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)));
    try {
      const res = await authFetch(`${API_BASE}/api/products/${product.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: product.isActive } : p))); // rollback
      setError("เปลี่ยนสถานะสินค้าไม่สำเร็จ");
    }
  };

  const adjustStock = async (product: MerchantProduct, delta: number) => {
    if (product.stock + delta < 0) return;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock + delta } : p)));
    try {
      const res = await authFetch(`${API_BASE}/api/products/${product.id}/stock`, {
        method: "POST",
        body: JSON.stringify({ delta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ปรับสต็อกไม่สำเร็จ");
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: data.stock } : p)));
    } catch (err) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: product.stock } : p))); // rollback
      setError(err instanceof Error ? err.message : "ปรับสต็อกไม่สำเร็จ");
    }
  };

  const handleDelete = async (product: MerchantProduct) => {
    if (!window.confirm(`ลบ "${product.name}" ออกจากร้านใช่ไหม?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/products/${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ลบสินค้าไม่สำเร็จ");
      if (data.hidden) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: false } : p)));
        setError(data.message ?? "สินค้านี้เคยมีคำสั่งซื้อแล้ว จึงซ่อนจากการขายแทนการลบถาวร");
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบสินค้าไม่สำเร็จ");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A" }}>
          สินค้า / ผ้า
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={Link} href="/merchant/products/bulk-create"
            variant="outlined"
            sx={{ borderColor: "#C5A55A", color: "#1B2A4A", borderRadius: "10px", fontFamily: FONT, textTransform: "none", fontWeight: 600 }}
          >
            เพิ่มหลายรายการ
          </Button>
          <Button
            component={Link} href="/merchant/products/create"
            variant="contained" startIcon={<AddRoundedIcon />}
            sx={{ bgcolor: "#1B2A4A", borderRadius: "10px", fontFamily: FONT, textTransform: "none", fontWeight: 600 }}
          >
            เพิ่มสินค้า
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>
      )}

      <TextField
        fullWidth placeholder="ค้นหาสินค้า" value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#9CA3AF" }} /></InputAdornment> }}
        sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: "12px", "& fieldset": { borderColor: "#E5DFD6" } } }}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#C5A55A" }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#9CA3AF" }}>
          <InventoryRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem" }}>
            {products.length === 0 ? "ยังไม่มีสินค้า — เริ่มลงขายสินค้าชิ้นแรกกันเลย" : "ไม่พบสินค้าที่ค้นหา"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.map((product, i) => (
            <Card key={product.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none", opacity: product.isActive ? 1 : 0.6 }}
            >
              <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
                <Box sx={{ width: 60, height: 60, borderRadius: "10px", bgcolor: "#F0EBE3", flexShrink: 0, backgroundImage: product.images[0] ? `url(${product.images[0]})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, color: "#1B2A4A", fontSize: "0.9rem" }}>
                    {product.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.5, flexWrap: "wrap" }}>
                    <Chip label={categoryLabel(product.category)} size="small" sx={{ fontFamily: FONT, fontSize: "0.68rem", bgcolor: "#F0EBE3", color: "#1B2A4A", height: 20 }} />
                    {product.hasVariants ? (
                      <>
                        <Chip label={`Multi-SKU · ${product.variantCount ?? 0} ตัวเลือก`} size="small" sx={{ fontFamily: FONT, fontSize: "0.68rem", bgcolor: "rgba(197,165,90,0.15)", color: "#8A6D2F", height: 20 }} />
                        <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: "#C5A55A", fontSize: "0.85rem" }}>
                          {product.priceMin != null
                            ? (product.priceMin === product.priceMax ? `฿${product.priceMin.toLocaleString()}` : `฿${product.priceMin.toLocaleString()}–${(product.priceMax ?? product.priceMin).toLocaleString()}`)
                            : "ยังไม่มี SKU"}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6B7280" }}>
                          สต็อกรวม {product.stockTotal ?? 0} รายการ
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: "#C5A55A", fontSize: "0.85rem" }}>
                          ฿{product.price.toLocaleString()}/{product.priceUnit}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: product.stock === 0 ? "#EF4444" : (product.stock <= product.lowStockThreshold ? "#D97706" : "#6B7280") }}>
                          {product.stock === 0 ? "หมดสต็อก" : `สต็อก ${product.stock} ${product.priceUnit}`}
                          {product.stock > 0 && product.stock <= product.lowStockThreshold ? " · ใกล้หมด" : ""}
                        </Typography>
                      </>
                    )}
                  </Box>
                  {product.hasVariants ? (
                    <Button
                      size="small" component={Link} href={`/merchant/products/${product.id}/variants`}
                      startIcon={<TuneRoundedIcon sx={{ fontSize: 16 }} />}
                      sx={{ mt: 0.5, fontFamily: FONT, fontSize: "0.75rem", color: "#1B2A4A", textTransform: "none", p: 0 }}
                    >
                      จัดการ SKU
                    </Button>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => adjustStock(product, -1)} disabled={product.stock <= 0} sx={{ color: "#6B7280" }}>
                        <RemoveCircleOutlineRoundedIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => adjustStock(product, 1)} sx={{ color: "#6B7280" }}>
                        <AddCircleOutlineRoundedIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                  <Switch
                    checked={product.isActive} onChange={() => toggleActive(product)} size="small"
                    sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }}
                  />
                  <IconButton size="small" component={Link} href={`/merchant/products/edit/${product.id}`} sx={{ color: "#6B7280" }}>
                    <EditRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(product)} sx={{ color: "#EF4444" }}>
                    <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
