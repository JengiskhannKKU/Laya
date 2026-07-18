"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import { motion } from "framer-motion";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getMomentById, toggleLike, loadLikedIds, type Moment } from "@/lib/moments";

const CONTENT_PX = { xs: 2.5, sm: 3, md: 5 };

export default function MomentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale } = useLanguage();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [moment, setMoment] = useState<Moment | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  // โพสต์ผู้ใช้อยู่ใน localStorage → หาได้เฉพาะฝั่ง client (useEffect) กัน false-negative ตอน SSR
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const m = id ? getMomentById(id) ?? null : null;
    setMoment(m);
    setLikeCount(m?.likeCount ?? 0);
    setLiked(m ? loadLikedIds().includes(m.id) : false);
    setReady(true);
  }, [id]);

  const handleLike = () => {
    if (!moment) return;
    if (!user) { router.push("/auth/login"); return; }
    const nextLiked = toggleLike(moment.id);
    const nowLiked = nextLiked.includes(moment.id);
    setLiked(nowLiked);
    setLikeCount((c) => Math.max(0, c + (nowLiked ? 1 : -1)));
  };

  const dateLabel = moment
    ? new Date(moment.createdAt).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { year: "numeric", month: "short", day: "numeric" })
    : "";

  if (ready && !moment) {
    return (
      <MobileLayout>
        <Box sx={{ textAlign: "center", py: 12, px: 3 }}>
          <Typography sx={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif', fontWeight: 700, fontSize: "1.6rem", color: "#13284B", mb: 1 }}>
            {t("search.feed.notFound")}
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#7A7468", mb: 3, maxWidth: 420, mx: "auto" }}>
            {t("search.feed.notFoundNote")}
          </Typography>
          <Button onClick={() => router.push("/search")} variant="contained" startIcon={<ArrowBackRoundedIcon />} sx={{ borderRadius: "999px", bgcolor: "#13284B", fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "#0e1f3c" } }}>
            {t("search.feed.backToFeed")}
          </Button>
        </Box>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        {/* Cover hero — ชนขอบ viewport (mx trick) สไตล์ Lemon8 */}
        <Box sx={{ mx: "calc(50% - 50vw)", position: "relative", width: "100vw", aspectRatio: { xs: "4 / 3", sm: "16 / 9", md: "21 / 9" }, maxHeight: { xs: 340, md: 620 }, overflow: "hidden", bgcolor: "#F0EBE3" }}>
          {moment && <Image src={moment.cover} alt={moment.title} fill priority style={{ objectFit: "cover" }} sizes="100vw" />}
          {/* ไล่เฉดบน-ล่างให้ปุ่มย้อนกลับ/ขอบภาพนุ่ม */}
          <Box aria-hidden sx={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(15,26,48,0.35) 0%, transparent 22%, transparent 78%, rgba(15,26,48,0.15) 100%)" }} />
          <IconButton onClick={() => router.back()} sx={{ position: "absolute", top: 16, left: 16, bgcolor: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", "&:hover": { bgcolor: "#FFFFFF" } }}>
            <ArrowBackRoundedIcon sx={{ color: "#13284B" }} />
          </IconButton>
        </Box>

        {/* เนื้อหา */}
        <Box sx={{ maxWidth: 760, mx: "auto", px: CONTENT_PX, pt: { xs: 3, md: 4 }, pb: 8 }}>
          {moment && (
            <>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, bgcolor: moment.type === "review" ? "rgba(197,90,90,0.12)" : "rgba(19,40,75,0.06)", px: 1.25, py: 0.4, borderRadius: "999px", mb: 1.5 }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em", color: moment.type === "review" ? "#C5573C" : "#13284B" }}>
                  {moment.type === "review" ? t("search.feed.typeReview") : t("search.feed.typeBlog")} · {moment.topic}
                </Typography>
              </Box>

              <Typography component="h1" sx={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif', fontWeight: 700, fontSize: { xs: "1.9rem", md: "2.5rem" }, color: "#13284B", lineHeight: 1.18, mb: 2 }}>
                {moment.title}
              </Typography>

              {/* ผู้เขียน + วันที่ + เรตติ้ง */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, pb: 3, borderBottom: "1px solid #E9E2D6" }}>
                <Box sx={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, bgcolor: "rgba(197,165,90,0.18)", border: "1px solid rgba(197,165,90,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.95rem", fontWeight: 700, color: "#B8954A" }}>{(moment.authorName?.[0] ?? "L").toUpperCase()}</Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", fontWeight: 600, color: "#13284B" }}>{moment.authorName}</Typography>
                    {moment.official && <VerifiedRoundedIcon sx={{ fontSize: 16, color: "#C5A55A" }} />}
                  </Box>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.74rem", color: "#9CA3AF" }}>{dateLabel}</Typography>
                </Box>
                {moment.type === "review" && moment.rating != null && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, ml: "auto", bgcolor: "#FAF6F0", px: 1.25, py: 0.5, borderRadius: "999px" }}>
                    <StarRoundedIcon sx={{ fontSize: 16, color: "#C5A55A" }} />
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", fontWeight: 600, color: "#5A6472" }}>{moment.rating}</Typography>
                  </Box>
                )}
              </Box>

              {/* เนื้อหาโพสต์ */}
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 300, fontSize: { xs: "0.95rem", md: "1.02rem" }, color: "#3F4756", lineHeight: 2, whiteSpace: "pre-wrap" }}>
                {moment.body}
              </Typography>

              {/* รูปทั้งหมดของโพสต์ (โพสต์แบบหลายรูป/หลายลุค) */}
              {moment.images && moment.images.length > 1 && (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.25, mt: 3 }}>
                  {moment.images.map((img, i) => (
                    <Box key={img + i} sx={{ position: "relative", width: "100%", aspectRatio: "3 / 4", borderRadius: "12px", overflow: "hidden", bgcolor: "#F0EBE3" }}>
                      <Image src={img} alt={`${moment.title} — ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="(max-width: 600px) 45vw, 240px" />
                    </Box>
                  ))}
                </Box>
              )}

              {/* แท็กสินค้า */}
              {moment.taggedProduct && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, mt: 3, bgcolor: "#F0EBE3", px: 1.75, py: 0.9, borderRadius: "999px" }}>
                  <LocalOfferRoundedIcon sx={{ fontSize: 15, color: "#B8954A" }} />
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#5A6472" }}>{moment.taggedProduct}</Typography>
                </Box>
              )}

              {/* แถบถูกใจ */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 5 }}>
                <Button
                  onClick={handleLike}
                  startIcon={liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                  sx={{
                    borderRadius: "999px", px: 2.5, py: 1, textTransform: "none", fontFamily: '"Kanit", sans-serif', fontWeight: 500,
                    border: "1px solid #E5DFD6", color: liked ? "#C5573C" : "#5A6472", bgcolor: liked ? "rgba(197,87,60,0.06)" : "#FFFFFF",
                    "&:hover": { bgcolor: liked ? "rgba(197,87,60,0.1)" : "#FAF6F0", borderColor: "#D8CFC0" },
                  }}
                >
                  {t("search.feed.likeAction")} · {likeCount}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </MobileLayout>
  );
}
