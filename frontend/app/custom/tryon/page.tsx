"use client";

import { useState, useRef } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Slider from "@mui/material/Slider";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const BLEND_LABELS = ["แบบ 25%", "แบบ 50%", "แบบ 75%", "แบบ 100%"];

export default function VirtualTryOnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designImage = searchParams.get("design") ?? null;

  const fileRef = useRef<HTMLInputElement>(null);

  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);
  const [resultImage,   setResultImage]   = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [error,         setError]         = useState("");
  const [blend,         setBlend]         = useState(2); // 0-3 index
  const [opacity,       setOpacity]       = useState(80);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResultImage(null);
    setSaved(false);
    const url = URL.createObjectURL(file);
    setCustomerPhoto(url);
  };

  const handleGenerate = async () => {
    if (!customerPhoto) return;
    setLoading(true);
    setError("");
    try {
      // TODO: POST /api/ai/tryon with designImage + customerPhoto
      await new Promise((r) => setTimeout(r, 2800));
      setResultImage("https://placehold.co/360x540/FAF6F0/1B2A4A?text=Virtual+Try-On+Result");
    } catch {
      setError("จำลองชุดไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resultImage) return;
    // TODO: POST /api/profile/tryon-results
    await new Promise((r) => setTimeout(r, 400));
    setSaved(true);
  };

  return (
    <MobileLayout><Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A" }}>
          Virtual Try-On
        </Typography>
      </Box>

      <Box sx={{ px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Two-panel preview */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
          {/* Design Panel */}
          <Box>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", fontWeight: 700, color: "#6B7280", mb: 1, textAlign: "center" }}>
              แบบเสื้อ
            </Typography>
            <Box
              sx={{
                borderRadius: "14px", overflow: "hidden", aspectRatio: "3/4",
                bgcolor: "#FFFFFF", border: "1.5px solid #E5DFD6",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {designImage ? (
                <Box component="img" src={designImage} alt="design" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#9CA3AF", p: 1, textAlign: "center" }}>
                  ยังไม่มีแบบ
                </Typography>
              )}
            </Box>
          </Box>

          {/* Customer Photo Panel */}
          <Box>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", fontWeight: 700, color: "#6B7280", mb: 1, textAlign: "center" }}>
              รูปของคุณ
            </Typography>
            <Box
              onClick={() => fileRef.current?.click()}
              sx={{
                borderRadius: "14px", overflow: "hidden", aspectRatio: "3/4",
                bgcolor: "#FFFFFF", border: "2px dashed #E5DFD6",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "border-color 0.2s",
                "&:hover": { borderColor: "#C5A55A" },
              }}
            >
              {customerPhoto ? (
                <Box component="img" src={customerPhoto} alt="customer" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <>
                  <AddPhotoAlternateRoundedIcon sx={{ fontSize: 32, color: "#C5A55A", mb: 0.5 }} />
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem", color: "#9CA3AF", textAlign: "center", px: 1 }}>
                    แตะเพื่อเลือกรูปถ่าย
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoSelect} />

        {/* Blend Controls (visible after photo selected) */}
        {customerPhoto && !resultImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "14px", p: 2.5, mb: 3, border: "1.5px solid #E5DFD6" }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
                ตั้งค่าการแสดงผล
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#374151", mb: 1 }}>
                  ระดับการผสมผสาน — <Box component="span" sx={{ color: "#C5A55A", fontWeight: 700 }}>{BLEND_LABELS[blend]}</Box>
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {BLEND_LABELS.map((l, i) => (
                    <Chip key={l} label={l} size="small" onClick={() => setBlend(i)}
                      sx={{
                        fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem",
                        bgcolor: blend === i ? "#1B2A4A" : "#F3F4F6",
                        color: blend === i ? "#FFFFFF" : "#374151",
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#374151", mb: 0.5 }}>
                  ความทึบของแบบ — <Box component="span" sx={{ color: "#C5A55A", fontWeight: 700 }}>{opacity}%</Box>
                </Typography>
                <Slider value={opacity} min={20} max={100} step={5}
                  onChange={(_, v) => setOpacity(v as number)}
                  sx={{ color: "#C5A55A", "& .MuiSlider-thumb": { bgcolor: "#C5A55A" } }}
                />
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Generate Button */}
        {!resultImage && (
          <Button
            variant="contained" fullWidth
            disabled={!customerPhoto || !designImage || loading}
            onClick={handleGenerate}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeRoundedIcon />}
            sx={{
              py: 1.5, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px",
              fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none",
              fontSize: "0.95rem", mb: 2,
              boxShadow: "0 4px 14px rgba(27,42,74,0.25)",
              "&:hover": { bgcolor: "#0F1A30" },
              "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.35)", color: "#FFFFFF" },
            }}
          >
            {loading ? "AI กำลังจำลองชุด..." : "จำลองชุดบนร่างกาย"}
          </Button>
        )}

        {/* Result */}
        {resultImage && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", overflow: "hidden", mb: 3, border: "2px solid #E5DFD6" }}>
              <Box component="img" src={resultImage} alt="Try-On Result" sx={{ width: "100%", display: "block" }} />
            </Box>

            <Divider sx={{ mb: 3, borderColor: "#E5DFD6" }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button
                variant="contained" fullWidth
                onClick={() => router.push("/custom/order")}
                startIcon={<ShoppingBagOutlinedIcon />}
                sx={{
                  py: 1.5, bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "12px",
                  fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none",
                  boxShadow: "0 4px 14px rgba(197,165,90,0.3)",
                }}
              >
                สั่งตัดด้วยแบบนี้
              </Button>

              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  variant="outlined" fullWidth
                  onClick={handleSave}
                  disabled={saved}
                  startIcon={saved ? <BookmarkRoundedIcon sx={{ color: "#C5A55A" }} /> : <BookmarkBorderRoundedIcon />}
                  sx={{
                    py: 1.3, borderColor: "#E5DFD6", color: saved ? "#C5A55A" : "#1B2A4A",
                    borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none",
                  }}
                >
                  {saved ? "บันทึกแล้ว" : "บันทึกภาพ"}
                </Button>
                <Button
                  variant="outlined" fullWidth
                  onClick={() => { setResultImage(null); setSaved(false); }}
                  sx={{
                    py: 1.3, borderColor: "#E5DFD6", color: "#1B2A4A",
                    borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none",
                  }}
                >
                  ลองใหม่
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Tip */}
        {!customerPhoto && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "#FDF8EE", borderRadius: "12px", border: "1.5px solid #F0E6CC" }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#92652A", textAlign: "center" }}>
              ใช้รูปถ่ายเต็มตัว พื้นหลังสีเรียบ แสงสว่างเพียงพอ เพื่อผลลัพธ์ที่ดีที่สุด
            </Typography>
          </Box>
        )}
      </Box>
    </Box></MobileLayout>
  );
}
