import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "บริการ",
  description: "บริการสั่งตัดและสั่งทอผ้าไทยตามแบบที่คุณต้องการ ออกแบบลายผ้าด้วย AI แล้วสั่งทอกับช่างทอในชุมชนโดยตรง",
  path: "/services",
});

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
