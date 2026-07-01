import type { Metadata, Viewport } from "next";
import { Kanit, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import MuiProvider from "@/components/providers/MuiProvider";
import AuthProviderWrapper from "@/components/providers/AuthProviderWrapper";
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
  title: "LAYA - Every Pattern Tells a Story",
  description:
    "AI-Powered Thai Textile Marketplace. Discover authentic Thai fabrics from local communities with AI matching, digital textile passports, and AR simulation.",
  generator: "v0.app",
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
        <MuiProvider>
          <AuthProviderWrapper>{children}</AuthProviderWrapper>
        </MuiProvider>
        <Analytics />
      </body>
    </html>
  );
}
