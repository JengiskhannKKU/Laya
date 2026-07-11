"use client";

/**
 * ChooseShapeStep — ขั้น "เลือกทรงที่ชอบ" ของ Flow 1 (สั่งตัดด้วยผ้าที่มีอยู่แล้ว)
 *
 * รอบก่อนเคยมีขั้นนี้แล้วถูกลบออกไปตามคำขอผู้ใช้ ("ทำไมต้องเลือกทรงทั้งที่มีผ้า/AI วิเคราะห์แล้ว") —
 * ตอนนี้กลับมาใหม่ตามคำขอ โดยย้ายตำแหน่งมาก่อน "เลือกโอกาสใช้งาน" (ต่างจาก flow_1.png ที่วางไว้หลัง
 * แต่เป็นการตัดสินใจของผู้ใช้เอง) — ใช้ตรรกะเดิม: เทมเพลตจริงจาก catalog.json + GarmentRenderer เดียวกับ
 * /design-clothes (ไม่ใช่ mock UI) พรีวิวด้วยรูปผ้าที่ผู้ใช้เพิ่งอัปโหลดจริงแทนลายผ้าใน catalog
 */

import { useEffect, useMemo, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";

import type { Catalog, Category, RenderLayer, TemplateDef } from "@/components/design-clothes/builder/types";
import { resolveLayers } from "@/components/design-clothes/builder/types";
import GarmentRenderer from "@/components/design-clothes/builder/GarmentRenderer";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

const CATEGORY_GROUPS: { cat: Category; label: string }[] = [
  { cat: "top", label: "เสื้อ & เดรส" },
  { cat: "pants", label: "กางเกง" },
  { cat: "skirt", label: "กระโปรง" },
];

export default function ChooseShapeStep({ orderState, setOrderState, onNext }: any) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    fetch("/assets/garments/catalog.json")
      .then((res) => res.json())
      .then((data: Catalog) => setCatalog(data))
      .catch((err) => console.error("โหลด catalog ไม่สำเร็จ:", err));
  }, []);

  const handlePick = (t: TemplateDef) => {
    setOrderState({
      ...orderState,
      shape: { id: t.id, name: t.name, category: t.category, parts: t.parts, pattern: t.pattern, color: t.color },
    });
    onNext();
  };

  if (!catalog) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8 }}>
        <CircularProgress sx={{ color: NAVY }} />
        <Typography sx={{ fontFamily: FONT, color: "#6B7280", fontSize: "0.88rem" }}>กำลังโหลดทรงเสื้อ...</Typography>
      </Box>
    );
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
      <Typography sx={{ fontFamily: FONT, textAlign: "center", color: "#6B7280", fontSize: "0.88rem" }}>
        {orderState.fabricImage
          ? "เลือกทรงที่ชอบ — ระบบจะนำผ้าของคุณไปใส่บนทรงที่เลือกให้ดูก่อน"
          : "เลือกทรงที่ชอบ"}
      </Typography>

      {CATEGORY_GROUPS.map(({ cat, label }) => {
        const templates = catalog.templates.filter((t) => t.category === cat);
        if (!templates.length) return null;
        return (
          <Box key={cat}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: "0.85rem", mb: 1.5 }}>
              {label}
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
              {templates.map((t) => (
                <ShapeCard key={t.id} template={t} catalog={catalog} fabricImage={orderState.fabricImage} onPick={() => handlePick(t)} />
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function ShapeCard({ template, catalog, fabricImage, onPick }: {
  template: TemplateDef; catalog: Catalog; fabricImage?: string; onPick: () => void;
}) {
  const layers = useMemo<RenderLayer[]>(() => {
    const base = resolveLayers(catalog, {
      category: template.category, parts: template.parts,
      partPattern: {}, partColor: {}, pattern: template.pattern, color: template.color,
    });
    if (!fabricImage) return base;
    // แทนที่ลายผ้าใน catalog ด้วยรูปผ้าจริงที่ผู้ใช้อัปโหลด (เฉพาะ layer โหมด mask — ปุ่ม/ของตกแต่งโหมด image ไม่แตะ)
    return base.map((l) => (l.mode === "mask" ? { ...l, patternImage: fabricImage } : l));
  }, [catalog, template, fabricImage]);

  return (
    <Box component={motion.button} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} onClick={onPick}
      sx={{
        border: "1px solid #EFE9DD",
        borderRadius: "16px",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
        cursor: "pointer",
        p: 0,
        textAlign: "left",
        boxShadow: "0 4px 16px rgba(27,42,74,0.06)",
        transition: "box-shadow 0.25s, border-color 0.25s",
        "&:hover": { borderColor: GOLD, boxShadow: "0 10px 28px rgba(197,165,90,0.16)" },
      }}
    >
      <Box sx={{ width: "100%", aspectRatio: "4/5", p: 1.5, bgcolor: "#FBF9F5", pointerEvents: "none" }}>
        <GarmentRenderer layers={layers} canvas={catalog.canvas} interactive={false} />
      </Box>
      <Box sx={{ px: 1.5, py: 1.2 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: "0.82rem" }} noWrap>
          {template.name}
        </Typography>
      </Box>
    </Box>
  );
}
