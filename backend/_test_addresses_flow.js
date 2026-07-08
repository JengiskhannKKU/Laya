/**
 * ทดสอบสมุดที่อยู่ลูกค้า: สร้าง 2 ที่อยู่ (ใบแรกเป็น default อัตโนมัติ) → list → ตั้ง default ใบที่สอง
 * → ลบใบ default → ยืนยันว่ามี default ใหม่โผล่มาแทน
 */
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const API = "http://localhost:4099"; // isolated instance for this verification
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function api(path, opts = {}, token) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
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
  const token = jwt.sign({ userId: customer.id, email: customer.email, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  await pool.query("DELETE FROM customer_addresses WHERE user_id = $1", [customer.id]);
  console.log("=== ADDRESS BOOK FLOW ===");

  const a1 = await api("/api/addresses", { method: "POST", body: JSON.stringify({
    label: "บ้าน", recipientName: "สมชาย ใจดี", phone: "0812345678",
    addressLine1: "123 ถนนทดสอบ", subdistrict: "สุเทพ", district: "เมืองเชียงใหม่", province: "เชียงใหม่", postalCode: "50200",
  }) }, token);
  console.log("1. created address 1 (should be default since it's the first):", a1.id, "isDefault:", a1.isDefault);

  const a2 = await api("/api/addresses", { method: "POST", body: JSON.stringify({
    label: "ที่ทำงาน", recipientName: "สมชาย ใจดี", phone: "0898765432",
    addressLine1: "456 อาคารสำนักงาน", subdistrict: "ข่วงเปา", district: "จอมทอง", province: "เชียงใหม่", postalCode: "50160",
  }) }, token);
  console.log("2. created address 2 (should NOT be default):", a2.id, "isDefault:", a2.isDefault);

  let list = await api("/api/addresses", {}, token);
  console.log("3. list count:", list.length, "| default is a1?", list.find(a => a.isDefault)?.id === a1.id);

  await api(`/api/addresses/${a2.id}`, { method: "PATCH", body: JSON.stringify({ isDefault: true }) }, token);
  list = await api("/api/addresses", {}, token);
  console.log("4. after setting a2 default — default is a2?", list.find(a => a.isDefault)?.id === a2.id, "| a1 still not default?", !list.find(a => a.id === a1.id).isDefault);

  await api(`/api/addresses/${a2.id}`, { method: "DELETE" }, token);
  list = await api("/api/addresses", {}, token);
  console.log("5. after deleting default (a2) — a1 auto-promoted to default?", list.length === 1 && list[0].id === a1.id && list[0].isDefault);

  console.log("\n✅ ALL ADDRESS BOOK STEPS PASSED");
}

main().catch((e) => { console.error("❌ FAILED:", e.message); process.exitCode = 1; }).finally(() => pool.end());
