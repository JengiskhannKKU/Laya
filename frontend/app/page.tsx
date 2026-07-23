import type { Metadata } from "next";
import MobileLayout from "@/components/layout/MobileLayout";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import HeroSearch from "@/components/home/HeroSearch";
import FloatingSearch from "@/components/home/FloatingSearch";
import RecommendedSection from "@/components/home/RecommendedSection";
import EditorialSection from "@/components/home/EditorialSection";
import CommunitiesSection from "@/components/home/CommunitiesSection";
import DemoPosterModal from "@/components/home/DemoPosterModal";
import GallerySection from "@/components/home/GallerySection";
import PartnersSection from "@/components/home/PartnersSection";
import VideoShowcaseSection from "@/components/home/VideoShowcaseSection";

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
      {/* ป๊อบอัพโฆษณาโปสเตอร์ต้อนรับเมื่อเปิดเว็บครั้งแรก (แสดงครั้งเดียว บันทึกใน localStorage) */}
      <DemoPosterModal />
      {/* ลำดับตาม mockup: hero (ภาพชนขอบขวา) → ค้นหาลอย → โลโก้พาร์ทเนอร์ (แถวเดียวเลื่อน) → Curated For You → วิดีโอ Advise/video1 →
          Story + Royal Quote (การ์ดคู่) → ชุมชน → แกลเลอรีผลงาน */}
      <HeroSearch />
      <FloatingSearch />
      {/* Partners Section — โลโก้พาร์ทเนอร์ 1 แถว เลื่อนสไลด์ต่อเนื่อง */}
      <PartnersSection />
      {/* Curated For You (คัดสรรสำหรับคุณ 4 ชิ้น) */}
      <RecommendedSection />
      {/* Communities Section — ชุมชนและร้านค้า (ดีไซน์วงกลมสไตล์ Shopee Mall) ต่อจากคัดสรรสำหรับคุณ */}
      <CommunitiesSection />
      {/* Video Showcase Section — วิดีโอ Advise.mp4 & video1.mp4 */}
      <VideoShowcaseSection />
      <EditorialSection />
      {/* Product Gallery Section — ต่อจาก ชุมชนและร้านค้า */}
      <GallerySection />
    </MobileLayout>
  );
}
