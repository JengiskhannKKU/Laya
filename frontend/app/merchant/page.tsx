"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import WavingHandRoundedIcon from "@mui/icons-material/WavingHandRounded";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const KPI_DATA = [
  { label: "รายได้เดือนนี้", value: "฿32,400", delta: "+12%", icon: <AccountBalanceWalletRoundedIcon />, color: "#C5A55A" },
  { label: "ออเดอร์ใหม่", value: "8", delta: "+3", icon: <ShoppingBagRoundedIcon />, color: "#3B82F6" },
  { label: "ผู้เยี่ยมชม", value: "142", delta: "+28%", icon: <PeopleRoundedIcon />, color: "#10B981" },
  { label: "สินค้าทั้งหมด", value: "24", delta: "active", icon: <TrendingUpRoundedIcon />, color: "#8B5CF6" },
];

const RECENT_ORDERS = [
  { id: "ORD-1042", customer: "สมชาย ใจดี", product: "ผ้าไหมมัดหมี่", amount: 3200, status: "pending" },
  { id: "ORD-1041", customer: "มาลี สวย", product: "ผ้าขิดลายดอก", amount: 1800, status: "confirmed" },
  { id: "ORD-1040", customer: "อนันต์ รัก", product: "ผ้าทอมือลายน้ำ", amount: 4500, status: "shipped" },
];

const STATUS_LABEL: Record<string, { label: string; color: "warning" | "info" | "success" | "default" }> = {
  pending: { label: "รอยืนยัน", color: "warning" },
  confirmed: { label: "ยืนยันแล้ว", color: "info" },
  shipped: { label: "จัดส่งแล้ว", color: "success" },
  delivered: { label: "สำเร็จ", color: "default" },
};

export default function MerchantDashboardPage() {
  const { user } = useAuth();

  return (
    <Box>
      {/* Greeting */}
      <Box component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.4rem", fontWeight: 700, color: "#1B2A4A", display: "flex", alignItems: "center", gap: 0.6 }}>
          สวัสดี, {user?.name ?? "ร้านค้า"} <WavingHandRoundedIcon sx={{ fontSize: "1.3rem", color: "#C5A55A" }} />
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.9rem" }}>
          สรุปภาพรวมร้านค้าของคุณ
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {KPI_DATA.map((kpi, i) => (
          <Card
            key={kpi.label}
            component={motion.div}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            sx={{ borderRadius: "16px", border: "1px solid #E5DFD6", boxShadow: "none" }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${kpi.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color, "& svg": { fontSize: 22 } }}>
                  {kpi.icon}
                </Box>
                <Chip label={kpi.delta} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", bgcolor: "rgba(16,185,129,0.1)", color: "#059669", height: 20 }} />
              </Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.5rem", fontWeight: 700, color: "#1B2A4A" }}>
                {kpi.value}
              </Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>
                {kpi.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Recent Orders */}
      <Card
        component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        sx={{ borderRadius: "16px", border: "1px solid #E5DFD6", boxShadow: "none", mb: 3 }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 2.5, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FiberNewRoundedIcon sx={{ color: "#C5A55A", fontSize: 20 }} />
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A" }}>
                ออเดอร์ล่าสุด
              </Typography>
            </Box>
            <Button
              component={Link} href="/merchant/orders" size="small"
              sx={{ fontFamily: '"Kanit", sans-serif', color: "#C5A55A", textTransform: "none", fontWeight: 600, fontSize: "0.8rem" }}
            >
              ดูทั้งหมด →
            </Button>
          </Box>
          {RECENT_ORDERS.map((order, i) => (
            <Box key={order.id} sx={{ px: 2.5, py: 2, borderTop: "1px solid #F0EBE3", display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.88rem", color: "#1B2A4A" }}>
                  {order.id} · {order.customer}
                </Typography>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", color: "#6B7280" }}>
                  {order.product}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: "#1B2A4A" }}>
                  ฿{order.amount.toLocaleString()}
                </Typography>
                <Chip
                  label={STATUS_LABEL[order.status]?.label}
                  color={STATUS_LABEL[order.status]?.color}
                  size="small"
                  sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.68rem", height: 20, mt: 0.5 }}
                />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Button
          component={Link} href="/merchant/products/create" variant="contained"
          sx={{ py: 1.5, bgcolor: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
        >
          + เพิ่มสินค้า
        </Button>
        <Button
          component={Link} href="/merchant/orders" variant="outlined"
          sx={{ py: 1.5, borderColor: "#1B2A4A", color: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
        >
          จัดการออเดอร์
        </Button>
      </Box>
    </Box>
  );
}
