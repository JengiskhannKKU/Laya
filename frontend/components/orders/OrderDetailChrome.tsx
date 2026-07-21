"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { useRouter } from "next/navigation";
import type { StatusLog } from "@/lib/orders";

const FONT = '"Kanit", sans-serif';

export function OrderDetailHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #E5DFD6" }}>
      <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
        <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>
      <Typography sx={{ flex: 1, textAlign: "center", fontFamily: FONT, fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A", mr: 4 }}>
        {title}
      </Typography>
    </Box>
  );
}

export function OrderStatusCard({ id, statusLabel, status, createdAt }: { id: string; statusLabel: string; status: string; createdAt: string }) {
  const isCancelled = status === "cancelled";
  const isDelivered = status === "delivered";
  const color = isCancelled ? "#D32F2F" : isDelivered ? "#05A546" : "#8E601C";
  const bgcolor = isCancelled ? "#FFEBEE" : isDelivered ? "#E8F5E9" : "#FDF8F0";

  return (
    <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2, mb: 2, border: "1px solid #E5DFD6" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem", color: "#1B2A4A" }}>
          #{id.slice(0, 8).toUpperCase()}
        </Typography>
        <Typography sx={{ px: 1.5, py: 0.3, borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, bgcolor, color }}>
          {statusLabel}
        </Typography>
      </Box>
      <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280" }}>
        สั่งซื้อเมื่อ {new Date(createdAt).toLocaleString("th-TH")}
      </Typography>
    </Box>
  );
}

export function OrderTimeline({ logs }: { logs: StatusLog[] }) {
  if (!logs.length) return null;
  return (
    <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2.5, mb: 2, border: "1px solid #E5DFD6" }}>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 2 }}>
        ความเคลื่อนไหว
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {logs.map((log, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#C5A55A", mt: 0.7, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#1B2A4A", fontWeight: 600 }}>
                {log.note || log.newStatus}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9CA3AF" }}>
                {new Date(log.createdAt).toLocaleString("th-TH")}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function CancelOrderButton({ onCancel, label = "ยกเลิกคำสั่งซื้อ" }: { onCancel: () => void; label?: string }) {
  return (
    <Button
      onClick={onCancel}
      fullWidth
      sx={{ py: 1.2, borderRadius: "12px", color: "#D32F2F", fontFamily: FONT, fontWeight: 600, border: "1px solid #FFCDD2" }}
    >
      {label}
    </Button>
  );
}

/** แสดงตอนลูกค้าส่งคำขอยกเลิกออเดอร์ที่จ่ายเงินแล้ว — รอร้านกดยินยอม/ไม่ยินยอมผ่าน LINE */
export function CancelRequestedBadge() {
  return (
    <Box sx={{
      py: 1.2, px: 1.5, borderRadius: "12px", bgcolor: "#FDF8F0", border: "1px solid #F0E4C8",
      textAlign: "center",
    }}>
      <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: "#8E601C" }}>
        ส่งคำขอยกเลิกแล้ว — รอร้านตอบกลับ
      </Typography>
    </Box>
  );
}
