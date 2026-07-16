"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MobileLayout from "@/components/layout/MobileLayout";
import { fetchCommunities, type LiveCommunity } from "@/lib/communities";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// padding มาตรฐานให้เนื้อหาตรงแนวเดียวกับหน้าอื่น (TopNav/search/category)
const CONTENT_PX = { xs: 2.5, sm: 3, md: 5 };

/**
 * การ์ดชุมชนสไตล์ editorial — ภาพเต็มใบ + scrim navy, ข้อความซ้อนล่าง
 * บอก "ชุมชนนี้มีอะไร": จังหวัด, จำนวนผลิตภัณฑ์, เรตติ้ง + CTA สำรวจผลงาน
 */
function CommunityCard({ community, index }: { community: LiveCommunity; index: number }) {
  const { t } = useLanguage();
  const [imgSrc, setImgSrc] = useState(community.image || "/placeholder.webp");
  const hasProducts = community.productCount > 0;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.5, ease: "easeOut" }}
    >
      <Link href={`/community/${community.id}`} style={{ textDecoration: "none" }}>
        <Box
          sx={{
            position: "relative",
            aspectRatio: { xs: "4 / 5", md: "4 / 5" },
            borderRadius: "16px",
            overflow: "hidden",
            cursor: "pointer",
            bgcolor: "#F0EBE3",
            transition:
              "transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 18px 40px rgba(27,42,74,0.18)",
            },
            "&:hover .laya-comm-img": { transform: "scale(1.06)" },
            "&:hover .laya-comm-cta": { gap: "10px", color: "#F5E6C5" },
          }}
        >
          <Box
            className="laya-comm-img"
            sx={{
              position: "absolute",
              inset: 0,
              transition: "transform 0.6s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            <Image
              src={imgSrc}
              alt={community.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 30vw"
              onError={() => setImgSrc("/assets/province-fallback.jpg")}
            />
          </Box>

          {/* Scrim navy — ให้ตัวอักษรขาวอ่านชัดบนภาพ */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(15,26,48,0.88) 0%, rgba(15,26,48,0.45) 42%, rgba(15,26,48,0.08) 70%, transparent 100%)",
            }}
          />

          {/* จำนวนผลิตภัณฑ์ / ป้ายชุมชนใหม่ — มุมขวาบน */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "rgba(255,255,255,0.16)",
              backdropFilter: "blur(6px)",
              px: 1.1,
              py: 0.4,
              borderRadius: "999px",
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 500,
                fontSize: "0.64rem",
                letterSpacing: "0.02em",
                color: "#FFFFFF",
                lineHeight: 1.2,
              }}
            >
              {hasProducts
                ? `${community.productCount} ${t("community.productsUnit")}`
                : t("community.newBadge")}
            </Typography>
          </Box>

          {/* Overlay text — ชิดล่างซ้าย */}
          <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, p: 2 }}>
            {/* ป้ายจังหวัด — จุดทอง */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                mb: 0.9,
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#C9A86A" }} />
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 400,
                  fontSize: "0.68rem",
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.2,
                }}
              >
                {community.province}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 600,
                fontSize: { xs: "1rem", md: "1.08rem" },
                color: "#FFFFFF",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textShadow: "0 1px 10px rgba(0,0,0,0.3)",
              }}
            >
              {community.name}
            </Typography>

            {/* แถวข้อมูล: เรตติ้ง + CTA สำรวจผลงาน */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              {community.reviewCount > 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <StarRoundedIcon sx={{ fontSize: 15, color: "#C9A86A" }} />
                  <Typography
                    sx={{
                      fontFamily: '"Kanit", sans-serif',
                      fontSize: "0.74rem",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {community.rating.toFixed(1)}
                    <Box component="span" sx={{ color: "rgba(255,255,255,0.55)", ml: 0.5 }}>
                      ({community.reviewCount})
                    </Box>
                  </Typography>
                </Box>
              ) : (
                <Box />
              )}

              <Box
                className="laya-comm-cta"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#FFFFFF",
                  transition: "gap 0.25s ease, color 0.25s ease",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Kanit", sans-serif',
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("community.explore")}
                </Typography>
                <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Link>
    </Box>
  );
}

export default function CommunityDirectoryPage() {
  const { t } = useLanguage();
  const [communities, setCommunities] = useState<LiveCommunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities()
      .then(setCommunities)
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileLayout>
      {/* พื้นหลังครีมเต็มความกว้าง viewport — เนื้อหาจัดกึ่งกลาง maxWidth 1440 มีระยะขอบ (CONTENT_PX) */}
      <Box sx={{ mx: "calc(50% - 50vw)", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        <Box sx={{ maxWidth: 1440, mx: "auto", px: CONTENT_PX, pt: { xs: 3.5, md: 6 }, pb: 8 }}>
          {/* Editorial header — eyebrow ทอง + หัวข้อ serif + subtitle */}
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 600,
                fontSize: "0.66rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#C5A55A",
                mb: 0.75,
              }}
            >
              {t("community.eyebrow")}
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
                fontWeight: 700,
                fontSize: { xs: "1.9rem", md: "2.4rem" },
                color: "#13284B",
                lineHeight: 1.15,
              }}
            >
              {t("community.title")}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 300,
                fontSize: { xs: "0.85rem", md: "0.92rem" },
                color: "#7A7468",
                mt: 1,
                maxWidth: 520,
              }}
            >
              {t("community.subtitle")}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
              <CircularProgress size={28} sx={{ color: "#C5A55A" }} />
            </Box>
          ) : communities.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 12 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#9CA3AF" }}>
                {t("community.emptyText")}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: { xs: 2, md: 3 },
              }}
            >
              {communities.map((c, idx) => (
                <CommunityCard key={c.id} community={c} index={idx} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </MobileLayout>
  );
}
