import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { pool } from "./db";

const banners = [
  {
    id: "1",
    title: "ลายผ้าคู่บ้านคู่เมือง",
    subtitle: "ผ้าไหมมัดหมี่ลายโบราณ\nจากชุมชนทอผ้า จ.ขอนแก่น",
    image: "/images/banner1.webp",
  },
  {
    id: "2",
    title: "สืบสานภูมิปัญญา",
    subtitle: "ผ้าทอมือจากชุมชน\nสู่แฟชั่นร่วมสมัย",
    image: "/images/banner2.webp",
  },
];

const categories = [
  { id: "silk", name: "ผ้าไหม", icon: "silk" },
  { id: "cotton", name: "ผ้าฝ้าย", icon: "cotton" },
  { id: "gi", name: "GI", icon: "gi" },
  { id: "province", name: "ตามจังหวัด", icon: "province" },
];

const communities = [
  {
    id: "c1",
    name: "ชุมชนหริภุญชัย",
    province: "ลำพูน",
    image: "/images/community1.webp",
    memberCount: 45,
    productCount: 28,
  },
  {
    id: "c2",
    name: "กลุ่มทอผ้าบ้านเขว้า",
    province: "ชัยภูมิ",
    image: "/images/weaver1.webp",
    memberCount: 32,
    productCount: 19,
  },
  {
    id: "c3",
    name: "กลุ่มทอผ้าครามสกลนคร",
    province: "สกลนคร",
    image: "/images/fabric4.webp",
    memberCount: 58,
    productCount: 35,
  },
];

