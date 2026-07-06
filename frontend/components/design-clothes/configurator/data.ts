/**
 * Garment Configurator — ตัวเลือก, ราคา, และ smart visibility rules
 * แยกจาก UI เพื่อให้แก้แคตตาล็อก/สูตรราคาได้ที่เดียว
 */

export type Category = 'shirt' | 'pants' | 'skirt';
export type FabricTab = 'silk' | 'cotton' | 'blend';

export interface Opt {
  v: string;
  label: string;
  /** ค่า complexity เพิ่ม (บาท) ถ้าเลือกตัวเลือกนี้ */
  price?: number;
}

export interface Fabric {
  id: string;
  name: string;
  origin: string;
  image: string;
  pricePerMeter: number;
  tab: FabricTab;
}

export interface PocketItem {
  id: number;
  location: string;
  type: string;
}

export interface ShirtConfig {
  garmentType: string;
  collar: string;
  sleeves: string;
  cuff: string;
  shoulder: string;
  opening: string;
  buttonShape: string;
  buttonSize: string;
  buttonMaterial: string;
  buttonColor: string;
  pockets: PocketItem[];
  hem: string;
  slitOn: boolean;
  slitLength: number; // cm
  decorations: string[];
}

export interface PantsConfig {
  type: string;
  waist: string;
  waistband: string;
  fly: string;
  pocketFront: boolean;
  pocketBack: boolean;
  pocketCoin: boolean;
  pocketCargo: boolean;
  pleats: string;
  legOpening: number; // 0-100 แคบ→กว้าง
  length: number;     // 0-4 (shorts → extra long)
  cuff: string;
}

export interface SkirtConfig {
  type: string;
  waist: string;
  pleats: string;
  layers: number; // 1-5
  hem: string;
}

export interface DesignState {
  category: Category;
  shirt: ShirtConfig;
  pants: PantsConfig;
  skirt: SkirtConfig;
  /** ผ้ารายชิ้นส่วน — key คือ part key, fallback ที่ 'body' */
  partFabric: Record<string, string>;
  /** สีทับรายชิ้นส่วน */
  partColor: Record<string, string>;
  /** ตะเข็บรายชิ้นส่วน */
  partStitch: Record<string, string>;
  intensity: number; // ความเข้มของสีทับ 0-100
}

// ─── Catalogs: เสื้อ ─────────────────────────────────────────────────────────
export const GARMENT_TYPES: Opt[] = [
  { v: 'shirt', label: 'เสื้อเชิ้ต' },
  { v: 'jacket', label: 'แจ็คเก็ต', price: 400 },
  { v: 'blouse', label: 'เบลาส์' },
  { v: 'polo', label: 'โปโล' },
  { v: 'dress', label: 'เดรส', price: 600 },
];

export const COLLARS: Opt[] = [
  { v: 'none', label: 'ไม่มีปก' },
  { v: 'mandarin', label: 'คอจีน' },
  { v: 'stand', label: 'คอตั้ง' },
  { v: 'shirt', label: 'คอปกเชิ้ต', price: 80 },
  { v: 'spread', label: 'ปกกว้าง', price: 80 },
  { v: 'round', label: 'คอกลม' },
  { v: 'v', label: 'คอวี' },
  { v: 'boat', label: 'คอปาด' },
  { v: 'square', label: 'คอเหลี่ยม' },
  { v: 'sweetheart', label: 'คอหัวใจ', price: 120 },
  { v: 'offshoulder', label: 'เปิดไหล่', price: 150 },
  { v: 'halter', label: 'ฮอลเตอร์', price: 150 },
  { v: 'hood', label: 'ฮู้ด', price: 200 },
];

export const SLEEVES: Opt[] = [
  { v: 'sleeveless', label: 'แขนกุด' },
  { v: 'short', label: 'แขนสั้น' },
  { v: 'elbow', label: 'แขนศอก' },
  { v: 'threeq', label: 'แขน 3/4' },
  { v: 'long', label: 'แขนยาว' },
  { v: 'balloon', label: 'แขนบอลลูน', price: 180 },
  { v: 'puff', label: 'แขนพอง', price: 150 },
  { v: 'bishop', label: 'แขนบิชอป', price: 180 },
  { v: 'bell', label: 'แขนเบลล์', price: 150 },
  { v: 'raglan', label: 'แขนแรกลัน', price: 100 },
];

