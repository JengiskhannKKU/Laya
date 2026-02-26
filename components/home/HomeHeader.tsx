"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { motion } from "framer-motion";

export default function HomeHeader() {
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
      <Box sx={{ width: 40 }} />
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: '"Playfair Display", "Noto Serif Thai", serif',
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
            fontFamily: '"Playfair Display", "Noto Serif Thai", serif',
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
      <Badge
        variant="dot"
        sx={{
          "& .MuiBadge-badge": {
            bgcolor: "#C5A55A",
            width: 8,
            height: 8,
            minWidth: 8,
          },
        }}
      >
        <IconButton
          sx={{
            border: "1.5px solid #E5DFD6",
            width: 38,
            height: 38,
            bgcolor: "#FFFFFF",
          }}
        >
          <NotificationsNoneRoundedIcon
            sx={{ color: "#1B2A4A", fontSize: 18 }}
          />
        </IconButton>
      </Badge>
    </Box>
  );
}
