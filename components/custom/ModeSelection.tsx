"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface ModeSelectionProps {
  onSelectMode: (mode: "guided" | "prompt") => void;
}

const PIXEL_PATTERNS = [
  { id: 1, name: "ลายดอกบัว",    category: "ลายดอก",       src: "/patterns/lotus.png",     origin: "เชียงใหม่" },
  { id: 2, name: "ลายนาค",       category: "ลายสัตว์",     src: "/patterns/naga.png",      origin: "ลำพูน" },
  { id: 3, name: "ลายเพชร",      category: "ลายเรขาคณิต",  src: "/patterns/diamond.png",   origin: "น่าน" },
  { id: 4, name: "ลายหงส์",      category: "ลายสัตว์",     src: "/patterns/swan.png",      origin: "อุบลราชธานี" },
  { id: 5, name: "ลายขอ",        category: "ลายเรขาคณิต",  src: "/patterns/hook.png",      origin: "ขอนแก่น" },
  { id: 6, name: "ลายช้าง",      category: "ลายสัตว์",     src: "/patterns/elephant.png",  origin: "เชียงราย" },
  { id: 7, name: "ลายซิกแซก",    category: "ลายเรขาคณิต",  src: "/patterns/zigzag.png",    origin: "แพร่" },
  { id: 8, name: "ลายกินนร",     category: "ลายโบราณ",     src: "/patterns/kinnara.png",   origin: "สุโขทัย" },
  { id: 9, name: "ลายใบไม้",     category: "ลายพฤกษา",     src: "/patterns/leaf.png",      origin: "นครราชสีมา" },
  { id: 10, name: "ลายดาวล้อมเดือน", category: "ลายโบราณ", src: "/patterns/star_moon.png", origin: "สุโขทัย" },
];

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const [preview, setPreview] = useState<typeof PIXEL_PATTERNS[0] | null>(null);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%", pt: 2 }}
    >
      {/* ── Title ── */}
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.3rem", color: "#1B2A4A", mb: 0.5 }}>
          ออกแบบลายผ้าของคุณเอง
        </Typography>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.82rem", color: "#6B7280" }}>
          เลือกวิธีเริ่มต้นสร้างผลงานสุดพิเศษในแบบคุณ
        </Typography>
      </Box>

      {/* ── Pattern Gallery ── */}
      <Box>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.78rem", color: "#6B7280", mb: 1.2, fontWeight: 600 }}>
          🎨 ลายผ้าไทย Pixel Art ({PIXEL_PATTERNS.length} ลาย)
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1 }}>
          {PIXEL_PATTERNS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setPreview(p)}
              style={{ cursor: "pointer" }}
            >
              <Box sx={{
                borderRadius: 2,
                overflow: "hidden",
                border: "1.5px solid #E5DFD6",
                "&:hover": { borderColor: "#C5A55A", boxShadow: "0 4px 12px rgba(197,165,90,0.2)" },
                transition: "all 0.18s",
              }}>
                <Box sx={{ position: "relative", paddingTop: "100%", bgcolor: "#F5EFE8" }}>
                  <Box
                    component="img"
                    src={p.src}
                    alt={p.name}
                    sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <Box sx={{ p: "4px 5px", bgcolor: "#FAFAFA" }}>
                  <Typography sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontSize: "0.56rem",
                    color: "#1B2A4A",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {p.name}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* ── Mode buttons ── */}
      <Box
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectMode("guided")}
        sx={{
          width: "100%", bgcolor: "#FFFFFF", border: "2px solid #E5DFD6",
          borderRadius: 4, p: 3, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 2,
          transition: "all 0.3s ease",
          "&:hover": { borderColor: "#C5A55A", boxShadow: "0 10px 30px rgba(197,165,90,0.15)" },
        }}
      >
        <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "rgba(197,165,90,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <AutoAwesomeRoundedIcon sx={{ color: "#C5A55A", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A" }}>
            Guided Custom ✨
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", color: "#6B7280", mt: 0.5, lineHeight: 1.4 }}>
            สำหรับมือใหม่ ทำตามทีละขั้นตอน เลือกสไตล์ สี และเรื่องราว ง่ายดายและสนุก
          </Typography>
        </Box>
      </Box>

      <Box
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectMode("prompt")}
        sx={{
          width: "100%", bgcolor: "#FFFFFF", border: "2px solid #E5DFD6",
          borderRadius: 4, p: 3, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 2,
          transition: "all 0.3s ease",
          "&:hover": { borderColor: "#1B2A4A", boxShadow: "0 10px 30px rgba(27,42,74,0.1)" },
        }}
      >
        <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "rgba(27,42,74,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CreateRoundedIcon sx={{ color: "#1B2A4A", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A" }}>
            Prompt Custom ✍️
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", color: "#6B7280", mt: 0.5, lineHeight: 1.4 }}>
            สำหรับสาย Pro พิมพ์ความต้องการของคุณอย่างอิสระ แล้วให้ AI จัดการให้
          </Typography>
        </Box>
      </Box>

      {/* ── Pattern Preview Bottom Sheet ── */}
      <AnimatePresence>
        {preview && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreview(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, backdropFilter: "blur(3px)" }}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                maxWidth: 430, margin: "0 auto",
                background: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24,
                zIndex: 301, overflow: "hidden",
              }}
            >
              <Box component="img" src={preview.src} alt={preview.name}
                sx={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
              />
              <Box sx={{ p: 2.5, pb: 5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box>
                    <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A" }}>
                      {preview.name}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.78rem", color: "#6B7280" }}>
                      {preview.category} · แหล่งที่มา: {preview.origin}
                    </Typography>
                  </Box>
                  <Box onClick={() => setPreview(null)} sx={{ cursor: "pointer", color: "#9CA3AF" }}>
                    <CloseRoundedIcon />
                  </Box>
                </Box>
                <Box
                  component={motion.button}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setPreview(null); onSelectMode("guided"); }}
                  sx={{
                    width: "100%", p: 1.8, border: "none", borderRadius: 3,
                    background: "linear-gradient(135deg, #C5A55A, #D4BA7A)",
                    color: "#fff", fontFamily: '"Noto Serif Thai", serif',
                    fontWeight: 600, fontSize: "0.95rem", cursor: "pointer",
                  }}
                >
                  ✨ ใช้ลายนี้เริ่มต้น
                </Box>
              </Box>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Box>
  );
}
