"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-context";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      const fallback = redirectTo ?? (user.role === "admin" ? "/admin" : user.role === "merchant" ? "/merchant" : "/");
      router.replace(fallback);
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "#FAF6F0" }}>
        <CircularProgress sx={{ color: "#C5A55A" }} />
      </Box>
    );
  }

  return <>{children}</>;
}
