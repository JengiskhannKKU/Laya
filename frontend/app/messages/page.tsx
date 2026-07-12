"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

interface Conversation {
  id: string;
  otherName: string | null;
  otherAvatar: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

function formatThaiDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/api/chat/conversations`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "โหลดข้อความไม่สำเร็จ");
        if (!cancelled) setConversations(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดข้อความไม่สำเร็จ"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <MobileLayout>
      <Box sx={{ px: 2, pt: 3, pb: 3 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            bgcolor: "#FFFFFF", borderRadius: 4, border: "1px solid #E5DFD6",
            px: 2, py: 1.8, mb: 2,
            background: "linear-gradient(135deg, #FFFFFF 0%, rgba(197,165,90,0.06) 100%)",
          }}
        >
          <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <ChatBubbleOutlineRoundedIcon sx={{ color: "#C5A55A" }} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.15rem", color: "#1B2A4A" }}>
            ข้อความ
          </Typography>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>}

        {loading ? (
          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: 4, border: "1px solid #E5DFD6", display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={28} sx={{ color: "#C5A55A" }} />
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ bgcolor: "#FFFFFF", borderRadius: 4, border: "1px solid #E5DFD6", textAlign: "center", py: 10 }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 56, color: "#E5DFD6", mb: 2 }} />
            <Typography sx={{ fontFamily: FONT, color: "#9CA3AF" }}>ยังไม่มีบทสนทนา</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {conversations.map((c, i) => (
              <Card key={c.id} component={motion.div}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                sx={{
                  display: "flex", gap: 1.5, p: 1.5, border: "1px solid #E5DFD6", borderRadius: "14px",
                  boxShadow: "none", alignItems: "center",
                  "&:hover": { borderColor: "#C5A55A", boxShadow: "0 2px 10px rgba(197,165,90,0.12)" },
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              >
                <Box component={Link} href={`/messages/${c.id}`} sx={{ display: "flex", gap: 1.5, alignItems: "center", flex: 1, minWidth: 0, textDecoration: "none" }}>
                  <Avatar src={c.otherAvatar ?? undefined} sx={{ bgcolor: "#1B2A4A", width: 44, height: 44 }}>
                    <StoreRoundedIcon />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 600, color: "#1B2A4A", fontSize: "0.9rem" }}>
                      {c.otherName ?? "ร้านค้า"}
                    </Typography>
                    <Typography noWrap sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#6B7280" }}>
                      {c.lastMessageBody ?? "ยังไม่มีข้อความ"}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    {c.lastMessageAt && (
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", color: "#9CA3AF" }}>
                        {formatThaiDate(c.lastMessageAt)}
                      </Typography>
                    )}
                    {c.unreadCount > 0 && (
                      <Box sx={{ mt: 0.5, display: "inline-block", bgcolor: "#C5A55A", color: "#FFFFFF", borderRadius: "10px", px: 0.8, fontSize: "0.68rem", fontWeight: 700 }}>
                        {c.unreadCount}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </MobileLayout>
  );
}
