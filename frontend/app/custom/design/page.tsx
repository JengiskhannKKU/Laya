"use client";

import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Slider from "@mui/material/Slider";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ── Data ───────────────────────────────────────────────────────────────────────
const BASE_SHAPES = [
  { id: "shirt",  label: "เสื้อเชิ้ต",    icon: "👔", desc: "ทรงคลาสสิก ปกคอ แขนยาว/สั้น" },
  { id: "blouse", label: "เสื้อสตรี",      icon: "👗", desc: "ทรงสวมหัว หลวมสบาย" },
  { id: "dress",  label: "ชุดเดรส",        icon: "👘", desc: "ทรงชุดยาว เหมาะพิธีการ" },
  { id: "suit",   label: "ชุดสูท",         icon: "🧥", desc: "ทรงสูทสากล ทางการ" },
  { id: "jacket", label: "เสื้อแจ็กเก็ต", icon: "🥋", desc: "ทรงแจ็กเก็ต มีซับใน" },
  { id: "skirt",  label: "กระโปรง",       icon: "👗", desc: "กระโปรงทรงต่างๆ" },
];

const COLLAR_TYPES  = ["คอปก", "คอจีน", "คอวี", "คอกลม", "คอเต่า", "ไม่มีปก"];
const SLEEVE_TYPES  = ["แขนยาว", "แขนสามส่วน", "แขนสั้น", "ไม่มีแขน", "แขนสปาเก็ตตี้"];
const FIT_LABELS    = ["หลวมมาก", "หลวม", "พอดี", "เข้ารูป", "เข้ารูปมาก"];

const STEPS = ["เลือกรูปทรง", "รายละเอียด", "AI สร้าง"];

// ── Types ──────────────────────────────────────────────────────────────────────
interface DesignSpec {
  shape: string;
  collar: string;
  sleeve: string;
  fit: number;          // 0-4
  length: number;       // cm
  notes: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function AIShapeDesignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fabricImage = searchParams.get("fabric") ?? null;

  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [spec, setSpec] = useState<DesignSpec>({
    shape: "",
    collar: "คอปก",
    sleeve: "แขนยาว",
    fit: 2,
    length: 65,
    notes: "",
  });

