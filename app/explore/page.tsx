"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { motion, AnimatePresence } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import { products } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import InputBase from "@mui/material/InputBase";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";

const filters = ["ทั้งหมด", "ผ้าไหม", "ผ้าฝ้าย", "GI", "ราคาต่ำ-สูง"];

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <MobileLayout>
      <Box sx={{ pt: 3, pb: 2 }}>
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.3rem",
              color: "#1B2A4A",
            }}
          >
            {"สำรวจ"}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setViewMode("grid")}
              sx={{
                bgcolor: viewMode === "grid" ? "#1B2A4A" : "transparent",
                width: 32,
                height: 32,
                borderRadius: "10px",
              }}
            >
              <GridViewRoundedIcon
                sx={{
                  fontSize: 16,
                  color: viewMode === "grid" ? "#FFFFFF" : "#9CA3AF",
                }}
              />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode("list")}
              sx={{
                bgcolor: viewMode === "list" ? "#1B2A4A" : "transparent",
                width: 32,
                height: 32,
                borderRadius: "10px",
              }}
            >
              <ViewListRoundedIcon
                sx={{
                  fontSize: 16,
                  color: viewMode === "list" ? "#FFFFFF" : "#9CA3AF",
                }}
              />
            </IconButton>
          </Box>
        </Box>

        {/* Search */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          sx={{ px: 2.5, mb: 1.5 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              border: "1.5px solid #E5DFD6",
              px: 1.5,
              py: 0.3,
              gap: 0.5,
              boxShadow: "0 2px 8px rgba(27,42,74,0.04)",
              "&:focus-within": {
                borderColor: "#C5A55A",
                boxShadow: "0 2px 12px rgba(197,165,90,0.15)",
              },
            }}
          >
            <SearchRoundedIcon
              sx={{ color: "#9CA3AF", fontSize: 20, ml: 0.5 }}
            />
            <InputBase
              placeholder="ค้นหาลาย, ชุมชน, จังหวัด..."
              sx={{
                flex: 1,
                fontFamily: '"Noto Serif Thai", serif',
                fontSize: "0.85rem",
                color: "#1B2A4A",
                py: 0.8,
              }}
            />
            <IconButton
              size="small"
              sx={{
                bgcolor: "#F0EBE3",
                width: 32,
                height: 32,
                borderRadius: "10px",
              }}
            >
              <TuneRoundedIcon sx={{ fontSize: 16, color: "#1B2A4A" }} />
            </IconButton>
          </Box>
        </Box>

        {/* Filters */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          sx={{
            display: "flex",
            gap: 0.8,
            overflowX: "auto",
            pb: 1,
            mb: 1,
            px: 2.5,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {filters.map((f, i) => (
            <Box
              key={f}
              component={motion.div}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(i)}
              sx={{
                bgcolor: activeFilter === i ? "#1B2A4A" : "#FFFFFF",
                color: activeFilter === i ? "#FFFFFF" : "#1B2A4A",
                fontFamily: '"Noto Serif Thai", serif',
                fontSize: "0.75rem",
                fontWeight: activeFilter === i ? 600 : 400,
                border: `1.5px solid ${activeFilter === i ? "#1B2A4A" : "#E5DFD6"}`,
                borderRadius: "10px",
                px: 1.8,
                py: 0.7,
                flexShrink: 0,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {f}
            </Box>
          ))}
        </Box>

        {/* Results count */}
        <Box sx={{ px: 2.5, mb: 1.5 }}>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.72rem",
              color: "#9CA3AF",
            }}
          >
            {"พบ"} {products.length} {"ผลิตภัณฑ์"}
          </Typography>
        </Box>

        {/* Product Grid/List */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <Box
              key="grid"
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.5,
                px: 2.5,
              }}
            >
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        height: 200,
                        borderRadius: "16px",
                        overflow: "hidden",
                        mb: 0.8,
                        boxShadow: "0 4px 12px rgba(27,42,74,0.06)",
                      }}
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "35%",
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)",
                        }}
                      />
                      {product.hasGI && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: "#C5A55A",
                            color: "#FFFFFF",
                            px: 0.8,
                            py: 0.2,
                            borderRadius: "6px",
                            fontSize: "0.55rem",
                            fontWeight: 700,
                            fontFamily: '"Noto Serif Thai", serif',
                          }}
                        >
                          GI
                        </Box>
                      )}
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          bgcolor: "rgba(255,255,255,0.85)",
                          width: 28,
                          height: 28,
                          "&:hover": { bgcolor: "#FFF" },
                        }}
                      >
                        <FavoriteBorderRoundedIcon
                          sx={{ fontSize: 14, color: "#1B2A4A" }}
                        />
                      </IconButton>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          bgcolor: "rgba(255,255,255,0.92)",
                          backdropFilter: "blur(6px)",
                          borderRadius: "7px",
                          px: 0.8,
                          py: 0.25,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: '"Noto Serif Thai", serif',
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            color: "#1B2A4A",
                          }}
                        >
                          {product.price.toLocaleString()} {"บาท"}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: '"Noto Serif Thai", serif',
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        color: "#1B2A4A",
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 0.2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Noto Serif Thai", serif',
                          fontSize: "0.65rem",
                          color: "#9CA3AF",
                        }}
                      >
                        {product.community}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.2,
                        }}
                      >
                        <StarRoundedIcon
                          sx={{ color: "#C5A55A", fontSize: 11 }}
                        />
                        <Typography
                          sx={{
                            fontFamily: '"Noto Serif Thai", serif',
                            fontSize: "0.6rem",
                            color: "#6B7280",
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
          ) : (
            <Box
              key="list"
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.2,
                px: 2.5,
              }}
            >
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
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
                    <Box
                      sx={{
                        position: "relative",
                        width: 110,
                        minHeight: 110,
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
                      <Typography
                        sx={{
                          fontFamily: '"Noto Serif Thai", serif',
                          fontSize: "0.68rem",
                          color: "#9CA3AF",
                          mb: 0.5,
                        }}
                      >
                        {product.community} {" | "} {"จ."}{product.province}
                      </Typography>
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
                            fontSize: "0.88rem",
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
                            {product.rating} ({product.reviewCount})
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Link>
              ))}
            </Box>
          )}
        </AnimatePresence>
      </Box>
    </MobileLayout>
  );
}
