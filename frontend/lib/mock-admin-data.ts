/**
 * Mock data for Admin Dashboard analytics and management
 */

// ─── Revenue Data ──────────────────────────────────────────────
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export const mockDailyRevenue: RevenueDataPoint[] = [
  { date: "1 ธ.ค.", revenue: 45200, orders: 18, avgOrderValue: 2511 },
  { date: "2 ธ.ค.", revenue: 32100, orders: 12, avgOrderValue: 2675 },
  { date: "3 ธ.ค.", revenue: 68500, orders: 28, avgOrderValue: 2446 },
  { date: "4 ธ.ค.", revenue: 51800, orders: 22, avgOrderValue: 2354 },
  { date: "5 ธ.ค.", revenue: 89300, orders: 35, avgOrderValue: 2551 },
  { date: "6 ธ.ค.", revenue: 42600, orders: 19, avgOrderValue: 2242 },
  { date: "7 ธ.ค.", revenue: 73400, orders: 31, avgOrderValue: 2367 },
  { date: "8 ธ.ค.", revenue: 95100, orders: 40, avgOrderValue: 2377 },
  { date: "9 ธ.ค.", revenue: 61200, orders: 25, avgOrderValue: 2448 },
  { date: "10 ธ.ค.", revenue: 78900, orders: 33, avgOrderValue: 2390 },
  { date: "11 ธ.ค.", revenue: 55400, orders: 24, avgOrderValue: 2308 },
  { date: "12 ธ.ค.", revenue: 102300, orders: 42, avgOrderValue: 2435 },
  { date: "13 ธ.ค.", revenue: 84600, orders: 36, avgOrderValue: 2350 },
  { date: "14 ธ.ค.", revenue: 67800, orders: 29, avgOrderValue: 2338 },
];

export const mockMonthlyRevenue = [
  { month: "ม.ค.", revenue: 1250000, orders: 520 },
  { month: "ก.พ.", revenue: 1480000, orders: 610 },
  { month: "มี.ค.", revenue: 1320000, orders: 550 },
  { month: "เม.ย.", revenue: 1650000, orders: 680 },
  { month: "พ.ค.", revenue: 1890000, orders: 780 },
  { month: "มิ.ย.", revenue: 2100000, orders: 850 },
  { month: "ก.ค.", revenue: 1950000, orders: 810 },
  { month: "ส.ค.", revenue: 2340000, orders: 960 },
  { month: "ก.ย.", revenue: 2560000, orders: 1050 },
  { month: "ต.ค.", revenue: 2780000, orders: 1130 },
  { month: "พ.ย.", revenue: 3120000, orders: 1280 },
  { month: "ธ.ค.", revenue: 3450000, orders: 1400 },
];

// ─── KPI Summary ───────────────────────────────────────────────
export interface KPISummary {
  label: string;
  value: string;
  change: number; // percentage
  trend: "up" | "down" | "neutral";
  icon: "revenue" | "orders" | "users" | "aov" | "conversion" | "ai";
}

export const mockKPIs: KPISummary[] = [
  { label: "GMV", value: "฿3.45M", change: 12.5, trend: "up", icon: "revenue" },
  { label: "คำสั่งซื้อ", value: "1,400", change: 9.3, trend: "up", icon: "orders" },
  { label: "ผู้ใช้งาน", value: "8,520", change: 15.2, trend: "up", icon: "users" },
  { label: "AOV", value: "฿2,464", change: -2.1, trend: "down", icon: "aov" },
  { label: "Conversion", value: "3.8%", change: 0.3, trend: "up", icon: "conversion" },
  { label: "AI Design", value: "4,200", change: 28.5, trend: "up", icon: "ai" },
];

// ─── Order Funnel ──────────────────────────────────────────────
export const mockOrderFunnel = [
  { stage: "เข้าชมเว็บไซต์", count: 45000, color: "#1B2A4A" },
  { stage: "ดูสินค้า", count: 28000, color: "#2A3E6A" },
  { stage: "เพิ่มลงตะกร้า", count: 8400, color: "#3A5290" },
  { stage: "เริ่มชำระเงิน", count: 4200, color: "#C5A55A" },
  { stage: "ชำระสำเร็จ", count: 1710, color: "#05A546" },
];

// ─── Category Revenue ──────────────────────────────────────────
export const mockCategoryRevenue = [
  { name: "ผ้าผืน", value: 42, color: "#1B2A4A" },
  { name: "เสื้อผ้า", value: 28, color: "#C5A55A" },
  { name: "กระเป๋า", value: 15, color: "#3A5290" },
  { name: "ผ้าพันคอ", value: 8, color: "#D4BA7A" },
  { name: "ของตกแต่ง", value: 7, color: "#6B7280" },
];

// ─── Payment Method Mix ────────────────────────────────────────
export const mockPaymentMix = [
  { name: "PromptPay", value: 55, color: "#003399" },
  { name: "Credit Card", value: 25, color: "#1B2A4A" },
  { name: "LINE Pay", value: 12, color: "#06C755" },
  { name: "TrueMoney", value: 5, color: "#FF6600" },
  { name: "Bank Transfer", value: 3, color: "#9CA3AF" },
];

// ─── Province Sales Heatmap ────────────────────────────────────
export const mockProvinceSales = [
  { province: "กรุงเทพมหานคร", sales: 890000, orders: 365 },
  { province: "เชียงใหม่", sales: 420000, orders: 175 },
  { province: "ลำพูน", sales: 380000, orders: 158 },
  { province: "ขอนแก่น", sales: 310000, orders: 130 },
  { province: "สกลนคร", sales: 280000, orders: 115 },
  { province: "กาฬสินธุ์", sales: 250000, orders: 105 },
  { province: "ชัยภูมิ", sales: 210000, orders: 88 },
  { province: "นครราชสีมา", sales: 180000, orders: 75 },
  { province: "อุดรธานี", sales: 150000, orders: 63 },
  { province: "ราชบุรี", sales: 130000, orders: 54 },
];

// ─── Top Products ──────────────────────────────────────────────
export interface TopProduct {
  id: string;
  name: string;
  image: string;
  revenue: number;
  unitsSold: number;
  rating: number;
  community: string;
}

export const mockTopProducts: TopProduct[] = [
  { id: "1", name: "ผ้ายกลายกินรีหริภุญชัย", image: "/images/fabric1.webp", revenue: 540000, unitsSold: 300, rating: 4.8, community: "ชุมชนหริภุญชัย" },
  { id: "3", name: "ผ้าฝ้ายย้อมคราม", image: "/images/fabric4.webp", revenue: 450000, unitsSold: 300, rating: 4.9, community: "กลุ่มทอผ้าครามสกลนคร" },
  { id: "4", name: "ผ้าไหมแพรวา", image: "/images/fabric5.webp", revenue: 350000, unitsSold: 70, rating: 4.7, community: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว" },
  { id: "teenager1", name: "ชุดเซ็ตผ้าไหม 'วัยรุ่นเดอะ'", image: "/teenager1.webp", revenue: 409600, unitsSold: 128, rating: 4.9, community: "กลุ่มคนรุ่นใหม่หริภุญชัย" },
  { id: "2", name: "ผ้ามัดหมี่ลายนาคราช", image: "/images/fabric2.webp", revenue: 308000, unitsSold: 110, rating: 4.6, community: "กลุ่มทอผ้าบ้านเขว้า" },
];

// ─── Top Weavers ───────────────────────────────────────────────
export interface TopWeaver {
  id: string;
  name: string;
  avatar: string;
  province: string;
  revenue: number;
  orders: number;
  rating: number;
  completionRate: number;
}

export const mockTopWeavers: TopWeaver[] = [
  { id: "w1", name: "แม่สมจิตร ใจดี", avatar: "ส", province: "ลำพูน", revenue: 285000, orders: 84, rating: 4.9, completionRate: 98 },
  { id: "w3", name: "ป้าบุญส่ง ดวงดี", avatar: "บ", province: "สกลนคร", revenue: 216000, orders: 120, rating: 4.8, completionRate: 97 },
  { id: "w4", name: "คุณน้านภา ทอรัก", avatar: "น", province: "กาฬสินธุ์", revenue: 231000, orders: 42, rating: 5.0, completionRate: 100 },
  { id: "w2", name: "แม่ประนอม สีทอง", avatar: "ป", province: "ชัยภูมิ", revenue: 145600, orders: 52, rating: 4.7, completionRate: 94 },
];

// ─── AI Usage Analytics ────────────────────────────────────────
export const mockAIUsage = [
  { date: "1 ธ.ค.", generations: 120, successRate: 92 },
  { date: "2 ธ.ค.", generations: 95, successRate: 88 },
  { date: "3 ธ.ค.", generations: 180, successRate: 95 },
  { date: "4 ธ.ค.", generations: 145, successRate: 91 },
  { date: "5 ธ.ค.", generations: 210, successRate: 93 },
  { date: "6 ธ.ค.", generations: 88, successRate: 87 },
  { date: "7 ธ.ค.", generations: 165, successRate: 94 },
  { date: "8 ธ.ค.", generations: 230, successRate: 96 },
  { date: "9 ธ.ค.", generations: 150, successRate: 90 },
  { date: "10 ธ.ค.", generations: 195, successRate: 93 },
  { date: "11 ธ.ค.", generations: 140, successRate: 89 },
  { date: "12 ธ.ค.", generations: 260, successRate: 95 },
  { date: "13 ธ.ค.", generations: 200, successRate: 92 },
  { date: "14 ธ.ค.", generations: 175, successRate: 91 },
];

// ─── Recent Admin Orders ──────────────────────────────────────
export interface AdminOrderItem {
  id: string;
  name: string;
  type: string;
  weaver: string;
  qty: number;
  price: number;
  image: string;
}

export interface AdminOrderTimelineEvent {
  status: "pending" | "paid" | "producing" | "shipped" | "delivered" | "completed" | "cancelled";
  timestamp: string;
  description: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    fullAddress: string;
    province: string;
    zipCode: string;
  };
  items: AdminOrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "pending" | "paid" | "producing" | "shipped" | "delivered" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  paymentProof?: {
    image: string;
    amount: number;
    date: string;
  };
  shippingProvider?: string;
  trackingNumber?: string;
  timeline: AdminOrderTimelineEvent[];
  date: string;
  community: string;
}

