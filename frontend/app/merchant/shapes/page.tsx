"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

const CATEGORY_LABELS: Record<string, string> = {
  top: "เสื้อ", bottom: "กางเกง", skirt: "กระโปรง",
};

interface ShopTemplate {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  frontAssetUrl: string | null;
  backAssetUrl: string | null;
  isEnabled: boolean;
}

/**
 * หน้าให้ร้านค้า (ทุกประเภท — ชุมชนทอผ้า/ดีไซเนอร์/ร้านค้า) ประกาศว่าตัวเองตัดเย็บ "ทรง" ไหนได้บ้าง
 * ใช้ templates/shop_templates ที่มี backend CRUD อยู่แล้ว (backend/src/routes/shops.ts mine/templates)
 * แต่ยังไม่เคยมีหน้าฝั่งร้านค้าให้กดใช้งานจริง — มิเรอร์ UI จาก /merchant/patterns/capabilities
 */
export default function MerchantShapesPage() {
  const { session } = useAuth();
  const [templates, setTemplates] = useState<ShopTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTemplates = useCallback(async () => {
    if (!session?.access_token) { setLoading(false); return; }
    try {
      const res = await authFetch(`${API_BASE}/api/shops/mine/templates`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดรายการทรงไม่สำเร็จ");
      setTemplates(data);
    } catch (err) {
      setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดรายการทรงไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const toggleEnabled = async (tpl: ShopTemplate) => {
    const nextValue = !tpl.isEnabled;
    setTemplates((prev) => prev.map((t) => (t.id === tpl.id ? { ...t, isEnabled: nextValue } : t)));
    try {
      const res = nextValue
        ? await authFetch(`${API_BASE}/api/shops/mine/templates`, {
            method: "POST",
            body: JSON.stringify({ templateIds: [tpl.id] }),
          })
        : await authFetch(`${API_BASE}/api/shops/mine/templates/${tpl.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setTemplates((prev) => prev.map((t) => (t.id === tpl.id ? { ...t, isEnabled: tpl.isEnabled } : t)));
      setError("เปลี่ยนสถานะทรงที่ตัดได้ไม่สำเร็จ");
    }
  };

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT, fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A", mb: 1 }}>
        ทรงที่ตัดได้
      </Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#6B7280", mb: 2 }}>
        เลือกทรงเสื้อผ้าที่ร้านคุณตัดเย็บได้ ลูกค้าที่เลือกทรงเหล่านี้ในหน้าออกแบบจะเห็นร้านคุณเป็นตัวเลือก
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#C5A55A" }} />
        </Box>
      ) : templates.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#9CA3AF" }}>
          <CheckroomRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem" }}>
            ยังไม่มีทรงในระบบให้เลือก
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {templates.map((tpl, i) => (
            <Card key={tpl.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none" }}
            >
              <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
                <Box sx={{ width: 60, height: 60, borderRadius: "10px", bgcolor: "#F0EBE3", flexShrink: 0, backgroundImage: tpl.frontAssetUrl ? `url(${tpl.frontAssetUrl})` : undefined, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, color: "#1B2A4A", fontSize: "0.9rem" }}>
                    {tpl.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.5, flexWrap: "wrap" }}>
                    {CATEGORY_LABELS[tpl.category] && (
                      <Chip label={CATEGORY_LABELS[tpl.category]} size="small" sx={{ fontFamily: FONT, fontSize: "0.68rem", bgcolor: "#F0EBE3", color: "#1B2A4A", height: 20 }} />
                    )}
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6B7280" }}>
                      เริ่มต้น ฿{tpl.basePrice.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={tpl.isEnabled} onChange={() => toggleEnabled(tpl)}
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
