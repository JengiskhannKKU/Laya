require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log("📊 Verifying seeded data...\n");

    // Templates
    const templates = await pool.query("SELECT id, name, category, base_price FROM templates ORDER BY id");
    console.log(`✅ Templates (${templates.rows.length} total):`);
    for (const t of templates.rows) {
      console.log(`   • ${t.id.padEnd(10)} | ${t.name.padEnd(20)} | ${t.category.padEnd(6)} | ฿${t.base_price}`);
    }

    // Shop-Template links
    const links = await pool.query(`
      SELECT shop_id, COUNT(*) as template_count
      FROM shop_templates
      GROUP BY shop_id
      ORDER BY shop_id
    `);

    console.log(`\n✅ Shop-Template linkages (${links.rows.length} shops):`);
    for (const link of links.rows) {
      console.log(`   • ${link.shop_id} → ${link.template_count} templates`);
    }

    const totalLinks = await pool.query("SELECT COUNT(*) as cnt FROM shop_templates");
    console.log(`\n📈 Total shop-template links: ${totalLinks.rows[0].cnt}`);

    // Test public API queries
    console.log("\n🧪 Testing data retrieval...");

    // Get all templates
    const allTemplates = await pool.query(`
      SELECT id, name, base_price FROM templates
      WHERE is_active = true
      ORDER BY category, name
    `);
    console.log(`   ✅ GET /api/templates would return ${allTemplates.rows.length} templates`);

    // Get templates for first shop
    if (links.rows.length > 0) {
      const shopId = links.rows[0].shop_id;
      const shopTemplates = await pool.query(`
        SELECT t.id, t.name
        FROM templates t
        JOIN shop_templates st ON st.template_id = t.id
        WHERE st.shop_id = $1 AND st.is_available = true AND t.is_active = true
        ORDER BY t.category, t.name
      `, [shopId]);
      console.log(`   ✅ GET /api/templates/shop/${shopId} would return ${shopTemplates.rows.length} templates`);
    }

    console.log("\n✨ Data verification complete!");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
})();
