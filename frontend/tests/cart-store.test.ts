/**
 * Unit tests — ตะกร้าสินค้า (Multi-SKU): แยกบรรทัดตาม variant, รวมจำนวนเมื่อเพิ่มซ้ำ,
 * clamp ตามสต็อก, ลบ/แก้จำนวนด้วย lineKey — รันด้วย `npm test` (vitest)
 */
import { beforeEach, describe, expect, it } from "vitest";

// zustand persist ต้องมี localStorage — สร้าง stub ก่อน import store
const storage = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, v),
  removeItem: (k: string) => void storage.delete(k),
  clear: () => storage.clear(),
  key: (i: number) => [...storage.keys()][i] ?? null,
  get length() { return storage.size; },
} as Storage;

const { useCartStore, cartLineKey, cartSubtotal } = await import("@/lib/cart-store");

const snapshot = (over: Partial<Parameters<typeof useCartStore.getState>[0]> & { id?: string; price?: number; stock?: number } = {}) => ({
  id: "prod-1",
  name: "ผ้าทดสอบ",
  image: null,
  price: 150,
  priceUnit: "ผืน",
  shopName: "ร้านทดสอบ",
  stock: 5,
  ...over,
});

describe("cart-store (multi-SKU)", () => {
  beforeEach(() => useCartStore.getState().clear());

  it("สินค้าเดียวกันคนละ SKU แยกเป็นคนละบรรทัด", () => {
    const { addItem } = useCartStore.getState();
    addItem(snapshot({ price: 150 }), 1, { id: "v-red", label: "แดง · M" });
    addItem(snapshot({ price: 180 }), 1, { id: "v-blue", label: "น้ำเงิน · L" });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.variantLabel)).toEqual(["แดง · M", "น้ำเงิน · L"]);
  });

  it("เพิ่ม SKU เดิมซ้ำ → รวมจำนวนในบรรทัดเดิม", () => {
    const { addItem } = useCartStore.getState();
    addItem(snapshot(), 1, { id: "v-red", label: "แดง · M" });
    addItem(snapshot(), 2, { id: "v-red", label: "แดง · M" });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it("จำนวนถูก clamp ไม่เกินสต็อกของ SKU", () => {
    const { addItem } = useCartStore.getState();
    addItem(snapshot({ stock: 3 }), 2, { id: "v-red", label: "แดง · M" });
    addItem(snapshot({ stock: 3 }), 5, { id: "v-red", label: "แดง · M" });
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("updateQuantity / removeItem ทำงานตาม lineKey ของ SKU นั้นๆ", () => {
    const { addItem } = useCartStore.getState();
    addItem(snapshot(), 1, { id: "v-red", label: "แดง · M" });
    addItem(snapshot(), 1, { id: "v-blue", label: "น้ำเงิน · L" });

    const redKey = cartLineKey("prod-1", "v-red");
    useCartStore.getState().updateQuantity(redKey, 4);
    expect(useCartStore.getState().items.find((i) => i.variantId === "v-red")!.quantity).toBe(4);

    useCartStore.getState().removeItem(redKey);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe("v-blue");
  });

  it("updateQuantity เหลือ 0 → ลบบรรทัดออก", () => {
    const { addItem } = useCartStore.getState();
    addItem(snapshot(), 2, { id: "v-red", label: "แดง · M" });
    useCartStore.getState().updateQuantity(cartLineKey("prod-1", "v-red"), 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("สินค้าไม่มี SKU ใช้ productId เป็น lineKey (backward compatible)", () => {
    const { addItem } = useCartStore.getState();
    addItem(snapshot(), 2);
    expect(cartLineKey("prod-1")).toBe("prod-1");
    useCartStore.getState().updateQuantity("prod-1", 3);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
    expect(useCartStore.getState().items[0].variantId).toBeUndefined();
  });

  it("cartSubtotal รวมราคาตาม snapshot ของแต่ละบรรทัด", () => {
    const { addItem } = useCartStore.getState();
    addItem(snapshot({ price: 150 }), 2, { id: "v-red", label: "แดง · M" });
    addItem(snapshot({ price: 180 }), 1, { id: "v-blue", label: "น้ำเงิน · L" });
    expect(cartSubtotal(useCartStore.getState().items)).toBe(480);
  });
});
