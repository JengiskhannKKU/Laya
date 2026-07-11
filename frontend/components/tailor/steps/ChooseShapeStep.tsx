"use client";

/**
 * ChooseShapeStep — ขั้น "เลือกทรงที่ชอบ" ของ Flow 1 (สั่งตัดด้วยผ้าที่มีอยู่แล้ว)
 *
 * เดิมเป็นแค่เลือกเทมเพลตสำเร็จรูป — ผู้ใช้ขอให้เป็น "full select" แบบเดียวกับ /design-clothes จริงๆ
 * คือปรับได้ทีละชิ้นส่วน (คอ/แขน/กระเป๋า/กระดุม ฯลฯ) ไม่ใช่แค่เลือกแพ็กสำเร็จรูป
 *
 * ใช้ state ในคอมโพเนนต์เอง (ไม่ใช้ useGarmentStore ตัวเดียวกับ /design-clothes) เพราะ store นั้นเป็น
 * global — ถ้าใช้ร่วมกันจะทำให้แบบที่ปรับใน flow นี้ไปปนกับแบบที่ปรับใน /design-clothes จริง (คนละบริบทกัน)
 * ยังใช้ catalog.json/resolveLayers/GarmentRenderer จริงชุดเดียวกันทั้งหมด ไม่ mock
 *
 * พรีวิวทุกชิ้นส่วนใช้รูปผ้าจริงที่ผู้ใช้อัปโหลดไว้ (แทนลายผ้าใน catalog เสมอ) เพราะ flow นี้คือ "มีผ้าอยู่แล้ว"
 */

