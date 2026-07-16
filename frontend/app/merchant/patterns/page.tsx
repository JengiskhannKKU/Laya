"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { REGIONS } from "@/lib/fabric-origins";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

interface MerchantPattern {
  id: string;
  name: string;
  region: string | null;
  originProvince: string | null;
  thumbnailUrl: string | null;
  patternImages: string[];
  isActive: boolean;
}

const regionLabel = (v: string | null) => (v && REGIONS[v] ? REGIONS[v].label : null);

export default function MerchantPatternsPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [patterns, setPatterns] = useState<MerchantPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatterns = useCallback(async () => {
    if (!session?.access_token) { setLoading(false); return; }
    try {
      const res = await authFetch(`${API_BASE}/api/weave-patterns/mine`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดรายการลายผ้าไม่สำเร็จ");
      setPatterns(data);
    } catch (err) {
      setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดรายการลายผ้าไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  useEffect(() => { fetchPatterns(); }, [fetchPatterns]);

  const filtered = patterns.filter((p) => !search || p.name.includes(search));

  const toggleActive = async (pattern: MerchantPattern) => {
    setPatterns((prev) => prev.map((p) => (p.id === pattern.id ? { ...p, isActive: !p.isActive } : p)));
    try {
      const res = await authFetch(`${API_BASE}/api/weave-patterns/${pattern.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !pattern.isActive }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setPatterns((prev) => prev.map((p) => (p.id === pattern.id ? { ...p, isActive: pattern.isActive } : p)));
      setError("เปลี่ยนสถานะลายผ้าไม่สำเร็จ");
    }
  };

  const handleDelete = async (pattern: MerchantPattern) => {
    if (!window.confirm(`ลบ "${pattern.name}" ใช่ไหม?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/weave-patterns/${pattern.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ลบลายผ้าไม่สำเร็จ");
      if (data.hidden) {
        setPatterns((prev) => prev.map((p) => (p.id === pattern.id ? { ...p, isActive: false } : p)));
        setError(data.message ?? "ลายผ้านี้เคยมีออเดอร์สั่งทอแล้ว จึงซ่อนแทนการลบถาวร");
      } else {
        setPatterns((prev) => prev.filter((p) => p.id !== pattern.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบลายผ้าไม่สำเร็จ");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A" }}>
          ลายผ้า
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={Link} href="/merchant/patterns/capabilities"
            variant="outlined" startIcon={<CheckCircleRoundedIcon />}
            sx={{ borderColor: "#E5DFD6", color: "#1B2A4A", borderRadius: "10px", fontFamily: FONT, textTransform: "none", fontWeight: 600 }}
          >
            ลายที่ฉันทอได้
          </Button>
          <Button
            component={Link} href="/merchant/patterns/create"
            variant="contained" startIcon={<AddRoundedIcon />}
            sx={{ bgcolor: "#1B2A4A", borderRadius: "10px", fontFamily: FONT, textTransform: "none", fontWeight: 600 }}
          >
            เพิ่มลายผ้า
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>
      )}

      <TextField
        fullWidth placeholder="ค้นหาลายผ้า" value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#9CA3AF" }} /></InputAdornment> }}
        sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: "12px", "& fieldset": { borderColor: "#E5DFD6" } } }}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#C5A55A" }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#9CA3AF" }}>
          <AutoStoriesRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem" }}>
            {patterns.length === 0 ? "ยังไม่มีลายผ้า — เริ่มเล่าเรื่องราวลายผ้าชิ้นแรกกันเลย" : "ไม่พบลายผ้าที่ค้นหา"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.map((pattern, i) => (
            <Card key={pattern.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none", opacity: pattern.isActive ? 1 : 0.6 }}
            >
              <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
                <Box sx={{ width: 60, height: 60, borderRadius: "10px", bgcolor: "#F0EBE3", flexShrink: 0, backgroundImage: (pattern.thumbnailUrl || pattern.patternImages[0]) ? `url(${pattern.thumbnailUrl || pattern.patternImages[0]})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, color: "#1B2A4A", fontSize: "0.9rem" }}>
                    {pattern.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.5, flexWrap: "wrap" }}>
                    {regionLabel(pattern.region) && (
                      <Chip label={regionLabel(pattern.region)} size="small" sx={{ fontFamily: FONT, fontSize: "0.68rem", bgcolor: "#F0EBE3", color: "#1B2A4A", height: 20 }} />
                    )}
                    {pattern.originProvince && (
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6B7280" }}>
                        {pattern.originProvince}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                  <Switch
                    checked={pattern.isActive} onChange={() => toggleActive(pattern)} size="small"
                    sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }}
                  />
                  <IconButton size="small" component={Link} href={`/merchant/patterns/edit/${pattern.id}`} sx={{ color: "#6B7280" }}>
                    <EditRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(pattern)} sx={{ color: "#EF4444" }}>
                    <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
