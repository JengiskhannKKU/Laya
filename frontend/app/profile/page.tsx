"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import Link from "next/link";
import { useAuth, UserRole } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";
import RoleGuard from "@/components/auth/RoleGuard";
import { useLanguage } from "@/lib/i18n/LanguageContext";


function MenuItem({ icon, label, subtitle, href, badge }: {
  icon: React.ReactNode; label: string; subtitle?: string; href?: string; badge?: number;
}) {
  const inner = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.8, cursor: "pointer", "&:active": { bgcolor: "rgba(0,0,0,0.02)" } }}>
      <Box sx={{ color: "#1B2A4A", position: "relative" }}>
        {icon}
        {badge != null && badge > 0 && (
          <Box sx={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", bgcolor: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: "0.55rem", fontWeight: 700, color: "#FFFFFF", fontFamily: '"Kanit", sans-serif' }}>{badge}</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#1B2A4A", fontWeight: 500 }}>
          {label}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#9CA3AF" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <ChevronRightRoundedIcon sx={{ color: "#D1D5DB", fontSize: 20 }} />
    </Box>
  );

  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
  return inner;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();

  return (
    <RoleGuard allowedRoles={["customer", "merchant", "admin"]}>
      <MobileLayout>
        <Box sx={{ px: 2, pt: 4, pb: 2 }}>
          {/* Profile Card */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ bgcolor: "#FFFFFF", borderRadius: 4, p: 3, mb: 2, border: "1px solid #E5DFD6", display: "flex", alignItems: "center", gap: 2 }}
          >
            <Avatar sx={{ width: 64, height: 64, bgcolor: "#1B2A4A", fontFamily: '"Kanit", sans-serif', fontSize: "1.5rem", fontWeight: 700 }}>
              {user?.name?.[0] ?? "U"}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A" }}>
                  {user?.name ?? t("profile.defaultUserName")}
                </Typography>
                <VerifiedRoundedIcon sx={{ fontSize: 16, color: "#C5A55A" }} />
              </Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>
                {user?.email ?? ""}
              </Typography>
            </Box>
            <Link href="/profile/edit">
              <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#F0EBE3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <EditRoundedIcon sx={{ fontSize: 18, color: "#1B2A4A" }} />
              </Box>
            </Link>
          </Box>

          {/* Stats */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 2 }}
          >
            {[
              { value: "5", label: t("profile.stats.orders") },
              { value: "2", label: t("profile.stats.certificates") },
              { value: "3", label: t("profile.stats.wishlist") },
            ].map((stat, i) => (
              <Box key={stat.label} component={motion.div} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.05 }}
                sx={{ bgcolor: "#FFFFFF", borderRadius: 3, p: 2, textAlign: "center", border: "1px solid #E5DFD6" }}
              >
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.4rem", color: "#C5A55A" }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#6B7280" }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Merchant shortcut */}
          {user?.role === "merchant" && (
            <Link href="/merchant" style={{ textDecoration: "none" }}>
              <Box component={motion.div} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                sx={{ bgcolor: "#1B2A4A", borderRadius: "14px", p: 2, mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <StoreRoundedIcon sx={{ color: "#C5A55A" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#FFFFFF", fontSize: "0.9rem" }}>{t("profile.merchantDashboard")}</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "rgba(255,255,255,0.55)" }}>{t("profile.merchantDashboardDesc")}</Typography>
                </Box>
                <ChevronRightRoundedIcon sx={{ color: "rgba(255,255,255,0.4)" }} />
              </Box>
            </Link>
          )}

          {/* Menu */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            sx={{ bgcolor: "#FFFFFF", borderRadius: 3, border: "1px solid #E5DFD6", overflow: "hidden", mb: 2 }}
          >
            <MenuItem icon={<ShoppingBagRoundedIcon sx={{ fontSize: 20 }} />} label={t("profile.menu.orderHistory")} href="/orders" />
            <Divider sx={{ borderColor: "#F0EBE3", mx: 2 }} />
            <MenuItem icon={<NotificationsRoundedIcon sx={{ fontSize: 20 }} />} label={t("profile.menu.notifications")} href="/notifications" badge={unreadCount} />
            <Divider sx={{ borderColor: "#F0EBE3", mx: 2 }} />
            <MenuItem icon={<StraightenRoundedIcon sx={{ fontSize: 20 }} />} label={t("profile.menu.measurements")} subtitle={t("profile.menu.measurementsSubtitle")} href="/profile/measurements" />
            <Divider sx={{ borderColor: "#F0EBE3", mx: 2 }} />
            <MenuItem icon={<FavoriteBorderRoundedIcon sx={{ fontSize: 20 }} />} label={t("profile.menu.wishlist")} href="/wishlist" />
            <Divider sx={{ borderColor: "#F0EBE3", mx: 2 }} />
            <MenuItem icon={<SettingsRoundedIcon sx={{ fontSize: 20 }} />} label={t("profile.menu.settings")} href="/settings" />
            <Divider sx={{ borderColor: "#F0EBE3", mx: 2 }} />
            <MenuItem icon={<HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />} label={t("profile.menu.help")} href="/help" />
          </Box>

          {/* Logout */}
          <Box onClick={logout} sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, py: 1.5, cursor: "pointer" }}>
            <LogoutRoundedIcon sx={{ fontSize: 18, color: "#EF4444" }} />
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#EF4444", fontWeight: 500 }}>
              {t("profile.logout")}
            </Typography>
          </Box>

        </Box>
      </MobileLayout>
    </RoleGuard>
  );
}
