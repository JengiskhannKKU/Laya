import type { Metadata } from "next";
import MobileLayout from "@/components/layout/MobileLayout";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import HeroSearch from "@/components/home/HeroSearch";
import FloatingSearch from "@/components/home/FloatingSearch";
import RecommendedSection from "@/components/home/RecommendedSection";
import EditorialSection from "@/components/home/EditorialSection";
import CommunitiesSection from "@/components/home/CommunitiesSection";

// หมายเหตุ: ตัด NewArrivalsSection + ExploreSection ออกจากหน้าแรก (ธีม declutter)
// ทั้งสองซ้ำซ้อนกับสิ่งที่มีอยู่แล้ว: NewArrivals โชว์กริดสินค้าเดิมซ้ำกับ Recommended,
// Explore เป็น mini-browse เต็มรูปแบบที่ซ้ำกับหน้า /search และ /category — ไฟล์ยังอยู่เผื่อใช้ที่อื่น
//
// BannerCarousel ไม่ได้หายไป — ถูกรวมเข้าไปเป็นภาพ cinematic ฝั่งขวาของ HeroSearch
// (redesign แบบ split hero) เนื้อหา banner จาก backend ยังแสดงครบผ่าน overlay + dots

// title/description เจาะจงหน้าแรก (เดิมไม่มี metadata export เลย ใช้ fallback ทั่วไปจาก layout.tsx)
// คง alternates.languages ของเดิมจาก layout.tsx ไว้ (createPageMetadata ไม่ได้ตั้งฟิลด์นี้ ถ้าไม่ระบุซ้ำจะหายไปตอน merge)
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "LAYA | Thai Fabric & Fashion Tech Marketplace",
    description:
      "ตลาดผ้าไทยและ Fashion Tech AI ที่รวมผ้าไหม ผ้าฝ้าย งานทอมือจากชุมชนทั่วไทย เชื่อมช่างทอ นักออกแบบ และผู้รักผ้าไทยทั่วโลก — Thai Fabric Marketplace",
    path: "/",
  }),
  alternates: {
    canonical: absoluteUrl("/"),
    languages: { th: "/" },
  },
};

export default function HomePage() {
  return (
    <MobileLayout>
      {/* ลำดับตาม mockup: hero (ภาพชนขอบขวา) → ค้นหาลอย → Curated For You →
          Story + Royal Quote (การ์ดคู่) → ชุมชน → แรงบันดาลใจ
          หมายเหตุ: TrustBar ถอดออกตาม mockup ล่าสุด, คำคมพระราชปณิธานย้ายไปอยู่ใน EditorialSection */}
      <HeroSearch />
      <FloatingSearch />
      <RecommendedSection />
      <EditorialSection />
      <CommunitiesSection />
    </MobileLayout>
  );
}
