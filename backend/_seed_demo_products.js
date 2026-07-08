/**
 * Seed สินค้าพร้อมขาย (ready-made, ไม่ต้องสั่งตัด) ผูกกับร้านสาธิต 4 ร้าน
 * เนื้อหา/รูปคัดมาจาก frontend/lib/mock-data.ts เพื่อให้หน้าเว็บดูสมจริง
 * Idempotent: ลบของเดิมที่ name ตรงกันก่อน insert ใหม่ — รันซ้ำได้
 *
 * Usage: node _seed_demo_products.js
 */
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SHOPS_BY_PROVINCE = {
  อุดรธานี: null, // set below
  ชัยภูมิ: null,
  เชียงใหม่: null,
  ลำพูน: null,
};

const PRODUCTS = [
  {
    name: "กระเป๋าสตางค์ผ้าไหม 'วัยรุ่นเดอะ' Wallet",
    description: "กระเป๋าสตางค์ใบสั้นพกพาสะดวก เข้าเซ็ตกับชุด Contemporary Set ช่องใส่บัตร 8 ช่อง ซับในหนังแท้",
    category: "bag",
    price: 850,
    priceUnit: "บาท",
    stock: 50,
    images: ["/teenager1.webp"],
    fabricType: "ผ้าไหม",
    hasGI: false,
    province: "ลำพูน",
  },
  {
    name: "พวงกุญแจวัยรุ่น Mini Pouch",
    description: "กระเป๋าขนาดมินิสำหรับใส่อุปกรณ์ขนาดเล็ก พกพาสะดวก ดีไซน์เข้าชุดวัยรุ่นเดอะ",
    category: "bag",
    price: 150,
    priceUnit: "ชิ้น",
    stock: 30,
    images: ["/teenager3.webp"],
    fabricType: "ผ้าไหม",
    hasGI: false,
    province: "ลำพูน",
  },
  {
    name: "ชุดเซ็ตผ้าไหม 'วัยรุ่นเดอะ' Contemporary Set",
    description: "ชุดผ้าไหมทอมือดีไซน์ร่วมสมัย ตัดเย็บสำเร็จพร้อมสวมใส่ เหมาะกับงานพิธีการและออกงานสำคัญ",
    category: "clothing",
    price: 3200,
    priceUnit: "ชุด",
    stock: 15,
    images: ["/teenager1.webp"],
    fabricType: "ผ้าไหม",
    hasGI: true,
    province: "ลำพูน",
  },
  {
    name: "ผ้ามัดหมี่ลายนาคราช",
    description: "ลายนาคราชเป็นลายโบราณที่สื่อถึงความอุดมสมบูรณ์ของแผ่นดินอีสาน ทอด้วยเทคนิคมัดหมี่ดั้งเดิม",
    category: "fabric",
    price: 2800,
    priceUnit: "เมตร",
    stock: 15,
    images: ["/images/fabric2.webp", "/images/fabric1.webp", "/images/fabric4.webp"],
    fabricType: "ผ้าไหม",
    hasGI: false,
    province: "ชัยภูมิ",
  },
  {
    name: "ผ้าฝ้ายย้อมคราม",
    description: "ผ้าฝ้ายย้อมครามธรรมชาติ สีครามแท้จากต้นครามพื้นถิ่น ย้อมด้วยกรรมวิธีโบราณ ให้สีสวยงามเป็นเอกลักษณ์",
    category: "fabric",
    price: 1500,
    priceUnit: "เมตร",
    stock: 30,
    images: ["/images/fabric4.webp", "/images/fabric5.webp", "/images/fabric1.webp"],
    fabricType: "ผ้าฝ้าย",
    hasGI: true,
    province: "เชียงใหม่",
  },
  {
    name: "ผ้าไหมยกลายกินรีหริภุญชัย",
    description: "ลายกินรีอันวิจิตร ละเอียดถึงตำนานนางกินรี หงส์ลำพูน และความอุดมของภูมิปัญญาท้องถิ่น",
    category: "fabric",
    price: 1800,
    priceUnit: "บาท / เมตร",
    stock: 20,
    images: ["/images/fabric1.webp", "/images/fabric2.webp", "/images/fabric3.webp"],
    fabricType: "ผ้าไหม",
    hasGI: true,
    province: "ลำพูน",
  },
  {
    name: "ผ้าไหมแพรวา",
    description: "ผ้าแพรวาเป็นราชินีแห่งผ้าไหมอีสาน มีลวดลายซับซ้อนงดงาม ทอด้วยเทคนิคขิดที่ต้องใช้ความชำนาญสูง",
    category: "fabric",
    price: 5000,
    priceUnit: "เมตร",
    stock: 10,
    images: ["/images/fabric5.webp", "/images/fabric3.webp", "/images/fabric2.webp"],
    fabricType: "ผ้าไหม",
    hasGI: true,
    province: "ชัยภูมิ",
  },
  {
    name: "ผ้าขาวม้าฝ้ายทอมือ",
    description: "ผ้าขาวม้าลายตารางคลาสสิก ทอมือจากฝ้ายแท้ ใช้ได้หลากหลายโอกาส ของฝากยอดนิยม",
    category: "premium",
    price: 320,
    priceUnit: "ผืน",
    stock: 60,
    images: ["/images/fabric3.webp"],
    fabricType: "ผ้าฝ้าย",
    hasGI: false,
    province: "อุดรธานี",
  },
  {
    name: "ผ้าพันคอไหมมัดหมี่",
    description: "ผ้าพันคอผืนเล็กทอจากไหมมัดหมี่ น้ำหนักเบา สวมใส่สบาย เหมาะเป็นของขวัญ",
    category: "scarf",
    price: 690,
    priceUnit: "ผืน",
    stock: 25,
    images: ["/images/fabric2.webp"],
    fabricType: "ผ้าไหม",
    hasGI: false,
    province: "อุดรธานี",
  },
  {
    name: "ผ้าคลุมไหล่ลายขิด",
    description: "ผ้าคลุมไหล่ทอลายขิดโบราณ เหมาะสวมคู่ชุดไทยหรือคลุมกันหนาว",
    category: "decor",
    price: 1200,
    priceUnit: "ผืน",
    stock: 18,
    images: ["/images/fabric5.webp"],
    fabricType: "ผ้าฝ้าย",
    hasGI: false,
    province: "เชียงใหม่",
  },
];

