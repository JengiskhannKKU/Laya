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

/** การ์ดชุมชนตาม mockup ล่าสุด — ภาพเต็มใบ + scrim navy ด้านล่าง
 * ข้อความซ้อนบนภาพ: ป้ายจังหวัด (จุดทอง) / ชื่อชุมชนขาว / จำนวนผลิตภัณฑ์ */
function CommunityCard({ community }: { community: LiveCommunity }) {
  const [imgSrc, setImgSrc] = useState(community.image || "/placeholder.webp");
  const { t } = useLanguage();

  return (
    <Link href={`/community/${community.id}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          position: "relative",
          minWidth: { xs: 240, md: "auto" },
          aspectRatio: "16 / 11",
          borderRadius: "14px",
          overflow: "hidden",
          cursor: "pointer",
          transition:
            "transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 14px 32px rgba(27,42,74,0.18)",
          },
          "&:hover .laya-comm-img": { transform: "scale(1.05)" },
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
            sizes="(max-width: 900px) 65vw, 33vw"
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
              "linear-gradient(to top, rgba(15,26,48,0.82) 0%, rgba(15,26,48,0.32) 45%, rgba(15,26,48,0.05) 70%, transparent 100%)",
          }}
        />

        {/* Overlay text — ชิดล่างซ้าย */}
        <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, px: 1.75, pb: 1.5 }}>
          {/* ป้ายจังหวัด — จุดทอง + พื้นโปร่งเบลอ */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "rgba(255,255,255,0.16)",
              backdropFilter: "blur(6px)",
              px: 1,
              py: 0.35,
              borderRadius: "999px",
              mb: 0.75,
            }}
          >
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#C9A86A" }} />
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 400,
                fontSize: "0.62rem",
                letterSpacing: "0.04em",
                color: "#FFFFFF",
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
              fontSize: "0.92rem",
              color: "#FFFFFF",
              lineHeight: 1.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textShadow: "0 1px 8px rgba(0,0,0,0.25)",
            }}
          >
            {community.name}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.78)",
              mt: 0.2,
            }}
          >
            {community.productCount} {t("home.communities.products")}
          </Typography>
        </Box>
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
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      sx={{ py: { xs: 4, md: 6 } }}
    >
      <SectionHeader
        variant="editorial"
        eyebrow={t("home.communities.eyebrow")}
        title={t("home.communities.title")}
        subtitle={t("home.communities.subtitle")}
        href="/community"
      />

      {/* 3 คอลัมน์ × 2 แถว (6 ใบ) บน desktop ตาม mockup — มือถือเลื่อนแนวนอน */}
      <Box
        sx={{
          display: { xs: "flex", md: "grid" },
          gridTemplateColumns: { md: "repeat(3, 1fr)" },
          gap: { xs: 2, md: 2.5 },
          overflowX: { xs: "auto", md: "visible" },
          pb: 1,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {communities.slice(0, 6).map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </Box>
    </Box>
  );
}
