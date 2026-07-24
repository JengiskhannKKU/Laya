"use client";

import { useEffect, useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SparklesIcon from "@mui/icons-material/AutoAwesomeRounded";
import MobileLayout from "@/components/layout/MobileLayout";
import { fetchCommunities, type LiveCommunity } from "@/lib/communities";
import { fetchLiveProducts, productDisplayName, type Product } from "@/lib/live-products";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

const SHOP_AVATARS: Record<string, string> = {
  "ตระการตา": "/images/trakanta.webp",
  "Trakanta": "/images/trakanta.webp",
};

const SHOP_COVERS: Record<string, string> = {
  "ตระการตา": "/images/Gallery/LINE_ALBUM_29669_260724_3.webp",
  "Trakanta": "/images/Gallery/LINE_ALBUM_29669_260724_3.webp",
};

/** การ์ดร้านค้าชุมชนทรงกะทัดรัด (Shopee Official Mall Style) */
function CommunityGridCard({ community }: { community: LiveCommunity }) {
  const { t } = useLanguage();
  const coverUrl = SHOP_COVERS[community.name] || community.image || "/images/Gallery/LINE_ALBUM_29669_260724_3.webp";
  const [imgSrc, setImgSrc] = useState(coverUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProd, setLoadingProd] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLiveProducts({ shopId: community.id })
      .then((list) => { if (!cancelled) setProducts(list.slice(0, 2)); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoadingProd(false); });
    return () => { cancelled = true; };
  }, [community.id]);

  const isWeaving = (community.merchantType ?? "weaving_community") === "weaving_community";

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #EFE8DA",
        boxShadow: "0 6px 20px rgba(27,42,74,0.06)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 14px 32px rgba(27,42,74,0.14)",
          borderColor: GOLD,
          "& .shop-banner-img": { transform: "scale(1.05)" },
        },
      }}
    >
      {/* ─── 1. ภาพแบนเนอร์ปกภาพร้านค้า ─── */}
      <Link href={`/community/${community.id}`} style={{ textDecoration: "none" }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            bgcolor: "#EADFCB",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <Image
            src={imgSrc}
            alt={community.name}
            fill
            className="shop-banner-img"
            style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            onError={() => setImgSrc("/images/Gallery/LINE_ALBUM_29669_260724_3.webp")}
          />

          {/* Scrim Gradation */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(15,26,48,0.75) 100%)",
            }}
          />

          {/* ป้ายประเภทร้านค้า */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: "rgba(15,26,48,0.85)",
              color: GOLD,
              border: "1px solid rgba(197,165,90,0.4)",
              fontFamily: FONT,
              fontSize: "0.68rem",
              fontWeight: 600,
              px: 1.25,
              py: 0.3,
              borderRadius: "999px",
              backdropFilter: "blur(6px)",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <VerifiedRoundedIcon sx={{ fontSize: 13, color: GOLD }} />
            {isWeaving ? "ชุมชนช่างทอ" : "ร้านค้า/นักออกแบบ"}
          </Box>

          {/* ป้ายจังหวัด */}
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: 12,
              color: "#FFFFFF",
              fontFamily: FONT,
              fontSize: "0.72rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              textShadow: "0 1px 4px rgba(0,0,0,0.6)",
            }}
          >
            <LocationOnRoundedIcon sx={{ fontSize: 14, color: GOLD }} />
            {community.province}
          </Box>
        </Box>
      </Link>

      {/* ─── 2. ข้อมูลชื่อร้านและสถิติ ─── */}
      <Box sx={{ p: { xs: 2, md: 2.5 }, flex: 1, display: "flex", flexDirection: "column" }}>
        <Link href={`/community/${community.id}`} style={{ textDecoration: "none" }}>
          <Typography
            component="h3"
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: { xs: "1.05rem", md: "1.18rem" },
              color: NAVY,
              lineHeight: 1.3,
              mb: 0.5,
              cursor: "pointer",
              "&:hover": { color: GOLD },
            }}
          >
            {community.name}
          </Typography>
        </Link>

        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: "0.78rem",
            color: "#6B7280",
            mb: 1.75,
          }}
        >
          {community.productCount > 0
            ? `${community.productCount} ผลิตภัณฑ์พร้อมขาย`
            : "สินค้าพร้อมสั่งตัดทอมือ"}
          {community.rating > 0 && ` · ⭐ ${community.rating.toFixed(1)} (${community.reviewCount})`}
        </Typography>

        {/* ─── 3. พรีวิวสินค้าเด่น 2 ชิ้น ─── */}
        <Box sx={{ mt: "auto" }}>
          {loadingProd ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={18} sx={{ color: GOLD }} />
            </Box>
          ) : products.length > 0 ? (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2 }}>
              {products.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} style={{ textDecoration: "none" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 0.75,
                      borderRadius: "10px",
                      bgcolor: "#FAF7F2",
                      border: "1px solid #EFE8DA",
                      transition: "border-color 0.2s ease",
                      "&:hover": { borderColor: GOLD },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: 38,
                        height: 38,
                        borderRadius: "6px",
                        overflow: "hidden",
                        flexShrink: 0,
                        bgcolor: "#E0D7C6",
                      }}
                    >
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: FONT,
                          fontWeight: 500,
                          fontSize: "0.72rem",
                          color: NAVY,
                        }}
                      >
                        {p.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: FONT,
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          color: GOLD,
                        }}
                      >
                        ฿{p.price.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Link>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                p: 1.25,
                borderRadius: "10px",
                bgcolor: "#FAF7F2",
                textAlign: "center",
                mb: 2,
              }}
            >
              <Typography sx={{ fontFamily: FONT, fontSize: "0.74rem", color: "#9CA3AF" }}>
                ✨ มีบริการรับสั่งตัดและสั่งทอตามสั่ง
              </Typography>
            </Box>
          )}

          {/* ปุ่ม CTA เข้าสู่ร้านค้า */}
          <Link href={`/community/${community.id}`} style={{ textDecoration: "none" }}>
            <Button
              fullWidth
              variant="outlined"
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderColor: NAVY,
                color: NAVY,
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.82rem",
                borderRadius: "999px",
                py: 0.9,
                textTransform: "none",
                "&:hover": {
                  bgcolor: NAVY,
                  color: "#FFFFFF",
                  borderColor: NAVY,
                },
              }}
            >
              เข้าชมร้านค้า
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default function CommunityDirectoryPage() {
  const { t } = useLanguage();
  const [communities, setCommunities] = useState<LiveCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "weaving" | "designer">("all");

  useEffect(() => {
    fetchCommunities()
      .then(setCommunities)
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCommunities = useMemo(() => {
    if (activeTab === "weaving") {
      return communities.filter((c) => (c.merchantType ?? "weaving_community") === "weaving_community");
    }
    if (activeTab === "designer") {
      return communities.filter((c) => c.merchantType === "designer" || c.merchantType === "retailer");
    }
    return communities;
  }, [communities, activeTab]);

  return (
    <MobileLayout>
      <Box sx={{ mx: "calc(50% - 50vw)", bgcolor: "#FAF7F2", minHeight: "100vh", pb: 8 }}>
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2.5, sm: 3, md: 5 }, pt: { xs: 3.5, md: 6 } }}>

          {/* ─── 1. Page Header ─── */}
          <Box sx={{ textAlign: "center", mb: { xs: 3.5, md: 5 } }}>
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
                COMMUNITY DIRECTORY
              </Typography>
              <SparklesIcon sx={{ fontSize: 16, color: GOLD }} />
            </Box>

            <Typography
              component="h1"
              sx={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: { xs: "1.85rem", sm: "2.3rem", md: "2.6rem" },
                color: NAVY,
                letterSpacing: "-0.01em",
              }}
            >
              ชุมชนช่างทอ & ร้านค้าผ้าไทย
            </Typography>

            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: { xs: "0.88rem", md: "1rem" },
                color: "#6B7280",
                mt: 1,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              รวบรวมกลุ่มหัตถกรรมทอมือโบราณ ชุมชนช่างทอชั้นครู และแบรนด์ดีไซเนอร์ที่ได้รับรองจาก LAYA
            </Typography>
          </Box>

          {/* ─── 2. Shopee Style Circle Avatars Bar (สไลด์แนวนอน) ─── */}
          {communities.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  color: GOLD,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  mb: 1.5,
                  textAlign: { xs: "left", md: "center" },
                }}
              >
                OFFICIAL STORES & COMMUNITIES
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "flex-start", md: "center" },
                  gap: { xs: 2, sm: 3, md: 3.5 },
                  overflowX: "auto",
                  py: 1,
                  px: 0.5,
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {communities.map((c) => (
                  <Link key={c.id} href={`/community/${c.id}`} style={{ textDecoration: "none" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: { xs: 72, md: 84 },
                        flexShrink: 0,
                        cursor: "pointer",
                        "&:hover .circle-avatar": {
                          borderColor: NAVY,
                          transform: "scale(1.08)",
                        },
                      }}
                    >
                      <Box
                        className="circle-avatar"
                        sx={{
                          position: "relative",
                          width: { xs: 64, md: 74 },
                          height: { xs: 64, md: 74 },
                          borderRadius: "50%",
                          p: "2.5px",
                          bgcolor: "#FFFFFF",
                          border: "2px solid #C9A86A",
                          boxShadow: "0 4px 12px rgba(27,42,74,0.1)",
                          overflow: "hidden",
                          mb: 0.75,
                          transition: "all 0.3s ease",
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            src={SHOP_AVATARS[c.name] || c.image || "/images/trakanta.webp"}
                            alt={c.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </Box>
                      </Box>

                      <Typography
                        noWrap
                        sx={{
                          fontFamily: FONT,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          color: NAVY,
                          textAlign: "center",
                          width: "100%",
                        }}
                      >
                        {c.name}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            </Box>
          )}

          {/* ─── 3. Filter Category Tabs ─── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mb: { xs: 3.5, md: 5 },
            }}
          >
            <Chip
              label={`ทั้งหมด (${communities.length})`}
              onClick={() => setActiveTab("all")}
              sx={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.85rem",
                py: 2.2,
                px: 1.5,
                borderRadius: "999px",
                bgcolor: activeTab === "all" ? NAVY : "#FFFFFF",
                color: activeTab === "all" ? "#FFFFFF" : NAVY,
                border: "1px solid",
                borderColor: activeTab === "all" ? NAVY : "#EFE8DA",
                cursor: "pointer",
                "&:hover": { bgcolor: activeTab === "all" ? NAVY : "#EFE8DA" },
              }}
            />
            <Chip
              label="ชุมชนช่างทอ"
              onClick={() => setActiveTab("weaving")}
              sx={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.85rem",
                py: 2.2,
                px: 1.5,
                borderRadius: "999px",
                bgcolor: activeTab === "weaving" ? NAVY : "#FFFFFF",
                color: activeTab === "weaving" ? "#FFFFFF" : NAVY,
                border: "1px solid",
                borderColor: activeTab === "weaving" ? NAVY : "#EFE8DA",
                cursor: "pointer",
                "&:hover": { bgcolor: activeTab === "weaving" ? NAVY : "#EFE8DA" },
              }}
            />
            <Chip
              label="ร้านค้า & นักออกแบบ"
              onClick={() => setActiveTab("designer")}
              sx={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: "0.85rem",
                py: 2.2,
                px: 1.5,
                borderRadius: "999px",
                bgcolor: activeTab === "designer" ? NAVY : "#FFFFFF",
                color: activeTab === "designer" ? "#FFFFFF" : NAVY,
                border: "1px solid",
                borderColor: activeTab === "designer" ? NAVY : "#EFE8DA",
                cursor: "pointer",
                "&:hover": { bgcolor: activeTab === "designer" ? NAVY : "#EFE8DA" },
              }}
            />
          </Box>

          {/* ─── 4. Main Store Grid (2-3 Columns) ─── */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
              <CircularProgress size={28} sx={{ color: GOLD }} />
            </Box>
          ) : filteredCommunities.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <StorefrontRoundedIcon sx={{ fontSize: 48, color: "#C5A55A", mb: 1, opacity: 0.6 }} />
              <Typography sx={{ fontFamily: FONT, fontSize: "0.95rem", color: "#9CA3AF" }}>
                ยังไม่มีข้อมูลร้านค้าในหมวดหมู่นี้
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: { xs: 2.5, md: 3.5 },
              }}
            >
              {filteredCommunities.map((c) => (
                <CommunityGridCard key={c.id} community={c} />
              ))}
            </Box>
          )}

        </Box>
      </Box>
    </MobileLayout>
  );
}
