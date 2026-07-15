import type { MetadataRoute } from "next";
import { siteName, defaultDescription } from "@/lib/seo";

/**
 * Web App Manifest — ไฟล์ใหม่ล้วนๆ ตาม Next.js file convention (auto-link เป็น <link rel="manifest">
 * โดยไม่ต้องแก้ app/layout.tsx) ไม่กระทบระบบเดิม แค่เพิ่ม PWA/installability signal ให้ SEO+Discover
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — Every Pattern Tells a Story`,
    short_name: siteName,
    description: defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6F0",
    theme_color: "#1B2A4A",
    lang: "th",
    icons: [
      {
        src: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/laya-logo-navy-192_192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/laya-logo-navy-512_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/laya-logo-white-192_192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/laya-logo-white-512_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
