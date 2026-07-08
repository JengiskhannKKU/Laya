/**
 * ตะกร้าสินค้า — เก็บฝั่ง client (localStorage) เฉพาะสินค้าพร้อมขาย (ไม่ต้องสั่งตัด/custom)
 * ราคา/สต็อกที่แสดงเป็น snapshot ตอนเพิ่มลงตะกร้า — backend จะตรวจสอบราคา/สต็อกจริงอีกครั้งตอน checkout
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProductSnapshot {
  id: string;
  name: string;
  image: string | null;
  price: number;
  priceUnit: string;
  shopName: string;
  stock: number;
}

export interface CartLine {
  productId: string;
  quantity: number;
  product: CartProductSnapshot;
}

interface CartStore {
  items: CartLine[];
  addItem: (product: CartProductSnapshot, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (existing) {
          const nextQty = Math.min(product.stock || 99, existing.quantity + quantity);
          set({ items: items.map((i) => (i.productId === product.id ? { ...i, quantity: nextQty, product } : i)) });
        } else {
          set({ items: [...items, { productId: product.id, quantity: Math.max(1, quantity), product }] });
        }
      },

      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) { get().removeItem(productId); return; }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, i.product.stock || 99) } : i
          ),
        });
      },

      clear: () => set({ items: [] }),
    }),
    { name: "laya-cart-v1" }
  )
);

export function cartSubtotal(items: CartLine[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}
