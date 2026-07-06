# LAYA — Development History

> อัปเดตต่อท้ายไฟล์นี้ทุกครั้งที่มีงานเสร็จ (ใหม่สุดอยู่ล่างสุดของแต่ละวัน)

---

## 2026-07-06 — ระบบชำระเงิน PromptPay + งาน High Priority (US-212, US-406, US-506, US-604, US-605)

**ทำโดย**: Claude (Fable 5)

### Backend (Express)

1. **PromptPay QR generator** — `backend/src/utils/promptpay.ts`
   - สร้าง EMVCo payload (Thai QR Payment standard) รองรับเบอร์โทร/บัตรประชาชน/e-Wallet
   - Dynamic QR ตามยอดเงิน + CRC-16/CCITT-FALSE
   - **ทดสอบเทียบกับไลบรารี `promptpay-qr` แล้วตรงกัน byte-for-byte**

2. **Payments API (US-604, US-605)** — `backend/src/routes/payments.ts`
   - `GET /api/payments/qr?amount=` — เจน QR payload ตามยอด (public, ใช้ในหน้า checkout)
   - `POST /api/payments` — สร้าง payment จาก orderId/weavingOrderId, คำนวณ **platform fee** (env `PLATFORM_FEE_PERCENT`, default 5%) + **shop payout** อัตโนมัติ, กันสร้างซ้ำ (reuse pending payment)
   - `POST /api/payments/:id/confirm` — ยืนยันโอนแล้ว (mock gateway) → mark paid → ออเดอร์ draft → pending_confirm → แจ้งเตือนร้าน+ลูกค้า
   - `GET /api/payments`, `GET /api/payments/:id` — role-based (ลูกค้า/ร้าน/แอดมิน)

3. **Order confirm flow (US-212)** — `backend/src/routes/orders.ts`
   - เพิ่ม state machine: draft → pending_confirm → confirmed → in_progress → ready → shipped → delivered (+ cancelled)
   - `POST /api/orders/:id/confirm` — ร้านยืนยันออเดอร์
   - ตั้ง `confirmed_at` / `completed_at` อัตโนมัติ, แจ้งเตือนสองทาง (US-601/602)
   - ลูกค้ายกเลิกได้เฉพาะก่อนร้านยืนยัน (รองรับ US-603 ฝั่ง backend)
   - แก้บั๊ก: default fabricSource `"shop_fabric"` → `"shop"` (enum จริงคือ own/shop)

4. **Weaving orders API (US-406)** — `backend/src/routes/weaving-orders.ts` (ใหม่)
   - CRUD + state machine: pending_confirm → confirmed → weaving → ready → shipped → delivered
   - บังคับ `colorDisclaimerAccepted` ก่อนสั่ง (US-407)
   - `POST /:id/confirm` สำหรับร้าน + logs + แจ้งเตือน

5. **Weave patterns API** — `backend/src/routes/weave-patterns.ts` (ใหม่)
   - `GET /api/weave-patterns` — ลาย 6 ลายใน DB พร้อม color variants (US-401/402)

6. **Shop matching (US-506)** — `backend/src/routes/shops.ts`
   - `GET /api/shops/match?patternTag=&province=&service=` — คะแนน: ตรงลาย +2, ตรงจังหวัด +1, เรียงตาม score → rating
   - แก้บั๊กเดิม: query ใช้ `status='active'` แต่ enum จริงคือ `approved` (ก่อนหน้านี้ GET /api/shops จะพังทันทีที่มีข้อมูล)

7. **Env ใหม่** (`backend/.env`): `PROMPTPAY_ID`, `PLATFORM_FEE_PERCENT`, ย้าย `JWT_SECRET`/`SUPABASE_JWT_SECRET` มาที่ `.env` (dotenv ไม่โหลด `.env.local`)

8. **Seed ร้านทอตัวอย่าง** — `backend/_seed_demo_shops.js` (idempotent)
   - 4 ร้าน (บ้านนาข่า, บ้านเขว้า, ผ้าฝ้ายเชียงใหม่, ซิ่นลำพูน) status approved + specialties + services ลง DB จริงแล้ว

### Frontend (Next.js)

