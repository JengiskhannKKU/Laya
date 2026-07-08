"use client";

/**
 * Hook โหลดสินค้าพร้อมขายจริงจาก backend (fallback เป็น mock เมื่อ backend ไม่พร้อม)
 * แชร์ผลลัพธ์ผ่าน module-level cache — หลาย section บนหน้าเดียวกัน fetch ครั้งเดียว
 */

import { useEffect, useState } from "react";
import { products as mockProducts, type Product } from "./mock-data";
import { fetchLiveProducts } from "./live-products";

let cache: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

async function loadOnce(): Promise<Product[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetchLiveProducts()
      .then((list) => {
        if (list.length) cache = list;
        return list;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useLiveProducts(): { products: Product[]; isLive: boolean } {
  const [live, setLive] = useState<Product[] | null>(cache);

  useEffect(() => {
    if (cache) { setLive(cache); return; }
    let cancelled = false;
    loadOnce()
      .then((list) => { if (!cancelled && list.length) setLive(list); })
      .catch(() => { /* backend ไม่พร้อม — ใช้ mock ต่อไป */ });
    return () => { cancelled = true; };
  }, []);

  return live && live.length
    ? { products: live, isLive: true }
    : { products: mockProducts, isLive: false };
}
