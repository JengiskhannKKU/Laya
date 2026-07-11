import type { Metadata } from "next";
import MobileLayout from "@/components/layout/MobileLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import IconButton from "@mui/material/IconButton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckroomRoundedIcon from "@mui/icons-material/CheckroomRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "สั่งตัดเสื้อผ้าไทย — มีผ้าเองหรือเลือกจากร้าน",
  description:
    "สั่งตัดชุดจากผ้าไทยของคุณเอง หรือเลือกผ้าจากร้านค้าในชุมชนช่างทอ ออกแบบง่ายด้วย AI บน LAYA",
  path: "/services/tailor",
});

export default function TailorTypePage() {
  return (
    <MobileLayout>
      <Box sx={{ p: 2, pb: 4, minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, mt: 1 }}>
          <Link href="/services" passHref>
            <IconButton sx={{ color: '#1B2A4A' }}>
              <ArrowBackRoundedIcon />
            </IconButton>
          </Link>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: '"Noto Serif Thai", serif', 
              fontWeight: 700, 
              color: "#1B2A4A",
              flex: 1,
              textAlign: 'center',
              mr: 5 // to balance the back button
            }}
          >
            สั่งตัด
          </Typography>
        </Box>

        <Typography 
          sx={{ 
            fontFamily: '"Noto Serif Thai", serif', 
            fontSize: '1rem', 
            color: "#6B7280",
            textAlign: 'center',
            mb: 4
          }}
        >
          คุณมีผ้าสำหรับสั่งตัดแล้วหรือไม่?
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, px: 1 }}>
          
          {/* Option 1: Have Fabric */}
          <Link href="/design-clothes" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                color: '#1B2A4A',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 4px 20px rgba(27,42,74,0.08)',
                border: '1px solid #E5DFD6',
                transition: 'transform 0.2s',
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              <Box sx={{ 
                width: 50, height: 50, borderRadius: '50%', 
                bgcolor: '#F0EBE3', display: 'flex', 
                alignItems: 'center', justifyContent: 'center' 
              }}>
                <CheckroomRoundedIcon sx={{ color: '#C5A55A' }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, fontSize: '1.05rem' }}>
                  มีผ้า
                </Typography>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: '0.8rem', mt: 0.5, color: '#6B7280' }}>
                  ถ่ายภาพผ้าของคุณลงบน LAYA เพื่อเริ่มออกแบบ
                </Typography>
              </Box>
            </Box>
          </Link>

          {/* Option 2: No Fabric (Choose Shop) */}
          <Link href="/community" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                color: '#1B2A4A',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 4px 20px rgba(27,42,74,0.08)',
                border: '1px solid #E5DFD6',
                transition: 'transform 0.2s',
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              <Box sx={{ 
                width: 50, height: 50, borderRadius: '50%', 
                bgcolor: '#1B2A4A', display: 'flex', 
                alignItems: 'center', justifyContent: 'center' 
              }}>
                <StorefrontRoundedIcon sx={{ color: '#FFFFFF' }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontWeight: 600, fontSize: '1.05rem' }}>
                  เลือกผ้าของร้าน (ไม่มีผ้า)
                </Typography>
                <Typography sx={{ fontFamily: '"Noto Serif Thai", serif', fontSize: '0.8rem', mt: 0.5, color: '#6B7280' }}>
                  เลือกร้านค้าเพื่อดูผ้าที่ต้องการสั่งตัด
                </Typography>
              </Box>
            </Box>
          </Link>

        </Box>
      </Box>
    </MobileLayout>
  );
}
