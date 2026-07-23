"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import MobileLayout from "@/components/layout/MobileLayout";
import { fetchCommunities, type LiveCommunity } from "@/lib/communities";
import { fetchLiveProducts, productDisplayName, type Product } from "@/lib/live-products";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// padding มาตรฐานให้เนื้อหาตรงแนวเดียวกับหน้าอื่น (TopNav/search/category)
const CONTENT_PX = { xs: 2.5, sm: 3, md: 5 };

/** การ์ดสินค้าย่อยในบล็อกสปอตไลท์ — ภาพพื้นหลังอ่อน + เรตติ้ง/ป้ายทอ + ชื่อ + ราคา + หัวใจ */
function SpotlightProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const { locale } = useLanguage();
  const { isWishlisted, toggle } = useWishlist();
  const fav = isWishlisted(product.id);
  const displayName = productDisplayName(product, locale);

  return (
    <Box component={Link} href={`/product/${product.id}`} sx={{ textDecoration: "none", display: "block" }}>
      <Box
        sx={{
          position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden",
          bgcolor: "#F0EBE3", borderRadius: "6px",
          "&:hover .laya-spot-img": { transform: "scale(1.04)" },
        }}
      >
        <Box className="laya-spot-img" sx={{ position: "absolute", inset: 0, transition: "transform 0.5s cubic-bezier(0.22,0.61,0.36,1)" }}>
          <Image src={product.images[0]} alt={displayName} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 40vw, 22vw" />
        </Box>
        <IconButton
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            if (!user) { router.push("/auth/login"); return; }
            toggle(product.id);
          }}
          size="small"
          sx={{ position: "absolute", bottom: 8, right: 8, width: 30, height: 30, bgcolor: "rgba(255,255,255,0.9)", "&:hover": { bgcolor: "#FFFFFF" } }}
        >
          {fav ? <FavoriteRoundedIcon sx={{ fontSize: 15, color: "#C5573C" }} /> : <FavoriteBorderRoundedIcon sx={{ fontSize: 15, color: "#1B2A4A" }} />}
        </IconButton>
      </Box>

      <Box sx={{ pt: 1.1 }}>
        {product.fabricType && (
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF", mb: 0.3 }}>
            {product.fabricType}
          </Typography>
        )}
        <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 500, fontSize: "0.82rem", color: "#13284B" }}>
          {displayName}
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.8rem", color: "#5A6472", mt: 0.3 }}>
          ฿{product.price.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * บล็อกสปอตไลท์ต่อชุมชน — ซ้าย: ภาพชุมชน/ช่างทอเต็มความสูง, ขวา: สินค้าเด่น 2 ชิ้น + เรื่องราวชุมชน + CTA
 * แต่ละชุมชนโหลดสินค้าของตัวเอง (top 2) เพื่อเป็น "ตัวอย่างสินค้าเด่น" ของบล็อกนั้น
 */
function CommunitySpotlight({ community, index }: { community: LiveCommunity; index: number }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [imgSrc, setImgSrc] = useState(community.image || "/placeholder.webp");

  useEffect(() => {
    let cancelled = false;
    fetchLiveProducts({ shopId: community.id })
      .then((list) => { if (!cancelled) setProducts(list.slice(0, 2)); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoadingProducts(false); });
    return () => { cancelled = true; };
  }, [community.id]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1.25fr" },
        gap: { xs: 3, md: 4 },
        mb: { xs: 6, md: 9 },
      }}
    >
      {/* ── ซ้าย: ภาพชุมชน/ช่างทอ เต็มความสูง ── */}
      {/* minWidth: 0 กัน grid item ขยายตาม intrinsic size ของรูปจนล้นคอลัมน์ (เจอกับบางร้านที่รูปต้นฉบับสัดส่วนกว้างมาก) */}
      <Link href={`/community/${community.id}`} style={{ textDecoration: "none", minWidth: 0 }}>
        <Box
          sx={{
            // ความสูงคงที่ (ไม่ใช้ 100%) — แต่ละบล็อกชุมชนเป็น grid ของตัวเอง ถ้าใช้ 100% รูปจะยืด
            // ตามความสูงคอลัมน์ขวาของ "ตัวเอง" (จำนวนสินค้า/ความยาวข้อความต่างกัน) ทำให้รูปแต่ละร้านสูงไม่เท่ากัน
            position: "relative", width: "100%", height: { xs: 320, md: 480 },
            borderRadius: "8px", overflow: "hidden", bgcolor: "#F0EBE3", cursor: "pointer",
            "&:hover .laya-spot-hero": { transform: "scale(1.03)" },
          }}
        >
          <Box className="laya-spot-hero" sx={{ position: "absolute", inset: 0, transition: "transform 0.6s cubic-bezier(0.22,0.61,0.36,1)" }}>
            <Image
              src={imgSrc} alt={community.name} fill style={{ objectFit: "cover" }}
              sizes="(max-width: 900px) 100vw, 45vw"
              onError={() => setImgSrc("/assets/province-fallback.jpg")}
            />
          </Box>
        </Box>
      </Link>

      {/* ── ขวา: สินค้าเด่น 2 ชิ้น (บน) + เรื่องราวชุมชน (ล่าง) ── */}
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: { xs: 3, md: 4 }, minWidth: 0 }}>
        {/* สินค้าเด่น */}
        {loadingProducts ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={22} sx={{ color: "#C5A55A" }} />
          </Box>
        ) : products.length > 0 ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: { xs: 2, md: 2.5 } }}>
            {products.map((p) => (
              <SpotlightProductCard key={p.id} product={p} />
            ))}
          </Box>
        ) : (
          <Box sx={{ bgcolor: "#F0EBE3", borderRadius: "8px", py: 4, textAlign: "center" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#9CA3AF", fontStyle: "italic" }}>
              {t("community.noProductsYet")}
            </Typography>
          </Box>
        )}

        {/* เรื่องราวชุมชน + CTA */}
        <Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#C5A55A", mb: 0.75 }}>
            {community.province}
          </Typography>
          <Typography
            component="h2"
            sx={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif', fontWeight: 700, fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#13284B", lineHeight: 1.2, mb: 1.25 }}
          >
            {community.name}
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 300, fontSize: "0.88rem", color: "#6B7280", lineHeight: 1.85, mb: 2 }}>
            {community.productCount > 0
              ? `${community.productCount} ${t("community.productsUnit")}${community.reviewCount > 0 ? ` · ${community.rating.toFixed(1)} (${community.reviewCount})` : ""}`
              : t("community.newBadge")}
          </Typography>

          <Link href={`/community/${community.id}`} style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "inline-flex", alignItems: "center", gap: "6px", position: "relative", pb: "3px", cursor: "pointer",
                color: "#1B2A4A",
                "&:hover .laya-spot-underline": { width: "100%" },
                "&:hover .laya-spot-arrow": { transform: "translateX(3px)" },
              }}
            >
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {t("community.explore")}
              </Typography>
              <ArrowForwardRoundedIcon className="laya-spot-arrow" sx={{ fontSize: 15, transition: "transform 0.25s ease" }} />
              <Box className="laya-spot-underline" sx={{ position: "absolute", bottom: 0, left: 0, width: 0, height: "1px", bgcolor: "#C5A55A", transition: "width 0.3s ease" }} />
            </Box>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

