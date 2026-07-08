# LAYA — Deflect (ประเด็นติดขัด / ต้องตัดสินใจ)

> บันทึกสิ่งที่ติด blocker หรือทำแบบชั่วคราวไว้ก่อน — อัปเดตต่อท้ายเรื่อยๆ

---

## 2026-07-06 — จากงานระบบชำระเงิน PromptPay + High Priority

### D1. ยังไม่มี Payment Gateway จริง (ตรวจสอบยอดโอนอัตโนมัติไม่ได้)
- ตอนนี้ QR PromptPay **สแกนจ่ายได้จริง** (มาตรฐาน EMVCo ตรงตามที่แอปธนาคารอ่าน) แต่ระบบ**ไม่รู้ว่าลูกค้าโอนจริงหรือยัง** — ใช้ปุ่ม "ฉันโอนเงินแล้ว" (mock confirm, `transaction_ref` ขึ้นต้น `MOCK-`)
- ต้องตัดสินใจ: ต่อ gateway เจ้าไหน (Omise / GBPrimePay / 2C2P / SCB API / KBank Open API) เพื่อรับ webhook ยืนยันยอด → เกี่ยวข้องกับ P5 (รอ OSD) และค่าธรรมเนียม gateway
- ระหว่างนี้ ร้าน/แอดมินควรตรวจสลิปเองก่อนเริ่มงาน

### D2. PROMPTPAY_ID ยังเป็นเลขทดสอบ — ⚠️ บล็อกการขึ้น production จริง
- `backend/.env` → `PROMPTPAY_ID=0812345678` และ `frontend/.env.local` → `NEXT_PUBLIC_PROMPTPAY_ID=0812345678`
- **ต้องเปลี่ยนเป็นพร้อมเพย์จริงของแพลตฟอร์มก่อนเปิดใช้** (เบอร์โทร/เลขนิติบุคคล) — ตอนนี้เงินจะเข้าเลขทดสอบ!
- (2026-07-08) ตรวจสอบระหว่างงาน production-readiness แล้ว — ยังเป็นเลขทดสอบทั้งสองฝั่งเหมือนเดิม ต้องให้เจ้าของธุรกิจให้เลขจริงมาก่อนเปลี่ยนได้

### D3. ~~หน้า Checkout (ตะกร้าสินค้า) ยังไม่บันทึก payment ลง DB~~ — แก้แล้ว (2026-07-07)
- เพิ่มตาราง `products`/`product_order_groups`/`product_orders`/`product_order_items` จริง + ต่อ `/cart`, `/checkout` เข้ากับ backend จริงครบวงจร (สร้างออเดอร์ → payment เดียวจ่ายทั้งตะกร้า แม้มีของจากหลายร้าน → confirm → แจ้งเตือนร้าน) ดูรายละเอียดที่ `backend/CONTEXT.md` entry 2026-07-07
- คงเหลือ: หน้า merchant สร้างสินค้า (`/merchant/products/create`) ยังไม่ต่อ API จริง (ใช้ `backend/_seed_demo_products.js` แทนไปก่อน), หน้า `/orders` (ประวัติออเดอร์ลูกค้า) ยังเป็น mock ไม่รวม product_orders

### D4. ค่า service fee — นโยบายยังไม่เคาะ (เกี่ยวกับ P6)
- ใช้ `PLATFORM_FEE_PERCENT=5` (แก้ได้ใน env) คิดจากยอดเต็ม ทุกออเดอร์ที่จ่ายผ่านแพลตฟอร์ม
- ประเด็นค้างจากที่ประชุม (P6): โมเดลรายได้จากลูกค้าที่มีผ้าเอง / กัน bypass — ต้องทีมเคาะ

