"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "read" | "time">) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "order", title: "ออเดอร์ได้รับการยืนยัน", body: "ORD-1042 ร้านทอผ้าเชียงใหม่ยืนยันออเดอร์ของคุณแล้ว", time: "5 นาทีที่แล้ว", read: false, href: "/orders" },
  { id: "n2", type: "order", title: "จัดส่งพัสดุแล้ว", body: "ORD-1040 เลขพัสดุ TH123456789", time: "2 ชั่วโมงที่แล้ว", read: false, href: "/orders" },
  { id: "n3", type: "payment", title: "ชำระเงินสำเร็จ", body: "ออเดอร์ ORD-1041 ฿1,800 ชำระเงินแล้ว", time: "เมื่อวาน", read: true, href: "/orders" },
  { id: "n4", type: "promo", title: "โปรโมชั่นพิเศษ!", body: "ลด 15% สำหรับผ้าไหมทุกประเภท ถึง 30 มิ.ย. นี้เท่านั้น", time: "2 วันที่แล้ว", read: true },
  { id: "n5", type: "system", title: "ยินดีต้อนรับสู่ LAYA", body: "เริ่มต้นค้นหาผ้าไทยแท้จากชุมชนทั่วประเทศ", time: "1 สัปดาห์ที่แล้ว", read: true },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (n: Omit<Notification, "id" | "read" | "time">) => {
    setNotifications((prev) => [{
      ...n, id: `n_${Date.now()}`, read: false, time: "เดี๋ยวนี้",
    }, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
