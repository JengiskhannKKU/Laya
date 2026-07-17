"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import { motion } from "framer-motion";
import { useLiveProducts } from "@/lib/use-live-products";
import SectionHeader from "./SectionHeader";
import EditorialProductCard from "./EditorialProductCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Curated For You ตาม mockup ล่าสุด: หัวข้อ editorial (CURATED ทอง + serif navy
 * + subtitle) แล้วกริดสินค้า 8 ชิ้น — desktop 4 คอลัมน์ × 2 แถว / มือถือ 2 คอลัมน์
 * ใช้ EditorialProductCard (การ์ดเฉพาะหน้าแรก) — ไม่แตะ ProductCard.tsx
 * เพราะหน้าอื่น (search, wishlist ฯลฯ) ยังใช้อยู่
 * ปุ่ม View All กลางล่างถอดออกตาม mockup — เหลือ "ดูทั้งหมด" ที่มุมหัวข้อ
 */
export default function RecommendedSection() {
  const { products } = useLiveProducts();
  const { t } = useLanguage();

  const visible = useMemo(() => products.slice(0, 8), [products]);

  return (
    // อยู่ใน container กลางของ MobileLayout (maxWidth 1440) เหมือน Story/Communities —
    // ไม่ full-bleed แล้ว ให้ทุก section เรียงตรงแนวเดียวกัน / เผยด้วย fade-up นุ่มๆ เมื่อเลื่อนถึง
    <Box
      component={motion.section}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      sx={{
        py: { xs: 4, md: 6 },
      }}
    >
      <SectionHeader
        variant="editorial"
        eyebrow={t("home.recommended.eyebrow")}
        title={t("home.recommended.title")}
        subtitle={t("home.recommended.subtitle")}
        href="/category"
      />

      {/* กริดเดียวใช้ทั้งสองขนาดจอ — มือถือ 2 คอลัมน์ / desktop 4 คอลัมน์ × 2 แถว */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        {visible.map((product) => (
          <EditorialProductCard key={product.id} product={product} />
        ))}
      </Box>
    </Box>
  );
}
