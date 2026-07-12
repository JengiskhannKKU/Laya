"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAdminTheme } from "@/lib/admin-theme-context";

import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";

export default function MarketingPage() {
  const { c } = useAdminTheme();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
          <CampaignRoundedIcon sx={{ fontSize: 20 }} /> Marketing
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>
          โค้ดส่วนลดและแคมเปญการตลาด
        </Typography>
      </Box>

      <Box sx={{
        bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`,
        p: 5, textAlign: "center",
      }}>
        <CampaignRoundedIcon sx={{ fontSize: 40, color: c.textMuted, mb: 2 }} />
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 1 }}>
          ฟีเจอร์การตลาดยังไม่พร้อมใช้งาน
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: c.textMuted, maxWidth: 420, mx: "auto", lineHeight: 1.7 }}>
          ระบบโค้ดส่วนลดและแคมเปญยังไม่ได้เชื่อมต่อกับขั้นตอนชำระเงินจริง ฟีเจอร์นี้จะเปิดใช้งานเมื่อพัฒนาระบบส่วนลดฝั่งหลังบ้านเสร็จสมบูรณ์
        </Typography>
      </Box>
    </Box>
  );
}
