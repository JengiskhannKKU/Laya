# LAYA — รายงานความพร้อมระบบ (System Readiness Report)

> จัดทำ: 2026-07-08 | สำหรับส่งต่องานให้ทีม — ตรวจจากโค้ดจริง + ยิง API จริง + query DB จริง (ไม่เชื่อ checkbox ใน backlog)
> อ่านคู่กับ `deflect.md` (ประเด็นติดขัด D1–D20) และ `history.md` (บันทึกงานที่ทำแล้ว)

---

## TL;DR — ความพร้อมแยกตาม Role

| Role | ความพร้อม | สรุปสั้น |
|---|---|---|
| **ลูกค้า (Customer)** | 🟢 ~80% | เส้นทางซื้อของครบวงจรจริงแล้ว (เลือกสินค้า→ตะกร้า→checkout→จ่าย QR→แจ้งเตือน) เหลือ: ประวัติออเดอร์ยัง mock, โปรไฟล์บางหน้ายังไม่ต่อ API |
| **ร้านค้า (Merchant)** | 🟡 ~60% | ลงขาย/แก้/ลบสินค้า + รับออเดอร์ ใช้จริงได้แล้ว มี RoleGuard ป้องกันแล้ว เหลือ: Dashboard/Payouts/Settings เป็น UI เปล่า (backend มีรอแล้วบางส่วน) |
| **แอดมิน (Admin)** | 🔴 ~5% | **ทั้ง 10 หน้าเป็น UI mockup ล้วน — ไม่มี API call แม้แต่บรรทัดเดียว** และ **ไม่มีการเช็ค role เลย ใครก็เปิด /admin ได้** (backlog ติ๊ก US-701–703 ว่าเสร็จ = ไม่ตรงความจริง) |

**บล็อกการขึ้น production จริง (ต้องเจ้าของธุรกิจตัดสินใจ):** ① PromptPay ID ยังเป็นเลขทดสอบ (D2) ② ยังไม่มี Payment Gateway ตรวจยอดโอนจริง (D1) ③ Backend ยังไม่มีที่โฮสต์ (D11)

---

## 1. Backend API ทั้งหมด (18 route files, ~60 endpoints)

### ✅ ใช้งานจริงได้ ครบถ้วน

| Route | Endpoints | หมายเหตุ |
|---|---|---|
| `/api/auth` | register, login, sync, me | Supabase JWT (ES256/JWKS) — ผ่านการแก้บั๊กใหญ่แล้ว (D8) |
| `/api/products` | GET list (filter: category/province/search/shopId), GET /mine, POST, GET/:id, PUT, PATCH status, DELETE | CRUD ร้านค้าครบ + soft-delete เมื่อมีออเดอร์อ้างอิง |
| `/api/shops` | GET list, GET /mine, GET /match, GET/:id, POST /apply, PATCH /mine, PATCH /:id/status (admin) | สมัครร้าน→แอดมินอนุมัติ มี endpoint ครบ (แต่ยังไม่มี **UI แอดมิน** กดอนุมัติ) |
| `/api/orders` | GET (role-filtered: admin เห็นหมด/ร้านเห็นของร้าน/ลูกค้าเห็นของตัว), GET/:id, POST, POST /:id/confirm, PATCH status | state machine ครบ + ยกเลิกก่อนร้านยืนยันได้ (US-603) |
| `/api/product-orders` | POST (สร้างจากตะกร้า multi-shop), GET /group/:id, GET, PATCH status | ระบบซื้อสินค้าพร้อมขาย — ทดสอบ end-to-end แล้วหลายรอบ |
| `/api/payments` | GET /qr, POST, POST /:id/confirm, GET (role-filtered), GET/:id | PromptPay QR จริง (EMVCo) + platform fee 5% + payout คำนวณอัตโนมัติ — **แต่ confirm เป็น mock** (D1) |
| `/api/weaving-orders` | GET, GET/:id, POST, POST /:id/confirm, PATCH status | ระบบสั่งทอครบ + color disclaimer (US-407) |
| `/api/weave-patterns` | GET | ลายทอ 6 ลาย + color variants ใน DB จริง |
| `/api/notifications` | GET, PATCH /:id/read, PATCH /read-all | ต่อ frontend ครบแล้ว (TopNav badge + หน้าแจ้งเตือน) |
| `/api/addresses` | GET, POST, PATCH/:id, DELETE/:id | สมุดที่อยู่ + default logic — ใช้ใน checkout แล้ว |
| `/api/measurements` | GET, POST, PATCH/:id, DELETE/:id | **backend ครบแต่หน้า `/profile/measurements` ยังไม่เรียกใช้เลย** |
| `/api/wishlist` | GET /ids, GET, POST, DELETE/:productId | ทำใหม่ 2026-07-08 — ต่อครบทุกจุดที่มีหัวใจ |
| `/api/communities` | GET, GET/:id | ทำใหม่ 2026-07-08 — ดึงจาก shops จริง (ของเดิม query ตารางที่ไม่มีจริง พัง 500 มาตลอด) |
| `/api/categories`, `/api/banners`, `/api/health` | GET | ใช้ได้ |

