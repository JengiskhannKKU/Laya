import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "เลือกทอผ้า",
  description: "สำรวจลายผ้าไทยจากทั่วประเทศ เลือกลายที่ชอบแล้วสั่งทอกับชุมชนช่างทอโดยตรง หรือออกแบบลายใหม่ด้วย AI",
  path: "/services/weave",
});

export default function ServicesWeaveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
