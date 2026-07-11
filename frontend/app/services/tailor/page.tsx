"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import MobileLayout from "@/components/layout/MobileLayout";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const IVORY = "#FAF6F0";

// "มีผ้า" ชี้ไป /tailor/with-fabric จริง (เดิมชี้ /design-clothes ผิด — /design-clothes คือห้องออกแบบชุดจากศูนย์
// ไม่ใช่ flow "มีผ้าอยู่แล้ว อัปโหลดรูป+AI วิเคราะห์+ลองใส่เสมือนจริง" ที่ตรงกับความหมายของตัวเลือกนี้)
const OPTIONS = [
  {
    href: "/tailor/with-fabric",
    icon: CheckroomRoundedIcon,
    iconBg: NAVY,
    title: "มีผ้า",
    desc: "ถ่ายภาพผ้าของคุณ ให้ AI วิเคราะห์ แนะนำทรง แล้วลองใส่เสมือนจริงก่อนตัด",
  },
  {
    href: "/community",
    icon: StorefrontRoundedIcon,
    iconBg: GOLD,
    title: "เลือกผ้าของร้าน",
    desc: "ยังไม่มีผ้า? เลือกดูผ้าจากร้านค้าและชุมชนทอผ้าทั่วไทย",
  },
];

export default function TailorTypePage() {
  const router = useRouter();

  return (
    <MobileLayout>
      <Box sx={{ minHeight: "100vh", bgcolor: IVORY }}>
        {/* Header */}
        <Box sx={{
          px: { xs: 1.5, md: 4 }, pt: { xs: 4, md: 3 }, pb: { xs: 2, md: 2.5 }, display: "flex", alignItems: "center",
          bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #EFE9DD",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", maxWidth: 720, width: "100%", mx: "auto" }}>
            <IconButton onClick={() => router.push("/services")} sx={{ color: NAVY }}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography sx={{ flex: 1, textAlign: "center", mr: 5, fontFamily: FONT, fontSize: { xs: "1.05rem", md: "1.25rem" }, fontWeight: 700, color: NAVY }}>
              สั่งตัด
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 720, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 3, md: 5 }, pb: 6 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: "#6B7280", textAlign: "center", mb: 4 }}>
            คุณมีผ้าสำหรับสั่งตัดแล้วหรือไม่?
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {OPTIONS.map(({ href, icon: Icon, iconBg, title, desc }, i) => (
              <motion.div key={href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }}>
                <Link href={href} style={{ textDecoration: "none" }}>
                  <Box
                    component={motion.div}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.99 }}
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: "20px",
                      bgcolor: "#FFFFFF",
                      border: "1px solid #EFE9DD",
                      boxShadow: "0 4px 20px rgba(27,42,74,0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2.5,
                      cursor: "pointer",
                      transition: "box-shadow 0.25s, border-color 0.25s",
                      "&:hover": { boxShadow: "0 12px 32px rgba(27,42,74,0.12)", borderColor: GOLD },
                    }}
                  >
                    <Box sx={{
                      width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
                      bgcolor: iconBg, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon sx={{ fontSize: 26, color: "#FFFFFF" }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.1rem", color: NAVY }}>
                        {title}
                      </Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280", mt: 0.5, lineHeight: 1.5 }}>
                        {desc}
                      </Typography>
                    </Box>
                    <ArrowForwardRoundedIcon sx={{ color: "#C9C2B4", fontSize: 22, flexShrink: 0 }} />
                  </Box>
                </Link>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>
    </MobileLayout>
  );
}
