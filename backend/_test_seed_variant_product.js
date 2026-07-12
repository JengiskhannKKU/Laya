/* สร้าง/ลบสินค้า multi-SKU ชั่วคราวไว้ตรวจ UI — node _test_seed_variant_product.js [cleanup] */
require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  if (process.argv[2] === "cleanup") {
    await pool.query("DELETE FROM products WHERE name = '[UI TEST] ผ้าไหมหลายตัวเลือก'");
    await pool.query("DELETE FROM shops WHERE name = '[UI TEST] ร้านตรวจหน้าเว็บ'");
    await pool.query("DELETE FROM users WHERE email = 'test-ui-variant@laya.local'");
    console.log("cleaned");
  } else {
    const u = await pool.query(
      `INSERT INTO users (email, role, display_name) VALUES ('test-ui-variant@laya.local','customer','ร้านตรวจ UI')
       ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING id`
    );
    const s = await pool.query(
      `INSERT INTO shops (user_id, name, province, status, is_open) VALUES ($1,'[UI TEST] ร้านตรวจหน้าเว็บ','เชียงใหม่','approved',true) RETURNING id`,
      [u.rows[0].id]
    );
    const p = await pool.query(
      `INSERT INTO products (shop_id, name, description, category, price, price_unit, stock, has_variants, images)
       VALUES ($1,'[UI TEST] ผ้าไหมหลายตัวเลือก','สินค้าทดสอบ UI ตัวเลือก SKU','fabric',100,'ผืน',0,true,'{}') RETURNING id`,
      [s.rows[0].id]
    );
    await pool.query(
      `INSERT INTO product_variants (product_id, sku, color, size, price, stock) VALUES
       ($1,'UI-RED-M','แดง','M',450,5), ($1,'UI-RED-L','แดง','L',480,3), ($1,'UI-NAVY-M','กรมท่า','M',450,0)`,
      [p.rows[0].id]
    );
    console.log(p.rows[0].id);
  }
  await pool.end();
}
main().catch((e) => { console.error(e.message); process.exit(1); });
