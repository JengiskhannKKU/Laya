"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme-context";

import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

export default function AnalyticsPage() {
  const { c } = useAdminTheme();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
          <BarChartRoundedIcon sx={{ fontSize: 20 }} /> Analytics
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>
          วิเคราะห์ข้อมูลการขาย เทรนด์ และ insight เชิงลึก
        </Typography>
      </Box>

      <Box sx={{
        bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`,
        p: 5, textAlign: "center",
      }}>
        <BarChartRoundedIcon sx={{ fontSize: 40, color: c.textMuted, mb: 2 }} />
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 1 }}>
          Analytics เชิงลึกยังไม่พร้อมใช้งาน
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: c.textMuted, mb: 3, maxWidth: 420, mx: "auto", lineHeight: 1.7 }}>
          รายงานเทรนด์การขาย, เทรนด์การค้นหา, และการวิเคราะห์เชิงพยากรณ์ต้องอาศัยการเก็บข้อมูลเพิ่มเติมที่ระบบยังไม่รองรับในตอนนี้
          ดูตัวเลขภาพรวมแพลตฟอร์มที่มีอยู่จริงได้ที่หน้า Dashboard
        </Typography>
        <Button component={Link} href="/admin" variant="contained" startIcon={<DashboardRoundedIcon />}
          sx={{ bgcolor: c.gold, color: c.textOnGold, borderRadius: "10px", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: c.goldHover } }}>
          ไปที่ Dashboard
        </Button>
      </Box>
    </Box>
  );
}
