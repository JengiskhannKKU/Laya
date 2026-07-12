# LAYA Backend — Project Context

> **คำสั่งสำหรับ AI**: อ่านไฟล์นี้ก่อนเสมอเมื่อจะแก้ไขโค้ด เพื่อให้เข้าใจเป้าหมาย โครงสร้าง และงานที่ทำไปแล้ว จากนั้นบันทึกสิ่งที่แก้ไขต่อท้ายใน **## Changelog** พร้อม Timestamp

---

## 🎯 เป้าหมายของ Project

**LAYA Backend** คือ REST API สำหรับแพลตฟอร์ม Marketplace ผ้าไทย ทำหน้าที่:
- จัดการข้อมูล Products, Communities, Categories, Banners, Orders
- AI endpoint สำหรับ generate ลายผ้า (nanobanana/AI)
- เชื่อมต่อ PostgreSQL database

---

## 🏗️ โครงสร้าง Backend

```
backend/
├── src/
│   ├── server.ts           # Entry point — listen PORT (default 5000)
│   ├── app.ts              # Express app, CORS, middleware, routes
│   ├── db.ts               # PostgreSQL pool (pg library)
│   ├── types.ts            # TypeScript type definitions
│   ├── seed.ts             # Database seeder
│   ├── schema.sql          # Database schema
│   └── routes/
│       ├── health.ts       # GET /health — health check
│       ├── products.ts     # GET /api/products, /api/products/:id
│       ├── categories.ts   # GET /api/categories
│       ├── banners.ts      # GET /api/banners
│       ├── communities.ts  # GET /api/communities, /api/communities/:id
│       ├── orders.ts       # GET/POST /api/orders
│       ├── ai.ts           # POST /api/ai — AI generation
│       └── nanobanana.ts   # POST /api/nanobanana/generate — fabric pattern AI
├── package.json
└── tsconfig.json
```

---

## 🧱 Tech Stack

| Layer | Library |
|---|---|
| Framework | Express.js 4 |
| Language | TypeScript (tsx watch for dev) |
| Database | PostgreSQL (via `pg` library) |
| AI | nanobanana endpoint (external API call) |
| CORS | `cors` package |
| Env | `dotenv` |

---

## 🔌 API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/products` | ดึงสินค้าทั้งหมด |
| GET | `/api/products/:id` | ดึงสินค้าตาม ID |
| GET | `/api/categories` | ดึงหมวดหมู่ |
| GET | `/api/banners` | ดึง banners |
| GET | `/api/communities` | ดึงชุมชนทั้งหมด |
| GET | `/api/communities/:id` | ดึงชุมชนตาม ID |
| GET/POST | `/api/orders` | จัดการคำสั่งซื้อ |
| POST | `/api/ai` | AI generation general |
| POST | `/api/nanobanana/generate` | สร้างลายผ้า AI |

---

## 🗃️ Environment Variables

```env
PORT=5000
DATABASE_URL=postgresql://...
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
NODE_ENV=development|production
```

---

## ⚠️ กฎสำคัญที่ต้องจำ

1. **CORS**: ตั้งค่า `origin: true` (รับทุก origin) — ถ้า production ควรเปลี่ยนเป็น `allowedOrigins` array
2. **Database**: ใช้ connection pool จาก `db.ts` — ห้ามสร้าง pool ใหม่ในแต่ละ route
3. **Error handling**: มี global error handler ใน `app.ts` แล้ว — throw error ขึ้นมาได้เลย
4. **TypeScript**: run `npm run dev` (tsx watch) สำหรับ development, `npm run build` สำหรับ production

---

## 📋 Changelog

### 2026-06-26 — Initial Context Setup
**ผู้แก้**: AI (Claude Sonnet 4.6)

**สถานะ:**
- Backend ทำงานได้ปกติ (Express + PostgreSQL)
- Routes ครบตาม spec ด้านบน
- ยังไม่มีการ authentication/authorization middleware
- CORS ยังเปิดกว้าง (`origin: true`) — ควรจำกัดใน production

### 2026-06-26 — Environment Config Fixes
**ผู้แก้**: AI (Antigravity)

**ปัญหาที่แก้ / งานที่ทำ:**
- Renamed the incorrectly named `env` file to `.env` in the backend root directory so that the application could properly load the `DATABASE_URL` and boot correctly.

### 2026-06-26 — AI API Integration & Payload Limit Fixes
**ผู้แก้**: AI (Antigravity)