### ⚠️ มีโค้ดแต่ใช้จริงไม่ได้ (ไม่มี API key)

| Route | ปัญหา |
|---|---|
| `/api/ai/generate` | mock ล้วน (delay ปลอม + คืนสินค้า top-3 จาก DB แต่งตัวเป็น "AI") |
| `/api/ai/analyze-fabric` | โค้ดเรียก vision LLM จริง (KKU Gemini) เขียนไว้แล้ว แต่ **ไม่มี key ใน .env** → ตอนนี้คืน mock เสมอ |
| `/api/nanobanana/generate` | โค้ดเรียก kie.ai (GPT-4o image) จริง เขียนครบ polling/error handling แล้ว แต่ **`NANO_BANANA_API_KEY` ไม่มี** → 500 |

### ❌ Endpoint ที่ยังไม่มีเลย (หน้า frontend มีแต่ไม่มีตัวรองรับ)

- Admin: users list, analytics/สถิติ dashboard, moderation, marketing, base-styles CRUD
- Custom design: design_briefs / generated_designs / tryon_results / customer_photos / fabric_uploads (**ตาราง DB มีจริงครบ 8 ตาราง แต่ไม่มี route แม้แต่อันเดียว** — ดูรายละเอียดในรายงานสำรวจ Custom/Try-on ใน history.md)
- Reviews รายข้อความ (มีแค่ rating รวมของร้าน), Shipments/ติดตามพัสดุ (US-211), Community posts/ฟีดโซเชียล (US-509)

---

## 2. Frontend — ความพร้อมรายหน้า

### 👤 ลูกค้า (Customer)

| หน้า | สถานะ | หมายเหตุ |
|---|---|---|
| `/` หน้าแรก | ✅ จริง | สินค้า+ชุมชนดึง API จริง (fallback mock เมื่อ backend ล่ม) |
| `/search`, `/category` | ✅ จริง | ผ่าน useLiveProducts / fetchLiveProducts |
| `/product/[id]` | ✅ จริง | สินค้าจริง + หัวใจ wishlist จริง + เพิ่มตะกร้าจริง |
| `/cart`, `/checkout` | ✅ จริง | redesign แล้ว, แผนที่ปักหมุด + จังหวัด/อำเภอ/ตำบลจริง, จ่าย QR จริง — ทดสอบ e2e หลายรอบ |
| `/wishlist` | ✅ จริง | ทำใหม่ 2026-07-08 |
| `/notifications` | ✅ จริง | |
| `/community`, `/community/[id]` | ✅ จริง (detail) / 🔴 mock (ฟีดโซเชียล `/community`) | ฟีด = US-509 ยังไม่ทำ ต้องออกแบบ backend ใหม่ทั้งหมด |
| `/community/heritage` | ✅ | แผนที่ลายผ้า 77 จังหวัด (เนื้อหา static โดยเจตนา) |
| `/weaving-order` | ✅ จริง | สั่งทอ→เลือกร้าน→จ่าย ครบ |
| **`/orders` ประวัติออเดอร์** | 🔴 **mock** | **ใช้ `mockOrders` ทั้งหน้า ทั้งที่ backend GET /api/orders + /api/product-orders มีครบ** — งานต่อ API อย่างเดียว ควรทำก่อนเพื่อน |
| `/orders/[id]` | 🔴 mock | เหมือนกัน |
| `/profile` | 🟡 ครึ่งจริง | user จริงจาก auth แต่ไม่มีข้อมูลสถิติจริง |
| `/profile/measurements` | 🔴 UI เปล่า | **backend /api/measurements ครบแล้ว แค่ต่อ** |
| `/profile/edit`, `/profile/photos` | 🔴 UI เปล่า | photos ต้องมีระบบอัปโหลดไฟล์ก่อน (ยังไม่มีทั้งโปรเจกต์) |
| `/passports`, `/passport/[id]`, `/weaver/[id]` | 🔴 mock | Digital passport/ช่างทอ — ไม่มี backend entity เลย |
| `/gen-silk` | 🔴 **พัง** | fetch ไป `localhost:5000/api/generate` ที่ไม่มีอยู่จริง — กดแล้ว error เสมอ |
| `/design-clothes` | 🟡 | canvas ออกแบบเสื้อทำงานได้ แต่**ไม่มีปุ่ม submit/บันทึกใดๆ** — ออกแบบเสร็จแล้วไปไหนต่อไม่ได้ |
| `/custom/*`, `/custom/tryon` | ⏸ พักไว้ | mock ล้วน — **ส่งต่องานแล้ว** ดูสรุปสำรวจละเอียดใน history.md (2026-07-08) |

