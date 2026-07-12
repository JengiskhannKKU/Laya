import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

async function notify(userId: string, type: string, title: string, body: string, data: unknown) {
  try {
    await query(
      "INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1, $2, $3, $4, $5)",
      [userId, type, title, body, JSON.stringify(data)]
    );
  } catch (err) {
    console.error("notify failed:", err);
  }
}

/** โหลดบทสนทนา + ตรวจสิทธิ์ว่าผู้เรียกเป็นคู่สนทนาจริง (ลูกค้าเจ้าของ หรือร้านเจ้าของ) */
async function loadConversationForUser(conversationId: string, req: Request, res: Response): Promise<Record<string, unknown> | null> {
  const rows = await query<Record<string, unknown>>("SELECT * FROM conversations WHERE id = $1", [conversationId]);
  if (!rows.length) { res.status(404).json({ error: "ไม่พบบทสนทนา" }); return null; }
  const convo = rows[0];
  const { userId, role, shopId } = req.user!;
  const isCustomer = convo.customer_id === userId;
  const isShop = role === "merchant" && !!shopId && convo.shop_id === shopId;
  if (!isCustomer && !isShop && role !== "admin") { res.status(403).json({ error: "Forbidden" }); return null; }
  return convo;
}

/** GET /api/chat/conversations — รายการบทสนทนาของผู้เรียก (ลูกค้าเห็นของตัวเอง, ร้านเห็นของร้าน) */
router.get("/conversations", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;

    let rows: Record<string, unknown>[];
    if (role === "merchant" && shopId) {
      rows = await query<Record<string, unknown>>(
        `SELECT c.id, c.customer_id, c.shop_id, c.last_message_at, c.created_at,
                u.display_name AS other_name, u.avatar_url AS other_avatar,
                (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_body,
                (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.read_at IS NULL) AS unread_count
         FROM conversations c
         JOIN users u ON u.id = c.customer_id
         WHERE c.shop_id = $2
         ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
        [userId, shopId]
      );
    } else {
      rows = await query<Record<string, unknown>>(
        `SELECT c.id, c.customer_id, c.shop_id, c.last_message_at, c.created_at,
                s.name AS other_name, s.profile_image_url AS other_avatar,
                (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_body,
                (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.read_at IS NULL) AS unread_count
         FROM conversations c
         JOIN shops s ON s.id = c.shop_id
         WHERE c.customer_id = $1
         ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
        [userId]
      );
    }

    res.json(rows.map(mapConversation));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/** POST /api/chat/conversations — ลูกค้าเริ่มบทสนทนากับร้าน (find-or-create) */
router.post("/conversations", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!;
    if (role !== "customer") { res.status(403).json({ error: "เฉพาะลูกค้าเริ่มบทสนทนาได้" }); return; }

    const { shopId } = req.body as { shopId?: string };
    if (!shopId) { res.status(400).json({ error: "shopId is required" }); return; }

    const shopRows = await query<{ id: string }>("SELECT id FROM shops WHERE id = $1", [shopId]);
    if (!shopRows.length) { res.status(404).json({ error: "ไม่พบร้านค้า" }); return; }

    const inserted = await query<Record<string, unknown>>(
      `INSERT INTO conversations (customer_id, shop_id) VALUES ($1, $2)
       ON CONFLICT (customer_id, shop_id) DO NOTHING
       RETURNING *`,
      [userId, shopId]
    );
    if (inserted.length) { res.status(201).json(mapConversation(inserted[0])); return; }

    const existing = await query<Record<string, unknown>>(
      "SELECT * FROM conversations WHERE customer_id = $1 AND shop_id = $2",
      [userId, shopId]
    );
    res.json(mapConversation(existing[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เริ่มบทสนทนาไม่สำเร็จ" });
  }
});

/** GET /api/chat/conversations/:id/messages — ดึงข้อความ + mark ข้อความของอีกฝั่งว่าอ่านแล้ว */
router.get("/conversations/:id/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const convo = await loadConversationForUser(req.params.id, req, res);
    if (!convo) return;
    const { userId } = req.user!;

    const rows = await query<Record<string, unknown>>(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [req.params.id]
    );

    await query(
      "UPDATE messages SET read_at = NOW() WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL",
      [req.params.id, userId]
    );

    res.json(rows.map(mapMessage));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/** POST /api/chat/conversations/:id/messages — ส่งข้อความ (ข้อความ และ/หรือ ไฟล์แนบ) */
router.post("/conversations/:id/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const convo = await loadConversationForUser(req.params.id, req, res);
    if (!convo) return;
    const { userId } = req.user!;

    const { body, attachmentUrl, attachmentType } = req.body as { body?: string; attachmentUrl?: string; attachmentType?: string };
    if (!body?.trim() && !attachmentUrl) { res.status(400).json({ error: "กรุณากรอกข้อความหรือแนบไฟล์" }); return; }

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO messages (conversation_id, sender_id, body, attachment_url, attachment_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.params.id, userId, body?.trim() || null, attachmentUrl || null, attachmentType || null]
    );

    await query("UPDATE conversations SET last_message_at = NOW() WHERE id = $1", [req.params.id]);

    const recipientId = convo.customer_id === userId
      ? (await query<{ user_id: string }>("SELECT user_id FROM shops WHERE id = $1", [convo.shop_id]))[0]?.user_id
      : (convo.customer_id as string);

    if (recipientId) {
      await notify(
        recipientId, "message", "ข้อความใหม่",
        body?.trim() || (attachmentType === "image" ? "ส่งรูปภาพมาให้คุณ" : "ส่งไฟล์แนบมาให้คุณ"),
        { conversationId: req.params.id }
      );
    }

    res.status(201).json(mapMessage(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ส่งข้อความไม่สำเร็จ" });
  }
});

/** GET /api/chat/unread-count — จำนวนข้อความที่ยังไม่อ่านรวมทุกบทสนทนาของผู้เรียก */
router.get("/unread-count", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, shopId } = req.user!;

    const rows = role === "merchant" && shopId
      ? await query<{ count: string }>(
          `SELECT COUNT(*) FROM messages m
           JOIN conversations c ON c.id = m.conversation_id
           WHERE c.shop_id = $1 AND m.sender_id != $2 AND m.read_at IS NULL`,
          [shopId, userId]
        )
      : await query<{ count: string }>(
          `SELECT COUNT(*) FROM messages m
           JOIN conversations c ON c.id = m.conversation_id
           WHERE c.customer_id = $1 AND m.sender_id != $1 AND m.read_at IS NULL`,
          [userId]
        );

    res.json({ count: Number(rows[0]?.count ?? 0) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

function mapConversation(row: Record<string, unknown>) {
  return {
    id: row.id,
    customerId: row.customer_id,
    shopId: row.shop_id,
    otherName: row.other_name ?? null,
    otherAvatar: row.other_avatar ?? null,
    lastMessageBody: row.last_message_body ?? null,
    lastMessageAt: row.last_message_at ?? null,
    unreadCount: row.unread_count != null ? Number(row.unread_count) : 0,
    createdAt: row.created_at,
  };
}

function mapMessage(row: Record<string, unknown>) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body ?? null,
    attachmentUrl: row.attachment_url ?? null,
    attachmentType: row.attachment_type ?? null,
    readAt: row.read_at ?? null,
    createdAt: row.created_at,
  };
}

export default router;
