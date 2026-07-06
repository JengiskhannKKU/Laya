import type { Metadata } from "next";
import MobileLayout from "@/components/layout/MobileLayout";
import HeritageStory from "@/components/community/HeritageStory";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "The Story Behind Thai Silk — เรื่องราวเบื้องหลังผ้าไหมไทย",
  description:
    "พระราชกรณียกิจของสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง ในการอนุรักษ์ ฟื้นฟู และส่งเสริมผ้าไหมไทยให้เป็นมรดกทางวัฒนธรรมของแผ่นดิน",
  path: "/community/heritage",
  image: "/heritage/exhibition-gowns-blue.webp",
  type: "article",
});

export default function HeritagePage() {
  return (
    <MobileLayout>
      <HeritageStory />
    </MobileLayout>
  );
}
