"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import { motion } from "framer-motion";
import Image from "next/image";
import { type Product, weavers } from "@/lib/mock-data";

interface TraceabilityViewProps {
  product: Product;
  onBack: () => void;
  onViewCertificate: () => void;
}

export default function TraceabilityView({ product, onBack, onViewCertificate }: TraceabilityViewProps) {
  const weaver = weavers.find(w => w.name === product.weaverName) || weavers[0];
  const passport = product.passport;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      sx={{
        bgcolor: "#FAF6F0",
        pb: 10,
        width: "100%",
        position: "relative",
        color: "#1B2A4A",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <IconButton onClick={onBack} sx={{ color: "#1B2A4A" }}>
          <ArrowBackIosNewRoundedIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", fontFamily: '"Kanit", sans-serif', color: "#1B2A4A" }}>
          เรื่องราวของผืนผ้า
        </Typography>
        <IconButton sx={{ color: "#1B2A4A" }}>
          <GridViewRoundedIcon />
        </IconButton>
      </Box>

      <Box sx={{ px: 3, pt: 2, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: "50%", 
          border: "2px solid rgba(216, 188, 130, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          bgcolor: "rgba(255,255,255,0.05)"
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D8BC82" strokeWidth="1.2">
             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </Box>
        
        <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.4rem", mb: 0.5, color: "#1B2A4A" }}>
          {product.name}
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "rgba(27,42,74,0.6)", mb: 2 }}>
          {product.community} • {product.province} • GI รับรอง
        </Typography>

        <Chip 
          label="ยืนยันแล้ว - ของแท้ 100%" 
          sx={{ 
            bgcolor: "#4B7355", 
            color: "#FFFFFF", 
            fontWeight: 700, 
            fontSize: "0.75rem",
            px: 1,
            py: 0.5,
            height: "auto",
            "& .MuiChip-label": { px: 1 }
          }} 
          icon={<CheckCircleRoundedIcon sx={{ fontSize: "1rem !important", color: "#FFFFFF !important" }} />}
        />
      </Box>

      {/* Hero Stats */}
      <Box sx={{ px: 2, mt: 4, display: "flex", gap: 1.5 }}>
        {[
          { label: "200+ ปี", desc: "สืบทอด", icon: "⏳" },
          { label: "ธรรมชาติ", desc: "100%", icon: "🌿" },
          { label: "Fair Trade", desc: "รับรองแล้ว", icon: "🤝" }
        ].map((stat, i) => (
          <Box key={i} sx={{ 
            flex: 1, 
            bgcolor: "#FFFFFF", 
            borderRadius: "20px", 
            p: 2, 
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.05)"
          }}>
            <Typography sx={{ fontSize: "1.2rem", mb: 0.5 }}>{stat.icon}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1B2A4A" }}>{stat.label}</Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(27,42,74,0.5)" }}>{stat.desc}</Typography>
          </Box>
        ))}
      </Box>

      {/* Production Stepper */}
      <Box sx={{ mt: 5, px: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 3, opacity: 0.8, color: "#1B2A4A" }}>
          กระบวนการผลิต
        </Typography>

        <Box sx={{ position: "relative" }}>
          {passport?.productionSteps.map((step, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2.5, mb: index === passport.productionSteps.length - 1 ? 0 : 4, position: "relative" }}>
              {/* Connector line */}
              {index !== passport.productionSteps.length - 1 && (
                <Box sx={{ 
                  position: "absolute", 
                  left: 12, 
                  top: 24, 
                  bottom: -24, 
                  width: 2, 
                  bgcolor: "#D8BC82", // Solid line for story flow
                  opacity: 0.2
                }} />
              )}
              
              {/* Bullet Point - Simplified for Storytelling */}
              <Box sx={{ 
                width: 26, 
                height: 26, 
                borderRadius: "50%", 
                bgcolor: "#D8BC82", // Consistent golden color
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                flexShrink: 0,
                mt: 0.5,
                boxShadow: "0 0 10px rgba(216, 188, 130, 0.3)"
              }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 900, color: "#FFFFFF" }}>{index + 1}</Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A" }}>
                  {step.title}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "rgba(27,42,74,0.7)", mt: 0.3 }}>
                  {step.description}
                </Typography>

                {/* Video Case */}
                {step.videoUrl && (
                  <Box sx={{ 
                    mt: 2, 
                    borderRadius: "16px", 
                    overflow: "hidden", 
                    position: "relative",
                    height: 180, // Taller for real video feel
                    bgcolor: "#000000",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                    {/* Simulated Player / Embed */}
                    <iframe
                      width="100%"
                      height="100%"
                      src={step.videoUrl}
                      title="Thai Silk Weaving"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ opacity: 0.9 }}
                    ></iframe>
                    
                    {/* Live Indicator Overlay */}
                    <Box sx={{ 
                      position: "absolute", 
                      top: 12, 
                      left: 12, 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 1, 
                      bgcolor: "rgba(0,0,0,0.5)",
                      px: 1,
                      py: 0.5,
                      borderRadius: "4px",
                      backdropFilter: "blur(4px)"
                    }}>
                       <Box sx={{ 
                         width: 6, 
                         height: 6, 
                         borderRadius: "50%", 
                         bgcolor: "#FF0000",
                         boxShadow: "0 0 10px #FF0000" 
                       }} />
                       <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: 1 }}>REC. ชุมชนหริภุญชัย</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Weaver Profile */}
      <Box sx={{ mt: 6, px: 2 }}>
        <Box sx={{ 
          bgcolor: "#FFFFFF", 
          borderRadius: "24px", 
          p: 2.5,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.05)"
        }}>
          <Typography component="div" sx={{ fontSize: "0.8rem", color: "#D8BC82", fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
             <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#D8BC82" }} />
             ช่างทอผู้สร้างสรรค์
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar 
              src={weaver.photo} 
              alt={weaver.name} 
              sx={{ width: 64, height: 64, border: "2px solid #D8BC82" }} 
            >
              {weaver.name[0]}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A" }}>{weaver.name}</Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "rgba(27,42,74,0.6)" }}>
                ประสบการณ์ {weaver.experience}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#D8BC82", mt: 0.5, fontWeight: 600 }}>
                ดูผลงานทั้งหมด ›
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom Actions */}
      <Box sx={{ 
        position: "fixed", 
        bottom: 24, 
        left: "50%", 
        transform: "translateX(-50%)", 
        width: "calc(100% - 40px)",
        maxWidth: 390,
        display: "flex",
        gap: 1.5,
        zIndex: 10
      }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShareRoundedIcon />}
          sx={{
            py: 1.5,
            borderRadius: "14px",
            bgcolor: "#FFFFFF",
            color: "#1B2A4A",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#F0F0F0" }
          }}
        >
          แชร์เรื่องราว
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onViewCertificate}
          startIcon={<QrCodeScannerRoundedIcon />}
          sx={{
            py: 1.5,
            borderRadius: "14px",
            bgcolor: "#1B2A4A",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(27,42,74,0.3)",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#0F1A30" }
          }}
        >
          QR Certificate
        </Button>
      </Box>
    </Box>
  );
}
