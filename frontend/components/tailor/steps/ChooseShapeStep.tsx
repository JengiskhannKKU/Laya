"use client";

/**
 * ChooseShapeStep — ขั้น "เลือกเทมเพลต" ของ Flow 1 (สั่งตัดด้วยผ้าที่มีอยู่แล้ว)
 *
 * ปรับตามสเปค "LAYA Template System" (services.png): LAYA เป็นเจ้าของ Template Library มาตรฐาน
 * ลูกค้าเลือกจากเทมเพลตที่มีอยู่ (ไม่ใช่ custom ทีละชิ้นส่วนแบบเดิมอีกต่อไป) แต่ละเทมเพลตมี 2 มุมมอง
 * (หน้า/หลัง) ระบบนำผ้าที่ลูกค้าอัปโหลดไว้มา map เป็น Preview ให้ดูก่อนสั่งจริง (Preview Engine)
 *
 * เทมเพลตทั้งหมดตอนนี้เป็น placeholder silhouette (auto-generated) รอ asset จริงจาก designer —
 * สลับเป็นภาพจริงได้แค่แก้ path ใน catalog.json (templateLibrary) ไม่ต้องแก้โค้ดหน้านี้เลย
 *
 * พรีวิวใช้รูปผ้าจริงที่ผู้ใช้อัปโหลดไว้เสมอ (แทนลายผ้าใน catalog) เพราะ flow นี้คือ "มีผ้าอยู่แล้ว"
 */

import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import type { Catalog, TemplateLibraryItem } from "@/components/design-clothes/builder/types";
import { PartPreview } from "@/components/design-clothes/builder/GarmentRenderer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

export default function ChooseShapeStep({ orderState, setOrderState, onNext }: any) {
  const { t } = useLanguage();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(orderState.shape?.id ?? null);
  const [view, setView] = useState<"front" | "back">("front");

  const fabricImage: string | undefined = orderState.fabricImage;

  useEffect(() => {
    fetch("/assets/garments/catalog.json")
      .then((res) => res.json())
      .then((data: Catalog) => setCatalog(data))
      .catch((err) => console.error("โหลด catalog ไม่สำเร็จ:", err));
  }, []);

  if (!catalog) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8 }}>
        <CircularProgress sx={{ color: NAVY }} />
        <Typography sx={{ fontFamily: FONT, color: "#6B7280", fontSize: "0.88rem" }}>{t("tailorFlow.chooseShape.loading")}</Typography>
      </Box>
    );
  }

  const templates = catalog.templateLibrary ?? [];
  const selected = templates.find((t) => t.id === selectedId) ?? null;

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
              {t("tailorFlow.chooseShape.subtitle")}
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
            {templates.map((t) => (
              <Box
                key={t.id}
                component={motion.button}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSelectedId(t.id); setView("front"); }}
                sx={{
                  border: "1px solid #EFE9DD", borderRadius: "16px", bgcolor: "#FFFFFF", p: 1.5,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(27,42,74,0.06)",
                  "&:hover": { borderColor: GOLD },
                }}
              >
                <Box sx={{ width: "100%", aspectRatio: "1/1.3", bgcolor: "#FBF9F5", borderRadius: "10px", p: 1.5 }}>
                  <PartPreview asset={t.front} mode="mask" patternImage={fabricImage ?? null} color={fabricImage ? null : "#C9B896"} />
                </Box>
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: "0.85rem" }}>{t.name}</Typography>
              </Box>
            ))}
          </Box>
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
            <PartPreview asset={view === "front" ? selected.front : selected.back} mode="mask"
              patternImage={fabricImage ?? null} color={fabricImage ? null : "#C9B896"} />
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
