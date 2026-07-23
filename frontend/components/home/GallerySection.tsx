"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SparklesIcon from "@mui/icons-material/AutoAwesomeRounded";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  tag: string;
  story: string;
}

const GALLERY_IMAGES: GalleryItem[] = [
  /* ─── ภาพรางวัล HACKATHON, FIELD WORK & LAYA TEAM (แสดงเป็นภาพชุดแรกตามคำขอ) ─── */
  {
    id: "27",
    src: "/images/Gallery/image copy.png",
    title: "LAYA คว้าตำแหน่ง Finalists 3 ทีมสุดท้าย",
    tag: "AI Preneur Finalist",
    story: "ทีม LAYA : AI-driven Marketplace คว้ารางวัลผ่านเข้ารอบ Finalists 3 ทีมสุดท้ายในงาน AI Preneur Day 2026",
  },
  {
    id: "28",
    src: "/images/Gallery/image copy 2.png",
    title: "พิธีมอบรางวัลและถ่ายภาพรวมทีมไฟนอลิสต์",
    tag: "Finalist Celebration",
    story: "ทีมพัฒนา LAYA ร่วมถ่ายภาพฉลองความสำเร็จบนเวทีกับคณะผู้จัดงาน เมนเทอร์ และพันธมิตรผู้สนับสนุน",
  },
  {
    id: "29",
    src: "/images/Gallery/image copy 3.png",
    title: "LAYA — สรุปเซสชัน Pitching เวทีระดับประเทศ",
    tag: "Startup Event Insight",
    story: "สรุปบทความ Event Insight นำเสนอแนวคิด Startup AI ผ้าไทย เปลี่ยนโจทย์มรดกวัฒนธรรมสู่ธุรกิจมูลค่าหลายล้าน",
  },
  {
    id: "30",
    src: "/images/Gallery/image copy 4.png",
    title: "ภาพเบื้องหลังความทุ่มเทของทีม LAYA",
    tag: "Team Spirit",
    story: "บรรยากาศรอยยิ้มและความมุ่งมั่นของทีมผู้ก่อตั้ง LAYA ในการพัฒนาแพลตฟอร์ม Fashion Tech ผ้าไทย",
  },
  {
    id: "26",
    src: "/images/Gallery/image.png",
    title: "ทีม LAYA กับเมนเทอร์และคณะกรรมการ Hackathon",
    tag: "Hackathon Mentor",
    story: "ภาพบันทึกความประทับใจร่วมกับเมนเทอร์และคณะกรรมการในงานแข่งขัน AI Preneur Hackathon 2026",
  },
  {
    id: "31",
    src: "/images/Gallery/image copy 5.png",
    title: "ลงพื้นที่พูดคุยและเรียนรู้จากคุณยายช่างทอผ้าไหม",
    tag: "Artisan Field Work",
    story: "ทีมงาน LAYA ลงพื้นที่สัมผัสภูมิปัญญาการทอผ้าไหมมัดหมี่โบราณ ร่วมพูดคุยและเก็บข้อมูลจากกลุ่มคุณยายช่างทอมืออาชีพ",
  },
  {
    id: "32",
    src: "/images/Gallery/image copy 6.png",
    title: "ทีม LAYA ร่วมถ่ายภาพกับผู้ว่าฯ ชัชชาติ สิทธิพันธุ์",
    tag: "Bangkok Governor",
    story: "โอกาสอันทรงเกียรติของทีม LAYA ได้เข้าพบและถ่ายภาพร่วมกับคุณชัชชาติ สิทธิพันธุ์ ผู้ว่าราชการกรุงเทพมหานคร",
  },
  {
    id: "33",
    src: "/images/Gallery/image copy 7.png",
    title: "เครื่องหมุนกวักเส้นไหมพื้นบ้านโบราณ",
    tag: "Traditional Silk Spinning",
    story: "อุปกรณ์กวักเส้นไหมไม้ยกโบราณ เครื่องมือพื้นบ้านทรงคุณค่าที่ใช้ในการเตรียมเส้นไหมก่อนเข้าสู่โฮงทอ",
  },

  /* ─── ภาพแฟชั่นผ้าไหมไทย & นิทรรศการ ─── */
  {
    id: "1",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_1.jpg",
    title: "มหกรรมไหมไทยสู่เส้นทางโลก ครั้งที่ 15",
    tag: "Thai Silk Road 2026",
    story: "นิทรรศการยิ้มรับความภาคภูมิใจในงาน Celebration of Silk นำเสนอความประณีตของลวดลายผ้าไหมไทยสู่สายตาดีไซเนอร์ทั่วโลก",
  },
  {
    id: "2",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_2.jpg",
    title: "นิทรรศการผลงานการออกแบบผ้าไหมระดับโลก",
    tag: "International Contest",
    story: "หุ่นโชว์ชุดแฟชั่นผ้าไหมไทยที่ได้รับการออกแบบโดยนิสิตดีไซเนอร์จากหลากหลายประเทศ สะท้อนการตีความมรดกผ้าไทยในมุมมองอินเตอร์",
  },
  {
    id: "3",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_3.jpg",
    title: "บรรยากาศนิทรรศการจัดแสดงแฟชั่นผ้าไหมไทย",
    tag: "Fashion Showcase",
    story: "ภาพความประทับใจจากการเข้าชมการจัดแสดงชุดราตรีและชุดไทยประยุกต์ร่วมสมัย รวบรวมงานทอชั้นครูจากทั่วประเทศในงานมหกรรมแฟชั่นผ้าไหมไทย",
  },
  {
    id: "4",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_4.jpg",
    title: "พราวผ้า — ชุมชนทอผ้าไหมจังหวัดสุรินทร์",
    tag: "Surin Weaving Community",
    story: "บูธ展示งานผ้าไหมทอมือลายโบราณ เสื้อผ้าฝ้ายแต่งลูกไม้พาสเทล และผ้าสไบย้อมครามจากกลุ่มช่างฝีมือพราวผ้า จังหวัดสุรินทร์",
  },
  {
    id: "5",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_5.jpg",
    title: "คอลเลกชันเฉดสีธรรมชาติแห่งผ้าไหมไทย",
    tag: "Natural Colors Silk",
    story: "ชุดแฟชั่นผ้าไหมทอมือหลากสีสัน ทั้งสีกรมท่า สีทอง สีเขียวมรกต และสีม่วงดอกตะแบก สะท้อนเสน่ห์ของสีย้อมธรรมชาติ",
  },
  {
    id: "6",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_6.jpg",
    title: "ชุดครามนิล — Royal Navy Indigo Collection",
    tag: "Royal Navy Indigo",
    story: "คอลเลกชันเฉดสีกรมท่าและผ้ามัดหมี่ย้อมคราม ผสมผสานทรงเสื้อคลุมเคปและแจ็กเก็ตดีไซน์ลักชูรีใต้แสงไฟเวทีประกวด",
  },
  {
    id: "7",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_7.jpg",
    title: "เวทีประกวดการออกแบบแฟชั่นผ้าไทย",
    tag: "Grand Exhibition Hall",
    story: "บรรยากาศโถงจัดแสดงผลงานประกวดดีไซน์ชุดผ้าไหมไทยทรงคุณค่า เชื่อมโยงภูมิปัญญาดั้งเดิมเข้ากับรันเวย์ระดับสากล",
  },
  {
    id: "8",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_8.jpg",
    title: "ชุดคอลเลกชันเฉดสีแสดและน้ำเงินมงคล",
    tag: "Vibrant Contemporary",
    story: "การจับคู่โทนสีส้มทองแสดและสีน้ำเงินไพลิน ผสานงานทอบนผืนผ้าไหมไทยทรงทันสมัยเพื่อคนรุ่นใหม่",
  },
  {
    id: "9",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_9.jpg",
    title: "ผ้ายกทองและผ้ามัดหมี่เกรดพรีเมียม",
    tag: "Gold Brocade Silk",
    story: "ผืนผ้าไหมยกดอกดิ้นทองและดิ้นเงิน ลวดลายประณีตทรงคุณค่า ถ่ายทอดมรดกงานทอชั้นครูอันทรงเกียรติ",
  },
  {
    id: "10",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_10.jpg",
    title: "อาจารย์บุญโรช ศรีละพันธ์ — ครูช่างผ้าไหมศรีสะเกษ",
    tag: "Master Artisan Story",
    story: "เรื่องราวของอาจารย์บุญโรช ศรีละพันธ์ ศิลปินนักออกแบบผ้าไหมผู้สืบสานเทคนิคการทอผ้าไหมลูกแก้วย้อมครามแห่ง อ.อุทุมพรพิสัย จ.ศรีสะเกษ",
  },
  {
    id: "11",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_11.jpg",
    title: "กระเป๋าผ้าไหมไทยดีไซน์ร่วมสมัย — SALETE",
    tag: "Silk Accessories",
    story: "งานออกแบบกระเป๋าถือทรงบักเก็ตและทรงพลีทจากผ้าไหมไทย ผสมผสานดีไซน์ทันสมัยเข้ากับความประณีตระดับลักชูรี",
  },
  {
    id: "12",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_12.jpg",
    title: "ผ้ายกทองจันทร์โสมา — ชุมชนทอผ้าไหมสุรินทร์",
    tag: "Chansoma Masterpiece",
    story: "ช่างทอผ้าชั้นครูจากบ้านท่าสว่าง จังหวัดสุรินทร์ ถ่ายทอดความตั้งใจและอธิบายลวดลายผ้ายกทองโบราณให้แก่ผู้เยี่ยมชม",
  },
  {
    id: "13",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_13.jpg",
    title: "วัตถุดิบและเส้นไหมย้อมสีธรรมชาติ",
    tag: "Natural Dyes & Silk Yarn",
    story: "เส้นไหมรากแก้วย้อมสีธรรมชาติจากคราม เปลือกไม้ และวัตถุดิบอินทรีย์ ปราศจากสารเคมี ถ่ายทอดภูมิปัญญาการย้อมผ้าสีโบราณ",
  },
  {
    id: "14",
    src: "/images/Gallery/LINE_ALBUM_14669_260724_14.jpg",
    title: "กล่องของขวัญผ้าพันคอไหมทอมือทรงคุณค่า",
    tag: "Premium Gift Set",
    story: "ผ้าพันคอไหมทอมือเกรดพรีเมียม บรรจุในกล่องของขวัญพรีเมียมตราจันทร์โสมา เหมาะสำหรับของขวัญทรงคุณค่าในวาระสำคัญ",
  },
  {
    id: "15",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_1.jpg",
    title: "ชุดไทยประยุกต์ร่วมสมัย — เสื้อลูกไม้คลุมไหล่",
    tag: "Modern Thai Elegance",
    story: "เสื้อเคปคลุมไหล่แต่งลูกไม้โทนสีพาสเทล แมตช์คู่ซิ่นผ้ายกดอกสีส้มทอง ถ่ายทอดความอ่อนหวานและหรูหรา",
  },
  {
    id: "16",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_2.jpg",
    title: "เสื้ออัดพลีทลูกไม้แมตช์ผ้ามัดหมี่อีสาน",
    tag: "Contemporary Look",
    story: "เสื้อสีพีชอัดพลีทแต่งลูกไม้ช่วงคอ นำมาสวมคู่กับผ้าไหมมัดหมี่อีสานสีม่วงเปลือกมังคุด ลายโบราณ",
  },
  {
    id: "17",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_3.jpg",
    title: "ดีไซน์เรโทรแฟชั่น — แบรนด์ตระการตา (Trakanta)",
    tag: "Trakanta Brand",
    story: "เสื้อกั๊กแขนกุดผ้าไหมสีบานเย็น ปักปกคอลายเรขาคณิตสไตล์เรโทร 60s ผสมเสน่ห์ร่วมสมัย",
  },
  {
    id: "18",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_4.jpg",
    title: "ชุดเบลเซอร์ผ้ามัดหมี่ — แบรนด์ตระการตา",
    tag: "Trakanta Workwear",
    story: "เสื้อแจ็กเก็ตเบลเซอร์เข้ารูปตัดเย็บจากผ้ามัดหมี่โทนสีน้ำเงินม่วง มอบลุคสมาร์ตเวิร์กกิ้งวูแมนผู้หลงใหลในผ้าไทย",
  },
  {
    id: "19",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_5.jpg",
    title: "ชุดไทยประยุกต์เสื้อลูกไม้สีขาว & ซิ่นมัดหมี่ทอง",
    tag: "Lace & Silk Couture",
    story: "เสื้อลูกไม้ฝรั่งเศสสีขาวทรงเคปคลุมไหล่ จับคู่ผ้านุ่งไหมมัดหมี่สุรินทร์สีส้มอิฐ ลวดลายประณีตสง่างาม",
  },
  {
    id: "20",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_6.jpg",
    title: "ชุดแจ็กเก็ตผ้ามัดหมี่มัดสาย — แบรนด์ตระการตา",
    tag: "Trakanta High Fashion",
    story: "งานตัดเย็บสไตล์แฟชั่นระดับโอต์กูตูร์จากผ้ามัดหมี่ไทย สะท้อนความเชื่อมั่นและพลังของหญิงยุคใหม่",
  },
  {
    id: "21",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_7.jpg",
    title: "ชุดเดรสสั้นบานผ้าไหมบานเย็น — แบรนด์ตระการตา",
    tag: "Trakanta Chic",
    story: "เดรสผ้าไหมทรงเอสีสดใส ตกแต่งเชิงเอวและปกเสื้อด้วยลายปักมือเรขาคณิต โดดเด่นโฉบเฉี่ยว",
  },
  {
    id: "22",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_8.jpg",
    title: "งานดีไซน์ผ้าไทยสตรีทกูตูร์ — แบรนด์ตระการตา",
    tag: "Editorial Pose",
    story: "ภาพถ่ายแฟชั่นชุดผ้าไหมทรงย้อนยุค สื่อถึงความงดงามของลวดลายผ้าพื้นเมืองที่ถูกตีความใหม่ให้เข้ากับคนรุ่นใหม่",
  },
  {
    id: "23",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_9.jpg",
    title: "ชุดสูทผ้าไหมมัดหมี่ทองบรอนซ์พรีเมียม",
    tag: "Bronze Silk Blazer",
    story: "สูททรงคลาสสิกกระดุมคู่ ตัดเย็บจากผ้ามัดหมี่โทนสีทองบรอนซ์เงางาม กุ๊นขอบปีกปกด้วยด้ายส้มทอง เพิ่มเสน่ห์เฉียบคม",
  },
  {
    id: "24",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_10.jpg",
    title: "ชุดแจ็กเก็ตผ้ามัดหมี่สีม่วงดอกตะแบก",
    tag: "Royal Purple Mudmee",
    story: "เสื้อสูทตัดเย็บจากผ้ามัดหมี่ทอมือสีม่วงดอกตะแบก ลายนาคโบราณ สะท้อนเสน่ห์ของผ้าไหมอีสานระดับพรีเมียม",
  },
  {
    id: "25",
    src: "/images/Gallery/LINE_ALBUM_29669_260724_11.jpg",
    title: "ชุดสูทดับเบิลเบรสต์ผ้ามัดหมี่ทองบรอนซ์",
    tag: "Luxury Silk Suit",
    story: "ชุดสูทผ้าไหมมัดหมี่สีทองบรอนซ์ ลุคทางการสุดหรูที่สะท้อนถึงความประณีตและความพิถีพิถันของช่างทอและช่างตัดเย็บไทย",
  },
];

