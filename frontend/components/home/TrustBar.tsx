"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface TrustItem {
  title: string;
  desc: string;
}

/** ไอคอนเส้นบางสไตล์ luxury — เรียงตามลำดับข้อความใน dictionary (home.trust.items) */
const trustIcons = [
  // ผ้าไทยแท้ — เส้นด้าย/กี่ทอ
  <svg key="weave" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5h18M3 9h18M3 15h18M3 19h18" />
    <path d="M7 3v18M12 3v18M17 3v18" opacity="0.55" />
  </svg>,
  // คุณภาพรับรอง — ตรารับรอง
  <svg key="seal" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="6" />
    <path d="M9.5 10l1.8 1.8L15 8.5" />
    <path d="M8.5 15.5L7 21l5-2.5L17 21l-1.5-5.5" />
  </svg>,
  // จัดส่งทั่วประเทศ — รถส่งของ
  <svg key="ship" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 8h13v9H1zM14 11h4l3 3v3h-7z" />
    <circle cx="5.5" cy="18.5" r="1.8" />
    <circle cx="17.5" cy="18.5" r="1.8" />
  </svg>,
  // ความพึงพอใจ — หัวใจในมือ
  <svg key="heart" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8.2c1.2-2.4 4.8-2.2 5.4.4.5 2.1-2.1 4.4-5.4 6.6-3.3-2.2-5.9-4.5-5.4-6.6.6-2.6 4.2-2.8 5.4-.4z" />
    <path d="M3 12v5.5c2.5 2 5.5 3.2 9 3.2s6.5-1.2 9-3.2V12" opacity="0.55" />
  </svg>,
];

export default function TrustBar() {
  const { t } = useLanguage();
  const items = t<TrustItem[]>("home.trust.items");

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      sx={{ py: { xs: 2, md: 3 } }}
    >
      {/* 4 การ์ดแยกอิสระ (แทนแถบเดียว) — พื้นขาว ขอบนุ่ม hover ยกตัวเบาๆ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: { xs: 1.5, md: 2.5 },
        }}
      >
        {items.map((item, i) => (
          <Box
            key={item.title}
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: { xs: "16px", md: "20px" },
              border: "1px solid #EFE9DF",
              boxShadow: "0 4px 18px rgba(27,42,74,0.04)",
              px: { xs: 2, md: 3 },
              py: { xs: 2.25, md: 3 },
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 1.5,
              transition: "transform 0.3s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.3s ease, border-color 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 14px 34px rgba(27,42,74,0.1)",
                borderColor: "rgba(197,165,90,0.4)",
              },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                bgcolor: "rgba(197,165,90,0.1)",
                color: "#C5A55A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {trustIcons[i]}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 600,
                  fontSize: { xs: "0.78rem", md: "0.88rem" },
                  color: "#13284B",
                  lineHeight: 1.35,
                }}
              >
                {item.title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 300,
                  fontSize: { xs: "0.66rem", md: "0.74rem" },
                  color: "#A89F94",
                  mt: 0.5,
                  lineHeight: 1.55,
                }}
              >
                {item.desc}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