export const mockAdminOrders: AdminOrder[] = [
  {
    id: "ORD-2024-1405", customerName: "สมชาย มั่นคง", customerPhone: "081-234-5678", customerEmail: "somchai@email.com",
    shippingAddress: { fullAddress: "123 หมู่ 4 ต.ในเมือง อ.เมือง", province: "เชียงใหม่", zipCode: "50000" },
    items: [
      { id: "i1", name: "ผ้าไหมมัดหมี่ลายนาคราช", type: "ผ้าไหม", weaver: "แม่สมจิตร ใจดี", qty: 2, price: 3500, image: "/images/fabric1.webp" },
      { id: "i2", name: "ผ้าฝ้ายย้อมคราม", type: "ผ้าฝ้าย", weaver: "ป้าบุญส่ง ดวงดี", qty: 1, price: 1500, image: "/images/fabric2.webp" },
    ],
    subtotal: 8500, shippingFee: 0, total: 8500,
    status: "pending", paymentStatus: "pending",
    paymentMethod: "PromptPay",
    paymentProof: { image: "/images/fabric4.webp", amount: 8500, date: "2024-12-14 10:30" }, // pending approval
    timeline: [
      { status: "pending", timestamp: "2024-12-14 10:00", description: "Order Created" },
    ],
    date: "2024-12-14", community: "ชุมชนหริภุญชัย"
  },
  {
    id: "ORD-2024-1404", customerName: "กานดา วรรณ", customerPhone: "089-876-5432", customerEmail: "kanda@email.com",
    shippingAddress: { fullAddress: "45/6 ซอยสุขุมวิท 63 แขวงคลองตันเหนือ เขตวัฒนา", province: "กรุงเทพมหานคร", zipCode: "10110" },
    items: [
      { id: "i3", name: "ผ้าแพรวาลายดอกจันทร์", type: "ผ้าไหมแพรวา", weaver: "คุณน้านภา ทอรัก", qty: 1, price: 5000, image: "/images/fabric5.webp" },
    ],
    subtotal: 5000, shippingFee: 0, total: 5000,
    status: "paid", paymentStatus: "paid",
    paymentMethod: "Credit Card",
    paymentProof: { image: "/images/fabric3.webp", amount: 5000, date: "2024-12-14 09:15" },
    timeline: [
      { status: "pending", timestamp: "2024-12-14 09:00", description: "Order Created" },
      { status: "paid", timestamp: "2024-12-14 09:15", description: "Payment Confirmed via Credit Card" },
    ],
    date: "2024-12-14", community: "กลุ่มทอผ้าแพรวา"
  },
  {
    id: "ORD-2024-1403", customerName: "Nadia Schmidt", customerPhone: "+49-123-456789", customerEmail: "nadia@email.com",
    shippingAddress: { fullAddress: "123 Alexanderplatz", province: "Berlin", zipCode: "10178" },
    items: [
      { id: "i4", name: "ผ้ายกลายกินรีหริภุญชัย", type: "ผ้าไหมยกดอก", weaver: "แม่สมจิตร ใจดี", qty: 2, price: 1800, image: "/images/fabric1.webp" },
    ],
    subtotal: 3600, shippingFee: 600, total: 4200,
    status: "producing", paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    paymentProof: { image: "/images/fabric2.webp", amount: 4200, date: "2024-12-13 14:00" },
    timeline: [
      { status: "pending", timestamp: "2024-12-13 10:00", description: "Order Created" },
      { status: "paid", timestamp: "2024-12-13 15:30", description: "Payment Confirmed by Admin" },
      { status: "producing", timestamp: "2024-12-14 08:00", description: "Weaver started production" },
    ],
    date: "2024-12-13", community: "ชุมชนหริภุญชัย"
  },
  {
    id: "ORD-2024-1402", customerName: "ประเสริฐ จันทร์", customerPhone: "082-345-6789", customerEmail: "prasert@email.com",
    shippingAddress: { fullAddress: "78 หมู่ 1 ต.แพ่ง อ.เมือง", province: "ชัยภูมิ", zipCode: "36000" },
    items: [
      { id: "i5", name: "ผ้าฝ้ายทอมือลายโบราณ", type: "ผ้าฝ้าย", weaver: "แม่ประนอม สีทอง", qty: 1, price: 2800, image: "/images/fabric4.webp" },
    ],
    subtotal: 2800, shippingFee: 0, total: 2800,
    status: "shipped", paymentStatus: "paid",
    paymentMethod: "PromptPay",
    paymentProof: { image: "/images/fabric3.webp", amount: 2800, date: "2024-12-12 11:20" },
    shippingProvider: "Flash Express", trackingNumber: "TH23456789F",
    timeline: [
      { status: "pending", timestamp: "2024-12-12 11:00", description: "Order Created" },
      { status: "paid", timestamp: "2024-12-12 11:30", description: "Payment Confirmed" },
      { status: "producing", timestamp: "2024-12-12 13:00", description: "In Production" },
      { status: "shipped", timestamp: "2024-12-14 16:45", description: "Parcel shipped via Flash Express (TH23456789F)" },
    ],
    date: "2024-12-12", community: "กลุ่มทอผ้าบ้านเขว้า"
  },
  {
    id: "ORD-2024-1401", customerName: "วิภา ศรีสุข", customerPhone: "085-678-9012", customerEmail: "wipa@email.com",
    shippingAddress: { fullAddress: "99/9 หมู่ 5 บ้านบึง", province: "ลำพูน", zipCode: "51000" },
    items: [
      { id: "i6", name: "ผ้าจกพิกุล", type: "ผ้าจก", weaver: "ป้าบุญส่ง ดวงดี", qty: 2, price: 2100, image: "/images/fabric5.webp" },
    ],
    subtotal: 4200, shippingFee: 0, total: 4200,
    status: "delivered", paymentStatus: "paid",
    paymentMethod: "Credit Card",
    paymentProof: { image: "/images/fabric1.webp", amount: 4200, date: "2024-12-11 09:10" },
    shippingProvider: "Kerry Express", trackingNumber: "KER12345678",
    timeline: [
      { status: "pending", timestamp: "2024-12-11 09:00", description: "Order Created" },
      { status: "paid", timestamp: "2024-12-11 09:11", description: "Payment Confirmed" },
      { status: "producing", timestamp: "2024-12-11 10:00", description: "In Production" },
      { status: "shipped", timestamp: "2024-12-12 14:00", description: "Shipped (KER12345678)" },
      { status: "delivered", timestamp: "2024-12-13 11:30", description: "Received by customer" },
    ],
    date: "2024-12-11", community: "สกลนคร"
  },
];

