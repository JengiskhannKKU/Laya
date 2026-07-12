/* Apply migration 015 to the DB in .env (statements run one-by-one because
   ALTER TYPE ... ADD VALUE cannot run inside a transaction). */
require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "migrations", "015_sku_checkout_merchant_type_shipping.sql"), "utf8");
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
    `SELECT column_name FROM information_schema.columns
     WHERE (table_name = 'product_order_items' AND column_name IN ('variant_id','variant_label'))
        OR (table_name = 'shops' AND column_name = 'merchant_type')
        OR (table_name = 'product_orders' AND column_name = 'shipping_status')`
  );
  console.log("verified columns:", check.rows.map((r) => r.column_name).join(", "));
  const enumVals = await client.query(
    `SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'shipment_status' ORDER BY enumsortorder`
  );
  console.log("shipment_status:", enumVals.rows.map((r) => r.enumlabel).join(", "));
  await client.end();
}

main().catch((err) => { console.error("FAILED:", err.message); process.exit(1); });
