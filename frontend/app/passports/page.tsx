"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import { useLiveProducts } from "@/lib/use-live-products";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import Link from "next/link";
import Image from "next/image";

export default function PassportListPage() {
  // ยังไม่มีตาราง passport ใน backend จริง — สินค้าจริงจึงไม่มี .passport เลย (แสดง empty state ด้านล่าง)
  const { products } = useLiveProducts();
  const passportProducts = products.filter((p) => p.passport);

  return (
    <MobileLayout>
      <Box sx={{ pt: 2, pb: 2 }}>
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            mb: 2.5,
          }}
        >
          <Link href="/profile">
            <IconButton
              size="small"
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E5DFD6",
                "&:hover": { bgcolor: "#FFFFFF" },
              }}
            >
              <ArrowBackIosNewRoundedIcon
                sx={{ fontSize: 14, color: "#1B2A4A" }}
              />
            </IconButton>
          </Link>
          <Box>
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 700,
                fontSize: "1.15rem",
                color: "#1B2A4A",
              }}
            >
              {"Digital Textile Passport"}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: "0.68rem",
                color: "#9CA3AF",
              }}
            >
              {"พาสปอร์ตผ้าดิจิทัลของฉัน"}
            </Typography>
          </Box>
        </Box>

        {/* Passport Cards */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            px: 2,
          }}
        >
          {passportProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/passport/${product.id}`}
              style={{ textDecoration: "none" }}
            >
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #E5DFD6",
                  boxShadow: "0 2px 12px rgba(27,42,74,0.04)",
                  display: "flex",
                  gap: 0,
                }}
              >
                {/* Image */}
                <Box
                  sx={{
                    position: "relative",
                    width: 100,
                    minHeight: 120,
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  {/* Dark overlay with certificate badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "50%",
                      background:
                        "linear-gradient(to top, rgba(27,42,74,0.6) 0%, transparent 100%)",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 6,
                      left: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.3,
                    }}
                  >
                    <VerifiedRoundedIcon
                      sx={{ fontSize: 10, color: "#C5A55A" }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.5rem",
                        fontWeight: 700,
                        color: "#C5A55A",
                        fontFamily: '"Kanit", sans-serif',
                      }}
                    >
                      {"ยืนยัน"}
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Kanit", sans-serif',
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      color: "#1B2A4A",
                      lineHeight: 1.3,
                      mb: 0.3,
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Kanit", sans-serif',
                      fontSize: "0.65rem",
                      color: "#9CA3AF",
                      mb: 0.8,
                    }}
                  >
                    {product.community}
                  </Typography>

                  {/* Certificate ID & Hash */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.55rem",
                        color: "#6B7280",
                        bgcolor: "#F0EBE3",
                        px: 0.6,
                        py: 0.15,
                        borderRadius: "4px",
                      }}
                    >
                      {product.certificateId}
                    </Typography>
                  </Box>

                  {/* Tags row */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                    {product.hasGI && (
                      <Chip
                        label="GI"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.5rem",
                          fontWeight: 700,
                          bgcolor: "rgba(197,165,90,0.12)",
                          color: "#A68A3A",
                          borderRadius: "4px",
                          fontFamily: '"Kanit", sans-serif',
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.3,
                      }}
                    >
                      <LinkRoundedIcon
                        sx={{ fontSize: 9, color: "#9CA3AF" }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.5rem",
                          color: "#9CA3AF",
                        }}
                      >
                        {product.passport?.blockchainHash}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Link>
          ))}
        </Box>

        {/* Empty state if no passports */}
        {passportProducts.length === 0 && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{
              textAlign: "center",
              py: 6,
              px: 3,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: "0.9rem",
                color: "#9CA3AF",
              }}
            >
              {"ยังไม่มีพาสปอร์ตผ้าดิจิทัล"}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: "0.75rem",
                color: "#D1D5DB",
                mt: 0.5,
              }}
            >
              {"สั่งซื้อผ้าเพื่อรับพาสปอร์ตดิจิทัล"}
            </Typography>
          </Box>
        )}
      </Box>
    </MobileLayout>
  );
}
