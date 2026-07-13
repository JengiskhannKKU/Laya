"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LiveCommunityDetail } from "@/lib/communities";
import { fetchLiveProducts, type Product } from "@/lib/live-products";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface CommunityDetailViewProps {
  community: LiveCommunityDetail;
}

const PRODUCTION_PROCESS = [
  { id: 1, title: "เลี้ยงไหม & สาวไหม", desc: "ไหมธรรมชาติเลี้ยงในชุมชน สาวเส้นสม่ำเสมอ" },
  { id: 2, title: "ย้อมสีธรรมชาติ", desc: "ใช้เปลือกไม้ ใบไม้ และรากพืชท้องถิ่น ไม่มีสารเคมี" },
  { id: 3, title: "ออกแบบลาย & มัดหมี่", desc: "สืบทอดลวดลายดั้งเดิมและลวดลายร่วมสมัย" },
  { id: 4, title: "ทอด้วยมือ", desc: "ใช้เวลา 3-15 วันขึ้นกับความซับซ้อนของลาย" },
];

const TABS = [
  { id: "story", label: "เรื่องราว" },
  { id: "products", label: "สินค้า" },
];

export default function CommunityDetailView({ community }: CommunityDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("story");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  const startChat = async () => {
    if (!user) { router.push("/auth/login"); return; }
    setStartingChat(true);
    try {
      const res = await authFetch(`${API_BASE}/api/chat/conversations`, {
        method: "POST",
        body: JSON.stringify({ shopId: community.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เริ่มแชทไม่สำเร็จ");
      router.push(`/messages/${data.id}`);
    } catch (err) {
      if (err instanceof SessionExpiredError) { router.push("/auth/login"); return; }
    } finally {
      setStartingChat(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchLiveProducts({ shopId: community.id })
      .then((list) => { if (!cancelled) setProducts(list); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoadingProducts(false); });
    return () => { cancelled = true; };
  }, [community.id]);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 140, behavior: "smooth" });
    }
  };

  const stats = [
    { label: "ผลิตภัณฑ์", value: String(community.productCount) },
    { label: "คะแนน", value: community.rating > 0 ? community.rating.toFixed(1) : "—" },
    { label: "รีวิว", value: String(community.reviewCount) },
  ];

  return (
    <Box sx={{ width: "100%", pb: { xs: 12, md: 8 } }}>
      {/* 1. Hero */}
      <Box sx={{ position: "relative", width: "100%", height: 320 }}>
        <Image
          src={community.image || "/placeholder.webp"}
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

        <Box sx={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.5rem", color: "#FFFFFF" }}>
            {community.name}
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", mt: 0.2 }}>
            จ.{community.province}
          </Typography>
        </Box>
      </Box>

      {/* 2. Stats Grid Box — เฉพาะข้อมูลจริงจากร้าน */}
      <Box sx={{ bgcolor: "#FFFFFF", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", py: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        {stats.map((stat, i) => (
          <Box key={i} sx={{ textAlign: "center", position: "relative" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.2rem", fontWeight: 700, color: "#1B2A4A" }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", mt: 0.2 }}>
              {stat.label}
            </Typography>
            {i !== stats.length - 1 && <Box sx={{ position: "absolute", right: 0, top: "20%", bottom: "20%", width: "1px", bgcolor: "#E5DFD6" }} />}
          </Box>
        ))}
      </Box>

      {/* 3. Sticky Tab Navigation */}
      <Box
        sx={{
          position: "sticky", top: 0, zIndex: 50, bgcolor: "#FAF6F0",
          borderBottom: "1px solid #E5DFD6", display: "flex", px: 2,
        }}
      >
        {TABS.map((tab) => (
          <Box
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            sx={{ flex: 1, textAlign: "center", py: 1.5, cursor: "pointer", position: "relative" }}
          >
            <Typography sx={{ fontSize: "0.85rem", fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? "#1B2A4A" : "#9CA3AF" }}>
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

        {/* Story Section — เรื่องราวจริงจากร้าน (shops.description) */}
        <Box id="story" sx={{ mb: 4, scrollMarginTop: "140px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
              เรื่องราวชุมชน
            </Typography>
            <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
          </Box>
          <Box sx={{ bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6" }}>
            {community.description ? (
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.7 }}>
                {community.description}
              </Typography>
            ) : (
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#9CA3AF", fontStyle: "italic" }}>
                ร้านนี้ยังไม่ได้เพิ่มเรื่องราวชุมชน
              </Typography>
            )}
          </Box>
        </Box>

        {/* Production Process — ข้อมูลความรู้ทั่วไปเรื่องการทอผ้าไทย */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
              กระบวนการผลิตโดยทั่วไป
            </Typography>
            <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
          </Box>
          <Box sx={{ position: "relative", ml: 1.5 }}>
            <Box sx={{ position: "absolute", left: 11, top: 12, bottom: 20, width: 2, bgcolor: "#E5DFD6" }} />
            {PRODUCTION_PROCESS.map((step) => (
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

        {/* Products Grid Section — สินค้าจริงจากร้านนี้ */}
        <Box id="products" sx={{ mb: 4, scrollMarginTop: "140px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
              สินค้าจากชุมชนนี้
            </Typography>
            <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
          </Box>

          {loadingProducts ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={22} sx={{ color: "#C5A55A" }} />
            </Box>
          ) : products.length === 0 ? (
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#9CA3AF", fontStyle: "italic", textAlign: "center", py: 3 }}>
              ยังไม่มีสินค้าวางขายจากร้านนี้
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              {products.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} style={{ textDecoration: "none" }}>
                  <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5DFD6", overflow: "hidden" }}>
                    <Box sx={{ position: "relative", width: "100%", height: 120 }}>
                      <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ p: 1.5 }}>
                      <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.8rem", color: "#1B2A4A" }}>
                        {p.name}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.85rem", color: "#CBA258", mt: 0.5 }}>
                        {p.price.toLocaleString()} ฿/{p.priceUnit}
                      </Typography>
                    </Box>
                  </Box>
                </Link>
              ))}
            </Box>
          )}
        </Box>

        {/* Rating summary — เฉพาะตัวเลขรวมจริง (ไม่มีระบบรีวิวรายบุคคลตอนนี้) */}
        {community.reviewCount > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
                คะแนนรีวิว
              </Typography>
              <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
            </Box>
            <Box sx={{ bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6", display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "2rem", color: "#1B2A4A", lineHeight: 1 }}>{community.rating.toFixed(1)}</Typography>
              <Box>
                <Rating value={community.rating} precision={0.1} readOnly size="small" sx={{ "& .MuiRating-iconFilled": { color: "#C5A55A" } }} />
                <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{community.reviewCount} รีวิว</Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Location — แสดงเฉพาะเมื่อร้านกรอกที่อยู่ไว้จริง */}
        {community.address && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
                ที่ตั้งชุมชน
              </Typography>
              <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6" }}>
              <LocationOnRoundedIcon sx={{ color: "#D8BC82", fontSize: 20 }} />
              <Typography sx={{ fontSize: "0.85rem", color: "#4B5563" }}>{community.address}</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Sticky Bottom Action Bar */}
      <Box
        sx={{
          display: { md: "none" }, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1300,
          bgcolor: "#FAF6F0", pb: 3, pt: 1.5, px: 2.5, borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={startChat} disabled={startingChat}
            startIcon={<ChatBubbleOutlineRoundedIcon />}
            sx={{ flexShrink: 0, bgcolor: "#FFFFFF", color: "#1B2A4A", border: "1px solid #C5A55A", borderRadius: "24px", py: 1.5, px: 2, fontWeight: 600, fontSize: "0.9rem", "&:hover": { bgcolor: "rgba(197,165,90,0.08)" } }}
          >
            แชท
          </Button>
          <Link href={`/search?q=${encodeURIComponent(community.name)}`} style={{ textDecoration: "none", flex: 1 }}>
            <Button
              fullWidth
              sx={{ bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "24px", py: 1.5, fontWeight: 600, fontSize: "0.95rem", "&:hover": { bgcolor: "#0F1A30" } }}
            >
              ดูสินค้าทั้งหมดจากชุมชนนี้ ›
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
