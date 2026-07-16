/**
 * ออเดอร์ของลูกค้าจริงจาก backend — มี 3 ประเภท ที่ shape/สถานะไม่ตรงกัน:
 *  - tailor  : GET /api/orders          (ตัดเสื้อจากผ้าร้าน)
 *  - product : GET /api/product-orders  (สินค้าพร้อมขายจากตะกร้า, คนละแถวต่อร้าน)
 *  - weaving : GET /api/weaving-orders  (สั่งทอผ้าตามลาย)
 * รวม normalize เป็นชนิดเดียวสำหรับหน้ารายการ "คำสั่งซื้อของฉัน"
 */

import { authFetch } from "./api-auth";

// เบราว์เซอร์ใช้ path สัมพัทธ์เสมอ (proxy ผ่าน next.config.mjs / nginx) — server ใช้ absolute URL
// (บั๊กเดิม: absolute URL ตรงๆ ทุกที่ ทำให้เบราว์เซอร์ผู้ใช้จริงบน production fetch fail เงียบๆ)
// ตัด trailing slash เสมอ — กัน double slash ทำให้ fetch 404 เงียบๆ (ดูรายละเอียดใน lib/communities.ts)
export const API_BASE =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "")
    : "";

export type OrderType = "tailor" | "product" | "weaving";

export interface OrderSummary {
  id: string;
  type: OrderType;
  shopName: string;
  summary: string;
  status: string;
  statusLabel: string;
  total: number;
  createdAt: string;
  cancellable: boolean;
}

const TAILOR_STATUS_LABELS: Record<string, string> = {
  draft: "ร่างคำสั่งซื้อ",
  pending_confirm: "รอร้านยืนยัน",
  confirmed: "ร้านยืนยันแล้ว",
  in_progress: "กำลังตัดเย็บ",
  ready: "ตัดเสร็จแล้ว พร้อมจัดส่ง",
  shipped: "จัดส่งแล้ว",
  delivered: "จัดส่งสำเร็จ",
  cancelled: "ยกเลิกแล้ว",
};

const PRODUCT_STATUS_LABELS: Record<string, string> = {
  draft: "ร่างคำสั่งซื้อ",
  pending_confirm: "รอร้านยืนยัน",
  confirmed: "ร้านยืนยันแล้ว",
  in_progress: "กำลังเตรียมสินค้า",
  ready: "แพ็คสินค้าเสร็จแล้ว พร้อมจัดส่ง",
  shipped: "จัดส่งแล้ว",
  delivered: "จัดส่งสำเร็จ",
  cancelled: "ยกเลิกแล้ว",
};

const WEAVING_STATUS_LABELS: Record<string, string> = {
  pending_confirm: "รอร้านยืนยัน",
  confirmed: "ร้านยืนยันแล้ว",
  weaving: "กำลังทอผ้า",
  ready: "ทอเสร็จแล้ว พร้อมจัดส่ง",
  shipped: "จัดส่งแล้ว",
  delivered: "จัดส่งสำเร็จ",
  cancelled: "ยกเลิกแล้ว",
};

interface TailorOrderRow {
  id: string;
  shopId: string;
  shopName: string | null;
  status: string;
  fabricName: string | null;
  finalPrice: number | null;
  estimatedPrice: number | null;
  createdAt: string;
}

interface ProductOrderRow {
  id: string;
  shopId: string;
  shopName: string | null;
  status: string;
  total: number;
  createdAt: string;
  items: { productName: string; quantity: number }[];
}

interface WeavingOrderRow {
  id: string;
  shopId: string;
  shopName: string | null;
  status: string;
  patternName: string | null;
  metersRequested: number;
  finalPrice: number | null;
  estimatedPrice: number | null;
  createdAt: string;
}

export async function fetchTailorOrders(): Promise<OrderSummary[]> {
  const res = await authFetch(`${API_BASE}/api/orders`);
  if (!res.ok) return [];
  const rows = (await res.json()) as TailorOrderRow[];
  return rows.map((o) => ({
    id: o.id,
    type: "tailor" as const,
    shopName: o.shopName ?? "ร้านค้า",
    summary: o.fabricName ? `ตัดเสื้อจากผ้า ${o.fabricName}` : "ตัดเสื้อสั่งทำ",
    status: o.status,
    statusLabel: TAILOR_STATUS_LABELS[o.status] ?? o.status,
    total: o.finalPrice ?? o.estimatedPrice ?? 0,
    createdAt: o.createdAt,
    cancellable: ["draft", "pending_confirm"].includes(o.status),
  }));
}

export async function fetchProductOrders(): Promise<OrderSummary[]> {
  const res = await authFetch(`${API_BASE}/api/product-orders`);
  if (!res.ok) return [];
  const rows = (await res.json()) as ProductOrderRow[];
  return rows.map((o) => ({
    id: o.id,
    type: "product" as const,
    shopName: o.shopName ?? "ร้านค้า",
    summary: o.items.length
      ? `${o.items[0].productName}${o.items.length > 1 ? ` และอีก ${o.items.length - 1} รายการ` : ""}`
      : "สินค้าพร้อมขาย",
    status: o.status,
    statusLabel: PRODUCT_STATUS_LABELS[o.status] ?? o.status,
    total: o.total,
    createdAt: o.createdAt,
    cancellable: ["draft", "pending_confirm"].includes(o.status),
  }));
}

