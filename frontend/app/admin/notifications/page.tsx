"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { useAdminTheme } from "@/lib/admin-theme-context";
import { useNotifications, type Notification } from "@/lib/notification-context";
import NotificationList from "@/components/notifications/NotificationList";
import RoleGuard from "@/components/auth/RoleGuard";

const FONT = '"Kanit", sans-serif';

/** ปลายทางฝั่งแอดมิน — วันนี้มีแค่แจ้งเตือนคำขอถอนเงิน (type "system" จากฟีเจอร์ wallet) */
function adminHref(_n: Notification): string | undefined {
  return "/admin/withdrawals";
}

export default function AdminNotificationsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminNotificationsContent />
    </RoleGuard>
  );
}

function AdminNotificationsContent() {
  const { c } = useAdminTheme();
  const { unreadCount, markAllRead } = useNotifications();

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <NotificationsRoundedIcon sx={{ fontSize: 20, color: c.gold }} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.05rem", color: c.textPrimary }}>
            การแจ้งเตือน {unreadCount > 0 ? `(${unreadCount} ใหม่)` : ""}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button onClick={markAllRead} sx={{ fontFamily: FONT, color: c.gold, fontWeight: 600, textTransform: "none", fontSize: "0.82rem" }}>
            อ่านทั้งหมดแล้ว
          </Button>
        )}
      </Box>

      <NotificationList resolveHref={adminHref} emptyText="ยังไม่มีการแจ้งเตือน" maxWidth="100%" />
    </Box>
  );
}
