"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Link from "next/link";
import { motion } from "framer-motion";

const MOCK_PRODUCTS = [
  { id: "p1", name: "ผ้าไหมมัดหมี่ ลายขอ", type: "ผ้าไหม", price: 1200, stock: 45, active: true, image: "/product1.jpg" },
  { id: "p2", name: "ผ้าขิดลายดอกพิกุล", type: "ผ้าฝ้าย", price: 850, stock: 0, active: false, image: "/product2.jpg" },
  { id: "p3", name: "ผ้าทอมือลายน้ำ", type: "ผ้าทอมือ", price: 950, stock: 20, active: true, image: "/product3.jpg" },
  { id: "p4", name: "ผ้าซิ่นลายขอเชียงใหม่", type: "ผ้าไหม", price: 2400, stock: 8, active: true, image: "/product4.jpg" },
];

export default function MerchantProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const filtered = products.filter((p) => !search || p.name.includes(search) || p.type.includes(search));

  const toggleActive = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A" }}>
          สินค้า / ผ้า
        </Typography>
        <Button
          component={Link} href="/merchant/products/create"
          variant="contained" startIcon={<AddRoundedIcon />}
          sx={{ bgcolor: "#1B2A4A", borderRadius: "10px", fontFamily: '"Kanit", sans-serif', textTransform: "none", fontWeight: 600 }}
        >
          เพิ่มสินค้า
        </Button>
      </Box>

      <TextField
        fullWidth placeholder="ค้นหาสินค้า" value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#9CA3AF" }} /></InputAdornment> }}
        sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: "12px", "& fieldset": { borderColor: "#E5DFD6" } } }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filtered.map((product, i) => (
          <Card key={product.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none", opacity: product.active ? 1 : 0.65 }}
          >
            <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
              {/* Image placeholder */}
              <Box sx={{ width: 60, height: 60, borderRadius: "10px", bgcolor: "#F0EBE3", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.4rem" }}>🧵</Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", fontSize: "0.9rem" }}>
                  {product.name}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.5, flexWrap: "wrap" }}>
                  <Chip label={product.type} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.68rem", bgcolor: "#F0EBE3", color: "#1B2A4A", height: 20 }} />
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#C5A55A", fontSize: "0.85rem" }}>
                    ฿{product.price.toLocaleString()}/ม.
                  </Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: product.stock === 0 ? "#EF4444" : "#6B7280" }}>
                    {product.stock === 0 ? "หมดสต็อก" : `สต็อก ${product.stock} ม.`}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                <Switch
                  checked={product.active} onChange={() => toggleActive(product.id)} size="small"
                  sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }}
                />
                <IconButton size="small" component={Link} href={`/merchant/products/edit/${product.id}`} sx={{ color: "#6B7280" }}>
                  <EditRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" sx={{ color: "#EF4444" }}>
                  <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
