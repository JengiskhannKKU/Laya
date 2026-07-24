"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import Image from "next/image";

const PARTNER_LOGOS = [
  { name: "Freedom 250", src: "/images/Partners/flow_1.webp" },
  { name: "United States Mission Thailand", src: "/images/Partners/images-us-mission.webp" },
  { name: "TUSAA", src: "/images/Partners/images copy.webp" },
  { name: "Microsoft", src: "/images/Partners/images.webp" },
  { name: "Krungthai Bank", src: "/images/Partners/ธนาคารกรุงไทย.webp" },
];

export default function PartnersSection() {
  // คอยล์ซ้ำ 4 รอบเพื่อให้ภาพเลื่อนต่อเนื่องอนันต์ (Infinite Scrolling Marquee) ไม่มีสะดุด
  const marqueeLogos = [...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 1.75, md: 2.25 },
        bgcolor: "#FFFFFF",
        borderTop: "1px solid #EFE9DD",
        borderBottom: "1px solid #EFE9DD",
        position: "relative",
        overflow: "hidden",
        mx: "calc(50% - 50vw)",
        width: "100vw",
        my: { xs: 1, md: 2 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: 2,
          mb: 1.25,
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "#C5A55A",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          PARTNERS & SUPPORTERS
        </Typography>
      </Box>

      {/* แถบโลโก้เลื่อนต่อเนื่อง (Marquee Ticker) */}
      <Box
        sx={{
          display: "flex",
          overflow: "hidden",
          width: "100%",
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <Box
          component={motion.div}
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 22,
              ease: "linear",
            },
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 4, md: 6 },
            whiteSpace: "nowrap",
            willChange: "transform",
          }}
        >
          {marqueeLogos.map((partner, index) => (
            <Box
              key={`${partner.name}-${index}`}
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: { xs: 36, md: 44 },
                px: 1,
                filter: "grayscale(15%) opacity(0.88)",
                transition: "all 0.3s ease",
                "&:hover": {
                  filter: "grayscale(0%) opacity(1)",
                  transform: "scale(1.06)",
                },
              }}
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={140}
                height={50}
                style={{
                  height: "100%",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
