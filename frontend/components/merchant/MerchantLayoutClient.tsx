"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { useTheme, useMediaQuery } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import Badge from "@mui/material/Badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";
import { useNotifications } from "@/lib/notification-context";
import RoleGuard from "@/components/auth/RoleGuard";

const SIDEBAR_W = 240;

const NAV_ITEMS = [
  { label: "ภาพรวม", icon: <DashboardRoundedIcon />, href: "/merchant" },
  { label: "ออเดอร์", icon: <ShoppingBagRoundedIcon />, href: "/merchant/orders" },
  { label: "การแจ้งเตือน", icon: <NotificationsRoundedIcon />, href: "/merchant/notifications" },
  { label: "ข้อความ", icon: <ChatBubbleOutlineRoundedIcon />, href: "/merchant/messages" },
  { label: "สินค้า / ผ้า", icon: <InventoryRoundedIcon />, href: "/merchant/products" },
  { label: "ลายผ้า", icon: <AutoStoriesRoundedIcon />, href: "/merchant/patterns" },
  { label: "รายได้", icon: <AccountBalanceWalletRoundedIcon />, href: "/merchant/payouts" },
  { label: "รีวิว", icon: <StarRoundedIcon />, href: "/merchant/reviews" },
  { label: "ตั้งค่าร้าน", icon: <SettingsRoundedIcon />, href: "/merchant/settings" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();
  const { unreadCount: notifUnread } = useNotifications();

  const badgeSx = { "& .MuiBadge-badge": { bgcolor: "#C5A55A", color: "#1B2A4A", fontSize: "0.6rem", fontWeight: 700, minWidth: 15, height: 15 } };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#1B2A4A" }}>
      {/* Brand */}
      <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <StoreRoundedIcon sx={{ color: "#C5A55A", fontSize: 24 }} />
        <Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: "#FFFFFF" }}>
            {user?.name ?? "ร้านค้า"}
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
            Merchant Dashboard
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Nav */}
      <List sx={{ flex: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/merchant" ? pathname === "/merchant" : pathname.startsWith(item.href);
          return (
            <ListItem
              key={item.href} disablePadding
              component={Link} href={item.href}
              onClick={onClose}
              sx={{
                display: "block",
                mx: 1, mb: 0.5, borderRadius: "10px",
                bgcolor: isActive ? "rgba(197,165,90,0.15)" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                transition: "background 0.15s",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.4, gap: 1.5 }}>
                <Box sx={{ color: isActive ? "#C5A55A" : "rgba(255,255,255,0.55)", "& svg": { fontSize: 20 } }}>
                  {item.href === "/merchant/messages" && unreadCount > 0 ? (
                    <Badge badgeContent={unreadCount} sx={badgeSx}>{item.icon}</Badge>
                  ) : item.href === "/merchant/notifications" && notifUnread > 0 ? (
                    <Badge badgeContent={notifUnread} sx={badgeSx}>{item.icon}</Badge>
                  ) : item.icon}
                </Box>
                <Typography sx={{
                  fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem",
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                  fontWeight: isActive ? 600 : 400,
                }}>
                  {item.label}
                </Typography>
                {isActive && (
                  <Box sx={{ ml: "auto", width: 6, height: 6, borderRadius: "50%", bgcolor: "#C5A55A" }} />
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <Box
        sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.04)" } }}
        onClick={logout}
      >
        <LogoutRoundedIcon sx={{ color: "rgba(255,255,255,0.4)", fontSize: 20 }} />
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
          ออกจากระบบ
        </Typography>
      </Box>
    </Box>
  );
}

export default function MerchantLayoutClient({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktopMQ = useMediaQuery(theme.breakpoints.up("md"));
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { unreadCount: notifUnread } = useNotifications();
  useEffect(() => { setMounted(true); }, []);
  const isDesktop = mounted && isDesktopMQ;

  return (
    <RoleGuard allowedRoles={["merchant", "admin"]}>
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#FAF6F0" }}>
        {/* Desktop sidebar */}
        {isDesktop && (
          <Box sx={{ width: SIDEBAR_W, flexShrink: 0, position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100 }}>
            <SidebarContent />
          </Box>
        )}

        {/* Mobile drawer */}
        <Drawer
          open={drawerOpen} onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: SIDEBAR_W, border: "none" } }}
        >
          <SidebarContent onClose={() => setDrawerOpen(false)} />
        </Drawer>

        {/* Main */}
        <Box sx={{ flex: 1, ml: isDesktop ? `${SIDEBAR_W}px` : 0, minHeight: "100vh" }}>
          {/* Mobile topbar */}
          {!isDesktop && (
            <Box sx={{
              position: "sticky", top: 0, zIndex: 50,
              bgcolor: "#1B2A4A", px: 2, py: 1.5,
              display: "flex", alignItems: "center", gap: 1.5,
              boxShadow: "0 2px 8px rgba(27,42,74,0.2)",
            }}>
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#FFFFFF" }}>
                <MenuRoundedIcon />
              </IconButton>
              <StoreRoundedIcon sx={{ color: "#C5A55A" }} />
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#FFFFFF", flex: 1 }}>
                แดชบอร์ด
              </Typography>
              {/* กระดิ่งแจ้งเตือนออเดอร์/การชำระเงิน */}
              <IconButton component={Link} href="/merchant/notifications" sx={{ color: "#FFFFFF" }}>
                <Badge badgeContent={notifUnread} sx={{ "& .MuiBadge-badge": { bgcolor: "#C5A55A", color: "#1B2A4A", fontSize: "0.62rem", fontWeight: 700, minWidth: 16, height: 16 } }}>
                  <NotificationsRoundedIcon />
                </Badge>
              </IconButton>
            </Box>
          )}
          <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
        </Box>
      </Box>
    </RoleGuard>
  );
}
