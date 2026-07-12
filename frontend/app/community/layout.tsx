import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "ชุมชนช่างทอ",
  description: "สำรวจชุมชนช่างทอผ้าที่ผ่านการรับรองจาก LAYA ทั่วประเทศไทย พร้อมเรื่องราวและผลงานของแต่ละชุมชน",
  path: "/community",
});

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
