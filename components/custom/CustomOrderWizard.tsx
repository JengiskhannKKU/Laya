"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { matchResults } from "@/lib/mock-data";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

const steps = [
  "ประเภทสินค้า",
  "ประเภทผ้า",
  "โทนสี",
  "งบประมาณ",
  "รายละเอียด",
  "ผลการจับคู่",
];

const productTypes = [
  "ผ้าถุง",
  "เสื้อผ้า",
  "ผ้าคลุมไหล่ / สไบ",
  "ผ้าตัดชุด",
  "ของตกแต่งบ้าน",
  "อื่นๆ",
];

const fabricTypes = ["ผ้าไหม", "ผ้าฝ้าย", "ผ้าไหมผสมฝ้าย", "ไม่ระบุ"];

const colorOptions = [
  { name: "น้ำเงินคราม", value: "#1B2A4A" },
  { name: "แดงชาด", value: "#8B2C2C" },
  { name: "เขียวมรกต", value: "#2D5A3D" },
  { name: "ทอง", value: "#C5A55A" },
  { name: "ม่วง", value: "#5B2C6F" },
  { name: "ดำ", value: "#1A1A1A" },
  { name: "ครีม", value: "#F5E6CC" },
  { name: "ชมพู", value: "#C1577A" },
];

export default function CustomOrderWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedFabricType, setSelectedFabricType] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [budget, setBudget] = useState<number[]>([1000, 5000]);
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  const progress = ((activeStep + 1) / steps.length) * 100;

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedProductType !== "";
      case 1:
        return selectedFabricType !== "";
      case 2:
        return selectedColors.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1B2A4A",
                mb: 2,
              }}
            >
              {"เลือกประเภทสินค้าที่ต้องการ"}
            </Typography>
            <RadioGroup
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
            >
              {productTypes.map((type) => (
                <FormControlLabel
                  key={type}
                  value={type}
                  control={
                    <Radio
                      sx={{
                        color: "#E5DFD6",
                        "&.Mui-checked": { color: "#C5A55A" },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontFamily: '"Noto Serif Thai", serif',
                        fontSize: "0.9rem",
                        color: "#1B2A4A",
                      }}
                    >
                      {type}
                    </Typography>
                  }
                  sx={{
                    bgcolor:
                      selectedProductType === type ? "#FDF8EF" : "#FFFFFF",
                    border: `1px solid ${selectedProductType === type ? "#C5A55A" : "#E5DFD6"}`,
                    borderRadius: 3,
                    mx: 0,
                    mb: 1,
                    px: 1,
                    py: 0.5,
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1B2A4A",
                mb: 2,
              }}
            >
              {"เลือกประเภทผ้า"}
            </Typography>
            <RadioGroup
              value={selectedFabricType}
              onChange={(e) => setSelectedFabricType(e.target.value)}
            >
              {fabricTypes.map((type) => (
                <FormControlLabel
                  key={type}
                  value={type}
                  control={
                    <Radio
                      sx={{
                        color: "#E5DFD6",
                        "&.Mui-checked": { color: "#C5A55A" },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontFamily: '"Noto Serif Thai", serif',
                        fontSize: "0.9rem",
                        color: "#1B2A4A",
                      }}
                    >
                      {type}
                    </Typography>
                  }
                  sx={{
                    bgcolor:
                      selectedFabricType === type ? "#FDF8EF" : "#FFFFFF",
                    border: `1px solid ${selectedFabricType === type ? "#C5A55A" : "#E5DFD6"}`,
                    borderRadius: 3,
                    mx: 0,
                    mb: 1,
                    px: 1,
                    py: 0.5,
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1B2A4A",
                mb: 1,
              }}
            >
              {"เลือกโทนสีที่ต้องการ"}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontSize: "0.8rem",
                color: "#6B7280",
                mb: 2,
              }}
            >
              {"เลือกได้มากกว่า 1 สี"}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {colorOptions.map((color) => (
                <Box
                  key={color.value}
                  component={motion.div}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleColorToggle(color.value)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    width: 72,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: color.value,
                      border: selectedColors.includes(color.value)
                        ? "3px solid #C5A55A"
                        : "2px solid #E5DFD6",
                      boxShadow: selectedColors.includes(color.value)
                        ? "0 0 0 3px rgba(197,165,90,0.3)"
                        : "none",
                      transition: "all 0.2s",
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontSize: "0.65rem",
                      color: selectedColors.includes(color.value)
                        ? "#1B2A4A"
                        : "#6B7280",
                      fontWeight: selectedColors.includes(color.value)
                        ? 600
                        : 400,
                      textAlign: "center",
                    }}
                  >
                    {color.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1B2A4A",
                mb: 3,
              }}
            >
              {"กำหนดงบประมาณ"}
            </Typography>

            <Box sx={{ px: 1 }}>
              <Slider
                value={budget}
                onChange={(_, v) => setBudget(v as number[])}
                min={500}
                max={20000}
                step={500}
                sx={{
                  color: "#C5A55A",
                  "& .MuiSlider-thumb": {
                    bgcolor: "#C5A55A",
                    border: "2px solid #FFFFFF",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  },
                  "& .MuiSlider-track": {
                    bgcolor: "#C5A55A",
                  },
                  "& .MuiSlider-rail": {
                    bgcolor: "#E5DFD6",
                  },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontWeight: 600,
                    color: "#1B2A4A",
                  }}
                >
                  {budget[0].toLocaleString()} {"บาท"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontWeight: 600,
                    color: "#1B2A4A",
                  }}
                >
                  {budget[1].toLocaleString()} {"บาท"}
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1B2A4A",
                mt: 4,
                mb: 2,
              }}
            >
              {"จำนวนที่ต้องการ (เมตร)"}
            </Typography>
            <TextField
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              size="small"
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontFamily: '"Noto Serif Thai", serif',
                  bgcolor: "#FFFFFF",
                  "& fieldset": { borderColor: "#E5DFD6" },
                  "&:hover fieldset": { borderColor: "#C5A55A" },
                  "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
                },
              }}
            />
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1B2A4A",
                mb: 2,
              }}
            >
              {"รายละเอียดเพิ่มเติม"}
            </Typography>

            <TextField
              multiline
              rows={4}
              placeholder="อธิบายแนวคิดหรือธีมที่ต้องการ เช่น ลายโบราณ, สไตล์ร่วมสมัย..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{
                width: "100%",
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontFamily: '"Noto Serif Thai", serif',
                  bgcolor: "#FFFFFF",
                  fontSize: "0.85rem",
                  "& fieldset": { borderColor: "#E5DFD6" },
                  "&:hover fieldset": { borderColor: "#C5A55A" },
                  "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
                },
              }}
            />

            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#1B2A4A",
                mb: 1.5,
              }}
            >
              {"แนบไฟล์ Mood Board (ไม่บังคับ)"}
            </Typography>

            <Box
              sx={{
                border: "2px dashed #E5DFD6",
                borderRadius: 3,
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                bgcolor: "#FFFFFF",
                cursor: "pointer",
                "&:hover": { borderColor: "#C5A55A" },
              }}
            >
              <CloudUploadRoundedIcon
                sx={{ fontSize: 36, color: "#C5A55A" }}
              />
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontSize: "0.8rem",
                  color: "#6B7280",
                }}
              >
                {"คลิกหรือลากไฟล์มาวาง"}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontSize: "0.65rem",
                  color: "#9CA3AF",
                }}
              >
                PNG, JPG, PDF ({"สูงสุด"} 10MB)
              </Typography>
            </Box>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1B2A4A",
                mb: 0.5,
              }}
            >
              {"ผลการจับคู่ AI"}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontSize: "0.8rem",
                color: "#6B7280",
                mb: 2,
              }}
            >
              {"ระบบ AI จับคู่ชุมชนที่เหมาะสมที่สุดสำหรับคุณ"}
            </Typography>

            {matchResults.map((result, index) => (
              <Box
                key={result.id}
                component={motion.div}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                sx={{
                  display: "flex",
                  bgcolor: "#FFFFFF",
                  borderRadius: 3,
                  border: index === 0 ? "2px solid #C5A55A" : "1px solid #E5DFD6",
                  overflow: "hidden",
                  mb: 1.5,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 120,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={result.product.images[0]}
                    alt={result.product.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Box sx={{ flex: 1, p: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Noto Serif Thai", serif',
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#1B2A4A",
                        flex: 1,
                        lineHeight: 1.3,
                      }}
                    >
                      {result.product.community}
                    </Typography>
                    <Chip
                      label={`Match ${result.matchScore}%`}
                      size="small"
                      sx={{
                        bgcolor:
                          result.matchScore >= 90
                            ? "rgba(197,165,90,0.2)"
                            : "rgba(27,42,74,0.08)",
                        color:
                          result.matchScore >= 90
                            ? "#A68A3A"
                            : "#1B2A4A",
                        fontWeight: 700,
                        fontFamily: '"Noto Serif Thai", serif',
                        fontSize: "0.65rem",
                        height: 24,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    <StarRoundedIcon
                      sx={{ color: "#C5A55A", fontSize: 14 }}
                    />
                    <Typography
                      sx={{
                        fontFamily: '"Noto Serif Thai", serif',
                        fontSize: "0.7rem",
                        color: "#6B7280",
                      }}
                    >
                      {result.product.rating} ({result.product.reviewCount})
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontSize: "0.75rem",
                      color: "#6B7280",
                      mt: 0.5,
                    }}
                  >
                    {"~"}{result.estimatedPrice.toLocaleString()} {"บาท/เมตร"}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontSize: "0.7rem",
                      color: "#9CA3AF",
                    }}
                  >
                    {"ผลิต"} {result.estimatedTime}
                  </Typography>
                </Box>
              </Box>
            ))}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 430,
        mx: "auto",
        minHeight: "100vh",
        bgcolor: "#FAF6F0",
        boxShadow: { xs: "none", sm: "0 0 40px rgba(0,0,0,0.08)" },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          pt: 3,
          pb: 1,
        }}
      >
        <Link href="/">
          <IconButton size="small">
            <ArrowBackIosNewRoundedIcon
              sx={{ fontSize: 16, color: "#1B2A4A" }}
            />
          </IconButton>
        </Link>
        <Typography
          sx={{
            fontFamily: '"Noto Serif Thai", serif',
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#1B2A4A",
            flex: 1,
            textAlign: "center",
          }}
        >
          {"สั่งตัดพิเศษ"}
        </Typography>
        <Box sx={{ width: 32 }} />
      </Box>

      {/* Progress */}
      <Box sx={{ px: 2, py: 1 }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
        >
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.7rem",
              color: "#6B7280",
            }}
          >
            {"ขั้นตอนที่"} {activeStep + 1} {"จาก"} {steps.length}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.7rem",
              color: "#C5A55A",
              fontWeight: 600,
            }}
          >
            {steps[activeStep]}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: "#E5DFD6",
            "& .MuiLinearProgress-bar": {
              bgcolor: "#C5A55A",
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Step Content */}
      <Box sx={{ px: 2, py: 2, minHeight: "60vh" }}>
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          px: 2,
          pb: 4,
          display: "flex",
          gap: 1.5,
        }}
      >
        {activeStep > 0 && (
          <Button
            variant="outlined"
            onClick={() => setActiveStep((prev) => prev - 1)}
            sx={{
              flex: 1,
              borderColor: "#E5DFD6",
              color: "#1B2A4A",
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 3,
              "&:hover": { borderColor: "#1B2A4A" },
            }}
          >
            {"ย้อนกลับ"}
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
            disabled={!canProceed()}
            sx={{
              flex: 1,
              bgcolor: "#1B2A4A",
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 3,
              "&:hover": { bgcolor: "#0F1A30" },
              "&.Mui-disabled": {
                bgcolor: "#E5DFD6",
                color: "#9CA3AF",
              },
            }}
          >
            {"ถัดไป"}
          </Button>
        ) : (
          <Button
            variant="contained"
            sx={{
              flex: 1,
              background:
                "linear-gradient(135deg, #C5A55A 0%, #D4BA7A 100%)",
              color: "#1B2A4A",
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              py: 1.5,
              borderRadius: 3,
              "&:hover": {
                background:
                  "linear-gradient(135deg, #B89545 0%, #C5A55A 100%)",
              },
            }}
          >
            {"เลือกและดำเนินการต่อ"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
