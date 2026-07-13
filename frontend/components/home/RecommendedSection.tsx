"use client";

import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import { useLiveProducts } from "@/lib/use-live-products";
import SectionHeader from "./SectionHeader";
import ProductCard from "./ProductCard";

export default function RecommendedSection() {
  const { products } = useLiveProducts();
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
          px: { xs: 2.5, md: 0 },
          // scroll-padding ต้องเท่ากับ padding จริง ไม่งั้น mandatory snap จะเลื่อน scrollLeft
          // เริ่มต้นไปเท่ากับ padding โดยอัตโนมัติ (ชิดขอบ ไม่เห็น gutter ซ้ายตอนโหลดหน้า)
          scrollPaddingLeft: { xs: "20px", md: 0 },
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
