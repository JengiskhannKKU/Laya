"use client";

import { useState } from "react";
import { Box, Typography, Avatar, TextField, Button, Divider } from "@mui/material";
import { motion } from "framer-motion";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { type CustomPatternData } from "@/lib/custom-order-config";
import type { ShopMatch } from "./types";
import { useAuth } from "@/lib/auth-context";

interface OrderConfirmationViewProps {
  patternData: CustomPatternData;
  selectedWeaver: ShopMatch;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export default function OrderConfirmationView({ patternData, selectedWeaver, onConfirm, onCancel }: OrderConfirmationViewProps) {
  const { user, openAuthModal } = useAuth();
  const [note, setNote] = useState("");

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      sx={{ p: 2, pb: 12 }}
    >
      <Typography sx={{ fontSize: "0.85rem", color: "#6B7280", mb: 2, textAlign: "center" }}>
        กรุณาตรวจสอบก่อนส่งคำขอ
      </Typography>

      {/* 1. Pattern Details Box */}
      <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "20px", p: 2.5, border: "1px solid #E5DFD6", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box sx={{ width: 4, height: 16, bgcolor: "#C5A55A", borderRadius: 1 }} />
          <Typography sx={{ fontWeight: 700, color: "#1B2A4A" }}>ลายที่ต้องการ</Typography>
        </Box>

        {[
          { label: "ลาย", value: (patternData.selectedPatterns ?? []).join(" + ") || "—" },
          { label: "เทคนิค", value: patternData.weaveType || "—" },
          { label: "การย้อม", value: patternData.dyeType === "natural" ? "สีธรรมชาติ" : patternData.dyeType === "chemical" ? "สีเคมี" : "—" },
          { label: "สีด้าย", value: (patternData.colors || []).join(" + ") || "—" },
          { label: "ภูมิภาค", value: patternData.region || "—" },
        ].map((item, idx) => (
          <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
            <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>{item.label}</Typography>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1B2A4A", textAlign: "right", maxWidth: "60%" }}>{item.value}</Typography>
          </Box>
        ))}
      </Box>

      {/* 2. Selected Weaver Card */}
      <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "20px", p: 2, border: "1px solid #E5DFD6", mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Avatar src={selectedWeaver.profileImageUrl ?? undefined} sx={{ bgcolor: "#1B2A4A", fontWeight: 700 }}>
            {selectedWeaver.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#1B2A4A", fontSize: "0.95rem" }}>{selectedWeaver.name}</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{selectedWeaver.province ?? "ไม่ระบุจังหวัด"}</Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#C5A55A" }}>
          ★ {selectedWeaver.rating.toFixed(1)}
        </Typography>
      </Box>

      {/* 3. Note Field */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1B2A4A", mb: 1 }}>โน๊ตถึงช่าง:</Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="เช่น ฝากแนะนำสีด้ายเพิ่มเติม หรือต้องการลายหนาแน่นเป็นพิเศษ"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{
            bgcolor: "#FFFFFF",
            "& .MuiOutlinedInput-root": {
              borderRadius: "16px",
              fontFamily: '"Kanit", sans-serif',
              fontSize: "0.85rem",
              "& fieldset": { borderColor: "#E5DFD6" },
              "&.Mui-focused fieldset": { borderColor: "#1B2A4A" }
            }
          }}
        />
      </Box>

      {/* 4. Disclaimer */}
      <Box sx={{ bgcolor: "rgba(197, 165, 90, 0.1)", p: 2, borderRadius: "16px", border: "1px solid rgba(197, 165, 90, 0.3)", mb: 4, display: "flex", gap: 1.5 }}>
        <InfoRoundedIcon sx={{ color: "#C5A55A", fontSize: "1.2rem", mt: 0.2 }} />
        <Typography sx={{ fontSize: "0.75rem", color: "#8E601C", lineHeight: 1.5 }}>
          <Box component="span" sx={{ fontWeight: 700 }}>ยังไม่มีการชำระเงิน</Box> — แอดมินจะติดต่อช่างและยืนยันความเป็นไปได้ก่อน จากนั้นจะแจ้งยอดและเงื่อนไขให้ทราบภายใน <Box component="span" sx={{ fontWeight: 700 }}>1-2 วันทำการ</Box>
        </Typography>
      </Box>

      {/* 5. Buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Button 
          fullWidth 
          variant="contained" 
          onClick={() => {
            if (!user) {
              openAuthModal();
            } else {
              onConfirm(note);
            }
          }}
          sx={{ py: 2, borderRadius: "16px", bgcolor: "#1B2A4A", fontWeight: 700, textTransform: "none" }}
        >
          ส่งคำขอทอผ้า ›
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          onClick={onCancel}
          sx={{ py: 1, color: "#6B7280", textTransform: "none" }}
        >
          ยกเลิก / เลือกช่างใหม่
        </Button>
      </Box>
    </Box>
  );
}
