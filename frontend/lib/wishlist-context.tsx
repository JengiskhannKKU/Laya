"use client";

/**
 * รายการโปรด (wishlist) จริง — ดึง/บันทึกผ่าน /api/wishlist (backend/src/routes/wishlist.ts)
 * เก็บแค่ product_id set ไว้เช็คสถานะหัวใจได้ทั่วแอป (ProductCard, ProductDetailView, ฯลฯ)
 * ตัวรายการเต็ม (พร้อมรูป/ราคา) ดึงแยกในหน้า /wishlist เอง
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { authFetch } from "./api-auth";

interface WishlistContextType {
  wishlistIds: Set<string>;
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  refresh: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchIds = useCallback(async () => {
    if (!session?.access_token) { setWishlistIds(new Set()); setLoading(false); return; }
    try {
      const res = await authFetch(`${API_BASE}/api/wishlist/ids`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setWishlistIds(new Set(data as string[]));
    } catch {
      setWishlistIds(new Set());
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  useEffect(() => { fetchIds(); }, [fetchIds]);

  const isWishlisted = (productId: string) => wishlistIds.has(productId);

  const toggle = async (productId: string) => {
    const alreadyIn = wishlistIds.has(productId);

    // optimistic update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (alreadyIn) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      const res = alreadyIn
        ? await authFetch(`${API_BASE}/api/wishlist/${productId}`, { method: "DELETE" })
        : await authFetch(`${API_BASE}/api/wishlist`, { method: "POST", body: JSON.stringify({ productId }) });
      if (!res.ok) throw new Error();
    } catch {
      // ผิดพลาด — ย้อนกลับสถานะเดิม
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (alreadyIn) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, loading, isWishlisted, toggle, refresh: fetchIds }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
