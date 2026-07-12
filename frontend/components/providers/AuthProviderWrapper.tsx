"use client";

import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import { ChatProvider } from "@/lib/chat-context";
import { WishlistProvider } from "@/lib/wishlist-context";

export default function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
