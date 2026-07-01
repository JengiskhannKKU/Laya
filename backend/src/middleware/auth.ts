import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { query } from "../db";

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

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);

  const supabaseSecret = process.env.SUPABASE_JWT_SECRET;

  if (supabaseSecret) {
    let claims: SupabaseClaims | null = null;
    try {
      claims = jwt.verify(token, supabaseSecret) as SupabaseClaims;
    } catch {
      // Not a Supabase JWT — fall through
    }

    if (claims) {
      resolveUserPayload(claims.sub, claims.email ?? "")
        .then((payload) => {
          req.user = payload;
          next();
        })
        .catch(() => {
          // DB error — still let request through with minimal payload
          req.user = { userId: claims!.sub, email: claims!.email ?? "", role: "customer" };
          next();
        });
      return;
    }
  }

  // Legacy / dev JWT (e.g. loginAsRole mock, or no SUPABASE_JWT_SECRET set)
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
