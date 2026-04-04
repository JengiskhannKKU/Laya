"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import ViewInArRoundedIcon from "@mui/icons-material/ViewInArRounded";

// Tell TypeScript about the model-viewer web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          ar?: boolean | string;
          "ar-scale"?: string;
          "camera-controls"?: boolean | string;
          "touch-action"?: string;
          "shadow-intensity"?: string;
          alt?: string;
          style?: React.CSSProperties;
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface ModelViewerProps {
  src: string;
}

export default function ModelViewerWidget({ src }: ModelViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import the web component only on the client
    import("@google/model-viewer").then(() => {
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#FAF6F0" }}>
        <Typography sx={{ color: "#1B2A4A", fontFamily: '"Noto Serif Thai", serif', fontWeight: 600 }}>Loading 3D UI...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative", borderRadius: 3, overflow: "hidden" }}>
      <model-viewer
        src={src}
        ar
        ar-scale="fixed"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1"
        alt="A 3D model of a Thai dress"
        style={{ width: "100%", height: "100%", backgroundColor: "#FAF6F0" }}
      >
        {/* AR button override for customizing the native AR look */}
        <button
          slot="ar-button"
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            backgroundColor: "#C5A55A",
            color: "#1B2A4A",
            border: "none",
            borderRadius: "24px",
            padding: "8px 16px",
            fontFamily: '"Noto Serif Thai", serif',
            fontWeight: 700,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <ViewInArRoundedIcon sx={{ fontSize: 20 }} />
          View in AR
        </button>
      </model-viewer>
    </Box>
  );
}
