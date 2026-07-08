import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

function mapAddress(row: Record<string, unknown>) {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    addressLine1: row.address_line1,
    subdistrict: row.subdistrict,
    district: row.district,
    province: row.province,
    postalCode: row.postal_code,
    lat: row.lat !== null ? Number(row.lat) : null,
    lng: row.lng !== null ? Number(row.lng) : null,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

/** GET /api/addresses — ที่อยู่ที่บันทึกไว้ของฉัน (default ก่อน แล้วเรียงล่าสุด) */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT * FROM customer_addresses WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [req.user!.userId]
    );
    res.json(rows.map(mapAddress));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
});

/** POST /api/addresses — บันทึกที่อยู่ใหม่ */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      label = "บ้าน", recipientName, phone, addressLine1,
      subdistrict, district, province, postalCode,
      lat, lng, isDefault = false,
    } = req.body as Record<string, unknown>;

    if (!recipientName || !phone || !addressLine1 || !subdistrict || !district || !province || !postalCode) {
      res.status(400).json({ error: "กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน" });
      return;
    }

    const userId = req.user!.userId;

    // ที่อยู่แรกของผู้ใช้ → ตั้งเป็น default อัตโนมัติ
    const existing = await query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM customer_addresses WHERE user_id = $1",
      [userId]
    );
    const makeDefault = isDefault || Number(existing[0].count) === 0;

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO customer_addresses
         (user_id, label, recipient_name, phone, address_line1, subdistrict, district, province, postal_code, lat, lng, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [userId, label, recipientName, phone, addressLine1, subdistrict, district, province, postalCode, lat ?? null, lng ?? null, makeDefault]
    );

    if (makeDefault) {
      await query("UPDATE customer_addresses SET is_default = false WHERE user_id = $1 AND id <> $2", [userId, rows[0].id]);
    }

    res.status(201).json(mapAddress(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "บันทึกที่อยู่ไม่สำเร็จ" });
  }
});

/** PATCH /api/addresses/:id */
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const owned = await query<{ id: string }>("SELECT id FROM customer_addresses WHERE id = $1 AND user_id = $2", [req.params.id, userId]);
    if (!owned.length) { res.status(404).json({ error: "ไม่พบที่อยู่นี้" }); return; }

    const {
      label, recipientName, phone, addressLine1,
      subdistrict, district, province, postalCode,
      lat, lng, isDefault,
    } = req.body as Record<string, unknown>;

    const rows = await query<Record<string, unknown>>(
      `UPDATE customer_addresses SET
         label = COALESCE($1, label),
         recipient_name = COALESCE($2, recipient_name),
         phone = COALESCE($3, phone),
         address_line1 = COALESCE($4, address_line1),
         subdistrict = COALESCE($5, subdistrict),
         district = COALESCE($6, district),
         province = COALESCE($7, province),
         postal_code = COALESCE($8, postal_code),
         lat = COALESCE($9, lat),
         lng = COALESCE($10, lng),
         is_default = COALESCE($11, is_default),
         updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [label ?? null, recipientName ?? null, phone ?? null, addressLine1 ?? null,
       subdistrict ?? null, district ?? null, province ?? null, postalCode ?? null,
       lat ?? null, lng ?? null, isDefault ?? null, req.params.id]
    );

    if (isDefault === true) {
      await query("UPDATE customer_addresses SET is_default = false WHERE user_id = $1 AND id <> $2", [userId, req.params.id]);
    }

    res.json(mapAddress(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "แก้ไขที่อยู่ไม่สำเร็จ" });
  }
});

/** DELETE /api/addresses/:id */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const rows = await query<{ id: string; is_default: boolean }>(
      "DELETE FROM customer_addresses WHERE id = $1 AND user_id = $2 RETURNING id, is_default",
      [req.params.id, userId]
    );
    if (!rows.length) { res.status(404).json({ error: "ไม่พบที่อยู่นี้" }); return; }

    // ถ้าลบที่อยู่ default ไป → ตั้งอันล่าสุดที่เหลือเป็น default แทน (กันไม่มี default เลย)
    if (rows[0].is_default) {
      await query(
        `UPDATE customer_addresses SET is_default = true
         WHERE id = (SELECT id FROM customer_addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1)`,
        [userId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ลบที่อยู่ไม่สำเร็จ" });
  }
});

export default router;
