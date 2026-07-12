"use client";

/**
 * ตั้งค่าบัญชี — ข้อมูลโปรไฟล์ (ลิงก์ไปหน้าแก้ไขโปรไฟล์ที่มีอยู่แล้ว) + เปลี่ยนรหัสผ่าน
 * เปลี่ยนรหัสผ่านใช้ supabase.auth.updateUser({ password }) เหมือน /auth/reset — ไม่ต้องใส่รหัสเดิม
 * เพราะมี session ที่ล็อกอินอยู่แล้ว (Supabase ตรวจสิทธิ์จาก session ไม่ใช่รหัสเดิม)
 */

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF", borderRadius: "12px",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&:hover fieldset": { borderColor: "#C5A55A" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
  },
};

function SettingsContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    if (password !== confirmPassword) { setError("รหัสผ่านไม่ตรงกัน"); return; }

    setSaving(true);
    try {
      const { error: sbError } = await supabase.auth.updateUser({ password });
      if (sbError) throw new Error(sbError.message);
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout>
      <Box sx={{ px: 2, pt: 3, pb: 4 }}>
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
        >
          <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.15rem", color: "#1B2A4A" }}>
            ตั้งค่า
          </Typography>
        </Box>

        {/* ข้อมูลโปรไฟล์ */}
        <Link href="/profile/edit" style={{ textDecoration: "none" }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            sx={{
              display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 2,
              bgcolor: "#FFFFFF", borderRadius: 3, border: "1px solid #E5DFD6", mb: 2,
              cursor: "pointer", "&:active": { bgcolor: "rgba(0,0,0,0.02)" },
            }}
          >
            <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "rgba(197,165,90,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PersonRoundedIcon sx={{ fontSize: 20, color: "#C5A55A" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#1B2A4A" }}>
                ข้อมูลโปรไฟล์
              </Typography>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#9CA3AF" }}>
                {user?.name} · {user?.email}
              </Typography>
            </Box>
            <ChevronRightRoundedIcon sx={{ color: "#D1D5DB" }} />
          </Box>
        </Link>

        {/* เปลี่ยนรหัสผ่าน */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          sx={{ bgcolor: "#FFFFFF", borderRadius: 3, border: "1px solid #E5DFD6", p: 2.5 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <LockRoundedIcon sx={{ fontSize: 18, color: "#C5A55A" }} />
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#1B2A4A" }}>
              เปลี่ยนรหัสผ่าน
            </Typography>
          </Box>

          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }}>เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleChangePassword} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth label="รหัสผ่านใหม่" type="password" autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required disabled={saving} sx={fieldSx}
            />
            <TextField
              fullWidth label="ยืนยันรหัสผ่านใหม่" type="password" autoComplete="new-password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required disabled={saving} sx={fieldSx}
            />
            <Button
              type="submit" variant="contained" fullWidth
              disabled={saving || !password || !confirmPassword}
              sx={{
                py: 1.3, mt: 0.5, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px",
                fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none",
                "&:hover": { bgcolor: "#0F1A30" },
              }}
            >
              {saving ? <CircularProgress size={22} color="inherit" /> : "บันทึกรหัสผ่านใหม่"}
            </Button>
          </Box>
        </Box>
      </Box>
    </MobileLayout>
  );
}

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={["customer", "merchant", "admin"]}>
      <SettingsContent />
    </RoleGuard>
  );
}