export const CUFFS: Opt[] = [
  { v: 'plain', label: 'ปลายเรียบ' },
  { v: 'button', label: 'ติดกระดุม', price: 60 },
  { v: 'french', label: 'เฟรนช์คัฟ', price: 120 },
  { v: 'elastic', label: 'ยางยืด/จั๊ม', price: 40 },
  { v: 'folded', label: 'พับ', price: 40 },
];

export const SHOULDERS: Opt[] = [
  { v: 'normal', label: 'ปกติ' },
  { v: 'drop', label: 'ไหล่ตก' },
  { v: 'structured', label: 'เสริมไหล่', price: 150 },
  { v: 'raglan', label: 'แรกลัน', price: 100 },
];

export const OPENINGS: Opt[] = [
  { v: 'hidden', label: 'สาบซ่อน', price: 100 },
  { v: 'button', label: 'กระดุม' },
  { v: 'zipper', label: 'ซิป', price: 80 },
  { v: 'wrap', label: 'ป้ายผูก', price: 120 },
  { v: 'none', label: 'ไม่มี' },
];

export const BUTTON_SHAPES: Opt[] = [
  { v: 'round', label: 'กลม' },
  { v: 'square', label: 'เหลี่ยม' },
  { v: 'flower', label: 'ดอกไม้', price: 50 },
  { v: 'knot', label: 'ผ้าถักเงื่อน', price: 80 },
];

export const BUTTON_SIZES: Opt[] = [
  { v: 's', label: 'เล็ก 10mm' },
  { v: 'm', label: 'กลาง 12mm' },
  { v: 'l', label: 'ใหญ่ 15mm' },
];

export const BUTTON_MATERIALS: Opt[] = [
  { v: 'plastic', label: 'พลาสติก' },
  { v: 'wood', label: 'ไม้', price: 60 },
  { v: 'shell', label: 'เปลือกหอย/มุก', price: 120 },
  { v: 'metal', label: 'โลหะ', price: 90 },
  { v: 'fabric', label: 'ผ้าหุ้ม', price: 70 },
];

export const POCKET_LOCATIONS: Opt[] = [
  { v: 'chest', label: 'อก' },
  { v: 'left', label: 'ซ้ายล่าง' },
  { v: 'right', label: 'ขวาล่าง' },
  { v: 'lower', label: 'ล่างกลาง' },
  { v: 'sleeve', label: 'แขน' },
];

export const POCKET_TYPES: Opt[] = [
  { v: 'patch', label: 'แปะ (Patch)' },
  { v: 'welt', label: 'เจาะ (Welt)', price: 60 },
  { v: 'flap', label: 'ฝาปิด (Flap)', price: 50 },
  { v: 'hidden', label: 'ซ่อน', price: 40 },
];

export const HEMS: Opt[] = [
  { v: 'straight', label: 'ตรง' },
  { v: 'rounded', label: 'โค้งมน', price: 40 },
  { v: 'highlow', label: 'หน้าสั้นหลังยาว', price: 100 },
  { v: 'curved', label: 'โค้ง', price: 60 },
];

export const DECORATIONS: Opt[] = [
  { v: 'embroidery', label: 'งานปัก', price: 350 },
  { v: 'piping', label: 'กุ๊นขอบ', price: 150 },
  { v: 'lace', label: 'ลูกไม้', price: 200 },
  { v: 'pleats', label: 'จีบ', price: 150 },
  { v: 'ribbon', label: 'ริบบิ้น', price: 100 },
  { v: 'decobuttons', label: 'กระดุมตกแต่ง', price: 120 },
  { v: 'lasercut', label: 'เลเซอร์คัต', price: 400 },
  { v: 'beads', label: 'ลูกปัด', price: 300 },
];

