"use client";

/**
 * ฟอร์มเพิ่ม/แก้ไขลายผ้าของร้านค้า — ใช้ร่วมกันทั้งหน้า create และ edit
 * ใช้ REGIONS/PROVINCES จาก lib/fabric-origins.ts (แหล่งข้อมูลภูมิภาค/จังหวัดชุดเดียวของระบบ)
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
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/useImageUpload";
import { REGIONS, PROVINCES } from "@/lib/fabric-origins";

export interface PatternFormValues {
  name: string;
  region: string;
  originProvince: string;
  community: string;
  description: string;
  storyHistory: string;
  storyWeaving: string;
  patternImages: string[];
  weavingProcessImages: string[];
}

export const emptyPatternForm: PatternFormValues = {
  name: "", region: "", originProvince: "", community: "", description: "",
  storyHistory: "", storyWeaving: "", patternImages: [], weavingProcessImages: [],
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

interface PatternFormProps {
  title: string;
  initial: PatternFormValues;
  submitLabel: string;
  onSubmit: (values: PatternFormValues) => Promise<void>;
}

function ImageGallery({
  label, images, onRemove, uploadFiles, uploading, max = 6,
}: {
  label: string; images: string[]; onRemove: (url: string) => void;
  uploadFiles: (files: FileList | File[]) => void; uploading: boolean; max?: number;
}) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 1 }}>
        {label} (สูงสุด {max} รูป)
      </Typography>
      {images.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
          {images.map((url) => (
            <Box key={url} sx={{ position: "relative", width: 64, height: 64, borderRadius: "10px", overflow: "hidden", bgcolor: "#F0EBE3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
              <IconButton size="small" onClick={() => onRemove(url)}
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
        onClick={() => images.length < max && fileInputRef.current?.click()}
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
          cursor: images.length >= max ? "not-allowed" : "pointer",
          opacity: images.length >= max ? 0.5 : 1,
          transition: "all 0.15s",
        }}
      >
        {uploading ? (
          <CircularProgress size={22} sx={{ color: "#C5A55A" }} />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
            <AddPhotoAlternateRoundedIcon sx={{ color: "#9CA3AF", fontSize: 26 }} />
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#6B7280" }}>
              {images.length >= max ? `ครบ ${max} รูปแล้ว` : "ลากรูปมาวาง หรือคลิกเพื่อเลือกไฟล์"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function PatternForm({ title, initial, submitLabel, onSubmit }: PatternFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PatternFormValues>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof PatternFormValues>(k: K, v: PatternFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  const patternUpload = useImageUpload({
    bucket: "pattern-images",
    folder: "pattern",
    onSuccess: (result) => setForm((f) => (f.patternImages.includes(result.url) || f.patternImages.length >= 6 ? f : { ...f, patternImages: [...f.patternImages, result.url] })),
    onError: (msg) => setError(msg),
  });
  const weavingUpload = useImageUpload({
    bucket: "pattern-images",
    folder: "weaving",
    onSuccess: (result) => setForm((f) => (f.weavingProcessImages.includes(result.url) || f.weavingProcessImages.length >= 6 ? f : { ...f, weavingProcessImages: [...f.weavingProcessImages, result.url] })),
    onError: (msg) => setError(msg),
  });

  const uploadPatternFiles = async (files: FileList | File[]) => {
    const remaining = 6 - form.patternImages.length;
    for (const file of Array.from(files).slice(0, Math.max(remaining, 0))) await patternUpload.uploadFile(file);
  };
  const uploadWeavingFiles = async (files: FileList | File[]) => {
    const remaining = 6 - form.weavingProcessImages.length;
    for (const file of Array.from(files).slice(0, Math.max(remaining, 0))) await weavingUpload.uploadFile(file);
  };

  const canSubmit = form.name.trim().length > 0;

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

  const selectedProvince = PROVINCES.find((p) => p.name === form.originProvince) ?? null;

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

      <ImageGallery label="ภาพลายผ้า" images={form.patternImages} uploading={patternUpload.uploading}
        uploadFiles={uploadPatternFiles} onRemove={(url) => set("patternImages", form.patternImages.filter((u) => u !== url))} />
      <ImageGallery label="ภาพกระบวนการทอ" images={form.weavingProcessImages} uploading={weavingUpload.uploading}
        uploadFiles={uploadWeavingFiles} onRemove={(url) => set("weavingProcessImages", form.weavingProcessImages.filter((u) => u !== url))} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <TextField fullWidth required label="ชื่อลายผ้า" value={form.name} onChange={(e) => set("name", e.target.value)} sx={sx.field} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FormControl fullWidth sx={sx.field}>
            <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>ภูมิภาค</InputLabel>
            <Select value={form.region} onChange={(e) => set("region", e.target.value)} label="ภูมิภาค">
              <MenuItem value="" sx={{ fontFamily: '"Kanit", sans-serif' }}>ไม่ระบุ</MenuItem>
              {Object.entries(REGIONS).map(([key, r]) => (
                <MenuItem key={key} value={key} sx={{ fontFamily: '"Kanit", sans-serif' }}>{r.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Autocomplete
            options={PROVINCES}
            getOptionLabel={(p) => p.name}
            value={selectedProvince}
            onChange={(_, v) => set("originProvince", v?.name ?? "")}
            renderInput={(params) => <TextField {...params} label="จังหวัดต้นกำเนิด" sx={sx.field} />}
            isOptionEqualToValue={(a, b) => a.id === b.id}
          />
        </Box>

        <TextField fullWidth label="ชุมชน" placeholder="เช่น ชุมชนทอผ้าบ้านหนองขาว"
          value={form.community} onChange={(e) => set("community", e.target.value)} sx={sx.field} />

        <TextField fullWidth multiline rows={2} label="คำแนะนำโดยย่อ" value={form.description} onChange={(e) => set("description", e.target.value)} sx={sx.field} />

        <TextField fullWidth multiline rows={4} label="เรื่องราว/ประวัติ" value={form.storyHistory} onChange={(e) => set("storyHistory", e.target.value)} sx={sx.field} />

        <TextField fullWidth multiline rows={4} label="กระบวนการทอ" value={form.storyWeaving} onChange={(e) => set("storyWeaving", e.target.value)} sx={sx.field} />

        <Button type="submit" fullWidth variant="contained" disabled={loading || !canSubmit}
          sx={{ py: 1.5, mt: 1, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "#0F1A30" }, "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.4)", color: "#FFFFFF" } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
