/**
 * LINE Messaging API webhook — รับ 2 ประเภท event:
 *  1) message (text) — ร้านพิมพ์รหัสผูกบัญชี 6 หลัก (จากหน้า merchant/settings) มาที่ LINE OA
 *     → จับคู่ shops.line_user_id กับ LINE userId จริง
 *  2) postback — ร้านกดปุ่ม "ยืนยันออเดอร์" ใน Flex Message → เรียก confirmOrder() ของ domain นั้นๆ
 *     (ใช้ shops.line_user_id ที่ผูกไว้แล้วยืนยันความเป็นเจ้าของออเดอร์ ก่อนอนุญาตให้ confirm)
 *
 * ต้อง verify ลายเซ็น x-line-signature ก่อนเชื่อ body ใดๆ (ป้องกันใครก็ได้ยิง event ปลอมมาสั่ง confirm ออเดอร์)
 */

import { Router, Request, Response } from "express";
import { query } from "../db";
import { verifySignature, replyMessage } from "../utils/line";
import { confirmOrder as confirmTailorOrder } from "./orders";
import { confirmOrder as confirmProductOrder } from "./product-orders";
import { confirmOrder as confirmWeavingOrder } from "./weaving-orders";

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

const router = Router();

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { userId?: string; type?: string };
  message?: { type: string; text?: string };
  postback?: { data: string };
}

const CONFIRMERS: Record<string, typeof confirmTailorOrder> = {
  orders: confirmTailorOrder,
  product_orders: confirmProductOrder,
  weaving_orders: confirmWeavingOrder,
};

const ORDER_TABLES: Record<string, string> = {
  orders: "orders",
  product_orders: "product_orders",
  weaving_orders: "weaving_orders",
};

router.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["x-line-signature"] as string | undefined;
  if (!req.rawBody || !verifySignature(req.rawBody, signature)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  // LINE ต้องการ ack ไวๆ (200) — ประมวลผล event หลังตอบกลับแล้ว ไม่ block response
  res.status(200).json({ ok: true });

  const events: LineEvent[] = req.body?.events ?? [];
  for (const event of events) {
    try {
      await handleEvent(event);
    } catch (err) {
      console.error("[line webhook] event handling failed:", err);
    }
  }
});

async function handleEvent(event: LineEvent) {
  const lineUserId = event.source?.userId;
  if (!lineUserId) return;

  if (event.type === "message" && event.message?.type === "text") {
    await handleLinkingMessage(lineUserId, event.message.text ?? "", event.replyToken);
  } else if (event.type === "postback") {
    await handlePostback(lineUserId, event.postback?.data ?? "", event.replyToken);
  }
}

/** ร้านพิมพ์รหัส 6 หลักส่งมาที่ OA เพื่อผูกบัญชี LINE ของตัวเองกับร้าน */
async function handleLinkingMessage(lineUserId: string, text: string, replyToken?: string) {
  const code = text.trim();
  if (!/^\d{6}$/.test(code)) return;

  const rows = await query<{ shop_id: string; name: string }>(
    `SELECT c.shop_id, s.name FROM shop_line_link_codes c
     JOIN shops s ON s.id = c.shop_id
     WHERE c.code = $1 AND c.expires_at > NOW()`,
    [code]
  );
  if (!rows.length) {
    if (replyToken) {
      await replyMessage(replyToken, [{ type: "text", text: "รหัสไม่ถูกต้องหรือหมดอายุแล้ว กรุณาสร้างรหัสใหม่จากหน้าตั้งค่าร้านค้า" }]);
    }
    return;
  }

  const { shop_id: shopId, name } = rows[0];
  await query("UPDATE shops SET line_user_id = $1, line_linked_at = NOW() WHERE id = $2", [lineUserId, shopId]);
  await query("DELETE FROM shop_line_link_codes WHERE shop_id = $1", [shopId]);

  if (replyToken) {
    await replyMessage(replyToken, [
      { type: "text", text: `เชื่อมต่อร้าน "${name}" สำเร็จ ✅ ต่อจากนี้ระบบจะส่งแจ้งเตือนออเดอร์มาที่แชทนี้` },
    ]);
  }
}

/** ร้านกดปุ่ม "ยืนยันออเดอร์" ใน Flex Message */
async function handlePostback(lineUserId: string, data: string, replyToken?: string) {
  const params = new URLSearchParams(data);
  const action = params.get("action");
  const domain = params.get("domain");
  const id = params.get("id");
  if (action !== "confirm" || !domain || !id || !CONFIRMERS[domain]) return;

  const orderRows = await query<{ shop_id: string }>(
    `SELECT shop_id FROM ${ORDER_TABLES[domain]} WHERE id = $1`,
    [id]
  );
  if (!orderRows.length) {
    if (replyToken) await replyMessage(replyToken, [{ type: "text", text: "ไม่พบออเดอร์นี้ อาจถูกลบหรือ id ไม่ถูกต้อง" }]);
    return;
  }

  // ต้องเป็นร้านที่ผูก LINE userId นี้ไว้ และเป็นเจ้าของออเดอร์จริง — กันคนอื่นยืนยันออเดอร์แทนร้าน
  const shopRows = await query<{ id: string; user_id: string }>(
    "SELECT id, user_id FROM shops WHERE line_user_id = $1",
    [lineUserId]
  );
  if (!shopRows.length || shopRows[0].id !== orderRows[0].shop_id) {
    if (replyToken) await replyMessage(replyToken, [{ type: "text", text: "คุณไม่มีสิทธิ์ยืนยันออเดอร์นี้" }]);
    return;
  }

  const result = await CONFIRMERS[domain](id, shopRows[0].user_id, "ยืนยันผ่าน LINE");

  if (replyToken) {
    await replyMessage(replyToken, [{
      type: "text",
      text: result.ok ? "ยืนยันออเดอร์สำเร็จ ✅" : `ยืนยันไม่สำเร็จ: ${result.error}`,
    }]);
  }
}

export default router;
