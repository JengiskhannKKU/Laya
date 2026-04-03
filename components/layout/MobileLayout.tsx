"use client";

import { useTheme, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import AppBottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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
          maxWidth: isDesktop ? "none" : 430,
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
        {!isDesktop && <AppBottomNav />}
      </Box>
    </Box>
  );
}
