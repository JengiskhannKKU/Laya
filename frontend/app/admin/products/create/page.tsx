"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Switch from "@mui/material/Switch";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════
const THAI_PROVINCES = [
  "กรุงเทพมหานคร","กระบี่","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร","ขอนแก่น","จันทบุรี","ฉะเชิงเทรา",
  "ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่","ตรัง","ตราด","ตาก","นครนายก",
  "นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี","นราธิวาส","น่าน",
  "บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี","พระนครศรีอยุธยา",
  "พังงา","พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์","แพร่","พะเยา","ภูเก็ต",
  "มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน","ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง","ราชบุรี",
  "ลพบุรี","ลำปาง","ลำพูน","เลย","ศรีสะเกษ","สกลนคร","สงขลา","สตูล","สมุทรปราการ",
  "สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี","สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี",
  "สุรินทร์","หนองคาย","หนองบัวลำภู","อ่างทอง","อุดรธานี","อุทัยธานี","อุตรดิตถ์","อุบลราชธานี","อำนาจเจริญ",
];

const COMMUNITIES = [
  "ชุมชนหริภุญชัย",
  "กลุ่มทอผ้าบ้านเขว้า",
  "กลุ่มทอผ้าครามสกลนคร",
  "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว",
  "กลุ่มทอผ้าจกราชบุรี",
  "กลุ่มคนรุ่นใหม่หริภุญชัย",
  "อื่น ๆ",
];

const FABRIC_TYPES = ["มัดหมี่", "แพรวา", "ยกดอก", "จก", "ฝ้ายทอมือ", "ผ้าไหม", "ขิด", "ทอพื้น", "ย้อมคราม"];
const DYE_TYPES = ["ธรรมชาติ", "เคมี", "ผสม (ธรรมชาติ + เคมี)"];

// ═══════════════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════════════
interface FormData {
  name: string;
  story: string;
  community: string;
  province: string;
  fabricType: string;
  dyeType: string;
  price: string;
  stock: string;
  status: "active" | "draft";
  imagePreview: string | null;
  imageUrl: string | null; // Supabase public URL หลัง upload
}

interface FormErrors {
  name?: string;
  story?: string;
  community?: string;
  province?: string;
  fabricType?: string;
  dyeType?: string;
  price?: string;
  stock?: string;
}

const initialForm: FormData = {
  name: "",
  story: "",
  community: "",
  province: "",
  fabricType: "",
  dyeType: "",
  price: "",
  stock: "",
  status: "draft",
  imagePreview: null,
  imageUrl: null,
};

