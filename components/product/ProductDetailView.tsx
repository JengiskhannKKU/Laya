"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/mock-data";

const AVAILABLE_COLORS = [
  { id: "navy", name: "กรมท่า", hex: "#1C243B" },
  { id: "red", name: "แดง", hex: "#8A2A2A" },
  { id: "gold", name: "ทอง", hex: "#CFA055" },
  { id: "green", name: "เขียว", hex: "#234934" },
  { id: "brown", name: "น้ำตาล", hex: "#35231B" },
  { id: "cream", name: "ครีม", hex: "#F3EAD3" },
  { id: "purple", name: "ม่วง", hex: "#46295A" },
  { id: "orange", name: "ส้ม", hex: "#804A15" },
];

const PRESETS = [2, 5, 10, 20];
const FORMATS = ["ผ้าผืน (ม้วน)", "ผ้าพับ", "ตัดแบ่ง"];
const EDGE_FINISHES = ["ไม่เย็บริม", "เย็บริมทั้งสองข้าง"];

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [quantity, setQuantity] = useState(5);
  const [format, setFormat] = useState(FORMATS[0]);
  const [edgeFinish, setEdgeFinish] = useState(EDGE_FINISHES[0]);
  const [notes, setNotes] = useState("");

  const totalPrice = product.price * quantity;

  return (
    <Box
      sx={{
        maxWidth: 430,
        mx: "auto",
        minHeight: "100vh",
        bgcolor: "#FAF6F0",
        position: "relative",
        boxShadow: { xs: "none", sm: "0 0 40px rgba(0,0,0,0.08)" },
        pb: 12, // Space for bottom action bar
      }}
    >
      {/* Top Image Section */}
      <Box sx={{ position: "relative" }}>
        <Box sx={{ position: "relative", width: "100%", height: 380 }}>
          {/* Main Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: "absolute", inset: 0 }}
            >
              <Image
                src={product.images[currentImage] || "/placeholder.jpg"}
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 70%, rgba(0,0,0,0.5) 100%)",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Header Action Buttons */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              display: "flex",
              justifyContent: "space-between",
              zIndex: 10,
            }}
          >
            <Link href="/">
              <IconButton sx={{ bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
                <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF", mr: -0.5 }} />
              </IconButton>
            </Link>
            <IconButton sx={{ bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
              <FavoriteBorderRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
            </IconButton>
          </Box>

          {/* GI Pill Overlay */}
          {product.hasGI && (
            <Box
              sx={{
                position: "absolute",
                bottom: 24,
                right: 24,
                bgcolor: "#D8BC82",
                color: "#1B2A4A",
                px: 1.5,
                py: 0.3,
                borderRadius: "16px",
                fontSize: "0.7rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              GI รับรอง
            </Box>
          )}

          {/* Image Dots (Moved slightly down if necessary) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 26,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
              zIndex: 10,
            }}
          >
            {product.images.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentImage(index)}
                sx={{
                  width: index === currentImage ? 24 : 8,
                  height: 3,
                  borderRadius: 4,
                  bgcolor: index === currentImage ? "#D8BC82" : "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Thumbnail Row */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            px: 2.5,
            pt: 2,
            pb: 2,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" }
          }}
        >
          {product.images.map((img, i) => (
            <Box
              key={i}
              onClick={() => setCurrentImage(i)}
              sx={{
                width: 55,
                height: 55,
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                border: i === currentImage ? "2px solid #CFA055" : "2px solid transparent",
                cursor: "pointer",
                opacity: i === currentImage ? 1 : 0.6,
                transition: "all 0.2s"
              }}
            >
              <Image src={img} alt="" fill style={{ objectFit: "cover" }} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 2.5, pt: 3 }}>
        
        {/* Title Block */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.3rem", color: "#1B2A4A" }}>
              {product.name}
            </Typography>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#8E601C", mt: 0.5, display: "flex", alignItems: "center" }}>
              • ชุมชนหริภุญชัย - ลำพูน
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <Rating value={product.rating} precision={0.1} readOnly size="small" sx={{ "& .MuiRating-iconFilled": { color: "#C5A55A" } }} />
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.75rem", color: "#6B7280" }}>
                ({product.rating}) {product.reviewCount} รีวิว
              </Typography>
            </Box>
          </Box>
          {product.hasGI && (
            <Box sx={{ border: "1px solid #D8BC82", color: "#8E601C", borderRadius: "16px", px: 1.5, py: 0.3, fontSize: "0.7rem", fontWeight: 700 }}>
              GI รับรอง
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.06)" }} />

        {/* Price & Tags */}
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, mb: 2 }}>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.6rem", color: "#1B2A4A", lineHeight: 1 }}>
            {product.price.toLocaleString()}
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#6B7280", mb: 0.3 }}>
            บาท / เมตร
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 2 }}>
          {[
            { label: "ผลิต 12-15 วัน" },
            { label: "พร้อมส่ง 20 เมตร" },
            { label: "ผ้าไหม 100%" },
            { label: "ขั้นต่ำ 2 เมตร" }
          ].map((tag, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#FDF8F0", border: "1px solid #EBE3D5", borderRadius: "20px", px: 1.5, py: 0.8 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#CFA055" }} />
              <Typography sx={{ fontSize: "0.8rem", color: "#5A4930", fontWeight: 500 }}>
                {tag.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.06)" }} />

        {/* Color Palette */}
        <Typography sx={{ fontSize: "0.85rem", color: "#6B7280", mb: 1.5 }}>
          สีด้าย (Curated palette)
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 1 }}>
          {AVAILABLE_COLORS.map((color) => (
            <Box
              key={color.id}
              onClick={() => setSelectedColor(color)}
              sx={{
                width: 32, height: 32, borderRadius: "50%", bgcolor: color.hex, cursor: "pointer",
                border: selectedColor.id === color.id ? "2px solid #CFA055" : "1px solid rgba(0,0,0,0.1)",
                boxShadow: selectedColor.id === color.id ? "0 0 0 3px rgba(207, 160, 85, 0.2)" : "none",
                transform: selectedColor.id === color.id ? "scale(1.1)" : "scale(1)",
                transition: "all 0.2s"
              }}
            />
          ))}
        </Box>
        <Typography sx={{ fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600 }}>
          เลือกแล้ว: {selectedColor.name}
        </Typography>

        <Box sx={{ mt: 3, mb: 1.5 }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#6B7280", mb: 1.5 }}>จำนวนเมตร</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {PRESETS.map((val) => (
              <Button
                key={val}
                variant="outlined"
                onClick={() => setQuantity(val)}
                sx={{
                  borderRadius: "20px",
                  borderColor: quantity === val ? "#1B2A4A" : "#E5DFD6",
                  color: quantity === val ? "#FFFFFF" : "#1B2A4A",
                  bgcolor: quantity === val ? "#1B2A4A" : "transparent",
                  "&:hover": { bgcolor: quantity === val ? "#1B2A4A" : "rgba(0,0,0,0.04)" }
                }}
              >
                {val} ม.
              </Button>
            ))}
            <Button variant="outlined" sx={{ borderRadius: "20px", borderColor: "#E5DFD6", color: "#C5A55A" }}>
              กำหนดเอง
            </Button>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #E5DFD6", borderRadius: "30px", bgcolor: "#FFFFFF" }}>
              <IconButton onClick={() => setQuantity(Math.max(2, quantity - 1))} size="small" sx={{ p: 1 }}>
                <RemoveRoundedIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ px: 2, fontWeight: 600, color: "#1B2A4A" }}>{quantity} ม.</Typography>
              <IconButton onClick={() => setQuantity(Math.min(20, quantity + 1))} size="small" sx={{ p: 1 }}>
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>สูงสุด 20 ม.</Typography>
          </Box>
        </Box>

        {/* Fabric Format */}
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#6B7280", mb: 1.5 }}>รูปแบบผ้า</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {FORMATS.map((f) => (
              <Button
                key={f}
                variant="outlined"
                onClick={() => setFormat(f)}
                sx={{
                  borderRadius: "20px",
                  borderColor: format === f ? "#CFA055" : "#E5DFD6",
                  color: format === f ? "#CFA055" : "#1B2A4A",
                  bgcolor: format === f ? "#FDF8F0" : "transparent",
                  "&:hover": { bgcolor: "#FDF8F0", borderColor: "#CFA055" }
                }}
              >
                {f}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Edge Finish */}
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#6B7280", mb: 1.5 }}>การตกแต่งริมผ้า</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {EDGE_FINISHES.map((e) => (
              <Button
                key={e}
                variant="outlined"
                onClick={() => setEdgeFinish(e)}
                sx={{
                  borderRadius: "20px",
                  borderColor: edgeFinish === e ? "#CFA055" : "#E5DFD6",
                  color: edgeFinish === e ? "#CFA055" : "#1B2A4A",
                  bgcolor: edgeFinish === e ? "#FDF8F0" : "transparent",
                  "&:hover": { bgcolor: "#FDF8F0", borderColor: "#CFA055" }
                }}
              >
                {e}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Notes */}
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#6B7280", mb: 1 }}>โน๊ตถึงช่าง (ไม่บังคับ)</Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เช่น ต้องการลายหนาแน่น / ใช้ทำชุดงานแต่งงาน..."
            sx={{
              bgcolor: "#FFFFFF",
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "& fieldset": { borderColor: "#E5DFD6" },
                "&:hover fieldset": { borderColor: "#CBA258" },
                "&.Mui-focused fieldset": { borderColor: "#CBA258" },
              }
            }}
          />
        </Box>

        {/* Summary Box */}
        <Box sx={{ mt: 4, bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, border: "1px solid #E5DFD6", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: y => 1.5, rowGap: 1.5 }}>
            <Box><Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>สี</Typography></Box>
            <Box><Typography sx={{ fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600, textAlign: "right" }}>{selectedColor.name}</Typography></Box>
            
            <Box><Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>รูปแบบ</Typography></Box>
            <Box><Typography sx={{ fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600, textAlign: "right" }}>{format}</Typography></Box>

            <Box><Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>ริมผ้า</Typography></Box>
            <Box><Typography sx={{ fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600, textAlign: "right" }}>{edgeFinish}</Typography></Box>

            <Box><Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>จำนวน</Typography></Box>
            <Box><Typography sx={{ fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600, textAlign: "right" }}>{quantity} เมตร</Typography></Box>
          </Box>
          <Divider sx={{ my: 1.5, borderColor: "rgba(0,0,0,0.06)" }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontWeight: 700, color: "#1B2A4A" }}>ราคารวม</Typography>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#D3A14A" }}>
                {totalPrice.toLocaleString()} 
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#D3A14A" }}>บาท</Typography>
            </Box>
          </Box>
        </Box>

        {/* Weaver Box */}
        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6" }}>
          <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "#4B7355", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: 700 }}>
            ส
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1B2A4A" }}>แม่สมจิตร ใจดี</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>ช่างทอ GI • ลำพูน • ทอมากว่า 30 ปี</Typography>
          </Box>
          <ChevronRightRoundedIcon sx={{ color: "#CBA258" }} />
        </Box>

        {/* Story Section */}
        <Box sx={{ mt: 4 }}>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A", mb: 1 }}>
            เรื่องราวของผืนผ้า
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.7 }}>
            {product.story}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#CBA258", mt: 1, fontWeight: 600, cursor: "pointer" }}>
            อ่านเพิ่มเติม ›
          </Typography>
        </Box>

        {/* Recommended Add-ons (Image 4 Reference) */}
        <Box sx={{ mt: 5, mb: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1B2A4A", mb: 2 }}>
            ตรงกับ:
          </Typography>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { id: "bag1", name: "พวงกุญแจผ้าทอ LAYA", img: "/bag1.png", price: 1250, variant: "Blue Signature" },
              { id: "bag2", name: "กระเป๋าถือลายวิจิตร", img: "/bag2.png", price: 4500, variant: "Navy Blue", soldOut: true }
            ].map((item, idx) => (
              <Box key={idx} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5DFD6", borderRadius: "12px", p: 1.5, display: "flex", alignItems: "center", gap: 1.5, opacity: item.soldOut ? 0.6 : 1 }}>
                <Checkbox 
                  size="small" 
                  disabled={item.soldOut}
                  sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#CBA258" } }} 
                />
                <Box sx={{ width: 64, height: 64, borderRadius: "8px", overflow: "hidden", position: "relative", border: "1px solid #F0F0F0" }}>
                  <Image src={item.img} alt={item.name} fill style={{ objectFit: "cover" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>{item.name}</Typography>
                  <FormControl size="small" sx={{ mt: 0.5, minWidth: 100 }}>
                    <Select
                      value={item.variant}
                      disabled={item.soldOut}
                      sx={{ 
                        borderRadius: "8px", 
                        fontSize: "0.75rem", 
                        height: 32,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5DFD6" } 
                      }}
                    >
                      <MenuItem value={item.variant} sx={{ fontSize: "0.75rem" }}>{item.variant}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: item.soldOut ? "#9CA3AF" : "#1B2A4A" }}>
                    {item.soldOut ? "ขายหมดแล้ว" : `${item.price.toLocaleString()} ฿ THB`}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Trust Checklist Tags */}
        <Box sx={{ mt: 4, mb: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {[
            "ฟรีค่าจัดส่ง เมื่อยอดสั่งซื้อครบ 3000 บาท* ขึ้นไป",
            "รับประกันสินค้า 1 ปี",
            "ส่งคืนสินค้าได้ภายใน 30 วัน"
          ].map((text, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 20, color: "#1B2A4A" }} />
              <Typography sx={{ fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 500 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>

      </Box>

      {/* Sticky Bottom Action Bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 430,
          mx: "auto",
          zIndex: 100,
          bgcolor: "#FAF6F0",
          pb: 3,
          pt: 1.5,
          px: 2,
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            startIcon={<SearchRoundedIcon />}
            sx={{
              flex: 1,
              bgcolor: "#1B2A4A",
              color: "#FFFFFF",
              borderRadius: "24px",
              py: 1.5,
              fontWeight: 600,
              fontSize: "0.9rem",
              "&:hover": { bgcolor: "#0F1A30" }
            }}
          >
            ดูภาพจำลอง
          </Button>
          <Button
            sx={{
              flex: 1,
              bgcolor: "#D3A14A",
              color: "#FFFFFF",
              borderRadius: "24px",
              py: 1.5,
              fontWeight: 600,
              fontSize: "0.9rem",
              "&:hover": { bgcolor: "#C19036" }
            }}
          >
            สั่งทำเลย ›
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
