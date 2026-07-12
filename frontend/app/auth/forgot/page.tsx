"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      // ส่งอีเมลรีเซ็ตรหัสผ่านผ่าน Supabase Auth — ลิงก์พากลับมาที่ /auth/reset
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (sbError) throw new Error(sbError.message);
      // สำเร็จเสมอถ้าอีเมลถูกรูปแบบ — Supabase ไม่เผยว่าอีเมลนี้มีบัญชีหรือไม่ (กัน email enumeration)
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งลิงก์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0" }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1B2A4A",
            letterSpacing: 2,
            ml: 2,
          }}
        >
          LAYA
        </Typography>
      </Box>

      {/* Form Area */}
      <Box sx={{ px: 3, pt: 2, pb: 4, flex: 1 }}>
        <Typography variant="h5" sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
          ลืมรหัสผ่าน?
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.9rem", mb: 4 }}>
          กรุณากรอกอีเมลที่คุณใช้ลงทะเบียน เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้คุณ
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Alert severity="success" sx={{ mb: 3, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>
            เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="อีเมลที่ลงทะเบียนไว้"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={textFieldStyles}
                disabled={loading}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !email}
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
                  "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.5)", color: "#FFFFFF" }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "ส่งลิงก์รีเซ็ต"}
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </Box>
  );
}
