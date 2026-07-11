import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

/** GET /api/shops — public list of active shops */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { province, search } = req.query;
    // NOTE: enum shop_status = pending | approved | suspended ('active' ไม่มีในระบบ)
    const conditions = ["s.status = 'approved'"];
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

/**
 * GET /api/shops/match?patternTag=มัดหมี่&province=อุดรธานี&service=weave
 * แนะนำร้านที่เชี่ยวชาญตรงกับลายผ้าของลูกค้า (US-506)
 * คะแนน: ความเชี่ยวชาญตรงลาย +2, จังหวัดตรง +1 — เรียงตามคะแนนแล้วตาม rating
 */
router.get("/match", async (req: Request, res: Response) => {
  try {
    const { patternTag, province, service } = req.query as Record<string, string | undefined>;

    const params: unknown[] = [];
    let idx = 1;

    const pTag = patternTag ? `$${idx++}` : null;
    if (patternTag) params.push(`%${patternTag}%`);
    const pProvince = province ? `$${idx++}` : null;
    if (province) params.push(province);

    let serviceJoin = "";
    if (service) {
      serviceJoin = `JOIN shop_services sv ON sv.shop_id = s.id AND sv.service_type IN ($${idx++}, 'all')`;
      params.push(service);
    }

    const rows = await query<Record<string, unknown>>(
      `SELECT s.id, s.name, s.description, s.province, s.profile_image_url,
              s.rating, s.review_count,
              COALESCE(json_agg(DISTINCT ss.pattern_tag) FILTER (WHERE ss.id IS NOT NULL), '[]') AS specialties,
              (
                ${pTag ? `(CASE WHEN EXISTS (
                    SELECT 1 FROM shop_specialties m
                    WHERE m.shop_id = s.id AND m.pattern_tag ILIKE ${pTag}
                  ) THEN 2 ELSE 0 END)` : "0"}
                + ${pProvince ? `(CASE WHEN s.province = ${pProvince} THEN 1 ELSE 0 END)` : "0"}
              ) AS match_score
       FROM shops s
       ${serviceJoin}
       LEFT JOIN shop_specialties ss ON ss.shop_id = s.id
       WHERE s.status = 'approved'
       GROUP BY s.id
       ORDER BY match_score DESC, s.rating DESC, s.review_count DESC
       LIMIT 20`,
      params
    );

    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      province: r.province,
      profileImageUrl: r.profile_image_url,
      rating: Number(r.rating ?? 0),
      reviewCount: Number(r.review_count ?? 0),
      specialties: r.specialties,
      matchScore: Number(r.match_score ?? 0),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to match shops" });
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
    const {
      name, description, province, address, phone, lineId, specialties, services,
      promptpayId, bankName, bankAccountNo, bankAccountName,
    } = req.body as {
      name: string; description?: string; province: string; address?: string;
      phone?: string; lineId?: string; specialties?: string[]; services?: string[];
      promptpayId?: string; bankName?: string; bankAccountNo?: string; bankAccountName?: string;
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
      `INSERT INTO shops (user_id, name, description, province, address, phone, line_id, status,
                           promptpay_id, bank_name, bank_account_no, bank_account_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, $11)
       RETURNING id`,
      [
        userId, name, description ?? null, province, address ?? null, phone ?? null, lineId ?? null,
        promptpayId ?? null, bankName ?? null, bankAccountNo ?? null, bankAccountName ?? null,
      ]
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
    const {
      name, description, province, address, phone, lineId,
      promptpayId, bankName, bankAccountNo, bankAccountName,
    } = req.body as Record<string, string>;

    await query(
      `UPDATE shops SET name=$1, description=$2, province=$3, address=$4, phone=$5,
       line_id=$6, promptpay_id=$7, bank_name=$8, bank_account_no=$9, bank_account_name=$10,
       updated_at=NOW() WHERE user_id=$11`,
      [
        name, description ?? null, province, address ?? null, phone ?? null, lineId ?? null,
        promptpayId ?? null, bankName ?? null, bankAccountNo ?? null, bankAccountName ?? null, userId,
      ]
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
      `UPDATE shops SET status=$1, approved_at = CASE WHEN $1='approved' THEN NOW() ELSE approved_at END,
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
