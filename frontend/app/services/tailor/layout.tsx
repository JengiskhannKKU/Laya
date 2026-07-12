import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "สั่งตัดเสื้อผ้า",
  description: "ออกแบบและสั่งตัดชุดจากผ้าไทยที่คุณเลือก ไม่ว่าจะมีผ้าอยู่แล้วหรือยังไม่มี",
  path: "/services/tailor",
});

export default function ServicesTailorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
