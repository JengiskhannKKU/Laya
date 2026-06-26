"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Rating from "@mui/material/Rating";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import NatureRoundedIcon from "@mui/icons-material/NatureRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { products, type Community } from "@/lib/mock-data";

interface CommunityDetailViewProps {
  community: Community;
}

// Hardcoded extended data to match the detailed wireframe
const COMMUNITY_STATS = [
  { label: "สมาชิก", value: "45" },
  { label: "ผลิตภัณฑ์", value: "28" },
  { label: "คะแนน", value: "4.9" },
  { label: "ปีที่สืบทอด", value: "200+" },
];

const TABS = [
  { id: "story", label: "เรื่องราว" },
  { id: "weavers", label: "ช่างทอ" },
  { id: "products", label: "สินค้า" },
  { id: "reviews", label: "รีวิว" },
];

const PRODUCTION_PROCESS = [
  { id: 1, title: "เลี้ยงไหม & สาวไหม", desc: "ไหมธรรมชาติเลี้ยงในชุมชน สาวเส้นสม่ำเสมอ" },
  { id: 2, title: "ย้อมสีธรรมชาติ", desc: "ใช้เปลือกไม้ ใบไม้ และรากพืชท้องถิ่น ไม่มีสารเคมี" },
  { id: 3, title: "ออกแบบลาย & มัดหมี่", desc: "สืบทอดลวดลายดั้งเดิมและลวดลายร่วมสมัย" },
  { id: 4, title: "ทอด้วยมือ", desc: "ใช้เวลา 3-15 วันขึ้นกับความซับซ้อนของลาย" },
];

const WEAVERS = [
  { id: "w1", name: "แม่สมจิตร ใจดี", initial: "ส", exp: "30", specialty: "ลายดั้งเดิม - ลายดอกขอก", color: "#4B7355" },
  { id: "w2", name: "แม่ประนอม วงศ์ทอง", initial: "ป", exp: "18", specialty: "ลายดอกไม้ - มัดหมี่", color: "#6A538D" },
];

