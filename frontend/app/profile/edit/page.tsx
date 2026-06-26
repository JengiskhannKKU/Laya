"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import MobileLayout from "@/components/layout/MobileLayout";

const sx = {
  field: {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#FFFFFF", borderRadius: "12px",
      "& fieldset": { borderColor: "#E5DFD6" },
      "&:hover fieldset": { borderColor: "#C5A55A" },
      "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#C5A55A" },
  },
};

export default function ProfileEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MobileLayout>
      <Box sx={{ px: 2, pt: 3, pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.15rem", color: "#1B2A4A" }}>
            แก้ไขโปรไฟล์
          </Typography>
        </Box>

        {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>บันทึกเรียบร้อยแล้ว</Alert>}

        {/* Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{ width: 90, height: 90, bgcolor: "#1B2A4A", fontSize: "2rem", fontFamily: '"Kanit", sans-serif' }}>
              {user?.name?.[0] ?? "U"}
            </Avatar>
            <Box sx={{
              position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: "50%",
              bgcolor: "#C5A55A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              border: "2px solid #FAF6F0",
            }}>
              <CameraAltRoundedIcon sx={{ fontSize: 15, color: "#FFFFFF" }} />
            </Box>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField fullWidth label="ชื่อ-นามสกุล" value={form.name} onChange={(e) => set("name", e.target.value)} sx={sx.field} />
          <TextField fullWidth label="อีเมล" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} sx={sx.field} />
          <TextField fullWidth label="เบอร์โทรศัพท์" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} sx={sx.field} />

          <Divider sx={{ borderColor: "#E5DFD6" }} />
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", fontSize: "0.95rem" }}>
            ที่อยู่จัดส่ง
          </Typography>
          <TextField fullWidth label="ที่อยู่" multiline rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} sx={sx.field} />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField fullWidth label="อำเภอ/เขต" value={form.city} onChange={(e) => set("city", e.target.value)} sx={sx.field} />
            <TextField fullWidth label="จังหวัด" value={form.province} onChange={(e) => set("province", e.target.value)} sx={sx.field} />
          </Box>
          <TextField fullWidth label="รหัสไปรษณีย์" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} sx={sx.field} />

          <Button type="submit" fullWidth variant="contained" disabled={saving}
            sx={{ py: 1.5, mt: 1, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "#0F1A30" } }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </Box>
      </Box>
    </MobileLayout>
  );
}
