/**
 * LAYA Garment Creator V2 — Configuration
 * ทุกชิ้นส่วน/preset/slider/ผ้า/ราคา ขับเคลื่อนจาก config นี้ (ไม่ hardcode ใน UI)
 * เพิ่ม garment type หรือ component ใหม่ได้โดยไม่แตะโค้ด UI/3D
 */

export type GarmentType = 'shirt' | 'pants' | 'skirt';

// ─── Definitions ─────────────────────────────────────────────────────────────
export interface PresetDef {
  id: string;
  label: string;
  price?: number;
  /** ค่า params เริ่มต้นเมื่อเลือก preset นี้ */
  params?: Record<string, number>;
}

export interface SliderDef {
  id: string;
  label: string;
  min: number;
  max: number;
  def: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  unit?: string;
}

export interface ComponentDef {
  id: string;
  label: string;
  /** สไตล์ให้เลือกจาก Asset Library */
  presets?: PresetDef[];
  sliders?: SliderDef[];
  /** รับผ้า (drag & drop) ได้ */
  acceptsFabric?: boolean;
  /** รับงานตกแต่ง (drag & drop) ได้ */
  acceptsDecoration?: boolean;
  /** ปริมาณผ้าที่ใช้ (เมตร) สำหรับคิดราคา */
  meters?: number;
  /** ทิศทางแยกชิ้นใน exploded view */
  explode?: [number, number, number];
}

export interface GarmentDef {
  id: GarmentType;
  label: string;
  components: ComponentDef[];
  basePrice: number;
  baseDays: [number, number];
}

export interface FabricDef {
  id: string;
  name: string;
  origin: string;
  image: string;
  pricePerMeter: number;
  tab: 'silk' | 'cotton' | 'blend';
}

export interface DecorationDef {
  id: string;
  label: string;
  price: number;
  color: string;
  /** ต้องมีขั้นต่ำ (MOQ) */
  moq?: number;
}

// ─── Part state (runtime) ────────────────────────────────────────────────────
export interface PartState {
  preset: string;
  params: Record<string, number>;
  fabricId?: string;
  color?: string;
  stitch: string;
  /** เลเยอร์ตกแต่ง เรียงลำดับได้แบบ Photoshop */
  decorations: string[];
  visible: boolean;
}

export interface GarmentState {
  type: GarmentType;
  parts: Record<string, PartState>;
}