9. **PromptPay lib** — `frontend/lib/promptpay.ts` (generator ฝั่ง client, logic เดียวกับ backend) + ติดตั้ง `qrcode.react`

10. **หน้า Checkout** (`app/checkout/page.tsx`) — QR จริงตามยอดสั่งซื้อ (แทน icon placeholder), แสดงเลขพร้อมเพย์+ยอด, ปุ่มสร้าง QR ใหม่เมื่อหมดเวลา
    - Env ใหม่: `NEXT_PUBLIC_PROMPTPAY_ID` (frontend/.env.local)

11. **หน้า Merchant Orders** (`app/merchant/orders/page.tsx`) — ต่อ API จริง
    - ดึงออเดอร์ตัด + ทอ รวมกัน, ปุ่ม action ตามสถานะ (ยืนยัน → เริ่มผลิต → ผลิตเสร็จ → ส่งพัสดุ → สำเร็จ)
    - Fallback เป็นข้อมูลตัวอย่าง + banner แจ้ง เมื่อไม่ได้ล็อกอินบัญชีร้านจริง

12. **หน้า Weaving Order** (`app/weaving-order/page.tsx`) — ต่อ API จริง
    - โหลดลายจาก `/api/weave-patterns` + ร้านจาก `/api/shops/match?service=weave`
    - Submit จริง → สร้าง weaving order → **หน้าชำระเงิน PromptPay QR** → กด "โอนเงินแล้ว" → ยืนยัน payment → ร้านได้รับแจ้งเตือน
    - Fallback mock เมื่อไม่ได้ล็อกอิน

### ทดสอบแล้ว (backend/_test_flow.js — end-to-end กับ DB จริง)

- ✅ Weaving: สร้างออเดอร์ → payment (fee 5% = ฿64 จาก ฿1,280, payout ฿1,216) → confirm → ร้านยืนยัน → เริ่มทอ → transition ผิดถูก reject
- ✅ Cutting: draft → จ่ายเงิน → pending_confirm → ร้านยืนยัน (confirmed)
- ✅ Notifications ครบสองทาง (ร้าน 9, ลูกค้า 8 รายการ)
- ✅ QR payload ตรงกับไลบรารีอ้างอิง `promptpay-qr`
- ✅ `tsc --noEmit` ผ่านทั้ง backend และ frontend

### สถานะ Backlog หลังงานนี้

- US-212 ✅ | US-406 ✅ | US-506 ✅ | US-604 ✅ (PromptPay จริง; บัตรเครดิตยังเป็น mock UI) | US-605 ✅
- US-603 (ยกเลิกออเดอร์) — backend รองรับแล้ว, ยังไม่มีปุ่มใน UI ลูกค้า
- เหลือ: US-211 (shipments), US-509 (แชร์ภาพ community)

> ติดปัญหา/ประเด็นค้าง ดูที่ [deflect.md](deflect.md)

---

## 2026-07-06 (รอบสอง) — ปรับ ProductCard + แปลงรูปทั้งโปรเจกต์เป็น WebP

**ทำโดย**: Claude (Fable 5)

### ProductCard (frontend/components/home/ProductCard.tsx)
- รวมภาพ+ข้อความเป็นการ์ดเดียวพื้นหลังขาว มุมโค้ง 18px, ขยายชื่อสินค้า (1.05rem/700), รายละเอียด (0.8rem), ราคา (1.15rem/700)
- แก้กรอบการ์ดไม่เท่ากันใน grid: ใส่ `minWidth: 0` กันข้อความ nowrap ดันคอลัมน์
- แก้การ์ด carousel ซ้อนกัน: `flexShrink: 0` + `minWidth: 180` เฉพาะ variant carousel

