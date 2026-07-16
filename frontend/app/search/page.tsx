"use client";

import { useState, useMemo, Suspense } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import type { Product } from "@/lib/live-products";
import { useLiveProducts } from "@/lib/use-live-products";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// ค่าฟิลเตอร์คงเป็นภาษาไทยเสมอ (ต้อง match กับข้อมูลสินค้าจริงจาก backend ที่ยังไม่แปล)
// ส่วนที่แปลคือ label ที่แสดงผลเท่านั้น ผ่าน provinceLabel()/fabricLabel() ด้านล่าง
const ALL_VALUE = "ทั้งหมด";
const PROVINCE_VALUES = ["ทั้งหมด", "ลำพูน", "ชัยภูมิ", "สกลนคร", "กาฬสินธุ์", "ราชบุรี", "กรุงเทพมหานคร"];
const FABRIC_VALUES = ["ทั้งหมด", "ผ้าไหม", "ผ้าฝ้าย", "ผ้าไหมผสมฝ้าย", "ผ้าทอมือ"];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products } = useLiveProducts();
  const { t } = useLanguage();
  const initialQuery = searchParams.get("q") || "";

  const provinceLabels: Record<string, string> = {
    "ทั้งหมด": t("common.all"),
    "ลำพูน": t("search.provinces.lamphun"),
    "ชัยภูมิ": t("search.provinces.chaiyaphum"),
    "สกลนคร": t("search.provinces.sakonNakhon"),
    "กาฬสินธุ์": t("search.provinces.kalasin"),
    "ราชบุรี": t("search.provinces.ratchaburi"),
    "กรุงเทพมหานคร": t("search.provinces.bangkok"),
  };
  const fabricLabels: Record<string, string> = {
    "ทั้งหมด": t("common.all"),
    "ผ้าไหม": t("search.fabricTypes.silk"),
    "ผ้าฝ้าย": t("search.fabricTypes.cotton"),
    "ผ้าไหมผสมฝ้าย": t("search.fabricTypes.silkCottonBlend"),
    "ผ้าทอมือ": t("search.fabricTypes.handwoven"),
  };
  const provinces = PROVINCE_VALUES;
  const fabricTypes = FABRIC_VALUES;
  const sortOptions = [
    { value: "popular", label: t("search.sort.popular") },
    { value: "price_low", label: t("search.sort.priceLow") },
    { value: "price_high", label: t("search.sort.priceHigh") },
    { value: "rating", label: t("search.sort.rating") },
    { value: "newest", label: t("search.sort.newest") },
  ];

  const [query, setQuery] = useState(initialQuery);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [selectedProvince, setSelectedProvince] = useState(ALL_VALUE);
  const [selectedFabric, setSelectedFabric] = useState(ALL_VALUE);
  const [giOnly, setGiOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.community.toLowerCase().includes(q) ||
          p.province.toLowerCase().includes(q) ||
          p.fabricType.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Price range
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Province
    if (selectedProvince !== "ทั้งหมด") {
      result = result.filter((p) => p.province === selectedProvince);
    }

    // Fabric type
    if (selectedFabric !== "ทั้งหมด") {
      result = result.filter((p) => p.fabricType === selectedFabric);
    }

    // GI only
    if (giOnly) {
      result = result.filter((p) => p.hasGI);
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.reverse();
        break;
      default:
        result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return result;
  }, [products, query, priceRange, selectedProvince, selectedFabric, giOnly, sortBy]);

  const activeFilterCount = [
    selectedProvince !== "ทั้งหมด",
    selectedFabric !== "ทั้งหมด",
    giOnly,
    priceRange[0] > 0 || priceRange[1] < 10000,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedProvince("ทั้งหมด");
    setSelectedFabric("ทั้งหมด");
    setGiOnly(false);
    setSortBy("popular");
  };

  // padding มาตรฐานให้เนื้อหาตรงแนวเดียวกับ TopNav — bar เต็มขอบ แต่คอนเทนต์ยังมีระยะขอบ
  const CONTENT_PX = { xs: 2.5, sm: 3, md: 5 };

  return (
    <MobileLayout>
      {/* mx: calc(50% - 50vw) ดึงทั้งหน้าออกจาก padding ของ MobileLayout ให้เต็มความกว้าง viewport —
          bar (Search/Sort) จึงชนขอบเหมือน top bar ส่วนคอนเทนต์ด้านล่างจัดระยะขอบเองผ่าน CONTENT_PX */}
      <Box sx={{ mx: "calc(50% - 50vw)", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        {/* Header — แถบขาวเต็มขอบ, เนื้อหาข้างในจัดกึ่งกลาง maxWidth 1440 */}
        <Box sx={{ bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #E5DFD6" }}>
          <Box sx={{ maxWidth: 1440, mx: "auto", px: CONTENT_PX, pt: 4, pb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Box sx={{
              flex: 1, display: "flex", alignItems: "center", bgcolor: "#FAF6F0",
              borderRadius: "12px", px: 1.5, py: 0.5, border: "1px solid #E5DFD6",
            }}>
              <SearchRoundedIcon sx={{ color: "#9CA3AF", fontSize: 20, mr: 1 }} />
              <TextField
                fullWidth
                variant="standard"
                placeholder={t("search.placeholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{ disableUnderline: true }}
                autoFocus
                sx={{ "& input": { fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", py: 0.8, color: "#1B2A4A" } }}
              />
            </Box>
            <IconButton onClick={() => setFilterOpen(true)} sx={{ color: "#1B2A4A", position: "relative" }}>
              <TuneRoundedIcon sx={{ fontSize: 22 }} />
              {activeFilterCount > 0 && (
                <Box sx={{
                  position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%",
                  bgcolor: "#C5A55A", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#FFFFFF" }}>{activeFilterCount}</Typography>
                </Box>
              )}
            </IconButton>
          </Box>

          {/* Sort Bar */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>
              {t("search.resultsCount").replace("{n}", String(filteredProducts.length))}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <SortRoundedIcon sx={{ fontSize: 16, color: "#6B7280" }} />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                variant="standard"
                disableUnderline
                sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600 }}
              >
                {sortOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value} sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem" }}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
          </Box>
        </Box>

        {/* Results — จัดกึ่งกลาง maxWidth 1440 มีระยะขอบ (ไม่ชนขอบเหมือน bar) */}
        <Box sx={{ maxWidth: 1440, mx: "auto", px: CONTENT_PX, pt: 2, pb: 10 }}>
          {filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1rem", fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
                {t("search.noResultsTitle")}
              </Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 3 }}>
                {t("search.noResultsSubtitle")}
              </Typography>
              <Button onClick={clearFilters} variant="outlined" sx={{ borderRadius: "20px", fontFamily: '"Kanit", sans-serif' }}>
                {t("search.clearFilters")}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" }, gap: { xs: 1.5, md: 2 } }}>
              <AnimatePresence>
                {filteredProducts.map((product, idx) => (
                  <Box
                    key={product.id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => router.push(`/product/${product.id}`)}
                    sx={{
                      bgcolor: "#FFFFFF", borderRadius: "16px", overflow: "hidden", cursor: "pointer",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid #E5DFD6",
                      transition: "transform 0.2s", "&:active": { transform: "scale(0.98)" },
                    }}
                  >
                    <Box sx={{ position: "relative", aspectRatio: "1 / 1" }}>
                      <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 20vw" />
                      {product.hasGI && (
                        <Box sx={{
                          position: "absolute", top: 8, left: 8, bgcolor: "rgba(197,165,90,0.9)",
                          px: 1, py: 0.2, borderRadius: "6px", display: "flex", alignItems: "center", gap: 0.3,
                        }}>
                          <VerifiedRoundedIcon sx={{ fontSize: 10, color: "#FFFFFF" }} />
                          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#FFFFFF" }}>GI</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ p: 1.5 }}>
                      <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.8rem", color: "#1B2A4A", lineHeight: 1.3 }}>
                        {product.name}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#6B7280", mt: 0.3 }}>
                        {product.community}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#C5A55A" }}>
                          ฿{product.price.toLocaleString()}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                          <StarRoundedIcon sx={{ fontSize: 12, color: "#C5A55A" }} />
                          <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{product.rating}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </AnimatePresence>
            </Box>
          )}
        </Box>

        {/* Filter Drawer */}
        <Drawer anchor="bottom" open={filterOpen} onClose={() => setFilterOpen(false)} PaperProps={{ sx: { borderTopLeftRadius: "24px", borderTopRightRadius: "24px", maxHeight: "80vh" } }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A" }}>
                {t("search.filters")}
              </Typography>
              <IconButton onClick={() => setFilterOpen(false)}>
                <CloseRoundedIcon />
              </IconButton>
            </Box>

            {/* Price Range */}
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#1B2A4A", mb: 1 }}>
              {t("search.priceRange")}
            </Typography>
            <Box sx={{ px: 1, mb: 3 }}>
              <Slider
                value={priceRange}
                onChange={(_, v) => setPriceRange(v as number[])}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `฿${v.toLocaleString()}`}
                min={0}
                max={10000}
                step={100}
                sx={{ color: "#C5A55A" }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>฿{priceRange[0].toLocaleString()}</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>฿{priceRange[1].toLocaleString()}</Typography>
              </Box>
            </Box>

            {/* Province */}
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#1B2A4A", mb: 1 }}>
              {t("search.province")}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 3 }}>
              {provinces.map((p) => (
                <Chip
                  key={p}
                  label={provinceLabels[p] ?? p}
                  onClick={() => setSelectedProvince(p)}
                  sx={{
                    fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem",
                    bgcolor: selectedProvince === p ? "#1B2A4A" : "#F0EBE3",
                    color: selectedProvince === p ? "#FFFFFF" : "#6B7280",
                    fontWeight: selectedProvince === p ? 700 : 400,
                  }}
                />
              ))}
            </Box>

            {/* Fabric Type */}
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#1B2A4A", mb: 1 }}>
              {t("search.fabricType")}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 3 }}>
              {fabricTypes.map((f) => (
                <Chip
                  key={f}
                  label={fabricLabels[f] ?? f}
                  onClick={() => setSelectedFabric(f)}
                  sx={{
                    fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem",
                    bgcolor: selectedFabric === f ? "#1B2A4A" : "#F0EBE3",
                    color: selectedFabric === f ? "#FFFFFF" : "#6B7280",
                    fontWeight: selectedFabric === f ? 700 : 400,
                  }}
                />
              ))}
            </Box>

            {/* GI Toggle */}
            <Chip
              label={t("search.giOnly")}
              icon={<VerifiedRoundedIcon sx={{ fontSize: 14, color: giOnly ? "#FFFFFF" : "#C5A55A" }} />}
              onClick={() => setGiOnly(!giOnly)}
              sx={{
                fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", mb: 3,
                bgcolor: giOnly ? "#C5A55A" : "#FAF6F0",
                color: giOnly ? "#FFFFFF" : "#1B2A4A",
                fontWeight: 600, px: 1,
              }}
            />

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                sx={{ borderRadius: "12px", borderColor: "#E5DFD6", color: "#6B7280", fontFamily: '"Kanit", sans-serif', fontWeight: 600 }}
              >
                {t("search.clearAll")}
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setFilterOpen(false)}
                sx={{
                  borderRadius: "12px", bgcolor: "#1B2A4A", fontWeight: 700, fontFamily: '"Kanit", sans-serif',
                  "&:hover": { bgcolor: "#0F1A30" },
                }}
              >
                {t("search.showResults").replace("{n}", String(filteredProducts.length))}
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Box>
    </MobileLayout>
  );
}

function SearchFallback() {
  const { t } = useLanguage();
  return (
    <MobileLayout>
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ color: "#6B7280" }}>{t("common.loading")}</Typography>
      </Box>
    </MobileLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
