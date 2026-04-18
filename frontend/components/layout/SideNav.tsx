"use client";

import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";

const navItems = [
  { label: "Home", icon: <HomeRoundedIcon />, path: "/" },
  { label: "Explore", icon: <ExploreRoundedIcon />, path: "/community" },
  { label: "Custom", icon: <StarRoundedIcon />, path: "/custom" },
  { label: "Map", icon: <MapRoundedIcon />, path: "/map" },
  { label: "Profile", icon: <PersonRoundedIcon />, path: "/profile" },
];

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = navItems.findIndex(
    (item) => item.path === pathname || pathname.startsWith(item.path + "/")
  );
  const value = currentIndex >= 0 ? currentIndex : 0;

  return (
    <Box
      sx={{
        width: 240,
        minHeight: "100vh",
        bgcolor: "#1B2A4A",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      {/* Logo */}
      <Box
        onClick={() => router.push("/")}
        sx={{
          p: 3,
          cursor: "pointer",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-playfair), "Playfair Display", serif',
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#C5A55A",
            letterSpacing: 2,
          }}
        >
          LAYA
        </Typography>
        <Typography
          sx={{
            fontFamily: 'var(--font-noto-serif-thai), "Noto Serif Thai", serif',
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 3,
            mt: 0.5,
          }}
        >
          THAI TEXTILES
        </Typography>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, py: 2 }}>
        {navItems.map((item, index) => {
          const isActive = value === index;

          return (
            <Box
              key={item.label}
              onClick={() => router.push(item.path)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 3,
                py: 1.5,
                mx: 2,
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s ease",
                bgcolor: isActive ? "rgba(197, 165, 90, 0.15)" : "transparent",
                "&:hover": {
                  bgcolor: isActive ? "rgba(197, 165, 90, 0.2)" : "rgba(255,255,255,0.05)",
                },
              }}
            >
              <Box
                sx={{
                  color: isActive ? "#C5A55A" : "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  "& .MuiSvgIcon-root": {
                    fontSize: 24,
                  },
                }}
              >
                {item.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: 'var(--font-noto-serif-thai), "Noto Serif Thai", serif',
                  fontSize: "0.95rem",
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 3,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-noto-serif-thai), "Noto Serif Thai", serif',
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
          }}
        >
          Every Pattern Tells a Story
        </Typography>
      </Box>
    </Box>
  );
}