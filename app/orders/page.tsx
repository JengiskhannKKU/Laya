"use client";

import { useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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

const filterTabs = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: "รอยืนยัน" },
  { value: "producing", label: "กำลังผลิต" },
  { value: "shipped", label: "จัดส่งแล้ว" },
  { value: "delivered", label: "สำเร็จ" },
  { value: "cancelled", label: "ยกเลิก" }
];

export default function OrderListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const tabParam = searchParams.get("status") || "all";
  
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    // Simulate DB fetch
    setTimeout(() => {
      setOrders([...mockOrders]);
      setLoading(false);
    }, 800);
  }, [user, router]);

  // Quick stats
  const total = orders.length;
  const inProgress = orders.filter(o => o.status === "producing" || o.status === "shipped").length;
  const completed = orders.filter(o => o.status === "delivered").length;

  const filteredOrders = useMemo(() => {
    if (tabParam === "all") return orders;
    return orders.filter(o => o.status === tabParam || (tabParam === 'producing' && o.status === 'confirmed'));
  }, [orders, tabParam]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(`/orders?status=${newValue}`);
  };

  const handleReorder = (order: Order) => {
    setToastMsg(`เพิ่ม ${order.items.length} รายการลงในตะกร้าแล้ว`);
    setTimeout(() => router.push("/cart"), 1500);
  };

  const handleCancel = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?")) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "cancelled" } : o));
      setToastMsg("ยกเลิกคำสั่งซื้อสำเร็จ");
    }
  };

  if (!user) return null;

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10 }}>
          <IconButton onClick={() => router.push("/profile")} sx={{ color: "#1B2A4A" }}>
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ flex: 1, textAlign: "center", fontFamily: '"Noto Serif Thai", serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A", mr: 4 }}>
            คำสั่งซื้อของฉัน
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Box sx={{ display: "flex", px: 2, py: 2, gap: 2, bgcolor: "#FFFFFF", borderBottom: "1px solid #E5DFD6" }}>
          <Box sx={{ flex: 1, textAlign: "center", borderRight: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: '"Playfair Display", "Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A" }}>{total}</Typography>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.75rem", color: "#6B7280" }}>ทั้งหมด</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", borderRight: "1px solid #E5DFD6" }}>
            <Typography sx={{ fontFamily: '"Playfair Display", "Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: "#D3A14A" }}>{inProgress}</Typography>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.75rem", color: "#6B7280" }}>กำลังดำเนินการ</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontFamily: '"Playfair Display", "Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: "#05A546" }}>{completed}</Typography>
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.75rem", color: "#6B7280" }}>เสร็จสิ้น</Typography>
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
                fontFamily: '"Noto Serif Thai", serif',
                minHeight: 40,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#9CA3AF"
              },
              "& .Mui-selected": { color: "#1B2A4A" },
              "& .MuiTabs-indicator": { bgcolor: "#1B2A4A" }
            }}
          >
            {filterTabs.map(tab => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </Box>

        {/* Orders List */}
        <Box sx={{ px: 2, pt: 2, pb: 10 }}>
          {loading ? (
            <Box>
              <Skeleton variant="rounded" height={160} sx={{ mb: 2, borderRadius: "16px" }} />
              <Skeleton variant="rounded" height={160} sx={{ mb: 2, borderRadius: "16px" }} />
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "1rem", fontWeight: 700, color: "#1B2A4A", mb: 1 }}>ยังไม่มีคำสั่งซื้อในสถานะนี้</Typography>
              <Button variant="outlined" onClick={() => router.push("/community")} sx={{ mt: 2, borderRadius: "20px", fontFamily: '"Noto Serif Thai", serif' }}>เริ่มช้อปปิ้ง</Button>
            </Box>
          ) : (
            filteredOrders.map(order => {
              const statusMeta = statusMapping[order.status] || statusMapping.pending;
              const date = new Date(order.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

              return (
                <Box key={order.id} sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", mb: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid #E5DFD6", overflow: "hidden" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderBottom: "1px solid #F3F4F6", bgcolor: "#FAFAFA" }}>
                    <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", color: "#6B7280" }}>
                      สั่งเมื่อ {date}
                    </Typography>
                    <Typography sx={{ px: 1.5, py: 0.3, borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, bgcolor: statusMeta.bgcolor, color: statusMeta.color }}>
                      {statusMeta.label}
                    </Typography>
                  </Box>

                  {/* Order Items Snapshot (Interactive wrapper linking to detail) */}
                  <Box sx={{ p: 1.5, cursor: "pointer" }} onClick={() => router.push(`/orders/${order.id}`)}>
                    {order.items.slice(0, 2).map((item, idx) => (
                      <Box key={item.id} sx={{ display: "flex", gap: 1.5, mb: idx === 1 ? 0 : 1.5 }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: "8px", overflow: "hidden", position: "relative", bgcolor: "#F0F0F0" }}>
                          <Image src={item.product.images[0]} alt="" fill style={{ objectFit: "cover" }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography noWrap sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, fontSize: "0.85rem", color: "#1B2A4A" }}>
                            {item.product.name}
                          </Typography>
                          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.75rem", color: "#6B7280", mt: 0.2 }}>
                            จำนวน: {item.quantity}
                          </Typography>
                          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "0.85rem", color: "#1B2A4A", mt: 0.5 }}>
                            ฿{item.priceAtPurchase.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    {order.items.length > 2 && (
                      <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", color: "#9CA3AF", mt: 1, textAlign: "center" }}>
                        ดูอีก {order.items.length - 2} รายการ...
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />

                  {/* Bottom Actions */}
                  <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#6B7280" }}>
                      ยอดรวม: <Box component="span" sx={{ fontWeight: 700, color: "#1B2A4A", fontSize: "1rem" }}>฿{order.totalPrice.toLocaleString()}</Box>
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      {order.status === "pending" && (
                        <Button size="small" variant="outlined" color="error" onClick={() => handleCancel(order.id)} sx={{ borderRadius: "8px", fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", minWidth: 80 }}>
                          ยกเลิกคำสั่งซื้อ
                        </Button>
                      )}
                      {order.status === "delivered" && (
                        <>
                          <Button size="small" variant="outlined" onClick={() => router.push(`/orders/${order.id}?review=true`)} sx={{ borderRadius: "8px", borderColor: "#C5A55A", color: "#C5A55A", fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem" }}>
                            รีวิว
                          </Button>
                          <Button size="small" variant="contained" onClick={() => handleReorder(order)} sx={{ borderRadius: "8px", bgcolor: "#1B2A4A", color: "#FFFFFF", fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem" }}>
                            ซื้อซ้ำ
                          </Button>
                        </>
                      )}
                    </Box>
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
    </MobileLayout>
  );
}
