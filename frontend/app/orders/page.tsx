"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAppModal } from "@/components/providers/AppModalProvider";
import { fetchAllOrders, cancelOrder, requestCancelOrder, detailHref, type OrderSummary } from "@/lib/orders";
import MobileLayout from "@/components/layout/MobileLayout";

const IN_PROGRESS_STATUSES = ["confirmed", "in_progress", "weaving", "ready", "shipped"];

const filterTabs = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending_confirm", label: "รอยืนยัน" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "delivered", label: "สำเร็จ" },
  { value: "cancelled", label: "ยกเลิก" },
];

function OrderListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { showConfirm } = useAppModal();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const tabParam = searchParams.get("status") || "all";

  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (authLoading) return; // รอ auth โหลดเสร็จก่อน — กัน redirect ทั้งที่ล็อกอินอยู่
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchAllOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [authLoading, user, router]);

  const total = orders.length;
  const inProgress = orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status)).length;
  const completed = orders.filter((o) => o.status === "delivered").length;

  const filteredOrders = useMemo(() => {
    if (tabParam === "all") return orders;
    if (tabParam === "in_progress") return orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status));
    return orders.filter((o) => o.status === tabParam);
  }, [orders, tabParam]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    router.push(`/orders?status=${newValue}`);
  };

  const handleCancel = async (order: OrderSummary) => {
    const ok = await showConfirm({
      title: "ยกเลิกคำสั่งซื้อ",
      message: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?",
      confirmLabel: "ยกเลิกออเดอร์",
      cancelLabel: "เก็บไว้ก่อน",
      tone: "warning",
      danger: true,
    });
    if (!ok) return;
    try {
      await cancelOrder(order.type, order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id && o.type === order.type ? { ...o, status: "cancelled" } : o)));
      setToastMsg("ยกเลิกคำสั่งซื้อสำเร็จ");
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : "ยกเลิกคำสั่งซื้อไม่สำเร็จ");
    }
  };

  const handleRequestCancel = async (order: OrderSummary) => {
    const ok = await showConfirm({
      title: "ขอยกเลิกคำสั่งซื้อ",
      message: "ออเดอร์นี้ชำระเงินแล้ว การยกเลิกต้องรอร้านกดยินยอมก่อน คุณต้องการส่งคำขอยกเลิกหรือไม่?",
      confirmLabel: "ส่งคำขอยกเลิก",
      cancelLabel: "เก็บไว้ก่อน",
      tone: "warning",
      danger: true,
    });
    if (!ok) return;
    try {
      await requestCancelOrder(order.type, order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id && o.type === order.type ? { ...o, cancelRequestedAt: new Date().toISOString() } : o)));
      setToastMsg("ส่งคำขอยกเลิกแล้ว รอร้านตอบกลับ");
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : "ส่งคำขอยกเลิกไม่สำเร็จ");
    }
  };

  if (authLoading || !user) return null;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10 }}>
        <IconButton onClick={() => router.push("/profile")} sx={{ color: "#1B2A4A" }}>
          <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography sx={{ flex: 1, textAlign: "center", fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A", mr: 4 }}>
          คำสั่งซื้อของฉัน
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: "flex", px: 2, py: 2, gap: 2, bgcolor: "#FFFFFF", borderBottom: "1px solid #E5DFD6" }}>
        <Box sx={{ flex: 1, textAlign: "center", borderRight: "1px solid #E5DFD6" }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A" }}>{total}</Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>ทั้งหมด</Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: "center", borderRight: "1px solid #E5DFD6" }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: "#D3A14A" }}>{inProgress}</Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>กำลังดำเนินการ</Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: "center" }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: "#05A546" }}>{completed}</Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>เสร็จสิ้น</Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E5DFD6" }}>
        <Tabs
          value={tabParam}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              fontFamily: '"Kanit", sans-serif',
              minHeight: 40,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "#9CA3AF",
            },
            "& .Mui-selected": { color: "#1B2A4A" },
            "& .MuiTabs-indicator": { bgcolor: "#1B2A4A" },
          }}
        >
          {filterTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      {/* Orders List */}
      <Box sx={{ px: 2, pt: 2, pb: 10 }}>
        {loading ? (
          <Box>
            <Skeleton variant="rounded" height={120} sx={{ mb: 2, borderRadius: "16px" }} />
            <Skeleton variant="rounded" height={120} sx={{ mb: 2, borderRadius: "16px" }} />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1rem", fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
              ยังไม่มีคำสั่งซื้อในสถานะนี้
            </Typography>
            <Button variant="outlined" onClick={() => router.push("/community")} sx={{ mt: 2, borderRadius: "20px", fontFamily: '"Kanit", sans-serif' }}>
              เริ่มช้อปปิ้ง
            </Button>
          </Box>
        ) : (
          filteredOrders.map((order) => {
            const date = new Date(order.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
            const isCancelled = order.status === "cancelled";
            const isDelivered = order.status === "delivered";
            const statusColor = isCancelled ? "#D32F2F" : isDelivered ? "#05A546" : "#8E601C";
            const statusBg = isCancelled ? "#FFEBEE" : isDelivered ? "#E8F5E9" : "#FDF8F0";

            return (
              <Box key={`${order.type}_${order.id}`} sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", mb: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid #E5DFD6", overflow: "hidden" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderBottom: "1px solid #F3F4F6", bgcolor: "#FAFAFA" }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>
                    สั่งเมื่อ {date} · {order.shopName}
                  </Typography>
                  <Typography sx={{ px: 1.5, py: 0.3, borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, bgcolor: statusBg, color: statusColor }}>
                    {order.statusLabel}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.5, cursor: "pointer" }} onClick={() => router.push(detailHref(order))}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>
                    {order.summary}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.5, pt: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>
                    ยอดรวม: <Box component="span" sx={{ fontWeight: 700, color: "#1B2A4A", fontSize: "1rem" }}>฿{order.total.toLocaleString()}</Box>
                  </Typography>

                  {order.cancellable && (
                    <Button size="small" variant="outlined" color="error" onClick={() => handleCancel(order)} sx={{ borderRadius: "8px", fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", minWidth: 80 }}>
                      ยกเลิกคำสั่งซื้อ
                    </Button>
                  )}
                  {order.cancelRequestable && (
                    <Button size="small" variant="outlined" color="error" onClick={() => handleRequestCancel(order)} sx={{ borderRadius: "8px", fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", minWidth: 80 }}>
                      ขอยกเลิกออเดอร์
                    </Button>
                  )}
                  {order.cancelRequestedAt && (
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#8E601C", fontWeight: 600 }}>
                      รอร้านตอบกลับคำขอยกเลิก
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={!!toastMsg}
        autoHideDuration={3000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        sx={{ bottom: { xs: 80, sm: 24 } }}
      />
    </Box>
  );
}

export default function OrderListPage() {
  return (
    <MobileLayout>
      {/* OrderListContent uses useSearchParams — must be inside Suspense */}
      <Suspense fallback={<CircularProgress sx={{ m: "auto" }} />}>
        <OrderListContent />
      </Suspense>
    </MobileLayout>
  );
}
