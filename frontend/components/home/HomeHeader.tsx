"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomeHeader() {
  const { user, openAuthModal, logout } = useAuth();
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        pt: 3,
        pb: 0.5,
      }}
    >
      <Box sx={{ width: 60 }} />
      <Box sx={{ textAlign: "center", flex: 1 }}>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#1B2A4A",
            letterSpacing: 4,
            lineHeight: 1,
          }}
        >
          LAYA
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontSize: "0.5rem",
            color: "#C5A55A",
            letterSpacing: 2,
            fontStyle: "italic",
            mt: 0.2,
          }}
        >
          Every Pattern Tells a Story
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", justifyContent: "flex-end" }}>
        <IconButton size="small" sx={{ color: "#1B2A4A" }}>
          <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: '#C5A55A', color: 'white' } }}>
            <NotificationsNoneRoundedIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>
        <Link href="/cart" passHref>
          <IconButton size="small" sx={{ color: "#1B2A4A" }}>
            <Badge badgeContent={1} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: '#C5A55A', color: 'white' } }}>
              <ShoppingCartRoundedIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
        </Link>
      </Box>
    </Box>
  );
}
