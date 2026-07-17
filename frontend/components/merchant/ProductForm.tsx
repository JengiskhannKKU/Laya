"use client";

/**
 * ฟอร์มเพิ่ม/แก้ไขสินค้าของร้านค้า — ใช้ร่วมกันทั้งหน้า create และ edit
 * เขียนตรงกับ schema ตาราง products จริง (ไม่มีฟิลด์ที่ไม่ถูกบันทึกจริง เช่น weaveTechnique/tags/province เดิม)
 */

import { useRef, useState } from "react";
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
import { useImageUpload } from "@/hooks/useImageUpload";

export const PRODUCT_CATEGORIES: { value: string; label: string }[] = [
  { value: "fabric", label: "Fabric" },
  { value: "clothing", label: "Clothing" },
  { value: "scarf", label: "Scarf" },
  { value: "bag", label: "Bag" },
  { value: "premium", label: "Premium" },
  { value: "decor", label: "Decoration" },
  { value: "others", label: "Others" },
];

const FABRIC_TYPES = ["Silk", "Cotton", "Handwoven", "Linen", "Blended"];

export interface ProductFormValues {
  name: string;
  nameEn: string;
  category: string;
  fabricType: string;
  price: string;
  priceUnit: string;
  stock: string;
  lowStockThreshold: string;
  description: string;
  descriptionEn: string;
  images: string[];
  hasGI: boolean;
  hasVariants: boolean;
}

export const emptyProductForm: ProductFormValues = {
  name: "", nameEn: "", category: "fabric", fabricType: "", price: "", priceUnit: "Meter",
  stock: "", lowStockThreshold: "5", description: "", descriptionEn: "", images: [], hasGI: false, hasVariants: false,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  const { uploadFile, uploading } = useImageUpload({
    bucket: "product-images",
    onSuccess: (result) => setForm((f) => (f.images.includes(result.url) || f.images.length >= 6 ? f : { ...f, images: [...f.images, result.url] })),
    onError: (msg) => setError(msg),
  });

  const uploadFiles = async (files: FileList | File[]) => {
    const remaining = 6 - form.images.length;
    const list = Array.from(files).slice(0, Math.max(remaining, 0));
    for (const file of list) {
      await uploadFile(file);
    }
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
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
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

      {/* Product Images — uploaded to Supabase Storage (bucket: product-images) */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 1 }}>
          Product Images (max 6)
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
        <input
          ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
          onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = ""; }}
        />
        <Box
          onClick={() => form.images.length < 6 && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
          }}
          sx={{
            border: "1.5px dashed", borderColor: dragOver ? "#C5A55A" : "#E5DFD6",
            borderRadius: "12px", py: 2.5, textAlign: "center",
            bgcolor: dragOver ? "rgba(197,165,90,0.06)" : "#FFFFFF",
            cursor: form.images.length >= 6 ? "not-allowed" : "pointer",
            opacity: form.images.length >= 6 ? 0.5 : 1,
            transition: "all 0.15s",
          }}
        >
          {uploading ? (
            <CircularProgress size={22} sx={{ color: "#C5A55A" }} />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
              <AddPhotoAlternateRoundedIcon sx={{ color: "#9CA3AF", fontSize: 26 }} />
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#6B7280" }}>
                {form.images.length >= 6 ? "Maximum 6 images reached" : "Drag & drop or click to select images"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <TextField required fullWidth label="ชื่อสินค้า (ภาษาไทย)" placeholder="กรอกชื่อสินค้าภาษาไทย" value={form.name} onChange={(e) => set("name", e.target.value)} sx={sx.field} />
        <TextField fullWidth label="Product Name (English)" placeholder="optional" value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} sx={sx.field} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FormControl fullWidth sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>Category *</InputLabel>
            <Select value={form.category} onChange={(e) => set("category", e.target.value)} label="Category *">
              {PRODUCT_CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value} sx={{ fontFamily: '"Kanit", sans-serif' }}>{c.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>Fabric Type</InputLabel>
            <Select value={form.fabricType} onChange={(e) => set("fabricType", e.target.value)} label="Fabric Type">
              <MenuItem value="" sx={{ fontFamily: '"Kanit", sans-serif' }}>Not specified</MenuItem>
              {FABRIC_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ fontFamily: '"Kanit", sans-serif' }}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 2 }}>
          <TextField required label="Price (THB)" type="number" inputProps={{ min: 0, step: "0.01" }}
            value={form.price} onChange={(e) => set("price", e.target.value)} sx={sx.field} />
          <FormControl sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>Unit</InputLabel>
            <Select value={form.priceUnit} onChange={(e) => set("priceUnit", e.target.value)} label="Unit">
              {["Meter", "Piece", "Yard", "Pair"].map((u) => <MenuItem key={u} value={u} sx={{ fontFamily: '"Kanit", sans-serif' }}>{u}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField required label="Stock" type="number" inputProps={{ min: 0 }}
            value={form.stock} onChange={(e) => set("stock", e.target.value)} sx={sx.field} />
        </Box>

        <TextField label="Low Stock Alert (units)" type="number" inputProps={{ min: 0 }}
          value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)}
          sx={{ ...sx.field, maxWidth: { sm: "50%" } }}
        />

        <TextField fullWidth multiline rows={4} label="รายละเอียดสินค้า (ภาษาไทย)" placeholder="กรอกรายละเอียดสินค้าภาษาไทย" value={form.description} onChange={(e) => set("description", e.target.value)} sx={sx.field} />
        <TextField fullWidth multiline rows={4} label="Product Description (English)" placeholder="optional" value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} sx={sx.field} />

        <FormControlLabel
          control={<Switch checked={form.hasGI} onChange={(e) => set("hasGI", e.target.checked)}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }} />}
          label={<Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.88rem", color: "#1B2A4A" }}>GI Certified product (Geographical Indication)</Typography>}
        />

        <FormControlLabel
          control={<Switch checked={form.hasVariants} onChange={(e) => set("hasVariants", e.target.checked)}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }} />}
          label={<Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.88rem", color: "#1B2A4A" }}>This product has multiple options (Color / Size / Pattern) — Multi-SKU</Typography>}
        />
        {form.hasVariants && (
          <Alert severity="info" sx={{ borderRadius: "10px", fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem" }}>
            The price/stock above will be used as defaults — go to the &ldquo;Manage SKU&rdquo; page after saving to set prices and stock per variant.
          </Alert>
        )}

        <Button type="submit" fullWidth variant="contained" disabled={loading || !canSubmit}
          sx={{ py: 1.5, mt: 1, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "#0F1A30" }, "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.4)", color: "#FFFFFF" } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
