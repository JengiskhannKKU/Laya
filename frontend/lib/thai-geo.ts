/**
 * ข้อมูลจังหวัด/อำเภอ/ตำบลไทยจริง (77 จังหวัด, 930 อำเภอ, 7,452 ตำบล + รหัสไปรษณีย์)
 * ที่มา: kongvut/thai-province-data (ข้อมูลราชการ) — เก็บเป็น static JSON ที่ /public/thai-geo
 * เพื่อไม่ให้ไปรวมอยู่ใน JS bundle (~600KB) โหลดแบบ lazy fetch ตอนต้องใช้จริงเท่านั้น
 */

export interface ThaiProvince { id: number; th: string }
export interface ThaiDistrict { id: number; th: string; provinceId: number }
export interface ThaiSubdistrict { id: number; th: string; districtId: number; zip: number }

interface GeoCache {
  provinces: ThaiProvince[];
  districts: ThaiDistrict[];
  subdistricts: ThaiSubdistrict[];
}

let cache: GeoCache | null = null;
let inflight: Promise<GeoCache> | null = null;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`โหลดข้อมูล ${path} ไม่สำเร็จ`);
  return res.json() as Promise<T>;
}

/** โหลดข้อมูลจังหวัด/อำเภอ/ตำบลทั้งหมด (cache ไว้ในหน่วยความจำหลังโหลดครั้งแรก) */
export async function loadThaiGeo(): Promise<GeoCache> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = Promise.all([
    fetchJson<ThaiProvince[]>("/thai-geo/provinces.json"),
    fetchJson<ThaiDistrict[]>("/thai-geo/districts.json"),
    fetchJson<ThaiSubdistrict[]>("/thai-geo/subdistricts.json"),
  ]).then(([provinces, districts, subdistricts]) => {
    cache = {
      provinces: [...provinces].sort((a, b) => a.th.localeCompare(b.th, "th")),
      districts,
      subdistricts,
    };
    return cache;
  });

  return inflight;
}

export function districtsOf(geo: GeoCache, provinceId: number): ThaiDistrict[] {
  return geo.districts
    .filter((d) => d.provinceId === provinceId)
    .sort((a, b) => a.th.localeCompare(b.th, "th"));
}

export function subdistrictsOf(geo: GeoCache, districtId: number): ThaiSubdistrict[] {
  return geo.subdistricts
    .filter((s) => s.districtId === districtId)
    .sort((a, b) => a.th.localeCompare(b.th, "th"));
}