// ─── Catalogs: กางเกง ────────────────────────────────────────────────────────
export const PANTS_TYPES: Opt[] = [
  { v: 'straight', label: 'ทรงตรง' },
  { v: 'wide', label: 'ขากว้าง' },
  { v: 'skinny', label: 'สกินนี่' },
  { v: 'cargo', label: 'คาร์โก้', price: 250 },
  { v: 'jogger', label: 'จ็อกเกอร์', price: 100 },
  { v: 'culottes', label: 'กระโปรงกางเกง', price: 150 },
  { v: 'palazzo', label: 'พาลาซโซ่', price: 150 },
];

/** preset เมื่อเลือกทรงกางเกง → ตั้ง legOpening/length/cuff ให้เข้ากับทรง */
export const PANTS_TYPE_PRESETS: Record<string, Partial<PantsConfig>> = {
  straight: { legOpening: 40, length: 3, cuff: 'plain' },
  wide: { legOpening: 85, length: 3, cuff: 'plain' },
  skinny: { legOpening: 5, length: 3, cuff: 'plain' },
  cargo: { legOpening: 55, length: 3, pocketCargo: true },
  jogger: { legOpening: 30, length: 3, cuff: 'elastic' },
  culottes: { legOpening: 90, length: 2 },
  palazzo: { legOpening: 100, length: 4 },
};

export const WAISTS: Opt[] = [
  { v: 'high', label: 'เอวสูง' },
  { v: 'mid', label: 'เอวกลาง' },
  { v: 'low', label: 'เอวต่ำ' },
];

export const WAISTBANDS: Opt[] = [
  { v: 'elastic', label: 'ยางยืด' },
  { v: 'belt', label: 'หูเข็มขัด', price: 80 },
  { v: 'button', label: 'กระดุม' },
  { v: 'drawstring', label: 'เชือกผูก', price: 50 },
];

export const FLIES: Opt[] = [
  { v: 'zip', label: 'ซิป' },
  { v: 'buttons', label: 'กระดุม', price: 60 },
  { v: 'hidden', label: 'ซ่อน', price: 80 },
];

export const PLEATS: Opt[] = [
  { v: 'none', label: 'ไม่มี' },
  { v: 'single', label: 'จีบเดี่ยว', price: 100 },
  { v: 'double', label: 'จีบคู่', price: 180 },
];

export const PANT_LENGTH_LABELS = ['ขาสั้น', 'Capri', '7/8 ส่วน', 'ยาวปกติ', 'ยาวพิเศษ'];

export const PANT_CUFFS: Opt[] = [
  { v: 'plain', label: 'ปลายเรียบ' },
  { v: 'fold', label: 'พับ', price: 50 },
  { v: 'elastic', label: 'จั๊ม', price: 40 },
];

// ─── Catalogs: กระโปรง ───────────────────────────────────────────────────────
export const SKIRT_TYPES: Opt[] = [
  { v: 'pencil', label: 'ทรงดินสอ' },
  { v: 'aline', label: 'ทรงเอ' },
  { v: 'pleated', label: 'จีบรอบตัว', price: 200 },
  { v: 'circle', label: 'วงกลม', price: 150 },
  { v: 'mermaid', label: 'หางปลา', price: 250 },
  { v: 'wrap', label: 'ป้าย', price: 100 },
  { v: 'tiered', label: 'เป็นชั้น', price: 180 },
  { v: 'mini', label: 'มินิ' },
  { v: 'midi', label: 'มิดี้' },
  { v: 'maxi', label: 'แม็กซี่', price: 80 },
];

export const SKIRT_PLEATS: Opt[] = [
  { v: 'none', label: 'ไม่มี' },
  { v: 'accordion', label: 'อัดพลีท', price: 250 },
  { v: 'box', label: 'จีบกล่อง', price: 180 },
  { v: 'knife', label: 'จีบมีด', price: 180 },
  { v: 'sunburst', label: 'ซันเบิร์สต์', price: 280 },
];

