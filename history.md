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

## 2026-07-07 — Garment Builder MVP: Layer-Based + Asset-Driven (แทนที่เวอร์ชัน 3D)

**ทำโดย**: Claude (Fable 5)

### เปลี่ยนสถาปัตยกรรม `/design-clothes` เป็น dress-up game style (ตามสเปคทีม)

- **ทิ้งแนวทาง 3D/GLB/parametric** — เปลี่ยนเป็น **Layer-Based Rendering**: เสื้อผ้า = เลเยอร์รูปภาพซ้อนกัน (absolute position)
- **Asset-Driven ทั้งหมด**: รูปทรงเสื้อผ้าไม่มี hardcode ใน React —
  - `frontend/public/assets/garments/**` — **27 ไฟล์ SVG placeholder** (tops/bottoms/skirts: body, collar, sleeves, pocket, buttons, decoration) พื้นหลังโปร่งใส ดีไซเนอร์แทนที่ไฟล์ได้เลย
  - `catalog.json` — นิยามทุกอย่าง: options, layouts (%), ราคา, patterns 6, สี 12, **templates 10** (เสื้อผู้หญิง/เชิ้ตออฟฟิศ/ไทยร่วมสมัย/ลำลอง/โปโล/เดรส/กระโปรง/ขากว้าง/จ็อกเกอร์/คาร์โก้)
  - สคริปต์สร้าง asset: scratchpad `gen-garment-assets.js`
- **ไฟล์ใหม่**:
  - `components/design-clothes/builder/types.ts` — schema + `resolveLayers()` (design+catalog → layers) + `calcPrice()`
  - `components/design-clothes/builder/GarmentRenderer.tsx` — **renderer สลับได้** (`svg-layer` วันนี้ → png/3d อนาคต โดย UI ไม่เปลี่ยน) ใช้ CSS mask: asset = รูปทรง, ลายผ้า = background repeat (webp เดิม), สี = blend multiply | Framer Motion ต่อ layer: collar fade, sleeve slide, pocket scale
  - `lib/stores/garment-store.ts` — **Zustand** (ติดตั้งใหม่): parts/pattern/color (global + override รายชิ้น), template, selection
  - `ClothingDesigner.tsx` เขียนใหม่ทั้งหมด
- **UX แบบ dress-up game**: เริ่มจาก template เสมอ (ไม่มีผ้าใบเปล่า) → คลิกชิ้นส่วนบนชุด (hover ฟ้า/เลือกทอง) → **popup ลอย** เลือกแบบเป็นการ์ดรูป + ลาย/สีเฉพาะส่วนนั้น → สลับเฉพาะ layer ทันที | คลังชิ้นส่วนเป็นการ์ดรูปแนวนอน (ไม่มี dropdown) | ลายผ้า 6 + สี 12 กดครั้งเดียวเปลี่ยนทันที
- **AI ช่วยออกแบบ** (rule-based MVP): พิมพ์ลุคที่อยากได้ → แนะนำ คอ/แขน/ลาย/สี/กระดุม รายข้อ กด "ใช้" ทีละข้อหรือ "ใช้ทั้งหมด"
- แก้ route `app/design-clothes/page.tsx`: ชี้กลับจาก `garment-creator/Loader` (เวอร์ชัน 3D — ยังอยู่ในโค้ดแต่ไม่ถูก route) มาที่ builder ใหม่ | ลบ `configurator/` (เวอร์ชัน parametric รอบก่อน)

### ทดสอบใน preview ผ่านหมด
- เทมเพลต 10 ใบ (พรีวิวสดจาก renderer เดียวกัน) สลับได้ ✓
- คลิกคอบนชุด → popup "เลือกคอ / ปกเสื้อ" → กดคอวี → layer สลับ ✓
- สีแดงเข้มเฉพาะคอ (ลำตัวยังทอง) ✓ | ลายครามทั้งชุด ✓
- คลิกการ์ดในคลังชิ้นส่วน (ฮู้ด) apply ทันที ✓
- AI preset "ชุดไทยหรูหรา" → ใช้ทั้งหมด → คอจีน/แขนยาว/ไหมไทย/ทอง/กระดุมไม้/แถบตกแต่ง (ราคา 3,890 ตรงสูตร) ✓
- ราคาคำนวณสดถูกต้องทุกเคส (990+options+ลาย×2ม.) ✓ | `tsc` ผ่าน | console สะอาด

---

## 2026-07-07 (รอบสอง) — Creative Studio UX Pass: จาก configurator เป็น "เลือกสไตล์ที่ชอบ"

**ทำโดย**: Claude (Fable 5)

### ปรับ UX `/design-clothes` ทั้งหน้า (UI เท่านั้น — store/renderer/catalog/ราคา ไม่แตะ)

**Flow ใหม่แบบทีละการตัดสินใจ (5 ขั้น):** เลือกสไตล์ → ปรับแต่ง → เลือกผ้า → เลือกสี → สรุป
- **Stepper แบบเบา** บน top bar (จุด 5 จุด กดย้อนขั้นที่ผ่านแล้วได้) + ปุ่มถัดไป/ย้อนกลับใหญ่ชัดบอกปลายทาง ("ต่อไป — เลือกผ้า")
- **ขั้นเลือกสไตล์**: เต็มจอ การ์ดเทมเพลตใหญ่ (aspect 4/5) จัดกลุ่ม เสื้อ&เดรส/กางเกง/กระโปรง หัวข้อเป็นคำถามเป็นกันเอง "วันนี้อยากใส่ชุดแบบไหน?" — เลือกแล้วเข้าขั้นปรับแต่งอัตโนมัติ
- **ชุดคือพระเอก**: พรีวิว sticky ใหญ่สุดซ้ายมือทุกขั้น + ชิปราคา animate ทุกครั้งที่ปรับ (feedback ทันที) + ป้ายชื่อส่วนตอน hover
- **ขั้นปรับแต่ง**: ไม่มี accordion/dropdown เหลืออยู่เลย — เมนู "อยากปรับส่วนไหน?" เป็นการ์ดใหญ่โชว์พรีวิวสิ่งที่ใส่อยู่ → กดส่วน (หรือแตะบนชุด) → การ์ดตัวเลือกใหญ่ 3 คอลัมน์ของส่วนนั้นอย่างเดียว
- **Progressive disclosure**: ลาย/สีเฉพาะส่วน ซ่อนหลังลิงก์ "อยากให้ส่วนนี้ใช้ผ้า/สีต่างจากทั้งชุด?" — เปิดเมื่อขอเท่านั้น
- **ขั้นเลือกผ้าแบบ Pinterest**: การ์ดรูปผ้าใหญ่ 2 คอลัมน์ + คำโปรยเข้าใจง่าย (เช่น "ย้อมครามธรรมชาติ · สกลนคร") ไม่มีศัพท์เทคนิค
- **ขั้นเลือกสี**: สวอตช์ใหญ่พร้อมชื่อสีไทย — ไม่มี RGB/HEX
- **ขั้นสรุป**: tags + ราคา + CTA "สั่งตัดชุดนี้" + แก้ไขเพิ่ม/เก็บแบบนี้ไว้
- **AI ย้ายเป็น bottom sheet** เรียกจากปุ่ม "ให้ AI จัดให้" — ไม่กินพื้นที่จนกว่าจะอยากได้แรงบันดาลใจ

### ทดสอบ end-to-end ใน preview ผ่านครบ
เทมเพลต→ปรับแต่ง (การ์ดส่วน 6 ใบ + ปุ่ม AI) → ผ้าคราม applied บนชุด → สีแดงเข้ม applied → สรุป (ราคา 2,570 ตรงสูตร, tags ครบ, CTA อยู่) → แก้ไขเพิ่มย้อนกลับได้ → advanced ซ่อน/เปิดตามสั่ง | ไม่มี `select`/accordion ในทั้งหน้า | `tsc` ผ่าน | console สะอาด
(หมายเหตุการทดสอบ: เช็คใน eval เดียวข้าม framer transition ไม่ได้เพราะ rAF โดน throttle — ต้องแยก eval ต่อขั้น)

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

---

## 2026-07-07 (รอบสี่) — Marketplace: สินค้าพร้อมขาย + ตะกร้า + Checkout + PromptPay QR

**ทำโดย**: Claude (Fable 5)

**บริบท**: ผู้ใช้ให้เปลี่ยนโฟกัสจากงาน Garment Builder (3D/SVG) มาทำ flow ใหม่: สำหรับ "สินค้าที่มีอยู่แล้วไม่ต้องสั่งตัด/custom" ให้ทำเป็นรูปแบบ marketplace — ตะกร้า + checkout จ่ายด้วย QR พร้อมเพย์ (งาน garment-builder ที่ทำค้างไว้ถูกพักไว้ ไฟล์ที่มีอยู่ยังไม่ลบทิ้ง)

### พบว่า schema เดิมรองรับไม่ได้
สำรวจแล้วพบว่า `orders`/`payments` เดิมออกแบบมาสำหรับสั่งตัด/ทอแบบ 1 ออเดอร์ = 1 ร้านเท่านั้น ไม่มีตาราง `products`/`cart` สำหรับสินค้าพร้อมขายเลย — หน้า `/cart`, `/checkout` เดิมเป็น mock data ล้วน (ดู deflect.md D3 เดิม), และ `backend/src/routes/products.ts` เดิม map มาจาก `shop_fabrics` แต่ไม่มีใครเรียกใช้จริงจาก frontend (dead code)

### Database (migration ใหม่ + apply ตรงกับ DB จริงบน Supabase)
- `backend/migrations/003_marketplace_products.sql`: เพิ่ม `products` (ผูก shop_id), `product_order_groups` (1 checkout = 1 ที่อยู่/1 payment แม้มีของหลายร้าน), `product_orders` (แยกย่อยตามร้าน ใช้ `order_status` enum เดิมร่วมกับ orders/weaving_orders), `product_order_items`, `product_order_status_logs` + เพิ่มคอลัมน์ `payments.product_order_group_id` (ขยาย CHECK constraint เดิม)
- `backend/_seed_demo_products.js` — seed สินค้าพร้อมขาย 10 รายการ (กระเป๋า/ผ้าไหม/ผ้าฝ้าย/ผ้าพันคอ ฯลฯ เนื้อหา/รูปคัดจาก mock-data) ผูกกับร้านสาธิต 4 ร้านเดิมตามจังหวัด

### Backend (Express)
- `products.ts` — เขียนใหม่ทั้งหมด query ตาราง `products` ใหม่ (เดิม dead code)
- `product-orders.ts` (ใหม่) — `POST /` สร้างออเดอร์จากตะกร้าใน transaction เดียว: validate ราคา/สต็อกจริงจาก DB (กันลูกค้าปลอมยอด), หักสต็อกจริง, แยกเป็น sub-order อัตโนมัติตามร้าน (คนละร้าน = คนละ `product_orders` แต่อยู่ใน group เดียวกัน); `GET /group/:groupId`, `GET /` (role-based เหมือน orders.ts), `PATCH /:id/status` (state machine เดียวกัน)
- `payments.ts` — ขยายรับ `productOrderGroupId` เพิ่มจาก orderId/weavingOrderId เดิม — **QR ใบเดียวจ่ายทั้งตะกร้าได้แม้มีของจากหลายร้าน**, ตอน confirm อัปเดตทุก sub-order ในกลุ่มเป็น pending_confirm + แจ้งเตือนทุกร้านที่เกี่ยวข้องแยกกัน
- `db.ts` — เพิ่ม `getClient()` สำหรับ transaction (BEGIN/COMMIT/ROLLBACK)
- Mount route ใหม่ใน `app.ts`