/** หัวข้อกลุ่ม (ชุมชนช่างทอ / ร้านค้าและนักออกแบบ) — เส้นทองบาง ๆ คั่นก่อนรายการของกลุ่มนั้น */
function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: { xs: 3, md: 4 } }}>
      <Typography
        sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#13284B", whiteSpace: "nowrap" }}
      >
        {children}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5DFD6" }} />
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

  // เรียงร้านที่ "ข้อมูลครบ" (มีรูป + มีรีวิว + มีสินค้า) ก่อน แล้วตามด้วยคะแนนรีวิว — ให้ร้านที่พร้อมขายจริง
  // ขึ้นก่อนร้านที่เพิ่งสมัครยังไม่กรอกอะไรเลย ใช้เฉพาะข้อมูลจริงที่มี ไม่ปั้นคะแนนใหม่
  const completeness = (c: LiveCommunity) =>
    (c.image ? 1 : 0) + (c.rating > 0 ? 1 : 0) + (c.productCount > 0 ? 1 : 0);
  const byCompletenessThenRating = (a: LiveCommunity, b: LiveCommunity) =>
    completeness(b) - completeness(a) || b.rating - a.rating || b.reviewCount - a.reviewCount;

  // แยกตาม merchantType จริง (shops.merchant_type) — undefined (ยังไม่มี field จาก backend เก่า) ถือเป็นชุมชนช่างทอไปก่อน
  const weavingCommunities = communities.filter((c) => (c.merchantType ?? "weaving_community") === "weaving_community").sort(byCompletenessThenRating);
  // "designer" และ "retailer" (ร้านค้าผลิตภัณฑ์ผ้าไทย) ทั้งคู่จัดเป็นกลุ่ม "ร้านค้าและนักออกแบบ" — เดิมกรองแค่ designer
  // ทำให้ร้าน retailer ไม่ตกอยู่ในกลุ่มไหนเลย หายไปจากหน้านี้ทั้งที่มีข้อมูลจริง
  const shopCommunities = communities.filter((c) => c.merchantType === "designer" || c.merchantType === "retailer").sort(byCompletenessThenRating);

  return (
    <MobileLayout>
      {/* พื้นหลังครีมเต็มความกว้าง viewport — เนื้อหาจัดกึ่งกลาง maxWidth 1440 มีระยะขอบ (CONTENT_PX) */}
      <Box sx={{ mx: "calc(50% - 50vw)", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        <Box sx={{ maxWidth: 1320, mx: "auto", px: CONTENT_PX, pt: { xs: 3.5, md: 6 }, pb: 8 }}>
          {/* Editorial header — eyebrow ทอง + หัวข้อ serif + subtitle */}
          <Box sx={{ mb: { xs: 4, md: 6 } }}>
            <Typography
              sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.66rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C5A55A", mb: 0.75 }}
            >
              {t("community.eyebrow")}
            </Typography>
            <Typography
              component="h1"
              sx={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif', fontWeight: 700, fontSize: { xs: "1.9rem", md: "2.4rem" }, color: "#13284B", lineHeight: 1.15 }}
            >
              {t("community.title")}
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 300, fontSize: { xs: "0.85rem", md: "0.92rem" }, color: "#7A7468", mt: 1, maxWidth: 520 }}>
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
            <>
              {/* แยกสองกลุ่มตาม shops.merchant_type จริง — ไม่ระบุ (ข้อมูลเก่า/backend ยังไม่รีสตาร์ท) ถือเป็นชุมชนช่างทอไปก่อน */}
              {weavingCommunities.length > 0 && (
                <Box sx={{ mb: { xs: 5, md: 7 } }}>
                  <GroupHeading>{t("community.sectionWeaving")}</GroupHeading>
                  {weavingCommunities.map((c, idx) => <CommunitySpotlight key={c.id} community={c} index={idx} />)}
                </Box>
              )}
              {shopCommunities.length > 0 && (
                <Box>
                  <GroupHeading>{t("community.sectionShops")}</GroupHeading>
                  {shopCommunities.map((c, idx) => <CommunitySpotlight key={c.id} community={c} index={idx} />)}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </MobileLayout>
  );
}
