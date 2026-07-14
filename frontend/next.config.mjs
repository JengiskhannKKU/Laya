/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Supabase project ref — ดึงจาก URL หรือ hardcode
const SUPABASE_HOSTNAME = "qxxygqugalqdrapgkcbu.supabase.co";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // เปิด optimization + WebP/AVIF conversion โดย Next.js
    unoptimized: false,
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400, // cache 1 วัน
    // อนุญาต SVG ผ่าน next/image optimizer — ใช้เฉพาะไฟล์โลโก้ที่เชื่อถือได้ใน /public เท่านั้น (ไม่ใช่จากผู้ใช้อัปโหลด)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Supabase Storage — รูปทุกอย่างที่อัปโหลดขึ้น Storage
      {
        protocol: "https",
        hostname: SUPABASE_HOSTNAME,
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // Supabase CDN transform URL
      {
        protocol: "https",
        hostname: SUPABASE_HOSTNAME,
        port: "",
        pathname: "/storage/v1/render/image/**",
      },
      // placehold.co — ยังมีบางหน้าใช้ placeholder
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${BACKEND_URL}/health`,
      },
    ];
  },
};

export default nextConfig;