### Frontend (Next.js)
- `lib/cart-store.ts` (ใหม่) — ตะกร้าเก็บ localStorage ผ่าน zustand (add/remove/updateQuantity/clear)
- `components/product/ProductDetailView.tsx` — ปุ่ม "สั่งซื้อเลย" เดิม `alert()` placeholder → ถ้าเป็นสินค้าจริงจาก backend (`isLive` + `isCustomizable === false`) เพิ่มลงตะกร้าจริงแล้วพาไปหน้าตะกร้า
- `app/product/[id]/page.tsx` — ลองดึงสินค้าจริงจาก `GET /api/products/:id` ก่อน (ISR revalidate 60s) ถ้าไม่เจอ fallback เป็น mock-data เดิม (ไม่กระทบหน้าสินค้า mock เดิมที่มีอยู่)
- `app/cart/page.tsx` — เขียนใหม่ใช้ cart store จริงแทน mock (`initialMockCartItems`) — ตัดฟีเจอร์ coupon/saved-for-later ที่เป็น mock ล้วนออกเพราะไม่ผูกกับอะไรจริง
- `app/checkout/page.tsx` — เขียนใหม่: ฟอร์มที่อยู่ → สร้างออเดอร์จริง (`POST /api/product-orders`) → สร้าง payment จริง (`POST /api/payments`) → แสดง QR พร้อมเพย์จาก backend (ไม่ generate เองฝั่ง client เหมือนเดิม) → "ฉันโอนเงินแล้ว" ยืนยันจริง (`POST /api/payments/:id/confirm`) → เคลียร์ตะกร้า → หน้าสำเร็จ
- `app/orders/product/[groupId]/success/page.tsx` (ใหม่) — หน้าสรุปหลังชำระเงิน ดึงข้อมูลจริงจาก `GET /api/product-orders/group/:groupId` แสดงแยกตามร้าน
- `app/merchant/orders/page.tsx` — เพิ่ม `kind: "product"` เข้าไปในรายการออเดอร์ของร้าน (ดึงจาก `/api/product-orders` เพิ่มจาก orders/weaving-orders เดิม) ร้านยืนยัน/อัปเดตสถานะออเดอร์สินค้าพร้อมขายได้จากหน้าเดียวกัน
- `lib/mock-data.ts` — เพิ่ม field `isLive?`, `shopId?` ใน `Product` interface (ใช้แยกสินค้าจริงจาก backend vs mock demo)

### ทดสอบแล้ว
- ✅ `_test_marketplace_flow.js` (ใหม่): ตะกร้าสินค้าจาก 2 ร้านต่างกัน → payment เดียว (fee 5%) → confirm → ทั้งสอง sub-order เป็น pending_confirm → ร้านหนึ่งยืนยัน อีกร้านไม่กระทบ → invalid transition ถูก reject → สต็อกหักถูกต้อง
- ✅ รัน `_test_flow.js` เดิมซ้ำ (weaving + cutting flow) → ไม่มี regression จากการแก้ `payments.ts`
- ✅ `tsc --noEmit` ทั้ง backend/frontend ผ่าน, `next build` ผ่านทุก route
- ✅ ทดสอบใน browser: หน้าสินค้าโหลดข้อมูลจริงจาก DB ถูกต้อง (ราคา/สต็อก/ชื่อร้าน), `/cart`+`/checkout` redirect ไป login ถูกต้องเมื่อไม่ได้ล็อกอิน, ปุ่มสั่งซื้อ gate ด้วย auth ถูกต้อง ไม่มี console error
- พบบั๊กเดิมที่ไม่เกี่ยวกับงานนี้ระหว่างตรวจ: `ProductDetailView.tsx` มี hardcoded "ชุมชนหริภุญชัย - ลำพูน" แทนที่จะโชว์ `product.community`/`product.province` จริง (ทุกหน้าสินค้าโชว์ข้อความเดียวกันหมด) — spawn task แยกไว้แล้ว ไม่แก้ในรอบนี้

**ค้าง** (บันทึกไว้ใน deflect.md D3 ด้วย): หน้า merchant สร้างสินค้ายังไม่ต่อ API จริง (ใช้ seed script แทน), หน้า `/orders` ประวัติออเดอร์ลูกค้ายังเป็น mock ไม่รวม product_orders, ค่าส่งเป็นค่าคงที่ยังไม่คำนวณจริงตามระยะทาง/น้ำหนัก

---

## 2026-07-07 (รอบห้า) — ปุ่ม "เพิ่มลงตะกร้า" ทุก ProductCard + Modal ธีมเว็บแทน alert/confirm

**ทำโดย**: Claude (Fable 5)

**บริบท**: ต่อยอดจากรอบสี่ — เพิ่มปุ่มเพิ่มลงตะกร้าให้สินค้าทุกใบ (ไม่ใช่แค่หน้า detail) + เปลี่ยน `alert()`/`confirm()` ทั้งเว็บเป็น Modal/Toast ธีมเดียวกับเว็บ

### AppModalProvider (ใหม่) — modal/toast กลาง แทน alert/confirm
- `components/providers/AppModalProvider.tsx` — context ให้ `showAlert()`, `showConfirm()` (คืน Promise<boolean>), `showToast()` — ดีไซน์ธีม navy/gold, ฟอนต์ Kanit, มุมโค้ง, ไอคอนตาม tone (info/success/warning), ปุ่ม danger สีแดง; toast เป็น pill ลอยล่างมีไอคอนตะกร้า/เช็ค
- mount ใน `app/layout.tsx` (ครอบใน AuthProviderWrapper)
- แทน alert/confirm ครบทุกจุด: `gen-silk` (3), `orders/page` confirm ยกเลิกออเดอร์ → showConfirm danger, `orders/[id]` (3 alerts), `PatternGallery` (1 alert เบลนด์เกิน 3 ลาย), `ProductDetailView` (สั่งทำ → showConfirm ชวนไปห้องออกแบบ) — ตรวจแล้วไม่เหลือ raw alert/confirm ในโค้ด (เหลือแค่ comment)

### ปุ่มเพิ่มลงตะกร้าทุก ProductCard
- `components/home/ProductCard.tsx` — เพิ่มปุ่ม "เพิ่มลงตะกร้า" เต็มความกว้างใต้ราคา (ใช้ทุกที่ที่มี ProductCard: หน้าแรก NewArrivals/Recommended/Explore, ฯลฯ) — คลิกแล้ว `stopPropagation` กันไม่ให้เด้งเข้าหน้า detail, addItem + toast "เพิ่มลงตะกร้าแล้ว"
- `ProductDetailView.tsx` — แยกปุ่มเป็น "เพิ่มลงตะกร้า" (outline) + "สั่งซื้อเลย" (ทอง) สำหรับสินค้าพร้อมขาย; งานสั่งทำแสดงปุ่มเดียว "สั่งทำเลย" → modal ชวนไปห้องออกแบบ (ทั้ง desktop 2 ปุ่ม + mobile bottom bar ปุ่มไอคอน+ปุ่มหลัก)

### เชื่อมสินค้าจริงเข้าหน้าเว็บ (marketplace ใช้ได้จริงทั้งเว็บ)
- `lib/live-products.ts` (ใหม่) — helper แชร์ระหว่าง server/client: `fetchLiveProducts()`, `fetchLiveProduct(id)`, `mapLiveProduct()` (map สินค้าจริงจาก backend → Product shape เดิม, isCustomizable:false + isLive:true)
- `lib/use-live-products.ts` (ใหม่) — hook โหลดสินค้าจริงพร้อม module-level cache (หลาย section บนหน้าเดียว fetch ครั้งเดียว) + fallback เป็น mock อัตโนมัติเมื่อ backend ไม่พร้อม
- เปลี่ยนหน้าแรก (NewArrivals/Recommended/Explore) + หน้า search มาใช้ `useLiveProducts()` → สินค้าที่โชว์เป็นของจริงจาก DB ที่ตะกร้า/checkout ใช้งานได้จริงครบวงจร
- `product/[id]/page.tsx` — refactor ใช้ `fetchLiveProduct` จาก lib ใหม่ (เดิม inline)
- `components/layout/TopNav.tsx` — badge ตะกร้าเดิม hardcode `MOCK_CART_COUNT=2` → อ่านจำนวนจริงจาก cart store (อ่านหลัง mount กัน hydration mismatch) + คลิกไอคอนตะกร้าไป `/cart`

### ทดสอบแล้ว
- ✅ `tsc --noEmit` + `next build` ผ่าน (prerender 80 หน้า)
- ✅ browser จริง: หน้าแรกมีปุ่มเพิ่มลงตะกร้า 22 ปุ่ม, คลิกแล้ว toast เด้ง + badge ตะกร้าอัปเดต 0→1 + persist localStorage เป็นสินค้าจริงจาก DB ("ผ้าคลุมไหล่ลายขิด"), สินค้าพร้อมขายโชว์ปุ่ม เพิ่มลงตะกร้า+สั่งซื้อเลย, สินค้าสั่งทำโชว์ปุ่มเดียว→เปิด Modal ธีมเว็บ (title/ปุ่มไปห้องออกแบบ/ไว้ทีหลัง ครบ), ไม่มี console error

---

## 2026-07-07 (รอบสาม) — แก้ "Invalid or expired token" (ต้นตอจริง) + Redesign หน้า Checkout

**ทำโดย**: Claude (Fable 5)

### แก้บั๊ก token (ต้นตออยู่ backend ไม่ใช่ client)
- **ต้นตอ**: Supabase เซ็น access token ด้วย ES256 (asymmetric keys — ค่า default โปรเจกต์ใหม่) แต่ `backend/src/middleware/auth.ts` verify ด้วย HS256 shared secret → token ถูกต้องก็โดน 401 ตลอด
- **แก้ backend**: verify ผ่าน JWKS ด้วย `jose` (ลำดับ: JWKS ES256 → HS256 legacy → dev JWT) + เพิ่ม `SUPABASE_URL` ใน `.env` | ยืนยันแล้ว `/api/auth/me` ตอบ 200
- **เสริม client**: `frontend/lib/api-auth.ts` — `authFetch` ดึง token สดจาก supabase ทุก request, refresh อัตโนมัติเมื่อใกล้หมดอายุ, retry เมื่อ 401, `SessionExpiredError` → ข้อความไทย + พาไป login | ใช้ใน checkout + weaving-order
- แก้ checkout เด้งไป login ทั้งที่ล็อกอินอยู่: รอ `authLoading` เสร็จก่อนค่อยตัดสิน (เดิมเช็ค `user` ตอน auth ยังโหลดไม่เสร็จ)
- สร้างบัญชีลูกค้าทดสอบจริงใน Supabase Auth: `demo@laya.test` / `laya-demo-1234` (`backend/_create_test_auth_user.js`)

### Redesign หน้า Checkout (`app/checkout/page.tsx`)
- 3 ขั้นในหน้าเดียว: **ที่อยู่ → ตรวจสอบ → สแกนจ่าย** — stepper ใหม่มี label + เช็คทอง, ป้าย "ปลอดภัย"
- แถบสรุปตะกร้าย่อบนขั้นแรก (thumbnail ซ้อน + จำนวนชิ้น/ร้าน + ยอดรวม)
- ขั้นตรวจสอบ**จัดกลุ่มสินค้าตามร้านค้า** + การ์ดที่อยู่แก้ไขได้ + hint "จ่ายครั้งเดียวครบทุกร้าน"
- ขั้นจ่าย: การ์ด QR แบบ Thai QR Payment (header กรมท่า, กรอบทองเส้นประ, นับถอยหลัง, ปุ่มแสดง QR ใหม่เมื่อหมดเวลา) + ขั้นตอนจ่าย 3 ข้อ
- Sticky CTA บอกยอด + เปลี่ยนสีทองในขั้นจ่าย | validate เบอร์โทร 10 หลักขึ้นต้น 0

### ทดสอบ end-to-end จริง (login จริง demo@laya.test)
- login → /checkout → กรอกที่อยู่ → ตรวจสอบ → สร้างออเดอร์ลง DB (total 6,500 = 850+2,800×2+50) → payment (fee 5% = 325, payout 6,175) → กด "ฉันโอนเงินแล้ว" → pay_status = paid → หน้า "สั่งซื้อสำเร็จ" → ตะกร้าเคลียร์ ✓
- ยืนยันเคส 401: authFetch refresh + retry ทำงานจริง (เห็นใน network log) ก่อนแก้ backend
- `tsc` ผ่านทั้งสองฝั่ง

---

## 2026-07-08 — Checkout map/geo, merchant CRUD, notifications จริง, หน้าหมวดหมู่, ย้ายแผนที่

**ทำโดย**: Claude (Sonnet 5)

โจทย์ต้นทาง (ผู้ใช้สรุปเป็นข้อความเดียวยาว): ปรับ checkout ให้ปักหมุด+เลือกจังหวัด/อำเภอ/ตำบล, redesign checkout, เปิดให้พ่อค้าแม่ค้าลงขายของจริง, เอา mock data ออกทั้งโปรเจกต์, notification ต่อของจริง, เพิ่มหน้าหมวดหมู่แยกจากชุมชน, ย่อแผนที่ให้พอดีจอแล้วย้ายไป `/community/heritage`, เอาปุ่มเพิ่มตะกร้าออกจากหน้ารายการเหลือแค่ `/product/[id]`

