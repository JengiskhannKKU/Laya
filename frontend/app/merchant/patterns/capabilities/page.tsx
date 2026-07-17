"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { REGIONS } from "@/lib/fabric-origins";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

interface SystemPattern {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  region: string | null;
  originProvince: string | null;
  isCapable: boolean;
}

const regionLabel = (v: string | null) => (v && REGIONS[v] ? REGIONS[v].label : null);

/**
 * หน้าให้ร้านค้าประกาศว่าตัวเองทอ "ลายระบบ" (weave_patterns.shop_id IS NULL) ไหนได้บ้าง —
 * แยกจากหน้า /merchant/patterns เดิม ซึ่งเป็นลายที่ร้านสร้าง/เป็นเจ้าของเอง
 */
export default function MerchantPatternCapabilitiesPage() {
  const { session } = useAuth();
  const [patterns, setPatterns] = useState<SystemPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatterns = useCallback(async () => {
    if (!session?.access_token) { setLoading(false); return; }
    try {
      const res = await authFetch(`${API_BASE}/api/weave-patterns/capabilities/mine`);
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

  const toggleCapable = async (pattern: SystemPattern) => {
    const nextValue = !pattern.isCapable;
    setPatterns((prev) => prev.map((p) => (p.id === pattern.id ? { ...p, isCapable: nextValue } : p)));
    try {
      const res = nextValue
        ? await authFetch(`${API_BASE}/api/weave-patterns/capabilities/mine`, {
            method: "POST",
            body: JSON.stringify({ patternIds: [pattern.id] }),
          })
        : await authFetch(`${API_BASE}/api/weave-patterns/capabilities/mine/${pattern.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setPatterns((prev) => prev.map((p) => (p.id === pattern.id ? { ...p, isCapable: pattern.isCapable } : p)));
      setError("เปลี่ยนสถานะความสามารถทอผ้าไม่สำเร็จ");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton component={Link} href="/merchant/patterns" size="small" sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A" }}>
          ลายที่ฉันทอได้
        </Typography>
      </Box>
      <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280", mb: 2 }}>
        เลือกลายผ้าพื้นฐานของระบบที่ร้านคุณสามารถทอได้ ลูกค้าที่เลือกลายเหล่านี้จะเห็นร้านคุณเป็นตัวเลือกผู้ผลิต
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#C5A55A" }} />
        </Box>
      ) : patterns.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#9CA3AF" }}>
          <AutoStoriesRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem" }}>
            ยังไม่มีลายผ้าพื้นฐานในระบบให้เลือก
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {patterns.map((pattern, i) => (
            <Card key={pattern.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none" }}
            >
              <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
                <Box sx={{ width: 60, height: 60, borderRadius: "10px", bgcolor: "#F0EBE3", flexShrink: 0, backgroundImage: pattern.thumbnailUrl ? `url(${pattern.thumbnailUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
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
                <Switch
                  checked={pattern.isCapable} onChange={() => toggleCapable(pattern)}
                  sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#C5A55A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#C5A55A" } }}
                />
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
