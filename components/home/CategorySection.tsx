"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { categories } from "@/lib/mock-data";
import Link from "next/link";

const categoryEmojis: Record<string, string> = {
  silk: "silk",
  cotton: "cotton",
  gi: "GI",
  province: "map",
};

const categoryColors: Record<string, { bg: string; border: string }> = {
  silk: { bg: "#FDF8EE", border: "#E8D9B5" },
  cotton: { bg: "#F0F4F8", border: "#C8D6E0" },
  gi: { bg: "#FFF8E8", border: "#E8D49B" },
  province: { bg: "#F0EDE8", border: "#D6CFC4" },
};

export default function CategorySection() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      sx={{ py: 1, px: 2.5 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 1,
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
          {"หมวดหมู่"}
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 1,
        }}
      >
        {categories.map((cat, index) => {
          const colors = categoryColors[cat.id] || {
            bg: "#F0EBE3",
            border: "#E5DFD6",
          };
          return (
            <Link
              key={cat.id}
              href="/explore"
              style={{ textDecoration: "none" }}
            >
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.06 }}
                whileTap={{ scale: 0.93 }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: colors.bg,
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: "14px",
                  py: 1.5,
                  px: 0.5,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(27,42,74,0.08)",
                  },
                }}
              >
                {cat.id === "gi" ? (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "#C5A55A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        color: "#FFFFFF",
                        letterSpacing: 0.5,
                      }}
                    >
                      GI
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "#1B2A4A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        color: "#FFFFFF",
                        fontWeight: 600,
                      }}
                    >
                      {cat.icon === "silk"
                        ? "S"
                        : cat.icon === "cotton"
                          ? "C"
                          : "P"}
                    </Typography>
                  </Box>
                )}
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    color: "#1B2A4A",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {cat.name}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}
