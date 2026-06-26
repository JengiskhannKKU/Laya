"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { useAuth } from "@/lib/auth-context";

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

const EXPERTISE_OPTIONS = ["ผ้าไหมมัดหมี่", "ผ้าขิด", "ผ้าจก", "ผ้าลายน้ำไหล", "ผ้าทอมือ", "ผ้าฝ้าย", "ผ้าซิ่น", "ผ้ายก"];

export default function MerchantSettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expertise, setExpertise] = useState(["ผ้าไหมมัดหมี่", "ผ้าขิด"]);
  const [form, setForm] = useState({
    shopName: user?.name ?? "",
    description: "ร้านทอผ้าไหมแท้จากเชียงใหม่ สืบสานภูมิปัญญาดั้งเดิม กว่า 30 ปี",
    phone: "081-234-5678",
    lineId: "@laya_weave",
    address: "123 ถ.นิมมานเหมินท์ เชียงใหม่ 50200",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A", mb: 3 }}>
        ตั้งค่าร้านค้า
      </Typography>

      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>บันทึกเรียบร้อยแล้ว</Alert>}

      {/* Shop Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, p: 2.5, bgcolor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E5DFD6" }}>
        <Box sx={{ position: "relative" }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: "#1B2A4A", fontSize: "1.8rem" }}>🧵</Avatar>
          <Box sx={{
            position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%",
            bgcolor: "#C5A55A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <CameraAltRoundedIcon sx={{ fontSize: 14, color: "#FFFFFF" }} />
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A" }}>
            โลโก้ร้านค้า
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", color: "#6B7280" }}>
            JPG, PNG สูงสุด 2MB
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 3 }}>
        <TextField fullWidth label="ชื่อร้านค้า" value={form.shopName} onChange={(e) => set("shopName", e.target.value)} sx={sx.field} />
        <TextField fullWidth multiline rows={3} label="แนะนำร้านค้า" value={form.description} onChange={(e) => set("description", e.target.value)} sx={sx.field} />
        <TextField fullWidth label="เบอร์โทรศัพท์" value={form.phone} onChange={(e) => set("phone", e.target.value)} sx={sx.field} />
        <TextField fullWidth label="LINE ID" value={form.lineId} onChange={(e) => set("lineId", e.target.value)} sx={sx.field} />
        <TextField fullWidth multiline rows={2} label="ที่อยู่ร้าน" value={form.address} onChange={(e) => set("address", e.target.value)} sx={sx.field} />
      </Box>

      <Divider sx={{ borderColor: "#E5DFD6", mb: 2.5 }} />
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", mb: 1.5 }}>
        ความเชี่ยวชาญ
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {EXPERTISE_OPTIONS.map((tag) => (
          <Chip key={tag} label={tag}
            onClick={() => setExpertise((e) => e.includes(tag) ? e.filter((x) => x !== tag) : [...e, tag])}
            sx={{
              fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", cursor: "pointer",
              bgcolor: expertise.includes(tag) ? "#1B2A4A" : "#F0EBE3",
              color: expertise.includes(tag) ? "#FFFFFF" : "#1B2A4A",
            }}
          />
        ))}
      </Box>

      <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
        sx={{ py: 1.5, bgcolor: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#0F1A30" } }}
      >
        {saving ? <CircularProgress size={22} color="inherit" /> : "บันทึกการเปลี่ยนแปลง"}
      </Button>
    </Box>
  );
}
