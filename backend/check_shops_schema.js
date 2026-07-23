require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'shops'
      ORDER BY ordinal_position
    `);

    console.log("shops table schema:");
    for (const col of columns.rows) {
      console.log(`  • ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    }

    // Check primary key
    const pk = await pool.query(`
      SELECT constraint_name, column_name
      FROM information_schema.key_column_usage
      WHERE table_name = 'shops' AND constraint_name LIKE '%pk%'
    `);

    console.log("\nPrimary key:");
    for (const row of pk.rows) {
      console.log(`  • ${row.constraint_name} on ${row.column_name}`);
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
})();
