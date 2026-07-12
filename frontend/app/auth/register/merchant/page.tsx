"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const PROVINCES = [
  "เชียงใหม่","เชียงราย","ลำพูน","ลำปาง","แพร่","น่าน","พะเยา","แม่ฮ่องสอน",
  "ขอนแก่น","อุดรธานี","นครราชสีมา","บุรีรัมย์","สุรินทร์","ศรีสะเกษ","มหาสารคาม",
  "กรุงเทพมหานคร","นนทบุรี","ปทุมธานี","สมุทรปราการ",
  "สุโขทัย","อุตรดิตถ์","พิษณุโลก","เพชรบูรณ์",
];

const EXPERTISE_OPTIONS = [
  "ผ้าไหมมัดหมี่","ผ้าขิด","ผ้าจก","ผ้าลายน้ำไหล","ผ้าทอมือ","ผ้าฝ้าย",
  "ผ้าไหมพิมาย","ผ้าซิ่น","ผ้ายก","งานเย็บปักถักร้อย",
];

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF", borderRadius: "12px",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&:hover fieldset": { borderColor: "#C5A55A" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#C5A55A" },
};

const steps = ["ข้อมูลร้านค้า", "รายละเอียด", "บัญชีธนาคาร"];

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { registerMerchant } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    shopName: "", province: "", phone: "", lineId: "",
    merchantType: "weaving_community" as "weaving_community" | "designer",
    shopDescription: "", expertise: [] as string[],
    bankName: "", bankAccount: "", bankAccountName: "", promptpayId: "",
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const toggleExpertise = (tag: string) => {
    set("expertise", form.expertise.includes(tag)
      ? form.expertise.filter((t) => t !== tag)
      : [...form.expertise, tag]);
  };

  const canNext = () => {
    if (activeStep === 0) return form.shopName && form.province && form.phone;
    if (activeStep === 1) return form.shopDescription && form.expertise.length > 0;
    const hasBankAccount = form.bankName && form.bankAccount && form.bankAccountName;
    const hasPromptPay = form.promptpayId.trim().length > 0;
    return hasBankAccount || hasPromptPay;
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) { setActiveStep((s) => s + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await registerMerchant({
        shopName: form.shopName, shopDescription: form.shopDescription,
        province: form.province, phone: form.phone, lineId: form.lineId,
        expertise: form.expertise,
        bankAccount: form.bankAccount, bankName: form.bankName,
        bankAccountName: form.bankAccountName, promptpayId: form.promptpayId,
        merchantType: form.merchantType,
      });
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "#FAF6F0", px: 3, textAlign: "center" }}>
        <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(197,165,90,0.12)", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 48, color: "#C5A55A" }} />
        </Box>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.4rem", color: "#1B2A4A", mb: 1 }}>
          ส่งคำขอสำเร็จ!
        </Typography>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.95rem", mb: 4, lineHeight: 1.8 }}>
          ทีมงาน LAYA จะตรวจสอบข้อมูลของคุณ<br />และแจ้งผลภายใน 3-5 วันทำการ
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push("/")}
          sx={{ bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, px: 4, py: 1.5, textTransform: "none" }}
        >
          กลับหน้าหลัก
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAF6F0", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => activeStep > 0 ? setActiveStep((s) => s - 1) : router.back()} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StoreRoundedIcon sx={{ color: "#C5A55A", fontSize: 22 }} />
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A" }}>
            สมัครเป็นร้านค้า LAYA
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{
                "& .MuiStepLabel-label": { fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem" },
                "& .MuiStepIcon-root.Mui-active": { color: "#C5A55A" },
                "& .MuiStepIcon-root.Mui-completed": { color: "#C5A55A" },
              }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Form Body */}
      <Box sx={{ px: 3, pb: 4, flex: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>{error}</Alert>}

        {/* Step 0: ข้อมูลร้านค้า */}
        {activeStep === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 1 }}>
              ข้อมูลร้านค้าของคุณ
            </Typography>

            {/* ประเภทร้านค้า: ชุมชนทอผ้า / ดีไซเนอร์ */}
            <Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 1.2 }}>
                คุณเป็นร้านค้าประเภทไหน? *
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                {([
                  { value: "weaving_community", title: "ชุมชนทอผ้า", desc: "กลุ่มทอผ้า/ช่างทอ ขายผ้าและงานทอมือ" },
                  { value: "designer", title: "ดีไซเนอร์", desc: "นักออกแบบ ตัดเย็บ/แปรรูปผ้าไทยเป็นสินค้า" },
                ] as const).map((opt) => {
                  const active = form.merchantType === opt.value;
                  return (
                    <Box
                      key={opt.value}
                      onClick={() => set("merchantType", opt.value)}
                      sx={{
                        cursor: "pointer", borderRadius: "14px", p: 1.8,
                        border: active ? "1.5px solid #C5A55A" : "1px solid #E5DFD6",
                        bgcolor: active ? "#FDF8F0" : "#FFFFFF",
                        transition: "all 0.15s",
                      }}
                    >
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: active ? "#8E601C" : "#1B2A4A" }}>
                        {opt.title}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem", color: "#6B7280", mt: 0.4, lineHeight: 1.5 }}>
                        {opt.desc}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <TextField fullWidth label="ชื่อร้านค้า *" value={form.shopName} onChange={(e) => set("shopName", e.target.value)} sx={textFieldSx} />
            <FormControl fullWidth sx={textFieldSx}>
              <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>จังหวัด *</InputLabel>
              <Select value={form.province} onChange={(e) => set("province", e.target.value)} label="จังหวัด *">
                {PROVINCES.map((p) => <MenuItem key={p} value={p} sx={{ fontFamily: '"Kanit", sans-serif' }}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="เบอร์โทรศัพท์ *" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} sx={textFieldSx} />
            <TextField fullWidth label="LINE ID (ไม่บังคับ)" value={form.lineId} onChange={(e) => set("lineId", e.target.value)} sx={textFieldSx} />
          </Box>
        )}

        {/* Step 1: รายละเอียด */}
        {activeStep === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 1 }}>
              เรื่องราวและความเชี่ยวชาญ
            </Typography>
            <TextField
              fullWidth multiline rows={4}
              label="แนะนำร้านค้าของคุณ *"
              value={form.shopDescription}
              onChange={(e) => set("shopDescription", e.target.value)}
              sx={textFieldSx}
            />
            <Box>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 1.5 }}>
                ความเชี่ยวชาญ * (เลือกได้หลายรายการ)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {EXPERTISE_OPTIONS.map((tag) => (
                  <Chip
                    key={tag} label={tag}
                    onClick={() => toggleExpertise(tag)}
                    sx={{
                      fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem",
                      bgcolor: form.expertise.includes(tag) ? "#1B2A4A" : "#F0EBE3",
                      color: form.expertise.includes(tag) ? "#FFFFFF" : "#1B2A4A",
                      border: form.expertise.includes(tag) ? "none" : "1px solid #E5DFD6",
                      "&:hover": { bgcolor: form.expertise.includes(tag) ? "#0F1A30" : "#E5DFD6" },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Step 2: บัญชีธนาคาร */}
        {activeStep === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mb: 1 }}>
              บัญชีสำหรับรับเงิน
            </Typography>
            <Alert severity="info" sx={{ borderRadius: "12px", fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem" }}>
              ลูกค้าจะจ่ายเงินเข้าบัญชีนี้โดยตรงตอนชำระเงิน กรอกอย่างน้อย 1 ช่องทาง (พร้อมเพย์ หรือ บัญชีธนาคาร) เราจะไม่เผยแพร่ต่อสาธารณะ
            </Alert>
            <TextField
              fullWidth label="เลขพร้อมเพย์ (เบอร์โทร/เลขบัตร ปชช.)"
              value={form.promptpayId}
              onChange={(e) => set("promptpayId", e.target.value.replace(/[^0-9]/g, ""))}
              sx={textFieldSx}
            />
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", color: "#9CA3AF", textAlign: "center" }}>
              — หรือ —
            </Typography>
            <FormControl fullWidth sx={textFieldSx}>
              <InputLabel sx={{ "&.Mui-focused": { color: "#C5A55A" } }}>ธนาคาร</InputLabel>
              <Select value={form.bankName} onChange={(e) => set("bankName", e.target.value)} label="ธนาคาร">
                {["กสิกรไทย","กรุงเทพ","กรุงไทย","ไทยพาณิชย์","ทหารไทยธนชาต","ออมสิน","กรุงศรีอยุธยา"].map((b) => (
                  <MenuItem key={b} value={b} sx={{ fontFamily: '"Kanit", sans-serif' }}>{b}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth label="เลขบัญชี" value={form.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} sx={textFieldSx} />
            <TextField fullWidth label="ชื่อบัญชี" value={form.bankAccountName} onChange={(e) => set("bankAccountName", e.target.value)} sx={textFieldSx} />
          </Box>
        )}

        {/* CTA */}
        <Button
          fullWidth variant="contained"
          onClick={handleNext}
          disabled={loading || !canNext()}
          sx={{
            mt: 4, py: 1.5, bgcolor: "#1B2A4A", color: "#FFFFFF",
            borderRadius: "12px", fontWeight: 700, fontSize: "1rem",
            fontFamily: '"Kanit", sans-serif', textTransform: "none",
            "&:hover": { bgcolor: "#0F1A30" },
            "&.Mui-disabled": { bgcolor: "rgba(27,42,74,0.4)", color: "#FFFFFF" },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : activeStep < steps.length - 1 ? "ถัดไป" : "ส่งคำขอ"}
        </Button>

        {activeStep === 0 && (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>
              มีบัญชีลูกค้าอยู่แล้ว?{" "}
              <Link href="/auth/login" style={{ color: "#C5A55A", fontWeight: 600, textDecoration: "none" }}>
                เข้าสู่ระบบ
              </Link>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
