# LAYA Frontend — Project Context

> **คำสั่งสำหรับ AI**: อ่านไฟล์นี้ก่อนเสมอเมื่อจะแก้ไขโค้ด เพื่อให้เข้าใจเป้าหมาย โครงสร้าง และงานที่ทำไปแล้ว จากนั้นบันทึกสิ่งที่แก้ไขต่อท้ายใน **## Changelog** พร้อม Timestamp

---

## 🎯 เป้าหมายของ Project

**LAYA** คือแพลตฟอร์ม Marketplace ผ้าไทยพรีเมียม ที่เชื่อมช่างทอผ้าชุมชนกับผู้บริโภค มีฟีเจอร์:
- **Marketplace** — ค้นหา ซื้อ ผ้าไทย/เสื้อผ้า GI
- **ออกแบบ AI** — สร้างลายผ้า + เสื้อผ้า custom ด้วย AI (เส้นทาง `/custom`, `/design-clothes`)
- **ชุมชน** — ข้อมูลชุมชนช่างทอ, ภูมิปัญญาท้องถิ่น
- **Digital Textile Passport** — ใบรับรองต้นกำเนิดผ้า (blockchain-ready)
- **แผนที่ผ้าไทย** — แผนที่ interactive ชุมชนทอผ้าทั่วประเทศ

**สีประจำแบรนด์:**
- Primary Navy: `#1B2A4A`
- Gold Accent: `#C5A55A`
- Cream Background: `#FAF6F0`
- Muted: `#F0EBE3`, Border: `#E5DFD6`

---

## 🏗️ โครงสร้าง Frontend

```
frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── page.tsx                # หน้าแรก — รวม HomeHeader, SearchBar, BannerCarousel ฯลฯ
│   ├── globals.css             # CSS variables, Tailwind, range input, safe-area
│   ├── custom/                 # ออกแบบ AI (fabric pattern)
│   ├── design-clothes/         # ออกแบบเสื้อผ้า (new page สร้าง 2025-06)
│   ├── product/[id]/           # หน้าสินค้า
│   ├── cart/, checkout/        # ตะกร้า/ชำระเงิน
│   ├── orders/, profile/       # คำสั่งซื้อ, โปรไฟล์
│   ├── search/                 # ค้นหา
│   ├── community/              # ชุมชน
│   ├── map/                    # แผนที่
│   └── auth/                   # Login, Register, Forgot, Reset
├── components/
│   ├── layout/
│   │   ├── MobileLayout.tsx    # Shell หลัก — ใช้ mounted+useMediaQuery (anti-hydration)
│   │   ├── BottomNav.tsx       # Mobile bottom nav (full-width, 5 items, FAB กลาง)
│   │   └── SideNav.tsx         # Desktop sidebar (240px, navy, active indicator)
│   ├── home/                   # Sections ทุก section ของหน้าแรก
│   ├── custom/                 # AI fabric design flow (10 steps)
│   ├── design-clothes/         # ClothingDesigner component
│   ├── product/                # ProductDetailView, DigitalCertificateView
│   ├── community/              # CommunityDetailView
│   └── ui/                     # shadcn/ui (47 components)
├── lib/
│   ├── mock-data.ts            # Products, communities, banners (mock)
│   ├── theme.ts                # MUI theme config
│   ├── types.ts                # TypeScript types
│   └── auth-context.tsx        # Auth context (useAuth hook)
└── public/
    ├── thai.jpg                # LCP hero image (priority=true)
    └── assets/, fabrics/       # รูปภาพต่างๆ
```

---

## 🧱 Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | Material-UI v6 + shadcn/ui (Radix) |
| Styling | Tailwind CSS v4 + Emotion (MUI) |
| Animation | Framer Motion v11 |
| Icons | MUI Icons + Lucide React |
| Font | Noto Serif Thai (Thai), Playfair Display (EN) |
| State | React hooks + Context (Auth) |
| Forms | React Hook Form + Zod |

---

## 📐 Responsive Breakpoints (MUI)

| Breakpoint | Width | Layout |
|---|---|---|
| xs | 0px+ | Mobile — BottomNav, single column |
| sm | 600px+ | Large phone / small tablet |
| md | 960px+ | Desktop — SideNav แทน BottomNav |
| lg | 1280px+ | Wide desktop |

---

## ⚠️ กฎสำคัญที่ต้องจำ

1. **Hydration**: MobileLayout ใช้ `mounted` state ก่อน apply `isDesktopMQ` — ห้ามลบออก ไม่งั้นจะเกิด `removeChild` error
2. **Typography + Link**: ถ้าจะใช้ Typography เป็น Link ต้องระวัง nesting ไม่ถูก (`<a>` ใน `<p>`) — ใช้ `component="span"` หรือ wrap ด้วย `<Link>` แทน
3. **LCP Image**: รูปที่ above-the-fold ต้องมี `priority` และ `loading="eager"` (เช่น `/thai.jpg` ใน MissionSection)
4. **สีชุดเดิม**: ห้ามเปลี่ยนสี primary/gold/cream โดยไม่ได้รับอนุญาต
5. **BottomNav maxWidth**: ไม่ lock ที่ 430px แล้ว — full-width, max 640px center

---

## 📋 Changelog

### 2026-06-26 — Initial Responsive Redesign
**ผู้แก้**: AI (Claude Sonnet 4.6)

**ปัญหาที่แก้:**
- Remove hard-coded `maxWidth: 430` จาก MobileLayout และ BottomNav (เดิม lock mobile ที่ 430px ทำให้ tablet/desktop เสีย)
- Fix hydration mismatch (`removeChild TypeError`) จาก `useMediaQuery` โดยเพิ่ม `mounted` state ใน MobileLayout
- Fix LCP warning: เพิ่ม `priority` + `loading="eager"` บน `/thai.jpg` ใน MissionSection

**ไฟล์ที่แก้ไข:**
- `components/layout/MobileLayout.tsx` — mounted state, full-width, responsive auth bar
- `components/layout/BottomNav.tsx` — full-width, safe-area-inset, Thai labels, active indicator, FAB ใหญ่ขึ้น
- `components/layout/SideNav.tsx` — active left-bar indicator, "AI" badge, hover states
- `components/home/HomeHeader.tsx` — responsive xs/sm/md spacing, user greeting บน sm+
- `components/home/SearchBar.tsx` — quick tags, responsive, click → /search
- `components/home/BannerCarousel.tsx` — height responsive (190→340px), "ดูเพิ่มเติม" button
- `components/home/CategorySection.tsx` — icon ขนาด responsive, wrap grid บน desktop
- `components/home/CommunitiesSection.tsx` — scroll mobile → 3-col grid บน md+
- `components/home/NewArrivalsSection.tsx` — 3-col grid บน desktop
- `components/home/ExploreSection.tsx` — grid 2→3→4→5 col ตาม screen
- `components/home/MissionSection.tsx` — `priority` + `loading="eager"` บน LCP image
- `app/globals.css` — range input thumb, safe-area-inset, scrollbar-hide utility

**หน้าใหม่ที่สร้าง:**
- `app/design-clothes/page.tsx` + `components/design-clothes/ClothingDesigner.tsx`
  - หน้า ออกแบบเสื้อผ้า 4 steps (รูปแบบ → ผ้า → ดีไซน์ → สั่งผลิต)
  - Mobile-first: 3-column บน desktop, stacked บน mobile
  - Bottom sticky nav bar สำหรับ step navigation

---
<!-- เพิ่ม changelog entry ใหม่ต่อท้ายนี้ -->
