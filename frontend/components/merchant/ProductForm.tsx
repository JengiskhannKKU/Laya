"use client";

/**
 * ฟอร์มเพิ่ม/แก้ไขสินค้าของร้านค้า — ใช้ร่วมกันทั้งหน้า create และ edit
 * เขียนตรงกับ schema ตาราง products จริง (ไม่มีฟิลด์ที่ไม่ถูกบันทึกจริง เช่น weaveTechnique/tags/province เดิม)
 */

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useRouter } from "next/navigation";

export const PRODUCT_CATEGORIES: { value: string; label: string }[] = [
  { value: "fabric", label: "ผ้าผืน" },
  { value: "clothing", label: "เสื้อผ้า" },
  { value: "scarf", label: "ผ้าพันคอ" },
  { value: "bag", label: "กระเป๋า" },
  { value: "premium", label: "พรีเมียม" },
  { value: "decor", label: "ของตกแต่ง" },
  { value: "others", label: "อื่นๆ" },
];

const FABRIC_TYPES = ["ผ้าไหม", "ผ้าฝ้าย", "ผ้าทอมือ", "ผ้าลินิน", "ผสม"];

export interface ProductFormValues {
  name: string;
  category: string;
  fabricType: string;
  price: string;
  priceUnit: string;
  stock: string;
  description: string;
  images: string[];
  hasGI: boolean;
}

export const emptyProductForm: ProductFormValues = {
  name: "", category: "fabric", fabricType: "", price: "", priceUnit: "เมตร",
  stock: "", description: "", images: [], hasGI: false,
};

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

interface ProductFormProps {
  title: string;
  initial: ProductFormValues;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export default function ProductForm({ title, initial, submitLabel, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>(initial);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url || form.images.includes(url) || form.images.length >= 6) return;
    set("images", [...form.images, url]);
    setImageUrlInput("");
  };

  const canSubmit = form.name.trim() && form.price && Number(form.price) > 0 && form.stock !== "" && Number(form.stock) >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.2rem", fontWeight: 700, color: "#1B2A4A" }}>
          {title}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>{error}</Alert>}

      {/* รูปสินค้า — ใส่ URL รูป (ยังไม่รองรับอัปโหลดไฟล์โดยตรง) */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 1 }}>
          รูปภาพสินค้า (ใส่ลิงก์รูป — สูงสุด 6 รูป)
        </Typography>
        {form.images.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
            {form.images.map((url) => (
              <Box key={url} sx={{ position: "relative", width: 64, height: 64, borderRadius: "10px", overflow: "hidden", bgcolor: "#F0EBE3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
                <IconButton size="small" onClick={() => set("images", form.images.filter((u) => u !== url))}
                  sx={{ position: "absolute", top: 1, right: 1, bgcolor: "rgba(0,0,0,0.5)", color: "#FFF", width: 18, height: 18, "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}>
                  <CloseRoundedIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField size="small" fullWidth placeholder="วางลิงก์รูปภาพ เช่น https://..." value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
            sx={sx.field} disabled={form.images.length >= 6} />
          <Button onClick={addImageUrl} disabled={!imageUrlInput.trim() || form.images.length >= 6}
            startIcon={<AddPhotoAlternateRoundedIcon />}
            sx={{ fontFamily: '"Kanit", sans-serif', color: "#1B2A4A", textTransform: "none", flexShrink: 0 }}>
            เพิ่ม
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <TextField fullWidth required label="ชื่อสินค้า" value={form.name} onChange={(e) => set("name", e.target.value)} sx={sx.field} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FormControl fullWidth sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>หมวดหมู่สินค้า *</InputLabel>
            <Select value={form.category} onChange={(e) => set("category", e.target.value)} label="หมวดหมู่สินค้า *">
              {PRODUCT_CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value} sx={{ fontFamily: '"Kanit", sans-serif' }}>{c.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>ประเภทผ้า</InputLabel>
            <Select value={form.fabricType} onChange={(e) => set("fabricType", e.target.value)} label="ประเภทผ้า">
              <MenuItem value="" sx={{ fontFamily: '"Kanit", sans-serif' }}>ไม่ระบุ</MenuItem>
              {FABRIC_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ fontFamily: '"Kanit", sans-serif' }}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 2 }}>
          <TextField required label="ราคา (บาท)" type="number" inputProps={{ min: 0, step: "0.01" }}
            value={form.price} onChange={(e) => set("price", e.target.value)} sx={sx.field} />
          <FormControl sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>หน่วย</InputLabel>
            <Select value={form.priceUnit} onChange={(e) => set("priceUnit", e.target.value)} label="หน่วย">
              {["เมตร", "ชิ้น", "ผืน", "คู่"].map((u) => <MenuItem key={u} value={u} sx={{ fontFamily: '"Kanit", sans-serif' }}>{u}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField required label="สต็อก" type="number" inputProps={{ min: 0 }}
            value={form.stock} onChange={(e) => set("stock", e.target.value)} sx={sx.field} />
        </Box>

        <TextField fullWidth multiline rows={4} label="รายละเอียดสินค้า" value={form.description} onChange={(e) => set("description", e.target.value)} sx={sx.field} />

        <FormControlLabel
          control={<Switch checked={form.hasGI} onChange={(e) => set("hasGI", e.target.checked)}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }} />}
          label={<Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.88rem", color: "#1B2A4A" }}>สินค้าได้รับรอง GI (สิ่งบ่งชี้ทางภูมิศาสตร์)</Typography>}
        />

        <Button type="submit" fullWidth variant="contained" disabled={loading || !canSubmit}
          sx={{ py: 1.5, mt: 1, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "#0F1A30" }, "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.4)", color: "#FFFFFF" } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
