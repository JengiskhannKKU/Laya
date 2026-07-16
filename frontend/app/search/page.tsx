"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import Rating from "@mui/material/Rating";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  getAllMoments,
  saveUserMoment,
  toggleLike,
  loadLikedIds,
  MOMENT_TOPICS,
  COVER_PRESETS,
  type Moment,
  type MomentType,
} from "@/lib/moments";

// padding มาตรฐานให้เนื้อหาตรงแนวเดียวกับ TopNav — bar เต็มขอบ แต่คอนเทนต์ยังมีระยะขอบ
const CONTENT_PX = { xs: 2.5, sm: 3, md: 5 };
// อัตราส่วนปกหลายแบบ วนตาม index — masonry แบบ Pinterest/Lemon8
const PIN_RATIOS = ["3 / 4", "1 / 1", "4 / 5", "3 / 4", "1 / 1.25", "4 / 3"];

/** การ์ดโพสต์ (บทความ/รีวิว) สไตล์ Lemon8 — ปก + ป้ายประเภท/เรตติ้ง, หัวข้อ, ผู้เขียน, ไลก์ */
function MomentCard({
  moment,
  index,
  liked,
  onLike,
  onOpen,
}: {
  moment: Moment;
  index: number;
  liked: boolean;
  onLike: (id: string) => void;
  onOpen: (m: Moment) => void;
}) {
  const { t } = useLanguage();
  const ratio = PIN_RATIOS[index % PIN_RATIOS.length];
  const initial = (moment.authorName?.[0] ?? "L").toUpperCase();
  const isReview = moment.type === "review";

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.45, ease: "easeOut" }}
      onClick={() => onOpen(moment)}
      sx={{
        breakInside: "avoid",
        WebkitColumnBreakInside: "avoid",
        display: "inline-block",
        width: "100%",
        mb: { xs: 1.5, md: 2 },
        cursor: "pointer",
        borderRadius: "16px",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
        border: "1px solid rgba(19,40,75,0.06)",
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 32px rgba(27,42,74,0.14)" },
        "&:hover .laya-pin-img": { transform: "scale(1.05)" },
      }}
    >
      <Box sx={{ position: "relative", width: "100%", aspectRatio: ratio, overflow: "hidden", bgcolor: "#F0EBE3" }}>
        <Box className="laya-pin-img" sx={{ position: "absolute", inset: 0, transition: "transform 0.6s cubic-bezier(0.22,0.61,0.36,1)" }}>
          <Image src={moment.cover} alt={moment.title} fill style={{ objectFit: "cover" }} sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 20vw" />
        </Box>

        {/* ป้ายประเภท: บทความ / รีวิว(+ดาว) */}
        <Box
          sx={{
            position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 0.4,
            bgcolor: isReview ? "rgba(197,90,90,0.94)" : "rgba(19,40,75,0.9)", px: 0.9, py: 0.35, borderRadius: "999px",
          }}
        >
          {isReview ? <RateReviewRoundedIcon sx={{ fontSize: 11, color: "#FFFFFF" }} /> : <ArticleRoundedIcon sx={{ fontSize: 11, color: "#FFFFFF" }} />}
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.58rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
            {isReview ? t("search.feed.typeReview") : t("search.feed.typeBlog")}
            {isReview && moment.rating ? ` ${moment.rating}` : ""}
          </Typography>
        </Box>
      </Box>

      {/* เนื้อหาการ์ด */}
      <Box sx={{ px: 1.25, pt: 1, pb: 1.25 }}>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif', fontWeight: 500, fontSize: "0.85rem", color: "#13284B", lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {moment.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.9 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, minWidth: 0 }}>
            <Box sx={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, bgcolor: "rgba(197,165,90,0.18)", border: "1px solid rgba(197,165,90,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.6rem", fontWeight: 700, color: "#B8954A", lineHeight: 1 }}>{initial}</Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.68rem", fontWeight: 300, color: "#7A7468", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {moment.authorName}
            </Typography>
            {moment.official && <VerifiedRoundedIcon sx={{ fontSize: 13, color: "#C5A55A", flexShrink: 0 }} />}
          </Box>

          <Box
            onClick={(e) => { e.stopPropagation(); onLike(moment.id); }}
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, flexShrink: 0, cursor: "pointer" }}
          >
            {liked ? <FavoriteRoundedIcon sx={{ fontSize: 15, color: "#C5573C" }} /> : <FavoriteBorderRoundedIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />}
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.68rem", color: "#7A7468" }}>{moment.likeCount}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/** ตัวเขียนโพสต์ (ต้นแบบ — บันทึกลง localStorage) */
function ComposeSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (m: { type: MomentType; title: string; body: string; cover: string; topic: string; rating?: number; taggedProduct?: string }) => void;
}) {
  const { t } = useLanguage();
  const [type, setType] = useState<MomentType>("blog");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cover, setCover] = useState(COVER_PRESETS[0]);
  const [topic, setTopic] = useState<string>(MOMENT_TOPICS[0]);
  const [rating, setRating] = useState<number>(5);
  const [taggedProduct, setTaggedProduct] = useState("");
  const [error, setError] = useState(false);

  const reset = () => {
    setType("blog"); setTitle(""); setBody(""); setCover(COVER_PRESETS[0]);
    setTopic(MOMENT_TOPICS[0]); setRating(5); setTaggedProduct(""); setError(false);
  };

  const submit = () => {
    if (!title.trim() || !body.trim()) { setError(true); return; }
    onSubmit({
      type, title: title.trim(), body: body.trim(), cover, topic,
      rating: type === "review" ? rating : undefined,
      taggedProduct: taggedProduct.trim() || undefined,
    });
    reset();
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", bgcolor: "#FFFFFF" },
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} PaperProps={{ sx: { borderTopLeftRadius: "24px", borderTopRightRadius: "24px", maxHeight: "92vh", maxWidth: 620, mx: "auto", width: "100%" } }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.15rem", color: "#1B2A4A" }}>{t("search.feed.composeTitle")}</Typography>
          <IconButton onClick={onClose}><CloseRoundedIcon /></IconButton>
        </Box>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.83rem", color: "#6B7280", mb: 2 }}>{t("search.feed.composeSubtitle")}</Typography>

        {/* ประเภท */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {(["blog", "review"] as MomentType[]).map((ty) => {
            const active = type === ty;
            return (
              <Box
                key={ty}
                onClick={() => setType(ty)}
                sx={{
                  flex: 1, textAlign: "center", py: 1, borderRadius: "12px", cursor: "pointer",
                  border: `1px solid ${active ? "#13284B" : "#E5DFD6"}`, bgcolor: active ? "#13284B" : "#FFFFFF",
                  transition: "all 0.2s",
                }}
              >
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", fontWeight: 600, color: active ? "#FFFFFF" : "#5A6472" }}>
                  {ty === "blog" ? t("search.feed.typeBlog") : t("search.feed.typeReview")}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* รูปปก */}
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.82rem", color: "#1B2A4A", mb: 0.75 }}>{t("search.feed.composeCoverLabel")}</Typography>
        <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1, mb: 2, "&::-webkit-scrollbar": { display: "none" } }}>
          {COVER_PRESETS.map((c) => (
            <Box
              key={c}
              onClick={() => setCover(c)}
              sx={{
                position: "relative", flexShrink: 0, width: 72, height: 72, borderRadius: "12px", overflow: "hidden", cursor: "pointer",
                border: `2px solid ${cover === c ? "#C5A55A" : "transparent"}`,
              }}
            >
              <Image src={c} alt="cover" fill style={{ objectFit: "cover" }} sizes="72px" />
            </Box>
          ))}
        </Box>

        <TextField fullWidth placeholder={t("search.feed.composeTitlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} sx={{ ...inputSx, mb: 1.5 }} />
        <TextField fullWidth multiline minRows={4} placeholder={t("search.feed.composeBodyPlaceholder")} value={body} onChange={(e) => setBody(e.target.value)} sx={{ ...inputSx, mb: 2 }} />

        {/* หัวข้อ */}
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.82rem", color: "#1B2A4A", mb: 0.75 }}>{t("search.feed.composeTopicLabel")}</Typography>
        <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 2 }}>
          {MOMENT_TOPICS.map((tp) => {
            const active = topic === tp;
            return (
              <Box key={tp} onClick={() => setTopic(tp)} sx={{ px: 1.5, py: 0.6, borderRadius: "999px", cursor: "pointer", bgcolor: active ? "#13284B" : "#F0EBE3" }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.76rem", fontWeight: active ? 600 : 400, color: active ? "#FFFFFF" : "#5A6472" }}>{tp}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* เรตติ้ง (เฉพาะรีวิว) */}
        {type === "review" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.82rem", color: "#1B2A4A" }}>{t("search.feed.composeRatingLabel")}</Typography>
            <Rating value={rating} onChange={(_, v) => setRating(v ?? 0)} precision={0.5} sx={{ color: "#C5A55A" }} />
          </Box>
        )}

        <TextField fullWidth placeholder={t("search.feed.composeTagProductPlaceholder")} label={t("search.feed.composeTagProduct")} value={taggedProduct} onChange={(e) => setTaggedProduct(e.target.value)} InputLabelProps={{ sx: { fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem" } }} sx={{ ...inputSx, mb: 1.5 }} />

        {error && (
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", color: "#C5573C", mb: 1 }}>{t("search.feed.composeRequired")}</Typography>
        )}

        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem", color: "#9CA3AF", mb: 1.5 }}>{t("search.feed.composeLocalNote")}</Typography>

        <Button fullWidth onClick={submit} variant="contained" sx={{ borderRadius: "12px", bgcolor: "#13284B", fontWeight: 600, fontFamily: '"Kanit", sans-serif', textTransform: "none", py: 1.25, "&:hover": { bgcolor: "#0e1f3c" } }}>
          {t("search.feed.composeSubmit")}
        </Button>
      </Box>
    </Drawer>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [moments, setMoments] = useState<Moment[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedChip, setSelectedChip] = useState("all");
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    setMoments(getAllMoments());
    setLikedIds(loadLikedIds());
  }, []);

  // ชิปกรอง: ทั้งหมด / รีวิว / บทความ / หัวข้อผ้า
  const chips: { key: string; label: string }[] = [
    { key: "all", label: t("search.feed.allTopics") },
    { key: "type:review", label: t("search.feed.typeReview") },
    { key: "type:blog", label: t("search.feed.typeBlog") },
    ...MOMENT_TOPICS.map((tp) => ({ key: `topic:${tp}`, label: tp })),
  ];

  const filtered = useMemo(() => {
    let result = [...moments];
    if (selectedChip.startsWith("type:")) {
      const ty = selectedChip.slice(5);
      result = result.filter((m) => m.type === ty);
    } else if (selectedChip.startsWith("topic:")) {
      const tp = selectedChip.slice(6);
      result = result.filter((m) => m.topic === tp);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (m) => m.title.toLowerCase().includes(q) || m.body.toLowerCase().includes(q) || m.authorName.toLowerCase().includes(q) || m.topic.toLowerCase().includes(q)
      );
    }
    return result;
  }, [moments, selectedChip, query]);

  const handleLike = (id: string) => {
    if (!user) { router.push("/auth/login"); return; }
    const nextLiked = toggleLike(id);
    const nowLiked = nextLiked.includes(id);
    setLikedIds(nextLiked);
    setMoments((prev) => prev.map((m) => (m.id === id ? { ...m, likeCount: Math.max(0, m.likeCount + (nowLiked ? 1 : -1)) } : m)));
  };

  const handlePost = (input: { type: MomentType; title: string; body: string; cover: string; topic: string; rating?: number; taggedProduct?: string }) => {
    const authorName = user?.email ? user.email.split("@")[0] : "คุณ";
    const all = saveUserMoment({ ...input, authorName });
    setMoments(all);
    setComposeOpen(false);
  };

  const openCompose = () => {
    if (!user) { router.push("/auth/login"); return; }
    setComposeOpen(true);
  };

  return (
    <MobileLayout>
      {/* mx: calc(50% - 50vw) → bar เต็มขอบเหมือน top bar, คอนเทนต์จัดระยะขอบเองผ่าน CONTENT_PX */}
      <Box sx={{ mx: "calc(50% - 50vw)", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        {/* ── Sticky bar: ค้นหา + ปุ่มเขียน + ชิปกรอง ── */}
        <Box sx={{ bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #E5DFD6" }}>
          <Box sx={{ maxWidth: 1440, mx: "auto", px: CONTENT_PX, pt: 3, pb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", bgcolor: "#FAF6F0", borderRadius: "999px", px: 2, py: 0.5, border: "1px solid #E5DFD6" }}>
                <SearchRoundedIcon sx={{ color: "#9CA3AF", fontSize: 20, mr: 1 }} />
                <TextField
                  fullWidth variant="standard" placeholder={t("search.placeholder")} value={query}
                  onChange={(e) => setQuery(e.target.value)} InputProps={{ disableUnderline: true }}
                  sx={{ "& input": { fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", py: 0.8, color: "#1B2A4A" } }}
                />
              </Box>
              <Button
                onClick={openCompose}
                startIcon={<EditRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  display: { xs: "none", sm: "inline-flex" }, flexShrink: 0, bgcolor: "#13284B", color: "#FFFFFF",
                  borderRadius: "999px", px: 2.25, textTransform: "none", fontFamily: '"Kanit", sans-serif', fontWeight: 500, fontSize: "0.82rem",
                  "&:hover": { bgcolor: "#0e1f3c" },
                }}
              >
                {user ? t("search.feed.postMoment") : t("search.feed.loginToPost")}
              </Button>
            </Box>

            {/* ชิปกรอง */}
            <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pt: 1.5, pb: 0.25, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
              {chips.map((c) => {
                const active = selectedChip === c.key;
                return (
                  <Box
                    key={c.key}
                    onClick={() => setSelectedChip(c.key)}
                    sx={{ flexShrink: 0, px: 1.6, py: 0.7, borderRadius: "999px", cursor: "pointer", bgcolor: active ? "#13284B" : "#F0EBE3", transition: "background 0.2s" }}
                  >
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", fontWeight: active ? 600 : 400, color: active ? "#FFFFFF" : "#5A6472", whiteSpace: "nowrap" }}>
                      {c.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* ── หัวข้อ + ฟีด masonry ── */}
        <Box sx={{ maxWidth: 1440, mx: "auto", px: CONTENT_PX, pt: { xs: 2.5, md: 3.5 }, pb: 12 }}>
          <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.66rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C5A55A", mb: 0.5 }}>
              {t("search.feed.eyebrow")}
            </Typography>
            <Typography component="h1" sx={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif', fontWeight: 700, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#13284B", lineHeight: 1.15 }}>
              {t("search.feed.title")}
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 300, fontSize: { xs: "0.8rem", md: "0.88rem" }, color: "#7A7468", mt: 0.75 }}>
              {t("search.feed.subtitle")}
            </Typography>
          </Box>

          {filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#9CA3AF", mb: 3 }}>{t("search.feed.empty")}</Typography>
              <Button onClick={openCompose} variant="contained" startIcon={<EditRoundedIcon />} sx={{ borderRadius: "999px", bgcolor: "#13284B", fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "#0e1f3c" } }}>
                {user ? t("search.feed.postMoment") : t("search.feed.loginToPost")}
              </Button>
            </Box>
          ) : (
            <Box sx={{ columnCount: { xs: 2, sm: 3, md: 4, lg: 5 }, columnGap: { xs: 1.5, md: 2 } }}>
              <AnimatePresence>
                {filtered.map((m, idx) => (
                  <MomentCard key={m.id} moment={m} index={idx} liked={likedIds.includes(m.id)} onLike={handleLike} onOpen={(mm) => router.push(`/moment/${mm.id}`)} />
                ))}
              </AnimatePresence>
            </Box>
          )}
        </Box>

        {/* ปุ่มลอยเขียนโพสต์ (มือถือ) */}
        <Fab
          variant="extended"
          onClick={openCompose}
          sx={{
            position: "fixed", bottom: { xs: 24, md: 32 }, right: { xs: 16, md: 32 }, zIndex: 20,
            bgcolor: "#13284B", color: "#FFFFFF", textTransform: "none", fontFamily: '"Kanit", sans-serif', fontWeight: 500,
            px: 2.25, boxShadow: "0 10px 26px rgba(19,40,75,0.32)", "&:hover": { bgcolor: "#0e1f3c" },
          }}
        >
          <EditRoundedIcon sx={{ fontSize: 20, mr: 1 }} />
          {user ? t("search.feed.postMoment") : t("search.feed.loginToPost")}
        </Fab>

        <ComposeSheet open={composeOpen} onClose={() => setComposeOpen(false)} onSubmit={handlePost} />
      </Box>
    </MobileLayout>
  );
}

function SearchFallback() {
  const { t } = useLanguage();
  return (
    <MobileLayout>
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ color: "#6B7280" }}>{t("common.loading")}</Typography>
      </Box>
    </MobileLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