### 🏪 ร้านค้า (Merchant) — มี RoleGuard ครอบทั้ง section แล้ว ✅

| หน้า | สถานะ | หมายเหตุ |
|---|---|---|
| `/auth/register/merchant` | ✅ จริง | สมัคร→ POST /api/shops/apply → รอแอดมินอนุมัติ |
| `/merchant/products` (+create/edit) | ✅ จริง | CRUD ครบ ทดสอบ e2e แล้ว — รูปยังเป็น URL (ไม่มีอัปโหลดไฟล์) |
| `/merchant/orders` | ✅ จริง | รับ/ยืนยัน/อัปเดตสถานะออเดอร์ |
| `/merchant` (dashboard) | 🔴 UI เปล่า | ไม่มีสถิติจริง — backend มีข้อมูล orders/payments พร้อม แค่ยังไม่มี endpoint สรุปสถิติ |
| `/merchant/payouts` | 🔴 UI เปล่า | **backend GET /api/payments (role merchant เห็น payout ตัวเอง) มีอยู่แล้ว แค่ต่อ** |
| `/merchant/settings` | 🔴 UI เปล่า | **backend PATCH /api/shops/mine มีอยู่แล้ว แค่ต่อ** |

### 🛡 แอดมิน (Admin) — 🔴 วิกฤตสุดใน 3 role

| ประเด็น | สถานะ |
|---|---|
| หน้า UI | มีครบ 10 หน้า (dashboard, orders, users, products, weavers, analytics, moderation, marketing, settings, base-styles) หน้าตาสวย |
| การต่อ API | **0 บรรทัด — ทุกหน้าเป็นข้อมูล mock hardcode ในไฟล์** |
| การป้องกัน role | **ไม่มีเลย — `app/admin/layout.tsx` ไม่เช็ค auth/role ใดๆ ใครพิมพ์ /admin ก็เข้าได้** (ต่างจาก merchant ที่มี RoleGuard) |
| Backend ที่รอแล้ว | อนุมัติร้าน (PATCH /api/shops/:id/status), ดูออเดอร์ทั้งหมด (GET /api/orders role=admin), ดู payments ทั้งหมด |
| Backend ที่ยังไม่มี | users list, สถิติ dashboard, moderation, marketing, base-styles CRUD |
| **งานสำคัญสุดที่ควรทำก่อน** | 1) ใส่ RoleGuard admin ที่ layout 2) ต่อหน้าอนุมัติร้านค้า (ตอนนี้ร้านสมัครมาแล้ว**ไม่มีทางอนุมัติผ่าน UI ได้เลย** ต้อง SQL ตรงอย่างเดียว) |

---

## 3. ฐานข้อมูล (Supabase Postgres) — ตรวจจากของจริง ไม่ใช่ schema.sql

⚠️ **อย่าเชื่อ `backend/src/schema.sql`** — stale ทั้งสองทาง (มีตารางที่ไม่ exist จริง เช่น `communities` และขาดตารางที่ exist จริงหลายตาราง) ให้ query `information_schema` ตรงเสมอ

