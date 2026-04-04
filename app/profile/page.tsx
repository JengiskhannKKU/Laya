"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import Link from "next/link";

const menuItems = [
  {
    icon: <ShoppingBagRoundedIcon sx={{ fontSize: 20 }} />,
    label: "Order",
    href: "/orders",
  },
  {
    icon: <FavoriteBorderRoundedIcon sx={{ fontSize: 20 }} />,
    label: "รายการโปรด",
    subtitle: "3 รายการ",
    href: "/explore",
  },
  {
    icon: <DescriptionRoundedIcon sx={{ fontSize: 20 }} />,
    label: "Digital Textile Passport",
    subtitle: "2 ใบรับรอง",
    href: "/passports",
  },
  {
    icon: <SettingsRoundedIcon sx={{ fontSize: 20 }} />,
    label: "ตั้งค่า",
    subtitle: "",
    href: "",
  },
  {
    icon: <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />,
    label: "ช่วยเหลือ",
    subtitle: "",
    href: "",
  },
];

export default function ProfilePage() {
  return (
    <MobileLayout>
      <Box sx={{ px: 2, pt: 4, pb: 2 }}>
        {/* Profile Card */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 4,
            p: 3,
            mb: 3,
            border: "1px solid #E5DFD6",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#1B2A4A",
              fontFamily: '"Playfair Display", serif',
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            S
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#1B2A4A",
                }}
              >
                {"สมชาย มั่นคง"}
              </Typography>
              <VerifiedRoundedIcon
                sx={{ fontSize: 16, color: "#C5A55A" }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Noto Serif Thai", serif',
                fontSize: "0.8rem",
                color: "#6B7280",
              }}
            >
              {"สมาชิกตั้งแต่ ม.ค. 2567"}
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1.5,
            mb: 3,
          }}
        >
          {[
            { value: "5", label: "คำสั่งซื้อ" },
            { value: "2", label: "ใบรับรอง" },
            { value: "3", label: "รายการโปรด" },
          ].map((stat, i) => (
            <Box
              key={stat.label}
              component={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: 3,
                p: 2,
                textAlign: "center",
                border: "1px solid #E5DFD6",
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  color: "#C5A55A",
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontSize: "0.7rem",
                  color: "#6B7280",
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Menu Items */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            border: "1px solid #E5DFD6",
            overflow: "hidden",
            mb: 3,
          }}
        >
          {menuItems.map((item, index) => {
            const menuContent = (
              <Box key={item.label}>
                <Box
                  component={motion.div}
                  whileTap={{ bgcolor: "rgba(0,0,0,0.02)" }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.8,
                    cursor: "pointer",
                  }}
                >
                  <Box sx={{ color: "#1B2A4A" }}>{item.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Noto Serif Thai", serif',
                        fontSize: "0.9rem",
                        color: "#1B2A4A",
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </Typography>
                    {item.subtitle && (
                      <Typography
                        sx={{
                          fontFamily: '"Noto Serif Thai", serif',
                          fontSize: "0.7rem",
                          color: "#9CA3AF",
                        }}
                      >
                        {item.subtitle}
                      </Typography>
                    )}
                  </Box>
                  <ChevronRightRoundedIcon
                    sx={{ color: "#D1D5DB", fontSize: 20 }}
                  />
                </Box>
                {index < menuItems.length - 1 && (
                  <Divider sx={{ borderColor: "#F0EBE3", mx: 2 }} />
                )}
              </Box>
            );

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
                  {menuContent}
                </Link>
              );
            }
            return menuContent;
          })}
        </Box>

        {/* Logout */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1.5,
            cursor: "pointer",
          }}
        >
          <LogoutRoundedIcon sx={{ fontSize: 18, color: "#EF4444" }} />
          <Typography
            sx={{
              fontFamily: '"Noto Serif Thai", serif',
              fontSize: "0.9rem",
              color: "#EF4444",
              fontWeight: 500,
            }}
          >
            {"ออกจากระบบ"}
          </Typography>
        </Box>
      </Box>
    </MobileLayout>
  );
}
