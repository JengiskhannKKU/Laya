import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/seo";
import AppTopNav from "@/components/layout/TopNav";
import AppFooter from "@/components/layout/Footer";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";

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

const FONT = "var(--font-kanit), 'Kanit', sans-serif";

export default function TermsPage() {
  return (
    <>
    <style>{`
      .tos-toc-link { color: #4A5468; transition: background 0.15s, color 0.15s; }
      .tos-toc-link:hover { background: rgba(197,165,90,0.08); color: #1B2A4A; }
      .tos-contact-row { transition: background 0.15s; }
      .tos-contact-row:hover { background: rgba(27,42,74,0.04); }
    `}</style>
    <AppTopNav />
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FAF6F0 0%, #F5EFE6 100%)",
        paddingBottom: "56px",
      }}
    >
      {/* Hero Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, #0F1A30 100%)",
          padding: "40px 24px 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #C5A55A, transparent)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C5A55A", fontFamily: FONT }}>
            LAYA — Legal
          </p>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px, 4.5vw, 32px)", fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, lineHeight: 1.2 }}>
            ข้อกำหนดและเงื่อนไขการใช้งาน
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: "13px", color: "rgba(255,255,255,0.55)", fontFamily: FONT }}>
            Terms of Service
          </p>
          <div style={{ display: "inline-flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#D4BA7A", fontFamily: FONT }}>
              <EventRoundedIcon sx={{ fontSize: 15 }} /> มีผลบังคับใช้: 11 กรกฎาคม 2026
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#D4BA7A", fontFamily: FONT }}>
              <UpdateRoundedIcon sx={{ fontSize: 15 }} /> อัปเดตล่าสุด: 11 กรกฎาคม 2026
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "820px", margin: "32px auto 0", padding: "0 20px" }}>
        {/* Table of Contents */}
        <nav
          aria-label="สารบัญ"
          style={{
            background: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid rgba(197,165,90,0.2)",
            boxShadow: "0 2px 12px rgba(27,42,74,0.05)",
            padding: "16px 18px",
            marginBottom: "24px",
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 600, color: "#C5A55A", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT }}>
            สารบัญ
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "2px 12px" }}>
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
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "3px 6px", borderRadius: "6px", textDecoration: "none", fontSize: "12.5px", fontFamily: FONT }}
              >
                <span style={{ width: "16px", height: "16px", borderRadius: "5px", background: "rgba(197,165,90,0.15)", color: "#C5A55A", fontSize: "9px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.n}
                </span>
                {item.t}
              </a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          <Section id="tos-section-1" number="1" title="บทนำ">
            <p>
              ยินดีต้อนรับสู่ <strong>LAYA</strong> — แพลตฟอร์ม Fashion Tech Marketplace ที่เชื่อมโยงผู้บริโภค นักออกแบบ ร้านค้า ช่างทอ ชุมชนผู้ผลิต และผู้ประกอบการผ้าไทยเข้าด้วยกันผ่านเทคโนโลยีดิจิทัลและปัญญาประดิษฐ์ (AI) การเข้าใช้งานเว็บไซต์ แอปพลิเคชัน หรือบริการของ LAYA ถือว่าท่านได้อ่าน เข้าใจ และยอมรับข้อกำหนดและเงื่อนไขฉบับนี้ทั้งหมด
            </p>
            <Note type="highlight">หากท่านไม่ยอมรับข้อกำหนดดังกล่าว กรุณาหยุดใช้งานบริการของเรา</Note>
          </Section>

          <Section id="tos-section-2" number="2" title="คำนิยาม">
            <p style={{ margin: "0 0 6px" }}>เพื่อความเข้าใจตรงกันตลอดเอกสารฉบับนี้ คำต่อไปนี้มีความหมายดังนี้</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { term: "LAYA", def: "แพลตฟอร์ม เว็บไซต์ แอปพลิเคชัน และบริการทั้งหมดที่ดำเนินการโดย LAYA" },
                { term: "ผู้ใช้งาน (User)", def: "บุคคลที่เข้าใช้งานเว็บไซต์หรือบริการ" },
                { term: "ลูกค้า (Customer)", def: "ผู้ที่ซื้อสินค้า หรือใช้บริการผ่านแพลตฟอร์ม" },
                { term: "ร้านค้า (Shop)", def: "ร้านค้า ช่างทอ Designer ชุมชน หรือผู้ประกอบการที่จำหน่ายสินค้าหรือบริการผ่าน LAYA" },
                { term: "เนื้อหา (Content)", def: "รูปภาพ ข้อความ วิดีโอ ผลงานออกแบบ ลายผ้า รีวิว หรือข้อมูลอื่น ๆ" },
              ].map((item) => (
                <p key={item.term} style={{ margin: 0 }}>
                  <strong style={{ color: "#1B2A4A" }}>{item.term}</strong> — {item.def}
                </p>
              ))}
            </div>
          </Section>

          <Section id="tos-section-3" number="3" title="คุณสมบัติของผู้ใช้งาน">
            <p>
              ผู้ใช้งานรับรองว่ามีอายุไม่น้อยกว่า 13 ปี ให้ข้อมูลที่ถูกต้อง ไม่ปลอมแปลงตัวตน ไม่ใช้บัญชีของบุคคลอื่น และมีสิทธิในการใช้งานข้อมูลที่อัปโหลด
            </p>
            <Note>LAYA ขอสงวนสิทธิ์ในการระงับบัญชีที่ให้ข้อมูลอันเป็นเท็จ</Note>
          </Section>

          <Section id="tos-section-4" number="4" title="บัญชีผู้ใช้">
            <p>
              ผู้ใช้งานมีหน้าที่รักษารหัสผ่านของตน ไม่เปิดเผยข้อมูลบัญชี แจ้งเมื่อพบการใช้งานผิดปกติ และรับผิดชอบต่อทุกกิจกรรมที่เกิดขึ้นภายใต้บัญชีของตน
            </p>
            <Note>LAYA ไม่รับผิดชอบต่อความเสียหายที่เกิดจากการเปิดเผยรหัสผ่านของผู้ใช้งาน</Note>
          </Section>

          <Section id="tos-section-5" number="5" title="การใช้บริการ">
            <p>ผู้ใช้งานตกลงว่าจะไม่กระทำการดังต่อไปนี้บนแพลตฟอร์ม</p>
            <List items={[
              "ใช้งานผิดกฎหมายหรือหลอกลวงผู้อื่น",
              "ส่ง Spam หรือ Malware",
              "แฮ็กระบบหรือทำ Reverse Engineering",
              "ใช้บอทโดยไม่ได้รับอนุญาต",
              "รบกวนการทำงานของเว็บไซต์",
              "ละเมิดลิขสิทธิ์หรือแอบอ้างเป็นผู้อื่น",
            ]} />
          </Section>

          <Section id="tos-section-6" number="6" title="Marketplace">
            <p>
              LAYA เป็นเพียงแพลตฟอร์มตัวกลาง การซื้อขายเกิดขึ้นระหว่างลูกค้า ร้านค้า นักออกแบบ และชุมชนผู้ผลิตโดยตรง
            </p>
            <Note>LAYA ไม่ใช่ผู้ผลิตสินค้า เว้นแต่ระบุไว้เป็นกรณีพิเศษ</Note>
          </Section>

          <Section id="tos-section-7" number="7" title="คำสั่งซื้อ">
            <p>
              เมื่อมีการยืนยันคำสั่งซื้อ ร้านค้าจะได้รับข้อมูลที่จำเป็นเพื่อดำเนินการ เช่น ชื่อผู้รับ ที่อยู่ เบอร์โทรศัพท์ และรายละเอียดสินค้า
            </p>
            <Note>ระยะเวลาการผลิตอาจแตกต่างกันตามประเภทสินค้า</Note>
          </Section>

          <Section id="tos-section-8" number="8" title="การชำระเงิน">
            <p>
              การชำระเงินดำเนินการผ่านผู้ให้บริการ Payment Gateway ผู้ใช้งานรับทราบว่าราคาสินค้าและค่าจัดส่งอาจมีการเปลี่ยนแปลง และค่าธรรมเนียมบางรายการอาจเรียกเก็บโดยผู้ให้บริการภายนอก
            </p>
          </Section>

          <Section id="tos-section-9" number="9" title="การยกเลิกและการคืนสินค้า">
            <p>
              การยกเลิกหรือคืนสินค้าเป็นไปตามนโยบายของร้านค้า ประเภทสินค้า และกฎหมายคุ้มครองผู้บริโภค
            </p>
            <Note type="highlight">
              สินค้าสั่งตัดเฉพาะบุคคล (Made-to-Order) หรือสินค้าที่ผลิตตามความต้องการของลูกค้า อาจไม่สามารถคืนหรือเปลี่ยนได้ เว้นแต่เกิดจากความผิดพลาดของร้านค้าหรือสินค้าไม่ตรงตามที่ตกลง
            </Note>
          </Section>

          <Section id="tos-section-10" number="10" title="AI Services">
            <p>
              LAYA มีบริการ AI เช่น AI Try-On, AI Design, AI Recommendation และ AI Search โดยผลลัพธ์จาก AI มีไว้เพื่อช่วยสนับสนุนการตัดสินใจเท่านั้น
            </p>
            <Note>LAYA ไม่รับประกันว่าผลลัพธ์จาก AI จะถูกต้อง สมบูรณ์ หรือเหมาะสมกับทุกสถานการณ์</Note>
          </Section>

          <Section id="tos-section-11" number="11" title="AI Try-On">
            <p>
              ผู้ใช้งานสามารถอัปโหลดรูปภาพเพื่อใช้บริการ Virtual Try-On โดยรับรองว่าเป็นเจ้าของรูปภาพ มีสิทธิในการใช้งานรูปดังกล่าว และการใช้งานไม่ละเมิดสิทธิของบุคคลอื่น
            </p>
            <Note>LAYA ขอสงวนสิทธิ์ในการลบรูปภาพที่ไม่เหมาะสม</Note>
          </Section>

          <Section id="tos-section-12" number="12" title="ผลงานออกแบบ">
            <p>
              ผู้ใช้งานยังคงเป็นเจ้าของผลงานออกแบบ รูปภาพ ผลงาน (Portfolio) และลายผ้าของตนเอง
            </p>
            <Note>อย่างไรก็ตาม ผู้ใช้งานอนุญาตให้ LAYA แสดง จัดเก็บ และประมวลผลข้อมูลดังกล่าวเพื่อให้บริการบนแพลตฟอร์ม</Note>
          </Section>

          <Section id="tos-section-13" number="13" title="ทรัพย์สินทางปัญญา">
            <p>
              โลโก้ ชื่อ LAYA เว็บไซต์ ซอฟต์แวร์ ฐานข้อมูล UI/UX ระบบ AI ภาพประกอบ และเอกสารต่าง ๆ เป็นทรัพย์สินของ LAYA หรือเจ้าของสิทธิที่เกี่ยวข้อง
            </p>
            <Note type="highlight">ห้ามคัดลอก ดัดแปลง แจกจ่าย หรือใช้เพื่อการพาณิชย์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</Note>
          </Section>

          <Section id="tos-section-14" number="14" title="ภูมิปัญญาท้องถิ่น">
            <p>
              LAYA ให้ความสำคัญต่อภูมิปัญญาท้องถิ่น ชุมชน ลายผ้าไทย และวัฒนธรรมไทย การเผยแพร่ข้อมูลบนแพลตฟอร์มมีวัตถุประสงค์เพื่อสนับสนุนการอนุรักษ์และส่งเสริมเศรษฐกิจสร้างสรรค์
            </p>
            <Note>LAYA ไม่อ้างสิทธิ์ความเป็นเจ้าของเหนือภูมิปัญญาท้องถิ่น เว้นแต่ได้รับสิทธิจากเจ้าของโดยชอบด้วยกฎหมาย</Note>
          </Section>

          <Section id="tos-section-15" number="15" title="Community Guidelines">
            <p>ผู้ใช้งานตกลงว่าจะไม่เผยแพร่เนื้อหาต่อไปนี้บนแพลตฟอร์ม</p>
            <List items={["เนื้อหาผิดกฎหมายหรือละเมิดลิขสิทธิ์", "คำหยาบคายหรือ Hate Speech", "เนื้อหาที่ส่งเสริมความรุนแรง", "เนื้อหาลามกอนาจาร", "ข่าวปลอมหรือการหลอกลวง"]} />
            <Note>LAYA ขอสงวนสิทธิ์ในการลบเนื้อหาโดยไม่ต้องแจ้งล่วงหน้า</Note>
          </Section>

          <Section id="tos-section-16" number="16" title="รีวิว">
            <p>
              รีวิวควรอยู่บนพื้นฐานข้อเท็จจริงและประสบการณ์จริง ไม่ใส่ร้ายหรือโจมตีบุคคลใด
            </p>
            <Note>LAYA สามารถลบรีวิวที่ไม่เหมาะสมได้</Note>
          </Section>

          <Section id="tos-section-17" number="17" title="การระงับบัญชี">
            <p>
              LAYA ขอสงวนสิทธิ์ในการระงับบัญชี ปิดบัญชี ลบข้อมูล หรือระงับการซื้อขาย หากพบการกระทำที่ฝ่าฝืนข้อกำหนด
            </p>
          </Section>

          <Section id="tos-section-18" number="18" title="การจำกัดความรับผิด">
            <p>
              LAYA ให้บริการในลักษณะ <strong>&ldquo;ตามสภาพที่เป็นอยู่&rdquo; (As Is)</strong> และไม่รับประกันว่าระบบจะไม่มีข้อผิดพลาด พร้อมใช้งานตลอดเวลา AI จะให้ผลลัพธ์ถูกต้อง 100% หรือผู้ขายจะดำเนินการตามกำหนดเวลาเสมอไป
            </p>
            <Note>LAYA ไม่รับผิดชอบต่อความเสียหายทางอ้อม ความเสียหายพิเศษ หรือการสูญเสียผลกำไรอันเกิดจากการใช้งานแพลตฟอร์ม</Note>
          </Section>

          <Section id="tos-section-19" number="19" title="เหตุสุดวิสัย">
            <p>
              LAYA จะไม่รับผิดชอบต่อความล่าช้าหรือความเสียหายที่เกิดจากเหตุการณ์ที่อยู่นอกเหนือการควบคุม เช่น ภัยธรรมชาติ ไฟไหม้ น้ำท่วม โรคระบาด สงคราม การโจมตีทางไซเบอร์ หรือการหยุดให้บริการของผู้ให้บริการภายนอก
            </p>
          </Section>

          <Section id="tos-section-20" number="20" title="การเปลี่ยนแปลงบริการ">
            <p>
              LAYA อาจเพิ่มหรือลบฟีเจอร์ ปรับปรุงระบบ เปลี่ยนแปลงค่าธรรมเนียม หรือระงับบริการบางส่วน โดยไม่จำเป็นต้องแจ้งล่วงหน้า เว้นแต่กฎหมายกำหนดไว้เป็นอย่างอื่น
            </p>
          </Section>

          <Section id="tos-section-21" number="21" title="การแก้ไขข้อกำหนด">
            <p>LAYA สามารถปรับปรุงข้อกำหนดฉบับนี้ได้ทุกเมื่อ</p>
            <Note>การใช้งานบริการต่อหลังจากมีการแก้ไข ถือว่าผู้ใช้งานยอมรับข้อกำหนดฉบับใหม่</Note>
          </Section>

          <Section id="tos-section-22" number="22" title="การยุติการใช้งาน">
            <p>
              ผู้ใช้งานสามารถยุติการใช้งานและลบบัญชีได้ทุกเมื่อ LAYA อาจเก็บข้อมูลบางส่วนไว้ตามที่กฎหมายกำหนด เช่น ธุรกรรม เอกสารบัญชี และประวัติการชำระเงิน
            </p>
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
        borderRadius: "14px",
        border: "1px solid rgba(229,223,214,0.8)",
        boxShadow: "0 1px 8px rgba(27,42,74,0.04)",
        overflow: "hidden",
        scrollMarginTop: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px 10px" }}>
        <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: "linear-gradient(135deg, #0F1A30, #1B2A4A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#D4BA7A", fontFamily: FONT }}>{number}</span>
        </div>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#1B2A4A", fontFamily: FONT }}>{title}</h2>
      </div>
      <div style={{ padding: "0 18px 16px 54px", fontSize: "13.5px", lineHeight: 1.7, color: "#4A5468", fontFamily: FONT }}>
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", columns: items.length > 5 ? "2" : "1", columnGap: "20px" }}>
      {items.map((item) => (
        <li key={item} style={{ display: "flex", gap: "8px", padding: "3px 0", breakInside: "avoid" }}>
          <span style={{ color: "#C5A55A", flexShrink: 0 }}>—</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Note({ children, type = "default" }: { children: React.ReactNode; type?: "default" | "highlight" }) {
  const isHighlight = type === "highlight";
  const Icon = isHighlight ? StarRoundedIcon : InfoOutlinedIcon;
  return (
    <div
      style={{
        marginTop: "10px",
        padding: "8px 12px",
        borderRadius: "8px",
        borderLeft: `3px solid ${isHighlight ? "#C5A55A" : "#D8D2C4"}`,
        background: isHighlight ? "rgba(197,165,90,0.06)" : "rgba(27,42,74,0.025)",
        fontSize: "12.5px",
        color: isHighlight ? "#1B2A4A" : "#7A7468",
        display: "flex",
        gap: "8px",
        alignItems: "flex-start",
        fontFamily: FONT,
      }}
    >
      <Icon sx={{ fontSize: 15, flexShrink: 0, mt: "1px", color: isHighlight ? "#C5A55A" : "#A89F94" }} />
      <span>{children}</span>
    </div>
  );
}

function ContactCard() {
  const contacts = [
    { icon: LanguageRoundedIcon, label: "Website", value: "laya-th.com", href: "https://laya-th.com" },
    { icon: ChatBubbleOutlineRoundedIcon, label: "Support", value: "support@laya-th.com", href: "mailto:support@laya-th.com" },
    { icon: BusinessCenterOutlinedIcon, label: "Business", value: "business@laya-th.com", href: "mailto:business@laya-th.com" },
    { icon: LockOutlinedIcon, label: "Privacy", value: "privacy@laya-th.com", href: "mailto:privacy@laya-th.com" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
      {contacts.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          className="tos-contact-row"
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", textDecoration: "none" }}
        >
          <c.icon sx={{ fontSize: 16, color: "#C5A55A", flexShrink: 0 }} />
          <span style={{ fontSize: "12.5px", color: "#A89F94", fontFamily: FONT, minWidth: "56px" }}>{c.label}</span>
          <span style={{ fontSize: "13px", color: "#1B2A4A", fontFamily: FONT }}>{c.value}</span>
        </a>
      ))}
    </div>
  );
}
