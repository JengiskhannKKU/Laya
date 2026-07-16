"use client";

import EventRoundedIcon from "@mui/icons-material/EventRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = "var(--font-kanit), 'Kanit', sans-serif";

const TOC_TH = [
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
];

const TOC_EN = [
  { n: "1", t: "Introduction" },
  { n: "2", t: "Information We Collect" },
  { n: "3", t: "Purpose of Use" },
  { n: "4", t: "Use of AI" },
  { n: "5", t: "AI Try-On" },
  { n: "6", t: "Data Used to Develop AI" },
  { n: "7", t: "Cookies" },
  { n: "8", t: "Disclosure of Information" },
  { n: "9", t: "Sharing With Shops" },
  { n: "10", t: "Publicly Available Information" },
  { n: "11", t: "Security" },
  { n: "12", t: "Data Retention Period" },
  { n: "13", t: "Your Rights" },
  { n: "14", t: "Account Deletion" },
  { n: "15", t: "International Data Transfer" },
  { n: "16", t: "Minors" },
  { n: "17", t: "Policy Changes" },
  { n: "18", t: "Contact Us" },
  { n: "19", t: "Governing Law" },
];

const RIGHTS_ICONS = [SearchRoundedIcon, EditRoundedIcon, AssignmentOutlinedIcon, UndoRoundedIcon, BlockRoundedIcon, DeleteOutlineRoundedIcon, PauseCircleOutlineRoundedIcon, Inventory2OutlinedIcon];
const RIGHTS_TH = ["ขอเข้าถึงข้อมูล", "ขอแก้ไขข้อมูล", "ขอรับสำเนาข้อมูล", "ขอถอนความยินยอม", "ขอคัดค้านการประมวลผล", "ขอให้ลบข้อมูล", "ขอจำกัดการประมวลผล", "ขอให้โอนย้ายข้อมูล (Data Portability)"];
const RIGHTS_EN = ["Right to access", "Right to rectify", "Right to obtain a copy", "Right to withdraw consent", "Right to object to processing", "Right to erasure", "Right to restrict processing", "Right to data portability"];

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
        <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: "linear-gradient(135deg, #1B2A4A, #2C3E6B)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <p style={{ margin: "8px 0" }}>
      <strong style={{ color: "#1B2A4A" }}>{title}</strong> — {children}
    </p>
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

