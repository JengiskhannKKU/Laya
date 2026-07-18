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
import { type Product, productDisplayName } from "@/lib/live-products";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProductCardProps {
  product: Product;
  /** ยังรับไว้เพื่อ backward-compat — สไตล์ mockup ใช้ชื่อชุมชนเป็น eyebrow แทน */
  collection?: string;
  /** fixed vs fluid width (fluid fills grid cell) */
  variant?: "carousel" | "grid";
}

export default function ProductCard({
  product,
  variant = "grid",
}: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { t, locale } = useLanguage();
  const fav = isWishlisted(product.id);
  const displayName = productDisplayName(product, locale);

  const isCarousel = variant === "carousel";

  return (
    <Box
      component={Link}
      href={`/product/${product.id}`}
      sx={{
        textDecoration: "none",
        display: "block",
        // grid: minWidth 0 กันข้อความ nowrap ดันคอลัมน์ให้กว้างไม่เท่ากัน
        // carousel (มือถือ): ห้ามหด ไม่งั้นการ์ดซ้อนกันใน scroll แถวนอน
        minWidth: isCarousel ? { xs: 180, md: 0 } : 0,
        flexShrink: isCarousel ? 0 : undefined,
      }}
    >
      <Box
        sx={{
          width: isCarousel ? { xs: 180, md: "100%" } : "100%",
          cursor: "pointer",
          scrollSnapAlign: "start",
          "&:hover .laya-card-img": { transform: "scale(1.06)" },
          "&:hover .laya-card-frame": {
            transform: "translateY(-6px)",
            boxShadow: "0 18px 40px rgba(27,42,74,0.16)",
          },
          "&:hover .laya-card-quick": {
            opacity: 1,
            transform: "translateX(-50%) translateY(0)",
          },
        }}
      >
        {/* Card frame — ภาพ + ข้อความรวมเป็นการ์ดเดียว พื้นหลังขาว */}
        <Box
          className="laya-card-frame"
          sx={{
            borderRadius: "20px",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 18px rgba(27,42,74,0.07)",
            transition:
              "transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease",
          }}
        >
        {/* Image — สัดส่วนจัตุรัสตาม mockup */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            bgcolor: "#F0EBE3",
          }}
        >
          <Box
            className="laya-card-img"
            sx={{
              position: "absolute",
              inset: 0,
              transition: "transform 0.6s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            <Image
              src={product.images[0]}
              alt={displayName}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 900px) 50vw, 25vw"
            />
          </Box>

          {/* GI / verified badge */}
          {product.hasGI && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
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
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: "#C5A55A",
                }}
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

          {/* Wishlist — วงกลมขาวมุมขวาบน มองเห็นตลอดตาม mockup */}
          <IconButton
            className="laya-card-fav"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!user) { router.push("/auth/login"); return; }
              toggle(product.id);
            }}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 34,
              height: 34,
              bgcolor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 2px 10px rgba(19,40,75,0.12)",
              transition: "background-color 0.25s ease, transform 0.25s ease",
              "&:hover": { bgcolor: "#FFFFFF", transform: "scale(1.06)" },
            }}
          >
            {fav ? (
              <FavoriteRoundedIcon sx={{ fontSize: 16, color: "#C5A55A" }} />
            ) : (
              <FavoriteBorderRoundedIcon sx={{ fontSize: 16, color: "#1B2A4A" }} />
            )}
          </IconButton>

          {/* Quick view pill — โผล่ตอน hover (desktop) ทั้งการ์ดเป็นลิงก์อยู่แล้ว ปุ่มนี้ชี้ทางให้ชัดขึ้น */}
          <Box
            className="laya-card-quick"
            sx={{
              position: "absolute",
              left: "50%",
              bottom: 14,
              transform: "translateX(-50%) translateY(8px)",
              display: { xs: "none", md: "inline-flex" },
              alignItems: "center",
              px: 2.25,
              py: 0.75,
              borderRadius: "999px",
              bgcolor: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 6px 18px rgba(19,40,75,0.18)",
              opacity: 0,
              transition: "opacity 0.3s ease, transform 0.3s ease",
              fontFamily: '"Kanit", sans-serif',
              fontSize: "0.72rem",
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

        {/* Meta ตาม mockup: ชุมชน (เทาเล็ก) / ชื่อสินค้า (serif navy) / ฿ราคา + ดาวทอง */}
        <Box sx={{ px: 1.75, pt: 1.25, pb: 1.5, bgcolor: "#FFFFFF" }}>
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: "0.72rem",
              color: "#A89F94",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.community}
          </Typography>

          <Typography
            sx={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
              fontWeight: 600,
              fontSize: "1.18rem",
              color: "#13284B",
              lineHeight: 1.3,
              mt: 0.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              mt: 0.75,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 600,
                fontSize: "1.05rem",
                color: "#13284B",
              }}
            >
              ฿{product.price.toLocaleString()}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <StarRoundedIcon sx={{ color: "#C9A86A", fontSize: 15 }} />
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontSize: "0.78rem",
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
    </Box>
  );
}
