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

  const logoUrl = "/images/trakanta.jpg";
  const coverUrl = "/images/Gallery/LINE_ALBUM_29669_260724_3.jpg";

  const existing = await query<Record<string, unknown>>("SELECT id FROM shops WHERE name = 'ตระการตา' OR name = 'Trakanta'");
  if (existing.length > 0) {
    console.log("Updating existing Trakanta shop...");
    await query(
      `UPDATE shops SET
        name = 'ตระการตา',
        province = 'อุดรธานี',
        description = 'แบรนด์เสื้อผ้าและแฟชั่นผ้าไหมไทยทรงทันสมัย ดีไซน์ร่วมสมัยระดับพรีเมียม (Trakanta)',
        profile_image_url = $1,
        cover_image_url = $2,
        status = 'approved',
        merchant_type = 'designer',
        rating = 5.0,
        review_count = 18
       WHERE id = $3`,
      [logoUrl, coverUrl, existing[0].id]
    );
    console.log("✅ Updated Trakanta shop!");
  } else {
    console.log("Inserting new Trakanta shop...");
    await query(
      `INSERT INTO shops (
        id, user_id, name, province, description, profile_image_url, cover_image_url, status, merchant_type, rating, review_count
      ) VALUES (
        gen_random_uuid(), $1, 'ตระการตา', 'อุดรธานี', 'แบรนด์เสื้อผ้าและแฟชั่นผ้าไหมไทยทรงทันสมัย ดีไซน์ร่วมสมัยระดับพรีเมียม (Trakanta)',
        $2, $3, 'approved', 'designer', 5.0, 18
      )`,
      [userId, logoUrl, coverUrl]
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
