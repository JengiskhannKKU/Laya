"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallButton({ style }: { style?: CSSProperties }) {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) {
      setShowHint((v) => !v);
      return;
    }
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (installed) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <button
        type="button"
        onClick={handleClick}
        style={{
          fontFamily: "var(--font-kanit), 'Kanit', sans-serif",
          fontSize: "12px",
          fontWeight: 500,
          color: "#1B2A4A",
          background: "linear-gradient(135deg, #C5A55A 0%, #D4BA7A 100%)",
          border: "none",
          borderRadius: "999px",
          padding: "8px 18px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          ...style,
        }}
      >
        {t("footer.forMobile.install")}
      </button>
      {showHint && (
        <p
          style={{
            margin: 0,
            fontSize: "10.5px",
            color: "rgba(255,255,255,0.55)",
            textAlign: "center",
            maxWidth: "160px",
            lineHeight: 1.5,
          }}
        >
          {t("footer.forMobile.hint")}
        </p>
      )}
    </div>
  );
}
