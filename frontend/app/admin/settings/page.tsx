"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAdminTheme } from "@/lib/admin-theme-context";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function SettingsPage() {
  const { c } = useAdminTheme();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: c.textPrimary, mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
          <SettingsRoundedIcon sx={{ fontSize: 20 }} /> Settings
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: c.textMuted }}>
          การตั้งค่าระบบและค่าคอมมิชชันแพลตฟอร์ม
        </Typography>
      </Box>

      <Box sx={{
        bgcolor: c.bgCard, borderRadius: "14px", border: `1px solid ${c.borderCard}`,
        p: 5, textAlign: "center", mb: 3,
      }}>
        <SettingsRoundedIcon sx={{ fontSize: 40, color: c.textMuted, mb: 2 }} />
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1rem", color: c.textPrimary, mb: 1 }}>
          หน้าตั้งค่าระบบยังไม่พร้อมใช้งาน
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: c.textMuted, maxWidth: 460, mx: "auto", lineHeight: 1.7 }}>
          การตั้งค่าแพลตฟอร์ม (ข้อมูลติดต่อ, Maintenance Mode, การแจ้งเตือน) และค่าคอมมิชชันแบบละเอียดตามหมวดหมู่/ระดับร้านค้า
          ยังไม่มีระบบจัดเก็บฝั่งหลังบ้านรองรับ ฟีเจอร์นี้จะเปิดใช้งานเมื่อพัฒนาระบบตั้งค่าแบบไดนามิกเสร็จสมบูรณ์
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, p: 2.5, borderRadius: "12px", bgcolor: c.bgCardHover, border: `1px solid ${c.borderCard}` }}>
        <InfoOutlinedIcon sx={{ fontSize: 18, color: c.gold, flexShrink: 0, mt: 0.2 }} />
        <Typography sx={{ fontSize: "0.8rem", color: c.textSecondary, lineHeight: 1.6 }}>
          ปัจจุบันค่าคอมมิชชันแพลตฟอร์มเป็นอัตราคงที่ที่ตั้งค่าผ่านตัวแปรสภาพแวดล้อมฝั่งเซิร์ฟเวอร์ (<code>PLATFORM_FEE_PERCENT</code>) ไม่สามารถแก้ไขผ่านหน้านี้ได้
        </Typography>
      </Box>
    </Box>
  );
}
