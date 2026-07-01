import MobileLayout from "@/components/layout/MobileLayout";
import HeroSearch from "@/components/home/HeroSearch";
import BannerCarousel from "@/components/home/BannerCarousel";
import MissionSection from "@/components/home/MissionSection";
import CategorySection from "@/components/home/CategorySection";
import RecommendedSection from "@/components/home/RecommendedSection";
import EditorialSection from "@/components/home/EditorialSection";
import CommunitiesSection from "@/components/home/CommunitiesSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import InspirationSection from "@/components/home/InspirationSection";
import ExploreSection from "@/components/home/ExploreSection";

export default function HomePage() {
  return (
    <MobileLayout>
      <HeroSearch />
      <BannerCarousel />
      <CategorySection />
      <RecommendedSection />
      <EditorialSection />
      <CommunitiesSection />
      <NewArrivalsSection />
      <MissionSection />
      <InspirationSection />
      <ExploreSection />
    </MobileLayout>
  );
}
