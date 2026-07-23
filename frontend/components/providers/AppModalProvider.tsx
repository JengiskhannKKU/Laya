"use client";

/**
 * Modal / Toast กลางของแอป — แทน window.alert / window.confirm ทั้งหมด
 * ธีมเดียวกับเว็บ (navy #1B2A4A + gold #C5A55A, ฟอนต์ Kanit, มุมโค้ง)
 *
 * ใช้งาน:
 *   const { showAlert, showConfirm, showToast } = useAppModal();
 *   await showAlert({ title: "...", message: "..." });
 *   const ok = await showConfirm({ title: "...", message: "...", confirmLabel: "ลบ", danger: true });
 *   showToast("เพิ่มลงตะกร้าแล้ว");
 */

import { createContext, useCallback, useContext, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";

type ModalTone = "info" | "success" | "warning" | "error";

export interface AlertOptions {
  title: string;
  message?: string;
  tone?: ModalTone;
  confirmLabel?: string;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  tone?: ModalTone;
  confirmLabel?: string;
  cancelLabel?: string;
  /** ปุ่มยืนยันเป็นสีแดง (ลบ/ยกเลิกออเดอร์) */
  danger?: boolean;
}

interface AppModalContextType {
  showAlert: (opts: AlertOptions) => Promise<void>;
  showConfirm: (opts: ConfirmOptions) => Promise<boolean>;
  showToast: (message: string, icon?: "cart" | "check") => void;
}

const AppModalContext = createContext<AppModalContextType | null>(null);

interface ModalState extends ConfirmOptions {
  mode: "alert" | "confirm";
  open: boolean;
}

const TONE_ICON: Record<ModalTone, React.ReactNode> = {
  info: <InfoOutlinedIcon sx={{ fontSize: 30, color: "#1B2A4A" }} />,
  success: <CheckCircleRoundedIcon sx={{ fontSize: 30, color: "#05A546" }} />,
  warning: <WarningAmberRoundedIcon sx={{ fontSize: 30, color: "#D97706" }} />,
  error: <CancelRoundedIcon sx={{ fontSize: 30, color: "#D32F2F" }} />,
};

const TONE_BG: Record<ModalTone, string> = {
  info: "#EEF3FF",
  success: "#E8F5E9",
  warning: "#FFF7ED",
  error: "#FDECEC",
};

export function AppModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const [toast, setToast] = useState<{ message: string; icon: "cart" | "check" } | null>(null);

  const close = useCallback((result: boolean) => {
    setModal((m) => (m ? { ...m, open: false } : m));
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  const showAlert = useCallback((opts: AlertOptions) => {
    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
      setModal({ ...opts, mode: "alert", open: true });
    });
  }, []);

  const showConfirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setModal({ ...opts, mode: "confirm", open: true });
    });
  }, []);

  const showToast = useCallback((message: string, icon: "cart" | "check" = "check") => {
    setToast({ message, icon });
  }, []);

  const tone = modal?.tone ?? "info";

  return (
    <AppModalContext.Provider value={{ showAlert, showConfirm, showToast }}>
      {children}

      {/* ── Modal ── */}
      <Dialog
        open={!!modal?.open}
        onClose={() => close(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 1,
            maxWidth: 400,
            width: "calc(100% - 48px)",
            boxShadow: "0 20px 60px rgba(27,42,74,0.25)",
          },
        }}
      >
        {modal && (
          <Box sx={{ p: 2.5, textAlign: "center" }}>
            <Box
              sx={{
                width: 60, height: 60, borderRadius: "50%", bgcolor: TONE_BG[tone],
                display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2,
              }}
            >
              {TONE_ICON[tone]}
            </Box>

            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: "#1B2A4A", mb: 1 }}>
              {modal.title}
            </Typography>
            {modal.message && (
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.7, mb: 3, whiteSpace: "pre-line" }}>
                {modal.message}
              </Typography>
            )}
            {!modal.message && <Box sx={{ mb: 2 }} />}

            <Box sx={{ display: "flex", gap: 1.5 }}>
              {modal.mode === "confirm" && (
                <Button
                  fullWidth
                  onClick={() => close(false)}
                  sx={{
                    py: 1.2, borderRadius: "12px", border: "1px solid #E5DFD6",
                    color: "#6B7280", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none",
                    "&:hover": { bgcolor: "#FAF6F0" },
                  }}
                >
                  {modal.cancelLabel ?? "ยกเลิก"}
                </Button>
              )}
              <Button
                fullWidth
                variant="contained"
                onClick={() => close(true)}
                autoFocus
                sx={{
                  py: 1.2, borderRadius: "12px", boxShadow: "none",
                  bgcolor: modal.danger ? "#D32F2F" : "#1B2A4A",
                  color: "#FFFFFF", fontFamily: '"Kanit", sans-serif', fontWeight: 700, textTransform: "none",
                  "&:hover": { bgcolor: modal.danger ? "#B02525" : "#0F1A30", boxShadow: "none" },
                }}
              >
                {modal.confirmLabel ?? (modal.mode === "confirm" ? "ยืนยัน" : "ตกลง")}
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 88, md: 32 } }}
      >
        <Box
          sx={{
            display: "flex", alignItems: "center", gap: 1.2,
            bgcolor: "#1B2A4A", color: "#FFFFFF",
            px: 2.5, py: 1.4, borderRadius: "999px",
            boxShadow: "0 8px 28px rgba(27,42,74,0.35)",
          }}
        >
          {toast?.icon === "cart"
            ? <ShoppingCartRoundedIcon sx={{ fontSize: 18, color: "#C5A55A" }} />
            : <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#C5A55A" }} />}
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", fontWeight: 500 }}>
            {toast?.message}
          </Typography>
        </Box>
      </Snackbar>
    </AppModalContext.Provider>
  );
}

export function useAppModal(): AppModalContextType {
  const ctx = useContext(AppModalContext);
  if (!ctx) throw new Error("useAppModal must be used within AppModalProvider");
  return ctx;
}
