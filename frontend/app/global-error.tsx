"use client";

/**
 * global-error.tsx — จับ error ที่เกิดใน root layout เอง (แทบไม่เกิด แต่ Next.js บังคับให้มี fallback)
 * ต้องมี <html>/<body> ของตัวเอง เพราะแทนที่ root layout ทั้งหมด
 */

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="th">
      <body style={{ margin: 0, fontFamily: "Kanit, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#FAF6F0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "#1B2A4A", fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>
            เกิดข้อผิดพลาดร้ายแรง
          </h1>
          <p style={{ color: "#6B7280", fontSize: "0.9rem", maxWidth: 380, marginBottom: 24, lineHeight: 1.7 }}>
            ระบบไม่สามารถโหลดหน้านี้ได้ กรุณาลองรีเฟรชหน้าอีกครั้ง
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: "#1B2A4A",
              color: "#FFFFFF",
              borderRadius: "12px",
              padding: "12px 24px",
              fontFamily: "Kanit, sans-serif",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            ลองอีกครั้ง
          </button>
        </div>
      </body>
    </html>
  );
}
