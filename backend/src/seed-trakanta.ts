import dotenv from "dotenv";
dotenv.config();

import { query } from "./db";

async function addTrakanta() {
  console.log("🌸 Seeding Trakanta (ตระการตา) shop...");
  const userRows = await query<Record<string, unknown>>("SELECT id FROM users LIMIT 1");
  if (userRows.length === 0) {
    throw new Error("No users found in database");
  }
  const userId = userRows[0].id;

  const existing = await query<Record<string, unknown>>("SELECT id FROM shops WHERE name = 'ตระการตา' OR name = 'Trakanta'");
  if (existing.length > 0) {
    console.log("Updating existing Trakanta shop...");
    await query(
      `UPDATE shops SET
        name = 'ตระการตา',
        province = 'ขอนแก่น',
        description = 'แบรนด์เสื้อผ้าและแฟชั่นผ้าไหมไทยทรงทันสมัย ดีไซน์ร่วมสมัยระดับพรีเมียม (Trakanta)',
        profile_image_url = '/images/trakanta.jpg',
        cover_image_url = '/images/trakanta.jpg',
        status = 'approved',
        merchant_type = 'designer',
        rating = 5.0,
        review_count = 18
       WHERE id = $1`,
      [existing[0].id]
    );
    console.log("✅ Updated Trakanta shop!");
  } else {
    console.log("Inserting new Trakanta shop...");
    await query(
      `INSERT INTO shops (
        id, user_id, name, province, description, profile_image_url, cover_image_url, status, merchant_type, rating, review_count
      ) VALUES (
        gen_random_uuid(), $1, 'ตระการตา', 'ขอนแก่น', 'แบรนด์เสื้อผ้าและแฟชั่นผ้าไหมไทยทรงทันสมัย ดีไซน์ร่วมสมัยระดับพรีเมียม (Trakanta)',
        '/images/trakanta.jpg', '/images/trakanta.jpg', 'approved', 'designer', 5.0, 18
      )`,
      [userId]
    );
    console.log("✅ Inserted Trakanta shop!");
  }
}

addTrakanta()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed to seed Trakanta:", err);
    process.exit(1);
  });
