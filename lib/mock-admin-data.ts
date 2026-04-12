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
  { id: "1", name: "ผ้ายกลายกินรีหริภุญชัย", image: "/images/fabric1.jpg", revenue: 540000, unitsSold: 300, rating: 4.8, community: "ชุมชนหริภุญชัย" },
  { id: "3", name: "ผ้าฝ้ายย้อมคราม", image: "/images/fabric4.jpg", revenue: 450000, unitsSold: 300, rating: 4.9, community: "กลุ่มทอผ้าครามสกลนคร" },
  { id: "4", name: "ผ้าไหมแพรวา", image: "/images/fabric5.jpg", revenue: 350000, unitsSold: 70, rating: 4.7, community: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว" },
  { id: "teenager1", name: "ชุดเซ็ตผ้าไหม 'วัยรุ่นเดอะ'", image: "/teenager1.png", revenue: 409600, unitsSold: 128, rating: 4.9, community: "กลุ่มคนรุ่นใหม่หริภุญชัย" },
  { id: "2", name: "ผ้ามัดหมี่ลายนาคราช", image: "/images/fabric2.jpg", revenue: 308000, unitsSold: 110, rating: 4.6, community: "กลุ่มทอผ้าบ้านเขว้า" },
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
export interface AdminOrder {
  id: string;
  customerName: string;
  items: number;
  total: number;
  status: "pending" | "confirmed" | "producing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  date: string;
  community: string;
}

export const mockAdminOrders: AdminOrder[] = [
  { id: "ORD-2024-1405", customerName: "สมชาย มั่นคง", items: 3, total: 8500, status: "pending", paymentStatus: "pending", date: "2024-12-14", community: "ชุมชนหริภุญชัย" },
  { id: "ORD-2024-1404", customerName: "กานดา วรรณ", items: 1, total: 5000, status: "confirmed", paymentStatus: "paid", date: "2024-12-14", community: "กลุ่มทอผ้าแพรวา" },
  { id: "ORD-2024-1403", customerName: "Nadia Schmidt", items: 2, total: 3600, status: "producing", paymentStatus: "paid", date: "2024-12-13", community: "กลุ่มทอผ้าครามสกลนคร" },
  { id: "ORD-2024-1402", customerName: "ประเสริฐ จันทร์", items: 1, total: 2800, status: "shipped", paymentStatus: "paid", date: "2024-12-12", community: "กลุ่มทอผ้าบ้านเขว้า" },
  { id: "ORD-2024-1401", customerName: "วิภา ศรีสุข", items: 2, total: 4200, status: "delivered", paymentStatus: "paid", date: "2024-12-11", community: "ชุมชนหริภุญชัย" },
  { id: "ORD-2024-1400", customerName: "John Smith", items: 1, total: 1800, status: "cancelled", paymentStatus: "refunded", date: "2024-12-10", community: "กลุ่มทอผ้าบ้านเขว้า" },
  { id: "ORD-2024-1399", customerName: "สุมาลี ใจงาม", items: 4, total: 12500, status: "delivered", paymentStatus: "paid", date: "2024-12-10", community: "กลุ่มทอผ้าแพรวา" },
  { id: "ORD-2024-1398", customerName: "ธนา คำแก้ว", items: 1, total: 3200, status: "producing", paymentStatus: "paid", date: "2024-12-09", community: "กลุ่มคนรุ่นใหม่หริภุญชัย" },
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
  { id: "1", name: "ผ้ายกลายกินรีหริภุญชัย", image: "/images/fabric1.jpg", community: "ชุมชนหริภุญชัย", province: "ลำพูน", price: 1800, stock: 20, status: "active", hasGI: true, soldCount: 300, rating: 4.8 },
  { id: "2", name: "ผ้ามัดหมี่ลายนาคราช", image: "/images/fabric2.jpg", community: "กลุ่มทอผ้าบ้านเขว้า", province: "ชัยภูมิ", price: 2800, stock: 15, status: "active", hasGI: false, soldCount: 110, rating: 4.6 },
  { id: "3", name: "ผ้าฝ้ายย้อมคราม", image: "/images/fabric4.jpg", community: "กลุ่มทอผ้าครามสกลนคร", province: "สกลนคร", price: 1500, stock: 30, status: "active", hasGI: true, soldCount: 300, rating: 4.9 },
  { id: "4", name: "ผ้าไหมแพรวา", image: "/images/fabric5.jpg", community: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว", province: "กาฬสินธุ์", price: 5000, stock: 10, status: "active", hasGI: true, soldCount: 70, rating: 4.7 },
  { id: "5", name: "ผ้าจกลายดอกพิกุล", image: "/images/fabric3.jpg", community: "กลุ่มทอผ้าจกราชบุรี", province: "ราชบุรี", price: 2200, stock: 0, status: "out_of_stock", hasGI: false, soldCount: 93, rating: 4.5 },
  { id: "teenager1", name: "ชุดเซ็ตผ้าไหม 'วัยรุ่นเดอะ'", image: "/teenager1.png", community: "กลุ่มคนรุ่นใหม่หริภุญชัย", province: "ลำพูน", price: 3200, stock: 10, status: "active", hasGI: true, soldCount: 128, rating: 4.9 },
  { id: "bag1", name: "พวงกุญแจผ้าทอ LAYA (Small)", image: "/bag1.png", community: "ชุมชนหริภุญชัย", province: "ลำพูน", price: 1250, stock: 100, status: "active", hasGI: false, soldCount: 34, rating: 4.9 },
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
