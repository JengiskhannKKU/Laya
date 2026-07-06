# LAYA — Deflect (ประเด็นติดขัด / ต้องตัดสินใจ)

> บันทึกสิ่งที่ติด blocker หรือทำแบบชั่วคราวไว้ก่อน — อัปเดตต่อท้ายเรื่อยๆ

---

## 2026-07-06 — จากงานระบบชำระเงิน PromptPay + High Priority

### D1. ยังไม่มี Payment Gateway จริง (ตรวจสอบยอดโอนอัตโนมัติไม่ได้)
- ตอนนี้ QR PromptPay **สแกนจ่ายได้จริง** (มาตรฐาน EMVCo ตรงตามที่แอปธนาคารอ่าน) แต่ระบบ**ไม่รู้ว่าลูกค้าโอนจริงหรือยัง** — ใช้ปุ่ม "ฉันโอนเงินแล้ว" (mock confirm, `transaction_ref` ขึ้นต้น `MOCK-`)
- ต้องตัดสินใจ: ต่อ gateway เจ้าไหน (Omise / GBPrimePay / 2C2P / SCB API / KBank Open API) เพื่อรับ webhook ยืนยันยอด → เกี่ยวข้องกับ P5 (รอ OSD) และค่าธรรมเนียม gateway
- ระหว่างนี้ ร้าน/แอดมินควรตรวจสลิปเองก่อนเริ่มงาน

### D2. PROMPTPAY_ID ยังเป็นเลขทดสอบ
- `backend/.env` → `PROMPTPAY_ID=0812345678` และ `frontend/.env.local` → `NEXT_PUBLIC_PROMPTPAY_ID=0812345678`
- **ต้องเปลี่ยนเป็นพร้อมเพย์จริงของแพลตฟอร์มก่อนเปิดใช้** (เบอร์โทร/เลขนิติบุคคล) — ตอนนี้เงินจะเข้าเลขทดสอบ!

### D3. หน้า Checkout (ตะกร้าสินค้า) ยังไม่บันทึก payment ลง DB
- ตะกร้า/สินค้าในหน้า checkout ยังเป็น mock data (products เดิมไม่ผูกกับ shops ใน schema ใหม่) — QR เจนตามยอดจริงแล้ว แต่กดยืนยันแล้วยังไม่ insert ตาราง `payments`
- Flow ที่บันทึกจริงครบวงจร: **สั่งทอผ้า** (weaving-order → payments → confirm → แจ้งเตือนร้าน)
- ทางแก้ระยะยาว: migrate ตะกร้า/สินค้าให้ผูก `shop_fabrics` หรือเพิ่ม `product_orders` ที่เชื่อม shops

### D4. ค่า service fee — นโยบายยังไม่เคาะ (เกี่ยวกับ P6)
- ใช้ `PLATFORM_FEE_PERCENT=5` (แก้ได้ใน env) คิดจากยอดเต็ม ทุกออเดอร์ที่จ่ายผ่านแพลตฟอร์ม
- ประเด็นค้างจากที่ประชุม (P6): โมเดลรายได้จากลูกค้าที่มีผ้าเอง / กัน bypass — ต้องทีมเคาะ

### D5. บัญชีร้านจริงยังไม่มีใน Supabase Auth
- Merchant orders / confirm ทดสอบด้วย dev JWT (`JWT_SECRET`) + ร้าน seed 4 ร้าน (`backend/_seed_demo_shops.js`)
- ร้านตัวอย่างไม่มีบัญชี Supabase login → หน้า merchant ใน browser จะเข้าโหมด demo จนกว่าจะสมัครร้านจริงผ่าน `/auth/register/merchant` แล้วแอดมิน approve

### D6. บัตรเครดิต / เก็บเงินปลายทาง
- UI มีให้เลือกแต่ยังเป็น mock — ต้องรอเลือก gateway (D1) ก่อนถึงทำจริงได้

### D7. tsx watch ไม่ hot-reload บน Windows ในบางกรณี
- ระหว่าง dev พบว่าแก้ไฟล์ route แล้ว server ไม่ restart เอง — ถ้าแก้ backend แล้วผลไม่เปลี่ยน ให้ kill process port 4000 แล้ว `npm run dev` ใหม่