// ─── Admin Product List ────────────────────────────────────────
export interface AdminProduct {
  id: string;
  name: string;
  image: string;
  community: string;
  province: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "out_of_stock";
  hasGI: boolean;
  soldCount: number;
  rating: number;
}

export const mockAdminProducts: AdminProduct[] = [
  { id: "1", name: "ผ้ายกลายกินรีหริภุญชัย", image: "/images/fabric1.webp", community: "ชุมชนหริภุญชัย", province: "ลำพูน", price: 1800, stock: 20, status: "active", hasGI: true, soldCount: 300, rating: 4.8 },
  { id: "2", name: "ผ้ามัดหมี่ลายนาคราช", image: "/images/fabric2.webp", community: "กลุ่มทอผ้าบ้านเขว้า", province: "ชัยภูมิ", price: 2800, stock: 15, status: "active", hasGI: false, soldCount: 110, rating: 4.6 },
  { id: "3", name: "ผ้าฝ้ายย้อมคราม", image: "/images/fabric4.webp", community: "กลุ่มทอผ้าครามสกลนคร", province: "สกลนคร", price: 1500, stock: 30, status: "active", hasGI: true, soldCount: 300, rating: 4.9 },
  { id: "4", name: "ผ้าไหมแพรวา", image: "/images/fabric5.webp", community: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว", province: "กาฬสินธุ์", price: 5000, stock: 10, status: "active", hasGI: true, soldCount: 70, rating: 4.7 },
  { id: "5", name: "ผ้าจกลายดอกพิกุล", image: "/images/fabric3.webp", community: "กลุ่มทอผ้าจกราชบุรี", province: "ราชบุรี", price: 2200, stock: 0, status: "out_of_stock", hasGI: false, soldCount: 93, rating: 4.5 },
  { id: "teenager1", name: "ชุดเซ็ตผ้าไหม 'วัยรุ่นเดอะ'", image: "/teenager1.webp", community: "กลุ่มคนรุ่นใหม่หริภุญชัย", province: "ลำพูน", price: 3200, stock: 10, status: "active", hasGI: true, soldCount: 128, rating: 4.9 },
  { id: "bag1", name: "พวงกุญแจผ้าทอ LAYA (Small)", image: "/bag1.webp", community: "ชุมชนหริภุญชัย", province: "ลำพูน", price: 1250, stock: 100, status: "active", hasGI: false, soldCount: 34, rating: 4.9 },
];

// ─── Admin Weaver Management ───────────────────────────────────
export interface AdminWeaver {
  id: string;
  name: string;
  avatar: string;
  community: string;
  province: string;
  status: "active" | "pending" | "suspended";
  kycVerified: boolean;
  joinDate: string;
  totalRevenue: number;
  totalOrders: number;
  rating: number;
  techniques: string[];
  phone: string;
}

export const mockAdminWeavers: AdminWeaver[] = [
  { id: "w1", name: "แม่สมจิตร ใจดี", avatar: "ส", community: "ชุมชนหริภุญชัย", province: "ลำพูน", status: "active", kycVerified: true, joinDate: "2024-01-15", totalRevenue: 285000, totalOrders: 84, rating: 4.9, techniques: ["ยกดอก", "ผ้าไหม", "ฝ้าย"], phone: "081-234-5678" },
  { id: "w2", name: "แม่ประนอม สีทอง", avatar: "ป", community: "กลุ่มทอผ้าบ้านเขว้า", province: "ชัยภูมิ", status: "active", kycVerified: true, joinDate: "2024-02-20", totalRevenue: 145600, totalOrders: 52, rating: 4.7, techniques: ["มัดหมี่", "ขิด"], phone: "089-876-5432" },
  { id: "w3", name: "ป้าบุญส่ง ดวงดี", avatar: "บ", community: "กลุ่มทอผ้าครามสกลนคร", province: "สกลนคร", status: "active", kycVerified: true, joinDate: "2024-01-10", totalRevenue: 216000, totalOrders: 120, rating: 4.8, techniques: ["ทอพื้น", "มัดหมี่", "ย้อมคราม"], phone: "082-345-6789" },
  { id: "w4", name: "คุณน้านภา ทอรัก", avatar: "น", community: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว", province: "กาฬสินธุ์", status: "active", kycVerified: true, joinDate: "2024-03-05", totalRevenue: 231000, totalOrders: 42, rating: 5.0, techniques: ["ขิด", "แพรวา"], phone: "085-678-9012" },
  { id: "w5", name: "นิตยา ผดุงศิลป์", avatar: "น", community: "กลุ่มทอผ้าจกราชบุรี", province: "ราชบุรี", status: "pending", kycVerified: false, joinDate: "2024-12-10", totalRevenue: 0, totalOrders: 0, rating: 0, techniques: ["ทอจก", "ฝ้าย"], phone: "086-123-4567" },
  { id: "w6", name: "สมพงษ์ ทอสวย", avatar: "ส", community: "ชุมชนหริภุญชัย", province: "ลำพูน", status: "suspended", kycVerified: true, joinDate: "2024-06-15", totalRevenue: 45000, totalOrders: 15, rating: 3.2, techniques: ["ผ้าไหม"], phone: "087-456-7890" },
];

// ─── User stats ────────────────────────────────────────────────
export const mockUserStats = {
  totalUsers: 8520,
  newUsersThisMonth: 1250,
  activeWeavers: 435,
  pendingWeaverApprovals: 12,
  totalCommunities: 28,
  topProvince: "กรุงเทพมหานคร",
};

// ═══════════════════════════════════════════════════════════════
// NEW DATA — Business KPIs
// ═══════════════════════════════════════════════════════════════

// ─── Revenue Breakdown ─────────────────────────────────────────
export const mockRevenueBreakdown = {
  totalGMV: 3450000,
  layaCommission: 345000, // ~10%
  commissionRate: 10,
  avgOrderValue: 2464,
  totalOrders: 1400,
  refunds: 42000,
  netRevenue: 303000,
};

// ─── Fabric Type Sales ─────────────────────────────────────────
export const mockFabricTypeSales = [
  { type: "มัดหมี่", revenue: 1280000, units: 520, pct: 37, color: "#C5A55A" },
  { type: "แพรวา", revenue: 690000, units: 138, pct: 20, color: "#1B2A4A" },
  { type: "ยกดอก", revenue: 540000, units: 300, pct: 16, color: "#3A5290" },
  { type: "ย้อมคราม", revenue: 450000, units: 300, pct: 13, color: "#0284C7" },
  { type: "จก", revenue: 280000, units: 127, pct: 8, color: "#D4BA7A" },
  { type: "ขิด", revenue: 210000, units: 95, pct: 6, color: "#6B7280" },
];

// ─── Demand Heatmap (Province) ─────────────────────────────────
export const mockDemandHeatmap = [
  { province: "กรุงเทพมหานคร", orders: 365, revenue: 890000, pct: 26 },
  { province: "เชียงใหม่", orders: 175, revenue: 420000, pct: 12 },
  { province: "ลำพูน", orders: 158, revenue: 380000, pct: 11 },
  { province: "ขอนแก่น", orders: 130, revenue: 310000, pct: 9 },
  { province: "สกลนคร", orders: 115, revenue: 280000, pct: 8 },
  { province: "กาฬสินธุ์", orders: 105, revenue: 250000, pct: 7 },
  { province: "นครราชสีมา", orders: 75, revenue: 180000, pct: 5 },
  { province: "อุดรธานี", orders: 63, revenue: 150000, pct: 4 },
  { province: "เชียงราย", orders: 55, revenue: 132000, pct: 4 },
  { province: "ภูเก็ต", orders: 48, revenue: 115000, pct: 3 },
];

// ─── Trend Insights ────────────────────────────────────────────
export const mockTrendInsights = {
  trendingColors: [
    { name: "Earth Tone", growth: 42, hex: "#8B6914" },
    { name: "Pastel Blue", growth: 35, hex: "#89CFF0" },
    { name: "Sage Green", growth: 28, hex: "#9CAF88" },
    { name: "Cream", growth: 22, hex: "#FFFDD0" },
    { name: "Indigo", growth: 18, hex: "#2E4057" },
  ],
  trendingPatterns: [
    { name: "ลายนาคราช", searches: 3200, growth: 45 },
    { name: "ลายดอกจันทร์", searches: 2800, growth: 32 },
    { name: "ลายกินรี", searches: 2400, growth: 28 },
    { name: "ลายขอ", searches: 1900, growth: 15 },
    { name: "ลายดอกพิกุล", searches: 1600, growth: 12 },
  ],
  seasonalTrends: [
    { season: "Q1 (ม.ค.–มี.ค.)", topCategory: "ผ้าพันคอ", demand: "สูง" },
    { season: "Q2 (เม.ย.–มิ.ย.)", topCategory: "เสื้อผ้าสงกรานต์", demand: "สูงมาก" },
    { season: "Q3 (ก.ค.–ก.ย.)", topCategory: "ผ้าผืน", demand: "ปานกลาง" },
    { season: "Q4 (ต.ค.–ธ.ค.)", topCategory: "ของขวัญ/กระเป๋า", demand: "สูง" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// NEW DATA — User & Behavior
// ═══════════════════════════════════════════════════════════════

// ─── User Activity ─────────────────────────────────────────────
export const mockUserActivity = {
  dau: 1420,
  mau: 8520,
  avgSessionTime: "4m 32s",
  bounceRate: 32.5,
  returningUsers: 62,
  dauTrend: [
    { date: "จ.", users: 1200 },
    { date: "อ.", users: 1350 },
    { date: "พ.", users: 1500 },
    { date: "พฤ.", users: 1420 },
    { date: "ศ.", users: 1680 },
    { date: "ส.", users: 2100 },
    { date: "อา.", users: 1900 },
  ],
};

// ─── Customer Journey Funnel ───────────────────────────────────
export const mockCustomerFunnel = [
  { stage: "เข้าชมเว็บไซต์", count: 45000, pct: 100, color: "#1B2A4A" },
  { stage: "ดูสินค้า", count: 28000, pct: 62.2, color: "#2A3E6A" },
  { stage: "เพิ่มลงตะกร้า", count: 8400, pct: 18.7, color: "#3A5290" },
  { stage: "เริ่มชำระเงิน", count: 4200, pct: 9.3, color: "#C5A55A" },
  { stage: "ชำระสำเร็จ", count: 1710, pct: 3.8, color: "#22C55E" },
];

// ─── Search Keywords ───────────────────────────────────────────
export const mockSearchKeywords = [
  { keyword: "ผ้าไหมมัดหมี่", count: 4200, growth: 15 },
  { keyword: "ผ้าฝ้ายย้อมคราม", count: 3800, growth: 32 },
  { keyword: "ผ้าไหมสีฟ้า", count: 2900, growth: 48 },
  { keyword: "ของขวัญผ้าทอ", count: 2400, growth: 22 },
  { keyword: "ผ้าพันคอไหม", count: 2100, growth: 8 },
  { keyword: "ผ้าแพรวา กาฬสินธุ์", count: 1800, growth: 18 },
  { keyword: "กระเป๋าผ้าทอ", count: 1500, growth: 35 },
  { keyword: "ชุดผ้าไทย วัยรุ่น", count: 1200, growth: 65 },
];

// ─── Wishlist / Save Data ──────────────────────────────────────
export const mockWishlistData = [
  { name: "ผ้าไหมแพรวา", saves: 820, purchases: 70, convRate: 8.5 },
  { name: "ผ้ายกลายกินรีหริภุญชัย", saves: 750, purchases: 300, convRate: 40.0 },
  { name: "ชุดเซ็ตผ้าไหม 'วัยรุ่นเดอะ'", saves: 680, purchases: 128, convRate: 18.8 },
  { name: "ผ้าฝ้ายย้อมคราม", saves: 620, purchases: 300, convRate: 48.4 },
  { name: "ผ้ามัดหมี่ลายนาคราช", saves: 540, purchases: 110, convRate: 20.4 },
];

// ═══════════════════════════════════════════════════════════════
// NEW DATA — Supply Side (Community)
// ═══════════════════════════════════════════════════════════════

// ─── Community Performance ─────────────────────────────────────
export const mockCommunityPerformance = [
  { name: "ชุมชนหริภุญชัย", province: "ลำพูน", revenue: 825000, orders: 384, weavers: 12, growth: 18 },
  { name: "กลุ่มทอผ้าครามสกลนคร", province: "สกลนคร", revenue: 450000, orders: 300, weavers: 8, growth: 25 },
  { name: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว", province: "กาฬสินธุ์", revenue: 350000, orders: 70, weavers: 5, growth: 12 },
  { name: "กลุ่มทอผ้าบ้านเขว้า", province: "ชัยภูมิ", revenue: 308000, orders: 162, weavers: 6, growth: 8 },
  { name: "กลุ่มทอผ้าจกราชบุรี", province: "ราชบุรี", revenue: 220000, orders: 93, weavers: 4, growth: -3 },
  { name: "กลุ่มคนรุ่นใหม่หริภุญชัย", province: "ลำพูน", revenue: 410000, orders: 128, weavers: 3, growth: 45 },
];

// ─── Production Insight ────────────────────────────────────────
export const mockProductionInsight = {
  avgProductionDays: 14,
  fastestCommunity: { name: "กลุ่มทอผ้าครามสกลนคร", days: 7 },
  slowestCommunity: { name: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว", days: 30 },
  stockTurnover: 2.8, // times per quarter
  productionByMonth: [
    { month: "ม.ค.", produced: 120, sold: 95 },
    { month: "ก.พ.", produced: 135, sold: 110 },
    { month: "มี.ค.", produced: 110, sold: 125 },
    { month: "เม.ย.", produced: 150, sold: 160 },
    { month: "พ.ค.", produced: 180, sold: 170 },
    { month: "มิ.ย.", produced: 200, sold: 195 },
    { month: "ก.ค.", produced: 190, sold: 185 },
    { month: "ส.ค.", produced: 220, sold: 210 },
    { month: "ก.ย.", produced: 240, sold: 230 },
    { month: "ต.ค.", produced: 260, sold: 255 },
    { month: "พ.ย.", produced: 290, sold: 280 },
    { month: "ธ.ค.", produced: 310, sold: 320 },
  ],
};

// ─── Supply vs Demand Gap ──────────────────────────────────────
export const mockSupplyDemandGap = [
  { product: "ผ้าไหมแพรวา", demand: 200, supply: 70, gap: 130, urgency: "critical" as const },
  { product: "ผ้ามัดหมี่ลายนาคราช", demand: 180, supply: 110, gap: 70, urgency: "high" as const },
  { product: "ชุดเซ็ตผ้าไหม 'วัยรุ่นเดอะ'", demand: 160, supply: 128, gap: 32, urgency: "medium" as const },
  { product: "ผ้าฝ้ายย้อมคราม", demand: 350, supply: 300, gap: 50, urgency: "medium" as const },
  { product: "ผ้าจกลายดอกพิกุล", demand: 150, supply: 93, gap: 57, urgency: "high" as const },
];

// ═══════════════════════════════════════════════════════════════
// NEW DATA — Smart Dashboard / AI
// ═══════════════════════════════════════════════════════════════

// ─── AI Insight Box ────────────────────────────────────────────
export const mockAIInsights = [
  { icon: "🔥", text: "ผ้า \"โทนเขียว\" ยอดค้นหาเพิ่ม +32% ในสัปดาห์นี้", type: "trend" as const },
  { icon: "📍", text: "จ.เชียงใหม่ มียอดซื้อสูงสุดในภาคเหนือ ↑18%", type: "location" as const },
  { icon: "⚠️", text: "ผ้าไหมแพรวา กำลังจะหมด stock ภายใน 5 วัน", type: "alert" as const },
  { icon: "💡", text: "ลูกค้า 68% ที่ดู 'ผ้ามัดหมี่' มักซื้อ 'ผ้าพันคอ' ด้วย", type: "insight" as const },
  { icon: "🎯", text: "Conversion Rate เพิ่มขึ้น 0.5% หลังเพิ่ม Story Section", type: "metric" as const },
  { icon: "📈", text: "keyword 'ชุดผ้าไทย วัยรุ่น' เพิ่มขึ้น +65% — ตลาดใหม่!", type: "trend" as const },
];

// ─── Predictive Analytics ──────────────────────────────────────
export const mockPredictiveAnalytics = {
  nextMonthRevenue: { predicted: 3800000, confidence: 85 },
  nextQuarterTrend: "ผ้ามัดหมี่ + ผ้าย้อมครามจะมี demand เพิ่ม 20-30%",
  demandForecast: [
    { month: "ม.ค. 68", predicted: 3200000, actual: null },
    { month: "ก.พ. 68", predicted: 3500000, actual: null },
    { month: "มี.ค. 68", predicted: 3800000, actual: null },
  ],
  riskFactors: [
    "ฤดูฝนอาจกระทบการทอผ้าในภาคอีสาน",
    "ต้นทุนย้อมธรรมชาติสูงขึ้น 8%",
    "แนวโน้ม Gen Z สนใจผ้าทอเพิ่มขึ้น — โอกาสใหม่",
  ],
};

// ─── Recommendation Engine ─────────────────────────────────────
export const mockRecommendations = [
  { type: "product" as const, title: "เพิ่มสินค้า: กระเป๋าผ้าทอ", reason: "ค้นหา 'กระเป๋าผ้าทอ' เพิ่ม +35% แต่มีสินค้าน้อย", priority: "high" as const },
  { type: "pricing" as const, title: "ปรับราคา: ผ้าไหมแพรวา ↑12%", reason: "Demand สูงกว่า Supply 185% — สามารถปรับราคาได้", priority: "medium" as const },
  { type: "marketing" as const, title: "Campaign: ผ้าไทยสำหรับวัยรุ่น", reason: "keyword 'ชุดผ้าไทย วัยรุ่น' โต +65% — ควรทำ marketing", priority: "high" as const },
  { type: "stock" as const, title: "เร่งผลิต: ผ้ามัดหมี่ลายนาคราช", reason: "Stock เหลือ 15 ชิ้น แต่ demand 180/เดือน", priority: "critical" as const },
  { type: "community" as const, title: "ชวนช่างทอจากจ.สุรินทร์", reason: "จ.สุรินทร์ มีช่างทอเยอะ แต่ยังไม่มีใน platform", priority: "medium" as const },
];

// ═══════════════════════════════════════════════════════════════
// USER MANAGEMENT DATA
// ═══════════════════════════════════════════════════════════════

// ─── Customers ─────────────────────────────────────────────────
export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  lastActive: string;
  status: "active" | "inactive";
  province: string;
}

export const mockAdminCustomers: AdminCustomer[] = [
  { id: "c1", name: "สมชาย มั่นคง", email: "somchai@email.com", avatar: "ส", joinDate: "2024-03-10", totalOrders: 8, totalSpent: 24500, lastActive: "2024-12-14", status: "active", province: "กรุงเทพมหานคร" },
  { id: "c2", name: "กานดา วรรณ", email: "kanda@email.com", avatar: "ก", joinDate: "2024-05-22", totalOrders: 5, totalSpent: 18200, lastActive: "2024-12-14", status: "active", province: "เชียงใหม่" },
  { id: "c3", name: "Nadia Schmidt", email: "nadia@email.com", avatar: "N", joinDate: "2024-07-01", totalOrders: 3, totalSpent: 9800, lastActive: "2024-12-13", status: "active", province: "ภูเก็ต" },
  { id: "c4", name: "ประเสริฐ จันทร์", email: "prasert@email.com", avatar: "ป", joinDate: "2024-04-15", totalOrders: 12, totalSpent: 42000, lastActive: "2024-12-12", status: "active", province: "ขอนแก่น" },
  { id: "c5", name: "วิภา ศรีสุข", email: "wipa@email.com", avatar: "ว", joinDate: "2024-08-20", totalOrders: 2, totalSpent: 4200, lastActive: "2024-12-11", status: "active", province: "ลำพูน" },
  { id: "c6", name: "John Smith", email: "john@email.com", avatar: "J", joinDate: "2024-09-05", totalOrders: 1, totalSpent: 1800, lastActive: "2024-11-20", status: "inactive", province: "กรุงเทพมหานคร" },
  { id: "c7", name: "สุมาลี ใจงาม", email: "sumalee@email.com", avatar: "ส", joinDate: "2024-02-18", totalOrders: 15, totalSpent: 56000, lastActive: "2024-12-14", status: "active", province: "สกลนคร" },
  { id: "c8", name: "ธนา คำแก้ว", email: "thana@email.com", avatar: "ธ", joinDate: "2024-06-12", totalOrders: 4, totalSpent: 11200, lastActive: "2024-12-09", status: "active", province: "กาฬสินธุ์" },
];

// ─── KYC Verification ──────────────────────────────────────────
export interface KYCSubmission {
  id: string;
  weaverId: string;
  weaverName: string;
  avatar: string;
  community: string;
  province: string;
  submittedDate: string;
  idCardImage: string;
  selfieImage: string;
  status: "pending" | "approved" | "rejected";
  rejectedReason?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

export const mockKYCSubmissions: KYCSubmission[] = [
  { id: "kyc1", weaverId: "w5", weaverName: "นิตยา ผดุงศิลป์", avatar: "น", community: "กลุ่มทอผ้าจกราชบุรี", province: "ราชบุรี", submittedDate: "2024-12-10", idCardImage: "/images/fabric1.webp", selfieImage: "/images/fabric2.webp", status: "pending" },
  { id: "kyc2", weaverId: "w7", weaverName: "วันดี สืบศิลป์", avatar: "ว", community: "กลุ่มทอผ้าครามสกลนคร", province: "สกลนคร", submittedDate: "2024-12-12", idCardImage: "/images/fabric3.webp", selfieImage: "/images/fabric4.webp", status: "pending" },
  { id: "kyc3", weaverId: "w8", weaverName: "อำพร ทองคำ", avatar: "อ", community: "ชุมชนหริภุญชัย", province: "ลำพูน", submittedDate: "2024-12-13", idCardImage: "/images/fabric5.webp", selfieImage: "/images/fabric1.webp", status: "pending" },
  { id: "kyc4", weaverId: "w1", weaverName: "แม่สมจิตร ใจดี", avatar: "ส", community: "ชุมชนหริภุญชัย", province: "ลำพูน", submittedDate: "2024-11-15", idCardImage: "/images/fabric2.webp", selfieImage: "/images/fabric3.webp", status: "approved", reviewedBy: "Admin A", reviewedDate: "2024-11-16" },
  { id: "kyc5", weaverId: "w6", weaverName: "สมพงษ์ ทอสวย", avatar: "ส", community: "ชุมชนหริภุญชัย", province: "ลำพูน", submittedDate: "2024-06-15", idCardImage: "/images/fabric4.webp", selfieImage: "/images/fabric5.webp", status: "rejected", rejectedReason: "รูปบัตรประชาชนไม่ชัด", reviewedBy: "Admin A", reviewedDate: "2024-06-16" },
];

// ─── Roles & Permissions ───────────────────────────────────────
export interface AdminRole {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageUsers: boolean;
    viewAnalytics: boolean;
    manageSettings: boolean;
    manageCommunities: boolean;
  };
}

export const mockAdminRoles: AdminRole[] = [
  { id: "r1", name: "Super Admin", description: "สิทธิ์เต็มรูปแบบ ใช้สำหรับเจ้าของระบบ", usersCount: 1, permissions: { manageProducts: true, manageOrders: true, manageUsers: true, viewAnalytics: true, manageSettings: true, manageCommunities: true } },
  { id: "r2", name: "Staff", description: "จัดการสินค้าและออเดอร์ แต่ไม่สามารถแก้ไขผู้ใช้", usersCount: 3, permissions: { manageProducts: true, manageOrders: true, manageUsers: false, viewAnalytics: true, manageSettings: false, manageCommunities: false } },
  { id: "r3", name: "Viewer", description: "ดูข้อมูลเท่านั้น ไม่สามารถแก้ไขอะไรได้", usersCount: 5, permissions: { manageProducts: false, manageOrders: false, manageUsers: false, viewAnalytics: true, manageSettings: false, manageCommunities: false } },
  { id: "r4", name: "Community Manager", description: "จัดการชุมชนและช่างทอ", usersCount: 2, permissions: { manageProducts: true, manageOrders: false, manageUsers: false, viewAnalytics: true, manageSettings: false, manageCommunities: true } },
];

// ─── Activity Log ──────────────────────────────────────────────
export interface ActivityLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  type: "approve" | "reject" | "suspend" | "create" | "update" | "delete";
}

export const mockActivityLog: ActivityLogEntry[] = [
  { id: "log1", actor: "Admin A", action: "อนุมัติช่างทอ", target: "แม่สมจิตร ใจดี", timestamp: "2024-12-14 10:30", type: "approve" },
  { id: "log2", actor: "Admin A", action: "ระงับบัญชี", target: "สมพงษ์ ทอสวย", timestamp: "2024-12-14 09:15", type: "suspend" },
  { id: "log3", actor: "Staff B", action: "อนุมัติ KYC", target: "ป้าบุญส่ง ดวงดี", timestamp: "2024-12-13 16:45", type: "approve" },
  { id: "log4", actor: "Admin A", action: "ปฏิเสธ KYC", target: "สมพงษ์ ทอสวย", timestamp: "2024-12-13 14:20", type: "reject" },
  { id: "log5", actor: "Staff B", action: "สร้าง Role ใหม่", target: "Community Manager", timestamp: "2024-12-12 11:00", type: "create" },
  { id: "log6", actor: "Admin A", action: "อัปเดตสิทธิ์", target: "Staff Role", timestamp: "2024-12-12 09:30", type: "update" },
  { id: "log7", actor: "Admin A", action: "อนุมัติช่างทอ", target: "คุณน้านภา ทอรัก", timestamp: "2024-12-11 15:00", type: "approve" },
  { id: "log8", actor: "Staff B", action: "ลบ Role", target: "Temp Viewer", timestamp: "2024-12-10 10:45", type: "delete" },
];

// ═══════════════════════════════════════════════════════════════
// ANALYTICS DATA
// ═══════════════════════════════════════════════════════════════

// ─── Search Trends Over Time ───────────────────────────────────
export const mockSearchTrendsOverTime = [
  { week: "W1", "ผ้าไหมมัดหมี่": 320, "ผ้าฝ้ายย้อมคราม": 280, "ผ้าไหมสีฟ้า": 180, "ชุดผ้าไทย วัยรุ่น": 60 },
  { week: "W2", "ผ้าไหมมัดหมี่": 340, "ผ้าฝ้ายย้อมคราม": 290, "ผ้าไหมสีฟ้า": 220, "ชุดผ้าไทย วัยรุ่น": 85 },
  { week: "W3", "ผ้าไหมมัดหมี่": 360, "ผ้าฝ้ายย้อมคราม": 310, "ผ้าไหมสีฟ้า": 250, "ชุดผ้าไทย วัยรุ่น": 120 },
  { week: "W4", "ผ้าไหมมัดหมี่": 380, "ผ้าฝ้ายย้อมคราม": 350, "ผ้าไหมสีฟ้า": 290, "ชุดผ้าไทย วัยรุ่น": 180 },
  { week: "W5", "ผ้าไหมมัดหมี่": 400, "ผ้าฝ้ายย้อมคราม": 380, "ผ้าไหมสีฟ้า": 310, "ชุดผ้าไทย วัยรุ่น": 220 },
  { week: "W6", "ผ้าไหมมัดหมี่": 420, "ผ้าฝ้ายย้อมคราม": 390, "ผ้าไหมสีฟ้า": 340, "ชุดผ้าไทย วัยรุ่น": 280 },
  { week: "W7", "ผ้าไหมมัดหมี่": 450, "ผ้าฝ้ายย้อมคราม": 400, "ผ้าไหมสีฟ้า": 360, "ชุดผ้าไทย วัยรุ่น": 320 },
  { week: "W8", "ผ้าไหมมัดหมี่": 480, "ผ้าฝ้ายย้อมคราม": 420, "ผ้าไหมสีฟ้า": 390, "ชุดผ้าไทย วัยรุ่น": 380 },
];

// ─── Color Popularity (for bar chart) ──────────────────────────
export const mockColorPopularity = [
  { color: "Earth Tone", searches: 4800, hex: "#8B6914" },
  { color: "Indigo", searches: 3600, hex: "#2E4057" },
  { color: "Pastel Blue", searches: 3200, hex: "#89CFF0" },
  { color: "Sage Green", searches: 2800, hex: "#9CAF88" },
  { color: "Cream", searches: 2400, hex: "#FFFDD0" },
  { color: "Burgundy", searches: 1800, hex: "#800020" },
  { color: "Deep Red", searches: 1500, hex: "#8B0000" },
];

// ─── Revenue by time ranges ───────────────────────────────────
export const mockRevenue7Days = [
  { date: "จ.", revenue: 45000 },
  { date: "อ.", revenue: 52000 },
  { date: "พ.", revenue: 48000 },
  { date: "พฤ.", revenue: 61000 },
  { date: "ศ.", revenue: 73000 },
  { date: "ส.", revenue: 89000 },
  { date: "อา.", revenue: 78000 },
];

export const mockRevenue30Days = [
  { date: "1 ธ.ค.", revenue: 42000 }, { date: "5 ธ.ค.", revenue: 55000 },
  { date: "10 ธ.ค.", revenue: 67000 }, { date: "15 ธ.ค.", revenue: 72000 },
  { date: "20 ธ.ค.", revenue: 63000 }, { date: "25 ธ.ค.", revenue: 95000 },
  { date: "30 ธ.ค.", revenue: 88000 },
];

export const mockRevenue1Year = [
  { date: "ม.ค.", revenue: 280000 }, { date: "ก.พ.", revenue: 310000 },
  { date: "มี.ค.", revenue: 340000 }, { date: "เม.ย.", revenue: 420000 },
  { date: "พ.ค.", revenue: 380000 }, { date: "มิ.ย.", revenue: 360000 },
  { date: "ก.ค.", revenue: 340000 }, { date: "ส.ค.", revenue: 390000 },
  { date: "ก.ย.", revenue: 410000 }, { date: "ต.ค.", revenue: 450000 },
  { date: "พ.ย.", revenue: 480000 }, { date: "ธ.ค.", revenue: 520000 },
];

// ─── Community Opportunity ────────────────────────────────────
export const mockCommunityOpportunity = [
  { community: "กลุ่มทอผ้าครามสกลนคร", shouldProduce: "ผ้าฝ้ายย้อมครามลายใหม่", potentialRevenue: 180000, demandGrowth: 32, reason: "Demand สูง +32% แต่ stock ใกล้หมด" },
  { community: "ชุมชนหริภุญชัย", shouldProduce: "กระเป๋าผ้าทอ", potentialRevenue: 250000, demandGrowth: 35, reason: "keyword 'กระเป๋าผ้าทอ' เติบโต +35%  แต่ยังไม่มีสินค้า" },
  { community: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว", shouldProduce: "ผ้าพันคอแพรวา", potentialRevenue: 150000, demandGrowth: 22, reason: "ผ้าพันคอไหม ยอดค้นหาสูง แต่ supply ต่ำ" },
  { community: "กลุ่มทอผ้าบ้านเขว้า", shouldProduce: "เสื้อผ้าสำเร็จรูป", potentialRevenue: 320000, demandGrowth: 65, reason: "'ชุดผ้าไทย วัยรุ่น' โตเร็วที่สุด — ตลาดใหม่" },
];

// ─── Demand vs Supply bar chart ───────────────────────────────
export const mockDemandVsSupply = [
  { category: "ผ้าไหม", demand: 520, supply: 310 },
  { category: "ผ้าฝ้าย", demand: 480, supply: 420 },
  { category: "แพรวา", demand: 200, supply: 70 },
  { category: "ย้อมคราม", demand: 350, supply: 300 },
  { category: "จก", demand: 150, supply: 93 },
  { category: "กระเป๋า", demand: 180, supply: 40 },
];

// ═══════════════════════════════════════════════════════════════
// MARKETING DATA
// ═══════════════════════════════════════════════════════════════

// ─── Promotions ────────────────────────────────────────────────
export interface AdminPromotion {
  id: string;
  name: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSpend: number;
  usageLimit: number;
  usageCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "draft";
  applyTo: "all" | "category" | "weaver";
  applyTarget?: string;
}

export const mockPromotions: AdminPromotion[] = [
  { id: "p1", name: "ลด 10% ต้อนรับปีใหม่", code: "LAYA10", type: "percent", value: 10, minSpend: 500, usageLimit: 500, usageCount: 120, perUserLimit: 1, startDate: "2024-12-01", endDate: "2025-01-31", status: "active", applyTo: "all" },
  { id: "p2", name: "ลด ฿200 สำหรับสมาชิกใหม่", code: "WELCOME200", type: "fixed", value: 200, minSpend: 1000, usageLimit: 1000, usageCount: 342, perUserLimit: 1, startDate: "2024-01-01", endDate: "2025-12-31", status: "active", applyTo: "all" },
  { id: "p3", name: "ลด 15% ผ้าไหม", code: "SILK15", type: "percent", value: 15, minSpend: 800, usageLimit: 200, usageCount: 89, perUserLimit: 2, startDate: "2024-11-01", endDate: "2024-12-31", status: "active", applyTo: "category", applyTarget: "ผ้าไหม" },
  { id: "p4", name: "ลด ฿100 ผ้าย้อมคราม", code: "KRAM100", type: "fixed", value: 100, minSpend: 500, usageLimit: 300, usageCount: 300, perUserLimit: 1, startDate: "2024-06-01", endDate: "2024-09-30", status: "expired", applyTo: "category", applyTarget: "ย้อมคราม" },
  { id: "p5", name: "สงกรานต์เซลล์ 20%", code: "SKR2025", type: "percent", value: 20, minSpend: 1500, usageLimit: 100, usageCount: 0, perUserLimit: 1, startDate: "2025-04-10", endDate: "2025-04-17", status: "draft", applyTo: "all" },
  { id: "p6", name: "ลด 5% ชุมชนหริภุญชัย", code: "HARI5", type: "percent", value: 5, minSpend: 0, usageLimit: 100, usageCount: 45, perUserLimit: 3, startDate: "2024-10-01", endDate: "2025-03-31", status: "active", applyTo: "weaver", applyTarget: "ชุมชนหริภุญชัย" },
];

// ─── Campaigns ─────────────────────────────────────────────────
export interface AdminCampaign {
  id: string;
  name: string;
  description: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "ended";
  linkedPromoCode?: string;
  visibility: "public" | "private";
  productCount: number;
  stats: {
    revenue: number;
    orders: number;
    conversion: number;
  };
}

export const mockCampaigns: AdminCampaign[] = [
  {
    id: "cam1", name: "ผ้าทอไทย x ปีใหม่ 2025", description: "แคมเปญต้อนรับปีใหม่ ลดพิเศษทั้งร้าน พร้อมของขวัญสุดพิเศษ",
    bannerImage: "/images/fabric1.webp", startDate: "2024-12-20", endDate: "2025-01-15", status: "active",
    linkedPromoCode: "LAYA10", visibility: "public", productCount: 24,
    stats: { revenue: 245000, orders: 85, conversion: 4.2 },
  },
  {
    id: "cam2", name: "สงกรานต์เซลล์ 2025", description: "เทศกาลสงกรานต์ ลดสูงสุด 20% เสื้อผ้าไหมและผ้าฝ้ายทอมือ",
    bannerImage: "/images/fabric2.webp", startDate: "2025-04-10", endDate: "2025-04-17", status: "upcoming",
    linkedPromoCode: "SKR2025", visibility: "public", productCount: 18,
    stats: { revenue: 0, orders: 0, conversion: 0 },
  },
  {
    id: "cam3", name: "ผ้าย้อมคราม Festival", description: "รวมผ้าย้อมครามจากสกลนคร ราคาพิเศษ",
    bannerImage: "/images/fabric3.webp", startDate: "2024-06-01", endDate: "2024-09-30", status: "ended",
    linkedPromoCode: "KRAM100", visibility: "public", productCount: 12,
    stats: { revenue: 380000, orders: 210, conversion: 5.1 },
  },
  {
    id: "cam4", name: "แพรวา Premium Collection", description: "คอลเลคชันพิเศษผ้าแพรวาจากกาฬสินธุ์ สำหรับลูกค้าพรีเมียม",
    bannerImage: "/images/fabric4.webp", startDate: "2024-11-01", endDate: "2025-02-28", status: "active",
    linkedPromoCode: "SILK15", visibility: "private", productCount: 8,
    stats: { revenue: 520000, orders: 42, conversion: 6.8 },
  },
];

// ═══════════════════════════════════════════════════════════════
// MODERATION DATA
// ═══════════════════════════════════════════════════════════════

// ─── Reports ───────────────────────────────────────────────────
export interface AdminReport {
  id: string;
  type: "product" | "user" | "review";
  targetName: string;
  targetId: string;
  reporterName: string;
  reporterEmail: string;
  description: string;
  evidence: string[];
  date: string;
  status: "pending" | "investigating" | "resolved" | "rejected";
  priority: "high" | "medium" | "low";
  adminNote?: string;
  timeline: { time: string; action: string; actor: string }[];
}

export const mockReports: AdminReport[] = [
  {
    id: "RPT-001", type: "product", targetName: "ผ้าไหมปลอม (สงสัยเป็นเครื่องจักร)", targetId: "prod-x1",
    reporterName: "สมชาย มั่นคง", reporterEmail: "somchai@email.com",
    description: "สินค้านี้ไม่ใช่ผ้าทอมือ ลายดูเป็นเครื่องจักรทอ คุณภาพไม่ตรงกับที่โฆษณา",
    evidence: ["/images/fabric1.webp", "/images/fabric2.webp"],
    date: "2024-12-14", status: "pending", priority: "high",
    timeline: [
      { time: "2024-12-14 10:30", action: "User รายงานปัญหา", actor: "สมชาย มั่นคง" },
    ],
  },
  {
    id: "RPT-002", type: "user", targetName: "สมพงษ์ ทอสวย", targetId: "w6",
    reporterName: "กานดา วรรณ", reporterEmail: "kanda@email.com",
    description: "ช่างทอรายนี้ส่งของช้ามาก (2 เดือน) และไม่ตอบข้อความ",
    evidence: ["/images/fabric3.webp"],
    date: "2024-12-13", status: "investigating", priority: "high",
    adminNote: "กำลังติดต่อช่างทอเพื่อสอบถาม",
    timeline: [
      { time: "2024-12-13 14:20", action: "User รายงานปัญหา", actor: "กานดา วรรณ" },
      { time: "2024-12-13 16:00", action: "Admin เริ่มตรวจสอบ", actor: "Admin A" },
      { time: "2024-12-14 09:00", action: "ติดต่อช่างทอ", actor: "Admin A" },
    ],
  },
  {
    id: "RPT-003", type: "review", targetName: "Review: 'สินค้าห่วยมาก ไม่ควรซื้อ'", targetId: "rev-x1",
    reporterName: "แม่สมจิตร ใจดี", reporterEmail: "somjit@email.com",
    description: "รีวิวนี้มีเนื้อหาหยาบคาย ไม่สร้างสรรค์ และไม่ตรงกับสินค้าจริง",
    evidence: [],
    date: "2024-12-12", status: "resolved", priority: "medium",
    adminNote: "ลบ review แล้ว — เนื้อหาละเมิด policy",
    timeline: [
      { time: "2024-12-12 08:00", action: "User รายงาน review", actor: "แม่สมจิตร ใจดี" },
      { time: "2024-12-12 10:00", action: "Admin ตรวจสอบ", actor: "Admin A" },
      { time: "2024-12-12 10:30", action: "ลบ review + resolve", actor: "Admin A" },
    ],
  },
  {
    id: "RPT-004", type: "product", targetName: "กระเป๋าลอกแบรนด์", targetId: "prod-x2",
    reporterName: "Nadia Schmidt", reporterEmail: "nadia@email.com",
    description: "กระเป๋านี้มีโลโก้คล้ายแบรนด์ดัง อาจละเมิดลิขสิทธิ์",
    evidence: ["/images/fabric4.webp"],
    date: "2024-12-11", status: "pending", priority: "high",
    timeline: [
      { time: "2024-12-11 15:00", action: "User รายงานปัญหา", actor: "Nadia Schmidt" },
    ],
  },
  {
    id: "RPT-005", type: "review", targetName: "Review spam (5 ดาว ซ้ำ 10 ครั้ง)", targetId: "rev-x2",
    reporterName: "ประเสริฐ จันทร์", reporterEmail: "prasert@email.com",
    description: "มีรีวิว 5 ดาว ข้อความเหมือนกันหมด 10 รีวิว สงสัยเป็น fake review",
    evidence: [],
    date: "2024-12-10", status: "investigating", priority: "medium",
    adminNote: "กำลังตรวจ IP + account pattern",
    timeline: [
      { time: "2024-12-10 12:00", action: "User รายงาน", actor: "ประเสริฐ จันทร์" },
      { time: "2024-12-11 09:00", action: "Admin เริ่มสอบสวน", actor: "Staff B" },
    ],
  },
  {
    id: "RPT-006", type: "user", targetName: "ลูกค้า John (สั่งแล้ว chargeback)", targetId: "c6",
    reporterName: "ระบบ Laya", reporterEmail: "system@laya.co",
    description: "ลูกค้ารายนี้ทำ chargeback หลังรับของแล้ว 3 ครั้ง",
    evidence: [],
    date: "2024-12-09", status: "rejected", priority: "low",
    adminNote: "ตรวจสอบแล้ว — เคสเปลี่ยนสินค้า ไม่ใช่ fraud",
    timeline: [
      { time: "2024-12-09 10:00", action: "ระบบแจ้งเตือน chargeback", actor: "System" },
      { time: "2024-12-09 14:00", action: "Admin ตรวจสอบ", actor: "Admin A" },
      { time: "2024-12-09 14:30", action: "Reject report (ไม่ใช่ fraud)", actor: "Admin A" },
    ],
  },
];

// ─── Reviews (for moderation) ──────────────────────────────────
export interface AdminReview {
  id: string;
  userName: string;
  userAvatar: string;
  productName: string;
  productId: string;
  rating: number;
  comment: string;
  date: string;
  status: "approved" | "pending" | "hidden" | "deleted";
  flagged: boolean;
  flagReason?: string;
  reportCount: number;
}

export const mockAdminReviews: AdminReview[] = [
  { id: "rv1", userName: "สมชาย มั่นคง", userAvatar: "ส", productName: "ผ้าไหมมัดหมี่ลายนาคราช", productId: "p1", rating: 5, comment: "สวยมากครับ เนื้อผ้าดี ทอละเอียดมาก คุ้มค่ามาก 👍", date: "2024-12-14", status: "approved", flagged: false, reportCount: 0 },
  { id: "rv2", userName: "กานดา วรรณ", userAvatar: "ก", productName: "ผ้าฝ้ายย้อมครามสกลนคร", productId: "p2", rating: 4, comment: "สีสวย แต่ส่งช้าไปหน่อย โดยรวมดีค่ะ", date: "2024-12-13", status: "approved", flagged: false, reportCount: 0 },
  { id: "rv3", userName: "FakeUser123", userAvatar: "F", productName: "ผ้าแพรวาลายกินรี", productId: "p3", rating: 1, comment: "สินค้าห่วยมาก ไม่ควรซื้อ xxxxx", date: "2024-12-12", status: "pending", flagged: true, flagReason: "เนื้อหาหยาบคาย", reportCount: 3 },
  { id: "rv4", userName: "Bot Account", userAvatar: "B", productName: "ผ้าไหมมัดหมี่ลายดอกจันทร์", productId: "p4", rating: 5, comment: "ดีมากๆ ดีมากๆ ดีมากๆ ดีมากๆ ดีมากๆ", date: "2024-12-11", status: "pending", flagged: true, flagReason: "สงสัย spam / fake review", reportCount: 5 },
  { id: "rv5", userName: "Nadia Schmidt", userAvatar: "N", productName: "ผ้ายกดอกลำพูน", productId: "p5", rating: 5, comment: "Beautiful craftsmanship! The silk quality is amazing. Highly recommend!", date: "2024-12-10", status: "approved", flagged: false, reportCount: 0 },
  { id: "rv6", userName: "ประเสริฐ จันทร์", userAvatar: "ป", productName: "ผ้าจกราชบุรี", productId: "p6", rating: 3, comment: "ลายสวยแต่เนื้อผ้าบางกว่าที่คาด ราคาค่อนข้างสูง", date: "2024-12-09", status: "approved", flagged: false, reportCount: 0 },
  { id: "rv7", userName: "วิภา ศรีสุข", userAvatar: "ว", productName: "ผ้าไหมมัดหมี่ลายนาคราช", productId: "p1", rating: 4, comment: "ได้รับสินค้าแล้วค่ะ สวยตรงปก ช่างทอใจดีมาก", date: "2024-12-08", status: "approved", flagged: false, reportCount: 0 },
  { id: "rv8", userName: "Unknown", userAvatar: "?", productName: "ผ้าฝ้ายย้อมครามสกลนคร", productId: "p2", rating: 5, comment: "good good good good good", date: "2024-12-07", status: "pending", flagged: true, flagReason: "สงสัย fake review (repeated text)", reportCount: 2 },
];

// ─── AI Moderation Suggestions ─────────────────────────────────
export const mockModerationSuggestions = [
  { icon: "🤖", text: "User 'FakeUser123' มี report ซ้ำ 3 ครั้ง — ควรพิจารณา suspend", type: "suspend" as const },
  { icon: "⚠️", text: "Review 'good good good' มีรูปแบบ spam — ควรลบ", type: "delete" as const },
  { icon: "🔍", text: "สินค้า 'กระเป๋าลอกแบรนด์' มี report ด้านลิขสิทธิ์ — ควรตรวจสอบด่วน", type: "investigate" as const },
];

// ═══════════════════════════════════════════════════════════════
// SETTINGS DATA
// ═══════════════════════════════════════════════════════════════

export interface SystemSettings {
  platformName: string;
  supportEmail: string;
  contactNumber: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  lineNotifications: boolean;
  adminAlerts: boolean;
  sessionTimeout: number;
  twoFARequired: boolean;
  lastBackup: string;
}

export const mockSystemSettings: SystemSettings = {
  platformName: "LAYA",
  supportEmail: "support@laya.co",
  contactNumber: "+66-2-123-4567",
  defaultCurrency: "THB",
  maintenanceMode: false,
  emailNotifications: true,
  lineNotifications: true,
  adminAlerts: true,
  sessionTimeout: 30,
  twoFARequired: false,
  lastBackup: "2024-12-14 03:00",
};

export interface CategoryCommission {
  id: string;
  category: string;
  rate: number;
}

export interface TierCommission {
  id: string;
  tier: string;
  rate: number;
}

export interface CommissionSettings {
  defaultRate: number;
  categoryRules: CategoryCommission[];
  tierRules: TierCommission[];
  withdrawalFeeFixed: number;
  withdrawalFeePct: number;
  revenueThisMonth: number;
  estimatedEarnings: number;
}

export const mockCommissionSettings: CommissionSettings = {
  defaultRate: 10,
  categoryRules: [
    { id: "cc1", category: "ผ้าไหม", rate: 10 },
    { id: "cc2", category: "ผ้าฝ้าย", rate: 8 },
    { id: "cc3", category: "แพรวา", rate: 12 },
    { id: "cc4", category: "Accessories", rate: 12 },
    { id: "cc5", category: "ย้อมคราม", rate: 8 },
  ],
  tierRules: [
    { id: "tc1", tier: "New Seller", rate: 12 },
    { id: "tc2", tier: "Verified", rate: 10 },
    { id: "tc3", tier: "Premium", rate: 8 },
  ],
  withdrawalFeeFixed: 20,
  withdrawalFeePct: 0,
  revenueThisMonth: 4680000,
  estimatedEarnings: 468000,
};

export interface SettingsAuditLog {
  id: string;
  actor: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export const mockSettingsAuditLog: SettingsAuditLog[] = [
  { id: "sa1", actor: "Admin A", field: "Default Commission", oldValue: "8%", newValue: "10%", timestamp: "2024-12-14 14:20" },
  { id: "sa2", actor: "Admin A", field: "ผ้าไหม Commission", oldValue: "9%", newValue: "10%", timestamp: "2024-12-12 10:00" },
  { id: "sa3", actor: "Admin A", field: "Maintenance Mode", oldValue: "ON", newValue: "OFF", timestamp: "2024-12-10 08:00" },
  { id: "sa4", actor: "Staff B", field: "Support Email", oldValue: "info@laya.co", newValue: "support@laya.co", timestamp: "2024-12-08 16:30" },
  { id: "sa5", actor: "Admin A", field: "Withdrawal Fee", oldValue: "฿30", newValue: "฿20", timestamp: "2024-12-05 11:00" },
];
