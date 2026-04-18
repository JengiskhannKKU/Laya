"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";

export type AdminThemeMode = "dark" | "light";

// ─── Semantic Color Tokens ────────────────────────────────────
export interface AdminThemeColors {
  // Backgrounds
  bgPage: string;
  bgSidebar: string;
  bgCard: string;
  bgTopbar: string;
  bgCardHover: string;
  bgInputField: string;
  bgTableHeader: string;
  bgStatBox: string;

  // Borders
  borderCard: string;
  borderDivider: string;
  borderInput: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnGold: string;

  // Accents (shared)
  gold: string;
  goldHover: string;
  goldSubtle: string;

  // Chart
  chartGrid: string;
  chartTick: string;
  chartTooltipBg: string;
  chartTooltipText: string;
  legendText: string;

  // Overlay
  sidebarOverlay: string;

  // Dialog
  dialogBg: string;
  dialogText: string;
}

const darkColors: AdminThemeColors = {
  bgPage: "#0F172A",
  bgSidebar: "#1E293B",
  bgCard: "#1E293B",
  bgTopbar: "#1E293B",
  bgCardHover: "rgba(255,255,255,0.02)",
  bgInputField: "#1E293B",
  bgTableHeader: "rgba(255,255,255,0.03)",
  bgStatBox: "rgba(255,255,255,0.03)",

  borderCard: "rgba(255,255,255,0.06)",
  borderDivider: "rgba(255,255,255,0.06)",
  borderInput: "rgba(255,255,255,0.06)",

  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.6)",
  textMuted: "rgba(255,255,255,0.4)",
  textOnGold: "#FFFFFF",

  gold: "#C5A55A",
  goldHover: "#B4954A",
  goldSubtle: "rgba(197,165,90,0.2)",

  chartGrid: "rgba(255,255,255,0.05)",
  chartTick: "rgba(255,255,255,0.4)",
  chartTooltipBg: "#334155",
  chartTooltipText: "#FFFFFF",
  legendText: "rgba(255,255,255,0.7)",

  sidebarOverlay: "rgba(0,0,0,0.5)",

  dialogBg: "#1E293B",
  dialogText: "#FFFFFF",
};

const lightColors: AdminThemeColors = {
  bgPage: "#F4F6F9",
  bgSidebar: "#FFFFFF",
  bgCard: "#FFFFFF",
  bgTopbar: "#FFFFFF",
  bgCardHover: "rgba(0,0,0,0.02)",
  bgInputField: "#F4F6F9",
  bgTableHeader: "#F8F9FB",
  bgStatBox: "#F4F6F9",

  borderCard: "#E2E8F0",
  borderDivider: "#E2E8F0",
  borderInput: "#E2E8F0",

  textPrimary: "#1B2A4A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textOnGold: "#FFFFFF",

  gold: "#C5A55A",
  goldHover: "#B4954A",
  goldSubtle: "rgba(197,165,90,0.12)",

  chartGrid: "rgba(0,0,0,0.06)",
  chartTick: "#94A3B8",
  chartTooltipBg: "#1E293B",
  chartTooltipText: "#FFFFFF",
  legendText: "#475569",

  sidebarOverlay: "rgba(0,0,0,0.3)",

  dialogBg: "#FFFFFF",
  dialogText: "#1B2A4A",
};

// ─── Context ──────────────────────────────────────────────────
interface AdminThemeContextType {
  mode: AdminThemeMode;
  toggleMode: () => void;
  c: AdminThemeColors;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  mode: "dark",
  toggleMode: () => {},
  c: darkColors,
});

export const useAdminTheme = () => useContext(AdminThemeContext);

// ─── Provider ─────────────────────────────────────────────────
export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AdminThemeMode>("dark");

  // Persist preference in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("laya-admin-theme") as AdminThemeMode | null;
    if (saved === "light" || saved === "dark") {
      setMode(saved);
    }
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("laya-admin-theme", next);
      return next;
    });
  };

  const c = useMemo(() => (mode === "dark" ? darkColors : lightColors), [mode]);

  return (
    <AdminThemeContext.Provider value={{ mode, toggleMode, c }}>
      {children}
    </AdminThemeContext.Provider>
  );
}
