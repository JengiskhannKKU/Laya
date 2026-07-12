"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import WavingHandRoundedIcon from "@mui/icons-material/WavingHandRounded";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

interface RecentActionOrder {
  id: string;
  kind: "order" | "weaving" | "product";
  status: string;
  createdAt: string;
  customerName: string;
}

interface ShopStats {
  productCount: number;
  activeProductCount: number;
  lowStockCount: number;
  orderCount: number;
  pendingActionCount: number;
  todaySales: number;
  monthSales: number;
  recentActionOrders: RecentActionOrder[];
}

const KIND_LABEL: Record<RecentActionOrder["kind"], string> = {
  order: "ตัดเย็บ",
  weaving: "สั่งทอ",
  product: "สินค้า",
};

const STATUS_LABEL: Record<string, { label: string; color: "warning" | "info" | "success" | "default" }> = {
  pending_confirm: { label: "รอยืนยัน", color: "warning" },
  confirmed: { label: "ยืนยันแล้ว", color: "info" },
  shipped: { label: "จัดส่งแล้ว", color: "success" },
  delivered: { label: "สำเร็จ", color: "default" },
};

export default function MerchantDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/api/shops/mine/stats`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const kpiData = stats ? [
    { label: "รายได้เดือนนี้", value: `฿${stats.monthSales.toLocaleString()}`, sub: `วันนี้ ฿${stats.todaySales.toLocaleString()}`, icon: <AccountBalanceWalletRoundedIcon />, color: "#C5A55A" },
    { label: "ออเดอร์รอดำเนินการ", value: String(stats.pendingActionCount), sub: `ทั้งหมด ${stats.orderCount} ออเดอร์`, icon: <ShoppingBagRoundedIcon />, color: "#3B82F6" },
    { label: "สินค้าใกล้หมด", value: String(stats.lowStockCount), sub: "ต้องเติมสต็อก", icon: <TrendingUpRoundedIcon />, color: "#EF4444" },
    { label: "สินค้าทั้งหมด", value: String(stats.productCount), sub: `เปิดขาย ${stats.activeProductCount}`, icon: <Inventory2RoundedIcon />, color: "#8B5CF6" },
  ] : [];

  return (
    <Box>
      {/* Greeting */}
      <Box component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.4rem", fontWeight: 700, color: "#1B2A4A", display: "flex", alignItems: "center", gap: 0.6 }}>
          สวัสดี, {user?.name ?? "ร้านค้า"} <WavingHandRoundedIcon sx={{ fontSize: "1.3rem", color: "#C5A55A" }} />
        </Typography>
        <Typography sx={{ fontFamily: FONT, color: "#6B7280", fontSize: "0.9rem" }}>
          สรุปภาพรวมร้านค้าของคุณ
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#C5A55A" }} />
        </Box>
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
            {kpiData.map((kpi, i) => (
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
                  </Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: "1.5rem", fontWeight: 700, color: "#1B2A4A" }}>
                    {kpi.value}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6B7280" }}>
                    {kpi.label}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", color: "#9CA3AF", mt: 0.25 }}>
                    {kpi.sub}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Orders needing action */}
          <Card
            component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            sx={{ borderRadius: "16px", border: "1px solid #E5DFD6", boxShadow: "none", mb: 3 }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FiberNewRoundedIcon sx={{ color: "#C5A55A", fontSize: 20 }} />
                  <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: "#1B2A4A" }}>
                    ออเดอร์ที่ต้องดำเนินการ
                  </Typography>
                </Box>
                <Button
                  component={Link} href="/merchant/orders" size="small"
                  sx={{ fontFamily: FONT, color: "#C5A55A", textTransform: "none", fontWeight: 600, fontSize: "0.8rem" }}
                >
                  ดูทั้งหมด →
                </Button>
              </Box>
              {stats.recentActionOrders.length === 0 ? (
                <Box sx={{ px: 2.5, py: 3, textAlign: "center" }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#9CA3AF" }}>
                    ไม่มีออเดอร์ที่ต้องดำเนินการตอนนี้
                  </Typography>
                </Box>
              ) : (
                stats.recentActionOrders.map((order) => (
                  <Box key={order.id} sx={{ px: 2.5, py: 2, borderTop: "1px solid #F0EBE3", display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.88rem", color: "#1B2A4A" }}>
                        #{order.id.slice(0, 8)} · {order.customerName}
                      </Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#6B7280" }}>
                        {KIND_LABEL[order.kind]}
                      </Typography>
                    </Box>
                    <Chip
                      label={STATUS_LABEL[order.status]?.label ?? order.status}
                      color={STATUS_LABEL[order.status]?.color ?? "default"}
                      size="small"
                      sx={{ fontFamily: FONT, fontSize: "0.68rem", height: 20 }}
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Quick Actions */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Button
          component={Link} href="/merchant/products/create" variant="contained"
          sx={{ py: 1.5, bgcolor: "#1B2A4A", borderRadius: "12px", fontFamily: FONT, fontWeight: 600, textTransform: "none" }}
        >
          + เพิ่มสินค้า
        </Button>
        <Button
          component={Link} href="/merchant/orders" variant="outlined"
          sx={{ py: 1.5, borderColor: "#1B2A4A", color: "#1B2A4A", borderRadius: "12px", fontFamily: FONT, fontWeight: 600, textTransform: "none" }}
        >
          จัดการออเดอร์
        </Button>
      </Box>
    </Box>
  );
}
