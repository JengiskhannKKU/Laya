import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { query } from "../db";
import { supabaseAdmin } from "../utils/supabaseAdmin";

const router = Router();

/**
 * LINE Login — custom backend-driven OAuth flow แทนที่ Supabase Custom OIDC Provider
 *
 * เดิมลองใช้ Supabase Custom OIDC Provider (supabase.auth.signInWithOAuth({ provider: 'custom:line' }))
 * แต่พังเสมอด้วย error "failed to verify ID token: oidc: id token signed with unsupported algorithm,
 * expected [\"ES256\"] got \"HS256\"" — ยืนยันจากทั้งเอกสารทางการของ LINE และรายงานจากไลบรารี OIDC อื่น
 * (เช่น Ory Kratos เจอปัญหาเดียวกันเป๊ะ) ว่า LINE Login flow แบบเว็บ (ไม่ใช่ native app/SDK/LIFF) เซ็น
 * ID token ด้วย HS256 เสมอ ทั้งที่ discovery document ของ LINE เองกลับประกาศว่ารองรับแค่ ES256 —
 * ไม่ตรงกันจริงฝั่ง LINE เอง ทำให้ generic OIDC client (รวมถึงของ Supabase) verify ไม่ผ่านทุกครั้ง
 * ไม่มีทาง override algorithm ที่ Supabase Dashboard เลย จึงต้องทำ flow เองทั้งหมดแทน
 *
 * เพราะรู้ algorithm แน่ชัดแล้ว (HS256 คีย์คือ Channel Secret) verify เองฝั่ง backend ได้ง่ายกว่า ES256/JWKS
 * ด้วยซ้ำ (symmetric key ธรรมดา) จบแล้วใช้ Supabase Admin API สร้าง/หา user + ออก magic link ให้ browser
 * redirect ไปแลกเป็น session จริง — หน้า frontend/app/auth/callback/page.tsx ไม่ต้องแก้อะไรเลย เพราะสุดท้าย
 * ก็ลงเอยที่ session ปกติของ Supabase เหมือน Google login ทุกประการ
 */

const LINE_LOGIN_CHANNEL_ID = process.env.LINE_LOGIN_CHANNEL_ID ?? "";
const LINE_LOGIN_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET ?? "";
const LINE_LOGIN_REDIRECT_URI = process.env.LINE_LOGIN_REDIRECT_URI ?? "";
const FRONTEND_URL = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/+$/, "");

// เก็บ state (CSRF) ชั่วคราวในหน่วยความจำ — อายุสั้นมาก (แค่ช่วงเวลาที่ผู้ใช้กำลัง login ผ่าน LINE)
// ไม่จำเป็นต้องใช้ cookie/DB เพิ่ม ระบบนี้ยังไม่มี cookie-based session อยู่แล้ว (auth ทั้งหมดเป็น Bearer JWT)
const STATE_TTL_MS = 10 * 60 * 1000;
const pendingStates = new Map<string, number>();

function cleanupExpiredStates() {
  const now = Date.now();
  for (const [state, createdAt] of pendingStates) {
    if (now - createdAt > STATE_TTL_MS) pendingStates.delete(state);
  }
}

interface LineIdTokenClaims {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  name?: string;
  picture?: string;
  email?: string;
}

/**
 * GET /api/auth/line/start — เริ่ม LINE Login โดยพา browser ไปหน้า authorize ของ LINE
 * เรียกจาก frontend ด้วย window.location.href ตรงๆ (ไม่ใช่ fetch) เพราะเป็น full-page redirect
 */
router.get("/start", (req: Request, res: Response) => {
  if (!LINE_LOGIN_CHANNEL_ID || !LINE_LOGIN_REDIRECT_URI) {
    res.status(500).send("LINE Login ยังไม่ได้ตั้งค่าฝั่ง server (ขาด LINE_LOGIN_CHANNEL_ID/LINE_LOGIN_REDIRECT_URI)");
    return;
  }

  cleanupExpiredStates();
  const state = randomUUID();
  pendingStates.set(state, Date.now());

  const authorizeUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", LINE_LOGIN_CHANNEL_ID);
  authorizeUrl.searchParams.set("redirect_uri", LINE_LOGIN_REDIRECT_URI);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("scope", "openid profile email");

  res.redirect(authorizeUrl.toString());
});

