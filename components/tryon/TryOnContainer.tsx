"use client";

import { useState } from "react";
import TryOnView from "./TryOnView";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";

interface ProductInfo {
  name: string;
  price: number;
  image: string;
  modelUrl: string;
  defaultMode: any;
}

export default function TryOnContainer() {
  const [mode, setMode] = useState<"preview" | "ar">("preview");

  const product: ProductInfo = {
    name: "กระเป๋าผ้าไหมหริภุญชัย ลายกินรี",
    price: 3500,
    image: "/fabric1.jpg", 
    modelUrl: "/models/bag_1.glb",
    defaultMode: "RIGHT_WRIST",
  };

  if (mode === "ar") {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <button
          onClick={() => setMode("preview")}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 100,
            padding: "8px 16px",
            borderRadius: "20px",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            fontFamily: "'Noto Serif Thai', serif",
            fontSize: "0.8rem",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          ← กลับ
        </button>
        <TryOnView 
          modelUrl={product.modelUrl}
          modelName={product.name}
          defaultMode={product.defaultMode}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      width: "100%", 
      height: "calc(100vh - 80px)", // Leave space for bottom nav
      background: "#0a0f16", 
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "1.4rem",
        color: "#C5A55A",
        marginBottom: 24,
        letterSpacing: 1
      }}>
        Virtual Try-On 
      </div>

      <div style={{
        width: "100%",
        maxWidth: "340px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(197,165,90,0.2)",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          width: "100%",
          height: "220px",
          background: "linear-gradient(45deg, #1A2436, #0F1722)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
          {/* We don't have a real image of the 3D model, so we show a stylized box/icon */}
          <div style={{ fontSize: "5rem", opacity: 0.8 }}>🛍️</div>
          <div style={{
            position: "absolute",
            bottom: 12, left: 14,
            background: "rgba(197,165,90,0.2)",
            border: "1px solid rgba(197,165,90,0.3)",
            color: "#C5A55A",
            padding: "4px 8px",
            borderRadius: "8px",
            fontSize: "0.6rem",
            fontFamily: "'Noto Serif Thai', serif",
          }}>
            3D Model Available
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          <h2 style={{
            fontFamily: "'Noto Serif Thai', serif",
            fontSize: "1.1rem",
            fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 8,
            lineHeight: 1.4
          }}>
            {product.name}
          </h2>
          <div style={{
            fontFamily: "monospace",
            fontSize: "1rem",
            color: "#C5A55A",
            marginBottom: 24
          }}>
            ฿{product.price.toLocaleString()}
          </div>

          <button
            onClick={() => setMode("ar")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px 20px",
              background: "linear-gradient(135deg, #C5A55A 0%, #D4BA7A 50%, #C5A55A 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              fontFamily: "'Noto Serif Thai', serif",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(197,165,90,0.25)",
              transition: "transform 0.2s"
            }}
          >
            <CameraAltRoundedIcon fontSize="small" />
            ทดลองสวมใส่ (AR Try-On)
          </button>
        </div>
      </div>
      
      <p style={{
        marginTop: 20,
        fontFamily: "'Noto Serif Thai', serif",
        fontSize: "0.75rem",
        color: "rgba(255,255,255,0.4)",
        textAlign: "center"
      }}>
        ฟรี 100% ไม่ต้องติดตั้งแอปเพิ่มเติม<br/>รองรับผ่านเบราว์เซอร์
      </p>
    </div>
  );
}
