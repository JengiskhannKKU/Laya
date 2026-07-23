require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log("Testing API response format...\n");

    // Simulate what templates.ts returns
    const rows = await pool.query(`
      SELECT id, name, category, base_price as "basePrice", 
             front_asset_url as "frontAssetUrl", back_asset_url as "backAssetUrl", 
             description
      FROM templates WHERE is_active = true
      ORDER BY category, name
    `);

    console.log("Raw SQL result:");
    console.log(typeof rows, Array.isArray(rows));
    console.log("rows.rows:", Array.isArray(rows.rows), typeof rows.rows);
    console.log("\nFirst row:");
    console.log(rows.rows[0]);

    console.log("\nJSON format (what API sends):");
    console.log(JSON.stringify(rows.rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      basePrice: Number(r.basePrice),
      frontAssetUrl: r.frontAssetUrl,
      backAssetUrl: r.backAssetUrl,
      description: r.description,
    })), null, 2).substring(0, 300) + "...");

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
})();
