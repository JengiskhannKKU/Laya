"use client";

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
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import { useRouter } from "next/navigation";

const FABRIC_TYPES = ["ผ้าไหม", "ผ้าฝ้าย", "ผ้าทอมือ", "ผ้าลินิน", "ผสม"];
const WEAVE_TECHNIQUES = ["มัดหมี่", "ขิด", "จก", "ยก", "ลายน้ำไหล", "ลายขอ", "พื้น"];

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

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", fabricType: "", weaveTechnique: "", price: "", priceUnit: "เมตร",
    stock: "", description: "", province: "",
  });
  const [tags, setTags] = useState<string[]>([]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.fabricType || !form.price || !form.stock) return;
    setLoading(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 900));
      router.push("/merchant/products");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
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
          เพิ่มสินค้าใหม่
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>{error}</Alert>}

      {/* Image upload */}
      <Box sx={{ mb: 3, p: 3, border: "2px dashed #E5DFD6", borderRadius: "16px", textAlign: "center", cursor: "pointer", "&:hover": { borderColor: "#C5A55A", bgcolor: "rgba(197,165,90,0.03)" }, transition: "all 0.2s" }}>
        <AddPhotoAlternateRoundedIcon sx={{ fontSize: 40, color: "#9CA3AF", mb: 1 }} />
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.88rem", color: "#6B7280" }}>
          คลิกหรือลากรูปภาพมาวาง
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#9CA3AF" }}>
          PNG, JPG สูงสุด 5MB (รองรับหลายรูป)
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <TextField fullWidth required label="ชื่อสินค้า" value={form.name} onChange={(e) => set("name", e.target.value)} sx={sx.field} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FormControl fullWidth sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>ประเภทผ้า *</InputLabel>
            <Select value={form.fabricType} onChange={(e) => set("fabricType", e.target.value)} label="ประเภทผ้า *">
              {FABRIC_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ fontFamily: '"Kanit", sans-serif' }}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>เทคนิคการทอ</InputLabel>
            <Select value={form.weaveTechnique} onChange={(e) => set("weaveTechnique", e.target.value)} label="เทคนิคการทอ">
              {WEAVE_TECHNIQUES.map((t) => <MenuItem key={t} value={t} sx={{ fontFamily: '"Kanit", sans-serif' }}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 2 }}>
          <TextField required label="ราคา (บาท)" type="number" value={form.price} onChange={(e) => set("price", e.target.value)} sx={sx.field} />
          <FormControl sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>หน่วย</InputLabel>
            <Select value={form.priceUnit} onChange={(e) => set("priceUnit", e.target.value)} label="หน่วย">
              <MenuItem value="เมตร" sx={{ fontFamily: '"Kanit", sans-serif' }}>เมตร</MenuItem>
              <MenuItem value="ชิ้น" sx={{ fontFamily: '"Kanit", sans-serif' }}>ชิ้น</MenuItem>
              <MenuItem value="ผืน" sx={{ fontFamily: '"Kanit", sans-serif' }}>ผืน</MenuItem>
            </Select>
          </FormControl>
          <TextField required label="สต็อก" type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} sx={sx.field} />
        </Box>

        <TextField fullWidth multiline rows={4} label="รายละเอียดสินค้า" value={form.description} onChange={(e) => set("description", e.target.value)} sx={sx.field} />

        <Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 1.5 }}>แท็กเพิ่มเติม</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {["มรดกไทย", "GI", "ออร์แกนิก", "ย้อมธรรมชาติ", "OTOP", "วิสาหกิจชุมชน"].map((tag) => (
              <Chip key={tag} label={tag} onClick={() => setTags((t) => t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag])}
                sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", bgcolor: tags.includes(tag) ? "#1B2A4A" : "#F0EBE3", color: tags.includes(tag) ? "#FFFFFF" : "#1B2A4A", cursor: "pointer" }}
              />
            ))}
          </Box>
        </Box>

        <Button type="submit" fullWidth variant="contained" disabled={loading || !form.name || !form.fabricType || !form.price || !form.stock}
          sx={{ py: 1.5, mt: 1, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "#0F1A30" }, "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.4)", color: "#FFFFFF" } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "บันทึกสินค้า"}
        </Button>
      </Box>
    </Box>
  );
}
