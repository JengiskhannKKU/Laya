import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/seo";
import AppTopNav from "@/components/layout/TopNav";
import AppFooter from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — นโยบายความเป็นส่วนตัว",
  description:
    "นโยบายความเป็นส่วนตัวของ LAYA แพลตฟอร์ม Fashion Tech Marketplace ที่ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลตามกฎหมาย PDPA พ.ศ. 2562",
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
  openGraph: {
    title: `Privacy Policy — นโยบายความเป็นส่วนตัว | ${siteName}`,
    description: "อ่านนโยบายความเป็นส่วนตัวของ LAYA เพื่อทำความเข้าใจวิธีที่เราเก็บรวบรวม ใช้ และคุ้มครองข้อมูลของคุณ",
    url: `${siteUrl}/privacy-policy`,
    siteName,
    locale: "th_TH",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
    <style>{`
      .pp-toc-link { color: #4A5468; transition: background 0.15s, color 0.15s; }
      .pp-toc-link:hover { background: rgba(197,165,90,0.08); color: #1B2A4A; }
      .pp-contact-card { border: 1px solid rgba(229,223,214,0.8); transition: border-color 0.15s, box-shadow 0.15s; }
      .pp-contact-card:hover { border-color: rgba(197,165,90,0.4); box-shadow: 0 2px 8px rgba(27,42,74,0.06); }
    `}</style>
    <AppTopNav />
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FAF6F0 0%, #F5EFE6 100%)",
        paddingBottom: "80px",
      }}
    >
      {/* Hero Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #0F1A30 60%, #1B2A4A 100%)",
          padding: "64px 24px 52px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative pattern */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(rgba(197,165,90,0.06) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        {/* Gold accent line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "240px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #C5A55A, transparent)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#C5A55A",
              fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
            }}
          >
            LAYA — Legal
          </p>
          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "clamp(24px, 5vw, 38px)",
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
              lineHeight: 1.2,
            }}
          >
            นโยบายความเป็นส่วนตัว
          </h1>
          <p
            style={{
              margin: "0 auto",
              maxWidth: "520px",
              fontSize: "14px",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
              lineHeight: 1.6,
            }}
          >
            Privacy Policy
          </p>
          <div
            style={{
              display: "inline-flex",
              gap: "20px",
              marginTop: "24px",
              padding: "10px 20px",
              borderRadius: "999px",
              background: "rgba(197,165,90,0.12)",
              border: "1px solid rgba(197,165,90,0.25)",
            }}
          >
            <span style={{ fontSize: "12px", color: "#D4BA7A", fontFamily: "var(--font-kanit), 'Kanit', sans-serif" }}>
              📅 มีผลบังคับใช้: 11 กรกฎาคม 2026
            </span>
            <span style={{ fontSize: "12px", color: "#D4BA7A", fontFamily: "var(--font-kanit), 'Kanit', sans-serif" }}>
              🔄 อัปเดตล่าสุด: 11 กรกฎาคม 2026
            </span>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div
        style={{
          maxWidth: "880px",
          margin: "40px auto 0",
          padding: "0 24px",
        }}
      >
        <nav
          aria-label="สารบัญ"
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid rgba(197,165,90,0.2)",
            boxShadow: "0 4px 20px rgba(27,42,74,0.06)",
            padding: "24px 28px",
            marginBottom: "36px",
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#C5A55A",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
            }}
          >
            สารบัญ
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "6px 16px",
            }}
          >
            {[
              { n: "1", t: "บทนำ" },
              { n: "2", t: "ข้อมูลที่เราเก็บรวบรวม" },
              { n: "3", t: "วัตถุประสงค์ในการใช้ข้อมูล" },
              { n: "4", t: "การใช้ AI" },
              { n: "5", t: "AI Try-On" },
              { n: "6", t: "การนำข้อมูลพัฒนา AI" },
              { n: "7", t: "Cookies" },
              { n: "8", t: "การเปิดเผยข้อมูล" },
              { n: "9", t: "การแบ่งปันกับร้านค้า" },
              { n: "10", t: "ข้อมูลสาธารณะ" },
              { n: "11", t: "การรักษาความปลอดภัย" },
              { n: "12", t: "ระยะเวลาการเก็บข้อมูล" },
              { n: "13", t: "สิทธิของเจ้าของข้อมูล" },
              { n: "14", t: "การลบบัญชี" },
              { n: "15", t: "การโอนข้อมูลต่างประเทศ" },
              { n: "16", t: "ผู้เยาว์" },
              { n: "17", t: "การเปลี่ยนแปลงนโยบาย" },
              { n: "18", t: "ติดต่อเรา" },
              { n: "19", t: "กฎหมายที่ใช้บังคับ" },
            ].map((item) => (
              <a
                key={item.n}
                href={`#section-${item.n}`}
                className="pp-toc-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 8px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "6px",
                    background: "rgba(197,165,90,0.15)",
                    color: "#C5A55A",
                    fontSize: "10px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.n}
                </span>
                {item.t}
              </a>
            ))}
          </div>
        </nav>

        {/* Content Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          <Section id="section-1" number="1" title="บทนำ">
            <p>
              LAYA (&ldquo;LAYA&rdquo;, &ldquo;เรา&rdquo;, &ldquo;บริษัท&rdquo;, &ldquo;แพลตฟอร์ม&rdquo;) เป็นแพลตฟอร์ม Fashion Tech Marketplace ที่เชื่อมโยงผู้บริโภค นักออกแบบ ช่างทอ ชุมชนผู้ผลิต และผู้ประกอบการผ้าไทย ผ่านเทคโนโลยีดิจิทัลและปัญญาประดิษฐ์ (AI)
            </p>
            <p>
              เราให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้งานทุกคน และมุ่งมั่นที่จะคุ้มครองข้อมูลส่วนบุคคลตาม <strong>พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</strong> รวมถึงกฎหมายที่เกี่ยวข้อง
            </p>
            <p>
              การใช้งานเว็บไซต์ แอปพลิเคชัน หรือบริการของ LAYA ถือว่าท่านได้อ่าน เข้าใจ และยอมรับนโยบายฉบับนี้
            </p>
          </Section>

          <Section id="section-2" number="2" title="ข้อมูลที่เราเก็บรวบรวม">
            <p>LAYA อาจเก็บรวบรวมข้อมูลต่อไปนี้</p>

            <SubSection title="2.1 ข้อมูลบัญชีผู้ใช้">
              <Tags items={["ชื่อ", "นามสกุล", "Display Name", "อีเมล", "เบอร์โทรศัพท์", "รูปโปรไฟล์", "ประเทศ", "ภาษา", "วันที่สมัครสมาชิก", "เวลาที่เข้าสู่ระบบล่าสุด"]} />
            </SubSection>

            <SubSection title="2.2 ข้อมูลการเข้าสู่ระบบ">
              <p>ผู้ใช้งานสามารถเข้าสู่ระบบผ่าน</p>
              <Tags items={["Email", "Google", "Apple (หากรองรับ)", "ผู้ให้บริการ OAuth อื่น"]} />
              <Note>LAYA จะได้รับเฉพาะข้อมูลที่ผู้ใช้อนุญาตให้เข้าถึง</Note>
            </SubSection>

            <SubSection title="2.3 ข้อมูลร้านค้าและผู้ผลิต">
              <p>สำหรับร้านค้า Designer หรือชุมชนผู้ผลิต เราอาจเก็บข้อมูล เช่น</p>
              <Tags items={["ชื่อร้าน", "คำอธิบายร้าน", "ที่อยู่", "จังหวัด", "เบอร์โทรศัพท์", "Line ID", "รูปหน้าร้าน", "รูปปก", "พิกัดร้าน", "คะแนนรีวิว", "ประเภทบริการ", "ความเชี่ยวชาญ"]} />
            </SubSection>

            <SubSection title="2.4 ข้อมูลการสั่งซื้อ">
              <Tags items={["ประวัติคำสั่งซื้อ", "รายละเอียดสินค้า", "ประวัติการผลิต", "ประวัติการตัดเย็บ", "สถานะคำสั่งซื้อ", "ราคาสินค้า", "ค่าจัดส่ง", "วิธีชำระเงิน", "Tracking Number", "ประวัติการเปลี่ยนสถานะ"]} />
            </SubSection>

            <SubSection title="2.5 ข้อมูลการชำระเงิน">
              <Tags items={["ยอดชำระ", "Transaction Reference", "สถานะการชำระเงิน", "วิธีการชำระเงิน"]} />
              <Note>LAYA จะไม่จัดเก็บหมายเลขบัตรเครดิตหรือข้อมูลทางการเงินที่ละเอียดอ่อนโดยตรง ธุรกรรมทั้งหมดดำเนินการผ่านผู้ให้บริการ Payment Gateway ที่ได้รับมาตรฐานความปลอดภัย</Note>
            </SubSection>

            <SubSection title="2.6 ข้อมูลที่อยู่จัดส่ง">
              <Tags items={["ชื่อผู้รับ", "เบอร์โทรศัพท์", "ที่อยู่", "จังหวัด", "อำเภอ", "ตำบล", "รหัสไปรษณีย์", "พิกัด GPS (หากผู้ใช้เลือกใช้)"]} />
            </SubSection>

            <SubSection title="2.7 ข้อมูลสัดส่วนร่างกาย">
              <p>เพื่อใช้สำหรับการออกแบบเสื้อผ้าและ AI Try-On LAYA อาจเก็บข้อมูล เช่น</p>
              <Tags items={["ส่วนสูง", "น้ำหนัก", "รอบอก", "รอบเอว", "รอบสะโพก", "ความกว้างไหล่", "ความยาวแขน", "ความยาวชุด", "หมายเหตุเพิ่มเติม"]} />
              <Note>ข้อมูลดังกล่าวใช้เฉพาะเพื่อการออกแบบและการผลิตเสื้อผ้า</Note>
            </SubSection>

            <SubSection title="2.8 รูปภาพของผู้ใช้งาน">
              <p>ผู้ใช้อาจอัปโหลดรูปภาพ เช่น</p>
              <Tags items={["รูปโปรไฟล์", "รูปสำหรับ AI Try-On", "รูปตัวอย่างเสื้อผ้า", "รูปผ้า", "Portfolio"]} />
              <Note>รูปภาพทั้งหมดเป็นทรัพย์สินของผู้ใช้งาน</Note>
            </SubSection>

            <SubSection title="2.9 ข้อมูลผ้าและการออกแบบ">
              <Tags items={["รูปผ้า", "ลายผ้า", "สี", "Texture", "ข้อมูลผ้าท้องถิ่น", "ผลงานออกแบบ", "ผลงานที่สร้างจาก AI"]} />
            </SubSection>

            <SubSection title="2.10 ข้อมูลการใช้งานเว็บไซต์">
              <Tags items={["หน้าเว็บที่เข้าชม", "ระยะเวลาการใช้งาน", "ประวัติการค้นหา", "Wishlist", "การกดถูกใจ", "รีวิว", "Community Post", "การแจ้งเตือน"]} />
            </SubSection>

            <SubSection title="2.11 ข้อมูลอุปกรณ์">
              <Tags items={["Browser", "Device", "Operating System", "IP Address", "Cookies", "Device Identifier"]} />
            </SubSection>
          </Section>

          <Section id="section-3" number="3" title="วัตถุประสงค์ในการใช้ข้อมูล">
            <p>LAYA ใช้ข้อมูลเพื่อ</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
              {[
                "ให้บริการ Marketplace", "สร้างบัญชีผู้ใช้", "ยืนยันตัวตน", "ดำเนินการสั่งซื้อ",
                "ติดต่อผู้ใช้งาน", "จัดส่งสินค้า", "ประมวลผลการชำระเงิน", "ให้บริการ AI Try-On",
                "สร้างแบบเสื้อผ้า", "แนะนำสินค้า", "แนะนำร้านค้า", "แนะนำชุมชน",
                "วิเคราะห์คุณภาพบริการ", "ป้องกันการทุจริต", "ป้องกันการโจมตีระบบ",
                "ปรับปรุงแพลตฟอร์ม", "พัฒนาประสบการณ์ผู้ใช้งาน",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(27,42,74,0.04)",
                    border: "1px solid rgba(27,42,74,0.06)",
                    fontSize: "13px",
                    color: "#4A5468",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                  }}
                >
                  <span style={{ color: "#C5A55A", fontSize: "10px" }}>●</span>
                  {item}
                </div>
              ))}
            </div>
          </Section>

          <Section id="section-4" number="4" title="การใช้ AI">
            <p>LAYA ใช้เทคโนโลยี AI เพื่อช่วยในการให้บริการ เช่น</p>
            <Tags items={["AI Fashion Recommendation", "AI Try-On", "AI Design Generation", "AI Search", "AI Matching Designer", "AI Matching Fabric", "AI Recommendation", "AI Product Description"]} />
            <Note>AI เป็นเพียงเครื่องมือช่วยสนับสนุนการตัดสินใจ ผลลัพธ์อาจมีความคลาดเคลื่อน ผู้ใช้งานควรตรวจสอบก่อนใช้งานจริง</Note>
          </Section>

          <Section id="section-5" number="5" title="การใช้รูปภาพสำหรับ AI Try-On">
            <p>ผู้ใช้งานสามารถอัปโหลดรูปภาพของตนเองเพื่อใช้บริการ Virtual Try-On รูปภาพดังกล่าวจะถูกใช้เพื่อ</p>
            <Tags items={["จำลองการสวมใส่เสื้อผ้า", "สร้างภาพตัวอย่าง", "แสดงผลการออกแบบ", "บันทึกผลลัพธ์"]} />
            <Note>LAYA จะไม่เผยแพร่รูปภาพดังกล่าวโดยไม่ได้รับความยินยอมจากผู้ใช้งาน</Note>
          </Section>

          <Section id="section-6" number="6" title="การนำข้อมูลไปใช้พัฒนา AI">
            <p>LAYA จะไม่นำข้อมูลต่อไปนี้ไปใช้ฝึกโมเดล AI เพื่อการพาณิชย์โดยไม่ได้รับความยินยอม</p>
            <Tags items={["รูปภาพผู้ใช้งาน", "รูป AI Try-On", "ข้อมูลสัดส่วนร่างกาย", "ผลงานออกแบบของลูกค้า", "ข้อมูลส่วนบุคคล"]} />
            <Note>หากในอนาคตมีการนำข้อมูลไปใช้เพื่อพัฒนา AI จะมีการแจ้งและขอความยินยอมก่อนทุกครั้ง</Note>
          </Section>

          <Section id="section-7" number="7" title="Cookies">
            <p>LAYA ใช้ Cookies เพื่อ</p>
            <Tags items={["จดจำการเข้าสู่ระบบ", "จดจำภาษา", "จดจำการตั้งค่า", "วิเคราะห์การใช้งาน", "ปรับปรุงเว็บไซต์", "วัดประสิทธิภาพระบบ"]} />
            <Note>ผู้ใช้งานสามารถปิด Cookies ผ่าน Browser ได้ตลอดเวลา</Note>
          </Section>

          <Section id="section-8" number="8" title="การเปิดเผยข้อมูล">
            <p>LAYA อาจเปิดเผยข้อมูลเท่าที่จำเป็นแก่</p>
            <Tags items={["ร้านค้า", "Designer", "ช่างทอ", "ผู้ผลิต", "บริษัทขนส่ง", "ผู้ให้บริการ Payment Gateway", "Cloud Provider", "Email Provider", "Authentication Provider", "Analytics Provider", "หน่วยงานของรัฐตามที่กฎหมายกำหนด"]} />
            <Note type="highlight">LAYA จะไม่ขายข้อมูลส่วนบุคคลของผู้ใช้งานให้บุคคลภายนอก</Note>
          </Section>

          <Section id="section-9" number="9" title="การแบ่งปันข้อมูลกับร้านค้า">
            <p>เมื่อผู้ใช้งานทำการสั่งซื้อ ข้อมูลที่จำเป็นอาจถูกเปิดเผยแก่ร้านค้า เช่น</p>
            <Tags items={["ชื่อผู้รับ", "เบอร์โทรศัพท์", "ที่อยู่จัดส่ง", "รายละเอียดคำสั่งซื้อ"]} />
            <Note>เพื่อให้ร้านค้าดำเนินการผลิตและจัดส่งสินค้า</Note>
          </Section>

          <Section id="section-10" number="10" title="ข้อมูลที่เผยแพร่สู่สาธารณะ">
            <p>ข้อมูลที่ผู้ใช้เลือกเผยแพร่ เช่น</p>
            <Tags items={["Community Post", "รีวิว", "Portfolio", "รูปภาพ", "ร้านค้า", "ผลงานออกแบบ"]} />
            <Note>อาจถูกมองเห็นโดยผู้ใช้งานรายอื่น ผู้ใช้งานควรหลีกเลี่ยงการเผยแพร่ข้อมูลส่วนบุคคลที่ไม่จำเป็น</Note>
          </Section>

          <Section id="section-11" number="11" title="การรักษาความปลอดภัย">
            <p>LAYA ใช้มาตรฐานความปลอดภัย เช่น</p>
            <Tags items={["HTTPS / TLS Encryption", "Database Encryption", "Encryption at Rest", "Role-Based Access Control (RBAC)", "Audit Log", "Activity Monitoring", "Rate Limiting", "Firewall", "Backup", "Disaster Recovery", "Multi-Factor Authentication สำหรับผู้ดูแลระบบ"]} />
            <Note>แม้เราจะใช้มาตรการที่เหมาะสม แต่ไม่มีระบบใดสามารถรับประกันความปลอดภัยได้ 100%</Note>
          </Section>

          <Section id="section-12" number="12" title="ระยะเวลาการเก็บข้อมูล">
            <p>เราจะเก็บข้อมูลเท่าที่จำเป็นสำหรับ</p>
            <Tags items={["การให้บริการ", "การดำเนินธุรกรรม", "การปฏิบัติตามกฎหมาย", "การตรวจสอบย้อนหลัง", "การป้องกันการทุจริต"]} />
            <Note>เมื่อหมดความจำเป็น ข้อมูลจะถูกลบหรือทำให้ไม่สามารถระบุตัวตนได้</Note>
          </Section>

          <Section id="section-13" number="13" title="สิทธิของเจ้าของข้อมูล">
            <p>ภายใต้กฎหมาย PDPA ผู้ใช้งานมีสิทธิ</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { icon: "🔍", right: "ขอเข้าถึงข้อมูล" },
                { icon: "✏️", right: "ขอแก้ไขข้อมูล" },
                { icon: "📋", right: "ขอรับสำเนาข้อมูล" },
                { icon: "↩️", right: "ขอถอนความยินยอม" },
                { icon: "🚫", right: "ขอคัดค้านการประมวลผล" },
                { icon: "🗑️", right: "ขอให้ลบข้อมูล" },
                { icon: "⏸️", right: "ขอจำกัดการประมวลผล" },
                { icon: "📦", right: "ขอให้โอนย้ายข้อมูล (Data Portability)" },
              ].map((item) => (
                <div
                  key={item.right}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(197,165,90,0.06)",
                    border: "1px solid rgba(197,165,90,0.15)",
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                    fontSize: "13px",
                    color: "#1B2A4A",
                  }}
                >
                  <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>{item.icon}</span>
                  {item.right}
                </div>
              ))}
            </div>
          </Section>

          <Section id="section-14" number="14" title="การลบบัญชี">
            <p>ผู้ใช้งานสามารถขอลบบัญชีได้ทุกเมื่อ เมื่อได้รับคำขอ LAYA จะดำเนินการ</p>
            <Tags items={["ลบบัญชี", "ลบข้อมูลส่วนบุคคล", "ทำให้ข้อมูลไม่สามารถระบุตัวตนได้"]} />
            <Note>อย่างไรก็ตาม ข้อมูลบางส่วนอาจถูกเก็บไว้ตามที่กฎหมายกำหนด เช่น ข้อมูลธุรกรรม ประวัติการชำระเงิน เอกสารทางบัญชี</Note>
          </Section>

          <Section id="section-15" number="15" title="การโอนข้อมูลไปต่างประเทศ">
            <p>
              บริการบางส่วนของ LAYA อาจใช้ Cloud Infrastructure หรือผู้ให้บริการที่ตั้งอยู่ในต่างประเทศ LAYA จะดำเนินการให้เป็นไปตามมาตรฐานด้านความปลอดภัยและกฎหมายที่เกี่ยวข้อง
            </p>
          </Section>

          <Section id="section-16" number="16" title="ผู้เยาว์">
            <p>บริการของ LAYA ไม่ได้ออกแบบสำหรับผู้มีอายุต่ำกว่า 13 ปี</p>
            <Note>หากพบว่ามีการเก็บข้อมูลของผู้เยาว์โดยไม่ได้รับความยินยอมจากผู้ปกครอง เราจะดำเนินการลบข้อมูลโดยเร็วที่สุด</Note>
          </Section>

          <Section id="section-17" number="17" title="การเปลี่ยนแปลงนโยบาย">
            <p>
              LAYA อาจปรับปรุง Privacy Policy เป็นครั้งคราว เมื่อมีการเปลี่ยนแปลงที่สำคัญ เราจะแจ้งผ่านเว็บไซต์หรือช่องทางที่เหมาะสม
            </p>
          </Section>

          <Section id="section-18" number="18" title="ติดต่อเรา">
            <ContactCard />
          </Section>

          <Section id="section-19" number="19" title="กฎหมายที่ใช้บังคับ">
            <p>นโยบายฉบับนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย รวมถึง</p>
            <Tags items={[
              "พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)",
              "พระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์",
              "กฎหมายคุ้มครองผู้บริโภค",
              "กฎหมายอื่นที่เกี่ยวข้อง",
            ]} />
          </Section>

        </div>

      </div>
    </main>
    <AppFooter />
    </>
  );
}

/* ── Helper Components ── */

function Section({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid rgba(229,223,214,0.8)",
        boxShadow: "0 2px 12px rgba(27,42,74,0.05)",
        overflow: "hidden",
        scrollMarginTop: "20px",
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(229,223,214,0.6)",
          background: "linear-gradient(135deg, rgba(27,42,74,0.02) 0%, transparent 100%)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1B2A4A, #2C3E6B)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(27,42,74,0.2)",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#D4BA7A", fontFamily: "var(--font-kanit), 'Kanit', sans-serif" }}>
            {number}
          </span>
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "17px",
            fontWeight: 600,
            color: "#1B2A4A",
            fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
          }}
        >
          {title}
        </h2>
      </div>

      {/* Section body */}
      <div
        style={{
          padding: "20px 24px 24px",
          fontSize: "14px",
          lineHeight: 1.75,
          color: "#4A5468",
          fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "16px", marginBottom: "4px" }}>
      <h3
        style={{
          margin: "0 0 10px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#1B2A4A",
          fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            width: "4px",
            height: "16px",
            borderRadius: "2px",
            background: "linear-gradient(180deg, #C5A55A, #D4BA7A)",
            display: "inline-block",
          }}
        />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "8px 0" }}>
      {items.map((item) => (
        <span
          key={item}
          style={{
            padding: "4px 10px",
            borderRadius: "999px",
            background: "rgba(27,42,74,0.05)",
            border: "1px solid rgba(27,42,74,0.08)",
            fontSize: "12px",
            color: "#4A5468",
            fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Note({ children, type = "default" }: { children: React.ReactNode; type?: "default" | "highlight" }) {
  const isHighlight = type === "highlight";
  return (
    <div
      style={{
        marginTop: "12px",
        padding: "10px 14px",
        borderRadius: "10px",
        background: isHighlight ? "rgba(197,165,90,0.08)" : "rgba(27,42,74,0.03)",
        border: `1px solid ${isHighlight ? "rgba(197,165,90,0.3)" : "rgba(27,42,74,0.06)"}`,
        fontSize: "13px",
        color: isHighlight ? "#1B2A4A" : "#7A7468",
        display: "flex",
        gap: "8px",
        alignItems: "flex-start",
        fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
      }}
    >
      <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>{isHighlight ? "⭐" : "ℹ️"}</span>
      <span>{children}</span>
    </div>
  );
}

function ContactCard() {
  const contacts = [
    { icon: "🌐", label: "Website", value: "laya-th.com", href: "https://laya-th.com" },
    { icon: "🔒", label: "Privacy", value: "privacy@laya-th.com", href: "mailto:privacy@laya-th.com" },
    { icon: "💬", label: "Support", value: "support@laya-th.com", href: "mailto:support@laya-th.com" },
    { icon: "💼", label: "Business", value: "business@laya-th.com", href: "mailto:business@laya-th.com" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
      {contacts.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          className="pp-contact-card"
          style={{
            display: "flex",
            gap: "10px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "rgba(27,42,74,0.03)",
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "18px", flexShrink: 0 }}>{c.icon}</span>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#A89F94", fontFamily: "var(--font-kanit), 'Kanit', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.label}</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#1B2A4A", fontFamily: "var(--font-kanit), 'Kanit', sans-serif", wordBreak: "break-all" }}>{c.value}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
