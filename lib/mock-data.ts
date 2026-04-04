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

export interface CustomPatternData {
  selectedPatterns?: string[];
  colors?: string[];
  weaveType?: string;
  region?: string;
  requiresGI?: boolean;
  complexity?: number;
  mood?: string;
  promptText?: string;
  patternStyle?: string;
  generatedImageUrl?: string;   // result from Nano Banana 2 API
  isMock?: boolean;             // true if Nano Banana ran out of credits
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
  { id: "fabric", name: "ผ้าผืน", icon: "fabric" },
  { id: "clothing", name: "เสื้อผ้า", icon: "clothing" },
  { id: "scarf", name: "ผ้าพันคอ", icon: "scarf" },
  { id: "bag", name: "กระเป๋า", icon: "bag" },
  { id: "premium", name: "ของฝาก", icon: "premium" },
  { id: "decor", name: "ของตกแต่งบ้าน", icon: "decor" },
  { id: "others", name: "อื่นๆ", icon: "others" },
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
    passport: {
      materials: ["ไหมไทยแท้ 100%", "เส้นไหมน้อย"],
      dyeType: "สีธรรมชาติ",
      dyeDetails: "ย้อมจากครั่ง มะเกลือ แก่นขนุน ให้สีแดง ดำ เหลืองทองตามธรรมชาติ",
      weavingTechnique: "ทอยกดอก",
      weavingDetails: "เทคนิคทอยกดอกด้วยกี่ทอมือแบบโบราณ ใช้ตะกรอยกลายกินรี ต้องใช้ความชำนาญสูง",
      productionSteps: [
        { step: 1, title: "เตรียมเส้นไหม", description: "สาวไหม ฟอก ย้อมสี ทำเส้นยืนและเส้นพุ่ง", date: "2024-11-01", icon: "fiber" },
        { step: 2, title: "ย้อมสีธรรมชาติ", description: "ย้อมครั่งสีแดง แก่นขนุนสีเหลือง มะเกลือสีดำ", date: "2024-11-05", icon: "dye" },
        { step: 3, title: "ทอยกดอก", description: "ทอด้วยกี่พื้นบ้าน ยกลายกินรีตามแบบโบราณ", date: "2024-11-10", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจลาย ความสม่ำเสมอของเนื้อผ้า และสีย้อม", date: "2024-11-22", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซักทำความสะอาด รีดเรียบ พับเก็บ", date: "2024-11-24", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุในกล่องผ้าไหมพร้อมใบรับรอง", date: "2024-11-25", icon: "ship" },
      ],
      carbonFootprint: "low",
      certifications: ["GI ลำพูน", "OTOP 5 ดาว", "มาตรฐานผ้าไหมไทย"],
      blockchainHash: "0x7a3b...f92e",
      verifiedDate: "2024-11-25",
    },
  },
  {
    id: "m1",
    name: "product1",
    community: "SILK BRAND",
    province: "กรุงเทพมหานคร",
    price: 8500,
    priceUnit: "เมตร",
    rating: 5.0,
    reviewCount: 45,
    images: ["/SILQ1.jpg"],
    hasGI: true,
    productionTime: "พร้อมส่ง",
    availableLength: 10,
    fabricType: "ผ้าไหม",
    story: "ผ้าไหมทอมือแบรนด์ระดับพรีเมียม SILQ คัดสรรเส้นไหมคุณภาพเยี่ยม ทอด้วยความประณีตระดับงานศิลป์ชิ้นเอก",
    weaverName: "SILQ Artisan",
    certificateId: "SILQ-2024-001",
  },
  {
    id: "m2",
    name: "Red Product2",
    community: "SILK BRAND",
    province: "กรุงเทพมหานคร",
    price: 9200,
    priceUnit: "เมตร",
    rating: 4.9,
    reviewCount: 32,
    images: ["/SILQ2.jpg"],
    hasGI: true,
    productionTime: "พร้อมส่ง",
    availableLength: 5,
    fabricType: "ผ้าไหม",
    story: "ผ้าไหมแพรวาดีไซน์ล้ำสมัยจาก SILQ ผสมผสานลวดลายดั้งเดิมและความโมเดิร์นได้อย่างลงตัว",
    weaverName: "SILQ Artisan",
    certificateId: "SILQ-2024-002",
  },
  {
    id: "m3",
    name: "ผ้าไหมมัดหมี่ SILQ (Classic)",
    community: "แบรนด์ SILQ",
    province: "กรุงเทพมหานคร",
    price: 7800,
    priceUnit: "เมตร",
    rating: 4.8,
    reviewCount: 56,
    images: ["/SILQ3.jpg"],
    hasGI: false,
    productionTime: "พร้อมส่ง",
    availableLength: 15,
    fabricType: "ผ้าไหม",
    story: "มัดหมี่ลายคลาสสิก เนื้อผ้าเงางาม น้ำหนักเบา ทิ้งตัวสวย เหมาะสำหรับสวมใส่ออกงานสำคัญ",
    weaverName: "SILQ Artisan",
    certificateId: "SILQ-2024-003",
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
    passport: {
      materials: ["ไหมไทย", "เส้นไหมน้อย"],
      dyeType: "สีเคมีปลอดภัย",
      dyeDetails: "ใช้สีเคมีที่ได้มาตรฐานปลอดภัย ย้อมตามสูตรดั้งเดิมของชุมชน",
      weavingTechnique: "มัดหมี่",
      weavingDetails: "เทคนิคมัดหมี่แบบอีสานดั้งเดิม มัดลายก่อนย้อม สร้างลวดลายนาคราชอันซับซ้อน",
      productionSteps: [
        { step: 1, title: "เตรียมเส้นไหม", description: "สาวไหม ตีเกลียว เตรียมเส้นยืน", date: "2024-10-15", icon: "fiber" },
        { step: 2, title: "มัดลายและย้อมสี", description: "มัดเส้นพุ่งตามลวดลายนาคราช แล้วย้อมสีหลายรอบ", date: "2024-10-20", icon: "dye" },
        { step: 3, title: "ทอผ้า", description: "ทอด้วยกี่กระตุก สอดเส้นพุ่งมัดหมี่ตามลาย", date: "2024-10-25", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจความถูกต้องของลายและคุณภาพเนื้อผ้า", date: "2024-11-01", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซัก รีด ตกแต่งขอบผ้า", date: "2024-11-03", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุพร้อมใบรับรองแหล่งกำเนิด", date: "2024-11-04", icon: "ship" },
      ],
      carbonFootprint: "low",
      certifications: ["มาตรฐานผ้าไหมไทย", "สินค้า OTOP"],
      blockchainHash: "0x4e2c...a81d",
      verifiedDate: "2024-11-04",
    },
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
    passport: {
      materials: ["ฝ้ายอินทรีย์ 100%", "เส้นฝ้ายปั่นมือ"],
      dyeType: "สีธรรมชาติ",
      dyeDetails: "ย้อมครามธรรมชาติจากต้นครามพื้นถิ่น หมักน้ำครามตามวิธีโบราณ ย้อมซ้ำ 15-20 รอบ",
      weavingTechnique: "ทอพื้น",
      weavingDetails: "ทอด้วยกี่เอวแบบดั้งเดิม สร้างเนื้อผ้าที่นุ่ม ระบายอากาศดี",
      productionSteps: [
        { step: 1, title: "ปั่นฝ้าย", description: "ปั่นฝ้ายอินทรีย์ด้วยมือ ทำเส้นด้าย", date: "2024-10-01", icon: "fiber" },
        { step: 2, title: "หมักย้อมคราม", description: "หมักน้ำครามธรรมชาติ ย้อมซ้ำ 15-20 รอบจนได้สีครามเข้ม", date: "2024-10-05", icon: "dye" },
        { step: 3, title: "ทอผ้า", description: "ทอด้วยกี่เอวแบบดั้งเดิม", date: "2024-10-12", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจความสม่ำเสมอของสีและเนื้อผ้า", date: "2024-10-18", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซักน้ำสะอาด ตากแดด ทำให้ผ้านุ่ม", date: "2024-10-20", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุพร้อมใบรับรอง GI สกลนคร", date: "2024-10-21", icon: "ship" },
      ],
      carbonFootprint: "low",
      certifications: ["GI สกลนคร", "OTOP 5 ดาว", "ผ้าฝ้ายอินทรีย์", "มาตรฐาน มผช."],
      blockchainHash: "0x9d1f...c73b",
      verifiedDate: "2024-10-21",
    },
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
    passport: {
      materials: ["ไหมไทยแท้ 100%", "เส้นไหมน้อย", "เส้นไหมใหญ่"],
      dyeType: "สีธรรมชาติผสมเคมี",
      dyeDetails: "ใช้สีธรรมชาติจากครั่ง มะเกลือ ผสมสีเคมีปลอดภัย เพื่อความคงทนของสี",
      weavingTechnique: "ทอขิด",
      weavingDetails: "เทคนิคขิดเก็บลาย สร้างลวดลายซับซ้อนเกินร้อยลาย ต้องใช้เวลาทอนานถึง 30 วันต่อผืน",
      productionSteps: [
        { step: 1, title: "เตรียมเส้นไหม", description: "สาวไหม ฟอก ตีเกลียว เตรียมเส้นยืนและเส้นพุ่ง", date: "2024-09-01", icon: "fiber" },
        { step: 2, title: "ย้อมสี", description: "ย้อมสีธรรมชาติและเคมีปลอดภัยตามสูตรโบราณ", date: "2024-09-08", icon: "dye" },
        { step: 3, title: "ทอขิดเก็บลาย", description: "ทอด้วยเทคนิคขิดสร้างลวดลายแพรวาซับซ้อน ใช้เวลา 20-30 วัน", date: "2024-09-15", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจลายขิด ความละเอียด และคุณภาพเนื้อผ้า", date: "2024-10-10", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซักรีด ตกแต่งชายผ้า", date: "2024-10-12", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุในกล่องพิเศษพร้อมใบรับรอง", date: "2024-10-13", icon: "ship" },
      ],
      carbonFootprint: "low",
      certifications: ["GI กาฬสินธุ์", "OTOP 5 ดาว", "มาตรฐานผ้าไหมไทย", "UNESCO Intangible Heritage"],
      blockchainHash: "0x2f8a...d45c",
      verifiedDate: "2024-10-13",
    },
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
    passport: {
      materials: ["ฝ้ายพื้นเมือง", "ไหมประดิษฐ์"],
      dyeType: "สีเคมีปลอดภัย",
      dyeDetails: "ใช้สีเคมีที่ผ่านมาตรฐานความปลอดภัย ย้อมตามสูตรดั้งเดิมของชาวไท-ยวน",
      weavingTechnique: "ทอจก",
      weavingDetails: "เทคนิคจกด้วยขนเม่น สร้างลวดลายดอกพิกุลอันเป็นเอกลักษณ์ของชาวไท-ยวน",
      productionSteps: [
        { step: 1, title: "เตรียมเส้นด้าย", description: "กรอเส้นฝ้ายและไหมประดิษฐ์ เตรียมเส้นยืน", date: "2024-10-10", icon: "fiber" },
        { step: 2, title: "ย้อมสี", description: "ย้อมสีตามสูตรดั้งเดิม สีแดง เหลือง เขียว", date: "2024-10-14", icon: "dye" },
        { step: 3, title: "ทอจก", description: "ทอจกด้วยขนเม่นหรือไม้จก สร้างลายดอกพิกุล", date: "2024-10-18", icon: "weave" },
        { step: 4, title: "ตรวจสอบคุณภาพ", description: "ตรวจลายจก ความสมมาตร และสีสัน", date: "2024-10-30", icon: "inspect" },
        { step: 5, title: "ตกแต่งสำเร็จ", description: "ซัก รีด ตกแต่งชายผ้า", date: "2024-11-01", icon: "finish" },
        { step: 6, title: "พร้อมจัดส่ง", description: "บรรจุพร้อมใบรับรองแหล่งกำเนิด", date: "2024-11-02", icon: "ship" },
      ],
      carbonFootprint: "medium",
      certifications: ["สินค้า OTOP", "มาตรฐาน มผช."],
      blockchainHash: "0x5c3e...b17a",
      verifiedDate: "2024-11-02",
    },
  },
  {
    id: "bag1",
    name: "พวงกุญแจผ้าทอ LAYA (Small)",
    community: "ชุมชนหริภุญชัย",
    province: "ลำพูน",
    price: 1250,
    priceUnit: "ชิ้น",
    rating: 4.9,
    reviewCount: 34,
    images: ["/bag1.png"],
    hasGI: false,
    productionTime: "พร้อมส่ง",
    availableLength: 100,
    fabricType: "ผ้าทอมือ",
    story: "พวงกุญแจผ้าทอมือขนาดเล็ก ตัดเย็บจากเศษผ้าไหมพรีเมียมของชุมชน ดีไซน์ทันสมัยพกพาสะดวก",
    weaverName: "กลุ่มสตรีหริภุญชัย",
    certificateId: "LAYA-BAG-001",
  },
  {
    id: "bag2",
    name: "กระเป๋าถือลายวิจิตร (Classic Tote)",
    community: "ชุมชนหริภุญชัย",
    province: "ลำพูน",
    price: 4500,
    priceUnit: "ชิ้น",
    rating: 5.0,
    reviewCount: 12,
    images: ["/bag2.png"],
    hasGI: true,
    productionTime: "พร้อมส่ง",
    availableLength: 5,
    fabricType: "ผ้าไหม",
    story: "กระเป๋าถือทรง Tote ใบใหญ่ ทอด้วยลวดลายวิจิตรบรรจง แข็งแรงทนทาน จุของได้เยอะ เหมาะสำหรับใช้งานในชีวิตประจำวัน",
    weaverName: "แม่สมศรี แก้วมณี",
    certificateId: "LAYA-BAG-002",
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

export interface Weaver {
  id: string;
  name: string;
  community: string;
  province: string;
  rating: number;
  reviewCount: number;
  avatar?: string;
  techniques: string[];
  complexityLimit: number; // 1-10
  colorsInStock: string[]; // Hex or Names
  experienceYears: number;
  isGI: boolean;
  basePrice: number;
  leadTimeDays: number;
  status: "available" | "busy" | "waiting";
  recentWorks: string[]; // Image URLs
}

export const weavers: Weaver[] = [
  {
    id: "w1",
    name: "แม่สมจิตร ใจดี",
    community: "ชุมชนหริภุญชัย",
    province: "ลำพูน",
    rating: 4.9,
    reviewCount: 84,
    avatar: "https://images.unsplash.com/photo-1582213726893-edc10ff67df0?auto=format&fit=crop&w=300&h=300",
    techniques: ["ยกดอก", "ผ้าไหม", "ฝ้าย"],
    complexityLimit: 9,
    colorsInStock: ["#1B2A4A", "#CFA055", "#4B0082", "#800000"],
    experienceYears: 32,
    isGI: true,
    basePrice: 3500,
    leadTimeDays: 12,
    status: "available",
    recentWorks: ["/images/fabric1.jpg", "/images/fabric2.jpg"],
  },
  {
    id: "w2",
    name: "แม่ประนอม สีทอง",
    community: "กลุ่มทอผ้าบ้านเขว้า",
    province: "ชัยภูมิ",
    rating: 4.7,
    reviewCount: 52,
    avatar: "https://images.unsplash.com/photo-1540914129656-4987d176cfde?auto=format&fit=crop&w=300&h=300",
    techniques: ["มัดหมี่", "ขิด"],
    complexityLimit: 7,
    colorsInStock: ["#1B2A4A", "#FFFFFF", "#CFA055"],
    experienceYears: 18,
    isGI: false,
    basePrice: 2800,
    leadTimeDays: 15,
    status: "available",
    recentWorks: ["/images/fabric2.jpg"],
  },
  {
    id: "w3",
    name: "ป้าบุญส่ง ดวงดี",
    community: "กลุ่มทอผ้าครามสกลนคร",
    province: "สกลนคร",
    rating: 4.8,
    reviewCount: 120,
    avatar: "บ",
    techniques: ["ทอพื้น", "มัดหมี่", "ย้อมคราม"],
    complexityLimit: 6,
    colorsInStock: ["#1B2A4A", "#FFFFFF"],
    experienceYears: 25,
    isGI: true,
    basePrice: 1800,
    leadTimeDays: 7,
    status: "available",
    recentWorks: ["/images/fabric4.jpg"],
  },
  {
    id: "w4",
    name: "คุณน้านภา ทอรัก",
    community: "กลุ่มทอผ้าแพรวาคำเขื่อนแก้ว",
    province: "กาฬสินธุ์",
    rating: 5.0,
    reviewCount: 42,
    avatar: "น",
    techniques: ["ขิด", "แพรวา"],
    complexityLimit: 10,
    colorsInStock: ["#1B2A4A", "#800000", "#CFA055", "#000000"],
    experienceYears: 40,
    isGI: true,
    basePrice: 5500,
    leadTimeDays: 25,
    status: "available",
    recentWorks: ["/images/fabric5.jpg"],
  }
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

