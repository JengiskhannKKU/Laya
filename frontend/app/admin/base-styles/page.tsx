"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────
interface BaseStyle {
  id: string;
  name: string;
  category: string;
  gender: "all" | "male" | "female";
  description: string;
  isActive: boolean;
  usageCount: number;
}

interface WeavePattern {
  id: string;
  name: string;
  region: string;
  technique: string;
  isActive: boolean;
  usageCount: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const initStyles: BaseStyle[] = [
  { id: "s1", name: "เสื้อเชิ้ตคลาสสิก", category: "shirt", gender: "all", description: "ทรงเชิ้ตมาตรฐาน ปกคอแหลม", isActive: true, usageCount: 142 },
  { id: "s2", name: "เดรสทรงตรง", category: "dress", gender: "female", description: "เดรสทรงตรง ยาวคลุมเข่า", isActive: true, usageCount: 98 },
  { id: "s3", name: "ชุดสูทสากล", category: "suit", gender: "all", description: "สูทสากลทรงเข้ารูป", isActive: true, usageCount: 73 },
  { id: "s4", name: "เสื้อแจ็กเก็ตซับใน", category: "jacket", gender: "all", description: "แจ็กเก็ตพร้อมซับใน", isActive: false, usageCount: 31 },
];

const initPatterns: WeavePattern[] = [
  { id: "p1", name: "ผ้ามัดหมี่ดอกแก้ว", region: "อีสาน", technique: "มัดหมี่", isActive: true, usageCount: 224 },
  { id: "p2", name: "ผ้าไหมยกดอก", region: "ภาคกลาง", technique: "ยกดอก", isActive: true, usageCount: 187 },
  { id: "p3", name: "ผ้าซิ่นตีนจก", region: "ภาคเหนือ", technique: "จก", isActive: true, usageCount: 156 },
  { id: "p4", name: "ผ้าขาวม้าลายตาหมากรุก", region: "ทั่วไป", technique: "ทอเรียบ", isActive: true, usageCount: 89 },
  { id: "p5", name: "ผ้าบาติกลายไทย", region: "ภาคใต้", technique: "บาติก", isActive: false, usageCount: 45 },
];

const GENDER_LABELS: Record<string, string> = { all: "ทุกเพศ", male: "ชาย", female: "หญิง" };

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF", borderRadius: "10px",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#C5A55A" },
  "& label, & input, & textarea": { fontFamily: '"Kanit", sans-serif' },
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function AdminBaseStylesPage() {
  const router = useRouter();

  const [tab, setTab]           = useState(0);
  const [search, setSearch]     = useState("");
  const [styles, setStyles]     = useState(initStyles);
  const [patterns, setPatterns] = useState(initPatterns);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");

  // Dialog state
  const [styleDialog, setStyleDialog]     = useState(false);
  const [patternDialog, setPatternDialog] = useState(false);
  const [deleteDialog, setDeleteDialog]   = useState<{ id: string; type: "style" | "pattern" } | null>(null);

  const [editStyle, setEditStyle]     = useState<Partial<BaseStyle>>({});
  const [editPattern, setEditPattern] = useState<Partial<WeavePattern>>({});

  const filteredStyles   = styles.filter((s) => s.name.includes(search) || s.category.includes(search));
  const filteredPatterns = patterns.filter((p) => p.name.includes(search) || p.region.includes(search) || p.technique.includes(search));

  // ── Style CRUD ──
  const openStyleDialog = (style?: BaseStyle) => {
    setEditStyle(style ?? { gender: "all", isActive: true });
    setStyleDialog(true);
  };

  const saveStyle = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (editStyle.id) {
        setStyles((prev) => prev.map((s) => s.id === editStyle.id ? { ...s, ...editStyle } as BaseStyle : s));
      } else {
        const newS: BaseStyle = { ...editStyle, id: `s${Date.now()}`, usageCount: 0 } as BaseStyle;
        setStyles((prev) => [...prev, newS]);
      }
      setSuccess("บันทึกสำเร็จ");
      setStyleDialog(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Pattern CRUD ──
  const openPatternDialog = (pattern?: WeavePattern) => {
    setEditPattern(pattern ?? { isActive: true });
    setPatternDialog(true);
  };

  const savePattern = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (editPattern.id) {
        setPatterns((prev) => prev.map((p) => p.id === editPattern.id ? { ...p, ...editPattern } as WeavePattern : p));
      } else {
        const newP: WeavePattern = { ...editPattern, id: `p${Date.now()}`, usageCount: 0 } as WeavePattern;
        setPatterns((prev) => [...prev, newP]);
      }
      setSuccess("บันทึกสำเร็จ");
      setPatternDialog(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    await new Promise((r) => setTimeout(r, 400));
    if (deleteDialog.type === "style") {
      setStyles((prev) => prev.filter((s) => s.id !== deleteDialog.id));
    } else {
      setPatterns((prev) => prev.filter((p) => p.id !== deleteDialog.id));
    }
    setSuccess("ลบเรียบร้อยแล้ว");
    setDeleteDialog(null);
  };

  const toggleActive = (id: string, type: "style" | "pattern") => {
    if (type === "style") {
      setStyles((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !s.isActive } : s));
    } else {
      setPatterns((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !p.isActive } : p));
    }
  };

  return (
    <Box sx={{ flex: 1, bgcolor: "#FAF6F0", minHeight: "100vh", pb: 6 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#1B2A4A", px: 3, pt: 4, pb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <IconButton onClick={() => router.back()} sx={{ color: "#FFFFFF", p: 0.5 }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#FFFFFF", fontSize: "1.15rem" }}>
            จัดการ Base Styles & Weave Patterns
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
          ข้อมูลพื้นฐานสำหรับระบบ AI Design
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1.5px solid #E5DFD6" }}>
        <Tabs
          value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            px: 3,
            "& .MuiTab-root": { fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none", color: "#9CA3AF", fontSize: "0.9rem" },
            "& .Mui-selected": { color: "#1B2A4A" },
            "& .MuiTabs-indicator": { bgcolor: "#C5A55A" },
          }}
        >
          <Tab label={`รูปทรงพื้นฐาน (${styles.length})`} />
          <Tab label={`ลายผ้า (${patterns.length})`} />
        </Tabs>
      </Box>

      <Box sx={{ px: 3, pt: 3 }}>
        {/* Alerts */}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }} onClose={() => setSuccess("")}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontFamily: '"Kanit", sans-serif' }} onClose={() => setError("")}>{error}</Alert>}

        {/* Search + Add */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
          <TextField
            fullWidth size="small"
            placeholder={tab === 0 ? "ค้นหารูปทรง..." : "ค้นหาลายผ้า..."}
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchRoundedIcon sx={{ color: "#9CA3AF", mr: 0.5, fontSize: 18 }} /> }}
            sx={fieldSx}
          />
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => tab === 0 ? openStyleDialog() : openPatternDialog()}
            sx={{ whiteSpace: "nowrap", bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "10px", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none", px: 2 }}
          >
            เพิ่ม
          </Button>
        </Box>

        {/* ── Base Styles List ── */}
        {tab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredStyles.map((style, i) => (
              <motion.div key={style.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "14px", p: 2, border: "1.5px solid #E5DFD6" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
                          {style.name}
                        </Typography>
                        <Chip
                          label={style.isActive ? "เปิดใช้งาน" : "ปิด"}
                          size="small"
                          sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.65rem", height: 18, bgcolor: style.isActive ? "#DCFCE7" : "#F3F4F6", color: style.isActive ? "#16A34A" : "#6B7280", fontWeight: 700 }}
                        />
                      </Box>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.78rem", color: "#6B7280", mb: 1 }}>
                        {style.description}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip label={style.category} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.65rem", bgcolor: "#EEF3FF", color: "#1B2A4A" }} />
                        <Chip label={GENDER_LABELS[style.gender]} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.65rem", bgcolor: "#F3F4F6", color: "#6B7280" }} />
                        <Chip label={`ใช้งาน ${style.usageCount} ครั้ง`} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.65rem", bgcolor: "#FDF8EE", color: "#92652A" }} />
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                      <Switch checked={style.isActive} onChange={() => toggleActive(style.id, "style")} size="small"
                        sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }}
                      />
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton size="small" onClick={() => openStyleDialog(style)} sx={{ color: "#1B2A4A", p: 0.5 }}>
                          <EditRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteDialog({ id: style.id, type: "style" })} sx={{ color: "#EF4444", p: 0.5 }}>
                          <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        )}

        {/* ── Weave Patterns List ── */}
        {tab === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredPatterns.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "14px", p: 2, border: "1.5px solid #E5DFD6" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
                          {p.name}
                        </Typography>
                        <Chip
                          label={p.isActive ? "เปิดใช้งาน" : "ปิด"}
                          size="small"
                          sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.65rem", height: 18, bgcolor: p.isActive ? "#DCFCE7" : "#F3F4F6", color: p.isActive ? "#16A34A" : "#6B7280", fontWeight: 700 }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip label={p.region} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.65rem", bgcolor: "#EEF3FF", color: "#1B2A4A" }} />
                        <Chip label={p.technique} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.65rem", bgcolor: "#F3F4F6", color: "#6B7280" }} />
                        <Chip label={`ใช้งาน ${p.usageCount} ครั้ง`} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.65rem", bgcolor: "#FDF8EE", color: "#92652A" }} />
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                      <Switch checked={p.isActive} onChange={() => toggleActive(p.id, "pattern")} size="small"
                        sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }}
                      />
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton size="small" onClick={() => openPatternDialog(p)} sx={{ color: "#1B2A4A", p: 0.5 }}>
                          <EditRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteDialog({ id: p.id, type: "pattern" })} sx={{ color: "#EF4444", p: 0.5 }}>
                          <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        )}
      </Box>

      {/* ── Base Style Dialog ── */}
      <Dialog open={styleDialog} onClose={() => setStyleDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
          {editStyle.id ? "แก้ไขรูปทรง" : "เพิ่มรูปทรงใหม่"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "12px !important" }}>
          <TextField fullWidth label="ชื่อรูปทรง *" value={editStyle.name ?? ""} onChange={(e) => setEditStyle((s) => ({ ...s, name: e.target.value }))} sx={fieldSx} />
          <TextField fullWidth label="ประเภท (category)" value={editStyle.category ?? ""} onChange={(e) => setEditStyle((s) => ({ ...s, category: e.target.value }))} sx={fieldSx} />
          <TextField fullWidth label="คำอธิบาย" multiline rows={2} value={editStyle.description ?? ""} onChange={(e) => setEditStyle((s) => ({ ...s, description: e.target.value }))} sx={fieldSx} />
          <Box>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#374151", mb: 1, fontWeight: 600 }}>เพศ</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {(["all", "male", "female"] as const).map((g) => (
                <Chip key={g} label={GENDER_LABELS[g]} onClick={() => setEditStyle((s) => ({ ...s, gender: g }))}
                  sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, bgcolor: editStyle.gender === g ? "#1B2A4A" : "#F3F4F6", color: editStyle.gender === g ? "#FFFFFF" : "#374151" }}
                />
              ))}
            </Box>
          </Box>
          <FormControlLabel
            control={<Switch checked={editStyle.isActive ?? true} onChange={(e) => setEditStyle((s) => ({ ...s, isActive: e.target.checked }))}
              sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }}
            />}
            label={<Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem" }}>เปิดใช้งาน</Typography>}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setStyleDialog(false)} sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={saveStyle} disabled={saving || !editStyle.name}
            sx={{ bgcolor: "#1B2A4A", color: "#FFFFFF", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : "บันทึก"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Weave Pattern Dialog ── */}
      <Dialog open={patternDialog} onClose={() => setPatternDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
          {editPattern.id ? "แก้ไขลายผ้า" : "เพิ่มลายผ้าใหม่"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "12px !important" }}>
          <TextField fullWidth label="ชื่อลายผ้า *" value={editPattern.name ?? ""} onChange={(e) => setEditPattern((s) => ({ ...s, name: e.target.value }))} sx={fieldSx} />
          <TextField fullWidth label="ภาค/ภูมิภาค" value={editPattern.region ?? ""} onChange={(e) => setEditPattern((s) => ({ ...s, region: e.target.value }))} sx={fieldSx} />
          <TextField fullWidth label="เทคนิคการทอ" value={editPattern.technique ?? ""} onChange={(e) => setEditPattern((s) => ({ ...s, technique: e.target.value }))} sx={fieldSx} />
          <FormControlLabel
            control={<Switch checked={editPattern.isActive ?? true} onChange={(e) => setEditPattern((s) => ({ ...s, isActive: e.target.checked }))}
              sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }}
            />}
            label={<Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem" }}>เปิดใช้งาน</Typography>}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setPatternDialog(false)} sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={savePattern} disabled={saving || !editPattern.name}
            sx={{ bgcolor: "#1B2A4A", color: "#FFFFFF", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : "บันทึก"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
          ยืนยันการลบ
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#374151" }}>
            คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog(null)} sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleDelete}
            sx={{ bgcolor: "#EF4444", color: "#FFFFFF", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
