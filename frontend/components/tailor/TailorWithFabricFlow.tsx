"use client";

import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";

// Import all step components
import UploadFabricStep from "./steps/UploadFabricStep";
import AIAnalysisStep from "./steps/AIAnalysisStep";
import ChooseShapeStep from "./steps/ChooseShapeStep";
import SelectOccasionStep from "./steps/SelectOccasionStep";
import MeasurementsStep from "./steps/MeasurementsStep";
import VirtualTryOnStep from "./steps/VirtualTryOnStep";
import OrderSummaryStep from "./steps/OrderSummaryStep";
import SelectTailorShopStep from "./steps/SelectTailorShopStep";
import OrderSuccessStep from "./steps/OrderSuccessStep";
import TailorStepper from "./TailorStepper";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const IVORY = "#FAF6F0";

// ลำดับ (ต่างจาก flow_1.png ตรงตำแหน่ง "เลือกทรงที่ชอบ" — mockup วางไว้หลังเลือกโอกาสใช้งาน แต่ผู้ใช้
// ขอให้ย้ายมาก่อนแทน เป็นการตัดสินใจของผู้ใช้เอง):
// อัปโหลดรูปผ้า → AI วิเคราะห์ผ้า → เลือกร้านตัดเย็บ → เลือกทรงที่ชอบ → เลือกโอกาสใช้งาน → ถ่ายรูปตัวเอง/ส่งขนาด →
// ลองใส่เสมือนจริง → สรุปออเดอร์ → สำเร็จ
// (ถ่ายรูปตัวเองต้องมาก่อนลองใส่เสมือนจริงเสมอ — ใน mockup เดิมข้อ 11 อยู่หลังข้อ 8 ซึ่งสลับกันผิด)
//
// เลือกร้านตัดเย็บย้ายมาก่อน "เลือกทรง" (แทนที่จะอยู่ท้าย flow) เพื่อให้ลูกค้าเลือกทรงได้เฉพาะที่ร้านนั้นรับตัดจริง —
// ไม่งั้นลูกค้าจะเสียเวลาเลือกทรงที่ร้านที่เลือกไว้ตัดไม่ได้ (ChooseShapeStep กรอง template ตาม shop.id ที่เลือกไว้แล้ว)

export type TailorStep =
  | "upload"
  | "ai_analysis"
  | "select_shop"
  | "choose_shape"
  | "select_occasion"
  | "measurements"
  | "virtual_try_on"
  | "order_summary"
  | "success";

export interface TailorOrderState {
  fabricImage?: string;
  analysisResult?: any;
  shape?: {
    id: string; name: string; category: string; front: string; back: string; price: number;
  };
  occasion?: string;
  // เลือกวิธีลองใส่เสมือนจริง: ใช้รูปตัวเองจริง (photo) หรือกรอกสัดส่วนให้ AI สร้างแบบจำลองแทน (measurements)
  bodyInputMode?: "photo" | "measurements";
  bodyPhotos?: { front?: string; back?: string; side?: string };
  bodyMeasurements?: {
    gender: "male" | "female";
    height: number; // ซม.
    weight: number; // กก.
    chest: number; // ซม.
    waist: number; // ซม.
    hip: number; // ซม.
  };
  tryOnResults?: { front?: string; back?: string; side?: string };
  shop?: any;
}

export default function TailorWithFabricFlow() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<TailorStep>("upload");
  const [orderState, setOrderState] = useState<TailorOrderState>({});

  const goNext = (step: TailorStep) => setCurrentStep(step);

  const handleBack = () => {
    switch (currentStep) {
      case "ai_analysis": goNext("upload"); break;
      case "select_shop": goNext("ai_analysis"); break;
      case "choose_shape": goNext("select_shop"); break;
      case "select_occasion": goNext("choose_shape"); break;
      case "measurements": goNext("select_occasion"); break;
      case "virtual_try_on": goNext("measurements"); break;
      case "order_summary": goNext("virtual_try_on"); break;
      default: break;
    }
  };

  const getHeaderTitle = () => {
    switch (currentStep) {
      case "upload": return t("tailorFlow.headerTitles.upload");
      case "ai_analysis": return t("tailorFlow.headerTitles.aiAnalysis");
      case "select_shop": return t("tailorFlow.headerTitles.selectShop");
      case "choose_shape": return t("tailorFlow.headerTitles.chooseShape");
      case "select_occasion": return t("tailorFlow.headerTitles.selectOccasion");
      case "measurements": return t("tailorFlow.headerTitles.measurements");
      case "virtual_try_on": return t("tailorFlow.headerTitles.virtualTryOn");
      case "order_summary": return t("tailorFlow.headerTitles.orderSummary");
      case "success": return t("tailorFlow.headerTitles.success");
      default: return "";
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: IVORY }}>
      {/* Header — sticky, ดีไซน์เดียวกับ checkout */}
      {currentStep !== "success" && (
        <Box sx={{
          px: { xs: 1.5, md: 4 }, pt: { xs: 4, md: 3 }, pb: { xs: 1.5, md: 2 }, display: "flex", alignItems: "center",
          bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #EFE9DD",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", maxWidth: 960, width: "100%", mx: "auto" }}>
            {currentStep === "upload" ? (
              <Link href="/services/tailor">
                <IconButton sx={{ color: NAVY }}>
                  <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Link>
            ) : (
              <IconButton onClick={handleBack} sx={{ color: NAVY }}>
                <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <Typography sx={{ flex: 1, textAlign: "center", mr: 5, fontFamily: FONT, fontSize: { xs: "1.05rem", md: "1.25rem" }, fontWeight: 700, color: NAVY }}>
              {getHeaderTitle()}
            </Typography>
          </Box>
        </Box>
      )}

      {/* เนื้อหา — จำกัดความกว้างสูงสุด กึ่งกลางจอ พร้อม stepper บอกความคืบหน้า */}
      <Box sx={{ maxWidth: 640, width: "100%", mx: "auto", px: { xs: 2, md: 3 }, pt: { xs: 1, md: 2 }, pb: { xs: 8, md: 6 } }}>
        {currentStep !== "success" && <TailorStepper currentStep={currentStep} />}

        <AnimatePresence mode="wait">
          {currentStep === "upload" && (
            <UploadFabricStep key="upload" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("ai_analysis")} />
          )}
          {currentStep === "ai_analysis" && (
            <AIAnalysisStep key="ai_analysis" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("select_shop")} />
          )}
          {currentStep === "select_shop" && (
            <SelectTailorShopStep key="select_shop" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("choose_shape")} />
          )}
          {currentStep === "choose_shape" && (
            <ChooseShapeStep key="choose_shape" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("select_occasion")} />
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
            <OrderSummaryStep key="order_summary" orderState={orderState} onNext={() => goNext("success")} />
          )}
          {currentStep === "success" && (
            <OrderSuccessStep key="success" orderState={orderState} />
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
