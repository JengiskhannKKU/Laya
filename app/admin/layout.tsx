"use client";

import Box from "@mui/material/Box";
import { AdminThemeProvider, useAdminTheme } from "@/lib/admin-theme-context";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { c } = useAdminTheme();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: c.bgPage,
        transition: "background-color 0.3s ease",
      }}
    >
      {children}
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
