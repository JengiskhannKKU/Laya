import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "ค้นหาผ้าไทย",
  description: "ค้นหาผ้าทอมือ ชุมชนช่างทอ และลวดลายผ้าไทยที่คุณสนใจจากทั่วประเทศ",
  path: "/search",
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
