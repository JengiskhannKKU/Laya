/**
 * Unit tests — mapping สินค้าจาก backend + ป้ายกำกับ SKU
 */
import { describe, expect, it } from "vitest";
import { mapLiveProduct, variantLabel, type LiveProduct, type ProductVariant } from "@/lib/live-products";

const baseLive: LiveProduct = {
  id: "p1",
  name: "ผ้าไหม",
  description: "เรื่องราว",
  category: "fabric",
  price: 100,
  priceUnit: "ผืน",
  stock: 9,
  images: [],
  fabricType: "ไหม",
  hasGI: false,
  shopId: "s1",
  shopName: "ร้าน",
  province: "น่าน",
  rating: 4.5,
  reviewCount: 2,
};

const v = (over: Partial<ProductVariant>): ProductVariant => ({
  id: "v1", productId: "p1", sku: null, color: null, size: null,
  pattern: null, length: null, material: null, price: 100, stock: 1, ...over,
});

describe("variantLabel", () => {
  it("ต่อ attribute ที่มีค่าด้วย ' · '", () => {
    expect(variantLabel(v({ color: "แดง", size: "M" }))).toBe("แดง · M");
    expect(variantLabel(v({ color: "คราม", material: "ฝ้าย" }))).toBe("คราม · ฝ้าย");
  });

  it("ไม่มี attribute เลย fallback เป็น sku แล้วค่อย 'ตัวเลือก'", () => {
    expect(variantLabel(v({ sku: "SKU-01" }))).toBe("SKU-01");
    expect(variantLabel(v({}))).toBe("ตัวเลือก");
  });
});

describe("mapLiveProduct", () => {
  it("สินค้าไม่มี SKU — ใช้ราคา/สต็อกสินค้าหลักตามเดิม", () => {
    const p = mapLiveProduct(baseLive);
    expect(p.price).toBe(100);
    expect(p.availableLength).toBe(9);
    expect(p.hasVariants).toBe(false);
  });

  it("สินค้ามี SKU — ราคาเริ่มต้น = priceMin, สต็อก = stockTotal", () => {
    const p = mapLiveProduct({ ...baseLive, hasVariants: true, priceMin: 150, priceMax: 180, stockTotal: 7 });
    expect(p.price).toBe(150);
    expect(p.priceMax).toBe(180);
    expect(p.availableLength).toBe(7);
    expect(p.hasVariants).toBe(true);
  });

  it("สินค้ามี SKU แบบหน้า detail (มี variants array) — สต็อกรวมจาก variants", () => {
    const variants = [v({ id: "a", price: 150, stock: 5 }), v({ id: "b", price: 180, stock: 2 })];
    const p = mapLiveProduct({ ...baseLive, hasVariants: true, variants, priceMin: 150, priceMax: 180 });
    expect(p.variants).toHaveLength(2);
    expect(p.availableLength).toBe(7);
  });

  it("รูปว่าง fallback เป็น placeholder", () => {
    expect(mapLiveProduct(baseLive).images).toEqual(["/placeholder.webp"]);
  });
});
