"use client";

import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import { products } from "@/lib/mock-data";
import SectionHeader from "./SectionHeader";
import ProductCard from "./ProductCard";

export default function NewArrivalsSection() {
  const newProducts = products.slice(2, 6);

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
        eyebrow="New Arrivals"
        title="มาใหม่ล่าสุด"
        subtitle="Fresh from the loom, ready to discover"
        href="/community"
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: { xs: 2, md: 3 },
        }}
      >
        {newProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            collection="New Arrival"
            variant="grid"
          />
        ))}
      </Box>
    </Box>
  );
}
