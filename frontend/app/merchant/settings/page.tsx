"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
const BANKS = ["กสิกรไทย", "กรุงเทพ", "กรุงไทย", "ไทยพาณิชย์", "ทหารไทยธนชาต", "ออมสิน", "กรุงศรีอยุธยา"];

interface ShopForm {
  shopName: string;
  description: string;
  phone: string;
  lineId: string;
  address: string;
  province: string;
  promptpayId: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
}

const emptyForm: ShopForm = {
  shopName: "", description: "", phone: "", lineId: "", address: "", province: "",
  promptpayId: "", bankName: "", bankAccountNo: "", bankAccountName: "",
};

export default function MerchantSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [form, setForm] = useState<ShopForm>(emptyForm);

  useEffect(() => {
    if (!user) return;
    authFetch(`${API_BASE}/api/shops/mine`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "โหลดข้อมูลร้านค้าไม่สำเร็จ");
        setForm({
          shopName: data.name ?? "",
          description: data.description ?? "",
          phone: data.phone ?? "",
          lineId: data.line_id ?? "",
          address: data.address ?? "",
          province: data.province ?? "",
          promptpayId: data.promptpay_id ?? "",
          bankName: data.bank_name ?? "",
          bankAccountNo: data.bank_account_no ?? "",
          bankAccountName: data.bank_account_name ?? "",
        });
        setExpertise(Array.isArray(data.specialties) ? data.specialties : []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "โหลดข้อมูลร้านค้าไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [user]);

  const set = (k: keyof ShopForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/shops/mine`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.shopName,
          description: form.description,
          phone: form.phone,
          lineId: form.lineId,
          address: form.address,
          province: form.province,
          promptpayId: form.promptpayId,
          bankName: form.bankName,
          bankAccountNo: form.bankAccountNo,
          bankAccountName: form.bankAccountName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      if (e instanceof SessionExpiredError) { setError(e.message); return; }
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} sx={{ color: "#C5A55A" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A", mb: 3 }}>
        ตั้งค่าร้านค้า
      </Typography>

      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>บันทึกเรียบร้อยแล้ว</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>{error}</Alert>}

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

      <Divider sx={{ borderColor: "#E5DFD6", mb: 2.5 }} />
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", mb: 1 }}>
        บัญชีสำหรับรับเงิน
      </Typography>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", color: "#6B7280", mb: 1.5 }}>
        ลูกค้าจะจ่ายเงินเข้าบัญชีนี้โดยตรงตอนชำระเงิน
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <TextField
          fullWidth label="เลขพร้อมเพย์ (เบอร์โทร/เลขบัตร ปชช.)"
          value={form.promptpayId}
          onChange={(e) => set("promptpayId", e.target.value.replace(/[^0-9]/g, ""))}
          sx={sx.field}
        />
        <FormControl fullWidth sx={sx.field}>
          <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>ธนาคาร</InputLabel>
          <Select value={form.bankName} onChange={(e) => set("bankName", e.target.value)} label="ธนาคาร">
            {BANKS.map((b) => (
              <MenuItem key={b} value={b} sx={{ fontFamily: '"Kanit", sans-serif' }}>{b}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField fullWidth label="เลขบัญชี" value={form.bankAccountNo} onChange={(e) => set("bankAccountNo", e.target.value)} sx={sx.field} />
        <TextField fullWidth label="ชื่อบัญชี" value={form.bankAccountName} onChange={(e) => set("bankAccountName", e.target.value)} sx={sx.field} />
      </Box>

      <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
        sx={{ mt: 3, py: 1.5, bgcolor: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#0F1A30" } }}
      >
        {saving ? <CircularProgress size={22} color="inherit" /> : "บันทึกการเปลี่ยนแปลง"}
      </Button>
    </Box>
  );
}
