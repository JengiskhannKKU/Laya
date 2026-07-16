/**
 * Seed templates from catalog.json into the database (idempotent)
 * This links templates to all existing shops by default
 * Run: node _seed_templates.js
 */
require("dotenv").config();
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Read catalog.json
const catalogPath = path.join(__dirname, "../frontend/public/assets/garments/catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const TEMPLATES = catalog.templateLibrary || [];

async function main() {
  console.log(`Seeding ${TEMPLATES.length} templates...`);

  for (const t of TEMPLATES) {
    // Insert or update template
    const result = await pool.query(
      `INSERT INTO templates (id, name, category, base_price, front_asset_url, back_asset_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         base_price = EXCLUDED.base_price,
         front_asset_url = EXCLUDED.front_asset_url,
         back_asset_url = EXCLUDED.back_asset_url,
         is_active = true,
         updated_at = NOW()
       RETURNING id`,
      [t.id, t.name, t.category, t.basePrice, t.front, t.back]
    );

    const templateId = result.rows[0].id;
    console.log(`  ✓ ${t.name} (${templateId})`);

    // Link to all active shops
    const shops = await pool.query("SELECT id FROM shops WHERE status = 'approved'");
    for (const shop of shops.rows) {
      await pool.query(
        `INSERT INTO shop_templates (shop_id, template_id, is_available)
         VALUES ($1, $2, true)
         ON CONFLICT (shop_id, template_id) DO UPDATE SET is_available = true`,
        [shop.id, templateId]
      );
    }
    console.log(`    └─ Linked to ${shops.rows.length} shop(s)`);
  }

  console.log("\nTemplate seeding complete!");
  await pool.end();
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
