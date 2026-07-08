"use client";

/**
 * แจ้งเตือนของจริง — ดึงจาก /api/notifications (backend/src/routes/notifications.ts)
 * แทนที่ MOCK_NOTIFICATIONS เดิมทั้งหมด รูปแบบ interface เดิมไว้ให้หน้า /notifications และ TopNav ใช้ต่อได้โดยไม่ต้องแก้
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { authFetch } from "./api-auth";

export type NotificationType = "order" | "payment" | "system" | "promo";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** ประเภทแจ้งเตือนจาก DB (notification_type enum) → หมวดที่ใช้เลือกไอคอนฝั่ง UI */
function mapType(dbType: string): NotificationType {
  if (dbType === "system") return "system";
  return "order"; // order_update, shop_confirm, shipment_update — ทั้งหมดเกี่ยวกับออเดอร์
}

/** เวลาแบบสัมพัทธ์ภาษาไทย (เพิ่งนี้ / น. ที่แล้ว / วันที่แล้ว) */
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "เมื่อสักครู่";
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "เมื่อวาน";
  if (day < 7) return `${day} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

/** สร้างลิงก์ปลายทางจาก data payload ที่ backend แนบมา (orderId/weavingOrderId/productOrderGroupId) */
function buildHref(data: Record<string, unknown> | null): string | undefined {
  if (!data) return undefined;
  if (data.productOrderGroupId) return `/orders/product/${data.productOrderGroupId}`;
  if (data.orderId) return `/orders/${data.orderId}`;
  if (data.weavingOrderId) return `/orders/${data.weavingOrderId}`;
  return "/orders";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!session?.access_token) { setNotifications([]); setLoading(false); return; }
    try {
      const res = await authFetch(`${API_BASE}/api/notifications`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setNotifications(
        (data as Record<string, unknown>[]).map((n) => ({
          id: n.id as string,
          type: mapType(n.type as string),
          title: n.title as string,
          body: (n.body as string) ?? "",
          time: relativeTime(n.created_at as string),
          read: n.is_read as boolean,
          href: buildHref(n.data as Record<string, unknown> | null),
        }))
      );
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // รีเฟรชเป็นระยะ (polling เบาๆ) — ยังไม่มี realtime push
  useEffect(() => {
    if (!session?.access_token) return;
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  }, [session?.access_token, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await authFetch(`${API_BASE}/api/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // เงียบไว้ — แค่ optimistic update ไม่ครบก็ไม่กระทบการใช้งานหลัก
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await authFetch(`${API_BASE}/api/notifications/read-all`, { method: "PATCH" });
    } catch {
      // เงียบไว้เช่นกัน
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markRead, markAllRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