### แปลงรูปเป็น WebP
- แปลง **126 ไฟล์** ใน `frontend/public` (png/jpg → webp, quality 82 ด้วย sharp): **272MB → 35.9MB (ลด 87%)**
- คงไว้ 3 ไฟล์: `apple-icon.png`, `icon-dark-32x32.png`, `icon-light-32x32.png` (iOS/favicon ต้องเป็น PNG)
- อัปเดต reference ในโค้ด **227 จุดใน 26 ไฟล์** (frontend + backend/src) — เฉพาะ path local, ไม่แตะ URL ภายนอก
- แก้เคสพิเศษ: `/thai.jpg` (ตัวพิมพ์เล็ก) → `/Thai.webp` ใน MissionSection — เดิมใช้งานได้เพราะ Windows ไม่สนตัวพิมพ์ แต่จะพังบน Vercel (Linux)
- ตรวจแล้ว: หน้า home/custom โหลดรูป webp ครบ ไม่มีรูปแตก | DB ไม่มี path รูป local (หน้าเว็บใช้ mock data)
- หมายเหตุ: refs ที่ชี้ไฟล์ที่ไม่มีอยู่แล้วตั้งแต่ก่อนแปลง (เช่น `/fabrics/f*.jpg`, `/product*.jpg`) คงไว้ตามเดิม
- แถม: ตัดขอบขาวที่ฝังในไฟล์ `Thai.webp` (sharp trim, 1667→1406px) — แก้ปัญหารูป EditorialSection มีแถบขาวข้างรูป

---

## 2026-07-06 (รอบสาม) — UI สตูดิโอสั่งตัด (Design Studio) ตาม mockup

**ทำโดย**: Claude (Fable 5)

### เขียนใหม่ `frontend/components/design-clothes/ClothingDesigner.tsx` (หน้า `/design-clothes`)

- **โหมดเสื้อ / กางเกง** สลับได้จาก toggle บน header — เปลี่ยนชุดตัวเลือก, hotspot, จำนวนเมตร, ค่าตัดเย็บ ทั้งหมด
  - เสื้อ: ประเภทเสื้อ (หญิง/ชาย/ยูนิเซ็กส์), ทรงเสื้อ 9 แบบ, คอเสื้อ 6 แบบ, แขนเสื้อ/ความยาว/ดีเทล (collapsible)
  - กางเกง: ประเภททรง 9 แบบ (ขากระบอก…กระโปรงกางเกง), ความยาว, เอว/กระเป๋า/ปลายขา/ดีเทล (collapsible)
- **พรีวิวกลางจอ**: silhouette เสื้อ/กางเกง (SVG) **เติมลายผ้าจริงที่เลือก** (pattern fill) + โทนสีทับตามความเข้มที่ตั้ง (multiply blend), hotspot ชี้ส่วนต่างๆ, toolbar 2D/3D, มุมมองตัวอย่าง 6 มุม (หน้า/ข้าง/หลัง/ซูมผ้า/แพทเทิร์น)
- **เลือกผ้า**: แท็บผ้าไหม/ผ้าฝ้าย (10 ชนิด รูปจริงจาก `/fabric_patterns/*.webp` พร้อมราคา/เมตร), filter ภูมิภาค+เทคนิค, ค้นหา, pagination
- **ปรับดีไซน์**: โทนสีผ้า 11 เฉด + slider ความเข้มสี — มีผลกับพรีวิวจริง
- **สรุปแบบ + ราคาประมาณการ**: คำนวณสดตามที่เลือก (ผ้า×เมตร + ตัดเย็บ + ดีเทล) ไม่ hardcode แล้ว
- **บันทึกแบบร่าง / โหลดแบบเดิม**: ใช้ localStorage ใช้งานได้จริง | "ดำเนินการต่อ" → `/tailor/with-fabric`
- เลิกใช้ emoji ทั้งหมด → ไอคอน SVG เส้น (GarmentIcon) ตาม design direction
- ตรวจแล้วใน preview: สลับโหมดกางเกง → h1/ตัวเลือก/hotspot/ราคาเปลี่ยนถูกต้อง (4,446 = 1,180×2.2+1,500+350), เปลี่ยนผ้า → พรีวิว+สรุป+ราคาอัปเดต (4,820), `tsc` ผ่าน, console สะอาด

**ค้าง**: ถ้าต้องการพรีวิวเป็นภาพนางแบบจริงแบบ mockup ให้วางรูปที่ `frontend/public/studio/` แล้วต่อเพิ่มได้

---

## 2026-07-06 (รอบสี่) — Professional Garment Configurator (v2)

**ทำโดย**: Claude (Fable 5)

### ยกระดับ `/design-clothes` เป็น configurator ปรับแต่งรายชิ้นส่วน (สไตล์ Nike By You / CLO3D)