// ─── Catalog: เสื้อ ──────────────────────────────────────────────────────────
const SHIRT: GarmentDef = {
  id: 'shirt',
  label: 'เสื้อ',
  basePrice: 850,
  baseDays: [7, 12],
  components: [
    {
      id: 'body', label: 'ตัวเสื้อ', acceptsFabric: true, acceptsDecoration: true, meters: 1.6,
      explode: [0, 0, 0],
      presets: [
        { id: 'regular', label: 'ทรงปกติ' },
        { id: 'slim', label: 'เข้ารูป', params: { fit: 25 } },
        { id: 'oversized', label: 'โอเวอร์ไซซ์', price: 120, params: { fit: 90 } },
        { id: 'crop', label: 'ครอป', price: 80, params: { length: 20 } },
        { id: 'longline', label: 'ตัวยาว', price: 150, params: { length: 90 } },
      ],
      sliders: [
        { id: 'length', label: 'ความยาวตัว', min: 0, max: 100, def: 50, minLabel: 'สั้น', maxLabel: 'ยาว' },
        { id: 'fit', label: 'ทรง', min: 0, max: 100, def: 50, minLabel: 'เข้ารูป', maxLabel: 'หลวม' },
      ],
    },
    {
      id: 'collar', label: 'คอเสื้อ / ปก', acceptsFabric: true, acceptsDecoration: true, meters: 0.15,
      explode: [0, 1.1, 0],
      presets: [
        { id: 'none', label: 'ไม่มีปก' },
        { id: 'mandarin', label: 'คอจีน', price: 60 },
        { id: 'stand', label: 'คอตั้ง', price: 60, params: { height: 70 } },
        { id: 'shirt', label: 'ปกเชิ้ต', price: 80 },
        { id: 'spread', label: 'ปกกว้าง', price: 80, params: { width: 85 } },
        { id: 'hood', label: 'ฮู้ด', price: 200 },
      ],
      sliders: [
        { id: 'height', label: 'ความสูงปก', min: 0, max: 100, def: 40 },
        { id: 'width', label: 'ความกว้างปก', min: 0, max: 100, def: 50 },
      ],
    },
    {
      id: 'placket', label: 'สาบหน้า', acceptsFabric: true, meters: 0.1,
      explode: [0, 0, 0.9],
      presets: [
        { id: 'standard', label: 'สาบมาตรฐาน' },
        { id: 'hidden', label: 'สาบซ่อนกระดุม', price: 90 },
        { id: 'none', label: 'ไม่มีสาบ (สวมหัว)' },
      ],
    },
    {
      id: 'buttons', label: 'กระดุม',
      explode: [0, 0, 1.4],
      presets: [
        { id: 'round', label: 'กลมคลาสสิก' },
        { id: 'pearl', label: 'มุก', price: 90 },
        { id: 'wood', label: 'ไม้', price: 60 },
        { id: 'gold', label: 'โลหะทอง', price: 150 },
        { id: 'knot', label: 'กระดุมจีน (ผ้าถัก)', price: 120 },
      ],
      sliders: [
        { id: 'count', label: 'จำนวนเม็ด', min: 3, max: 9, def: 6, step: 1, unit: 'เม็ด' },
        { id: 'size', label: 'ขนาด', min: 0, max: 100, def: 40, minLabel: 'เล็ก', maxLabel: 'ใหญ่' },
      ],
    },
    {
      id: 'sleeveL', label: 'แขนซ้าย', acceptsFabric: true, acceptsDecoration: true, meters: 0.45,
      explode: [1.4, 0.3, 0],
      presets: [
        { id: 'long', label: 'แขนยาว', params: { length: 100 } },
        { id: 'threeq', label: 'แขน 3/4', params: { length: 72 } },
        { id: 'short', label: 'แขนสั้น', params: { length: 32 } },
        { id: 'sleeveless', label: 'แขนกุด', params: { length: 0 } },
        { id: 'puff', label: 'แขนพอง', price: 150, params: { length: 38, width: 85 } },
        { id: 'balloon', label: 'บอลลูน', price: 180, params: { length: 95, width: 90 } },
        { id: 'bell', label: 'ปลายบาน', price: 150, params: { length: 95, width: 70 } },
      ],
      sliders: [
        { id: 'length', label: 'ความยาวแขน', min: 0, max: 100, def: 100, minLabel: 'กุด', maxLabel: 'ยาว' },
        { id: 'width', label: 'ความกว้างแขน', min: 0, max: 100, def: 35, minLabel: 'สลิม', maxLabel: 'โอเวอร์' },
      ],
    },
    {
      id: 'sleeveR', label: 'แขนขวา', acceptsFabric: true, acceptsDecoration: true, meters: 0.45,
      explode: [-1.4, 0.3, 0],
      presets: [
        { id: 'long', label: 'แขนยาว', params: { length: 100 } },
        { id: 'threeq', label: 'แขน 3/4', params: { length: 72 } },
        { id: 'short', label: 'แขนสั้น', params: { length: 32 } },
        { id: 'sleeveless', label: 'แขนกุด', params: { length: 0 } },
        { id: 'puff', label: 'แขนพอง', price: 150, params: { length: 38, width: 85 } },
        { id: 'balloon', label: 'บอลลูน', price: 180, params: { length: 95, width: 90 } },
        { id: 'bell', label: 'ปลายบาน', price: 150, params: { length: 95, width: 70 } },
      ],
      sliders: [
        { id: 'length', label: 'ความยาวแขน', min: 0, max: 100, def: 100, minLabel: 'กุด', maxLabel: 'ยาว' },
        { id: 'width', label: 'ความกว้างแขน', min: 0, max: 100, def: 35, minLabel: 'สลิม', maxLabel: 'โอเวอร์' },
      ],
    },
    {
      id: 'pocket', label: 'กระเป๋าอก', acceptsFabric: true, acceptsDecoration: true, meters: 0.1,
      explode: [0.9, 0.5, 0.9],
      presets: [
        { id: 'none', label: 'ไม่มี' },
        { id: 'patch', label: 'กระเป๋าแปะ', price: 80 },
        { id: 'flap', label: 'มีฝาปิด', price: 120 },
        { id: 'welt', label: 'เจาะเรียบ', price: 140 },
      ],
      sliders: [
        { id: 'size', label: 'ขนาดกระเป๋า', min: 0, max: 100, def: 45, minLabel: 'เล็ก', maxLabel: 'ใหญ่' },
        { id: 'y', label: 'ตำแหน่งสูง-ต่ำ', min: 0, max: 100, def: 60 },
      ],
    },
    {
      id: 'hem', label: 'ชายเสื้อ', acceptsFabric: true, meters: 0.1,
      explode: [0, -1.1, 0],
      presets: [
        { id: 'straight', label: 'ตรง' },
        { id: 'curved', label: 'โค้ง', price: 60 },
        { id: 'asym', label: 'เฉียงอสมมาตร', price: 120 },
        { id: 'slit', label: 'ผ่าข้าง', price: 80 },
      ],
      sliders: [
        { id: 'curve', label: 'ความโค้งชาย', min: 0, max: 100, def: 0, minLabel: 'ตรง', maxLabel: 'โค้ง' },
      ],
    },
  ],
};

