"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { useParams, useRouter } from "next/navigation";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MobileLayout from "@/components/layout/MobileLayout";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface GroupOrderItem {
  id: string;
  productName: string;
  quantity: number;
  subtotal: number;
}
interface GroupOrder {
  id: string;
  shopName: string;
  status: string;
  total: number;
  items: GroupOrderItem[];
}
interface OrderGroup {
  id: string;
  recipientName: string;
  addressLine1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  orders: GroupOrder[];
}

export default function ProductOrderSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const groupId = params?.groupId as string;

  const [group, setGroup] = useState<OrderGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`${API_BASE}/api/product-orders/group/${groupId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "ไม่พบออเดอร์");
        setGroup(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "โหลดออเดอร์ไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [groupId, session?.access_token]);

  if (loading) {
    return (
      <MobileLayout>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
          <CircularProgress sx={{ color: "#1B2A4A" }} />
        </Box>
      </MobileLayout>
    );
  }

  if (error || !group) {
    return (
      <MobileLayout>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#FAF6F0", minHeight: "100vh", gap: 2, px: 4 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280" }}>{error || "ไม่พบออเดอร์"}</Typography>
          <Button onClick={() => router.push("/orders")} sx={{ fontFamily: '"Kanit", sans-serif', color: "#1B2A4A", fontWeight: 700 }}>ดูออเดอร์ของฉัน</Button>
        </Box>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh", alignItems: "center", px: 3, py: 6 }}>
        <Box
          component={motion.div}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
          sx={{ mb: 3 }}
        >
          <Box sx={{ width: 100, height: 100, borderRadius: "50%", bgcolor: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(5,165,70,0.15)" }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 60, color: "#05A546" }} />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", textAlign: "center", mb: 1 }}>
          สั่งซื้อสำเร็จ
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.9rem", textAlign: "center", mb: 4 }}>
          ชำระเงินแล้ว — ร้านค้าจะยืนยันและจัดส่งสินค้าเร็วๆ นี้
        </Typography>

        <Box sx={{ width: "100%", maxWidth: 420, bgcolor: "#FFFFFF", borderRadius: "16px", p: 2.5, border: "1px solid #E5DFD6", mb: 3 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: "#1B2A4A", mb: 1.5 }}>
            จัดส่งไปที่
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#374151" }}>{group.recipientName}</Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>
            {group.addressLine1} {group.subdistrict} {group.district} {group.province} {group.postalCode}
          </Typography>
        </Box>

        {group.orders.map((order) => (
          <Box key={order.id} sx={{ width: "100%", maxWidth: 420, bgcolor: "#FFFFFF", borderRadius: "16px", p: 2.5, border: "1px solid #E5DFD6", mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: "#1B2A4A" }}>
                ร้าน: {order.shopName}
              </Typography>
              <Box sx={{ bgcolor: "#FDF8F0", color: "#92652A", px: 1.2, py: 0.3, borderRadius: "8px", fontSize: "0.7rem", fontFamily: '"Kanit", sans-serif', fontWeight: 700 }}>
                รอร้านยืนยัน
              </Box>
            </Box>
            {order.items.map((item) => (
              <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>
                  {item.productName} × {item.quantity}
                </Typography>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#1B2A4A", fontWeight: 600 }}>
                  ฿{item.subtotal.toLocaleString()}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1, borderColor: "rgba(0,0,0,0.06)" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", fontWeight: 700, color: "#1B2A4A" }}>รวม</Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", fontWeight: 700, color: "#C5A55A" }}>฿{order.total.toLocaleString()}</Typography>
            </Box>
          </Box>
        ))}

        <Box sx={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
          <Button
            variant="contained" onClick={() => router.push("/orders")}
            sx={{ py: 1.4, bgcolor: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none" }}
          >
            ดูสถานะออเดอร์
          </Button>
          <Button variant="text" onClick={() => router.push("/")} sx={{ fontFamily: '"Kanit", sans-serif', color: "#9CA3AF", textTransform: "none" }}>
            กลับหน้าหลัก
          </Button>
        </Box>
      </Box>
    </MobileLayout>
  );
}