แตกโครงเป็น 3 ไฟล์:
- `components/design-clothes/configurator/data.ts` — แคตตาล็อกตัวเลือกทั้งหมด + สูตรราคา + smart visibility
- `components/design-clothes/configurator/GarmentCanvas.tsx` — พรีวิว SVG parametric แบบ interactive
- `components/design-clothes/ClothingDesigner.tsx` — หน้าหลัก (คงธีม Navy+Gold/layout เดิม)

**ความสามารถใหม่:**
1. **3 หมวด**: เสื้อ (ประเภท 5, คอ 13, แขน 10, ข้อมือ 5, ไหล่ 4, สาบหน้า 5, กระดุม 4 มิติ, กระเป๋าเพิ่มได้หลายใบ+ตำแหน่ง/ชนิด, ชาย 4+ผ่าข้าง slider, ตกแต่ง 8) / กางเกง (ทรง 7+preset, เอว/ขอบเอว/fly, กระเป๋า 4 toggle, จีบ, slider ปลายขา+ความยาว, ปลายขา) / กระโปรง (ทรง 10, จีบ 5, ชั้น 1-5, ชาย 4)
2. **โมเดล interactive**: ทุกชิ้นส่วนวาดตาม config จริง (คอเปลี่ยนทรง แขนสั้น-ยาว-พอง กระเป๋าโผล่ตามตำแหน่ง ฯลฯ) — hover ขอบน้ำเงิน, คลิกเลือกขอบทอง → เปิด accordion ที่เกี่ยวข้อง + property panel
3. **Component tree** ใต้โมเดล (สไตล์ Figma layers) sync กับ selection บนโมเดล
4. **Property panel** ขวาบน แสดงเฉพาะ property ของชิ้นที่เลือก (ผ้า/สี/ตะเข็บ 3 แบบ)
5. **ผ้า & สีรายชิ้นส่วน**: chips เลือกเป้าหมาย (ทั้งชุด/รายชิ้น) แล้วกดผ้า/สี — คำนวณค่าวัสดุแยกรายชิ้น (เมตรต่อชิ้น × ราคาผ้า)
6. **Smart UX**: แขนกุด→ซ่อนข้อมือ, ไม่มีสาบ→ซ่อนกระดุม, ขาสั้น→ซ่อนปลายขา, ชิ้นส่วนหาย→ล้าง selection อัตโนมัติ
7. **ราคาสด**: ค่าวัสดุ + ตัดเย็บ + ความซับซ้อน (ทุกตัวเลือกมี price tag) + ระยะเวลาผลิตแปรตามความซับซ้อน + MOQ (เลเซอร์คัต→10 ตัว)
8. **สรุปเป็น tags** (group:value chips) + breakdown ผ้ารายชิ้น

**ทดสอบใน preview ผ่านหมด**: คลิกชิ้นจาก tree→panel+highlight ✓, แขนกุด→ข้อมือหาย/ชิ้นส่วน 8→6 ✓, ผ้าเฉพาะปก (ฝ้ายย้อมคราม ฿78 ขณะที่ชิ้นอื่นไหมแพรวา) ✓, เลเซอร์คัต→MOQ 10 ✓, สลับ 3 หมวดราคาคำนวณใหม่ ✓, `tsc` ผ่าน, console สะอาด

---

## 2026-07-07 — Garment Creator V2 (3D game-like) + ปรับ login/เส้นทางสั่งตัด

**ทำโดย**: Claude (Fable 5)

### ปรับเล็ก
- ลบปุ่มล็อกอิน LINE + Facebook ออกจาก `app/auth/login/page.tsx` (เหลือ Google + อีเมล/รหัสผ่าน)
- ปุ่ม "มีผ้า" ใน `/services/tailor` เปลี่ยนปลายทาง `/tailor/with-fabric` → `/design-clothes`

### LAYA Garment Creator V2 — เขียนใหม่เป็น 3D interactive (แทน configurator แบบฟอร์ม)
คอนเซ็ปต์: "ชุดคือเมนู" สไตล์ The Sims / Roblox / CLO3D — ไม่ใช่ฟอร์ม ทุกอย่างอัปเดตสด ไม่มีปุ่ม Apply

