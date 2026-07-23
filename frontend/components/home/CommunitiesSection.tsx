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
 * ชุมชนและร้านค้า แบบ Shopee Mall Official Store Avatar (วงกลมร้านค้ากะทัดรัด)
 * ขนาดกระทัดรัดประหยัดพื้นที่ ขอบวงแหวนสีทอง + ชื่อร้านช่างทอจัดกลาง
 */
function CommunityCircleCard({ community }: { community: LiveCommunity }) {
  const [imgSrc, setImgSrc] = useState(community.image || "/placeholder.webp");

  return (
    <Link href={`/community/${community.id}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: { xs: 76, sm: 84, md: 92 },
          cursor: "pointer",
          flexShrink: 0,
          transition: "transform 0.25s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            "& .shop-avatar-ring": {
              borderColor: "#1B2A4A",
              boxShadow: "0 8px 20px rgba(197,165,90,0.35)",
            },
            "& .shop-avatar-img": {
              transform: "scale(1.08)",
            },
          },
        }}
      >
        {/* วงกลมรูปโปรไฟล์ร้านค้า Shopee Mall Style */}
        <Box
          className="shop-avatar-ring"
          sx={{
            position: "relative",
            width: { xs: 68, sm: 76, md: 84 },
            height: { xs: 68, sm: 76, md: 84 },
            borderRadius: "50%",
            p: "2.5px",
            bgcolor: "#FFFFFF",
            border: "2px solid #C9A86A",
            boxShadow: "0 4px 14px rgba(27,42,74,0.1)",
            transition: "all 0.25s ease",
            overflow: "hidden",
            mb: 1,
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
              style={{ objectFit: "cover", transition: "transform 0.35s ease" }}
              sizes="(max-width: 900px) 80px, 100px"
              onError={() => setImgSrc("/assets/province-fallback.jpg")}
            />
          </Box>
        </Box>

        {/* ชื่อร้านค้า */}
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 600,
            fontSize: { xs: "0.75rem", md: "0.82rem" },
            color: "#1B2A4A",
            lineHeight: 1.2,
            textAlign: "center",
            width: "100%",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minHeight: { xs: 28, md: 30 },
          }}
        >
          {community.name}
        </Typography>

        {/* หมุดจังหวัด */}
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 400,
            fontSize: "0.66rem",
            color: "#C9A86A",
            textAlign: "center",
            mt: 0.2,
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      sx={{ py: { xs: 2.5, md: 4 } }}
    >
      <SectionHeader
        variant="editorial"
        eyebrow={t("home.communities.eyebrow")}
        title={t("home.communities.title")}
        subtitle={t("home.communities.subtitle")}
        href="/community"
      />

      {/* แถบวงกลมร้านค้าสไตล์ Shopee Mall / Official Stores — เลื่อนแนวนอนกะทัดรัด */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: { xs: "flex-start", md: "center" },
          gap: { xs: 2, sm: 3, md: 4 },
          overflowX: "auto",
          px: { xs: 1.5, md: 2 },
          py: 0.5,
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