### D5. บัญชีร้านจริงยังไม่มีใน Supabase Auth
- Merchant orders / confirm ทดสอบด้วย dev JWT (`JWT_SECRET`) + ร้าน seed 4 ร้าน (`backend/_seed_demo_shops.js`)
- ร้านตัวอย่างไม่มีบัญชี Supabase login → หน้า merchant ใน browser จะเข้าโหมด demo จนกว่าจะสมัครร้านจริงผ่าน `/auth/register/merchant` แล้วแอดมิน approve
- อัปเดต 2026-07-07: มีบัญชี**ลูกค้า**ทดสอบจริงแล้ว — `demo@laya.test` / `laya-demo-1234` (สร้างด้วย `backend/_create_test_auth_user.js`)

### D8. ~~"Invalid or expired token" ทั้งที่เพิ่งล็อกอิน~~ — แก้แล้ว (2026-07-07)
- **ต้นตอ**: Supabase โปรเจกต์นี้เซ็น access token ด้วย **ES256 (asymmetric)** แต่ backend verify ด้วย HS256 shared secret (`SUPABASE_JWT_SECRET`) → ปฏิเสธ token ที่ถูกต้องทุกใบ
- **แก้**: `backend/src/middleware/auth.ts` verify ผ่าน **JWKS** (`jose` + `createRemoteJWKSet` จาก `SUPABASE_URL/auth/v1/.well-known/jwks.json`) — ลำดับ: JWKS → HS256 legacy → dev JWT | เพิ่ม `SUPABASE_URL` ใน `backend/.env`
- **ฝั่ง client เสริม**: `frontend/lib/api-auth.ts` (`authFetch`) — token สดทุก request + refresh อัตโนมัติเมื่อใกล้หมดอายุ + retry เมื่อ 401 + ข้อความไทยพาไป login | ใช้แล้วใน checkout + weaving-order

### D6. บัตรเครดิต / เก็บเงินปลายทาง
- UI มีให้เลือกแต่ยังเป็น mock — ต้องรอเลือก gateway (D1) ก่อนถึงทำจริงได้

### D7. tsx watch ไม่ hot-reload บน Windows ในบางกรณี
- ระหว่าง dev พบว่าแก้ไฟล์ route แล้ว server ไม่ restart เอง — ถ้าแก้ backend แล้วผลไม่เปลี่ยน ให้ kill process port 4000 แล้ว `npm run dev` ใหม่

## 2026-07-08 — จากงาน checkout geo/map, merchant CRUD, category page, ย้ายแผนที่

### D9. ยังไม่ได้ลบ mock data ทั้งหมด (ขอบเขตใหญ่ — ต้องแยกรอบทำ)
- สำรวจแล้ว: **28 ไฟล์ฝั่ง frontend** ยัง `import ... from "@/lib/mock-data"` อยู่ (ทั้งหน้า page และ component) — คร่าวๆ: `app/community/*`, `app/orders/*`, `app/passport*`, `app/product/[id]`, `app/search`, `components/custom/*` (wizard สั่งตัดผ้า/AI), `components/home/BannerCarousel`, `CommunitiesSection`, `components/passport/PassportPage`, `components/product/DigitalCertificateView`/`TraceabilityView`
- ที่ทำจริงแล้ว (ต่อ backend/API แล้ว ไม่ใช้ mock เป็นข้อมูลหลักอีก): checkout, merchant products, notifications, category page, product listing (ใช้ `use-live-products` + fallback mock เฉพาะตอน backend ไม่ตอบ), **wishlist (2026-07-08 รอบสาม — ดู D15)**
- ต้องตัดสินใจ: บาง entity ยังไม่มี backend รองรับเลย (เช่น `weavers`, `communities` แบบละเอียด, `passport`/traceability, custom-order wizard) — ต้องสร้างตาราง+API ก่อนถึงตัด mock ออกได้จริง ไม่ใช่แค่ลบโค้ด
- แนะนำ: แยกเป็นงานย่อยตาม entity (ชุมชน/ช่างทอ → passport/traceability → custom order wizard) แทนทำเป็นก้อนเดียว เพราะแต่ละส่วนต้องมี backend ใหม่