function ContactCard({ labels }: { labels: { website: string; privacy: string; support: string; business: string } }) {
  const contacts = [
    { icon: LanguageRoundedIcon, label: labels.website, value: "laya-th.com", href: "https://laya-th.com" },
    { icon: LockOutlinedIcon, label: labels.privacy, value: "privacy@laya-th.com", href: "mailto:privacy@laya-th.com" },
    { icon: ChatBubbleOutlineRoundedIcon, label: labels.support, value: "support@laya-th.com", href: "mailto:support@laya-th.com" },
    { icon: BusinessCenterOutlinedIcon, label: labels.business, value: "business@laya-th.com", href: "mailto:business@laya-th.com" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
      {contacts.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          className="pp-contact-row"
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
      <Section id="section-1" number="1" title="บทนำ">
        <p>
          LAYA (&ldquo;LAYA&rdquo;, &ldquo;เรา&rdquo;, &ldquo;บริษัท&rdquo;, &ldquo;แพลตฟอร์ม&rdquo;) เป็นแพลตฟอร์ม Fashion Tech Marketplace ที่เชื่อมโยงผู้บริโภค นักออกแบบ ช่างทอ ชุมชนผู้ผลิต และผู้ประกอบการผ้าไทยเข้าด้วยกันผ่านเทคโนโลยีดิจิทัลและปัญญาประดิษฐ์ (AI) เราให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้งานทุกคน และมุ่งมั่นคุ้มครองข้อมูลส่วนบุคคลตาม<strong>พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</strong> รวมถึงกฎหมายที่เกี่ยวข้อง การใช้งานเว็บไซต์ แอปพลิเคชัน หรือบริการของ LAYA ถือว่าท่านได้อ่าน เข้าใจ และยอมรับนโยบายฉบับนี้แล้ว
        </p>
      </Section>

      <Section id="section-2" number="2" title="ข้อมูลที่เราเก็บรวบรวม">
        <p>เพื่อให้บริการได้อย่างครบถ้วน LAYA อาจเก็บรวบรวมข้อมูลของท่านในหลายลักษณะ ดังนี้</p>
        <Sub title="ข้อมูลบัญชีผู้ใช้">ชื่อ นามสกุล ชื่อที่แสดง อีเมล เบอร์โทรศัพท์ รูปโปรไฟล์ ประเทศ ภาษา วันที่สมัครสมาชิก และเวลาที่เข้าสู่ระบบล่าสุด</Sub>
        <Sub title="ข้อมูลการเข้าสู่ระบบ">ท่านสามารถเข้าสู่ระบบผ่านอีเมล, Google, Apple (หากรองรับ) หรือผู้ให้บริการ OAuth อื่น โดย LAYA จะได้รับเฉพาะข้อมูลที่ท่านอนุญาตให้เข้าถึงเท่านั้น</Sub>
        <Sub title="ข้อมูลร้านค้าและผู้ผลิต">สำหรับร้านค้า Designer หรือชุมชนผู้ผลิต เราอาจเก็บชื่อร้าน คำอธิบายร้าน ที่อยู่ จังหวัด เบอร์โทรศัพท์ Line ID รูปหน้าร้าน รูปปก พิกัดร้าน คะแนนรีวิว ประเภทบริการ และความเชี่ยวชาญ</Sub>
        <Sub title="ข้อมูลการสั่งซื้อ">ประวัติคำสั่งซื้อ รายละเอียดสินค้า ประวัติการผลิตและการตัดเย็บ สถานะคำสั่งซื้อ ราคาสินค้า ค่าจัดส่ง วิธีชำระเงิน หมายเลขติดตามพัสดุ และประวัติการเปลี่ยนสถานะ</Sub>
        <Sub title="ข้อมูลการชำระเงิน">ยอดชำระ หมายเลขอ้างอิงธุรกรรม สถานะและวิธีการชำระเงิน — LAYA จะไม่จัดเก็บหมายเลขบัตรเครดิตหรือข้อมูลทางการเงินที่ละเอียดอ่อนโดยตรง ธุรกรรมทั้งหมดดำเนินการผ่านผู้ให้บริการ Payment Gateway ที่ได้มาตรฐานความปลอดภัย</Sub>
        <Sub title="ข้อมูลที่อยู่จัดส่ง">ชื่อผู้รับ เบอร์โทรศัพท์ ที่อยู่ จังหวัด อำเภอ ตำบล รหัสไปรษณีย์ และพิกัด GPS หากท่านเลือกใช้</Sub>
        <Sub title="ข้อมูลสัดส่วนร่างกาย">เพื่อใช้ในการออกแบบเสื้อผ้าและ AI Try-On เราอาจเก็บส่วนสูง น้ำหนัก รอบอก รอบเอว รอบสะโพก ความกว้างไหล่ ความยาวแขน ความยาวชุด และหมายเหตุเพิ่มเติม โดยใช้เฉพาะเพื่อการออกแบบและผลิตเสื้อผ้าเท่านั้น</Sub>
        <Sub title="รูปภาพของผู้ใช้งาน">รูปโปรไฟล์ รูปสำหรับ AI Try-On รูปตัวอย่างเสื้อผ้า รูปผ้า และผลงาน (Portfolio) — รูปภาพทั้งหมดยังคงเป็นทรัพย์สินของท่าน</Sub>
        <Sub title="ข้อมูลผ้าและการออกแบบ">รูปผ้า ลายผ้า สี พื้นผิว ข้อมูลผ้าท้องถิ่น ผลงานออกแบบ และผลงานที่สร้างจาก AI</Sub>
        <Sub title="ข้อมูลการใช้งานเว็บไซต์">หน้าเว็บที่เข้าชม ระยะเวลาการใช้งาน ประวัติการค้นหา รายการโปรด การกดถูกใจ รีวิว โพสต์ในชุมชน และการแจ้งเตือน</Sub>
        <Sub title="ข้อมูลอุปกรณ์">เบราว์เซอร์ อุปกรณ์ ระบบปฏิบัติการ หมายเลข IP คุกกี้ และตัวระบุอุปกรณ์</Sub>
      </Section>

      <Section id="section-3" number="3" title="วัตถุประสงค์ในการใช้ข้อมูล">
        <p>LAYA นำข้อมูลของท่านไปใช้เพื่อวัตถุประสงค์ดังต่อไปนี้</p>
        <List items={["ให้บริการ Marketplace และสร้าง/ยืนยันตัวตนบัญชีผู้ใช้", "ดำเนินการสั่งซื้อ ติดต่อผู้ใช้งาน และจัดส่งสินค้า", "ประมวลผลการชำระเงิน", "ให้บริการ AI Try-On และสร้างแบบเสื้อผ้า", "แนะนำสินค้า ร้านค้า และชุมชนที่เกี่ยวข้อง", "วิเคราะห์คุณภาพบริการและป้องกันการทุจริต/การโจมตีระบบ", "ปรับปรุงแพลตฟอร์มและพัฒนาประสบการณ์ผู้ใช้งาน"]} />
      </Section>

      <Section id="section-4" number="4" title="การใช้ AI">
        <p>LAYA ใช้เทคโนโลยี AI เพื่อสนับสนุนบริการต่าง ๆ เช่น การแนะนำแฟชั่น (AI Fashion Recommendation), AI Try-On, การสร้างลายด้วย AI (AI Design Generation), การค้นหา, การจับคู่นักออกแบบและผ้า ไปจนถึงการเขียนคำอธิบายสินค้า</p>
        <Note>AI เป็นเพียงเครื่องมือช่วยสนับสนุนการตัดสินใจ ผลลัพธ์อาจมีความคลาดเคลื่อน ผู้ใช้งานควรตรวจสอบก่อนใช้งานจริง</Note>
      </Section>

      <Section id="section-5" number="5" title="การใช้รูปภาพสำหรับ AI Try-On">
        <p>ท่านสามารถอัปโหลดรูปภาพของตนเองเพื่อใช้บริการ Virtual Try-On โดยรูปภาพจะถูกใช้เพื่อจำลองการสวมใส่เสื้อผ้า สร้างภาพตัวอย่าง แสดงผลการออกแบบ และบันทึกผลลัพธ์เท่านั้น</p>
        <Note>LAYA จะไม่เผยแพร่รูปภาพดังกล่าวโดยไม่ได้รับความยินยอมจากท่าน</Note>
      </Section>

      <Section id="section-6" number="6" title="การนำข้อมูลไปใช้พัฒนา AI">
        <p>LAYA จะไม่นำรูปภาพผู้ใช้งาน รูป AI Try-On ข้อมูลสัดส่วนร่างกาย ผลงานออกแบบของลูกค้า หรือข้อมูลส่วนบุคคลอื่นไปใช้ฝึกโมเดล AI เพื่อการพาณิชย์โดยไม่ได้รับความยินยอม</p>
        <Note>หากในอนาคตมีการนำข้อมูลไปใช้เพื่อพัฒนา AI จะมีการแจ้งและขอความยินยอมก่อนทุกครั้ง</Note>
      </Section>

      <Section id="section-7" number="7" title="Cookies">
        <p>LAYA ใช้คุกกี้เพื่อจดจำการเข้าสู่ระบบ ภาษา และการตั้งค่าของท่าน รวมถึงวิเคราะห์การใช้งานเพื่อปรับปรุงเว็บไซต์และวัดประสิทธิภาพระบบ</p>
        <Note>ท่านสามารถปิดคุกกี้ผ่านเบราว์เซอร์ได้ตลอดเวลา</Note>
      </Section>

      <Section id="section-8" number="8" title="การเปิดเผยข้อมูล">
        <p>LAYA อาจเปิดเผยข้อมูลเท่าที่จำเป็นแก่ร้านค้า นักออกแบบ ช่างทอ ผู้ผลิต บริษัทขนส่ง ผู้ให้บริการ Payment Gateway, Cloud, Email และ Authentication รวมถึงผู้ให้บริการ Analytics และหน่วยงานของรัฐตามที่กฎหมายกำหนด</p>
        <Note type="highlight">LAYA จะไม่ขายข้อมูลส่วนบุคคลของผู้ใช้งานให้บุคคลภายนอก</Note>
      </Section>

      <Section id="section-9" number="9" title="การแบ่งปันข้อมูลกับร้านค้า">
        <p>เมื่อท่านทำการสั่งซื้อ ชื่อผู้รับ เบอร์โทรศัพท์ ที่อยู่จัดส่ง และรายละเอียดคำสั่งซื้อ จะถูกเปิดเผยแก่ร้านค้าเท่าที่จำเป็น เพื่อให้ร้านค้าดำเนินการผลิตและจัดส่งสินค้า</p>
      </Section>

      <Section id="section-10" number="10" title="ข้อมูลที่เผยแพร่สู่สาธารณะ">
        <p>ข้อมูลที่ท่านเลือกเผยแพร่เอง เช่น โพสต์ในชุมชน รีวิว ผลงาน (Portfolio) รูปภาพ หน้าร้านค้า หรือผลงานออกแบบ อาจถูกมองเห็นโดยผู้ใช้งานรายอื่น ท่านจึงควรหลีกเลี่ยงการเผยแพร่ข้อมูลส่วนบุคคลที่ไม่จำเป็น</p>
      </Section>

      <Section id="section-11" number="11" title="การรักษาความปลอดภัย">
        <p>LAYA ใช้มาตรฐานความปลอดภัยหลายชั้น ได้แก่ การเข้ารหัส HTTPS/TLS และการเข้ารหัสข้อมูลในฐานข้อมูล (Encryption at Rest), การควบคุมสิทธิ์การเข้าถึงตามบทบาท (RBAC), บันทึกการตรวจสอบและติดตามกิจกรรม, การจำกัดอัตราการร้องขอ, ไฟร์วอลล์, ระบบสำรองข้อมูลและกู้คืนระบบ, รวมถึงการยืนยันตัวตนหลายขั้นตอนสำหรับผู้ดูแลระบบ</p>
        <Note>แม้เราจะใช้มาตรการที่เหมาะสม แต่ไม่มีระบบใดสามารถรับประกันความปลอดภัยได้ 100%</Note>
      </Section>

      <Section id="section-12" number="12" title="ระยะเวลาการเก็บข้อมูล">
        <p>เราจะเก็บข้อมูลเท่าที่จำเป็นสำหรับการให้บริการ การดำเนินธุรกรรม การปฏิบัติตามกฎหมาย การตรวจสอบย้อนหลัง และการป้องกันการทุจริต เมื่อหมดความจำเป็น ข้อมูลจะถูกลบหรือทำให้ไม่สามารถระบุตัวตนได้</p>
      </Section>

      <Section id="section-13" number="13" title="สิทธิของเจ้าของข้อมูล">
        <p>ภายใต้กฎหมาย PDPA ท่านมีสิทธิดังต่อไปนี้</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
          {RIGHTS_TH.map((right, i) => {
            const Icon = RIGHTS_ICONS[i];
            return (
              <div key={right} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0", fontFamily: FONT, fontSize: "13.5px", color: "#1B2A4A" }}>
                <Icon sx={{ fontSize: 16, color: "#C5A55A", flexShrink: 0 }} />
                {right}
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="section-14" number="14" title="การลบบัญชี">
        <p>ท่านสามารถขอลบบัญชีได้ทุกเมื่อ เมื่อได้รับคำขอ LAYA จะลบบัญชี ลบข้อมูลส่วนบุคคล และทำให้ข้อมูลไม่สามารถระบุตัวตนได้</p>
        <Note>ข้อมูลบางส่วนอาจถูกเก็บไว้ตามที่กฎหมายกำหนด เช่น ข้อมูลธุรกรรม ประวัติการชำระเงิน และเอกสารทางบัญชี</Note>
      </Section>

      <Section id="section-15" number="15" title="การโอนข้อมูลไปต่างประเทศ">
        <p>บริการบางส่วนของ LAYA อาจใช้ Cloud Infrastructure หรือผู้ให้บริการที่ตั้งอยู่ในต่างประเทศ LAYA จะดำเนินการให้เป็นไปตามมาตรฐานด้านความปลอดภัยและกฎหมายที่เกี่ยวข้อง</p>
      </Section>

      <Section id="section-16" number="16" title="ผู้เยาว์">
        <p>บริการของ LAYA ไม่ได้ออกแบบสำหรับผู้มีอายุต่ำกว่า 13 ปี</p>
        <Note>หากพบว่ามีการเก็บข้อมูลของผู้เยาว์โดยไม่ได้รับความยินยอมจากผู้ปกครอง เราจะดำเนินการลบข้อมูลโดยเร็วที่สุด</Note>
      </Section>

      <Section id="section-17" number="17" title="การเปลี่ยนแปลงนโยบาย">
        <p>LAYA อาจปรับปรุง Privacy Policy เป็นครั้งคราว เมื่อมีการเปลี่ยนแปลงที่สำคัญ เราจะแจ้งผ่านเว็บไซต์หรือช่องทางที่เหมาะสม</p>
      </Section>

      <Section id="section-18" number="18" title="ติดต่อเรา">
        <ContactCard labels={{ website: "Website", privacy: "Privacy", support: "Support", business: "Business" }} />
      </Section>

      <Section id="section-19" number="19" title="กฎหมายที่ใช้บังคับ">
        <p>นโยบายฉบับนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย รวมถึง</p>
        <List items={["พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)", "พระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์", "กฎหมายคุ้มครองผู้บริโภค", "กฎหมายอื่นที่เกี่ยวข้อง"]} />
      </Section>
    </>
  );
}

/* ── English content ── */
function EnSections() {
  return (
    <>
      <Section id="section-1" number="1" title="Introduction">
        <p>
          LAYA (&ldquo;LAYA&rdquo;, &ldquo;we&rdquo;, &ldquo;the company&rdquo;, &ldquo;the platform&rdquo;) is a Fashion Tech Marketplace that connects consumers, designers, weavers, producer communities, and Thai fabric businesses through digital technology and artificial intelligence (AI). We take the privacy of every user seriously and are committed to protecting personal data under <strong>Thailand&rsquo;s Personal Data Protection Act B.E. 2562 (2019) (PDPA)</strong> and other applicable laws. By using LAYA&rsquo;s website, application, or services, you acknowledge that you have read, understood, and accepted this policy.
        </p>
      </Section>

      <Section id="section-2" number="2" title="Information We Collect">
        <p>To provide our services fully, LAYA may collect the following types of information about you.</p>
        <Sub title="Account information">Name, surname, display name, email, phone number, profile photo, country, language, registration date, and last login time.</Sub>
        <Sub title="Login information">You may sign in via email, Google, Apple (where supported), or other OAuth providers — LAYA only receives the information you authorize us to access.</Sub>
        <Sub title="Shop and producer information">For designer shops or producer communities, we may collect shop name, description, address, province, phone number, Line ID, storefront photo, cover photo, shop location, review ratings, service type, and areas of expertise.</Sub>
        <Sub title="Order information">Order history, product details, production and tailoring history, order status, product price, shipping cost, payment method, tracking number, and status change history.</Sub>
        <Sub title="Payment information">Payment amount, transaction reference number, payment status and method — LAYA does not directly store credit card numbers or other sensitive financial data. All transactions are processed through payment gateway providers that meet security standards.</Sub>
        <Sub title="Shipping address information">Recipient name, phone number, address, province, district, sub-district, postal code, and GPS coordinates if you choose to provide them.</Sub>
        <Sub title="Body measurement information">For clothing design and AI Try-On, we may collect height, weight, chest, waist, hip measurements, shoulder width, arm length, garment length, and additional notes — used solely for garment design and production.</Sub>
        <Sub title="User-uploaded images">Profile photos, AI Try-On photos, clothing sample photos, fabric photos, and portfolio work — all images remain your property.</Sub>
        <Sub title="Fabric and design data">Fabric photos, patterns, colors, textures, local fabric information, design work, and AI-generated work.</Sub>
        <Sub title="Website usage data">Pages visited, time spent, search history, favorites, likes, reviews, community posts, and notifications.</Sub>
        <Sub title="Device information">Browser, device, operating system, IP address, cookies, and device identifiers.</Sub>
      </Section>

      <Section id="section-3" number="3" title="Purpose of Use">
        <p>LAYA uses your information for the following purposes.</p>
        <List items={["To provide the Marketplace and create/verify user accounts", "To process orders, communicate with users, and deliver products", "To process payments", "To provide AI Try-On and generate clothing designs", "To recommend relevant products, shops, and communities", "To analyze service quality and prevent fraud/system attacks", "To improve the platform and enhance the user experience"]} />
      </Section>

      <Section id="section-4" number="4" title="Use of AI">
        <p>LAYA uses AI technology to support various services, such as AI fashion recommendations, AI Try-On, AI design generation, search, matching designers with fabrics, and generating product descriptions.</p>
        <Note>AI is only a decision-support tool. Results may be inaccurate — users should verify outputs before relying on them.</Note>
      </Section>

      <Section id="section-5" number="5" title="Use of Images for AI Try-On">
        <p>You may upload your own photos to use the Virtual Try-On service. Photos are used solely to simulate wearing garments, generate preview images, display design results, and save outcomes.</p>
        <Note>LAYA will not publish such images without your consent.</Note>
      </Section>

      <Section id="section-6" number="6" title="Data Used to Develop AI">
        <p>LAYA will not use user photos, AI Try-On images, body measurement data, customer design work, or other personal data to commercially train AI models without consent.</p>
        <Note>If data is used to develop AI in the future, we will always notify you and request consent beforehand.</Note>
      </Section>

      <Section id="section-7" number="7" title="Cookies">
        <p>LAYA uses cookies to remember your login, language, and settings, and to analyze usage in order to improve the website and measure system performance.</p>
        <Note>You can disable cookies through your browser at any time.</Note>
      </Section>

      <Section id="section-8" number="8" title="Disclosure of Information">
        <p>LAYA may disclose information as necessary to shops, designers, weavers, producers, shipping companies, payment gateway, cloud, email, and authentication providers, as well as analytics providers and government agencies as required by law.</p>
        <Note type="highlight">LAYA will never sell users&rsquo; personal data to third parties.</Note>
      </Section>

      <Section id="section-9" number="9" title="Sharing Information With Shops">
        <p>When you place an order, the recipient&rsquo;s name, phone number, shipping address, and order details are disclosed to the shop only to the extent necessary for the shop to produce and ship the product.</p>
      </Section>

      <Section id="section-10" number="10" title="Publicly Available Information">
        <p>Information you choose to publish yourself — such as community posts, reviews, portfolio work, images, shop pages, or design work — may be visible to other users. You should avoid sharing personal information that isn&rsquo;t necessary.</p>
      </Section>

      <Section id="section-11" number="11" title="Security">
        <p>LAYA employs multiple layers of security, including HTTPS/TLS encryption and encryption at rest, role-based access control (RBAC), audit logs and activity monitoring, rate limiting, firewalls, backup and disaster-recovery systems, and multi-factor authentication for administrators.</p>
        <Note>While we take appropriate measures, no system can guarantee 100% security.</Note>
      </Section>

      <Section id="section-12" number="12" title="Data Retention Period">
        <p>We retain data only as long as necessary to provide services, process transactions, comply with the law, conduct audits, and prevent fraud. Once no longer needed, data is deleted or anonymized.</p>
      </Section>

      <Section id="section-13" number="13" title="Your Rights">
        <p>Under the PDPA, you have the following rights.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
          {RIGHTS_EN.map((right, i) => {
            const Icon = RIGHTS_ICONS[i];
            return (
              <div key={right} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0", fontFamily: FONT, fontSize: "13.5px", color: "#1B2A4A" }}>
                <Icon sx={{ fontSize: 16, color: "#C5A55A", flexShrink: 0 }} />
                {right}
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="section-14" number="14" title="Account Deletion">
        <p>You may request account deletion at any time. Upon request, LAYA will delete the account, delete personal data, and render remaining data unidentifiable.</p>
        <Note>Some data may be retained as required by law, such as transaction records, payment history, and accounting documents.</Note>
      </Section>

      <Section id="section-15" number="15" title="International Data Transfer">
        <p>Some LAYA services may use cloud infrastructure or providers located outside Thailand. LAYA ensures such transfers comply with applicable security standards and laws.</p>
      </Section>

      <Section id="section-16" number="16" title="Minors">
        <p>LAYA&rsquo;s services are not designed for individuals under 13 years of age.</p>
        <Note>If we discover that a minor&rsquo;s data has been collected without parental consent, we will delete it as quickly as possible.</Note>
      </Section>

      <Section id="section-17" number="17" title="Policy Changes">
        <p>LAYA may update this Privacy Policy from time to time. For material changes, we will notify you via the website or another appropriate channel.</p>
      </Section>

      <Section id="section-18" number="18" title="Contact Us">
        <ContactCard labels={{ website: "Website", privacy: "Privacy", support: "Support", business: "Business" }} />
      </Section>

      <Section id="section-19" number="19" title="Governing Law">
        <p>This policy is governed by the laws of the Kingdom of Thailand, including:</p>
        <List items={["The Personal Data Protection Act B.E. 2562 (2019) (PDPA)", "The Electronic Transactions Act", "Consumer protection law", "Other applicable laws"]} />
      </Section>
    </>
  );
}

export default function PrivacyPolicyContent() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const toc = isEn ? TOC_EN : TOC_TH;

  return (
    <>
      <style>{`
        .pp-toc-link { color: #4A5468; transition: background 0.15s, color 0.15s; }
        .pp-toc-link:hover { background: rgba(197,165,90,0.08); color: #1B2A4A; }
        .pp-contact-row { transition: background 0.15s; }
        .pp-contact-row:hover { background: rgba(27,42,74,0.04); }
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
            background: "linear-gradient(135deg, #1B2A4A 0%, #0F1A30 60%, #1B2A4A 100%)",
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
              {isEn ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
            </h1>
            <p style={{ margin: "0 0 18px", fontSize: "13px", color: "rgba(255,255,255,0.55)", fontFamily: FONT }}>
              {isEn ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy"}
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
                  href={`#section-${item.n}`}
                  className="pp-toc-link"
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

          {/* Content Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {isEn ? <EnSections /> : <ThSections />}
          </div>
        </div>
      </main>
    </>
  );
}
