"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SectionHeader from "@/components/home/SectionHeader";
import ThailandFabricMap from "@/components/community/ThailandFabricMap";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const bodyText = {
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 300,
  fontSize: { xs: "0.92rem", md: "1rem" },
  color: "#4A5468",
  lineHeight: 1.9,
};

const eyebrow = {
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 600,
  fontSize: "0.6rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase" as const,
  color: "#C5A55A",
};

/* ── Bilingual content ── */

const initiativesTh = [
  { title: "การปรับปรุงมาตรฐานผ้า", body: "ทรงแนะนำให้ชาวบ้านปรับความกว้างของหน้าผ้าไหมให้เป็นมาตรฐานประมาณ 1 เมตร และทอผ้าไหมมัดหมี่ยาว 5 เมตร ควบคู่กับผ้าพื้นอีก 2 เมตร เพื่อความสะดวกในการตัดเย็บและคงความงดงาม" },
  { title: "การอนุรักษ์และสร้างสรรค์ลวดลาย", body: "ทรงให้ความสำคัญกับการอนุรักษ์ลวดลายผ้าไหมโบราณที่มีลักษณะเฉพาะของแต่ละท้องถิ่น พร้อมทั้งส่งเสริมให้ช่างทอสร้างสรรค์ลวดลายใหม่ๆ โดยทดลองใช้สีสันที่หลากหลายและทันสมัยมากขึ้น" },
  { title: "การส่งเสริมการเลี้ยงไหมพื้นบ้าน", body: "ทรงสนับสนุนให้ชาวบ้านเลี้ยงไหมพันธุ์ไทยพื้นบ้าน เช่น นางสิ่ว วนาสวรรค์ ทับทิมสยาม 06 และพญาราม ซึ่งเป็นไหมที่มีคุณภาพดี" },
  { title: "การพัฒนาผ้าแพรวา", body: "ทรงแนะนำให้ขยายหน้าผ้าแพรวาให้กว้างขึ้นเป็น 1 เมตร และทอลวดลายให้มีความละเอียดมากขึ้นโดยใช้ไหมน้อย" },
  { title: "การจัดตั้งมูลนิธิส่งเสริมศิลปาชีพ", body: "ในปี พ.ศ. 2519 ทรงจัดตั้งมูลนิธิส่งเสริมศิลปาชีพ ในสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ เพื่อเป็นศูนย์กลางในการส่งเสริมและพัฒนาอาชีพหัตถกรรม รวมถึงผ้าไหมไทย" },
  { title: "การเป็นแบบอย่าง", body: "พระองค์ทรงฉลองพระองค์ด้วยผ้าไหมไทยในทุกโอกาส เพื่อเป็นแบบอย่างและเผยแพร่ความงดงามของผ้าไหมไทยสู่สายตาชาวโลก" },
];

const initiativesEn = [
  { title: "Standardizing Fabric Width", body: "She recommended villagers standardize silk fabric width to approximately 1 metre, and weave mudmee silk in 5-metre lengths alongside 2 metres of plain fabric, for ease of tailoring while preserving its beauty." },
  { title: "Preserving and Innovating Patterns", body: "She placed great importance on preserving ancient silk patterns unique to each locality, while also encouraging weavers to create new designs by experimenting with a wider, more contemporary range of colours." },
  { title: "Promoting Native Silkworm Farming", body: "She supported villagers in raising native Thai silkworm breeds such as Nang Siew, Wanasawan, Tubtim Siam 06, and Phaya Ram — all known for producing high-quality silk." },
  { title: "Developing Praewa Cloth", body: "She recommended widening praewa cloth to 1 metre and weaving its patterns with greater intricacy while using less silk thread." },
  { title: "Founding the SUPPORT Foundation", body: "In 1976, she founded the Foundation for the Promotion of Supplementary Occupations and Related Techniques (SUPPORT), under the patronage of Her Majesty Queen Sirikit, as a hub for promoting and developing handicraft occupations, including Thai silk." },
  { title: "Leading by Example", body: "Her Majesty wore Thai silk on every occasion, setting an example and showcasing the beauty of Thai silk to the eyes of the world." },
];

