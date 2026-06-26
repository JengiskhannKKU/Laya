"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "@/lib/admin-theme-context";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import BackupRoundedIcon from "@mui/icons-material/BackupRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import {
  mockSystemSettings, SystemSettings,
  mockCommissionSettings, CommissionSettings, CategoryCommission, TierCommission,
  mockSettingsAuditLog,
} from "@/lib/mock-admin-data";

type SettingsTab = "system" | "commission";

// ════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const { c } = useAdminTheme();
  const tr = "all 0.3s ease";
  const card = { bgcolor: c.bgCard, borderRadius: "14px", p: 3, border: `1px solid ${c.borderCard}`, transition: tr };
  const inputSx = { "& .MuiOutlinedInput-root": { color: c.textPrimary, "& fieldset": { borderColor: c.borderInput } }, "& .MuiInputLabel-root": { color: c.textMuted } };

  const [activeTab, setActiveTab] = useState<SettingsTab>("system");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // System
  const [sys, setSys] = useState<SystemSettings>({ ...mockSystemSettings });
  const [maintenanceConfirm, setMaintenanceConfirm] = useState(false);

  // Commission
  const [comm, setComm] = useState<CommissionSettings>({ ...mockCommissionSettings });
  const [saveConfirm, setSaveConfirm] = useState(false);
  const [previewPrice, setPreviewPrice] = useState("1000");
  const [newCatName, setNewCatName] = useState("");
  const [newCatRate, setNewCatRate] = useState("");

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => { setToastMsg(msg); setToastType(type); };

  // ── System Actions ──
  const toggleMaintenance = () => {
    if (!sys.maintenanceMode) {
      setMaintenanceConfirm(true);
    } else {
      setSys(s => ({ ...s, maintenanceMode: false }));
      showToast("ปิด Maintenance Mode แล้ว ✅");
    }
  };
  const confirmMaintenance = () => {
    setSys(s => ({ ...s, maintenanceMode: true }));
    setMaintenanceConfirm(false);
    showToast("เปิด Maintenance Mode — Website ปิดชั่วคราว", "info");
  };
  const saveSystem = () => { showToast("บันทึกการตั้งค่าระบบสำเร็จ ✅"); };
  const doBackup = () => {
    setSys(s => ({ ...s, lastBackup: new Date().toLocaleString("th-TH") }));
    showToast("สำรองข้อมูลเรียบร้อย ✅");
  };

  // ── Commission Actions ──
  const addCategoryRule = () => {
    if (!newCatName.trim() || !newCatRate) return;
    setComm(prev => ({
      ...prev,
      categoryRules: [...prev.categoryRules, { id: `cc${Date.now()}`, category: newCatName.trim(), rate: Number(newCatRate) }],
    }));
    setNewCatName(""); setNewCatRate("");
  };
  const removeCategoryRule = (id: string) => {
    setComm(prev => ({ ...prev, categoryRules: prev.categoryRules.filter(r => r.id !== id) }));
  };
  const saveCommission = () => {
    setSaveConfirm(true);
  };
  const confirmSaveCommission = () => {
    setSaveConfirm(false);
    showToast("บันทึกค่าคอมมิชชันสำเร็จ ✅");
  };

  // ── Live Preview Calc ──
  const price = Number(previewPrice) || 1000;
  const commRate = comm.defaultRate;
  const layaEarns = Math.round(price * commRate / 100);
  const weaverGets = price - layaEarns;

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: "system", label: "⚙️ System Settings", icon: "⚙️" },
    { key: "commission", label: "💸 Commission Settings", icon: "💸" },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, mb: 0.5 }}>
          ⚙️ Settings
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted, mb: 2.5 }}>
          Manage platform configuration and business rules
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, bgcolor: c.bgCard, borderRadius: "12px", p: 0.5, border: `1px solid ${c.borderCard}` }}>
          {tabs.map(tab => (
            <Box key={tab.key} onClick={() => setActiveTab(tab.key)}
              sx={{
                px: 2.5, py: 1, borderRadius: "10px", cursor: "pointer",
                bgcolor: activeTab === tab.key ? c.goldSubtle : "transparent",
                color: activeTab === tab.key ? c.gold : c.textMuted,
                fontWeight: activeTab === tab.key ? 700 : 500, fontSize: "0.85rem", transition: tr,
                display: "flex", alignItems: "center", gap: 1,
                "&:hover": { bgcolor: activeTab === tab.key ? c.goldSubtle : c.bgCardHover },
              }}>
              {tab.label}
            </Box>
          ))}
        </Box>
      </Box>

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: SYSTEM SETTINGS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "system" && (
          <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
              {/* Left: General System */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Platform Info */}
                <Box sx={card}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    🏢 Platform Information
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField fullWidth label="Platform Name" value={sys.platformName} onChange={e => setSys(s => ({ ...s, platformName: e.target.value }))} sx={inputSx} />
                    <TextField fullWidth label="Support Email" value={sys.supportEmail} onChange={e => setSys(s => ({ ...s, supportEmail: e.target.value }))} sx={inputSx} />
                    <TextField fullWidth label="Contact Number" value={sys.contactNumber} onChange={e => setSys(s => ({ ...s, contactNumber: e.target.value }))} sx={inputSx} />
                    <TextField fullWidth label="Default Currency" value={sys.defaultCurrency} disabled sx={inputSx} />
                  </Box>
                </Box>

                {/* Notification Settings */}
                <Box sx={card}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    🔔 Notification Settings
                  </Typography>
                  {[
                    { key: "emailNotifications" as const, label: "Email Notifications", desc: "ส่งอีเมลแจ้งเตือนเมื่อมีออเดอร์ใหม่" },
                    { key: "lineNotifications" as const, label: "LINE OA Notifications", desc: "ส่งแจ้งเตือนผ่าน LINE Official Account" },
                    { key: "adminAlerts" as const, label: "Admin Alerts", desc: "แจ้งเตือนเมื่อมี report หรือปัญหาเร่งด่วน" },
                  ].map(item => (
                    <Box key={item.key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, borderBottom: `1px solid ${c.borderCard}` }}>
                      <Box>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>{item.desc}</Typography>
                      </Box>
                      <Switch checked={sys[item.key]} onChange={e => setSys(s => ({ ...s, [item.key]: e.target.checked }))}
                        sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: c.gold }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: c.gold } }} />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Right: System Controls */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Maintenance Mode */}
                <Box sx={{ ...card, ...(sys.maintenanceMode && { borderColor: "#EF4444", boxShadow: "0 0 20px rgba(239,68,68,0.15)" }) }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    🔧 Maintenance Mode
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderRadius: "10px", bgcolor: sys.maintenanceMode ? "rgba(239,68,68,0.1)" : c.bgStatBox, border: `1px solid ${sys.maintenanceMode ? "#EF444440" : c.borderCard}` }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: sys.maintenanceMode ? "#EF4444" : "#22C55E" }}>
                        {sys.maintenanceMode ? "🔴 Maintenance Mode — ON" : "🟢 Website ใช้งานปกติ"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>
                        {sys.maintenanceMode ? "Website ปิดชั่วคราว ลูกค้าไม่สามารถเข้าถึงได้" : "เปิดใช้เมื่อต้องการปิดเว็บไซต์ชั่วคราว"}
                      </Typography>
                    </Box>
                    <Switch checked={sys.maintenanceMode} onChange={toggleMaintenance}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#EF4444" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#EF4444" } }} />
                  </Box>
                </Box>

                {/* Security */}
                <Box sx={card}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    🔒 Security
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField fullWidth type="number" label="Session Timeout (นาที)" value={sys.sessionTimeout} onChange={e => setSys(s => ({ ...s, sessionTimeout: Number(e.target.value) }))} sx={inputSx} />
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>Two-Factor Authentication</Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>บังคับให้ Admin ใช้ 2FA เมื่อ login</Typography>
                      </Box>
                      <Switch checked={sys.twoFARequired} onChange={e => setSys(s => ({ ...s, twoFARequired: e.target.checked }))}
                        sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: c.gold }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: c.gold } }} />
                    </Box>
                  </Box>
                </Box>

                {/* Backup */}
                <Box sx={card}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    💾 Backup
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderRadius: "10px", bgcolor: c.bgStatBox }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: c.textMuted }}>Last Backup</Typography>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: c.textPrimary }}>{sys.lastBackup}</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<BackupRoundedIcon />} onClick={doBackup}
                      sx={{ bgcolor: c.gold, color: c.textOnGold, textTransform: "none", fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: c.goldHover } }}>
                      Backup Now
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Save Button */}
            <Box sx={{ mt: 3, display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={() => setSys({ ...mockSystemSettings })}
                sx={{ color: c.textMuted, borderColor: c.borderInput, textTransform: "none", borderRadius: "8px" }}>
                Reset
              </Button>
              <Button variant="contained" onClick={saveSystem}
                sx={{ bgcolor: c.gold, color: c.textOnGold, textTransform: "none", fontWeight: 700, borderRadius: "8px", px: 4, "&:hover": { bgcolor: c.goldHover } }}>
                Save Changes
              </Button>
            </Box>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: COMMISSION SETTINGS */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "commission" && (
          <motion.div key="commission" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Summary Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
              {[
                { label: "Default Rate", value: `${comm.defaultRate}%`, color: c.gold },
                { label: "Revenue เดือนนี้", value: `฿${(comm.revenueThisMonth / 1000000).toFixed(1)}M`, color: c.textPrimary },
                { label: "Platform Earnings", value: `฿${(comm.estimatedEarnings / 1000).toFixed(0)}k`, color: "#22C55E" },
              ].map(kpi => (
                <Box key={kpi.label} sx={{ ...card, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.7rem", color: c.textMuted, fontWeight: 600 }}>{kpi.label}</Typography>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.6rem", color: kpi.color }}>{kpi.value}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
              {/* Left: Commission Forms */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Default Commission */}
                <Box sx={card}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2 }}>
                    📊 Default Commission Rate
                  </Typography>
                  <TextField fullWidth type="number" value={comm.defaultRate}
                    onChange={e => setComm(prev => ({ ...prev, defaultRate: Number(e.target.value) }))}
                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ color: c.textMuted }}>%</Typography></InputAdornment> }}
                    sx={{ ...inputSx, maxWidth: 200 }} />
                  {comm.defaultRate > 20 && (
                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: "8px", bgcolor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", gap: 1 }}>
                      <WarningAmberRoundedIcon sx={{ fontSize: 16, color: "#F59E0B", mt: 0.2 }} />
                      <Typography sx={{ fontSize: "0.75rem", color: "#F59E0B" }}>⚠ ค่าคอมมิชชันสูงอาจส่งผลต่อ conversion ของ seller</Typography>
                    </Box>
                  )}
                </Box>

                {/* Category Commission */}
                <Box sx={card}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2 }}>
                    📦 Category-specific Commission
                  </Typography>
                  <Box sx={{ borderRadius: "10px", border: `1px solid ${c.borderCard}`, overflow: "hidden" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 40px", px: 2, py: 1, bgcolor: c.bgTableHeader }}>
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted }}>CATEGORY</Typography>
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted }}>COMMISSION</Typography>
                      <Box />
                    </Box>
                    {comm.categoryRules.map(rule => (
                      <Box key={rule.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 40px", px: 2, py: 1.5, borderBottom: `1px solid ${c.borderCard}`, alignItems: "center" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: c.textPrimary }}>{rule.category}</Typography>
                        <TextField size="small" type="number" value={rule.rate}
                          onChange={e => setComm(prev => ({ ...prev, categoryRules: prev.categoryRules.map(r => r.id === rule.id ? { ...r, rate: Number(e.target.value) } : r) }))}
                          InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ color: c.textMuted, fontSize: "0.75rem" }}>%</Typography></InputAdornment> }}
                          sx={{ "& .MuiOutlinedInput-root": { color: c.textPrimary, "& fieldset": { borderColor: c.borderInput } } }} />
                        <IconButton size="small" onClick={() => removeCategoryRule(rule.id)} sx={{ color: "#EF4444" }}>
                          <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                    {/* Add Rule */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 40px", px: 2, py: 1.5, gap: 1, alignItems: "center" }}>
                      <TextField size="small" placeholder="ชื่อประเภท" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { color: c.textPrimary, "& fieldset": { borderColor: c.borderInput, borderStyle: "dashed" } } }} />
                      <TextField size="small" type="number" placeholder="%" value={newCatRate} onChange={e => setNewCatRate(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { color: c.textPrimary, "& fieldset": { borderColor: c.borderInput, borderStyle: "dashed" } } }} />
                      <IconButton size="small" onClick={addCategoryRule} sx={{ color: c.gold }}>
                        <AddRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                {/* Weaver Tier Commission */}
                <Box sx={card}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2 }}>
                    🧑‍🌾 Weaver Tier Commission
                  </Typography>
                  <Box sx={{ borderRadius: "10px", border: `1px solid ${c.borderCard}`, overflow: "hidden" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", px: 2, py: 1, bgcolor: c.bgTableHeader }}>
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted }}>SELLER TIER</Typography>
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: c.textMuted }}>FEE</Typography>
                    </Box>
                    {comm.tierRules.map(rule => (
                      <Box key={rule.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", px: 2, py: 1.5, borderBottom: `1px solid ${c.borderCard}`, alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip label={rule.tier} size="small" sx={{
                            bgcolor: rule.tier === "Premium" ? c.goldSubtle : rule.tier === "Verified" ? "rgba(34,197,94,0.15)" : c.bgStatBox,
                            color: rule.tier === "Premium" ? c.gold : rule.tier === "Verified" ? "#22C55E" : c.textSecondary,
                            fontWeight: 700, fontSize: "0.75rem",
                          }} />
                        </Box>
                        <TextField size="small" type="number" value={rule.rate}
                          onChange={e => setComm(prev => ({ ...prev, tierRules: prev.tierRules.map(r => r.id === rule.id ? { ...r, rate: Number(e.target.value) } : r) }))}
                          InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ color: c.textMuted, fontSize: "0.75rem" }}>%</Typography></InputAdornment> }}
                          sx={{ "& .MuiOutlinedInput-root": { color: c.textPrimary, "& fieldset": { borderColor: c.borderInput } } }} />
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Withdrawal Fee */}
                <Box sx={card}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary, mb: 2 }}>
                    💳 Withdrawal Fee
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <TextField fullWidth type="number" label="Fixed Fee" value={comm.withdrawalFeeFixed}
                      onChange={e => setComm(prev => ({ ...prev, withdrawalFeeFixed: Number(e.target.value) }))}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: c.textMuted }}>฿</Typography></InputAdornment> }}
                      sx={inputSx} />
                    <TextField fullWidth type="number" label="Percentage Fee" value={comm.withdrawalFeePct}
                      onChange={e => setComm(prev => ({ ...prev, withdrawalFeePct: Number(e.target.value) }))}
                      InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ color: c.textMuted }}>%</Typography></InputAdornment> }}
                      sx={inputSx} />
                  </Box>
                </Box>
              </Box>

              {/* Right: Live Preview + Audit */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Live Preview Card */}
                <Box sx={{ ...card, background: `linear-gradient(135deg, ${c.bgCard}, rgba(197,165,90,0.08))`, border: `1px solid ${c.gold}33`, position: "sticky", top: 80 }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.gold, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    💡 Live Calculator
                  </Typography>
                  <TextField fullWidth type="number" label="ราคาสินค้า (฿)" value={previewPrice} onChange={e => setPreviewPrice(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: c.textMuted }}>฿</Typography></InputAdornment> }}
                    sx={{ ...inputSx, mb: 2 }} />

                  <Divider sx={{ borderColor: c.borderDivider, my: 1.5 }} />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>ราคาสินค้า</Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: c.textPrimary }}>฿{price.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>ค่าคอม ({commRate}%)</Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#EF4444" }}>- ฿{layaEarns.toLocaleString()}</Typography>
                    </Box>
                    <Divider sx={{ borderColor: c.borderDivider }} />
                    <Box sx={{ p: 2, borderRadius: "10px", bgcolor: c.goldSubtle }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.gold }}>Laya ได้</Typography>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: c.gold }}>฿{layaEarns.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#22C55E" }}>ช่างทอได้</Typography>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#22C55E" }}>฿{weaverGets.toLocaleString()}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Audit Log */}
                <Box sx={card}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <HistoryRoundedIcon sx={{ fontSize: 18, color: c.gold }} />
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: c.textPrimary }}>Version History</Typography>
                  </Box>
                  {mockSettingsAuditLog.map(log => (
                    <Box key={log.id} sx={{ py: 1.5, borderBottom: `1px solid ${c.borderCard}` }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: c.textPrimary }}>{log.field}</Typography>
                        <Typography sx={{ fontSize: "0.65rem", color: c.textMuted, fontFamily: "monospace" }}>{log.timestamp}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Chip label={log.oldValue} size="small" sx={{ bgcolor: "rgba(239,68,68,0.1)", color: "#EF4444", fontWeight: 600, fontSize: "0.65rem", height: 18, textDecoration: "line-through" }} />
                        <Typography sx={{ fontSize: "0.7rem", color: c.textMuted }}>→</Typography>
                        <Chip label={log.newValue} size="small" sx={{ bgcolor: "rgba(34,197,94,0.1)", color: "#22C55E", fontWeight: 600, fontSize: "0.65rem", height: 18 }} />
                      </Box>
                      <Typography sx={{ fontSize: "0.65rem", color: c.textMuted, mt: 0.3 }}>by {log.actor}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Save Button */}
            <Box sx={{ mt: 3, display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={() => setComm({ ...mockCommissionSettings })}
                sx={{ color: c.textMuted, borderColor: c.borderInput, textTransform: "none", borderRadius: "8px" }}>
                Reset
              </Button>
              <Button variant="contained" onClick={saveCommission}
                sx={{ bgcolor: c.gold, color: c.textOnGold, textTransform: "none", fontWeight: 700, borderRadius: "8px", px: 4, "&:hover": { bgcolor: c.goldHover } }}>
                Save Commission
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DIALOGS */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* Maintenance Confirm */}
      <Dialog open={maintenanceConfirm} onClose={() => setMaintenanceConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WarningAmberRoundedIcon sx={{ color: "#EF4444", fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem" }}>เปิด Maintenance Mode?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>
            การเปิด Maintenance Mode จะทำให้ลูกค้าไม่สามารถเข้าถึงเว็บไซต์ได้ จนกว่าจะปิด
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#EF4444", mt: 1 }}>⚠️ การดำเนินการนี้จะส่งผลต่อ user ทั้งหมด</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setMaintenanceConfirm(false)} sx={{ color: c.textMuted, textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={confirmMaintenance}
            sx={{ bgcolor: "#EF4444", color: "#FFF", borderRadius: "8px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#DC2626" } }}>
            ยืนยัน — เปิด Maintenance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Commission Confirm */}
      <Dialog open={saveConfirm} onClose={() => setSaveConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: c.dialogBg, color: c.dialogText, borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: c.goldSubtle, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: "1.2rem" }}>💸</Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem" }}>ยืนยันการเปลี่ยนแปลงค่าคอมมิชชัน?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.85rem", color: c.textSecondary }}>
            การเปลี่ยนแปลงนี้จะมีผลกับคำสั่งซื้อใหม่ทั้งหมด
          </Typography>
          <Box sx={{ mt: 2, p: 2, borderRadius: "10px", bgcolor: c.bgStatBox }}>
            <Typography sx={{ fontSize: "0.75rem", color: c.textMuted, mb: 0.5 }}>Default Rate</Typography>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: c.gold }}>{comm.defaultRate}%</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setSaveConfirm(false)} sx={{ color: c.textMuted, textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={confirmSaveCommission}
            sx={{ bgcolor: c.gold, color: c.textOnGold, borderRadius: "8px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: c.goldHover } }}>
            ยืนยัน — บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }} open={!!toastMsg} autoHideDuration={3000} onClose={() => setToastMsg("")}>
        <Alert severity={toastType} sx={{
          borderRadius: "12px", fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          bgcolor: toastType === "success" ? "#065F46" : toastType === "error" ? "#7F1D1D" : "#1E3A5F", color: "#FFF",
          "& .MuiAlert-icon": { color: toastType === "success" ? "#34D399" : toastType === "error" ? "#F87171" : "#93C5FD" },
        }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