### 1. Checkout: แผนที่ปักหมุด + จังหวัด/อำเภอ/ตำบลจริง — เสร็จ
- ใช้ **OpenStreetMap/Leaflet** แทน Google Maps (ผู้ใช้เลือกเองเพราะไม่มี API key) — `components/checkout/LocationPickerMap.tsx` ปักหมุด + reverse geocode ผ่าน Nominatim
- ข้อมูลภูมิศาสตร์จริง 77 จังหวัด/930 อำเภอ/7,452 ตำบล (จาก `kongvut/thai-province-data`) → ย่อเก็บที่ `public/thai-geo/*.json` (fetch ฝั่ง client ไม่ยัดใน JS bundle)
- `components/checkout/AddressGeoFields.tsx` — cascading province→district→subdistrict พร้อม auto-fill รหัสไปรษณีย์ (แก้บั๊ก state ไม่ถูก populate ตอนโหลดหน้าใหม่ระหว่างทาง)
- เพิ่มคอลัมน์ `lat/lng` ใน `product_order_groups` (migration `004_checkout_location.sql`) + ต่อเข้า `POST /api/product-orders`
- ทดสอบเต็มวงจรจริง: login demo@laya.test → เลือกที่อยู่เชียงใหม่/จอมทอง/ข่วงเปา (auto zip 50160 ตรง) → ปักหมุดสวนอัมพร → สั่งซื้อ ฿6,500 จ่ายสำเร็จ

### 2. ระบบพ่อค้าแม่ค้าลงขายสินค้าจริง — เสร็จ
- `backend/src/routes/products.ts` เขียนใหม่ทั้งไฟล์: `GET/POST /api/products`, `GET /mine`, `PUT/PATCH status/DELETE /:id` (ลบแบบ soft-delete อัตโนมัติถ้าเคยมีออเดอร์อ้างอิง — กัน FK error)
- `components/merchant/ProductForm.tsx` + หน้า create/edit ต่อ `authFetch` ครบ
- **เจอบั๊กใหญ่ 2 ตัวที่บล็อกอยู่ก่อนหน้านี้ (ไม่เกี่ยวกับงานนี้โดยตรงแต่บล็อกการทดสอบ) และแก้ให้แล้ว**:
  1. `auth-context.tsx` → `buildUser()` map field ผิด (`profile.shop_id` ที่จริง backend ส่ง `shopId`) → role ร้านค้าเพี้ยนเป็น "customer" เสมอมาตลอดทั้งโปรเจกต์ (RoleGuard เด้งร้านค้าออกจากหน้าตัวเอง)
  2. `onAuthStateChange` ไม่มี guard กันซ้ำ → ยิง `/api/auth/sync` + `/api/auth/me` วนซ้ำเป็นร้อยครั้ง/วิ — ใส่ idempotency guard ด้วย `useRef`
- ทดสอบเต็มวงจร: สร้าง/แก้ไข/ปิดขาย/ลบสินค้าจริงผ่านบัญชี merchant-demo@laya.test — ยืนยันผลใน DB ทุกขั้น

### 3. Notifications ต่อของจริง — เสร็จ
- `lib/notification-context.tsx` เขียนใหม่ (เดิม mock array ล้วน) — ดึงจาก `GET /api/notifications`, refresh ทุก 60s, Thai relative time, สร้าง href จาก payload
- `TopNav` bell แสดง unread count จริง + คลิกไปหน้า `/notifications`
- ทดสอบ: เห็นแจ้งเตือน "ชำระเงินสำเร็จ" จริงจากการสั่งซื้อก่อนหน้า, กด "อ่านทั้งหมด" แล้วยืนยัน `is_read=true` ใน DB

### 4. เอาปุ่มเพิ่มตะกร้าออกจากหน้ารายการ — เสร็จ
- ลบปุ่ม+logic ออกจาก `components/home/ProductCard.tsx` (ใช้ในหน้ารายการทุกหน้า: home, search, category) — เหลือปุ่มเดียวที่ `/product/[id]` (`ProductDetailView.tsx`) ยืนยันด้วย grep ว่าไม่มีจุดอื่นเรียก `useCartStore`/`addItem` แล้ว

### 5. หน้าหมวดหมู่สินค้าใหม่ แยกจากหน้าชุมชน — เสร็จ
- `app/category/page.tsx` ใหม่ — chip เลือกหมวด (ผ้าผืน/เสื้อผ้า/ผ้าพันคอ/กระเป๋า/ของฝาก/ของตกแต่งบ้าน/อื่นๆ) + grid สินค้า fetch ตรงจาก backend (`fetchLiveProducts({ category })`, ไม่ fallback mock เพื่อไม่ให้หมวดว่างโชว์สินค้าไม่เกี่ยวกัน)
- เพิ่ม `category` field ใน `Product` + ให้ `mapLiveProduct` ส่งต่อค่าจริง + `fetchLiveProducts` รับ filter param (`category`/`province`/`search`) — backend รองรับอยู่แล้วไม่ต้องแก้
- เปลี่ยนลิงก์ `CategorySection.tsx` (หน้าแรก) และ `TopNav` "หมวดหมู่" จาก `/community?category=` (พารามิเตอร์ตายที่หน้า community ไม่เคยอ่านเลย) → `/category`
- ทดสอบ: filter "กระเป๋า" คืน 2 รายการถูกต้องจาก backend จริง

### 6. ย้ายแผนที่ → `/community/heritage` + ย่อให้พอดีจอ — เสร็จ
- แตกไฟล์ `/map/page.tsx` (~1,000 บรรทัด) เป็น component `components/community/ThailandFabricMap.tsx` แบบฝังได้ (ตัดโค้ดตายที่ไม่ได้ใช้ 2 ตัวออก: `ProvinceSheet`, `RegionFilter`)
- **บั๊กจริงที่ทำให้แผนที่ล้นจอ**: SVG ไม่มี height กำหนด อาศัย intrinsic aspect ratio 520:700 (สูงกว่ากว้าง) แต่ container ใช้ `overflow-hidden` → แผนที่โดนตัดครึ่ง ไม่เห็นเต็ม — แก้ด้วย `flex flex-col h-full` + SVG `flex-1 min-h-0` + `preserveAspectRatio` แล้วครอบ section ด้วยความสูงคงที่ `min(78vh, 640px)`
- ฝังเป็น section ใหม่ใน `HeritageStory.tsx` (คั่นระหว่างภาพผ้าแพรวากับส่วน "มรดกที่สืบทอด")
- ลบ route `/map` ทิ้ง, อัปเดตลิงก์ `TopNav`/`BottomNav`/`sitemap.ts` ไปที่ `/community/heritage` ทั้งหมด
- แถมแก้บั๊กเล็ก: `TopNav` ไฮไลต์ "ชุมชน" กับ "แผนที่" พร้อมกันตอนอยู่หน้า `/community/heritage` (path ซ้อนกัน) — แก้ให้เลือก path ที่ตรงที่สุดอันเดียว
- ทดสอบ: โหลด GeoJSON + รูปลายผ้า 76 จังหวัดสำเร็จ, สลับ map/list view ได้, ไม่มี error ใน console/server, `tsc --noEmit` ผ่าน

### ค้างไว้ (ดูรายละเอียดที่ deflect.md)
- **ลบ mock data ทั้งหมด** — ยังไม่ได้ทำ ขอบเขตใหญ่ (28 ไฟล์ยัง import จาก `lib/mock-data.ts`) ตั้งใจแยกไปทำเป็นรอบเฉพาะ

---

## 2026-07-08 (รอบสอง) — Production readiness + สมุดที่อยู่ลูกค้า + แก้แผนที่ heritage

**ทำโดย**: Claude (Sonnet 5)

โจทย์: อ่าน history/deflect/backlog แล้วดำเนินงานต่อ, เช็ค API/token ให้พร้อม production, เอา "แผนที่" ออกจาก top bar, แก้แผนที่ `/community/heritage` โหลดช้า/ไม่โหลด, และหลักๆ คือทำให้ซื้อขายสะดวก + บันทึกที่อยู่ลูกค้าได้

### 1. Production readiness — ตรวจแล้วพบ 2 ปัญหา แก้ได้ 1, อีก 1 ต้องตัดสินใจ
- **แก้แล้ว**: CORS bug ใน `backend/src/app.ts` — ตั้งค่า `ALLOWED_ORIGINS` ไว้แต่โค้ดจริงใช้ `cors({ origin: true })` เปิดรับทุก origin เสมอไม่ว่า production หรือไม่ — เปลี่ยนให้ `NODE_ENV=production` เช็คกับ `ALLOWED_ORIGINS` จริง, dev ยังเปิดกว้างเหมือนเดิม
- **ต้องตัดสินใจ (บันทึกใน deflect.md D11, D2)**: (1) backend ยังไม่มี hosting config เลย (ไม่มี render.yaml/railway.json/Dockerfile) — มีแค่ frontend ที่พร้อม deploy Vercel, (2) `PROMPTPAY_ID` ยังเป็นเลขทดสอบทั้งสองฝั่ง — ต้องรอเลขจริงจากเจ้าของธุรกิจ
- Token/JWKS (แก้ไปแล้วรอบก่อน) ยังทำงานถูกต้อง — ไม่มีอะไรต้องแก้เพิ่ม

### 2. เอา "แผนที่" ออกจาก TopNav (desktop) — เสร็จ
- `components/layout/TopNav.tsx` — ลบ nav item "แผนที่" ออกจาก `navLinks` ตามคำขอ (เหลือ 4 เมนู: หน้าหลัก/สำรวจ/หมวดหมู่/ชุมชน) — คง Map icon ใน BottomNav (มือถือ) ไว้ตามเดิมเพราะผู้ใช้ระบุเจาะจง "top bar"

### 3. แก้แผนที่ `/community/heritage` โหลดช้า/ไม่โหลด — เสร็จ
- **ต้นตอที่แท้จริง**: `components/community/ThailandFabricMap.tsx` fetch GeoJSON (167KB) จาก `raw.githubusercontent.com` ตรงๆ ทุกครั้งที่เปิดหน้า — external dependency ไม่มี fallback, และเมื่อ fetch fail จะ catch เงียบๆ ปล่อยให้แผนที่ว่างเปล่าไม่มีข้อความ error ใดๆ (ดูเหมือน "ไม่โหลดเลย")
- **แก้**: ดาวน์โหลดไฟล์เก็บไว้ในเครื่องเอง (`public/thai-geo/thailand-provinces.geojson`) โหลดจาก same-origin แทน — เร็วขึ้นและไม่พังเวลาเน็ตหลุด/GitHub ช้า/rate-limit
- เพิ่ม UI แจ้ง error + ปุ่ม "ลองใหม่" แทนโชว์ว่างเงียบๆ เมื่อโหลดไม่สำเร็จจริงๆ

### 4. สมุดที่อยู่ลูกค้า (US ใหม่ — ไม่มีใน backlog เดิม แต่ผู้ใช้ขอตรงๆ) — เสร็จ
- Migration `005_customer_addresses.sql` — ตาราง `customer_addresses` (label, ผู้รับ, เบอร์, ที่อยู่เต็ม, lat/lng, is_default) apply เข้า DB จริงแล้ว
- `backend/src/routes/addresses.ts` (ใหม่) — `GET/POST/PATCH/DELETE /api/addresses`: ที่อยู่แรกของ user เป็น default อัตโนมัติ, ตั้ง default ใหม่แล้วอันเก่าเปลี่ยนตาม, ลบ default แล้วอันล่าสุดที่เหลือขึ้นเป็น default แทนอัตโนมัติ (กันไม่มี default เลย) — mount ใน `app.ts`
- `app/checkout/page.tsx` — โหลดสมุดที่อยู่ตอนเข้าหน้า (เลือก default ให้อัตโนมัติ), แสดงเป็นการ์ดเลือกได้ (ชื่อ/เบอร์/ที่อยู่/ป้าย default, ลบได้จากการ์ด), ปุ่ม "เพิ่มที่อยู่ใหม่" เปิดฟอร์มเดิม (แผนที่ปักหมุด + AddressGeoFields) พร้อม checkbox "บันทึกที่อยู่นี้ไว้ใช้ครั้งหน้า" (บันทึกแบบ best-effort ไม่บล็อกการสั่งซื้อถ้าเซฟไม่สำเร็จ)
- ทดสอบ e2e จริงกับ DB (`_test_addresses_flow.js`): สร้างที่อยู่แรก→default อัตโนมัติ ✓, ที่อยู่ที่สอง→ไม่ default ✓, ตั้ง default ใหม่→อันเก่าเปลี่ยนตาม ✓, ลบ default→อันที่เหลือขึ้นแทนอัตโนมัติ ✓
- `tsc --noEmit` + `next build` ผ่านทั้งสองฝั่ง — ยังไม่ได้เปิดดูจริงใน browser (dev server ของอีก session ล็อกพอร์ต 3000/4000 อยู่เหมือนเดิม)

