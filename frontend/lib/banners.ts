/**
 * แบนเนอร์หน้าแรกจริงจาก backend (`GET /api/banners`) — แทนที่ mock `banners` array
 */

// เบราว์เซอร์ใช้ path สัมพัทธ์เสมอ (proxy ผ่าน next.config.mjs / nginx) — server ใช้ absolute URL
// (บั๊กเดิม: absolute URL ตรงๆ ทุกที่ ทำให้เบราว์เซอร์ผู้ใช้จริงบน production fetch fail เงียบๆ)
// ตัด trailing slash เสมอ — กัน double slash ทำให้ fetch 404 เงียบๆ (ดูรายละเอียดใน lib/communities.ts)
export const API_BASE =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "")
    : "";

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

export async function fetchBanners(init?: RequestInit): Promise<Banner[]> {
  const res = await fetch(`${API_BASE}/api/banners`, init);
  if (!res.ok) throw new Error(`GET /api/banners → ${res.status}`);
  return res.json();
}
