import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

/** GET /api/shops — public list of active shops */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { province, search } = req.query;
    const conditions = ["s.status = 'active'"];
    const params: unknown[] = [];
    let idx = 1;

    if (province) { conditions.push(`s.province = $${idx++}`); params.push(province); }
    if (search) {
      conditions.push(`(s.name ILIKE $${idx} OR s.description ILIKE $${idx} OR s.province ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const rows = await query<Record<string, unknown>>(
      `SELECT s.id, s.name, s.description, s.province, s.address,
              s.phone, s.line_id, s.profile_image_url, s.cover_image_url,
              s.rating, s.review_count, s.created_at,
              COALESCE(json_agg(ss.pattern_tag) FILTER (WHERE ss.id IS NOT NULL), '[]') AS specialties
       FROM shops s
       LEFT JOIN shop_specialties ss ON ss.shop_id = s.id
       WHERE ${conditions.join(" AND ")}
       GROUP BY s.id
       ORDER BY s.rating DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

/** GET /api/shops/mine — merchant's own shop */
router.get("/mine", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT s.*,
              COALESCE(json_agg(DISTINCT ss.pattern_tag) FILTER (WHERE ss.id IS NOT NULL), '[]') AS specialties,
              COALESCE(json_agg(DISTINCT sv.service_type) FILTER (WHERE sv.id IS NOT NULL), '[]') AS services
       FROM shops s
       LEFT JOIN shop_specialties ss ON ss.shop_id = s.id
       LEFT JOIN shop_services sv ON sv.shop_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id`,
      [req.user!.userId]
    );
    if (!rows.length) { res.status(404).json({ error: "ยังไม่มีร้านค้า" }); return; }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shop" });
  }
});

/** GET /api/shops/:id */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT s.*,
              COALESCE(json_agg(DISTINCT ss.pattern_tag) FILTER (WHERE ss.id IS NOT NULL), '[]') AS specialties,
              COALESCE(json_agg(DISTINCT sv.service_type) FILTER (WHERE sv.id IS NOT NULL), '[]') AS services
       FROM shops s
       LEFT JOIN shop_specialties ss ON ss.shop_id = s.id
       LEFT JOIN shop_services sv ON sv.shop_id = s.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [req.params.id]
    );
    if (!rows.length) { res.status(404).json({ error: "Shop not found" }); return; }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shop" });
  }
});

/** POST /api/shops/apply — customer applies to become merchant */
router.post("/apply", requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { name, description, province, address, phone, lineId, specialties, services } = req.body as {
      name: string; description?: string; province: string; address?: string;
      phone?: string; lineId?: string; specialties?: string[]; services?: string[];
    };

    if (!name || !province) {
      res.status(400).json({ error: "name และ province จำเป็นต้องกรอก" });
      return;
    }

    const existing = await query<{ id: string }>("SELECT id FROM shops WHERE user_id = $1", [userId]);
    if (existing.length) {
      res.status(409).json({ error: "มีร้านค้าอยู่แล้ว" });
      return;
    }

    const rows = await query<{ id: string }>(
      `INSERT INTO shops (user_id, name, description, province, address, phone, line_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING id`,
      [userId, name, description ?? null, province, address ?? null, phone ?? null, lineId ?? null]
    );

    const shopId = rows[0].id;

    if (specialties?.length) {
      for (const tag of specialties) {
        await query("INSERT INTO shop_specialties (shop_id, pattern_tag) VALUES ($1, $2)", [shopId, tag]);
      }
    }
    if (services?.length) {
      for (const svc of services) {
        await query("INSERT INTO shop_services (shop_id, service_type) VALUES ($1, $2)", [shopId, svc]);
      }
    }

    res.status(201).json({ id: shopId, status: "pending" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สมัครร้านค้าไม่สำเร็จ" });
  }
});

/** PATCH /api/shops/mine — merchant updates own shop */
router.patch("/mine", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { name, description, province, address, phone, lineId } = req.body as Record<string, string>;

    await query(
      `UPDATE shops SET name=$1, description=$2, province=$3, address=$4, phone=$5,
       line_id=$6, updated_at=NOW() WHERE user_id=$7`,
      [name, description ?? null, province, address ?? null, phone ?? null, lineId ?? null, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update shop" });
  }
});

/** PATCH /api/shops/:id/status — admin approves/suspends shop */
router.patch("/:id/status", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: string };
    if (!status) { res.status(400).json({ error: "status required" }); return; }

    await query(
      `UPDATE shops SET status=$1, approved_at = CASE WHEN $1='active' THEN NOW() ELSE approved_at END,
       updated_at=NOW() WHERE id=$2`,
      [status, req.params.id]
    );
    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update shop status" });
  }
});

export default router;
