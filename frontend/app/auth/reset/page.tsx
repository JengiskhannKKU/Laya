"use client";

import { useState, useEffect, Suspense } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useRouter, useSearchParams } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

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
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("ลิงก์ไม่ถูกต้อง หรืออาจหมดอายุแล้ว (ไม่มีข้อมูล Token)");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword || !token) return;

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "ลิงก์หมดอายุ หรือเกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

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
                placeholder="รหัสผ่านใหม่"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={textFieldStyles}
                disabled={loading || !token}
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
                disabled={loading || !token}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !password || !confirmPassword || !token}
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
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#FAF6F0" }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 5, pb: 2 }}>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#1B2A4A",
            letterSpacing: 2,
            textAlign: "center",
          }}
        >
          LAYA
        </Typography>
      </Box>

      {/* Form Area – wrapped in Suspense because ResetPasswordForm uses useSearchParams */}
      <Suspense fallback={<CircularProgress sx={{ m: "auto" }} />}>
        <ResetPasswordForm />
      </Suspense>
    </Box>
  );
}
