"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import type { Product } from "@/lib/live-products";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface EditorialProductCardProps {
  product: Product;
}

/**
 * การ์ดสินค้าเฉพาะหน้าแรก (Curated For You) ตาม mockup ล่าสุด:
 * ภาพพอร์เทรต 4:5 + GI badge + หัวใจ / ใต้ภาพ: ป้ายทอง CURATED,
 * ชื่อสินค้า Kanit หนา, ชุมชน · จังหวัด, ราคา "X บาท" + ดาวเรตติ้ง
 * แยกจาก ProductCard.tsx เดิม (หน้า search/wishlist ยังใช้อยู่) — ไม่แตะของเดิม
 */
export default function EditorialProductCard({ product }: EditorialProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { t } = useLanguage();
  const fav = isWishlisted(product.id);

  return (
    <Box
      component={Link}
      href={`/product/${product.id}`}
      sx={{
        textDecoration: "none",
        display: "block",
        minWidth: 0,
        "&:hover .laya-ed-frame": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 28px rgba(27,42,74,0.12)",
          borderColor: "rgba(19,40,75,0.14)",
        },
        "&:hover .laya-ed-img": { transform: "scale(1.05)" },
        "&:hover .laya-ed-cta": {
          opacity: 1,
          transform: "translateX(-50%) translateY(0)",
        },
      }}
    >
      <Box
        className="laya-ed-frame"
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(19,40,75,0.08)",
          bgcolor: "#FFFFFF",
          transition:
            "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* ภาพ — พอร์เทรต 4:5 ตาม mockup */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "4 / 5",
            overflow: "hidden",
            bgcolor: "#F0EBE3",
          }}
        >
          <Box
            className="laya-ed-img"
            sx={{
              position: "absolute",
              inset: 0,
              transition: "transform 0.6s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 900px) 50vw, 25vw"
            />
          </Box>

          {/* GI / verified badge — มุมซ้ายบนตาม mockup */}
          {product.hasGI && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.4,
                bgcolor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(6px)",
                px: 0.9,
                py: 0.35,
                borderRadius: "999px",
              }}
            >
              <Box
                sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#C5A55A" }}
              />
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontSize: "0.55rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#1B2A4A",
                  lineHeight: 1,
                }}
              >
                GI VERIFIED
              </Typography>
            </Box>
          )}

          {/* Wishlist — วงกลมขาวมุมขวาบน */}
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!user) { router.push("/auth/login"); return; }
              toggle(product.id);
            }}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 30,
              height: 30,
              bgcolor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 2px 8px rgba(19,40,75,0.12)",
              transition: "background-color 0.25s ease, transform 0.25s ease",
              "&:hover": { bgcolor: "#FFFFFF", transform: "scale(1.06)" },
            }}
          >
            {fav ? (
              <FavoriteRoundedIcon sx={{ fontSize: 14, color: "#C5A55A" }} />
            ) : (
              <FavoriteBorderRoundedIcon sx={{ fontSize: 14, color: "#1B2A4A" }} />
            )}
          </IconButton>

          {/* View Details — โผล่ตอน hover (desktop) */}
          <Box
            className="laya-ed-cta"
            sx={{
              position: "absolute",
              left: "50%",
              bottom: 12,
              transform: "translateX(-50%) translateY(8px)",
              display: { xs: "none", md: "inline-flex" },
              alignItems: "center",
              px: 2,
              py: 0.65,
              borderRadius: "999px",
              bgcolor: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 6px 16px rgba(19,40,75,0.16)",
              opacity: 0,
              transition: "opacity 0.3s ease, transform 0.3s ease",
              fontFamily: '"Kanit", sans-serif',
              fontSize: "0.68rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: "#13284B",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {t("home.recommended.quickView")}
          </Box>
        </Box>

        {/* Meta ตาม mockup: CURATED ทอง / ชื่อหนา / ชุมชน · จังหวัด / ราคา บาท + ดาว */}
        <Box sx={{ px: 1.5, pt: 1.1, pb: 1.35 }}>
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: "0.55rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C5A55A",
              lineHeight: 1.4,
            }}
          >
            {t("home.recommended.eyebrow")}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: "0.88rem",
              color: "#13284B",
              lineHeight: 1.35,
              mt: 0.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.name}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: "0.66rem",
              color: "#A89F94",
              mt: 0.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.community} · {product.province}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              mt: 0.7,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#13284B",
              }}
            >
              {product.price.toLocaleString()}{" "}
              <Box
                component="span"
                sx={{ fontWeight: 300, fontSize: "0.68rem", color: "#7A7468" }}
              >
                {t("home.recommended.baht")}
              </Box>
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <StarRoundedIcon sx={{ color: "#C9A86A", fontSize: 14 }} />
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontSize: "0.72rem",
                  fontWeight: 400,
                  color: "#7A7468",
                }}
              >
                {product.rating}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
