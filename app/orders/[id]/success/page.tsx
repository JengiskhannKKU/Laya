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
import { mockOrders, Order } from "@/lib/mock-data";

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real fetching logic based on param ID
    setTimeout(() => {
      const found = mockOrders.find(o => o.id === orderId) || mockOrders[0]; // fallback to mock_1001 if random
      setOrder(found);
      setLoading(false);
    }, 600);
  }, [orderId]);

  if (loading) {
    return (
      <MobileLayout>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
          <CircularProgress sx={{ color: "#1B2A4A" }} />
        </Box>
      </MobileLayout>
    );
  }

  // Delivery estimation text
  const shippingMethodName = order?.shippingMethod?.name || "Standard Delivery";
  const estimatedDays = order?.shippingMethod?.estimatedDays || "เร็วๆ นี้";

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh", alignItems: "center", justifyContent: "center", px: 4, py: 6 }}>
        
        <Box
          component={motion.div}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
          sx={{ mb: 4, display: "flex", justifyContent: "center" }}
        >
          <Box sx={{ width: 100, height: 100, borderRadius: "50%", bgcolor: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(5,165,70,0.15)" }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 60, color: "#05A546" }} />
          </Box>
        </Box>

        <Typography
          component={motion.h1}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.5rem", color: "#1B2A4A", textAlign: "center", mb: 1 }}
        >
          คำสั่งซื้อสำเร็จ!
        </Typography>

        <Typography
          component={motion.p}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          sx={{ fontFamily: '"Noto Serif Thai", serif', color: "#6B7280", textAlign: "center", mb: 4 }}
        >
          เราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว<br/>และกำลังดำเนินการจัดเตรียมสินค้า
        </Typography>

        <Box
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 3, width: "100%", border: "1px dashed #C5A55A", mb: 4, textAlign: "center" }}
        >
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#6B7280", mb: 0.5 }}>
            หมายเลขคำสั่งซื้อ
          </Typography>
          <Typography sx={{ fontFamily: '"Playfair Display", "Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A", mb: 2 }}>
            #{(order?.id || orderId).toUpperCase()}
          </Typography>
          
          <Divider sx={{ mb: 2, borderColor: "#F3F4F6" }} />

          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#6B7280", mb: 0.5 }}>
            การจัดส่งรับสินค้าผ่าน {shippingMethodName}
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 700 }}>
            ความรวดเร็วโดยประมาณ: {estimatedDays}
          </Typography>
        </Box>

        <Typography
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.8rem", color: "#9CA3AF", textAlign: "center", mb: 5 }}
        >
          ส่งใบยืนยันไปที่ {user?.email || "อีเมลของคุณ"} เรียบร้อยแล้ว
        </Typography>

        <Box
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push(`/orders/${order?.id || orderId}`)}
            sx={{
              py: 1.5,
              bgcolor: "#1B2A4A",
              color: "#FFFFFF",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "1rem",
              fontFamily: '"Noto Serif Thai", serif',
              "&:hover": { bgcolor: "#0F1A30" },
              boxShadow: "0 4px 10px rgba(27,42,74,0.15)"
            }}
          >
            ดูคำสั่งซื้อ
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => router.push("/")}
            sx={{
              py: 1.5,
              borderColor: "#E5DFD6",
              color: "#6B7280",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "1rem",
              fontFamily: '"Noto Serif Thai", serif',
              "&:hover": { bgcolor: "#FFFFFF", borderColor: "#C5A55A" }
            }}
          >
            ช้อปต่อ
          </Button>
        </Box>

      </Box>
    </MobileLayout>
  );
}
