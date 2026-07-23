require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    // Check if tables exist
    const templates = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'templates'
      )
    `);

    const shopTemplates = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'shop_templates'
      )
    `);

    console.log(`templates table exists: ${templates.rows[0].exists}`);
    console.log(`shop_templates table exists: ${shopTemplates.rows[0].exists}`);

    if (templates.rows[0].exists) {
      const count = await pool.query("SELECT COUNT(*) FROM templates");
      console.log(`\ntemplates records: ${count.rows[0].count}`);
    }

    if (shopTemplates.rows[0].exists) {
      const count = await pool.query("SELECT COUNT(*) FROM shop_templates");
      console.log(`shop_templates records: ${count.rows[0].count}`);
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
})();
