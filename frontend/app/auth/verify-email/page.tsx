import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import VerifyEmailForm from "./VerifyEmailForm";

export const metadata: Metadata = createPageMetadata({
  title: "ยืนยันอีเมล",
  description: "ยืนยันอีเมลของคุณเพื่อเริ่มใช้งาน LAYA",
  path: "/auth/verify-email",
  noIndex: true,
});

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
