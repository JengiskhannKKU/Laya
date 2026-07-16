import type { Metadata } from "next";
import MobileLayout from "@/components/layout/MobileLayout";
import AboutContent from "@/components/about/AboutContent";
import { createPageMetadata } from "@/lib/seo";
import InspirationSection from "@/components/home/InspirationSection";


export const metadata: Metadata = createPageMetadata({
  title: "เกี่ยวกับเรา | LAYA",
  description:
    "LAYA คือแพลตฟอร์มผ้าไทยที่เชื่อมโยงชุมชนช่างทอทั่วประเทศเข้ากับผู้คนทั่วโลก — จากแรงบันดาลใจในพระราชปณิธานอนุรักษ์ผ้าไหมไทย สู่ Fashion Tech Marketplace",
  path: "/about",
});

export default function AboutPage() {
  return (
    <MobileLayout>
      
      <AboutContent />
      <InspirationSection />
    </MobileLayout>
  );
}
