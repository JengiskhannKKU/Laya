"use client";

import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { initialMockCartItems, CartItem } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import MobileLayout from "@/components/layout/MobileLayout";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [shippingEstimate] = useState(50); // MOCKED shipping
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // Auth Guard
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Load Items mock
    const timer = setTimeout(() => {
      setItems([...initialMockCartItems]); // Clone to allow local edits
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [user, router]);

  const activeItems = useMemo(() => items.filter((i) => !i.savedForLater), [items]);
  const savedItems = useMemo(() => items.filter((i) => i.savedForLater), [items]);

  const subtotal = useMemo(() => {
    return activeItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [activeItems]);

  const total = Math.max(0, subtotal + shippingEstimate - appliedDiscount);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          const maxStock = item.product.availableLength || 99;
          
          if (newQty > maxStock) {
            setToastMessage(`สินค้าเหลือ ${maxStock} ชิ้น`);
            return { ...item, quantity: maxStock };
          }
          if (newQty >= 1) return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = () => {
    if (!itemToDelete) return;
    setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
    setItemToDelete(null);
  };

  const toggleSavedState = (id: string, isSaved: boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, savedForLater: !isSaved };
        }
        return item;
      })
    );
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "LAYA200") {
      setAppliedDiscount(200);
      setToastMessage("ใช้โค้ดส่วนลด 200 บาทสำเร็จ");
    } else {
      setAppliedDiscount(0);
      setToastMessage("โค้ดไม่ถูกต้องหรือหมดอายุ");
    }
  };

  if (!user) return null; // Prevent flash

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #E5DFD6" }}>
          <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ flex: 1, textAlign: "center", fontFamily: '"Noto Serif Thai", serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A", mr: 4 }}>
            ตะกร้าสินค้า {activeItems.length > 0 ? `(${activeItems.length})` : ""}
          </Typography>
        </Box>

      {loading ? (
        <Box sx={{ px: 2, pt: 3 }}>
          <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={200} sx={{ mb: 2, borderRadius: "12px" }} />
        </Box>
      ) : activeItems.length === 0 && savedItems.length === 0 ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 4, pb: 10 }}>
          <Box sx={{ width: 100, height: 100, borderRadius: "50%", bgcolor: "#E5DFD6", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 40, color: "#9CA3AF" }} />
          </Box>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
            ตะกร้าว่างเปล่า
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#6B7280", textAlign: "center", mb: 4 }}>
            ไปเลือกชมสินค้าและลายผ้าสวยๆ จากชุมชนกันเลย
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/community")}
            sx={{
              py: 1.5,
              px: 4,
              bgcolor: "#1B2A4A",
              color: "#FFFFFF",
              borderRadius: "24px",
              fontWeight: 700,
              fontFamily: '"Noto Serif Thai", serif',
              "&:hover": { bgcolor: "#0F1A30" }
            }}
          >
            เริ่มช้อปปิ้ง
          </Button>
        </Box>
      ) : (
        <Box sx={{ px: 2, pt: 2, pb: 12 }}>
          {/* Active Items */}
          {activeItems.map((item) => (
            <Box key={item.id} sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 1.5, mb: 1.5, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid #E5DFD6" }}>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: "12px", overflow: "hidden", position: "relative", bgcolor: "#F0F0F0" }}>
                  <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: "cover" }} />
                </Box>
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, fontSize: "0.9rem", color: "#1B2A4A", lineHeight: 1.3 }}>
                    {item.product.name}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.75rem", color: "#6B7280", mt: 0.3 }}>
                    ชุมชน: {item.product.community}
                  </Typography>
                  {item.selectedFormat && (
                    <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.75rem", color: "#6B7280" }}>
                      รูปแบบ: {item.selectedFormat}
                    </Typography>
                  )}
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "0.95rem", color: "#C5A55A", mt: "auto" }}>
                    ฿{item.product.price.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5, borderColor: "rgba(0,0,0,0.06)" }} />
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton onClick={() => toggleSavedState(item.id, item.savedForLater)} size="small" sx={{ color: "#9CA3AF" }}>
                    <BookmarkBorderRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => setItemToDelete(item.id)} size="small" sx={{ color: "#9CA3AF" }}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #E5DFD6", borderRadius: "8px", bgcolor: "#FFFFFF" }}>
                  <IconButton onClick={() => updateQuantity(item.id, -1)} size="small" sx={{ p: 0.5 }}>
                    <RemoveRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Typography sx={{ px: 1.5, fontWeight: 600, fontSize: "0.9rem", color: "#1B2A4A", minWidth: 30, textAlign: "center" }}>
                    {item.quantity}
                  </Typography>
                  <IconButton onClick={() => updateQuantity(item.id, 1)} size="small" sx={{ p: 0.5 }}>
                    <AddRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}

          {/* Coupon Section */}
          {activeItems.length > 0 && (
            <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 1.5, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid #E5DFD6" }}>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "0.9rem", color: "#1B2A4A", mb: 1.5 }}>
                มีโค้ดส่วนลดหรือไม่?
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="กรอกรหัสโปรโมชั่น"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#FAF6F0",
                      "& fieldset": { borderColor: "transparent" },
                      "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={applyCoupon}
                  disabled={!coupon}
                  sx={{
                    borderRadius: "10px",
                    fontWeight: 700,
                    borderColor: "#1B2A4A",
                    color: "#1B2A4A",
                    fontFamily: '"Noto Serif Thai", serif',
                    textTransform: "none",
                    "&:hover": { bgcolor: "rgba(27,42,74,0.05)", borderColor: "#1B2A4A" }
                  }}
                >
                  ใช้โค้ด
                </Button>
              </Box>
              {appliedDiscount > 0 && (
                <Alert severity="success" sx={{ mt: 1.5, borderRadius: "8px", py: 0, px: 2, fontFamily: '"Noto Serif Thai", serif' }}>
                  ใช้งานโค้ดแล้ว — ลด ฿{appliedDiscount}
                </Alert>
              )}
            </Box>
          )}

          {/* Order Summary */}
          {activeItems.length > 0 && (
            <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid #E5DFD6" }}>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: "#1B2A4A", mb: 2 }}>
                สรุปคำสั่งซื้อ
              </Typography>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.9rem", color: "#6B7280" }}>ยอดรวมสินค้า</Typography>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.9rem", color: "#1B2A4A", fontWeight: 600 }}>
                  ฿{subtotal.toLocaleString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.9rem", color: "#6B7280" }}>ค่าจัดส่งโดยประมาณ</Typography>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.9rem", color: "#1B2A4A", fontWeight: 600 }}>
                  ฿{shippingEstimate}
                </Typography>
              </Box>

              {appliedDiscount > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.9rem", color: "#05A546" }}>ส่วนลด</Typography>
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.9rem", color: "#05A546", fontWeight: 600 }}>
                    -฿{appliedDiscount}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1.5, borderColor: "rgba(0,0,0,0.06)" }} />
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: "#1B2A4A" }}>
                  ยอดชำระสุทธิ
                </Typography>
                <Typography sx={{ fontFamily: '"Playfair Display", "Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.3rem", color: "#C5A55A" }}>
                  ฿{total.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1rem", color: "#1B2A4A", mb: 2, px: 1 }}>
                บันทึกไว้ซื้อภายหลัง ({savedItems.length})
              </Typography>
              
              {savedItems.map((item) => (
                <Box key={item.id} sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 1.5, mb: 1.5, border: "1px solid #E5DFD6", opacity: 0.85 }}>
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: "12px", overflow: "hidden", position: "relative", bgcolor: "#F0F0F0" }}>
                      <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A", lineHeight: 1.2 }}>
                        {item.product.name}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "0.85rem", color: "#C5A55A", mt: 0.5 }}>
                        ฿{item.product.price.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: "rgba(0,0,0,0.04)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Button
                      size="small"
                      onClick={() => setItemToDelete(item.id)}
                      sx={{ color: "#9CA3AF", fontSize: "0.75rem", fontFamily: '"Noto Serif Thai", serif', textTransform: "none" }}
                    >
                      ลบออก
                    </Button>
                    <Button
                      size="small"
                      onClick={() => toggleSavedState(item.id, item.savedForLater)}
                      sx={{ color: "#1B2A4A", fontSize: "0.75rem", fontWeight: 600, fontFamily: '"Noto Serif Thai", serif', textTransform: "none" }}
                    >
                      ย้ายกลับไปตะกร้า
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Continue Shopping Link if needed */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Link href="/community" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.9rem", color: "#C5A55A", fontWeight: 600, "&:hover": { textDecoration: "underline" }}}>
                ช้อปปิ้งต่อ
              </Typography>
            </Link>
          </Box>
        </Box>
      )}

      {/* Sticky Bottom Checkout Action */}
      {!loading && activeItems.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 56, md: 0 }, // above bottom nav on mobile
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 430, // Matches Layout boundaries
            zIndex: 100,
            bgcolor: "#FFFFFF",
            p: 2,
            borderTop: "1px solid #E5DFD6",
            boxShadow: "0 -4px 12px rgba(27,42,74,0.05)",
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push("/checkout")}
            sx={{
              py: 1.5,
              bgcolor: "#1B2A4A",
              color: "#FFFFFF",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "1rem",
              fontFamily: '"Noto Serif Thai", serif',
              "&:hover": { bgcolor: "#0F1A30" }
            }}
          >
            ดำเนินการสั่งซื้อ (฿{total.toLocaleString()})
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onClose={() => setItemToDelete(null)} PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
        <DialogTitle sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, color: "#1B2A4A", pb: 1 }}>
          ยืนยันการลบ
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: '"Noto Serif Thai", serif', color: "#6B7280", fontSize: "0.9rem" }}>
            คุณต้องการนำสินค้านี้ออกจากตะกร้าใช่หรือไม่?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemToDelete(null)} sx={{ color: "#6B7280", fontFamily: '"Noto Serif Thai", serif', fontWeight: 600 }}>
            ยกเลิก
          </Button>
          <Button onClick={removeItem} sx={{ color: "#D32F2F", fontFamily: '"Noto Serif Thai", serif', fontWeight: 700 }} autoFocus>
            ลบสินค้า
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Snackbars */}
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
