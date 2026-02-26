"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Rating from "@mui/material/Rating";
import Chip from "@mui/material/Chip";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ViewInArRoundedIcon from "@mui/icons-material/ViewInArRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/mock-data";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showFullStory, setShowFullStory] = useState(false);

  return (
    <Box
      sx={{
        maxWidth: 430,
        mx: "auto",
        minHeight: "100vh",
        bgcolor: "#FAF6F0",
        position: "relative",
        boxShadow: { xs: "none", sm: "0 0 40px rgba(0,0,0,0.08)" },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          pt: 2,
        }}
      >
        <Link href="/">
          <IconButton
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <ArrowBackIosNewRoundedIcon
              sx={{ fontSize: 18, color: "#1B2A4A" }}
            />
          </IconButton>
        </Link>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", "Noto Serif Thai", serif',
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#1B2A4A",
              letterSpacing: 2,
              textShadow: "0 1px 3px rgba(255,255,255,0.8)",
            }}
          >
            LAYA
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", "Noto Serif Thai", serif',
              fontSize: "0.55rem",
              color: "#C5A55A",
              letterSpacing: 1.5,
              fontStyle: "italic",
            }}
          >
            Every Pattern Tells a Story
          </Typography>
        </Box>

        <IconButton
          sx={{
            bgcolor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            "&:hover": { bgcolor: "rgba(255,255,255,1)" },
          }}
        >
          <ShoppingCartOutlinedIcon
            sx={{ fontSize: 20, color: "#1B2A4A" }}
          />
        </IconButton>
      </Box>

      {/* Image Gallery */}
      <Box sx={{ position: "relative", height: 400, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Image
              src={product.images[currentImage]}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Image dots */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 0.8,
          }}
        >
          {product.images.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentImage(index)}
              sx={{
                width: index === currentImage ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor:
                  index === currentImage
                    ? "#FFFFFF"
                    : "rgba(255,255,255,0.4)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Product Info */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        sx={{ px: 2.5, pt: 3, pb: 2 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "#1B2A4A",
                lineHeight: 1.3,
              }}
            >
              {product.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 400,
                fontSize: "0.85rem",
                color: "#6B7280",
                mt: 0.3,
              }}
            >
              {product.community}
            </Typography>
          </Box>

          {product.hasGI && (
            <Chip
              label={"GI รับรอง"}
              size="small"
              sx={{
                bgcolor: "rgba(197,165,90,0.15)",
                color: "#A68A3A",
                fontWeight: 700,
                fontFamily: '"Noto Serif Thai", serif',
                fontSize: "0.7rem",
                border: "1px solid rgba(197,165,90,0.3)",
                borderRadius: 2,
                height: 28,
              }}
            />
          )}
        </Box>

        {/* Rating */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
          }}
        >
          <Rating
            value={product.rating}
            precision={0.1}
            readOnly
            size="small"
            sx={{
              "& .MuiRating-iconFilled": {
                color: "#C5A55A",
              },
            }}
          />
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.8rem",
              color: "#6B7280",
            }}
          >
            ({product.rating}) {product.reviewCount} {"รีวิว"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#E5DFD6" }} />

        {/* Price & Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 300,
                fontSize: "0.85rem",
                color: "#6B7280",
              }}
            >
              {"ราคา"}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 700,
                fontSize: "1.3rem",
                color: "#1B2A4A",
              }}
            >
              {product.price.toLocaleString()} {"บาท"} / {product.priceUnit}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.85rem",
              color: "#6B7280",
            }}
          >
            {"ระยะเวลาผลิต:"} {product.productionTime}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.85rem",
              color: "#6B7280",
            }}
          >
            {"พร้อมส่ง:"} {product.availableLength} {"เมตร"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#E5DFD6" }} />

        {/* Story Section */}
        <Box>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "#1B2A4A",
              mb: 1,
            }}
          >
            {"เรื่องราวของผืนผ้า"}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.85rem",
              color: "#6B7280",
              lineHeight: 1.7,
              overflow: "hidden",
              maxHeight: showFullStory ? "none" : 60,
              transition: "max-height 0.3s ease",
            }}
          >
            {product.story}
          </Typography>
          <Button
            onClick={() => setShowFullStory(!showFullStory)}
            endIcon={
              <ExpandMoreRoundedIcon
                sx={{
                  transform: showFullStory
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              />
            }
            sx={{
              mt: 0.5,
              fontFamily: '"Noto Serif Thai", serif',
              color: "#1B2A4A",
              fontSize: "0.8rem",
              fontWeight: 600,
              p: 0,
              minWidth: "auto",
              "&:hover": { bgcolor: "transparent" },
            }}
          >
            {showFullStory ? "ย่อ" : "อ่านเพิ่มเติม"}
          </Button>
        </Box>
      </Box>

      {/* Bottom Action Bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 430,
          mx: "auto",
          zIndex: 100,
          p: 2,
          pb: 3,
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          sx={{
            display: "flex",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            startIcon={<ViewInArRoundedIcon />}
            sx={{
              flex: 1,
              bgcolor: "#1B2A4A",
              color: "#FFFFFF",
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 600,
              fontSize: "0.85rem",
              py: 1.8,
              borderRadius: 0,
              "&:hover": { bgcolor: "#0F1A30" },
            }}
          >
            {"ดูภาพจำลองสินค้า"}
          </Button>
          <Button
            sx={{
              flex: 0.7,
              background:
                "linear-gradient(135deg, #C5A55A 0%, #D4BA7A 100%)",
              color: "#1B2A4A",
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "0.9rem",
              py: 1.8,
              borderRadius: 0,
              "&:hover": {
                background:
                  "linear-gradient(135deg, #B89545 0%, #C5A55A 100%)",
              },
            }}
          >
            {"ซื้อเลย"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
