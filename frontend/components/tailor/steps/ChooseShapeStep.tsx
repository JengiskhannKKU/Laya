"use client";

/**
 * ChooseShapeStep — ขั้น "เลือกเทมเพลต" ของ Flow 1 (สั่งตัดด้วยผ้าที่มีอยู่แล้ว)
 *
 * ปรับตามสเปค "LAYA Template System" (services.png): LAYA เป็นเจ้าของ Template Library มาตรฐาน
 * ลูกค้าเลือกจากเทมเพลตที่มีอยู่ (ไม่ใช่ custom ทีละชิ้นส่วนแบบเดิมอีกต่อไป) แต่ละเทมเพลตมี 2 มุมมอง (หน้า/หลัง)
 *
 * Step นี้มาหลัง "เลือกร้านตัดเย็บ" (select_shop) เสมอ — แสดง template ทั้งหมดของ LAYA (ไม่ซ่อนอันไหน)
 * แต่ template ที่ร้านที่เลือกไว้ "ไม่รับตัด" จะถูก disable ไว้ (คลิกไม่ได้ + mờ + ป้ายกำกับ) แทนการซ่อน —
 * ให้ลูกค้าเห็นภาพรวม catalog ทั้งหมดของ LAYA แต่ก็รู้ทันทีว่าอันไหนสั่งกับร้านนี้ไม่ได้ (เหมือน UI ฝั่งร้านค้า)
 *
 * แสดงภาพเทมเพลตจริงแบบ mode="image" ตรงๆ (ไม่ใช่ mode="mask" ผสมลายผ้าเหมือนที่เคยตั้งใจไว้) เพราะ:
 * 1) ตอนนี้ step นี้อยู่ก่อนขั้นอัปโหลดผ้า (upload) เสมอ — orderState.fabricImage ยังไม่มีค่าให้ผสมอยู่ดี
 * 2) การแปลงภาพ artwork จริง (เส้น/กระดุม/ปกเสื้อ) ให้เป็น solid silhouette สำหรับทำ mask จะทำลายรายละเอียด
 *    ของภาพจริงไปหมด เหลือแค่ blob ทึบสีเดียว ดูไม่ออกว่าเป็นภาพชุดไหน — ขัดกับจุดประสงค์ที่อยากให้เห็นภาพจริง
 */

import { useEffect, useMemo, useState } from "react";
import { Box, Typography, CircularProgress, InputBase } from "@mui/material";
import { motion } from "framer-motion";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";

import type { Catalog, TemplateLibraryItem } from "@/components/design-clothes/builder/types";
import { PartPreview } from "@/components/design-clothes/builder/GarmentRenderer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

const EMPTY_CATALOG: Catalog = {
  version: 1,
  canvas: { width: 400, height: 520 },
  patterns: [],
  colors: [],
  options: {} as any,
  categories: [] as any,
  templates: [] as any,
  templateLibrary: [],
};

// จัดกลุ่มเทมเพลตเป็นแท็บหมวดหมู่ (ทั้งหมด/เดรส/เสื้อ/สูท) ตามสเปค custom_design_flow.jpg —
// จับกลุ่มฝั่ง frontend เท่านั้นจาก template id ไม่แตะ field "category" จริงใน DB (top/bottom/skirt)
// เพราะ field นั้นหมายถึง "ตำแหน่งชิ้นส่วนร่างกาย" ใช้ที่อื่นในระบบอยู่แล้ว (design-clothes builder) คนละความหมายกัน
type GarmentGroup = "dress" | "shirt" | "suit";
const GARMENT_GROUP: Record<string, GarmentGroup> = {
  dress: "dress",
  shirt: "shirt", polo: "shirt", crop: "shirt", kimono: "shirt",
  blazer: "suit", vest: "suit", jacket: "suit",
};
function garmentGroupOf(id: string): GarmentGroup {
  return GARMENT_GROUP[id] ?? "shirt";
}

