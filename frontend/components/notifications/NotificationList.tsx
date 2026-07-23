"use client";

/**
 * รายการแจ้งเตือน — ใช้ร่วมกันทุก role (ลูกค้า/ร้านค้า/แอดมิน) ผ่าน NotificationProvider เดียวกัน
 * (backend /api/notifications ผูกกับ user_id ไม่ผูก role จึงใช้ hook เดิมได้ทุกที่)
 *
 * ไม่อ่าน: การ์ดพื้นขาว มีจุดทองข้างชื่อเรื่อง
 * อ่านแล้ว: จางลง (ไม่มีการ์ดยกขึ้น, ตัวหนังสือจางลง) ไม่มีจุด
 */

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import Link from "next/link";
import { motion } from "framer-motion";
import { useNotifications, type Notification, type NotificationType } from "@/lib/notification-context";

const FONT = '"Kanit", sans-serif';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  order: { icon: <ShoppingBagRoundedIcon sx={{ fontSize: 20 }} />, color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  payment: { icon: <PaymentsRoundedIcon sx={{ fontSize: 20 }} />, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  promo: { icon: <CampaignRoundedIcon sx={{ fontSize: 20 }} />, color: "#C5A55A", bg: "rgba(197,165,90,0.1)" },
  system: { icon: <InfoRoundedIcon sx={{ fontSize: 20 }} />, color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  message: { icon: <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 20 }} />, color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
};

export interface NotificationListProps {
  /** ปลายทางเมื่อกดแจ้งเตือน — ถ้าไม่ระบุ ใช้ n.href ที่มากับ context (ปลายทางฝั่งลูกค้า) */
  resolveHref?: (n: Notification) => string | undefined;
  emptyText?: string;
  maxWidth?: number | string;
}

export default function NotificationList({
  resolveHref,
  emptyText = "ยังไม่มีการแจ้งเตือน",
  maxWidth = 760,
}: NotificationListProps) {
  const { notifications, loading, markRead } = useNotifications();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} sx={{ color: "#C5A55A" }} />
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <NotificationsRoundedIcon sx={{ fontSize: 52, color: "#E5DFD6", mb: 1.5 }} />
        <Typography sx={{ fontFamily: FONT, color: "#9CA3AF", fontSize: "0.88rem" }}>{emptyText}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth, width: "100%", mx: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
      {notifications.map((n, i) => {
        const cfg = TYPE_CONFIG[n.type];
        const href = resolveHref ? resolveHref(n) : n.href;

        const row = (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.03 }}
            onClick={() => { if (!n.read) markRead(n.id); }}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              p: 2,
              borderRadius: "14px",
              cursor: href || !n.read ? "pointer" : "default",
              bgcolor: n.read ? "transparent" : "#FFFFFF",
              border: n.read ? "1px solid transparent" : "1px solid #E5DFD6",
              boxShadow: n.read ? "none" : "0 2px 10px rgba(27,42,74,0.06)",
              transition: "all 0.15s",
              "&:hover": {
                bgcolor: n.read ? "rgba(0,0,0,0.02)" : "#FFFFFF",
                boxShadow: n.read ? "none" : "0 4px 14px rgba(27,42,74,0.09)",
              },
            }}
          >
            <Box sx={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              bgcolor: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center",
              opacity: n.read ? 0.55 : 1,
            }}>
              {cfg.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  noWrap
                  sx={{
                    fontFamily: FONT, fontSize: "0.88rem", flex: 1, minWidth: 0,
                    fontWeight: n.read ? 500 : 700,
                    color: n.read ? "#9CA3AF" : "#1B2A4A",
                  }}
                >
                  {n.title}
                </Typography>
                {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#C5A55A", flexShrink: 0 }} />}
              </Box>
              {n.body && (
                <Typography
                  sx={{
                    fontFamily: FONT, fontSize: "0.8rem", mt: 0.3, lineHeight: 1.5,
                    color: n.read ? "#B5B5B5" : "#6B7280",
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}
                >
                  {n.body}
                </Typography>
              )}
              <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "#9CA3AF", mt: 0.5 }}>
                {n.time}
              </Typography>
            </Box>
          </Box>
        );

        return (
          <Box key={n.id}>
            {href ? <Link href={href} style={{ textDecoration: "none" }}>{row}</Link> : row}
          </Box>
        );
      })}
    </Box>
  );
}
