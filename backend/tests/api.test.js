/**
 * API test suite — รันด้วย `npm test` (node:test)
 * สตาร์ท backend จริงบนพอร์ตทดสอบ แล้วไล่เทส: endpoint สาธารณะ, สมัครร้านค้า (merchant type),
 * Multi-SKU checkout (validate/ตัดสต็อก/ยอดเงิน), การชำระเงิน, สถานะออเดอร์ → สถานะขนส่งละเอียด,
 * และ regression สินค้าแบบไม่มี SKU — ข้อมูลทดสอบ (*@laya.local) ถูกลบทิ้งใน after() เสมอ
 */
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createPool, startServer, signToken, api } = require("./helpers");

let stopServer;
let pool;

// ── ข้อมูลทดสอบที่แชร์ระหว่างเทส (เทสในไฟล์เดียวกันรันตามลำดับ) ──
const S = {};
const ids = { users: [], shops: [], products: [], groups: [] };

const SHIPPING = {
  recipientName: "ทดสอบ ระบบ", phone: "0812345678", addressLine1: "123 ถนนทดสอบ",
  subdistrict: "ทดสอบ", district: "ทดสอบ", province: "กรุงเทพมหานคร", postalCode: "10110",
};

before(async () => {
  pool = createPool();
  stopServer = await startServer();
});

after(async () => {
  try {
    if (ids.groups.length) {
      await pool.query("DELETE FROM payments WHERE product_order_group_id = ANY($1::uuid[])", [ids.groups]);
      await pool.query("DELETE FROM product_order_groups WHERE id = ANY($1::uuid[])", [ids.groups]);
    }
    if (ids.products.length) await pool.query("DELETE FROM products WHERE id = ANY($1::uuid[])", [ids.products]);
    if (ids.shops.length) await pool.query("DELETE FROM shops WHERE id = ANY($1::uuid[])", [ids.shops]);
    if (ids.users.length) {
      await pool.query("DELETE FROM notifications WHERE user_id = ANY($1::uuid[])", [ids.users]);
      await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [ids.users]);
    }
  } finally {
    await pool.end();
    if (stopServer) await stopServer();
  }
});

// ── 1) endpoint สาธารณะต้องไม่พัง ──────────────────────────────────────────────
test("public endpoints ตอบ 200", async () => {
  for (const ep of ["/health", "/api/products", "/api/categories", "/api/banners", "/api/communities", "/api/shops", "/api/weave-patterns"]) {
    const { status } = await api(ep);
    assert.equal(status, 200, `${ep} → ${status}`);
  }
});

test("endpoint ที่ต้องล็อกอิน ปฏิเสธ request ไม่มี token", async () => {
  for (const ep of ["/api/notifications", "/api/product-orders", "/api/payments", "/api/addresses"]) {
    const { status } = await api(ep);
    assert.equal(status, 401, `${ep} → ${status}`);
  }
});

// ── 2) setup ผู้ใช้ + สมัครร้านค้าพร้อม merchant type ──────────────────────────
test("สมัครร้านค้าระบุ merchantType = designer", async () => {
  const mu = await pool.query(
    `INSERT INTO users (email, role, display_name) VALUES ('test-sku-merchant@laya.local', 'customer', 'ร้านทดสอบ SKU')
     ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id, email`
  );
  S.merchantUser = mu.rows[0];
  ids.users.push(S.merchantUser.id);

  const cu = await pool.query(
    `INSERT INTO users (email, role, display_name) VALUES ('test-sku-customer@laya.local', 'customer', 'ลูกค้าทดสอบ SKU')
     ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id, email`
  );
  S.customer = cu.rows[0];
  ids.users.push(S.customer.id);
  S.custToken = signToken({ userId: S.customer.id, email: S.customer.email, role: "customer" });

  await pool.query("DELETE FROM shops WHERE user_id = $1", [S.merchantUser.id]);
  const preToken = signToken({ userId: S.merchantUser.id, email: S.merchantUser.email, role: "customer" });
  const applied = await api("/api/shops/apply", {
    method: "POST",
    body: JSON.stringify({ name: "ร้านทดสอบ SKU", province: "เชียงใหม่", merchantType: "designer", promptpayId: "0812345678" }),
  }, preToken);
  assert.equal(applied.status, 201);
  S.shopId = applied.data.id;
  ids.shops.push(S.shopId);

  const row = await pool.query("SELECT merchant_type, status FROM shops WHERE id = $1", [S.shopId]);
  assert.equal(row.rows[0].merchant_type, "designer");
  assert.equal(row.rows[0].status, "pending");

  await pool.query("UPDATE shops SET status = 'approved' WHERE id = $1", [S.shopId]);
  S.merchantToken = signToken({ userId: S.merchantUser.id, email: S.merchantUser.email, role: "merchant", shopId: S.shopId, shopStatus: "approved" });
});

