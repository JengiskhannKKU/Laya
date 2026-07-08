"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "customer" | "merchant" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  shopId?: string;
  shopStatus?: string;
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
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  registerMerchant: (data: MerchantApplication) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function apiFetch(path: string, token: string | null, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

/**
 * Map GET /api/auth/me response into our User shape.
 * backend/src/routes/auth.ts ส่ง camelCase มาแล้วพร้อมคำนวณ role ให้เสร็จ
 * (เดิมโค้ดนี้อ่าน profile.shop_id/avatar_url/display_name แบบ snake_case ที่ไม่มีจริง
 * ทำให้ merchant ทุกคนถูกจัดเป็น "customer" เสมอ — แก้ให้ตรงกับ response จริง)
 */
function buildUser(supabaseUser: { id: string; email?: string }, profile: Record<string, unknown>): User {
  const role = (profile.role as UserRole) ?? "customer";

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name: (profile.name as string) ?? supabaseUser.email?.split("@")[0] ?? "User",
    role,
    avatar: (profile.avatar as string) ?? undefined,
    shopId: (profile.shopId as string) ?? undefined,
    shopStatus: (profile.shopStatus as string) ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // กัน onAuthStateChange ยิงซ้ำ (sync+fetchProfile) เมื่อ access_token เดิม —
  // Supabase JS ยิง event ซ้ำได้จากหลายจุด (visibility change, หลาย tab, ฯลฯ)
  // ถ้าไม่กันไว้ sync/me จะถูกเรียกรัวไม่จบเป็นร้อยครั้งต่อวินาที
  const processedTokenRef = useRef<string | null>(null);

  /** Fetch our custom profile from backend /api/auth/me */
  const fetchProfile = async (accessToken: string, supabaseUser: { id: string; email?: string }) => {
    try {
      const profile = await apiFetch("/api/auth/me", accessToken);
      setUser(buildUser(supabaseUser, profile));
    } catch {
      // Fallback: build minimal user from Supabase data only
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
        name: supabaseUser.email?.split("@")[0] ?? "User",
        role: "customer",
      });
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        processedTokenRef.current = s.access_token;
        fetchProfile(s.access_token, s.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (login, logout, OAuth callback, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (s?.user) {
        // token เดิมที่เพิ่งประมวลผลไปแล้ว — ข้าม ไม่ต้องยิง sync/me ซ้ำ
        if (processedTokenRef.current === s.access_token) return;
        processedTokenRef.current = s.access_token;

        if (event === "SIGNED_IN") {
          // Upsert into public.users on every sign-in (idempotent).
          // Covers OAuth users in case the /auth/callback sync failed.
          const meta = s.user.user_metadata ?? {};
          apiFetch("/api/auth/sync", s.access_token, {
            method: "POST",
            body: JSON.stringify({
              display_name: meta.full_name ?? meta.name ?? s.user.email?.split("@")[0],
              avatar_url:   meta.avatar_url ?? meta.picture ?? null,
            }),
          })
            .catch(() => {})
            .finally(() => fetchProfile(s.access_token, s.user));
        } else {
          fetchProfile(s.access_token, s.user);
        }
      } else {
        processedTokenRef.current = null;
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // onAuthStateChange will fire and call fetchProfile
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw new Error(error.message);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, phone: phone ?? "" },
      },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("สมัครสมาชิกไม่สำเร็จ");
    // Sync profile to public.users via backend
    if (data.session) {
      await apiFetch("/api/auth/sync", data.session.access_token, {
        method: "POST",
        body: JSON.stringify({ display_name: name, phone }),
      });
    }
  };

  const loginAsRole = (role: UserRole) => {
    const mocks: Record<UserRole, User> = {
      customer: { id: "c1", email: "user@example.com",   name: "สมชาย มั่นคง",         role: "customer" },
      merchant: { id: "m1", email: "merchant@laya.com",  name: "ร้านทอผ้าเชียงใหม่",   role: "merchant", shopId: "shop_001" },
      admin:    { id: "a1", email: "admin@laya.com",      name: "Admin LAYA",             role: "admin" },
    };
    setUser(mocks[role]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push("/");
  };

  const openAuthModal  = () => router.push("/auth/login");
  const closeAuthModal = () => {};

  const registerMerchant = async (data: MerchantApplication) => {
    const token = session?.access_token ?? null;
    await apiFetch("/api/shops/apply", token, {
      method: "POST",
      body: JSON.stringify({
        name: data.shopName,
        description: data.shopDescription,
        province: data.province,
        phone: data.phone,
        lineId: data.lineId,
        specialties: data.expertise,
      }),
    });
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      login, loginWithGoogle, loginAsRole,
      logout, register,
      openAuthModal, closeAuthModal,
      registerMerchant,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getToken(): string | null {
  // Sync read of session token for non-hook code
  return null; // session is async; prefer useAuth().session?.access_token in components
}