import { useEffect, useMemo, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";

import type { Catalog, Category, PartDef, RenderLayer, TemplateDef } from "@/components/design-clothes/builder/types";
import { resolveLayers } from "@/components/design-clothes/builder/types";
import GarmentRenderer, { PartPreview } from "@/components/design-clothes/builder/GarmentRenderer";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";

const CATEGORY_GROUPS: { cat: Category; label: string }[] = [
  { cat: "top", label: "เสื้อ & เดรส" },
  { cat: "pants", label: "กางเกง" },
  { cat: "skirt", label: "กระโปรง" },
];

type SubStep = "template" | "customize";

export default function ChooseShapeStep({ orderState, setOrderState, onNext }: any) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [sub, setSub] = useState<SubStep>("template");

  const [category, setCategory] = useState<Category>("top");
  const [parts, setParts] = useState<Record<string, string>>({});
  const [pattern, setPattern] = useState<string>("plain");
  const [color, setColor] = useState<string>("#C9A227");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>("");
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const fabricImage: string | undefined = orderState.fabricImage;

  useEffect(() => {
    fetch("/assets/garments/catalog.json")
      .then((res) => res.json())
      .then((data: Catalog) => setCatalog(data))
      .catch((err) => console.error("โหลด catalog ไม่สำเร็จ:", err));
  }, []);

  const categoryDef = catalog?.categories[category];

  const layers = useMemo<RenderLayer[]>(() => {
    if (!catalog) return [];
    const base = resolveLayers(catalog, { category, parts, partPattern: {}, partColor: {}, pattern, color });
    if (!fabricImage) return base;
    return base.map((l) => (l.mode === "mask" ? { ...l, patternImage: fabricImage } : l));
  }, [catalog, category, parts, pattern, color, fabricImage]);

  const pickTemplate = (t: TemplateDef) => {
    setCategory(t.category);
    setParts(t.parts);
    setPattern(t.pattern);
    setColor(t.color);
    setTemplateId(t.id);
    setTemplateName(t.name);
    setSelectedPart(null);
    setSub("customize");
  };

  const handleConfirm = () => {
    setOrderState({
      ...orderState,
      shape: { id: templateId ?? "custom", name: templateName || "แบบที่ปรับเอง", category, parts, pattern, color },
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

  // ── ขั้นย่อย 1: เลือกทรงเริ่มต้น ──
  if (sub === "template") {
    return (
      <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
        sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        <Typography sx={{ fontFamily: FONT, textAlign: "center", color: "#6B7280", fontSize: "0.88rem" }}>
          {fabricImage
            ? "เลือกทรงเริ่มต้น แล้วปรับแต่งทีละส่วนได้ต่อ — ระบบจะนำผ้าของคุณไปใส่บนทรงที่เลือกให้ดูก่อน"
            : "เลือกทรงเริ่มต้น แล้วปรับแต่งทีละส่วนได้ต่อ"}
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
                  <TemplateCard key={t.id} template={t} catalog={catalog} fabricImage={fabricImage} onPick={() => pickTemplate(t)} />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  // ── ขั้นย่อย 2: ปรับแต่งทีละชิ้นส่วน (full select แบบเดียวกับ /design-clothes) ──
  const part = categoryDef?.parts.find((p) => p.key === selectedPart) ?? null;

  return (
    <Box component={motion.div} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
      sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

      {/* พรีวิวสด */}
      <Box sx={{
        width: "100%", height: 280, borderRadius: "18px", bgcolor: "#FBF9F5", border: "1px solid #EFE9DD",
        boxShadow: "0 4px 20px rgba(27,42,74,0.06)", p: 2, position: "relative",
      }}>
        <GarmentRenderer
          layers={layers}
          canvas={catalog.canvas}
          selectedPart={selectedPart}
          onSelectPart={(k) => setSelectedPart(k)}
        />
        <Box sx={{ position: "absolute", top: 10, left: 10, bgcolor: "rgba(27,42,74,0.85)", color: "white", px: 1.5, py: 0.4, borderRadius: "999px" }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600 }}>{templateName}</Typography>
        </Box>
      </Box>

      <Box
        onClick={() => setSub("template")}
        sx={{ alignSelf: "center", cursor: "pointer", color: "#6B7280", fontFamily: FONT, fontSize: "0.78rem", textDecoration: "underline" }}
      >
        เปลี่ยนทรงเริ่มต้น
      </Box>

      {/* ยังไม่เลือกชิ้นส่วน: โชว์กริดทุกชิ้นส่วน */}
      {!part && categoryDef && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
          {categoryDef.parts.map((p) => {
            const currentId = parts[p.key];
            const opt = (catalog.options[p.options] ?? []).find((o) => o.id === currentId);
            return (
              <Box
                key={p.key}
                component={motion.button}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedPart(p.key)}
                sx={{
                  border: "1px solid #EFE9DD", borderRadius: "16px", bgcolor: "#FFFFFF", p: 1.5,
                  display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", textAlign: "left",
                  boxShadow: "0 4px 16px rgba(27,42,74,0.06)",
                  "&:hover": { borderColor: GOLD },
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: "10px", bgcolor: "#FBF9F5", flexShrink: 0, p: 0.5 }}>
                  {opt ? (
                    <PartPreview asset={opt.asset} mode={p.render === "image" ? "image" : "mask"} patternImage={fabricImage ?? null} color={color} />
                  ) : (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BlockRoundedIcon sx={{ fontSize: 18, color: "#C9C2B4" }} />
                    </Box>
                  )}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: NAVY, fontSize: "0.82rem" }} noWrap>{p.name}</Typography>
                  <Typography sx={{ fontFamily: FONT, color: "#9CA3AF", fontSize: "0.7rem" }} noWrap>{opt?.name ?? "ไม่ใส่"}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* เลือกชิ้นส่วนแล้ว: โชว์ตัวเลือกของชิ้นนั้น */}
      {part && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box onClick={() => setSelectedPart(null)} sx={{ cursor: "pointer", display: "flex", color: NAVY }}>
              <ChevronLeftRoundedIcon />
            </Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, fontSize: "0.92rem" }}>{part.name}</Typography>
          </Box>
          <PartOptionsGrid part={part} catalog={catalog} currentId={parts[part.key]} fabricImage={fabricImage} color={color}
            onSelect={(optId) => setParts((prev) => ({ ...prev, [part.key]: optId }))} />
        </Box>
      )}

      <Box
        component={motion.button}
        whileTap={{ scale: 0.98 }}
        onClick={handleConfirm}
        sx={{
          mt: 1, bgcolor: NAVY, color: "white", py: 1.7, borderRadius: "14px", border: "none", cursor: "pointer",
          fontFamily: FONT, fontWeight: 600, fontSize: "0.95rem", boxShadow: "0 4px 14px rgba(27,42,74,0.25)",
        }}
      >
        ยืนยันแบบนี้
      </Box>
    </Box>
  );
}

function PartOptionsGrid({ part, catalog, currentId, fabricImage, color, onSelect }: {
  part: PartDef; catalog: Catalog; currentId?: string; fabricImage?: string; color: string; onSelect: (optId: string) => void;
}) {
  const options = catalog.options[part.options] ?? [];
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25 }}>
      {part.allowNone && (
        <OptionCard active={!currentId || currentId === "none"} onClick={() => onSelect("none")}>
          <Box sx={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BlockRoundedIcon sx={{ fontSize: 22, color: "#9CA3AF" }} />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "#6B7280", textAlign: "center" }}>ไม่ใส่</Typography>
        </OptionCard>
      )}
      {options.map((opt) => (
        <OptionCard key={opt.id} active={currentId === opt.id} onClick={() => onSelect(opt.id)}>
          <Box sx={{ width: "100%", aspectRatio: "1/1" }}>
            <PartPreview asset={opt.asset} mode={part.render === "image" ? "image" : "mask"} patternImage={fabricImage ?? null} color={color} />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", color: NAVY, fontWeight: 600, textAlign: "center" }} noWrap>{opt.name}</Typography>
        </OptionCard>
      ))}
    </Box>
  );
}

function OptionCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Box
      component={motion.button}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      sx={{
        position: "relative", border: active ? `1.5px solid ${GOLD}` : "1px solid #EFE9DD", borderRadius: "14px",
        bgcolor: "#FFFFFF", p: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, cursor: "pointer",
        boxShadow: active ? "0 6px 18px rgba(197,165,90,0.2)" : "0 2px 10px rgba(27,42,74,0.05)",
      }}
    >
      {active && (
        <Box sx={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", bgcolor: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckRoundedIcon sx={{ fontSize: 12, color: "white" }} />
        </Box>
      )}
      {children}
    </Box>
  );
}

function TemplateCard({ template, catalog, fabricImage, onPick }: {
  template: TemplateDef; catalog: Catalog; fabricImage?: string; onPick: () => void;
}) {
  const layers = useMemo<RenderLayer[]>(() => {
    const base = resolveLayers(catalog, {
      category: template.category, parts: template.parts,
      partPattern: {}, partColor: {}, pattern: template.pattern, color: template.color,
    });
    if (!fabricImage) return base;
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
