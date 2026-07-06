/**
 * ทดสอบ flow จริง: weaving order → payment (PromptPay) → confirm → ร้านยืนยัน
 * และ cutting order → payment → confirm → ร้านยืนยัน (US-212, US-406, US-604, US-605)
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
  // 1) เตรียม test customer
  const cust = await pool.query(
    `INSERT INTO users (email, role, display_name) VALUES ('test-customer@laya.local', 'customer', 'ลูกค้าทดสอบ')
     ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id, email`
  );
  const customer = cust.rows[0];

  // 2) ร้านบ้านนาข่า + เจ้าของ
  const shopRow = await pool.query(
    `SELECT s.id, s.user_id, u.email FROM shops s JOIN users u ON u.id = s.user_id
     WHERE u.email = 'demo-shop-nakha@laya.local'`
  );
  const shop = shopRow.rows[0];

  const custToken = jwt.sign({ userId: customer.id, email: customer.email, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const shopToken = jwt.sign({ userId: shop.user_id, email: shop.email, role: "merchant", shopId: shop.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // ── Weaving flow ────────────────────────────────────────────
  const patterns = await api("/api/weave-patterns");
  console.log("\n=== WEAVING FLOW ===");

  const wo = await api("/api/weaving-orders", {
    method: "POST",
    body: JSON.stringify({
      shopId: shop.id,
      patternId: patterns[0].id,
      customColorNote: "โทนคราม",
      metersRequested: 4,
      estimatedPrice: 1280,
      colorDisclaimerAccepted: true,
    }),
  }, custToken);
  console.log("1. created weaving order:", wo.id, "status:", wo.status);

  const pay = await api("/api/payments", { method: "POST", body: JSON.stringify({ weavingOrderId: wo.id }) }, custToken);
  console.log("2. payment created: amount", pay.amount, "| fee", pay.platformFee, "| payout", pay.shopPayout);
  console.log("   qrPayload:", pay.qrPayload);

  const conf = await api(`/api/payments/${pay.id}/confirm`, { method: "POST" }, custToken);
  console.log("3. payment confirmed:", conf.status, conf.transactionRef);

  const shopConfirm = await api(`/api/weaving-orders/${wo.id}/confirm`, { method: "POST", body: JSON.stringify({ estimatedWeeks: 4 }) }, shopToken);
  console.log("4. shop confirmed:", shopConfirm.status);

  const weaving = await api(`/api/weaving-orders/${wo.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "weaving" }) }, shopToken);
  console.log("5. shop started weaving:", weaving.status);

  // ลอง transition ผิด — ต้องถูกปฏิเสธ
  try {
    await api(`/api/weaving-orders/${wo.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "delivered" }) }, shopToken);
    console.log("6. BAD: invalid transition allowed!");
  } catch (e) {
    console.log("6. invalid transition rejected OK");
  }

  // ── Cutting order flow ──────────────────────────────────────
  console.log("\n=== CUTTING FLOW (US-212) ===");
  const fabric = await pool.query(
    `INSERT INTO shop_fabrics (shop_id, name, pattern_tag, color_name, price_per_meter, stock_meters)
     VALUES ($1, 'ผ้ามัดหมี่ครามธรรมชาติ', 'ลายมัดหมี่', 'ครามเข้ม', 450, 25)
     RETURNING id`,
    [shop.id]
  );

  const order = await api("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      shopId: shop.id,
      shopFabricId: fabric.rows[0].id,
      fabricMetersUsed: 3,
      fabricSource: "shop",
      estimatedPrice: 2350,
    }),
  }, custToken);
  console.log("1. created order:", order.id, "status:", order.status);

  const pay2 = await api("/api/payments", { method: "POST", body: JSON.stringify({ orderId: order.id }) }, custToken);
  console.log("2. payment: amount", pay2.amount, "| fee", pay2.platformFee, "| payout", pay2.shopPayout);

  await api(`/api/payments/${pay2.id}/confirm`, { method: "POST" }, custToken);
  const afterPay = await api(`/api/orders/${order.id}`, {}, custToken);
  console.log("3. after payment, order status:", afterPay.status);

  const oConfirm = await api(`/api/orders/${order.id}/confirm`, { method: "POST" }, shopToken);
  console.log("4. shop confirmed:", oConfirm.status);

  // ── Notifications ───────────────────────────────────────────
  const notiShop = await api("/api/notifications", {}, shopToken);
  const notiCust = await api("/api/notifications", {}, custToken);
  console.log("\nnotifications -> shop:", notiShop.length, "| customer:", notiCust.length);
  console.log("latest shop noti:", notiShop[0]?.title, "|", notiShop[0]?.body);
  console.log("latest cust noti:", notiCust[0]?.title, "|", notiCust[0]?.body);

  await pool.end();
  console.log("\nALL FLOWS PASSED");
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
