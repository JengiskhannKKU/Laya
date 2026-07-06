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
