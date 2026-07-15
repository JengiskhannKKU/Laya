"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNotifications, NotificationType } from "@/lib/notification-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  order: { icon: <ShoppingBagRoundedIcon sx={{ fontSize: 20 }} />, color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  payment: { icon: <PaymentRoundedIcon sx={{ fontSize: 20 }} />, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  promo: { icon: <CampaignRoundedIcon sx={{ fontSize: 20 }} />, color: "#C5A55A", bg: "rgba(197,165,90,0.1)" },
  system: { icon: <InfoRoundedIcon sx={{ fontSize: 20 }} />, color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  message: { icon: <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 20 }} />, color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <MobileLayout>
      <Box sx={{ px: 2, pt: 3, pb: 3 }}>
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            bgcolor: "#FFFFFF", borderRadius: 4, border: "1px solid #E5DFD6",
            px: 2, py: 1.8, mb: 2,
            background: "linear-gradient(135deg, #FFFFFF 0%, rgba(197,165,90,0.06) 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <NotificationsRoundedIcon sx={{ color: "#C5A55A" }} />
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.15rem", color: "#1B2A4A" }}>
              {t("notifications.title")}
              {unreadCount > 0 && (
                <Box component="span" sx={{ ml: 1, bgcolor: "#EF4444", color: "#FFFFFF", borderRadius: "10px", px: 0.8, py: 0.1, fontSize: "0.72rem", fontWeight: 700 }}>
                  {unreadCount}
                </Box>
              )}
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button onClick={markAllRead} size="small" sx={{ fontFamily: '"Kanit", sans-serif', color: "#C5A55A", textTransform: "none", fontSize: "0.8rem", fontWeight: 600 }}>
              {t("notifications.markAllRead")}
            </Button>
          )}
        </Box>

        {/* List */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          sx={{ bgcolor: "#FFFFFF", borderRadius: 4, border: "1px solid #E5DFD6", overflow: "hidden" }}
        >
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={28} sx={{ color: "#C5A55A" }} />
            </Box>
          )}
          {!loading && notifications.length === 0 && (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <NotificationsRoundedIcon sx={{ fontSize: 56, color: "#E5DFD6", mb: 2 }} />
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#9CA3AF" }}>{t("notifications.emptyText")}</Typography>
            </Box>
          )}
          {notifications.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type];
            const inner = (
              <Box
                key={n.id}
                component={motion.div}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => markRead(n.id)}
                sx={{
                  display: "flex", gap: 2, px: 2.5, py: 2,
                  bgcolor: n.read ? "transparent" : "rgba(197,165,90,0.07)",
                  cursor: n.href ? "pointer" : "default",
                  "&:hover": { bgcolor: n.read ? "rgba(0,0,0,0.015)" : "rgba(197,165,90,0.1)" },
                  "&:active": { bgcolor: "rgba(0,0,0,0.03)" },
                  transition: "background 0.15s",
                  position: "relative",
                }}
              >
                {/* Unread dot */}
                {!n.read && (
                  <Box sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 6, height: 6, borderRadius: "50%", bgcolor: "#C5A55A" }} />
                )}
                {/* Icon */}
                <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {cfg.icon}
                </Box>
                {/* Content */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: n.read ? 500 : 700, fontSize: "0.88rem", color: "#1B2A4A", mb: 0.3 }}>
                    {n.title}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", color: "#6B7280", lineHeight: 1.5 }}>
                    {n.body}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#9CA3AF", mt: 0.5 }}>
                    {n.time}
                  </Typography>
                </Box>
              </Box>
            );

            return (
              <Box key={n.id}>
                {n.href ? <Link href={n.href} style={{ textDecoration: "none" }}>{inner}</Link> : inner}
                {i < notifications.length - 1 && <Divider sx={{ borderColor: "#F0EBE3", mx: 2 }} />}
              </Box>
            );
          })}
        </Box>
      </Box>
    </MobileLayout>
  );
}
