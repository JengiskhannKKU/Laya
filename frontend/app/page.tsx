import MobileLayout from "@/components/layout/MobileLayout";
import HeroSearch from "@/components/home/HeroSearch";
import BannerCarousel from "@/components/home/BannerCarousel";
import MissionSection from "@/components/home/MissionSection";
import CategorySection from "@/components/home/CategorySection";
import RecommendedSection from "@/components/home/RecommendedSection";
import EditorialSection from "@/components/home/EditorialSection";
import CommunitiesSection from "@/components/home/CommunitiesSection";
import InspirationSection from "@/components/home/InspirationSection";

// หมายเหตุ: ตัด NewArrivalsSection + ExploreSection ออกจากหน้าแรก (ธีม declutter)
// ทั้งสองซ้ำซ้อนกับสิ่งที่มีอยู่แล้ว: NewArrivals โชว์กริดสินค้าเดิมซ้ำกับ Recommended,
// Explore เป็น mini-browse เต็มรูปแบบที่ซ้ำกับหน้า /search และ /category — ไฟล์ยังอยู่เผื่อใช้ที่อื่น

export default function HomePage() {
  return (
    <MobileLayout>
      <HeroSearch />
      <BannerCarousel />
      <CategorySection />
      <RecommendedSection />
      <EditorialSection />
      <CommunitiesSection />
      <MissionSection />
      <InspirationSection />
    </MobileLayout>
  );
}
