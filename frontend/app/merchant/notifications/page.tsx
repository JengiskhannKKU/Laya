"use client";

/**
 * กล่องแจ้งเตือนของร้านค้า (Notification Inbox) — ออเดอร์ใหม่ / การชำระเงิน / สต็อกใกล้หมด
 * ใช้ข้อมูลจาก NotificationProvider (โพลทุก 60 วิ) เหมือนฝั่งลูกค้า แต่ลิงก์พาไปหน้าฝั่งร้าน
 */

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NotificationList from "@/components/notifications/NotificationList";
import { useNotifications, type Notification } from "@/lib/notification-context";

const FONT = '"Kanit", sans-serif';

/** ปลายทางฝั่งร้านค้า — แจ้งเตือนออเดอร์/จ่ายเงินพาไปหน้าจัดการออเดอร์ */
function merchantHref(n: Notification): string | undefined {
  if (n.type === "message") return "/merchant/messages";
  if (n.type === "order" || n.type === "payment") return "/merchant/orders";
  return undefined;
}

export default function MerchantNotificationsPage() {
  const { unreadCount, markAllRead } = useNotifications();

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A" }}>
          การแจ้งเตือน {unreadCount > 0 ? `(${unreadCount} ใหม่)` : ""}
        </Typography>
        {unreadCount > 0 && (
          <Button onClick={markAllRead} sx={{ fontFamily: FONT, color: "#C5A55A", fontWeight: 600, textTransform: "none", fontSize: "0.82rem" }}>
            อ่านทั้งหมดแล้ว
          </Button>
        )}
      </Box>

      <NotificationList
        resolveHref={merchantHref}
        emptyText="ยังไม่มีการแจ้งเตือน — ออเดอร์ใหม่และการชำระเงินจะแสดงที่นี่"
        maxWidth="100%"
      />
    </Box>
  );
}