export default function CommunityDetailView({ community }: CommunityDetailViewProps) {
  const [activeTab, setActiveTab] = useState("story");
  const [showFullStory, setShowFullStory] = useState(false);

  // Helper to scroll to section
  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    // Header + Tabs approx offset
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 140,
        behavior: "smooth"
      });
    }
  };

  // Associate some mock products to this community
  const communityProducts = products.filter(p => p.hasGI).slice(0, 4);

  return (
    <Box
      sx={{
        maxWidth: 430,
        mx: "auto",
        minHeight: "100vh",
        bgcolor: "#FAF6F0",
        position: "relative",
        boxShadow: { xs: "none", sm: "0 0 40px rgba(0,0,0,0.08)" },
        pb: 12, // Space for bottom CTA
      }}
    >
      {/* 1. Hero + GI Strip */}
      <Box sx={{ position: "relative", width: "100%", height: 320 }}>
        <Image
          src={community.image || "/placeholder.jpg"}
          alt={community.name}
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(27,42,74,0.4) 0%, rgba(27,42,74,0.85) 100%)",
          }}
        />

        {/* Header Action Buttons */}
        <Box sx={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", zIndex: 10 }}>
          <Link href="/">
            <IconButton sx={{ bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF", mr: -0.5 }} />
            </IconButton>
          </Link>
          <IconButton sx={{ bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
            <ShareRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
          </IconButton>
        </Box>

        {/* Title Positioned near bottom of Hero */}
        <Box sx={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.5rem", color: "#FFFFFF" }}>
            {community.name}
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", mt: 0.2 }}>
            จ.{community.province} - ภาคเหนือ
          </Typography>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, bgcolor: "#D8BC82", borderRadius: "8px", px: 1.5, py: 0.6, width: "fit-content" }}>
            <WorkspacePremiumRoundedIcon sx={{ color: "#1B2A4A", fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#1B2A4A" }}>
              GI รับรอง | สิ่งบ่งชี้ทางภูมิศาสตร์ - กรมทรัพย์สินทางปัญญา
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 2. Stats Grid Box */}
      <Box sx={{ bgcolor: "#FFFFFF", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", py: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        {COMMUNITY_STATS.map((stat, i) => (
          <Box key={i} sx={{ textAlign: "center", position: "relative" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.2rem", fontWeight: 700, color: "#1B2A4A" }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", mt: 0.2 }}>
              {stat.label}
            </Typography>
            {i !== 3 && <Box sx={{ position: "absolute", right: 0, top: "20%", bottom: "20%", width: "1px", bgcolor: "#E5DFD6" }} />}
          </Box>
        ))}
      </Box>

      {/* 3. Sticky Tab Navigation */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          bgcolor: "#FAF6F0",
          borderBottom: "1px solid #E5DFD6",
          display: "flex",
          px: 2,
        }}
      >
        {TABS.map((tab) => (
          <Box
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            sx={{
              flex: 1,
              textAlign: "center",
              py: 1.5,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "#1B2A4A" : "#9CA3AF"
              }}
            >
              {tab.label}
            </Typography>
            {activeTab === tab.id && (
              <Box sx={{ position: "absolute", bottom: -1, left: "15%", right: "15%", height: 3, bgcolor: "#D8BC82", borderRadius: "3px 3px 0 0" }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ px: 2.5, pt: 3 }}>
        
        {/* Story Section */}
        <Box id="story" sx={{ mb: 4, scrollMarginTop: "140px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
              เรื่องราวชุมชน
            </Typography>
            <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
          </Box>
          <Box sx={{ bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6" }}>
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.7,
                overflow: "hidden", maxHeight: showFullStory ? "none" : 85, transition: "max-height 0.3s ease",
              }}
            >
              ผ้ายกลายกินรีหริภุญชัยมีตำนานมากว่า 200 ปี เป็นสัญลักษณ์แห่งความวิจิตรของเจ้านายสายเหนือ ถ่ายทอดผ่านความเชื่อและวิถีชีวิตของชาวลำพูน ทอด้วยความละเอียดประณีต ผสานภูมิปัญญาย้อมสีจากพืชในท้องถิ่น
            </Typography>
            <Typography
              onClick={() => setShowFullStory(!showFullStory)}
              sx={{ fontSize: "0.8rem", color: "#CBA258", mt: 1, fontWeight: 600, cursor: "pointer" }}
            >
              {showFullStory ? "ซ่อน ▲" : "อ่านเพิ่มเติม ›"}
            </Typography>
          </Box>
        </Box>

        {/* Production Process Timeline */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
              กระบวนการผลิต
            </Typography>
            <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
          </Box>
          <Box sx={{ position: "relative", ml: 1.5 }}>
            {/* Vertical Line */}
            <Box sx={{ position: "absolute", left: 11, top: 12, bottom: 20, width: 2, bgcolor: "#E5DFD6" }} />
            
            {PRODUCTION_PROCESS.map((step, idx) => (
              <Box key={step.id} sx={{ display: "flex", gap: 2, mb: 2.5, position: "relative" }}>
                <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "#1B2A4A", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, zIndex: 2 }}>
                  {step.id}
                </Box>
                <Box sx={{ mt: -0.2 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1B2A4A" }}>{step.title}</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", mt: 0.3 }}>{step.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Weavers Section */}
        <Box id="weavers" sx={{ mb: 4, scrollMarginTop: "140px" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
                ช่างทอ
              </Typography>
              <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
            </Box>
            <Typography sx={{ fontSize: "0.75rem", color: "#CBA258", fontWeight: 600 }}>ดูทั้งหมด</Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {WEAVERS.map((weaver) => (
              <Box key={weaver.id} sx={{ bgcolor: "#FFFFFF", p: 1.5, borderRadius: "12px", border: "1px solid #E5DFD6", display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: weaver.color, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem" }}>
                  {weaver.initial}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1B2A4A" }}>{weaver.name}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>ประสบการณ์ {weaver.exp} ปี</Typography>
                  <Box sx={{ display: "inline-block", bgcolor: "#FDF8F0", color: "#8E601C", fontSize: "0.65rem", px: 1, py: 0.3, borderRadius: "4px", mt: 0.5 }}>
                    ลายประจำตัว: {weaver.specialty}
                  </Box>
                </Box>
                <ChevronRightRoundedIcon sx={{ color: "#E5DFD6" }} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Products Grid Section */}
        <Box id="products" sx={{ mb: 4, scrollMarginTop: "140px" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
                สินค้าจากชุมชนนี้
              </Typography>
              <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
            </Box>
            <Typography sx={{ fontSize: "0.75rem", color: "#CBA258", fontWeight: 600 }}>ดูทั้งหมด</Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            {communityProducts.map((p, idx) => (
              <Link key={idx} href={`/product/${p.id}`} style={{ textDecoration: "none" }}>
                <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5DFD6", overflow: "hidden" }}>
                  <Box sx={{ position: "relative", width: "100%", height: 120 }}>
                    <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "cover" }} />
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.8rem", color: "#1B2A4A" }}>
                      {p.name}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.85rem", color: "#CBA258", mt: 0.5 }}>
                      {p.price.toLocaleString()} ฿/ม.
                    </Typography>
                  </Box>
                </Box>
              </Link>
            ))}
          </Box>
        </Box>

        {/* Reviews Section */}
        <Box id="reviews" sx={{ mb: 4, scrollMarginTop: "140px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
              รีวิว
            </Typography>
            <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
          </Box>

          <Box sx={{ bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6", display: "flex", gap: 2, mb: 1.5 }}>
            <Box sx={{ textAlign: "center", minWidth: 80 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "2rem", color: "#1B2A4A", lineHeight: 1 }}>{4.9}</Typography>
              <Rating value={4.9} precision={0.1} readOnly size="small" sx={{ "& .MuiRating-iconFilled": { color: "#C5A55A" }, my: 0.5 }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>120 รีวิว</Typography>
            </Box>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", py: 0.5 }}>
              {[5,4,3,2,1].map((star, idx) => (
                <Box key={star} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: "0.6rem", color: "#6B7280", minWidth: 8 }}>{star}</Typography>
                  <Box sx={{ flex: 1, height: 4, bgcolor: "#E5DFD6", borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", bgcolor: "#CFA055", width: idx === 0 ? "90%" : idx === 1 ? "15%" : "0%" }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* User Review Card */}
          <Box sx={{ bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#E5DFD6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "#6B7280" }}>
                  น
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1B2A4A" }}>คุณนภา</Typography>
                  <Typography sx={{ fontSize: "0.6rem", color: "#9CA3AF" }}>12 ส.ค. 2024</Typography>
                </Box>
              </Box>
              <Rating value={5} readOnly size="small" sx={{ "& .MuiRating-iconFilled": { color: "#C5A55A" } }} />
            </Box>
            <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.6 }}>
              ผ้าสวยมาก ลายละเอียดเก็บคล่อง ช่างทอใจดีมาก สอบถามตอบทุกอย่าง จะกลับมาสั่งอีกแน่นอนค่ะ
            </Typography>
            <Box sx={{ display: "inline-block", mt: 1, bgcolor: "#FDF8F0", border: "1px solid #EBE3D5", px: 1, py: 0.3, borderRadius: "4px" }}>
              <Typography sx={{ fontSize: "0.65rem", color: "#8E601C" }}>สั่ง: ลายกินรี - กรมท่า</Typography>
            </Box>
          </Box>
        </Box>

        {/* Location & Certifications */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
              ที่ตั้งชุมชน
            </Typography>
            <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
          </Box>
          <Box sx={{ bgcolor: "#E9F2E9", borderRadius: "12px", height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid #C4D7C4", mb: 3 }}>
            <Box sx={{ p: 1, bgcolor: "#1B2A4A", borderRadius: "50%", mb: 0.5 }}>
              <LocationOnRoundedIcon sx={{ color: "#D8BC82", fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontSize: "0.8rem", color: "#4B7355", fontWeight: 600 }}>ต.ศรีภูมิ อ.เมือง จ.ลำพูน</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
              การรับรอง
            </Typography>
            <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            {[
              { icon: <WorkspacePremiumRoundedIcon sx={{ color: "#D3A14A" }}/>, text: "GI รับรอง\nกรมทรัพย์สิน" },
              { icon: <NatureRoundedIcon sx={{ color: "#4B7355" }}/>, text: "สีธรรมชาติ\n100%" },
              { icon: <HandshakeRoundedIcon sx={{ color: "#6A538D" }}/>, text: "Fair Trade\nCertified" }
            ].map((cert, idx) => (
              <Box key={idx} sx={{ bgcolor: "#FFFFFF", p: 1.5, borderRadius: "12px", border: "1px solid #E5DFD6", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                {cert.icon}
                <Typography sx={{ fontSize: "0.65rem", color: "#6B7280", whiteSpace: "pre-line", lineHeight: 1.2 }}>
                  {cert.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>

      {/* Sticky Bottom Action Bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 430,
          mx: "auto",
          zIndex: 100,
          bgcolor: "#FAF6F0",
          pb: 3,
          pt: 1.5,
          px: 2,
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Button
          fullWidth
          sx={{
            bgcolor: "#1B2A4A",
            color: "#FFFFFF",
            borderRadius: "24px",
            py: 1.5,
            fontWeight: 600,
            fontSize: "0.95rem",
            "&:hover": { bgcolor: "#0F1A30" }
          }}
        >
          ดูสินค้าทั้งหมดจากชุมชนนี้ ›
        </Button>
      </Box>
    </Box>
  );
}
