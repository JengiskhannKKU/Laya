import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = createPageMetadata({
  title: "สมัครสมาชิก",
  description: "สร้างบัญชีใหม่เพื่อเข้าร่วมเป็นส่วนหนึ่งของ LAYA",
  path: "/auth/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterForm />;
}
