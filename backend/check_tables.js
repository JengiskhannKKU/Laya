require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log("📋 Existing tables in database:");
    for (const row of tables.rows) {
      console.log(`   • ${row.table_name}`);
    }

    // Check if shops table exists
    const shopsExists = tables.rows.find(r => r.table_name === 'shops');
    if (shopsExists) {
      const shopCount = await pool.query("SELECT COUNT(*) as cnt FROM shops");
      console.log(`\n✅ shops table exists with ${shopCount.rows[0].cnt} records`);
    } else {
      console.log("\n❌ shops table does NOT exist");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
})();
