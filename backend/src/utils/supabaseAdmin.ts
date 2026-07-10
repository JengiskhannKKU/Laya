import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client ฝั่ง server ใช้ service role key (bypass RLS) — สำหรับอัปโหลดรูปเข้า Storage
 * เท่านั้น ไม่ใช้ทำ auth/query ตาราง (ใช้ pg pool ใน db.ts สำหรับนั้น)
 */
const url = process.env.SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseAdminConfigured = Boolean(url && serviceKey);

export const supabaseAdmin = createClient(
  url || "https://placeholder.supabase.co",
  serviceKey || "placeholder-service-key",
  { auth: { persistSession: false, autoRefreshToken: false } }
);
