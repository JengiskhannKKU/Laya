/**
 * ชนิดข้อมูลที่ใช้ร่วมกันในโฟลว์ Custom Design ตั้งแต่ขั้น Weaver Matching ไปจนถึงคำขอสั่งทอ
 * มาจาก response จริงของ backend เท่านั้น (GET /api/shops/match, POST/GET /api/weaving-requests)
 * ไม่ใช่ mock — ดู backend/src/routes/shops.ts และ backend/src/routes/weaving-requests.ts
 */

/** แถวหนึ่งจาก GET /api/shops/match — ร้าน/ชุมชนทอผ้าจริงที่เปิดรับบริการทอ */
export interface ShopMatch {
  id: string;
  name: string;
  description: string | null;
  province: string | null;
  profileImageUrl: string | null;
  rating: number;
  reviewCount: number;
  specialties: string[];
  matchScore: number;
}

/** แถวหนึ่งจาก POST/GET /api/weaving-requests */
export interface WeavingRequestResult {
  id: string;
  shopId: string;
  shopName: string;
  shopProvince: string | null;
  shopProfileImageUrl: string | null;
  patternId: string | null;
  patternImageUrl: string | null;
  note: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
