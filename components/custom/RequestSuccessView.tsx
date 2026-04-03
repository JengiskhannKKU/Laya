"use client";

import { Box, Typography, Avatar, Button, Stepper, Step, StepLabel, StepContent, StepConnector, stepConnectorClasses, styled } from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { type Weaver, type CustomPatternData } from "@/lib/mock-data";

interface RequestSuccessViewProps {
  patternData: CustomPatternData;
  selectedWeaver: Weaver;
  requestNote: string;
}

const SuccessConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#4B7355",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#4B7355",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#E5DFD6",
    borderLeftWidth: 2,
    marginLeft: 1,
  },
}));

const SuccessStepIcon = styled("div")<{ active?: boolean; completed?: boolean }>(({ theme, active, completed }) => ({
  color: completed ? "#FFFFFF" : "#E5DFD6",
  display: "flex",
  height: 24,
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  borderRadius: "50%",
  backgroundColor: completed ? "#4B7355" : "#FFFFFF",
  border: `2px solid ${completed ? "#4B7355" : "#E5DFD6"}`,
  zIndex: 1,
  boxShadow: active ? "0 0 10px rgba(75, 115, 85, 0.4)" : "none",
  "& .dot": {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: active ? "#C5A55A" : "currentColor",
  }
}));

export default function RequestSuccessView({ patternData, selectedWeaver, requestNote }: RequestSuccessViewProps) {
  const steps = [
    {
      label: "ส่งคำขอแล้ว",
      description: "ระบบได้รับคำขอและรายละเอียดของคุณแล้ว",
      date: "วันนี้ 14:32 น.",
      status: "สำเร็จ",
      completed: true,
      active: false,
    },
    {
      label: "แอดมินติดต่อช่าง",
      description: "แอดมินกำลังยืนยันกับแม่สมจิตรว่าสามารถรับงานได้",
      status: "กำลังดำเนินการ",
      completed: false,
      active: true,
    },
    {
      label: "ช่างยืนยันรับงาน",
      description: "ช่างตอบรับและยืนยันรายละเอียดลาย",
      status: "รอดำเนินการ",
      completed: false,
      active: false,
    },
    {
      label: "แจ้งยอดและเงื่อนไข",
      description: "แอดมินส่งใบเสนอราคาและ Timeline ให้คุณยืนยัน",
      status: "รอดำเนินการ",
      completed: false,
      active: false,
    },
    {
      label: "ชำระเงินและเริ่มทอ",
      description: "หลังชำระเงิน จะเริ่มกี่พุ่งสลับลายให้",
      status: "รอดำเนินการ",
      completed: false,
      active: false,
    },
  ];

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      sx={{ 
        minHeight: "100vh", 
        bgcolor: "#1B2A4A", 
        color: "#FFFFFF",
        p: 3,
        pt: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {/* 1. Header Success */}
      <Box sx={{ mb: 4, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <CheckCircleRoundedIcon sx={{ fontSize: "5rem", color: "#C5A55A", mb: 2 }} />
        <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", mb: 0.5 }}>ส่งคำขอสำเร็จแล้ว</Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>แอดมินจะติดต่อช่างและแจ้งผลกลับมาภายใน 1-2 วันทำการ</Typography>
        <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", mt: 1 }}>Request #LAYA-2024-0841</Typography>
      </Box>

      {/* 2. Timeline Card */}
      <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "24px", color: "#1B2A4A", p: 3, width: "100%", mb: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 3, fontSize: "0.9rem" }}>ความคืบหน้า</Typography>
        
        <Stepper orientation="vertical" connector={<SuccessConnector />} sx={{ "& .MuiStep-root": { mb: 2 } }}>
          {steps.map((step, index) => (
            <Step key={step.label} active={step.active} completed={step.completed}>
              <StepLabel 
                StepIconComponent={({ active, completed }) => (
                  <SuccessStepIcon active={active} completed={completed}>
                    {completed ? <CheckCircleRoundedIcon sx={{ fontSize: "1.1rem" }} /> : <Box className="dot" />}
                  </SuccessStepIcon>
                )}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: step.completed ? "#4B7355" : (step.active ? "#C5A55A" : "#9CA3AF") }}>
                    {step.label}
                  </Typography>
                  {step.date && <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{step.date}</Typography>}
                </Box>
                <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mt: 0.2 }}>{step.description}</Typography>
                <Chip 
                  label={step.status} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: "0.6rem", 
                    mt: 1, 
                    bgcolor: step.completed ? "#E9F2E9" : (step.active ? "#FDF8F0" : "#F5F5F5"),
                    color: step.completed ? "#4B7355" : (step.active ? "#8E601C" : "#9CA3AF"),
                    fontWeight: 600
                  }} 
                />
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* 3. Waiting Quick Actions */}
      <Box sx={{ width: "100%", bgcolor: "#FFFFFF", borderRadius: "24px", color: "#1B2A4A", p: 3, mb: 4 }}>
        <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", mb: 2, textAlign: "center" }}>ระหว่างรอ คุณสามารถ...</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
          {[
            { label: "ดูรายละเอียดคำขอ", color: "#F5F5F5", textColor: "#1B2A4A" },
            { label: "แก้ไขโน้ตถึงช่าง", color: "#F5F5F5", textColor: "#1B2A4A" },
            { label: "ยกเลิกคำขอ", color: "rgba(255, 0, 0, 0.05)", textColor: "#D32F2F" },
          ].map(action => (
            <Button 
              key={action.label} 
              sx={{ 
                height: 60, 
                bgcolor: action.color, 
                borderRadius: "16px", 
                textTransform: "none", 
                lineHeight: 1.2,
                fontSize: "0.7rem", 
                fontWeight: 600,
                color: action.textColor,
                textAlign: "center"
              }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* 4. Footer Note */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "rgba(255,255,255,0.6)" }}>
        <CheckCircleRoundedIcon sx={{ fontSize: "1rem", color: "#4B7355" }} />
        <Typography sx={{ fontSize: "0.75rem" }}>จะแจ้งเตือนผ่าน App และ SMS เมื่อช่างยืนยัน</Typography>
      </Box>
    </Box>
  );
}
