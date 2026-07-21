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
import { verifySignature, replyMessage, lineConfigured, welcomeMessages, linkHelpMessages } from "../utils/line";
import { confirmOrder as confirmTailorOrder, respondCancelRequest as respondTailorCancel } from "./orders";
import { confirmOrder as confirmProductOrder, respondCancelRequest as respondProductCancel } from "./product-orders";
import { confirmOrder as confirmWeavingOrder, respondCancelRequest as respondWeavingCancel } from "./weaving-orders";

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

/** ชื่อร้านที่ผูกกับ LINE userId นี้ (ถ้ามี) — ใช้ปรับข้อความทักทาย/ช่วยเหลือ */
async function linkedShopName(lineUserId: string): Promise<string | null> {
  const rows = await query<{ name: string }>("SELECT name FROM shops WHERE line_user_id = $1", [lineUserId]);
  return rows[0]?.name ?? null;
}

const CONFIRMERS: Record<string, typeof confirmTailorOrder> = {
  orders: confirmTailorOrder,
  product_orders: confirmProductOrder,
  weaving_orders: confirmWeavingOrder,
};

const CANCEL_RESPONDERS: Record<string, typeof respondTailorCancel> = {
  orders: respondTailorCancel,
  product_orders: respondProductCancel,
  weaving_orders: respondWeavingCancel,
};

const ORDER_TABLES: Record<string, string> = {
  orders: "orders",
  product_orders: "product_orders",
  weaving_orders: "weaving_orders",
};

router.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["x-line-signature"] as string | undefined;

  // log ช่วย debug: เห็นว่า event มาถึงจริงไหม และตกตรงไหน (ปิดเสียงไม่ได้เพราะเป็น path เดียวที่ LINE ยิงเข้ามา)
  console.log(`[line webhook] hit — hasRawBody=${!!req.rawBody} hasSignature=${!!signature} lineConfigured=${lineConfigured} events=${req.body?.events?.length ?? 0}`);

  if (!lineConfigured) {
    // secret/token ว่าง (ปกติเพราะ backend ยังไม่ได้ restart หลังใส่ .env) — verify ไม่ได้แน่นอน
    console.warn("[line webhook] LINE not configured — LINE_CHANNEL_SECRET/ACCESS_TOKEN ว่าง (restart backend หลังใส่ .env)");
  }

  if (!req.rawBody || !verifySignature(req.rawBody, signature)) {
    console.warn("[line webhook] signature verify FAILED → 401 (เช็ค LINE_CHANNEL_SECRET ให้ตรงกับ channel และ restart backend)");
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

  if (event.type === "follow") {
    // มีคนเพิ่มเพื่อน OA — ทักทายพร้อมบอกวิธีเชื่อมบัญชี (ถ้าเชื่อมอยู่แล้วทักแบบรู้จัก)
    if (event.replyToken) {
      const name = await linkedShopName(lineUserId);
      await replyMessage(event.replyToken, welcomeMessages(name));
    }
  } else if (event.type === "message" && event.message?.type === "text") {
    await handleLinkingMessage(lineUserId, event.message.text ?? "", event.replyToken);
  } else if (event.type === "postback") {
    await handlePostback(lineUserId, event.postback?.data ?? "", event.replyToken);
  }
}

/** ร้านพิมพ์รหัส 6 หลักส่งมาที่ OA เพื่อผูกบัญชี LINE ของตัวเองกับร้าน */
async function handleLinkingMessage(lineUserId: string, text: string, replyToken?: string) {
  const code = text.trim();
  if (!/^\d{6}$/.test(code)) {
    // ไม่ใช่รหัส 6 หลัก — ถ้ายังไม่ได้เชื่อมบัญชี ตอบวิธีเชื่อมให้ (ถ้าเชื่อมแล้วเงียบไว้ ไม่กวนแชท)
    if (replyToken && !(await linkedShopName(lineUserId))) {
      await replyMessage(replyToken, linkHelpMessages());
    }
    return;
  }

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

/** ร้านกดปุ่ม "ยืนยันออเดอร์" / "ยินยอมยกเลิก" / "ไม่ยินยอม" ใน Flex Message */
async function handlePostback(lineUserId: string, data: string, replyToken?: string) {
  const params = new URLSearchParams(data);
  const action = params.get("action");
  const domain = params.get("domain");
  const id = params.get("id");
  const isCancelAction = action === "cancel_approve" || action === "cancel_reject";
  if ((action !== "confirm" && !isCancelAction) || !domain || !id || !CONFIRMERS[domain]) return;

  const orderRows = await query<{ shop_id: string }>(
    `SELECT shop_id FROM ${ORDER_TABLES[domain]} WHERE id = $1`,
    [id]
  );
  if (!orderRows.length) {
    if (replyToken) await replyMessage(replyToken, [{ type: "text", text: "ไม่พบออเดอร์นี้ อาจถูกลบหรือ id ไม่ถูกต้อง" }]);
    return;
  }

  // ต้องเป็นร้านที่ผูก LINE userId นี้ไว้ และเป็นเจ้าของออเดอร์จริง — กันคนอื่นยืนยัน/ตอบรับคำขอแทนร้าน
  const shopRows = await query<{ id: string; user_id: string }>(
    "SELECT id, user_id FROM shops WHERE line_user_id = $1",
    [lineUserId]
  );
  if (!shopRows.length || shopRows[0].id !== orderRows[0].shop_id) {
    if (replyToken) await replyMessage(replyToken, [{ type: "text", text: "คุณไม่มีสิทธิ์ดำเนินการกับออเดอร์นี้" }]);
    return;
  }

  if (isCancelAction) {
    const approve = action === "cancel_approve";
    const result = await CANCEL_RESPONDERS[domain](id, approve, shopRows[0].user_id);
    if (replyToken) {
      const text = result.ok
        ? approve ? "ยินยอมยกเลิกออเดอร์แล้ว ✅" : "บันทึกว่าไม่ยินยอมยกเลิกแล้ว ออเดอร์จะดำเนินการต่อ"
        : result.alreadyResolved
          ? "คำขอยกเลิกนี้ถูกดำเนินการไปแล้ว"
          : `ดำเนินการไม่สำเร็จ: ${result.error}`;
      await replyMessage(replyToken, [{ type: "text", text }]);
    }
    return;
  }

  const result = await CONFIRMERS[domain](id, shopRows[0].user_id, "ยืนยันผ่าน LINE");

  if (replyToken) {
    const text = result.ok
      ? "ยืนยันออเดอร์สำเร็จ ✅"
      : result.alreadyConfirmed
        ? "ออเดอร์นี้ท่านได้ยืนยันไปแล้ว ✅"
        : `ยืนยันไม่สำเร็จ: ${result.error}`;
    await replyMessage(replyToken, [{ type: "text", text }]);
  }
}

export default router;
