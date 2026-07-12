"use client";

/**
 * กล่องแจ้งเตือนของร้านค้า (Notification Inbox) — ออเดอร์ใหม่ / การชำระเงิน / สต็อกใกล้หมด
 * ใช้ข้อมูลจาก NotificationProvider (โพลทุก 60 วิ) เหมือนฝั่งลูกค้า แต่ลิงก์พาไปหน้าฝั่งร้าน
 */

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useRouter } from "next/navigation";
import { useNotifications, type Notification } from "@/lib/notification-context";

const FONT = '"Kanit", sans-serif';

const TYPE_ICON: Record<Notification["type"], React.ReactNode> = {
  order: <ShoppingBagRoundedIcon sx={{ fontSize: 20, color: "#C5A55A" }} />,
  payment: <PaymentsRoundedIcon sx={{ fontSize: 20, color: "#4B7355" }} />,
  message: <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 20, color: "#1B2A4A" }} />,
  system: <InfoOutlinedIcon sx={{ fontSize: 20, color: "#6B7280" }} />,
  promo: <InfoOutlinedIcon sx={{ fontSize: 20, color: "#6B7280" }} />,
};

/** ปลายทางฝั่งร้านค้า — แจ้งเตือนออเดอร์/จ่ายเงินพาไปหน้าจัดการออเดอร์ */
function merchantHref(n: Notification): string | undefined {
  if (n.type === "message") return "/merchant/messages";
  if (n.type === "order" || n.type === "payment") return "/merchant/orders";
  return undefined;
}

export default function MerchantNotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  const handleOpen = (n: Notification) => {
    if (!n.read) markRead(n.id);
    const href = merchantHref(n);
    if (href) router.push(href);
  };

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

      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress size={30} sx={{ color: "#C5A55A" }} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <NotificationsNoneRoundedIcon sx={{ fontSize: 52, color: "#D1D5DB", mb: 1.5 }} />
          <Typography sx={{ fontFamily: FONT, color: "#9CA3AF" }}>
            ยังไม่มีการแจ้งเตือน — ออเดอร์ใหม่และการชำระเงินจะแสดงที่นี่
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
          {notifications.map((n) => (
            <Box
              key={n.id}
              onClick={() => handleOpen(n)}
              sx={{
                display: "flex", gap: 1.5, p: 2, borderRadius: "14px", cursor: merchantHref(n) || !n.read ? "pointer" : "default",
                bgcolor: n.read ? "#FFFFFF" : "#FDF8F0",
                border: n.read ? "1px solid #EFE9DD" : "1px solid #E8D9B8",
                transition: "all 0.15s",
                "&:hover": { boxShadow: "0 4px 14px rgba(27,42,74,0.07)" },
              }}
            >
              <Box sx={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                bgcolor: "#F5F1E8", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {TYPE_ICON[n.type]}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: n.read ? 500 : 700, fontSize: "0.9rem", color: "#1B2A4A", flex: 1 }}>
                    {n.title}
                  </Typography>
                  {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#C5A55A", flexShrink: 0 }} />}
                </Box>
                {n.body && (
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280", mt: 0.3, lineHeight: 1.6 }}>
                    {n.body}
                  </Typography>
                )}
                <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "#9CA3AF", mt: 0.5 }}>
                  {n.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
