"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import MobileLayout from "@/components/layout/MobileLayout";
import { fetchCommunities, type LiveCommunity } from "@/lib/communities";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
      <Box sx={{ pt: 3, pb: 4, bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        <Box sx={{ px: 2.5, mb: 2.5 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.4rem", color: "#1B2A4A" }}>
            {t("community.title")}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>
            {t("community.subtitle")}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={28} sx={{ color: "#C5A55A" }} />
          </Box>
        ) : communities.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10, px: 3 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#9CA3AF" }}>
              {t("community.emptyText")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ px: 2, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 1.5 }}>
            {communities.map((c, idx) => (
              <Link key={c.id} href={`/community/${c.id}`} style={{ textDecoration: "none" }}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  sx={{
                    bgcolor: "#FFFFFF", borderRadius: "16px", overflow: "hidden",
                    border: "1px solid #E5DFD6", boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <Box sx={{ position: "relative", height: 110, bgcolor: "#F0EBE3" }}>
                    {c.image && <Image src={c.image} alt={c.name} fill style={{ objectFit: "cover" }} />}
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>
                      {c.name}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem", color: "#6B7280", mt: 0.3 }}>
                      {c.province} · {c.productCount} {t("community.productsUnit")}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, mt: 0.5 }}>
                      <StarRoundedIcon sx={{ fontSize: 13, color: "#C5A55A" }} />
                      <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>
                        {c.rating.toFixed(1)} ({c.reviewCount})
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Link>
            ))}
          </Box>
        )}
      </Box>
    </MobileLayout>
  );
}
