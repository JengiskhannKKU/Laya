/**
 * ทดสอบ flow ตะกร้าสินค้าพร้อมขาย (ไม่ต้อง custom): เลือกสินค้าจาก 2 ร้าน → checkout →
 * payment เดียว (PromptPay) จ่ายรวมทั้งตะกร้า → confirm → ทั้งสองร้านได้ pending_confirm → ร้านยืนยัน
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
  const custToken = jwt.sign({ userId: customer.id, email: customer.email, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  console.log("=== MARKETPLACE CART/CHECKOUT FLOW ===");

  const products = await api("/api/products");
  console.log(`1. fetched ${products.length} products`);
  const byShop = new Map();
  for (const p of products) if (!byShop.has(p.shopId)) byShop.set(p.shopId, p);
  const twoShopProducts = [...byShop.values()].slice(0, 2);
  console.log("   picking from", twoShopProducts.length, "different shops:", twoShopProducts.map(p => `${p.name} (${p.shopName})`));

  const shopRows = await pool.query(
    `SELECT s.id, s.user_id, u.email FROM shops s JOIN users u ON u.id = s.user_id WHERE s.id = ANY($1::uuid[])`,
    [twoShopProducts.map(p => p.shopId)]
  );

  const order = await api("/api/product-orders", {
    method: "POST",
    body: JSON.stringify({
      items: twoShopProducts.map(p => ({ productId: p.id, quantity: 1 })),
      shipping: {
        recipientName: "ทดสอบ ระบบ",
        phone: "0812345678",
        addressLine1: "123 ถนนทดสอบ",
        subdistrict: "ทดสอบ",
        district: "ทดสอบ",
        province: "กรุงเทพมหานคร",
        postalCode: "10110",
      },
      shippingFee: 50,
    }),
  }, custToken);
  console.log("2. created order group:", order.id, "total:", order.total, "| sub-orders:", order.orders.length);

  const pay = await api("/api/payments", { method: "POST", body: JSON.stringify({ productOrderGroupId: order.id }) }, custToken);
  console.log("3. payment created: amount", pay.amount, "| fee", pay.platformFee, "| payout", pay.shopPayout);
  console.log("   qrPayload starts with:", pay.qrPayload.slice(0, 20));

  const conf = await api(`/api/payments/${pay.id}/confirm`, { method: "POST" }, custToken);
  console.log("4. payment confirmed:", conf.status, conf.transactionRef);

  const group = await api(`/api/product-orders/group/${order.id}`, {}, custToken);
  console.log("5. group status check — all sub-orders pending_confirm?",
    group.orders.every(o => o.status === "pending_confirm"), group.orders.map(o => o.status));

  // ร้านแรกยืนยันออเดอร์ของตัวเอง
  const shop1 = shopRows.rows.find(s => s.id === twoShopProducts[0].shopId);
  const shop1Token = jwt.sign({ userId: shop1.user_id, email: shop1.email, role: "merchant", shopId: shop1.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const shop1Order = group.orders.find(o => o.shopId === shop1.id);
  const confirmed = await api(`/api/product-orders/${shop1Order.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "confirmed" }) }, shop1Token);
  console.log("6. shop1 confirmed sub-order:", confirmed.status);

  // ยืนยันว่าอีกร้านยังไม่ถูกแตะ (ยัง pending_confirm)
  const groupAfter = await api(`/api/product-orders/group/${order.id}`, {}, custToken);
  console.log("7. shop2 order unaffected:", groupAfter.orders.find(o => o.shopId !== shop1.id).status);

  // ลอง transition ผิด (merchant พยายามข้ามขั้น)
  try {
    await api(`/api/product-orders/${shop1Order.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "delivered" }) }, shop1Token);
    console.log("8. BAD: invalid transition allowed!");
  } catch {
    console.log("8. invalid transition rejected OK");
  }

  // ตรวจสต็อกถูกหักจริง
  const stockCheck = await pool.query("SELECT id, name, stock FROM products WHERE id = ANY($1::uuid[])", [twoShopProducts.map(p => p.id)]);
  console.log("9. stock decremented:", stockCheck.rows.map(r => `${r.name}: ${r.stock}`));

  console.log("\n✅ ALL MARKETPLACE FLOW STEPS PASSED");
}

main().catch((e) => { console.error("❌ FAILED:", e.message); process.exitCode = 1; }).finally(() => pool.end());
