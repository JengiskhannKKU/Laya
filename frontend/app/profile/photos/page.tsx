"use client";

import { useState, useRef } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import MobileLayout from "@/components/layout/MobileLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

interface CustomerPhoto {
  id: string;
  url: string;
  label: string;
  uploadedAt: string;
  isDefault?: boolean;
}

const POSE_TIPS = [
  "ยืนตัวตรง แขนห้อยข้างลำตัวเล็กน้อย",
  "ใส่เสื้อผ้าแนบตัวหรือชุดว่ายน้ำ",
  "ถ่ายในที่แสงสว่างเพียงพอ",
  "พื้นหลังสีเรียบ ไม่มีลวดลาย",
  "ถ่ายเต็มตัว ตั้งแต่ศีรษะถึงเท้า",
];

const POSE_TYPES = [
  { key: "front", label: "รูปหน้าตรง", hint: "ยืนหันหน้าตรงเข้าหากล้อง" },
  { key: "side",  label: "รูปด้านข้าง", hint: "ยืนหันด้านข้าง 90 องศา" },
  { key: "back",  label: "รูปด้านหลัง", hint: "ยืนหันหลังเข้าหากล้อง" },
];

export default function CustomerPhotosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<CustomerPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPose, setSelectedPose] = useState("front");
  const [previewPhoto, setPreviewPhoto] = useState<CustomerPhoto | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { uploadFile } = useImageUpload({
    bucket: "avatars",
    folder: user?.id,
    onError: (msg) => setError(msg),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("ไฟล์ขนาดใหญ่เกินไป (สูงสุด 10MB)");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Upload ไปที่ Supabase Storage ผ่าน backend (แปลงเป็น WebP อัตโนมัติ)
      const result = await uploadFile(file);
      if (!result) return; // error จัดการใน hook แล้ว

      const poseLabel = POSE_TYPES.find((p) => p.key === selectedPose)?.label ?? selectedPose;
      const newPhoto: CustomerPhoto = {
        id: `p${Date.now()}`,
        url: result.url,           // Supabase public URL
        label: poseLabel,
        uploadedAt: new Date().toISOString().split("T")[0],
      };
      setPhotos((prev) => [...prev, newPhoto]);
      setSuccess("อัปโหลดรูปภาพสำเร็จ");
    } catch {
      setError("อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
    setSuccess("ตั้งเป็นรูปหลักแล้ว");
  };

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280" }}>
          กรุณาเข้าสู่ระบบก่อน
        </Typography>
      </Box>
    );
  }

  return (
    <MobileLayout><Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.15rem", fontWeight: 700, color: "#1B2A4A" }}>
          รูปถ่ายสำหรับ Virtual Try-On
        </Typography>
      </Box>

      <Box sx={{ px: 3 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Tips Card */}
        <Box sx={{ bgcolor: "#EEF3FF", borderRadius: "14px", p: 2, mb: 3, display: "flex", gap: 1.5 }}>
          <InfoOutlinedIcon sx={{ color: "#1B2A4A", mt: 0.2, flexShrink: 0, fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", fontSize: "0.88rem", mb: 0.5 }}>
              เคล็ดลับการถ่ายรูป
            </Typography>
            {POSE_TIPS.map((tip, i) => (
              <Typography key={i} sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", color: "#374151", lineHeight: 1.7 }}>
                • {tip}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Pose Selector */}
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
          เลือกประเภทรูป
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
          {POSE_TYPES.map((pt) => (
            <Chip
              key={pt.key}
              label={pt.label}
              onClick={() => setSelectedPose(pt.key)}
              sx={{
                fontFamily: '"Kanit", sans-serif', fontWeight: 600,
                bgcolor: selectedPose === pt.key ? "#1B2A4A" : "#FFFFFF",
                color: selectedPose === pt.key ? "#FFFFFF" : "#1B2A4A",
                border: "1.5px solid",
                borderColor: selectedPose === pt.key ? "#1B2A4A" : "#E5DFD6",
                "&:hover": { bgcolor: selectedPose === pt.key ? "#0F1A30" : "#F5F0EB" },
              }}
            />
          ))}
        </Box>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#9CA3AF", mb: 3 }}>
          {POSE_TYPES.find((p) => p.key === selectedPose)?.hint}
        </Typography>

        {/* Upload Button */}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        <Button
          variant="contained" fullWidth
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <AddPhotoAlternateRoundedIcon />}
          sx={{
            py: 1.5, bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "12px",
            fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none",
            fontSize: "0.95rem", mb: 4,
            boxShadow: "0 4px 14px rgba(197,165,90,0.3)",
            "&:hover": { bgcolor: "#B8953F" },
          }}
        >
          {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
        </Button>

        {/* Photo Grid */}
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
          รูปที่อัปโหลดแล้ว ({photos.length})
        </Typography>

        <AnimatePresence>
          {photos.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "#9CA3AF" }}>
              <AddPhotoAlternateRoundedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.9rem" }}>
                ยังไม่มีรูปถ่าย
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    sx={{
                      borderRadius: "14px", overflow: "hidden", position: "relative",
                      border: photo.isDefault ? "2.5px solid #C5A55A" : "2px solid #E5DFD6",
                      bgcolor: "#FFFFFF", cursor: "pointer",
                    }}
                    onClick={() => setPreviewPhoto(photo)}
                  >
                    <Box
                      component="img"
                      src={photo.url}
                      alt={photo.label}
                      sx={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
                    />
                    {photo.isDefault && (
                      <Box sx={{ position: "absolute", top: 8, left: 8 }}>
                        <Chip
                          icon={<CheckCircleRoundedIcon sx={{ fontSize: "14px !important" }} />}
                          label="รูปหลัก"
                          size="small"
                          sx={{ bgcolor: "#C5A55A", color: "#FFFFFF", fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", fontWeight: 700, height: 22 }}
                        />
                      </Box>
                    )}
                    <Box sx={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                        sx={{ bgcolor: "rgba(239,68,68,0.85)", color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: "#EF4444" } }}
                      >
                        <DeleteRoundedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                    <Box sx={{ px: 1.5, py: 1 }}>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>
                        {photo.label}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#9CA3AF" }}>
                        {photo.uploadedAt}
                      </Typography>
                    </Box>
                  </Box>
                  {!photo.isDefault && (
                    <Button
                      size="small" fullWidth
                      onClick={() => handleSetDefault(photo.id)}
                      sx={{ mt: 0.5, fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem", color: "#C5A55A", textTransform: "none" }}
                    >
                      ตั้งเป็นรูปหลัก
                    </Button>
                  )}
                </motion.div>
              ))}
            </Box>
          )}
        </AnimatePresence>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={!!previewPhoto} onClose={() => setPreviewPhoto(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", pb: 1 }}>
          {previewPhoto?.label}
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box
            component="img"
            src={previewPhoto?.url}
            alt={previewPhoto?.label}
            sx={{ width: "100%", borderRadius: "10px", objectFit: "cover" }}
          />
        </DialogContent>
      </Dialog>
    </Box></MobileLayout>
  );
}
