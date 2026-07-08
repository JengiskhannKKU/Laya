"use client";
import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { fetchCommunities, type LiveCommunity } from "@/lib/communities";
import Image from "next/image";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import Link from "next/link";
import SectionHeader from "./SectionHeader";

function CommunityCard({ community }: { community: LiveCommunity }) {
  const [imgSrc, setImgSrc] = useState(community.image || "/placeholder.webp");

  return (
    <Link href={`/community/${community.id}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          position: "relative",
          minWidth: { xs: 260, md: "auto" },
          height: { xs: 200, md: 300 },
          borderRadius: "20px",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(27,42,74,0.07)",
          transition:
            "transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 18px 40px rgba(27,42,74,0.16)",
          },
          "&:hover .laya-comm-img": { transform: "scale(1.06)" },
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
            onError={() => setImgSrc("/assets/province-fallback.jpg")}
          />
        </Box>

        {/* Editorial scrim */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(15,26,48,0.82) 0%, rgba(15,26,48,0.15) 55%, transparent 100%)",
          }}
        />

        <Box sx={{ position: "absolute", left: 18, right: 18, bottom: 16 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.4,
              mb: 0.75,
            }}
          >
            <PlaceRoundedIcon sx={{ fontSize: 13, color: "#D4BA7A" }} />
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: "0.65rem",
                fontWeight: 400,
                letterSpacing: "0.06em",
                color: "#D4BA7A",
              }}
            >
              {community.province}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: { xs: "1rem", md: "1.15rem" },
              color: "#FFFFFF",
              lineHeight: 1.3,
              textShadow: "0 2px 10px rgba(0,0,0,0.35)",
            }}
          >
            {community.name}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.8)",
              mt: 0.4,
            }}
          >
            {community.productCount} ผลิตภัณฑ์{community.rating > 0 ? ` · ★ ${community.rating.toFixed(1)}` : ""}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

export default function CommunitiesSection() {
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
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      sx={{ py: { xs: 4, md: 7 } }}
    >
      <SectionHeader
        eyebrow="Community"
        title="ชุมชนทอผ้า"
        subtitle="Discover authentic weaving villages across Thailand"
        href="/community"
      />

      {/* Community Cards — horizontal scroll on mobile, 3-col grid on desktop */}
      <Box
        sx={{
          display: { xs: "flex", md: "grid" },
          gridTemplateColumns: { md: "repeat(3, 1fr)" },
          gap: { xs: 2, md: 3 },
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
