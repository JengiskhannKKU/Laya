import type { Metadata } from "next";
import MerchantLayoutClient from "@/components/merchant/MerchantLayoutClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "แดชบอร์ดร้านค้า",
  description: "พื้นที่จัดการร้านค้าสำหรับผู้ขายบน LAYA",
  path: "/merchant",
  noIndex: true,
});

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return <MerchantLayoutClient>{children}</MerchantLayoutClient>;
}
