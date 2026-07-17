/**
 * ชุมชน (ร้านค้า/วิสาหกิจชุมชนที่อนุมัติแล้ว) — ดึงจริงจาก `GET /api/communities` (backend/src/routes/communities.ts)
 * แทนที่ mock `communities` array ใน lib/mock-data.ts
 *
 * BASE_URL แยกตาม client/server: ฝั่งเบราว์เซอร์ใช้ path สัมพัทธ์เสมอ (proxy ผ่าน next.config.mjs ตอน dev /
 * nginx ตอน production) — ฝั่ง server (generateMetadata, sitemap.ts) fetch ต้องใช้ absolute URL เพราะไม่มี
 * browser origin ให้ resolve relative path ได้ จึงต่อตรงไป backend (อยู่เครื่อง/คอนเทนเนอร์เดียวกัน localhost ใช้ได้จริง)
 *
 * บั๊กเดิม: โค้ดนี้เคย fetch ด้วย absolute `http://localhost:4000` ตรงๆ ไม่ว่าจะรันฝั่งไหน — พอเบราว์เซอร์ผู้ใช้จริงบน
 * production เรียก มันจะพยายามต่อ localhost ของเครื่องผู้ใช้เอง (ไม่มีอะไรฟัง) ทำให้ fetch fail เงียบๆ,
 * communities = [] แล้วทั้ง section หายไปเลย (CommunitiesSection return null ถ้า list ว่าง)
 */

// ตัด trailing slash เสมอ — ถ้า env var ลงท้ายด้วย "/" (พบจริงใน .env.local) การต่อ string ตรงๆ จะได้
// "http://host//api/..." (double slash) ซึ่ง Express ไม่ match เป็น route เดียวกัน ทำให้ fetch 404 เงียบๆ
// แล้วหน้า /community/[id] (server component) เรียก notFound() ทั้งหน้าเลย ไม่ใช่แค่รูปหาย
const BASE_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "")
    : "";

/** ค่าจริงจาก shops.merchant_type ตอนร้านสมัคร — ใช้แยก "ชุมชนช่างทอ" กับ "ร้านค้า/นักออกแบบ" บนหน้า /community */
export type MerchantType = "weaving_community" | "designer" | "retailer";

export interface LiveCommunity {
  id: string;
  name: string;
  province: string;
  image: string | null;
  rating: number;
  reviewCount: number;
  productCount: number;
  merchantType?: MerchantType;
}

export interface LiveCommunityDetail extends LiveCommunity {
  address: string | null;
  description: string | null;
}

export async function fetchCommunities(init?: RequestInit): Promise<LiveCommunity[]> {
  const res = await fetch(`${BASE_URL}/api/communities`, init);
  if (!res.ok) throw new Error(`GET /api/communities → ${res.status}`);
  return res.json();
}

export async function fetchCommunity(id: string, init?: RequestInit): Promise<LiveCommunityDetail | null> {
  const res = await fetch(`${BASE_URL}/api/communities/${id}`, init);
  if (!res.ok) return null;
  return res.json();
}
