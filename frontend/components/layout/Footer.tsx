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

/** อีเมล support ที่เผยแพร่อยู่แล้วบนหน้า privacy-policy/terms — newsletter ใช้ mailto ไปที่นี่
 * (ยังไม่มี endpoint สมัครรับข่าวสารใน backend — ตามหลัก honest-data ไม่ทำปุ่มหลอก) */
const SUPPORT_EMAIL = "support@laya-th.com";

function buildFooterLinks(f: Dictionary["footer"]) {
  return {
    shop: {
      label: f.shop.label,
      links: [
        { label: f.shop.allProducts, href: "/search" },
        { label: f.shop.categories, href: "/category" },
        { label: f.shop.tailorWeave, href: "/services" },
        { label: f.shop.designClothes, href: "/tailor/with-fabric" },
        { label: f.shop.aiPattern, href: "/custom" },
      ],
    },
    communities: {
      label: f.communitiesCol.label,
      links: [
        { label: f.communitiesCol.weaving, href: "/community" },
        { label: f.communitiesCol.artisanStories, href: "/community/heritage" },
        { label: f.communitiesCol.collection, href: "/search?q=Community%20Collection" },
      ],
    },
    stories: {
      label: f.heritage.label,
      links: [
        { label: f.heritage.story, href: "/community/heritage" },
        { label: f.heritage.inspiration, href: "/community/heritage" },
      ],
    },
    about: {
      label: f.about.label,
      links: [
        { label: f.about.aboutUs, href: "/about" },
        { label: f.about.help, href: "/help" },
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

const COLUMN_LABEL_STYLE: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#C5A55A",
  fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
};

const LINK_STYLE: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.55)",
  textDecoration: "none",
  fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
  transition: "color 0.15s",
};

/** ชิปโลโก้ช่องทางชำระเงิน — ขาวมุมมนขนาดเท่ากันทุกใบ */
const PAYMENT_CHIP_STYLE: React.CSSProperties = {
  width: "62px",
  height: "38px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.94)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function AppFooter() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const { t, locale, toggleLocale } = useLanguage();
  const footerDict = t<Dictionary["footer"]>("footer");
  const footerLinks = buildFooterLinks(footerDict);

  // ไม่มี endpoint newsletter — เปิดอีเมลถึง support (ที่อยู่จริงที่เผยแพร่บนเว็บ) แทนการหลอกว่าสมัครสำเร็จ
  const handleSubscribe = () => {
    const subject = encodeURIComponent("Subscribe to LAYA newsletter");
    const body = encodeURIComponent(`Please add me to the LAYA newsletter: ${email}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // Community + Stories จัดกลุ่มอยู่คอลัมน์เดียวกัน (สอง section ซ้อนกัน)
  // เพื่อเปิดที่ให้คอลัมน์ Payment — คอลัมน์เดี่ยว: Shop, About LAYA
  const singleColumns = [footerLinks.shop, footerLinks.about];

  const renderLinkGroup = (col: { label: string; links: { label: string; href: string }[] }) => (
    <>
      <p style={COLUMN_LABEL_STYLE}>{col.label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {col.links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            style={LINK_STYLE}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #0F1A30 0%, #162445 100%)",
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
        {/* Main grid — Brand / Shop / Communities / Stories / About LAYA / Newsletter */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
            gap: "40px 28px",
            paddingBottom: "48px",
          }}
        >
          {/* Brand column */}
          <div style={{ minWidth: "200px" }}>
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
                    borderRadius: "50%",
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
          </div>

          {/* Shop column */}
          <div>{renderLinkGroup(singleColumns[0])}</div>

          {/* Community + Stories — จัดกลุ่มสอง section ในคอลัมน์เดียว */}
          <div>
            {renderLinkGroup(footerLinks.communities)}
            <div style={{ marginTop: "26px" }}>
              {renderLinkGroup(footerLinks.stories)}
              {/* คำคมพระราชปณิธาน — ท้าย section Stories */}
              <Link
                href="/community/heritage"
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "rgba(197,165,90,0.65)",
                  textDecoration: "none",
                  fontStyle: "italic",
                  lineHeight: 1.7,
                  maxWidth: "230px",
                  fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                  transition: "color 0.15s",
                  marginTop: "10px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D4BA7A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(197,165,90,0.65)")}
              >
                {t<string>("home.mission.quote")}
              </Link>
            </div>
          </div>

          {/* About LAYA column */}
          <div>{renderLinkGroup(singleColumns[1])}</div>

          {/* Payment column — โลโก้ช่องทางชำระเงินเป็นชิปขาวมุมมน */}
          <div>
            <p style={COLUMN_LABEL_STYLE}>{footerDict.payment.label}</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 62px)",
                gap: "8px",
              }}
            >
              {/* Visa */}
              {/* <div style={PAYMENT_CHIP_STYLE} title="Visa" aria-label="Visa">
                <span
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontWeight: 800,
                    fontSize: "14px",
                    letterSpacing: "0.02em",
                    color: "#1A1F71",
                  }}
                >
                  VISA
                </span>
              </div> */}

              {/* Mastercard */}
              {/* <div style={PAYMENT_CHIP_STYLE} title="Mastercard" aria-label="Mastercard">
                <svg width="34" height="21" viewBox="0 0 34 21" aria-hidden="true">
                  <circle cx="13" cy="10.5" r="9" fill="#EB001B" />
                  <circle cx="21" cy="10.5" r="9" fill="#F79E1B" />
                  <path d="M17 3.6a9 9 0 0 1 0 13.8 9 9 0 0 1 0-13.8z" fill="#FF5F00" />
                </svg>
              </div> */}

              {/* PromptPay — โลโก้จริงที่ใช้อยู่เดิม */}
              <div style={{ ...PAYMENT_CHIP_STYLE, position: "relative", overflow: "hidden" }} title="PromptPay" aria-label="PromptPay">
                <Image src={PAYMENT_LOGO_URL} alt={footerDict.payment.alt} fill style={{ objectFit: "contain", padding: "3px" }} />
              </div>

              {/* QR Payment */}
              <div style={PAYMENT_CHIP_STYLE} title="QR Payment" aria-label="QR Payment">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM18 18h3v3h-3z" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Newsletter column */}
          <div style={{ minWidth: "200px" }}>
            <p style={COLUMN_LABEL_STYLE}>{footerDict.newsletter.label}</p>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.7,
                margin: "0 0 12px",
                fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
              }}
            >
              {footerDict.newsletter.blurb}
            </p>

            {/* Email field + gold arrow */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "999px",
                padding: "4px 4px 4px 16px",
                marginBottom: "18px",
                maxWidth: "250px",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && email.trim()) handleSubscribe(); }}
                placeholder={footerDict.newsletter.placeholder}
                aria-label={footerDict.newsletter.label}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#FFFFFF",
                  fontSize: "12.5px",
                  fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => { if (email.trim()) handleSubscribe(); }}
                aria-label={footerDict.newsletter.submit}
                style={{
                  width: "32px",
                  height: "32px",
                  flexShrink: 0,
                  borderRadius: "50%",
                  border: "none",
                  background: "#C9A86A",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>

            {/* QR + PWA install — ของจริงที่มีอยู่เดิม เก็บไว้ใต้ newsletter */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div
                style={{
                  padding: "6px",
                  background: "#FFFFFF",
                  borderRadius: "10px",
                  lineHeight: 0,
                }}
              >
                <QRCodeSVG value={siteUrl} size={64} bgColor="#FFFFFF" fgColor="#1B2A4A" level="M" />
              </div>
              <PwaInstallButton />
            </div>
          </div>
        </div>

        {/* Bottom bar — copyright / privacy·terms / payment / EN-TH */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "20px 0 28px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
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


          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Language toggle — EN / TH ตาม mockup */}
            <button
              type="button"
              onClick={toggleLocale}
              aria-label="Toggle language"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.05em",
                padding: 0,
              }}
            >
              <span style={{ color: locale === "en" ? "#D4BA7A" : undefined }}>EN</span>
              {" / "}
              <span style={{ color: locale === "th" ? "#D4BA7A" : undefined }}>TH</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
