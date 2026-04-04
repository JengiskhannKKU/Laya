"use client";
import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LoopRoundedIcon from "@mui/icons-material/LoopRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import Image from "next/image";

const orders = [
  {
    id: "ORD-2024-0312",
    productName: "ผ้ายกลายกินรีหริภุญชัย",
    community: "ชุมชนหริภุญชัย",
    image: "/images/fabric1.jpg",
    status: "กำลังทอ",
    statusColor: "#C5A55A",
    statusBg: "rgba(197,165,90,0.12)",
    date: "12 ม.ค. 2567",
    total: "10,500 บาท",
    progress: 60,
    steps: [
      { label: "รอชุมชนยืนยัน", done: true },
      { label: "เริ่มผลิต", done: true },
      { label: "กำลังทอ", done: false, active: true },
      { label: "ตรวจสอบคุณภาพ", done: false },
      { label: "จัดส่งแล้ว", done: false },
    ],
  },
  {
    id: "ORD-2024-0298",
    productName: "ผ้าฝ้ายย้อมคราม",
    community: "กลุ่มทอผ้าครามสกลนคร",
    image: "/images/fabric4.jpg",
    status: "จัดส่งแล้ว",
    statusColor: "#2D8F5C",
    statusBg: "rgba(45,143,92,0.1)",
    date: "5 ม.ค. 2567",
    total: "850 บาท",
    progress: 100,
    steps: [
      { label: "รอชุมชนยืนยัน", done: true },
      { label: "เริ่มผลิต", done: true },
      { label: "กำลังทอ", done: true },
      { label: "ตรวจสอบคุณภาพ", done: true },
      { label: "จัดส่งแล้ว", done: true },
    ],
  },
];

const statusIcons: Record<string, React.ReactElement> = {
  "ส่งคำขอแล้ว": <CloudUploadRoundedIcon sx={{ fontSize: 14 }} />,
  "แอดมินประสานงาน": <SupportAgentRoundedIcon sx={{ fontSize: 14 }} />,
  "รอชุมชนยืนยัน": <HourglassEmptyRoundedIcon sx={{ fontSize: 14 }} />,
  "เริ่มผลิต": <PlayArrowRoundedIcon sx={{ fontSize: 14 }} />,
  "กำลังทอ": <LoopRoundedIcon sx={{ fontSize: 14 }} />,
  "ตรวจสอบคุณภาพ": <AssignmentTurnedInRoundedIcon sx={{ fontSize: 14 }} />,
  "จัดส่งแล้ว": <LocalShippingRoundedIcon sx={{ fontSize: 14 }} />,
  "เสร็จแล้ว": <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
};

export default function OrdersPage() {
  return (
    <MobileLayout>
      <Box sx={{ pt: 3, pb: 2 }}>
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ px: 2.5, mb: 2.5 }}
        >
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.3rem",
              color: "#1B2A4A",
            }}
          >
            {"คำสั่งซื้อของฉัน"}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.75rem",
              color: "#9CA3AF",
              mt: 0.3,
            }}
          >
            {"ติดตามสถานะการผลิตและจัดส่ง"}
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          sx={{
            display: "flex",
            gap: 1,
            px: 2.5,
            mb: 2.5,
          }}
        >
          {[
            { label: "ทั้งหมด", count: 2, color: "#1B2A4A" },
            { label: "กำลังผลิต", count: 1, color: "#C5A55A" },
            { label: "เสร็จสิ้น", count: 1, color: "#2D8F5C" },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                flex: 1,
                bgcolor: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #E5DFD6",
                p: 1.5,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: stat.color,
                  lineHeight: 1,
                }}
              >
                {stat.count}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontSize: "0.62rem",
                  color: "#9CA3AF",
                  mt: 0.3,
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Order Cards */}
        <Box sx={{ px: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {orders.map((order, index) => (
            <Box
              key={order.id}
              component={motion.div}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              whileTap={{ scale: 0.99 }}
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "18px",
                border: "1px solid #E5DFD6",
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(27,42,74,0.05)",
              }}
            >
              {/* Order Header with Image */}
              <Box sx={{ display: "flex", gap: 1.5, p: 1.5, pb: 1 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: 64,
                    height: 64,
                    borderRadius: "12px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={order.image}
                    alt={order.productName}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      color: "#1B2A4A",
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {order.productName}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Noto Serif Thai", serif',
                      fontSize: "0.68rem",
                      color: "#9CA3AF",
                      mt: 0.2,
                    }}
                  >
                    {order.community}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.5 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Noto Serif Thai", serif',
                        fontSize: "0.6rem",
                        color: "#9CA3AF",
                      }}
                    >
                      {order.id}
                    </Typography>
                    <Chip
                      icon={statusIcons[order.status]}
                      label={order.status}
                      size="small"
                      sx={{
                        bgcolor: order.statusBg,
                        color: order.statusColor,
                        fontWeight: 600,
                        fontFamily: '"Noto Serif Thai", serif',
                        fontSize: "0.6rem",
                        borderRadius: "8px",
                        height: 22,
                        "& .MuiChip-icon": { color: order.statusColor, fontSize: 13 },
                        "& .MuiChip-label": { px: 0.6 },
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ px: 1.5, pt: 0.5, pb: 1 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: 4,
                    bgcolor: "#F0EBE3",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component={motion.div}
                    initial={{ width: 0 }}
                    animate={{ width: `${order.progress}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                    sx={{
                      height: "100%",
                      background:
                        order.progress === 100
                          ? "linear-gradient(90deg, #2D8F5C 0%, #4CAF80 100%)"
                          : "linear-gradient(90deg, #C5A55A 0%, #D4BA7A 100%)",
                      borderRadius: 2,
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#F0EBE3" }} />

              {/* Timeline */}
              <Box sx={{ px: 1.5, py: 1.2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {order.steps.map((step, i) => (
                    <Box
                      key={step.label}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                        position: "relative",
                      }}
                    >
                      {/* Connector line */}
                      {i > 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 5,
                            right: "50%",
                            width: "100%",
                            height: 2,
                            bgcolor: step.done || step.active
                              ? "#C5A55A"
                              : "#E5DFD6",
                            zIndex: 0,
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: step.done
                            ? "#C5A55A"
                            : step.active
                              ? "#1B2A4A"
                              : "#E5DFD6",
                          border: step.active
                            ? "2px solid #C5A55A"
                            : "none",
                          zIndex: 1,
                          position: "relative",
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: '"Noto Serif Thai", serif',
                          fontSize: "0.48rem",
                          color: step.done || step.active
                            ? "#1B2A4A"
                            : "#9CA3AF",
                          fontWeight: step.active ? 700 : 400,
                          mt: 0.5,
                          textAlign: "center",
                          lineHeight: 1.2,
                          maxWidth: 48,
                        }}
                      >
                        {step.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#F0EBE3" }} />

              {/* Footer */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 1.5,
                  py: 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontSize: "0.65rem",
                    color: "#9CA3AF",
                  }}
                >
                  {"สั่งเมื่อ"} {order.date}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: "#1B2A4A",
                  }}
                >
                  {order.total}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </MobileLayout>
  );
}
