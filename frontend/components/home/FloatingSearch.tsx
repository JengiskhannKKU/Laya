"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * แถบค้นหาลอยใต้ hero — ย้ายออกมาจาก HeroSearch เพื่อให้ hero เล่าเรื่องอย่างเดียว
 * ส่วนค้นหาเป็นโมเมนต์ของตัวเอง (สไตล์ Airbnb) พร้อมชิปหมวดยอดนิยม
 */
export default function FloatingSearch() {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const popularTags = t<string[]>("home.hero.tags");

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{
        // ลอยคาบขอบล่างของ hero — มือถือคาบลึกขึ้นเพราะ hero เป็นภาพเต็มจอ
        mt: { xs: -3.5, md: -4 },
        position: "relative",
        zIndex: 5,
        pb: { xs: 1.5, md: 3 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Search bar */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 720,
          display: "flex",
          alignItems: "center",
          bgcolor: "#FFFFFF",
          borderRadius: "999px",
          border: "1px solid #E5DFD6",
          pl: { xs: 2, md: 3 },
          pr: { xs: 0.75, md: 1 },
          py: { xs: 0.75, md: 1.1 },
          gap: { xs: 1, md: 1.5 },
          boxShadow: "0 14px 40px rgba(27,42,74,0.16)",
          transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          "&:focus-within": {
            borderColor: "#C5A55A",
            boxShadow: "0 16px 44px rgba(197,165,90,0.2)",
          },
        }}
      >
        <SearchRoundedIcon sx={{ color: "#A89F94", fontSize: 24, flexShrink: 0 }} />
        <InputBase
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          placeholder={t("home.hero.searchPlaceholder")}
          sx={{
            flex: 1,
            fontFamily: '"Kanit", sans-serif',
            fontSize: "1rem",
            color: "#13284B",
            "& input::placeholder": { color: "#A89F94", opacity: 1 },
          }}
        />
        {/* ปุ่มวงกลมทองตาม mockup */}
        <IconButton
          onClick={handleSearch}
          aria-label={t("home.hero.searchButton")}
          sx={{
            width: 46,
            height: 46,
            flexShrink: 0,
            bgcolor: "#C9A86A",
            color: "#FFFFFF",
            transition: "background-color 0.25s ease, transform 0.25s ease",
            "&:hover": { bgcolor: "#B8954A", transform: "scale(1.04)" },
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </Box>

      {/* Category chips — มือถือเลื่อนแนวนอนแถวเดียว (แบบแอป), desktop ห่อกลาง */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "flex-start", md: "center" },
          flexWrap: { xs: "nowrap", md: "wrap" },
          gap: 1,
          mt: { xs: 1.5, md: 2 },
          px: { xs: 0.5, md: 2 },
          maxWidth: "100%",
          overflowX: { xs: "auto", md: "visible" },
          pb: { xs: 0.5, md: 0 },
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontSize: { xs: "0.85rem", md: "0.92rem" },
            color: "#8C8275",
            fontWeight: 500,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {t("home.hero.popular")} :
        </Typography>
        {popularTags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
            variant="outlined"
            size="medium"
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 400,
              fontSize: { xs: "0.85rem", md: "0.9rem" },
              height: { xs: 32, md: 34 },
              px: 0.5,
              flexShrink: 0,
              bgcolor: "#FFFFFF",
              borderColor: "#E5DFD6",
              color: "#374151",
              borderRadius: "999px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              transition: "all 0.25s ease",
              "&:hover": {
                bgcolor: "#13284B",
                color: "#FFFFFF",
                borderColor: "#13284B",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(19,40,75,0.15)",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
