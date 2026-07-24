"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LiveCommunityDetail } from "@/lib/communities";
import { fetchLiveProducts, productDisplayName, type Product } from "@/lib/live-products";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface CommunityDetailViewProps {
  community: LiveCommunityDetail;
}

/** ลายผ้าที่ชุมชนนี้ทอได้ — ของตัวเอง (shop_id ตรงกัน) + ลายระบบที่ประกาศว่าทอได้ (จาก GET ?shopId=) */
interface WeavePattern {
  id: string;
  name: string;
  description: string | null;
  originProvince: string | null;
  region: string | null;
  storyHistory: string | null;
  storyWeaving: string | null;
  thumbnailUrl: string | null;
}

const PRODUCTION_PROCESS = [
  { id: 1, title: "เลี้ยงไหม & สาวไหม", desc: "ไหมธรรมชาติเลี้ยงในชุมชน สาวเส้นสม่ำเสมอ" },
  { id: 2, title: "ย้อมสีธรรมชาติ", desc: "ใช้เปลือกไม้ ใบไม้ และรากพืชท้องถิ่น ไม่มีสารเคมี" },
  { id: 3, title: "ออกแบบลาย & มัดหมี่", desc: "สืบทอดลวดลายดั้งเดิมและลวดลายร่วมสมัย" },
  { id: 4, title: "ทอด้วยมือ", desc: "ใช้เวลา 3-15 วันขึ้นกับความซับซ้อนของลาย" },
];

/** หัวข้อพร้อมขีดทองสั้น ๆ ใช้ซ้ำในหลาย section */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
        {children}
      </Typography>
      <Box sx={{ width: 16, height: 2, bgcolor: "#D8BC82" }} />
    </Box>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { locale } = useLanguage();
  const displayName = productDisplayName(p, locale);
  return (
    <Link href={`/product/${p.id}`} style={{ textDecoration: "none", minWidth: 0 }}>
      <Box
        sx={{
          minWidth: 0,
          bgcolor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E5DFD6", overflow: "hidden",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 26px rgba(27,42,74,0.12)" },
          "&:hover .laya-cp-img": { transform: "scale(1.05)" },
        }}
      >
        <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden", bgcolor: "#F0EBE3" }}>
          <Box className="laya-cp-img" sx={{ position: "absolute", inset: 0, transition: "transform 0.5s cubic-bezier(0.22,0.61,0.36,1)" }}>
            <Image src={p.images[0]} alt={displayName} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 45vw, 25vw" />
          </Box>
        </Box>
        <Box sx={{ p: 1.5 }}>
          <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.82rem", color: "#1B2A4A" }}>
            {displayName}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mt: 0.5 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.85rem", color: "#CBA258" }}>
              {p.price.toLocaleString()} ฿/{p.priceUnit}
            </Typography>
            {p.rating > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                <StarRoundedIcon sx={{ fontSize: 13, color: "#C9A86A" }} />
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem", color: "#7A7468" }}>{p.rating}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Link>
  );
}

/** การ์ดผลงาน — ลายผ้าที่ชุมชนนี้ทอได้ พร้อมเรื่องราว/เอกลักษณ์ (เอาข้อมูลจริงจาก weave_patterns
 * มาแสดง ไม่ปั้นฟิลด์ "วัตถุดิบ" ใหม่ที่ยังไม่มีจริงในระบบ) */
