"use client";

import Box from "@mui/material/Box";
import AppBottomNav from "@/components/layout/BottomNav";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        maxWidth: 430,
        mx: "auto",
        minHeight: "100vh",
        bgcolor: "#FAF6F0",
        position: "relative",
        boxShadow: {
          xs: "none",
          sm: "0 0 40px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Box sx={{ pb: "80px" }}>{children}</Box>
      <AppBottomNav />
    </Box>
  );
}
