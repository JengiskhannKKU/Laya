/* Apply migration 024 to the DB in .env (statements run one-by-one, matching
   the pattern used by _apply_migration_023.js). */
require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "migrations", "024_wallet_withdrawals.sql"), "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.replace(/^--.*$/gm, "").trim())
    .filter(Boolean);

  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  for (const stmt of statements) {
    process.stdout.write(stmt.split("\n")[0].slice(0, 70) + " ... ");
    await client.query(stmt);
    console.log("OK");
  }
  const check = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_name = 'withdrawal_requests'`
  );
  console.log("verified table:", check.rows.map((r) => r.table_name).join(", "));
  await client.end();
}

main().catch((err) => { console.error("FAILED:", err.message); process.exit(1); });