// ─── Catalog: กางเกง ─────────────────────────────────────────────────────────
const PANTS: GarmentDef = {
  id: 'pants',
  label: 'กางเกง',
  basePrice: 950,
  baseDays: [7, 12],
  components: [
    {
      id: 'waistband', label: 'ขอบเอว', acceptsFabric: true, meters: 0.2,
      explode: [0, 1.0, 0],
      presets: [
        { id: 'flat', label: 'ขอบเรียบ' },
        { id: 'elastic', label: 'ยางยืด', price: 60 },
        { id: 'drawstring', label: 'เชือกรูด', price: 80 },
        { id: 'paperbag', label: 'เปเปอร์แบ็ก', price: 150 },
      ],
      sliders: [
        { id: 'rise', label: 'ระดับเอว', min: 0, max: 100, def: 60, minLabel: 'ต่ำ', maxLabel: 'สูง' },
      ],
    },
    {
      id: 'legL', label: 'ขาซ้าย', acceptsFabric: true, acceptsDecoration: true, meters: 0.7,
      explode: [0.9, -0.5, 0],
      presets: [
        { id: 'straight', label: 'ขากระบอก' },
        { id: 'slim', label: 'ขาเดฟ', params: { opening: 12 } },
        { id: 'wide', label: 'ขาบานกว้าง', price: 120, params: { opening: 92 } },
        { id: 'shorts', label: 'ขาสั้น', params: { length: 25 } },
        { id: 'cropped', label: 'ห้าส่วน', params: { length: 68 } },
      ],
      sliders: [
        { id: 'length', label: 'ความยาวขา', min: 15, max: 100, def: 100, minLabel: 'สั้น', maxLabel: 'ยาว' },
        { id: 'opening', label: 'ปลายขา', min: 0, max: 100, def: 45, minLabel: 'แคบ', maxLabel: 'บาน' },
      ],
    },
    {
      id: 'legR', label: 'ขาขวา', acceptsFabric: true, acceptsDecoration: true, meters: 0.7,
      explode: [-0.9, -0.5, 0],
      presets: [
        { id: 'straight', label: 'ขากระบอก' },
        { id: 'slim', label: 'ขาเดฟ', params: { opening: 12 } },
        { id: 'wide', label: 'ขาบานกว้าง', price: 120, params: { opening: 92 } },
        { id: 'shorts', label: 'ขาสั้น', params: { length: 25 } },
        { id: 'cropped', label: 'ห้าส่วน', params: { length: 68 } },
      ],
      sliders: [
        { id: 'length', label: 'ความยาวขา', min: 15, max: 100, def: 100, minLabel: 'สั้น', maxLabel: 'ยาว' },
        { id: 'opening', label: 'ปลายขา', min: 0, max: 100, def: 45, minLabel: 'แคบ', maxLabel: 'บาน' },
      ],
    },
    {
      id: 'pocket', label: 'กระเป๋า', acceptsFabric: true, meters: 0.15,
      explode: [1.1, 0.4, 0.6],
      presets: [
        { id: 'none', label: 'ไม่มี' },
        { id: 'side', label: 'กระเป๋าข้าง', price: 100 },
        { id: 'cargo', label: 'คาร์โก้', price: 180 },
        { id: 'coin', label: 'กระเป๋าเหรียญ', price: 60 },
      ],
      sliders: [
        { id: 'size', label: 'ขนาด', min: 0, max: 100, def: 50 },
      ],
    },
  ],
};