**Stack ใหม่**: three + @react-three/fiber + @react-three/drei + zustand (+ @use-gesture/react) — ติดตั้งแล้ว

**ไฟล์ใหม่** `frontend/components/garment-creator/`:
- `config.ts` — ทุกอย่าง config-driven JSON: 3 หมวด (เสื้อ 8 ชิ้นส่วน / กางเกง 4 / กระโปรง 3), presets+ราคา, sliders, ผ้า 12 ชนิด (texture จริงจาก `/fabric_patterns`), งานตกแต่ง 5 แบบ, smart suggestions, กติกา AI, สูตรราคา/วันผลิต/MOQ
- `store.ts` — zustand: undo/redo (Ctrl+Z/Y, 60 steps), autosave localStorage, แบบโปรด (favorites), drag state
- `meshes.tsx` — ชิ้นส่วน 3D parametric ทุกชิ้นเป็น mesh อิสระ (lathe/primitive geometry): hover=ขอบฟ้า คลิก=ทอง วางของ=เขียว (emissive glow), pop animation เมื่อเปลี่ยน preset, exploded view แยกชิ้นแบบ lerp, เลเยอร์ตกแต่งวางซ้อนเรียงลำดับได้, หุ่นลอง (avatar) ปรับรูปร่างได้
- `Scene.tsx` — viewport: OrbitControls (หมุน/แพน/ซูม), ปุ่มมุมมอง 5 มุมแบบ turntable, แสงสตูดิโอ, ContactShadows
- `panels.tsx` — Asset Library (สไตล์รายชิ้น/คลังผ้าลากวางได้/ตกแต่ง/แบบโปรด) + Property Panel เปลี่ยนตามชิ้นที่เลือก (sliders เรียลไทม์, ผ้า, สี, ตะเข็บ, เลเยอร์, smart suggestions)
- `chrome.tsx` — TopBar (ประเภท/undo/มุมกล้อง/exploded/wireframe/หุ่น), BottomBar (component tree + ราคาสด), AI assistant ลอย (คีย์เวิร์ด: ไทยโมเดิร์น/หรู/มินิมอล/สตรีท/หวาน — แก้เฉพาะชิ้นที่เลือก), DragGhost, Toast
- `GarmentCreator.tsx` + `Loader.tsx` — layout + global drag-drop + keyboard, โหลด client-only (dynamic ssr:false)
- `app/design-clothes/page.tsx` ชี้มาที่ตัวใหม่ (คง SEO metadata) — configurator เดิม (`design-clothes/`) ยังอยู่ในโปรเจกต์ เผื่อ rollback

**ตรวจแล้ว**: `tsc --noEmit` ผ่าน, `next build` ผ่าน (/design-clothes static) | ยังไม่ได้ทดสอบใน browser จาก session นี้ — dev server ของอีก session ล็อกโฟลเดอร์อยู่ (เปิดดูได้ที่ localhost:3000/design-clothes ผ่าน HMR)

---

## 2026-07-07 (รอบสอง) — หน้า "The Story Behind Thai Silk" (Heritage Collection)

**ทำโดย**: Claude (Fable 5)

