require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    // Run each SQL statement separately to find the issue
    const sql = fs.readFileSync("_migration_004_templates.sql", "utf8");
    const statements = sql.split(";").filter(s => s.trim());

    console.log(`Found ${statements.length} SQL statements\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      console.log(`⏳ Running statement ${i + 1}/${statements.length}...`);
      console.log(`   ${stmt.substring(0, 80)}...`);

      try {
        await pool.query(stmt);
        console.log(`   ✅ Success\n`);
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}\n`);
        throw err;
      }
    }

    console.log("✅ All migrations completed!");

  } catch (err) {
    console.error("Failed at statement:", err.message);
  } finally {
    await pool.end();
  }
})();
