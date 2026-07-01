"use client";

import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import { products } from "@/lib/mock-data";
import SectionHeader from "./SectionHeader";
import ProductCard from "./ProductCard";

export default function RecommendedSection() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{ py: { xs: 4, md: 7 } }}
    >
      <SectionHeader
        eyebrow="Curated"
        title="คัดสรรสำหรับคุณ"
        subtitle="Handpicked based on your interests"
        href="/community"
      />

      {/* Horizontal scroll on mobile, 4-col grid on desktop */}
      <Box
        sx={{
          display: { xs: "flex", md: "grid" },
          gridTemplateColumns: { md: "repeat(4, 1fr)" },
          gap: { xs: 2, md: 3 },
          overflowX: { xs: "auto", md: "visible" },
          pb: 1,
          scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {products.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            collection="Curated"
            variant="carousel"
          />
        ))}
      </Box>
    </Box>
  );
}