// ─── Catalog: กระโปรง ────────────────────────────────────────────────────────
const SKIRT: GarmentDef = {
  id: 'skirt',
  label: 'กระโปรง',
  basePrice: 780,
  baseDays: [6, 10],
  components: [
    {
      id: 'waistband', label: 'ขอบเอว', acceptsFabric: true, meters: 0.2,
      explode: [0, 1.0, 0],
      presets: [
        { id: 'flat', label: 'ขอบเรียบ' },
        { id: 'wide', label: 'ขอบกว้าง', price: 80 },
        { id: 'elastic', label: 'ยางยืด', price: 60 },
      ],
      sliders: [
        { id: 'rise', label: 'ระดับเอว', min: 0, max: 100, def: 70, minLabel: 'ต่ำ', maxLabel: 'สูง' },
      ],
    },
    {
      id: 'body', label: 'ตัวกระโปรง', acceptsFabric: true, acceptsDecoration: true, meters: 1.4,
      explode: [0, -0.3, 0],
      presets: [
        { id: 'aline', label: 'ทรงเอ', params: { flare: 55 } },
        { id: 'pencil', label: 'ทรงดินสอ', params: { flare: 8 } },
        { id: 'circle', label: 'ทรงวงกลม', price: 150, params: { flare: 100 } },
        { id: 'pleated', label: 'อัดพลีท', price: 200, params: { flare: 60 } },
        { id: 'wrap', label: 'ทรงป้าย', price: 120, params: { flare: 40 } },
        { id: 'sarong', label: 'ซิ่นไทย', price: 180, params: { flare: 15 } },
      ],
      sliders: [
        { id: 'length', label: 'ความยาว', min: 20, max: 100, def: 65, minLabel: 'สั้น', maxLabel: 'ยาว' },
        { id: 'flare', label: 'ความบาน', min: 0, max: 100, def: 55, minLabel: 'ตรง', maxLabel: 'บาน' },
        { id: 'layers', label: 'จำนวนชั้น', min: 1, max: 4, def: 1, step: 1, unit: 'ชั้น' },
      ],
    },
    {
      id: 'hem', label: 'ชายกระโปรง', acceptsFabric: true, acceptsDecoration: true, meters: 0.15,
      explode: [0, -1.2, 0],
      presets: [
        { id: 'straight', label: 'เรียบตรง' },
        { id: 'ruffle', label: 'ระบาย', price: 150 },
        { id: 'asym', label: 'อสมมาตร', price: 120 },
        { id: 'goldtrim', label: 'ขลิบทอง (เชิงซิ่น)', price: 220 },
      ],
    },
  ],
};

