import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/seo";
import AppTopNav from "@/components/layout/TopNav";
import AppFooter from "@/components/layout/Footer";
import PrivacyPolicyContent from "@/components/legal/PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — นโยบายความเป็นส่วนตัว",
  description:
    "นโยบายความเป็นส่วนตัวของ LAYA แพลตฟอร์ม Fashion Tech Marketplace ที่ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลตามกฎหมาย PDPA พ.ศ. 2562",
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
  openGraph: {
    title: `Privacy Policy — นโยบายความเป็นส่วนตัว | ${siteName}`,
    description: "อ่านนโยบายความเป็นส่วนตัวของ LAYA เพื่อทำความเข้าใจวิธีที่เราเก็บรวบรวม ใช้ และคุ้มครองข้อมูลของคุณ",
    url: `${siteUrl}/privacy-policy`,
    siteName,
    locale: "th_TH",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <AppTopNav />
      <PrivacyPolicyContent />
      <AppFooter />
    </>
  );
}