**ปัญหาที่แก้ / งานที่ทำ:**
- เพิ่ม payload limit ใน `src/app.ts` สำหรับ `express.json({ limit: "50mb" })` เพื่อให้รองรับการส่งภาพ Base64 ขนาดใหญ่จาก frontend ได้.
- แก้ไข Route `/api/ai` ใน `src/routes/ai.ts` ให้เรียกใช้ KKU LLM API (`https://gen.ai.kku.ac.th/api/v1`) โมเดล `gemini-2.5-flash-lite`.
- เพิ่มโค้ดลบ Markdown Backticks (` ```json `) ออกจาก response ของ LLM ก่อนทำการ `JSON.parse` เพื่อแก้ปัญหา Syntax Error เวลาที่ LLM ตอบกลับมาเป็น Markdown.

### 2026-07-06 — PromptPay Payments + Order Confirm Flow + Weaving Orders + Shop Matching
**ผู้แก้**: AI (Claude Fable 5)

**งานที่ทำ:**
- เพิ่ม `src/utils/promptpay.ts` — EMVCo PromptPay QR payload generator (เทียบผลตรงกับไลบรารี `promptpay-qr`)
- เพิ่ม `src/routes/payments.ts` — `GET /api/payments/qr`, `POST /api/payments` (คิด platform fee จาก `PLATFORM_FEE_PERCENT`), `POST /api/payments/:id/confirm` (mock gateway), `GET /api/payments[/:id]`
- เพิ่ม `src/routes/weaving-orders.ts` — CRUD + state machine (pending_confirm→confirmed→weaving→ready→shipped→delivered) + logs + notifications
- เพิ่ม `src/routes/weave-patterns.ts` — `GET /api/weave-patterns` พร้อม color variants
- `src/routes/orders.ts` — เพิ่ม transition validation, `POST /:id/confirm`, ตั้ง confirmed_at/completed_at, แจ้งเตือนสองทาง; แก้บั๊ก default fabricSource เป็น `shop`
- `src/routes/shops.ts` — เพิ่ม `GET /api/shops/match` (US-506); แก้บั๊ก `status='active'` → `'approved'` (ตรง enum)
- Env ใหม่ใน `.env`: `PROMPTPAY_ID`, `PLATFORM_FEE_PERCENT`, `JWT_SECRET`, `SUPABASE_JWT_SECRET` (dotenv ไม่โหลด `.env.local`)
- Seed ร้านทอตัวอย่าง 4 ร้าน: `node _seed_demo_shops.js` | ทดสอบ e2e: `node _test_flow.js`

**ข้อควรระวัง:**
- การ UPDATE คอลัมน์ enum ที่ใช้ `$1` ซ้ำใน CASE ต้อง cast `($1::text)::enum_type` ไม่งั้นเจอ error 42P08
- tsx watch บน Windows บางครั้งไม่ hot-reload — ต้อง restart process เอง

### 2026-07-07 — Marketplace: สินค้าพร้อมขาย + ตะกร้า + Checkout + PromptPay
**ผู้แก้**: AI (Claude Fable 5)

**บริบท**: แยกจาก flow สั่งตัด/สั่งทอ (custom) เดิม — นี่คือ flow สำหรับสินค้าที่มีอยู่แล้วในสต็อก ไม่ต้อง custom ซื้อได้ทันที

**งานที่ทำ:**
- Migration `backend/migrations/003_marketplace_products.sql` (ใช้ psql/Supabase SQL editor รันเอง ไม่มี auto-migration): เพิ่ม `products`, `product_order_groups`, `product_orders`, `product_order_items`, `product_order_status_logs` + เพิ่มคอลัมน์ `payments.product_order_group_id`
- `src/routes/products.ts` — **เขียนใหม่ทั้งหมด** (เดิม map จาก `shop_fabrics`/`shops` ซึ่งไม่มีใครเรียกใช้จริงจาก frontend) ตอนนี้ query ตาราง `products` ใหม่แทน — `GET /api/products` (filter: category/province/search/shopId), `GET /api/products/:id`
- `src/routes/product-orders.ts` (ใหม่) — `POST /` สร้างออเดอร์จากตะกร้า (validate ราคา/สต็อกจริงจาก DB ในทรานแซกชัน, กันลูกค้าปลอมยอด, หักสต็อกจริง), แยกเป็น sub-order ต่อร้านอัตโนมัติถ้าตะกร้ามีของจากหลายร้าน ภายใต้ `product_order_groups` เดียว, `GET /group/:groupId`, `GET /` (list), `PATCH /:id/status` (state machine เดียวกับ orders.ts)
- `src/routes/payments.ts` — ขยายให้รับ `productOrderGroupId` (นอกจาก orderId/weavingOrderId เดิม) — **QR เดียวจ่ายได้ทั้งตะกร้าแม้มีสินค้าจากหลายร้าน**, confirm แล้วอัปเดตทุก sub-order เป็น pending_confirm + แจ้งเตือนทุกร้านที่เกี่ยวข้อง
- `src/db.ts` — เพิ่ม `getClient()` export สำหรับ transaction (BEGIN/COMMIT/ROLLBACK) ที่ product-orders.ts ใช้
- `_seed_demo_products.js` — seed สินค้าพร้อมขาย 10 รายการ ผูกกับร้านสาธิต 4 ร้านเดิม (เนื้อหา/รูปคัดจาก frontend mock-data)
- ทดสอบ e2e ด้วย `_test_marketplace_flow.js`: ตะกร้าข้ามร้าน → payment เดียว → confirm → ทั้งสองร้าน pending_confirm → ร้านหนึ่งยืนยันอิสระจากอีกร้าน → สต็อกหักถูกต้อง — **ผ่านหมด**, และรัน `_test_flow.js` เดิมซ้ำเพื่อยืนยันไม่มี regression ต่อ flow สั่งตัด/สั่งทอ — **ผ่านหมด**

**ข้อควรระวัง/scope ที่ยังไม่ทำ:**
- ตะกร้าเก็บฝั่ง client (localStorage ผ่าน zustand) ไม่มีตาราง cart ใน DB — ตั้งใจให้เรียบง่าย เพราะ backend ตรวจราคา/สต็อกจริงอีกครั้งตอน checkout อยู่แล้ว
- ค่าส่งแบ่งตามสัดส่วนยอดร้าน (ปัดเศษง่ายๆ) ไม่ใช่ระบบคำนวณค่าส่งจริงตามระยะทาง/น้ำหนัก
- payout ต่อร้านคำนวณจาก `product_orders.subtotal` ที่ query time ไม่ได้มี ledger แยกต่อร้านใน payments (payment 1 แถวคุม fee/payout รวมทั้ง checkout group)
- หน้า merchant สร้างสินค้า (`/merchant/products/create`) ยังไม่ได้ต่อ API จริง — ใช้ seed script แทนไปก่อน
- หน้า `/orders` (ประวัติออเดอร์ฝั่งลูกค้า) ยังเป็น mock — ยังไม่รวม product_orders (ใส่ไว้ที่ `/orders/product/[groupId]/success` แทนสำหรับหน้ายืนยันหลังชำระเงินจบ)

---
<!-- เพิ่ม changelog entry ใหม่ต่อท้ายนี้ -->

### 2026-07-12 — Multi-SKU Checkout + Merchant Type + Email/Password flows + Merchant Bell + สถานะขนส่งละเอียด

**Migration `015_sku_checkout_merchant_type_shipping.sql` (apply แล้วบน DB จริงด้วย `_apply_migration_015.js`):**
- `product_order_items` + `variant_id`, `variant_label` — บันทึก SKU ที่ลูกค้าเลือกตอนซื้อ
- `shops` + `merchant_type` (`weaving_community` default | `designer`)
- enum `shipment_status` เพิ่ม `picked_up`, `returned`; `product_orders` + `shipping_status`; ตารางใหม่ `product_order_shipping_logs`

**Backend:**
- `products.ts` — GET / (list) แนบ `has_variants`, `priceMin/priceMax/stockTotal` (LATERAL); GET /:id แนบ `variants[]` public
- `product-orders.ts` — POST รองรับ `items[].variantId`: validate ราคา/สต็อกจาก `product_variants` (FOR UPDATE), บังคับเลือก SKU เมื่อ `has_variants`, ตัดสต็อกราย SKU, low-stock alert ราย SKU; PATCH /:id/status → shipped ตั้ง `shipping_status='pending'` อัตโนมัติ; endpoint ใหม่ `PATCH /:id/shipping-status` (pending→picked_up→in_transit→delivered / failed / returned พร้อม transition guard + log + notify ลูกค้า; delivered เลื่อน order เป็น delivered); PDF slip/packing/receipt ต่อท้าย variant label
- `shops.ts` — POST /apply รับ `merchantType`

**Frontend:**
- `ProductDetailView` — ตัวเลือก SKU (ชิปสี/ไซซ์), ราคา/สต็อกตาม SKU, ปุ่มจำนวนสำหรับสินค้าพร้อมขาย (เริ่ม 1 ชิ้น)
- `cart-store` — CartLine มี `variantId/variantLabel`, key ต่อบรรทัด = productId::variantId; cart/checkout ส่ง `variantId` และแสดง label
- สมัครร้านค้า — เลือกประเภท ชุมชนทอผ้า/ดีไซเนอร์
- `auth/forgot` + `auth/reset` — ต่อ Supabase จริง (`resetPasswordForEmail` / `updateUser`); `auth/verify-email` ใหม่ + `register()` คืน `needsEmailConfirm` + login จับ `Email not confirmed`
- Merchant layout — กระดิ่งแจ้งเตือน + nav "การแจ้งเตือน" + หน้า `/merchant/notifications` (inbox)
- `merchant/orders` — ปุ่ม/ไดอะล็อกอัปเดตสถานะขนส่งละเอียด; หน้าออเดอร์ลูกค้าแสดง timeline ขนส่ง

**ทดสอบ:** `npm test` ใน backend (node:test — `tests/api.test.js` สตาร์ทเซิร์ฟเวอร์เองบนพอร์ต 4995, 14 เทส) และ `npm test` ใน frontend (vitest — `tests/*.test.ts`, 13 เทส) — ผ่านหมด รวม regression สินค้าไม่มี SKU; frontend `next build` ผ่าน; ตรวจ UI selector จริงผ่าน browser แล้ว

**หมายเหตุ production:** ต้อง deploy backend ใหม่ (Render) ก่อน frontend ฟีเจอร์ variants จึงจะทำงานบนเว็บจริง; Email Verification ต้องเปิด "Confirm email" ใน Supabase Dashboard → Authentication → Sign In/Up