export const GARMENTS: Record<GarmentType, GarmentDef> = { shirt: SHIRT, pants: PANTS, skirt: SKIRT };

// ─── Fabrics (inventory) ─────────────────────────────────────────────────────
export const FABRICS: FabricDef[] = [
  { id: 'silk-praewa', name: 'ไหมแพรวา', origin: 'กาฬสินธุ์', image: '/fabric_patterns/01.webp', pricePerMeter: 1450, tab: 'silk' },
  { id: 'silk-mudmee', name: 'ไหมมัดหมี่', origin: 'ขอนแก่น', image: '/fabric_patterns/05.webp', pricePerMeter: 1180, tab: 'silk' },
  { id: 'silk-yokdok', name: 'ไหมยกดอก', origin: 'ลำพูน', image: '/fabric_patterns/09.webp', pricePerMeter: 1650, tab: 'silk' },
  { id: 'silk-plain', name: 'ไหมเรียบ', origin: 'สุรินทร์', image: '/fabric_patterns/13.webp', pricePerMeter: 980, tab: 'silk' },
  { id: 'cotton-indigo', name: 'ฝ้ายย้อมคราม', origin: 'สกลนคร', image: '/fabric_patterns/21.webp', pricePerMeter: 420, tab: 'cotton' },
  { id: 'cotton-khid', name: 'ฝ้ายขิด', origin: 'อุดรธานี', image: '/fabric_patterns/25.webp', pricePerMeter: 380, tab: 'cotton' },
  { id: 'cotton-chiangmai', name: 'ฝ้ายเชียงใหม่', origin: 'เชียงใหม่', image: '/fabric_patterns/29.webp', pricePerMeter: 350, tab: 'cotton' },
  { id: 'cotton-loincloth', name: 'ฝ้ายขาวม้า', origin: 'ราชบุรี', image: '/fabric_patterns/33.webp', pricePerMeter: 280, tab: 'cotton' },
  { id: 'blend-linen', name: 'ลินินผสม', origin: 'นครพนม', image: '/fabric_patterns/41.webp', pricePerMeter: 520, tab: 'blend' },
  { id: 'blend-tencel', name: 'เทนเซลผสมไหม', origin: 'ชัยภูมิ', image: '/fabric_patterns/45.webp', pricePerMeter: 690, tab: 'blend' },
  { id: 'blend-jok', name: 'ผ้าจกผสม', origin: 'แพร่', image: '/fabric_patterns/49.webp', pricePerMeter: 750, tab: 'blend' },
  { id: 'blend-hemp', name: 'ใยกัญชง', origin: 'น่าน', image: '/fabric_patterns/53.webp', pricePerMeter: 580, tab: 'blend' },
];

export const DEFAULT_FABRIC = 'cotton-chiangmai';

// ─── Decorations (drag & drop) ───────────────────────────────────────────────
export const DECORATIONS: DecorationDef[] = [
  { id: 'embroidery', label: 'ปักลายไทย', price: 250, color: '#C5A55A' },
  { id: 'lace', label: 'ลูกไม้', price: 180, color: '#F3E8FF' },
  { id: 'ribbon', label: 'ริบบิ้น', price: 90, color: '#B91C1C' },
  { id: 'goldborder', label: 'ขลิบทอง', price: 220, color: '#D4AF37' },
  { id: 'lasercut', label: 'เลเซอร์คัต', price: 350, color: '#374151', moq: 10 },
];

