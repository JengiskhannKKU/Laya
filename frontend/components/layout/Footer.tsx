"use client";

import Link from "next/link";
import Image from "next/image";
import LayaLogo from "@/components/common/LayaLogo";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import PwaInstallButton from "@/components/pwa/PwaInstallButton";
import { siteUrl } from "@/lib/seo";

const PAYMENT_LOGO_URL =
  "https://qxxygqugalqdrapgkcbu.supabase.co/storage/v1/object/public/icon_payment/76b72f88-62ea-43cc-8b81-0101ba42f81e-cover.png";

function buildFooterLinks(f: Dictionary["footer"]) {
  return {
    services: {
      label: f.services.label,
      links: [
        { label: f.services.tailorWeave, href: "/services" },
        { label: f.services.designClothes, href: "/design-clothes" },
        { label: f.services.aiTryOn, href: "/services" },
        { label: f.services.aiPattern, href: "/custom" },
      ],
    },
    legal: {
      label: f.legal.label,
      links: [
        { label: f.legal.privacyPolicy, href: "/privacy-policy" },
        { label: f.legal.terms, href: "/terms" },
      ],
    },
  };
}

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61590235357496",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/laya_thailand/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  // {
  //   label: "TikTok",
  //   href: "https://tiktok.com",
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  //       <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.72a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z" />
  //     </svg>
  //   ),
  // },
  {
    label: "Line",
    href: "https://lin.ee/UaBTbfz",
    icon: (
      <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 14.4979C30 8.15792 23.7199 3 15.9999 3C8.28094 3 2 8.15792 2 14.4979C2 20.1817 6.98063 24.9417 13.7084 25.8418C14.1644 25.9412 14.7849 26.146 14.9419 26.5404C15.0831 26.8986 15.0342 27.4598 14.987 27.8216C14.987 27.8216 14.8227 28.8214 14.7873 29.0343C14.7264 29.3926 14.5061 30.4353 15.9999 29.7981C17.4942 29.1609 24.0626 24.9935 26.9998 21.572C29.0287 19.3204 30 17.0353 30 14.4979Z" fill="currentColor" />
        <path d="M13.1553 11.4244H12.1733C12.0228 11.4244 11.9004 11.5478 11.9004 11.6995V17.866C11.9004 18.0179 12.0228 18.1411 12.1733 18.1411H13.1553C13.3059 18.1411 13.428 18.0179 13.428 17.866V11.6995C13.428 11.5478 13.3059 11.4244 13.1553 11.4244Z" fill="#1B2A4A" />
        <path d="M19.9147 11.4244H18.9327C18.7821 11.4244 18.66 11.5478 18.66 11.6995V15.3631L15.8645 11.5467C15.8128 11.4683 15.729 11.4295 15.6375 11.4244H14.6558C14.5052 11.4244 14.3828 11.5478 14.3828 11.6995V17.866C14.3828 18.0179 14.5052 18.1411 14.6558 18.1411H15.6375C15.7883 18.1411 15.9104 18.0179 15.9104 17.866V14.2035L18.7094 18.0247C18.7597 18.0967 18.845 18.1411 18.9327 18.1411H19.9147C20.0655 18.1411 20.1874 18.0179 20.1874 17.866V11.6995C20.1874 11.5478 20.0655 11.4244 19.9147 11.4244Z" fill="#1B2A4A" />
        <path d="M10.7884 16.5969H8.12013V11.6998C8.12013 11.5476 7.99802 11.4241 7.84773 11.4241H6.86545C6.71489 11.4241 6.59277 11.5476 6.59277 11.6998V17.8652C6.59277 18.0149 6.71435 18.1411 6.86518 18.1411H10.7884C10.9389 18.1411 11.0605 18.0174 11.0605 17.8652V16.8725C11.0605 16.7203 10.9389 16.5969 10.7884 16.5969Z" fill="#1B2A4A" />
        <path d="M25.3372 12.9683C25.4878 12.9683 25.6094 12.8452 25.6094 12.6927V11.7C25.6094 11.5478 25.4878 11.4241 25.3372 11.4241H21.4143C21.2636 11.4241 21.1416 11.5501 21.1416 11.6998V17.8655C21.1416 18.0147 21.2633 18.1411 21.4137 18.1411H25.3372C25.4878 18.1411 25.6094 18.0174 25.6094 17.8655V16.8725C25.6094 16.7206 25.4878 16.5969 25.3372 16.5969H22.6692V15.5546H25.3372C25.4878 15.5546 25.6094 15.4311 25.6094 15.2789V14.2863C25.6094 14.1341 25.4878 14.0104 25.3372 14.0104H22.6692V12.9683H25.3372Z" fill="#1B2A4A" />
      </svg>
    ),
  },
];

export default function AppFooter() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const { t } = useLanguage();
  const footerDict = t<Dictionary["footer"]>("footer");
  const footerLinks = buildFooterLinks(footerDict);

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #0F1A30 0%, #1B2A4A 100%)",
        color: "#FFFFFF",
        paddingTop: "56px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle dot pattern */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(197,165,90,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      {/* Top gold hairline */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #C5A55A 30%, #D4BA7A 50%, #C5A55A 70%, transparent 100%)",
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "40px 32px",
            paddingBottom: "48px",
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: "span 1", minWidth: "200px" }}>
            {/* Logo */}
            <div style={{ marginBottom: "16px" }}>
              <LayaLogo variant="white" height={32} />
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.75,
                margin: "0 0 20px",
                fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                maxWidth: "220px",
              }}
            >
              {footerDict.tagline}
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "10px" }}>
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  onMouseEnter={() => setHoveredSocial(s.label)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    border: "1px solid rgba(197,165,90,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: hoveredSocial === s.label ? "#D4BA7A" : "rgba(255,255,255,0.55)",
                    background:
                      hoveredSocial === s.label
                        ? "rgba(197,165,90,0.12)"
                        : "rgba(255,255,255,0.04)",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Contact */}
            
          </div>

          {/* Services column */}
          <div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#C5A55A",
                fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
              }}
            >
              {footerLinks.services.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {footerLinks.services.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.55)",
                    textDecoration: "none",
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                    transition: "color 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Payment column */}
          <div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#C5A55A",
                fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
              }}
            >
              {footerDict.payment.label}
            </p>
            <div
              style={{
                width: "88px",
                height: "56px",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
                background: "rgba(255,255,255,0.9)",
              }}
            >
              <Image src={PAYMENT_LOGO_URL} alt={footerDict.payment.alt} fill style={{ objectFit: "contain" }} />
            </div>
          </div>

          {/* Legal / About column */}
          <div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#C5A55A",
                fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
              }}
            >
              {footerLinks.legal.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {footerLinks.legal.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.55)",
                    textDecoration: "none",
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                    transition: "color 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* For Mobile column — QR + PWA install */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#C5A55A",
                fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
              }}
            >
              {footerDict.forMobile.label}
            </p>
            <div
              style={{
                padding: "8px",
                background: "#FFFFFF",
                borderRadius: "10px",
                marginBottom: "14px",
                lineHeight: 0,
              }}
            >
              <QRCodeSVG value={siteUrl} size={80} bgColor="#FFFFFF" fgColor="#1B2A4A" level="M" />
            </div>
            <PwaInstallButton />
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "20px 0 28px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
            }}
          >
            {footerDict.copyright}
          </p>

          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "rgba(197,165,90,0.5)",
              fontStyle: "italic",
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              letterSpacing: "0.04em",
            }}
          >
            {footerDict.slogan}
          </p>
        </div>
      </div>
    </footer>
  );
}
