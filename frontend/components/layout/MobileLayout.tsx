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
  // มือถือ: ไม่มี padding ซ้าย-ขวาจาก layout กลาง — เต็มจอพอดีเหมือนแอป แต่ละหน้าจัดการ padding เนื้อหาของตัวเอง
  // ยกเว้นหน้า Home — เนื้อหาหลายส่วน (search bar, การ์ด, หัวข้อ) ชิดขอบเกินไปแบบ full-bleed จึงให้กลับไปมี padding ปกติ
  const fullBleed = isMobile && pathname !== "/";

  return (
    // overflowX ต้องเป็น clip ไม่ใช่ hidden — hidden ทำให้ ancestor กลายเป็น scroll container
    // แล้ว position:sticky ของ TopNav ใช้ไม่ได้ (แถบไม่ติดขอบบนตอน scroll)
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAF6F0", overflowX: "clip" }}>
      {/* Top Nav — always visible */}
      <AppTopNav />
      {/* Centered content container */}
      <Box
        component="main"
        sx={{
          maxWidth: 1440,
          width: "100%",
          mx: "auto",
          px: fullBleed ? 0 : { xs: 2.5, sm: 3, md: 5 },
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
