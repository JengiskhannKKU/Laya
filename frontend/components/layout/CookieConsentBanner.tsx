"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "laya_cookie_consent";

type ConsentState = "accepted" | "rejected" | null;

export default function CookieConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [visible, setVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Slight delay so banner doesn't flash on first render
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    } else {
      setConsent(stored as ConsentState);
    }
  }, []);

  const handleDismiss = (choice: "accepted" | "rejected") => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem(COOKIE_CONSENT_KEY, choice);
      setConsent(choice);
      setVisible(false);
      setIsExiting(false);
    }, 400);
  };

  if (!visible || consent !== null) return null;

  return (
    <>
      {/* Backdrop overlay (subtle) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 26, 48, 0.25)",
          backdropFilter: "blur(2px)",
          zIndex: 9998,
          opacity: isExiting ? 0 : 1,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="ความยินยอมการใช้ Cookie"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transform: isExiting ? "translateY(100%)" : "translateY(0)",
          opacity: isExiting ? 0 : 1,
          transition: "transform 0.4s cubic-bezier(0.32,0,0.15,1), opacity 0.4s ease",
        }}
      >
        {/* Glass card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(197, 165, 90, 0.3)",
            boxShadow: "0 -8px 32px rgba(27, 42, 74, 0.16)",
            padding: "0",
          }}
        >
          {/* Gold accent line at top */}
          <div
            style={{
              height: "3px",
              background: "linear-gradient(90deg, transparent, #C5A55A 20%, #D4BA7A 50%, #C5A55A 80%, transparent)",
            }}
          />

          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "20px 24px 24px",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {/* Icon + Text block */}
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  {/* Cookie icon */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1B2A4A, #2C3E6B)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>🍪</span>
                  </div>
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#1B2A4A",
                        fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                        lineHeight: 1.3,
                      }}
                    >
                      เราใช้ Cookie เพื่อให้บริการที่ดีขึ้น
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: "#7A7468",
                        fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                      }}
                    >
                      LAYA Cookie Policy — สอดคล้องกับ PDPA พ.ศ. 2562
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "13px",
                    color: "#4A5468",
                    lineHeight: 1.65,
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                  }}
                >
                  LAYA ใช้ Cookies เพื่อจดจำการเข้าสู่ระบบ ภาษา การตั้งค่า วิเคราะห์การใช้งาน
                  และปรับปรุงประสบการณ์ผู้ใช้ การกด &ldquo;ยอมรับ&rdquo; ถือว่าท่านยินยอมให้เราเก็บ Cookies
                  ตาม{" "}
                  <Link
                    href="/privacy-policy"
                    style={{
                      color: "#C5A55A",
                      textDecoration: "underline",
                      textUnderlineOffset: "2px",
                      fontWeight: 500,
                    }}
                  >
                    นโยบายความเป็นส่วนตัว
                  </Link>
                  {" "}ของเรา
                </p>

                {/* Expandable detail */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(27, 42, 74, 0.04)",
                      border: "1px solid rgba(197, 165, 90, 0.2)",
                    }}
                  >
                    <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 600, color: "#1B2A4A" }}>
                      ประเภท Cookie ที่เราใช้
                    </p>
                    {[
                      { icon: "🔐", name: "Cookie ที่จำเป็น", desc: "สำหรับการเข้าสู่ระบบและความปลอดภัย" },
                      { icon: "⚙️", name: "Cookie การตั้งค่า", desc: "จดจำภาษาและการตั้งค่าส่วนตัว" },
                      { icon: "📊", name: "Cookie วิเคราะห์", desc: "วัดประสิทธิภาพและปรับปรุงระบบ" },
                    ].map((item) => (
                      <div
                        key={item.name}
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginBottom: "4px",
                          alignItems: "flex-start",
                        }}
                      >
                        <span style={{ fontSize: "13px", flexShrink: 0 }}>{item.icon}</span>
                        <div>
                          <span style={{ fontSize: "12px", fontWeight: 500, color: "#1B2A4A" }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: "12px", color: "#7A7468" }}> — {item.desc}</span>
                        </div>
                      </div>
                    ))}
                    <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#7A7468" }}>
                      ท่านสามารถปิด Cookie ได้ผ่านการตั้งค่า Browser แต่อาจส่งผลต่อการใช้งานบางส่วน
                    </p>
                  </div>
                )}

                <button
                  id="cookie-expand-btn"
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "#C5A55A",
                    padding: "4px 0",
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▾
                  </span>
                  {isExpanded ? "ซ่อนรายละเอียด" : "ดูรายละเอียดเพิ่มเติม"}
                </button>
              </div>

              {/* Action buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  minWidth: "180px",
                  justifyContent: "center",
                  paddingTop: "4px",
                }}
              >
                <button
                  id="cookie-accept-btn"
                  onClick={() => handleDismiss("accepted")}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                    background: "linear-gradient(135deg, #1B2A4A 0%, #2C3E6B 100%)",
                    color: "#D4BA7A",
                    boxShadow: "0 4px 14px rgba(27, 42, 74, 0.3)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(27, 42, 74, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(27, 42, 74, 0.3)";
                  }}
                >
                  ✓ ยอมรับ Cookie ทั้งหมด
                </button>

                <button
                  id="cookie-reject-btn"
                  onClick={() => handleDismiss("rejected")}
                  style={{
                    padding: "11px 24px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(197, 165, 90, 0.4)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 500,
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                    background: "transparent",
                    color: "#7A7468",
                    transition: "border-color 0.15s ease, color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#C5A55A";
                    e.currentTarget.style.color = "#1B2A4A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(197, 165, 90, 0.4)";
                    e.currentTarget.style.color = "#7A7468";
                  }}
                >
                  ปฏิเสธ Cookie ที่ไม่จำเป็น
                </button>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                  }}
                >
                  <Link
                    href="/privacy-policy"
                    style={{ fontSize: "11px", color: "#A89F94", textDecoration: "underline", textUnderlineOffset: "2px" }}
                  >
                    นโยบายความเป็นส่วนตัว
                  </Link>
                  <Link
                    href="/terms"
                    style={{ fontSize: "11px", color: "#A89F94", textDecoration: "underline", textUnderlineOffset: "2px" }}
                  >
                    ข้อกำหนดการใช้งาน
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