// ─── Colors & stitches ───────────────────────────────────────────────────────
export const COLOR_SWATCHES = [
  { hex: '#FFFFFF', name: 'ขาวงาช้าง' },
  { hex: '#1B2A4A', name: 'น้ำเงินเข้ม' },
  { hex: '#7C3AED', name: 'ม่วง' },
  { hex: '#B91C1C', name: 'แดงครั่ง' },
  { hex: '#0F766E', name: 'เขียวหัวเป็ด' },
  { hex: '#C5A55A', name: 'ทอง' },
  { hex: '#3E2723', name: 'น้ำตาลเข้ม' },
  { hex: '#F59E0B', name: 'เหลืองอำพัน' },
  { hex: '#EC4899', name: 'ชมพู' },
  { hex: '#334155', name: 'เทาหิน' },
];

export const STITCHES = [
  { id: 'standard', label: 'มาตรฐาน', price: 0 },
  { id: 'double', label: 'ตะเข็บคู่', price: 60 },
  { id: 'contrast', label: 'ด้ายสีตัด', price: 80 },
];

// ─── Smart suggestions (คู่ที่เข้ากัน) ──────────────────────────────────────
export interface Suggestion {
  label: string;
  targetPart: string;
  presetId?: string;
  fabricId?: string;
}

export const SUGGESTIONS: Record<string, Record<string, Suggestion[]>> = {
  collar: {
    mandarin: [
      { label: 'กระดุมจีนเข้าชุด', targetPart: 'buttons', presetId: 'knot' },
      { label: 'ผ้าไหมมัดหมี่', targetPart: 'body', fabricId: 'silk-mudmee' },
    ],
    shirt: [
      { label: 'กระดุมมุก', targetPart: 'buttons', presetId: 'pearl' },
      { label: 'แขนยาวคลาสสิก', targetPart: 'sleeveL', presetId: 'long' },
    ],
    hood: [
      { label: 'ทรงโอเวอร์ไซซ์', targetPart: 'body', presetId: 'oversized' },
      { label: 'ฝ้ายย้อมคราม', targetPart: 'body', fabricId: 'cotton-indigo' },
    ],
  },
  buttons: {
    gold: [{ label: 'ผ้าไหมยกดอก', targetPart: 'body', fabricId: 'silk-yokdok' }],
    knot: [{ label: 'คอจีนเข้าชุด', targetPart: 'collar', presetId: 'mandarin' }],
  },
  body: {
    sarong: [{ label: 'เชิงซิ่นขลิบทอง', targetPart: 'hem', presetId: 'goldtrim' }],
  },
};

// ─── AI assistant rules (แก้เฉพาะชิ้นที่เลือก) ───────────────────────────────
export interface AIRule {
  keywords: string[];
  reply: string;
  apply: {
    preset?: Record<string, string>;   // partId → presetId (ใช้เมื่อ part ตรงกับที่เลือก)
    fabricId?: string;
    color?: string;
    addDecoration?: string;
  };
}

