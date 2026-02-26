"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { products } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

export default function NewArrivalsSection() {
  const newProducts = products.slice(2, 5);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      sx={{ py: 1.5 }}
    >
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 1,
          px: 2.5,
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Noto Serif Thai", serif',
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#1B2A4A",
          }}
        >
          {"มาใหม่"}
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

      {/* Vertical List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, px: 2.5 }}>
        {newProducts.map((product, index) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            style={{ textDecoration: "none" }}
          >
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.08, duration: 0.4 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                display: "flex",
                gap: 1.5,
                bgcolor: "#FFFFFF",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #E5DFD6",
                boxShadow: "0 2px 8px rgba(27,42,74,0.04)",
              }}
            >
              {/* Image */}
              <Box
                sx={{
                  position: "relative",
                  width: 100,
                  minHeight: 100,
                  flexShrink: 0,
                }}
              >
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
                {product.hasGI && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 6,
                      left: 6,
                      bgcolor: "#C5A55A",
                      color: "#FFFFFF",
                      px: 0.6,
                      py: 0.15,
                      borderRadius: "5px",
                      fontSize: "0.5rem",
                      fontWeight: 700,
                    }}
                  >
                    GI
                  </Box>
                )}
              </Box>

              {/* Info */}
              <Box
                sx={{
                  flex: 1,
                  py: 1.2,
                  pr: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    color: "#1B2A4A",
                    lineHeight: 1.3,
                    mb: 0.3,
                  }}
                >
                  {product.name}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.3,
                    mb: 0.5,
                  }}
                >
                  <VerifiedRoundedIcon
                    sx={{ fontSize: 11, color: "#C5A55A" }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontSize: "0.65rem",
                      color: "#6B7280",
                    }}
                  >
                    {product.community}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "#C5A55A",
                    }}
                  >
                    {product.price.toLocaleString()} {"บาท"}
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
                      }}
                    >
                      {product.rating}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
}
