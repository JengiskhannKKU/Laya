import type { Metadata } from "next";
import MobileLayout from "@/components/layout/MobileLayout";
import HeritageStory from "@/components/community/HeritageStory";
import { absoluteUrl, createPageMetadata, siteName } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

const TITLE = "The Story Behind Thai Silk — เรื่องราวเบื้องหลังผ้าไหมไทย";
const DESCRIPTION =
  "พระราชกรณียกิจของสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง ในการอนุรักษ์ ฟื้นฟู และส่งเสริมผ้าไหมไทยให้เป็นมรดกทางวัฒนธรรมของแผ่นดิน";

export const metadata: Metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/community/heritage",
  image: "/heritage/exhibition-gowns-blue.webp",
  type: "article",
});

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  image: absoluteUrl("/heritage/exhibition-gowns-blue.webp"),
  datePublished: "2026-07-07",
  dateModified: "2026-07-07",
  author: { "@type": "Organization", name: siteName },
  publisher: { "@type": "Organization", name: siteName },
  mainEntityOfPage: absoluteUrl("/community/heritage"),
};

export default function HeritagePage() {
  return (
    <MobileLayout>
      <JsonLd data={articleJsonLd} />
      <HeritageStory />
    </MobileLayout>
  );
}
