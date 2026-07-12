import type { Metadata } from "next";
import MobileLayout from "@/components/layout/MobileLayout";
import TailorWithFabricFlow from "@/components/tailor/TailorWithFabricFlow";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "สั่งตัดด้วยผ้าของคุณเอง",
  description: "สั่งตัดเสื้อผ้าจากผ้าไทยที่คุณมีอยู่แล้ว ระบุแบบและขนาดที่ต้องการให้ช่างตัดเย็บมืออาชีพ",
  path: "/tailor/with-fabric",
});

export default function TailorWithFabricPage() {
  return (
    <MobileLayout>
      <TailorWithFabricFlow />
    </MobileLayout>
  );
}
