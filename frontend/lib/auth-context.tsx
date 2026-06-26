"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "customer" | "merchant" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  merchantId?: string; // only for merchants
}

export interface MerchantApplication {
  shopName: string;
  shopDescription: string;
  province: string;
  phone: string;
  lineId?: string;
  expertise: string[];
  bankAccount: string;
  bankName: string;
  idCardUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsRole: (role: UserRole) => void; // dev helper
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  registerMerchant: (data: MerchantApplication) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "laya_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email: string, pass: string) => {
    await new Promise((r) => setTimeout(r, 800));
    // Mock: admin@laya.com → admin, merchant@laya.com → merchant, else customer
    let role: UserRole = "customer";
    if (email.includes("admin")) role = "admin";
    else if (email.includes("merchant") || email.includes("shop")) role = "merchant";

    persist({
      id: "mock_" + Date.now(),
      email,
      name: email.split("@")[0],
      role,
      merchantId: role === "merchant" ? "shop_001" : undefined,
    });
  };

  // Dev helper: switch role without a real backend
  const loginAsRole = (role: UserRole) => {
    const mocks: Record<UserRole, User> = {
      customer: { id: "c1", email: "user@example.com", name: "สมชาย มั่นคง", role: "customer" },
      merchant: { id: "m1", email: "merchant@laya.com", name: "ร้านทอผ้าเชียงใหม่", role: "merchant", merchantId: "shop_001" },
      admin: { id: "a1", email: "admin@laya.com", name: "Admin LAYA", role: "admin" },
    };
    persist(mocks[role]);
  };

  const logout = () => {
    persist(null);
    router.push("/");
  };

  const openAuthModal = () => router.push("/auth/login");
  const closeAuthModal = () => {};

  const registerMerchant = async (data: MerchantApplication) => {
    await new Promise((r) => setTimeout(r, 1000));
    // In production: POST /api/merchant/apply
    console.log("Merchant application submitted:", data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsRole, logout, openAuthModal, closeAuthModal, registerMerchant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
