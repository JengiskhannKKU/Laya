/**
 * ตะกร้าสินค้า — เก็บฝั่ง client (localStorage) เฉพาะสินค้าพร้อมขาย (ไม่ต้องสั่งตัด/custom)
 * ราคา/สต็อกที่แสดงเป็น snapshot ตอนเพิ่มลงตะกร้า — backend จะตรวจสอบราคา/สต็อกจริงอีกครั้งตอน checkout
 * รองรับ Multi-SKU: สินค้าที่มีหลายตัวเลือก (สี/ไซซ์) แยกบรรทัดตาม variantId
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
  /** SKU ที่เลือก — undefined สำหรับสินค้าที่ไม่มีตัวเลือก */
  variantId?: string;
  /** ป้ายตัวเลือกไว้แสดงผล เช่น "สีแดง · M" */
  variantLabel?: string;
  quantity: number;
  product: CartProductSnapshot;
}

/** คีย์ประจำบรรทัดตะกร้า — สินค้าเดียวกันคนละ SKU ถือเป็นคนละบรรทัด */
export function cartLineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

interface CartStore {
  items: CartLine[];
  addItem: (product: CartProductSnapshot, quantity?: number, variant?: { id: string; label: string }) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variant) => {
        const items = get().items;
        const key = cartLineKey(product.id, variant?.id);
        const existing = items.find((i) => cartLineKey(i.productId, i.variantId) === key);
        if (existing) {
          const nextQty = Math.min(product.stock || 99, existing.quantity + quantity);
          set({
            items: items.map((i) =>
              cartLineKey(i.productId, i.variantId) === key
                ? { ...i, quantity: nextQty, product, variantLabel: variant?.label ?? i.variantLabel }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { productId: product.id, variantId: variant?.id, variantLabel: variant?.label, quantity: Math.max(1, quantity), product },
            ],
          });
        }
      },

      removeItem: (lineKey) =>
        set({ items: get().items.filter((i) => cartLineKey(i.productId, i.variantId) !== lineKey) }),

      updateQuantity: (lineKey, quantity) => {
        if (quantity < 1) { get().removeItem(lineKey); return; }
        set({
          items: get().items.map((i) =>
            cartLineKey(i.productId, i.variantId) === lineKey
              ? { ...i, quantity: Math.min(quantity, i.product.stock || 99) }
              : i
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