test("merchantType มั่ว fallback เป็น weaving_community", async () => {
  const u = await pool.query(
    `INSERT INTO users (email, role, display_name) VALUES ('test-mtype-fallback@laya.local', 'customer', 'ทดสอบ fallback')
     ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id, email`
  );
  ids.users.push(u.rows[0].id);
  await pool.query("DELETE FROM shops WHERE user_id = $1", [u.rows[0].id]);
  const token = signToken({ userId: u.rows[0].id, email: u.rows[0].email, role: "customer" });
  const applied = await api("/api/shops/apply", {
    method: "POST",
    body: JSON.stringify({ name: "ร้าน fallback", province: "น่าน", merchantType: "hacker" }),
  }, token);
  assert.equal(applied.status, 201);
  ids.shops.push(applied.data.id);
  const row = await pool.query("SELECT merchant_type FROM shops WHERE id = $1", [applied.data.id]);
  assert.equal(row.rows[0].merchant_type, "weaving_community");
});

// ── 3) สินค้า multi-SKU ────────────────────────────────────────────────────────
test("สร้างสินค้า + SKU และหน้าร้านเห็น variants", async () => {
  const prod = await api("/api/products", {
    method: "POST",
    body: JSON.stringify({ name: "ผ้าทดสอบ SKU", price: 100, stock: 0, hasVariants: true, category: "fabric" }),
  }, S.merchantToken);
  assert.equal(prod.status, 201);
  S.productId = prod.data.id;
  ids.products.push(S.productId);

  const variants = await api(`/api/products/${S.productId}/variants/bulk`, {
    method: "POST",
    body: JSON.stringify({
      variants: [
        { sku: "TEST-RED-M", color: "แดง", size: "M", price: 150, stock: 5 },
        { sku: "TEST-BLUE-L", color: "น้ำเงิน", size: "L", price: 180, stock: 2 },
      ],
    }),
  }, S.merchantToken);
  assert.equal(variants.data.length, 2);
  [S.vRed, S.vBlue] = variants.data;

  const detail = await api(`/api/products/${S.productId}`);
  assert.equal(detail.data.hasVariants, true);
  assert.equal(detail.data.variants.length, 2);

  const list = await api(`/api/products?shopId=${S.shopId}`);
  const inList = list.data.find((p) => p.id === S.productId);
  assert.ok(inList, "สินค้าต้องโผล่ใน marketplace list");
  assert.equal(Number(inList.priceMin), 150);
  assert.equal(Number(inList.priceMax), 180);
  assert.equal(Number(inList.stockTotal), 7);
});

// ── 4) checkout validation ─────────────────────────────────────────────────────
test("สินค้ามี SKU แต่ไม่ส่ง variantId → 400", async () => {
  const res = await api("/api/product-orders", {
    method: "POST",
    body: JSON.stringify({ items: [{ productId: S.productId, quantity: 1 }], shipping: SHIPPING }),
  }, S.custToken);
  assert.equal(res.status, 400);
});

test("สั่งเกินสต็อก SKU → 400", async () => {
  const res = await api("/api/product-orders", {
    method: "POST",
    body: JSON.stringify({ items: [{ productId: S.productId, variantId: S.vBlue.id, quantity: 99 }], shipping: SHIPPING }),
  }, S.custToken);
  assert.equal(res.status, 400);
});

// ── 5) checkout จริง: ราคา/สต็อกจาก SKU ────────────────────────────────────────
test("checkout multi-SKU คิดเงินจากราคา SKU และตัดสต็อกราย SKU", async () => {
  const order = await api("/api/product-orders", {
    method: "POST",
    body: JSON.stringify({
      items: [
        { productId: S.productId, variantId: S.vRed.id, quantity: 2 },
        { productId: S.productId, variantId: S.vBlue.id, quantity: 1 },
      ],
      shipping: SHIPPING, shippingFee: 50,
    }),
  }, S.custToken);
  assert.equal(order.status, 201);
  ids.groups.push(order.data.id);
  S.groupId = order.data.id;
  S.poId = order.data.orders[0].id;

  assert.equal(Number(order.data.subtotal), 480); // 150*2 + 180
  assert.equal(Number(order.data.total), 530);

  const stock = await pool.query("SELECT id, stock FROM product_variants WHERE product_id = $1", [S.productId]);
  assert.equal(stock.rows.find((r) => r.id === S.vRed.id).stock, 3);
  assert.equal(stock.rows.find((r) => r.id === S.vBlue.id).stock, 1);

  const items = await pool.query("SELECT variant_id, variant_label FROM product_order_items WHERE product_order_id = $1", [S.poId]);
  assert.ok(items.rows.every((r) => r.variant_id && r.variant_label), "ทุก item ต้องบันทึก variant");
});