- ปุ่ม "อ่านเรื่องราว" ใน `EditorialSection.tsx` (หน้าแรก) เดิมชี้ไป `/community` เฉยๆ → เปลี่ยนเป็น `/community/heritage` หน้าใหม่จริง
- สร้าง `app/community/heritage/page.tsx` (static route ที่ prerender แยกจาก `/community/[id]` dynamic) + `components/community/HeritageStory.tsx` — เล่าเรื่องพระราชกรณียกิจของสมเด็จพระนางเจ้าสิริกิติ์ฯ ในการฟื้นฟู/ส่งเสริมผ้าไหมไทย ตามเนื้อหาที่ผู้ใช้แนบมา (จุดเริ่มต้นปี 2498, โครงการส่งเสริม 6 ข้อ, ตรานกยูงพระราชทาน 4 สี, ผลกระทบ/มรดก, อ้างอิง 3 แหล่ง) ใช้ SectionHeader ร่วม + ธีม navy/gold เดิม ไม่มี emoji
- แปลงรูปที่ผู้ใช้แนบ (jpg/jpeg ใน Downloads ที่ md อ้างถึงด้วยชื่อ hash ตรงกัน) เป็น webp ด้วย sharp quality 82 → เก็บที่ `public/heritage/` (6 ไฟล์ ใช้ชื่อสื่อความหมายแทน hash เดิม): `queen-inspects-silk`, `exhibition-gowns-blue` (hero), `weaving-hands-mudmee`, `queen-legacy-split`, `praewa-shoulder-cloth`, `heritage-exhibition-visit`
- หมายเหตุ: md อ้างอิงรูปทั้งหมด 8 รูป แต่มีไฟล์จริงใน Downloads แค่ 6 รูป (ขาด `JjTLWRFqjmxd.jpg`, `W6EmbIhcsmHl.jpg`) — หน้านี้จึงใช้แค่ 6 รูปที่มีจริง
- ตรวจแล้ว: `tsc --noEmit` ผ่าน, `next build` ผ่าน — `/community/heritage` ได้ static route แยกจาก `[id]` ถูกต้อง, path รูปทั้ง 6 ตรงกับไฟล์จริงครบ | ยังไม่ได้เปิดดูใน browser จาก session นี้ (dev server ของอีก session ล็อกโฟลเดอร์อยู่เหมือนรอบก่อน)

---

## 2026-07-07 (รอบสาม) — เอฟเฟกต์เพิ่มเติมให้ section "ตรานกยูงพระราชทาน"

**ทำโดย**: Claude (Fable 5)

- ผู้ใช้แนบภาพตราสัญลักษณ์นกยูงพระราชทานจริงทั้ง 4 สี (ทอง/เงิน/น้ำเงิน/เขียว) พร้อมคำอธิบายมาตรฐานเต็ม (ไทย+อังกฤษ) — บันทึกไว้ที่ Downloads เป็น `z5gQw0rYS2mU.jpeg` (ทอง), `N42ABn9BQrWm.jpeg` (เงิน), `8BhqKFGHHzp8.jpeg` (น้ำเงิน), `R8v4NaypIBfz.jpeg` (เขียว)
- ครอปเฉพาะส่วนตราวงรี+ลายเซ็นคอร์ซีฟ (ตัด text block ไทย/อังกฤษที่ซ้ำกับเนื้อหาบนเว็บออก) ด้วย sharp `extract({left:95, top:90, width:820, height:935})` แล้ว resize เหลือ 520px + webp quality 92 → เก็บที่ `public/heritage/badges/peacock-{gold,silver,blue,green}.webp`
- รื้อ section ในหน้า `/community/heritage` ใหม่ (`HeritageStory.tsx`):
  - ห่อทั้ง section เป็นการ์ดพื้นหลังครีม ลายจุดทองจางๆ (radial-gradient dot pattern + mask ให้จางขอบ), ป้ายริบบิ้น "พระราชทาน พ.ศ. 2550" เด้งเข้ามาตอน scroll, เส้นคั่นทองซ้าย-ขวา eyebrow
  - แต่ละใบ (`PeacockCard` component ใหม่) ใช้ **ภาพตราจริง** แทนวงกลมสีทึบเดิม พร้อมออร่าเรืองแสงสีเดียวกับตรา (radial-gradient) ขยายตอน hover
  - เอฟเฟกต์การ์ด: stagger fade+scale เข้าตอน scroll (framer-motion variants, delay ตาม index), hover ยก+ขยาย (spring), เงา/ขอบเปลี่ยนเป็นสีของตราตอน hover, แถบสีบนขยายเต็มความกว้างตอน hover
  - เพิ่มปุ่ม "มาตรฐานฉบับเต็ม" ขยาย/ย่อ (AnimatePresence height animation) แสดงรายละเอียดมาตรฐานเต็มของแต่ละตรา (ที่ผู้ใช้แนบมา) โดยไม่ทำให้การ์ดรกตั้งแต่แรกเห็น
- ตรวจแล้ว: `tsc --noEmit` ผ่าน, `next build` ผ่าน (`/community/heritage` ยัง static เหมือนเดิม), path รูป badge ทั้ง 4 ตรงกับไฟล์จริงครบ | ยังไม่ได้เปิดดูจริงใน browser จาก session นี้ (dev server ของอีก session ล็อกโฟลเดอร์เหมือนเดิม)
