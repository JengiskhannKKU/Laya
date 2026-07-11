import { useState, useRef } from "react";
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
import { useImageUpload } from "@/hooks/useImageUpload";

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, session, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar ?? null);

  const { uploadFile, uploading: avatarUploading } = useImageUpload({
    bucket: "avatars",
    folder: user?.id,
    onSuccess: (res) => {
      setAvatarUrl(res.url);
    },
    onError: (msg) => {
      setErrorMsg(msg);
    },
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const token = session?.access_token;
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          displayName: form.name,
          avatarUrl: avatarUrl,
          phone: form.phone,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to save profile");
      }

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message ?? "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
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
        {errorMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>{errorMsg}</Alert>}

        {/* Hidden Avatar File Input */}
        <input
          type="file"
          ref={avatarInputRef}
          onChange={handleAvatarFileChange}
          style={{ display: "none" }}
          accept="image/*"
        />

        {/* Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar 
              src={avatarUrl ?? undefined}
              sx={{ width: 90, height: 90, bgcolor: "#1B2A4A", fontSize: "2rem", fontFamily: '"Kanit", sans-serif' }}
            >
              {avatarUploading ? (
                <CircularProgress size={30} color="inherit" />
              ) : (
                user?.name?.[0] ?? "U"
              )}
            </Avatar>
            <Box 
              onClick={handleAvatarClick}
              sx={{
                position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: "50%",
                bgcolor: "#C5A55A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                border: "2px solid #FAF6F0",
              }}
            >
              <CameraAltRoundedIcon sx={{ fontSize: 15, color: "#FFFFFF" }} />
            </Box>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField fullWidth label="ชื่อ-นามสกุล" value={form.name} onChange={(e) => set("name", e.target.value)} sx={sx.field} />
          <TextField fullWidth label="อีเมล" type="email" value={form.email} disabled sx={sx.field} />
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

          <Button type="submit" fullWidth variant="contained" disabled={saving || avatarUploading}
            sx={{ py: 1.5, mt: 1, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "#0F1A30" } }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </Box>
      </Box>
    </MobileLayout>
  );
}
