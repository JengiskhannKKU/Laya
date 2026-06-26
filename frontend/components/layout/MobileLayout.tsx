"use client";

import { useEffect, useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import AppBottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";
import { useAuth } from "@/lib/auth-context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isDesktopMQ = useMediaQuery(theme.breakpoints.up("md"));
  const { user, openAuthModal } = useAuth();

  // Prevent hydration mismatch: only apply media-query result after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDesktop = mounted && isDesktopMQ;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#FAF6F0" }}>
      {/* Sidebar — only after mount to match server output */}
      {isDesktop && <SideNav />}

      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: "100%",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        {/* Bottom padding only on mobile */}
        <Box sx={{ pb: isDesktop ? 0 : "80px" }}>{children}</Box>

        {/* Auth promo bar */}
        {!user && (
          <Box
            sx={{
              position: "fixed",
              bottom: isDesktop ? 0 : 64,
              left: isDesktop ? 240 : 0,
              right: 0,
              bgcolor: "#1B2A4A",
              color: "#FFFFFF",
              px: { xs: 2.5, sm: 4 },
              py: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 1000,
              boxShadow: "0 -4px 12px rgba(27,42,74,0.15)",
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: { xs: "0.82rem", sm: "0.9rem" },
                fontWeight: 600,
              }}
            >
              เข้าสู่ระบบเพื่อรับสิทธิพิเศษ
            </Typography>
            <Button
              size="small"
              onClick={openAuthModal}
              sx={{
                bgcolor: "#C5A55A",
                color: "#FFFFFF",
                fontSize: "0.75rem",
                fontWeight: 700,
                borderRadius: "8px",
                px: 2,
                textTransform: "none",
                "&:hover": { bgcolor: "#b4954a" },
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </Box>
        )}

        {/* Bottom nav — hidden on desktop */}
        {!isDesktop && <AppBottomNav />}
      </Box>
    </Box>
  );
}