const peacocksTh = [
  { name: "นกยูงสีทอง", en: "Royal Thai Silk", desc: "ผ้าไหมไทยแท้ระดับพรีเมียม ผลิตด้วยเส้นไหมและกรรมวิธีดั้งเดิมตามภูมิปัญญาพื้นบ้าน", detail: "ใช้เส้นไหมพันธุ์ไทยพื้นบ้านเป็นทั้งเส้นพุ่งและเส้นยืน สาวด้วยมือผ่านพวงสาวลงภาชนะ ทอด้วยกี่ทอมือแบบพื้นบ้านชนิดพุ่งกระสวยด้วยมือ ย้อมด้วยสีธรรมชาติหรือสีเคมีที่ไม่ทำลายสิ่งแวดล้อม และต้องผลิตในประเทศไทยเท่านั้น", color: "#C5A55A", glow: "rgba(197,165,90,0.35)", image: "/heritage/badges/peacock-gold.webp" },
  { name: "นกยูงสีเงิน", en: "Classic Thai Silk", desc: "ผ้าไหมไทยแท้ที่ทอขึ้นตามภูมิปัญญาพื้นบ้านผสมผสานกับการใช้เครื่องมือในบางขั้นตอน", detail: "ใช้เส้นไหมพันธุ์ไทยพื้นบ้านหรือพันธุ์ไทยปรับปรุงเป็นเส้นพุ่งหรือเส้นยืน เส้นไหมต้องสาวด้วยมือหรือสาวด้วยอุปกรณ์ที่ใช้มอเตอร์ไม่เกิน 5 แรงม้า ทอด้วยกี่ทอมือชนิดพุ่งกระสวยด้วยมือหรือกี่กระตุกก็ได้ และต้องผลิตในประเทศไทยเท่านั้น", color: "#9CA3AF", glow: "rgba(156,163,175,0.32)", image: "/heritage/badges/peacock-silver.webp" },
  { name: "นกยูงสีน้ำเงิน", en: "Thai Silk", desc: "ผ้าไหมไทยแท้ที่ผลิตด้วยภูมิปัญญาของไทยแบบประยุกต์ ใช้เทคโนโลยีการผลิตให้เข้ากับสมัยนิยมและเชิงธุรกิจ", detail: "ใช้เส้นไหมแท้เป็นเส้นพุ่งและเส้นยืน ย้อมด้วยสีธรรมชาติหรือสีเคมีที่ไม่ทำลายสิ่งแวดล้อม ทอด้วยกี่แบบใดก็ได้ และต้องผลิตในประเทศไทยเท่านั้น", color: "#1B2A4A", glow: "rgba(27,42,74,0.32)", image: "/heritage/badges/peacock-blue.webp" },
  { name: "นกยูงสีเขียว", en: "Thai Silk Blend", desc: "ผ้าไหมไทยแท้ที่ผลิตด้วยกระบวนการและเทคโนโลยีสมัยใหม่ โดยใช้เส้นไหมแท้ผสมผสานกับเส้นใยอื่นจากธรรมชาติหรือเส้นใยสังเคราะห์", detail: "ใช้เส้นไหมแท้เป็นส่วนประกอบหลัก มีเส้นใยอื่นเป็นส่วนประกอบรอง ต้องระบุส่วนประกอบของเส้นใยอื่นให้ชัดเจน ทอด้วยกี่แบบใดก็ได้ ย้อมด้วยสีธรรมชาติหรือสีเคมีที่ไม่ทำลายสิ่งแวดล้อม และต้องผลิตในประเทศไทยเท่านั้น", color: "#0F766E", glow: "rgba(15,118,110,0.32)", image: "/heritage/badges/peacock-green.webp" },
];

