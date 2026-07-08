/**
 * authFetch — เรียก API พร้อม token ที่ "สดเสมอ"
 * แก้ปัญหา "Invalid or expired token": token จาก context อาจค้าง/หมดอายุ (Supabase ~1 ชม.)
 * - ดึง session ล่าสุดจาก supabase ทุกครั้ง + refresh ล่วงหน้าถ้าใกล้หมดอายุ
 * - ถ้า backend ตอบ 401 → refresh แล้ว retry อีกครั้งอัตโนมัติ
 * - ถ้ายังไม่ผ่าน → โยน SessionExpiredError ให้หน้าจอพาไป login
 */

import { supabase } from "./supabase";

export class SessionExpiredError extends Error {
  constructor() {
    super("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
    this.name = "SessionExpiredError";
  }
}

/** คืน access token ที่ยังไม่หมดอายุ (refresh ให้ถ้าเหลือน้อยกว่า 60 วิ) — null ถ้าไม่ได้ล็อกอิน */
export async function getFreshToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const expiresAtMs = (session.expires_at ?? 0) * 1000;
  if (expiresAtMs && Date.now() > expiresAtMs - 60_000) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) return null;
    return data.session.access_token;
  }
  return session.access_token;
}

/** fetch พร้อม Authorization อัตโนมัติ + retry 1 ครั้งเมื่อ 401 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getFreshToken();
  if (!token) throw new SessionExpiredError();

  const doFetch = (t: string) =>
    fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
        Authorization: `Bearer ${t}`,
      },
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) throw new SessionExpiredError();
    res = await doFetch(data.session.access_token);
    if (res.status === 401) throw new SessionExpiredError();
  }
  return res;
}
