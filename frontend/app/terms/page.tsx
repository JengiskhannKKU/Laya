import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/seo";
import AppTopNav from "@/components/layout/TopNav";
import AppFooter from "@/components/layout/Footer";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service — ข้อกำหนดและเงื่อนไขการใช้งาน",
  description:
    "ข้อกำหนดและเงื่อนไขการใช้งาน LAYA แพลตฟอร์ม Fashion Tech Marketplace โปรดอ่านก่อนใช้บริการ",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: `Terms of Service — ข้อกำหนดการใช้งาน | ${siteName}`,
    description: "อ่านข้อกำหนดและเงื่อนไขการใช้งาน LAYA เพื่อทำความเข้าใจสิทธิ หน้าที่ และข้อตกลงระหว่างท่านกับแพลตฟอร์ม",
    url: `${siteUrl}/terms`,
    siteName,
    locale: "th_TH",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <>
      <AppTopNav />
      <TermsContent />
      <AppFooter />
    </>
  );
}
