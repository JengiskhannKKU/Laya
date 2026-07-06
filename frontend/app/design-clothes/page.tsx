import type { Metadata } from "next";
import ClothingDesigner from "@/components/design-clothes/ClothingDesigner";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "ออกแบบเสื้อผ้าของคุณ",
  description:
    "เลือกทรงเสื้อ เลือกผ้า ปรับดีไซน์ และสร้างสรรค์ชิ้นงานในแบบของคุณกับ LAYA.",
  path: "/design-clothes",
});

export default function DesignClothesPage() {
  return <ClothingDesigner />;
}
