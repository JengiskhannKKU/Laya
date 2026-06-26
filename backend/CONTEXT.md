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

---
<!-- เพิ่ม changelog entry ใหม่ต่อท้ายนี้ -->
