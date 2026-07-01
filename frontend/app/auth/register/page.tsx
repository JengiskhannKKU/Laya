"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "next/link";
import IconButton from "@mui/material/IconButton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useAuth } from "@/lib/auth-context";

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    borderRadius: "12px",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&:hover fieldset": { borderColor: "#C5A55A" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword || !acceptTerms) return;

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerUser(name, email, password, phone || undefined);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/oauth/${provider.toLowerCase()}`;
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
          สร้างบัญชีใหม่
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.9rem", mb: 4 }}>
          เข้าร่วมเป็นส่วนหนึ่งของ LAYA
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={textFieldStyles}
              disabled={loading}
            />

            <TextField
              fullWidth
              variant="outlined"
              placeholder="อีเมลของคุณ"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={textFieldStyles}
              disabled={loading}
            />

            <TextField
              fullWidth
              variant="outlined"
              placeholder="สร้างรหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={textFieldStyles}
              disabled={loading}
            />

            <TextField
              fullWidth
              variant="outlined"
              placeholder="ยืนยันรหัสผ่าน"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={textFieldStyles}
              disabled={loading}
            />

            <TextField
              fullWidth
              variant="outlined"
              placeholder="เบอร์โทรศัพท์ (ไม่บังคับ)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={textFieldStyles}
              disabled={loading}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#C5A55A" } }}
                    disabled={loading}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280" }}>
                    ฉันยอมรับข้อตกลงในการใช้งาน และนโยบายความเป็นส่วนตัว
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptMarketing}
                    onChange={(e) => setAcceptMarketing(e.target.checked)}
                    sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#C5A55A" }, mt: -1 }}
                    disabled={loading}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#6B7280", mt: -1 }}>
                    ฉันต้องการรับข่าวสารและโปรโมชั่นจาก LAYA
                  </Typography>
                }
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !name || !email || !password || !confirmPassword || !acceptTerms}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "สมัครสมาชิก"}
            </Button>
          </Box>
        </form>

        <Box sx={{ display: "flex", alignItems: "center", my: 4 }}>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5DFD6" }} />
          <Typography sx={{ mx: 2, color: "#9CA3AF", fontSize: "0.8rem", fontFamily: '"Kanit", sans-serif' }}>
            หรือสมัครสมาชิกด้วย
          </Typography>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5DFD6" }} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleOAuth('LINE')}
            sx={{
              py: 1.2,
              bgcolor: "#06C755",
              color: "#FFFFFF",
              borderRadius: "12px",
              fontWeight: 600,
              fontFamily: '"Kanit", sans-serif',
              textTransform: "none",
              "&:hover": { bgcolor: "#05A546" },
            }}
          >
            สมัครสมาชิกด้วย LINE
          </Button>
        </Box>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem", color: "#6B7280" }}>
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <Box component="span" sx={{ color: "#C5A55A", fontWeight: 600, "&:hover": { textDecoration: "underline" }}}>
                เข้าสู่ระบบ
              </Box>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
