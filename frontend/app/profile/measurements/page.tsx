"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";

const MEASUREMENT_FIELDS = [
  { key: "height", label: "ส่วนสูง", unit: "ซม.", icon: "📏" },
  { key: "weight", label: "น้ำหนัก", unit: "กก.", icon: "⚖️" },
  { key: "chest", label: "รอบอก", unit: "ซม.", icon: "👕" },
  { key: "waist", label: "รอบเอว", unit: "ซม.", icon: "📐" },
  { key: "hip", label: "รอบสะโพก", unit: "ซม.", icon: "📐" },
  { key: "shoulder", label: "ความกว้างไหล่", unit: "ซม.", icon: "↔️" },
  { key: "armLength", label: "ความยาวแขน", unit: "ซม.", icon: "💪" },
  { key: "backLength", label: "ความยาวหลัง", unit: "ซม.", icon: "📏" },
  { key: "inseam", label: "ความยาวขาใน", unit: "ซม.", icon: "📏" },
];

type MeasurementProfile = {
  name: string;
  values: Record<string, string>;
};

const DEFAULT_PROFILE: MeasurementProfile = { name: "ของฉัน", values: {} };

export default function MeasurementsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([DEFAULT_PROFILE]);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentProfile = profiles[tab];

  const setField = (key: string, value: string) => {
    setProfiles((prev) => prev.map((p, i) =>
      i === tab ? { ...p, values: { ...p.values, [key]: value } } : p
    ));
  };

  const addProfile = () => {
    setProfiles((prev) => [...prev, { name: `โปรไฟล์ ${prev.length + 1}`, values: {} }]);
    setTab(profiles.length);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MobileLayout>
      <Box sx={{ px: 2, pt: 3, pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <StraightenRoundedIcon sx={{ color: "#C5A55A" }} />
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.15rem", color: "#1B2A4A" }}>
            ข้อมูลสัดส่วนร่างกาย
          </Typography>
        </Box>

        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#6B7280", mb: 2, ml: 5 }}>
          ใช้สำหรับแนะนำเสื้อผ้าที่เหมาะกับคุณ
        </Typography>

        {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>บันทึกเรียบร้อยแล้ว</Alert>}

        {/* Profile Tabs */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ flex: 1, "& .MuiTab-root": { fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", textTransform: "none", minWidth: "auto" }, "& .Mui-selected": { color: "#1B2A4A", fontWeight: 600 }, "& .MuiTabs-indicator": { bgcolor: "#C5A55A" } }}>
            {profiles.map((p) => <Tab key={p.name} label={p.name} />)}
          </Tabs>
          <IconButton onClick={addProfile} sx={{ bgcolor: "#F0EBE3", color: "#1B2A4A", width: 36, height: 36 }}>
            <AddRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Measurements Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
          {MEASUREMENT_FIELDS.map((field) => (
            <Box key={field.key} sx={{ bgcolor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E5DFD6", p: 2 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem", color: "#9CA3AF", mb: 0.5 }}>
                {field.icon} {field.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  variant="standard" type="number" size="small"
                  value={currentProfile.values[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder="–"
                  inputProps={{ style: { fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A" } }}
                  sx={{ flex: 1, "& .MuiInput-underline:before": { borderColor: "#E5DFD6" }, "& .MuiInput-underline:after": { borderColor: "#C5A55A" } }}
                />
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>
                  {field.unit}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
          sx={{ py: 1.5, bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", fontWeight: 700, fontFamily: '"Kanit", sans-serif', textTransform: "none", "&:hover": { bgcolor: "#0F1A30" } }}
        >
          {saving ? <CircularProgress size={22} color="inherit" /> : "บันทึกข้อมูลสัดส่วน"}
        </Button>
      </Box>
    </MobileLayout>
  );
}