const peacocksEn = [
  { name: "นกยูงสีทอง", en: "Royal Thai Silk", desc: "Premium authentic Thai silk, produced with traditional silk thread and methods rooted in local wisdom.", detail: "Uses native Thai silkworm thread for both weft and warp, hand-reeled through a basin. Woven on a traditional hand loom with a hand-thrown shuttle, dyed with natural or environmentally safe chemical dyes, and must be produced entirely in Thailand.", color: "#C5A55A", glow: "rgba(197,165,90,0.35)", image: "/heritage/badges/peacock-gold.webp" },
  { name: "นกยูงสีเงิน", en: "Classic Thai Silk", desc: "Authentic Thai silk woven according to local wisdom, combined with the use of tools at certain stages.", detail: "Uses native or improved Thai silkworm thread as weft or warp. Thread must be hand-reeled or reeled using a motorized device of no more than 5 horsepower. Woven on a hand loom with hand-thrown or foot-treadle shuttle, and must be produced entirely in Thailand.", color: "#9CA3AF", glow: "rgba(156,163,175,0.32)", image: "/heritage/badges/peacock-silver.webp" },
  { name: "นกยูงสีน้ำเงิน", en: "Thai Silk", desc: "Authentic Thai silk produced with applied Thai wisdom, using production technology suited to modern trends and commercial scale.", detail: "Uses genuine silk thread as weft and warp, dyed with natural or environmentally safe chemical dyes, woven on any type of loom, and must be produced entirely in Thailand.", color: "#1B2A4A", glow: "rgba(27,42,74,0.32)", image: "/heritage/badges/peacock-blue.webp" },
  { name: "นกยูงสีเขียว", en: "Thai Silk Blend", desc: "Authentic Thai silk produced with modern processes and technology, using genuine silk thread blended with other natural or synthetic fibres.", detail: "Genuine silk thread forms the main component, with other fibres as a secondary component that must be clearly disclosed. Woven on any type of loom, dyed with natural or environmentally safe chemical dyes, and must be produced entirely in Thailand.", color: "#0F766E", glow: "rgba(15,118,110,0.32)", image: "/heritage/badges/peacock-green.webp" },
];

const references = [
  { label: "พระมารดาแห่งไหมไทย | Privy Purse Bureau", href: "https://privypurse.or.th/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B8%A3%E0%B8%94%E0%B8%B2%E0%B9%81%E0%B8%AB%E0%B9%88%E0%B8%87%E0%B9%84%E0%B8%AB%E0%B8%A1%E0%B9%84%E0%B8%97%E0%B8%A2" },
  { label: "12 ข้อส่งเสริมผ้าไทยของสมเด็จพระพันปีหลวง | thaitextile.org", href: "https://www.thaitextile.org/th/insign/detail.1872.1.0.html" },
  { label: "พระผู้ทรงยกระดับคุณค่าแห่งภูมิปัญญา 'ผ้าไทย' | Thai PBS", href: "https://theactive.thaipbs.or.th/news/culture-20251026" },
];