// ── 6) การชำระเงิน ─────────────────────────────────────────────────────────────
test("สร้าง payment + confirm (แนบสลิป) → ออเดอร์เป็น pending_confirm", async () => {
  const pay = await api("/api/payments", { method: "POST", body: JSON.stringify({ productOrderGroupId: S.groupId }) }, S.custToken);
  assert.equal(pay.data.payments.length, 1);
  // ต้องแนบสลิป (slipUrl) เสมอ — SlipOk ปิดอยู่ในเทส จึงเก็บสลิปไว้ให้ตรวจเอง (slip_verified=false)
  const noSlip = await api(`/api/payments/${pay.data.payments[0].id}/confirm`, { method: "POST" }, S.custToken);
  assert.equal(noSlip.status, 400);
  const confirm = await api(`/api/payments/${pay.data.payments[0].id}/confirm`, { method: "POST", body: JSON.stringify({ slipUrl: "https://example.com/slip.jpg" }) }, S.custToken);
  assert.equal(confirm.status, 200);
  const po = await pool.query("SELECT status FROM product_orders WHERE id = $1", [S.poId]);
  assert.equal(po.rows[0].status, "pending_confirm");
});

// ── 7) เดินสถานะออเดอร์ → shipped แล้วสถานะขนส่งเริ่มอัตโนมัติ ────────────────
test("order → shipped ตั้ง shipping_status = pending อัตโนมัติ", async () => {
  for (const s of ["confirmed", "in_progress", "ready"]) {
    const r = await api(`/api/product-orders/${S.poId}/status`, { method: "PATCH", body: JSON.stringify({ status: s }) }, S.merchantToken);
    assert.equal(r.status, 200, `→ ${s}`);
  }
  const shipped = await api(`/api/product-orders/${S.poId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "shipped", trackingNo: "TH999TEST", courier: "Flash" }),
  }, S.merchantToken);
  assert.equal(shipped.status, 200);

  const po = await pool.query("SELECT shipping_status FROM product_orders WHERE id = $1", [S.poId]);
  assert.equal(po.rows[0].shipping_status, "pending");
});

// ── 8) สถานะขนส่งละเอียด ───────────────────────────────────────────────────────
test("shipping-status: กันข้ามขั้น + กันลูกค้าอัปเดต", async () => {
  const skip = await api(`/api/product-orders/${S.poId}/shipping-status`, {
    method: "PATCH", body: JSON.stringify({ shippingStatus: "delivered" }),
  }, S.merchantToken);
  assert.equal(skip.status, 400, "pending → delivered ต้องถูกปฏิเสธ");

  const cust = await api(`/api/product-orders/${S.poId}/shipping-status`, {
    method: "PATCH", body: JSON.stringify({ shippingStatus: "picked_up" }),
  }, S.custToken);
  assert.equal(cust.status, 403);
});

test("shipping-status: picked_up → in_transit → delivered ปิดออเดอร์อัตโนมัติ", async () => {
  for (const s of ["picked_up", "in_transit", "delivered"]) {
    const r = await api(`/api/product-orders/${S.poId}/shipping-status`, { method: "PATCH", body: JSON.stringify({ shippingStatus: s }) }, S.merchantToken);
    assert.equal(r.status, 200, `→ ${s}`);
  }
  const po = await pool.query("SELECT status, shipping_status FROM product_orders WHERE id = $1", [S.poId]);
  assert.equal(po.rows[0].status, "delivered");
  assert.equal(po.rows[0].shipping_status, "delivered");

  const logs = await pool.query("SELECT new_status FROM product_order_shipping_logs WHERE product_order_id = $1 ORDER BY created_at", [S.poId]);
  assert.deepEqual(logs.rows.map((r) => r.new_status), ["picked_up", "in_transit", "delivered"]);
});

test("ลูกค้าเห็น shippingStatus + shippingLogs + variantLabel ในรายละเอียดออเดอร์", async () => {
  const detail = await api(`/api/product-orders/${S.poId}`, {}, S.custToken);
  assert.equal(detail.data.shippingStatus, "delivered");
  assert.equal(detail.data.shippingLogs.length, 3);
  assert.ok(detail.data.items.every((it) => it.variantLabel));
});

// ── 9) regression: สินค้าไม่มี SKU ────────────────────────────────────────────
test("สินค้าไม่มี SKU ยังซื้อแบบเดิมได้ ตัดสต็อกสินค้าหลัก", async () => {
  const plain = await api("/api/products", {
    method: "POST",
    body: JSON.stringify({ name: "ผ้าทดสอบธรรมดา", price: 200, stock: 4, category: "fabric" }),
  }, S.merchantToken);
  ids.products.push(plain.data.id);

  const order = await api("/api/product-orders", {
    method: "POST",
    body: JSON.stringify({ items: [{ productId: plain.data.id, quantity: 1 }], shipping: SHIPPING, shippingFee: 50 }),
  }, S.custToken);
  assert.equal(order.status, 201);
  ids.groups.push(order.data.id);
  assert.equal(Number(order.data.subtotal), 200);

  const stock = await pool.query("SELECT stock FROM products WHERE id = $1", [plain.data.id]);
  assert.equal(stock.rows[0].stock, 3);
});
