"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import BookmarksRoundedIcon from "@mui/icons-material/BookmarksRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  getAllMoments,
  saveUserMoment,
  toggleLike,
  loadLikedIds,
  toggleSave,
  loadSavedIds,
  toggleFollow,
  loadFollowedAuthors,
  MOMENT_TOPICS,
  COVER_PRESETS,
  type Moment,
  type MomentType,
} from "@/lib/moments";

const FONT = '"Kanit", sans-serif';
const NAVY = "#13284B";
const GOLD = "#C5A55A";
// padding มาตรฐานให้เนื้อหาตรงแนวเดียวกับ TopNav — เต็มขอบสวยงามบน iPhone 14 Pro
const CONTENT_PX = { xs: 1.25, sm: 2.5, md: 4 };
// อัตราส่วนปกหลายแบบ — สร้างความสูงไม่เท่ากันแบบ Pinterest/Lemon8 (masonry)
const PIN_RATIOS = ["3 / 4", "1 / 1", "4 / 5", "2 / 3", "1 / 1.25", "4 / 3"];
const PAGE_SIZE = 12;

type ViewMode = "forYou" | "following" | "trending" | "saved";

/** hash แบบง่ายจาก id → เลขคงที่ต่อโพสต์ ใช้เลือกสัดส่วนภาพ/สไตล์การ์ดให้หลากหลายแต่ไม่สุ่มใหม่ทุก render */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function fmtCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/** อวตารวงกลมทอง — ตัวอักษรแรกของชื่อผู้เขียน */
function AuthorAvatar({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <Box
      sx={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        bgcolor: "rgba(197,165,90,0.18)", border: "1px solid rgba(197,165,90,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <Typography sx={{ fontFamily: FONT, fontSize: size * 0.42, fontWeight: 700, color: "#B8954A", lineHeight: 1 }}>
        {(name?.[0] ?? "L").toUpperCase()}
      </Typography>
    </Box>
  );
}

/** การ์ดโมเมนต์ masonry — สลับสไตล์: มาตรฐาน (ชื่อใต้รูป) / overlay (ชื่อทับรูป) + ป้าย carousel/รีวิว */
function MomentCard({
  moment,
  index,
  liked,
  saved,
  onLike,
  onSave,
  onOpen,
}: {
  moment: Moment;
  index: number;
  liked: boolean;
  saved: boolean;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onOpen: (m: Moment) => void;
}) {
  const { t } = useLanguage();
  const h = hashId(moment.id);
  const ratio = PIN_RATIOS[h % PIN_RATIOS.length];
  // การ์ดแบบ overlay (ชื่อทับรูปล่าง แบบ Lemon8) ทุก ๆ ~3 ใบ เฉพาะบทความ — รีวิวคงสไตล์มาตรฐานให้เห็นดาวชัด
  const overlay = moment.type === "blog" && h % 3 === 0;
  const isCarousel = (moment.images?.length ?? 0) > 1;
  const isReview = moment.type === "review";

  const likeCount = moment.likeCount + (liked ? 1 : 0);

  const actionRow = (light: boolean) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
      <Box onClick={(e) => { e.stopPropagation(); onLike(moment.id); }} sx={{ display: "inline-flex", alignItems: "center", gap: 0.35, cursor: "pointer" }}>
        {liked
          ? <FavoriteRoundedIcon sx={{ fontSize: 15, color: "#C5573C" }} />
          : <FavoriteBorderRoundedIcon sx={{ fontSize: 15, color: light ? "rgba(255,255,255,0.9)" : "#9CA3AF" }} />}
        <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", color: light ? "rgba(255,255,255,0.9)" : "#7A7468" }}>
          {fmtCount(likeCount)}
        </Typography>
      </Box>
      <Box onClick={(e) => { e.stopPropagation(); onSave(moment.id); }} sx={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
        {saved
          ? <BookmarkRoundedIcon sx={{ fontSize: 15, color: GOLD }} />
          : <BookmarkBorderRoundedIcon sx={{ fontSize: 15, color: light ? "rgba(255,255,255,0.9)" : "#9CA3AF" }} />}
      </Box>
    </Box>
  );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min((index % PAGE_SIZE) * 0.03, 0.4), duration: 0.45, ease: "easeOut" }}
      onClick={() => onOpen(moment)}
      sx={{
        breakInside: "avoid",
        WebkitColumnBreakInside: "avoid",
        display: "inline-block",
        width: "100%",
        mb: { xs: 1.5, md: 2.25 },
        cursor: "pointer",
        borderRadius: "18px",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
        border: "1px solid rgba(19,40,75,0.05)",
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 36px rgba(27,42,74,0.13)" },
        "&:hover .laya-pin-img": { transform: "scale(1.04)" },
      }}
    >
      <Box sx={{ position: "relative", width: "100%", aspectRatio: ratio, overflow: "hidden", bgcolor: "#F0EBE3" }}>
        <Box className="laya-pin-img" sx={{ position: "absolute", inset: 0, transition: "transform 0.6s cubic-bezier(0.22,0.61,0.36,1)" }}>
          <Image src={moment.cover} alt={moment.title} fill style={{ objectFit: "cover" }} sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 22vw" />
        </Box>

        {/* ป้าย carousel — จำนวนรูปจริงในโพสต์ */}
        {isCarousel && (
          <Box sx={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 0.4, bgcolor: "rgba(15,26,48,0.65)", backdropFilter: "blur(6px)", px: 0.9, py: 0.35, borderRadius: "999px" }}>
            <CollectionsRoundedIcon sx={{ fontSize: 11, color: "#FFFFFF" }} />
            <Typography sx={{ fontFamily: FONT, fontSize: "0.6rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1 }}>
              {moment.images!.length} {t("search.feed.photosUnit")}
            </Typography>
          </Box>
        )}

        {/* ป้ายรีวิว + ดาว */}
        {isReview && (
          <Box sx={{ position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 0.4, bgcolor: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", px: 0.9, py: 0.35, borderRadius: "999px" }}>
            <StarRoundedIcon sx={{ fontSize: 12, color: GOLD }} />
            <Typography sx={{ fontFamily: FONT, fontSize: "0.62rem", fontWeight: 700, color: NAVY, lineHeight: 1 }}>
              {t("search.feed.typeReview")}{moment.rating ? ` ${moment.rating}` : ""}
            </Typography>
          </Box>
        )}

        {/* overlay variant: ชื่อ + ผู้เขียนทับ scrim ล่างรูป */}
        {overlay && (
          <>
            <Box aria-hidden sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,26,48,0.78) 0%, rgba(15,26,48,0.25) 34%, transparent 55%)" }} />
            <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, p: 1.5 }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.86rem", color: "#FFFFFF", lineHeight: 1.4, textShadow: "0 1px 8px rgba(0,0,0,0.3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {moment.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, minWidth: 0 }}>
                  <AuthorAvatar name={moment.authorName} size={20} />
                  <Typography noWrap sx={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 300, color: "rgba(255,255,255,0.9)" }}>
                    {moment.authorName}
                  </Typography>
                  {moment.official && <VerifiedRoundedIcon sx={{ fontSize: 12, color: "#E8CF9A", flexShrink: 0 }} />}
                </Box>
                {actionRow(true)}
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* standard variant: ชื่อ + ผู้เขียนใต้รูป */}
      {!overlay && (
        <Box sx={{ px: 1.5, pt: 1.1, pb: 1.35 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 500, fontSize: "0.85rem", color: NAVY, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {moment.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, minWidth: 0 }}>
              <AuthorAvatar name={moment.authorName} size={20} />
              <Typography noWrap sx={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 300, color: "#7A7468" }}>
                {moment.authorName}
              </Typography>
              {moment.official && <VerifiedRoundedIcon sx={{ fontSize: 12, color: GOLD, flexShrink: 0 }} />}
            </Box>
            {actionRow(false)}
          </Box>
        </Box>
      )}
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
  onSubmit: (m: { type: MomentType; title: string; body: string; cover: string; images: string[]; topic: string; rating?: number; taggedProduct?: string }) => void;
}) {
  const { t } = useLanguage();
  const [type, setType] = useState<MomentType>("blog");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // รูปภาพของโพสต์ — อัปโหลดจากเครื่อง (หลายรูปได้) หรือกดหยิบรูปตัวอย่างเพิ่มเข้ามาก็ได้ แล้วเลือกว่ารูปไหนเป็นปก
  const [images, setImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [topic, setTopic] = useState<string>(MOMENT_TOPICS[0]);
  const [rating, setRating] = useState<number>(5);
  const [taggedProduct, setTaggedProduct] = useState("");
  const [error, setError] = useState<string | null>(null);
  const MAX_IMAGES = 6;

  const reset = () => {
    setType("blog"); setTitle(""); setBody(""); setImages([]); setCoverIndex(0);
    setTopic(MOMENT_TOPICS[0]); setRating(5); setTaggedProduct(""); setError(null);
  };

  // อ่านไฟล์จากเครื่องเป็น data URL — ยังไม่มี backend เก็บไฟล์ (ต้นแบบ) จึงเก็บลง localStorage ตรงๆ
  const handleFilesPicked = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    const remaining = Math.max(MAX_IMAGES - images.length, 0);
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/")).slice(0, remaining);
    if (!files.length) return;
    try {
      const dataUrls = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            })
        )
      );
      setImages((prev) => [...prev, ...dataUrls]);
    } catch {
      setError(t("search.feed.composeUploadError"));
    }
  };

  const addPreset = (src: string) => {
    if (images.length >= MAX_IMAGES) return;
    setImages((prev) => [...prev, src]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setCoverIndex((prev) => {
      if (idx < prev) return prev - 1;
      if (idx === prev) return 0;
      return prev;
    });
  };

  const submit = () => {
    if (!title.trim() || !body.trim()) { setError(t("search.feed.composeRequired")); return; }
    if (!images.length) { setError(t("search.feed.composeImageRequired")); return; }
    onSubmit({
      type, title: title.trim(), body: body.trim(),
      cover: images[coverIndex] ?? images[0],
      images,
      topic,
      rating: type === "review" ? rating : undefined,
      taggedProduct: taggedProduct.trim() || undefined,
    });
    reset();
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "12px", fontFamily: FONT, fontSize: "0.9rem", bgcolor: "#FFFFFF" },
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} PaperProps={{ sx: { borderTopLeftRadius: "24px", borderTopRightRadius: "24px", maxHeight: "92vh", maxWidth: 620, mx: "auto", width: "100%" } }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.15rem", color: "#1B2A4A" }}>{t("search.feed.composeTitle")}</Typography>
          <IconButton onClick={onClose}><CloseRoundedIcon /></IconButton>
        </Box>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.83rem", color: "#6B7280", mb: 2 }}>{t("search.feed.composeSubtitle")}</Typography>

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
                  border: `1px solid ${active ? NAVY : "#E5DFD6"}`, bgcolor: active ? NAVY : "#FFFFFF",
                  transition: "all 0.2s",
                }}
              >
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: active ? "#FFFFFF" : "#5A6472" }}>
                  {ty === "blog" ? t("search.feed.typeBlog") : t("search.feed.typeReview")}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* รูปภาพ — อัปโหลดจากเครื่อง + เลือกว่ารูปไหนเป็นปก */}
        <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.82rem", color: "#1B2A4A", mb: 0.75 }}>{t("search.feed.composeCoverLabel")}</Typography>

        {images.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1, mb: 1.25, "&::-webkit-scrollbar": { display: "none" } }}>
            {images.map((img, idx) => (
              <Box
                key={img.slice(0, 40) + idx}
                onClick={() => setCoverIndex(idx)}
                sx={{
                  position: "relative", flexShrink: 0, width: 76, height: 76, borderRadius: "12px", overflow: "hidden", cursor: "pointer",
                  border: `2px solid ${coverIndex === idx ? GOLD : "transparent"}`,
                }}
              >
                <Image src={img} alt={`รูปที่ ${idx + 1}`} fill style={{ objectFit: "cover" }} sizes="76px" />
                {coverIndex === idx && (
                  <Box sx={{ position: "absolute", top: 3, left: 3, bgcolor: GOLD, color: "#FFFFFF", borderRadius: "999px", px: 0.7, py: 0.1 }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.58rem", fontWeight: 700 }}>{t("search.feed.coverBadge")}</Typography>
                  </Box>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  sx={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, bgcolor: "rgba(15,26,48,0.55)", color: "#FFFFFF", "&:hover": { bgcolor: "rgba(15,26,48,0.8)" } }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {images.length < MAX_IMAGES && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1.25 }}>
            <Button
              component="label"
              startIcon={<AddPhotoAlternateRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{ borderRadius: "999px", border: "1px dashed #D8CFC0", color: "#5A6472", px: 2, py: 0.7, fontFamily: FONT, fontSize: "0.78rem", textTransform: "none", "&:hover": { bgcolor: "#FAF6F0" } }}
            >
              {t("search.feed.composeUploadFromDevice")}
              <input type="file" accept="image/*" multiple hidden onChange={(e) => { handleFilesPicked(e.target.files); e.target.value = ""; }} />
            </Button>
          </Box>
        )}

        {/* รูปตัวอย่าง — กดเพื่อเพิ่มเข้ารายการด้านบน (ไม่ใช่ลบของเดิม) */}
        <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1, mb: 2, "&::-webkit-scrollbar": { display: "none" } }}>
          {COVER_PRESETS.map((c) => (
            <Box
              key={c}
              onClick={() => addPreset(c)}
              sx={{
                position: "relative", flexShrink: 0, width: 52, height: 52, borderRadius: "10px", overflow: "hidden", cursor: "pointer",
                opacity: images.length >= MAX_IMAGES ? 0.4 : 0.75, transition: "opacity 0.2s", "&:hover": { opacity: 1 },
              }}
            >
              <Image src={c} alt="ตัวอย่าง" fill style={{ objectFit: "cover" }} sizes="52px" />
            </Box>
          ))}
        </Box>

        <TextField fullWidth placeholder={t("search.feed.composeTitlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} sx={{ ...inputSx, mb: 1.5 }} />
        <TextField fullWidth multiline minRows={4} placeholder={t("search.feed.composeBodyPlaceholder")} value={body} onChange={(e) => setBody(e.target.value)} sx={{ ...inputSx, mb: 2 }} />

        {/* หัวข้อ */}
        <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.82rem", color: "#1B2A4A", mb: 0.75 }}>{t("search.feed.composeTopicLabel")}</Typography>
        <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 2 }}>
          {MOMENT_TOPICS.map((tp) => {
            const active = topic === tp;
            return (
              <Box key={tp} onClick={() => setTopic(tp)} sx={{ px: 1.5, py: 0.6, borderRadius: "999px", cursor: "pointer", bgcolor: active ? NAVY : "#F0EBE3" }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.76rem", fontWeight: active ? 600 : 400, color: active ? "#FFFFFF" : "#5A6472" }}>{tp}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* เรตติ้ง (เฉพาะรีวิว) */}
        {type === "review" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.82rem", color: "#1B2A4A" }}>{t("search.feed.composeRatingLabel")}</Typography>
            <Rating value={rating} onChange={(_, v) => setRating(v ?? 0)} precision={0.5} sx={{ color: GOLD }} />
          </Box>
        )}

        <TextField fullWidth placeholder={t("search.feed.composeTagProductPlaceholder")} label={t("search.feed.composeTagProduct")} value={taggedProduct} onChange={(e) => setTaggedProduct(e.target.value)} InputLabelProps={{ sx: { fontFamily: FONT, fontSize: "0.9rem" } }} sx={{ ...inputSx, mb: 1.5 }} />

        {error && (
          <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#C5573C", mb: 1 }}>{error}</Typography>
        )}

        <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF", mb: 1.5 }}>{t("search.feed.composeLocalNote")}</Typography>

        <Button fullWidth onClick={submit} variant="contained" sx={{ borderRadius: "12px", bgcolor: NAVY, fontWeight: 600, fontFamily: FONT, textTransform: "none", py: 1.25, "&:hover": { bgcolor: "#0e1f3c" } }}>
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
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [followed, setFollowed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedChip, setSelectedChip] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("forYou");
  const [sortBy, setSortBy] = useState<"popular" | "newest">("newest");
  const [composeOpen, setComposeOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setMoments(getAllMoments());
    setLikedIds(loadLikedIds());
    setSavedIds(loadSavedIds());
    setFollowed(loadFollowedAuthors());
    setMounted(true);
  }, []);

  // แฮชแท็กมาแรง — นับจากโพสต์จริงในฟีด ไม่ใช่ตัวเลขแต่งขึ้น
  const trendingTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of moments) counts.set(m.topic, (counts.get(m.topic) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [moments]);

  // ครีเอเตอร์ — สรุปจากผู้เขียนที่มีโพสต์จริงในฟีด (จำนวนโพสต์จริง ไม่มียอดผู้ติดตามปลอม)
  const creators = useMemo(() => {
    const map = new Map<string, { name: string; official: boolean; posts: number; likes: number }>();
    for (const m of moments) {
      const c = map.get(m.authorName) ?? { name: m.authorName, official: !!m.official, posts: 0, likes: 0 };
      c.posts += 1;
      c.likes += m.likeCount;
      c.official = c.official || !!m.official;
      map.set(m.authorName, c);
    }
    return Array.from(map.values()).sort((a, b) => b.posts - a.posts).slice(0, 4);
  }, [moments]);

  const filtered = useMemo(() => {
    let result = [...moments];

    if (viewMode === "following") result = result.filter((m) => followed.includes(m.authorName));
    if (viewMode === "saved") result = result.filter((m) => savedIds.includes(m.id));

    if (selectedChip !== "all") result = result.filter((m) => m.topic === selectedChip);

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (m) => m.title.toLowerCase().includes(q) || m.body.toLowerCase().includes(q) || m.authorName.toLowerCase().includes(q) || m.topic.toLowerCase().includes(q)
      );
    }

    const effectiveSort = viewMode === "trending" ? "popular" : sortBy;
    if (effectiveSort === "popular") result.sort((a, b) => b.likeCount - a.likeCount);
    else result.sort((a, b) => b.createdAt - a.createdAt);

    return result;
  }, [moments, viewMode, followed, savedIds, selectedChip, query, sortBy]);

  const visible = filtered; // แสดงผลทั้งหมดทีเดียว ไม่จำกัดจำนวน/ไม่มีปุ่มโหลดเพิ่มเติม

  const requireLogin = (): boolean => {
    if (!user) { router.push("/auth/login"); return false; }
    return true;
  };

  const handleLike = (id: string) => {
    if (!requireLogin()) return;
    toggleLike(id);
    setLikedIds(loadLikedIds());
  };

  const handleSave = (id: string) => {
    if (!requireLogin()) return;
    toggleSave(id);
    setSavedIds(loadSavedIds());
  };

  const handleFollow = (name: string) => {
    if (!requireLogin()) return;
    toggleFollow(name);
    setFollowed(loadFollowedAuthors());
  };

  const handlePost = (input: { type: MomentType; title: string; body: string; cover: string; images: string[]; topic: string; rating?: number; taggedProduct?: string }) => {
    const authorName = user?.email ? user.email.split("@")[0] : "คุณ";
    saveUserMoment({ ...input, authorName });
    setMoments(getAllMoments());
    setComposeOpen(false);
  };

  const openCompose = () => {
    if (!requireLogin()) return;
    setComposeOpen(true);
  };

  const menuItems: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "forYou", label: t("search.feed.menuForYou"), icon: <HomeRoundedIcon sx={{ fontSize: 19 }} /> },
    { key: "following", label: t("search.feed.menuFollowing"), icon: <PeopleAltRoundedIcon sx={{ fontSize: 19 }} /> },
    { key: "trending", label: t("search.feed.menuTrending"), icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 19 }} /> },
    { key: "saved", label: t("search.feed.menuSaved"), icon: <BookmarksRoundedIcon sx={{ fontSize: 19 }} /> },
  ];

  const chips = [{ key: "all", label: t("search.feed.allTopics") }, ...MOMENT_TOPICS.map((tp) => ({ key: tp, label: tp }))];

  const emptyMessage =
    viewMode === "following" ? t("search.feed.emptyFollowing")
    : viewMode === "saved" ? t("search.feed.emptySaved")
    : t("search.feed.empty");

  // skeleton สูงสลับกันแบบ Pinterest ระหว่างรอ mount (อ่าน localStorage ฝั่ง client)
  const skeletons = Array.from({ length: 10 }, (_, i) => PIN_RATIOS[i % PIN_RATIOS.length]);

  return (
    <MobileLayout>
      <Box sx={{ width: "100%", bgcolor: "#FAF6F0", minHeight: "100vh", overflowX: "hidden" }}>
        {/* ── Sticky bar: ค้นหา + จัดเรียง + ชิปหัวข้อ ── */}
        <Box sx={{ bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #EFE9DD" }}>
          <Box sx={{ maxWidth: 1440, mx: "auto", px: CONTENT_PX, pt: 2.5, pb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", bgcolor: "#FAF6F0", borderRadius: "999px", px: 2.25, py: 0.6, border: "1px solid #E5DFD6", maxWidth: 860, mx: { md: "auto" } }}>
                <SearchRoundedIcon sx={{ color: "#9CA3AF", fontSize: 20, mr: 1 }} />
                <TextField
                  fullWidth variant="standard" placeholder={t("search.feed.searchPlaceholder")} value={query}
                  onChange={(e) => setQuery(e.target.value)} InputProps={{ disableUnderline: true }}
                  sx={{ "& input": { fontFamily: FONT, fontSize: "0.92rem", py: 0.8, color: "#1B2A4A" } }}
                />
              </Box>
              <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.5, flexShrink: 0, border: "1px solid #E5DFD6", borderRadius: "999px", px: 1.5, py: 0.8 }}>
                <SortRoundedIcon sx={{ fontSize: 15, color: "#6B7280" }} />
                <Select
                  value={sortBy} onChange={(e) => setSortBy(e.target.value as "popular" | "newest")}
                  variant="standard" disableUnderline
                  sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#1B2A4A", fontWeight: 600 }}
                >
                  <MenuItem value="popular" sx={{ fontFamily: FONT, fontSize: "0.85rem" }}>{t("search.sort.popular")}</MenuItem>
                  <MenuItem value="newest" sx={{ fontFamily: FONT, fontSize: "0.85rem" }}>{t("search.sort.newest")}</MenuItem>
                </Select>
              </Box>
            </Box>

            {/* ชิปหัวข้อ */}
            <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pt: 1.5, pb: 0.25, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
              {chips.map((c) => {
                const active = selectedChip === c.key;
                return (
                  <Box
                    key={c.key}
                    onClick={() => setSelectedChip(c.key)}
                    sx={{ flexShrink: 0, px: 1.7, py: 0.7, borderRadius: "999px", cursor: "pointer", bgcolor: active ? NAVY : "#F3EDE2", transition: "background 0.2s" }}
                  >
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", fontWeight: active ? 600 : 400, color: active ? "#FFFFFF" : "#5A6472", whiteSpace: "nowrap" }}>
                      {c.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* ── Sidebar + ฟีด ── */}
        <Box sx={{ maxWidth: 1440, mx: "auto", px: CONTENT_PX, pt: { xs: 2, md: 3 }, pb: 12, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "230px 1fr" }, gap: { xs: 0, lg: 4 }, alignItems: "start" }}>
          {/* ── Sidebar (desktop เท่านั้น) ── */}
          <Box sx={{ display: { xs: "none", lg: "block" }, position: "sticky", top: 128 }}>
            <Button
              fullWidth onClick={openCompose} startIcon={<AddRoundedIcon />}
              sx={{ bgcolor: GOLD, color: "#FFFFFF", borderRadius: "999px", py: 1.15, mb: 2.5, fontFamily: FONT, fontWeight: 600, fontSize: "0.9rem", textTransform: "none", boxShadow: "0 6px 18px rgba(197,165,90,0.35)", "&:hover": { bgcolor: "#B8954A" } }}
            >
              {user ? t("search.feed.postMoment") : t("search.feed.loginToPost")}
            </Button>

            {/* เมนู */}
            <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "18px", border: "1px solid #EFE9DD", p: 1, mb: 2.5 }}>
              {menuItems.map((item) => {
                const active = viewMode === item.key;
                return (
                  <Box
                    key={item.key}
                    onClick={() => setViewMode(item.key)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1.1, borderRadius: "12px", cursor: "pointer",
                      bgcolor: active ? "#F3EDE2" : "transparent", color: active ? NAVY : "#6B7280",
                      transition: "background 0.2s", "&:hover": { bgcolor: "#FAF6F0" },
                    }}
                  >
                    {item.icon}
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: active ? 600 : 400, color: "inherit" }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* เทรนด์วันนี้ — นับจากโพสต์จริง */}
            {trendingTags.length > 0 && (
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#A89F94", mb: 1, px: 0.5 }}>
                  {t("search.feed.trendingToday")}
                </Typography>
                {trendingTags.map(([topic, count]) => (
                  <Box
                    key={topic}
                    onClick={() => { setSelectedChip(topic); setViewMode("forYou"); }}
                    sx={{ display: "flex", alignItems: "center", gap: 1, px: 0.5, py: 0.7, cursor: "pointer", "&:hover .laya-tag": { color: GOLD } }}
                  >
                    <TagRoundedIcon sx={{ fontSize: 15, color: GOLD, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap className="laya-tag" sx={{ fontFamily: FONT, fontSize: "0.82rem", fontWeight: 500, color: NAVY, transition: "color 0.2s" }}>
                        {topic}
                      </Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", color: "#A89F94" }}>
                        {count} {t("search.feed.postsUnit")}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* ครีเอเตอร์ในฟีด — จากผู้เขียนที่มีโพสต์จริง */}
            {creators.length > 0 && (
              <Box>
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#A89F94", mb: 1, px: 0.5 }}>
                  {t("search.feed.suggestedCreators")}
                </Typography>
                {creators.map((c) => {
                  const isFollowing = followed.includes(c.name);
                  return (
                    <Box key={c.name} sx={{ display: "flex", alignItems: "center", gap: 1, px: 0.5, py: 0.8 }}>
                      <AuthorAvatar name={c.name} size={34} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <Typography noWrap sx={{ fontFamily: FONT, fontSize: "0.82rem", fontWeight: 600, color: NAVY }}>{c.name}</Typography>
                          {c.official && <VerifiedRoundedIcon sx={{ fontSize: 13, color: GOLD, flexShrink: 0 }} />}
                        </Box>
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", color: "#A89F94" }}>
                          {c.posts} {t("search.feed.postsUnit")} · {fmtCount(c.likes)} ❤
                        </Typography>
                      </Box>
                      <Chip
                        label={isFollowing ? t("search.feed.followingBtn") : t("search.feed.follow")}
                        onClick={() => handleFollow(c.name)}
                        size="small"
                        sx={{
                          fontFamily: FONT, fontSize: "0.68rem", fontWeight: 600, cursor: "pointer",
                          bgcolor: isFollowing ? "#F3EDE2" : NAVY, color: isFollowing ? "#6B7280" : "#FFFFFF",
                          "&:hover": { bgcolor: isFollowing ? "#EAE2D3" : "#0e1f3c" },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* ── ฟีด masonry ── */}
          <Box>
            {!mounted ? (
              // skeleton แบบ Pinterest ระหว่างโหลด
              <Box sx={{ columnCount: { xs: 2, sm: 3, md: 4, lg: 4, xl: 5 }, columnGap: { xs: 1.5, md: 2.25 } }}>
                {skeletons.map((ratio, i) => (
                  <Box key={i} sx={{ breakInside: "avoid", display: "inline-block", width: "100%", mb: { xs: 1.5, md: 2.25 } }}>
                    <Box sx={{ width: "100%", aspectRatio: ratio, borderRadius: "18px", bgcolor: "#EFE9DD", animation: "layaPulse 1.4s ease-in-out infinite", "@keyframes layaPulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.55 } } }} />
                  </Box>
                ))}
              </Box>
            ) : visible.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 44, color: "#D8CFC0", mb: 1.5 }} />
                <Typography sx={{ fontFamily: FONT, fontSize: "0.92rem", color: "#7A7468", mb: 3, maxWidth: 420, mx: "auto", lineHeight: 1.8 }}>
                  {emptyMessage}
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A89F94", mb: 1.5 }}>
                  {t("search.feed.suggestedSearches")}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                  {MOMENT_TOPICS.slice(0, 5).map((tp) => (
                    <Box key={tp} onClick={() => { setSelectedChip(tp); setViewMode("forYou"); setQuery(""); }} sx={{ px: 1.7, py: 0.7, borderRadius: "999px", cursor: "pointer", bgcolor: "#F3EDE2", "&:hover": { bgcolor: "#EAE2D3" } }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#5A6472" }}>{tp}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <>
                <Box sx={{ columnCount: { xs: 2, sm: 3, md: 4, lg: 4, xl: 5 }, columnGap: { xs: 1.5, md: 2.25 } }}>
                  <AnimatePresence>
                    {visible.map((m, idx) => (
                      <MomentCard
                        key={m.id} moment={m} index={idx}
                        liked={likedIds.includes(m.id)} saved={savedIds.includes(m.id)}
                        onLike={handleLike} onSave={handleSave}
                        onOpen={(mm) => router.push(`/moment/${mm.id}`)}
                      />
                    ))}
                  </AnimatePresence>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* ปุ่มลอยเขียนโพสต์ — จอเล็กที่ไม่เห็น sidebar */}
        <Fab
          variant="extended"
          onClick={openCompose}
          sx={{
            display: { xs: "inline-flex", lg: "none" },
            position: "fixed", bottom: { xs: 24, md: 32 }, right: { xs: 16, md: 32 }, zIndex: 20,
            bgcolor: NAVY, color: "#FFFFFF", textTransform: "none", fontFamily: FONT, fontWeight: 500,
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
