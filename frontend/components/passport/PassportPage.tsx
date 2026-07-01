"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import TextureRoundedIcon from "@mui/icons-material/TextureRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EnergySavingsLeafRoundedIcon from "@mui/icons-material/EnergySavingsLeafRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/mock-data";

// Icon mapping for production steps
function StepIcon({ icon, isActive }: { icon: string; isActive: boolean }) {
  const color = isActive ? "#FFFFFF" : "#C5A55A";
  const size = 18;
  const iconMap: Record<string, React.ReactNode> = {
    fiber: <SpaRoundedIcon sx={{ fontSize: size, color }} />,
    dye: <ColorLensRoundedIcon sx={{ fontSize: size, color }} />,
    weave: <TextureRoundedIcon sx={{ fontSize: size, color }} />,
    inspect: <CheckCircleRoundedIcon sx={{ fontSize: size, color }} />,
    finish: <VerifiedRoundedIcon sx={{ fontSize: size, color }} />,
    ship: <LocalShippingRoundedIcon sx={{ fontSize: size, color }} />,
  };
  return <>{iconMap[icon] || <SpaRoundedIcon sx={{ fontSize: size, color }} />}</>;
}

interface PassportPageProps {
  product: Product;
}

export default function PassportPage({ product }: PassportPageProps) {
  const router = useRouter();
  const [showFullStory, setShowFullStory] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const passport = product.passport;

  if (!passport) {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            color: "#6B7280",
          }}
        >
          {"ยังไม่มีข้อมูลพาสปอร์ตสำหรับผลิตภัณฑ์นี้"}
        </Typography>
      </Box>
    );
  }

  const carbonColors = {
    low: { bg: "#E8F5E9", color: "#2E7D32", label: "ต่ำ" },
    medium: { bg: "#FFF8E1", color: "#F9A825", label: "ปานกลาง" },
    high: { bg: "#FFEBEE", color: "#C62828", label: "สูง" },
  };
  const carbon = carbonColors[passport.carbonFootprint];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#FAF6F0",
        position: "relative",
        boxShadow: { xs: "none", sm: "0 0 40px rgba(0,0,0,0.08)" },
        pb: 4,
      }}
    >
      {/* Header */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1.5,
          bgcolor: "rgba(250,246,240,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E5DFD6",
        }}
      >
        <IconButton
          onClick={() => router.back()}
          sx={{
            bgcolor: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            "&:hover": { bgcolor: "#FFFFFF" },
          }}
        >
          <ArrowBackIosNewRoundedIcon
            sx={{ fontSize: 16, color: "#1B2A4A" }}
          />
        </IconButton>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1B2A4A",
              letterSpacing: 1.5,
            }}
          >
            DIGITAL PASSPORT
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontSize: "0.55rem",
              color: "#C5A55A",
              letterSpacing: 1,
            }}
          >
            {"พาสปอร์ตผ้าดิจิทัล"}
          </Typography>
        </Box>

        <Box sx={{ width: 40 }} />
      </Box>

      {/* Certificate Card with Image */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        sx={{ px: 2.5, pt: 2.5, mb: 2 }}
      >
        <Box
          sx={{
            background: "linear-gradient(145deg, #1B2A4A 0%, #2A3F6B 60%, #1B2A4A 100%)",
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(27,42,74,0.25)",
          }}
        >
          {/* Decorative pattern overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.04,
              background:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(197,165,90,0.5) 10px, rgba(197,165,90,0.5) 11px)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          {/* Gold accent border top */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, transparent, #C5A55A, #D4BA7A, #C5A55A, transparent)",
              zIndex: 2,
            }}
          />

          {/* Product Image */}
          <Box sx={{ position: "relative", height: 180 }}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            {/* Dark gradient overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(180deg, rgba(27,42,74,0.3) 0%, rgba(27,42,74,0.1) 40%, rgba(27,42,74,0.7) 80%, rgba(27,42,74,1) 100%)",
              }}
            />

            {/* Top row: LAYA logo + Verified badge */}
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 20,
                right: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#C5A55A",
                  letterSpacing: 3,
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                LAYA
              </Typography>
              <Box
                component={motion.div}
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(197,165,90,0.3)",
                    "0 0 12px rgba(197,165,90,0.6)",
                    "0 0 0px rgba(197,165,90,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "rgba(27,42,74,0.6)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(197,165,90,0.4)",
                  borderRadius: "8px",
                  px: 1,
                  py: 0.4,
                }}
              >
                <VerifiedRoundedIcon
                  sx={{ fontSize: 13, color: "#C5A55A" }}
                />
                <Typography
                  sx={{
                    fontFamily: '"Kanit", sans-serif',
                    fontSize: "0.58rem",
                    color: "#C5A55A",
                    fontWeight: 600,
                  }}
                >
                  {"ยืนยันแล้ว"}
                </Typography>
              </Box>
            </Box>

            {/* GI badge on image */}
            {product.hasGI && (
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: "rgba(197,165,90,0.85)",
                  backdropFilter: "blur(4px)",
                  color: "#FFFFFF",
                  px: 1,
                  py: 0.2,
                  borderRadius: "6px",
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  fontFamily: '"Kanit", sans-serif',
                  letterSpacing: 1,
                  zIndex: 2,
                }}
              >
                GI CERTIFIED
              </Box>
            )}
          </Box>

          {/* Card Content */}
          <Box sx={{ p: 2.5, pt: 0, position: "relative", zIndex: 1, mt: -1 }}>
            {/* Product Name */}
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontWeight: 700,
                fontSize: "1.15rem",
                color: "#FFFFFF",
                lineHeight: 1.4,
                mb: 0.3,
              }}
            >
              {product.name}
            </Typography>

            {/* Certificate ID */}
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "rgba(197,165,90,0.7)",
                mb: 1.8,
                letterSpacing: 0.5,
              }}
            >
              {product.certificateId}
            </Typography>

            {/* Weaver Info — inside the card */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                bgcolor: "rgba(255,255,255,0.07)",
                borderRadius: "12px",
                p: 1.3,
                mb: 1.8,
                border: "1px solid rgba(197,165,90,0.12)",
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #C5A55A 0%, #D4BA7A 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PersonRoundedIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: '"Kanit", sans-serif',
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    color: "#FFFFFF",
                  }}
                >
                  {product.weaverName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.15 }}>
                  <LocationOnRoundedIcon
                    sx={{ fontSize: 11, color: "#C5A55A" }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"Kanit", sans-serif',
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    {product.community}, {"จ."}{product.province}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Bottom row: Hash + Date */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid rgba(197,165,90,0.15)",
                pt: 1.2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LinkRoundedIcon
                  sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}
                />
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.58rem",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {passport.blockchainHash}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontSize: "0.58rem",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                {passport.verifiedDate}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Materials & Technique */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        sx={{ px: 2.5, mb: 2 }}
      >
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1B2A4A",
            mb: 1.2,
          }}
        >
          {"วัสดุและเทคนิค"}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
          {/* Materials */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              p: 1.8,
              border: "1px solid #E5DFD6",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <SpaRoundedIcon sx={{ fontSize: 16, color: "#C5A55A" }} />
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "#1B2A4A",
                }}
              >
                {"วัสดุ"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
              {passport.materials.map((m) => (
                <Chip
                  key={m}
                  label={m}
                  size="small"
                  sx={{
                    bgcolor: "rgba(197,165,90,0.1)",
                    color: "#1B2A4A",
                    fontFamily: '"Kanit", sans-serif',
                    fontSize: "0.68rem",
                    fontWeight: 500,
                    border: "1px solid rgba(197,165,90,0.2)",
                    borderRadius: "8px",
                    height: 26,
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Dye */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              p: 1.8,
              border: "1px solid #E5DFD6",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <ColorLensRoundedIcon sx={{ fontSize: 16, color: "#C5A55A" }} />
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "#1B2A4A",
                }}
              >
                {"การย้อมสี"}
              </Typography>
              <Chip
                label={passport.dyeType}
                size="small"
                sx={{
                  bgcolor: passport.dyeType.includes("ธรรมชาติ")
                    ? "rgba(46,125,50,0.1)"
                    : "rgba(25,118,210,0.1)",
                  color: passport.dyeType.includes("ธรรมชาติ")
                    ? "#2E7D32"
                    : "#1976D2",
                  fontFamily: '"Kanit", sans-serif',
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  height: 22,
                  borderRadius: "6px",
                }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: "0.75rem",
                color: "#6B7280",
                lineHeight: 1.6,
                mt: 0.5,
              }}
            >
              {passport.dyeDetails}
            </Typography>
          </Box>

          {/* Weaving Technique */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              p: 1.8,
              border: "1px solid #E5DFD6",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <TextureRoundedIcon sx={{ fontSize: 16, color: "#C5A55A" }} />
              <Typography
                sx={{
                  fontFamily: '"Kanit", sans-serif',
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "#1B2A4A",
                }}
              >
                {"เทคนิคการทอ"}
              </Typography>
              <Chip
                label={passport.weavingTechnique}
                size="small"
                sx={{
                  bgcolor: "rgba(197,165,90,0.12)",
                  color: "#A68A3A",
                  fontFamily: '"Kanit", sans-serif',
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  height: 22,
                  borderRadius: "6px",
                }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: "0.75rem",
                color: "#6B7280",
                lineHeight: 1.6,
                mt: 0.5,
              }}
            >
              {passport.weavingDetails}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Production Timeline */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        sx={{ px: 2.5, mb: 2 }}
      >
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1B2A4A",
            mb: 1.2,
          }}
        >
          {"ขั้นตอนการผลิต"}
        </Typography>

        <Box sx={{ position: "relative", pl: 3 }}>
          {/* Vertical line */}
          <Box
            sx={{
              position: "absolute",
              left: 15,
              top: 8,
              bottom: 8,
              width: 2,
              background: "linear-gradient(180deg, #C5A55A, #E5DFD6)",
              borderRadius: 1,
            }}
          />

          {passport.productionSteps.map((step, index) => {
            const isExpanded = expandedStep === index;
            return (
              <Box
                key={step.step}
                component={motion.div}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.08 }}
                onClick={() => setExpandedStep(isExpanded ? null : index)}
                sx={{
                  position: "relative",
                  mb: index < passport.productionSteps.length - 1 ? 1.5 : 0,
                  cursor: "pointer",
                }}
              >
                {/* Step dot */}
                <Box
                  sx={{
                    position: "absolute",
                    left: -18,
                    top: 8,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: isExpanded ? "#C5A55A" : "#FFFFFF",
                    border: `2px solid ${isExpanded ? "#C5A55A" : "#E5DFD6"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    zIndex: 1,
                    boxShadow: isExpanded
                      ? "0 2px 8px rgba(197,165,90,0.3)"
                      : "none",
                  }}
                >
                  <StepIcon icon={step.icon} isActive={isExpanded} />
                </Box>

                {/* Step content */}
                <Box
                  sx={{
                    bgcolor: isExpanded ? "#FFFFFF" : "transparent",
                    borderRadius: "12px",
                    p: isExpanded ? 1.5 : "8px 8px 8px 20px",
                    pl: isExpanded ? 3 : 2.5,
                    border: isExpanded ? "1px solid #E5DFD6" : "none",
                    boxShadow: isExpanded
                      ? "0 2px 8px rgba(27,42,74,0.05)"
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Kanit", sans-serif',
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        color: "#1B2A4A",
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Kanit", sans-serif',
                        fontSize: "0.6rem",
                        color: "#9CA3AF",
                      }}
                    >
                      {step.date}
                    </Typography>
                  </Box>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Kanit", sans-serif',
                          fontSize: "0.72rem",
                          color: "#6B7280",
                          lineHeight: 1.6,
                          mt: 0.5,
                        }}
                      >
                        {step.description}
                      </Typography>
                    </motion.div>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Certifications & Carbon Footprint */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        sx={{ px: 2.5, mb: 2 }}
      >
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1B2A4A",
            mb: 1.2,
          }}
        >
          {"ใบรับรองและมาตรฐาน"}
        </Typography>

        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: "16px",
            p: 2,
            border: "1px solid #E5DFD6",
          }}
        >
          {/* Certifications */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mb: 1.5 }}>
            {passport.certifications.map((cert) => (
              <Chip
                key={cert}
                icon={
                  <VerifiedRoundedIcon
                    sx={{ fontSize: 13, color: "#C5A55A !important" }}
                  />
                }
                label={cert}
                size="small"
                sx={{
                  bgcolor: "rgba(197,165,90,0.08)",
                  color: "#1B2A4A",
                  fontFamily: '"Kanit", sans-serif',
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  border: "1px solid rgba(197,165,90,0.2)",
                  borderRadius: "8px",
                  height: 28,
                }}
              />
            ))}
          </Box>

          <Divider sx={{ borderColor: "#E5DFD6", mb: 1.5 }} />

          {/* Carbon Footprint */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EnergySavingsLeafRoundedIcon sx={{ fontSize: 18, color: carbon.color }} />
            <Typography
              sx={{
                fontFamily: '"Kanit", sans-serif',
                fontSize: "0.78rem",
                color: "#1B2A4A",
                fontWeight: 500,
              }}
            >
              {"คาร์บอนฟุตพริ้นท์:"}
            </Typography>
            <Chip
              label={carbon.label}
              size="small"
              sx={{
                bgcolor: carbon.bg,
                color: carbon.color,
                fontFamily: '"Kanit", sans-serif',
                fontSize: "0.62rem",
                fontWeight: 700,
                height: 22,
                borderRadius: "6px",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Cultural Story */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        sx={{ px: 2.5, mb: 3 }}
      >
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1B2A4A",
            mb: 1,
          }}
        >
          {"เรื่องราวของผืนผ้า"}
        </Typography>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: "16px",
            p: 2,
            border: "1px solid #E5DFD6",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontSize: "0.82rem",
              color: "#6B7280",
              lineHeight: 1.8,
              overflow: "hidden",
              maxHeight: showFullStory ? "none" : 60,
              transition: "max-height 0.3s ease",
            }}
          >
            {product.story}
          </Typography>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullStory(!showFullStory);
            }}
            endIcon={
              <ExpandMoreRoundedIcon
                sx={{
                  transform: showFullStory ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              />
            }
            sx={{
              mt: 0.5,
              fontFamily: '"Kanit", sans-serif',
              color: "#C5A55A",
              fontSize: "0.75rem",
              fontWeight: 600,
              p: 0,
              minWidth: "auto",
              "&:hover": { bgcolor: "transparent" },
            }}
          >
            {showFullStory ? "ย่อ" : "อ่านเพิ่มเติม"}
          </Button>
        </Box>
      </Box>

      {/* Bottom CTA - Back to Product */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        sx={{ px: 2.5 }}
      >
        <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
          <Button
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #C5A55A 0%, #D4BA7A 100%)",
              color: "#1B2A4A",
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 700,
              fontSize: "0.9rem",
              py: 1.6,
              borderRadius: "14px",
              boxShadow: "0 4px 16px rgba(197,165,90,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #B89545 0%, #C5A55A 100%)",
              },
            }}
          >
            {"ดูรายละเอียดสินค้า"}
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
