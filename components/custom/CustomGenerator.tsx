"use client";

import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
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
import { weavers, type Weaver, type CustomPatternData } from "@/lib/mock-data";

export type GeneratorMode = "select" | "guided" | "prompt" | "generating" | "preview" | "matching" | "confirm_request" | "request_success";

export default function CustomGenerator() {
  const [currentMode, setCurrentMode] = useState<GeneratorMode>("select");
  const [patternData, setPatternData] = useState<CustomPatternData>({});
  const [selectedWeaver, setSelectedWeaver] = useState<Weaver | null>(null);
  const [requestNote, setRequestNote] = useState("");

  const handleModeSelect = (mode: "guided" | "prompt") => {
    setCurrentMode(mode);
  };

  const handleStartGeneration = async (data: CustomPatternData) => {
    const merged: CustomPatternData = {
      ...data,
      weaveType: data.weaveType || "ยกดอก",
      complexity: data.complexity || 50,
      colors: data.colors || ["#1B2A4A", "#CFA055", "#800000"],
    };
    setPatternData(merged);
    setCurrentMode("generating");

    // Build a rich prompt from the wizard selections
    const patternNames = (merged.selectedPatterns ?? []).join(" blended with ");
    const complexityLabel = (merged.complexity ?? 50) > 70 ? "highly intricate" : (merged.complexity ?? 50) > 40 ? "medium complexity" : "simple";
    const prompt = [
      `Seamless Thai silk textile pattern, pixel art style,`,
      patternNames ? `motifs: ${patternNames},` : "",
      merged.weaveType ? `weave technique: ${merged.weaveType},` : "",
      merged.region ? `regional style: ${merged.region},` : "",
      merged.mood ? `occasion: ${merged.mood},` : "",
      `${complexityLabel} design,`,
      `traditional Thai colors, rich gold and deep jewel tones,`,
      `crisp repeating tile, no text, no watermark`,
    ].filter(Boolean).join(" ");

    try {
      const res = await fetch("/api/nanobanana/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json() as { imageUrl?: string; error?: string; mock?: boolean };
      if (!res.ok || json.error) throw new Error(json.error ?? "Generation failed");
      setPatternData((prev: any) => ({ ...prev, generatedImageUrl: json.imageUrl, isMock: json.mock }));
    } catch (err: any) {
      // Silence console error and provide mock fallback to avoid dev overlay
      setPatternData((prev: any) => ({ 
        ...prev, 
        generatedImageUrl: "/images/fabric1.jpg", 
        isMock: true 
      }));
    } finally {
      setCurrentMode("preview");
    }
  };

  const handleStartMatching = () => {
    setCurrentMode("matching");
  };

  const handleSelectWeaver = (weaver: Weaver) => {
    setSelectedWeaver(weaver);
    setCurrentMode("confirm_request");
  };

  const handleConfirmRequest = (note: string) => {
    setRequestNote(note);
    setCurrentMode("request_success");
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
        maxWidth: 430,
        mx: "auto",
        minHeight: "100vh",
        bgcolor: currentMode === "request_success" ? "#1B2A4A" : "#FAF6F0",
        boxShadow: { xs: "none", sm: "0 0 40px rgba(0,0,0,0.08)" },
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
            px: 2,
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
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#1B2A4A",
              flex: 1,
              textAlign: "center",
            }}
          >
            {currentMode === "select" && "Custom Design"}
            {currentMode === "guided" && "Guided Mode ✨"}
            {currentMode === "prompt" && "Prompt Mode ✍️"}
            {currentMode === "generating" && "AI กำลังสร้างลายผ้า"}
            {currentMode === "preview" && "ผลลัพธ์ของคุณ"}
            {currentMode === "matching" && "Weaver Matching"}
            {currentMode === "confirm_request" && "ยืนยันคำขอทอผ้า"}
          </Typography>
          <Box sx={{ width: 32 }} /> {/* Spacer for centering */}
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ px: (currentMode === "matching" || currentMode === "confirm_request" || currentMode === "request_success") ? 0 : 2, py: 1, pb: 10 }}>
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
          {currentMode === "request_success" && selectedWeaver && (
            <RequestSuccessView 
              key="success" 
              patternData={patternData} 
              selectedWeaver={selectedWeaver}
              requestNote={requestNote}
            />
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