export async function fetchWeavingOrders(): Promise<OrderSummary[]> {
  const res = await authFetch(`${API_BASE}/api/weaving-orders`);
  if (!res.ok) return [];
  const rows = (await res.json()) as WeavingOrderRow[];
  return rows.map((o) => ({
    id: o.id,
    type: "weaving" as const,
    shopName: o.shopName ?? "ร้านทอผ้า",
    summary: `สั่งทอ${o.patternName ? ` ลาย${o.patternName}` : "ผ้า"} ${o.metersRequested} เมตร`,
    status: o.status,
    statusLabel: WEAVING_STATUS_LABELS[o.status] ?? o.status,
    total: o.finalPrice ?? o.estimatedPrice ?? 0,
    createdAt: o.createdAt,
    cancellable: o.status === "pending_confirm",
  }));
}

/** รวมออเดอร์ทั้ง 3 ประเภท เรียงตามวันที่ล่าสุดก่อน */
export async function fetchAllOrders(): Promise<OrderSummary[]> {
  const [tailor, product, weaving] = await Promise.all([
    fetchTailorOrders().catch(() => []),
    fetchProductOrders().catch(() => []),
    fetchWeavingOrders().catch(() => []),
  ]);
  return [...tailor, ...product, ...weaving].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function detailHref(order: Pick<OrderSummary, "type" | "id">): string {
  // /orders/product/[groupId]/success กินชื่อ segment "product" ไปแล้ว (checkout flow เดิม)
  // ออเดอร์สินค้ารายร้านเดี่ยวๆ จึงใช้เส้นทาง /orders/product-order/[id] แยกกัน กันชนกัน
  const path = order.type === "product" ? "product-order" : order.type;
  return `/orders/${path}/${order.id}`;
}

export interface StatusLog {
  oldStatus: string | null;
  newStatus: string;
  note: string | null;
  createdAt: string;
}

interface TailorOrderDetail extends TailorOrderRow {
  fabricColor: string | null;
  specialInstructions: string | null;
  statusLogs: { old_status: string | null; new_status: string; note: string | null; created_at: string }[];
}

interface ProductOrderDetail extends ProductOrderRow {
  shippingAddress: {
    recipientName: string; phone: string; addressLine1: string; subdistrict: string;
    district: string; province: string; postalCode: string; note: string | null;
  };
  subtotal: number;
  shippingFee: number;
  items: { productName: string; productImage: string | null; variantLabel: string | null; quantity: number; unitPrice: number; subtotal: number }[];
  statusLogs: { old_status: string | null; new_status: string; note: string | null; created_at: string }[];
  /** สถานะขนส่งละเอียด (pending/picked_up/in_transit/delivered/failed/returned) — null ถ้ายังไม่เข้าขั้นจัดส่ง */
  shippingStatus: string | null;
  shippingLogs: { old_status: string | null; new_status: string; note: string | null; created_at: string }[];
  trackingNo: string | null;
  courier: string | null;
}

interface WeavingOrderDetail extends WeavingOrderRow {
  colorName: string | null;
  widthCm: number | null;
  specialInstructions: string | null;
  statusLogs: { old_status: string | null; new_status: string; note: string | null; created_at: string }[];
}

function mapLogs(logs: { old_status: string | null; new_status: string; note: string | null; created_at: string }[]): StatusLog[] {
  return logs.map((l) => ({ oldStatus: l.old_status, newStatus: l.new_status, note: l.note, createdAt: l.created_at }));
}

export async function fetchTailorOrderDetail(id: string) {
  const res = await authFetch(`${API_BASE}/api/orders/${id}`);
  if (!res.ok) return null;
  const o = (await res.json()) as TailorOrderDetail;
  return {
    ...o,
    statusLabel: TAILOR_STATUS_LABELS[o.status] ?? o.status,
    statusLogs: mapLogs(o.statusLogs ?? []),
    cancellable: ["draft", "pending_confirm"].includes(o.status),
  };
}

export async function fetchProductOrderDetail(id: string) {
  const res = await authFetch(`${API_BASE}/api/product-orders/${id}`);
  if (!res.ok) return null;
  const o = (await res.json()) as ProductOrderDetail;
  return {
    ...o,
    statusLabel: PRODUCT_STATUS_LABELS[o.status] ?? o.status,
    statusLogs: mapLogs(o.statusLogs ?? []),
    shippingLogs: mapLogs(o.shippingLogs ?? []),
    cancellable: ["draft", "pending_confirm"].includes(o.status),
  };
}

export async function fetchWeavingOrderDetail(id: string) {
  const res = await authFetch(`${API_BASE}/api/weaving-orders/${id}`);
  if (!res.ok) return null;
  const o = (await res.json()) as WeavingOrderDetail;
  return {
    ...o,
    statusLabel: WEAVING_STATUS_LABELS[o.status] ?? o.status,
    statusLogs: mapLogs(o.statusLogs ?? []),
    cancellable: o.status === "pending_confirm",
  };
}

export async function cancelOrder(type: OrderType, id: string): Promise<void> {
  const path = type === "tailor" ? "orders" : type === "product" ? "product-orders" : "weaving-orders";
  const res = await authFetch(`${API_BASE}/api/${path}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "cancelled" }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "ยกเลิกคำสั่งซื้อไม่สำเร็จ");
  }
}
