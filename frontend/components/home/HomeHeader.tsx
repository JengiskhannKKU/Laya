"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { useAuth } from "@/lib/auth-context";
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
      {/* Left spacer */}
      <Box sx={{ width: 60 }} />

      {/* Centered wordmark */}
      <Box sx={{ textAlign: "center", flex: 1 }}>
        <Typography
          sx={{
            fontFamily: '"Kanit", sans-serif',
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#1B2A4A",
            letterSpacing: "0.12em",
            lineHeight: 1,
          }}
        >
          LAYA
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", var(--font-cormorant), Georgia, serif',
            fontSize: "0.625rem",
            color: "#B8954A",
            letterSpacing: "0.14em",
            fontStyle: "italic",
            mt: 0.2,
          }}
        >
          Every Pattern Tells a Story
        </Typography>
      </Box>

      {/* Right icons */}
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          alignItems: "center",
          justifyContent: "flex-end",
          width: 60,
        }}
      >
        <IconButton size="small" sx={{ color: "#1B2A4A" }}>
          <Badge
            badgeContent={2}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#C5A55A",
                color: "#FFFFFF",
                fontSize: "0.55rem",
                minWidth: 16,
                height: 16,
              },
            }}
          >
            <NotificationsNoneRoundedIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>
        <Link href="/cart" passHref>
          <IconButton size="small" sx={{ color: "#1B2A4A" }}>
            <Badge
              badgeContent={1}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#C5A55A",
                  color: "#FFFFFF",
                  fontSize: "0.55rem",
                  minWidth: 16,
                  height: 16,
                },
              }}
            >
              <ShoppingCartRoundedIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
        </Link>
      </Box>
    </Box>
  );
}
