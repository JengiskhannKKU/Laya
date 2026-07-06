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

---
<!-- เพิ่ม changelog entry ใหม่ต่อท้ายนี้ -->
