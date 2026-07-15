/**
 * หมวดหมู่สินค้าจริงจาก backend (`GET /api/categories`) — แทนที่ mock `categories` array
 */

// เบราว์เซอร์ใช้ path สัมพัทธ์เสมอ (proxy ผ่าน next.config.mjs / nginx) — server ใช้ absolute URL
// (บั๊กเดิม: absolute URL ตรงๆ ทุกที่ ทำให้เบราว์เซอร์ผู้ใช้จริงบน production fetch fail เงียบๆ)
export const API_BASE =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
    : "";

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
