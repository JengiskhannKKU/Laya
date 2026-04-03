"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { communities } from "@/lib/mock-data";
import Image from "next/image";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Link from "next/link";

export default function CommunitiesSection() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45, duration: 0.5 }}
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
            {"ชุมชนยอดนิยม"}
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

      {/* Community Cards */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          px: 2.5,
          pb: 1,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {communities.map((community, index) => (
          <Link href={`/community/${community.id}`} key={community.id} style={{ textDecoration: 'none' }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.08, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              sx={{
                minWidth: 220,
                bgcolor: "#FFFFFF",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #E5DFD6",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(27,42,74,0.04)",
              }}
            >
              <Box sx={{ position: "relative", height: 100 }}>
                <Image
                  src={community.image}
                  alt={community.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, transparent 40%, rgba(27,42,74,0.5) 100%)",
                  }}
                />
              </Box>
              <Box sx={{ px: 1.5, py: 1.2 }}>
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    color: "#1B2A4A",
                    lineHeight: 1.3,
                  }}
                >
                  {community.name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontSize: "0.65rem",
                    color: "#9CA3AF",
                    mt: 0.2,
                  }}
                >
                  {"จ."}{community.province}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: 0.8,
                  }}
                >
                  <PeopleAltRoundedIcon
                    sx={{ fontSize: 12, color: "#C5A55A" }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontSize: "0.6rem",
                      color: "#6B7280",
                    }}
                  >
                    {community.memberCount} {"สมาชิก"} {" | "}{" "}
                    {community.productCount} {"ผลิตภัณฑ์"}
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
