"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

const FONT = '"Kanit", sans-serif';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FAF6F0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: { xs: "4rem", sm: "5.5rem" },
          color: "#C5A55A",
          lineHeight: 1,
          mb: 1,
        }}
      >
        404
      </Typography>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.3rem", color: "#1B2A4A", mb: 1 }}>
        ไม่พบหน้าที่คุณกำลังมองหา
      </Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: "#6B7280", maxWidth: 380, mb: 4, lineHeight: 1.7 }}>
        หน้านี้อาจถูกย้าย ลบไปแล้ว หรือลิงก์ที่คุณใช้ไม่ถูกต้อง ลองกลับไปหน้าแรกหรือค้นหาสิ่งที่ต้องการอีกครั้ง
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          component={Link}
          href="/"
          variant="contained"
          startIcon={<HomeRoundedIcon />}
          sx={{
            bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", px: 3, py: 1.3,
            fontFamily: FONT, fontWeight: 600, textTransform: "none",
            "&:hover": { bgcolor: "#0F1A30" },
          }}
        >
          กลับหน้าแรก
        </Button>
        <Button
          component={Link}
          href="/search"
          variant="outlined"
          startIcon={<SearchRoundedIcon />}
          sx={{
            borderColor: "#E5DFD6", color: "#1B2A4A", borderRadius: "12px", px: 3, py: 1.3,
            fontFamily: FONT, fontWeight: 600, textTransform: "none",
            "&:hover": { borderColor: "#C5A55A", bgcolor: "rgba(197,165,90,0.06)" },
          }}
        >
          ค้นหาสินค้า
        </Button>
      </Box>
    </Box>
  );
}
