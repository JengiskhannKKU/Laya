"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Dialog from "@mui/material/Dialog";
import Drawer from "@mui/material/Drawer";
import { useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { fetchLiveProducts, variantLabel, productDisplayName, type Product, type ProductVariant } from "@/lib/live-products";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useWishlist } from "@/lib/wishlist-context";
import { useCartStore } from "@/lib/cart-store";
import { useAppModal } from "@/components/providers/AppModalProvider";
import ProductCard from "@/components/home/ProductCard";
import SectionHeader from "@/components/home/SectionHeader";
import { useRouter } from "next/navigation";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
  const { locale } = useLanguage();
  const displayName = productDisplayName(product, locale);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { showConfirm, showToast } = useAppModal();
  const [currentImage, setCurrentImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  // สินค้าพร้อมขายเริ่มที่ 1 ชิ้น — งานสั่งทอ/ตัดเริ่มที่ 5 เมตรตามเดิม
  const [quantity, setQuantity] = useState(product.isCustomizable === false ? 1 : 5);
  const [format, setFormat] = useState(FORMATS[0]);
  const [edgeFinish, setEdgeFinish] = useState(EDGE_FINISHES[0]);
  const [notes, setNotes] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const isReadyMade = product.isCustomizable === false;

  // ── Multi-SKU: สินค้าที่มีหลายตัวเลือกต้องเลือก SKU ก่อนซื้อ ──
  const variants = product.variants ?? [];
  const requiresVariant = Boolean(product.hasVariants && variants.length > 0);
  // เริ่มที่ null เสมอ (ไม่ auto-เลือกตัวแรกให้) — ลูกค้าต้องกดเลือกสี/ไซซ์เองก่อนถึงจะสั่งซื้อได้
  // (เดิม auto-เลือกตัวที่มีสต็อกตัวแรกให้ ทำให้เช็ค requiresVariant && !selectedVariant ไม่เคยเป็นจริง
  //  ลูกค้าสั่งซื้อผ่านได้โดยไม่เคยเลือกตัวเลือกสินค้าเองเลย)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantError, setVariantError] = useState(false);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [sheetIntent, setSheetIntent] = useState<"cart" | "buy">("cart");

  // มือถือ → เปิด bottom sheet ให้เลือกตัวเลือก/จำนวนก่อนยืนยัน, เดสก์ท็อป → เลือกอินไลน์บนหน้าเลย ไม่ต้องมี overlay
  const theme = useTheme();
  const isMobileMQ = useMediaQuery(theme.breakpoints.down("md"));
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isMobile = !mounted || isMobileMQ;

  /** ราคา/สต็อกที่ใช้จริง — จาก SKU ที่เลือก (ถ้ามี) ไม่งั้นจากสินค้าหลัก */
  const effectivePrice = requiresVariant ? (selectedVariant?.price ?? product.price) : product.price;
  const effectiveStock = requiresVariant ? (selectedVariant?.stock ?? 0) : product.availableLength;

  useEffect(() => {
    if (!product.category) return;
    let cancelled = false;
    fetchLiveProducts({ category: product.category })
      .then((list) => { if (!cancelled) setRelatedProducts(list.filter((p) => p.id !== product.id).slice(0, 3)); })
      .catch(() => { if (!cancelled) setRelatedProducts([]); });
    return () => { cancelled = true; };
  }, [product.category, product.id]);

  /** เพิ่มลงตะกร้า — คืน false ถ้ายังไม่ได้เลือกตัวเลือกสินค้า (multi-SKU) */
  const addSnapshotToCart = (): boolean => {
    if (requiresVariant && !selectedVariant) {
      setVariantError(true);
      return false;
    }
    addItem(
      {
        id: product.id,
        name: product.name,
        nameEn: product.nameEn,
        image: product.images[0] ?? null,
        price: effectivePrice,
        priceUnit: product.priceUnit,
        shopName: product.community,
        stock: effectiveStock,
      },
      quantity,
      selectedVariant ? { id: selectedVariant.id, label: variantLabel(selectedVariant) } : undefined
    );
    return true;
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

  /**
   * กดเพิ่มลงตะกร้า:
   * - มือถือ: เปิด bottom sheet ให้เลือกสี/ไซซ์/จำนวนแล้วกดยืนยันในนั้น (ตัวเลือกบนหน้าไม่โชว์บนมือถือ)
   * - เดสก์ท็อป: สี/ไซซ์/จำนวนเลือกอินไลน์บนหน้าอยู่แล้ว กดแล้วเพิ่มลงตะกร้าได้เลย ไม่ต้องมี overlay
   */
  const handleAddToCart = () => {
    if (!isReadyMade) { goToCustomFlow(); return; }
    if (isMobile) {
      setVariantError(false);
      setQuantity(1);
      setSheetIntent("cart");
      setCartSheetOpen(true);
      return;
    }
    if (requiresVariant && !selectedVariant) { setVariantError(true); return; }
    if (!addSnapshotToCart()) return;
    showToast("เพิ่มลงตะกร้าแล้ว", "cart");
  };

  /** ยืนยันตัวเลือกใน bottom sheet (มือถือ) แล้วเพิ่มลงตะกร้าจริง — ปลายทางต่างกันตาม sheetIntent */
  const confirmCartSheet = () => {
    if (requiresVariant && !selectedVariant) { setVariantError(true); return; }
    if (!addSnapshotToCart()) return;
    setCartSheetOpen(false);
    if (sheetIntent === "buy") {
      router.push("/cart");
      return;
    }
    setQuantity(1);
    showToast("เพิ่มลงตะกร้าแล้ว", "cart");
  };

  /** ปิด sheet โดยไม่ยืนยัน — คืนจำนวนกลับเป็น 1 กันปุ่มถัดไปไปหยิบค่าที่แก้ค้างไว้ */
  const closeCartSheet = () => {
    setCartSheetOpen(false);
    setQuantity(1);
  };

  /** สั่งซื้อเลย → เพิ่มลงตะกร้าแล้วไปหน้าตะกร้า (ต้องล็อกอิน) — มือถือเปิด sheet ให้เลือกตัวเลือกก่อน (ตัวเลือกบนหน้าไม่โชว์บนมือถือ) */
  const handleBuyNow = () => {
    if (!isReadyMade) { goToCustomFlow(); return; }
    if (!user) { openAuthModal(); return; }
    if (isMobile) {
      setVariantError(false);
      setSheetIntent("buy");
      setCartSheetOpen(true);
      return;
    }
    if (!addSnapshotToCart()) return;
    router.push("/cart");
  };

  const [startingChat, setStartingChat] = useState(false);

  /** แชทกับร้านค้าเจ้าของสินค้านี้โดยตรง */
  const startChat = async () => {
    if (!user) { openAuthModal(); return; }
    if (!product.shopId) return;
    setStartingChat(true);
    try {
      const res = await authFetch(`${API_BASE}/api/chat/conversations`, {
        method: "POST",
        body: JSON.stringify({ shopId: product.shopId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เริ่มแชทไม่สำเร็จ");
      router.push(`/messages/${data.id}`);
    } catch (err) {
      if (err instanceof SessionExpiredError) { openAuthModal(); return; }
    } finally {
      setStartingChat(false);
    }
  };

  const totalPrice = effectivePrice * quantity;

  /** ชิปเลือกสี/ไซซ์ (multi-SKU) — ใช้ทั้งบนหน้า (เดสก์ท็อป) และใน bottom sheet (มือถือ) */
  const renderVariantChips = () => (
    <Box>
      <Typography sx={{ fontSize: "0.85rem", color: variantError ? "#D32F2F" : "#6B7280", mb: 1.5, fontWeight: variantError ? 600 : 400 }}>
        เลือกตัวเลือกสินค้า {variantError ? "— กรุณาเลือกก่อนสั่งซื้อ" : ""}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {variants.map((v) => {
          const active = selectedVariant?.id === v.id;
          const out = v.stock <= 0;
          return (
            <Button
              key={v.id}
              variant="outlined"
              disabled={out}
              onClick={() => {
                setSelectedVariant(v);
                setVariantError(false);
                setQuantity((q) => Math.max(1, Math.min(q, v.stock)));
              }}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                fontFamily: '"Kanit", sans-serif',
                borderColor: active ? "#1B2A4A" : "#E5DFD6",
                color: out ? "#C4BFB4" : active ? "#FFFFFF" : "#1B2A4A",
                bgcolor: active ? "#1B2A4A" : "transparent",
                textDecoration: out ? "line-through" : "none",
                "&:hover": { bgcolor: active ? "#1B2A4A" : "rgba(0,0,0,0.04)" },
              }}
            >
              {variantLabel(v)}
            </Button>
          );
        })}
      </Box>
      {selectedVariant && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5 }}>
          <Typography sx={{ fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600 }}>
            {variantLabel(selectedVariant)} · ฿{selectedVariant.price.toLocaleString()}
          </Typography>
          {selectedVariant.stock <= 0 && (
            <Typography sx={{ fontSize: "0.78rem", color: "#B4552D" }}>สินค้าหมด</Typography>
          )}
        </Box>
      )}
    </Box>
  );

  /** ตัวเลือกจำนวน (+/-) สำหรับสินค้าพร้อมขาย — ใช้ทั้งบนหน้า (เดสก์ท็อป) และใน bottom sheet (มือถือ) */
  const renderQuantityStepper = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
      <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>จำนวน</Typography>
      <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #E5DFD6", borderRadius: "30px", bgcolor: "#FFFFFF" }}>
        <IconButton onClick={() => setQuantity((q) => Math.max(1, q - 1))} size="small" sx={{ p: 1 }}>
          <RemoveRoundedIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ px: 2, fontWeight: 600, color: "#1B2A4A", minWidth: 24, textAlign: "center" }}>
          {quantity}
        </Typography>
        <IconButton
          onClick={() => setQuantity((q) => Math.min(Math.max(1, effectiveStock || 99), q + 1))}
          disabled={(requiresVariant && !selectedVariant) || (effectiveStock > 0 && quantity >= effectiveStock)}
          size="small"
          sx={{ p: 1 }}
        >
          <AddRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
      {requiresVariant && !selectedVariant ? (
        <Typography sx={{ fontSize: "0.78rem", color: "#B4552D" }}>เลือกตัวเลือกสินค้าก่อน</Typography>
      ) : effectiveStock > 0 ? (
        <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>คงเหลือ {effectiveStock} ชิ้น</Typography>
      ) : (
        <Typography sx={{ fontSize: "0.78rem", color: "#B4552D" }}>สินค้าหมดชั่วคราว</Typography>
      )}
    </Box>
  );

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
              onClick={() => setZoomOpen(true)}
            >
              <Image
                src={product.images[currentImage] || "/placeholder.webp"}
                alt={displayName}
                fill
                style={{ objectFit: "cover", cursor: "zoom-in" }}
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
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                onClick={() => setZoomOpen(true)}
                aria-label="ดูภาพเต็ม"
                sx={{ bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}
              >
                <SearchRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
              </IconButton>
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
              <Image src={img} alt={`${displayName} — รูปที่ ${i + 1}`} fill style={{ objectFit: "cover" }} />
            </Box>
          ))}
        </Box>
      </Box>
      </Box>{/* end left col sticky */}

      {/* Right col: Details */}
      <Box sx={{ px: { xs: 2.5, md: 0 }, pt: { xs: 1, md: 0 }, pb: { xs: 3, md: 0 } }}>

        {/* Title Block */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography
              sx={{
                fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
                fontWeight: 700,
                fontSize: { xs: "1.6rem", md: "1.9rem" },
                color: "#13284B",
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 300, fontSize: "0.8rem", letterSpacing: "0.02em", color: "#A89F94", mt: 0.6, display: "flex", alignItems: "center" }}>
              {product.community} · {product.province}
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
            {requiresVariant && !selectedVariant && product.priceMin != null && product.priceMax != null && product.priceMin !== product.priceMax
              ? `${product.priceMin.toLocaleString()} - ${product.priceMax.toLocaleString()}`
              : effectivePrice.toLocaleString()}
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

        {/* ── ตัวเลือกสินค้า (Multi-SKU) + จำนวน: เลือกอินไลน์บนหน้า — เฉพาะเดสก์ท็อป (มือถือเลือกใน bottom sheet ตอนกดเพิ่มลงตะกร้า/สั่งซื้อ) ── */}
        {isReadyMade && (
          <Box sx={{ display: { xs: "none", md: "block" }, mb: 3 }}>
            {requiresVariant && renderVariantChips()}
            <Box sx={{ mt: requiresVariant ? 2.5 : 0 }}>{renderQuantityStepper()}</Box>
          </Box>
        )}

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
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: "#FFFFFF", p: 2, borderRadius: "12px", border: "1px solid #E5DFD6", boxShadow: "0 4px 18px rgba(27,42,74,0.06)" }}
        >
          <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "#4B7355", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: 700, flexShrink: 0 }}>
            {product.weaverName?.[0] ?? "?"}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C5A55A" }}>
              ช่างทอ
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#1B2A4A", mt: 0.2 }}>{product.weaverName}</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{product.province}</Typography>
          </Box>
          <ChevronRightRoundedIcon sx={{ color: "#CBA258", flexShrink: 0 }} />
        </Box>

        {/* Story Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          sx={{ mt: 4 }}
        >
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.66rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#C5A55A", mb: 0.6 }}>
            เรื่องราว
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif', fontWeight: 700, fontSize: "1.35rem", color: "#13284B", mb: 1.25 }}>
            เรื่องราวของ{product.typeLabel || "ผ้า"}{product.typeLabel === "กระเป๋า" ? "ใบ" : "ผืน"}นี้
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
              fontStyle: "italic",
              fontSize: "1.05rem",
              color: "#6B7280",
              lineHeight: 1.75,
            }}
          >
            {product.story || "ยังไม่มีเรื่องราวสำหรับสินค้านี้"}
          </Typography>
        </Box>

        {/* Recommended Add-ons — การ์ดเดียวกับหน้าแรก (ProductCard) ไม่ทำ list แยกเอง */}
        {relatedProducts.length > 0 && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            sx={{ mt: 5, mb: 4 }}
          >
            <SectionHeader
              eyebrow="แนะนำสำหรับคุณ"
              title="สินค้าใกล้เคียง"
              variant="editorial"
              href={product.category ? `/search?category=${product.category}` : undefined}
              actionLabel="ดูทั้งหมด"
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: { xs: 1.5, md: 2 } }}>
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} variant="grid" />
              ))}
            </Box>
          </Box>
        )}

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            sx={{ mt: 5, mb: 2 }}
          >
            <SectionHeader eyebrow="เสียงจากลูกค้า" title={`รีวิวจากผู้สั่งซื้อ (${product.reviewCount})`} variant="editorial" />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {product.reviews.map((review) => (
                <Box key={review.id} sx={{ bgcolor: "#FDF8F0", p: 2, borderRadius: "12px", border: "1px solid #EBE3D5", boxShadow: "0 4px 18px rgba(27,42,74,0.05)" }}>
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

        {/* Trust Checklist Tags */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          sx={{
            mt: 4, mb: 4, p: 2.25, display: "flex", flexDirection: "column", gap: 1.5,
            bgcolor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E5DFD6",
            boxShadow: "0 4px 18px rgba(27,42,74,0.05)",
          }}
        >
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
          // ต้องสูงกว่า AppBottomNav (zIndex 1200) ไม่งั้นแถบปุ่มนี้จะถูกบังจนมองไม่เห็น
          zIndex: 1300,
          bgcolor: "#FAF6F0",
          pb: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
          pt: 1.5,
          px: 2.5,
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={startChat}
            disabled={startingChat}
            aria-label="แชทกับร้าน"
            sx={{
              minWidth: 54,
              border: "1.5px solid #1B2A4A",
              color: "#1B2A4A",
              borderRadius: "24px",
              py: 1.5,
              "&:hover": { bgcolor: "rgba(27,42,74,0.05)" },
            }}
          >
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 22 }} />
          </Button>
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

      {/* ดูภาพเต็ม — modal พื้นหลังมืด กดที่ภาพหลักหรือปุ่มแว่นขยายเพื่อเปิด */}
      <Dialog
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        maxWidth={false}
        fullScreen
        PaperProps={{ sx: { bgcolor: "rgba(0,0,0,0.92)", boxShadow: "none" } }}
      >
        <Box
          onClick={() => setZoomOpen(false)}
          sx={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
        >
          <IconButton
            onClick={(e) => { e.stopPropagation(); setZoomOpen(false); }}
            aria-label="ปิด"
            sx={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 12px)", right: 12, zIndex: 10, color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20, transform: "rotate(45deg)" }} />
          </IconButton>

          <Box sx={{ position: "relative", width: "100%", maxWidth: 900, height: "82vh" }} onClick={(e) => e.stopPropagation()}>
            <Image
              src={product.images[currentImage] || "/placeholder.webp"}
              alt={displayName}
              fill
              style={{ objectFit: "contain" }}
              sizes="100vw"
            />
          </Box>

          {product.images.length > 1 && (
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{ position: "absolute", bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 1.5, px: 2, overflowX: "auto", maxWidth: "100%", "&::-webkit-scrollbar": { display: "none" } }}
            >
              {product.images.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  sx={{ width: 48, height: 48, borderRadius: "8px", overflow: "hidden", position: "relative", flexShrink: 0, border: i === currentImage ? "2px solid #D8BC82" : "2px solid transparent", cursor: "pointer", opacity: i === currentImage ? 1 : 0.55 }}
                >
                  <Image src={img} alt={`${displayName} — รูปที่ ${i + 1}`} fill style={{ objectFit: "cover" }} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Dialog>

      {/* มือถือ: bottom sheet เลือกสี/ไซซ์ (ถ้ามี) + จำนวน แล้วยืนยันด้วยปุ่มที่ติดขอบล่างสุดของ sheet เสมอ
          zIndex ต้องสูงกว่าแถบปุ่มล่างสุด (fixed, zIndex 1300) ไม่งั้นแถบปุ่มจะทับปุ่มยืนยันใน sheet
          จนกดไม่ได้ — ทั้งคู่ position:fixed ชนขอบล่างจอเหมือนกัน ปุ่ม z-index สูงกว่าจะบังของอีกฝั่งเสมอ */}
      <Drawer
        anchor="bottom"
        open={cartSheetOpen}
        onClose={closeCartSheet}
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            maxHeight: "92vh",
            maxWidth: 620,
            mx: "auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ overflowY: "auto", p: 3, pb: 2 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "#E5DFD6", mx: "auto", mb: 2.5 }} />
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A", mb: 2.5 }}>
            เลือกตัวเลือกสินค้า
          </Typography>
          {requiresVariant && renderVariantChips()}
          <Box sx={{ mt: requiresVariant ? 3 : 0 }}>{renderQuantityStepper()}</Box>
        </Box>
        <Box sx={{ borderTop: "1px solid #EFE9DD", p: 2.5, pb: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}>
          <Button
            onClick={confirmCartSheet}
            disabled={effectiveStock <= 0}
            fullWidth
            variant="contained"
            sx={{
              bgcolor: sheetIntent === "buy" ? "#D3A14A" : "#1B2A4A",
              color: "#FFFFFF",
              borderRadius: "16px",
              py: 1.6,
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "none",
              fontFamily: '"Kanit", sans-serif',
              "&:hover": { bgcolor: sheetIntent === "buy" ? "#C19036" : "#0F1A30", boxShadow: "none" },
            }}
          >
            {sheetIntent === "buy" ? "สั่งซื้อเลย" : "เพิ่มลงตะกร้า"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
