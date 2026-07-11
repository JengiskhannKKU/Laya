"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { motion } from "framer-motion";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";

const PAYOUTS = [
  { id: "PAY-042", date: "20 มิ.ย. 67", amount: 18400, orders: 6, status: "paid" },
  { id: "PAY-041", date: "10 มิ.ย. 67", amount: 12500, orders: 4, status: "paid" },
  { id: "PAY-040", date: "1 มิ.ย. 67", amount: 9800, orders: 3, status: "paid" },
  { id: "PAY-039", date: "20 พ.ค. 67", amount: 22100, orders: 7, status: "paid" },
];

export default function MerchantPayoutsPage() {
  const pending = 14000;
  const totalThisMonth = 32400;

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.3rem", fontWeight: 700, color: "#1B2A4A", mb: 2 }}>
        รายได้และการโอนเงิน
      </Typography>

      {/* Summary cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
        <Card component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          sx={{ border: "1px solid #E5DFD6", borderRadius: "16px", boxShadow: "none", background: "linear-gradient(135deg, #1B2A4A, #2C3E6B)" }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <AccountBalanceWalletRoundedIcon sx={{ color: "#C5A55A", fontSize: 28, mb: 1 }} />
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF" }}>
              ฿{pending.toLocaleString()}
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
              รอโอนเงินรอบถัดไป
            </Typography>
          </CardContent>
        </Card>
        <Card component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          sx={{ border: "1px solid #E5DFD6", borderRadius: "16px", boxShadow: "none" }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <TrendingUpRoundedIcon sx={{ color: "#10B981", fontSize: 28, mb: 1 }} />
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "1.5rem", fontWeight: 700, color: "#1B2A4A" }}>
              ฿{totalThisMonth.toLocaleString()}
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>
              รายได้เดือนนี้
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Info */}
      <Box sx={{ bgcolor: "#FFF8E7", border: "1px solid #F0D080", borderRadius: "12px", p: 2, mb: 3, display: "flex", alignItems: "flex-start", gap: 1 }}>
        <EventRoundedIcon sx={{ color: "#92700A", fontSize: "1.1rem", mt: 0.2, flexShrink: 0 }} />
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.82rem", color: "#92700A" }}>
          LAYA โอนเงินทุกวันที่ 1 และ 20 ของเดือน หลังหักค่าบริการแพลตฟอร์ม 5%
        </Typography>
      </Box>

      {/* History */}
      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, color: "#1B2A4A", mb: 1.5 }}>
        ประวัติการโอนเงิน
      </Typography>
      <Card sx={{ border: "1px solid #E5DFD6", borderRadius: "16px", boxShadow: "none" }}>
        {PAYOUTS.map((p, i) => (
          <Box key={p.id}>
            {i > 0 && <Divider sx={{ borderColor: "#F0EBE3" }} />}
            <Box sx={{ px: 2.5, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: "0.88rem", color: "#1B2A4A" }}>
                  {p.id}
                </Typography>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", color: "#6B7280" }}>
                  {p.date} · {p.orders} ออเดอร์
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, color: "#1B2A4A" }}>
                  ฿{p.amount.toLocaleString()}
                </Typography>
                <Chip label="โอนแล้ว" size="small" color="success" sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.68rem", height: 20 }} />
              </Box>
            </Box>
          </Box>
        ))}
      </Card>
    </Box>
  );
}
