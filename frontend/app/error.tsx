"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

const FONT = '"Kanit", sans-serif';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
      <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
        <ErrorOutlineRoundedIcon sx={{ fontSize: 36, color: "#EF4444" }} />
      </Box>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.3rem", color: "#1B2A4A", mb: 1 }}>
        เกิดข้อผิดพลาดบางอย่าง
      </Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", color: "#6B7280", maxWidth: 380, mb: 4, lineHeight: 1.7 }}>
        ขออภัยในความไม่สะดวก ระบบพบข้อผิดพลาดที่ไม่คาดคิด ลองรีเฟรชหน้าอีกครั้ง หรือกลับไปหน้าแรก
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          onClick={reset}
          variant="contained"
          startIcon={<RefreshRoundedIcon />}
          sx={{
            bgcolor: "#1B2A4A", color: "#FFFFFF", borderRadius: "12px", px: 3, py: 1.3,
            fontFamily: FONT, fontWeight: 600, textTransform: "none",
            "&:hover": { bgcolor: "#0F1A30" },
          }}
        >
          ลองอีกครั้ง
        </Button>
        <Button
          component={Link}
          href="/"
          variant="outlined"
          startIcon={<HomeRoundedIcon />}
          sx={{
            borderColor: "#E5DFD6", color: "#1B2A4A", borderRadius: "12px", px: 3, py: 1.3,
            fontFamily: FONT, fontWeight: 600, textTransform: "none",
            "&:hover": { borderColor: "#C5A55A", bgcolor: "rgba(197,165,90,0.06)" },
          }}
        >
          กลับหน้าแรก
        </Button>
      </Box>
    </Box>
  );
}
