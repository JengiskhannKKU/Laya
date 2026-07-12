"use client";

import { useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface AdminStats {
  totalUsers: number; customers: number; merchants: number;
  totalShops: number; pendingShops: number; approvedShops: number;
  totalOrders: number; activeOrders: number; totalProducts: number;
  gmv: number; platformFees: number; gmvThisMonth: number;
}

interface AdminShop {
  id: string;
  name: string;
  province: string | null;
  status: string;
  ownerEmail: string;
  ownerName: string | null;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [pendingShops, setPendingShops] = useState<AdminShop[] | null>(null);
  const [shopsError, setShopsError] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/api/admin/stats`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "โหลดข้อมูลสรุปไม่สำเร็จ");
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setStatsError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดข้อมูลสรุปไม่สำเร็จ"));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loadPendingShops = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/shops`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดคิวอนุมัติไม่สำเร็จ");
      setPendingShops((data as AdminShop[]).filter((s) => s.status === "pending"));
    } catch (err) {
      setShopsError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดคิวอนุมัติไม่สำเร็จ"));
    }
  };

  useEffect(() => { loadPendingShops(); }, []);

  const handleShopStatus = async (id: string, status: "approved" | "rejected") => {
    setActioningId(id);
    try {
      const res = await authFetch(`${API_BASE}/api/shops/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "อัปเดตสถานะไม่สำเร็จ");
      }
      setPendingShops((prev) => (prev ?? []).filter((s) => s.id !== id));
    } catch (err) {
      setShopsError(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <AdminDashboardContent
      stats={stats}
      statsError={statsError}
      pendingShops={pendingShops}
      shopsError={shopsError}
      actioningId={actioningId}
      onShopStatus={handleShopStatus}
    />
  );
}

// ════════════════════════════════════════════════════════════════
// Dashboard Content
// ════════════════════════════════════════════════════════════════

const SectionTitle = ({ children, icon }: { children: string; icon: ReactNode }) => {
  const { c } = useAdminTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, mt: 1 }}>
      {icon}
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
        {children}
      </Typography>
    </Box>
  );
};

const CardTitle = ({ children, icon }: { children: string; icon?: ReactNode }) => {
  const { c } = useAdminTheme();
  return (
    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2, display: "flex", alignItems: "center", gap: 0.75 }}>
      {icon}{children}
    </Typography>
  );
};

function AdminDashboardContent({
  stats, statsError, pendingShops, shopsError, actioningId, onShopStatus,
}: {
  stats: AdminStats | null;
  statsError: string;
  pendingShops: AdminShop[] | null;
  shopsError: string;
  actioningId: string | null;
  onShopStatus: (id: string, status: "approved" | "rejected") => void;
}) {
  const { c } = useAdminTheme();
  const t = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: t };
  const cardAnim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  if (statsError) {
    return <Alert severity="error">{statsError}</Alert>;
  }
  if (!stats) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: c.gold }} /></Box>;
  }

  const kpis = [
    { label: "ผู้ใช้ทั้งหมด", value: stats.totalUsers.toLocaleString(), sub: `ลูกค้า ${stats.customers.toLocaleString()} • ร้านค้า ${stats.merchants.toLocaleString()}` },
    { label: "ร้านค้าทั้งหมด", value: stats.totalShops.toLocaleString(), sub: `รออนุมัติ ${stats.pendingShops.toLocaleString()} • อนุมัติแล้ว ${stats.approvedShops.toLocaleString()}` },
    { label: "คำสั่งซื้อทั้งหมด", value: stats.totalOrders.toLocaleString(), sub: `กำลังดำเนินการ ${stats.activeOrders.toLocaleString()}` },
    { label: "สินค้าทั้งหมด", value: stats.totalProducts.toLocaleString(), sub: "" },
  ];

  const revenue = [
    { label: "GMV ทั้งหมด", value: `฿${stats.gmv.toLocaleString()}`, color: c.gold },
    { label: "ค่าคอมมิชชั่นแพลตฟอร์ม", value: `฿${stats.platformFees.toLocaleString()}`, color: "#3B82F6" },
    { label: "รายรับสุทธิร้านค้า", value: `฿${(stats.gmv - stats.platformFees).toLocaleString()}`, color: "#22C55E" },
    { label: "GMV เดือนนี้", value: `฿${stats.gmvThisMonth.toLocaleString()}`, color: c.gold },
  ];

  return (
    <Box>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BUSINESS KPIs */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<GroupRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>ภาพรวมแพลตฟอร์ม</SectionTitle>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {kpis.map((kpi) => (
          <Box key={kpi.label} component={motion.div} {...cardAnim} sx={card}>
            <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, mb: 1 }}>{kpi.label}</Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.4rem", color: c.textPrimary, mb: 0.5 }}>{kpi.value}</Typography>
            {kpi.sub && <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>{kpi.sub}</Typography>}
          </Box>
        ))}
      </Box>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* REVENUE */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<AttachMoneyRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>รายรับ</SectionTitle>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {revenue.map((item) => (
          <Box key={item.label} component={motion.div} {...cardAnim} sx={card}>
            <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600, mb: 1 }}>{item.label}</Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.3rem", color: item.color }}>{item.value}</Typography>
          </Box>
        ))}
      </Box>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PENDING SHOPS QUEUE */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <SectionTitle icon={<StorefrontRoundedIcon sx={{ fontSize: 20, color: c.gold }} />}>ร้านค้ารออนุมัติ</SectionTitle>

      <Box sx={{ ...card, mb: 3 }}>
        {shopsError && <Alert severity="error" sx={{ mb: 2 }}>{shopsError}</Alert>}
        {pendingShops === null && !shopsError ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} sx={{ color: c.gold }} /></Box>
        ) : pendingShops && pendingShops.length === 0 ? (
          <Typography sx={{ fontSize: "0.85rem", color: c.textMuted, textAlign: "center", py: 3 }}>ไม่มีร้านค้ารออนุมัติในขณะนี้</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {pendingShops?.map((shop) => (
              <Box key={shop.id} component={motion.div} {...cardAnim}
                sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, py: 1.5, px: 1, borderBottom: `1px solid ${c.borderCard}`, "&:last-of-type": { borderBottom: "none" } }}>
                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{shop.name}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>{shop.ownerName ?? shop.ownerEmail} • {shop.province ?? "-"}</Typography>
                </Box>
                <Chip label="รออนุมัติ" size="small" sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "#F59E0B", fontWeight: 700, fontSize: "0.7rem" }} />
                <Button
                  size="small" startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                  disabled={actioningId === shop.id}
                  onClick={() => onShopStatus(shop.id, "approved")}
                  sx={{ color: "#22C55E", fontWeight: 700, fontSize: "0.75rem" }}
                >
                  อนุมัติ
                </Button>
                <Button
                  size="small" startIcon={<CancelRoundedIcon sx={{ fontSize: 16 }} />}
                  disabled={actioningId === shop.id}
                  onClick={() => onShopStatus(shop.id, "rejected")}
                  sx={{ color: "#EF4444", fontWeight: 700, fontSize: "0.75rem" }}
                >
                  ปฏิเสธ
                </Button>
              </Box>
            ))}
          </Box>
        )}
        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Link href="/admin/weavers" style={{ fontSize: "0.8rem", color: c.gold, fontWeight: 600, textDecoration: "none" }}>
            ดูร้านค้าทั้งหมด →
          </Link>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 1, opacity: 0.7 }}>
        <Inventory2RoundedIcon sx={{ fontSize: 16, color: c.textMuted }} />
        <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>
          ดูรายละเอียดคำสั่งซื้อ สินค้า และผู้ใช้ในหน้าเมนูด้านซ้าย
        </Typography>
      </Box>
    </Box>
  );
}
