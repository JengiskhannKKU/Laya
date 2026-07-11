"use client";

import { useEffect, useState, use } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAppModal } from "@/components/providers/AppModalProvider";
import { fetchProductOrderDetail, cancelOrder } from "@/lib/orders";
import MobileLayout from "@/components/layout/MobileLayout";
import { OrderDetailHeader, OrderStatusCard, OrderTimeline, CancelOrderButton } from "@/components/orders/OrderDetailChrome";

const FONT = '"Kanit", sans-serif';

type ProductDetail = NonNullable<Awaited<ReturnType<typeof fetchProductOrderDetail>>>;

export default function ProductOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { showConfirm } = useAppModal();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<ProductDetail | null>(null);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    fetchProductOrderDetail(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [user, router, id]);

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

  if (!user) return null;

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

          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 1.5 }}>ที่อยู่จัดส่ง</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>{addr.recipientName} · {addr.phone}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280", mt: 0.3 }}>
              {addr.addressLine1} {addr.subdistrict} {addr.district} {addr.province} {addr.postalCode}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 2 }}>
              สินค้า ({order.items.length}) · {order.shopName}
            </Typography>
            {order.items.map((item, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: "8px", overflow: "hidden", position: "relative", bgcolor: "#F0F0F0" }}>
                  {item.productImage && <Image src={item.productImage} alt="" fill style={{ objectFit: "cover" }} />}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>{item.productName}</Typography>
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
