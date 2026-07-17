import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

/** GET /api/shops — public list of active shops */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { province, search } = req.query;
    // NOTE: enum shop_status = pending | approved | suspended ('active' ไม่มีในระบบ)
    // s.is_open คือสวิตช์เปิด/ปิดร้านชั่วคราวของร้านเอง แยกจาก status ที่แอดมินคุม
    const conditions = ["s.status = 'approved'", "s.is_open = true"];
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
              s.rating, s.review_count, s.created_at, s.merchant_type,
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
    const { userId, email } = req.user!;
    const {
      name, description, province, address, phone, lineId, specialties, services,
      promptpayId, bankName, bankAccountNo, bankAccountName, merchantType, productLanguage,
    } = req.body as {
      name: string; description?: string; province: string; address?: string;
      phone?: string; lineId?: string; specialties?: string[]; services?: string[];
      promptpayId?: string; bankName?: string; bankAccountNo?: string; bankAccountName?: string;
      merchantType?: string; productLanguage?: string;
    };

    if (!name || !province) {
      res.status(400).json({ error: "name และ province จำเป็นต้องกรอก" });
      return;
    }
    // ประเภทร้านค้า: ชุมชนทอผ้า | ดีไซเนอร์ | ร้านค้าผลิตภัณฑ์ผ้าไทย (retailer)
    const MERCHANT_TYPES = ["weaving_community", "designer", "retailer"];
    const shopType = MERCHANT_TYPES.includes(merchantType ?? "") ? merchantType! : "weaving_community";
    const langPref = productLanguage === "en" ? "en" : "th";

    // Ensure the user exists in users table (foreign key constraint guard)
    await query(
      `INSERT INTO users (id, email, role, is_active)
       VALUES ($1, $2, 'customer', true)
       ON CONFLICT (id) DO NOTHING`,
      [userId, email]
    );

    const existing = await query<{ id: string }>("SELECT id FROM shops WHERE user_id = $1", [userId]);
    if (existing.length) {
      res.status(409).json({ error: "มีร้านค้าอยู่แล้ว" });
      return;
    }

    const rows = await query<{ id: string }>(
      `INSERT INTO shops (user_id, name, description, province, address, phone, line_id, status,
                           promptpay_id, bank_name, bank_account_no, bank_account_name, merchant_type, product_language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, $11, $12, $13)
       RETURNING id`,
      [
        userId, name, description ?? null, province, address ?? null, phone ?? null, lineId ?? null,
        promptpayId ?? null, bankName ?? null, bankAccountNo ?? null, bankAccountName ?? null, shopType, langPref,
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
      profileImageUrl, coverImageUrl, businessHours, leadTimeDays, minOrderQty,
    } = req.body as Record<string, string> & { leadTimeDays?: number; minOrderQty?: number };

    await query(
      `UPDATE shops SET name=$1, description=$2, province=$3, address=$4, phone=$5,
       line_id=$6, promptpay_id=$7, bank_name=$8, bank_account_no=$9, bank_account_name=$10,
       profile_image_url=$11, cover_image_url=$12, business_hours=$13,
       lead_time_days=$14, min_order_qty=$15,
       updated_at=NOW() WHERE user_id=$16`,
      [
        name, description ?? null, province, address ?? null, phone ?? null, lineId ?? null,
        promptpayId ?? null, bankName ?? null, bankAccountNo ?? null, bankAccountName ?? null,
        profileImageUrl ?? null, coverImageUrl ?? null, businessHours ?? null,
        leadTimeDays ?? null, minOrderQty ?? null, userId,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update shop" });
  }
});

/** PATCH /api/shops/mine/open — merchant toggles เปิด/ปิดร้านชั่วคราว */
router.patch("/mine/open", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { isOpen } = req.body as { isOpen?: boolean };
    if (typeof isOpen !== "boolean") { res.status(400).json({ error: "isOpen ต้องเป็น true/false" }); return; }

    await query("UPDATE shops SET is_open=$1, updated_at=NOW() WHERE user_id=$2", [isOpen, req.user!.userId]);
    res.json({ isOpen });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update shop open state" });
  }
});

