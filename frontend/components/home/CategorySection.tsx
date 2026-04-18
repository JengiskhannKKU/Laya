"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { categories } from "@/lib/mock-data";
import Link from "next/link";
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
  const props = { size: 30, color, strokeWidth: 1.5 };
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

const categoryStyles: Record<string, { bg: string; iconColor: string }> = {
  fabric: { bg: "#1B2A4A", iconColor: "#FFFFFF" },
  clothing: { bg: "#1B2A4A", iconColor: "#FFFFFF" },
  scarf: { bg: "#1B2A4A", iconColor: "#FFFFFF" },
  bag: { bg: "#1B2A4A", iconColor: "#FFFFFF" },
  premium: { bg: "#1B2A4A", iconColor: "#FFFFFF" },
  decor: { bg: "#1B2A4A", iconColor: "#FFFFFF" },
  others: { bg: "#1B2A4A", iconColor: "#FFFFFF" },
};

export default function CategorySection() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      sx={{ py: 2, px: 2.5 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Noto Serif Thai", serif',
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#333",
          }}
        >
          หมวดหมู่
        </Typography>
        <Typography
          component={Link}
          href="/categories"
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.85rem",
            color: "#091751ff",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          ดูทั้งหมด
        </Typography>
      </Box>

      {/* Horizontal Scrollable Container */}
      <Box
        sx={{
          display: "flex",
          gap: 2.5,
          overflowX: "auto",
          pb: 1.5, // Space for drop shadow
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
        {categories.map((cat, index) => {
          const style = categoryStyles[cat.id] || categoryStyles.others;
          return (
            <Link
              key={cat.id}
              href={`/community?category=${cat.id}`}
              style={{ textDecoration: "none", flexShrink: 0 }}
            >
              <Box
                component={motion.div}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "64px",
                  gap: 1.2,
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "18px",
                    bgcolor: style.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  {getCategoryIcon(cat.id, style.iconColor)}
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    color: "#555",
                    textAlign: "center",
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                  }}
                >
                  {cat.name}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}