  const canNext = step === 0 ? !!spec.shape : true;

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      // TODO: POST /api/ai/design with spec + fabricImage
      await new Promise((r) => setTimeout(r, 2500));
      // Mock result
      setGeneratedImage("https://placehold.co/360x480/1B2A4A/C5A55A?text=AI+Design+Result");
      setStep(2);
    } catch {
      setError("ไม่สามารถสร้างแบบได้ในขณะนี้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout><Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A" }}>
          AI Shape Design
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ px: 3, mb: 3 }}>
        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((s) => (
            <Step key={s}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": { fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem" },
                  "& .MuiStepIcon-root.Mui-active": { color: "#C5A55A" },
                  "& .MuiStepIcon-root.Mui-completed": { color: "#1B2A4A" },
                }}
              >
                {s}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {error && (
        <Box sx={{ px: 3, mb: 2 }}>
          <Alert severity="error" sx={{ borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }} onClose={() => setError("")}>
            {error}
          </Alert>
        </Box>
      )}

      <AnimatePresence mode="wait">
        {/* ── Step 0: เลือกรูปทรง ── */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Box sx={{ px: 3 }}>
              {fabricImage && (
                <Box sx={{ mb: 3, borderRadius: "14px", overflow: "hidden", maxHeight: 160, display: "flex", justifyContent: "center", bgcolor: "#FFFFFF", border: "1.5px solid #E5DFD6" }}>
                  <Box component="img" src={fabricImage} alt="ผ้าที่เลือก" sx={{ height: 160, objectFit: "cover" }} />
                </Box>
              )}

              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
                เลือกรูปทรงพื้นฐาน
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                {BASE_SHAPES.map((shape) => (
                  <Box
                    key={shape.id}
                    onClick={() => setSpec((s) => ({ ...s, shape: shape.id }))}
                    sx={{
                      p: 2, borderRadius: "14px", cursor: "pointer", textAlign: "center",
                      border: "2px solid",
                      borderColor: spec.shape === shape.id ? "#C5A55A" : "#E5DFD6",
                      bgcolor: spec.shape === shape.id ? "#FDF8EE" : "#FFFFFF",
                      transition: "all 0.15s",
                    }}
                  >
                    <Typography sx={{ fontSize: "2rem", mb: 0.5 }}>{shape.icon}</Typography>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", fontSize: "0.9rem" }}>
                      {shape.label}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem", color: "#9CA3AF", mt: 0.3 }}>
                      {shape.desc}
                    </Typography>
                    {spec.shape === shape.id && (
                      <CheckRoundedIcon sx={{ color: "#C5A55A", fontSize: 18, mt: 0.5 }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </motion.div>
        )}

        {/* ── Step 1: รายละเอียด ── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Box sx={{ px: 3, display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Collar */}
              <Box>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
                  ประเภทคอ
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {COLLAR_TYPES.map((c) => (
                    <Chip key={c} label={c} onClick={() => setSpec((s) => ({ ...s, collar: c }))}
                      sx={{
                        fontFamily: '"Kanit", sans-serif', fontWeight: 600,
                        bgcolor: spec.collar === c ? "#1B2A4A" : "#FFFFFF",
                        color: spec.collar === c ? "#FFFFFF" : "#1B2A4A",
                        border: "1.5px solid", borderColor: spec.collar === c ? "#1B2A4A" : "#E5DFD6",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Sleeve */}
              <Box>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
                  ประเภทแขน
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {SLEEVE_TYPES.map((sl) => (
                    <Chip key={sl} label={sl} onClick={() => setSpec((s) => ({ ...s, sleeve: sl }))}
                      sx={{
                        fontFamily: '"Kanit", sans-serif', fontWeight: 600,
                        bgcolor: spec.sleeve === sl ? "#1B2A4A" : "#FFFFFF",
                        color: spec.sleeve === sl ? "#FFFFFF" : "#1B2A4A",
                        border: "1.5px solid", borderColor: spec.sleeve === sl ? "#1B2A4A" : "#E5DFD6",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Fit */}
              <Box>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
                  ความพอดี — <Box component="span" sx={{ color: "#C5A55A" }}>{FIT_LABELS[spec.fit]}</Box>
                </Typography>
                <Slider
                  value={spec.fit} min={0} max={4} step={1}
                  onChange={(_, v) => setSpec((s) => ({ ...s, fit: v as number }))}
                  marks={FIT_LABELS.map((l, i) => ({ value: i, label: "" }))}
                  sx={{ color: "#C5A55A", "& .MuiSlider-thumb": { bgcolor: "#C5A55A" } }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: -1 }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#9CA3AF" }}>หลวม</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#9CA3AF" }}>เข้ารูป</Typography>
                </Box>
              </Box>

              {/* Length */}
              <Box>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
                  ความยาวชุด — <Box component="span" sx={{ color: "#C5A55A" }}>{spec.length} ซม.</Box>
                </Typography>
                <Slider
                  value={spec.length} min={40} max={130} step={1}
                  onChange={(_, v) => setSpec((s) => ({ ...s, length: v as number }))}
                  sx={{ color: "#C5A55A", "& .MuiSlider-thumb": { bgcolor: "#C5A55A" } }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: -1 }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#9CA3AF" }}>40 ซม.</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.7rem", color: "#9CA3AF" }}>130 ซม.</Typography>
                </Box>
              </Box>

              {/* Notes */}
              <TextField
                fullWidth multiline rows={3}
                label="รายละเอียดเพิ่มเติม (ถ้ามี)"
                placeholder="เช่น ต้องการกระเป๋า 2 ข้าง, ซิปด้านหลัง..."
                value={spec.notes}
                onChange={(e) => setSpec((s) => ({ ...s, notes: e.target.value }))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF", borderRadius: "12px",
                    "& fieldset": { borderColor: "#E5DFD6" },
                    "&:hover fieldset": { borderColor: "#C5A55A" },
                    "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#C5A55A" },
                  "& .MuiInputBase-root": { fontFamily: '"Kanit", sans-serif' },
                  "& label": { fontFamily: '"Kanit", sans-serif' },
                }}
              />
            </Box>
          </motion.div>
        )}

        {/* ── Step 2: ผลลัพธ์ AI ── */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ px: 3, textAlign: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
                <AutoAwesomeRoundedIcon sx={{ color: "#C5A55A" }} />
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
                  AI สร้างแบบเสร็จแล้ว
                </Typography>
              </Box>

              {generatedImage && (
                <Box sx={{ borderRadius: "16px", overflow: "hidden", mb: 3, border: "2px solid #E5DFD6" }}>
                  <Box component="img" src={generatedImage} alt="AI Generated Design" sx={{ width: "100%", display: "block" }} />
                </Box>
              )}

              {/* Design Summary */}
              <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "14px", p: 2.5, mb: 3, border: "1.5px solid #E5DFD6", textAlign: "left" }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A", mb: 1.5 }}>
                  สรุปแบบที่เลือก
                </Typography>
                {[
                  ["รูปทรง", BASE_SHAPES.find((s) => s.id === spec.shape)?.label],
                  ["ประเภทคอ", spec.collar],
                  ["ประเภทแขน", spec.sleeve],
                  ["ความพอดี", FIT_LABELS[spec.fit]],
                  ["ความยาว", `${spec.length} ซม.`],
                ].map(([k, v]) => (
                  <Box key={k} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#9CA3AF" }}>{k}</Typography>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>{v}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Button
                  variant="contained" fullWidth
                  onClick={() => router.push("/custom/tryon?design=" + encodeURIComponent(generatedImage ?? ""))}
                  sx={{
                    py: 1.5, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px",
                    fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none",
                  }}
                >
                  ลองชุดบนร่างกาย (Virtual Try-On)
                </Button>
                <Button
                  variant="outlined" fullWidth
                  onClick={() => { setStep(1); setGeneratedImage(null); }}
                  sx={{
                    py: 1.3, borderColor: "#E5DFD6", color: "#1B2A4A", borderRadius: "12px",
                    fontWeight: 600, fontFamily: '"Kanit", sans-serif', textTransform: "none",
                  }}
                >
                  แก้ไขรายละเอียด
                </Button>
                <Button
                  variant="text" fullWidth
                  onClick={handleGenerate}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesomeRoundedIcon />}
                  sx={{ py: 1, color: "#C5A55A", fontFamily: '"Kanit", sans-serif', textTransform: "none", fontWeight: 600 }}
                >
                  สร้างแบบใหม่อีกครั้ง
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {step < 2 && (
        <Box sx={{ px: 3, mt: 4, display: "flex", gap: 2 }}>
          {step > 0 && (
            <Button
              variant="outlined" onClick={() => setStep((s) => s - 1)}
              sx={{ flex: 1, py: 1.4, borderColor: "#E5DFD6", color: "#1B2A4A", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
            >
              ย้อนกลับ
            </Button>
          )}
          {step === 0 && (
            <Button
              variant="contained" fullWidth disabled={!canNext}
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => setStep(1)}
              sx={{ py: 1.4, bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none" }}
            >
              ถัดไป
            </Button>
          )}
          {step === 1 && (
            <Button
              variant="contained" sx={{ flex: 2, py: 1.4, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none" }}
              onClick={handleGenerate} disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeRoundedIcon />}
            >
              {loading ? "AI กำลังสร้าง..." : "ให้ AI สร้างแบบ"}
            </Button>
          )}
        </Box>
      )}
    </Box></MobileLayout>
  );
}
