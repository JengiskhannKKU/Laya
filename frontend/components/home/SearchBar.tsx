"use client";

import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import IconButton from "@mui/material/IconButton";
import { motion } from "framer-motion";

export default function SearchBar() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      sx={{ px: 2.5, py: 1 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "#FFFFFF",
          borderRadius: "999px",
          border: "1.5px solid #E5DFD6",
          px: 1.5,
          py: 0.3,
          gap: 0.5,
          boxShadow: "0 2px 6px rgba(27,42,74,0.05)",
          transition: "box-shadow 0.3s, border-color 0.3s",
          "&:focus-within": {
            borderColor: "#C5A55A",
            boxShadow: "0 0 0 3px rgba(197,165,90,0.35)",
          },
        }}
      >
        <SearchRoundedIcon sx={{ color: "#A89F94", fontSize: 20, ml: 0.5 }} />
        <InputBase
          placeholder="ค้นหาผ้าไทย ชุมชน ลวดลาย…"
          sx={{
            flex: 1,
            fontFamily: '"Kanit", sans-serif',
            fontSize: "0.85rem",
            color: "#1B2A4A",
            py: 0.8,
            "& ::placeholder": {
              color: "#A89F94",
              opacity: 1,
            },
          }}
        />
        <IconButton
          size="small"
          sx={{
            bgcolor: "#F0EBE3",
            width: 32,
            height: 32,
            borderRadius: "999px",
          }}
        >
          <TuneRoundedIcon sx={{ fontSize: 16, color: "#1B2A4A" }} />
        </IconButton>
      </Box>
    </Box>
  );
}