const TH = {
  heroAlt: "นิทรรศการฉลองพระองค์ผ้าไหมไทย",
  heroSubtitle: "เรื่องราวเบื้องหลังผ้าไหมไทย มรดกแห่งภูมิปัญญาที่ถักทอด้วยแรงศรัทธา",
  introEyebrow: "บทนำ",
  introQuote: "“ผ้าไหมไทยเป็นมากกว่าผืนผ้า แต่คือเรื่องราวของช่างทอที่สืบทอดภูมิปัญญาผ่านหลายชั่วอายุคน”",
  introBody: "จากเส้นใยธรรมชาติ สีย้อมจากพืชพรรณ สู่ลวดลายที่บอกเล่าตัวตนของแต่ละชุมชน เป็นงานหัตถศิลป์ที่สะท้อนถึงวัฒนธรรมอันงดงามและความประณีตบรรจงของคนไทย",
  royalDutyEyebrow: "พระราชกรณียกิจ",
  royalDutyTitle: "สมเด็จพระพันปีหลวง กับผ้าไหมไทย",
  royalDutySubtitle: "ผู้ทรงฟื้นฟูและส่งเสริมผ้าไหมไทยให้กลับมามีชีวิตชีวาอีกครั้ง",
  royalDutyBody: "สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง ทรงมีพระมหากรุณาธิคุณอย่างใหญ่หลวงในการอนุรักษ์ ฟื้นฟู และส่งเสริมผ้าไหมไทยให้กลับมามีชีวิตชีวาอีกครั้ง พระองค์ทรงตระหนักถึงคุณค่าของผ้าไหมไทยในฐานะงานหัตถศิลป์พื้นบ้านที่งดงามและมีศักยภาพในการสร้างรายได้ให้กับประชาชน โดยเฉพาะอย่างยิ่งในพื้นที่ชนบท",
  queenInspectsAlt: "สมเด็จพระพันปีหลวงทรงทอดพระเนตรผ้าไหม",
  originTitle: "จุดเริ่มต้นแห่งแรงบันดาลใจ",
  originBody: "ในปี พ.ศ. 2498 พระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร และสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง ได้เสด็จพระราชดำเนินเยี่ยมราษฎรในภาคตะวันออกเฉียงเหนือ พระองค์ทรงทอดพระเนตรเห็นสตรีชาวบ้านนุ่งผ้าซิ่นไหมที่งดงาม จึงทรงประทับใจในความงามของผ้าไหมและเล็งเห็นถึงศักยภาพในการพัฒนาเป็นอาชีพเสริม",
  weavingHandsAlt: "การทอผ้าไหมมัดหมี่",
  initiativesEyebrow: "พระราชดำริ",
  initiativesTitle: "โครงการส่งเสริมและพัฒนา",
  peacockBadgeYear: "พระราชทาน พ.ศ. 2550",
  peacockEyebrow: "สัญลักษณ์แห่งคุณภาพ",
  peacockTitle: "ตรานกยูงพระราชทาน",
  peacockBody: "ในปี พ.ศ. 2550 พระองค์ได้พระราชทานสัญลักษณ์นกยูงไทยให้เป็นเครื่องหมายรับรองมาตรฐานคุณภาพผลิตภัณฑ์ผ้าไหมไทย 4 ชนิด เพื่อสร้างความเชื่อมั่นและยกระดับผ้าไหมไทยสู่สากล",
  standardFull: "มาตรฐานฉบับเต็ม",
  standardLess: "ย่อรายละเอียด",
  peacockBadgeAlt: (name: string, en: string) => `ตรา${name} (${en})`,
  praewaAlt: "ผ้าแพรวา ผืนผ้าที่พระองค์ทรงพัฒนาให้กว้างขึ้นและละเอียดขึ้น",
  praewaCaption: "ผ้าแพรวา — ราชินีแห่งไหมไทย พัฒนาโดยขยายหน้าผ้าให้กว้างขึ้นและทอลวดลายให้ละเอียดขึ้นโดยใช้ไหมน้อย",
  mapEyebrow: "ทั่วแผ่นดินไทย",
  mapTitle: "แผนที่ลายผ้าประจำจังหวัด",
  mapSubtitle: "สำรวจเรื่องราวลายผ้าเอกลักษณ์ 77 จังหวัด",
  legacyEyebrow: "ผลกระทบและมรดก",
  legacyTitle: "มรดกที่สืบทอดจากรุ่นสู่รุ่น",
  legacyBody: "พระราชกรณียกิจของสมเด็จพระพันปีหลวงไม่เพียงแต่ช่วยฟื้นฟูและอนุรักษ์ผ้าไหมไทยให้คงอยู่คู่แผ่นดิน แต่ยังช่วยสร้างอาชีพ สร้างรายได้ และยกระดับคุณภาพชีวิตของประชาชนในชนบทได้อย่างยั่งยืน ผ้าไหมไทยกลายเป็นที่รู้จักและยอมรับในระดับสากล สร้างความภาคภูมิใจให้กับคนไทย และเป็นมรดกทางวัฒนธรรมอันล้ำค่าที่สืบทอดจากรุ่นสู่รุ่น",
  heritageExhibitAlt: "นิทรรศการมรดกผ้าไหมไทย",
  legacySplitAlt: "แรงบันดาลใจจากอดีตสู่ปัจจุบัน",
  ctaEyebrow: "สานต่อภูมิปัญญา",
  ctaTitle: "เลือกผ้าไหมไทยแท้จากชุมชนช่างทอทั่วประเทศ",
  ctaButton: "สำรวจชุมชนช่างทอ",
  referencesEyebrow: "อ้างอิง",
};