export const AI_RULES: AIRule[] = [
  {
    keywords: ['ไทยโมเดิร์น', 'modern thai', 'ไทยประยุกต์', 'thai'],
    reply: 'จัดให้แนวไทยโมเดิร์น — ปรับเป็นทรงเรียบ ใช้ผ้ามัดหมี่ พร้อมดีเทลสีทอง',
    apply: { preset: { collar: 'mandarin', buttons: 'knot', body: 'regular', hem: 'goldtrim' }, fabricId: 'silk-mudmee' },
  },
  {
    keywords: ['หรู', 'luxury', 'พรีเมียม', 'premium', 'งานกาล่า'],
    reply: 'เพิ่มความหรูหรา — อัปเกรดเป็นไหมยกดอก โทนทอง พร้อมงานปัก',
    apply: { fabricId: 'silk-yokdok', color: '#C5A55A', addDecoration: 'embroidery' },
  },
  {
    keywords: ['มินิมอล', 'minimal', 'เรียบ', 'clean'],
    reply: 'ปรับเป็นลุคมินิมอล — ตัดดีเทลออก ใช้ทรงเรียบ สีขาวงาช้าง',
    apply: { preset: { collar: 'none', pocket: 'none', placket: 'hidden' }, color: '#FFFFFF' },
  },
  {
    keywords: ['สตรีท', 'street', 'เท่', 'สายฝอ'],
    reply: 'สายสตรีทมาแล้ว — โอเวอร์ไซซ์ ฮู้ด ผ้าย้อมคราม',
    apply: { preset: { body: 'oversized', collar: 'hood', sleeveL: 'long', sleeveR: 'long' }, fabricId: 'cotton-indigo' },
  },
  {
    keywords: ['หวาน', 'cute', 'น่ารัก', 'sweet'],
    reply: 'ลุคหวานๆ — แขนพอง สีชมพู เพิ่มลูกไม้',
    apply: { preset: { sleeveL: 'puff', sleeveR: 'puff' }, color: '#EC4899', addDecoration: 'lace' },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function defaultPartState(def: ComponentDef): PartState {
  const params: Record<string, number> = {};
  def.sliders?.forEach(s => { params[s.id] = s.def; });
  return {
    preset: def.presets?.[0]?.id ?? 'default',
    params,
    stitch: 'standard',
    decorations: [],
    visible: true,
  };
}

export function defaultGarmentState(type: GarmentType): GarmentState {
  const parts: Record<string, PartState> = {};
  GARMENTS[type].components.forEach(c => { parts[c.id] = defaultPartState(c); });
  return { type, parts };
}

export function componentDef(type: GarmentType, partId: string): ComponentDef | undefined {
  return GARMENTS[type].components.find(c => c.id === partId);
}

export function fabricById(id?: string): FabricDef {
  return FABRICS.find(f => f.id === id) ?? FABRICS.find(f => f.id === DEFAULT_FABRIC)!;
}

/** ชิ้นส่วนที่มองเห็นตาม config ปัจจุบัน (smart visibility) */
export function isPartVisible(g: GarmentState, partId: string): boolean {
  const p = g.parts[partId];
  if (!p || !p.visible) return false;
  if (p.preset === 'none') return false;
  if (g.type === 'shirt') {
    if (partId === 'buttons' && (g.parts.placket?.preset === 'none' || g.parts.placket?.preset === 'hidden')) return false;
  }
  return true;
}

/** ราคา + ระยะเวลา + MOQ คำนวณสดจาก state */
export function calcPricing(g: GarmentState) {
  const def = GARMENTS[g.type];
  let material = 0;
  let complexity = 0;
  let moq = 1;
  const partCosts: { partId: string; label: string; fabricName: string; cost: number }[] = [];

  const bodyFabric = g.parts.body?.fabricId ?? g.parts[def.components[0].id]?.fabricId;

  def.components.forEach(c => {
    const p = g.parts[c.id];
    if (!p || !isPartVisible(g, c.id)) return;
    // ผ้า
    if (c.acceptsFabric && c.meters) {
      const fab = fabricById(p.fabricId ?? bodyFabric);
      const cost = Math.round(c.meters * fab.pricePerMeter);
      material += cost;
      partCosts.push({ partId: c.id, label: c.label, fabricName: fab.name, cost });
    }
    // preset price
    const preset = c.presets?.find(pr => pr.id === p.preset);
    if (preset?.price) complexity += preset.price;
    // stitch
    const st = STITCHES.find(s => s.id === p.stitch);
    if (st?.price) complexity += st.price;
    // decorations
    p.decorations.forEach(d => {
      const dec = DECORATIONS.find(x => x.id === d);
      if (dec) {
        complexity += dec.price;
        if (dec.moq) moq = Math.max(moq, dec.moq);
      }
    });
  });

  const total = def.basePrice + material + complexity;
  const extraDays = Math.min(10, Math.floor(complexity / 300));
  const days: [number, number] = [def.baseDays[0] + extraDays, def.baseDays[1] + extraDays];
  return { base: def.basePrice, material, complexity, total, days, moq, partCosts };
}
