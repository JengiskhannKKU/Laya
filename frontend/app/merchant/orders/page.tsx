"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import { motion } from "framer-motion";

const ALL_ORDERS = [
  { id: "ORD-1042", customer: "สมชาย ใจดี", product: "ผ้าไหมมัดหมี่ ลายขอ", meters: 3, amount: 3200, status: "pending", date: "26 มิ.ย. 67", address: "123 ถ.รัชดา กรุงเทพฯ 10400" },
  { id: "ORD-1041", customer: "มาลี สวย", product: "ผ้าขิดลายดอก", meters: 2, amount: 1800, status: "confirmed", date: "25 มิ.ย. 67", address: "45 ถ.นิมมาน เชียงใหม่ 50200" },
  { id: "ORD-1040", customer: "อนันต์ รัก", product: "ผ้าทอมือลายน้ำ", meters: 5, amount: 4500, status: "shipped", date: "24 มิ.ย. 67", address: "88 ถ.สุขุมวิท กรุงเทพฯ 10110", trackingNo: "TH123456789" },
  { id: "ORD-1039", customer: "ประภา แก้ว", product: "ผ้าซิ่นลายขอ", meters: 4, amount: 2800, status: "delivered", date: "20 มิ.ย. 67", address: "12 ถ.ท่าแพ เชียงใหม่ 50100" },
  { id: "ORD-1038", customer: "วิชัย ดี", product: "ผ้าไหมพิมาย", meters: 2, amount: 5600, status: "cancelled", date: "18 มิ.ย. 67", address: "" },
];

const STATUS_CONFIG: Record<string, { label: string; color: "warning" | "info" | "success" | "default" | "error"; stepIndex: number }> = {
  pending: { label: "รอยืนยัน", color: "warning", stepIndex: 0 },
  confirmed: { label: "ยืนยันแล้ว", color: "info", stepIndex: 1 },
  shipped: { label: "จัดส่งแล้ว", color: "success", stepIndex: 2 },
  delivered: { label: "สำเร็จ", color: "default", stepIndex: 3 },
  cancelled: { label: "ยกเลิก", color: "error", stepIndex: -1 },
};

const ORDER_STEPS = ["รอยืนยัน", "กำลังผลิต", "จัดส่งแล้ว", "สำเร็จ"];
const TABS = ["ทั้งหมด", "รอยืนยัน", "ยืนยันแล้ว", "จัดส่งแล้ว", "สำเร็จ"];
const TAB_STATUS: Record<number, string | null> = { 0: null, 1: "pending", 2: "confirmed", 3: "shipped", 4: "delivered" };

export default function MerchantOrdersPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof ALL_ORDERS[0] | null>(null);
  const [trackingNo, setTrackingNo] = useState("");

  const filtered = ALL_ORDERS.filter((o) => {
    if (TAB_STATUS[tab] && o.status !== TAB_STATUS[tab]) return false;
    if (search && !o.id.includes(search) && !o.customer.includes(search)) return false;
    return true;
  });

  const handleAction = (order: typeof ALL_ORDERS[0]) => {
    setSelected(order);
    setTrackingNo(order.trackingNo ?? "");
  };

  const getActionLabel = (status: string) => {
    if (status === "pending") return "ยืนยันออเดอร์";
    if (status === "confirmed") return "ส่งพัสดุ";
    return null;
  };

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
        จัดการออเดอร์
      </Typography>

      <TextField
        fullWidth placeholder="ค้นหา รหัสออเดอร์ หรือ ชื่อลูกค้า"
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#9CA3AF" }} /></InputAdornment> }}
        sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: "12px", "& fieldset": { borderColor: "#E5DFD6" } } }}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
        sx={{ mb: 2, "& .MuiTab-root": { fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", minWidth: "auto", textTransform: "none" }, "& .Mui-selected": { color: "#1B2A4A", fontWeight: 600 }, "& .MuiTabs-indicator": { bgcolor: "#C5A55A" } }}
      >
        {TABS.map((t) => <Tab key={t} label={t} />)}
      </Tabs>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filtered.map((order, i) => {
          const cfg = STATUS_CONFIG[order.status];
          const actionLabel = getActionLabel(order.status);
          return (
            <Card key={order.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none" }}
            >
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", fontSize: "0.9rem" }}>
                      {order.id} · {order.customer}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", fontSize: "0.78rem" }}>
                      {order.product} · {order.meters} เมตร · {order.date}
                    </Typography>
                  </Box>
                  <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem" }} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
                    ฿{order.amount.toLocaleString()}
                  </Typography>
                  {actionLabel && (
                    <Button size="small" variant="contained" onClick={() => handleAction(order)}
                      sx={{ bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "8px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none", fontSize: "0.78rem" }}
                    >
                      {actionLabel}
                    </Button>
                  )}
                  {order.trackingNo && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocalShippingRoundedIcon sx={{ fontSize: 16, color: "#10B981" }} />
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#10B981" }}>
                        {order.trackingNo}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', color: "#9CA3AF" }}>ไม่พบออเดอร์</Typography>
          </Box>
        )}
      </Box>

      {/* Action Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} PaperProps={{ sx: { borderRadius: "20px", mx: 2, width: "100%" } }}>
        <DialogTitle sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
          {selected?.status === "pending" ? "ยืนยันออเดอร์" : "บันทึกเลขพัสดุ"}
        </DialogTitle>
        <DialogContent>
          {selected && (
            <>
              <Stepper activeStep={STATUS_CONFIG[selected.status]?.stepIndex ?? 0} sx={{ mb: 3 }}>
                {ORDER_STEPS.map((s) => (
                  <Step key={s}><StepLabel sx={{ "& .MuiStepLabel-label": { fontFamily: '"Kanit", sans-serif', fontSize: "0.72rem" }, "& .MuiStepIcon-root.Mui-active": { color: "#C5A55A" }, "& .MuiStepIcon-root.Mui-completed": { color: "#C5A55A" } }}>{s}</StepLabel></Step>
                ))}
              </Stepper>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 2 }}>
                {selected.product} · ฿{selected.amount.toLocaleString()}<br />
                จัดส่งถึง: {selected.address}
              </Typography>
              {selected.status === "confirmed" && (
                <TextField
                  fullWidth label="เลขพัสดุ" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", "& fieldset": { borderColor: "#E5DFD6" }, "&.Mui-focused fieldset": { borderColor: "#C5A55A" } } }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setSelected(null)} sx={{ fontFamily: '"Kanit", sans-serif', color: "#6B7280", textTransform: "none" }}>ยกเลิก</Button>
          <Button variant="contained" onClick={() => setSelected(null)}
            sx={{ bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "10px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
          >
            {selected?.status === "pending" ? "ยืนยัน" : "บันทึก"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