const EN = {
  heroAlt: "Exhibition of Thai silk royal gowns",
  heroSubtitle: "The story behind Thai silk — a heritage of wisdom woven with devotion",
  introEyebrow: "Introduction",
  introQuote: "“Thai silk is more than fabric — it is the story of weavers who have carried wisdom forward across generations.”",
  introBody: "From natural fibres and plant-based dyes to patterns that speak to each community's identity, this is a craft that reflects the beauty of Thai culture and the meticulous care of its people.",
  royalDutyEyebrow: "Royal Duties",
  royalDutyTitle: "Her Majesty the Queen Mother and Thai Silk",
  royalDutySubtitle: "The one who revived and championed Thai silk back to life",
  royalDutyBody: "Her Majesty Queen Sirikit, the Queen Mother, showed immense grace in preserving, reviving, and promoting Thai silk back to vibrant life. She recognized the value of Thai silk as a beautiful folk craft with the potential to generate income for the people, particularly in rural areas.",
  queenInspectsAlt: "The Queen Mother inspecting silk fabric",
  originTitle: "The Beginning of an Inspiration",
  originBody: "In 1955, His Majesty King Bhumibol Adulyadej the Great and Her Majesty Queen Sirikit, the Queen Mother, made a royal visit to the people of Northeastern Thailand. There, Her Majesty saw village women wearing beautiful silk sarongs, and was so moved by the beauty of the silk that she recognized its potential to become a supplementary occupation for the people.",
  weavingHandsAlt: "Weaving mudmee silk by hand",
  initiativesEyebrow: "Royal Initiatives",
  initiativesTitle: "Promotion and Development Projects",
  peacockBadgeYear: "Royally Bestowed 2007",
  peacockEyebrow: "A Symbol of Quality",
  peacockTitle: "The Royal Peacock Mark",
  peacockBody: "In 2007, Her Majesty bestowed the Thai Peacock emblem as a quality-certification mark for four types of Thai silk products, building confidence and elevating Thai silk onto the world stage.",
  standardFull: "Full standard",
  standardLess: "Show less",
  peacockBadgeAlt: (name: string, en: string) => `${en} emblem (${name})`,
  praewaAlt: "Praewa cloth, widened and refined under her patronage",
  praewaCaption: "Praewa cloth — the queen of Thai silk, developed by widening the fabric and weaving finer patterns using less silk thread",
  mapEyebrow: "Across the Land of Thailand",
  mapTitle: "Provincial Fabric Pattern Map",
  mapSubtitle: "Explore the signature fabric stories of all 77 provinces",
  legacyEyebrow: "Impact and Legacy",
  legacyTitle: "A Legacy Carried From Generation to Generation",
  legacyBody: "The Queen Mother's royal duties not only helped revive and preserve Thai silk for the nation, but also created livelihoods, generated income, and sustainably raised the quality of life for people in rural areas. Thai silk became known and celebrated internationally, a source of pride for the Thai people, and a priceless cultural heritage carried from generation to generation.",
  heritageExhibitAlt: "Exhibition of Thai silk heritage",
  legacySplitAlt: "Inspiration from the past carried into the present",
  ctaEyebrow: "Carrying the Wisdom Forward",
  ctaTitle: "Choose Authentic Thai Silk From Weaving Communities Nationwide",
  ctaButton: "Explore Weaving Communities",
  referencesEyebrow: "References",
};

function EditorialImage({
  src,
  alt,
  ratio = "4 / 3",
}: {
  src: string;
  alt: string;
  ratio?: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 10px 32px rgba(27,42,74,0.1)",
      }}
    >
      <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 50vw" />
    </Box>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" as const, delay: i * 0.12 },
  }),
};

