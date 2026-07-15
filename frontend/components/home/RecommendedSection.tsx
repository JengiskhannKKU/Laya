"use client";

import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import { useLiveProducts } from "@/lib/use-live-products";
import SectionHeader from "./SectionHeader";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function RecommendedSection() {
  const { products } = useLiveProducts();
  const { t } = useLanguage();
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
        eyebrow={t("home.recommended.eyebrow")}
        title={t("home.recommended.title")}
        subtitle={t("home.recommended.subtitle")}
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
