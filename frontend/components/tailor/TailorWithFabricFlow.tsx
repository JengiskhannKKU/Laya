"use client";

import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";

// Import all step components
import UploadFabricStep from "./steps/UploadFabricStep";
import CustomizeDetailsStep from "./steps/CustomizeDetailsStep";
import AIAnalysisStep from "./steps/AIAnalysisStep";
import ChooseShapeStep from "./steps/ChooseShapeStep";
import SelectOccasionStep from "./steps/SelectOccasionStep";
import MeasurementsStep from "./steps/MeasurementsStep";
import VirtualTryOnStep from "./steps/VirtualTryOnStep";
import OrderSummaryStep from "./steps/OrderSummaryStep";
import SelectTailorShopStep from "./steps/SelectTailorShopStep";
import PaymentStep from "./steps/PaymentStep";
import OrderSuccessStep from "./steps/OrderSuccessStep";
import TailorStepper from "./TailorStepper";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FONT = '"Kanit", sans-serif';
const NAVY = "#1B2A4A";
const IVORY = "#FAF6F0";

// ลำดับ: เลือกร้าน → เลือกทรงที่ชอบ (ย้ายมาก่อนอัปโหลดผ้า เพราะทรงขึ้นกับร้านที่เลือกไว้ ไม่ขึ้นกับผ้า
// เลือกทรงไว้ก่อนได้เลยแม้ยังไม่มีรูปผ้า — ตอน preview จะขึ้น placeholder สีจนกว่าจะอัปโหลดผ้าจริง) →
// อัปโหลดรูปผ้า (เห็น Preview การออกแบบ) → AI วิเคราะห์ผ้า → ปรับรายละเอียดเพิ่มเติม (คอ/แขน/กระเป๋า/กระดุม/
// ความยาว/ทรง/ซับใน — ตามสเปค services.jpg ข้อ 4-5 "Preview Engine") → บรีฟการใช้งาน/สไตล์/ความพอดี →
// สัดส่วนร่างกาย (ถ่ายรูป/กรอกสัดส่วน) → ลองใส่เสมือนจริง → สรุปออเดอร์ → สำเร็จ

export type TailorStep =
  | "select_shop"
  | "choose_shape"
  | "upload"
  | "ai_analysis"
  | "customize_details"
  | "select_occasion"
  | "measurements"
  | "virtual_try_on"
  | "order_summary"
  | "payment"
  | "success";

export interface TailorOrderState {
  fabricImage?: string;
  analysisResult?: any;
  shape?: {
    id: string; name: string; category: string; front: string; back: string; price: number;
  };
  occasion?: string;
  // บรีฟการใช้งาน/สไตล์/ความพอดี — เพิ่มตามสเปค custom_design_flow.jpg (เดิมมีแค่ occasion)
  designBrief?: { style?: string; fit?: string; notes?: string };
  // รายละเอียดเสื้อผ้าเพิ่มเติม — ตามสเปค services.jpg ข้อ 4 "ปรับรายละเอียดเพิ่มเติม"
  // (คอเสื้อ/แขนเสื้อ/กระเป๋า/กระดุม/ความยาว/ทรง/ซับใน) ทุกฟิลด์ไม่บังคับกรอก
  garmentDetails?: {
    collar?: string;
    sleeve?: string;
    pocket?: string;
    button?: string;
    length?: string;
    silhouette?: string;
    lining?: string;
    otherNotes?: string;
  };
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
    shoulderWidth?: number; // ซม. — ตามสเปค custom_design_flow.jpg
    armLength?: number; // ซม.
    garmentLength?: number; // ซม.
    notes?: string;
  };
  tryOnResults?: { front?: string; back?: string; side?: string };
  shop?: any;
  // สร้างจริงตอนกด "ยืนยันสั่งซื้อ" ใน OrderSummaryStep — orders row + payment (พร้อมเพย์) ของ backend
  orderId?: string;
  payment?: { id: string; amount: number; qrPayload: string; promptpayId: string } | null;
}

export default function TailorWithFabricFlow() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<TailorStep>("select_shop");
  const [orderState, setOrderState] = useState<TailorOrderState>({});

  const goNext = (step: TailorStep) => setCurrentStep(step);

  const handleBack = () => {
    switch (currentStep) {
      case "choose_shape": goNext("select_shop"); break;
      case "upload": goNext("choose_shape"); break;
      case "ai_analysis": goNext("upload"); break;
      case "customize_details": goNext("ai_analysis"); break;
      case "select_occasion": goNext("customize_details"); break;
      case "measurements": goNext("select_occasion"); break;
      case "virtual_try_on": goNext("measurements"); break;
      case "order_summary": goNext("virtual_try_on"); break;
      default: break;
    }
  };

  const getHeaderTitle = () => {
    switch (currentStep) {
      case "select_shop": return t("tailorFlow.headerTitles.selectShop");
      case "upload": return t("tailorFlow.headerTitles.upload");
      case "customize_details": return t("tailorFlow.headerTitles.customizeDetails");
      case "ai_analysis": return t("tailorFlow.headerTitles.aiAnalysis");
      case "choose_shape": return t("tailorFlow.headerTitles.chooseShape");
      case "select_occasion": return t("tailorFlow.headerTitles.selectOccasion");
      case "measurements": return t("tailorFlow.headerTitles.measurements");
      case "virtual_try_on": return t("tailorFlow.headerTitles.virtualTryOn");
      case "order_summary": return t("tailorFlow.headerTitles.orderSummary");
      case "payment": return "ชำระเงิน";
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
            {currentStep === "select_shop" ? (
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
        {currentStep !== "success" && (
          <TailorStepper currentStep={currentStep} onStepClick={(step) => goNext(step as TailorStep)} />
        )}

        <AnimatePresence mode="wait">
          {currentStep === "select_shop" && (
            <SelectTailorShopStep key="select_shop" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("choose_shape")} />
          )}
          {currentStep === "choose_shape" && (
            <ChooseShapeStep key="choose_shape" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("upload")} />
          )}
          {currentStep === "upload" && (
            <UploadFabricStep key="upload" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("ai_analysis")} />
          )}
          {currentStep === "ai_analysis" && (
            <AIAnalysisStep key="ai_analysis" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("customize_details")} />
          )}
          {currentStep === "customize_details" && (
            <CustomizeDetailsStep key="customize_details" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("select_occasion")} />
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
            <OrderSummaryStep key="order_summary" orderState={orderState} setOrderState={setOrderState} onNext={() => goNext("payment")} />
          )}
          {currentStep === "payment" && (
            <PaymentStep key="payment" orderState={orderState} onNext={() => goNext("success")} />
          )}
          {currentStep === "success" && (
            <OrderSuccessStep key="success" orderState={orderState} />
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
