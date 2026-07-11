"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { fetchCategories, type Category } from "@/lib/categories";
import Link from "next/link";
import SectionHeader from "./SectionHeader";
import {
  Layers,
  Shirt,
  Wind,
  ShoppingBag,
  Gift,
  Armchair,
  LayoutGrid
} from "lucide-react";

const getCategoryIcon = (id: string, color: string) => {
  const props = { size: 28, color, strokeWidth: 1.4 };
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

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (!categories.length) return null;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{ py: { xs: 4, md: 6 } }}
    >
      <SectionHeader
        eyebrow="Browse"
        title="หมวดหมู่"
        subtitle="Explore by craft and creation"
        href="/category"
      />

      {/* Category Container — horizontal scroll on mobile, centered wrap on desktop */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 3, md: 5 },
          overflowX: { xs: "auto", md: "visible" },
          flexWrap: { xs: "nowrap", md: "wrap" },
          justifyContent: { xs: "flex-start", md: "center" },
          pb: 1.5,
          pt: 0.5,
          px: 0.5,
          mx: -0.5,
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {categories.map((cat, index) => (
          <Link
            key={cat.id}
            href={`/category?c=${cat.id}`}
            style={{ textDecoration: "none", flexShrink: 0 }}
          >
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: { xs: "72px", md: "88px" },
                gap: 1.4,
                cursor: "pointer",
                "&:hover .laya-cat-circle": {
                  transform: "translateY(-4px)",
                  borderColor: "#C5A55A",
                  boxShadow: "0 10px 24px rgba(197,165,90,0.18)",
                },
                "&:hover .laya-cat-icon svg": { stroke: "#C5A55A" },
                "&:hover .laya-cat-label": { color: "#1B2A4A" },
              }}
            >
              <Box
                className="laya-cat-circle"
                sx={{
                  width: { xs: 68, md: 84 },
                  height: { xs: 68, md: 84 },
                  borderRadius: "50%",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E5DFD6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition:
                    "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <Box
                  className="laya-cat-icon"
                  sx={{
                    display: "flex",
                    "& svg": { transition: "stroke 0.3s ease" },
                  }}
                >
                  {getCategoryIcon(cat.id, "#1B2A4A")}
                </Box>
              </Box>
              <Typography
                className="laya-cat-label"
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 400,
                  fontSize: "0.75rem",
                  color: "#7A7468",
                  textAlign: "center",
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                  transition: "color 0.25s ease",
                }}
              >
                {cat.name}
              </Typography>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
}
