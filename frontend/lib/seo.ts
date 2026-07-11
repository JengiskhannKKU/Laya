import type { Metadata } from "next";

export const siteName = "LAYA";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const defaultTitle = "LAYA - ตลาดผ้าไทยและงานทอมือจากชุมชน";

export const defaultDescription =
  "ค้นพบผ้าไทย งานทอมือ สินค้า GI และบริการออกแบบผ้าด้วย AI จากช่างทอและชุมชนท้องถิ่นทั่วไทย พร้อม Digital Textile Passport.";

export const defaultKeywords = [
  "LAYA",
  "ผ้าไทย",
  "ผ้าไหมไทย",
  "ผ้าทอมือ",
  "สินค้า GI",
  "ช่างทอไทย",
  "ตลาดผ้าไทย",
  "AI ออกแบบลายผ้า",
  "Digital Textile Passport",
];

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncateDescription(text: string, maxLength = 155) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

export function createPageMetadata({
  title,
  description,
  path,
  image = "/images/banner1.webp",
  type = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    // title.absolute (ไม่ใช่ string เฉยๆ) กัน root layout's title.template ("%s | LAYA")
    // เอา fullTitle (ที่ต่อ "| LAYA" มาแล้ว) ไปต่ออีกชั้น กลายเป็น "... | LAYA | LAYA"
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName,
      locale: "th_TH",
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  };
}
