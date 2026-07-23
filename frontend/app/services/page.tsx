"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/auth-context";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const GOLD = "#C5A55A";
const CREAM_BG = "#F5EFE6";
const CARD_BG = "#FCFAF5";

/** ดอกประจำยาม / สัญลักษณ์กนกทองไทย */
function ThaiFlowerEmblem({ size = 30, color = GOLD }: { size?: number; color?: string }) {
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

/** ดอกไม้ไทยขนาดเล็กใต้subtitle */
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
      <Box sx={{ width: { xs: 44, md: 60 }, height: "1px", bgcolor: "#D8C59E" }} />
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: GOLD, mx: 1.25 }} />
      <Box sx={{ width: { xs: 44, md: 60 }, height: "1px", bgcolor: "#D8C59E" }} />
    </Box>
  );
}

/** ไอคอนไม้แขวนเสื้อสีทอง (สั่งตัด) */
function GoldHangerIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a3 3 0 0 0-3 3c0 .8.3 1.5.8 2L3.5 13.5A2 2 0 0 0 5 17h14a2 2 0 0 0 1.5-3.5L14.2 8c.5-.5.8-1.2.8-2a3 3 0 0 0-3-3z" />
      <path d="M9 13.5v.5" stroke={GOLD} strokeWidth="1.5" />
    </svg>
  );
}

/** ไอคอนผ้าทอมือ 4 ช่องสีทอง (สั่งทอผ้า) */
function GoldFabricLoomIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" fill={GOLD} fillOpacity="0.25" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" fill={GOLD} />
      <rect x="3" y="13" width="8" height="8" rx="1.5" fill={GOLD} />
      <rect x="13" y="13" width="8" height="8" rx="1.5" fill={GOLD} fillOpacity="0.25" />
    </svg>
  );
}

/** กรอบกรอบเพชรสีกรมทองสำหรับไอคอน */
function IconBadgeFrame({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", my: 1.5 }}>
      {/* กรอบสี่เหลี่ยมหมุนเป็นรูปเพชร (Diamond Frame) */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 74, md: 84 },
          height: { xs: 74, md: 84 },
          bgcolor: "#C5A55A",
          transform: "rotate(45deg)",
          borderRadius: "16px",
          boxShadow: "0 6px 18px rgba(197,165,90,0.38)",
        }}
      />
      {/* วงกลมสีกรมท่าซ้อนด้านใน */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: { xs: 68, md: 76 },
          height: { xs: 68, md: 76 },
          borderRadius: "50%",
          bgcolor: NAVY,
          border: "2px solid #EAD8B7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.45)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/** ลายไทยโบราณติดขอบล่างของการ์ดพร้อมส่วนโค้ง */
function CardBottomPattern() {
  return (
    <Box sx={{ width: "100%", mt: "auto", position: "relative", overflow: "hidden", lineHeight: 0 }}>
      <svg viewBox="0 0 400 95" width="100%" height="95" preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <pattern id="thaiKhitGoldPattern" patternUnits="userSpaceOnUse" width="28" height="28">
            <path d="M14 0 L28 14 L14 28 L0 14 Z" fill="none" stroke="#C5A55A" strokeWidth="0.85" opacity="0.38" />
            <path d="M14 5 L23 14 L14 23 L5 14 Z" fill="none" stroke="#C5A55A" strokeWidth="0.5" opacity="0.25" />
            <circle cx="14" cy="14" r="1.8" fill="#C5A55A" opacity="0.45" />
          </pattern>
        </defs>

        {/* โค้งส่วนบนชี้ขึ้นในลักษณะทรงซุ้มประตูไทย */}
        <path d="M 0,95 L 0,45 Q 200,8 400,45 L 400,95 Z" fill={NAVY} />
        {/* ลวดลายขิดทองทับบนสีกรมท่า */}
        <path d="M 0,95 L 0,45 Q 200,8 400,45 L 400,95 Z" fill="url(#thaiKhitGoldPattern)" />
        {/* เส้นขอบสีทองเลียบคอร์ฟโค้ง */}
        <path d="M 0,45 Q 200,8 400,45" fill="none" stroke={GOLD} strokeWidth="1.8" opacity="0.85" />
      </svg>
    </Box>
  );
}

/** ลายน้ำกนกไทยจางๆ ตกแต่งมุมหลังหน้าเพจ */
function ThaiWatermarkBG() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* ลายกนกมุมซ้ายล่าง */}
      <svg
        style={{ position: "absolute", left: -50, bottom: 40, opacity: 0.08 }}
        width="320"
        height="320"
        viewBox="0 0 100 100"
      >
        <path
          d="M 50,10 Q 70,30 90,50 Q 70,70 50,90 Q 30,70 10,50 Q 30,30 50,10 Z"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
        />
        <circle cx="50" cy="50" r="25" fill="none" stroke={GOLD} strokeWidth="1" />
        <path d="M 50,25 Q 60,40 75,50 Q 60,60 50,75 Q 40,60 25,50 Q 40,40 50,25 Z" fill={GOLD} opacity="0.5" />
      </svg>
      {/* ลายกนกมุมขวาบน */}
      <svg
        style={{ position: "absolute", right: -50, top: 80, opacity: 0.08 }}
        width="320"
        height="320"
        viewBox="0 0 100 100"
      >
        <path
          d="M 50,10 Q 70,30 90,50 Q 70,70 50,90 Q 30,70 10,50 Q 30,30 50,10 Z"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
        />
        <circle cx="50" cy="50" r="25" fill="none" stroke={GOLD} strokeWidth="1" />
        <path d="M 50,25 Q 60,40 75,50 Q 60,60 50,75 Q 40,60 25,50 Q 40,40 50,25 Z" fill={GOLD} opacity="0.5" />
      </svg>
    </Box>
  );
}

