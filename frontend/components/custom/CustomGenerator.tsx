"use client";

import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";

import ModeSelection from "./ModeSelection";
import GuidedWizard from "./GuidedWizard";
import PromptWizard from "./PromptWizard";
import GenerationResult from "./GenerationResult";
import MockupPreview from "./MockupPreview";
import WeaverMatchingView from "./WeaverMatchingView";

import OrderConfirmationView from "@/components/custom/OrderConfirmationView";
import RequestSuccessView from "@/components/custom/RequestSuccessView";
import { WEAVER_COLORS, type CustomPatternData } from "@/lib/custom-order-config";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { useAppModal } from "@/components/providers/AppModalProvider";
import type { ShopMatch, WeavingRequestResult } from "@/components/custom/types";
import { getPatternImageByName } from "@/components/custom/PatternGallery";
import { absoluteUrl } from "@/lib/seo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type GeneratorMode = "select" | "guided" | "prompt" | "generating" | "preview" | "matching" | "confirm_request" | "request_success";

export default function CustomGenerator() {
  const { user, openAuthModal } = useAuth();
  const { showAlert } = useAppModal();
  const [currentMode, setCurrentMode] = useState<GeneratorMode>("select");
  const [patternData, setPatternData] = useState<CustomPatternData>({});
  const [selectedWeaver, setSelectedWeaver] = useState<ShopMatch | null>(null);
  const [requestNote, setRequestNote] = useState("");
  const [submittedRequest, setSubmittedRequest] = useState<WeavingRequestResult | null>(null);

  const handleModeSelect = (mode: "guided" | "prompt") => {
    setCurrentMode(mode);
  };

  const handleStartGeneration = async (data: CustomPatternData) => {
    if (!user) { openAuthModal(); return; }

    const merged: CustomPatternData = {
      ...data,
      weaveType: data.weaveType || "ยกดอก",
      complexity: data.complexity ?? 50,
      colors: data.colors?.length ? data.colors : ["กรมท่า", "เหลืองทอง", "แดงเลือด"],
    };
    setPatternData(merged);
    setCurrentMode("generating");

    // ผูกชื่อสีด้ายจริง -> hex (WEAVER_COLORS) ให้ backend ประกอบ prompt ได้แม่นยำ
    const colorHex = (merged.colors ?? [])
      .map((name) => WEAVER_COLORS.find((c) => c.name === name)?.hex)
      .filter((h): h is string => !!h);
    const complexityBucket = (merged.complexity ?? 50) >= 75 ? "detailed" : (merged.complexity ?? 50) >= 40 ? "medium" : "simple";

    // ใช้ลายเทมเพลตจริงที่เลือกไว้เป็นภาพอ้างอิง (image-to-image) แทนการให้ AI แต่งลายใหม่จากชื่อ —
    // ตอนนี้ flow คือ "recolor เทมเพลตเดิม" ไม่ใช่ "ผสมหลายลายเป็นดีไซน์ใหม่" (ดู patternPrompt.ts ฝั่ง backend)
    const selectedPatternName = merged.selectedPatterns?.[0];
    const patternAssetPath = selectedPatternName ? getPatternImageByName(selectedPatternName) : undefined;
    const referenceImageUrl = patternAssetPath ? absoluteUrl(patternAssetPath) : undefined;

    try {
      const res = await authFetch(`${API_BASE}/api/patterns/generate`, {
        method: "POST",
        body: JSON.stringify({
          colors: colorHex.length ? colorHex : ["#1B2A4A", "#C5A55A", "#8B0000"],
          colorNames: merged.colors,
          references: merged.selectedPatterns ?? [],
          referenceImageUrl,
          style: "Traditional Thai silk, pixel art style",
          weaveType: merged.weaveType,
          region: merged.region,
          dyeType: merged.dyeType,
          moodText: merged.mood,
          advanced: { complexity: complexityBucket },
        }),
      });
      const json = await res.json() as { fullImageUrl?: string; id?: string; isMock?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Generation failed");
      setPatternData((prev) => ({ ...prev, generatedImageUrl: json.fullImageUrl, patternId: json.id, isMock: json.isMock }));
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        showAlert({ title: "เซสชันหมดอายุ", message: err.message, tone: "warning" });
        setCurrentMode("select");
        return;
      }
      showAlert({ title: "สร้างลายผ้าไม่สำเร็จ", message: (err as Error).message || "กรุณาลองใหม่อีกครั้ง", tone: "warning" });
      setCurrentMode("select");
      return;
    }
    setCurrentMode("preview");
  };

  const handleStartMatching = () => {
    setCurrentMode("matching");
  };

  const handleSelectWeaver = (weaver: ShopMatch) => {
    setSelectedWeaver(weaver);
    setCurrentMode("confirm_request");
  };

  const handleConfirmRequest = async (note: string) => {
    if (!selectedWeaver) return;
    if (!user) { openAuthModal(); return; }
    setRequestNote(note);
    try {
      const res = await authFetch(`${API_BASE}/api/weaving-requests`, {
        method: "POST",
        body: JSON.stringify({ shopId: selectedWeaver.id, patternId: patternData.patternId, note }),
      });
      const json = await res.json() as WeavingRequestResult & { error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "ส่งคำขอทอผ้าไม่สำเร็จ");
      setSubmittedRequest(json);
      setCurrentMode("request_success");
    } catch (err) {
      const message = err instanceof SessionExpiredError ? err.message : (err as Error).message || "ส่งคำขอทอผ้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
      showAlert({ title: "ส่งคำขอทอผ้าไม่สำเร็จ", message, tone: "warning" });
    }
  };

  const handleBack = () => {
    if (currentMode === "generating" || currentMode === "preview") {
      setCurrentMode("select");
    } else if (currentMode === "matching") {
      setCurrentMode("preview");
    } else if (currentMode === "confirm_request") {
      setCurrentMode("matching");
    } else if (currentMode !== "select") {
      setCurrentMode("select");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: 430, md: 1000 },
        width: "100%",
        mx: "auto",
        minHeight: "100vh",
        bgcolor: currentMode === "request_success" ? "#1B2A4A" : "#FAF6F0",
        boxShadow: { xs: "none", sm: "0 0 40px rgba(0,0,0,0.08)", md: "none" },
        position: "relative",
      }}
    >
      {/* Dynamic Header */}
      {currentMode !== "request_success" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: { xs: 2, md: 6, lg: 8 },
            pt: 3,
            pb: 1,
          }}
        >
          {currentMode === "select" ? (
            <Link href="/">
              <IconButton size="small">
                <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16, color: "#1B2A4A" }} />
              </IconButton>
            </Link>
          ) : (
            <IconButton size="small" onClick={handleBack}>
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16, color: "#1B2A4A" }} />
            </IconButton>
          )}
          
          <Typography
            sx={{
              fontFamily: '"Kanit", sans-serif',
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#1B2A4A",
              flex: 1,
              textAlign: "center",
            }}
          >
            {currentMode === "select" && "Custom Design"}
            {currentMode === "guided" && (
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                Guided Mode <AutoAwesomeRoundedIcon sx={{ fontSize: "1.1rem", color: "#C5A55A" }} />
              </Box>
            )}
            {currentMode === "prompt" && (
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                Prompt Mode <EditRoundedIcon sx={{ fontSize: "1.1rem", color: "#C5A55A" }} />
              </Box>
            )}
            {currentMode === "generating" && "AI กำลังสร้างลายผ้า"}
            {currentMode === "preview" && "ผลลัพธ์ของคุณ"}
            {currentMode === "matching" && "Weaver Matching"}
            {currentMode === "confirm_request" && "ยืนยันคำขอทอผ้า"}
          </Typography>
          <Box sx={{ width: 32 }} /> {/* Spacer for centering */}
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ px: (currentMode === "matching" || currentMode === "confirm_request" || currentMode === "request_success") ? 0 : { xs: 2, md: 6, lg: 8 }, py: 1, pb: 10 }}>
        <AnimatePresence mode="wait">
          {currentMode === "select" && (
            <ModeSelection key="select" onSelectMode={handleModeSelect} />
          )}
          {currentMode === "guided" && (
            <GuidedWizard key="guided" onGenerate={handleStartGeneration} />
          )}
          {currentMode === "prompt" && (
            <PromptWizard key="prompt" onGenerate={handleStartGeneration} />
          )}
          {currentMode === "generating" && (
            <GenerationResult key="generating" />
          )}
          {currentMode === "preview" && (
            <MockupPreview 
              key="preview" 
              patternData={patternData} 
              onStartMatching={handleStartMatching}
            />
          )}
          {currentMode === "matching" && (
            <WeaverMatchingView 
              key="matching" 
              patternData={patternData!} 
              onSelectWeaver={handleSelectWeaver}
              onBack={() => setCurrentMode("preview")}
            />
          )}
          {currentMode === "confirm_request" && selectedWeaver && (
            <OrderConfirmationView 
              key="confirm" 
              patternData={patternData} 
              selectedWeaver={selectedWeaver}
              onConfirm={handleConfirmRequest}
              onCancel={() => setCurrentMode("matching")}
            />
          )}
          {currentMode === "request_success" && selectedWeaver && submittedRequest && (
            <RequestSuccessView
              key="success"
              patternData={patternData}
              selectedWeaver={selectedWeaver}
              requestNote={requestNote}
              submittedRequest={submittedRequest}
            />
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
