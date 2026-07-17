/**
 * เติมลายผ้าประจำจังหวัด (76 จังหวัด) จาก frontend/lib/fabric-origins.ts เข้า weave_patterns
 * เป็น "ลายระบบ" (shop_id = NULL) — ให้ /weaving-order (เลือกลายผ้าก่อน) และหน้าจัดการ
 * "ลายที่ฉันทอได้" ของร้านค้า มีรูปจริง + เรื่องราวจริงให้เลือก แทนที่จะว่างเปล่า/สีพื้นๆ
 * เหมือนกับชุดข้อมูลเดียวกับที่ใช้บน "แผนที่ผ้าไทย" (ThailandFabricMap) พอดี — ไม่ปั้นข้อมูลซ้ำ
 *
 * import ตรงจากไฟล์ TS ต้นทาง (ไม่ copy/พิมพ์ข้อมูลใหม่) เพื่อไม่ให้ข้อความประวัติศาสตร์/แหล่งที่มา
 * คลาดเคลื่อนจากต้นฉบับ — รันด้วย tsx (มีอยู่แล้วเป็น devDependency ของ backend)
 *
 * Idempotent — เช็ค (origin_province, name) ซ้ำก่อน insert ทุกครั้ง รันซ้ำได้ไม่เพิ่มข้อมูลซ้ำ
 *
 * วิธีรัน (จากรากโปรเจกต์):
 *   npx tsx backend/_seed_province_patterns.ts
 */
import "dotenv/config";
import { Client } from "pg";
import { PROVINCES } from "../frontend/lib/fabric-origins";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL environment variable is required");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  let inserted = 0;
  let skipped = 0;

  try {
    for (const p of PROVINCES) {
      const existing = await client.query(
        `SELECT id FROM weave_patterns WHERE shop_id IS NULL AND origin_province = $1 AND name = $2`,
        [p.name, p.fabric]
      );
      if (existing.rows.length) {
        skipped++;
        continue;
      }

      await client.query(
        `INSERT INTO weave_patterns
           (shop_id, name, description, origin_province, region, community,
            story_history, story_weaving, thumbnail_url, pattern_images, weaving_process_images, is_active)
         VALUES (NULL, $1, $2, $3, $4, NULL, $5, $6, $7, $8, '{}', true)`,
        [
          p.fabric,
          p.story?.registration ?? null,
          p.name,
          p.region,
          p.story?.history ?? null,
          p.story?.weaving ?? null,
          p.image ?? null,
          p.image ? [p.image] : [],
        ]
      );
      inserted++;
    }

    console.log(`เสร็จแล้ว — เพิ่มใหม่ ${inserted} ลาย, ข้าม (มีอยู่แล้ว) ${skipped} ลาย จากทั้งหมด ${PROVINCES.length} จังหวัด`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("เติมลายผ้าประจำจังหวัดไม่สำเร็จ:", err);
  process.exit(1);
});
