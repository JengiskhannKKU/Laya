"use client";
import { useEffect, useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import AppTopNav from "@/components/layout/TopNav";
import AppBottomNav from "@/components/layout/BottomNav";
import { useAuth } from "@/lib/auth-context";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
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
      {/* Mobile bottom nav */}
      {isMobile && <AppBottomNav />}
    </Box>
  );
}