function PatternPortfolioCard({ pattern, shopId }: { pattern: WeavePattern; shopId: string }) {
  const narrative = [pattern.storyHistory, pattern.storyWeaving, pattern.description].filter(Boolean).join(" — ");
  return (
    <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E5DFD6", overflow: "hidden" }}>
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "4 / 3", bgcolor: "#F0EBE3" }}>
        {pattern.thumbnailUrl ? (
          <Image src={pattern.thumbnailUrl} alt={pattern.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 90vw, 45vw" />
        ) : (
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <StorefrontRoundedIcon sx={{ fontSize: 36, color: "#D8CFC0" }} />
          </Box>
        )}
      </Box>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: narrative ? 1 : 0 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.92rem", color: "#1B2A4A" }}>
            {pattern.name}
          </Typography>
          {(pattern.originProvince || pattern.region) && (
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.68rem", color: "#9CA3AF", flexShrink: 0 }}>
              {pattern.originProvince ?? pattern.region}
            </Typography>
          )}
        </Box>
        {narrative && (
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {narrative}
          </Typography>
        )}
        <Button
          component={Link} href={`/weaving-order?shopId=${shopId}&patternId=${pattern.id}`}
          size="small"
          sx={{ mt: 1.5, fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", fontWeight: 600, color: "#13284B", textTransform: "none", px: 0, "&:hover": { bgcolor: "transparent", color: "#C5A55A" } }}
        >
          สั่งทอลายนี้ ›
        </Button>
      </Box>
    </Box>
  );
}

export default function CommunityDetailView({ community }: CommunityDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [patterns, setPatterns] = useState<WeavePattern[]>([]);
  const [loadingPatterns, setLoadingPatterns] = useState(true);
  const [patternPage, setPatternPage] = useState(1);
  const PATTERNS_PER_PAGE = 6;
  // แถบสลับมุมมองในคอลัมน์ขวา — สินค้าจากชุมชนนี้ / ผลงาน & ลายผ้าที่ทอได้
  const [showcaseTab, setShowcaseTab] = useState<"products" | "patterns">("products");

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

  // ลายผ้าที่ชุมชนนี้ทอได้ — ของตัวเอง + ลายระบบที่ประกาศว่าทอได้ (backend กรองด้วย ?shopId=)
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/weave-patterns?shopId=${community.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => { if (!cancelled) setPatterns(list); })
      .catch(() => { if (!cancelled) setPatterns([]); })
      .finally(() => { if (!cancelled) setLoadingPatterns(false); });
    return () => { cancelled = true; };
  }, [community.id]);

  // โชว์ตัวอย่าง 4 ชิ้น (2 แถว) — กด "ดูทั้งหมด" ค่อยขยายในหน้า
  const visibleProducts = showAll ? products : products.slice(0, 4);
  const hasMore = products.length > 4;

  // แบ่งหน้าลายผ้าในพอร์ตโฟลิโอ — 6 ลายต่อหน้า (3 แถว)
  const patternPageCount = Math.ceil(patterns.length / PATTERNS_PER_PAGE);
  const visiblePatterns = patterns.slice((patternPage - 1) * PATTERNS_PER_PAGE, patternPage * PATTERNS_PER_PAGE);

  const stats = [
    { label: "ผลิตภัณฑ์", value: String(community.productCount) },
    { label: "คะแนน", value: community.rating > 0 ? community.rating.toFixed(1) : "—" },
    { label: "รีวิว", value: String(community.reviewCount) },
  ];

  return (
    <Box sx={{ width: "100%", pb: { xs: 12, md: 8 } }}>
      {/* Hero — เต็มความกว้าง */}
      <Box sx={{ position: "relative", width: "100%", height: { xs: 300, md: 340 } }}>
        {community.image ? (
          <Image src={community.image} alt={community.name} fill style={{ objectFit: "cover" }} priority />
        ) : (
          // ร้านที่ไม่มีรูป cover/profile/สินค้าเลย — เดิม fallback ไปที่ "/placeholder.webp" ซึ่งจริงๆ เป็นไฟล์ webp
          // ขนาด 1x1 พิกเซล (ไม่ใช่รูปจริง) พอถูกยืดเต็ม hero แล้วดูเหมือนรูปหน้าร้านหายไปเฉยๆ
          // ใช้พื้นหลังไล่สีของแบรนด์ + ไอคอนแทน ยังไงก็ดูตั้งใจแทนที่จะดูเหมือนบั๊ก
          <Box sx={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #1B2A4A 0%, #2A3F66 60%, #C5A55A 140%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <StorefrontRoundedIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.35)" }} />
          </Box>
        )}
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(27,42,74,0.4) 0%, rgba(27,42,74,0.85) 100%)" }} />

        <Box sx={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", zIndex: 10 }}>
          <Link href="/community">
            <IconButton sx={{ bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF", mr: -0.5 }} />
            </IconButton>
          </Link>
          <IconButton sx={{ bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
            <ShareRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
          </IconButton>
        </Box>

        <Box sx={{ position: "absolute", bottom: 20, left: 0, right: 0, px: { xs: 2.5, md: 4 } }}>
          <Box sx={{ maxWidth: 1200, mx: "auto" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: { xs: "1.5rem", md: "2rem" }, color: "#FFFFFF" }}>
              {community.name}
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", mt: 0.2 }}>
              จ.{community.province}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", py: 2 }}>
          {stats.map((stat, i) => (
            <Box key={i} sx={{ textAlign: "center", position: "relative" }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.2rem", fontWeight: 700, color: "#1B2A4A" }}>{stat.value}</Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", mt: 0.2 }}>{stat.label}</Typography>
              {i !== stats.length - 1 && <Box sx={{ position: "absolute", right: 0, top: "20%", bottom: "20%", width: "1px", bgcolor: "#E5DFD6" }} />}
            </Box>
          ))}
        </Box>
      </Box>

      {/* เนื้อหา 2 คอลัมน์ (desktop) — ซ้าย: ชุมชน / ขวา: สินค้า
          minWidth: 0 บน grid item ทั้งสองฝั่ง — ไม่งั้น grid track (1fr) จะขยายตามความกว้าง
          intrinsic ของเนื้อหาข้างใน (เช่น Typography noWrap ของชื่อสินค้า) แทนที่จะยอมให้ ellipsis
          ตัดคำทำงาน ทำให้ทั้งหน้าล้นขอบจอมือถือ (min-width: auto คือ default ของ grid item) */}
      <Box
        sx={{
          maxWidth: 1200, mx: "auto", px: { xs: 2.5, md: 4 }, pt: { xs: 3, md: 4 },
          display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" }, gap: { xs: 0, md: 5 },
          alignItems: "start",
        }}
      >
        {/* ── คอลัมน์ซ้าย: ชุมชน ── */}
        <Box sx={{ minWidth: 0 }}>
          {/* เรื่องราวชุมชน */}
          <Box sx={{ mb: 4 }}>
            <SectionTitle>เรื่องราวชุมชน</SectionTitle>
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

          {/* กระบวนการผลิตทั่วไป */}
          <Box sx={{ mb: 4 }}>
            <SectionTitle>กระบวนการผลิตโดยทั่วไป</SectionTitle>
            <Box sx={{ position: "relative", ml: 1.5 }}>
              <Box sx={{ position: "absolute", left: 11, top: 12, bottom: 20, width: 2, bgcolor: "#E5DFD6" }} />
              {PRODUCTION_PROCESS.map((step) => (
                <Box key={step.id} sx={{ display: "flex", gap: 2, mb: 2.5, position: "relative" }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "#1B2A4A", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, zIndex: 2, flexShrink: 0 }}>
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

          {/* คะแนนรีวิว */}
          {community.reviewCount > 0 && (
            <Box sx={{ mb: 4 }}>
              <SectionTitle>คะแนนรีวิว</SectionTitle>
              <Box sx={{ bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6", display: "flex", alignItems: "center", gap: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "2rem", color: "#1B2A4A", lineHeight: 1 }}>{community.rating.toFixed(1)}</Typography>
                <Box>
                  <Rating value={community.rating} precision={0.1} readOnly size="small" sx={{ "& .MuiRating-iconFilled": { color: "#C5A55A" } }} />
                  <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{community.reviewCount} รีวิว</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* ที่ตั้งชุมชน */}
          {community.address && (
            <Box sx={{ mb: 4 }}>
              <SectionTitle>ที่ตั้งชุมชน</SectionTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6" }}>
                <LocationOnRoundedIcon sx={{ color: "#D8BC82", fontSize: 20 }} />
                <Typography sx={{ fontSize: "0.85rem", color: "#4B5563" }}>{community.address}</Typography>
              </Box>
            </Box>
          )}

          {/* ปุ่มแชท — desktop (มือถือใช้ bottom bar) */}
          <Box sx={{ display: { xs: "none", md: "block" }, mb: 2 }}>
            <Button
              onClick={startChat} disabled={startingChat}
              startIcon={<ChatBubbleOutlineRoundedIcon />}
              sx={{ bgcolor: "#FFFFFF", color: "#1B2A4A", border: "1px solid #C5A55A", borderRadius: "24px", py: 1.25, px: 3, fontWeight: 600, fontSize: "0.9rem", fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "rgba(197,165,90,0.08)" } }}
            >
              แชทกับชุมชน
            </Button>
          </Box>
        </Box>

        {/* ── คอลัมน์ขวา: สลับดูระหว่างสินค้า / ผลงานลายผ้า ── */}
        <Box id="community-products" sx={{ scrollMarginTop: "80px", minWidth: 0 }}>
          {/* แถบสลับมุมมอง */}
          <Box sx={{ display: "flex", gap: 0.5, p: 0.5, mb: 2.5, bgcolor: "#F0EBE3", borderRadius: "999px" }}>
            {([
              { key: "products", label: `สินค้าจากชุมชนนี้${products.length ? ` (${products.length})` : ""}` },
              { key: "patterns", label: `ผลงาน & ลายผ้าที่ทอได้${patterns.length ? ` (${patterns.length})` : ""}` },
            ] as const).map((tab) => {
              const active = showcaseTab === tab.key;
              return (
                <Box
                  key={tab.key}
                  onClick={() => setShowcaseTab(tab.key)}
                  sx={{
                    flex: 1, textAlign: "center", cursor: "pointer", borderRadius: "999px",
                    py: 1, px: 1, transition: "all 0.2s",
                    bgcolor: active ? "#FFFFFF" : "transparent",
                    boxShadow: active ? "0 2px 8px rgba(27,42,74,0.1)" : "none",
                  }}
                >
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", fontWeight: active ? 700 : 500, color: active ? "#1B2A4A" : "#7A7468", lineHeight: 1.3 }}>
                    {tab.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* มุมมองสินค้า */}
          {showcaseTab === "products" && (
            loadingProducts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={22} sx={{ color: "#C5A55A" }} />
              </Box>
            ) : products.length === 0 ? (
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#9CA3AF", fontStyle: "italic", textAlign: "center", py: 4 }}>
                ยังไม่มีสินค้าวางขายจากร้านนี้
              </Typography>
            ) : (
              <>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: { xs: 1.5, md: 2 } }}>
                  {visibleProducts.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </Box>
                {hasMore && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
                    <Button
                      onClick={() => setShowAll((s) => !s)}
                      sx={{ borderRadius: "999px", border: "1px solid #D8CFC0", color: "#13284B", px: 3, py: 1, fontFamily: '"Kanit", sans-serif', fontWeight: 500, fontSize: "0.82rem", textTransform: "none", "&:hover": { bgcolor: "#13284B", color: "#FFFFFF", borderColor: "#13284B" } }}
                    >
                      {showAll ? "ย่อ" : `ดูสินค้าทั้งหมด (${products.length})`}
                    </Button>
                  </Box>
                )}
              </>
            )
          )}

          {/* มุมมองผลงาน & ลายผ้าที่ทอได้ */}
          {showcaseTab === "patterns" && (
            loadingPatterns ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={22} sx={{ color: "#C5A55A" }} />
              </Box>
            ) : patterns.length === 0 ? (
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#9CA3AF", fontStyle: "italic", textAlign: "center", py: 4 }}>
                ชุมชนนี้ยังไม่ได้เพิ่มลายผ้าในพอร์ตโฟลิโอ
              </Typography>
            ) : (
              <>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                  {visiblePatterns.map((p) => (
                    <PatternPortfolioCard key={p.id} pattern={p} shopId={community.id} />
                  ))}
                </Box>
                {patternPageCount > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
                    <Pagination
                      count={patternPageCount}
                      page={patternPage}
                      onChange={(_, v) => setPatternPage(v)}
                      size="small"
                      sx={{ "& .MuiPaginationItem-root": { fontFamily: '"Kanit", sans-serif' }, "& .Mui-selected": { bgcolor: "#1B2A4A !important", color: "#FFFFFF" } }}
                    />
                  </Box>
                )}
              </>
            )
          )}
        </Box>
      </Box>

      {/* Bottom action bar — มือถือเท่านั้น */}
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
          <Button
            onClick={() => {
              setShowcaseTab("products");
              setShowAll(true);
              document.getElementById("community-products")?.scrollIntoView({ behavior: "smooth" });
            }}
            fullWidth
            sx={{ bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "24px", py: 1.5, fontWeight: 600, fontSize: "0.95rem", "&:hover": { bgcolor: "#0F1A30" } }}
          >
            ดูสินค้าทั้งหมดจากชุมชนนี้ ›
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
