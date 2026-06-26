"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AdminThemeProvider, useAdminTheme } from "@/lib/admin-theme-context";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

const navItems = [
  { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/admin" },
  { label: "Products", icon: <Inventory2RoundedIcon />, path: "/admin/products" },
  { label: "Orders", icon: <ShoppingCartRoundedIcon />, path: "/admin/orders" },
  { label: "Users", icon: <ManageAccountsRoundedIcon />, path: "/admin/users" },
  { label: "Weavers", icon: <PeopleRoundedIcon />, path: "/admin/weavers" },
  { label: "Analytics", icon: <DashboardRoundedIcon />, path: "/admin/analytics" },
  { label: "Marketing", icon: <CampaignRoundedIcon />, path: "/admin/marketing" },
  { label: "Moderation", icon: <ShieldRoundedIcon />, path: "/admin/moderation" },
  { label: "Settings", icon: <SettingsRoundedIcon />, path: "/admin/settings" },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mode, toggleMode, c } = useAdminTheme();
  const t = "all 0.3s ease";

  // Determine which nav item is active (support nested routes like /admin/products/create)
  const activeNav = navItems.find((item) =>
    item.path === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.path)
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: c.bgPage, transition: "background-color 0.3s ease" }}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* ── Sidebar ── */}
        <AnimatePresence>
          {(sidebarOpen || typeof window !== "undefined") && (
            <>
              {sidebarOpen && (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  sx={{ position: "fixed", inset: 0, bgcolor: c.sidebarOverlay, zIndex: 998, display: { md: "none" } }}
                />
              )}
              <Box
                component={motion.aside}
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                sx={{
                  width: 260,
                  bgcolor: c.bgSidebar,
                  display: { xs: sidebarOpen ? "flex" : "none", md: "flex" },
                  flexDirection: "column",
                  position: { xs: "fixed", md: "sticky" },
                  top: 0, left: 0, height: "100vh", zIndex: 999,
                  borderRight: `1px solid ${c.borderCard}`,
                  overflowY: "auto",
                  transition: t,
                }}
              >
                {/* Brand */}
                <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: "10px",
                      background: "linear-gradient(145deg, #C5A55A, #D4BA7A)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: "#FFFFFF" }}>L</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: c.textPrimary, letterSpacing: 2, transition: t }}>
                        LAYA
                      </Typography>
                      <Typography sx={{ fontSize: "0.6rem", color: c.textMuted, letterSpacing: 1, transition: t }}>
                        ADMIN PANEL
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={() => setSidebarOpen(false)} sx={{ color: c.textMuted, display: { md: "none" } }}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ borderColor: c.borderDivider, mx: 2 }} />

                {/* Nav Items */}
                <Box sx={{ px: 2, pt: 3, flex: 1 }}>
                  <Typography sx={{ px: 1, mb: 1.5, fontSize: "0.65rem", color: c.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", transition: t }}>
                    เมนูหลัก
                  </Typography>
                  {navItems.map((item) => {
                    const isActive = activeNav?.path === item.path;
                    return (
                      <Box
                        key={item.path}
                        component={motion.div}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { router.push(item.path); setSidebarOpen(false); }}
                        sx={{
                          display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.2, mb: 0.5,
                          borderRadius: "10px", cursor: "pointer",
                          bgcolor: isActive ? c.goldSubtle : "transparent",
                          color: isActive ? c.gold : c.textSecondary,
                          transition: t,
                          "&:hover": {
                            bgcolor: isActive ? c.goldSubtle : c.bgCardHover,
                            color: isActive ? c.gold : c.textPrimary,
                          },
                          "& .MuiSvgIcon-root": { fontSize: 20 },
                        }}
                      >
                        {item.icon}
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: isActive ? 700 : 500 }}>{item.label}</Typography>
                        {isActive && <Box sx={{ ml: "auto", width: 6, height: 6, borderRadius: "50%", bgcolor: c.gold }} />}
                      </Box>
                    );
                  })}
                </Box>

                {/* Bottom */}
                <Box sx={{ px: 2, pb: 3 }}>
                  <Divider sx={{ borderColor: c.borderDivider, mb: 2 }} />
                  <Box
                    onClick={() => router.push("/")}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, borderRadius: "10px",
                      cursor: "pointer", color: c.textMuted, transition: t,
                      "&:hover": { bgcolor: c.bgCardHover, color: c.textPrimary },
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                    }}
                  >
                    <HomeRoundedIcon />
                    <Typography sx={{ fontSize: "0.85rem" }}>กลับหน้าหลัก</Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </AnimatePresence>

        {/* ── Main ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* Top Bar */}
          <Box sx={{
            px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
            bgcolor: c.bgTopbar, borderBottom: `1px solid ${c.borderCard}`,
            position: "sticky", top: 0, zIndex: 50, transition: t,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={() => setSidebarOpen(true)} sx={{ color: c.textPrimary, display: { md: "none" } }}>
                <MenuRoundedIcon />
              </IconButton>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: c.textPrimary, transition: t }}>
                {activeNav?.label || "Admin"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"}>
                <IconButton
                  onClick={toggleMode}
                  sx={{
                    color: c.textSecondary, bgcolor: c.goldSubtle,
                    width: 36, height: 36, transition: t,
                    "&:hover": { bgcolor: c.gold, color: c.textOnGold },
                  }}
                >
                  {mode === "dark" ? <LightModeRoundedIcon sx={{ fontSize: 20 }} /> : <DarkModeRoundedIcon sx={{ fontSize: 20 }} />}
                </IconButton>
              </Tooltip>
              <IconButton sx={{ color: c.textSecondary }}>
                <NotificationsRoundedIcon sx={{ fontSize: 22 }} />
              </IconButton>
              <Avatar sx={{ width: 32, height: 32, bgcolor: c.gold, fontSize: "0.8rem", fontWeight: 700, color: c.textOnGold }}>A</Avatar>
            </Box>
          </Box>

          {/* Page Content */}
          <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <AdminShell>{children}</AdminShell>
    </AdminThemeProvider>
  );
}