export default function GallerySection() {
  const { t } = useLanguage();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const selectedItem = selectedIdx !== null ? GALLERY_IMAGES[selectedIdx] : null;

  const handlePrev = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  };

  const handleNext = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % GALLERY_IMAGES.length);
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 8 },
        bgcolor: "#FAF7F2",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1.5, sm: 3, md: 5 } }}>

        {/* ─── Section Header ─── */}
        <Box sx={{ textAlign: "center", mb: { xs: 3.5, md: 5.5 } }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 1 }}>
            <SparklesIcon sx={{ fontSize: 16, color: GOLD }} />
            <Typography
              sx={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.8rem",
                color: GOLD,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              HERITAGE & DESIGN GALLERY
            </Typography>
            <SparklesIcon sx={{ fontSize: 16, color: GOLD }} />
          </Box>

          <Typography
            component="h2"
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: { xs: "1.65rem", sm: "2.1rem", md: "2.5rem" },
              color: NAVY,
              letterSpacing: "-0.01em",
            }}
          >
            แกลเลอรีเรื่องราว & แรงบันดาลใจผ้าไทย
          </Typography>

          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: { xs: "0.86rem", md: "1rem" },
              color: "#6B7280",
              mt: 1,
              maxWidth: 620,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            สัมผัสเรื่องราวทรงคุณค่า ภาพบรรยากาศบูธช่างฝีมือ กิจกรรม Hackathon และแฟชั่นผ้าไหมไทยระดับโอต์กูตูร์
          </Typography>
        </Box>

        {/* ─── Mobile 4-Column Square Grid UI (ตรงตามรูปเรฟในโทรศัพท์) ─── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(5, 1fr)", md: "repeat(6, 1fr)" },
            gap: { xs: "6px", sm: "10px", md: "14px" },
          }}
        >
          {GALLERY_IMAGES.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.35, delay: (index % 8) * 0.03 }}
            >
              <Box
                onClick={() => setSelectedIdx(index)}
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1/1", // ทรงสี่เหลี่ยมจัตุรัสขอบมน ตามเรฟไอโฟน
                  borderRadius: { xs: "12px", sm: "16px", md: "20px" },
                  overflow: "hidden",
                  bgcolor: "#EADFCB",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(27,42,74,0.06)",
                  border: "1px solid rgba(197,165,90,0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.06)",
                    zIndex: 2,
                    boxShadow: "0 8px 22px rgba(197,165,90,0.35)",
                    borderColor: GOLD,
                    "& .gallery-overlay": { opacity: 1 },
                  },
                }}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 600px) 25vw, (max-width: 900px) 20vw, 16vw"
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                />

                {/* Scrim Overlay on Hover */}
                <Box
                  className="gallery-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(15,26,48,0) 30%, rgba(15,26,48,0.85) 100%)",
                    opacity: 0,
                    transition: "opacity 0.25s ease",
                    p: { xs: 0.75, md: 1.5 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: FONT,
                      fontWeight: 600,
                      fontSize: { xs: "0.6rem", md: "0.8rem" },
                      color: "#FFFFFF",
                      lineHeight: 1.2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* ─── Bottom CTA ─── */}
        <Box sx={{ textAlign: "center", mt: { xs: 4, md: 6 } }}>
          <Link href="/search" style={{ textDecoration: "none" }}>
            <Button
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: NAVY,
                color: "#FFFFFF",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: "999px",
                px: 4,
                py: 1.35,
                textTransform: "none",
                boxShadow: "0 10px 28px rgba(27,42,74,0.2)",
                border: "1px solid #C5A55A",
                "&:hover": {
                  bgcolor: "#132342",
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 34px rgba(27,42,74,0.3)",
                },
              }}
            >
              สำรวจผ้าไทยและสินค้าทั้งหมด
            </Button>
          </Link>
        </Box>
      </Box>

      {/* ─── Lightbox Modal Preview ─── */}
      <Dialog
        open={selectedIdx !== null}
        onClose={() => setSelectedIdx(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            bgcolor: NAVY,
            overflow: "hidden",
            m: { xs: 1.5, sm: 3 },
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: "rgba(15,26,48,0.92)",
              backdropFilter: "blur(12px)",
            },
          },
        }}
      >
        {selectedItem && (
          <Box sx={{ position: "relative", display: "flex", flexDirection: { xs: "column", md: "row" }, bgcolor: NAVY, minHeight: { md: 520 } }}>
            {/* Close Button */}
            <IconButton
              onClick={() => setSelectedIdx(null)}
              aria-label="close preview"
              sx={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 10,
                color: "#FFFFFF",
                bgcolor: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "#000000", color: GOLD },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>

            {/* Left/Prev Arrow */}
            <IconButton
              onClick={handlePrev}
              aria-label="previous image"
              sx={{
                position: "absolute",
                top: "50%",
                left: 14,
                transform: "translateY(-50%)",
                zIndex: 10,
                color: "#FFFFFF",
                bgcolor: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: NAVY, color: GOLD },
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* Right/Next Arrow */}
            <IconButton
              onClick={handleNext}
              aria-label="next image"
              sx={{
                position: "absolute",
                top: "50%",
                right: 14,
                transform: "translateY(-50%)",
                zIndex: 10,
                color: "#FFFFFF",
                bgcolor: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: NAVY, color: GOLD },
              }}
            >
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* Large Image Preview */}
            <Box
              sx={{
                flex: 1.2,
                position: "relative",
                minHeight: { xs: 340, md: 520 },
                bgcolor: "#0B1326",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={selectedItem.src}
                alt={selectedItem.title}
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>

            {/* Right Details Panel */}
            <Box
              sx={{
                flex: 0.9,
                p: { xs: 3, md: 4.5 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                bgcolor: "#13223F",
                borderLeft: { md: "1px solid rgba(255,255,255,0.08)" },
              }}
            >
              <Box
                sx={{
                  display: "inline-block",
                  bgcolor: "rgba(197,165,90,0.2)",
                  color: GOLD,
                  border: "1px solid rgba(197,165,90,0.4)",
                  fontFamily: FONT,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  px: 1.5,
                  py: 0.4,
                  borderRadius: "999px",
                  width: "fit-content",
                  mb: 1.75,
                }}
              >
                {selectedItem.tag}
              </Box>

              <Typography
                component="h3"
                sx={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: { xs: "1.35rem", md: "1.65rem" },
                  color: "#FFFFFF",
                  lineHeight: 1.28,
                  mb: 1.5,
                }}
              >
                {selectedItem.title}
              </Typography>

              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.7,
                  mb: 3.5,
                }}
              >
                {selectedItem.story}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Link href="/services/tailor" style={{ textDecoration: "none" }}>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      bgcolor: GOLD,
                      color: NAVY,
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      borderRadius: "999px",
                      py: 1.2,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#D6C29A" },
                    }}
                  >
                    สั่งตัดตามแบบนี้
                  </Button>
                </Link>
                <Link href="/search" style={{ textDecoration: "none" }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      bgcolor: "transparent",
                      color: "#FFFFFF",
                      borderColor: "rgba(255,255,255,0.3)",
                      fontFamily: FONT,
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      borderRadius: "999px",
                      py: 1.1,
                      textTransform: "none",
                      "&:hover": { borderColor: GOLD, color: GOLD },
                    }}
                  >
                    ดูสินค้าที่เกี่ยวข้อง
                  </Button>
                </Link>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
