import type { Metadata } from "next";
import DesignStudioRoot from "@/components/design-clothes/DesignStudioRoot";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "ออกแบบชุดของคุณ | Garment Builder",
  description:
    "ออกแบบเสื้อผ้าง่ายๆ ใน 5 นาที — คลิกเปลี่ยนคอ แขน กระเป๋า เลือกลายผ้าไทยและสีได้ทันที เริ่มจากเทมเพลตสวยๆ กับ LAYA Garment Builder.",
  path: "/design-clothes",
});

export default function DesignClothesPage() {
  return <DesignStudioRoot />;
}