### D10. Product Backlog (`LAYA_Product_Backlog.md`) เช็คสถานะแล้ว พบ 1 จุดที่ checkbox ไม่ตรงของจริง
- **US-603** (ยกเลิกออเดอร์ก่อนร้านคอนเฟิร์ม) ในไฟล์ backlog ยัง `[ ]` แต่จริงๆ **มีแล้วทั้ง backend** (`orders.ts` state machine อนุญาต cancel จาก draft/pending_confirm) **และ frontend** (ปุ่มยกเลิกใน `app/orders/[id]/page.tsx`, `app/orders/page.tsx`) — เข้าใจว่า implement ไปพร้อม US-212 ตอน 2026-07-06 แต่ลืมติ๊ก checkbox ในไฟล์ backlog
- ยังไม่ได้ทำจริง (checkbox ตรงกับความเป็นจริง): **US-211** (ติดตามสถานะขนส่งผ้า — ไม่มีตาราง `shipments`/`shipment_status_logs` ใน schema เลย) และ **US-509** (แชร์ภาพชุดผ้าไทยในคอมมิวนิตี้ — ไม่มีตาราง `community_posts`/`post_images`)
- P1–P6 (ประเด็นรอทีมตัดสินใจ) ยังค้างเหมือนเดิม ไม่มีอะไรเปลี่ยน

## 2026-07-08 (รอบสอง) — production readiness check + สมุดที่อยู่ลูกค้า

### D11. Backend ยังไม่มีที่โฮสต์เลย — ⚠️ บล็อกการขึ้น production จริง
- Frontend มี `vercel.json` พร้อม deploy ได้ แต่ **backend (Express + Postgres) ไม่มี config การ deploy ใดๆ เลย** (ไม่มี `render.yaml`/`railway.json`/`Dockerfile`/`Procfile`) — รันแค่ local dev (`tsx watch`) มาตลอด
- ต้องตัดสินใจ: จะโฮสต์ backend ที่ไหน (Render / Railway / Fly.io ฯลฯ) — เกี่ยวโยงกับ `NEXT_PUBLIC_API_URL` บน Vercel ต้องชี้ไป URL จริงของ backend ที่ deploy แล้ว (ตอนนี้ frontend .env.local ชี้ localhost:4000 อยู่)
- ไม่ได้ทำเองเพราะเกี่ยวข้องกับการสร้างบัญชี/ค่าใช้จ่ายที่ต้องให้เจ้าของโปรเจกต์ตัดสินใจ

### D12. CORS เปิดกว้างทุก origin — แก้แล้ว (2026-07-08)
- `backend/src/app.ts` เดิม config `ALLOWED_ORIGINS` ไว้แต่โค้ดจริงใช้ `cors({ origin: true })` เปิดรับทุก origin เสมอ ไม่ใช้ค่าที่ตั้งไว้เลย (bug ที่ตั้งใจแค่ dev แต่หลุดมาถึง production code path)
- แก้แล้ว: `NODE_ENV=production` จะเช็คกับ `ALLOWED_ORIGINS` จริง (comma-separated), ตอน development ยังเปิดกว้างเหมือนเดิมเพื่อความสะดวก — **อย่าลืมตั้ง `ALLOWED_ORIGINS` ให้ตรงโดเมนจริงตอน deploy จริง** (เช่น `https://laya-app.vercel.app`)

### D13. สมุดที่อยู่ลูกค้า (บันทึกที่อยู่ไว้ใช้ซ้ำ) — เพิ่มแล้ว (2026-07-08)
- ตาราง `customer_addresses` ใหม่ + `GET/POST/PATCH/DELETE /api/addresses` + ต่อเข้า checkout: เลือกจากที่อยู่ที่บันทึกไว้ (default อัตโนมัติ) หรือเพิ่มใหม่พร้อม checkbox "บันทึกไว้ใช้ครั้งหน้า"
- ยังไม่มี: หน้าจัดการที่อยู่แยกใน `/profile` (ตอนนี้จัดการได้เฉพาะจากหน้า checkout — เพิ่ม/ลบได้ แก้ไขยังไม่มี UI)

