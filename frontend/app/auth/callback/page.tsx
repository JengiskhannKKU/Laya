"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    // ถ้า OAuth handshake ล้มเหลวฝั่ง Supabase/provider (เช่น LINE ไม่คืน email ตามที่ scope ขอ, หรือ
    // token exchange ผิดพลาด) Supabase จะ redirect กลับมาที่นี่พร้อม ?error=...&error_description=...
    // (บางเคสอยู่ใน query string บางเคสอยู่ใน hash fragment) — เดิมโค้ดนี้ไม่เคยอ่านค่านี้เลย ทำให้เห็นแต่
    // ข้อความ fallback ทั่วไป "เข้าสู่ระบบไม่สำเร็จ" โดยไม่รู้สาเหตุจริงเลย
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const oauthError = params.get("error_description") ?? hashParams.get("error_description")
      ?? params.get("error") ?? hashParams.get("error");
    if (oauthError) {
      console.error("[auth/callback] OAuth provider error:", oauthError);
      setError(decodeURIComponent(oauthError));
      setTimeout(() => router.replace("/auth/login"), 4000);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      if (sessionError || !session) {
        setError(sessionError?.message || "การเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
        setTimeout(() => router.replace("/auth/login"), 2500);
        return;
      }

      // Sync user profile to public.users (idempotent upsert on backend)
      try {
        const meta = session.user.user_metadata;
        await fetch(`${API_BASE}/api/auth/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            display_name: meta?.full_name ?? meta?.name ?? session.user.email?.split("@")[0],
            avatar_url: meta?.avatar_url ?? meta?.picture ?? null,
          }),
        });
      } catch {
        // Non-fatal: profile sync can retry later
      }

      // ดึง role เพื่อ redirect ให้ตรงกลุ่มผู้ใช้ — ถ้าดึงไม่ได้ (network error) fallback ไปหน้าแรกเหมือนเดิม
      try {
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const me = await meRes.json();
        const role = me?.role as string | undefined;
        const savedRedirect = localStorage.getItem("oauth_redirect");
        if (savedRedirect) {
          localStorage.removeItem("oauth_redirect");
          router.replace(savedRedirect);
        } else {
          router.replace(role === "merchant" ? "/merchant" : role === "admin" ? "/admin" : "/");
        }
      } catch {
        const savedRedirect = localStorage.getItem("oauth_redirect");
        if (savedRedirect) {
          localStorage.removeItem("oauth_redirect");
          router.replace(savedRedirect);
        } else {
          router.replace("/");
        }
      }
    });
  }, [router]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "#FAF6F0", gap: 2 }}>
      {error ? (
        <>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#EF4444", fontWeight: 600 }}>
            {error}
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#9CA3AF" }}>
            กำลังกลับไปหน้าเข้าสู่ระบบ...
          </Typography>
        </>
      ) : (
        <>
          <CircularProgress sx={{ color: "#C5A55A" }} />
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#1B2A4A", fontWeight: 500 }}>
            กำลังเข้าสู่ระบบ...
          </Typography>
        </>
      )}
    </Box>
  );
}
