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

import MobileLayout from "@/components/layout/MobileLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const IVORY = "#FAF6F0";

export default function TailorTypePage() {
  const router = useRouter();
  const { t } = useLanguage();

  // "มีผ้า" ชี้ไป /tailor/with-fabric จริง (เดิมชี้ /design-clothes ผิด — /design-clothes คือห้องออกแบบชุดจากศูนย์
  // ไม่ใช่ flow "มีผ้าอยู่แล้ว อัปโหลดรูป+AI วิเคราะห์+ลองใส่เสมือนจริง" ที่ตรงกับความหมายของตัวเลือกนี้)
  const OPTIONS = [
    {
      href: "/tailor/with-fabric",
      icon: CheckroomRoundedIcon,
      iconBg: NAVY,
      title: t("services.tailor.haveFabric"),
      desc: t("services.tailor.haveFabricDesc"),
    },
    {
      href: "/community",
      icon: StorefrontRoundedIcon,
      iconBg: GOLD,
      title: t("services.tailor.chooseShopFabric"),
      desc: t("services.tailor.chooseShopFabricDesc"),
    },
  ];

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
              {t("services.tailor.title")}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 720, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 3, md: 5 }, pb: 6 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: "#6B7280", textAlign: "center", mb: 4 }}>
            {t("services.tailor.subtitle")}
          </Typography>

          {/* กล่องสี่เหลี่ยมเรียงแนวนอน (เดิมเป็นแถวยาวเต็มความกว้างเรียงซ้อนกัน) */}
          {/* จำนวนคอลัมน์ = จำนวนตัวเลือกจริงเสมอ (ตอนนี้ 2) — กันช่องว่างเปล่าตอนตัวเลือกไม่ครบ 3
              ถ้าเพิ่มตัวเลือกที่ 3 ในอนาคต จะกลายเป็น 3 คอลัมน์ให้เองโดยไม่ต้องแก้โค้ดจุดนี้ */}
          <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${OPTIONS.length}, 1fr)`, gap: { xs: 1.5, md: 2.5 } }}>
            {OPTIONS.map(({ href, icon: Icon, iconBg, title, desc }, i) => (
              <motion.div key={href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }}>
                <Link href={href} style={{ textDecoration: "none" }}>
                  <Box
                    component={motion.div}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.99 }}
                    sx={{
                      aspectRatio: "1 / 1",
                      p: { xs: 2, md: 3.5 },
                      borderRadius: "20px",
                      bgcolor: "#FFFFFF",
                      border: "1px solid #EFE9DD",
                      boxShadow: "0 4px 20px rgba(27,42,74,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: { xs: 1, md: 1.5 },
                      cursor: "pointer",
                      transition: "box-shadow 0.25s, border-color 0.25s",
                      "&:hover": { boxShadow: "0 12px 32px rgba(27,42,74,0.12)", borderColor: GOLD },
                    }}
                  >
                    <Box sx={{
                      width: { xs: 48, md: 60 }, height: { xs: 48, md: 60 }, borderRadius: "50%", flexShrink: 0,
                      bgcolor: iconBg, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon sx={{ fontSize: { xs: 22, md: 26 }, color: "#FFFFFF" }} />
                    </Box>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: { xs: "0.9rem", md: "1.1rem" }, color: NAVY }}>
                      {title}
                    </Typography>
                    <Typography sx={{
                      fontFamily: FONT, fontSize: { xs: "0.7rem", md: "0.8rem" }, color: "#6B7280", lineHeight: 1.5,
                      display: "-webkit-box", WebkitLineClamp: { xs: 3, md: 4 }, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {desc}
                    </Typography>
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