/**
 * GET /api/auth/line/callback — LINE redirect กลับมาที่นี่หลังผู้ใช้อนุญาตแล้ว พร้อม ?code&state
 */
router.get("/callback", async (req: Request, res: Response) => {
  const { code, state, error: lineError } = req.query as { code?: string; state?: string; error?: string };

  if (lineError) {
    res.redirect(`${FRONTEND_URL}/auth/login?error=${encodeURIComponent(`LINE login cancelled or failed: ${lineError}`)}`);
    return;
  }
  if (!code || !state || !pendingStates.has(state)) {
    res.redirect(`${FRONTEND_URL}/auth/login?error=${encodeURIComponent("Invalid or expired LINE login state")}`);
    return;
  }
  pendingStates.delete(state);

  try {
    // 1) แลก authorization code เป็น token (รวม id_token)
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: LINE_LOGIN_REDIRECT_URI,
        client_id: LINE_LOGIN_CHANNEL_ID,
        client_secret: LINE_LOGIN_CHANNEL_SECRET,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`LINE token exchange failed: ${tokenRes.status} ${errText}`);
    }
    const tokenData = (await tokenRes.json()) as { id_token?: string };
    if (!tokenData.id_token) throw new Error("LINE token response missing id_token");

    // 2) verify ID token เอง — LINE web login flow เซ็นด้วย HS256 เสมอ (Channel Secret คือ key) ต่างจาก
    // native/SDK/LIFF ที่ใช้ ES256 — นี่คือจุดที่ Supabase Custom OIDC Provider verify ไม่ผ่านมาก่อนหน้านี้
    const claims = jwt.verify(tokenData.id_token, LINE_LOGIN_CHANNEL_SECRET, {
      algorithms: ["HS256"],
      issuer: "https://access.line.me",
      audience: LINE_LOGIN_CHANNEL_ID,
    }) as LineIdTokenClaims;

    // 3) หา/สร้างผู้ใช้ — LINE ไม่ค่อยคืน email มา (ต้องขอสิทธิ์ธุรกิจเพิ่มจาก LINE ต่างหาก) ใช้ email
    // ปลอมที่ผูกกับ LINE user id (sub) แทนเสมอ เพื่อให้ lookup ซ้ำได้แน่นอนไม่ว่าจะ login กี่ครั้ง
    const email = claims.email || `line-${claims.sub}@line.laya.internal`;

    const existing = await query<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
    let supabaseUserId: string;

    if (existing.length > 0) {
      supabaseUserId = existing[0].id;
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: claims.name,
          avatar_url: claims.picture,
          line_sub: claims.sub,
          provider: "line",
        },
      });
      if (error || !data.user) throw new Error(`สร้างผู้ใช้ LINE ไม่สำเร็จ: ${error?.message}`);
      supabaseUserId = data.user.id;
    }

    // 4) ออก magic link แล้วพา browser ไปแลกเป็น session จริงที่ Supabase เอง — ลงเอยที่ /auth/callback
    // เหมือน Google login ทุกประการ ไม่ต้องแก้ frontend เลย
    const { data: linkData, error: linkError2 } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${FRONTEND_URL}/auth/callback` },
    });
    if (linkError2 || !linkData?.properties?.action_link) {
      throw new Error(`สร้างลิงก์เข้าสู่ระบบไม่สำเร็จ: ${linkError2?.message}`);
    }

    res.redirect(linkData.properties.action_link);
  } catch (err: any) {
    console.error("[line-auth/callback] error:", err.message);
    res.redirect(`${FRONTEND_URL}/auth/login?error=${encodeURIComponent(err.message ?? "LINE login failed")}`);
  }
});

export default router;