### ค้างไว้ / ยังไม่ทำ (ผู้ใช้ระบุเป็น "ต่อมา" — ขอบเขตใหญ่ ต้องแยกรอบ)
1. **Flow สั่งตัด + ออกแบบลายผ้า + generate ลายผ้า** — ตาม 3 flow diagram ที่แนบ (สั่งตัดด้วยผ้าที่มี / สั่งตัดไม่มีผ้า+AI Stylist / สั่งทอผ้า+AI Pattern) — งานใหญ่ระดับ AI pipeline + UI multi-step ใหม่ทั้งหมด
2. **Virtual Try-On แบบเต็ม** — อัปโหลดรูปเต็มตัว หรือกรอกน้ำหนัก/ส่วนสูง/รอบเอว ให้ AI ประมาณขนาดที่ใกล้เคียง — ต้องมี AI model/API สำหรับ body estimation
3. **Theme redesign ทั้งเว็บ** — มินิมอล ลักชูรี พรีเมียม ไม่รก — กระทบทุกหน้า ต้องวางแนวทางดีไซน์ก่อนลงมือ

ทั้ง 3 ข้อนี้เป็นงานขนาดใหญ่ที่ควรแยกเป็นรอบเฉพาะ ไม่ได้เริ่มในรอบนี้ (ดูสรุปในข้อความตอบกลับผู้ใช้)

---

## 2026-07-08 (รอบสาม) — เริ่ม Theme Redesign: มินิมอล/ลักชูรี/พรีเมียม/ไม่รก

**ทำโดย**: Claude (Sonnet 5)

โจทย์: ผู้ใช้เลือกให้เริ่มเฟส "Theme redesign" ก่อน (จาก 3 ตัวเลือก: theme / virtual try-on / tailoring flow) — ส่วน AI image generation รอบหน้าจะเปลี่ยนมาใช้ OpenAI (บันทึกไว้สำหรับตอนทำ flow สั่งตัด/ออกแบบลาย)

