"use client";

import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import { WishlistProvider } from "@/lib/wishlist-context";

export default function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