/**
 * GET /api/shops/mine/stats — สรุปตัวเลขสำหรับ Dashboard ร้านค้า
 * รวมออเดอร์ 3 ระบบ (orders/weaving_orders/product_orders) เข้าด้วยกัน (cast เป็น text เพราะ enum คนละชนิด)
 */
router.get("/mine/stats", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const shopRows = await query<{ id: string }>("SELECT id FROM shops WHERE user_id = $1", [req.user!.userId]);
    if (!shopRows.length) { res.status(404).json({ error: "ยังไม่มีร้านค้า" }); return; }
    const shopId = shopRows[0].id;

    const summary = await query<Record<string, unknown>>(
      `WITH prod AS (
         SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_active) AS active,
                COUNT(*) FILTER (WHERE stock <= low_stock_threshold AND is_active) AS low_stock
         FROM products WHERE shop_id = $1
       ),
       all_orders AS (
         SELECT status::text AS status FROM orders WHERE shop_id = $1
         UNION ALL
         SELECT status::text AS status FROM weaving_orders WHERE shop_id = $1
         UNION ALL
         SELECT status::text AS status FROM product_orders WHERE shop_id = $1
       ),
       ord AS (
         SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status IN ('pending_confirm', 'confirmed')) AS pending_action
         FROM all_orders
       ),
       pay AS (
         SELECT
           COALESCE(SUM(p.shop_payout) FILTER (WHERE p.status = 'paid' AND p.paid_at::date = CURRENT_DATE), 0) AS today_sales,
           COALESCE(SUM(p.shop_payout) FILTER (WHERE p.status = 'paid' AND date_trunc('month', p.paid_at) = date_trunc('month', NOW())), 0) AS month_sales
         FROM payments p
         WHERE p.order_id IN (SELECT id FROM orders WHERE shop_id = $1)
            OR p.weaving_order_id IN (SELECT id FROM weaving_orders WHERE shop_id = $1)
            OR p.product_order_id IN (SELECT id FROM product_orders WHERE shop_id = $1)
            OR (p.product_order_id IS NULL AND p.product_order_group_id IN (
                  SELECT order_group_id FROM product_orders WHERE shop_id = $1
                ))
       )
       SELECT prod.total AS product_count, prod.active AS active_product_count, prod.low_stock AS low_stock_count,
              ord.total AS order_count, ord.pending_action AS pending_action_count,
              pay.today_sales, pay.month_sales
       FROM prod, ord, pay`,
      [shopId]
    );

    const recentAction = await query<Record<string, unknown>>(
      `SELECT * FROM (
         SELECT o.id, 'order' AS kind, o.status::text AS status, o.created_at, u.display_name AS customer_name
         FROM orders o JOIN users u ON u.id = o.customer_id
         WHERE o.shop_id = $1 AND o.status IN ('pending_confirm', 'confirmed')
         UNION ALL
         SELECT w.id, 'weaving' AS kind, w.status::text AS status, w.created_at, u.display_name AS customer_name
         FROM weaving_orders w JOIN users u ON u.id = w.customer_id
         WHERE w.shop_id = $1 AND w.status IN ('pending_confirm', 'confirmed')
         UNION ALL
         SELECT po.id, 'product' AS kind, po.status::text AS status, po.created_at, u.display_name AS customer_name
         FROM product_orders po JOIN users u ON u.id = po.customer_id
         WHERE po.shop_id = $1 AND po.status IN ('pending_confirm', 'confirmed')
       ) t
       ORDER BY created_at DESC
       LIMIT 5`,
      [shopId]
    );

    const s = summary[0] ?? {};
    res.json({
      productCount: Number(s.product_count ?? 0),
      activeProductCount: Number(s.active_product_count ?? 0),
      lowStockCount: Number(s.low_stock_count ?? 0),
      orderCount: Number(s.order_count ?? 0),
      pendingActionCount: Number(s.pending_action_count ?? 0),
      todaySales: Number(s.today_sales ?? 0),
      monthSales: Number(s.month_sales ?? 0),
      recentActionOrders: recentAction.map((r) => ({
        id: r.id,
        kind: r.kind,
        status: r.status,
        createdAt: r.created_at,
        customerName: r.customer_name,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shop stats" });
  }
});

/** PATCH /api/shops/:id/status — admin approves/suspends shop */
router.patch("/:id/status", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: string };
    if (!status) { res.status(400).json({ error: "status required" }); return; }

    await query(
      `UPDATE shops SET status=$1::shop_status, approved_at = CASE WHEN $1::text='approved' THEN NOW() ELSE approved_at END,
       updated_at=NOW() WHERE id=$2`,
      [status, req.params.id]
    );
    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update shop status" });
  }
});

