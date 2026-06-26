"use client";

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
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { user, openAuthModal } = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#FAF6F0",
      }}
    >
      {/* Sidebar for desktop */}
      {isDesktop && <SideNav />}

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          maxWidth: "100%",
          mx: "auto",
          width: "100%",
          position: "relative",
          boxShadow: isDesktop ? "none" : {
            xs: "none",
            sm: "0 0 40px rgba(0,0,0,0.08)",
          },
        }}
      >
        <Box sx={{ pb: isDesktop ? 0 : "80px" }}>{children}</Box>
        
        {!user && (
          <Box
            sx={{
              position: "fixed",
              bottom: isDesktop ? 0 : 64,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "100%",
              bgcolor: "#1B2A4A",
              color: "#FFFFFF",
              px: 2.5,
              py: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 1000,
              boxShadow: "0 -4px 12px rgba(27,42,74,0.15)",
            }}
          >
            <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", fontWeight: 600 }}>
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
              Login
            </Button>
          </Box>
        )}

        {!isDesktop && <AppBottomNav />}
      </Box>
    </Box>
  );
}
