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

export const banners: Banner[] = [
  {
    id: "1",
    title: "ลายผ้าคู่บ้านคู่เมือง",
    subtitle: "ผ้าไหมมัดหมี่ลายโบราณ\nจากชุมชนทอผ้า จ.ขอนแก่น",
    image: "/images/banner1.jpg",
  },
  {
    id: "2",
    title: "สืบสานภูมิปัญญา",
    subtitle: "ผ้าทอมือจากชุมชน\nสู่แฟชั่นร่วมสมัย",
    image: "/images/banner2.jpg",
  },
];

export const categories: Category[] = [
  { id: "silk", name: "ผ้าไหม", icon: "silk" },
  { id: "cotton", name: "ผ้าฝ้าย", icon: "cotton" },
  { id: "gi", name: "GI", icon: "gi" },
  { id: "province", name: "ตามจังหวัด", icon: "province" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "ผ้ายกลายกินรีหริภุญชัย",
    community: "ชุมชนหริภุญชัย",
    province: "ลำพูน",
    price: 3500,
    priceUnit: "เมตร",
    rating: 4.8,
    reviewCount: 120,
    images: ["/images/fabric1.jpg", "/images/fabric2.jpg", "/images/fabric3.jpg"],
    hasGI: true,
    productionTime: "12-15 วัน",
    availableLength: 20,
    fabricType: "ผ้าไหม",
    story:
      "ลายกินรีอันวิจิตร ละเอียดถึงตำนานนางกินรี หงส์ลำพูน และความอุดมของภูมิปัญญาท้องถิ่น ผ้าทอมือทุกผืนถูกทอด้วยความพิถีพิถัน สืบทอดมากว่า 200 ปี",
    weaverName: "คุณสมศรี แก้วมณี",
    certificateId: "LAYA-2024-001",
  },
  {
    id: "2",
    name: "ผ้ามัดหมี่ลายนาคราช",
    community: "กลุ่มทอผ้าบ้านเขว้า",
    province: "ชัยภูมิ",
    price: 2800,
    priceUnit: "เมตร",
    rating: 4.6,
    reviewCount: 89,
    images: ["/images/fabric2.jpg", "/images/fabric1.jpg", "/images/fabric4.jpg"],
    hasGI: false,
    productionTime: "10-14 วัน",
    availableLength: 15,
    fabricType: "ผ้าไหม",
    story:
      "ลายนาคราชเป็นลายโบราณที่สื่อถึงความอุดมสมบูรณ์ของแผ่นดินอีสาน ทอด้วยเทคนิคมัดหมี่ดั้งเดิม",
    weaverName: "คุณประนอม ทองดี",
    certificateId: "LAYA-2024-002",
  },
  {
    id: "3",
    name: "ผ้าฝ้ายย้อมคราม",
    community: "กลุ่มทอผ้าครามสกลนคร",
    province: "สกลนคร",
    price: 1500,
    priceUnit: "เมตร",
    rating: 4.9,
    reviewCount: 205,
    images: ["/images/fabric4.jpg", "/images/fabric5.jpg", "/images/fabric1.jpg"],
    hasGI: true,
    productionTime: "7-10 วัน",
    availableLength: 30,
    fabricType: "ผ้าฝ้าย",
    story:
      "ผ้าฝ้ายย้อมครามธรรมชาติ สีครามแท้จากต้นครามพื้นถิ่น ย้อมด้วยกรรมวิธีโบราณ ให้สีสวยงามเป็นเอกลักษณ์",
    weaverName: "คุณบัวลอย สุขสวัสดิ์",
    certificateId: "LAYA-2024-003",
  },
  {
    id: "4",
    name: "ผ้าไหมแพรวา",
    community: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว",
    province: "กาฬสินธุ์",
    price: 5000,
    priceUnit: "เมตร",
    rating: 4.7,
    reviewCount: 67,
    images: ["/images/fabric5.jpg", "/images/fabric3.jpg", "/images/fabric2.jpg"],
    hasGI: true,
    productionTime: "20-30 วัน",
    availableLength: 10,
    fabricType: "ผ้าไหม",
    story:
      "ผ้าแพรวาเป็นราชินีแห่งผ้าไหมอีสาน มีลวดลายซับซ้อนงดงาม ทอด้วยเทคนิคขิดที่ต้องใช้ความชำนาญสูง",
    weaverName: "คุณทองใบ ภูมิพันธ์",
    certificateId: "LAYA-2024-004",
  },
  {
    id: "5",
    name: "ผ้าจกลายดอกพิกุล",
    community: "กลุ่มทอผ้าจกราชบุรี",
    province: "ราชบุรี",
    price: 2200,
    priceUnit: "เมตร",
    rating: 4.5,
    reviewCount: 93,
    images: ["/images/fabric3.jpg", "/images/fabric1.jpg", "/images/fabric5.jpg"],
    hasGI: false,
    productionTime: "14-18 วัน",
    availableLength: 12,
    fabricType: "ผ้าฝ้าย",
    story:
      "ผ้าจกลายดอกพิกุลเป็นลายโบราณของชาวไท-ยวน ราชบุรี สะท้อนความงดงามของธรรมชาติและวิถีชีวิต",
    weaverName: "คุณสมจิตร บุญมา",
    certificateId: "LAYA-2024-005",
  },
];

export interface Community {
  id: string;
  name: string;
  province: string;
  image: string;
  memberCount: number;
  productCount: number;
}

export const communities: Community[] = [
  {
    id: "c1",
    name: "ชุมชนหริภุญชัย",
    province: "ลำพูน",
    image: "/images/community1.jpg",
    memberCount: 45,
    productCount: 28,
  },
  {
    id: "c2",
    name: "กลุ่มทอผ้าบ้านเขว้า",
    province: "ชัยภูมิ",
    image: "/images/weaver1.jpg",
    memberCount: 32,
    productCount: 19,
  },
  {
    id: "c3",
    name: "กลุ่มทอผ้าครามสกลนคร",
    province: "สกลนคร",
    image: "/images/fabric4.jpg",
    memberCount: 58,
    productCount: 35,
  },
];

export const matchResults = [
  {
    id: "1",
    product: products[0],
    matchScore: 95,
    estimatedPrice: 3500,
    estimatedTime: "12-15 วัน",
  },
  {
    id: "2",
    product: products[3],
    matchScore: 88,
    estimatedPrice: 5000,
    estimatedTime: "20-30 วัน",
  },
  {
    id: "3",
    product: products[1],
    matchScore: 82,
    estimatedPrice: 2800,
    estimatedTime: "10-14 วัน",
  },
];