/**
 * GET /api/shops/mine/templates — merchant's enabled templates with availability status
 * Shows all templates and whether shop has enabled each one
 */
router.get("/mine/templates", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const shopRows = await query<{ id: string }>("SELECT id FROM shops WHERE user_id = $1", [req.user!.userId]);
    if (!shopRows.length) { res.status(404).json({ error: "ยังไม่มีร้านค้า" }); return; }
    const shopId = shopRows[0].id;

    const rows = await query<Record<string, unknown>>(
      `SELECT t.id, t.name, t.category, t.base_price, t.front_asset_url, t.back_asset_url,
              COALESCE(st.is_available, false) AS is_enabled
       FROM templates t
       LEFT JOIN shop_templates st ON (st.template_id = t.id AND st.shop_id = $1)
       WHERE t.is_active = true
       ORDER BY t.category, t.name`,
      [shopId]
    );

    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      basePrice: Number(r.base_price),
      frontAssetUrl: r.front_asset_url,
      backAssetUrl: r.back_asset_url,
      isEnabled: r.is_enabled === true,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shop templates" });
  }
});

/** POST /api/shops/mine/templates — merchant enables/adds templates for their shop */
router.post("/mine/templates", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const { templateIds } = req.body as { templateIds?: string[] };
    if (!Array.isArray(templateIds)) { res.status(400).json({ error: "templateIds must be an array" }); return; }

    const shopRows = await query<{ id: string }>("SELECT id FROM shops WHERE user_id = $1", [req.user!.userId]);
    if (!shopRows.length) { res.status(404).json({ error: "ยังไม่มีร้านค้า" }); return; }
    const shopId = shopRows[0].id;

    // Validate all template IDs exist
    const validIds = await query<{ id: string }>(
      `SELECT id FROM templates WHERE id = ANY($1::text[]) AND is_active = true`,
      [templateIds]
    );
    if (validIds.length !== templateIds.length) {
      res.status(400).json({ error: "Some template IDs are invalid" });
      return;
    }

    // Upsert shop_templates records
    for (const tId of templateIds) {
      await query(
        `INSERT INTO shop_templates (shop_id, template_id, is_available)
         VALUES ($1, $2, true)
         ON CONFLICT (shop_id, template_id) DO UPDATE SET is_available = true, updated_at = NOW()`,
        [shopId, tId]
      );
    }

    res.json({ success: true, shopId, count: templateIds.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add templates to shop" });
  }
});

/** DELETE /api/shops/mine/templates/:templateId — merchant disables a template */
router.delete("/mine/templates/:templateId", requireAuth, requireRole("merchant", "admin"), async (req: Request, res: Response) => {
  try {
    const shopRows = await query<{ id: string }>("SELECT id FROM shops WHERE user_id = $1", [req.user!.userId]);
    if (!shopRows.length) { res.status(404).json({ error: "ยังไม่มีร้านค้า" }); return; }
    const shopId = shopRows[0].id;

    await query(
      "UPDATE shop_templates SET is_available = false WHERE shop_id = $1 AND template_id = $2",
      [shopId, req.params.templateId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove template from shop" });
  }
});

export default router;
