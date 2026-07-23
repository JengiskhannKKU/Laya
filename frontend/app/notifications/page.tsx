"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import NotificationList from "@/components/notifications/NotificationList";
import { useNotifications } from "@/lib/notification-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { unreadCount, markAllRead } = useNotifications();

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
        <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <NotificationList emptyText={t("notifications.emptyText")} maxWidth="100%" />
        </Box>
      </Box>
    </MobileLayout>
  );
}
