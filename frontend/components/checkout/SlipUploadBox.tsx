"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useImageUpload } from "@/hooks/useImageUpload";

const FONT = '"Kanit", sans-serif';

interface SlipUploadBoxProps {
  paymentId: string;
  slipUrl?: string;
  onUploaded: (slipUrl: string) => void;
  onError?: (msg: string) => void;
}

/** กล่องแนบสลิปการโอนเงินต่อร้าน (อัปโหลดขึ้น bucket payment-slips) */
export default function SlipUploadBox({ paymentId, slipUrl, onUploaded, onError }: SlipUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { uploadFile, uploading } = useImageUpload({
    bucket: "payment-slips",
    folder: paymentId,
    onSuccess: (result) => onUploaded(result.url),
    onError: (msg) => onError?.(msg),
  });

  const pick = (files: FileList | File[]) => {
    const f = Array.from(files)[0];
    if (f) uploadFile(f);
  };

  if (slipUrl) {
    return (
      <Box sx={{ width: "100%", mt: 1.5, p: 1.5, borderRadius: "12px", border: "1px solid #C8E6C9", bgcolor: "#F1F8F2", display: "flex", alignItems: "center", gap: 1 }}>
        <CheckCircleRoundedIcon sx={{ color: "#2E7D32", fontSize: 20 }} />
        <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#2E7D32", flex: 1 }}>แนบสลิปแล้ว</Typography>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={slipUrl} alt="slip" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
        <IconButton size="small" onClick={() => onUploaded("")} sx={{ color: "#9CA3AF" }}>
          <CloseRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) pick(e.dataTransfer.files); }}
      sx={{
        width: "100%", mt: 1.5, py: 2, borderRadius: "12px", textAlign: "center", cursor: "pointer",
        border: "1.5px dashed", borderColor: dragOver ? "#C5A55A" : "#E5DFD6",
        bgcolor: dragOver ? "rgba(197,165,90,0.06)" : "#FFFFFF", transition: "all 0.15s",
      }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.length) pick(e.target.files); e.target.value = ""; }}
      />
      {uploading ? (
        <CircularProgress size={20} sx={{ color: "#C5A55A" }} />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.4 }}>
          <ReceiptLongRoundedIcon sx={{ color: "#9CA3AF", fontSize: 22 }} />
          <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#6B7280" }}>แนบสลิปการโอนเงิน</Typography>
        </Box>
      )}
    </Box>
  );
}
