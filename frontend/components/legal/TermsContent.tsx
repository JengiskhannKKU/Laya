"use client";

import EventRoundedIcon from "@mui/icons-material/EventRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = "var(--font-kanit), 'Kanit', sans-serif";

const TOC_TH = [
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
];

const TOC_EN = [
  { n: "1", t: "Introduction" },
  { n: "2", t: "Definitions" },
  { n: "3", t: "User Eligibility" },
  { n: "4", t: "User Account" },
  { n: "5", t: "Use of Service" },
  { n: "6", t: "Marketplace" },
  { n: "7", t: "Orders" },
  { n: "8", t: "Payment" },
  { n: "9", t: "Cancellations & Returns" },
  { n: "10", t: "AI Services" },
  { n: "11", t: "AI Try-On" },
  { n: "12", t: "Design Work" },
  { n: "13", t: "Intellectual Property" },
  { n: "14", t: "Local Wisdom" },
  { n: "15", t: "Community Guidelines" },
  { n: "16", t: "Reviews" },
  { n: "17", t: "Account Suspension" },
  { n: "18", t: "Limitation of Liability" },
  { n: "19", t: "Force Majeure" },
  { n: "20", t: "Changes to the Service" },
  { n: "21", t: "Amendments to These Terms" },
  { n: "22", t: "Termination" },
  { n: "23", t: "Governing Law" },
  { n: "24", t: "Contact Us" },
];

const DEFS_TH = [
  { term: "LAYA", def: "แพลตฟอร์ม เว็บไซต์ แอปพลิเคชัน และบริการทั้งหมดที่ดำเนินการโดย LAYA" },
  { term: "ผู้ใช้งาน (User)", def: "บุคคลที่เข้าใช้งานเว็บไซต์หรือบริการ" },
  { term: "ลูกค้า (Customer)", def: "ผู้ที่ซื้อสินค้า หรือใช้บริการผ่านแพลตฟอร์ม" },
  { term: "ร้านค้า (Shop)", def: "ร้านค้า ช่างทอ Designer ชุมชน หรือผู้ประกอบการที่จำหน่ายสินค้าหรือบริการผ่าน LAYA" },
  { term: "เนื้อหา (Content)", def: "รูปภาพ ข้อความ วิดีโอ ผลงานออกแบบ ลายผ้า รีวิว หรือข้อมูลอื่น ๆ" },
];

const DEFS_EN = [
  { term: "LAYA", def: "The platform, website, application, and all services operated by LAYA." },
  { term: "User", def: "Any person who accesses the website or services." },
  { term: "Customer", def: "A person who purchases products or uses services through the platform." },
  { term: "Shop", def: "A shop, weaver, designer, community, or business that sells products or services through LAYA." },
  { term: "Content", def: "Images, text, videos, design work, fabric patterns, reviews, or other information." },
];

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

