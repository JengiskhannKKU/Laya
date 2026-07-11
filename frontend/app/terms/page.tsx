import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/seo";
import AppTopNav from "@/components/layout/TopNav";
import AppFooter from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — ข้อกำหนดและเงื่อนไขการใช้งาน",
  description:
    "ข้อกำหนดและเงื่อนไขการใช้งาน LAYA แพลตฟอร์ม Fashion Tech Marketplace โปรดอ่านก่อนใช้บริการ",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: `Terms of Service — ข้อกำหนดการใช้งาน | ${siteName}`,
    description: "อ่านข้อกำหนดและเงื่อนไขการใช้งาน LAYA เพื่อทำความเข้าใจสิทธิ หน้าที่ และข้อตกลงระหว่างท่านกับแพลตฟอร์ม",
    url: `${siteUrl}/terms`,
    siteName,
    locale: "th_TH",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <>
    <style>{`
      .tos-toc-link { color: #4A5468; transition: background 0.15s, color 0.15s; }
      .tos-toc-link:hover { background: rgba(197,165,90,0.08); color: #1B2A4A; }
      .tos-contact-card { border: 1px solid rgba(229,223,214,0.8); transition: border-color 0.15s, box-shadow 0.15s; }
      .tos-contact-card:hover { border-color: rgba(197,165,90,0.4); box-shadow: 0 2px 8px rgba(27,42,74,0.06); }
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
          background: "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, #0F1A30 100%)",
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
            ข้อกำหนดและเงื่อนไขการใช้งาน
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
            Terms of Service
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
              { n: "2", t: "คำนิยาม" },
              { n: "3", t: "คุณสมบัติของผู้ใช้งาน" },
              { n: "4", t: "บัญชีผู้ใช้" },
              { n: "5", t: "การใช้บริการ" },
              { n: "6", t: "Marketplace" },
              { n: "7", t: "คำสั่งซื้อ" },
              { n: "8", t: "การชำระเงิน" },
              { n: "9", t: "การยกเลิกและคืนสินค้า" },
              { n: "10", t: "AI Services" },
              { n: "11", t: "AI Try-On" },
              { n: "12", t: "ผลงานออกแบบ" },
              { n: "13", t: "ทรัพย์สินทางปัญญา" },
              { n: "14", t: "ภูมิปัญญาท้องถิ่น" },
              { n: "15", t: "Community Guidelines" },
              { n: "16", t: "รีวิว" },
              { n: "17", t: "การระงับบัญชี" },
              { n: "18", t: "การจำกัดความรับผิด" },
              { n: "19", t: "เหตุสุดวิสัย" },
              { n: "20", t: "การเปลี่ยนแปลงบริการ" },
              { n: "21", t: "การแก้ไขข้อกำหนด" },
              { n: "22", t: "การยุติการใช้งาน" },
              { n: "23", t: "กฎหมายที่ใช้บังคับ" },
              { n: "24", t: "ติดต่อเรา" },
            ].map((item) => (
              <a
                key={item.n}
                href={`#tos-section-${item.n}`}
                className="tos-toc-link"
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

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          <Section id="tos-section-1" number="1" title="บทนำ">
            <p>ยินดีต้อนรับสู่ <strong>LAYA</strong></p>
            <p>
              LAYA เป็นแพลตฟอร์ม Fashion Tech Marketplace ที่เชื่อมโยงผู้บริโภค นักออกแบบ ร้านค้า ช่างทอ ชุมชนผู้ผลิต และผู้ประกอบการผ้าไทย ผ่านเทคโนโลยีดิจิทัลและปัญญาประดิษฐ์ (AI)
            </p>
            <p>
              การเข้าใช้งานเว็บไซต์ แอปพลิเคชัน หรือบริการของ LAYA ถือว่าท่านได้อ่าน เข้าใจ และยอมรับข้อกำหนดและเงื่อนไขฉบับนี้ทั้งหมด
            </p>
            <Note type="highlight">หากท่านไม่ยอมรับข้อกำหนดดังกล่าว กรุณาหยุดใช้งานบริการของเรา</Note>
          </Section>

          <Section id="tos-section-2" number="2" title="คำนิยาม">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { term: "LAYA", def: "แพลตฟอร์ม เว็บไซต์ แอปพลิเคชัน และบริการทั้งหมดที่ดำเนินการโดย LAYA" },
                { term: "ผู้ใช้งาน (User)", def: "บุคคลที่เข้าใช้งานเว็บไซต์หรือบริการ" },
                { term: "ลูกค้า (Customer)", def: "ผู้ที่ซื้อสินค้า หรือใช้บริการผ่านแพลตฟอร์ม" },
                { term: "ร้านค้า (Shop)", def: "ร้านค้า ช่างทอ Designer ชุมชน หรือผู้ประกอบการที่จำหน่ายสินค้าหรือบริการผ่าน LAYA" },
                { term: "เนื้อหา (Content)", def: "รูปภาพ ข้อความ วิดีโอ ผลงานออกแบบ ลายผ้า รีวิว หรือข้อมูลอื่น ๆ" },
              ].map((item) => (
                <div
                  key={item.term}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(27,42,74,0.03)",
                    border: "1px solid rgba(229,223,214,0.8)",
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#1B2A4A", fontSize: "13px" }}>{item.term}</span>
                  <span style={{ color: "#7A7468", fontSize: "13px" }}> — {item.def}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="tos-section-3" number="3" title="คุณสมบัติของผู้ใช้งาน">
            <p>ผู้ใช้งานรับรองว่า</p>
            <Tags items={["มีอายุไม่น้อยกว่า 13 ปี", "ให้ข้อมูลที่ถูกต้อง", "ไม่ปลอมแปลงตัวตน", "ไม่ใช้บัญชีของบุคคลอื่น", "มีสิทธิในการใช้งานข้อมูลที่อัปโหลด"]} />
            <Note>LAYA ขอสงวนสิทธิ์ในการระงับบัญชีที่ให้ข้อมูลอันเป็นเท็จ</Note>
          </Section>

          <Section id="tos-section-4" number="4" title="บัญชีผู้ใช้">
            <p>ผู้ใช้งานมีหน้าที่</p>
            <Tags items={["รักษารหัสผ่าน", "ไม่เปิดเผยข้อมูลบัญชี", "แจ้งเมื่อพบการใช้งานผิดปกติ", "รับผิดชอบทุกกิจกรรมที่เกิดขึ้นภายใต้บัญชีของตน"]} />
            <Note>LAYA ไม่รับผิดชอบต่อความเสียหายที่เกิดจากการเปิดเผยรหัสผ่านของผู้ใช้งาน</Note>
          </Section>

          <Section id="tos-section-5" number="5" title="การใช้บริการ">
            <p>ผู้ใช้งานตกลงว่าจะไม่</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
              {[
                "ใช้งานผิดกฎหมาย", "หลอกลวงผู้อื่น", "ส่ง Spam", "ส่ง Malware",
                "Hack ระบบ", "Reverse Engineering ระบบ", "ใช้ Bot โดยไม่ได้รับอนุญาต",
                "รบกวนการทำงานของเว็บไซต์", "ละเมิดลิขสิทธิ์", "แอบอ้างผู้อื่น",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(239,68,68,0.04)",
                    border: "1px solid rgba(239,68,68,0.1)",
                    fontSize: "13px",
                    color: "#4A5468",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                  }}
                >
                  <span style={{ color: "#EF4444", fontSize: "10px" }}>✕</span>
                  {item}
                </div>
              ))}
            </div>
          </Section>

          <Section id="tos-section-6" number="6" title="Marketplace">
            <p>LAYA เป็นเพียงแพลตฟอร์มตัวกลาง การซื้อขายเกิดขึ้นระหว่าง</p>
            <Tags items={["ลูกค้า", "ร้านค้า", "Designer", "ชุมชนผู้ผลิต"]} />
            <Note>LAYA ไม่ใช่ผู้ผลิตสินค้า เว้นแต่ระบุไว้เป็นกรณีพิเศษ</Note>
          </Section>

          <Section id="tos-section-7" number="7" title="คำสั่งซื้อ">
            <p>เมื่อมีการยืนยันคำสั่งซื้อ ร้านค้าจะได้รับข้อมูลที่จำเป็นเพื่อดำเนินการ เช่น</p>
            <Tags items={["ชื่อผู้รับ", "ที่อยู่", "เบอร์โทรศัพท์", "รายละเอียดสินค้า"]} />
            <Note>ระยะเวลาการผลิตอาจแตกต่างกันตามประเภทสินค้า</Note>
          </Section>

          <Section id="tos-section-8" number="8" title="การชำระเงิน">
            <p>การชำระเงินดำเนินการผ่านผู้ให้บริการ Payment Gateway ผู้ใช้งานตกลงว่า</p>
            <Tags items={["ราคาสินค้าอาจมีการเปลี่ยนแปลง", "ค่าจัดส่งอาจแตกต่างกัน", "ค่าธรรมเนียมบางรายการอาจเรียกเก็บโดยผู้ให้บริการภายนอก"]} />
          </Section>

          <Section id="tos-section-9" number="9" title="การยกเลิกและการคืนสินค้า">
            <p>การยกเลิกหรือคืนสินค้าเป็นไปตาม</p>
            <Tags items={["นโยบายของร้านค้า", "ประเภทสินค้า", "กฎหมายคุ้มครองผู้บริโภค"]} />
            <Note type="highlight">
              สินค้าสั่งตัดเฉพาะบุคคล (Made-to-Order) หรือสินค้าที่ผลิตตามความต้องการของลูกค้า อาจไม่สามารถคืนหรือเปลี่ยนได้
              เว้นแต่เกิดจากความผิดพลาดของร้านค้าหรือสินค้าไม่ตรงตามที่ตกลง
            </Note>
          </Section>

          <Section id="tos-section-10" number="10" title="AI Services">
            <p>LAYA มีบริการ AI เช่น</p>
            <Tags items={["AI Try-On", "AI Design", "AI Recommendation", "AI Search"]} />
            <p style={{ marginTop: "10px" }}>ผลลัพธ์จาก AI มีไว้เพื่อช่วยสนับสนุนการตัดสินใจ</p>
            <Note>LAYA ไม่รับประกันว่าผลลัพธ์จาก AI จะถูกต้อง สมบูรณ์ หรือเหมาะสมกับทุกสถานการณ์</Note>
          </Section>

          <Section id="tos-section-11" number="11" title="AI Try-On">
            <p>ผู้ใช้งานสามารถอัปโหลดรูปภาพเพื่อใช้บริการ Virtual Try-On ผู้ใช้งานรับรองว่า</p>
            <Tags items={["เป็นเจ้าของรูปภาพ", "มีสิทธิในการใช้งานรูปดังกล่าว", "การใช้งานไม่ละเมิดสิทธิของบุคคลอื่น"]} />
            <Note>LAYA ขอสงวนสิทธิ์ในการลบรูปภาพที่ไม่เหมาะสม</Note>
          </Section>

          <Section id="tos-section-12" number="12" title="ผลงานออกแบบ">
            <p>ผู้ใช้งานยังคงเป็นเจ้าของ</p>
            <Tags items={["ผลงานออกแบบ", "รูปภาพ", "Portfolio", "ลายผ้า"]} />
            <Note>อย่างไรก็ตาม ผู้ใช้งานอนุญาตให้ LAYA แสดง จัดเก็บ และประมวลผลข้อมูลดังกล่าวเพื่อให้บริการบนแพลตฟอร์ม</Note>
          </Section>

          <Section id="tos-section-13" number="13" title="ทรัพย์สินทางปัญญา">
            <p>ทรัพย์สินทางปัญญาต่อไปนี้เป็นทรัพย์สินของ LAYA หรือเจ้าของสิทธิที่เกี่ยวข้อง</p>
            <Tags items={["โลโก้", "ชื่อ LAYA", "เว็บไซต์", "ซอฟต์แวร์", "ฐานข้อมูล", "UI / UX", "ระบบ AI", "ภาพประกอบ", "เอกสาร"]} />
            <Note type="highlight">ห้ามคัดลอก ดัดแปลง แจกจ่าย หรือใช้เพื่อการพาณิชย์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</Note>
          </Section>

          <Section id="tos-section-14" number="14" title="ภูมิปัญญาท้องถิ่น">
            <p>LAYA ให้ความสำคัญต่อ</p>
            <Tags items={["ภูมิปัญญาท้องถิ่น", "ชุมชน", "ลายผ้าไทย", "วัฒนธรรมไทย"]} />
            <Note>
              การเผยแพร่ข้อมูลบนแพลตฟอร์มมีวัตถุประสงค์เพื่อสนับสนุนการอนุรักษ์และส่งเสริมเศรษฐกิจสร้างสรรค์
              LAYA ไม่อ้างสิทธิ์ความเป็นเจ้าของเหนือภูมิปัญญาท้องถิ่น เว้นแต่ได้รับสิทธิจากเจ้าของโดยชอบด้วยกฎหมาย
            </Note>
          </Section>

          <Section id="tos-section-15" number="15" title="Community Guidelines">
            <p>ผู้ใช้งานตกลงว่าจะไม่เผยแพร่</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
              {["เนื้อหาผิดกฎหมาย", "เนื้อหาละเมิดลิขสิทธิ์", "คำหยาบคาย", "Hate Speech", "ความรุนแรง", "เนื้อหาลามกอนาจาร", "ข่าวปลอม", "การหลอกลวง"].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(239,68,68,0.04)",
                    border: "1px solid rgba(239,68,68,0.1)",
                    fontSize: "13px",
                    color: "#4A5468",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
                  }}
                >
                  <span style={{ color: "#EF4444", fontSize: "10px" }}>✕</span>
                  {item}
                </div>
              ))}
            </div>
            <Note>LAYA ขอสงวนสิทธิ์ในการลบเนื้อหาโดยไม่ต้องแจ้งล่วงหน้า</Note>
          </Section>

          <Section id="tos-section-16" number="16" title="รีวิว">
            <p>รีวิวควรเป็น</p>
            <Tags items={["ข้อเท็จจริง", "ประสบการณ์จริง", "ไม่ใส่ร้าย", "ไม่โจมตีบุคคล"]} />
            <Note>LAYA สามารถลบรีวิวที่ไม่เหมาะสมได้</Note>
          </Section>

          <Section id="tos-section-17" number="17" title="การระงับบัญชี">
            <p>LAYA ขอสงวนสิทธิ์ในการ</p>
            <Tags items={["ระงับบัญชี", "ปิดบัญชี", "ลบข้อมูล", "ระงับการซื้อขาย"]} />
            <Note type="highlight">หากพบการกระทำที่ฝ่าฝืนข้อกำหนด</Note>
          </Section>

          <Section id="tos-section-18" number="18" title="การจำกัดความรับผิด">
            <p>LAYA ให้บริการในลักษณะ <strong>&ldquo;ตามสภาพที่เป็นอยู่&rdquo; (As Is)</strong></p>
            <p>LAYA ไม่รับประกันว่า</p>
            <Tags items={["ระบบจะไม่มีข้อผิดพลาด", "ระบบจะพร้อมใช้งานตลอดเวลา", "AI จะให้ผลลัพธ์ถูกต้อง 100%", "ผู้ขายจะดำเนินการตามกำหนดเวลา"]} />
            <Note>LAYA ไม่รับผิดชอบต่อความเสียหายทางอ้อม ความเสียหายพิเศษ หรือการสูญเสียผลกำไรอันเกิดจากการใช้งานแพลตฟอร์ม</Note>
          </Section>

          <Section id="tos-section-19" number="19" title="เหตุสุดวิสัย">
            <p>LAYA จะไม่รับผิดชอบต่อความล่าช้าหรือความเสียหายที่เกิดจากเหตุการณ์ที่อยู่นอกเหนือการควบคุม เช่น</p>
            <Tags items={["ภัยธรรมชาติ", "ไฟไหม้", "น้ำท่วม", "โรคระบาด", "สงคราม", "การโจมตีทางไซเบอร์", "การหยุดให้บริการของผู้ให้บริการภายนอก"]} />
          </Section>

          <Section id="tos-section-20" number="20" title="การเปลี่ยนแปลงบริการ">
            <p>LAYA อาจ</p>
            <Tags items={["เพิ่มฟีเจอร์", "ลบฟีเจอร์", "ปรับปรุงระบบ", "เปลี่ยนแปลงค่าธรรมเนียม", "ระงับบริการบางส่วน"]} />
            <Note>โดยไม่จำเป็นต้องแจ้งล่วงหน้า เว้นแต่กฎหมายกำหนดไว้เป็นอย่างอื่น</Note>
          </Section>

          <Section id="tos-section-21" number="21" title="การแก้ไขข้อกำหนด">
            <p>
              LAYA สามารถปรับปรุงข้อกำหนดฉบับนี้ได้ทุกเมื่อ
            </p>
            <Note>การใช้งานบริการต่อหลังจากมีการแก้ไข ถือว่าผู้ใช้งานยอมรับข้อกำหนดฉบับใหม่</Note>
          </Section>

          <Section id="tos-section-22" number="22" title="การยุติการใช้งาน">
            <p>ผู้ใช้งานสามารถยุติการใช้งานและลบบัญชีได้ทุกเมื่อ LAYA อาจเก็บข้อมูลบางส่วนไว้ตามที่กฎหมายกำหนด เช่น</p>
            <Tags items={["ธุรกรรม", "เอกสารบัญชี", "ประวัติการชำระเงิน"]} />
          </Section>

          <Section id="tos-section-23" number="23" title="กฎหมายที่ใช้บังคับ">
            <p>ข้อกำหนดฉบับนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย</p>
            <Note type="highlight">ข้อพิพาทใด ๆ ที่เกิดขึ้นจะอยู่ภายใต้เขตอำนาจของศาลไทย</Note>
          </Section>

          <Section id="tos-section-24" number="24" title="ติดต่อเรา">
            <ContactCard />
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
            background: "linear-gradient(135deg, #0F1A30, #1B2A4A)",
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
    { icon: "💬", label: "Support", value: "support@laya-th.com", href: "mailto:support@laya-th.com" },
    { icon: "💼", label: "Business", value: "business@laya-th.com", href: "mailto:business@laya-th.com" },
    { icon: "🔒", label: "Privacy", value: "privacy@laya-th.com", href: "mailto:privacy@laya-th.com" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
      {contacts.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          className="tos-contact-card"
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
