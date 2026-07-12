"use client";

/**
 * จำนวนข้อความที่ยังไม่อ่าน — polling เบาๆ ทุก 60 วินาที เหมือน notification-context.tsx
 * (ยังไม่มี realtime push ในระบบนี้)
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { authFetch } from "./api-auth";

interface ChatContextType {
  unreadCount: number;
  refresh: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function ChatProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.access_token) { setUnreadCount(0); return; }
    try {
      const res = await authFetch(`${API_BASE}/api/chat/unread-count`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setUnreadCount(Number(data.count) || 0);
    } catch {
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  useEffect(() => { fetchUnreadCount(); }, [fetchUnreadCount]);

  useEffect(() => {
    if (!session?.access_token) return;
    const id = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(id);
  }, [session?.access_token, fetchUnreadCount]);

  return (
    <ChatContext.Provider value={{ unreadCount, refresh: fetchUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
