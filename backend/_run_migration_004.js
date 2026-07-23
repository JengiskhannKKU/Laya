/**
 * Run migration 004: Add templates and shop_templates tables
 */
require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log("🔄 Running migration 004: Add templates & shop_templates tables...\n");

    const sql = fs.readFileSync(path.join(__dirname, "_migration_004_templates.sql"), "utf8");

    await pool.query(sql);

    console.log("✅ Migration completed successfully!\n");

    // Verify tables created
    const tablesCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('templates', 'shop_templates')
      ORDER BY table_name
    `);

    console.log("📋 Tables created:");
    for (const row of tablesCheck.rows) {
      console.log(`   • ${row.table_name}`);
    }

    // Check column info
    const templatesColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'templates'
      ORDER BY ordinal_position
    `);

    console.log("\n📊 Templates table schema:");
    for (const col of templatesColumns.rows) {
      console.log(`   • ${col.column_name}: ${col.data_type}`);
    }

    const shopTemplatesColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'shop_templates'
      ORDER BY ordinal_position
    `);

    console.log("\n📊 Shop_templates table schema:");
    for (const col of shopTemplatesColumns.rows) {
      console.log(`   • ${col.column_name}: ${col.data_type}`);
    }

    console.log("\n✨ Migration verified!");

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
