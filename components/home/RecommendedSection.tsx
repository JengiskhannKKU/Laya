"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { products } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import IconButton from "@mui/material/IconButton";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

export default function RecommendedSection() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      sx={{ py: 1.5 }}
    >
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#1B2A4A",
            }}
          >
            {"คัดสรรสำหรับคุณ"}
          </Typography>
          <Box
            sx={{
              width: 24,
              height: 2,
              bgcolor: "#C5A55A",
              borderRadius: 1,
            }}
          />
        </Box>
        <Link href="/explore" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.2,
              color: "#C5A55A",
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {"ดูทั้งหมด"}
            </Typography>
            <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        </Link>
      </Box>

      {/* Horizontal Scroll */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          px: 2.5,
          pb: 1.5,
          scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {products.slice(0, 5).map((product, index) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            style={{ textDecoration: "none" }}
          >
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              sx={{
                minWidth: 165,
                maxWidth: 165,
                scrollSnapAlign: "start",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 165,
                  height: 200,
                  borderRadius: "16px",
                  overflow: "hidden",
                  mb: 1,
                  boxShadow: "0 4px 12px rgba(27,42,74,0.08)",
                }}
              >
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
                {/* Gradient overlay at bottom */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "40%",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)",
                  }}
                />
                {/* Price tag at bottom */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    bgcolor: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "8px",
                    px: 1,
                    py: 0.3,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      color: "#1B2A4A",
                    }}
                  >
                    {product.price.toLocaleString()} {"บาท"}
                  </Typography>
                </Box>
                {/* GI Badge */}
                {product.hasGI && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      bgcolor: "#C5A55A",
                      color: "#FFFFFF",
                      px: 0.8,
                      py: 0.25,
                      borderRadius: "6px",
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      fontFamily: '"Noto Serif Thai", serif',
                      letterSpacing: 0.5,
                    }}
                  >
                    GI
                  </Box>
                )}
                {/* Favorite button */}
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(255,255,255,0.85)",
                    width: 28,
                    height: 28,
                    "&:hover": { bgcolor: "#FFFFFF" },
                  }}
                >
                  <FavoriteBorderRoundedIcon
                    sx={{ fontSize: 14, color: "#1B2A4A" }}
                  />
                </IconButton>
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "#1B2A4A",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 165,
                }}
              >
                {product.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 0.3,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontWeight: 400,
                    fontSize: "0.68rem",
                    color: "#6B7280",
                  }}
                >
                  {product.community}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                  }}
                >
                  <StarRoundedIcon
                    sx={{ color: "#C5A55A", fontSize: 12 }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontSize: "0.65rem",
                      color: "#6B7280",
                      fontWeight: 500,
                    }}
                  >
                    {product.rating}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
}
