/**
 * Seed ร้านทอผ้าตัวอย่าง (idempotent) — ใช้ทดสอบ US-406/US-506
 * รัน: node _seed_demo_shops.js
 */
require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const SHOPS = [
  {
    email: "demo-shop-nakha@laya.local",
    name: "ชุมชนทอผ้าบ้านนาข่า",
    province: "อุดรธานี",
    description: "ชุมชนทอผ้ามัดหมี่ดั้งเดิม สืบทอดกว่า 3 รุ่น",
    specialties: ["ลายมัดหมี่", "ผ้ามัดหมี่"],
    services: ["weave", "cut_shop_fabric"],
    rating: 4.9,
  },
  {
    email: "demo-shop-bankwao@laya.local",
    name: "กลุ่มทอผ้าไหมบ้านเขว้า",
    province: "ชัยภูมิ",
    description: "ผ้าไหมไทยแท้ ย้อมสีธรรมชาติ",
    specialties: ["ผ้าไหมไทย", "ลายขอ"],
    services: ["weave"],
    rating: 4.8,
  },
  {
    email: "demo-shop-cnxcotton@laya.local",
    name: "วิสาหกิจชุมชนผ้าฝ้ายเชียงใหม่",
    province: "เชียงใหม่",
    description: "ผ้าฝ้ายทอมือ ย้อมครามธรรมชาติ",
    specialties: ["ผ้าฝ้ายทอมือ", "ลายนกยูง"],
    services: ["all"],
    rating: 4.7,
  },
  {
    email: "demo-shop-lamphun@laya.local",
    name: "ชุมชนทอผ้าซิ่นลำพูน",
    province: "ลำพูน",
    description: "ผ้าซิ่นยกดอกลำพูน ลายดอกพิกุล",
    specialties: ["ผ้าซิ่น", "ลายดอกพิกุล", "ลายจก"],
    services: ["weave", "cut_own_fabric"],
    rating: 4.8,
  },
];

async function main() {
  for (const s of SHOPS) {
    const u = await pool.query(
      `INSERT INTO users (email, role, display_name)
       VALUES ($1, 'shop', $2)
       ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
       RETURNING id`,
      [s.email, s.name]
    );
    const userId = u.rows[0].id;

    const existing = await pool.query("SELECT id FROM shops WHERE user_id = $1", [userId]);
    let shopId;
    if (existing.rows.length) {
      shopId = existing.rows[0].id;
      await pool.query(
        "UPDATE shops SET status='approved', approved_at=COALESCE(approved_at, NOW()), rating=$1 WHERE id=$2",
        [s.rating, shopId]
      );
    } else {
      const r = await pool.query(
        `INSERT INTO shops (user_id, name, description, province, status, approved_at, rating)
         VALUES ($1, $2, $3, $4, 'approved', NOW(), $5) RETURNING id`,
        [userId, s.name, s.description, s.province, s.rating]
      );
      shopId = r.rows[0].id;
    }

    for (const tag of s.specialties) {
      await pool.query(
        "INSERT INTO shop_specialties (shop_id, pattern_tag) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [shopId, tag]
      );
    }
    for (const svc of s.services) {
      await pool.query(
        "INSERT INTO shop_services (shop_id, service_type) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [shopId, svc]
      );
    }
    console.log(`OK: ${s.name} (${shopId})`);
  }
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
