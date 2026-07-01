"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";

// ── SVG Brand Icons (inline, no emoji) ────────────────────────────────────────
function LineIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596a.628.628 0 01-.201.033.624.624 0 01-.503-.254l-2.409-3.276v2.9c0 .346-.282.631-.631.631a.633.633 0 01-.63-.63V8.108c0-.27.173-.51.43-.595a.632.632 0 01.704.22l2.41 3.276V8.108c0-.345.282-.63.63-.63.348 0 .632.285.632.63v4.771zm-5.741 0c0 .346-.282.631-.63.631a.633.633 0 01-.631-.63V8.108c0-.345.283-.63.63-.63.35 0 .631.285.631.63v4.771zm-2.466.631H4.917a.627.627 0 01-.627-.63V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.141h1.752c.348 0 .63.283.63.629 0 .348-.282.631-.63.631zM12 0C5.373 0 0 4.975 0 11.101c0 5.494 4.384 10.092 10.266 10.949.399.086.943.264 1.081.605.122.312.08.798.039 1.113l-.175 1.045c-.053.312-.243 1.221 1.07.665 1.313-.555 7.089-4.178 9.677-7.152 1.785-1.96 2.642-3.948 2.642-6.225C24 4.975 18.627 0 12 0z" fill="white"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" fill="white"/>
    </svg>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF", borderRadius: "12px",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&:hover fieldset": { borderColor: "#C5A55A" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A", borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#C5A55A" },
};

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      // Redirect handled by Supabase → /auth/callback
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
      setGoogleLoading(false);
    }
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.5rem", fontWeight: 700, color: "#1B2A4A", letterSpacing: 2, ml: 2 }}>
          LAYA
        </Typography>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{ px: 3, pt: 2, pb: 5, flex: 1 }}
      >
        <Typography variant="h5" sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 0.5 }}>
          ยินดีต้อนรับกลับมา
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.9rem", mb: 3 }}>
          เข้าสู่ระบบเพื่อดำเนินการต่อ
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* ── Google (Primary OAuth) ── */}
        <Button
          fullWidth variant="outlined"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          sx={{
            py: 1.4, mb: 2,
            bgcolor: "#FFFFFF", color: "#374151", borderColor: "#E5DFD6",
            borderRadius: "12px", fontWeight: 600, fontFamily: '"Kanit", sans-serif',
            textTransform: "none", fontSize: "0.95rem",
            display: "flex", gap: 1.5, alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
          }}
        >
          {googleLoading
            ? <CircularProgress size={20} sx={{ color: "#6B7280" }} />
            : <GoogleIcon />}
          เข้าสู่ระบบด้วย Google
        </Button>

        {/* ── Divider ── */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Divider sx={{ flex: 1, borderColor: "#E5DFD6" }} />
          <Typography sx={{ mx: 2, color: "#9CA3AF", fontSize: "0.78rem", fontFamily: '"Kanit", sans-serif', whiteSpace: "nowrap" }}>
            หรือใช้อีเมลและรหัสผ่าน
          </Typography>
          <Divider sx={{ flex: 1, borderColor: "#E5DFD6" }} />
        </Box>

        {/* ── Email / Password Form ── */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            fullWidth label="อีเมล" type="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required disabled={loading} sx={fieldSx}
          />

          {/* Password with show/hide using end button inside sx */}
          <Box sx={{ position: "relative" }}>
            <TextField
              fullWidth label="รหัสผ่าน" autoComplete="current-password"
              type={showPass ? "text" : "password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required disabled={loading}
              sx={{ ...fieldSx, "& .MuiOutlinedInput-root": { ...fieldSx["& .MuiOutlinedInput-root"], pr: "48px" } }}
            />
            <IconButton
              onClick={() => setShowPass((v) => !v)}
              tabIndex={-1}
              sx={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                color: "#9CA3AF", p: 0.5,
              }}
            >
              {showPass
                ? <VisibilityOffRoundedIcon sx={{ fontSize: 20 }} />
                : <VisibilityRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: -1 }}>
            <FormControlLabel
              control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#C5A55A" } }} disabled={loading} />}
              label={<Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#6B7280" }}>จดจำฉันไว้</Typography>}
            />
            <Link href="/auth/forgot" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#C5A55A", fontWeight: 600 }}>
                ลืมรหัสผ่าน?
              </Typography>
            </Link>
          </Box>

          <Button
            type="submit" variant="contained" fullWidth
            disabled={loading || !email || !password}
            sx={{
              py: 1.5, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px",
              fontWeight: 700, fontSize: "1rem", fontFamily: '"Kanit", sans-serif',
              textTransform: "none", boxShadow: "0 4px 14px rgba(27,42,74,0.25)",
              "&:hover": { bgcolor: "#0F1A30" },
              "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.45)", color: "#FFFFFF" },
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "เข้าสู่ระบบ"}
          </Button>
        </Box>

        {/* ── Other OAuth ── */}
        <Divider sx={{ my: 3, borderColor: "#E5DFD6" }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            fullWidth variant="contained"
            onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/oauth/line`; }}
            disabled={loading || googleLoading}
            sx={{
              py: 1.3, bgcolor: "#06C755", color: "#FFFFFF", borderRadius: "12px",
              fontWeight: 600, fontFamily: '"Kanit", sans-serif', textTransform: "none",
              display: "flex", gap: 1.5, "&:hover": { bgcolor: "#05B34A" },
            }}
          >
            <LineIcon />
            เข้าสู่ระบบด้วย LINE
          </Button>

          <Button
            fullWidth variant="contained"
            onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/oauth/facebook`; }}
            disabled={loading || googleLoading}
            sx={{
              py: 1.3, bgcolor: "#1877F2", color: "#FFFFFF", borderRadius: "12px",
              fontWeight: 600, fontFamily: '"Kanit", sans-serif', textTransform: "none",
              display: "flex", gap: 1.5, "&:hover": { bgcolor: "#1464D8" },
            }}
          >
            <FacebookIcon />
            เข้าสู่ระบบด้วย Facebook
          </Button>
        </Box>

        {/* ── Register links ── */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#6B7280" }}>
            ยังไม่มีบัญชี?{" "}
            <Link href="/auth/register" style={{ textDecoration: "none" }}>
              <Box component="span" sx={{ color: "#C5A55A", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                สมัครสมาชิก
              </Box>
            </Link>
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#9CA3AF", mt: 1 }}>
            หรือ{" "}
            <Link href="/auth/register/merchant" style={{ textDecoration: "none" }}>
              <Box component="span" sx={{ color: "#1B2A4A", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                สมัครเป็นร้านค้า LAYA
              </Box>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