const products = [
  {
    id: "1",
    name: "ผ้ายกลายกินรีหริภุญชัย",
    community: "ชุมชนหริภุญชัย",
    province: "ลำพูน",
    price: 3500,
    priceUnit: "เมตร",
    rating: 4.8,
    reviewCount: 120,
    images: ["/images/fabric1.webp", "/images/fabric2.webp", "/images/fabric3.webp"],
    hasGI: true,
    productionTime: "12-15 วัน",
    availableLength: 20,
    fabricType: "ผ้าไหม",
    story: "ลายกินรีอันวิจิตร ละเอียดถึงตำนานนางกินรี หงส์ลำพูน และความอุดมของภูมิปัญญาท้องถิ่น ผ้าทอมือทุกผืนถูกทอด้วยความพิถีพิถัน สืบทอดมากว่า 200 ปี",
    weaverName: "คุณสมศรี แก้วมณี",
    certificateId: "LAYA-2024-001",
    passport: {
      materials: ["ไหมไทยแท้ 100%", "เส้นไหมน้อย"],
      dyeType: "สีธรรมชาติ",
      dyeDetails: "ย้อมจากครั่ง มะเกลือ แก่นขนุน",
      weavingTechnique: "ทอยกดอก",
      weavingDetails: "เทคนิคทอยกดอกด้วยกี่ทอมือแบบโบราณ",
      productionSteps: [
        { step: 1, title: "เตรียมเส้นไหม", description: "สาวไหม ฟอก ย้อมสี", date: "2024-11-01", icon: "fiber" },
        { step: 2, title: "ย้อมสีธรรมชาติ", description: "ย้อมครั่งสีแดง", date: "2024-11-05", icon: "dye" },
        { step: 3, title: "ทอยกดอก", description: "ทอด้วยกี่พื้นบ้าน", date: "2024-11-10", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจลาย ความสม่ำเสมอ", date: "2024-11-22", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซักทำความสะอาด รีดเรียบ", date: "2024-11-24", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุในกล่องผ้าไหม", date: "2024-11-25", icon: "ship" },
      ],
      carbonFootprint: "low",
      certifications: ["GI ลำพูน", "OTOP 5 ดาว", "มาตรฐานผ้าไหมไทย"],
      blockchainHash: "0x7a3b...f92e",
      verifiedDate: "2024-11-25",
    },
  },
  {
    id: "2",
    name: "ผ้ามัดหมี่ลายนาคราช",
    community: "กลุ่มทอผ้าบ้านเขว้า",
    province: "ชัยภูมิ",
    price: 2800,
    priceUnit: "เมตร",
    rating: 4.6,
    reviewCount: 89,
    images: ["/images/fabric2.webp", "/images/fabric1.webp", "/images/fabric4.webp"],
    hasGI: false,
    productionTime: "10-14 วัน",
    availableLength: 15,
    fabricType: "ผ้าไหม",
    story: "ลายนาคราชเป็นลายโบราณที่สื่อถึงความอุดมสมบูรณ์ของแผ่นดินอีสาน",
    weaverName: "คุณประนอม ทองดี",
    certificateId: "LAYA-2024-002",
    passport: {
      materials: ["ไหมไทย", "เส้นไหมน้อย"],
      dyeType: "สีเคมีปลอดภัย",
      dyeDetails: "ใช้สีเคมีที่ได้มาตรฐานปลอดภัย",
      weavingTechnique: "มัดหมี่",
      weavingDetails: "เทคนิคมัดหมี่แบบอีสานดั้งเดิม",
      productionSteps: [
        { step: 1, title: "เตรียมเส้นไหม", description: "สาวไหม ตีเกลียว", date: "2024-10-15", icon: "fiber" },
        { step: 2, title: "มัดลายและย้อมสี", description: "มัดเส้นพุ่งตามลวดลาย", date: "2024-10-20", icon: "dye" },
        { step: 3, title: "ทอผ้า", description: "ทอด้วยกี่กระตุก", date: "2024-10-25", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจความถูกต้องของลาย", date: "2024-11-01", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซัก รีด ตกแต่งขอบผ้า", date: "2024-11-03", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุพร้อมใบรับรอง", date: "2024-11-04", icon: "ship" },
      ],
      carbonFootprint: "low",
      certifications: ["มาตรฐานผ้าไหมไทย", "สินค้า OTOP"],
      blockchainHash: "0x4e2c...a81d",
      verifiedDate: "2024-11-04",
    },
  },
  {
    id: "3",
    name: "ผ้าฝ้ายย้อมคราม",
    community: "กลุ่มทอผ้าครามสกลนคร",
    province: "สกลนคร",
    price: 1500,
    priceUnit: "เมตร",
    rating: 4.9,
    reviewCount: 205,
    images: ["/images/fabric4.webp", "/images/fabric5.webp", "/images/fabric1.webp"],
    hasGI: true,
    productionTime: "7-10 วัน",
    availableLength: 30,
    fabricType: "ผ้าฝ้าย",
    story: "ผ้าฝ้ายย้อมครามธรรมชาติ สีครามแท้จากต้นครามพื้นถิ่น",
    weaverName: "คุณบัวลอย สุขสวัสดิ์",
    certificateId: "LAYA-2024-003",
    passport: {
      materials: ["ฝ้ายอินทรีย์ 100%", "เส้นฝ้ายปั่นมือ"],
      dyeType: "สีธรรมชาติ",
      dyeDetails: "ย้อมครามธรรมชาติ ย้อมซ้ำ 15-20 รอบ",
      weavingTechnique: "ทอพื้น",
      weavingDetails: "ทอด้วยกี่เอวแบบดั้งเดิม",
      productionSteps: [
        { step: 1, title: "ปั่นฝ้าย", description: "ปั่นฝ้ายอินทรีย์ด้วยมือ", date: "2024-10-01", icon: "fiber" },
        { step: 2, title: "หมักย้อมคราม", description: "หมักน้ำครามธรรมชาติ", date: "2024-10-05", icon: "dye" },
        { step: 3, title: "ทอผ้า", description: "ทอด้วยกี่เอวแบบดั้งเดิม", date: "2024-10-12", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจความสม่ำเสมอของสี", date: "2024-10-18", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซักน้ำสะอาด ตากแดด", date: "2024-10-20", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุพร้อมใบรับรอง GI", date: "2024-10-21", icon: "ship" },
      ],
      carbonFootprint: "low",
      certifications: ["GI สกลนคร", "OTOP 5 ดาว", "ผ้าฝ้ายอินทรีย์", "มาตรฐาน มผช."],
      blockchainHash: "0x9d1f...c73b",
      verifiedDate: "2024-10-21",
    },
  },
  {
    id: "4",
    name: "ผ้าไหมแพรวา",
    community: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว",
    province: "กาฬสินธุ์",
    price: 5000,
    priceUnit: "เมตร",
    rating: 4.7,
    reviewCount: 67,
    images: ["/images/fabric5.webp", "/images/fabric3.webp", "/images/fabric2.webp"],
    hasGI: true,
    productionTime: "20-30 วัน",
    availableLength: 10,
    fabricType: "ผ้าไหม",
    story: "ผ้าแพรวาเป็นราชินีแห่งผ้าไหมอีสาน มีลวดลายซับซ้อนงดงาม",
    weaverName: "คุณทองใบ ภูมิพันธ์",
    certificateId: "LAYA-2024-004",
    passport: {
      materials: ["ไหมไทยแท้ 100%", "เส้นไหมน้อย", "เส้นไหมใหญ่"],
      dyeType: "สีธรรมชาติผสมเคมี",
      dyeDetails: "ใช้สีธรรมชาติจากครั่ง มะเกลือ ผสมสีเคมีปลอดภัย",
      weavingTechnique: "ทอขิด",
      weavingDetails: "เทคนิคขิดเก็บลาย สร้างลวดลายซับซ้อนเกินร้อยลาย",
      productionSteps: [
        { step: 1, title: "เตรียมเส้นไหม", description: "สาวไหม ฟอก ตีเกลียว", date: "2024-09-01", icon: "fiber" },
        { step: 2, title: "ย้อมสี", description: "ย้อมสีธรรมชาติและเคมี", date: "2024-09-08", icon: "dye" },
        { step: 3, title: "ทอขิดเก็บลาย", description: "ทอด้วยเทคนิคขิด", date: "2024-09-15", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจลายขิด ความละเอียด", date: "2024-10-10", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซักรีด ตกแต่งชายผ้า", date: "2024-10-12", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุในกล่องพิเศษ", date: "2024-10-13", icon: "ship" },
      ],
      carbonFootprint: "low",
      certifications: ["GI กาฬสินธุ์", "OTOP 5 ดาว", "มาตรฐานผ้าไหมไทย", "UNESCO Intangible Heritage"],
      blockchainHash: "0x2f8a...d45c",
      verifiedDate: "2024-10-13",
    },
  },
  {
    id: "5",
    name: "ผ้าจกลายดอกพิกุล",
    community: "กลุ่มทอผ้าจกราชบุรี",
    province: "ราชบุรี",
    price: 2200,
    priceUnit: "เมตร",
    rating: 4.5,
    reviewCount: 93,
    images: ["/images/fabric3.webp", "/images/fabric1.webp", "/images/fabric5.webp"],
    hasGI: false,
    productionTime: "14-18 วัน",
    availableLength: 12,
    fabricType: "ผ้าฝ้าย",
    story: "ผ้าจกลายดอกพิกุลเป็นลายโบราณของชาวไท-ยวน ราชบุรี",
    weaverName: "คุณสมจิตร บุญมา",
    certificateId: "LAYA-2024-005",
    passport: {
      materials: ["ฝ้ายพื้นเมือง", "ไหมประดิษฐ์"],
      dyeType: "สีเคมีปลอดภัย",
      dyeDetails: "ใช้สีเคมีที่ผ่านมาตรฐานความปลอดภัย",
      weavingTechnique: "ทอจก",
      weavingDetails: "เทคนิคจกด้วยขนเม่น สร้างลวดลายดอกพิกุล",
      productionSteps: [
        { step: 1, title: "เตรียมเส้นด้าย", description: "กรอเส้นฝ้ายและไหมประดิษฐ์", date: "2024-10-10", icon: "fiber" },
        { step: 2, title: "ย้อมสี", description: "ย้อมสีตามสูตรดั้งเดิม", date: "2024-10-14", icon: "dye" },
        { step: 3, title: "ทอจก", description: "ทอจกด้วยขนเม่นหรือไม้จก", date: "2024-10-18", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจลายจก ความสมมาตร", date: "2024-10-30", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซัก รีด ตกแต่งชายผ้า", date: "2024-11-01", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุพร้อมใบรับรองแหล่งกำเนิด", date: "2024-11-02", icon: "ship" },
      ],
      carbonFootprint: "medium",
      certifications: ["สินค้า OTOP", "มาตรฐาน มผช."],
      blockchainHash: "0x5c3e...b17a",
      verifiedDate: "2024-11-02",
    },
  },
];

async function seed() {
  console.log("🌱 Starting database seed...");

  const schemaSQL = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf8"
  );

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("📋 Running schema migrations...");
    await client.query(schemaSQL);

    console.log("🏷️  Seeding categories...");
    for (const c of categories) {
      await client.query(
        `INSERT INTO categories (id, name, icon) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon`,
        [c.id, c.name, c.icon]
      );
    }

    console.log("🖼️  Seeding banners...");
    for (const b of banners) {
      await client.query(
        `INSERT INTO banners (id, image, title, subtitle) VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET image = EXCLUDED.image, title = EXCLUDED.title, subtitle = EXCLUDED.subtitle`,
        [b.id, b.image, b.title, b.subtitle]
      );
    }

    console.log("🏘️  Seeding communities...");
    for (const c of communities) {
      await client.query(
        `INSERT INTO communities (id, name, province, image, member_count, product_count) VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, province = EXCLUDED.province`,
        [c.id, c.name, c.province, c.image, c.memberCount, c.productCount]
      );
    }

    console.log("🛍️  Seeding products...");
    for (const p of products) {
      await client.query(
        `INSERT INTO products
          (id, name, community, province, price, price_unit, rating, review_count,
           images, has_gi, production_time, available_length, fabric_type, story,
           weaver_name, certificate_id, passport)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, price = EXCLUDED.price,
           passport = EXCLUDED.passport`,
        [
          p.id, p.name, p.community, p.province, p.price, p.priceUnit,
          p.rating, p.reviewCount, p.images, p.hasGI, p.productionTime,
          p.availableLength, p.fabricType, p.story, p.weaverName,
          p.certificateId, JSON.stringify(p.passport),
        ]
      );
    }

    const { kotcherProducts } = await import("./seed-kotcher");
    console.log("🛍️  Seeding Kotcher brand photo products...");
    for (const p of kotcherProducts) {
      await client.query(
        `INSERT INTO products (
          id, shop_id, name, name_en, description, description_en, category, price, price_unit, stock, fabric_type, has_gi, images, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, name_en = EXCLUDED.name_en, description = EXCLUDED.description,
          category = EXCLUDED.category, price = EXCLUDED.price, price_unit = EXCLUDED.price_unit,
          stock = EXCLUDED.stock, fabric_type = EXCLUDED.fabric_type, has_gi = EXCLUDED.has_gi,
          images = EXCLUDED.images, is_active = true`,
        [
          p.id, p.shop_id, p.name, p.name_en, p.description, p.description_en,
          p.category, p.price, p.price_unit, p.stock, p.fabric_type, p.has_gi, p.images,
        ]
      );
    }

    // Seeding Trakanta shop
    const userRes = await client.query("SELECT id FROM users LIMIT 1");
    if (userRes.rows.length > 0) {
      const uId = userRes.rows[0].id;
      await client.query(
        `INSERT INTO shops (
          id, user_id, name, province, description, profile_image_url, cover_image_url, status, merchant_type, rating, review_count
        ) VALUES (
          gen_random_uuid(), $1, 'ตระการตา', 'อุดรธานี', 'แบรนด์เสื้อผ้าและแฟชั่นผ้าไหมไทยทรงทันสมัย ดีไซน์ร่วมสมัยระดับพรีเมียม (Trakanta)',
          '/images/Gallery/LINE_ALBUM_29669_260724_3.jpg', '/images/Gallery/LINE_ALBUM_29669_260724_3.jpg', 'approved', 'designer', 5.0, 18
        ) ON CONFLICT (id) DO NOTHING`,
        [uId]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seed completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
