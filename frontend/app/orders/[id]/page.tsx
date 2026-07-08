"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import LinearProgress from "@mui/material/LinearProgress";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAppModal } from "@/components/providers/AppModalProvider";
import { mockOrders, Order, OrderStatus } from "@/lib/mock-data";
import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";

const statusMapping: Record<OrderStatus, { label: string; color: string; bgcolor: string }> = {
  pending: { label: "รอยืนยัน", color: "#8E601C", bgcolor: "#FDF8F0" },
  confirmed: { label: "ยืนยันแล้ว", color: "#1B2A4A", bgcolor: "#E2E8F0" },
  producing: { label: "กำลังผลิต", color: "#0066CC", bgcolor: "#E6F0FF" },
  shipped: { label: "จัดส่งแล้ว", color: "#05A546", bgcolor: "#E8F5E9" },
  delivered: { label: "ได้รับสินค้าแล้ว", color: "#05A546", bgcolor: "#E8F5E9" },
  cancelled: { label: "ยกเลิกแล้ว", color: "#D32F2F", bgcolor: "#FFEBEE" }
};

const timelineSteps = [
  { key: "pending", label: "รอยืนยัน" },
  { key: "confirmed", label: "ยืนยันคำสั่งซื้อ" },
  { key: "producing", label: "กำลังผลิต/กำลังทอ" },
  { key: "shipped", label: "จัดส่งสินค้า" },
  { key: "delivered", label: "ได้รับสินค้าแล้ว" }
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { showAlert } = useAppModal();
  const orderId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setTimeout(() => {
      const found = mockOrders.find(o => o.id === orderId);
      setOrder(found || null);
      setLoading(false);
    }, 800);
  }, [user, router, orderId]);

  if (!user) return null;

  if (loading) {
    return (
      <MobileLayout>
        <Box sx={{ flex: 1, p: 2, bgcolor: "#FAF6F0", minHeight: "100vh" }}>
          <Skeleton variant="rounded" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={200} />
        </Box>
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#FAF6F0", minHeight: "100vh", px: 4 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A", mb: 1 }}>ไม่พบคำสั่งซื้อ</Typography>
          <Button variant="contained" onClick={() => router.push("/orders")} sx={{ mt: 2, borderRadius: "20px", fontFamily: '"Kanit", sans-serif', bgcolor: "#1B2A4A" }}>กลับหน้ารายการ</Button>
        </Box>
      </MobileLayout>
    );
  }

  const statusMeta = statusMapping[order.status] || statusMapping.pending;
  const isCancelled = order.status === "cancelled";

  // Calculate active step index for Stepper
  const activeStepIdx = isCancelled ? -1 : timelineSteps.findIndex(s => s.key === order.status);
  const normalizedActiveStep = isCancelled ? 0 : (activeStepIdx === -1 ? 0 : activeStepIdx);
  const progressPercent = isCancelled ? 0 : ((normalizedActiveStep ) / (timelineSteps.length - 1)) * 100;

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        
        {/* Header */}
        <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #E5DFD6" }}>
          <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ flex: 1, textAlign: "center", fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A", mr: 4 }}>
            รายละเอียดคำสั่งซื้อ
          </Typography>
        </Box>

        <Box sx={{ px: 2, pt: 2, pb: 12 }}>
          
          {/* Order ID & Status Header */}
          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: "#1B2A4A" }}>
                #{order.id.toUpperCase()}
              </Typography>
              <Typography sx={{ px: 1.5, py: 0.3, borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, bgcolor: statusMeta.bgcolor, color: statusMeta.color }}>
                {statusMeta.label}
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>
              สั่งซื้อเมื่อ {new Date(order.createdAt).toLocaleString('th-TH')}
            </Typography>
          </Box>

          {/* Timeline Tracking */}
          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2.5, mb: 2, border: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 2 }}>
              สถานะการดำเนินการ
            </Typography>

            {isCancelled ? (
              <Box sx={{ bgcolor: "#FFEBEE", p: 2, borderRadius: "8px", border: "1px dashed #D32F2F" }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#D32F2F", fontWeight: 600, textAlign: "center" }}>ถูกยกเลิกแล้ว</Typography>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280", textAlign: "center", mt: 0.5 }}>กำลังดำเนินการคืนเงินให้ท่านผ่านช่องทางเดิม (ถ้ามี)</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>ความคืบหน้า</Typography>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#1B2A4A", fontWeight: 700 }}>{Math.round(progressPercent)}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 6, borderRadius: 3, bgcolor: "#E5DFD6", "& .MuiLinearProgress-bar": { bgcolor: "#1B2A4A", borderRadius: 3 } }} />
                </Box>
                <Stepper activeStep={normalizedActiveStep} orientation="vertical" sx={{ "& .MuiStepLabel-label": { fontFamily: '"Kanit", sans-serif' }, "& .MuiStepIcon-root.Mui-active": { color: "#C5A55A" }, "& .MuiStepIcon-root.Mui-completed": { color: "#1B2A4A" } }}>
                  {timelineSteps.map((step, index) => (
                    <Step key={step.key}>
                      <StepLabel>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: index <= normalizedActiveStep ? "#1B2A4A" : "#9CA3AF", fontWeight: index <= normalizedActiveStep ? 600 : 400 }}>
                          {step.label}
                        </Typography>
                        {index === normalizedActiveStep && order.estimatedDelivery && (
                          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#C5A55A", mt: 0.2 }}>
                            คาดว่าจะถึง: {new Date(order.estimatedDelivery).toLocaleDateString('th-TH')}
                          </Typography>
                        )}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </>
            )}
          </Box>

          {/* Shipping Info if shipped */}
          {(order.status === "shipped" || order.status === "delivered") && order.trackingNumber && (
            <Box sx={{ bgcolor: "#E8F5E9", borderRadius: "16px", p: 2, mb: 2, border: "1px dashed #05A546" }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#05A546", mb: 1, display: "flex", alignItems: "center" }}>
                <LocalShippingOutlinedIcon sx={{ mr: 1, fontSize: 20 }} /> ข้อมูลจัดส่ง
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>ผู้ให้บริการ</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#1B2A4A", fontWeight: 600 }}>{order.courierName}</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>หมายเลขติดตามพัสดุ</Typography>
                  <Typography
                    onClick={() => showAlert({ title: "ติดตามพัสดุ", message: `กำลังนำคุณไปยังเว็บไซต์ ${order.courierName} เพื่อติดตามหมายเลข ${order.trackingNumber}` })}
                    sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#0066CC", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                  >
                    {order.trackingNumber}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Address */}
          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 1.5, display: "flex", alignItems: "center" }}>
              <LocationOnOutlinedIcon sx={{ mr: 1, fontSize: 20, color: "#C5A55A" }} /> ที่อยู่สำหรับจัดส่ง
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>{order.shippingAddress.recipientName}</Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280", mt: 0.2 }}>{order.shippingAddress.phone}</Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280", mt: 0.2 }}>
              {order.shippingAddress.addressLine1} {order.shippingAddress.addressLine2} {order.shippingAddress.subdistrict} {order.shippingAddress.district} {order.shippingAddress.province} {order.shippingAddress.postalCode}
            </Typography>
          </Box>

          {/* Items */}
          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 2 }}>
              สินค้าที่สั่งซื้อ ({order.items.length})
            </Typography>
            {order.items.map(item => (
              <Box key={item.id} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: "8px", overflow: "hidden", position: "relative", bgcolor: "#F0F0F0" }}>
                  <Image src={item.product.images[0]} alt="" fill style={{ objectFit: "cover" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>
                    {item.product.name}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280", mt: 0.2 }}>
                    จำนวน: {item.quantity}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.85rem", color: "#1B2A4A", mt: 0.5 }}>
                    ฿{item.priceAtPurchase.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Payment Summary */}
          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 2 }}>สรุปข้อมูลการชำระเงิน</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>วิธีชำระเงิน</Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 600 }}>{order.paymentMethod}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>สถานะชำระเงิน</Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: order.paymentStatus === 'paid' ? "#05A546" : "#8E601C", fontWeight: 700 }}>
                {order.paymentStatus.toUpperCase()}
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5, borderColor: "rgba(0,0,0,0.06)" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>ยอดรวมสินค้า</Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#1B2A4A" }}>฿{order.subtotal.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>ค่าจัดส่ง ({order.shippingMethod.name})</Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#1B2A4A" }}>฿{order.shippingCost.toLocaleString()}</Typography>
            </Box>
            {order.discount > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#05A546" }}>ส่วนลด</Typography>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#05A546" }}>-฿{order.discount.toLocaleString()}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1.5, borderColor: "rgba(0,0,0,0.06)" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.95rem", color: "#1B2A4A", fontWeight: 700 }}>ชำระสุทธิ</Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.3rem", color: "#C5A55A", fontWeight: 700, lineHeight: 1 }}>฿{order.totalPrice.toLocaleString()}</Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ChatBubbleOutlineRoundedIcon />}
              onClick={() => showAlert({ title: "ติดต่อช่างทอผู้ขาย", message: "ระบบแชทเปิดใน LAYA Messenger" })}
              sx={{ py: 1.2, borderRadius: "12px", borderColor: "#E5DFD6", color: "#1B2A4A", fontFamily: '"Kanit", sans-serif', fontWeight: 600 }}
            >
              ติดต่อช่างทอผู้ขาย
            </Button>

            {order.status === "pending" || order.status === "confirmed" ? (
              <Button onClick={() => showAlert({ title: "ขอยกเลิกคำสั่งซื้อ", message: "ระบบกำลังประมวลผลการขอยกเลิก ทีมงานจะติดต่อกลับโดยเร็วที่สุด", tone: "warning" })} sx={{ py: 1.2, color: "#D32F2F", fontFamily: '"Kanit", sans-serif', fontWeight: 600 }}>
                ขอยกเลิกคำสั่งซื้อ
              </Button>
             ) : order.status === "delivered" ? (
              <Button onClick={() => showAlert({ title: "ขอคืนสินค้า/ขอคืนเงิน", message: "การส่งคืนเปิดเฉพาะกรณีมีปัญหาคุณภาพสินค้า ภายใน 7 วันหลังได้รับสินค้า" })} sx={{ py: 1.2, color: "#6B7280", fontFamily: '"Kanit", sans-serif', fontWeight: 600 }}>
                ขอคืนสินค้า/ขอคืนเงิน (ภายใน 7 วัน)
              </Button>
            ) : null}
          </Box>

        </Box>
      </Box>
    </MobileLayout>
  );
}
