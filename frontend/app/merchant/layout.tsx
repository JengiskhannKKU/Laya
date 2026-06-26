import type { Metadata } from "next";
import MerchantLayoutClient from "@/components/merchant/MerchantLayoutClient";

export const metadata: Metadata = { title: "แดชบอร์ดร้านค้า | LAYA" };

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return <MerchantLayoutClient>{children}</MerchantLayoutClient>;
}
