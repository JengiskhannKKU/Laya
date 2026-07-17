/**
 * Client กลางสำหรับ LINE Messaging API — push/reply Flex Message ("Rich Message")
 * ไปหาร้านค้าที่ผูกบัญชี LINE ไว้แล้ว (shops.line_user_id)
 *
 * ตั้งค่าผ่าน env: LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET, LINE_OA_ADD_FRIEND_URL
 * ถ้ายังไม่ตั้งค่า → lineConfigured=false (ระบบข้าม push เงียบๆ ไม่ทำให้ request หลักพัง)
 *
 * Docs: https://developers.line.biz/en/reference/messaging-api/
 */

import { createHmac, timingSafeEqual } from "crypto";
import { query } from "../db";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";

export const lineConfigured = Boolean(LINE_CHANNEL_ACCESS_TOKEN && LINE_CHANNEL_SECRET);

/** ตรวจลายเซ็น webhook ตาม spec ของ LINE (HMAC-SHA256 ของ raw body, เทียบแบบ base64) */
export function verifySignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!LINE_CHANNEL_SECRET || !signature) return false;
  const expected = createHmac("sha256", LINE_CHANNEL_SECRET).update(rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function callLineApi(path: string, body: unknown): Promise<boolean> {
  if (!lineConfigured) {
    console.warn("[line] not configured — skipping", path);
    return false;
  }
  try {
    const res = await fetch(`https://api.line.me/v2/bot${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[line] ${path} failed:`, res.status, text.slice(0, 500));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[line] ${path} error:`, (err as Error).message);
    return false;
  }
}

export function pushMessage(lineUserId: string, messages: object[]): Promise<boolean> {
  return callLineApi("/message/push", { to: lineUserId, messages });
}

export function replyMessage(replyToken: string, messages: object[]): Promise<boolean> {
  return callLineApi("/message/reply", { replyToken, messages });
}

export interface OrderFlexInput {
  shopName: string;
  domainLabel: string;
  orderId: string;
  customerName: string;
  total: number;
  itemsSummary: string;
  confirmPostbackData: string;
  detailUrl: string;
}

/** การ์ดออเดอร์ใหม่ พร้อมปุ่ม "ยืนยันออเดอร์" (postback) และ "ดูรายละเอียด" (เปิดแอป) */
export function buildOrderFlex(input: OrderFlexInput) {
  const shortId = input.orderId.slice(0, 8);
  return {
    type: "flex",
    altText: `มีออเดอร์ใหม่รอยืนยัน #${shortId}`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#1B2A4A",
        paddingAll: "16px",
        contents: [
          { type: "text", text: input.domainLabel, color: "#C5A55A", size: "sm", weight: "bold" },
          { type: "text", text: `ออเดอร์ #${shortId}`, color: "#FFFFFF", size: "lg", weight: "bold", margin: "sm" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "16px",
        contents: [
          { type: "text", text: input.shopName, size: "sm", color: "#6B7280" },
          { type: "separator", margin: "md" },
          { type: "text", text: `ลูกค้า: ${input.customerName}`, size: "sm", wrap: true, margin: "md" },
          { type: "text", text: input.itemsSummary, size: "sm", wrap: true, color: "#6B7280" },
          { type: "text", text: `ยอดรวม ฿${input.total.toLocaleString()}`, size: "md", weight: "bold", color: "#1B2A4A", margin: "md" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#C5A55A",
            action: { type: "postback", label: "ยืนยันออเดอร์", data: input.confirmPostbackData },
          },
          {
            type: "button",
            style: "link",
            action: { type: "uri", label: "ดูรายละเอียด", uri: input.detailUrl },
          },
        ],
      },
    },
  };
}

export interface InfoFlexInput {
  title: string;
  body: string;
  detailUrl: string;
}

/** การ์ดแจ้งเตือนทั่วไป (เช่น ลูกค้ายกเลิกออเดอร์) — ไม่มีปุ่ม action */
export function buildInfoFlex(input: InfoFlexInput) {
  return {
    type: "flex",
    altText: input.title,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "16px",
        contents: [
          { type: "text", text: input.title, size: "md", weight: "bold", color: "#1B2A4A", wrap: true },
          { type: "text", text: input.body, size: "sm", color: "#6B7280", wrap: true, margin: "md" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "12px",
        contents: [
          { type: "button", style: "link", action: { type: "uri", label: "ดูรายละเอียด", uri: input.detailUrl } },
        ],
      },
    },
  };
}

async function logMessage(shopId: string, eventType: string, status: "sent" | "skipped" | "failed", error?: string) {
  try {
    await query(
      "INSERT INTO line_message_logs (shop_id, event_type, status, error) VALUES ($1, $2, $3, $4)",
      [shopId, eventType, status, error ?? null]
    );
  } catch (err) {
    console.error("[line] logMessage failed:", err);
  }
}

/**
 * ส่งการ์ดออเดอร์ใหม่หาร้าน (ถ้าร้านผูกบัญชี LINE ไว้แล้ว) — ข้ามเงียบๆ ถ้ายังไม่ผูก/ยังไม่ตั้งค่า LINE
 * เรียกจากจุดที่ order เข้าสถานะ pending_confirm (payments.ts, weaving-orders.ts)
 */
export async function notifyShopNewOrder(shopId: string, input: Omit<OrderFlexInput, "shopName">) {
  try {
    const rows = await query<{ line_user_id: string | null; name: string }>(
      "SELECT line_user_id, name FROM shops WHERE id = $1",
      [shopId]
    );
    const shop = rows[0];
    if (!shop?.line_user_id) return;
    if (!lineConfigured) { await logMessage(shopId, "new_order", "skipped", "LINE not configured"); return; }

    const ok = await pushMessage(shop.line_user_id, [buildOrderFlex({ ...input, shopName: shop.name })]);
    await logMessage(shopId, "new_order", ok ? "sent" : "failed");
  } catch (err) {
    console.error("[line] notifyShopNewOrder failed:", err);
  }
}

/** ส่งการ์ดแจ้งเตือนทั่วไปหาร้าน (เช่น ลูกค้ายกเลิกออเดอร์) */
export async function notifyShopInfo(shopId: string, input: InfoFlexInput) {
  try {
    const rows = await query<{ line_user_id: string | null }>(
      "SELECT line_user_id FROM shops WHERE id = $1",
      [shopId]
    );
    const shop = rows[0];
    if (!shop?.line_user_id) return;
    if (!lineConfigured) { await logMessage(shopId, "info", "skipped", "LINE not configured"); return; }

    const ok = await pushMessage(shop.line_user_id, [buildInfoFlex(input)]);
    await logMessage(shopId, "info", ok ? "sent" : "failed");
  } catch (err) {
    console.error("[line] notifyShopInfo failed:", err);
  }
}
