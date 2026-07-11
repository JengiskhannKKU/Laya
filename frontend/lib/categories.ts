/**
 * หมวดหมู่สินค้าจริงจาก backend (`GET /api/categories`) — แทนที่ mock `categories` array
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export async function fetchCategories(init?: RequestInit): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/api/categories`, init);
  if (!res.ok) throw new Error(`GET /api/categories → ${res.status}`);
  return res.json();
}
