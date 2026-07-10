"use client";

import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";

// Import all step components
import UploadFabricStep from "./steps/UploadFabricStep";
import AIAnalysisStep from "./steps/AIAnalysisStep";
import SelectOccasionStep from "./steps/SelectOccasionStep";
import MeasurementsStep from "./steps/MeasurementsStep";
import VirtualTryOnStep from "./steps/VirtualTryOnStep";
import OrderSummaryStep from "./steps/OrderSummaryStep";
import SelectTailorShopStep from "./steps/SelectTailorShopStep";
import OrderSuccessStep from "./steps/OrderSuccessStep";

// ลำดับตาม flow_1.png (Flow 1 — สั่งตัดด้วยผ้าที่มีอยู่แล้ว) ตัด "เลือกทรงที่ชอบ" ออกแล้ว —
// ผู้ใช้อัปโหลด+ AI วิเคราะห์ผ้าของตัวเองอยู่แล้วในขั้นก่อนหน้า ไม่ต้องเลือกทรงจากแคตตาล็อกซ้ำอีกชั้น:
// อัปโหลดรูปผ้า → AI วิเคราะห์ผ้า → เลือกโอกาสใช้งาน → ถ่ายรูปตัวเอง/ส่งขนาด →
// ลองใส่เสมือนจริง → สรุปออเดอร์ → เลือกร้านตัดเย็บ → สำเร็จ
// (ถ่ายรูปตัวเองต้องมาก่อนลองใส่เสมือนจริงเสมอ — ใน mockup เดิมข้อ 11 อยู่หลังข้อ 8 ซึ่งสลับกันผิด)

export type TailorStep =
  | "upload"
  | "ai_analysis"
  | "select_occasion"
  | "measurements"
  | "virtual_try_on"
  | "order_summary"
  | "select_shop"
  | "success";

export interface TailorOrderState {
  fabricImage?: string;
  analysisResult?: any;
  occasion?: string;
  bodyPhoto?: string;
  shop?: any;
}

export default function TailorWithFabricFlow() {
  const [currentStep, setCurrentStep] = useState<TailorStep>("upload");
  const [orderState, setOrderState] = useState<TailorOrderState>({});

  const goNext = (step: TailorStep) => setCurrentStep(step);

  const handleBack = () => {
    switch (currentStep) {
      case "ai_analysis": goNext("upload"); break;
      case "select_occasion": goNext("ai_analysis"); break;
      case "measurements": goNext("select_occasion"); break;
      case "virtual_try_on": goNext("measurements"); break;
      case "order_summary": goNext("virtual_try_on"); break;
      case "select_shop": goNext("order_summary"); break;
      default: break;
    }
  };

  const getHeaderTitle = () => {
    switch (currentStep) {
      case "upload": return "อัปโหลดรูปผ้า";
      case "ai_analysis": return "ผลการวิเคราะห์ผ้า";
      case "select_occasion": return "เลือกโอกาสใช้งาน";
      case "measurements": return "ถ่ายรูปเพื่อวัดสัดส่วน";
      case "virtual_try_on": return "ลองใส่เสมือนจริง";
      case "order_summary": return "สรุปออเดอร์";
      case "select_shop": return "เลือกร้านตัดเย็บ";
      case "success": return "ร้านคอนเฟิร์มออเดอร์แล้ว!";
      default: return "";
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#FAF6F0", position: "relative" }}>
      {/* Header */}
      {currentStep !== "success" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 3, pb: 1 }}>
          {currentStep === "upload" ? (
            <Link href="/services/tailor">
              <IconButton size="small">
                <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16, color: "#1B2A4A" }} />
              </IconButton>
            </Link>
          ) : (
            <IconButton size="small" onClick={handleBack}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16, color: "#1B2A4A" }} />
            </IconButton>
          )}
          <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", flex: 1, textAlign: "center" }}>
            {getHeaderTitle()}
          </Typography>
          <Box sx={{ width: 32 }} />
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ px: 2, py: 1, pb: 10 }}>
        <AnimatePresence>
          {currentStep === "upload" && (
            <UploadFabricStep key="upload" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("ai_analysis")} />
          )}
          {currentStep === "ai_analysis" && (
            <AIAnalysisStep key="ai_analysis" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("select_occasion")} />
          )}
          {currentStep === "select_occasion" && (
            <SelectOccasionStep key="select_occasion" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("measurements")} />
          )}
          {currentStep === "measurements" && (
            <MeasurementsStep key="measurements" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("virtual_try_on")} />
          )}
          {currentStep === "virtual_try_on" && (
            <VirtualTryOnStep key="virtual_try_on" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("order_summary")} />
          )}
          {currentStep === "order_summary" && (
            <OrderSummaryStep key="order_summary" orderState={orderState} onNext={() => goNext("select_shop")} />
          )}
          {currentStep === "select_shop" && (
            <SelectTailorShopStep key="select_shop" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("success")} />
          )}
          {currentStep === "success" && (
            <OrderSuccessStep key="success" orderState={orderState} />
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
