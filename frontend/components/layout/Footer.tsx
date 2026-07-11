"use client";

import Link from "next/link";
import { useState } from "react";

const footerLinks = {
  marketplace: {
    label: "Marketplace",
    links: [
      { label: "สำรวจสินค้า", href: "/search" },
      { label: "หมวดหมู่", href: "/category" },
      { label: "สินค้าใหม่", href: "/search?sort=newest" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  services: {
    label: "บริการ",
    links: [
      { label: "สั่งตัด / สั่งทอ", href: "/services" },
      { label: "ออกแบบเสื้อผ้า", href: "/design-clothes" },
      { label: "AI Try-On", href: "/services" },
      { label: "AI ออกแบบลาย", href: "/custom" },
    ],
  },
  community: {
    label: "ชุมชน",
    links: [
      { label: "Community", href: "/community" },
      { label: "นักออกแบบ", href: "/search?type=designer" },
      { label: "ช่างทอ", href: "/search?type=weaver" },
      { label: "ผ้าไทย Heritage", href: "/community" },
    ],
  },
  merchant: {
    label: "สำหรับร้านค้า",
    links: [
      { label: "เปิดร้านค้า", href: "/merchant" },
      { label: "จัดการร้าน", href: "/merchant" },
      { label: "ติดตามออเดอร์", href: "/orders" },
    ],
  },
  legal: {
    label: "About",
    links: [
      { label: "นโยบายความเป็นส่วนตัว", href: "/privacy-policy" },
      { label: "ข้อกำหนดการใช้งาน", href: "/terms" },
    ],
  },
};

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.72a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z" />
      </svg>
    ),
  },
  {
    label: "Line",
    href: "https://line.me",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 10.664C22 5.697 17.069 2 11 2S0 5.697 0 10.664c0 4.438 3.935 8.15 9.249 8.854.36.078.851.238.974.547.111.28.073.72.036 1.003l-.158 1.152c-.048.28-.222 1.094.96.597s6.37-3.75 8.694-6.42A7.885 7.885 0 0 0 22 10.664z" />
        <path fill="#1B2A4A" d="M9.198 8.442H8.3a.25.25 0 0 0-.25.25v4.574a.25.25 0 0 0 .25.25h.898a.25.25 0 0 0 .25-.25V8.692a.25.25 0 0 0-.25-.25zM15.7 8.442h-.898a.25.25 0 0 0-.25.25v2.718l-2.096-2.83a.249.249 0 0 0-.2-.138h-.928a.25.25 0 0 0-.25.25v4.574a.25.25 0 0 0 .25.25h.898a.25.25 0 0 0 .25-.25v-2.72l2.098 2.833a.252.252 0 0 0 .198.137h.928a.25.25 0 0 0 .25-.25V8.692a.25.25 0 0 0-.25-.25z" />
      </svg>
    ),
  },
];

export default function AppFooter() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

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
              <span
                style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  background: "linear-gradient(135deg, #C5A55A, #D4BA7A, #C5A55A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                LAYA
              </span>
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
              Fashion Tech Marketplace ที่เชื่อมโยงผู้บริโภค นักออกแบบ ช่างทอ และชุมชนผ้าไทยผ่านเทคโนโลยี AI
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

          {/* Link columns */}
          {Object.values(footerLinks).map((col) => (
            <div key={col.label}>
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
                {col.label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {col.links.map((link) => (
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
          ))}
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
            © 2026 LAYA. All Rights Reserved.
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
            Every Pattern Tells a Story.&nbsp;&nbsp;Preserving Thai Heritage Through Technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
