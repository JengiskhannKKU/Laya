"use client";

/**
 * Hook โหลดสินค้าพร้อมขายจริงจาก backend — แชร์ผลลัพธ์ผ่าน module-level cache
 * (หลาย section บนหน้าเดียวกัน fetch ครั้งเดียว)
 */

import { useEffect, useState } from "react";
import { fetchLiveProducts, type Product } from "./live-products";

let cache: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

async function loadOnce(): Promise<Product[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetchLiveProducts()
      .then((list) => {
        cache = list;
        return list;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useLiveProducts(): { products: Product[]; loading: boolean; error: boolean } {
  const [live, setLive] = useState<Product[] | null>(cache);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cache) { setLive(cache); return; }
    let cancelled = false;
    loadOnce()
      .then((list) => { if (!cancelled) setLive(list); })
      .catch(() => { if (!cancelled) { setLive([]); setError(true); } });
    return () => { cancelled = true; };
  }, []);

  return { products: live ?? [], loading: live === null, error };
}