export default function ServicesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();

  const goToService = (href: string) => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  };

  return (
    <MobileLayout>
      {/* mx: calc(50% - 50vw) ดึงให้สีพื้นหลังครีมขยายเต็มความกว้างขอบจอ 100vw ปิดรอยขาดทุกฝั่ง */}
      <Box
        sx={{
          mx: "calc(50% - 50vw)",
          width: "100vw",
          minHeight: "100vh",
          bgcolor: CREAM_BG,
          position: "relative",
          pb: 0,
          overflow: "hidden",
        }}
      >
        <ThaiWatermarkBG />

        {/* ─── Top Header Arch (สีกรมท่าพร้อมดอกประจำยามทองตรงกลาง) ─── */}
        <Box sx={{ position: "relative", zIndex: 2, bgcolor: CREAM_BG }}>
          {/* ซุ้มโค้งสีกรมท่า */}
          <Box sx={{ width: "100%", lineHeight: 0, bgcolor: CREAM_BG }}>
            <svg viewBox="0 0 400 36" width="100%" height="36" preserveAspectRatio="none" style={{ display: "block" }}>
              <path d="M 0,0 L 400,0 L 400,10 Q 200,34 0,10 Z" fill={NAVY} />
              <path d="M 0,10 Q 200,34 400,10" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.9" />
            </svg>
          </Box>
          {/* ดอกประจำยามสีทองวางกึ่งกลางจุดโค้ง */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: -2.2, mb: 1, position: "relative", zIndex: 3 }}>
            <ThaiFlowerEmblem size={30} />
          </Box>
        </Box>

        {/* ─── Main Content Container ─── */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            maxWidth: { xs: 440, sm: 540, md: 620 },
            width: "100%",
            mx: "auto",
            px: { xs: 2.5, sm: 3, md: 4 },
            pt: { xs: 1, md: 2 },
          }}
        >
          {/* ─── Title Bar with Back Button ─── */}
          <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", mt: 1, mb: 0.5 }}>
            {/* ปุ่มย้อนกลับทรงกลมสีทองนุ่มนวล */}
            <IconButton
              onClick={() => router.push("/")}
              aria-label="back"
              sx={{
                position: "absolute",
                left: 0,
                width: { xs: 44, md: 50 },
                height: { xs: 44, md: 50 },
                bgcolor: "#F3E8D5",
                border: "1.5px solid #D6C29A",
                color: NAVY,
                boxShadow: "0 4px 12px rgba(27,42,74,0.08)",
                transition: "transform 0.2s, background-color 0.2s",
                "&:hover": { bgcolor: "#EBDCC5", transform: "scale(1.04)" },
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: { xs: 18, md: 22 }, ml: "3px" }} />
            </IconButton>

            {/* หัวข้อหน้า: เลือกบริการ (เพิ่มขนาดฟอนต์ตามคำขอ) */}
            <Typography
              component="h1"
              sx={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: { xs: "1.65rem", sm: "1.95rem", md: "2.25rem" },
                color: NAVY,
                textAlign: "center",
                letterSpacing: "-0.01em",
              }}
            >
              {t("services.chooseTitle") || "เลือกบริการ"}
            </Typography>
          </Box>

          {/* เส้นขีดทองพร้อมจุดตรงกลาง */}
          <GoldDotDivider />

          {/* Subtitle (เพิ่มขนาดฟอนต์ตามคำขอ) */}
          <Typography
            sx={{
              fontFamily: FONT,
              fontWeight: 400,
              fontSize: { xs: "0.95rem", sm: "1.08rem", md: "1.18rem" },
              color: "#5A6578",
              textAlign: "center",
              lineHeight: 1.55,
              maxWidth: { xs: 360, sm: 460 },
              mx: "auto",
            }}
          >
            {t("services.chooseSubtitle") || "บริการที่ต้องการ — ทีมช่างและชุมชนทอผ้าทั่วไทยพร้อมดูแลคุณ"}
          </Typography>

          {/* สัญลักษณ์กนกทองเล็กใต้ subtitle */}
          <SmallThaiOrnament />

          {/* ─── Service Cards (การ์ดสั่งตัด & การ์ดสั่งทอผ้า) ─── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 }, mt: 2.5, mb: 4 }}>

            {/* ═══ Card 1: สั่งตัด ═══ */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Box
                onClick={() => goToService("/services/tailor")}
                sx={{
                  bgcolor: CARD_BG,
                  borderRadius: { xs: "28px", md: "32px" },
                  border: "1.5px solid #D8C59E",
                  boxShadow: "0 10px 30px rgba(27,42,74,0.09)",
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  pt: { xs: 3.5, md: 4.5 },
                  transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 18px 44px rgba(27,42,74,0.16)",
                    borderColor: GOLD,
                  },
                }}
              >
                {/* ไอคอนไม้แขวนเสื้อในกรอบเพชรทอง */}
                <IconBadgeFrame>
                  <GoldHangerIcon />
                </IconBadgeFrame>

                {/* ชื่อบริการ (เพิ่มขนาดฟอนต์ตามคำขอ) */}
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.95rem" },
                    color: NAVY,
                    mt: 1.25,
                  }}
                >
                  {t("services.tailor.title") || "สั่งตัด"}
                </Typography>

                {/* เส้นขีดจุดทอง */}
                <GoldDotDivider />

                {/* รายละเอียดบริการ (เพิ่มขนาดฟอนต์ตามคำขอ) */}
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: { xs: "0.98rem", sm: "1.08rem", md: "1.18rem" },
                    color: "#4A5568",
                    textAlign: "center",
                    lineHeight: 1.65,
                    px: { xs: 3, sm: 4, md: 5 },
                    mt: 0.75,
                    mb: 3.5,
                    maxWidth: { xs: 360, sm: 420, md: 480 },
                  }}
                >
                  {t("services.tailor.desc") || "ออกแบบและสั่งตัดชุดจากผ้าทั่วไทย เลือก ไม่ว่าจะเป็นกลุ่มสีหรือดีไซน์ ก็ได้"}
                </Typography>

                {/* ลายไทยสีกรมท่าโค้งขอบล่าง */}
                <CardBottomPattern />
              </Box>
            </motion.div>

            {/* ═══ Card 2: สั่งทอผ้า ═══ */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Box
                onClick={() => goToService("/weaving-order")}
                sx={{
                  bgcolor: CARD_BG,
                  borderRadius: { xs: "28px", md: "32px" },
                  border: "1.5px solid #D8C59E",
                  boxShadow: "0 10px 30px rgba(27,42,74,0.09)",
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  pt: { xs: 3.5, md: 4.5 },
                  transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 18px 44px rgba(27,42,74,0.16)",
                    borderColor: GOLD,
                  },
                }}
              >
                {/* ไอคอนผ้าทอ 4 ช่องในกรอบเพชรทอง */}
                <IconBadgeFrame>
                  <GoldFabricLoomIcon />
                </IconBadgeFrame>

                {/* ชื่อบริการ (เพิ่มขนาดฟอนต์ตามคำขอ) */}
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.95rem" },
                    color: NAVY,
                    mt: 1.25,
                  }}
                >
                  {t("services.weave.title") || "สั่งทอผ้า"}
                </Typography>

                {/* เส้นขีดจุดทอง */}
                <GoldDotDivider />

                {/* รายละเอียดบริการ (เพิ่มขนาดฟอนต์ตามคำขอ) */}
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: { xs: "0.98rem", sm: "1.08rem", md: "1.18rem" },
                    color: "#4A5568",
                    textAlign: "center",
                    lineHeight: 1.65,
                    px: { xs: 3, sm: 4, md: 5 },
                    mt: 0.75,
                    mb: 3.5,
                    maxWidth: { xs: 360, sm: 420, md: 480 },
                  }}
                >
                  {t("services.weave.desc") || "เลือกลายผ้าที่ชอบและแบบทอที่ใช้ ก็ได้ แล้วให้ช่างทอเป็นผืนพิเศษเฉพาะคุณ"}
                </Typography>

                {/* ลายไทยสีกรมท่าโค้งขอบล่าง */}
                <CardBottomPattern />
              </Box>
            </motion.div>

          </Box>
        </Box>

        {/* ─── Bottom Page Decorative Arch ─── */}
        <Box sx={{ width: "100%", mt: 4, lineHeight: 0, position: "relative", zIndex: 2 }}>
          <svg viewBox="0 0 400 40" width="100%" height="40" preserveAspectRatio="none" style={{ display: "block" }}>
            <path d="M 0,40 L 0,15 Q 200,0 400,15 L 400,40 Z" fill={NAVY} />
            <path d="M 0,15 Q 200,0 400,15" fill="none" stroke={GOLD} strokeWidth="1.5" />
          </svg>
        </Box>
      </Box>
    </MobileLayout>
  );
}