export const SKIRT_HEMS: Opt[] = [
  { v: 'straight', label: 'ตรง' },
  { v: 'wave', label: 'คลื่น', price: 80 },
  { v: 'scallop', label: 'สกัลลอป', price: 150 },
  { v: 'asymmetric', label: 'อสมมาตร', price: 120 },
];

// ─── ผ้าและสี ────────────────────────────────────────────────────────────────
export const FABRICS: Fabric[] = [
  { id: 'f1', name: 'ไหมมัดหมี่', origin: 'สุรินทร์', image: '/fabric_patterns/01.webp', pricePerMeter: 1180, tab: 'silk' },
  { id: 'f2', name: 'ไหมยกดอก', origin: 'ลำพูน', image: '/fabric_patterns/02.webp', pricePerMeter: 1350, tab: 'silk' },
  { id: 'f3', name: 'ไหมแพรวา', origin: 'กาฬสินธุ์', image: '/fabric_patterns/03.webp', pricePerMeter: 1180, tab: 'silk' },
  { id: 'f4', name: 'ไหมจุล', origin: 'นครราชสีมา', image: '/fabric_patterns/04.webp', pricePerMeter: 990, tab: 'silk' },
  { id: 'f5', name: 'ไหมลายขอ', origin: 'เชียงใหม่', image: '/fabric_patterns/05.webp', pricePerMeter: 1250, tab: 'silk' },
  { id: 'f6', name: 'ไหมทอนก', origin: 'อุบลราชธานี', image: '/fabric_patterns/06.webp', pricePerMeter: 1400, tab: 'silk' },
  { id: 'c1', name: 'ฝ้ายทอมือ', origin: 'เชียงใหม่', image: '/fabric_patterns/07.webp', pricePerMeter: 480, tab: 'cotton' },
  { id: 'c2', name: 'ฝ้ายย้อมคราม', origin: 'สกลนคร', image: '/fabric_patterns/08.webp', pricePerMeter: 520, tab: 'cotton' },
  { id: 'c3', name: 'ฝ้ายขิด', origin: 'อุดรธานี', image: '/fabric_patterns/09.webp', pricePerMeter: 450, tab: 'cotton' },
  { id: 'c4', name: 'ฝ้ายลายน้ำไหล', origin: 'น่าน', image: '/fabric_patterns/10.webp', pricePerMeter: 490, tab: 'cotton' },
  { id: 'b1', name: 'ไหมผสมฝ้าย', origin: 'ขอนแก่น', image: '/fabric_patterns/11.webp', pricePerMeter: 780, tab: 'blend' },
  { id: 'b2', name: 'ผสมลายขิด', origin: 'ร้อยเอ็ด', image: '/fabric_patterns/12.webp', pricePerMeter: 720, tab: 'blend' },
];

export const COLOR_SWATCHES = [
  { hex: '#F5E6D3', name: 'ครีม' },
  { hex: '#F4A7B9', name: 'ชมพู' },
  { hex: '#8B1A2D', name: 'แดงเข้ม' },
  { hex: '#1B2A4A', name: 'กรมท่า' },
  { hex: '#5F7470', name: 'เขียวหม่น' },
  { hex: '#2D6A4F', name: 'เขียว' },
  { hex: '#4A5568', name: 'เทา' },
  { hex: '#8B4513', name: 'น้ำตาลแดง' },
  { hex: '#0E7C7B', name: 'เขียวขวด' },
  { hex: '#A3B18A', name: 'เขียวมะกอก' },
  { hex: '#B8B2A7', name: 'เบจ' },
  { hex: '#C9A227', name: 'ทอง' },
];

export const BUTTON_COLORS = ['#FFFFFF', '#1B2A4A', '#C9A227', '#5B3A29', '#8B1A2D', '#2D2D2D'];

export const STITCHES: Opt[] = [
  { v: 'standard', label: 'ตะเข็บปกติ' },
  { v: 'contrast', label: 'ด้ายตัดสี', price: 60 },
  { v: 'decorative', label: 'เดินลายตกแต่ง', price: 150 },
];

