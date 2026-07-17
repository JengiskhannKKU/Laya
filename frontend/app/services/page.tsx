"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import AutoAwesomeMosaicRoundedIcon from "@mui/icons-material/AutoAwesomeMosaicRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const IVORY = "#FAF6F0";

export default function ServicesPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const SERVICES = [
    {
      href: "/services/tailor",
      icon: CheckroomRoundedIcon,
      title: t("services.tailor.title"),
      desc: t("services.tailor.desc"),
    },
    {
      href: "/weaving-order",
      icon: AutoAwesomeMosaicRoundedIcon,
      title: t("services.weave.title"),
      desc: t("services.weave.desc"),
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
            <IconButton onClick={() => router.push("/")} sx={{ color: NAVY }}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography sx={{ flex: 1, textAlign: "center", mr: 5, fontFamily: FONT, fontSize: { xs: "1.05rem", md: "1.25rem" }, fontWeight: 700, color: NAVY }}>
              {t("services.chooseTitle")}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 720, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 3, md: 5 }, pb: 6 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: "#6B7280", textAlign: "center", mb: 4 }}>
            {t("services.chooseSubtitle")}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {SERVICES.map(({ href, icon: Icon, title, desc }, i) => (
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
                      width: 64, height: 64, borderRadius: "18px", flexShrink: 0,
                      bgcolor: `${NAVY}0D`, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon sx={{ fontSize: 30, color: GOLD }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.15rem", color: NAVY }}>
                        {title}
                      </Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: "#6B7280", mt: 0.5, lineHeight: 1.5 }}>
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
