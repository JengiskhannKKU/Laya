"use client";

import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCartStore, cartSubtotal, cartLineKey } from "@/lib/cart-store";
import Image from "next/image";
import Link from "next/link";
import MobileLayout from "@/components/layout/MobileLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { productDisplayName } from "@/lib/live-products";

const SHIPPING_ESTIMATE = 50;
const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const IVORY = "#FAF6F0";
const CARD_BORDER = "#EFE9DD";

const cardSx = {
  bgcolor: "#FFFFFF",
  borderRadius: "18px",
  border: `1px solid ${CARD_BORDER}`,
  boxShadow: "0 2px 14px rgba(27,42,74,0.05)",
};

export default function CartPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [hydrated, setHydrated] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || authLoading) return; // รอ auth โหลดเสร็จก่อน — กัน redirect ทั้งที่ล็อกอินอยู่
    if (!user) router.push("/auth/login");
  }, [hydrated, authLoading, user, router]);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const total = Math.max(0, subtotal + (items.length > 0 ? SHIPPING_ESTIMATE : 0));

  const handleUpdateQty = (lineKey: string, delta: number, current: number, stock: number) => {
    const next = current + delta;
    if (next > stock) {
      setToastMessage(t("cart.stockToast").replace("{n}", String(stock)));
      updateQuantity(lineKey, stock);
      return;
    }
    updateQuantity(lineKey, next);
  };

  const confirmRemove = () => {
    if (!itemToDelete) return;
    removeItem(itemToDelete);
    setItemToDelete(null);
  };

  if (!hydrated || authLoading) return null;
  if (!user) return null;

  const orderSummaryCard = (
    <Box sx={{ ...cardSx, p: { xs: 2, md: 2.5 } }}>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.05rem", color: NAVY, mb: 2 }}>
        {t("cart.orderSummary")}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>
          {t("cart.itemsSubtotal").replace("{n}", String(items.reduce((n, i) => n + i.quantity, 0)))}
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: NAVY, fontWeight: 600 }}>
          ฿{subtotal.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>{t("cart.shippingEstimate")}</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: NAVY, fontWeight: 600 }}>
          ฿{SHIPPING_ESTIMATE}
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5, borderColor: "#F3EDE2" }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.95rem", color: NAVY, fontWeight: 700 }}>{t("cart.netTotal")}</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.6rem", color: GOLD, fontWeight: 700, lineHeight: 1 }}>
          ฿{total.toLocaleString()}
        </Typography>
      </Box>

      <Button
        variant="contained" fullWidth
        onClick={() => router.push("/checkout")}
        sx={{
          py: 1.6, bgcolor: NAVY, color: "#FFFFFF", borderRadius: "14px", fontWeight: 700,
          fontSize: "0.98rem", fontFamily: FONT, textTransform: "none",
          boxShadow: "0 6px 18px rgba(27,42,74,0.22)", transition: "all 0.2s",
          "&:hover": { bgcolor: "#0F1A30", transform: "translateY(-1px)" },
        }}
      >
        {t("cart.checkoutButton")}
      </Button>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LockOutlinedIcon sx={{ fontSize: 14, color: GOLD }} />
          <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", color: "#9CA3AF" }}>{t("cart.securePayment")}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LocalShippingRoundedIcon sx={{ fontSize: 14, color: GOLD }} />
          <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", color: "#9CA3AF" }}>{t("cart.trackableShipping")}</Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Link href="/community" style={{ textDecoration: "none" }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: GOLD, fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
            {t("cart.continueShopping")}
          </Typography>
        </Link>
      </Box>
    </Box>
  );

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: IVORY, minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{
          px: { xs: 2, md: 4 }, pt: { xs: 4, md: 3 }, pb: { xs: 2, md: 2 }, display: "flex", alignItems: "center",
          bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #EFE9DD",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", maxWidth: 1280, width: "100%", mx: "auto" }}>
            <IconButton onClick={() => router.back()} sx={{ color: NAVY }}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, ml: { md: 1 }, fontFamily: FONT, fontSize: { xs: "1.05rem", md: "1.25rem" }, fontWeight: 700, color: NAVY, mr: { xs: 4, md: 0 } }}>
              {t("cart.title")} {items.length > 0 ? `(${items.length})` : ""}
            </Typography>
          </Box>
        </Box>

        {items.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 4, pb: 10 }}>
            <Box sx={{ width: 100, height: 100, borderRadius: "50%", bgcolor: "#E5DFD6", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
              <Inventory2OutlinedIcon sx={{ fontSize: 40, color: "#9CA3AF" }} />
            </Box>
            <Typography sx={{ fontFamily: FONT, fontSize: "1.1rem", fontWeight: 700, color: NAVY, mb: 1 }}>
              {t("cart.emptyTitle")}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280", textAlign: "center", mb: 4 }}>
              {t("cart.emptySubtitle")}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/community")}
              sx={{
                py: 1.5, px: 4, bgcolor: NAVY, color: "#FFFFFF", borderRadius: "24px", fontWeight: 700,
                fontFamily: FONT, textTransform: "none", "&:hover": { bgcolor: "#0F1A30" },
              }}
            >
              {t("cart.startShopping")}
            </Button>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 1280, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 2, md: 4 }, pb: { xs: 13, md: 6 }, flex: 1 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 0, md: 4 }, alignItems: "flex-start" }}>

              {/* LEFT: รายการสินค้า */}
              <Box sx={{ flex: { md: "1 1 0" }, minWidth: 0, width: "100%" }}>
                {items.map((line) => {
                  const lineKey = cartLineKey(line.productId, line.variantId);
                  return (
                  <Box key={lineKey} sx={{ ...cardSx, p: { xs: 1.5, md: 2 }, mb: 1.5 }}>
                    <Box sx={{ display: "flex", gap: 1.8 }}>
                      <Box sx={{ width: { xs: 80, md: 96 }, height: { xs: 80, md: 96 }, borderRadius: "14px", overflow: "hidden", position: "relative", bgcolor: "#F0F0F0", flexShrink: 0 }}>
                        {line.product.image && (
                          <Image src={line.product.image} alt={productDisplayName(line.product, locale)} fill style={{ objectFit: "cover" }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.95rem", color: NAVY, lineHeight: 1.3 }}>
                          {productDisplayName(line.product, locale)}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#9CA3AF", mt: 0.3 }}>
                          {t("cart.shopLabel")}: {line.product.shopName}
                        </Typography>
                        {line.variantLabel && (
                          <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#8E601C", mt: 0.3 }}>
                            {t("cart.optionLabel")}: {line.variantLabel}
                          </Typography>
                        )}
                        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem", color: GOLD, mt: "auto" }}>
                          ฿{line.product.price.toLocaleString()} / {line.product.priceUnit}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: "#F3EDE2" }} />

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <IconButton onClick={() => setItemToDelete(lineKey)} size="small" sx={{ color: "#D1D5DB", "&:hover": { color: "#D32F2F" } }}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>

                      <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #E5DFD6", borderRadius: "10px", bgcolor: "#FFFFFF" }}>
                        <IconButton onClick={() => handleUpdateQty(lineKey, -1, line.quantity, line.product.stock)} size="small" sx={{ p: 0.6 }}>
                          <RemoveRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Typography sx={{ px: 1.6, fontWeight: 600, fontSize: "0.9rem", color: NAVY, minWidth: 30, textAlign: "center" }}>
                          {line.quantity}
                        </Typography>
                        <IconButton onClick={() => handleUpdateQty(lineKey, 1, line.quantity, line.product.stock)} size="small" sx={{ p: 0.6 }}>
                          <AddRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                  );
                })}
              </Box>

              {/* RIGHT: สรุปคำสั่งซื้อ sticky (เดสก์ท็อป) */}
              <Box sx={{ display: { xs: "none", md: "block" }, flex: "0 0 360px", width: 360, position: "sticky", top: 100 }}>
                {orderSummaryCard}
              </Box>

              {/* สรุปคำสั่งซื้อแบบ inline (มือถือ) */}
              <Box sx={{ display: { xs: "block", md: "none" }, width: "100%" }}>
                {orderSummaryCard}
              </Box>
            </Box>
          </Box>
        )}

        {/* Sticky Bottom Checkout Action — มือถือเท่านั้น */}
        {items.length > 0 && (
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: 430, zIndex: 1300, bgcolor: "#FFFFFF",
              px: 2, pt: 2, pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
              borderTop: "1px solid #E5DFD6", boxShadow: "0 -4px 12px rgba(27,42,74,0.05)",
            }}
          >
            <Button
              variant="contained" fullWidth
              onClick={() => router.push("/checkout")}
              sx={{
                py: 1.5, bgcolor: NAVY, color: "#FFFFFF", borderRadius: "14px", fontWeight: 700,
                fontSize: "1rem", fontFamily: FONT, textTransform: "none", "&:hover": { bgcolor: "#0F1A30" },
              }}
            >
              {t("cart.checkoutButton")} (฿{total.toLocaleString()})
            </Button>
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!itemToDelete} onClose={() => setItemToDelete(null)} PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
          <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, color: NAVY, pb: 1 }}>
            {t("cart.deleteConfirmTitle")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontFamily: FONT, color: "#6B7280", fontSize: "0.9rem" }}>
              {t("cart.deleteConfirmBody")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setItemToDelete(null)} sx={{ color: "#6B7280", fontFamily: FONT, fontWeight: 600 }}>
              {t("common.cancel")}
            </Button>
            <Button onClick={confirmRemove} sx={{ color: "#D32F2F", fontFamily: FONT, fontWeight: 700 }} autoFocus>
              {t("cart.removeItem")}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={!!toastMessage}
          autoHideDuration={3000}
          onClose={() => setToastMessage("")}
          message={toastMessage}
          sx={{ bottom: { xs: 80, sm: 24 } }}
        />
      </Box>
    </MobileLayout>
  );
}
