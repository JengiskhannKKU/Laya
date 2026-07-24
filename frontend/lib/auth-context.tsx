"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getFreshToken } from "./api-auth";

export type UserRole = "customer" | "merchant" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
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
  bankAccountName?: string;
  promptpayId?: string;
  /** ประเภทร้านค้า: ชุมชนทอผ้า | ดีไซเนอร์ | ร้านค้าผลิตภัณฑ์ผ้าไทย */
  merchantType: "weaving_community" | "designer" | "retailer";
  /** ภาษาสำหรับกรอกข้อมูลสินค้า: th = ภาษาไทย, en = English */
  productLanguage: "th" | "en";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ role: UserRole }>;
  loginWithGoogle: () => Promise<void>;
  /** eslint-disable-next-line @typescript-eslint/no-explicit-any */
  loginWithLine: () => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ needsEmailConfirm: boolean }>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  registerMerchant: (data: MerchantApplication) => Promise<void>;
  refreshProfile: () => Promise<void>;
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
    phone: (profile.phone as string) ?? undefined,
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

  /** Fetch our custom profile from backend /api/auth/me — คืนค่า User ที่ set แล้ว เพื่อให้ caller (เช่น login) รู้ role ทันทีโดยไม่ต้องรอ onAuthStateChange */
  const fetchProfile = async (accessToken: string, supabaseUser: { id: string; email?: string }): Promise<User> => {
    try {
      const profile = await apiFetch("/api/auth/me", accessToken);
      const built = buildUser(supabaseUser, profile);
      setUser(built);
      return built;
    } catch {
      // Fallback: build minimal user from Supabase data only
      const fallback: User = {
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
        name: supabaseUser.email?.split("@")[0] ?? "User",
        role: "customer",
      };
      setUser(fallback);
      return fallback;
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // แปลง error หลักๆ ของ Supabase เป็นภาษาไทยให้ผู้ใช้เข้าใจ
      if (error.message.includes("Invalid login credentials")) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      if (error.message.includes("Email not confirmed")) throw new Error("EMAIL_NOT_CONFIRMED");
      throw new Error(error.message);
    }
    if (!data.session || !data.user) throw new Error("เข้าสู่ระบบไม่สำเร็จ");

    // ดึง role ทันทีแทนที่จะรอ onAuthStateChange (async, ช้ากว่าและ race กับการ redirect)
    // กัน onAuthStateChange ยิง fetchProfile ซ้ำสำหรับ token เดียวกันนี้
    processedTokenRef.current = data.session.access_token;
    const builtUser = await fetchProfile(data.session.access_token, data.user);
    return { role: builtUser.role };
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

  // LINE Login — ผูกเป็น Custom OIDC Provider ใน Supabase (ตัว LINE ไม่ใช่ provider มาตรฐานของ Supabase)
  // ต้องตั้งค่า Custom Provider ชื่อ "line" ไว้ในดาชบอร์ด Supabase ก่อน (Issuer: https://access.line.me)
  // แล้ว sign-in flow ที่เหลือ (callback, sync profile) ใช้ path เดียวกับ Google ทุกอย่าง
  const loginWithLine = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "custom:line" as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      if (error.message.includes("already registered")) throw new Error("อีเมลนี้มีบัญชีอยู่แล้ว");
      throw new Error(error.message);
    }
    if (!data.user) throw new Error("สมัครสมาชิกไม่สำเร็จ");

    // เปิด "Confirm email" ใน Supabase ไว้ → signUp จะยังไม่ได้ session
    // ผู้ใช้ต้องกดลิงก์ยืนยันในอีเมลก่อน (ลิงก์พามาที่ /auth/callback แล้ว sync โปรไฟล์ที่นั่น)
    if (!data.session) return { needsEmailConfirm: true };

    // โหมดไม่บังคับยืนยันอีเมล — ได้ session ทันที sync โปรไฟล์เลย
    await apiFetch("/api/auth/sync", data.session.access_token, {
      method: "POST",
      body: JSON.stringify({ display_name: name, phone }),
    });
    return { needsEmailConfirm: false };
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
    const token = await getFreshToken();
    await apiFetch("/api/shops/apply", token, {
      method: "POST",
      body: JSON.stringify({
        name: data.shopName,
        description: data.shopDescription,
        province: data.province,
        phone: data.phone,
        lineId: data.lineId,
        specialties: data.expertise,
        bankName: data.bankName,
        bankAccountNo: data.bankAccount,
        bankAccountName: data.bankAccountName,
        promptpayId: data.promptpayId,
        merchantType: data.merchantType,
        productLanguage: data.productLanguage,
      }),
    });
  };

  const refreshProfile = async () => {
    if (session?.access_token && session?.user) {
      await fetchProfile(session.access_token, session.user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      login, loginWithGoogle,
      logout, register,
      openAuthModal, closeAuthModal,
      registerMerchant,
      refreshProfile,
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
