import MobileLayout from "@/components/layout/MobileLayout";
import HomeHeader from "@/components/home/HomeHeader";
import SearchBar from "@/components/home/SearchBar";
import BannerCarousel from "@/components/home/BannerCarousel";
import CategorySection from "@/components/home/CategorySection";
import RecommendedSection from "@/components/home/RecommendedSection";
import CommunitiesSection from "@/components/home/CommunitiesSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";

export default function HomePage() {
  return (
    <MobileLayout>
      <HomeHeader />
      <SearchBar />
      <BannerCarousel />
      <CategorySection />
      <RecommendedSection />
      <CommunitiesSection />
      <NewArrivalsSection />
    </MobileLayout>
  );
}
