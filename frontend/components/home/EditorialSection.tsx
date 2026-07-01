"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function EditorialSection() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      sx={{ py: { xs: 4, md: 7 } }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
          borderRadius: { xs: "24px", md: "28px" },
          overflow: "hidden",
          bgcolor: "#FFFFFF",
          boxShadow: "0 10px 40px rgba(27,42,74,0.08)",
          minHeight: { md: 420 },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            position: "relative",
            height: { xs: 240, md: "auto" },
            minHeight: { md: 420 },
          }}
        >
          <Image
            src="/thai.jpg"
            alt="The story behind Thai silk"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </Box>

        {/* Text */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 3, md: 6 },
            py: { xs: 4, md: 6 },
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 600,
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C5A55A",
              mb: 1.5,
            }}
          >
            The Heritage Collection
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", "Georgia", serif',
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: { xs: "1.9rem", md: "2.6rem" },
              color: "#1B2A4A",
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            The Story Behind Thai Silk
          </Typography>

          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 300,
              fontSize: { xs: "0.9rem", md: "1rem" },
              color: "#4A5468",
              lineHeight: 1.85,
              mb: 3.5,
              maxWidth: 460,
            }}
          >
            ผ้าไหมไทยแต่ละผืนคือเรื่องราวของช่างทอที่สืบทอดภูมิปัญญาผ่านหลายชั่วอายุคน
            จากเส้นใยธรรมชาติ สีย้อมจากพืชพรรณ สู่ลวดลายที่บอกเล่าตัวตนของแต่ละชุมชน
          </Typography>

          <Box>
            <Link href="/community" style={{ textDecoration: "none" }}>
              <Button
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: "#1B2A4A",
                  color: "#FFFFFF",
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  borderRadius: "999px",
                  px: 3,
                  py: 1.2,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#14213a", boxShadow: "none" },
                }}
              >
                อ่านเรื่องราว
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
