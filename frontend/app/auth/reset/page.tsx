"use client";

/**
 * ตั้งรหัสผ่านใหม่ — ปลายทางของลิงก์รีเซ็ตจากอีเมล (Supabase Auth)
 * ลิงก์ recovery จะพา session กลับมาใน URL — supabase-js (detectSessionInUrl) จัดการให้
 * แล้วเราค่อยเรียก updateUser({ password }) เพื่อตั้งรหัสใหม่
 */

import { useState, useEffect } from "react";
import LayaLogo from "@/components/common/LayaLogo";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { supabase } from "@/lib/supabase";

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    borderRadius: "12px",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&:hover fieldset": { borderColor: "#C5A55A" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
  },
};

function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ready: มี session จากลิงก์ recovery แล้ว | invalid: เปิดหน้าตรงๆ/ลิงก์หมดอายุ
  const [linkState, setLinkState] = useState<"checking" | "ready" | "invalid">("checking");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    // ลิงก์ recovery อาจใช้เวลาแลก session ครู่หนึ่ง — ฟัง event และเช็คซ้ำก่อนตัดสินว่าลิงก์เสีย
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (session) setLinkState("ready");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) { setLinkState("ready"); return; }
      // รออีกนิดเผื่อ detectSessionInUrl กำลังประมวลผล hash อยู่
      setTimeout(async () => {
        if (cancelled) return;
        const { data: { session: s2 } } = await supabase.auth.getSession();
        setLinkState(s2 ? "ready" : "invalid");
      }, 1500);
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: sbError } = await supabase.auth.updateUser({ password });
      if (sbError) throw new Error(sbError.message);
      setSuccess(true);
      // ตั้งรหัสใหม่แล้ว — ออกจาก session recovery แล้วให้ล็อกอินใหม่ด้วยรหัสใหม่
      await supabase.auth.signOut();
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ลิงก์หมดอายุ หรือเกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  if (linkState === "checking") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress sx={{ color: "#C5A55A" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, pt: 2, pb: 4, flex: 1 }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: '"Kanit", sans-serif',
          fontWeight: 700,
          color: "#1B2A4A",
          mb: 1,
          textAlign: "center",
        }}
      >
        ตั้งรหัสผ่านใหม่
      </Typography>

      <Box sx={{ mt: 4 }}>
        {linkState === "invalid" && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>
            ลิงก์ไม่ถูกต้อง หรือหมดอายุแล้ว — กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่อีกครั้ง
            <Button onClick={() => router.push("/auth/forgot")} sx={{ display: "block", mt: 1, p: 0, color: "#C5A55A", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}>
              ขอลิงก์ใหม่
            </Button>
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}
          >
            {error}
          </Alert>
        )}

        {success ? (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}
          >
            ตั้งรหัสผ่านใหม่สำเร็จ ระบบกำลังพากลับไปยังหน้าเข้าสู่ระบบ...
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={textFieldStyles}
                disabled={loading || linkState !== "ready"}
              />

              <TextField
                fullWidth
                variant="outlined"
                placeholder="ยืนยันรหัสผ่านใหม่"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={textFieldStyles}
                disabled={loading || linkState !== "ready"}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !password || !confirmPassword || linkState !== "ready"}
                sx={{
                  py: 1.5,
                  mt: 1,
                  bgcolor: "#1B2A4A",
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  fontFamily: '"Kanit", sans-serif',
                  "&:hover": { bgcolor: "#0F1A30" },
                  "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.5)", color: "#FFFFFF" },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "ตั้งรหัสผ่านใหม่"}
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 5, pb: 2, display: "flex", justifyContent: "center" }}>
        <LayaLogo variant="navy" height={30} priority />
      </Box>

      <ResetPasswordForm />
    </Box>
  );
}
