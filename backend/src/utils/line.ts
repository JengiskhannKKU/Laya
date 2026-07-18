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

export interface LineApiResult {
  ok: boolean;
  error?: string;
}

async function callLineApi(path: string, body: unknown): Promise<LineApiResult> {
  if (!lineConfigured) {
    console.warn("[line] not configured — skipping", path);
    return { ok: false, error: "LINE not configured" };
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
      const detail = `${res.status} ${text.slice(0, 300)}`;
      // 401 = access token ผิด/หมดอายุ (คนละตัวกับ channel secret ที่ใช้ verify webhook)
      console.error(`[line] ${path} failed:`, detail);
      return { ok: false, error: detail };
    }
    return { ok: true };
  } catch (err) {
    const msg = (err as Error).message;
    console.error(`[line] ${path} error:`, msg);
    return { ok: false, error: msg };
  }
}

export function pushMessage(lineUserId: string, messages: object[]): Promise<LineApiResult> {
  return callLineApi("/message/push", { to: lineUserId, messages });
}

export function replyMessage(replyToken: string, messages: object[]): Promise<LineApiResult> {
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

/** LINE Flex ปุ่ม action type "uri" รับเฉพาะ https/tel/line — http (เช่น localhost) ทำให้ทั้งการ์ดโดน 400 */
function isHttps(url: string | undefined): url is string {
  return typeof url === "string" && url.startsWith("https://");
}

/** การ์ดออเดอร์ใหม่ พร้อมปุ่ม "ยืนยันออเดอร์" (postback) และ "ดูรายละเอียด" (เปิดแอป) */
export function buildOrderFlex(input: OrderFlexInput) {
  const shortId = input.orderId.slice(0, 8);
  // ใส่ปุ่ม "ดูรายละเอียด" เฉพาะเมื่อ detailUrl เป็น https จริง (กัน localhost/http ทำให้การ์ดส่งไม่ออก)
  const footerButtons: object[] = [
    {
      type: "button",
      style: "primary",
      color: "#C5A55A",
      action: { type: "postback", label: "ยืนยันออเดอร์", data: input.confirmPostbackData },
    },
  ];
  if (isHttps(input.detailUrl)) {
    footerButtons.push({
      type: "button",
      style: "link",
      action: { type: "uri", label: "ดูรายละเอียด", uri: input.detailUrl },
    });
  }
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
        contents: footerButtons,
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
  const bubble: Record<string, unknown> = {
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
  };
  // ใส่ footer ปุ่ม "ดูรายละเอียด" เฉพาะเมื่อ URL เป็น https (ไม่งั้น footer จะว่าง = การ์ด invalid)
  if (isHttps(input.detailUrl)) {
    bubble.footer = {
      type: "box",
      layout: "vertical",
      paddingAll: "12px",
      contents: [
        { type: "button", style: "link", action: { type: "uri", label: "ดูรายละเอียด", uri: input.detailUrl } },
      ],
    };
  }
  return { type: "flex", altText: input.title, contents: bubble };
}

/** ข้อความทักทายเมื่อมีคนเพิ่มเพื่อน OA (follow event) — บอกวิธีเชื่อมบัญชีร้าน */
export function welcomeMessages(alreadyLinkedShopName?: string | null): object[] {
  if (alreadyLinkedShopName) {
    return [{ type: "text", text: `ยินดีต้อนรับกลับ! 🧵\nบัญชีนี้เชื่อมกับร้าน "${alreadyLinkedShopName}" อยู่แล้ว ระบบจะส่งแจ้งเตือนออเดอร์ใหม่มาที่แชทนี้` }];
  }
  return [{
    type: "text",
    text:
      "ยินดีต้อนรับสู่ LAYA! 🧵\n\n" +
      "ถ้าคุณเป็นร้านค้า/ชุมชนทอผ้าบน LAYA เชื่อมบัญชีเพื่อรับแจ้งเตือนออเดอร์ใหม่และกดยืนยันออเดอร์ได้ในแชทนี้:\n\n" +
      "1) เข้าเว็บ LAYA → ตั้งค่าร้านค้า → หัวข้อ \"แจ้งเตือนออเดอร์ผ่าน LINE\"\n" +
      "2) กด \"สร้างรหัสเชื่อมต่อ\" (ได้รหัส 6 หลัก)\n" +
      "3) พิมพ์รหัส 6 หลักนั้นส่งมาที่แชทนี้\n\n" +
      "เสร็จแล้วระบบจะแจ้งเตือนออเดอร์ให้อัตโนมัติ",
  }];
}

/** ข้อความช่วยเหลือ เมื่อผู้ใช้พิมพ์อะไรที่ไม่ใช่รหัส 6 หลัก และยังไม่ได้เชื่อมบัญชี */
export function linkHelpMessages(): object[] {
  return [{
    type: "text",
    text:
      "นี่ไม่ใช่รหัสเชื่อมต่อ 6 หลักครับ\n\n" +
      "ถ้าต้องการเชื่อมบัญชีร้าน: เข้าเว็บ LAYA → ตั้งค่าร้านค้า → \"แจ้งเตือนออเดอร์ผ่าน LINE\" → สร้างรหัส 6 หลัก แล้วพิมพ์ส่งมาที่นี่",
  }];
}

/**
 * สรุปรายละเอียดออเดอร์ต่อ domain เพื่อใส่ในการ์ด LINE (คืน fallback ถ้า query พลาด)
 * - product_orders: รายการสินค้า + ตัวเลือก + จำนวน
 * - weaving_orders: ลาย/สี/เมตร/ความกว้าง/หมายเหตุ
 * - orders (ตัดเย็บ): แหล่งผ้า/เมตร/หมายเหตุ
 */
export async function buildOrderItemsSummary(domain: string, orderId: string): Promise<string> {
  try {
    if (domain === "product_orders") {
      const items = await query<{ product_name: string; variant_label: string | null; quantity: number }>(
        "SELECT product_name, variant_label, quantity FROM product_order_items WHERE product_order_id = $1",
        [orderId]
      );
      if (!items.length) return "สินค้าพร้อมขาย";
      return items.map((i) => `• ${i.product_name}${i.variant_label ? ` (${i.variant_label})` : ""} ×${i.quantity}`).join("\n");
    }
    if (domain === "weaving_orders") {
      const rows = await query<{ pattern_name: string | null; color_name: string | null; custom_color_note: string | null; meters_requested: string | null; width_cm: string | null; special_instructions: string | null }>(
        `SELECT p.name AS pattern_name, cv.color_name, w.custom_color_note, w.meters_requested, w.width_cm, w.special_instructions
         FROM weaving_orders w
         LEFT JOIN weave_patterns p ON p.id = w.pattern_id
         LEFT JOIN weave_color_variants cv ON cv.id = w.color_variant_id
         WHERE w.id = $1`,
        [orderId]
      );
      const r = rows[0];
      if (!r) return "งานทอผ้า";
      const parts: string[] = [];
      if (r.pattern_name) parts.push(`ลาย: ${r.pattern_name}`);
      const color = r.color_name ?? r.custom_color_note;
      if (color) parts.push(`สี: ${color}`);
      if (r.meters_requested) parts.push(`${Number(r.meters_requested)} เมตร`);
      if (r.width_cm) parts.push(`กว้าง ${Number(r.width_cm)} ซม.`);
      if (r.special_instructions) parts.push(`หมายเหตุ: ${r.special_instructions}`);
      return parts.join("\n") || "งานทอผ้า";
    }
    if (domain === "orders") {
      const rows = await query<{ fabric_source: string | null; fabric_meters_used: string | null; special_instructions: string | null; shop_fabric_name: string | null }>(
        `SELECT o.fabric_source, o.fabric_meters_used, o.special_instructions, sf.name AS shop_fabric_name
         FROM orders o
         LEFT JOIN shop_fabrics sf ON sf.id = o.shop_fabric_id
         WHERE o.id = $1`,
        [orderId]
      );
      const r = rows[0];
      if (!r) return "งานตัดเย็บ";
      const parts: string[] = ["งานตัดเย็บ"];
      if (r.fabric_source === "own") parts.push("ผ้า: ลูกค้านำมาเอง");
      else if (r.shop_fabric_name) parts.push(`ผ้า: ${r.shop_fabric_name}`);
      else if (r.fabric_source === "shop") parts.push("ผ้า: ของร้าน");
      if (r.fabric_meters_used) parts.push(`${Number(r.fabric_meters_used)} เมตร`);
      if (r.special_instructions) parts.push(`หมายเหตุ: ${r.special_instructions}`);
      return parts.join("\n");
    }
    return "ดูรายละเอียดในแอป";
  } catch (err) {
    console.error("[line] buildOrderItemsSummary failed:", err);
    return "ดูรายละเอียดในแอป";
  }
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
    if (!shop?.line_user_id) { await logMessage(shopId, "new_order", "skipped", "ร้านยังไม่ได้เชื่อมบัญชี LINE"); return; }
    if (!lineConfigured) { await logMessage(shopId, "new_order", "skipped", "LINE not configured"); return; }

    const result = await pushMessage(shop.line_user_id, [buildOrderFlex({ ...input, shopName: shop.name })]);
    await logMessage(shopId, "new_order", result.ok ? "sent" : "failed", result.error);
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
    if (!shop?.line_user_id) { await logMessage(shopId, "info", "skipped", "ร้านยังไม่ได้เชื่อมบัญชี LINE"); return; }
    if (!lineConfigured) { await logMessage(shopId, "info", "skipped", "LINE not configured"); return; }

    const result = await pushMessage(shop.line_user_id, [buildInfoFlex(input)]);
    await logMessage(shopId, "info", result.ok ? "sent" : "failed", result.error);
  } catch (err) {
    console.error("[line] notifyShopInfo failed:", err);
  }
}
