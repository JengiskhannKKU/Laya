import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "สั่งทอผ้าตามแบบ",
  description: "สั่งทอผ้าไทยตามลาย สี และจำนวนเมตรที่คุณต้องการ จากชุมชนช่างทอโดยตรง",
  path: "/weaving-order",
});

export default function WeavingOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
