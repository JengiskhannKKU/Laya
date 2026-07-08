/**
 * สินค้าพร้อมขายจริงจาก backend (`GET /api/products` — ตาราง products)
 * map ให้เข้ากับ Product shape เดิมของ frontend เพื่อใช้ร่วมกับ ProductCard/DetailView ได้ทันที
 * ใช้ได้ทั้ง server component (product/[id]) และ client hook (use-live-products)
 */

import type { Product } from "./mock-data";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface LiveProduct {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  priceUnit: string;
  stock: number;
  images: string[];
  fabricType: string | null;
  hasGI: boolean;
  shopId: string;
  shopName: string;
  province: string;
  rating: number;
  reviewCount: number;
}

/** แปลงสินค้าจริงจาก backend ให้เข้ากับ Product shape เดิม (ready-made เท่านั้น — isCustomizable: false) */
export function mapLiveProduct(p: LiveProduct): Product {
  return {
    id: p.id,
    name: p.name,
    community: p.shopName,
    province: p.province,
    price: p.price,
    priceUnit: p.priceUnit,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: p.images.length ? p.images : ["/placeholder.webp"],
    hasGI: p.hasGI,
    productionTime: "พร้อมส่ง",
    availableLength: p.stock,
    fabricType: p.fabricType ?? p.category,
    story: p.description ?? "",
    weaverName: p.shopName,
    certificateId: "",
    isCustomizable: false,
    isLive: true,
    shopId: p.shopId,
    category: p.category,
  };
}

export interface LiveProductFilters {
  category?: string;
  province?: string;
  search?: string;
  shopId?: string;
}

export async function fetchLiveProducts(filters?: LiveProductFilters, init?: RequestInit): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (filters?.category) qs.set("category", filters.category);
  if (filters?.province) qs.set("province", filters.province);
  if (filters?.search) qs.set("search", filters.search);
  if (filters?.shopId) qs.set("shopId", filters.shopId);
  const query = qs.toString();
  const res = await fetch(`${API_BASE}/api/products${query ? `?${query}` : ""}`, init);
  if (!res.ok) throw new Error(`GET /api/products → ${res.status}`);
  const data = (await res.json()) as LiveProduct[];
  return data.map(mapLiveProduct);
}

export async function fetchLiveProduct(id: string, init?: RequestInit): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, init);
  if (!res.ok) return null;
  return mapLiveProduct((await res.json()) as LiveProduct);
}