### สำรวจก่อนแก้
- ตรวจ `lib/theme.ts` (MUI theme) พบว่า foundation ดีอยู่แล้ว (navy #1B2A4A + gold #C5A55A, ฟอนต์ Kanit, radius/shadow tokens สม่ำเสมอ) — จุดที่ "รก" จริงๆ ไม่ใช่สีหรือ component styling แต่เป็น **โครงสร้างหน้าแรกที่มี 10 section ซ้อนกัน** ซึ่ง 2 ใน 10 ซ้ำซ้อนกับของที่มีอยู่แล้ว
- ตรวจ `ProductCard.tsx` และ `TopNav.tsx` แล้วพบว่าออกแบบมาดีอยู่แล้ว (whitespace เพียงพอ, badge/ไอคอนจำกัดเฉพาะจำเป็น) — ไม่แตะ

### 1. Declutter หน้าแรก — เสร็จ
- `app/page.tsx`: ตัด `NewArrivalsSection` ออก (โชว์กริดสินค้าเดิมซ้ำกับ `RecommendedSection` แค่ label ต่างกัน) และตัด `ExploreSection` ออก (mini-browse เต็มรูปแบบ 393 บรรทัด มี filter/search/grid-list toggle ของตัวเอง ซ้ำซ้อนกับหน้า `/search` และ `/category` ที่มีอยู่แล้ว)
- หน้าแรกเหลือ 8 section ที่ไม่ซ้ำกันเลย: Hero → Banner → Category → Recommended → Editorial (heritage) → Communities → Mission (quote) → Inspiration
- ไฟล์ `NewArrivalsSection.tsx`/`ExploreSection.tsx` ยังอยู่ในโปรเจกต์ (ไม่ได้ลบ) เผื่อเอาไปใช้ที่อื่นภายหลัง — แค่เอาออกจากหน้าแรก

### 2. ยกระดับ Typography ให้พรีเมียมขึ้น — เสร็จ
- `components/home/SectionHeader.tsx` (component กลางที่ section ต่างๆ เรียกใช้ร่วมกัน) — เปลี่ยน title จาก Kanit bold ธรรมดา → **Cormorant Garamond ตัวเอียง** (serif italic) แบบเดียวกับที่ `EditorialSection`/`HeritageStory` ใช้อยู่แล้ว
- แก้จุดเดียวแต่กระทบ 5 ไฟล์ที่เรียกใช้ `SectionHeader` ทันที (`CategorySection`, `CommunitiesSection`, `RecommendedSection`, `HeritageStory`, และเดิม `NewArrivalsSection`) → ภาษาภาพรวมทั้งเว็บเป็นแนวเดียวกันมากขึ้น (editorial/luxury แทนที่จะเป็น generic app font ธรรมดา)

### ทดสอบแล้ว
- `tsc --noEmit` + `next build` ผ่านทั้งหมด (prerender สำเร็จทุกหน้า)
- รัน production build บนพอร์ตแยก (3099) ยืนยันด้วย curl ว่าหน้าแรกไม่มี "มาใหม่ล่าสุด" (NewArrivals) เหลืออยู่แล้วจริง, เหลือแค่ "คัดสรรสำหรับคุณ" (Recommended) เป็น product grid เดียว

### ค้างไว้ (theme redesign เป็นงานต่อเนื่อง ยังไม่ครบทุกหน้า)
- รอบนี้โฟกัสหน้าแรก + component กลาง (SectionHeader) เป็นจุดเริ่ม — หน้าอื่นๆ (checkout เพิ่งรีดีไซน์ไปแล้วรอบก่อนหน้าถือว่าอยู่ในธีมพรีเมียมอยู่แล้ว, product detail, community, profile ฯลฯ) ยังไม่ได้ไล่ตรวจทีละหน้า — ทำต่อได้ในรอบถัดไปถ้าต้องการเจาะจงหน้าไหนเพิ่ม

---

## 2026-07-08 (รอบสาม) — bug fixes ย่อย + Redesign Checkout/Cart แบบ luxury

**ทำโดย**: Claude (Sonnet 5)

หมายเหตุ: รอบนี้ทำงานคู่ขนานกับอีก session หนึ่งที่แก้ไฟล์เดียวกันอยู่ (เจอ D9/D13/D14 ที่คนอื่นทำไปแล้วระหว่างทาง) — ทุกจุดที่แก้ด้านล่างเช็คกับโค้ดปัจจุบันจริงก่อนแก้ ไม่ทับงานเดิม

### Bug fixes ย่อย 4 จุดจาก feedback ผู้ใช้
1. **Desktop ไม่มีปุ่มสั่งตัด/สั่งทอ** — เพิ่มลิงก์ "สั่งตัด/สั่งทอ" → `/services` ใน `TopNav.tsx` navLinks
2. **Mobile BottomNav** — เปลี่ยนไอคอน "Map" (`/community/heritage`) เป็น "หมวดหมู่" (`/category`, ไอคอน LayoutGrid) ใน `BottomNav.tsx`
3. **ปุ่ม fav กดไม่ได้** — `TopNav.tsx` ไอคอนหัวใจไม่มี `onClick` เลย เพิ่ม `router.push(user ? "/wishlist" : "/auth/login")` (หน้า `/wishlist` เป็น mock ล้วนอยู่แล้ว — บันทึกไว้ใน deflect.md ว่ายังไม่ต่อ backend จริง)
4. **แผนที่ผ้า default zoom ดูเหมือน 71%** — ต้นตอไม่ใช่ zoom state (มันคือ 100% อยู่แล้ว) แต่เป็น container กว้างกว่าอัตราส่วนแผนที่ (520:700 แนวตั้ง) มาก ทำให้ `preserveAspectRatio="meet"` เหลือขอบขาวข้างเยอะ ดูเหมือนซูมออก — แก้ด้วยการครอบ wrapper ด้วย `aspectRatio: "520/700"` ให้กล่องพอดีเนื้อหาเป๊ะ (ทดสอบแล้ว: สัดส่วนที่ใช้จริงขึ้นจาก 38% เป็น 88% ของความกว้างกล่อง)

### Redesign หน้า Checkout แบบพรีเมียม/หรู (`app/checkout/page.tsx`)
ตามสเปกละเอียดที่ผู้ใช้ให้ (อ้างอิง Jim Thompson/COS/Apple/Stripe) — **ไม่แตะ business logic เดิมเลย** (สมุดที่อยู่, สร้างออเดอร์, payment, confirm — ทั้งหมดที่อีก session เพิ่งต่อเสร็จ) รีเขียนเฉพาะ layout/UI:
- **เดสก์ท็อป: 2-column layout** ซ้าย 66% (เนื้อหาตามขั้น) + ขวา sticky order summary (แก้ปัญหาเดิม: checkout กว้างแค่ 430px คงที่แม้จอกว้าง 1440px เหลือพื้นที่ว่างมหาศาล)
- Stepper ใหม่ใหญ่ขึ้น เส้นเชื่อมหนาขึ้น, gold=เสร็จ, navy=active
- การ์ดที่อยู่: ไอคอนบ้าน, badge "ค่าเริ่มต้น", hover elevation, "เพิ่มที่อยู่ใหม่" เป็นการ์ดเส้นประ
- ขั้นตรวจสอบ: เพิ่ม **quantity stepper + ปุ่มลบ** ต่อรายการ (ต่อกับ `cartStore.updateQuantity`/`removeItem` จริง ราคารวมคำนวณใหม่ทันที)
- Payment method tabs (PromptPay ใช้งานได้, บัตร/โอน/wallet โชว์ "เร็วๆ นี้" — ยังไม่มี gateway จริงตาม deflect.md D1)
- คูปอง: เพิ่ม UI (collapse + input + ปุ่มใช้) แต่ยังไม่มี backend รองรับ — กดแล้วขึ้นข้อความบอกตรงๆ ว่ายังไม่เปิดใช้งาน (ไม่ fake ว่าใช้ได้)
- Trust badges (SSL/ปลอดภัย/รับประกัน/จัดส่ง) ใต้ปุ่ม CTA ทั้ง sidebar เดสก์ท็อปและแถบมือถือ
- **เจอบั๊กจริงระหว่างทดสอบมือถือ**: ปุ่ม CTA ล่างสุด (`position:fixed bottom:0`) ถูก `BottomNav` (zIndex สูงกว่า, ก็ bottom:0) บังจนกดไม่ได้ — เป็นบั๊กเดิมที่มีอยู่ก่อนแล้ว (ไม่ใช่ผมทำพัง) เพราะ checkout ไม่เคยใส่ offset เหมือนหน้า `/cart` ที่ใช้ `bottom: 56` แก้ไปแล้วก่อนหน้า — แก้ให้ตรงกันแล้ว

### Redesign หน้า Cart (`app/cart/page.tsx`) ให้ธีมเดียวกัน
- อยู่ในสเปก deliverable เดียวกัน (#1 Shopping Cart) — เจอปัญหาเดียวกัน (คอลัมน์แคบ 430px บนจอกว้าง) แก้เป็น 2-column + sticky summary เหมือน checkout
- **เจอบั๊กจริงอีกจุด**: หน้า cart เดิมไม่มีการรอ `authLoading` จาก `useAuth()` เลย (เช็คแค่ `hydrated && !user`) ทำให้ redirect ไป `/auth/login` ทันทีตอน auth ยังโหลดไม่เสร็จ แม้ล็อกอินอยู่จริง — เป็นบั๊กเดียวกับที่ checkout เคยเจอและแก้ไปแล้วเมื่อ 2026-07-06 แต่ไม่เคยพอร์ตมาแก้ที่ cart — แก้ให้เหมือนกันแล้ว
- ทดสอบเต็มวงจรจริงอีกครั้งหลังแก้: login → seed ตะกร้า → `/cart` (ไม่เด้ง login แล้ว) → `/checkout` desktop 2-col ผ่านครบ 3 ขั้น → สร้างออเดอร์+payment จริง → ยืนยันจ่ายจริง → redirect หน้าสำเร็จ → ตะกร้าเคลียร์ ✓ (ทดสอบทั้ง 1440px และ 390px)

### Dev environment note
- Next.js บล็อกไม่ให้รัน dev server ซ้ำในโฟลเดอร์เดียวกัน (ไม่ใช่แค่ port ชนกัน) — ถ้ามีอีก session เปิด `next dev` ค้างอยู่ ต้องปิดของเดิมก่อนถึงจะเปิดใหม่ในเซสชันอื่นได้ ต่อให้ตั้ง `autoPort` ก็ไม่ช่วย (`.claude/launch.json` ตั้ง `autoPort: true` ไว้ให้ทั้งสอง service แล้วเผื่อใช้ port อื่นได้เวลาไม่ชนกัน)

### ต่อระบบ wishlist (รายการโปรด) จริง — เริ่มเจาะ mock data removal (task #3) จาก entity แรก
- Migration 006: ตาราง `wishlist_items` (user_id, product_id, unique constraint กันเพิ่มซ้ำ)
- `backend/src/routes/wishlist.ts` ใหม่: `GET /ids` (เบา ใช้เช็คสถานะหัวใจทั่วแอป), `GET /` (รายละเอียดสินค้าเต็มสำหรับหน้า `/wishlist`), `POST /`, `DELETE /:productId`
- `frontend/lib/wishlist-context.tsx` ใหม่ (pattern เดียวกับ `notification-context.tsx`) — mount ใน `AuthProviderWrapper` คู่กับ `NotificationProvider`
- ต่อเข้าทุกจุดที่มีไอคอนหัวใจ: `ProductCard.tsx` (เดิม `useState(false)` local ไม่ persist ไปไหน), `ProductDetailView.tsx` (เดิม**ไม่มี `onClick` เลย** แค่ไอคอนตกแต่งเฉยๆ), หน้า `/wishlist` (เขียนใหม่ทั้งหน้า ดึงจาก `GET /api/wishlist` จริง แทน `mockFavoriteIds` hardcode เดิม + ปุ่ม "เพิ่มลงตะกร้า" ต่อ cartStore จริงด้วย)
- ทดสอบเต็มวงจรจริง: กดหัวใจจากการ์ดหน้าแรก → ยืนยันด้วย query ตรง `/api/wishlist/ids` ว่าเพิ่มจริง → เข้าหน้า `/wishlist` เห็นสินค้าจริง → กดเอาออก → ยืนยันหายจริง → กดหัวใจจากหน้า product detail → ยืนยันเพิ่มจริงอีกครั้ง (ระวัง: ต้อง scope selector ไปที่ `main` ตอนทดสอบ เพราะ TopNav มีไอคอนหัวใจซ้ำ query ทั่วหน้าจะไปโดนอันของ TopNav แทน)
- คงเหลือจาก task #3: ~27 ไฟล์ที่เหลือยังใช้ mock (ดู deflect.md D9) — ต้องทำทีละ entity ต่อไป

### ต่อระบบ communities จริง — entity ที่สองของ mock data removal (task #3)
- **เจอบั๊กใหญ่ที่ซ่อนอยู่นาน**: `GET /api/communities` เดิม query ตาราง `communities` ซึ่ง**ไม่มีอยู่จริงในฐานข้อมูลเลย** (เป็น route ค้างจาก `schema.sql` เวอร์ชันเก่าที่ถูกแทนที่ด้วย marketplace migrations ไปแล้ว) — endpoint นี้ 500 error มาตลอดถ้ามีใครเรียกจริง เพิ่งมาเจอตอนสำรวจ mock data removal นี้เอง
- ตัดสินใจ: "ชุมชน" ในมุมมองลูกค้าใช้ตาราง `shops` จริงแทน (ร้านค้าที่อนุมัติแล้ว) แทนที่จะสร้างตาราง `communities` ใหม่ซ้ำซ้อน เพราะ `shops` มีข้อมูลจริงอยู่แล้ว (name, province, description, rating, review_count)
- เขียนใหม่ `backend/src/routes/communities.ts`: `GET /` (list จาก shops + นับ product_count จริงต่อร้าน), `GET /:id` ใหม่ (รายละเอียด + description/address จริง)
- Frontend: `lib/communities.ts` ใหม่ (pattern เดียวกับ `live-products.ts`), ต่อเข้า `CommunitiesSection.tsx` (หน้าแรก), `app/community/[id]/page.tsx` (เปลี่ยนจาก `generateStaticParams` แบบ static ที่ผูกกับ mock ID เป็น dynamic fetch จริง), เพิ่ม `shopId` filter ใน `fetchLiveProducts`
- **เขียนใหม่ทั้งหมด `CommunityDetailView.tsx` (423 บรรทัด) — พบว่าเนื้อหาเกือบทั้งหน้าเป็นข้อมูลปลอมที่ซ้ำกันทุกชุมชน (bug เชิงความถูกต้องของข้อมูล ไม่ใช่แค่ "ยังเป็น mock")**:
  - สถิติคงที่ (45 สมาชิก, 28 ผลิตภัณฑ์, 200+ ปี) — เหมือนกันทุกร้านไม่ว่าจะเป็นร้านไหน → แก้เป็นตัวเลขจริงต่อร้าน (product count, rating, review count)
  - เรื่องราวชุมชน hardcode เป็นเรื่องผ้าลำพูนตำนาน 200 ปี — โชว์เหมือนกันแม้เข้าดูร้านอื่นที่ไม่ใช่ลำพูน → แก้เป็น `shops.description` จริงของแต่ละร้าน
  - ที่อยู่ hardcode "ต.ศรีภูมิ อ.เมือง จ.ลำพูน" — เหมือนกันทุกร้าน → แก้เป็นแสดงเฉพาะเมื่อร้านกรอกที่อยู่จริงไว้ (`shops.address`) ไม่งั้นซ่อนไปเลย
  - ช่างทอ 2 คนสมมติชื่อ-ประสบการณ์-ลายเฉพาะตัว เหมือนกันทุกร้าน — ลบออกทั้งหมด (ไม่มี backend entity รองรับข้อมูลช่างทอรายบุคคล ไม่ใช่แค่ยังไม่ต่อ API แต่ยังไม่มีตารางเลย)
  - รีวิวปลอม 1 อัน ("คุณนภา") + กราฟกระจายดาวที่ตั้งค่าคงที่ (90% 5 ดาว) เหมือนกันทุกร้าน — ลบออก เหลือแค่คะแนนรวม/จำนวนรีวิวจริงจากร้าน (ยังไม่มีระบบรีวิวรายข้อความ)
  - **ป้ายรับรอง "GI รับรอง" + "Fair Trade Certified" ที่ไม่มีข้อมูลรับรองจริงรองรับเลย — ลบออก** (นี่คือประเด็นที่สำคัญที่สุด: การอ้างว่าร้านค้าได้รับรอง GI/Fair Trade โดยไม่มีการยืนยันจริงเป็นความเสี่ยงด้านความถูกต้อง/กฎหมายสำหรับธุรกิจจริง ไม่ใช่แค่ "mock data" ธรรมดา)
  - สินค้าที่โชว์เดิมใช้ `products.filter(p => p.hasGI).slice(0,4)` — สุ่มเอาสินค้า GI 4 ชิ้นแรกมาโชว์ไม่ว่าจะเป็นร้านไหน (ไม่ได้กรองตามร้านจริงเลย) → แก้เป็นดึงสินค้าจริงของร้านนั้นจาก `GET /api/products?shopId=`
- แก้ `app/sitemap.ts` ด้วย (เจอว่าใช้ mock `products`/`communities` ทั้งคู่ — sitemap ส่ง URL ปลอมให้ Search Engine มาตลอด) เปลี่ยนเป็น fetch ข้อมูลจริงทั้งสองส่วน
- ทดสอบจริง: `GET /api/communities` และ `/api/communities/:id` ผ่าน curl ตรง, เข้าหน้าแรกเห็น 5 ร้านจริง (4 ร้านจริง + 1 ร้าน demo), คลิกเข้าไปที่ "ชุมชนทอผ้าซิ่นลำพูน" เห็นข้อมูลจริงครบ (เรื่องราว, สถิติ, สินค้า 4 ชิ้นจริง) ไม่มี error
- **ยังไม่แตะ**: `app/community/page.tsx` (ฟีดโซเชียล Pinterest-style) — เป็นฟีเจอร์ใหญ่แยกต่างหาก (โพสต์/ไลก์/คอมเมนต์ปลอมทั้งหมด) ตรงกับ US-509 ใน backlog ที่ยังไม่ทำ ต้องมีตาราง `community_posts` ใหม่ + ตัดสินใจเรื่องฟีเจอร์โซเชียลก่อน ไม่ใช่แค่ต่อ API

---

## 2026-07-10 — `/design-clothes` Desktop Studio Layout (ทำต่อจาก session ก่อนที่ค้างด้วย API error)

**ทำโดย**: Claude (Sonnet 5)

**บริบท**: session ก่อนหน้า (บันทึกไว้ใน `frontend/2026-07-10-165515-hi.txt`) สำรวจ+วางแผนไว้ครบแล้วและผู้ใช้อนุมัติแผน (`~/.claude/plans/precious-percolating-catmull.md`) แต่ยังไม่ได้ implement ไฟล์ไหนเลยตอนโดน API error (`daily limit`) ระหว่างทาง — รอบนี้อ่านแผนที่อนุมัติแล้ว + ทรานสคริปต์เดิมทั้งหมด แล้วเดินหน้า implement ต่อตามลำดับที่วางไว้

### โจทย์
ทำ desktop layout ให้ `/design-clothes` ตาม `design-mockup.jpg` (สตูดิโอจอเดียว: ซ้ายเลือกชิ้นส่วน กลางพรีวิวใหญ่ ขวาเลือกผ้า/สี ล่างสรุป+ราคา) — คงหน้ามือถือ (wizard เดิม) ไว้ไม่แตะเลย

### ไฟล์ใหม่ (ตามแผนที่อนุมัติ ไม่มีอะไรนอกแผน)
- `hooks/use-desktop.ts` — `useIsDesktop()` breakpoint 1024px เลียนแบบ `use-mobile.ts`
- `components/design-clothes/builder/types.ts` — เพิ่ม `calcPriceBreakdown()` (additive, สูตรเดียวกับ `calcPrice()` เป๊ะ แค่แยกที่มา base/options/fabric)
- `components/design-clothes/studio/viewModes.ts` — `buildBackLayers()` (ตัด collar/pocket/buttons/decoration ออกแล้วพลิกที่เหลือ) + `toSketchLayers()` (ล้างสี/ลายเป็นขาว)
- `components/design-clothes/studio/StudioCenterPreview.tsx` — toolbar (undo/redo disabled, reset ใช้งานจริง, fullscreen) + พรีวิวกลาง + แถบมุมมอง 4 แบบ (หน้า/หลัง/ซูมผ้า/แพทเทิร์น) เป็น live render จริงทุกอัน ไม่ใช่ไอคอนนิ่ง
- `components/design-clothes/studio/StudioLeftPanel.tsx` — ประเภทชุด (จริงจาก `catalog.categories` ไม่ใช่ "เสื้อผู้หญิง/ผู้ชาย/ยูนิเซ็กส์" ตาม mockup เพราะ catalog ไม่มีข้อมูลนี้) → ทรงเริ่มต้น (เทมเพลต) → accordion รายชิ้นส่วน
- `components/design-clothes/studio/StudioRightPanel.tsx` — เลือกผ้า (ค้นหาใช้งานจริง client-side filter) + สี — แท็บผ้าไหม/ผ้าฝ้าย และ filter ภูมิภาค/เทคนิคใน mockup ไม่มี metadata รองรับจริงใน catalog.json เลยทำเป็น decorative-but-inert (จางลง + "ยังไม่เปิดใช้งาน" ไม่ใช่ปุ่มปลอมที่กดแล้วดูเหมือนทำงาน)
- `components/design-clothes/studio/StudioSummaryBar.tsx` — tags สรุปแบบ + ราคาแยกรายการ + "สั่งตัดชุดนี้" → `/tailor/with-fabric` — ปุ่ม "บันทึกไว้ในรายการโปรด" ผูกกับ localStorage draft เดิม **ไม่ใช่** `wishlist-context` ตามแผน เพราะ wishlist ผูกกับ `product_id` จริงในฐานข้อมูล ใช้กับดีไซน์ที่กำลังปรับแต่งอยู่ (ไม่มี id จริง) ไม่ได้ — เบี่ยงจากแผนตรงจุดนี้เพื่อไม่ให้เป็นฟีเจอร์ปลอม
- `components/design-clothes/studio/StudioHeader.tsx` + `StudioStepBar.tsx` — breadcrumb/บันทึกแบบร่าง/โหลดแบบเดิม + ไอคอนตะกร้า/แจ้งเตือนผูกจำนวนจริงจาก `cart-store`/`notification-context` + แถบ orientation 4 จุด (คลิกแล้ว scroll-anchor ไม่ gate การแก้ไข)
- `components/design-clothes/studio/DesktopStudio.tsx` — ประกอบทุกส่วน, ใช้ `useGarmentStore`/`resolveLayers`/`calcPrice` เดียวกับมือถือทุกประการ
- `components/design-clothes/DesignStudioRoot.tsx` — สวิตช์ mobile/desktop รอ `mounted` ก่อนกัน hydration mismatch
- `app/design-clothes/page.tsx` — เปลี่ยนมา render `<DesignStudioRoot/>` (แก้จุดเดียว ทำเป็นลำดับสุดท้ายตามแผน กัน mobile route ล่มระหว่างทำ)

### ทดสอบแล้วจริงในเบราว์เซอร์ (ติดตั้ง Playwright+Chromium ชั่วคราวใน scratchpad เพราะไม่มี `chromium-cli` ในเครื่องนี้)
- `tsc --noEmit` ผ่าน, dev server รัน `/design-clothes` ได้ 200 ไม่มี error
- เดสก์ท็อป 1440px: เลือกชิ้นส่วนจาก accordion (คอจีน) → พรีวิวกลาง+callout label อัปเดตทันที, สลับประเภทชุด เสื้อ→กางเกง → ทรง/ราคาเปลี่ยนถูกต้อง (3,890→2,290)
- มุมมองตัวอย่าง 4 แบบ (หน้า/หลัง/ซูมผ้า/แพทเทิร์น) เรนเดอร์ได้จริงทุกแบบ ไม่มีจอว่าง — ซูมผ้าโชว์ลายจริง, แพทเทิร์นโชว์ silhouette ขาว-ดำแบบ technical flat
- Resize เดสก์ท็อป→มือถือ (390px)→เดสก์ท็อป: แบบกางเกงที่เลือกไว้คงอยู่ครบ (state ไม่หาย, mobile wizard render ถูกต้องไม่พัง)
- ราคาสรุปด้านล่าง (breakdown: ผ้า 2,360 + ตัดเย็บ 990 + ดีเทล 540 = 3,890) ตรงกับราคาบนพรีวิว 100%
- `console --errors` ว่างเปล่าทุกสถานการณ์ที่ทดสอบ
- ปิด dev server + ลบ Playwright ชั่วคราวออกจาก scratchpad หลังทดสอบเสร็จ (ไม่ทิ้งไว้ในโปรเจกต์)

**ค้าง**: ยังไม่ได้ลองบนอุปกรณ์จริง/เบราว์เซอร์อื่นนอกจาก Chromium headless, ปุ่ม undo/redo ตั้งใจปิดไว้ (store ไม่มี history ตามแผน)

---

## 2026-07-10 (รอบสอง) — จำกัด `/design-clothes` เหลือ "ชุดไทยร่วมสมัย" ชุดเดียว + เตรียม photo-model swap

**ทำโดย**: Claude (Sonnet 5)

**บริบท**: ผู้ใช้ตัดสินใจ (หลังคุยเรื่อง token cost ของ AI-generate ต่อการเลือกแต่ละครั้ง) ว่าจะ **generate ภาพนางแบบจริงไว้ล่วงหน้าแบบ offline แล้ว swap ตอน runtime** แทนการเรียก AI ทุกครั้งที่กดเลือก — และให้ตัดขอบเขตเหลือแค่ชุด "ไทยร่วมสมัย" ในมockup ชุดเดียว ไม่มีกางเกง/กระโปรง/ทรงเสื้ออื่น

### 1. `frontend/public/studio/thai-dress/image-prompts.md` (ใหม่)
รายการ prompt สำหรับ generate ภาพ **24 รูป** (6 ลายผ้าจาก catalog × 4 สีคัดสรร: ทอง/แดงเข้ม/กรมท่า/ครีม) — โมเดล/โพส/แสง/พื้นหลังเดียวกันทุกภาพ (ระบุไว้เป็น "shared setup" ให้ก็อปวางท้าย prompt ทุกอัน กัน 24 รูปดูเหมือนคนละช็อต) ตั้งชื่อไฟล์ตรงกับ `patternId`/`colorSlug` ที่ catalog.json ใช้อยู่แล้ว (`thai-contemporary_{patternId}_{colorSlug}.webp`) เพื่อให้โค้ด map ได้ตรงๆ ไม่ต้อง rename ทีหลัง — ผู้ใช้จะเอา prompt ชุดนี้ไปรันกับเครื่องมือ generate ภาพเอง (ยังไม่มีไฟล์ภาพจริงตอนนี้)

### 2. `frontend/lib/thai-dress-photo.ts` (ใหม่)
- `getThaiDressPhotoUrl(design)` — คืน path ภาพถ่ายจริงเมื่อ design ตรงกับทรง thai-contemporary เดิมเป๊ะ (ไม่มีการปรับชิ้นส่วน/ผ้า/สีเฉพาะจุด) **และ** สีอยู่ใน 4 สีที่เตรียมภาพไว้ ไม่งั้นคืน `null` — ห้ามโชว์ภาพที่ไม่ตรงกับตัวเลือกจริง
- `hasThaiDressPhotoShape(design)` — แยกเหตุผลตอน fallback (ทรงตรงแต่สีไม่มีภาพ vs ผู้ใช้ปรับทรงเอง) ไว้ตัดสินใจว่าจะโชว์ caption อธิบายหรือไม่

### 3. `components/design-clothes/builder/GarmentPhotoStage.tsx` (ใหม่ — ใช้ร่วมกันทั้ง mobile/desktop)
โชว์ `<img>` จริงถ้ามี path + โหลดสำเร็จ, `onError` หรือไม่มี path → fallback ไป `GarmentRenderer` (SVG) เดิมทันทีอัตโนมัติ พร้อม caption สั้นๆ "ยังไม่มีภาพตัวอย่างสำหรับสีนี้ — แสดงพรีวิวภาพร่างแทน" เมื่อทรงตรงแต่ไม่มีภาพ (ไม่โชว์ caption เวลาผู้ใช้ตั้งใจปรับทรงเอง เพราะเป็นพฤติกรรมที่คาดหวังอยู่แล้ว)

### 4. ตัดขอบเขตเหลือชุดเดียว (ทั้ง mobile + desktop)
- **Mobile** (`ClothingDesigner.tsx`): ลบขั้น "เลือกสไตล์" (StepTemplates/TemplateCard) ทิ้งทั้งหมด — เริ่ม flow ที่ "ปรับแต่ง" เลย (STEPS เหลือ 4 ขั้นจาก 5), ซ่อนปุ่ม "ย้อนกลับ" ตอนอยู่ขั้นแรก, แก้ `ensureTop()` ใน AI assistant ให้หาเทมเพลต `id==='thai-contemporary'` เจาะจง (เดิมหาแค่ `category==='top'` ตัวแรกที่เจอ ซึ่งอาจไม่ใช่ชุดนี้), สลับ preview หลักจาก `GarmentRenderer` ตรงๆ เป็น `GarmentPhotoStage`
- **Desktop** (`StudioLeftPanel.tsx`): ลบตัวเลือก "ประเภทชุด" (เสื้อ/กางเกง/กระโปรง) และ "ทรง{ชื่อประเภท}" (เทมเพลตอื่นๆ) ออกทั้งคู่ — เหลือแค่ accordion ปรับชิ้นส่วนของชุดไทยร่วมสมัย
- **Desktop** (`StudioCenterPreview.tsx`): มุมมอง "หน้า" (front) เปลี่ยนมาใช้ `GarmentPhotoStage` ทั้งพรีวิวหลักและ thumbnail, แก้ `handleReset` ให้รีเซ็ตกลับ `thai-contemporary` ตรงๆ (เดิม fallback หาเทมเพลตแรกของ category ซึ่งไม่มีความหมายแล้วเมื่อเหลือชุดเดียว)

### ทดสอบแล้วจริงในเบราว์เซอร์ (Playwright+Chromium ชั่วคราวใน scratchpad อีกรอบ)
- `tsc --noEmit` ผ่านทั้งโปรเจกต์
- เดสก์ท็อป 1440px: ไม่มี "ประเภทชุด"/ตัวเลือกกางเกง-กระโปรงเหลืออยู่เลย, พรีวิวหลักโชว์ SVG fallback + caption ถูกต้อง (เพราะยังไม่มีไฟล์ภาพจริงในเครื่อง — 404 ตามคาด เห็นใน network log)
- มือถือ 390px: ไม่มีขั้น "วันนี้อยากใส่ชุดแบบไหน" เหลืออยู่ เริ่มที่ "อยากปรับส่วนไหน?" ทันที พร้อม caption fallback เดียวกัน
- ราคายังคำนวณถูกต้อง (3,890 บาท ตรงกับก่อนแก้) ทั้งสองจอ ไม่มี regression ต่อ business logic

**ค้าง**: รอผู้ใช้ generate ภาพจริง 24 รูปตาม `image-prompts.md` แล้ววางไฟล์ที่ `frontend/public/studio/thai-dress/` — โค้ด map path ให้อัตโนมัติแล้ว ไม่ต้องแก้อะไรเพิ่มเมื่อไฟล์มาถึง (แค่ชื่อไฟล์ต้องตรงตามตารางใน .md)

---

## 2026-07-10 (รอบสาม) — จัดลำดับ `/tailor/with-fabric` ให้ตรงกับ flow_1.png + แก้บั๊กจริงที่เจอระหว่างทาง

**ทำโดย**: Claude (Sonnet 5)

**บริบท**: ผู้ใช้แนบ `flow_1.png` (ผังงาน Flow 1 "สั่งตัดด้วยผ้าที่มีอยู่แล้ว" 15 ขั้นตอนเต็ม) แล้วให้จัดลำดับ `TailorWithFabricFlow` ให้ตรง พร้อมข้อสังเกต 2 จุด: (1) เพิ่มปุ่มข้าม (skip) ที่ขั้นอัปโหลดผ้า เพื่อ debug ขั้นถัดๆ ไปได้เร็วขึ้น (2) ขั้น "ถ่ายรูปตัวเอง/ส่งขนาด" (ข้อ 11 ใน mockup) ต้องมาก่อน "ลองใส่เสมือนจริง" (ข้อ 8) เสมอ — สลับตำแหน่งกันผิดใน mockup เดิม

### เรียงลำดับใหม่ (`TailorWithFabricFlow.tsx`)
`upload → ai_analysis → select_occasion → choose_shape → measurements → virtual_try_on → order_summary → select_shop → success` — ปรับ `TailorStep` type, `TailorOrderState`, `handleBack`, `getHeaderTitle`, และ JSX ให้ตรงกันทั้งหมด

### "เลือกทรงที่ชอบ" กลับมาใหม่แบบไม่ซ้ำซ้อน (`ChooseShapeStep.tsx` ใหม่)
ขั้นนี้เคยมี `PatternRecommendationStep` (mock MUI ปลอม) ซึ่งถูกลบไปแล้วเมื่อคุยกันรอบก่อนเพราะซ้ำกับ `/design-clothes` เป๊ะ — รอบนี้ผู้ใช้ขอให้เอาขั้นนี้กลับมาโดย **reuse ของจริงที่เคยลบไปแทน ไม่สร้าง mock ใหม่**: ดึง `catalog.json` จริง + ใช้ `GarmentRenderer`/`resolveLayers` เดียวกับ `/design-clothes` (เท่ากับฟื้นฟังก์ชัน `StepTemplates`/`TemplateCard` ที่ลบออกจาก `ClothingDesigner.tsx` ไปตอนต้น session) พร้อมจุดต่าง: **แทนที่ลายผ้าใน catalog ด้วยรูปผ้าจริงที่ผู้ใช้เพิ่งอัปโหลด** (เฉพาะ layer โหมด mask) ทำให้ได้ "ผ้าของคุณบนทรงที่เลือก" (ข้อ 6-7 ใน flow_1.png) ฟรีโดยไม่ต้องคิดเทคนิคใหม่

### บั๊กจริงที่เจอระหว่างแก้ (ไม่ใช่แค่จัดลำดับ)
- **`MeasurementsStep.tsx` ไม่มี input ไฟล์จริงเลย** — เดิมเป็นกล่องตกแต่งเฉยๆ ปุ่ม "ส่งให้ร้านค้า" กด `onNext()` ตรงๆ ไม่เก็บรูปอะไรทั้งนั้น ทั้งที่ควรเป็นขั้นถ่ายรูปตัวเอง — แก้ให้มี upload จริง (เทคนิค resize+compress เดียวกับ `UploadFabricStep`) เก็บที่ `orderState.bodyPhoto` ใหม่, ปุ่ม disable จนกว่าจะอัปโหลดจริง
- **`VirtualTryOnStep.tsx` โชว์ `/images/fabric1.webp`** (รูปผ้าตัวอย่างที่ไม่เกี่ยวอะไรเลย) แทนที่จะเป็นรูปตัวผู้ใช้เอง — คือบั๊กที่ผู้ใช้ชี้มา แก้ให้ใช้ `orderState.bodyPhoto` จริง + สวอตช์ผ้าที่เลือกมุมล่างขวา พร้อม caption บอกตรงๆ ว่า AI compositing เต็มรูปแบบยังไม่เสร็จ (`/api/ai/tryon` ยัง TODO ตาม deflect.md) — ไม่ปั้นภาพลองใส่ปลอม
- `OrderSummaryStep.tsx` เดิมโชว์ "ชุดไทยจิตรลดา" hardcode เสมอ (แม้ตอนที่ยังมี `PatternRecommendationStep` ก็ไม่เคยโชว์ค่าจริงเพราะ field `name` ไม่เคยถูกเซ็ต) — ตอนนี้โชว์ `orderState.shape?.name` จริงจาก `ChooseShapeStep`

### ปุ่มข้าม (debug) — `UploadFabricStep.tsx`
เพิ่มปุ่ม "ข้ามขั้นตอนนี้ (สำหรับทดสอบ)" ใต้ปุ่มอัปโหลดหลัก (สไตล์รอง ไม่ใช่ CTA เอก) ใส่รูปผ้าตัวอย่าง `/images/fabric1.webp` ให้แทนของจริงแล้ว `onNext()` — ทดสอบขั้นถัดไปได้เร็วโดยไม่ต้องอัปโหลดรูปจริงทุกรอบ

### ทดสอบแล้วจริงในเบราว์เซอร์ (Playwright+Chromium ชั่วคราวใน scratchpad อีกรอบ, เดินครบทั้ง flow จริงด้วยไฟล์ทดสอบจริง)
- `tsc --noEmit` ผ่านทั้งโปรเจกต์
- เดินครบ 9 ขั้น: อัปโหลด(ข้าม) → AI วิเคราะห์(fallback เพราะ backend AI endpoint เดิมยังไม่พร้อม — ปัญหาเดิมไม่เกี่ยวกับรอบนี้) → เลือกโอกาส → **เลือกทรง (เห็นการ์ดจริงจาก catalog จัดกลุ่มตามหมวด, คลิก "ไทยร่วมสมัย" แล้ว render จริงด้วย GarmentRenderer)** → อัปโหลดรูปตัวเอง (ปุ่มติดจนกว่าจะอัปโหลดจริง) → ลองใส่เสมือนจริง (เห็นรูปที่เพิ่งอัปโหลด ไม่ใช่ fabric1.webp เดิม) → สรุปออเดอร์ (ยืนยันด้วย locator ว่ามีข้อความ "ไทยร่วมสมัย" จริง ไม่ใช่ fallback) → เลือกร้าน → สำเร็จ
- ไม่มี error บล็อกการทำงาน (มีแค่ 500 จาก AI analyze endpoint เดิมที่ fallback อยู่แล้วก่อนหน้านี้)

**ค้าง**: AI analysis endpoint (`localhost:5000/api/ai/analyze-fabric`) ยังไม่พร้อมใช้งานจริง (ปัญหาเดิม ไม่ได้เกิดจากรอบนี้ — มี fallback mock กันพังอยู่แล้ว), `/api/ai/tryon` (compositing ชุดบนรูปจริง) ยังไม่มี implementation ตามที่บันทึกไว้ใน deflect.md เดิม

---

## 2026-07-10 (รอบสี่) — ตัดขั้น "เลือกทรงที่ชอบ" ออกจาก `/tailor/with-fabric`

**ทำโดย**: Claude (Sonnet 5)

**บริบท**: ผู้ใช้ถามว่าทำไมต้องให้เลือกทรงอีกรอบทั้งที่ผู้ใช้อัปโหลด+ให้ AI วิเคราะห์ผ้าของตัวเองไปแล้ว — ยืนยันแล้วว่าให้ตัด `ChooseShapeStep` (เพิ่งสร้างในรอบก่อนหน้าตาม flow_1.png) ออกจาก flow นี้ทั้งหมด

- ลบ `components/tailor/steps/ChooseShapeStep.tsx`
- `TailorWithFabricFlow.tsx`: ตัด `choose_shape` ออกจาก `TailorStep`/`TailorOrderState`/`handleBack`/`getHeaderTitle`/JSX — `select_occasion` ไปต่อที่ `measurements` ตรงๆ
- ลำดับใหม่: `upload → ai_analysis → select_occasion → measurements → virtual_try_on → order_summary → select_shop → success`
- แก้ `OrderSummaryStep.tsx` ที่เพิ่งอ้าง `orderState.shape?.name` ไปตอนก่อน (ตอนนี้ field ไม่มีแล้ว) กลับไปใช้ข้อความ static เหมือนเดิมก่อนรอบที่แล้ว
- ทดสอบจริงในเบราว์เซอร์: กด "ทำงานราชการ" (เลือกโอกาส) แล้วเด้งตรงไปหน้า "ถ่ายรูปเพื่อวัดสัดส่วน" ทันที ไม่มีหน้าเลือกทรงคั่นอยู่แล้ว, `tsc --noEmit` ผ่าน, ไม่มี reference ค้างของ `ChooseShapeStep`/`choose_shape`/`orderState.shape` เหลือในโค้ดเลย

---

## 2026-07-10 (รอบห้า) — Virtual Try-On ของจริง: ถ่ายรูป 3 มุม + AI ใส่ชุดจริงต่อรูป

**ทำโดย**: Claude (Sonnet 5)

**บริบท**: ผู้ใช้ขอให้ virtual try-on เป็นของจริง — ผู้ใช้ต้องอัปโหลดรูปตัวเอง 3 มุม (หน้า/หลัง/ข้าง) แล้ว AI ต้องใส่ชุดลงบนรูปจริงแต่ละมุมจริงๆ (ไม่ใช่โชว์ภาพ placeholder เหมือนก่อนหน้านี้)

### พบว่า infra AI ที่มีอยู่ไม่เคยรองรับ image-to-image จริง แม้จะดูเหมือนรองรับ
- `backend/src/routes/nanobanana.ts` เดิม destructure `imageUrls` จาก request body ไว้ แต่**ไม่เคยส่งต่อให้ kie.ai เลยในโค้ดจริง** (ยิงแค่ `{ prompt, size }`) — เป็น param ที่ดูเหมือนใช้งานได้แต่จริงๆ เป็น dead code มาตลอด
- เช็ค kie.ai docs จริง (`docs.kie.ai/4o-image-api/generate-4-o-image`) พบว่าชื่อ field ที่ถูกต้องคือ `filesUrl` (ไม่ใช่ `imageUrls`) และ**รูปต้องเป็น URL ที่เข้าถึงได้จากอินเทอร์เน็ตจริง** ไม่รับ base64/data URL — แต่ทั้งโปรเจกต์ไม่เคยมี image hosting pipeline เลย (รูปทั้งหมดที่อัปโหลดในแอปเป็น base64 เก็บฝั่ง client ล้วน)

### Backend ใหม่
- `backend/src/utils/supabaseAdmin.ts` — Supabase client ฝั่ง server ใช้ service role key (bypass RLS) เฉพาะงานอัปโหลดเข้า Storage
- `backend/src/utils/kieImage.ts` — ดึง logic submit+poll+credits-fallback ออกจาก `nanobanana.ts` มาเป็น helper กลาง (`generateImage()`) รองรับ `filesUrl` จริงแล้ว — `nanobanana.ts` เขียนใหม่ให้เรียก helper นี้แทน (ลด duplicate, ยังทำงานเหมือนเดิมทุกอย่างสำหรับ text-to-image เดิม)
- `backend/src/routes/tryon.ts` (ใหม่) — `POST /api/tryon/upload` (base64 → Supabase Storage bucket `tryon-uploads` public, สร้าง bucket อัตโนมัติครั้งแรกที่ใช้แบบ idempotent) + `POST /api/tryon/generate` (bodyPhotoUrl + fabricImageUrl + perspective + analysisResult/occasion → prompt compositing เฉพาะมุมนั้นๆ ส่งเข้า `generateImage()`)
- mount ที่ `/api/tryon` ใน `app.ts`

### ทดสอบ backend ตรงด้วย curl ก่อนต่อ frontend (ยืนยันว่า pipeline ถูกต้องจริง ไม่ใช่แค่ผ่าน tsc)
- อัปโหลดรูปทดสอบจริง → ได้ URL Supabase Storage จริง ยืนยัน public fetch ได้ (200)
- เรียก kie.ai ตรงๆ (bypass wrapper) พบว่า API key **หมดเครดิตจริง** (`code:402 "Credits insufficient"`) — ยืนยันว่า auth/request ถูกต้องสมบูรณ์ แค่ไม่มีเงินในบัญชี kie.ai ไม่ใช่บั๊ก — ระบบ fallback เป็น mock image แบบ graceful ตามดีไซน์เดิมของโปรเจกต์ (เหมือน `analyze-fabric`/`nanobanana` เดิม)

### Frontend
- `MeasurementsStep.tsx` เขียนใหม่ทั้งหมด — เดิมถ่ายได้มุมเดียว ตอนนี้ต้องถ่ายให้ครบ 3 มุม (หน้า/หลัง/ข้าง) แยกช่องอัปโหลดอิสระ ปุ่มถัดไปโชว์ความคืบหน้า "ถ่ายให้ครบ 3 มุม (x/3)" จนกว่าจะครบ — เก็บที่ `orderState.bodyPhotos = { front, back, side }`
- `VirtualTryOnStep.tsx` เขียนใหม่ทั้งหมด — auto อัปโหลดรูปตัวเอง 3 มุม + รูปผ้าขึ้น Supabase Storage (cache ไม่อัปโหลดซ้ำ) แล้วยิง generate แยกทีละมุมแบบขนานจริง มีแท็บสลับหน้า/หลัง/ข้าง แต่ละมุมมี loading/error state ของตัวเอง + ปุ่ม "ลองใหม่" เฉพาะมุมที่พัง, โชว์ badge "ตัวอย่าง (โควต้า AI หมดชั่วคราว)" ตรงๆ เมื่อ backend คืน mock (ไม่ปั้นว่าเป็นผลจริง)
- **เจอบั๊กจริงระหว่างทดสอบ**: `NEXT_PUBLIC_API_URL` ใน `.env.local` ลงท้ายด้วย `/` ทำให้ URL เพี้ยนเป็น `http://localhost:4000//api/tryon/upload` (double slash) แล้ว Express คืน 404 (ยืนยันด้วย curl ตรงๆ ว่า Express ไม่ collapse double slash ให้) — แก้ใน `VirtualTryOnStep.tsx` ด้วยการ strip trailing slash ตอนสร้าง `API_BASE` (ไฟล์อื่นที่ใช้ pattern เดียวกัน เช่น `wishlist-context.tsx` อาจเจอปัญหาเดียวกันแต่ไม่ได้อยู่ในขอบเขตงานนี้ ไม่ได้แก้)

### ทดสอบจริงในเบราว์เซอร์ (Playwright+Chromium, ใช้รูปคนจริงที่ผู้ใช้แนบมาเป็นไฟล์ทดสอบ)
- เดินครบ flow: อัปโหลดผ้า(ข้าม) → AI วิเคราะห์(fallback) → เลือกโอกาส → **ถ่ายรูป 3 มุมจริง (เห็น label หน้า/หลัง/ข้างถูกต้อง)** → **ลองใส่เสมือนจริง: อัปโหลดขึ้น Storage จริง + เรียก generate จริงทั้ง 3 มุม, แท็บสลับมุมทำงาน, badge "ตัวอย่าง (โควต้า AI หมดชั่วคราว)" โชว์ถูกต้องเพราะ credits exhausted จริง** → สรุปออเดอร์ (ข้อมูลจริงครบ)
- `tsc --noEmit` ผ่านทั้งสองฝั่ง, ไม่มี console error นอกจาก AI analyze endpoint เดิมที่ fallback อยู่แล้ว (ปัญหาเดิมไม่เกี่ยวกับรอบนี้)

**ค้าง**: ต้องเติมเครดิตบัญชี kie.ai (`NANO_BANANA_API_KEY`) ถึงจะเห็นผล generate จริงแทน mock — โค้ด/pipeline พร้อมสมบูรณ์แล้ว ไม่ต้องแก้อะไรเพิ่มเมื่อเติมเครดิต

---

## 2026-07-10 (รอบหก) — ทดสอบ virtual try-on ด้วยเครดิต kie.ai จริง + แก้บั๊กจริงที่เจอ

**ทำโดย**: Claude (Sonnet 5)

**บริบท**: ผู้ใช้เติมเครดิต/เปลี่ยน `NANO_BANANA_API_KEY` ใหม่แล้ว ให้ทดสอบ pipeline จากรอบก่อน

### บั๊กจริงที่เจอระหว่างทดสอบด้วยเครดิตจริง (ไม่เจอตอนเครดิตหมดเพราะ error ทันทีไม่ทันถึง code path เหล่านี้)
1. **`pollTask` timeout สั้นเกินไปและตีความผิด** — เดิม `maxWait=55s` แล้วถือว่า timeout = หมดเครดิต (สมเหตุสมผลตอนเครดิต=0 เพราะ API คืน 402 ทันที ไม่มีทาง timeout เพราะเหตุอื่น) แต่ทดสอบกับเครดิตจริงพบว่า generate ใช้เวลาจริงได้ถึง ~2.5-5 นาที (บางครั้งนานกว่านั้น) — ถ้ายัง treat timeout = หมดเครดิตต่อไป จะแอบโชว์ mock image ทับ generation ที่จริงๆ กำลังจะสำเร็จอยู่ (โกหกผู้ใช้แบบเงียบๆ) แก้เป็น: เพิ่ม `maxWait` เป็น 330s **และ**แยก timeout ออกจาก credits-exhausted อย่างชัดเจน (credits-exhausted ต้องเจอ code 402 จริงจาก API เท่านั้น ไม่ใช่เดาจาก timeout)
2. **ยิง generate 3 มุมพร้อมกัน (concurrent) ทำให้ kie.ai คืน `"Internal Error, Please try again later."` ทั้ง 3 งาน** — ทดสอบแล้วพบว่าบัญชีนี้รับ concurrent generation ไม่ได้ (หรือ rate limit) ส่วนยิงทีละงาน (sequential) สำเร็จปกติทุกครั้งที่ทดสอบ — แก้ `VirtualTryOnStep.tsx` จาก `PERSPECTIVES.forEach(...)` (ยิงพร้อมกันหมด) เป็น sequential `for...of` loop พร้อม await ทีละมุม, เพิ่ม UI state "idle" (รอคิว) สำหรับมุมที่ยังไม่ถึงตา

### ทดสอบจริงกับเครดิตจริง (ไม่ใช่ mock) — เห็นผลลัพธ์จริงจาก AI
- ทดสอบตรงผ่าน backend `/api/tryon/generate` (ไม่ผ่าน UI) ด้วยรูปคนจริงที่ผู้ใช้แนบ + ลายผ้าจริงจาก `fabric_patterns/01.webp`
- **มุมหน้า**: สำเร็จใน ~90 วินาที — ได้ภาพคนเดิม (ผมบลอนด์ หน้าเดิม) สวมชุดไทยจริงที่ตัดจากลายผ้าที่อัปโหลดจริง ทรงคอจีน กระดุมคาดเอว ถูกต้องตามพรอมต์ทุกจุด
- **มุมหลัง**: สำเร็จใน ~5 นาที — คนเดิม มุมกล้องจากด้านหลังถูกต้อง ลายผ้า/โทนสีตรงกับที่อัปโหลด
- **มุมข้าง**: ล้มเหลวจริงจากฝั่ง kie.ai เอง (`errorCode:500 "The upstream API service timed out and no results were returned"` หลัง ~16 นาที) — ไม่ใช่บั๊กโค้ดเรา เป็นความไม่เสถียรของบริการ third-party จริงๆ — ระบบจับ error ถูกต้อง โชว์ข้อความ+ปุ่ม "ลองใหม่" เฉพาะมุมนั้น ไม่บล็อกมุมอื่น/ทั้ง flow
- ยืนยันด้วยว่ายิง 3 มุมพร้อมกันเจอ error ทั้ง 3 งานจริง (ทดสอบก่อนแก้เป็น sequential) — สนับสนุนสมมติฐาน concurrency limit
- `tsc --noEmit` ผ่านทั้งสองฝั่งหลังแก้

**สรุปสถานะ**: ฟีเจอร์ทำงานได้จริงกับเครดิตจริงแล้ว คุณภาพภาพสูง (คงหน้า/ตัวคนเป๊ะ, ชุด/ลายผ้าถูกต้องตามที่เลือก) — ความไม่แน่นอนของเวลา generate (1.5-16+ นาที) และโอกาส fail เป็นครั้งคราวเป็นคุณสมบัติของบริการ kie.ai เอง ไม่ใช่บั๊กในโค้ดเรา ผู้ใช้กด "ลองใหม่" ได้เมื่อมุมไหนพัง

---

## 2026-07-11 — Deploy จริงขึ้น VPS + CI/CD auto-deploy ผ่าน GitHub Actions

**ทำโดย**: Claude (Sonnet 5)

**บริบท**: ผู้ใช้ซื้อ VPS ใหม่ (Ubuntu 24.04, 2 vCPU/3.8GB RAM, `45.91.134.199`) ให้ deploy โปรเจกต์จริง + ตั้ง CI/CD ให้ push ขึ้น `main` แล้ว deploy อัตโนมัติ โดเมนที่จะใช้: `laya-th.com`

### เซิร์ฟเวอร์ (ทำตรงบน VPS ไม่ได้อยู่ใน repo)
- สร้างผู้ใช้ `deploy` (ไม่ใช่ root) มี sudo NOPASSWD + SSH key เฉพาะสำหรับ deploy — ทดสอบ login ด้วย key ก่อนเชื่อว่าใช้ได้จริง (ยังไม่ปิด root password login ตามที่ผู้ใช้เลือกไว้ — เก็บเป็น fallback)
- ติดตั้ง Node.js 22 (NodeSource), nginx, PM2 (global), certbot + python3-certbot-nginx
- ufw firewall เปิดเฉพาะ 22/80/443
- Clone repo ไปที่ `/home/deploy/laya`, สร้าง `backend/.env` + `frontend/.env.local` เวอร์ชัน production (คัดลอกค่าจริงจากเครื่อง local, ปรับ `NODE_ENV=production`, `ALLOWED_ORIGINS=https://laya-th.com,https://www.laya-th.com`, `NEXT_PUBLIC_API_URL=https://laya-th.com` ไม่มี trailing slash กันบั๊ก double-slash ที่เจอไปแล้วรอบก่อน) — chmod 600
- Build ทั้งสองฝั่งสำเร็จ (`tsc` ฝั่ง backend, `next build` ฝั่ง frontend prerender ครบทุกหน้า) รันด้วย PM2 (`laya-backend` :4000, `laya-frontend` :3000) + `pm2 startup systemd` ให้รอดรีบูต
- **สถาปัตยกรรม routing**: nginx `server_name laya-th.com www.laya-th.com` — `/api/*` proxy ตรงไป backend :4000 (มี `proxy_read_timeout 600s` รองรับ virtual try-on ที่ใช้เวลานาน), ที่เหลือ proxy ไป frontend :3000 — ตรงกับ pattern เดิมที่โค้ด client fetch `${NEXT_PUBLIC_API_URL}/api/...` ตรงอยู่แล้ว ไม่ต้องพึ่ง Next rewrites
- ทดสอบผ่าน curl ด้วย `Host: laya-th.com` ยิงตรง IP ยืนยัน frontend/backend/API ตอบ 200 ครบก่อนต่อ DNS จริง

### CI/CD (เพิ่มเข้า repo)
- `ecosystem.config.js` — นิยาม PM2 process ทั้งสอง (เก็บ config เดียวกับที่ตั้งบนเซิร์ฟเวอร์ไว้ใน repo ด้วย ไม่ใช่มีแต่บนเซิร์ฟเวอร์)
- `deploy.sh` — สคริปต์รันบน VPS (`git reset --hard origin/main` → `npm run install:all` → build ทั้งสองฝั่ง → `pm2 restart ecosystem.config.js --update-env` → `pm2 save`)
- `.github/workflows/deploy.yml` — SSH เข้า VPS แล้วรัน `deploy.sh` ทุกครั้งที่ push เข้า `main` (ใช้ `appleboy/ssh-action`, มี `workflow_dispatch` ให้ trigger มือได้ด้วย)
- ตั้ง GitHub Secrets ผ่าน `gh secret set`: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (private key เฉพาะของ deploy user ไม่ใช่ root)

### ทดสอบจริง — push ขึ้น main แล้วดู CI/CD รันจริง
- Commit+push ไฟล์ deploy ทั้งหมด → GitHub Actions รันอัตโนมัติทันที → **สำเร็จตั้งแต่รอบแรก** (`gh run watch` ยืนยัน `success`)
- ตรวจบน VPS: `git log -1` ตรงกับ commit ที่เพิ่ง push, PM2 ทั้งสอง process restart จริง (`↺ 1`, uptime ตรงกับเวลา deploy), เว็บตอบ 200 ทั้ง frontend/backend หลัง deploy

**ค้าง (ต้องทำโดยผู้ใช้)**: DNS ของ `laya-th.com` ยังชี้ไปที่ IP เดิมของ Hostinger (`2.57.91.91`) ไม่ใช่ VPS ใหม่ (`45.91.134.199`) — ต้องอัปเดต A record (`laya-th.com` และ `www.laya-th.com`) ก่อนถึงจะ:
1. เข้าเว็บผ่านโดเมนได้จริง (ตอนนี้เข้าได้แค่ผ่าน IP + Host header เท่านั้น)
2. ออก SSL cert ได้ (`certbot --nginx -d laya-th.com -d www.laya-th.com` — ยังไม่ได้รันเพราะ HTTP-01 challenge ต้องการให้โดเมนชี้มาที่เซิร์ฟเวอร์นี้ก่อน ไม่งั้น validation fail แน่นอน)

หลัง DNS อัปเดตแล้ว แค่รันคำสั่ง certbot ด้านบนบน VPS ก็เสร็จ ไม่ต้องแก้ config อื่นเพิ่ม (nginx config เตรียมพร้อมรองรับ SSL redirect ที่ certbot จะเพิ่มให้อัตโนมัติอยู่แล้ว)

---

## 2026-07-11 (รอบสอง) — DNS ชี้ถูกแล้ว + ออก SSL จริง + แก้บั๊ก mixed content

**ทำโดย**: Claude (Sonnet 5)

- ยืนยัน DNS `laya-th.com`/`www.laya-th.com` ชี้มาที่ `45.91.134.199` แล้วจริง (เช็คผ่านหลาย resolver: 8.8.8.8, 1.1.1.1)
- SSL cert ออกสำเร็จแล้ว (`certbot --nginx`) — `https://laya-th.com` ตอบ 200 จริง, cert ถูกต้อง (`CN=laya-th.com`, Let's Encrypt, หมดอายุ 2026-10-08, ตั้ง auto-renew ผ่าน `certbot.timer` ไว้แล้ว), nginx redirect http→https อัตโนมัติ
- **เจอบั๊กจริง**: หลังเปิด https ผู้ใช้เจอ "connection not secure" ในเบราว์เซอร์ — ตรวจแล้วพบ mixed content จริง: หน้าเว็บมี absolute URL เป็น `http://localhost:3000` ฝังอยู่ในหลายจุด (favicon `<link>`, Open Graph image, search action URL ใน JSON-LD) เพราะ `frontend/lib/seo.ts` อ่าน `NEXT_PUBLIC_SITE_URL` แล้ว fallback เป็น `http://localhost:3000` เมื่อไม่ได้ตั้งค่า — ตอน deploy ครั้งแรกไม่ได้ใส่ตัวแปรนี้ไว้ใน production `.env.local`
- แก้: เพิ่ม `NEXT_PUBLIC_SITE_URL=https://laya-th.com` เข้า `frontend/.env.local` บน VPS แล้ว rebuild (`next build` ฝังค่า `NEXT_PUBLIC_*` ตอน build ไม่ใช่ runtime เลยต้อง build ใหม่ ไม่ใช่แค่ restart) + `pm2 restart --update-env`
- ทดสอบแล้ว: ไม่มี `http://` เหลือในหน้าเว็บเลยแม้แต่จุดเดียว (grep ตรงจาก response จริง) ทุกจุดชี้ `https://laya-th.com` ถูกต้อง

**หมายเหตุสำหรับ deploy รอบถัดไป**: `deploy.sh` ไม่แตะไฟล์ `.env`/`.env.local` เลย (ไม่ได้ tracked ใน git) เพราะงั้นตัวแปรที่เพิ่งเติมจะอยู่ถาวรบนเซิร์ฟเวอร์ ไม่ต้องเติมซ้ำทุกรอบ deploy
