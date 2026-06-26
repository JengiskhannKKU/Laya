"use client";

import { useState, useEffect, use } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";

import MobileLayout from "@/components/layout/MobileLayout";
import { weavers, products, Weaver, Product } from "@/lib/mock-data";

export default function WeaverProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weaver, setWeaver] = useState<Weaver | null>(null);
  const [weaverProducts, setWeaverProducts] = useState<Product[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const found = weavers.find((w) => w.id === id);
      setWeaver(found || null);
      if (found) {
        // Get products from the same community
        const prods = products.filter((p) => p.community === found.community).slice(0, 6);
        setWeaverProducts(prods);
      }
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <MobileLayout>
        <Box sx={{ px: 2, pt: 4, pb: 10 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mx: "auto", mb: 2 }} />
          <Skeleton variant="text" height={30} sx={{ mx: "auto", width: 200 }} />
          <Skeleton variant="text" height={20} sx={{ mx: "auto", width: 150, mb: 3 }} />
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: "16px" }} />
        </Box>
      </MobileLayout>
    );
  }

  if (!weaver) {
    return (
      <MobileLayout>
        <Box sx={{ px: 2, pt: 4, textAlign: "center" }}>
          <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.1rem", color: "#1B2A4A", mt: 10 }}>
            ไม่พบข้อมูลช่างทอ
          </Typography>
          <Button onClick={() => router.back()} sx={{ mt: 2 }}>กลับ</Button>
        </Box>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <Box sx={{ flex: 1, bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ px: 2, pt: 4, pb: 2, display: "flex", alignItems: "center", bgcolor: "#FFFFFF", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #E5DFD6" }}>
          <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ flex: 1, textAlign: "center", fontFamily: '"Kanit", sans-serif', fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A", mr: 4 }}>
            ช่างทอ
          </Typography>
        </Box>

        {/* Profile Section */}
        <Box sx={{ px: 2, pt: 3, pb: 2 }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              bgcolor: "#FFFFFF", borderRadius: "20px", p: 3, textAlign: "center",
              border: "1px solid #E5DFD6", boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <Avatar
              src={weaver.avatar && weaver.avatar.startsWith("http") ? weaver.avatar : undefined}
              sx={{ width: 80, height: 80, mx: "auto", mb: 2, bgcolor: "#1B2A4A", fontSize: "2rem", fontWeight: 700, fontFamily: '"Kanit", sans-serif' }}
            >
              {weaver.avatar && !weaver.avatar.startsWith("http") ? weaver.avatar : weaver.name[0]}
            </Avatar>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "1.2rem", color: "#1B2A4A" }}>
                {weaver.name}
              </Typography>
              {weaver.isGI && <VerifiedRoundedIcon sx={{ fontSize: 18, color: "#C5A55A" }} />}
            </Box>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280", mb: 2 }}>
              {weaver.community} • {weaver.province}
            </Typography>

            {/* Stats */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, mb: 2.5 }}>
              <Box sx={{ bgcolor: "#FAF6F0", borderRadius: "12px", p: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3 }}>
                  <StarRoundedIcon sx={{ fontSize: 16, color: "#C5A55A" }} />
                  <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A" }}>{weaver.rating}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.65rem", color: "#6B7280" }}>Rating</Typography>
              </Box>
              <Box sx={{ bgcolor: "#FAF6F0", borderRadius: "12px", p: 1.5 }}>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A" }}>{weaver.reviewCount}</Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "#6B7280" }}>รีวิว</Typography>
              </Box>
              <Box sx={{ bgcolor: "#FAF6F0", borderRadius: "12px", p: 1.5 }}>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#1B2A4A" }}>{weaver.experienceYears}</Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "#6B7280" }}>ปีประสบการณ์</Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                fullWidth
                variant={isFollowing ? "outlined" : "contained"}
                startIcon={<PersonAddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => {
                  setIsFollowing(!isFollowing);
                  setToastMsg(isFollowing ? "ยกเลิกติดตามแล้ว" : "ติดตามช่างทอแล้ว!");
                }}
                sx={{
                  py: 1.2, borderRadius: "12px", fontWeight: 700, fontFamily: '"Kanit", sans-serif',
                  textTransform: "none",
                  ...(isFollowing
                    ? { borderColor: "#E5DFD6", color: "#6B7280" }
                    : { bgcolor: "#1B2A4A", color: "#FFFFFF", "&:hover": { bgcolor: "#0F1A30" } }),
                }}
              >
                {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setToastMsg("ฟีเจอร์แชทกำลังพัฒนา")}
                sx={{
                  py: 1.2, borderRadius: "12px", fontWeight: 700, fontFamily: '"Kanit", sans-serif',
                  textTransform: "none", borderColor: "#C5A55A", color: "#C5A55A",
                  "&:hover": { bgcolor: "rgba(197,165,90,0.05)" },
                }}
              >
                ส่งข้อความ
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Detail Sections */}
        <Box sx={{ px: 2, pb: 10 }}>
          {/* Techniques */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2.5, mb: 2, border: "1px solid #E5DFD6" }}
          >
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 1.5 }}>
              เทคนิคที่ถนัด
            </Typography>
            <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
              {weaver.techniques.map((t) => (
                <Chip key={t} label={t} sx={{ bgcolor: "#FDF8F0", color: "#8E601C", fontWeight: 600, fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem" }} />
              ))}
            </Box>
          </Box>

          {/* Info */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2.5, mb: 2, border: "1px solid #E5DFD6" }}
          >
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 1.5 }}>
              ข้อมูลช่างทอ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <LocationOnRoundedIcon sx={{ fontSize: 18, color: "#C5A55A" }} />
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>
                  {weaver.location || `${weaver.community}, จ.${weaver.province}`}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 18, color: "#C5A55A" }} />
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>
                  ระยะเวลาผลิต: {weaver.leadTimeDays} วัน
                </Typography>
              </Box>
              {weaver.specialty && (
                <>
                  <Divider sx={{ borderColor: "#F0EBE3" }} />
                  <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>
                    ความเชี่ยวชาญ: {weaver.specialty}
                  </Typography>
                </>
              )}
              {weaver.experience && (
                <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.85rem", color: "#6B7280" }}>
                  ประสบการณ์: {weaver.experience}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Recent Works */}
          {weaver.recentWorks.length > 0 && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2.5, mb: 2, border: "1px solid #E5DFD6" }}
            >
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 1.5 }}>
                ผลงานล่าสุด
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {weaver.recentWorks.map((url, i) => (
                  <Box key={i} sx={{ height: 120, borderRadius: "12px", overflow: "hidden", position: "relative" }}>
                    <Image src={url} alt={`Work ${i + 1}`} fill style={{ objectFit: "cover" }} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Products from this Weaver */}
          {weaverProducts.length > 0 && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              sx={{ bgcolor: "#FFFFFF", borderRadius: "16px", p: 2.5, border: "1px solid #E5DFD6" }}
            >
              <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#1B2A4A", mb: 1.5 }}>
                สินค้าจากช่างทอ
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 1, "&::-webkit-scrollbar": { display: "none" } }}>
                {weaverProducts.map((p) => (
                  <Box
                    key={p.id}
                    onClick={() => router.push(`/product/${p.id}`)}
                    sx={{
                      minWidth: 140, borderRadius: "12px", overflow: "hidden", cursor: "pointer",
                      border: "1px solid #E5DFD6", flexShrink: 0,
                    }}
                  >
                    <Box sx={{ height: 100, position: "relative" }}>
                      <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ p: 1 }}>
                      <Typography noWrap sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.75rem", fontWeight: 600, color: "#1B2A4A" }}>
                        {p.name}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: "0.8rem", fontWeight: 700, color: "#C5A55A" }}>
                        ฿{p.price.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={!!toastMsg}
          autoHideDuration={3000}
          onClose={() => setToastMsg("")}
          message={toastMsg}
          sx={{ bottom: { xs: 80, sm: 24 } }}
        />
      </Box>
    </MobileLayout>
  );
}
