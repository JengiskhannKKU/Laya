/**
 * แบนเนอร์หน้าแรกจริงจาก backend (`GET /api/banners`) — แทนที่ mock `banners` array
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
