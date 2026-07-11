"use client";

import { useEffect, useState, use } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAppModal } from "@/components/providers/AppModalProvider";
import { fetchWeavingOrderDetail, cancelOrder } from "@/lib/orders";
import MobileLayout from "@/components/layout/MobileLayout";
import { OrderDetailHeader, OrderStatusCard, OrderTimeline, CancelOrderButton } from "@/components/orders/OrderDetailChrome";

const FONT = '"Kanit", sans-serif';

type WeavingDetail = NonNullable<Awaited<ReturnType<typeof fetchWeavingOrderDetail>>>;

export default function WeavingOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { showConfirm } = useAppModal();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<WeavingDetail | null>(null);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    fetchWeavingOrderDetail(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
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
    await cancelOrder("weaving", id).catch(() => {});
    fetchWeavingOrderDetail(id).then(setOrder);
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

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        <OrderDetailHeader title="ออเดอร์สั่งทอ" />
        <Box sx={{ px: 2, pt: 2, pb: 12 }}>
          <OrderStatusCard id={order.id} statusLabel={order.statusLabel} status={order.status} createdAt={order.createdAt} />
          <OrderTimeline logs={order.statusLogs} />

          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 1.5 }}>รายละเอียดการสั่งทอ</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>ร้านทอผ้า</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 600 }}>{order.shopName ?? "-"}</Typography>
            </Box>
            {order.patternName && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>ลายผ้า</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 600 }}>{order.patternName}</Typography>
              </Box>
            )}
            {order.colorName && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>สี</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 600 }}>{order.colorName}</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280" }}>จำนวน</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 600 }}>
                {order.metersRequested} เมตร{order.widthCm ? ` · กว้าง ${order.widthCm} ซม.` : ""}
              </Typography>
            </Box>
            {order.specialInstructions && (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280" }}>หมายเหตุ: {order.specialInstructions}</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.95rem", color: "#1B2A4A", fontWeight: 700 }}>ยอดรวม</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "1.3rem", color: "#C5A55A", fontWeight: 700, lineHeight: 1 }}>
                ฿{(order.finalPrice ?? order.estimatedPrice ?? 0).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {order.cancellable && <CancelOrderButton onCancel={handleCancel} />}
        </Box>
      </Box>
    </MobileLayout>
  );
}
