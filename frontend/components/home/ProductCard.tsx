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

interface ProductCardProps {
  product: Product;
  /** collection / eyebrow label above the name */
  collection?: string;
  /** fixed vs fluid width (fluid fills grid cell) */
  variant?: "carousel" | "grid";
}

export default function ProductCard({
  product,
  collection = "LAYA Collection",
  variant = "grid",
}: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const fav = isWishlisted(product.id);

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
          "&:hover .laya-card-fav": { opacity: 1, transform: "translateY(0)" },
        }}
      >
        {/* Card frame — ภาพ + ข้อความรวมเป็นการ์ดเดียว พื้นหลังขาว */}
        <Box
          className="laya-card-frame"
          sx={{
            borderRadius: "18px",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 18px rgba(27,42,74,0.07)",
            transition:
              "transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease",
          }}
        >
        {/* Image */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "3 / 4",
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
              alt={product.name}
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

          {/* Wishlist — fades in on hover */}
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
              top: 8,
              right: 8,
              width: 34,
              height: 34,
              bgcolor: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(6px)",
              opacity: { xs: 1, md: 0 },
              transform: { xs: "none", md: "translateY(-4px)" },
              transition: "opacity 0.25s ease, transform 0.25s ease",
              "&:hover": { bgcolor: "#FFFFFF" },
            }}
          >
            {fav ? (
              <FavoriteRoundedIcon sx={{ fontSize: 16, color: "#C5A55A" }} />
            ) : (
              <FavoriteBorderRoundedIcon sx={{ fontSize: 16, color: "#1B2A4A" }} />
            )}
          </IconButton>
        </Box>

        {/* Meta — พื้นหลังขาวในตัวการ์ด, ชื่อ/ราคาใหญ่ขึ้น */}
        <Box sx={{ px: 1.5, pt: 1.25, pb: 1.5, bgcolor: "#FFFFFF" }}>
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontSize: "0.62rem",
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#A89F94",
              mb: 0.4,
            }}
          >
            {collection}
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "#1B2A4A",
              lineHeight: 1.35,
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
              fontSize: "0.8rem",
              color: "#7A7468",
              mt: 0.3,
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
              mt: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 700,
                fontSize: "1.15rem",
                color: "#1B2A4A",
              }}
            >
              {product.price.toLocaleString()}
              <Box
                component="span"
                sx={{
                  fontWeight: 300,
                  fontSize: "0.78rem",
                  color: "#7A7468",
                  ml: 0.5,
                }}
              >
                บาท
              </Box>
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <StarRoundedIcon sx={{ color: "#C5A55A", fontSize: 15 }} />
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
