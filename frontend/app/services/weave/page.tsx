"use client";

/**
 * /services/weave — "เลือกทอผ้า"
 * แสดงรายลายผ้าแรงบันดาลใจจริงจาก "แผนที่ผ้าไทย" (76 จังหวัด) — ใช้ frontend/lib/fabric-origins.ts
 * ชุดข้อมูลเดียวกับ ThailandFabricMap.tsx เป๊ะ (ไม่ปั้นชุดข้อมูลใหม่ซ้ำ)
 * มีปุ่ม "เจนลายผ้าใหม่ด้วย AI" เด่นด้านบนสำหรับพาไป /custom
 *
 * ธีมปรับให้ตรงกับหน้า /services และ /services/tailor (Kanit font, header sticky แบบเดียวกัน) —
 * เดิมหน้านี้ใช้ font "Noto Serif Thai" และ header ไม่ sticky ต่างจากหน้าอื่นในแอปทั้งหมด
 *
 * i18n: ชื่อจังหวัด/ภาค และ UI copy ทั้งหมดรองรับ TH/EN — แต่ "ชื่อลายผ้า" และ "เรื่องราวลาย" (story)
 * ยังเป็นภาษาไทยเท่านั้นในทั้งสองภาษา เพราะข้อมูลต้นทางใน fabric-origins.ts มีแค่เวอร์ชันไทย (ไม่มีคำแปล
 * ภาษาอังกฤษของเนื้อหาเชิงวัฒนธรรม/ประวัติศาสตร์เหล่านี้เก็บไว้) — ชื่อจังหวัดใช้ field geoName ที่มีอยู่แล้วแทน
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Dialog from "@mui/material/Dialog";
import Chip from "@mui/material/Chip";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import { PROVINCES, REGIONS, type Province } from "@/lib/fabric-origins";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const IVORY = "#FAF6F0";

export default function WeaveSelectPage() {
  const { t, locale } = useLanguage();

  const REGION_FILTERS: { key: string; label: string }[] = [
    { key: "all", label: t("common.all") },
    ...Object.keys(REGIONS).map((key) => ({ key, label: t(`services.weave.regions.${key}`) })),
  ];
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [selected, setSelected] = useState<Province | null>(null);

  // ชื่อจังหวัดที่แสดงจริง — EN ใช้ geoName ถ้ามี (fallback ชื่อไทยถ้าไม่มี), TH ใช้ชื่อไทยเสมอ
  const provinceDisplayName = (p: Province) => (locale === "en" ? p.geoName ?? p.name : p.name);

  const fabrics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROVINCES.filter((p) => {
      if (region !== "all" && p.region !== region) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        (p.geoName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [search, region]);

  return (
    <MobileLayout>
      <Box sx={{ minHeight: "100vh", bgcolor: IVORY }}>
        {/* Header — sticky, ดีไซน์เดียวกับ /services และ /services/tailor */}
        <Box sx={{
          px: { xs: 1.5, md: 4 }, pt: { xs: 4, md: 3 }, pb: { xs: 2, md: 2.5 }, display: "flex", alignItems: "center",
          bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #EFE9DD",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", maxWidth: 720, width: "100%", mx: "auto" }}>
            <Link href="/services">
              <IconButton sx={{ color: NAVY }}>
                <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Link>
            <Typography sx={{ flex: 1, textAlign: "center", mr: 5, fontFamily: FONT, fontSize: { xs: "1.05rem", md: "1.25rem" }, fontWeight: 700, color: NAVY }}>
              {t("services.weave.pageTitle")}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 720, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 3, md: 4 }, pb: 6 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: "#6B7280", textAlign: "center", mb: 3 }}>
            {t("services.weave.subtitle")}
          </Typography>

          {/* CTA: generate new pattern with AI */}
          <Box sx={{ mb: 3 }}>
            <Link href="/custom" style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  background: `linear-gradient(135deg, ${GOLD} 0%, #D4BA7A 100%)`,
                  color: NAVY,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  boxShadow: "0 8px 24px rgba(197,165,90,0.25)",
                  transition: "transform 0.2s",
                  "&:active": { transform: "scale(0.98)" },
                }}
              >
                <Box sx={{
                  width: 46, height: 46, borderRadius: "50%", bgcolor: "rgba(27,42,74,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <AutoAwesomeRoundedIcon sx={{ color: NAVY }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem" }}>
                    {t("services.weave.generateTitle")}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", mt: 0.3, opacity: 0.85 }}>
                    {t("services.weave.generateDesc")}
                  </Typography>
                </Box>
              </Box>
            </Link>
          </Box>

          {/* Search */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{
              display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #EFE9DD",
              borderRadius: "14px", px: 1.75, py: 0.5,
            }}>
              <SearchRoundedIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
              <InputBase
                placeholder={t("services.weave.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flex: 1, fontFamily: FONT, fontSize: "0.9rem", py: 1 }}
              />
            </Box>
          </Box>

          {/* Region filter chips */}
          <Box sx={{ mb: 2.5, display: "flex", gap: 1, overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { display: "none" } }}>
            {REGION_FILTERS.map((r) => (
              <Chip
                key={r.key}
                label={r.label}
                onClick={() => setRegion(r.key)}
                sx={{
                  fontFamily: FONT, fontWeight: 600, fontSize: "0.78rem",
                  bgcolor: region === r.key ? NAVY : "#FFFFFF",
                  color: region === r.key ? "#FFFFFF" : NAVY,
                  border: "1px solid #EFE9DD",
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>

          {/* Fabric grid */}
          {fabrics.length === 0 ? (
            <Typography sx={{ fontFamily: FONT, color: "#9CA3AF", textAlign: "center", py: 6, fontSize: "0.85rem" }}>
              {t("services.weave.noResults")}
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              {fabrics.map((p) => (
                <Box
                  key={p.id}
                  onClick={() => setSelected(p)}
                  sx={{
                    borderRadius: "16px", overflow: "hidden", bgcolor: "#FFFFFF", border: "1px solid #EFE9DD",
                    boxShadow: "0 4px 16px rgba(27,42,74,0.06)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.25s",
                    "&:hover": { boxShadow: "0 12px 32px rgba(27,42,74,0.12)" },
                    "&:active": { transform: "scale(0.98)" },
                  }}
                >
                  <Box sx={{ aspectRatio: "4/3", bgcolor: "#F0EBE3", position: "relative" }}>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.fabric} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Box sx={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[p.colors.length - 1]})` }} />
                    )}
                  </Box>
                  <Box sx={{ p: 1.25 }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.8rem", color: NAVY, lineHeight: 1.3 }} noWrap>
                      {p.fabric}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF", mt: 0.2 }}>
                      {t("services.weave.provincePrefix")}{provinceDisplayName(p)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, mt: 0.75 }}>
                      {p.colors.slice(0, 4).map((c, i) => (
                        <Box key={i} sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: c, border: "1px solid rgba(0,0,0,0.08)" }} />
                      ))}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Detail dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "20px" } }}>
        {selected && (
          <Box>
            <Box sx={{ position: "relative", aspectRatio: "4/3", bgcolor: "#F0EBE3" }}>
              {selected.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image} alt={selected.fabric} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Box sx={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${selected.colors[0]}, ${selected.colors[selected.colors.length - 1]})` }} />
              )}
              <IconButton
                onClick={() => setSelected(null)}
                sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(255,255,255,0.9)", "&:hover": { bgcolor: "#FFFFFF" } }}
                size="small"
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.05rem", color: NAVY }}>
                {selected.fabric}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#9CA3AF", mt: 0.3, mb: 1.5 }}>
                {t("services.weave.provinceWord")} {provinceDisplayName(selected)} · {t(`services.weave.regions.${selected.region}`)}
              </Typography>
              {selected.story?.history && (
                <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#4B5563", lineHeight: 1.7, mb: 2 }}>
                  {selected.story.history.length > 220 ? `${selected.story.history.slice(0, 220)}…` : selected.story.history}
                </Typography>
              )}
              <Link href="/community/heritage" style={{ textDecoration: "none" }}>
                <Box sx={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 1, p: 1.5, borderRadius: "12px",
                  bgcolor: NAVY, color: "#FFFFFF", fontFamily: FONT, fontWeight: 600, fontSize: "0.85rem",
                }}>
                  <MapRoundedIcon fontSize="small" />
                  {t("services.weave.fullStoryLink")}
                </Box>
              </Link>
            </Box>
          </Box>
        )}
      </Dialog>
    </MobileLayout>
  );
}
