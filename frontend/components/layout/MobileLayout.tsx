"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import AppTopNav from "@/components/layout/TopNav";
import AppBottomNav from "@/components/layout/BottomNav";
import AppFooter from "@/components/layout/Footer";

/** BottomNav (แถบนำทางหลัก) โชว์เฉพาะหน้าเหล่านี้ — หน้าอื่นมักมี action bar เฉพาะของตัวเองอยู่แล้ว
 * (เช่น product detail, cart, checkout) การมีสองแถบซ้อนกันที่ขอบล่างทำให้ดูรก/บังกัน */
const BOTTOM_NAV_ROUTES = ["/", "/community", "/category", "/profile"];

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const pathname = usePathname();
  const isMobileMQ = useMediaQuery(theme.breakpoints.down("md"));
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isMobile = !mounted || isMobileMQ;
  const showBottomNav = BOTTOM_NAV_ROUTES.includes(pathname);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAF6F0", overflowX: "hidden" }}>
      {/* Top Nav — always visible */}
      <AppTopNav />
      {/* Centered content container */}
      <Box
        component="main"
        sx={{
          maxWidth: 1440,
          width: "100%",
          mx: "auto",
          px: { xs: 2.5, sm: 3, md: 5 },
          pb: isMobile ? "96px" : "64px",
        }}
      >
        {children}
      </Box>
      {/* Site Footer — ซ่อนบนมือถือให้รู้สึกเหมือนแอป ไม่ใช่เว็บ */}
      {!isMobile && <AppFooter />}
      {/* Mobile bottom nav — เฉพาะหน้าหลัก (Home/ชุมชน/หมวดหมู่/Profile) */}
      {isMobile && showBottomNav && <AppBottomNav />}
    </Box>
  );
}
