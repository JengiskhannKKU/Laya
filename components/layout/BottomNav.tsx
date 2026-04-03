"use client";

import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { motion } from "framer-motion";

const navItems = [
  { label: "Home", icon: <HomeRoundedIcon />, path: "/" },
  { label: "Explore", icon: <ExploreRoundedIcon />, path: "/explore" },
  { label: "Custom", icon: <StarRoundedIcon />, path: "/custom" },
  { label: "Orders", icon: <LocalShippingRoundedIcon />, path: "/orders" },
  { label: "Profile", icon: <PersonRoundedIcon />, path: "/profile" },
  { label: "Try-On", icon: <CameraAltRoundedIcon />, path: "/tryon" },
];


export default function AppBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = navItems.findIndex(
    (item) => item.path === pathname || pathname.startsWith(item.path + "/")
  );
  const value = currentIndex >= 0 ? currentIndex : 0;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        maxWidth: 430,
        mx: "auto",
        width: "100%",
      }}
    >
      {/* Floating Custom button */}
      <Box
        sx={{
          position: "absolute",
          top: -24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <Box
          component={motion.div}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/custom")}
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background:
              value === 2
                ? "linear-gradient(145deg, #C5A55A 0%, #D4BA7A 50%, #C5A55A 100%)"
                : "linear-gradient(145deg, #C5A55A 0%, #D4BA7A 50%, #C5A55A 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 4px 14px rgba(197,165,90,0.4), 0 2px 6px rgba(0,0,0,0.15)",
            cursor: "pointer",
            border: "3px solid #FAF6F0",
          }}
        >
          <StarRoundedIcon sx={{ fontSize: 28, color: "#FFFFFF" }} />
        </Box>
      </Box>

      {/* Nav bar */}
      <Box
        sx={{
          bgcolor: "#1B2A4A",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          px: 1,
          pt: 1.2,
          pb: 2,
          height: 72,
        }}
      >
        {navItems.map((item, index) => {
          const isActive = value === index;
          const isCenter = index === 2;

          if (isCenter) {
            return (
              <Box
                key={item.label}
                onClick={() => router.push(item.path)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: 64,
                  cursor: "pointer",
                  pt: 2.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Noto Serif Thai", serif',
                    fontSize: "0.6rem",
                    color: isActive ? "#C5A55A" : "rgba(255,255,255,0.6)",
                    fontWeight: isActive ? 600 : 400,
                    mt: 0.5,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          }

          return (
            <Box
              key={item.label}
              component={motion.div}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(item.path)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: 0.3,
                width: 64,
                py: 0.5,
              }}
            >
              <Box
                sx={{
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& .MuiSvgIcon-root": {
                    fontSize: 22,
                  },
                }}
              >
                {item.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Noto Serif Thai", serif',
                  fontSize: "0.6rem",
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
