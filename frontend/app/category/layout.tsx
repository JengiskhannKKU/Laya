import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "หมวดหมู่สินค้า",
  description: "เลือกซื้อผ้าไทยทอมือตามหมวดหมู่ ผ้าไหม ผ้าฝ้าย ผ้าคราม กระเป๋า และงานทอจากชุมชนทั่วไทย",
  path: "/category",
});

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
