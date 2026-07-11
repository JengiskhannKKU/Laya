import type { Metadata } from "next";
import MobileLayout from "@/components/layout/MobileLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "สั่งตัด / สั่งทอผ้าไทย — บริการ Thai Fashion",
  description:
    "เลือกบริการสั่งตัดชุดจากผ้าที่คุณมี หรือสั่งทอผ้าไทยลายใหม่กับชุมชนช่างทอโดยตรง บน LAYA แพลตฟอร์ม Fashion Tech",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <MobileLayout>
      <Box sx={{ p: 3, pt: 6, minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: '"Kanit", sans-serif', 
            fontWeight: 700, 
            color: "#1B2A4A",
            textAlign: 'center',
            mb: 2
          }}
        >
          เลือกบริการ
        </Typography>

        <Link href="/services/tailor" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              p: 4,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #1B2A4A 0%, #2A4073 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(27,42,74,0.15)',
              transition: 'transform 0.2s',
              '&:active': { transform: 'scale(0.98)' }
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 600 }}>
              สั่งตัด
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: '0.85rem', mt: 1, opacity: 0.8, textAlign: 'center' }}>
              ออกแบบและสั่งตัดชุดจากผ้าที่คุณเลือก
            </Typography>
          </Box>
        </Link>

        <Link href="/services/weave" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              p: 4,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #C5A55A 0%, #D4BA7A 100%)',
              color: '#1B2A4A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(197,165,90,0.25)',
              transition: 'transform 0.2s',
              '&:active': { transform: 'scale(0.98)' }
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: '"Kanit", sans-serif', fontWeight: 700 }}>
              สั่งทอผ้า
            </Typography>
            <Typography sx={{ fontFamily: '"Kanit", sans-serif', fontSize: '0.85rem', mt: 1, opacity: 0.8, textAlign: 'center' }}>
              ออกแบบลายผ้าและสั่งทอกับชุมชนโดยตรง
            </Typography>
          </Box>
        </Link>
      </Box>
    </MobileLayout>
  );
}