// ─── Defaults ────────────────────────────────────────────────────────────────
export const DEFAULT_STATE: DesignState = {
  category: 'shirt',
  shirt: {
    garmentType: 'blouse',
    collar: 'mandarin',
    sleeves: 'long',
    cuff: 'button',
    shoulder: 'normal',
    opening: 'button',
    buttonShape: 'round',
    buttonSize: 'm',
    buttonMaterial: 'fabric',
    buttonColor: '#C9A227',
    pockets: [{ id: 1, location: 'left', type: 'patch' }],
    hem: 'straight',
    slitOn: false,
    slitLength: 12,
    decorations: [],
  },
  pants: {
    type: 'wide',
    waist: 'high',
    waistband: 'button',
    fly: 'zip',
    pocketFront: true,
    pocketBack: false,
    pocketCoin: false,
    pocketCargo: false,
    pleats: 'none',
    legOpening: 85,
    length: 3,
    cuff: 'plain',
  },
  skirt: {
    type: 'aline',
    waist: 'high',
    pleats: 'none',
    layers: 1,
    hem: 'straight',
  },
  partFabric: { body: 'f3' },
  partColor: {},
  partStitch: {},
  intensity: 80,
};

// ─── Parts (component tree / fabric assignment) ─────────────────────────────
export interface PartDef {
  key: string;
  label: string;
}

export function getParts(state: DesignState): PartDef[] {
  if (state.category === 'shirt') {
    const s = state.shirt;
    const parts: PartDef[] = [{ key: 'body', label: 'ลำตัว' }];
    if (s.collar !== 'none') parts.push({ key: 'collar', label: 'คอ / ปกเสื้อ' });
    if (s.sleeves !== 'sleeveless') parts.push({ key: 'sleeves', label: 'แขนเสื้อ' });
    if (showCuffSection(s)) parts.push({ key: 'cuffs', label: 'ข้อมือ' });
    if (s.opening !== 'none') parts.push({ key: 'placket', label: 'สาบหน้า' });
    if (showButtonSection(s)) parts.push({ key: 'buttons', label: 'กระดุม' });
    if (s.pockets.length > 0) parts.push({ key: 'pocket', label: `กระเป๋า ×${s.pockets.length}` });
    parts.push({ key: 'hem', label: 'ชายเสื้อ' });
    return parts;
  }
  if (state.category === 'pants') {
    const p = state.pants;
    const parts: PartDef[] = [
      { key: 'waistband', label: 'ขอบเอว' },
      { key: 'body', label: 'ขากางเกง' },
    ];
    if (p.pocketFront || p.pocketBack || p.pocketCoin || p.pocketCargo) parts.push({ key: 'pocket', label: 'กระเป๋า' });
    if (p.length > 0) parts.push({ key: 'cuffs', label: 'ปลายขา' });
    return parts;
  }
  const parts: PartDef[] = [
    { key: 'waistband', label: 'ขอบเอว' },
    { key: 'body', label: 'ตัวกระโปรง' },
    { key: 'hem', label: 'ชายกระโปรง' },
  ];
  return parts;
}

// ─── Smart visibility ────────────────────────────────────────────────────────
export function showCuffSection(s: ShirtConfig): boolean {
  // แขนกุด/แขนสั้น → ไม่มีข้อมือ
  return !['sleeveless', 'short'].includes(s.sleeves);
}

export function showButtonSection(s: ShirtConfig): boolean {
  return ['button', 'hidden'].includes(s.opening) || s.decorations.includes('decobuttons') || s.cuff === 'button';
}

export function showCollarSection(s: ShirtConfig): boolean {
  return true; // section เลือกปกต้องแสดงเสมอ (ตัวเลือก 'ไม่มีปก' อยู่ในนั้น)
}

// ─── Fabric helpers ──────────────────────────────────────────────────────────
export function fabricOf(state: DesignState, part: string): Fabric {
  const id = state.partFabric[part] ?? state.partFabric.body ?? 'f3';
  return FABRICS.find(f => f.id === id) ?? FABRICS[0];
}

