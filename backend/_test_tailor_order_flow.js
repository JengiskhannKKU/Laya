/**
 * Smoke test: สั่งตัด (tailor-with-fabric) checkout flow ที่เพิ่งต่อ backend จริง
 * (OrderSummaryStep.tsx: POST /api/measurements -> POST /api/orders -> POST /api/payments)
 * ทดสอบเคส fabricSource: "own" (ลูกค้าอัปโหลดผ้าเอง ไม่ใช่ผ้าจากสต็อกร้าน) ซึ่งเดิมไม่มีการยิง API เลย
 */
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const API = "http://localhost:4000";
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function api(path, opts = {}, token) {
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  const cust = await pool.query(
    `INSERT INTO users (email, role, display_name) VALUES ('test-customer@laya.local', 'customer', 'ลูกค้าทดสอบ')
     ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id, email`
  );
  const customer = cust.rows[0];

  const shopRow = await pool.query(
    `SELECT s.id, s.user_id, u.email FROM shops s JOIN users u ON u.id = s.user_id LIMIT 1`
  );
  const shop = shopRow.rows[0];
  if (!shop) throw new Error("no shops in DB to test against");

  const custToken = jwt.sign({ userId: customer.id, email: customer.email, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  console.log("=== TAILOR-WITH-FABRIC CHECKOUT (fabricSource: own) ===");

  // 0) fabric upload (mirrors: UploadFabricStep.tsx keeps orderState.fabricImage as base64 data URL;
  //    OrderSummaryStep.tsx now persists it via /api/fabric-uploads before creating the order)
  const TINY_PNG_BASE64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const fabricUpload = await api("/api/fabric-uploads", {
    method: "POST",
    body: JSON.stringify({ imageBase64: TINY_PNG_BASE64, name: "ผ้าทดสอบ" }),
  }, custToken);
  console.log("0. fabric upload created:", fabricUpload.id, fabricUpload.imageUrl);

  // 1) body measurements (mirrors: bodyInputMode === "measurements" branch)
  const meas = await api("/api/measurements", {
    method: "POST",
    body: JSON.stringify({
      label: "สั่งตัด — เสื้อเชิ้ต",
      heightCm: 170, weightKg: 60, chestCm: 88, waistCm: 74, hipCm: 92, shoulderCm: 42, notes: "อยากให้หลวมนิดหน่อย",
    }),
  }, custToken);
  console.log("1. measurement created:", meas.id);

  // 2) order (mirrors: handleConfirmOrder in OrderSummaryStep.tsx)
  const order = await api("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      shopId: shop.id,
      fabricSource: "own",
      fabricUploadId: fabricUpload.id,
      measurementId: meas.id,
      specialInstructions: "โอกาส: งานแต่งงาน | สไตล์: ทางการ | คอเสื้อ: คอปก",
      estimatedPrice: 1990,
    }),
  }, custToken);
  console.log("2. order created:", order.id, "status:", order.status, "fabricSource:", order.fabricSource);
  if (order.status !== "draft") throw new Error(`expected draft, got ${order.status}`);
  if (order.estimatedPrice !== 1990) throw new Error(`expected estimatedPrice 1990, got ${order.estimatedPrice}`);

  // 3) payment (mirrors: second authFetch call in OrderSummaryStep.tsx)
  const pay = await api("/api/payments", { method: "POST", body: JSON.stringify({ orderId: order.id }) }, custToken);
  console.log("3. payment created:", pay.id, "amount:", pay.amount, "qrPayload present:", !!pay.qrPayload, "promptpayId:", pay.promptpayId);
  if (!pay.qrPayload || !pay.id || !pay.promptpayId) throw new Error("payment response missing fields PaymentStep.tsx needs (id/qrPayload/promptpayId)");
  if (pay.amount !== 1990) throw new Error(`expected payment amount 1990, got ${pay.amount}`);

  await pool.end();
  console.log("\nALL CHECKS PASSED — /api/orders + /api/payments accept the exact payload OrderSummaryStep.tsx now sends");
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
