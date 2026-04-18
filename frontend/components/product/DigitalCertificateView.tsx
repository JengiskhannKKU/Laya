"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { motion } from "framer-motion";
import Image from "next/image";
import { type Product } from "@/lib/mock-data";

interface DigitalCertificateViewProps {
  product: Product;
  onBack: () => void;
}

export default function DigitalCertificateView({ product, onBack }: DigitalCertificateViewProps) {
  const passport = product.passport;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      sx={{
        bgcolor: "#F8F5F1",
        minHeight: "100vh",
        pb: 12,
        maxWidth: 430,
        mx: "auto",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Navigation Header */}
      <Box sx={{ width: "100%", p: 2, display: "flex", alignItems: "center" }}>
        <IconButton onClick={onBack} sx={{ color: "#1B2A4A" }}>
          <ArrowBackIosNewRoundedIcon />
        </IconButton>
        <Typography sx={{ flex: 1, fontWeight: 700, fontSize: "1.1rem", textAlign: "center", mr: 4, color: "#1B2A4A", fontFamily: '"Noto Serif Thai", serif' }}>
          ใบรับรองดิจิทัล
        </Typography>
      </Box>

      {/* Certificate Frame */}
      <Box
        sx={{
          width: "calc(100% - 40px)",
          bgcolor: "#FFFFFF",
          borderRadius: "12px",
          p: 0.5,
          mt: 2,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Border Frame */}
        <Box
          sx={{
            border: "2px solid #1B2A4A",
            borderRadius: "8px",
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Decorative Corner Elements (Simulated with Box) */}
          <Box sx={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderTop: "2px solid #D8BC82", borderLeft: "2px solid #D8BC82" }} />
          <Box sx={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderTop: "2px solid #D8BC82", borderRight: "2px solid #D8BC82" }} />
          <Box sx={{ position: "absolute", bottom: 8, left: 8, width: 20, height: 20, borderBottom: "2px solid #D8BC82", borderLeft: "2px solid #D8BC82" }} />
          <Box sx={{ position: "absolute", bottom: 8, right: 8, width: 20, height: 20, borderBottom: "2px solid #D8BC82", borderRight: "2px solid #D8BC82" }} />

          {/* LAYA Label */}
          <Typography sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#1B2A4A", letterSpacing: 3, opacity: 0.6 }}>
            LAYA - CERTIFIED AUTHENTIC
          </Typography>

          {/* Product Info */}
          <Typography sx={{ mt: 2, fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.3rem", color: "#1B2A4A", textAlign: "center" }}>
            {product.name}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#D8BC82", fontWeight: 700, mt: 0.5 }}>
            {product.community} • {product.province}
          </Typography>

          <Divider sx={{ width: "100%", my: 3, borderColor: "rgba(0,0,0,0.08)" }} />

          {/* QR Code Placeholder */}
          <Box
            sx={{
              width: 180,
              height: 180,
              bgcolor: "#FFFFFF",
              border: "1px solid #E5DFD6",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
              p: 2,
              position: "relative",
            }}
          >
            {/* Real placeholder for QR (Simulated with simple Box structure) */}
            <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
               <Image 
                 src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LAYA-VERIFY-0284" 
                 alt="QR Code" 
                 fill 
                 style={{ objectFit: "contain" }}
               />
               {/* Laya Logo in the middle of QR */}
               <Box sx={{ 
                 position: "absolute", 
                 top: "50%", 
                 left: "50%", 
                 transform: "translate(-50%, -50%)",
                 width: 32,
                 height: 32,
                 bgcolor: "white",
                 borderRadius: "4px",
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 p: 0.5,
                 boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
               }}>
                 <Box sx={{ width: "100%", height: "100%", bgcolor: "#1B2A4A", borderRadius: "2px" }} />
               </Box>
            </Box>
          </Box>

          {/* Details Table */}
          <Box sx={{ width: "100%" }}>
            {[
              { label: "หมายเลขใบรับรอง", value: product.certificateId || "LAYA-F-0284" },
              { label: "ช่างทอ", value: product.weaverName },
              { label: "เทคนิค", value: product.passport?.weavingTechnique || "ยกลายดอก • ไหมธรรมชาติ" },
              { label: "วันที่ทอสำเร็จ", value: product.passport?.verifiedDate || "15 ม.ค. 2568" },
              { label: "การรับรอง", value: "GI • Fair Trade \u2713", isSuccess: true }
            ].map((detail, i) => (
              <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderTop: i === 0 ? "none" : "1px solid rgba(0,0,0,0.04)" }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(27,42,74,0.5)" }}>{detail.label}</Typography>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: detail.isSuccess ? "#4B7355" : "#1B2A4A" }}>{detail.value}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "#FDF8F0", borderRadius: "12px", width: "100%", border: "1px solid #EBE3D5" }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#D8BC82", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
            </Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#1B2A4A" }}>
              ยืนยันโดย LAYA Platform - ของแท้ 100%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 1.5, width: "calc(100% - 40px)" }}>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<DownloadRoundedIcon />}
            sx={{
              py: 1.5,
              borderRadius: "14px",
              bgcolor: "#1B2A4A",
              color: "#FFFFFF",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#0F1A30" }
            }}
          >
            บันทึก / พิมพ์
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ShareRoundedIcon />}
            sx={{
              py: 1.5,
              borderRadius: "14px",
              borderColor: "#1B2A4A",
              color: "#1B2A4A",
              fontWeight: 700,
              textTransform: "none",
              borderWidth: 2,
              "&:hover": { borderWidth: 2, borderColor: "#1B2A4A", bgcolor: "rgba(27,42,74,0.05)" }
            }}
          >
            แชร์ใบรับรอง
          </Button>
        </Box>

        <Button
          fullWidth
          variant="text"
          onClick={onBack}
          sx={{
            py: 1,
            color: "rgba(27,42,74,0.6)",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { bgcolor: "transparent", color: "#1B2A4A" }
          }}
        >
          ‹ ย้อนกลับไปดูเรื่องราวของผืนผ้า
        </Button>
      </Box>
    </Box>
  );
}
