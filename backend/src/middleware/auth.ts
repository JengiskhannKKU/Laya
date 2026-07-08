import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { query } from "../db";

// Supabase โปรเจกต์ใหม่เซ็น access token ด้วย ES256 (asymmetric) — ต้อง verify ผ่าน JWKS
// (HS256 shared secret ใช้ได้เฉพาะโปรเจกต์ legacy) — createRemoteJWKSet cache key ให้อัตโนมัติ
const SUPABASE_URL = process.env.SUPABASE_URL;
const supabaseJwks = SUPABASE_URL
  ? createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`))
  : null;

export interface JwtPayload {
  userId: string;
  email: string;
  role: "customer" | "merchant" | "admin";
  shopId?: string;
  shopStatus?: string;
}

interface SupabaseClaims {
  sub: string;
  email: string;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Resolve actual app role from DB (joins shops to detect merchant).
 * Called when we receive a Supabase JWT (which has no app-level role claim).
 */
async function resolveUserPayload(supabaseUid: string, email: string): Promise<JwtPayload> {
  const rows = await query<{ role: string; shop_id: string | null; shop_status: string | null }>(
    `SELECT u.role,
            s.id   AS shop_id,
            s.status AS shop_status
     FROM users u
     LEFT JOIN shops s ON s.user_id = u.id
     WHERE u.id = $1
     LIMIT 1`,
    [supabaseUid]
  );

  if (rows.length === 0) {
    // User not yet synced to public.users (first OAuth login before /sync fires)
    return { userId: supabaseUid, email, role: "customer" };
  }

  const r = rows[0];
  const role: JwtPayload["role"] =
    r.role === "admin" ? "admin" : r.shop_id ? "merchant" : "customer";

  return {
    userId: supabaseUid,
    email,
    role,
    shopId: r.shop_id ?? undefined,
    shopStatus: r.shop_status ?? undefined,
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);

  // 1) Supabase asymmetric (ES256/RS256) ผ่าน JWKS — โปรเจกต์ปัจจุบันใช้แบบนี้
  if (supabaseJwks) {
    try {
      const { payload } = await jwtVerify(token, supabaseJwks);
      const sub = String(payload.sub ?? "");
      const email = String((payload as { email?: string }).email ?? "");
      if (sub) {
        try {
          req.user = await resolveUserPayload(sub, email);
        } catch {
          // DB error — ปล่อยผ่านด้วย payload ขั้นต่ำ
          req.user = { userId: sub, email, role: "customer" };
        }
        next();
        return;
      }
    } catch {
      // ไม่ใช่ token ที่เซ็นด้วย key ของโปรเจกต์ — ลองวิธีถัดไป
    }
  }

  // 2) Supabase legacy HS256 shared secret
  const supabaseSecret = process.env.SUPABASE_JWT_SECRET;
  if (supabaseSecret) {
    try {
      const claims = jwt.verify(token, supabaseSecret) as SupabaseClaims;
      try {
        req.user = await resolveUserPayload(claims.sub, claims.email ?? "");
      } catch {
        req.user = { userId: claims.sub, email: claims.email ?? "", role: "customer" };
      }
      next();
      return;
    } catch {
      // fall through
    }
  }

  // 3) Legacy / dev JWT (สำหรับสคริปต์ทดสอบ)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: JwtPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  } as jwt.SignOptions);
}
