"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import Image from "next/image";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { products, communities } from "@/lib/mock-data";

// Generate mock feed posts using existing images
const generateMockPosts = () => {
  return [
    {
      id: "post1",
      authorName: "ชุมชนหริภุญชัย",
      authorAvatar: communities[0]?.image || "",
      timeAgo: "2 ชม. ที่แล้ว",
      text: "ลายใหม่ล่าสุดเพิ่งลงจากกี่ ทอด้วยเทคนิคยกดอกพิเศษ สีไม่ตก สนใจทักได้เลยจ้าว",
      imageUrl: products[0]?.images[0] || "/placeholder.jpg",
      likes: 124,
      comments: 18,
      height: 250, // For masonry staggered effect
    },
    {
      id: "post2",
      authorName: "พิมพ์พรรณ ไหมไทย",
      authorAvatar: "",
      timeAgo: "5 ชม. ที่แล้ว",
      text: "นำผ้าฝ้ายจากแพร่มาตัดชุดใส่ทำงาน ผ้าเนื้อนิ่มใส่สบายมากค่ะ ❤️",
      imageUrl: products[1]?.images[0] || "/placeholder.jpg",
      likes: 342,
      comments: 45,
      height: 320,
    },
    {
      id: "post3",
      authorName: "ดวงเดือน ทอมือ",
      authorAvatar: "",
      timeAgo: "1 วันที่แล้ว",
      text: "ขอบคุณรีวิวสวยๆ จากลูกค้าที่น่ารักนะคะ ผ้าไหมมัดหมี่หน้านี้เส้นละเอียดมาก",
      imageUrl: products[2]?.images[0] || "/placeholder.jpg",
      likes: 89,
      comments: 5,
      height: 200,
    },
    {
      id: "post4",
      authorName: "บ้านดอนข่า",
      authorAvatar: communities[1]?.image || "",
      timeAgo: "1 วันที่แล้ว",
      text: "ลายต้นสนสีธรรมชาติ ย้อมเปลือกไม้ ออร์แกนิค 100%",
      imageUrl: products[3]?.images[0] || "/placeholder.jpg",
      likes: 210,
      comments: 24,
      height: 280,
    },
    {
      id: "post5",
      authorName: "วิถีผ้าไทย",
      authorAvatar: "",
      timeAgo: "2 วันที่แล้ว",
      text: "คอลเล็กชั่นใหม่กำลังจะเปิดตัวเร็วๆ นี้ เตรียมตัวให้พร้อม!",
      imageUrl: products[4]?.images[0] || "/placeholder.jpg",
      likes: 560,
      comments: 120,
      height: 220,
    },
    {
      id: "post6",
      authorName: "ป้าศรี ผ้าทอ",
      authorAvatar: "",
      timeAgo: "3 วันที่แล้ว",
      text: "รับทอตามสั่งนะคะ ช่วงนี้คิวว่าง 2 คิวค่ะ",
      imageUrl: products[5]?.images[0] || "/placeholder.jpg",
      likes: 45,
      comments: 8,
      height: 260,
    },
  ];
};

const feedPosts = generateMockPosts();
const tabs = ["ล่าสุด", "ยอดนิยม", "ชุมชน", "รีวิว"];

export default function CommunityFeedPage() {
  const [activeTab, setActiveTab] = useState(0);

  // Divide into two columns for masonry UI
  const leftCol = feedPosts.filter((_, i) => i % 2 === 0);
  const rightCol = feedPosts.filter((_, i) => i % 2 !== 0);

  const renderPostCard = (post: typeof feedPosts[0], index: number) => (
    <Box
      key={post.id}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(27,42,74,0.05)",
        mb: 2, // Equivalent to gap
        breakInside: "avoid",
      }}
    >
      <Box sx={{ position: "relative", width: "100%", height: post.height }}>
        <Image
          src={post.imageUrl}
          alt="Post Image"
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 600px) 50vw, 33vw"
        />
        {/* Overlay for author details like Pinterest */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
            p: 1.5,
            pt: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={post.authorAvatar}
              sx={{ width: 24, height: 24, fontSize: "0.7rem", bgcolor: "#C5A55A", border: "1px solid #FFF" }}
            >
              {post.authorName.charAt(0)}
            </Avatar>
            <Box>
              <Typography sx={{ color: "#FFFFFF", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.1 }}>
                {post.authorName}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.55rem" }}>
                {post.timeAgo}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Post Text & Actions */}
      <Box sx={{ p: 1.5 }}>
        <Typography
          sx={{
            fontFamily: '"Noto Serif Thai", serif',
            fontSize: "0.75rem",
            color: "#1B2A4A",
            lineHeight: 1.4,
            mb: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.text}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#6B7280" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <FavoriteBorderRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: "0.65rem" }}>{post.likes}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: "0.65rem" }}>{post.comments}</Typography>
            </Box>
          </Box>
          <IconButton size="small" sx={{ p: 0.5 }}>
            <ShareRoundedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <MobileLayout>
      <Box sx={{ pt: 3, pb: 2, bgcolor: "#FAF6F0", minHeight: "100vh" }}>
        
        {/* Header */}
        <Box sx={{ px: 2.5, mb: 2 }}>
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontWeight: 700,
              fontSize: "1.4rem",
              color: "#1B2A4A",
            }}
          >
            ชุมชนคนรักผ้าไทย
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>
            ร่วมแชร์เรื่องราวและค้นหาแรงบันดาลใจใหม่ๆ
          </Typography>
        </Box>

        {/* Create Post Input */}
        <Box sx={{ px: 2.5, mb: 2 }}>
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "16px",
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              boxShadow: "0 2px 12px rgba(27,42,74,0.03)",
              border: "1px solid rgba(0,0,0,0.04)"
            }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#1B2A4A" }}>ย</Avatar>
            <InputBase
              placeholder="แชร์เรื่องราวเกี่ยวกับผ้าของคุณวันนี้..."
              sx={{ flex: 1, fontSize: "0.85rem", fontFamily: '"Noto Serif Thai", serif' }}
            />
            <IconButton size="small" sx={{ color: "#4CAF50", bgcolor: "rgba(76, 175, 80, 0.1)" }}>
              <ImageOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Categories/Tabs */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            px: 2.5,
            mb: 3,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {tabs.map((tab, i) => (
            <Box
              key={tab}
              onClick={() => setActiveTab(i)}
              sx={{
                px: 2,
                py: 0.8,
                borderRadius: "20px",
                bgcolor: activeTab === i ? "#1B2A4A" : "transparent",
                color: activeTab === i ? "#FFFFFF" : "#6B7280",
                fontWeight: activeTab === i ? 600 : 400,
                fontSize: "0.8rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                border: activeTab === i ? "none" : "1px solid #E5DFD6",
                transition: "all 0.2s",
              }}
            >
              {tab}
            </Box>
          ))}
        </Box>

        {/* 2-Column Feed Layout (Masonry style with Grid) */}
        <Box
          sx={{
            px: 2,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            alignItems: "start", // Important for masonry look when columns have different heights
          }}
        >
          {/* Left Column */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {leftCol.map((post, index) => renderPostCard(post, index))}
          </Box>
          
          {/* Right Column */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {rightCol.map((post, index) => renderPostCard(post, index))}
          </Box>
        </Box>

      </Box>
    </MobileLayout>
  );
}