### D14. แผนที่ `/community/heritage` โหลดช้า/ไม่โหลด — แก้แล้ว (2026-07-08)
- ต้นตอ: fetch GeoJSON จาก `raw.githubusercontent.com` ตรงๆ ทุกครั้งที่เปิดหน้า (external dependency, ไม่มี fallback, catch แล้วเงียบทำให้แผนที่ว่างเปล่าไม่มีข้อความ error）
- แก้: โหลดจากไฟล์ในเครื่องเองแทน (`public/thai-geo/thailand-provinces.geojson`) + เพิ่ม UI แจ้ง error พร้อมปุ่ม "ลองใหม่" แทนการโชว์ว่างเงียบๆ

### เอา "แผนที่" ออกจาก TopNav (desktop) — เสร็จ
- ตามคำขอผู้ใช้ — ยังเหลือ ไอคอน Map ใน BottomNav (มือถือ) ชี้ไปหน้าเดิม `/community/heritage` (ผู้ใช้ระบุแค่ "top bar" ไม่ได้พูดถึง bottom nav)

## 2026-07-08 (รอบสาม) — จาก bug fixes + redesign checkout/cart

### D15. หน้า `/wishlist` (รายการโปรด) เป็น mock ล้วน 100% — แก้แล้ว (2026-07-08 รอบสาม)
- เดิม: ปุ่ม fav ใน `TopNav.tsx` กดได้แต่หน้า `/wishlist` ใช้ `mockFavoriteIds` hardcode, หัวใจใน `ProductCard.tsx` เป็นแค่ `useState` local ไม่ persist, หน้า product detail ไม่มี `onClick` เลย
- แก้แล้วครบวงจร: ตาราง `wishlist_items` (migration 006) + `backend/src/routes/wishlist.ts` (`GET /ids`, `GET /`, `POST /`, `DELETE /:productId`) + `frontend/lib/wishlist-context.tsx` (mount ใน `AuthProviderWrapper`) + ต่อเข้า `ProductCard`/`ProductDetailView`/หน้า `/wishlist` ทั้งหมดแล้ว ทดสอบเต็มวงจรจริงผ่าน
- หมายเหตุ: หัวใจใน `ProductCard`/detail page ใช้ `product.id` ตรงๆ — ถ้าเป็นสินค้า mock (ID ไม่ใช่ UUID จริงในตาราง `products`) การกดหัวใจจะ optimistic update แล้ว rollback เงียบๆ (เพราะ POST คืน 404) ไม่ crash แต่ก็บันทึกไม่ติด — ผลกระทบจะหมดไปเองเมื่อ mock data ถูกลบออกทั้งหมดตาม D9

### D16. Checkout/Cart sticky CTA มือถือเคยถูก BottomNav บังจนกดปุ่มไม่ได้ — แก้แล้ว
- `app/checkout/page.tsx` ปุ่มล่างสุด (`position:fixed bottom:0`) ถูก `BottomNav` (`zIndex:1200` > ปุ่ม `zIndex:100`, ทั้งคู่ยึด `bottom:0` เหมือนกัน) วาดทับจนมองไม่เห็น/กดไม่ได้ — เป็นบั๊กที่มีมาตั้งแต่ก่อนหน้านี้ (ไม่ใช่เพิ่งเกิดตอน redesign) เพราะไม่เคยใส่ offset เหมือนที่ `/cart` ใส่ไว้ (`bottom: 56`)
- แก้แล้วทั้ง `checkout/page.tsx` และยืนยัน `/cart` ใช้ค่าเดิมที่ถูกต้องอยู่แล้ว
- **ข้อสังเกตเชิงระบบ**: หน้าไหนที่มี sticky bottom bar ของตัวเองต้องใส่ `bottom: 56` (หรือมากกว่า) เสมอ ไม่งั้นจะโดน `BottomNav` บังบนมือถือ — ควรเช็คหน้าที่เหลือที่มี pattern คล้ายกัน (เช่นหน้า checkout ของ weaving-order ถ้ามี)

### D17. หน้า `/cart` เคย redirect ไป login ทั้งที่ล็อกอินอยู่จริง — แก้แล้ว
- ต้นตอเดียวกับที่ `/checkout` เคยเจอและแก้ไปแล้วเมื่อ 2026-07-06 (เช็ค `!user` โดยไม่รอ `authLoading` จาก `useAuth()` เสร็จก่อน) แต่ไม่เคยพอร์ต fix มาที่ `/cart` — แก้ให้เหมือนกันแล้ว
- `/wishlist` ก็มีบั๊กเดียวกัน — แก้พร้อมกันตอนเขียนหน้าใหม่ทั้งหน้าแล้ว (ดู D15)
- ยังไม่ได้ไล่เช็คหน้าที่เหลือทั้งหมดว่ามี pattern เดียวกันอีกไหม (เช่น `/orders`, `/profile` ฯลฯ) — ถ้าเจอ user รายงานว่าเด้ง login ทั้งที่ล็อกอินอยู่ ให้สงสัยบั๊กนี้ก่อน

## 2026-07-08 (รอบสี่) — ต่อระบบ communities จริง (mock data removal ต่อเนื่อง)

### D18. `GET /api/communities` เดิมพัง 500 มาตลอด — ไม่มีใครเคยสังเกตเพราะไม่มีใครเรียกใช้จริง (เพิ่งแก้)
- Route query ตาราง `communities` ที่ไม่มีอยู่จริงในฐานข้อมูล (ค้างจาก `schema.sql` เวอร์ชันเก่าก่อนมี marketplace migrations) — แก้ให้ดึงจาก `shops` จริงแทน (ดู history.md สำหรับรายละเอียดเต็ม)
- เพิ่ม `GET /api/communities/:id` ใหม่ (ไม่เคยมีมาก่อนเลย)

### D19. หน้า community detail เดิมโชว์ข้อมูลปลอมที่เหมือนกันทุกร้าน (ไม่ใช่แค่ mock — ข้อมูลผิด/ทำให้เข้าใจผิด) — แก้แล้ว
- ที่สำคัญที่สุด: ป้าย **"GI รับรอง" + "Fair Trade Certified"** ที่ไม่มีข้อมูลรับรองจริงรองรับเลย เคยโชว์ให้ทุกร้านเหมือนกันหมด — ลบออกแล้ว เพราะเป็นการอ้างสิทธิ์รับรองที่อาจมีผลทางกฎหมาย/ความน่าเชื่อถือกับธุรกิจจริงถ้าไม่ได้รับรองจริง
- ช่างทอ 2 คนสมมติ + รีวิวปลอม + ที่อยู่ปลอม (ต.ศรีภูมิ ลำพูน โชว์ทุกร้าน) — ลบ/ซ่อนออกหมดแล้ว เหลือแค่ข้อมูลจริง (description, address ถ้ามี, rating/reviewCount รวม, สินค้าจริงกรองตาม shopId)
- ระบบช่างทอรายบุคคล (weaver profiles) ยังไม่มี backend entity เลย — ถ้าจะทำในอนาคตต้องออกแบบตารางใหม่ทั้งหมด ไม่ใช่แค่ต่อ API

### D20. หน้า `/community` (ฟีดโซเชียล Pinterest-style) ยังเป็น mock 100% — ยังไม่ทำ ตรงกับ US-509 ที่ backlog บอกว่ายังไม่ทำ
- โพสต์/ไลก์/คอมเมนต์ทั้งหมดเป็นข้อมูลสมมติแบบ hardcode ในไฟล์ (ไม่ใช่แค่ import จาก mock-data.ts) — ต้องมีตาราง `community_posts`/`post_images`/likes/comments ใหม่ทั้งหมด และตัดสินใจ scope ฟีเจอร์โซเชียลก่อน (อัปโหลดรูป? comment แบบไหน? moderation?) — ใหญ่กว่างานต่อ API ธรรมดา แนะนำแยกเป็นโปรเจกต์ย่อยของตัวเอง

## 2026-07-08 (รอบห้า) — ตรวจความพร้อมระบบทุก role ก่อนส่งต่องาน (ดูรายงานเต็มที่ `SYSTEM_READINESS.md`)

### D21. ⚠️ Admin ทั้ง section ไม่มีการป้องกัน role เลย + ทุกหน้าเป็น mockup ล้วน
- `app/admin/layout.tsx` **ไม่เช็ค auth/role ใดๆ** — ใครพิมพ์ URL /admin ก็เข้าดูได้ (ต่างจาก merchant ที่มี `RoleGuard` ครอบใน `MerchantLayoutClient.tsx` แล้ว) — แก้ง่าย ~10 บรรทัด ควรทำทันที
- ทั้ง 10 หน้า admin (dashboard/orders/users/products/weavers/analytics/moderation/marketing/settings/base-styles) **ไม่มี API call แม้แต่บรรทัดเดียว** — เป็น UI สวยๆ กับข้อมูล hardcode
- ผลกระทบจริง: **ร้านค้าที่สมัครใหม่ผ่าน `/auth/register/merchant` จะค้างสถานะ pending ตลอดกาล** เพราะ endpoint อนุมัติ (`PATCH /api/shops/:id/status`) มีอยู่แล้วแต่ไม่มี UI แอดมินกดอนุมัติ — ต้องยิง SQL/curl ตรงเท่านั้น
- Backlog `US-701/702/703` ติ๊ก [x] ไว้ **ไม่ตรงความจริง** (ตรงข้ามกับเคส US-603 ที่ทำแล้วแต่ลืมติ๊ก)

### D22. หน้า `/orders` + `/orders/[id]` (ประวัติออเดอร์ลูกค้า) ยังใช้ `mockOrders` ทั้งที่ backend ครบ 100%
- `GET /api/orders` (role-filtered) + `GET /api/product-orders` มีครบและใช้งานจริงได้ — เหลือแค่ต่อหน้า frontend
- เป็นงานที่คุ้มสุดในลิสต์ที่เหลือ: ลูกค้าซื้อของจ่ายเงินจริงได้แล้ว แต่**ดูประวัติที่ตัวเองสั่งไม่ได้**

### D23. หน้า UI เปล่าที่ backend รอพร้อมแล้ว (งานต่อสายอย่างเดียว ไม่ต้องเขียน backend)
- `/profile/measurements` ← `/api/measurements` (CRUD ครบ)
- `/merchant/payouts` ← `GET /api/payments` (role merchant เห็น payout ตัวเองอยู่แล้ว)
- `/merchant/settings` ← `PATCH /api/shops/mine`
- `/merchant` dashboard — ข้อมูลมีใน DB แต่ยังไม่มี endpoint สรุปสถิติ (ต้องเขียนเพิ่มเล็กน้อย)

### D24. Custom + Try-on — พักไว้ ส่งต่อทีมอื่น (สำรวจเสร็จแล้ว สรุปอยู่ใน history.md 2026-07-08)
- ประเด็นหลักที่คนรับช่วงต้องรู้: ① มี **3 prototype UI ซ้ำซ้อน** (`/custom/*` ที่ไม่มีลิงก์เข้าถึง, `/design-clothes` ที่ไม่มีปุ่ม submit, `/gen-silk` ที่พังเพราะชี้ localhost:5000) ต้องเลือกทางเดียว ② ตาราง DB ออกแบบไว้ครบ 8 ตาราง (design_briefs, generated_designs, tryon_results, customer_photos ฯลฯ) **มีจริงใน DB แต่ว่างเปล่าและไม่มี route ใดแตะ** ③ โค้ดเรียก AI (kie.ai/nanobanana + KKU Gemini vision) เขียนเสร็จแล้วทั้งสองตัว **ขาดแค่ API key ใน .env** ④ `/api/ai/tryon` ยังไม่มี implementation เลยทั้ง frontend/backend (TODO ล้วน)