export default function ChooseShapeStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [availableIds, setAvailableIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<GarmentGroup | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(orderState.shape?.id ?? null);
  const [view, setView] = useState<"front" | "back">("front");

  const shopId: string | undefined = orderState.shop?.id;
  const shopName: string | undefined = orderState.shop?.name;

  useEffect(() => {
    // โหลด template ทั้งหมดของ LAYA เสมอ (/api/templates) — ไม่กรองตามร้าน
    // แล้วโหลดรายการ id ที่ร้านที่เลือกไว้รับตัดจริง (/api/templates/shop/:shopId) มาทำเป็น availableIds
    // เพื่อ disable รายการที่ร้านนี้ไม่รับตัด แทนการซ่อนออกจาก catalog ทั้งหมด
    const fetchAll = fetch("/api/templates").then((res) => {
      if (!res.ok) throw new Error(`API returned ${res.status}: ${res.statusText}`);
      return res.json();
    });

    const fetchAvailable = shopId
      ? fetch(`/api/templates/shop/${shopId}`).then((res) => {
          if (!res.ok) throw new Error(`API returned ${res.status}: ${res.statusText}`);
          return res.json();
        })
      : Promise.resolve([]);

    Promise.all([fetchAll, fetchAvailable])
      .then(([all, available]) => {
        console.log("All templates:", all, "Shop-available templates:", available);

        const allTemplates = Array.isArray(all) ? all : [];
        const availableList = Array.isArray(available) ? available : [];

        const mockCatalog: Catalog = {
          ...EMPTY_CATALOG,
          templateLibrary: allTemplates.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            front: t.frontAssetUrl,
            back: t.backAssetUrl,
            basePrice: t.basePrice,
          })),
        };
        setCatalog(mockCatalog);
        setAvailableIds(new Set(availableList.map((t: any) => t.id)));
      })
      .catch((err) => {
        console.error("❌ โหลด templates ไม่สำเร็จ:", err.message);
        setCatalog(EMPTY_CATALOG);
        setAvailableIds(new Set());
      });
  }, [shopId]);

  if (!catalog) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8 }}>
        <CircularProgress sx={{ color: NAVY }} />
        <Typography sx={{ fontFamily: FONT, color: "#6B7280", fontSize: "0.88rem" }}>{t("tailorFlow.chooseShape.loading")}</Typography>
      </Box>
    );
  }

  const allTemplates = catalog.templateLibrary ?? [];
  const filteredTemplates = allTemplates.filter((tpl) =>
    tpl.name.toLowerCase().includes(search.trim().toLowerCase()) &&
    (categoryFilter === "all" || garmentGroupOf(tpl.id) === categoryFilter)
  );
  const selected = allTemplates.find((t) => t.id === selectedId) ?? null;

  const CATEGORY_TABS: { key: GarmentGroup | "all"; label: string }[] = [
    { key: "all", label: t("tailorFlow.chooseShape.categoryAll") },
    { key: "dress", label: t("tailorFlow.chooseShape.categoryDress") },
    { key: "shirt", label: t("tailorFlow.chooseShape.categoryShirt") },
    { key: "suit", label: t("tailorFlow.chooseShape.categorySuit") },
  ];

  const handleSelectTemplate = (t: TemplateLibraryItem) => {
    if (!availableIds.has(t.id)) return; // ร้านนี้ไม่รับตัดทรงนี้ — คลิกไม่ได้
    setSelectedId(t.id);
    setView("front");
  };

  const handleConfirm = () => {
    if (!selected) return;
    setOrderState({
      ...orderState,
      shape: {
        id: selected.id, name: selected.name, category: selected.category,
        front: selected.front, back: selected.back, price: selected.basePrice,
      },
    });
    onNext();
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

      {!selected ? (
        <>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: "0.95rem" }}>
              {t("tailorFlow.chooseShape.title")}
            </Typography>
            <Typography sx={{ fontFamily: FONT, color: "#6B7280", fontSize: "0.8rem", mt: 0.3 }}>
              {shopName
                ? t("tailorFlow.chooseShape.subtitleWithShop").replace("{shop}", shopName)
                : t("tailorFlow.chooseShape.subtitle")}
            </Typography>
          </Box>

          {/* ช่องค้นหาเทมเพลต */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #EFE9DD",
            borderRadius: "14px", px: 1.75, py: 0.9,
          }}>
            <SearchRoundedIcon sx={{ fontSize: 20, color: "#9CA3AF" }} />
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("tailorFlow.chooseShape.searchPlaceholder")}
              sx={{ flex: 1, fontFamily: FONT, fontSize: "0.85rem", color: NAVY }}
            />
          </Box>

          {/* แท็บหมวดหมู่ (ทั้งหมด/เดรส/เสื้อ/สูท) */}
          <Box sx={{ display: "flex", gap: 0.75, overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { display: "none" } }}>
            {CATEGORY_TABS.map((tab) => {
              const active = categoryFilter === tab.key;
              return (
                <Box
                  key={tab.key}
                  onClick={() => setCategoryFilter(tab.key)}
                  sx={{
                    px: 1.6, py: 0.7, borderRadius: "999px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    bgcolor: active ? NAVY : "#FFFFFF", color: active ? "#FFFFFF" : NAVY,
                    border: active ? "none" : "1px solid #EFE9DD",
                    fontFamily: FONT, fontSize: "0.78rem", fontWeight: 600, transition: "all 0.2s",
                  }}
                >
                  {tab.label}
                </Box>
              );
            })}
          </Box>

          {filteredTemplates.length === 0 ? (
            <Typography sx={{ fontFamily: FONT, textAlign: "center", color: "#9CA3AF", fontSize: "0.85rem", py: 4 }}>
              {t("tailorFlow.chooseShape.noSearchResults")}
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
              {filteredTemplates.map((tpl) => {
                const available = availableIds.has(tpl.id);
                return (
                  <Box
                    key={tpl.id}
                    component={motion.button}
                    whileTap={available ? { scale: 0.97 } : undefined}
                    onClick={() => handleSelectTemplate(tpl)}
                    sx={{
                      position: "relative",
                      border: "1px solid #EFE9DD", borderRadius: "16px", bgcolor: "#FFFFFF", p: 1.5,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75,
                      cursor: available ? "pointer" : "not-allowed",
                      boxShadow: "0 4px 16px rgba(27,42,74,0.06)",
                      opacity: available ? 1 : 0.45,
                      filter: available ? "none" : "grayscale(0.6)",
                      "&:hover": available ? { borderColor: GOLD } : {},
                    }}
                  >
                    {!available && (
                      <Box sx={{
                        position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 0.4,
                        bgcolor: "rgba(27,42,74,0.85)", color: "white", px: 1, py: 0.3, borderRadius: "999px",
                      }}>
                        <BlockRoundedIcon sx={{ fontSize: 12 }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.62rem", fontWeight: 600 }}>{t("tailorFlow.chooseShape.shopUnavailableBadge")}</Typography>
                      </Box>
                    )}
                    <Box sx={{ width: "100%", aspectRatio: "1/1.3", bgcolor: "#FBF9F5", borderRadius: "10px", p: 1.5 }}>
                      <PartPreview asset={tpl.front} mode="image" patternImage={null} color={null} />
                    </Box>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: "0.85rem" }}>{tpl.name}</Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </>
      ) : (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box onClick={() => setSelectedId(null)} sx={{ cursor: "pointer", display: "flex", color: NAVY }}>
              <ChevronLeftRoundedIcon />
            </Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: "0.92rem" }}>{selected.name}</Typography>
          </Box>

          {/* Front/Back toggle */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {(["front", "back"] as const).map((v) => (
              <Box key={v} onClick={() => setView(v)}
                sx={{
                  flex: 1, py: 1, textAlign: "center", borderRadius: "10px", cursor: "pointer",
                  bgcolor: view === v ? NAVY : "#FFFFFF", color: view === v ? "white" : NAVY,
                  border: view === v ? "none" : "1px solid #EFE9DD",
                  fontFamily: FONT, fontSize: "0.82rem", fontWeight: 600, transition: "all 0.2s",
                }}
              >
                {v === "front" ? t("tailorFlow.chooseShape.front") : t("tailorFlow.chooseShape.back")}
              </Box>
            ))}
          </Box>

          {/* พรีวิว — Template + Fabric Texture mapping (Preview Engine) */}
          <Box sx={{
            width: "100%", height: 320, borderRadius: "18px", bgcolor: "#FBF9F5", border: "1px solid #EFE9DD",
            boxShadow: "0 4px 20px rgba(27,42,74,0.06)", p: 2.5, position: "relative",
          }}>
            <PartPreview asset={view === "front" ? selected.front : selected.back} mode="image"
              patternImage={null} color={null} />
            <Box sx={{ position: "absolute", top: 10, left: 10, bgcolor: "rgba(27,42,74,0.85)", color: "white", px: 1.5, py: 0.4, borderRadius: "999px" }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600 }}>{selected.name}</Typography>
            </Box>
          </Box>

          {/* Design Visualization disclaimer — ตามสเปค LAYA Template System */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", bgcolor: `${GOLD}0F`, border: `1px solid ${GOLD}40`, borderRadius: "12px", px: 1.5, py: 1.1 }}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: GOLD, mt: 0.15, flexShrink: 0 }} />
            <Typography sx={{ fontFamily: FONT, color: "#8A6D3B", fontSize: "0.7rem", lineHeight: 1.6 }}>
              {t("tailorFlow.chooseShape.disclaimer")}
            </Typography>
          </Box>

          <Box
            component={motion.button}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            sx={{
              mt: 1, bgcolor: NAVY, color: "white", py: 1.7, borderRadius: "14px", border: "none", cursor: "pointer",
              fontFamily: FONT, fontWeight: 600, fontSize: "0.95rem", boxShadow: "0 4px 14px rgba(27,42,74,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
            }}
          >
            <CheckRoundedIcon sx={{ fontSize: 18 }} /> {t("tailorFlow.chooseShape.confirm")}
          </Box>
        </>
      )}
    </Box>
  );
}
