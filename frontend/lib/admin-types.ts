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
