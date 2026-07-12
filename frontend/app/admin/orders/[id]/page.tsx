"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useAdminTheme } from "@/lib/admin-theme-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Kind = "cutting" | "weaving" | "product";

interface StatusLog {
  oldStatus: string | null;
  newStatus: string;
  note: string | null;
  createdAt: string;
}

interface OrderDetail {
  kind: Kind;
  displayId: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shopName: string | null;
  itemLabel: string;
  itemSubLabel: string;
  amount: number;
  trackingNo: string | null;
  courier: string | null;
  createdAt: string;
  statusLogs: StatusLog[];
  shippingAddress?: { recipientName?: string; phone?: string; addressLine1?: string; subdistrict?: string; district?: string; province?: string; postalCode?: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgcolor: string }> = {
  pending: { label: "รอยืนยัน", color: "#F59E0B", bgcolor: "rgba(245,158,11,0.15)" },
  confirmed: { label: "ยืนยันแล้ว", color: "#3B82F6", bgcolor: "rgba(59,130,246,0.15)" },
  in_progress: { label: "กำลังผลิต", color: "#8B5CF6", bgcolor: "rgba(139,92,246,0.15)" },
  ready: { label: "พร้อมจัดส่ง", color: "#06B6D4", bgcolor: "rgba(6,182,212,0.15)" },
  shipped: { label: "จัดส่งแล้ว", color: "#06B6D4", bgcolor: "rgba(6,182,212,0.15)" },
  delivered: { label: "สำเร็จ", color: "#22C55E", bgcolor: "rgba(34,197,94,0.15)" },
  cancelled: { label: "ยกเลิก", color: "#EF4444", bgcolor: "rgba(239,68,68,0.15)" },
};

const KIND_LABEL: Record<Kind, string> = { cutting: "ตัดผ้า", weaving: "ทอผ้า", product: "สินค้า" };

function toUIStatus(apiStatus: string): string {
  if (apiStatus === "pending_confirm" || apiStatus === "draft") return "pending";
  if (apiStatus === "weaving") return "in_progress";
  return apiStatus;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: tr };

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cutRes, weaveRes, productRes] = await Promise.all([
          authFetch(`${API_BASE}/api/orders/${id}`),
          authFetch(`${API_BASE}/api/weaving-orders/${id}`),
          authFetch(`${API_BASE}/api/product-orders/${id}`),
        ]);

        let detail: OrderDetail | null = null;
        if (cutRes.ok) {
          const o = await cutRes.json();
          detail = {
            kind: "cutting", displayId: `CUT-${String(o.id).slice(0, 8).toUpperCase()}`,
            status: toUIStatus(o.status), customerName: o.customerName, customerEmail: o.customerEmail, customerPhone: o.customerPhone,
            shopName: o.shopName, itemLabel: o.fabricName ?? "ออเดอร์ตัดเย็บ", itemSubLabel: o.fabricMetersUsed ? `${o.fabricMetersUsed} เมตร` : "",
            amount: Number(o.finalPrice ?? o.estimatedPrice ?? 0), trackingNo: o.trackingNo, courier: o.courier, createdAt: o.createdAt, statusLogs: o.statusLogs ?? [],
          };
        } else if (weaveRes.ok) {
          const o = await weaveRes.json();
          detail = {
            kind: "weaving", displayId: `WEV-${String(o.id).slice(0, 8).toUpperCase()}`,
            status: toUIStatus(o.status), customerName: o.customerName, customerEmail: o.customerEmail, customerPhone: o.customerPhone,
            shopName: o.shopName, itemLabel: `ทอผ้า${o.patternName ?? ""}`, itemSubLabel: `${o.metersRequested} เมตร${o.colorName ? ` · โทน${o.colorName}` : ""}`,
            amount: Number(o.finalPrice ?? o.estimatedPrice ?? 0), trackingNo: o.trackingNo, courier: o.courier, createdAt: o.createdAt, statusLogs: o.statusLogs ?? [],
          };
        } else if (productRes.ok) {
          const o = await productRes.json();
          const items = (o.items as { productName: string; quantity: number }[]) ?? [];
          detail = {
            kind: "product", displayId: `PRD-${String(o.id).slice(0, 8).toUpperCase()}`,
            status: toUIStatus(o.status), customerName: o.shippingAddress?.recipientName ?? null, customerEmail: null, customerPhone: o.shippingAddress?.phone ?? null,
            shopName: o.shopName, itemLabel: items.length ? `${items[0].productName}${items.length > 1 ? ` +${items.length - 1} รายการ` : ""}` : "สินค้า",
            itemSubLabel: `${items.length} รายการ`, amount: Number(o.total ?? 0), trackingNo: o.trackingNo, courier: o.courier, createdAt: o.createdAt,
            statusLogs: o.statusLogs ?? [], shippingAddress: o.shippingAddress,
          };
        }

        if (!detail) throw new Error("ไม่พบคำสั่งซื้อนี้");
        if (!cancelled) setOrder(detail);
      } catch (err) {
        if (!cancelled) setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดข้อมูลคำสั่งซื้อไม่สำเร็จ"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box sx={{
        px: 3, py: 2, display: "flex", alignItems: "center", gap: 2,
        bgcolor: c.bgTopbar, borderBottom: `1px solid ${c.borderCard}`,
        position: "sticky", top: 0, zIndex: 50, transition: tr,
      }}>
        <IconButton onClick={() => router.push("/admin/orders")} sx={{ color: c.textPrimary }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary }}>
          {order ? order.displayId : "รายละเอียดคำสั่งซื้อ"}
        </Typography>
        {order && (() => {
          const sts = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          return <Chip label={sts.label} size="small" sx={{ bgcolor: sts.bgcolor, color: sts.color, fontWeight: 700, fontSize: "0.75rem", height: 26, ml: 1 }} />;
        })()}
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 }, flex: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: c.gold }} /></Box>}

        {order && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" }, gap: 3, alignItems: "start" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Item */}
              <Box sx={card}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Inventory2RoundedIcon sx={{ color: c.gold }} />
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>รายการ</Typography>
                  <Chip label={KIND_LABEL[order.kind]} size="small" sx={{ ml: "auto", bgcolor: c.bgStatBox, color: c.textSecondary, fontSize: "0.7rem" }} />
                </Box>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>{order.itemLabel}</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary, mt: 0.5 }}>{order.itemSubLabel}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: c.textMuted, mt: 1 }}>ร้านค้า: {order.shopName ?? "-"}</Typography>
              </Box>

              {/* Customer */}
              <Box sx={card}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <PersonRoundedIcon sx={{ color: c.gold }} />
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>ลูกค้า</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: c.textPrimary }}>{order.customerName ?? "-"}</Typography>
                {order.customerPhone && (
                  <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, display: "flex", alignItems: "center", gap: 0.6, mt: 1 }}>
                    <PhoneRoundedIcon sx={{ fontSize: 14 }} /> {order.customerPhone}
                  </Typography>
                )}
                {order.customerEmail && (
                  <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, display: "flex", alignItems: "center", gap: 0.6, mt: 0.5 }}>
                    <EmailRoundedIcon sx={{ fontSize: 14 }} /> {order.customerEmail}
                  </Typography>
                )}
                {order.shippingAddress && (
                  <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, mt: 1 }}>
                    {order.shippingAddress.addressLine1} {order.shippingAddress.subdistrict} {order.shippingAddress.district} {order.shippingAddress.province} {order.shippingAddress.postalCode}
                  </Typography>
                )}
              </Box>

              {/* Timeline */}
              <Box sx={card}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <InfoRoundedIcon sx={{ color: c.gold }} />
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>ประวัติสถานะ</Typography>
                </Box>
                {order.statusLogs.length === 0 ? (
                  <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>ยังไม่มีการเปลี่ยนสถานะ</Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {order.statusLogs.map((log, i) => (
                      <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c.gold, mt: 0.7, flexShrink: 0 }} />
                        <Box>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>
                            {STATUS_CONFIG[toUIStatus(log.newStatus)]?.label ?? log.newStatus}
                            {log.note ? ` — ${log.note}` : ""}
                          </Typography>
                          <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>
                            {new Date(log.createdAt).toLocaleString("th-TH")}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, position: "sticky", top: 88 }}>
              {/* Shipping */}
              <Box sx={card}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <LocalShippingRoundedIcon sx={{ color: c.gold }} />
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>การจัดส่ง</Typography>
                </Box>
                {order.trackingNo ? (
                  <>
                    <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>ขนส่ง</Typography>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: c.textPrimary, mb: 1 }}>{order.courier ?? "-"}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>หมายเลขพัสดุ</Typography>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#3B82F6" }}>{order.trackingNo}</Typography>
                  </>
                ) : (
                  <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>ยังไม่มีข้อมูลการจัดส่ง</Typography>
                )}
              </Box>

              {/* Summary */}
              <Box sx={card}>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary, mb: 2 }}>สรุปยอด</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>สั่งเมื่อ</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, mb: 1.5 }}>{new Date(order.createdAt).toLocaleString("th-TH")}</Typography>
                <Divider sx={{ borderColor: c.borderDivider, mb: 1.5 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: c.textPrimary }}>ยอดรวม</Typography>
                  <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: c.gold }}>฿{order.amount.toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
