import type { Metadata } from "next";
import CustomGenerator from "@/components/custom/CustomGenerator";
import MobileLayout from "@/components/layout/MobileLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "ออกแบบลายผ้าไทยด้วย AI — Custom Design",
  description:
    "ออกแบบลายผ้าไทยของคุณเองด้วย AI เลือกลาย สี และเทคนิคการทอ แล้วจับคู่กับช่างทอชุมชนจริงเพื่อสั่งทอ บน LAYA",
  path: "/custom",
});

export default function CustomPage() {
  return (
    <MobileLayout>
      <CustomGenerator />
    </MobileLayout>
  );
}
