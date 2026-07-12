"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { useImageUpload } from "@/hooks/useImageUpload";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';
const POLL_INTERVAL_MS = 4000;

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  readAt: string | null;
  createdAt: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
    reader.readAsDataURL(file);
  });
}

interface ChatThreadProps {
  conversationId: string;
  backHref: string;
  title: string;
  subtitle?: string;
}

export default function ChatThread({ conversationId, backHref, title, subtitle }: ChatThreadProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUpload = useImageUpload({
    bucket: "chat-attachments",
    folder: conversationId,
    onError: (msg) => setError(msg),
  });

  const fetchMessages = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/chat/conversations/${conversationId}/messages`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดข้อความไม่สำเร็จ");
      setMessages(data);
    } catch (err) {
      if (err instanceof SessionExpiredError) { setError("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"); return; }
      setError(err instanceof Error ? err.message : "โหลดข้อความไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    const id = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async (payload: { body?: string; attachmentUrl?: string; attachmentType?: string }) => {
    setSending(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/api/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ส่งข้อความไม่สำเร็จ");
      setMessages((prev) => [...prev, data]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งข้อความไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  };

  const handleSendText = () => {
    if (!text.trim() || sending) return;
    sendMessage({ body: text.trim() });
  };

  const handleImagePick = async (file: File) => {
    const result = await imageUpload.uploadFile(file);
    if (result) await sendMessage({ attachmentUrl: result.url, attachmentType: "image" });
  };

  const handleFilePick = async (file: File) => {
    setSending(true);
    setError("");
    try {
      const base64 = await fileToBase64(file);
      const res = await authFetch(`${API_BASE}/api/upload/file`, {
        method: "POST",
        body: JSON.stringify({ fileBase64: base64, filename: file.name, contentType: file.type || "application/octet-stream", folder: conversationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปโหลดไฟล์ไม่สำเร็จ");
      await sendMessage({ attachmentUrl: data.url, attachmentType: "file", body: file.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไฟล์ไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <IconButton component={Link} href={backHref} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: "#1B2A4A", fontSize: "1rem" }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#6B7280" }}>{subtitle}</Typography>}
        </Box>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 1.5, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>}

      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1, px: 0.5, pb: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} sx={{ color: "#C5A55A" }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, color: "#9CA3AF" }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem" }}>ยังไม่มีข้อความ — เริ่มทักทายกันเลย</Typography>
          </Box>
        ) : (
          messages.map((m) => {
            const isOwn = m.senderId === user?.id;
            return (
              <Box key={m.id} sx={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                <Box sx={{ maxWidth: "75%" }}>
                  <Box
                    sx={{
                      bgcolor: isOwn ? "#1B2A4A" : "#F0EBE3",
                      color: isOwn ? "#FFFFFF" : "#1B2A4A",
                      borderRadius: isOwn ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      px: 1.5, py: 1,
                    }}
                  >
                    {m.attachmentType === "image" && m.attachmentUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.attachmentUrl} alt="" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: m.body ? 6 : 0, display: "block" }} />
                    )}
                    {m.attachmentType === "file" && m.attachmentUrl && (
                      <Box component="a" href={m.attachmentUrl} target="_blank" rel="noopener noreferrer"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "inherit", textDecoration: "underline", mb: 0.5 }}>
                        <InsertDriveFileRoundedIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem" }}>{m.body || "ไฟล์แนบ"}</Typography>
                      </Box>
                    )}
                    {m.body && m.attachmentType !== "file" && (
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.88rem", whiteSpace: "pre-wrap" }}>{m.body}</Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.65rem", color: "#9CA3AF", mt: 0.3, textAlign: isOwn ? "right" : "left" }}>
                    {formatTime(m.createdAt)}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={bottomRef} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pt: 1, borderTop: "1px solid #E5DFD6" }}>
        <input ref={fileInputRef} type="file" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFilePick(f); e.target.value = ""; }}
        />
        <input type="file" accept="image/*" id="chat-image-input" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImagePick(f); e.target.value = ""; }}
        />
        <IconButton component="label" htmlFor="chat-image-input" disabled={sending || imageUpload.uploading} sx={{ color: "#6B7280" }}>
          {imageUpload.uploading ? <CircularProgress size={18} /> : <ImageRoundedIcon />}
        </IconButton>
        <IconButton onClick={() => fileInputRef.current?.click()} disabled={sending} sx={{ color: "#6B7280" }}>
          <AttachFileRoundedIcon />
        </IconButton>
        <TextField
          fullWidth size="small" placeholder="พิมพ์ข้อความ..." value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: "20px", fontFamily: FONT, "& fieldset": { borderColor: "#E5DFD6" }, "&.Mui-focused fieldset": { borderColor: "#C5A55A" } } }}
        />
        <IconButton onClick={handleSendText} disabled={!text.trim() || sending}
          sx={{ bgcolor: "#1B2A4A", color: "#FFFFFF", "&:hover": { bgcolor: "#0F1A30" }, "&.Mui-disabled": { bgcolor: "#E5DFD6", color: "#9CA3AF" } }}>
          {sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>
    </Box>
  );
}
