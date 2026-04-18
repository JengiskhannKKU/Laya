/**
 * Typed API client for the Laya backend.
 * Uses NEXT_PUBLIC_API_URL env var (defaults to http://localhost:5000).
 */

import type {
  Product,
  Category,
  Banner,
  Community,
  Order,
  AIGenerateRequest,
  AIGenerateResponse,
} from "./types";

export type { Product, Category, Banner, Community, Order, AIGenerateRequest, AIGenerateResponse };

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Products ──────────────────────────────────────────────────────────────────
export interface ProductFilters {
  fabricType?: string;
  hasGI?: boolean;
  province?: string;
  search?: string;
}

export function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.fabricType) params.set("fabricType", filters.fabricType);
  if (filters?.hasGI !== undefined) params.set("hasGI", String(filters.hasGI));
  if (filters?.province) params.set("province", filters.province);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  return fetchJSON<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(id: string): Promise<Product> {
  return fetchJSON<Product>(`/api/products/${id}`);
}

// ── Categories ────────────────────────────────────────────────────────────────
export function getCategories(): Promise<Category[]> {
  return fetchJSON<Category[]>("/api/categories");
}

// ── Banners ───────────────────────────────────────────────────────────────────
export function getBanners(): Promise<Banner[]> {
  return fetchJSON<Banner[]>("/api/banners");
}

// ── Communities ───────────────────────────────────────────────────────────────
export function getCommunities(): Promise<Community[]> {
  return fetchJSON<Community[]>("/api/communities");
}

// ── Orders ────────────────────────────────────────────────────────────────────
export function getOrders(userId?: string): Promise<Order[]> {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return fetchJSON<Order[]>(`/api/orders${qs}`);
}

export function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> {
  return fetchJSON<Order>("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── AI Pattern Generation ─────────────────────────────────────────────────────
export function generatePattern(
  request: AIGenerateRequest
): Promise<AIGenerateResponse> {
  return fetchJSON<AIGenerateResponse>("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