(async () => {
  try {
    const shopRows = await pool.query("SELECT id, province FROM shops WHERE status = 'approved'");
    for (const row of shopRows.rows) {
      if (row.province in SHOPS_BY_PROVINCE) SHOPS_BY_PROVINCE[row.province] = row.id;
    }
    const fallbackShopId = shopRows.rows[0]?.id;
    if (!fallbackShopId) throw new Error("ไม่พบร้านค้าใน DB — รัน node _seed_demo_shops.js ก่อน");

    let created = 0;
    for (const p of PRODUCTS) {
      const shopId = SHOPS_BY_PROVINCE[p.province] ?? fallbackShopId;

      const existing = await pool.query("SELECT id FROM products WHERE name = $1", [p.name]);
      if (existing.rows.length) {
        await pool.query("DELETE FROM products WHERE id = $1", [existing.rows[0].id]);
      }

      await pool.query(
        `INSERT INTO products
           (shop_id, name, description, category, price, price_unit, stock, images, fabric_type, has_gi, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)`,
        [shopId, p.name, p.description, p.category, p.price, p.priceUnit, p.stock, p.images, p.fabricType, p.hasGI]
      );
      created++;
      console.log(`✓ ${p.name} → shop ${shopId.slice(0, 8)}`);
    }
    console.log(`\nDone — seeded ${created} products.`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
