import type { Metadata } from "next";
import GarmentCreatorLoader from "@/components/garment-creator/Loader";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "ห้องออกแบบเสื้อผ้า 3D",
  description:
    "สร้างชุดของคุณเองแบบอินเทอร์แอคทีฟ — คลิกทุกชิ้นส่วน ลากผ้าไทยมาวาง ปรับดีไซน์แบบเรียลไทม์ กับ LAYA Garment Creator.",
  path: "/design-clothes",
});

export default function DesignClothesPage() {
  return <GarmentCreatorLoader />;
}
