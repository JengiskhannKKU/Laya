"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SparklesIcon from "@mui/icons-material/AutoAwesomeRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const CREAM_BG = "#F5EFE6";
const CARD_BG = "#FCFAF5";

/** ดอกประจำยาม / สัญลักษณ์กนกทองไทย */
function ThaiFlowerEmblem({ size = 28, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill={color}
      />
      <circle cx="12" cy="12" r="3.2" fill={NAVY} />
      <circle cx="12" cy="12" r="1.5" fill={color} />
      <path
        d="M12 5.5L13.5 10.5L18.5 12L13.5 13.5L12 18.5L10.5 13.5L5.5 12L10.5 10.5L12 5.5Z"
        stroke="#FFF"
        strokeWidth="0.4"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}

/** ดอกไม้ไทยขนาดเล็กใต้ subtitle */
function SmallThaiOrnament() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.25, my: 2 }}>
      <Box sx={{ width: { xs: 32, md: 48 }, height: "1px", bgcolor: "#D6C29A" }} />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" fill={GOLD} opacity="0.9" />
        <circle cx="10" cy="10" r="2.2" fill={NAVY} />
      </svg>
      <Box sx={{ width: { xs: 32, md: 48 }, height: "1px", bgcolor: "#D6C29A" }} />
    </Box>
  );
}

/** เส้นคั่นสีทองพร้อมจุดตรงกลาง */
function GoldDotDivider() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", my: 1.5 }}>
      <Box sx={{ width: { xs: 36, md: 50 }, height: "1px", bgcolor: "#D8C59E" }} />
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: GOLD, mx: 1 }} />
      <Box sx={{ width: { xs: 36, md: 50 }, height: "1px", bgcolor: "#D8C59E" }} />
    </Box>
  );
}

/** กรอบสี่เหลี่ยมทรงเพชรลวดลายทองสำหรับไอคอน (Diamond Frame Style) */
function IconBadgeFrame({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", my: 1.5 }}>
      {/* กรอบสี่เหลี่ยมหมุนรูปเพชร */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 70, md: 80 },
          height: { xs: 70, md: 80 },
          bgcolor: "#C5A55A",
          transform: "rotate(45deg)",
          borderRadius: "16px",
          boxShadow: "0 6px 16px rgba(197,165,90,0.3)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: { xs: 64, md: 74 },
          height: { xs: 64, md: 74 },
          bgcolor: NAVY,
          transform: "rotate(45deg)",
          borderRadius: "14px",
        }}
      />
      {/* ไอคอนจัดวางกึ่งกลาง */}
      <Box sx={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", width: { xs: 70, md: 80 }, height: { xs: 70, md: 80 } }}>
        {children}
      </Box>
    </Box>
  );
}

/** ไอคอนม้วนผ้าและกรรไกรสั่งตัดสีทอง */
function GoldFabricScissorsIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a3 3 0 0 0-3 3c0 .8.3 1.5.8 2L3.5 13.5A2 2 0 0 0 5 17h14a2 2 0 0 0 1.5-3.5L14.2 8c.5-.5.8-1.2.8-2a3 3 0 0 0-3-3z" />
      <path d="M9 13.5v.5" stroke={GOLD} strokeWidth="1.5" />
    </svg>
  );
}

