"use client";

import { useState, useEffect, useRef } from "react";
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
import Switch from "@mui/material/Switch";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import TextureRoundedIcon from "@mui/icons-material/TextureRounded";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { useImageUpload } from "@/hooks/useImageUpload";

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
const PROVINCES = [
  "เชียงใหม่", "เชียงราย", "ลำพูน", "ลำปาง", "แพร่", "น่าน", "พะเยา", "แม่ฮ่องสอน",
  "ขอนแก่น", "อุดรธานี", "นครราชสีมา", "บุรีรัมย์", "สุรินทร์", "ศรีสะเกษ", "มหาสารคาม",
  "กรุงเทพมหานคร", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ",
  "สุโขทัย", "อุตรดิตถ์", "พิษณุโลก", "เพชรบูรณ์",
];

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
  businessHours: string;
  leadTimeDays: string;
  minOrderQty: string;
}

const emptyForm: ShopForm = {
  shopName: "", description: "", phone: "", lineId: "", address: "", province: "",
  promptpayId: "", bankName: "", bankAccountNo: "", bankAccountName: "",
  businessHours: "", leadTimeDays: "", minOrderQty: "",
};

export default function MerchantSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [form, setForm] = useState<ShopForm>(emptyForm);
  const [isOpen, setIsOpen] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const logoUpload = useImageUpload({
    bucket: "shop-images",
    folder: user?.id,
    onSuccess: async (result) => {
      setProfileImageUrl(result.url);
      await patchShop({ profileImageUrl: result.url });
    },
    onError: (msg) => setError(msg),
  });

  const coverUpload = useImageUpload({
    bucket: "shop-images",
    folder: user?.id,
    onSuccess: async (result) => {
      setCoverImageUrl(result.url);
      await patchShop({ coverImageUrl: result.url });
    },
    onError: (msg) => setError(msg),
  });

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
          businessHours: data.business_hours ?? "",
          leadTimeDays: data.lead_time_days != null ? String(data.lead_time_days) : "",
          minOrderQty: data.min_order_qty != null ? String(data.min_order_qty) : "",
        });
        setExpertise(Array.isArray(data.specialties) ? data.specialties : []);
        setIsOpen(data.is_open !== false);
        setProfileImageUrl(data.profile_image_url ?? null);
        setCoverImageUrl(data.cover_image_url ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "โหลดข้อมูลร้านค้าไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [user]);

  const set = (k: keyof ShopForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  /** บันทึกแบบ partial (ใช้กับ upload logo/cover ที่ต้องบันทึกทันทีโดยไม่รอกดปุ่มหลัก) */
  const patchShop = async (extra: Record<string, string | null>) => {
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
          businessHours: form.businessHours,
          leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : null,
          minOrderQty: form.minOrderQty ? Number(form.minOrderQty) : null,
          profileImageUrl,
          coverImageUrl,
          ...extra,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกรูปภาพไม่สำเร็จ");
    }
  };

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
          businessHours: form.businessHours,
          leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : null,
          minOrderQty: form.minOrderQty ? Number(form.minOrderQty) : null,
          profileImageUrl,
          coverImageUrl,
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

  const toggleOpen = async () => {
    const next = !isOpen;
    setIsOpen(next);
    try {
      const res = await authFetch(`${API_BASE}/api/shops/mine/open`, {
        method: "PATCH",
        body: JSON.stringify({ isOpen: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setIsOpen(!next);
      setError("เปลี่ยนสถานะเปิด/ปิดร้านไม่สำเร็จ");
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A" }}>
          ตั้งค่าร้านค้า
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: isOpen ? "#10B981" : "#9CA3AF", fontWeight: 600 }}>
            {isOpen ? "ร้านเปิดอยู่" : "ร้านปิดอยู่"}
          </Typography>
          <Switch
            checked={isOpen} onChange={toggleOpen}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#10B981" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#10B981" } }}
          />
        </Box>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>บันทึกเรียบร้อยแล้ว</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }} onClose={() => setError("")}>{error}</Alert>}

      {/* Cover photo */}
      <Box
        sx={{
          position: "relative", height: 140, borderRadius: "16px", mb: 2, overflow: "hidden",
          bgcolor: "#F0EBE3", border: "1px solid #E5DFD6", cursor: "pointer",
          backgroundImage: coverUpload.previewUrl || coverImageUrl ? `url(${coverUpload.previewUrl || coverImageUrl})` : undefined,
          backgroundSize: "cover", backgroundPosition: "center",
        }}
        onClick={() => coverInputRef.current?.click()}
      >
        <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) coverUpload.uploadFile(f); }}
        />
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(27,42,74,0.35)" }}>
          {coverUpload.uploading ? (
            <CircularProgress size={22} sx={{ color: "#FFFFFF" }} />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, color: "#FFFFFF" }}>
              <CameraAltRoundedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem" }}>เปลี่ยนภาพปก</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Shop Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, p: 2.5, bgcolor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E5DFD6" }}>
        <Box sx={{ position: "relative", cursor: "pointer" }} onClick={() => logoInputRef.current?.click()}>
          <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) logoUpload.uploadFile(f); }}
          />
          <Avatar
            src={logoUpload.previewUrl || profileImageUrl || undefined}
            sx={{ width: 72, height: 72, bgcolor: "#1B2A4A", fontSize: "1.8rem" }}
          >
            {!profileImageUrl && <TextureRoundedIcon sx={{ fontSize: "1.8rem" }} />}
          </Avatar>
          <Box sx={{
            position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%",
            bgcolor: "#C5A55A", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {logoUpload.uploading ? <CircularProgress size={12} sx={{ color: "#FFFFFF" }} /> : <CameraAltRoundedIcon sx={{ fontSize: 14, color: "#FFFFFF" }} />}
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A" }}>
            โลโก้ร้านค้า
          </Typography>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", color: "#6B7280" }}>
            JPG, PNG สูงสุด 20MB
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 3 }}>
        <TextField fullWidth label="ชื่อร้านค้า" value={form.shopName} onChange={(e) => set("shopName", e.target.value)} sx={sx.field} />
        <TextField fullWidth multiline rows={3} label="แนะนำร้านค้า" value={form.description} onChange={(e) => set("description", e.target.value)} sx={sx.field} />
        <TextField fullWidth label="เบอร์โทรศัพท์" value={form.phone} onChange={(e) => set("phone", e.target.value)} sx={sx.field} />
        <TextField fullWidth label="LINE ID" value={form.lineId} onChange={(e) => set("lineId", e.target.value)} sx={sx.field} />
        <FormControl fullWidth sx={sx.field}>
          <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>จังหวัด</InputLabel>
          <Select value={form.province} onChange={(e) => set("province", e.target.value)} label="จังหวัด">
            {PROVINCES.map((p) => (
              <MenuItem key={p} value={p} sx={{ fontFamily: '"Kanit", sans-serif' }}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField fullWidth multiline rows={2} label="ที่อยู่ร้าน" value={form.address} onChange={(e) => set("address", e.target.value)} sx={sx.field} />
      </Box>

      <Divider sx={{ borderColor: "#E5DFD6", mb: 2.5 }} />
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", mb: 1.5 }}>
        เงื่อนไขการสั่งซื้อ
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 3 }}>
        <TextField fullWidth multiline rows={2} label="เวลาทำการ" placeholder="เช่น จันทร์-ศุกร์ 9:00-18:00"
          value={form.businessHours} onChange={(e) => set("businessHours", e.target.value)} sx={sx.field}
        />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField fullWidth type="number" label="ระยะเวลาผลิต (วัน)" value={form.leadTimeDays}
            onChange={(e) => set("leadTimeDays", e.target.value)} sx={sx.field}
          />
          <TextField fullWidth type="number" label="ขั้นต่ำในการสั่งซื้อ (ชิ้น)" value={form.minOrderQty}
            onChange={(e) => set("minOrderQty", e.target.value)} sx={sx.field}
          />
        </Box>
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
