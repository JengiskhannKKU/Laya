"use client";

/**
 * ยืนยันอีเมลหลังสมัครสมาชิก — แสดงเมื่อ Supabase เปิด "Confirm email"
 * ผู้ใช้กดลิงก์ในอีเมล → Supabase พากลับมาที่ /auth/callback → เข้าสู่ระบบอัตโนมัติ
 * หน้านี้มีปุ่มส่งอีเมลยืนยันซ้ำเผื่ออีเมลไม่ถึง
 */

import { useState, Suspense } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const FONT = '"Kanit", sans-serif';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    if (!email) { setError("ไม่พบอีเมล — กรุณาสมัครสมาชิกใหม่อีกครั้ง"); return; }
    setResending(true);
    setError("");
    try {
      const { error: sbError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (sbError) throw new Error(sbError.message);
      setResent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ส่งอีเมลซ้ำไม่สำเร็จ");
    } finally {
      setResending(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "#FAF6F0", px: 3, textAlign: "center" }}>
      <Box sx={{ width: 84, height: 84, borderRadius: "50%", bgcolor: "rgba(197,165,90,0.12)", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
        <MarkEmailReadRoundedIcon sx={{ fontSize: 42, color: "#C5A55A" }} />
      </Box>

      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.35rem", color: "#1B2A4A", mb: 1 }}>
        ยืนยันอีเมลของคุณ
      </Typography>
      <Typography sx={{ fontFamily: FONT, color: "#6B7280", fontSize: "0.92rem", lineHeight: 1.8, maxWidth: 380, mb: 3 }}>
        เราส่งลิงก์ยืนยันไปที่{email ? <> <b style={{ color: "#1B2A4A" }}>{email}</b></> : "อีเมลของคุณ"} แล้ว
        <br />กรุณาเปิดอีเมลแล้วกดลิงก์ยืนยันเพื่อเริ่มใช้งาน LAYA
        <br /><span style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>ถ้าไม่เจอ ลองเช็คในกล่อง Spam/Junk</span>
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT, maxWidth: 380, width: "100%" }}>{error}</Alert>
      )}
      {resent && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT, maxWidth: 380, width: "100%" }}>
          ส่งอีเมลยืนยันอีกครั้งแล้ว — กรุณาตรวจสอบกล่องจดหมาย
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%", maxWidth: 380 }}>
        <Button
          variant="contained" fullWidth onClick={handleResend} disabled={resending || resent}
          sx={{
            py: 1.5, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontWeight: 700,
            fontFamily: FONT, textTransform: "none",
            "&:hover": { bgcolor: "#0F1A30" },
            "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.4)", color: "#FFFFFF" },
          }}
        >
          {resending ? <CircularProgress size={22} color="inherit" /> : "ส่งอีเมลยืนยันอีกครั้ง"}
        </Button>
        <Button
          fullWidth onClick={() => router.push("/auth/login")}
          sx={{ py: 1.2, color: "#6B7280", fontFamily: FONT, textTransform: "none", fontWeight: 600 }}
        >
          ไปหน้าเข้าสู่ระบบ
        </Button>
      </Box>
    </Box>
  );
}

export default function VerifyEmailForm() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", bgcolor: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center" }}><CircularProgress sx={{ color: "#C5A55A" }} /></Box>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