export function colorOf(state: DesignState, part: string): string | null {
  return state.partColor[part] ?? state.partColor.body ?? null;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
const PART_METERS: Record<Category, Record<string, number>> = {
  shirt: { body: 1.4, collar: 0.15, sleeves: 0.7, cuffs: 0.1, placket: 0.1, pocket: 0.15, hem: 0.15, buttons: 0 },
  pants: { body: 1.8, waistband: 0.2, pocket: 0.2, cuffs: 0.1 },
  skirt: { body: 1.6, waistband: 0.2, hem: 0.2 },
};

const TAILORING_BASE: Record<Category, number> = { shirt: 1400, pants: 1500, skirt: 1300 };
const GARMENT_TYPE_TAILORING: Record<string, number> = { shirt: 0, jacket: 800, blouse: 100, polo: -100, dress: 900 };

function optPrice(opts: Opt[], v: string): number {
  return opts.find(o => o.v === v)?.price ?? 0;
}

export interface Pricing {
  material: number;
  tailoring: number;
  complexity: number;
  total: number;
  days: [number, number];
  moq: number;
  partCosts: { label: string; fabricName: string; cost: number }[];
}

export function calcPricing(state: DesignState): Pricing {
  const parts = getParts(state);
  const meters = PART_METERS[state.category];

  const partCosts = parts
    .map(p => {
      const m = meters[p.key] ?? 0.1;
      const fab = fabricOf(state, p.key);
      return { label: p.label, fabricName: fab.name, cost: Math.round(fab.pricePerMeter * m) };
    })
    .filter(pc => pc.cost > 0);

  const material = partCosts.reduce((s, pc) => s + pc.cost, 0);

  let tailoring = TAILORING_BASE[state.category];
  let complexity = 0;

  if (state.category === 'shirt') {
    const s = state.shirt;
    tailoring += GARMENT_TYPE_TAILORING[s.garmentType] ?? 0;
    complexity += optPrice(COLLARS, s.collar);
    complexity += optPrice(SLEEVES, s.sleeves);
    if (showCuffSection(s)) complexity += optPrice(CUFFS, s.cuff);
    complexity += optPrice(SHOULDERS, s.shoulder);
    complexity += optPrice(OPENINGS, s.opening);
    if (showButtonSection(s)) {
      complexity += optPrice(BUTTON_SHAPES, s.buttonShape) + optPrice(BUTTON_MATERIALS, s.buttonMaterial);
    }
    complexity += s.pockets.reduce((acc, pk) => acc + 120 + optPrice(POCKET_TYPES, pk.type), 0);
    complexity += optPrice(HEMS, s.hem);
    if (s.slitOn) complexity += 80;
    complexity += s.decorations.reduce((acc, d) => acc + optPrice(DECORATIONS, d), 0);
  } else if (state.category === 'pants') {
    const p = state.pants;
    complexity += optPrice(PANTS_TYPES, p.type);
    complexity += optPrice(WAISTBANDS, p.waistband);
    complexity += optPrice(FLIES, p.fly);
    complexity += (p.pocketFront ? 100 : 0) + (p.pocketBack ? 100 : 0) + (p.pocketCoin ? 60 : 0) + (p.pocketCargo ? 180 : 0);
    complexity += optPrice(PLEATS, p.pleats);
    if (p.length > 0) complexity += optPrice(PANT_CUFFS, p.cuff);
  } else {
    const k = state.skirt;
    complexity += optPrice(SKIRT_TYPES, k.type);
    complexity += optPrice(SKIRT_PLEATS, k.pleats);
    complexity += (k.layers - 1) * 120;
    complexity += optPrice(SKIRT_HEMS, k.hem);
  }

  // ตะเข็บพิเศษรายชิ้น
  complexity += Object.values(state.partStitch).reduce((acc, st) => acc + optPrice(STITCHES, st), 0);

  const total = material + tailoring + complexity;
  const extraDays = Math.min(15, Math.round(complexity / 200));
  const days: [number, number] = [12 + extraDays, 19 + extraDays];
  const moq = state.category === 'shirt' && state.shirt.decorations.includes('lasercut') ? 10 : 1;

  return { material, tailoring, complexity, total, days, moq, partCosts };
}

// ─── Summary tags ────────────────────────────────────────────────────────────
export function labelOf(opts: Opt[], v: string): string {
  return opts.find(o => o.v === v)?.label ?? '-';
}

export interface SummaryTag {
  group: string;
  value: string;
}

export function buildSummaryTags(state: DesignState): SummaryTag[] {
  const tags: SummaryTag[] = [];
  const bodyFabric = fabricOf(state, 'body');

  if (state.category === 'shirt') {
    const s = state.shirt;
    tags.push({ group: 'ประเภท', value: labelOf(GARMENT_TYPES, s.garmentType) });
    if (s.collar !== 'none') tags.push({ group: 'คอ', value: labelOf(COLLARS, s.collar) });
    tags.push({ group: 'แขน', value: labelOf(SLEEVES, s.sleeves) });
    if (showCuffSection(s) && s.cuff !== 'plain') tags.push({ group: 'ข้อมือ', value: labelOf(CUFFS, s.cuff) });
    if (s.opening !== 'none') tags.push({ group: 'สาบหน้า', value: labelOf(OPENINGS, s.opening) });
    if (showButtonSection(s)) tags.push({ group: 'กระดุม', value: labelOf(BUTTON_MATERIALS, s.buttonMaterial) });
    if (s.pockets.length) {
      const t = labelOf(POCKET_TYPES, s.pockets[0].type).split(' ')[0];
      tags.push({ group: 'กระเป๋า', value: `${t} ×${s.pockets.length}` });
    }
    tags.push({ group: 'ชาย', value: labelOf(HEMS, s.hem) + (s.slitOn ? ` + ผ่าข้าง ${s.slitLength}ซม.` : '') });
    s.decorations.forEach(d => tags.push({ group: 'ตกแต่ง', value: labelOf(DECORATIONS, d) }));
  } else if (state.category === 'pants') {
    const p = state.pants;
    tags.push({ group: 'ทรง', value: labelOf(PANTS_TYPES, p.type) });
    tags.push({ group: 'เอว', value: `${labelOf(WAISTS, p.waist)} · ${labelOf(WAISTBANDS, p.waistband)}` });
    tags.push({ group: 'ความยาว', value: PANT_LENGTH_LABELS[p.length] });
    const pk = [p.pocketFront && 'หน้า', p.pocketBack && 'หลัง', p.pocketCoin && 'เหรียญ', p.pocketCargo && 'คาร์โก้'].filter(Boolean);
    if (pk.length) tags.push({ group: 'กระเป๋า', value: pk.join(', ') });
    if (p.pleats !== 'none') tags.push({ group: 'จีบ', value: labelOf(PLEATS, p.pleats) });
    if (p.length > 0 && p.cuff !== 'plain') tags.push({ group: 'ปลายขา', value: labelOf(PANT_CUFFS, p.cuff) });
  } else {
    const k = state.skirt;
    tags.push({ group: 'ทรง', value: labelOf(SKIRT_TYPES, k.type) });
    tags.push({ group: 'เอว', value: labelOf(WAISTS, k.waist) });
    if (k.pleats !== 'none') tags.push({ group: 'จีบ', value: labelOf(SKIRT_PLEATS, k.pleats) });
    if (k.layers > 1) tags.push({ group: 'ชั้น', value: `${k.layers} ชั้น` });
    tags.push({ group: 'ชาย', value: labelOf(SKIRT_HEMS, k.hem) });
  }

  tags.push({ group: 'ผ้าหลัก', value: `${bodyFabric.name} ${bodyFabric.origin}` });
  const bodyColor = state.partColor.body;
  if (bodyColor) {
    const c = COLOR_SWATCHES.find(cs => cs.hex === bodyColor);
    tags.push({ group: 'สี', value: c?.name ?? bodyColor });
  }
  return tags;
}