- **มีจริง + ใช้งานจริง:** users, shops, products, orders, product_order_groups/product_orders/product_order_items, payments, weaving_orders, weave_patterns, weave_color_variants, notifications, customer_addresses, body_measurements, wishlist_items, order_status_logs
- **มีจริงแต่ว่างเปล่า + ไม่มี route ใดแตะ:** design_briefs, design_brief_options, generated_designs, tryon_results, customer_photos, fabric_uploads, base_styles (มี seed 9 แถว) — เตรียมไว้สำหรับฟีเจอร์ Custom/Try-on ที่พักไว้
- **ไม่มีจริง (แม้อยู่ใน schema.sql):** communities, categories/banners แบบเก่า

บัญชีทดสอบ: ลูกค้า `demo@laya.test` / `laya-demo-1234` · ร้านค้า `merchant-demo@laya.test` / `laya-merchant-1234`

---

## 4. สิ่งที่ติด / ต้องตัดสินใจ (สรุปจาก deflect.md)

| # | ประเด็น | ใครต้องตัดสินใจ |
|---|---|---|
| D1 | Payment gateway ตรวจยอดโอนจริง (Omise/GBPrimePay/2C2P/ธนาคาร) — ตอนนี้ปุ่ม "ฉันโอนแล้ว" เชื่อใจลูกค้าล้วนๆ | เจ้าของธุรกิจ (ค่าธรรมเนียม+สมัครบัญชี) |
| D2 ⚠️ | PromptPay ID ยังเป็น 0812345678 (เลขทดสอบ) — **เปิดใช้จริงตอนนี้เงินเข้าเลขทดสอบ** | เจ้าของธุรกิจ |
| D11 ⚠️ | Backend ไม่มีที่โฮสต์ (ไม่มี Dockerfile/render.yaml ใดๆ) — frontend deploy Vercel ได้แต่ API ยังชี้ localhost | เจ้าของธุรกิจ (เลือก Render/Railway/Fly.io) |
| D4/P6 | นโยบาย service fee ลูกค้ามีผ้าเอง / กัน bypass | ทีมประชุม |
| — | AI API key (kie.ai หรือ KKU Gemini) สำหรับ gen ลายผ้า/try-on — โค้ดพร้อม รอ key อย่างเดียว | เจ้าของธุรกิจ |
| — | ระบบอัปโหลดไฟล์/รูป (product images, customer photos, community posts) — ยังไม่มีทั้งโปรเจกต์ แนะนำ Supabase Storage (ใช้ Supabase อยู่แล้ว) | ทีม dev ตัดสินใจ+ทำได้เลย |

---

## 5. ลำดับงานแนะนำสำหรับคนรับช่วงต่อ (เรียงตาม ผลกระทบ ÷ แรงที่ใช้)

1. **ต่อหน้า `/orders` + `/orders/[id]` ลูกค้าเข้ากับ API จริง** — backend ครบ 100% เหลือแค่ต่อหน้าเดียว ลูกค้าซื้อของแล้วดูประวัติตัวเองไม่ได้คือช่องโหว่ UX ที่แย่สุดตอนนี้
2. **ใส่ RoleGuard ที่ `app/admin/layout.tsx`** — งาน 10 บรรทัด ปิดช่องโหว่ security ทันที (ดูตัวอย่างที่ `components/merchant/MerchantLayoutClient.tsx`)
3. **ต่อหน้าแอดมินอนุมัติร้านค้า** — endpoint มีแล้ว ไม่มี UI = ร้านใหม่สมัครแล้วค้างตลอดกาล
4. **ต่อ `/profile/measurements`** — backend CRUD ครบ รอเฉย ๆ
5. **ต่อ `/merchant/payouts` + `/merchant/settings`** — backend มีแล้วเช่นกัน
6. ลบ/ซ่อน `/gen-silk` (พังอยู่) หรือชี้ไป `/api/nanobanana/generate` แทน
7. ระบบอัปโหลดรูป (Supabase Storage) — ปลดล็อกหลายฟีเจอร์พร้อมกัน (รูปสินค้า, รูปลูกค้า, ฟีดชุมชน)
8. Custom + Try-on (พักไว้ — มีสรุปสำรวจละเอียดใน history.md: ตาราง DB พร้อม 8 ตาราง, มี 3 prototype UI ซ้ำซ้อนต้องเลือก 1, โค้ด AI พร้อมรอ key)
