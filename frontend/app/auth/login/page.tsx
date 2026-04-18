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
import { useAuth } from "@/lib/auth-context";
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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      // Simulate API call for login
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (email === "error@test.com") {
        throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
      
      login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    // Implement OAuth /api/auth/oauth/...
    alert(`Mock OAuth: ${provider}`);
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
            fontFamily: '"Playfair Display", "Noto Serif Thai", serif',
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
        <Typography variant="h5" sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
          ยินดีต้อนรับกลับมา
        </Typography>
        <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', color: "#6B7280", fontSize: "0.9rem", mb: 4 }}>
          เข้าสู่ระบบเพื่อดำเนินการต่อ
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", fontFamily: '"Noto Serif Thai", serif' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
              placeholder="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={textFieldStyles}
              disabled={loading}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: -1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    sx={{ color: "#E5DFD6", "&.Mui-checked": { color: "#C5A55A" } }}
                    disabled={loading}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#6B7280" }}>
                    จดจำฉันไว้
                  </Typography>
                }
              />
              <Link href="/auth/forgot" style={{ textDecoration: "none" }}>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.85rem", color: "#C5A55A", fontWeight: 600 }}>
                  ลืมรหัสผ่าน?
                </Typography>
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !email || !password}
              sx={{
                py: 1.5,
                mt: 1,
                bgcolor: "#1B2A4A",
                color: "#FFFFFF",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "1rem",
                fontFamily: '"Noto Serif Thai", serif',
                "&:hover": { bgcolor: "#0F1A30" },
                "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.5)", color: "#FFFFFF" }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "เข้าสู่ระบบ"}
            </Button>
          </Box>
        </form>

        <Box sx={{ display: "flex", alignItems: "center", my: 4 }}>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5DFD6" }} />
          <Typography sx={{ mx: 2, color: "#9CA3AF", fontSize: "0.8rem", fontFamily: '"Noto Serif Thai", serif' }}>
            หรือเข้าสู่ระบบด้วย
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
              fontFamily: '"Noto Serif Thai", serif',
              textTransform: "none",
              "&:hover": { bgcolor: "#05A546" },
            }}
          >
            เข้าสู่ระบบด้วย LINE
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleOAuth('Google')}
            sx={{
              py: 1.2,
              bgcolor: "#FFFFFF",
              color: "#6B7280",
              borderColor: "#E5DFD6",
              borderRadius: "12px",
              fontWeight: 600,
              fontFamily: '"Noto Serif Thai", serif',
              textTransform: "none",
              "&:hover": { bgcolor: "#F9FAFB", borderColor: "#E5DFD6" },
            }}
          >
            เข้าสู่ระบบด้วย Google
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleOAuth('Facebook')}
            sx={{
              py: 1.2,
              bgcolor: "#1877F2",
              color: "#FFFFFF",
              borderRadius: "12px",
              fontWeight: 600,
              fontFamily: '"Noto Serif Thai", serif',
              textTransform: "none",
              "&:hover": { bgcolor: "#166FE5" },
            }}
          >
            เข้าสู่ระบบด้วย Facebook
          </Button>
        </Box>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: "0.9rem", color: "#6B7280" }}>
            ยังไม่มีบัญชี?{" "}
            <Link href="/auth/register" style={{ textDecoration: "none" }}>
              <Box component="span" sx={{ color: "#C5A55A", fontWeight: 600, "&:hover": { textDecoration: "underline" }}}>
                สมัครสมาชิก
              </Box>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
