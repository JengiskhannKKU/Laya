"use client";
import { useEffect, useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import AppTopNav from "@/components/layout/TopNav";
import AppBottomNav from "@/components/layout/BottomNav";
import AppFooter from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth-context";

interface MobileLayoutProps {
  children: React.ReactNode;
  /** ซ่อน BottomNav บนมือถือ — ใช้เมื่อหน้านั้นมี action bar เฉพาะของตัวเองอยู่แล้ว (เช่น product detail) */
  hideBottomNav?: boolean;
}

export default function MobileLayout({ children, hideBottomNav = false }: MobileLayoutProps) {
  const theme = useTheme();
  const isMobileMQ = useMediaQuery(theme.breakpoints.down("md"));
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isMobile = !mounted || isMobileMQ;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAF6F0", overflowX: "hidden" }}>
      {/* Top Nav — always visible */}
      <AppTopNav />
      {/* Centered content container */}
      <Box
        component="main"
        sx={{
          maxWidth: 1440,
          width: "100%",
          mx: "auto",
          px: { xs: 2.5, sm: 3, md: 5 },
          pb: isMobile ? "96px" : "64px",
        }}
      >
        {children}
      </Box>
      {/* Site Footer — ซ่อนบนมือถือให้รู้สึกเหมือนแอป ไม่ใช่เว็บ */}
      {!isMobile && <AppFooter />}
      {/* Mobile bottom nav */}
      {isMobile && !hideBottomNav && <AppBottomNav />}
    </Box>
  );
}
