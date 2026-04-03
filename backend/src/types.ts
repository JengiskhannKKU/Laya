// Shared types mirroring lib/mock-data.ts on the frontend

export interface ProductionStep {
  step: number;
  title: string;
  description: string;
  date: string;
  icon: "fiber" | "dye" | "weave" | "inspect" | "finish" | "ship";
}

export interface PassportData {
  materials: string[];
  dyeType: string;
  dyeDetails: string;
  weavingTechnique: string;
  weavingDetails: string;
  productionSteps: ProductionStep[];
  carbonFootprint: "low" | "medium" | "high";
  certifications: string[];
  blockchainHash: string;
  verifiedDate: string;
}

export interface Product {
  id: string;
  name: string;
  community: string;
  province: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  images: string[];
  hasGI: boolean;
  productionTime: string;
  availableLength: number;
  fabricType: string;
  story: string;
  weaverName: string;
  certificateId: string;
  passport?: PassportData;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

export interface Community {
  id: string;
  name: string;
  province: string;
  image: string;
  memberCount: number;
  productCount: number;
}

export interface Order {
  id?: number;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt?: string;
}

export interface AIGenerateRequest {
  prompt: string;
  basePatterns?: string[];
  colorPalette?: string[];
}

export interface AIGenerateResponse {
  patternId: string;
  prompt: string;
  matchedProducts: Product[];
  estimatedPrice: number;
  suggestedColors: string[];
  generatedAt: string;
}
