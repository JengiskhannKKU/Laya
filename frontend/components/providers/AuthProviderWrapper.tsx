"use client";

import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";

export default function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  );
}
