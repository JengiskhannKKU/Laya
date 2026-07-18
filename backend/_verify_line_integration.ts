/**
 * Verification-only script for the LINE integration groundwork — NOT part of the app.
 * Sets a throwaway LINE_CHANNEL_SECRET (in-process only, never touches real .env) so we can
 * exercise real HMAC signature verification, then spins up an isolated Express instance hosting
 * just the webhook router to test the linking-code and postback-confirm flows end-to-end against
 * the real (disposable) DB rows. Cleans up everything it creates.
 */
process.env.LINE_CHANNEL_SECRET = "test-secret-verification-only";
process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token-verification-only";

import { createHmac, randomUUID } from "crypto";
import express from "express";
import { query } from "./src/db";

async function main() {
  const { verifySignature } = await import("./src/utils/line");
  const lineWebhookRouter = (await import("./src/routes/line-webhook")).default;

  // ── 1) Signature math ──────────────────────────────────────────────
  const body = Buffer.from(JSON.stringify({ events: [] }));
  const correctSig = createHmac("sha256", "test-secret-verification-only").update(body).digest("base64");
  const okCorrect = verifySignature(body, correctSig);
  const okWrong = verifySignature(body, "bogus-signature==");
  console.log("1) signature verification — correct sig accepted:", okCorrect, "| wrong sig rejected:", !okWrong);
  if (!okCorrect || okWrong) throw new Error("Signature verification logic is broken");

  // ── 2) Isolated server hosting the webhook route ───────────────────
  const app = express();
  app.use(express.json({
    verify: (req: express.Request, _res: express.Response, buf: Buffer) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }));
  app.use("/api/line", lineWebhookRouter);
  const server = app.listen(0);
  const port = (server.address() as { port: number }).port;

  function sign(payload: string) {
    return createHmac("sha256", "test-secret-verification-only").update(Buffer.from(payload)).digest("base64");
  }

  // ── 3) Linking-code flow against the real "kotcher" shop (disposable state, restored after) ──
  const shopRows = await query<{ id: string; user_id: string; line_user_id: string | null }>(
    "SELECT id, user_id, line_user_id FROM shops WHERE name = 'kotcher'"
  );
  if (!shopRows.length) throw new Error("kotcher shop not found — cannot run live verification");
  const shop = shopRows[0];
  const testLineUserId = "Utest" + randomUUID().replace(/-/g, "").slice(0, 28);

  await query("DELETE FROM shop_line_link_codes WHERE shop_id = $1", [shop.id]);
  const code = "482913";
  await query(
    `INSERT INTO shop_line_link_codes (shop_id, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
    [shop.id, code]
  );

  const linkPayload = JSON.stringify({
    events: [{ type: "message", replyToken: "dummy-reply-1", source: { userId: testLineUserId, type: "user" }, message: { type: "text", text: code } }],
  });
  const linkRes = await fetch(`http://127.0.0.1:${port}/api/line/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-line-signature": sign(linkPayload) },
    body: linkPayload,
  });
  await new Promise((r) => setTimeout(r, 400)); // event handling is fire-and-forget after the 200 ack
  const afterLink = await query<{ line_user_id: string | null }>("SELECT line_user_id FROM shops WHERE id = $1", [shop.id]);
  console.log("2) linking webhook — HTTP status:", linkRes.status, "| shop.line_user_id updated:", afterLink[0].line_user_id === testLineUserId);

  // ── 4) Postback confirm flow — disposable test order against the same shop ──
  const testCustomerId = randomUUID();
  const testCustomerEmail = `_test_line_verify_${Date.now()}@laya.local`;
  await query(
    `INSERT INTO users (id, email, role, is_active) VALUES ($1, $2, 'customer', true)`,
    [testCustomerId, testCustomerEmail]
  );
  // orders.chk_fabric_source บังคับ: fabric_source='shop' ต้องมี shop_fabric_id — สร้างผ้าร้านชั่วคราวไว้อ้างอิง
  const fabricRows = await query<{ id: string }>(
    `INSERT INTO shop_fabrics (shop_id, name, price_per_meter, stock_meters, is_active)
     VALUES ($1, '_line_verify_fabric', 100, 10, true) RETURNING id`,
    [shop.id]
  );
  const testFabricId = fabricRows[0].id;
  const orderRows = await query<{ id: string }>(
    `INSERT INTO orders (customer_id, shop_id, fabric_source, shop_fabric_id, status)
     VALUES ($1, $2, 'shop', $3, 'pending_confirm') RETURNING id`,
    [testCustomerId, shop.id, testFabricId]
  );
  const testOrderId = orderRows[0].id;

  const postbackPayload = JSON.stringify({
    events: [{
      type: "postback", replyToken: "dummy-reply-2", source: { userId: testLineUserId, type: "user" },
      postback: { data: `action=confirm&domain=orders&id=${testOrderId}` },
    }],
  });
  const postbackRes = await fetch(`http://127.0.0.1:${port}/api/line/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-line-signature": sign(postbackPayload) },
    body: postbackPayload,
  });
  await new Promise((r) => setTimeout(r, 400));
  const afterConfirm = await query<{ status: string }>("SELECT status FROM orders WHERE id = $1", [testOrderId]);
  console.log("3) postback confirm — HTTP status:", postbackRes.status, "| order.status:", afterConfirm[0].status, "(expected confirmed)");

  // ── 5) Negative case: a DIFFERENT (unlinked) LINE user must NOT be able to confirm ──
  const strangerLineUserId = "Ustranger" + randomUUID().replace(/-/g, "").slice(0, 22);
  await query(
    `INSERT INTO orders (customer_id, shop_id, fabric_source, shop_fabric_id, status) VALUES ($1, $2, 'shop', $3, 'pending_confirm') RETURNING id`,
    [testCustomerId, shop.id, testFabricId]
  ).then(async (r) => {
    const strangerOrderId = r[0].id;
    const strangerPayload = JSON.stringify({
      events: [{ type: "postback", replyToken: "dummy-reply-3", source: { userId: strangerLineUserId, type: "user" }, postback: { data: `action=confirm&domain=orders&id=${strangerOrderId}` } }],
    });
    await fetch(`http://127.0.0.1:${port}/api/line/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-line-signature": sign(strangerPayload) },
      body: strangerPayload,
    });
    await new Promise((res) => setTimeout(res, 400));
    const check = await query<{ status: string }>("SELECT status FROM orders WHERE id = $1", [strangerOrderId]);
    console.log("4) stranger postback rejected — order still pending_confirm:", check[0].status === "pending_confirm");
    await query("DELETE FROM orders WHERE id = $1", [strangerOrderId]);
  });

  // ── 6) Bad signature must be rejected with 401 ──
  const tamperedRes = await fetch(`http://127.0.0.1:${port}/api/line/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-line-signature": "not-a-real-signature" },
    body: postbackPayload,
  });
  console.log("5) tampered signature — HTTP status:", tamperedRes.status, "(expected 401)");

  // ── cleanup ──────────────────────────────────────────────────────
  await query("DELETE FROM orders WHERE id = $1", [testOrderId]);
  await query("DELETE FROM shop_fabrics WHERE id = $1", [testFabricId]);
  await query("DELETE FROM users WHERE id = $1", [testCustomerId]);
  await query("UPDATE shops SET line_user_id = $1, line_linked_at = NULL WHERE id = $2", [shop.line_user_id, shop.id]);
  await query("DELETE FROM shop_line_link_codes WHERE shop_id = $1", [shop.id]);
  server.close();
  console.log("\nCleaned up all test data. kotcher restored to original line_user_id:", shop.line_user_id);
  process.exit(0);
}

main().catch((err) => {
  console.error("VERIFICATION FAILED:", err);
  process.exit(1);
});
