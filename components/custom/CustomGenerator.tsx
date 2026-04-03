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

export type GeneratorMode = "select" | "guided" | "prompt" | "generating" | "preview";

export interface CustomPatternData {
  selectedPatterns?: string[];
  colors?: string[];
  weaveType?: string;
  region?: string;
  complexity?: number;
  mood?: string;
  promptText?: string;
}

export default function CustomGenerator() {
  const [currentMode, setCurrentMode] = useState<GeneratorMode>("select");
  const [patternData, setPatternData] = useState<CustomPatternData>({});

  const handleModeSelect = (mode: "guided" | "prompt") => {
    setCurrentMode(mode);
  };

  const handleStartGeneration = (data: CustomPatternData) => {
    setPatternData(data);
    setCurrentMode("generating");
    
    // Simulate generation delay
    setTimeout(() => {
      setCurrentMode("preview");
    }, 4000); // 4 seconds simulated generation
  };

  const handleBack = () => {
    if (currentMode === "generating" || currentMode === "preview") {
      setCurrentMode("select");
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
        bgcolor: "#FAF6F0",
        boxShadow: { xs: "none", sm: "0 0 40px rgba(0,0,0,0.08)" },
        position: "relative",
      }}
    >
      {/* Dynamic Header */}
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
          {currentMode === "generating" && "AI กำลังสร้างลายฟ้า"}
          {currentMode === "preview" && "ผลลัพธ์ของคูณ"}
        </Typography>
        <Box sx={{ width: 32 }} /> {/* Spacer for centering */}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ px: 2, py: 1, pb: 10 }}>
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
             <MockupPreview key="preview" patternData={patternData} />
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
