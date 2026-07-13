"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const popularTags = ["ผ้าไหม", "ผ้าฝ้าย", "คราม", "กระเป๋า", "ผ้าทอมือ", "Community Collection"];

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{
        pt: { xs: 5, md: 9 },
        pb: { xs: 4, md: 7 },
        px: { xs: 2.5, md: 0 },
        textAlign: "center",
      }}
    >
      {/* Eyebrow */}
      <Typography
        sx={{
          fontFamily: '"Kanit", sans-serif',
          fontWeight: 600,
          fontSize: "0.65rem",
          letterSpacing: "0.28em",
          color: "#C5A55A",
          textTransform: "uppercase",
          mb: 1.5,
        }}
      >
        The LAYA Marketplace
      </Typography>

      {/* Main heading */}
      <Typography
        sx={{
          fontFamily: '"Kanit", sans-serif',
          fontWeight: 700,
          fontSize: { xs: "2.1rem", md: "3.4rem" },
          color: "#1B2A4A",
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
        }}
      >
        ผ้าไทยทอมือ
      </Typography>

      {/* Editorial accent line */}
      <Typography
        sx={{
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: { xs: "1.15rem", md: "1.7rem" },
          color: "#B8954A",
          mt: 0.5,
          letterSpacing: "0.01em",
        }}
      >
        A Curated Heritage Collection
      </Typography>

      {/* Sub heading */}
      <Typography
        sx={{
          fontFamily: '"Kanit", sans-serif',
          fontWeight: 300,
          fontSize: { xs: "0.9rem", md: "1.05rem" },
          color: "#7A7468",
          mt: 2,
          maxWidth: 520,
          mx: "auto",
        }}
      >
        เลือกสรรผ้าทอมือจากชุมชนช่างฝีมือทั่วไทย — สั่งตัด สั่งทอ และสะสมลวดลายอันเป็นเอกลักษณ์
      </Typography>

      {/* Search box */}
      <Box
        sx={{
          maxWidth: 620,
          mx: "auto",
          mt: { xs: 3.5, md: 4.5 },
          display: "flex",
          alignItems: "center",
          bgcolor: "#FFFFFF",
          borderRadius: "999px",
          border: "1px solid #E5DFD6",
          pl: 3,
          pr: 1,
          py: 1,
          gap: 1.5,
          boxShadow: "0 10px 30px rgba(27,42,74,0.08)",
          transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          "&:focus-within": {
            borderColor: "#C5A55A",
            boxShadow: "0 12px 34px rgba(197,165,90,0.18)",
          },
        }}
      >
        <SearchRoundedIcon sx={{ color: "#A89F94", fontSize: 24, flexShrink: 0 }} />
        <InputBase
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ค้นหาผ้าไหม ชุมชนทอผ้า หรือลวดลาย…"
          sx={{
            flex: 1,
            fontFamily: '"Kanit", sans-serif',
            fontSize: "1rem",
            color: "#1B2A4A",
            "& input::placeholder": { color: "#A89F94", opacity: 1 },
          }}
        />
        <Button
          onClick={handleSearch}
          sx={{
            bgcolor: "#1B2A4A",
            color: "#FFFFFF",
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 500,
            fontSize: "0.9rem",
            height: 46,
            borderRadius: "999px",
            px: 3.5,
            textTransform: "none",
            flexShrink: 0,
            boxShadow: "none",
            "&:hover": { bgcolor: "#14213a", boxShadow: "none" },
          }}
        >
          ค้นหา
        </Button>
      </Box>

      {/* Popular tags */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 1,
          mt: 2.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontSize: "0.75rem",
            color: "#A89F94",
            fontWeight: 400,
            letterSpacing: "0.04em",
          }}
        >
          ยอดนิยม
        </Typography>
        {popularTags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
            variant="outlined"
            size="small"
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 400,
              fontSize: "0.75rem",
              height: 30,
              bgcolor: "#FFFFFF",
              borderColor: "#E5DFD6",
              color: "#4A5468",
              borderRadius: "999px",
              cursor: "pointer",
              transition: "all 0.25s ease",
              "&:hover": {
                bgcolor: "#1B2A4A",
                color: "#FFFFFF",
                borderColor: "#1B2A4A",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
