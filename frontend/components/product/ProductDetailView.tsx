"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
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
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { products, type Product } from "@/lib/mock-data";
import TraceabilityView from "./TraceabilityView";
import DigitalCertificateView from "./DigitalCertificateView";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useCartStore } from "@/lib/cart-store";
import { useAppModal } from "@/components/providers/AppModalProvider";
import { useRouter } from "next/navigation";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";

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

export default function ProductDetailView({ product }: { product: Product }) {
  const { user, openAuthModal } = useAuth();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { showConfirm, showToast } = useAppModal();
  const [currentImage, setCurrentImage] = useState(0);
  const [activeView, setActiveView] = useState<"detail" | "traceability" | "certificate">("detail");
  const [isPressing, setIsPressing] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [quantity, setQuantity] = useState(5);
  const [format, setFormat] = useState(FORMATS[0]);
  const [edgeFinish, setEdgeFinish] = useState(EDGE_FINISHES[0]);
  const [notes, setNotes] = useState("");

  const isReadyMade = product.isCustomizable === false;

  const addSnapshotToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        image: product.images[0] ?? null,
        price: product.price,
        priceUnit: product.priceUnit,
        shopName: product.community,
        stock: product.availableLength,
      },
      quantity
    );
  };

  /** งานสั่งทำ → ชวนไปห้องออกแบบแทน (ไม่มี add to cart) */
  const goToCustomFlow = async () => {
    const ok = await showConfirm({
      title: "สินค้านี้เป็นงานสั่งทำ",
      message: "ออกแบบทรง เลือกผ้า และปรับดีเทลได้เองในห้องออกแบบ LAYA ก่อนสั่งตัดจริง",
      confirmLabel: "ไปห้องออกแบบ",
      cancelLabel: "ไว้ทีหลัง",
    });
    if (ok) router.push("/design-clothes");
  };

  /** เพิ่มลงตะกร้า (ไม่ต้องล็อกอิน — ตะกร้าเก็บในเครื่อง) */
  const handleAddToCart = () => {
    if (!isReadyMade) { goToCustomFlow(); return; }
    addSnapshotToCart();
    showToast("เพิ่มลงตะกร้าแล้ว", "cart");
  };

  /** สั่งซื้อเลย → เพิ่มลงตะกร้าแล้วไปหน้าตะกร้า (ต้องล็อกอิน) */
  const handleBuyNow = () => {
    if (!isReadyMade) { goToCustomFlow(); return; }
    if (!user) { openAuthModal(); return; }
    addSnapshotToCart();
    router.push("/cart");
  };

  const handlePressStart = () => {
    setIsPressing(true);
    const timer = setTimeout(() => {
      setActiveView("traceability");
      setIsPressing(false);
    }, 800); // 800ms long press
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setIsPressing(false);
  };

  if (activeView === "traceability") {
    return (
      <TraceabilityView
        product={product}
        onBack={() => setActiveView("detail")}
        onViewCertificate={() => setActiveView("certificate")}
      />
    );
  }

  if (activeView === "certificate") {
    return (
      <DigitalCertificateView
        product={product}
        onBack={() => setActiveView("traceability")}
      />
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <Box
      sx={{
        py: { xs: 0, md: 4 },
        display: { xs: "block", md: "grid" },
        gridTemplateColumns: { md: "1fr 1fr", lg: "1.1fr 0.9fr" },
        gap: { md: 5, lg: 7 },
        alignItems: "start",
        pb: { xs: 12, md: 8 },
      }}
    >
      {/* Left col: Images (sticky on desktop) */}
      <Box sx={{ position: { md: "sticky" }, top: { md: 90 } }}>
        {/* Top Image Section */}
        <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            height: { xs: 420, md: 560 },
            width: "100%",
            position: "relative",
            overflow: "hidden",
            borderRadius: { xs: 0, md: "20px" },
            touchAction: "none",
          }}
          onPointerDown={handlePressStart}
          onPointerUp={handlePressEnd}
          onPointerLeave={handlePressEnd}
        >
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
                src={product.images[currentImage] || "/placeholder.webp"}
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
            <IconButton
              onClick={() => { if (!user) { openAuthModal(); return; } toggleWishlist(product.id); }}
              sx={{ bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}
            >
              {isWishlisted(product.id) ? (
                <FavoriteRoundedIcon sx={{ fontSize: 20, color: "#C5A55A" }} />
              ) : (
                <FavoriteBorderRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
              )}
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
      </Box>{/* end left col sticky */}

      {/* Right col: Details */}
      <Box sx={{ px: { xs: 2.5, md: 0 }, pt: { xs: 1, md: 0 }, pb: { xs: 3, md: 0 } }}>
        
        {/* Prominent Story Button at the Top */}
        <Button
          onClick={() => setActiveView("traceability")}
          fullWidth
          variant="contained"
          startIcon={<QrCodeScannerRoundedIcon />}
          sx={{
            py: 1.5,
            mb: 3,
            borderRadius: "16px",
            bgcolor: "#1B2A4A",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "none",
            boxShadow: "0 4px 15px rgba(27,42,74,0.15)",
            border: "1px solid rgba(216, 188, 130, 0.3)",
            "&:hover": { bgcolor: "#0F1A30" }
          }}
        >
          เรื่องราวของ{product.typeLabel || "ผ้า"}{product.typeLabel === "กระเป๋า" ? "ใบ" : "ผืน"}นี้
        </Button>

        {/* Title Block */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.3rem", color: "#1B2A4A" }}>
              {product.name}
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#8E601C", mt: 0.5, display: "flex", alignItems: "center" }}>
              • ชุมชนหริภุญชัย - ลำพูน
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <Rating value={product.rating} precision={0.1} readOnly size="small" sx={{ "& .MuiRating-iconFilled": { color: "#C5A55A" } }} />
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>
                ({product.rating}) {product.reviewCount} รีวิว
              </Typography>
              {product.soldCount !== undefined && (
                <>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mx: 0.5 }}>|</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>
                    ขายแล้ว {(product.soldCount >= 1000 ? (product.soldCount / 1000).toFixed(1) + "k" : product.soldCount)} ชิ้น
                  </Typography>
                </>
              )}
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
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.6rem", color: "#1B2A4A", lineHeight: 1 }}>
            {product.price.toLocaleString()}
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 0.3 }}>
            {product.priceUnit}
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mt: 2 }}>
          {(product.tags || [
            "ผลิต 12-15 วัน",
            "พร้อมส่ง 20 เมตร",
            "ผ้าไหม 100%",
            "ขั้นต่ำ 2 เมตร"
          ]).map((tag, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#FDF8F0", border: "1px solid #EBE3D5", borderRadius: "20px", px: 1.5, py: 0.8 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#CFA055" }} />
              <Typography sx={{ fontSize: "0.8rem", color: "#5A4930", fontWeight: 500 }}>
                {tag}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.06)" }} />

        {product.isCustomizable !== false && (
          <>
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
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, rowGap: 1.5 }}>
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
          </>
        )}

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
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A", mb: 1 }}>
            เรื่องราวของ{product.typeLabel || "ผ้า"}{product.typeLabel === "กระเป๋า" ? "ใบ" : "ผืน"}นี้
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.7 }}>
            {product.story}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#CBA258", mt: 1, fontWeight: 600, cursor: "pointer" }}>
            อ่านเพิ่มเติม ›
          </Typography>
        </Box>

        {/* Recommended Add-ons */}
        <Box sx={{ mt: 5, mb: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1B2A4A", mb: 2 }}>
            ตรงกับ:
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(product.relatedProductIds && product.relatedProductIds.length > 0 
              ? product.relatedProductIds.map(id => products.find(p => p.id === id)).filter(Boolean)
              : [products.find(p => p.id === "bag2")]
            ).map((item, idx) => (
              item && (
                <Box key={idx} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5DFD6", borderRadius: "12px", p: 1.5, display: "flex", alignItems: "center", gap: 1.5, opacity: (item as any).soldOut ? 0.6 : 1 }}>
                  <Checkbox
                    size="small"
                    disabled={(item as any).soldOut}
                    sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#CBA258" } }}
                  />
                  <Box sx={{ width: 64, height: 64, borderRadius: "8px", overflow: "hidden", position: "relative", border: "1px solid #F0F0F0" }}>
                    <Image src={item.images[0]} alt={item.name} fill style={{ objectFit: "cover" }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{item.fabricType}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: (item as any).soldOut ? "#9CA3AF" : "#1B2A4A" }}>
                      {(item as any).soldOut ? "ขายหมดแล้ว" : `${item.price.toLocaleString()} ฿ THB`}
                    </Typography>
                  </Box>
                </Box>
              )
            ))}
          </Box>
        </Box>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <Box sx={{ mt: 5, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A" }}>
                รีวิวจากผู้สั่งซื้อ ({product.reviewCount})
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#CBA258", fontWeight: 600, cursor: "pointer" }}>
                ดูทั้งหมด ›
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {product.reviews.map((review) => (
                <Box key={review.id} sx={{ bgcolor: "#FDF8F0", p: 2, borderRadius: "12px", border: "1px solid #EBE3D5" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar src={review.avatar} alt={review.userName} sx={{ width: 32, height: 32 }} />
                      <Box>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1B2A4A" }}>{review.userName}</Typography>
                        <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF" }}>{review.date}</Typography>
                      </Box>
                    </Box>
                    <Rating value={review.rating} precision={0.5} readOnly size="small" sx={{ "& .MuiRating-iconFilled": { color: "#C5A55A" } }} />
                  </Box>
                  <Typography sx={{ fontSize: "0.8rem", color: "#4A4A4A", mt: 1, lineHeight: 1.6 }}>
                    {review.comment}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 4, mb: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Moved to the top for prominence */}
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

        {/* Desktop: inline order buttons at bottom of right col */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.5, mt: 4 }}>
          {isReadyMade && (
            <Button
              onClick={handleAddToCart}
              startIcon={<AddShoppingCartRoundedIcon sx={{ fontSize: 20 }} />}
              sx={{
                flex: 1,
                border: "1.5px solid #1B2A4A",
                color: "#1B2A4A",
                borderRadius: "16px",
                py: 1.7,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(27,42,74,0.05)" },
              }}
            >
              เพิ่มลงตะกร้า
            </Button>
          )}
          <Button
            onClick={handleBuyNow}
            sx={{
              flex: 1,
              bgcolor: "#D3A14A",
              color: "#FFFFFF",
              borderRadius: "16px",
              py: 1.8,
              fontWeight: 600,
              fontSize: "1.05rem",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#C19036", boxShadow: "none" },
            }}
          >
            {isReadyMade ? "สั่งซื้อเลย" : "สั่งทำเลย"}
          </Button>
        </Box>

      </Box>{/* end right col */}

      {/* Mobile: fixed bottom action bar */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          bgcolor: "#FAF6F0",
          pb: "env(safe-area-inset-bottom, 16px)",
          pt: 1.5,
          px: 2.5,
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {isReadyMade && (
            <Button
              onClick={handleAddToCart}
              aria-label="เพิ่มลงตะกร้า"
              sx={{
                minWidth: 54,
                border: "1.5px solid #1B2A4A",
                color: "#1B2A4A",
                borderRadius: "24px",
                py: 1.5,
                "&:hover": { bgcolor: "rgba(27,42,74,0.05)" },
              }}
            >
              <AddShoppingCartRoundedIcon sx={{ fontSize: 22 }} />
            </Button>
          )}
          <Button
            onClick={handleBuyNow}
            fullWidth
            sx={{
              bgcolor: "#D3A14A",
              color: "#FFFFFF",
              borderRadius: "24px",
              py: 1.6,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#C19036", boxShadow: "none" },
            }}
          >
            {isReadyMade ? "สั่งซื้อเลย" : "สั่งทำเลย"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