/** ไอคอนหน้าร้านและม้วนผ้าไหมทอมือ */
function GoldStoreFabricIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function TailorTypePage() {
  const router = useRouter();
  const { t } = useLanguage();

  const OPTIONS = [
    {
      href: "/tailor/with-fabric",
      badge: "มีผ้าอยู่แล้ว",
      icon: <GoldFabricScissorsIcon />,
      title: t("services.tailor.haveFabric"),
      desc: t("services.tailor.haveFabricDesc"),
      cta: "เริ่มออกแบบ & สั่งตัด",
    },
    {
      href: "/community",
      badge: "เลือกซื้อผ้าใหม่",
      icon: <GoldStoreFabricIcon />,
      title: t("services.tailor.chooseShopFabric"),
      desc: t("services.tailor.chooseShopFabricDesc"),
      cta: "เลือกซื้อผ้าจากชุมชน",
    },
  ];

  return (
    <MobileLayout>
      <Box sx={{ minHeight: "100vh", bgcolor: CREAM_BG, pb: 8 }}>

        {/* ─── Top Sticky Header ─── */}
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: 1.5,
            display: "flex",
            alignItems: "center",
            bgcolor: "rgba(245, 239, 230, 0.92)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            borderBottom: "1px solid #E6DAC8",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", maxWidth: 900, width: "100%", mx: "auto" }}>
            <IconButton onClick={() => router.push("/services")} sx={{ color: NAVY, p: 1 }}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography
              sx={{
                flex: 1,
                textAlign: "center",
                mr: 4,
                fontFamily: FONT,
                fontSize: { xs: "0.98rem", md: "1.1rem" },
                fontWeight: 600,
                color: NAVY,
                letterSpacing: "0.02em",
              }}
            >
              {t("services.tailor.title")}
            </Typography>
          </Box>
        </Box>

        {/* ─── Main Content Container ─── */}
        <Box sx={{ maxWidth: 880, width: "100%", mx: "auto", px: { xs: 2.5, sm: 3.5, md: 4 }, pt: { xs: 3.5, md: 5 } }}>

          {/* ─── Hero Title Section (Thai Aesthetics) ─── */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <ThaiFlowerEmblem size={24} />
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  color: GOLD,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                }}
              >
                TAILORING SELECTION
              </Typography>
              <ThaiFlowerEmblem size={24} />
            </Box>

            <Typography
              component="h1"
              sx={{
                fontFamily: 'var(--font-cormorant), "Cormorant Garamond", "Kanit", serif',
                fontWeight: 700,
                fontSize: { xs: "1.85rem", sm: "2.3rem", md: "2.6rem" },
                color: NAVY,
                lineHeight: 1.2,
                mt: 1,
              }}
            >
              คุณมีผ้าสำหรับสั่งตัดแล้วหรือไม่?
            </Typography>

            <SmallThaiOrnament />

            <Typography
              sx={{
                fontFamily: FONT,
                fontWeight: 300,
                fontSize: { xs: "0.88rem", md: "0.98rem" },
                color: "#5C6470",
                maxWidth: 580,
                mx: "auto",
                lineHeight: 1.7,
              }}
            >
              เลือกสไตล์ขั้นตอนการสั่งตัดที่คุณต้องการ ไม่ว่าจะเป็นการนำผ้าที่คุณมีอยู่แล้วมาตัดเย็บ หรือเลือกซื้อผ้าไทยทอมือเกรดพรีเมียมจากชุมชนช่างฝีมือ
            </Typography>
          </Box>

          {/* ─── Card Options Grid (Design System Style) ─── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: { xs: 2.5, md: 3.5 },
            }}
          >
            {OPTIONS.map(({ href, badge, icon, title, desc, cta }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
              >
                <Link href={href} style={{ textDecoration: "none" }}>
                  <Box
                    component={motion.div}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.99 }}
                    sx={{
                      position: "relative",
                      p: { xs: 3, md: 4 },
                      borderRadius: "24px",
                      bgcolor: CARD_BG,
                      border: "1.5px solid #D8C59E",
                      boxShadow: "0 10px 30px rgba(27,42,74,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.22,0.61,0.36,1)",
                      "&:hover": {
                        boxShadow: "0 16px 40px rgba(197,165,90,0.22)",
                        borderColor: GOLD,
                        bgcolor: "#FFFFFF",
                        "& .cta-arrow": { transform: "translateX(4px)" },
                      },
                    }}
                  >
                    {/* ป้ายทองด้านบนการ์ด */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -12,
                        bgcolor: NAVY,
                        color: GOLD,
                        border: "1px solid #C5A55A",
                        fontFamily: FONT,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        px: 2,
                        py: 0.3,
                        borderRadius: "999px",
                        boxShadow: "0 4px 12px rgba(27,42,74,0.15)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <SparklesIcon sx={{ fontSize: 13, color: GOLD }} />
                      {badge}
                    </Box>

                    {/* ไอคอนในกรอบเพชรทอง */}
                    <IconBadgeFrame>{icon}</IconBadgeFrame>

                    {/* หัวข้อตัวเลือก */}
                    <Typography
                      sx={{
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: { xs: "1.1rem", md: "1.25rem" },
                        color: NAVY,
                        mt: 1,
                        mb: 0.5,
                      }}
                    >
                      {title}
                    </Typography>

                    <GoldDotDivider />

                    {/* คำอธิบาย */}
                    <Typography
                      sx={{
                        fontFamily: FONT,
                        fontWeight: 300,
                        fontSize: { xs: "0.82rem", md: "0.88rem" },
                        color: "#5C6470",
                        lineHeight: 1.7,
                        mb: 3,
                        flex: 1,
                      }}
                    >
                      {desc}
                    </Typography>

                    {/* ปุ่ม action แบบ Thai Luxury Button */}
                    <Box
                      sx={{
                        mt: "auto",
                        width: "100%",
                        py: 1.1,
                        px: 2.5,
                        borderRadius: "999px",
                        bgcolor: NAVY,
                        color: "#FFFFFF",
                        fontFamily: FONT,
                        fontWeight: 600,
                        fontSize: { xs: "0.85rem", md: "0.9rem" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        border: "1px solid #C5A55A",
                        boxShadow: "0 4px 14px rgba(27,42,74,0.18)",
                        transition: "all 0.25s ease",
                      }}
                    >
                      {cta}
                      <ArrowForwardRoundedIcon className="cta-arrow" sx={{ fontSize: 17, color: GOLD, transition: "transform 0.25s ease" }} />
                    </Box>

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
