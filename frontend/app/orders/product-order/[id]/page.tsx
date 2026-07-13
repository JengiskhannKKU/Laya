"use client";

import { useEffect, useState, use } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { useAuth } from "@/lib/auth-context";
import { useAppModal } from "@/components/providers/AppModalProvider";
import { fetchProductOrderDetail, cancelOrder } from "@/lib/orders";
import MobileLayout from "@/components/layout/MobileLayout";
import { OrderDetailHeader, OrderStatusCard, OrderTimeline, CancelOrderButton } from "@/components/orders/OrderDetailChrome";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const FONT = '"Kanit", sans-serif';

/** ป้ายสถานะขนส่งละเอียด — ตรงกับ enum shipment_status ฝั่ง backend */
const SHIPPING_STATUS_LABELS: Record<string, string> = {
  pending: "รอขนส่งเข้ารับพัสดุ",
  picked_up: "ขนส่งรับพัสดุแล้ว",
  in_transit: "พัสดุอยู่ระหว่างขนส่ง",
  delivered: "จัดส่งสำเร็จ",
  failed: "จัดส่งไม่สำเร็จ",
  returned: "พัสดุถูกตีกลับ",
};

type ProductDetail = NonNullable<Awaited<ReturnType<typeof fetchProductOrderDetail>>>;

export default function ProductOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showConfirm } = useAppModal();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<ProductDetail | null>(null);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (authLoading) return; // รอ auth โหลดเสร็จก่อน — กัน redirect ทั้งที่ล็อกอินอยู่
    if (!user) { router.push("/auth/login"); return; }
    fetchProductOrderDetail(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [authLoading, user, router, id]);

  const startChat = async () => {
    if (!order) return;
    setStartingChat(true);
    try {
      const res = await authFetch(`${API_BASE}/api/chat/conversations`, {
        method: "POST",
        body: JSON.stringify({ shopId: order.shopId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เริ่มแชทไม่สำเร็จ");
      router.push(`/messages/${data.id}`);
    } catch (err) {
      if (err instanceof SessionExpiredError) { router.push("/auth/login"); return; }
    } finally {
      setStartingChat(false);
    }
  };

  const handleCancel = async () => {
    const ok = await showConfirm({
      title: "ยกเลิกคำสั่งซื้อ",
      message: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?",
      confirmLabel: "ยกเลิกออเดอร์",
      cancelLabel: "เก็บไว้ก่อน",
      tone: "warning",
      danger: true,
    });
    if (!ok) return;
    await cancelOrder("product", id).catch(() => {});
    fetchProductOrderDetail(id).then(setOrder);
  };

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <MobileLayout>
        <Box sx={{ flex: 1, p: 2, bgcolor: "#FAF6F0", minHeight: "100vh" }}>
          <Skeleton variant="rounded" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={200} />
        </Box>
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#FAF6F0", minHeight: "100vh", px: 4 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A", mb: 1 }}>ไม่พบคำสั่งซื้อ</Typography>
          <Button variant="contained" onClick={() => router.push("/orders")} sx={{ mt: 2, borderRadius: "20px", fontFamily: FONT, bgcolor: "#1B2A4A" }}>กลับหน้ารายการ</Button>
        </Box>
      </MobileLayout>
    );
  }

  const addr = order.shippingAddress;

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        <OrderDetailHeader title="ออเดอร์สินค้า" />
        <Box sx={{ px: 2, pt: 2, pb: 12 }}>
          <OrderStatusCard id={order.id} statusLabel={order.statusLabel} status={order.status} createdAt={order.createdAt} />
          <OrderTimeline logs={order.statusLogs} />

          {/* ── สถานะการขนส่งแบบละเอียด (แสดงเมื่อออเดอร์เข้าขั้นจัดส่งแล้ว) ── */}
          {order.shippingStatus && (
            <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 0.5 }}>
                สถานะการขนส่ง
              </Typography>
              {(order.trackingNo || order.courier) && (
                <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#6B7280", mb: 1 }}>
                  {order.courier ?? ""}{order.courier && order.trackingNo ? " · " : ""}{order.trackingNo ?? ""}
                </Typography>
              )}
              <Typography sx={{
                fontFamily: FONT, fontWeight: 600, fontSize: "0.85rem", display: "inline-block",
                color: order.shippingStatus === "delivered" ? "#166534" : ["failed", "returned"].includes(order.shippingStatus) ? "#B91C1C" : "#8E601C",
                bgcolor: order.shippingStatus === "delivered" ? "#F0FDF4" : ["failed", "returned"].includes(order.shippingStatus) ? "#FEF2F2" : "#FDF8F0",
                px: 1.2, py: 0.4, borderRadius: "8px", mb: order.shippingLogs.length ? 1.5 : 0,
              }}>
                {SHIPPING_STATUS_LABELS[order.shippingStatus] ?? order.shippingStatus}
              </Typography>
              {order.shippingLogs.map((log, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1.2, mt: i === 0 ? 0.5 : 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#C5A55A", mt: 0.7, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600 }}>
                      {SHIPPING_STATUS_LABELS[log.newStatus] ?? log.newStatus}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF" }}>
                      {new Date(log.createdAt).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {log.note ? ` · ${log.note}` : ""}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 1.5 }}>ที่อยู่จัดส่ง</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>{addr.recipientName} · {addr.phone}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280", mt: 0.3 }}>
              {addr.addressLine1} {addr.subdistrict} {addr.district} {addr.province} {addr.postalCode}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A" }}>
                สินค้า ({order.items.length}) · {order.shopName}
              </Typography>
              <Button
                onClick={startChat} disabled={startingChat}
                startIcon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                size="small"
                sx={{ flexShrink: 0, fontFamily: FONT, color: "#1B2A4A", border: "1px solid #C5A55A", borderRadius: "16px", textTransform: "none", fontSize: "0.75rem", px: 1.2 }}
              >
                แชทกับร้าน
              </Button>
            </Box>
            {order.items.map((item, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: "8px", overflow: "hidden", position: "relative", bgcolor: "#F0F0F0" }}>
                  {item.productImage && <Image src={item.productImage} alt="" fill style={{ objectFit: "cover" }} />}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>{item.productName}</Typography>
                  {item.variantLabel && (
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#8E601C", mt: 0.2 }}>ตัวเลือก: {item.variantLabel}</Typography>
                  )}
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6B7280", mt: 0.2 }}>จำนวน: {item.quantity}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.85rem", color: "#1B2A4A", mt: 0.5 }}>฿{item.subtotal.toLocaleString()}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>ยอดรวมสินค้า</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#1B2A4A" }}>฿{order.subtotal.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>ค่าจัดส่ง</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#1B2A4A" }}>฿{order.shippingFee.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: 1.5 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.95rem", color: "#1B2A4A", fontWeight: 700 }}>ยอดรวมทั้งสิ้น</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "1.3rem", color: "#C5A55A", fontWeight: 700, lineHeight: 1 }}>฿{order.total.toLocaleString()}</Typography>
            </Box>
          </Box>

          {order.cancellable && <CancelOrderButton onCancel={handleCancel} />}
        </Box>
      </Box>
    </MobileLayout>
  );
}
