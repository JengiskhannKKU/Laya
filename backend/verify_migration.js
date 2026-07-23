require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log("🔍 Verifying migration...\n");

    // Check tables exist
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('templates', 'shop_templates')
      ORDER BY table_name
    `);

    console.log("📋 Tables created:");
    for (const row of tables.rows) {
      console.log(`   ✅ ${row.table_name}`);
    }

    // Check templates schema
    console.log("\n📊 templates table columns:");
    const templatesCols = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'templates'
      ORDER BY ordinal_position
    `);
    for (const col of templatesCols.rows) {
      console.log(`   • ${col.column_name}: ${col.data_type}`);
    }

    // Check shop_templates schema
    console.log("\n📊 shop_templates table columns:");
    const shopTemplateCols = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'shop_templates'
      ORDER BY ordinal_position
    `);
    for (const col of shopTemplateCols.rows) {
      console.log(`   • ${col.column_name}: ${col.data_type}`);
    }

    // Check indexes
    console.log("\n📑 Indexes created:");
    const indexes = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename IN ('templates', 'shop_templates')
      ORDER BY indexname
    `);
    for (const idx of indexes.rows) {
      console.log(`   • ${idx.indexname}`);
    }

    // Record counts
    console.log("\n📈 Current data:");
    const templateCount = await pool.query("SELECT COUNT(*) as cnt FROM templates");
    const shopTemplateCount = await pool.query("SELECT COUNT(*) as cnt FROM shop_templates");
    console.log(`   • templates: ${templateCount.rows[0].cnt} records`);
    console.log(`   • shop_templates: ${shopTemplateCount.rows[0].cnt} records`);

    console.log("\n✨ Migration verified successfully!");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
})();