// ═══════════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════════
export default function CreateProductPage() {
  const router = useRouter();
  const { mode, toggleMode, c } = useAdminTheme();
  const tr = "all 0.3s ease";

  // ── State ──
  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile: uploadImageFile } = useImageUpload({
    bucket: "product-images",
    onSuccess: (result) => {
      updateField("imageUrl", result.url);
    },
    onError: () => {},
  });

  // ── Dirty tracking ──
  useEffect(() => {
    const isModified = Object.keys(form).some((key) => {
      const k = key as keyof FormData;
      if (k === "status") return form[k] !== "draft";
      if (k === "imagePreview") return form[k] !== null;
      return form[k] !== "";
    });
    setIsDirty(isModified);
  }, [form]);

  // ── Update helpers ──
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Image upload ──
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    // แสดง local preview ทันที (optimistic UI)
    const reader = new FileReader();
    reader.onload = (e) => {
      updateField("imagePreview", e.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Upload จริงไปที่ Supabase (async, แปลงเป็น WebP)
    setImageUploading(true);
    await uploadImageFile(file);
    setImageUploading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadImageFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  // ── Validation ──
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "กรุณากรอกชื่อสินค้า";
    if (!form.story.trim()) newErrors.story = "กรุณากรอกเรื่องราว / จุดเด่นของผ้า";
    if (!form.community) newErrors.community = "กรุณาเลือกชุมชนทอผ้า";
    if (!form.province) newErrors.province = "กรุณาเลือกจังหวัด";
    if (!form.fabricType) newErrors.fabricType = "กรุณาเลือกประเภทผ้า";
    if (!form.dyeType) newErrors.dyeType = "กรุณาเลือกประเภทย้อม";
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = "ราคาต้องมากกว่า 0";
    if (!form.stock || parseInt(form.stock) < 0) newErrors.stock = "จำนวนสต็อกต้องไม่ติดลบ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Save ──
  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newProduct = {
      id: `new-${Date.now()}`,
      name: form.name.trim(),
      // ใช้ Supabase URL ถ้า upload สำเร็จ หรือ preview/fallback
      image: form.imageUrl || form.imagePreview || "/images/fabric1.webp",
      images: form.imageUrl ? [form.imageUrl] : [],
      community: form.community,
      province: form.province,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      status: form.status,
      hasGI: false,
      soldCount: 0,
      rating: 0,
      // Extra fields
      story: form.story.trim(),
      fabricType: form.fabricType,
      dyeType: form.dyeType,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("laya-custom-products") || "[]");
    existing.push(newProduct);
    localStorage.setItem("laya-custom-products", JSON.stringify(existing));

    setIsSaving(false);
    setIsDirty(false);
    setShowSuccess(true);

    // Redirect after toast
    setTimeout(() => {
      router.push("/admin/products");
    }, 1200);
  };

  // ── Exit guard ──
  const handleBack = () => {
    if (isDirty) {
      setShowExitDialog(true);
    } else {
      router.push("/admin/products");
    }
  };

  // ── Shared input styles ──
  const inputSx = (hasError?: string) => ({
    "& .MuiOutlinedInput-root": {
      color: c.textPrimary,
      bgcolor: c.bgInputField,
      borderRadius: "10px",
      transition: tr,
      "& fieldset": {
        borderColor: hasError ? "#EF4444" : c.borderInput,
        borderWidth: hasError ? 2 : 1,
        transition: tr,
      },
      "&:hover fieldset": { borderColor: hasError ? "#EF4444" : c.gold },
      "&.Mui-focused fieldset": { borderColor: hasError ? "#EF4444" : c.gold },
    },
    "& .MuiInputLabel-root": { color: c.textMuted, "&.Mui-focused": { color: hasError ? "#EF4444" : c.gold } },
    "& .MuiInputAdornment-root": { color: c.textMuted },
  });

  const selectSx = (hasError?: string) => ({
    bgcolor: c.bgInputField,
    borderRadius: "10px",
    color: c.textPrimary,
    transition: tr,
    "& fieldset": {
      borderColor: hasError ? "#EF4444" : c.borderInput,
      borderWidth: hasError ? 2 : 1,
    },
    "&:hover fieldset": { borderColor: hasError ? "#EF4444" : c.gold },
    "&.Mui-focused fieldset": { borderColor: hasError ? "#EF4444" : c.gold },
    "& .MuiSelect-icon": { color: c.textMuted },
  });

  const labelSx = { color: c.textMuted, "&.Mui-focused": { color: c.gold } };

  const cardSx = {
    bgcolor: c.bgCard,
    borderRadius: "14px",
    border: `1px solid ${c.borderCard}`,
    p: 2.5,
    transition: tr,
  };

  const errorText = (msg?: string) =>
    msg ? (
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <Typography sx={{ color: "#EF4444", fontSize: "0.75rem", mt: 0.5, ml: 0.5, fontWeight: 500 }}>
          {msg}
        </Typography>
      </motion.div>
    ) : null;

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* ── Top Bar ── */}
        <Box
          sx={{
            px: 3, py: 2,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            bgcolor: c.bgTopbar, borderBottom: `1px solid ${c.borderCard}`,
            position: "sticky", top: 0, zIndex: 50, transition: tr,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={handleBack} sx={{ color: c.textPrimary }}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: c.textPrimary, transition: tr }}>
                เพิ่มสินค้าใหม่
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, transition: tr }}>
                กรอกรายละเอียดสินค้าเพื่อเพิ่มในระบบ
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Save Button (desktop) */}
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={18} sx={{ color: c.textOnGold }} /> : <SaveRoundedIcon />}
              disabled={isSaving}
              onClick={handleSave}
              sx={{
                bgcolor: c.gold, color: c.textOnGold, borderRadius: "10px",
                fontWeight: 700, textTransform: "none", px: 3,
                display: { xs: "none", sm: "flex" },
                "&:hover": { bgcolor: c.goldHover },
                "&.Mui-disabled": { bgcolor: c.goldSubtle, color: c.textMuted },
              }}
            >
              {isSaving ? "กำลังบันทึก…" : "บันทึกสินค้า"}
            </Button>

            <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"}>
              <IconButton onClick={toggleMode} sx={{ color: c.textSecondary, bgcolor: c.goldSubtle, width: 36, height: 36, "&:hover": { bgcolor: c.gold, color: c.textOnGold } }}>
                {mode === "dark" ? <LightModeRoundedIcon sx={{ fontSize: 20 }} /> : <DarkModeRoundedIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>
            <IconButton sx={{ color: c.textSecondary }}><NotificationsRoundedIcon sx={{ fontSize: 22 }} /></IconButton>
            <Avatar sx={{ width: 32, height: 32, bgcolor: c.gold, fontSize: "0.8rem", fontWeight: 700, color: c.textOnGold }}>A</Avatar>
          </Box>
        </Box>

        {/* ── Content ── */}
        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "7fr 3fr" },
              gap: 3,
              maxWidth: 1200,
              mx: "auto",
            }}
          >
            {/* ═══════════════════════════════════════════════════ */}
            {/* LEFT COLUMN — Main Content (70%) */}
            {/* ═══════════════════════════════════════════════════ */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* ── General Info Card ── */}
              <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} sx={cardSx}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 2.5, transition: tr }}>
                  📋 ข้อมูลทั่วไป
                </Typography>

                {/* Product Name */}
                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    label="ชื่อสินค้า"
                    placeholder="เช่น ผ้าไหมมัดหมี่ลายนาคราช"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    error={!!errors.name}
                    sx={inputSx(errors.name)}
                    InputProps={{
                      sx: { fontSize: "1rem", fontWeight: 600 },
                    }}
                  />
                  {errorText(errors.name)}
                </Box>

                {/* Story */}
                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={8}
                    label="เรื่องราว / Story"
                    placeholder="เล่าเรื่องราวของผ้า เช่น แหล่งที่มา เทคนิคการทอ ความหมายของลาย ใครเป็นผู้ทอ…"
                    value={form.story}
                    onChange={(e) => updateField("story", e.target.value)}
                    error={!!errors.story}
                    sx={inputSx(errors.story)}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                    <Box>{errorText(errors.story)}</Box>
                    <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>
                      {form.story.length} / 500
                    </Typography>
                  </Box>
                </Box>

                {/* Community & Province Row */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box>
                    <FormControl fullWidth error={!!errors.community}>
                      <InputLabel sx={labelSx}>ชุมชน / กลุ่มทอผ้า</InputLabel>
                      <Select
                        value={form.community}
                        label="ชุมชน / กลุ่มทอผ้า"
                        onChange={(e) => updateField("community", e.target.value)}
                        sx={selectSx(errors.community)}
                        MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary, maxHeight: 300 } } }}
                      >
                        {COMMUNITIES.map((cm) => (
                          <MenuItem key={cm} value={cm}>{cm}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {errorText(errors.community)}
                  </Box>
                  <Box>
                    <FormControl fullWidth error={!!errors.province}>
                      <InputLabel sx={labelSx}>จังหวัด</InputLabel>
                      <Select
                        value={form.province}
                        label="จังหวัด"
                        onChange={(e) => updateField("province", e.target.value)}
                        sx={selectSx(errors.province)}
                        MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary, maxHeight: 300 } } }}
                      >
                        {THAI_PROVINCES.map((pv) => (
                          <MenuItem key={pv} value={pv}>{pv}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {errorText(errors.province)}
                  </Box>
                </Box>
              </Box>

              {/* ── Attributes Card ── */}
              <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} sx={cardSx}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 2.5, transition: tr }}>
                  🏷️ คุณลักษณะ
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box>
                    <FormControl fullWidth error={!!errors.fabricType}>
                      <InputLabel sx={labelSx}>ประเภทผ้า</InputLabel>
                      <Select
                        value={form.fabricType}
                        label="ประเภทผ้า"
                        onChange={(e) => updateField("fabricType", e.target.value)}
                        sx={selectSx(errors.fabricType)}
                        MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}
                      >
                        {FABRIC_TYPES.map((ft) => (
                          <MenuItem key={ft} value={ft}>{ft}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {errorText(errors.fabricType)}
                  </Box>
                  <Box>
                    <FormControl fullWidth error={!!errors.dyeType}>
                      <InputLabel sx={labelSx}>ประเภทย้อม</InputLabel>
                      <Select
                        value={form.dyeType}
                        label="ประเภทย้อม"
                        onChange={(e) => updateField("dyeType", e.target.value)}
                        sx={selectSx(errors.dyeType)}
                        MenuProps={{ PaperProps: { sx: { bgcolor: c.bgCard, color: c.textPrimary } } }}
                      >
                        {DYE_TYPES.map((dt) => (
                          <MenuItem key={dt} value={dt}>{dt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {errorText(errors.dyeType)}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* ═══════════════════════════════════════════════════ */}
            {/* RIGHT COLUMN — Sidebar (30%) */}
            {/* ═══════════════════════════════════════════════════ */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* ── Pricing Card ── */}
              <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} sx={cardSx}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: c.textPrimary, mb: 2, transition: tr }}>
                  💰 ราคา
                </Typography>
                <TextField
                  fullWidth
                  label="ราคา"
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  error={!!errors.price}
                  sx={inputSx(errors.price)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Typography sx={{ color: c.gold, fontWeight: 700 }}>฿</Typography></InputAdornment>,
                  }}
                />
                {errorText(errors.price)}
              </Box>

              {/* ── Stock Card ── */}
              <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} sx={cardSx}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: c.textPrimary, mb: 2, transition: tr }}>
                  📦 จำนวนสต็อก
                </Typography>
                <TextField
                  fullWidth
                  label="จำนวนสินค้า"
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  error={!!errors.stock}
                  sx={inputSx(errors.stock)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography sx={{ color: c.textMuted, fontSize: "0.8rem" }}>ชิ้น</Typography></InputAdornment>,
                  }}
                />
                {errorText(errors.stock)}
              </Box>

              {/* ── Status Card ── */}
              <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} sx={cardSx}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: c.textPrimary, mb: 1, transition: tr }}>
                  🚀 สถานะ
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.85rem", color: c.textPrimary, fontWeight: 600, transition: tr }}>
                      {form.status === "active" ? "Active" : "Draft"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, transition: tr }}>
                      {form.status === "active" ? "สินค้าจะแสดงผลทันที" : "สินค้ายังไม่แสดงผล"}
                    </Typography>
                  </Box>
                  <Switch
                    checked={form.status === "active"}
                    onChange={(_, checked) => updateField("status", checked ? "active" : "draft")}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#22C55E" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#22C55E" },
                      "& .MuiSwitch-track": { bgcolor: c.borderInput },
                    }}
                  />
                </Box>
                <Box sx={{
                  mt: 1.5, px: 1.5, py: 1, borderRadius: "8px",
                  bgcolor: form.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                  display: "flex", alignItems: "center", gap: 1,
                }}>
                  <Box sx={{
                    width: 8, height: 8, borderRadius: "50%",
                    bgcolor: form.status === "active" ? "#22C55E" : "#F59E0B",
                    animation: form.status === "active" ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.5 },
                    },
                  }} />
                  <Typography sx={{ fontSize: "0.7rem", color: form.status === "active" ? "#22C55E" : "#F59E0B", fontWeight: 600 }}>
                    {form.status === "active" ? "พร้อมขาย" : "ฉบับร่าง"}
                  </Typography>
                </Box>
              </Box>

              {/* ── Image Upload Card ── */}
              <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} sx={cardSx}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: c.textPrimary, mb: 2, transition: tr }}>
                  🖼️ รูปภาพสินค้า
                </Typography>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
                  }}
                />

                <AnimatePresence mode="wait">
                  {form.imagePreview ? (
                    /* ── Preview ── */
                    <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                      <Box
                        sx={{ position: "relative", borderRadius: "12px", overflow: "hidden", cursor: "pointer" }}
                        onMouseEnter={() => setImageHover(true)}
                        onMouseLeave={() => setImageHover(false)}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.imagePreview}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            display: "block",
                            borderRadius: 12,
                          }}
                        />
                        {/* Hover overlay */}
                        <AnimatePresence>
                          {imageHover && (
                            <Box
                              component={motion.div}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              sx={{
                                position: "absolute", inset: 0,
                                bgcolor: "rgba(0,0,0,0.5)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexDirection: "column", gap: 1,
                              }}
                            >
                              <CameraAltRoundedIcon sx={{ fontSize: 32, color: "#FFF" }} />
                              <Typography sx={{ color: "#FFF", fontSize: "0.8rem", fontWeight: 600 }}>
                                เปลี่ยนรูป
                              </Typography>
                            </Box>
                          )}
                        </AnimatePresence>
                      </Box>
                      {/* Delete button */}
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
                        <Button
                          size="small"
                          startIcon={<DeleteRoundedIcon sx={{ fontSize: 16 }} />}
                          onClick={(e) => { e.stopPropagation(); updateField("imagePreview", null); }}
                          sx={{
                            color: "#EF4444", fontSize: "0.75rem", textTransform: "none", fontWeight: 600,
                            borderRadius: "8px", px: 2,
                            "&:hover": { bgcolor: "rgba(239,68,68,0.1)" },
                          }}
                        >
                          ลบรูป
                        </Button>
                      </Box>
                    </motion.div>
                  ) : (
                    /* ── Drop Zone ── */
                    <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Box
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          border: `2px dashed ${dragActive ? c.gold : c.borderInput}`,
                          borderRadius: "12px",
                          p: 4,
                          display: "flex", flexDirection: "column", alignItems: "center",
                          justifyContent: "center", gap: 1.5,
                          cursor: "pointer",
                          bgcolor: dragActive ? c.goldSubtle : "transparent",
                          transition: tr,
                          "&:hover": { borderColor: c.gold, bgcolor: c.goldSubtle },
                          minHeight: 160,
                        }}
                      >
                        <Box
                          component={motion.div}
                          animate={{ y: dragActive ? -5 : 0 }}
                          sx={{
                            width: 52, height: 52, borderRadius: "14px",
                            bgcolor: c.goldSubtle, display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <CloudUploadRoundedIcon sx={{ fontSize: 26, color: c.gold }} />
                        </Box>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary, textAlign: "center", transition: tr }}>
                          ลากรูปภาพมาวางที่นี่
                        </Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, textAlign: "center", transition: tr }}>
                          หรือ คลิกเพื่อเลือกไฟล์
                        </Typography>
                        <Box sx={{
                          mt: 0.5, px: 2, py: 0.5, borderRadius: "6px",
                          bgcolor: c.goldSubtle,
                        }}>
                          <Typography sx={{ fontSize: "0.65rem", color: c.gold, fontWeight: 600 }}>
                            JPG, PNG, WEBP (สูงสุด 5MB)
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </Box>
          </Box>

          {/* ── Mobile Save Button (Fixed Bottom) ── */}
          <Box sx={{
            display: { xs: "block", sm: "none" },
            position: "fixed", bottom: 0, left: 0, right: 0,
            p: 2, bgcolor: c.bgTopbar,
            borderTop: `1px solid ${c.borderCard}`,
            zIndex: 100,
          }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={18} sx={{ color: c.textOnGold }} /> : <SaveRoundedIcon />}
              disabled={isSaving}
              onClick={handleSave}
              sx={{
                bgcolor: c.gold, color: c.textOnGold, borderRadius: "12px",
                fontWeight: 700, textTransform: "none", py: 1.5, fontSize: "1rem",
                "&:hover": { bgcolor: c.goldHover },
                "&.Mui-disabled": { bgcolor: c.goldSubtle, color: c.textMuted },
              }}
            >
              {isSaving ? "กำลังบันทึก…" : "บันทึกสินค้า"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Exit Confirmation Dialog */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Dialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px",
            maxWidth: 400, mx: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: "10px",
            bgcolor: "rgba(245,158,11,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <WarningAmberRoundedIcon sx={{ color: "#F59E0B", fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem" }}>
            ยังไม่ได้บันทึกข้อมูล
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary, lineHeight: 1.6 }}>
            คุณยังไม่ได้บันทึกข้อมูลสินค้า ต้องการออกจากหน้านี้หรือไม่?
            ข้อมูลที่กรอกไว้จะสูญหาย
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setShowExitDialog(false)}
            sx={{
              color: c.textSecondary, borderRadius: "10px", textTransform: "none",
              fontWeight: 600, px: 2.5,
            }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={() => { setShowExitDialog(false); router.push("/admin/products"); }}
            sx={{
              bgcolor: "#EF4444", color: "#FFF", borderRadius: "10px",
              textTransform: "none", fontWeight: 700, px: 2.5,
              "&:hover": { bgcolor: "#DC2626" },
            }}
          >
            ออกโดยไม่บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Success Toast */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert
          icon={<CheckCircleRoundedIcon sx={{ fontSize: 22 }} />}
          severity="success"
          sx={{
            bgcolor: "#065F46", color: "#ECFDF5",
            borderRadius: "12px", fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            "& .MuiAlert-icon": { color: "#34D399" },
          }}
        >
          เพิ่มสินค้าสำเร็จ 🎉
        </Alert>
      </Snackbar>
    </Box>
  );
}
