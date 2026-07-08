/**
 * ชุมชน (ร้านค้า/วิสาหกิจชุมชนที่อนุมัติแล้ว) — ดึงจริงจาก `GET /api/communities` (backend/src/routes/communities.ts)
 * แทนที่ mock `communities` array ใน lib/mock-data.ts
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface LiveCommunity {
  id: string;
  name: string;
  province: string;
  image: string | null;
  rating: number;
  reviewCount: number;
  productCount: number;
}

export interface LiveCommunityDetail extends LiveCommunity {
  address: string | null;
  description: string | null;
}

export async function fetchCommunities(init?: RequestInit): Promise<LiveCommunity[]> {
  const res = await fetch(`${API_BASE}/api/communities`, init);
  if (!res.ok) throw new Error(`GET /api/communities → ${res.status}`);
  return res.json();
}

export async function fetchCommunity(id: string, init?: RequestInit): Promise<LiveCommunityDetail | null> {
  const res = await fetch(`${API_BASE}/api/communities/${id}`, init);
  if (!res.ok) return null;
  return res.json();
}
