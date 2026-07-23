"use client";
import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { fetchCommunities, type LiveCommunity } from "@/lib/communities";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/** 
 * ชุมชนและร้านค้า แบบ Shopee Official Mall Avatar (วงกลมร้านค้ากะทัดรัด)
 * โลโก้/รูปทรงวงกลมขอบสีทองวิบวับ + ชื่อร้านค้าและจังหวัดด้านล่าง
 */
function CommunityCircleCard({ community }: { community: LiveCommunity }) {
  const [imgSrc, setImgSrc] = useState(community.image || "/placeholder.webp");
  const { t } = useLanguage();

  return (
    <Link href={`/community/${community.id}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: { xs: 90, sm: 104, md: 114 },
          cursor: "pointer",
          flexShrink: 0,
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            "& .shop-avatar-ring": {
              borderColor: "#1B2A4A",
              boxShadow: "0 10px 24px rgba(197,165,90,0.35)",
            },
            "& .shop-avatar-img": {
              transform: "scale(1.08)",
            },
          },
        }}
      >
        {/* วงกลมรูปโปรไฟล์ร้านค้า (Shopee Mall / Instagram Story Style) */}
        <Box
          className="shop-avatar-ring"
          sx={{
            position: "relative",
            width: { xs: 80, sm: 92, md: 100 },
            height: { xs: 80, sm: 92, md: 100 },
            borderRadius: "50%",
            p: "3px", // ขอบวงแหวนสีทอง
            bgcolor: "#FFFFFF",
            border: "2px solid #C9A86A",
            boxShadow: "0 6px 18px rgba(27,42,74,0.12)",
            transition: "all 0.3s ease",
            overflow: "hidden",
            mb: 1.25,
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              bgcolor: "#FAF7F2",
            }}
          >
            <Image
              src={imgSrc}
              alt={community.name}
              fill
              className="shop-avatar-img"
              style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
              sizes="(max-width: 900px) 100px, 120px"
              onError={() => setImgSrc("/assets/province-fallback.jpg")}
            />
          </Box>
        </Box>

        {/* ชื่อร้านค้า */}
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 600,
            fontSize: { xs: "0.8rem", md: "0.86rem" },
            color: "#1B2A4A",
            lineHeight: 1.25,
            textAlign: "center",
            width: "100%",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minHeight: { xs: 32, md: 34 },
          }}
        >
          {community.name}
        </Typography>

        {/* จังหวัด */}
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 400,
            fontSize: "0.7rem",
            color: "#C9A86A",
            textAlign: "center",
            mt: 0.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          📍 {community.province}
        </Typography>
      </Box>
    </Link>
  );
}

export default function CommunitiesSection() {
  const { t } = useLanguage();
  const [communities, setCommunities] = useState<LiveCommunity[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchCommunities()
      .then((list) => { if (!cancelled) setCommunities(list); })
      .catch(() => { if (!cancelled) setCommunities([]); });
    return () => { cancelled = true; };
  }, []);

  if (communities.length === 0) return null;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      sx={{ py: { xs: 3.5, md: 5 } }}
    >
      <SectionHeader
        variant="editorial"
        eyebrow={t("home.communities.eyebrow")}
        title={t("home.communities.title")}
        subtitle={t("home.communities.subtitle")}
        href="/community"
      />

      {/* แถบวงกลมร้านค้าชุมชนสไตล์ Shopee Mall — เลื่อนแนวนอนบนมือถือ / จัดกึ่งกลางบน desktop */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: { xs: "flex-start", md: "center" },
          gap: { xs: 2.5, sm: 3.5, md: 4.5 },
          overflowX: "auto",
          px: { xs: 1, md: 2 },
          py: 1,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {communities.map((community) => (
          <CommunityCircleCard key={community.id} community={community} />
        ))}
      </Box>
    </Box>
  );
}