function PeacockCard({
  p,
  index,
  isEn,
  labels,
}: {
  p: (typeof peacocksTh)[number];
  index: number;
  isEn: boolean;
  labels: typeof TH;
}) {
  const [open, setOpen] = useState(false);
  const primaryName = isEn ? p.en : p.name;
  const secondaryName = isEn ? p.name : p.en;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -8, scale: 1.025 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      style={{ height: "100%" }}
    >
      <Box
        sx={{
          position: "relative",
          height: "100%",
          bgcolor: "#FFFFFF",
          borderRadius: "20px",
          p: 2.5,
          pt: 2,
          overflow: "hidden",
          border: "1px solid #F0EBE3",
          boxShadow: `0 6px 20px rgba(27,42,74,0.06)`,
          transition: "box-shadow 0.35s ease, border-color 0.35s ease",
          "&:hover": {
            boxShadow: `0 18px 36px -8px ${p.glow}`,
            borderColor: p.color,
          },
          "&:hover .peacock-halo": { opacity: 1, transform: "scale(1.12)" },
          "&:hover .peacock-topbar": { transform: "scaleX(1)" },
        }}
      >
        {/* แถบสีบนสุด */}
        <Box
          className="peacock-topbar"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: p.color,
            transform: "scaleX(0.35)",
            transformOrigin: "left",
            transition: "transform 0.4s ease",
          }}
        />

        {/* ตราสัญลักษณ์ + ออร่าสีเรืองแสง */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5, mt: 1 }}>
          <Box sx={{ position: "relative", width: 92, height: 92 }}>
            <Box
              className="peacock-halo"
              sx={{
                position: "absolute",
                inset: -14,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${p.glow} 0%, rgba(255,255,255,0) 72%)`,
                opacity: 0.7,
                transform: "scale(1)",
                transition: "transform 0.5s ease, opacity 0.5s ease",
              }}
            />
            <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
              <Image src={p.image} alt={labels.peacockBadgeAlt(p.name, p.en)} fill style={{ objectFit: "contain" }} sizes="92px" />
            </Box>
          </Box>
        </Box>

        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", textAlign: "center" }}>
          {primaryName}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 500,
            fontSize: "0.68rem",
            letterSpacing: "0.04em",
            color: p.color,
            textAlign: "center",
            mb: 1,
          }}
        >
          {secondaryName}
        </Typography>
        <Typography sx={{ ...bodyText, fontSize: "0.78rem", lineHeight: 1.7, textAlign: "center" }}>{p.desc}</Typography>

        <Box sx={{ textAlign: "center", mt: 1.5 }}>
          <Box
            component="button"
            onClick={() => setOpen((v) => !v)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.4,
              bgcolor: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: '"Kanit", sans-serif',
              fontSize: "0.7rem",
              fontWeight: 600,
              color: p.color,
              p: 0,
              "&:hover": { opacity: 0.75 },
            }}
          >
            {open ? labels.standardLess : labels.standardFull}
            <ExpandMoreRoundedIcon
              sx={{
                fontSize: 16,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </Box>
        </Box>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <Typography
                sx={{
                  ...bodyText,
                  fontSize: "0.72rem",
                  lineHeight: 1.75,
                  textAlign: "center",
                  mt: 1.25,
                  pt: 1.25,
                  borderTop: "1px dashed #E5DFD6",
                }}
              >
                {p.detail}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}

export default function HeritageStory() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const c = isEn ? EN : TH;
  const initiatives = isEn ? initiativesEn : initiativesTh;
  const peacocks = isEn ? peacocksEn : peacocksTh;

  return (
    <Box sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 6, md: 10 }, px: { xs: 2.5, md: 0 } }}>
      {/* Back */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Link href="/community">
          <IconButton sx={{ color: "#1B2A4A" }}>
            <ArrowBackRoundedIcon />
          </IconButton>
        </Link>
      </Box>

      {/* Hero */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        sx={{
          position: "relative",
          borderRadius: { xs: "22px", md: "28px" },
          overflow: "hidden",
          height: { xs: 280, sm: 360, md: 460 },
          mb: { xs: 4, md: 6 },
        }}
      >
        <Image
          src="/heritage/exhibition-gowns-blue.webp"
          alt={c.heroAlt}
          fill
          priority
          style={{ objectFit: "cover" }}
          sizes="100vw"
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(10,15,30,0.15) 0%, rgba(10,15,30,0.75) 100%)",
          }}
        />
        <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, p: { xs: 3, md: 6 } }}>
          <Typography sx={{ ...eyebrow, color: "#C5A55A", mb: 1.5 }}>The Heritage Collection</Typography>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: { xs: "1.9rem", sm: "2.4rem", md: "3.2rem" },
              color: "#FFFFFF",
              lineHeight: 1.1,
              maxWidth: 720,
            }}
          >
            The Story Behind Thai Silk
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: { xs: "0.85rem", md: "1rem" },
              color: "rgba(255,255,255,0.85)",
              mt: 1.5,
              maxWidth: 560,
            }}
          >
            {c.heroSubtitle}
          </Typography>
        </Box>
      </Box>

      {/* Intro */}
      <Box component={motion.div} {...fadeUp} sx={{ maxWidth: 780, mx: "auto", textAlign: "center", mb: { xs: 5, md: 7 } }}>
        <Typography sx={{ ...eyebrow, mb: 1.5 }}>{c.introEyebrow}</Typography>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: { xs: "1.3rem", md: "1.6rem" },
            color: "#1B2A4A",
            lineHeight: 1.5,
          }}
        >
          {c.introQuote}
        </Typography>
        <Typography sx={{ ...bodyText, mt: 2.5 }}>{c.introBody}</Typography>
      </Box>

      {/* พระราชกรณียกิจ — intro + image */}
      <Box
        component={motion.div}
        {...fadeUp}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 3, md: 6 },
          alignItems: "center",
          mb: { xs: 5, md: 8 },
        }}
      >
        <Box order={{ xs: 2, md: 1 }}>
          <SectionHeader eyebrow={c.royalDutyEyebrow} title={c.royalDutyTitle} subtitle={c.royalDutySubtitle} />
          <Typography sx={bodyText}>{c.royalDutyBody}</Typography>
        </Box>
        <Box order={{ xs: 1, md: 2 }}>
          <EditorialImage src="/heritage/queen-inspects-silk.webp" alt={c.queenInspectsAlt} />
        </Box>
      </Box>

      {/* จุดเริ่มต้นแห่งแรงบันดาลใจ */}
      <Box component={motion.div} {...fadeUp} sx={{ maxWidth: 780, mx: "auto", mb: { xs: 5, md: 8 } }}>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: { xs: "1.3rem", md: "1.6rem" },
            color: "#1B2A4A",
            mb: 2,
          }}
        >
          {c.originTitle}
        </Typography>
        <Typography sx={bodyText}>{c.originBody}</Typography>
      </Box>

      {/* โครงการส่งเสริมและพัฒนา — image + list */}
      <Box
        component={motion.div}
        {...fadeUp}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
          gap: { xs: 3, md: 6 },
          mb: { xs: 5, md: 8 },
        }}
      >
        <Box>
          <EditorialImage src="/heritage/weaving-hands-mudmee.webp" alt={c.weavingHandsAlt} ratio="3 / 4" />
        </Box>
        <Box>
          <SectionHeader eyebrow={c.initiativesEyebrow} title={c.initiativesTitle} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {initiatives.map((item) => (
              <Box key={item.title} sx={{ display: "flex", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#C5A55A",
                    mt: 1,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontFamily: '"Kanit", sans-serif',
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      color: "#1B2A4A",
                      mb: 0.3,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography sx={{ ...bodyText, fontSize: "0.85rem" }}>{item.body}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ตรานกยูงพระราชทาน */}
      <Box
        component={motion.div}
        {...fadeUp}
        sx={{
          position: "relative",
          mb: { xs: 5, md: 8 },
          borderRadius: { xs: "24px", md: "32px" },
          overflow: "hidden",
          bgcolor: "#FBF8F2",
          border: "1px solid #F0EBE3",
          px: { xs: 2.5, md: 5 },
          py: { xs: 4, md: 6 },
        }}
      >
        {/* พื้นหลังลายจุดตกแต่ง */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(197,165,90,0.16) 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 78%)",
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", textAlign: "center", mb: { xs: 3.5, md: 4.5 } }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              bgcolor: "#1B2A4A",
              color: "#C5A55A",
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              px: 1.75,
              py: 0.5,
              borderRadius: "999px",
              mb: 2,
            }}
          >
            {c.peacockBadgeYear}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 0.5 }}>
            <Box sx={{ width: { xs: 24, md: 40 }, height: "1px", bgcolor: "#C5A55A" }} />
            <Typography sx={{ ...eyebrow }}>{c.peacockEyebrow}</Typography>
            <Box sx={{ width: { xs: 24, md: 40 }, height: "1px", bgcolor: "#C5A55A" }} />
          </Box>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: { xs: "1.6rem", md: "2.2rem" },
              color: "#1B2A4A",
              mb: 1.5,
            }}
          >
            {c.peacockTitle}
          </Typography>
          <Typography sx={{ ...bodyText, maxWidth: 680, mx: "auto" }}>{c.peacockBody}</Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: { xs: 1.75, md: 2.5 },
          }}
        >
          {peacocks.map((p, i) => (
            <PeacockCard key={p.name} p={p} index={i} isEn={isEn} labels={c} />
          ))}
        </Box>
      </Box>

      {/* ผ้าแพรวา — full width image */}
      <Box component={motion.div} {...fadeUp} sx={{ mb: { xs: 5, md: 8 } }}>
        <Box sx={{ position: "relative", borderRadius: "24px", overflow: "hidden", height: { xs: 260, md: 400 } }}>
          <Image
            src="/heritage/praewa-shoulder-cloth.webp"
            alt={c.praewaAlt}
            fill
            style={{ objectFit: "cover" }}
            sizes="100vw"
          />
          <Box
            sx={{
              position: "absolute",
              left: 0,
              bottom: 0,
              p: { xs: 2.5, md: 4 },
              background: "linear-gradient(0deg, rgba(10,15,30,0.65) 0%, rgba(10,15,30,0) 100%)",
              width: "100%",
            }}
          >
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#FFFFFF", fontWeight: 500, fontSize: "0.85rem" }}>
              {c.praewaCaption}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* แผนที่ลายผ้าประจำจังหวัด — เรื่องราวของผ้าทั่วประเทศ */}
      <Box component={motion.div} {...fadeUp} sx={{ mb: { xs: 5, md: 8 } }}>
        <SectionHeader eyebrow={c.mapEyebrow} title={c.mapTitle} subtitle={c.mapSubtitle} />
        <ThailandFabricMap />
      </Box>

      {/* ผลกระทบและมรดก */}
      <Box
        component={motion.div}
        {...fadeUp}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 3, md: 6 },
          alignItems: "center",
          mb: { xs: 5, md: 8 },
        }}
      >
        <Box>
          <EditorialImage src="/heritage/heritage-exhibition-visit.webp" alt={c.heritageExhibitAlt} />
        </Box>
        <Box>
          <SectionHeader eyebrow={c.legacyEyebrow} title={c.legacyTitle} />
          <Typography sx={bodyText}>{c.legacyBody}</Typography>
        </Box>
      </Box>

      {/* Gallery closer */}
      <Box component={motion.div} {...fadeUp} sx={{ mb: { xs: 5, md: 8 } }}>
        <EditorialImage src="/heritage/queen-legacy-split.webp" alt={c.legacySplitAlt} ratio="16 / 9" />
      </Box>

      {/* CTA */}
      <Box
        component={motion.div}
        {...fadeUp}
        sx={{
          textAlign: "center",
          bgcolor: "#1B2A4A",
          borderRadius: "24px",
          p: { xs: 4, md: 6 },
          mb: { xs: 5, md: 7 },
        }}
      >
        <Typography sx={{ ...eyebrow, color: "#C5A55A", mb: 1.5 }}>{c.ctaEyebrow}</Typography>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: { xs: "1.4rem", md: "1.8rem" },
            color: "#FFFFFF",
            mb: 2,
          }}
        >
          {c.ctaTitle}
        </Typography>
        <Link href="/community" style={{ textDecoration: "none" }}>
          <Button
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: "#C5A55A",
              color: "#1B2A4A",
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "999px",
              px: 3.5,
              py: 1.2,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#D4BA7A", boxShadow: "none" },
            }}
          >
            {c.ctaButton}
          </Button>
        </Link>
      </Box>

      {/* References */}
      <Box component={motion.div} {...fadeUp} sx={{ maxWidth: 780, mx: "auto" }}>
        <Typography sx={{ ...eyebrow, mb: 1.5 }}>{c.referencesEyebrow}</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {references.map((ref, i) => (
            <Typography
              key={ref.href}
              component="a"
              href={ref.href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 300,
                fontSize: "0.78rem",
                color: "#7A7468",
                textDecoration: "none",
                "&:hover": { color: "#C5A55A", textDecoration: "underline" },
              }}
            >
              {i + 1}. {ref.label}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
