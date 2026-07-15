import type { Metadata, Viewport } from "next";
import { Kanit, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import MuiProvider from "@/components/providers/MuiProvider";
import AuthProviderWrapper from "@/components/providers/AuthProviderWrapper";
import { AppModalProvider } from "@/components/providers/AppModalProvider";
import CookieConsentBanner from "@/components/layout/CookieConsentBanner";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import {
  absoluteUrl,
  defaultDescription,
  defaultKeywords,
  defaultTitle,
  siteName,
  siteUrl,
} from "@/lib/seo";
import "./globals.css";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "marketplace",
  alternates: {
    canonical: "/",
    languages: {
      th: "/",
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    siteName,
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/images/banner1.webp",
        width: 1200,
        height: 630,
        alt: "LAYA Thai textile marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/images/banner1.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: absoluteUrl("/icon.svg"),
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  inLanguage: "th-TH",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} ${cormorantGaramond.variable}`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        style={{
          fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
          backgroundColor: "#FAF6F0",
          margin: 0,
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZCPR1SEDZ4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZCPR1SEDZ4');
          `}
        </Script>
        <LanguageProvider>
          <MuiProvider>
            <AuthProviderWrapper>
              <AppModalProvider>{children}</AppModalProvider>
            </AuthProviderWrapper>
          </MuiProvider>
        </LanguageProvider>
        <Analytics />
        <CookieConsentBanner />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
