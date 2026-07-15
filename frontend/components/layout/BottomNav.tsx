"use client";

import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { Home, Compass, Scissors, LayoutGrid, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AppBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const navItems = [
    { label: t("bottomNav.home"), icon: <Home size={22} strokeWidth={1.5} />, path: "/" },
    { label: t("bottomNav.community"), icon: <Compass size={22} strokeWidth={1.5} />, path: "/community" },
    { label: t("bottomNav.services"), icon: null, path: "/services" },
    { label: t("bottomNav.categories"), icon: <LayoutGrid size={22} strokeWidth={1.5} />, path: "/category" },
    { label: t("bottomNav.profile"), icon: <User size={22} strokeWidth={1.5} />, path: "/profile" },
  ];

  const currentIndex = navItems.findIndex(
    (item) => item.path === pathname || pathname.startsWith(item.path + "/")
  );
  const value = currentIndex >= 0 ? currentIndex : 0;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        width: "100%",
      }}
    >
      {/* Center FAB — raised 24px above bar */}
      <Box
        sx={{
          position: "absolute",
          top: -24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <Box
          component={motion.div}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push("/services")}
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #C5A55A 0%, #D4BA7A 50%, #C5A55A 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(197,165,90,0.40), 0 2px 6px rgba(0,0,0,0.15)",
            cursor: "pointer",
            border: "3px solid #FAF6F0",
          }}
        >
          <Scissors size={24} strokeWidth={1.5} color="#FFFFFF" />
        </Box>
      </Box>

      {/* Nav bar */}
      <Box
        sx={{
          bgcolor: "#1B2A4A",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          px: 1,
          pt: 1.2,
          pb: "16px",
          height: 72,
        }}
      >
        {navItems.map((item, index) => {
          const isActive = value === index;
          const isCenter = index === 2;

          if (isCenter) {
            return (
              <Box
                key={item.label}
                onClick={() => router.push(item.path)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: 64,
                  cursor: "pointer",
                  pb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Kanit", sans-serif',
                    fontSize: "10px",
                    color: isActive ? "#C5A55A" : "rgba(255,255,255,0.5)",
                    fontWeight: isActive ? 600 : 400,
                    mt: 0.5,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          }

          return (
            <Box
              key={item.label}
              component={motion.div}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push(item.path)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: "4px",
                width: 64,
                py: 0.5,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontSize: "10px",
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </Typography>
              {/* Active indicator dot */}
              {isActive && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -4,
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: "#C5A55A",
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