function ContactCard({ labels }: { labels: { website: string; support: string; business: string; privacy: string } }) {
  const contacts = [
    { icon: LanguageRoundedIcon, label: labels.website, value: "laya-th.com", href: "https://laya-th.com" },
    { icon: ChatBubbleOutlineRoundedIcon, label: labels.support, value: "support@laya-th.com", href: "mailto:support@laya-th.com" },
    { icon: BusinessCenterOutlinedIcon, label: labels.business, value: "business@laya-th.com", href: "mailto:business@laya-th.com" },
    { icon: LockOutlinedIcon, label: labels.privacy, value: "privacy@laya-th.com", href: "mailto:privacy@laya-th.com" },
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

/* ── Thai content ── */
function ThSections() {
  return (
    <>
      <Section id="tos-section-1" number="1" title="บทนำ">
        <p>
          ยินดีต้อนรับสู่ <strong>LAYA</strong> — แพลตฟอร์ม Fashion Tech Marketplace ที่เชื่อมโยงผู้บริโภค นักออกแบบ ร้านค้า ช่างทอ ชุมชนผู้ผลิต และผู้ประกอบการผ้าไทยเข้าด้วยกันผ่านเทคโนโลยีดิจิทัลและปัญญาประดิษฐ์ (AI) การเข้าใช้งานเว็บไซต์ แอปพลิเคชัน หรือบริการของ LAYA ถือว่าท่านได้อ่าน เข้าใจ และยอมรับข้อกำหนดและเงื่อนไขฉบับนี้ทั้งหมด
        </p>
        <Note type="highlight">หากท่านไม่ยอมรับข้อกำหนดดังกล่าว กรุณาหยุดใช้งานบริการของเรา</Note>
      </Section>

      <Section id="tos-section-2" number="2" title="คำนิยาม">
        <p style={{ margin: "0 0 6px" }}>เพื่อความเข้าใจตรงกันตลอดเอกสารฉบับนี้ คำต่อไปนี้มีความหมายดังนี้</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {DEFS_TH.map((item) => (
            <p key={item.term} style={{ margin: 0 }}>
              <strong style={{ color: "#1B2A4A" }}>{item.term}</strong> — {item.def}
            </p>
          ))}
        </div>
      </Section>

      <Section id="tos-section-3" number="3" title="คุณสมบัติของผู้ใช้งาน">
        <p>ผู้ใช้งานรับรองว่ามีอายุไม่น้อยกว่า 13 ปี ให้ข้อมูลที่ถูกต้อง ไม่ปลอมแปลงตัวตน ไม่ใช้บัญชีของบุคคลอื่น และมีสิทธิในการใช้งานข้อมูลที่อัปโหลด</p>
        <Note>LAYA ขอสงวนสิทธิ์ในการระงับบัญชีที่ให้ข้อมูลอันเป็นเท็จ</Note>
      </Section>

      <Section id="tos-section-4" number="4" title="บัญชีผู้ใช้">
        <p>ผู้ใช้งานมีหน้าที่รักษารหัสผ่านของตน ไม่เปิดเผยข้อมูลบัญชี แจ้งเมื่อพบการใช้งานผิดปกติ และรับผิดชอบต่อทุกกิจกรรมที่เกิดขึ้นภายใต้บัญชีของตน</p>
        <Note>LAYA ไม่รับผิดชอบต่อความเสียหายที่เกิดจากการเปิดเผยรหัสผ่านของผู้ใช้งาน</Note>
      </Section>

      <Section id="tos-section-5" number="5" title="การใช้บริการ">
        <p>ผู้ใช้งานตกลงว่าจะไม่กระทำการดังต่อไปนี้บนแพลตฟอร์ม</p>
        <List items={["ใช้งานผิดกฎหมายหรือหลอกลวงผู้อื่น", "ส่ง Spam หรือ Malware", "แฮ็กระบบหรือทำ Reverse Engineering", "ใช้บอทโดยไม่ได้รับอนุญาต", "รบกวนการทำงานของเว็บไซต์", "ละเมิดลิขสิทธิ์หรือแอบอ้างเป็นผู้อื่น"]} />
      </Section>

      <Section id="tos-section-6" number="6" title="Marketplace">
        <p>LAYA เป็นเพียงแพลตฟอร์มตัวกลาง การซื้อขายเกิดขึ้นระหว่างลูกค้า ร้านค้า นักออกแบบ และชุมชนผู้ผลิตโดยตรง</p>
        <Note>LAYA ไม่ใช่ผู้ผลิตสินค้า เว้นแต่ระบุไว้เป็นกรณีพิเศษ</Note>
      </Section>

      <Section id="tos-section-7" number="7" title="คำสั่งซื้อ">
        <p>เมื่อมีการยืนยันคำสั่งซื้อ ร้านค้าจะได้รับข้อมูลที่จำเป็นเพื่อดำเนินการ เช่น ชื่อผู้รับ ที่อยู่ เบอร์โทรศัพท์ และรายละเอียดสินค้า</p>
        <Note>ระยะเวลาการผลิตอาจแตกต่างกันตามประเภทสินค้า</Note>
      </Section>

      <Section id="tos-section-8" number="8" title="การชำระเงิน">
        <p>การชำระเงินดำเนินการผ่านผู้ให้บริการ Payment Gateway ผู้ใช้งานรับทราบว่าราคาสินค้าและค่าจัดส่งอาจมีการเปลี่ยนแปลง และค่าธรรมเนียมบางรายการอาจเรียกเก็บโดยผู้ให้บริการภายนอก</p>
      </Section>

      <Section id="tos-section-9" number="9" title="การยกเลิกและการคืนสินค้า">
        <p>การยกเลิกหรือคืนสินค้าเป็นไปตามนโยบายของร้านค้า ประเภทสินค้า และกฎหมายคุ้มครองผู้บริโภค</p>
        <Note type="highlight">สินค้าสั่งตัดเฉพาะบุคคล (Made-to-Order) หรือสินค้าที่ผลิตตามความต้องการของลูกค้า อาจไม่สามารถคืนหรือเปลี่ยนได้ เว้นแต่เกิดจากความผิดพลาดของร้านค้าหรือสินค้าไม่ตรงตามที่ตกลง</Note>
      </Section>

      <Section id="tos-section-10" number="10" title="AI Services">
        <p>LAYA มีบริการ AI เช่น AI Try-On, AI Design, AI Recommendation และ AI Search โดยผลลัพธ์จาก AI มีไว้เพื่อช่วยสนับสนุนการตัดสินใจเท่านั้น</p>
        <Note>LAYA ไม่รับประกันว่าผลลัพธ์จาก AI จะถูกต้อง สมบูรณ์ หรือเหมาะสมกับทุกสถานการณ์</Note>
      </Section>

      <Section id="tos-section-11" number="11" title="AI Try-On">
        <p>ผู้ใช้งานสามารถอัปโหลดรูปภาพเพื่อใช้บริการ Virtual Try-On โดยรับรองว่าเป็นเจ้าของรูปภาพ มีสิทธิในการใช้งานรูปดังกล่าว และการใช้งานไม่ละเมิดสิทธิของบุคคลอื่น</p>
        <Note>LAYA ขอสงวนสิทธิ์ในการลบรูปภาพที่ไม่เหมาะสม</Note>
      </Section>

      <Section id="tos-section-12" number="12" title="ผลงานออกแบบ">
        <p>ผู้ใช้งานยังคงเป็นเจ้าของผลงานออกแบบ รูปภาพ ผลงาน (Portfolio) และลายผ้าของตนเอง</p>
        <Note>อย่างไรก็ตาม ผู้ใช้งานอนุญาตให้ LAYA แสดง จัดเก็บ และประมวลผลข้อมูลดังกล่าวเพื่อให้บริการบนแพลตฟอร์ม</Note>
      </Section>

      <Section id="tos-section-13" number="13" title="ทรัพย์สินทางปัญญา">
        <p>โลโก้ ชื่อ LAYA เว็บไซต์ ซอฟต์แวร์ ฐานข้อมูล UI/UX ระบบ AI ภาพประกอบ และเอกสารต่าง ๆ เป็นทรัพย์สินของ LAYA หรือเจ้าของสิทธิที่เกี่ยวข้อง</p>
        <Note type="highlight">ห้ามคัดลอก ดัดแปลง แจกจ่าย หรือใช้เพื่อการพาณิชย์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</Note>
      </Section>

      <Section id="tos-section-14" number="14" title="ภูมิปัญญาท้องถิ่น">
        <p>LAYA ให้ความสำคัญต่อภูมิปัญญาท้องถิ่น ชุมชน ลายผ้าไทย และวัฒนธรรมไทย การเผยแพร่ข้อมูลบนแพลตฟอร์มมีวัตถุประสงค์เพื่อสนับสนุนการอนุรักษ์และส่งเสริมเศรษฐกิจสร้างสรรค์</p>
        <Note>LAYA ไม่อ้างสิทธิ์ความเป็นเจ้าของเหนือภูมิปัญญาท้องถิ่น เว้นแต่ได้รับสิทธิจากเจ้าของโดยชอบด้วยกฎหมาย</Note>
      </Section>

      <Section id="tos-section-15" number="15" title="Community Guidelines">
        <p>ผู้ใช้งานตกลงว่าจะไม่เผยแพร่เนื้อหาต่อไปนี้บนแพลตฟอร์ม</p>
        <List items={["เนื้อหาผิดกฎหมายหรือละเมิดลิขสิทธิ์", "คำหยาบคายหรือ Hate Speech", "เนื้อหาที่ส่งเสริมความรุนแรง", "เนื้อหาลามกอนาจาร", "ข่าวปลอมหรือการหลอกลวง"]} />
        <Note>LAYA ขอสงวนสิทธิ์ในการลบเนื้อหาโดยไม่ต้องแจ้งล่วงหน้า</Note>
      </Section>

      <Section id="tos-section-16" number="16" title="รีวิว">
        <p>รีวิวควรอยู่บนพื้นฐานข้อเท็จจริงและประสบการณ์จริง ไม่ใส่ร้ายหรือโจมตีบุคคลใด</p>
        <Note>LAYA สามารถลบรีวิวที่ไม่เหมาะสมได้</Note>
      </Section>

      <Section id="tos-section-17" number="17" title="การระงับบัญชี">
        <p>LAYA ขอสงวนสิทธิ์ในการระงับบัญชี ปิดบัญชี ลบข้อมูล หรือระงับการซื้อขาย หากพบการกระทำที่ฝ่าฝืนข้อกำหนด</p>
      </Section>

      <Section id="tos-section-18" number="18" title="การจำกัดความรับผิด">
        <p>LAYA ให้บริการในลักษณะ <strong>&ldquo;ตามสภาพที่เป็นอยู่&rdquo; (As Is)</strong> และไม่รับประกันว่าระบบจะไม่มีข้อผิดพลาด พร้อมใช้งานตลอดเวลา AI จะให้ผลลัพธ์ถูกต้อง 100% หรือผู้ขายจะดำเนินการตามกำหนดเวลาเสมอไป</p>
        <Note>LAYA ไม่รับผิดชอบต่อความเสียหายทางอ้อม ความเสียหายพิเศษ หรือการสูญเสียผลกำไรอันเกิดจากการใช้งานแพลตฟอร์ม</Note>
      </Section>

      <Section id="tos-section-19" number="19" title="เหตุสุดวิสัย">
        <p>LAYA จะไม่รับผิดชอบต่อความล่าช้าหรือความเสียหายที่เกิดจากเหตุการณ์ที่อยู่นอกเหนือการควบคุม เช่น ภัยธรรมชาติ ไฟไหม้ น้ำท่วม โรคระบาด สงคราม การโจมตีทางไซเบอร์ หรือการหยุดให้บริการของผู้ให้บริการภายนอก</p>
      </Section>

      <Section id="tos-section-20" number="20" title="การเปลี่ยนแปลงบริการ">
        <p>LAYA อาจเพิ่มหรือลบฟีเจอร์ ปรับปรุงระบบ เปลี่ยนแปลงค่าธรรมเนียม หรือระงับบริการบางส่วน โดยไม่จำเป็นต้องแจ้งล่วงหน้า เว้นแต่กฎหมายกำหนดไว้เป็นอย่างอื่น</p>
      </Section>

      <Section id="tos-section-21" number="21" title="การแก้ไขข้อกำหนด">
        <p>LAYA สามารถปรับปรุงข้อกำหนดฉบับนี้ได้ทุกเมื่อ</p>
        <Note>การใช้งานบริการต่อหลังจากมีการแก้ไข ถือว่าผู้ใช้งานยอมรับข้อกำหนดฉบับใหม่</Note>
      </Section>

      <Section id="tos-section-22" number="22" title="การยุติการใช้งาน">
        <p>ผู้ใช้งานสามารถยุติการใช้งานและลบบัญชีได้ทุกเมื่อ LAYA อาจเก็บข้อมูลบางส่วนไว้ตามที่กฎหมายกำหนด เช่น ธุรกรรม เอกสารบัญชี และประวัติการชำระเงิน</p>
      </Section>

      <Section id="tos-section-23" number="23" title="กฎหมายที่ใช้บังคับ">
        <p>ข้อกำหนดฉบับนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย</p>
        <Note type="highlight">ข้อพิพาทใด ๆ ที่เกิดขึ้นจะอยู่ภายใต้เขตอำนาจของศาลไทย</Note>
      </Section>

      <Section id="tos-section-24" number="24" title="ติดต่อเรา">
        <ContactCard labels={{ website: "Website", support: "Support", business: "Business", privacy: "Privacy" }} />
      </Section>
    </>
  );
}

/* ── English content ── */
function EnSections() {
  return (
    <>
      <Section id="tos-section-1" number="1" title="Introduction">
        <p>
          Welcome to <strong>LAYA</strong> — a Fashion Tech Marketplace that connects consumers, designers, shops, weavers, producer communities, and Thai fabric businesses through digital technology and artificial intelligence (AI). By accessing LAYA&rsquo;s website, application, or services, you acknowledge that you have read, understood, and accepted these Terms of Service in full.
        </p>
        <Note type="highlight">If you do not accept these terms, please discontinue use of our services.</Note>
      </Section>

      <Section id="tos-section-2" number="2" title="Definitions">
        <p style={{ margin: "0 0 6px" }}>For consistent understanding throughout this document, the following terms have the meanings below.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {DEFS_EN.map((item) => (
            <p key={item.term} style={{ margin: 0 }}>
              <strong style={{ color: "#1B2A4A" }}>{item.term}</strong> — {item.def}
            </p>
          ))}
        </div>
      </Section>

      <Section id="tos-section-3" number="3" title="User Eligibility">
        <p>Users represent that they are at least 13 years old, provide accurate information, do not impersonate others, do not use another person&rsquo;s account, and hold the rights to use any content they upload.</p>
        <Note>LAYA reserves the right to suspend accounts that provide false information.</Note>
      </Section>

      <Section id="tos-section-4" number="4" title="User Account">
        <p>Users are responsible for safeguarding their password, must not disclose account details, must report any suspicious activity, and are responsible for all activity occurring under their account.</p>
        <Note>LAYA is not liable for damages resulting from a user disclosing their own password.</Note>
      </Section>

      <Section id="tos-section-5" number="5" title="Use of Service">
        <p>Users agree not to do any of the following on the platform.</p>
        <List items={["Engage in unlawful conduct or deceive others", "Send spam or malware", "Hack the system or perform reverse engineering", "Use unauthorized bots", "Interfere with the operation of the website", "Infringe copyright or impersonate another person"]} />
      </Section>

      <Section id="tos-section-6" number="6" title="Marketplace">
        <p>LAYA is only an intermediary platform. Sales and purchases occur directly between customers, shops, designers, and producer communities.</p>
        <Note>LAYA is not the manufacturer of products, except where specifically stated.</Note>
      </Section>

      <Section id="tos-section-7" number="7" title="Orders">
        <p>Once an order is confirmed, the shop receives the information necessary to fulfill it, such as the recipient&rsquo;s name, address, phone number, and product details.</p>
        <Note>Production time may vary depending on the product type.</Note>
      </Section>

      <Section id="tos-section-8" number="8" title="Payment">
        <p>Payments are processed through payment gateway providers. Users acknowledge that product prices and shipping costs may change, and that certain fees may be charged by third-party providers.</p>
      </Section>

      <Section id="tos-section-9" number="9" title="Cancellations & Returns">
        <p>Cancellations and returns are subject to the shop&rsquo;s policy, the type of product, and consumer protection law.</p>
        <Note type="highlight">Made-to-order products or items produced to a customer&rsquo;s specifications may not be returnable or exchangeable, except where the shop is at fault or the product does not match what was agreed.</Note>
      </Section>

      <Section id="tos-section-10" number="10" title="AI Services">
        <p>LAYA offers AI services such as AI Try-On, AI Design, AI Recommendation, and AI Search. AI-generated results are intended only to support decision-making.</p>
        <Note>LAYA does not guarantee that AI results will be accurate, complete, or suitable for every situation.</Note>
      </Section>

      <Section id="tos-section-11" number="11" title="AI Try-On">
        <p>Users may upload images to use the Virtual Try-On service, and represent that they own the images, hold the right to use them, and that such use does not infringe the rights of others.</p>
        <Note>LAYA reserves the right to remove inappropriate images.</Note>
      </Section>

      <Section id="tos-section-12" number="12" title="Design Work">
        <p>Users remain the owner of their own design work, images, portfolio, and fabric patterns.</p>
        <Note>However, users grant LAYA permission to display, store, and process such content in order to provide the platform&rsquo;s services.</Note>
      </Section>

      <Section id="tos-section-13" number="13" title="Intellectual Property">
        <p>The LAYA logo, name, website, software, database, UI/UX, AI systems, illustrations, and documentation are the property of LAYA or the relevant rights holders.</p>
        <Note type="highlight">Copying, modifying, distributing, or using them commercially without written permission is prohibited.</Note>
      </Section>

      <Section id="tos-section-14" number="14" title="Local Wisdom">
        <p>LAYA values local wisdom, communities, Thai fabric patterns, and Thai culture. Content published on the platform is intended to support preservation and promote the creative economy.</p>
        <Note>LAYA does not claim ownership over local wisdom, except where rights have been lawfully obtained from the rightful owner.</Note>
      </Section>

      <Section id="tos-section-15" number="15" title="Community Guidelines">
        <p>Users agree not to publish the following content on the platform.</p>
        <List items={["Unlawful content or content that infringes copyright", "Profanity or hate speech", "Content that promotes violence", "Obscene content", "Fake news or fraudulent content"]} />
        <Note>LAYA reserves the right to remove content without prior notice.</Note>
      </Section>

      <Section id="tos-section-16" number="16" title="Reviews">
        <p>Reviews should be based on facts and genuine experience, and must not defame or attack any individual.</p>
        <Note>LAYA may remove inappropriate reviews.</Note>
      </Section>

      <Section id="tos-section-17" number="17" title="Account Suspension">
        <p>LAYA reserves the right to suspend accounts, close accounts, delete data, or halt transactions if it finds conduct that violates these terms.</p>
      </Section>

      <Section id="tos-section-18" number="18" title="Limitation of Liability">
        <p>LAYA provides its services on an <strong>&ldquo;as is&rdquo;</strong> basis and does not guarantee the system will be error-free, always available, that AI will produce 100% accurate results, or that sellers will always meet stated timelines.</p>
        <Note>LAYA is not liable for indirect damages, special damages, or loss of profit arising from use of the platform.</Note>
      </Section>

      <Section id="tos-section-19" number="19" title="Force Majeure">
        <p>LAYA is not responsible for delays or damages caused by events beyond its reasonable control, such as natural disasters, fire, flooding, pandemics, war, cyberattacks, or outages of third-party service providers.</p>
      </Section>

      <Section id="tos-section-20" number="20" title="Changes to the Service">
        <p>LAYA may add or remove features, upgrade systems, change fees, or suspend parts of the service without prior notice, unless otherwise required by law.</p>
      </Section>

      <Section id="tos-section-21" number="21" title="Amendments to These Terms">
        <p>LAYA may update these terms at any time.</p>
        <Note>Continued use of the service after an amendment constitutes acceptance of the revised terms.</Note>
      </Section>

      <Section id="tos-section-22" number="22" title="Termination">
        <p>Users may stop using the service and delete their account at any time. LAYA may retain certain data as required by law, such as transaction records, accounting documents, and payment history.</p>
      </Section>

      <Section id="tos-section-23" number="23" title="Governing Law">
        <p>These terms are governed by the laws of the Kingdom of Thailand.</p>
        <Note type="highlight">Any disputes arising from these terms shall be subject to the jurisdiction of the Thai courts.</Note>
      </Section>

      <Section id="tos-section-24" number="24" title="Contact Us">
        <ContactCard labels={{ website: "Website", support: "Support", business: "Business", privacy: "Privacy" }} />
      </Section>
    </>
  );
}

export default function TermsContent() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const toc = isEn ? TOC_EN : TOC_TH;

  return (
    <>
      <style>{`
        .tos-toc-link { color: #4A5468; transition: background 0.15s, color 0.15s; }
        .tos-toc-link:hover { background: rgba(197,165,90,0.08); color: #1B2A4A; }
        .tos-contact-row { transition: background 0.15s; }
        .tos-contact-row:hover { background: rgba(27,42,74,0.04); }
      `}</style>
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
              {isEn ? "Terms of Service" : "ข้อกำหนดและเงื่อนไขการใช้งาน"}
            </h1>
            <p style={{ margin: "0 0 18px", fontSize: "13px", color: "rgba(255,255,255,0.55)", fontFamily: FONT }}>
              {isEn ? "ข้อกำหนดและเงื่อนไขการใช้งาน" : "Terms of Service"}
            </p>
            <div style={{ display: "inline-flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#D4BA7A", fontFamily: FONT }}>
                <EventRoundedIcon sx={{ fontSize: 15 }} /> {isEn ? "Effective: July 11, 2026" : "มีผลบังคับใช้: 11 กรกฎาคม 2026"}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#D4BA7A", fontFamily: FONT }}>
                <UpdateRoundedIcon sx={{ fontSize: 15 }} /> {isEn ? "Last updated: July 11, 2026" : "อัปเดตล่าสุด: 11 กรกฎาคม 2026"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "820px", margin: "32px auto 0", padding: "0 20px" }}>
          {/* Table of Contents */}
          <nav
            aria-label={isEn ? "Table of contents" : "สารบัญ"}
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
              {isEn ? "Table of Contents" : "สารบัญ"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "2px 12px" }}>
              {toc.map((item) => (
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
            {isEn ? <EnSections /> : <ThSections />}
          </div>
        </div>
      </main>
    </>
  );
}
