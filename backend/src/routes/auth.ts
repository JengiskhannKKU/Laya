import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db";
import { signToken, requireAuth } from "../middleware/auth";

const router = Router();

// ── POST /api/auth/register ────────────────────────────────────────────────────
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { display_name, email, password, phone } = req.body as {
      display_name: string;
      email: string;
      password: string;
      phone?: string;
    };

    if (!display_name || !email || !password) {
      res.status(400).json({ error: "display_name, email และ password จำเป็นต้องกรอก" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });
      return;
    }

    const existing = await query<{ id: string }>(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existing.length > 0) {
      res.status(409).json({ error: "อีเมลนี้มีบัญชีอยู่แล้ว" });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const rows = await query<{ id: string; email: string; display_name: string; role: string }>(
      `INSERT INTO users (email, display_name, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, 'customer')
       RETURNING id, email, display_name, role`,
      [email.toLowerCase(), display_name, password_hash, phone ?? null]
    );

    const u = rows[0];
    const token = signToken({ userId: u.id, email: u.email, role: u.role as "customer" });

    res.status(201).json({
      token,
      user: { id: u.id, email: u.email, name: u.display_name, role: u.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สมัครสมาชิกไม่สำเร็จ" });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" });
      return;
    }

    const rows = await query<{
      id: string; email: string; display_name: string; role: string;
      password_hash: string | null; avatar_url: string | null; is_active: boolean;
    }>(
      `SELECT id, email, display_name, role, password_hash, avatar_url, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    const u = rows[0];

    if (!u.is_active) {
      res.status(403).json({ error: "บัญชีนี้ถูกระงับการใช้งาน" });
      return;
    }

    if (!u.password_hash) {
      res.status(400).json({ error: "บัญชีนี้ใช้การเข้าสู่ระบบผ่าน Social Login เท่านั้น" });
      return;
    }

    const valid = await bcrypt.compare(password, u.password_hash);
    if (!valid) {
      res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    // Check if user has a shop (merchant)
    const shopRows = await query<{ id: string; status: string }>(
      "SELECT id, status FROM shops WHERE user_id = $1 LIMIT 1",
      [u.id]
    );
    const shop = shopRows[0] ?? null;

    // Resolve effective role: merchant only if shop exists (any status), admin stays admin
    const effectiveRole: "customer" | "merchant" | "admin" =
      u.role === "admin" ? "admin" : shop ? "merchant" : "customer";

    // Update last_login_at
    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [u.id]);

    const token = signToken({
      userId: u.id,
      email: u.email,
      role: effectiveRole,
      shopId: shop?.id,
      shopStatus: shop?.status,
    });

    res.json({
      token,
      user: {
        id: u.id,
        email: u.email,
        name: u.display_name,
        role: effectiveRole,
        avatar: u.avatar_url ?? undefined,
        shopId: shop?.id,
        shopStatus: shop?.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เข้าสู่ระบบไม่สำเร็จ" });
  }
});

// ── POST /api/auth/sync ────────────────────────────────────────────────────────
// Called after OAuth callback to upsert Supabase user into public.users
router.post("/sync", requireAuth, async (req: Request, res: Response) => {
  try {
    const { display_name, avatar_url, phone } = req.body as {
      display_name?: string;
      avatar_url?: string;
      phone?: string;
    };

    const userId = req.user!.userId;
    const email  = req.user!.email;

    const rows = await query<{ id: string; display_name: string; role: string }>(
      `INSERT INTO users (id, email, display_name, avatar_url, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 'customer', true)
       ON CONFLICT (id) DO UPDATE SET
         email        = EXCLUDED.email,
         display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), users.display_name),
         avatar_url   = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
         last_login_at = NOW()
       RETURNING id, display_name, role`,
      [userId, email, display_name ?? email.split("@")[0], avatar_url ?? null, phone ?? null]
    );

    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sync ผู้ใช้ไม่สำเร็จ" });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<{
      id: string; email: string; display_name: string; role: string;
      avatar_url: string | null; phone: string | null; is_active: boolean;
    }>(
      "SELECT id, email, display_name, role, avatar_url, phone, is_active FROM users WHERE id = $1",
      [req.user!.userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "ไม่พบผู้ใช้" });
      return;
    }

    const u = rows[0];

    if (!u.is_active) {
      res.status(403).json({ error: "บัญชีนี้ถูกระงับการใช้งาน" });
      return;
    }

    const shopRows = await query<{ id: string; status: string; name: string }>(
      "SELECT id, status, name FROM shops WHERE user_id = $1 LIMIT 1",
      [u.id]
    );
    const shop = shopRows[0] ?? null;

    const effectiveRole: "customer" | "merchant" | "admin" =
      u.role === "admin" ? "admin" : shop ? "merchant" : "customer";

    res.json({
      id: u.id,
      email: u.email,
      name: u.display_name,
      role: effectiveRole,
      avatar: u.avatar_url ?? undefined,
      phone: u.phone ?? undefined,
      shopId: shop?.id,
      shopStatus: shop?.status,
      shopName: shop?.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ดึงข้อมูลผู้ใช้ไม่สำเร็จ" });
  }
});

// ── PUT /api/auth/profile ──────────────────────────────────────────────────────
router.put("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const { displayName, avatarUrl, phone } = req.body as {
      displayName?: string;
      avatarUrl?: string;
      phone?: string;
    };
    const userId = req.user!.userId;

    await query(
      `UPDATE users 
       SET display_name = COALESCE($1, display_name),
           avatar_url = COALESCE($2, avatar_url),
           phone = COALESCE($3, phone)
       WHERE id = $4`,
      [
        displayName !== undefined ? displayName : null,
        avatarUrl !== undefined ? avatarUrl : null,
        phone !== undefined ? phone : null,
        userId
      ]
    );

    res.json({ success: true });
  } catch (err: any) {
    console.error("profile update failed:", err);
    res.status(500).json({ error: err.message ?? "Failed to update profile" });
  }
});

export default router;
