"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import MobileLayout from "@/components/layout/MobileLayout";

const FONT = '"Kanit", sans-serif';

const FAQ_GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "การสั่งซื้อ",
    items: [
      { q: "สั่งซื้อผ้าสำเร็จรูปอย่างไร?", a: "เลือกสินค้าที่ต้องการ กดเพิ่มลงตะกร้า แล้วดำเนินการชำระเงินได้เลยจากหน้าตะกร้า" },
      { q: "สั่งทอผ้าตามแบบที่ต้องการได้ไหม?", a: "ได้ ไปที่เมนู \"สั่งทอผ้า\" เลือกลายผ้า ชุมชนช่างทอ และระบุจำนวนเมตรที่ต้องการ ระบบจะคำนวณราคาประเมินให้อัตโนมัติ" },
      { q: "ยกเลิกคำสั่งซื้อได้หรือไม่?", a: "หากออเดอร์ยังไม่ได้รับการยืนยันจากร้านค้า สามารถติดต่อร้านผ่านข้อความในแอปเพื่อขอยกเลิกได้" },
    ],
  },
  {
    title: "การชำระเงิน",
    items: [
      { q: "ชำระเงินด้วยวิธีไหนได้บ้าง?", a: "ชำระผ่าน PromptPay/โอนเงินธนาคาร แล้วแนบสลิปการโอนในหน้าชำระเงิน ระบบจะตรวจสอบสลิปให้อัตโนมัติ" },
      { q: "แนบสลิปแล้วแต่ยังไม่ขึ้นสถานะสำเร็จ?", a: "ระบบตรวจสอบสลิปอาจใช้เวลาสักครู่ หากรอเกิน 10 นาทีแล้วยังไม่เปลี่ยนสถานะ กรุณาติดต่อร้านค้าผ่านข้อความในแอป" },
    ],
  },
  {
    title: "การจัดส่ง",
    items: [
      { q: "ติดตามสถานะการจัดส่งได้ที่ไหน?", a: "ไปที่เมนู \"ประวัติการสั่งซื้อ\" เลือกออเดอร์ที่ต้องการ จะเห็นสถานะและหมายเลขพัสดุ (ถ้าร้านค้าระบุไว้)" },
      { q: "ใช้เวลาจัดส่งนานแค่ไหน?", a: "ระยะเวลาขึ้นอยู่กับแต่ละร้านค้า โดยเฉพาะสินค้าสั่งทอที่ต้องใช้เวลาผลิต สามารถดูระยะเวลาที่ประเมินไว้ในหน้าสินค้าหรือสอบถามร้านค้าโดยตรง" },
    ],
  },
  {
    title: "บัญชีผู้ใช้",
    items: [
      { q: "ลืมรหัสผ่านทำอย่างไร?", a: "กดลืมรหัสผ่านที่หน้าเข้าสู่ระบบ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลที่ลงทะเบียนไว้" },
      { q: "เปลี่ยนข้อมูลโปรไฟล์/รหัสผ่านได้ที่ไหน?", a: "ไปที่เมนู \"ตั้งค่า\" ในหน้าโปรไฟล์ของท่าน" },
      { q: "อยากเปิดร้านขายผ้ากับ LAYA ทำอย่างไร?", a: "สมัครเป็นร้านค้าได้จากหน้าเข้าสู่ระบบ เลือก \"สมัครเป็นร้านค้า LAYA\" กรอกข้อมูลร้านค้าเพื่อรอการอนุมัติจากทีมงาน" },
    ],
  },
];

function AccordionItem({ q, a, isFirst }: { q: string; a: string; isFirst: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ borderTop: isFirst ? "none" : "1px solid #F0EBE3" }}>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, px: 2.5, py: 1.8, cursor: "pointer", "&:active": { bgcolor: "rgba(0,0,0,0.02)" } }}
      >
        <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.88rem", color: "#1B2A4A", flex: 1 }}>
          {q}
        </Typography>
        <ExpandMoreRoundedIcon sx={{ color: "#9CA3AF", fontSize: 20, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </Box>
      {open && (
        <Box component={motion.div} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} sx={{ px: 2.5, pb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.7 }}>
            {a}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default function HelpPage() {
  const router = useRouter();

  return (
    <MobileLayout>
      <Box sx={{ px: 2, pt: 3, pb: 4 }}>
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            bgcolor: "#FFFFFF", borderRadius: 4, border: "1px solid #E5DFD6",
            px: 2, py: 1.8, mb: 2,
            background: "linear-gradient(135deg, #FFFFFF 0%, rgba(197,165,90,0.06) 100%)",
          }}
        >
          <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <HelpOutlineRoundedIcon sx={{ color: "#C5A55A" }} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.15rem", color: "#1B2A4A" }}>
            ช่วยเหลือ
          </Typography>
        </Box>

        {/* FAQ Groups */}
        {FAQ_GROUPS.map((group, gi) => (
          <Box key={group.title} component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + gi * 0.04 }} sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.8rem", color: "#C5A55A", mb: 1, ml: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {group.title}
            </Typography>
            <Box sx={{ bgcolor: "#FFFFFF", borderRadius: 3, border: "1px solid #E5DFD6", overflow: "hidden" }}>
              {group.items.map((item, i) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} isFirst={i === 0} />
              ))}
            </Box>
          </Box>
        ))}

        {/* Contact */}
        <Link href="/messages" style={{ textDecoration: "none" }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            sx={{
              display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 2,
              bgcolor: "#1B2A4A", borderRadius: 3, mt: 1,
              cursor: "pointer", "&:active": { bgcolor: "#0F1A30" },
            }}
          >
            <ChatBubbleOutlineRoundedIcon sx={{ color: "#C5A55A" }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: "#FFFFFF", fontSize: "0.88rem" }}>
                ยังไม่พบคำตอบที่ต้องการ?
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                ติดต่อร้านค้าที่เกี่ยวข้องโดยตรงผ่านข้อความในแอป
              </Typography>
            </Box>
          </Box>
        </Link>
      </Box>
    </MobileLayout>
  );
}
