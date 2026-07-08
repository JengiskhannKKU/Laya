/**
 * LAYA Garment Builder — schema ของ catalog (JSON-driven)
 * UI ไม่ hardcode รูปทรงเสื้อผ้าใดๆ — ทุกอย่างมาจาก /assets/garments/catalog.json
 */

export type Category = 'top' | 'pants' | 'skirt';
export type Transition = 'fade' | 'slide' | 'scale';

export interface LayoutBox {
  left: number;   // % ของ canvas
  top: number;
  width: number;
  height: number;
  mirror?: boolean;
}

export interface PatternDef {
  id: string;
  name: string;
  image: string | null; // null = ผ้าเรียบ
  pricePerM: number;
}

export interface ColorDef {
  hex: string;
  name: string;
}

export interface OptionDef {
  id: string;
  name: string;
  asset: string;
  price?: number;
  /** layout เฉพาะ option (เช่น กระเป๋าอก vs กระเป๋าข้าง ตำแหน่งต่างกัน) */
  layout?: LayoutBox;
}

export interface PartDef {
  key: string;
  name: string;
  /** ชื่อกลุ่ม options ใน catalog.options */
  options: string;
  z: number;
  transition: Transition;
  allowNone?: boolean;
  /** 'image' = แสดง asset ตรงๆ (เช่น กระดุมมีสีในตัว), default = mask + ลายผ้า/สี */
  render?: 'image';
  layouts: LayoutBox[];
}

export interface CategoryDef {
  name: string;
  basePrice: number;
  parts: PartDef[];
}

export interface TemplateDef {
  id: string;
  name: string;
  category: Category;
  parts: Record<string, string>; // partKey -> optionId | 'none'
  pattern: string;
  color: string;
}

export interface Catalog {
  version: number;
  canvas: { width: number; height: number };
  patterns: PatternDef[];
  colors: ColorDef[];
  options: Record<string, OptionDef[]>;
  categories: Record<Category, CategoryDef>;
  templates: TemplateDef[];
}

// ─── Renderer contract (เปลี่ยน renderer ได้โดยไม่กระทบ business logic) ──────
export interface RenderLayer {
  id: string;            // unique ต่อ layer instance
  partKey: string;
  label: string;
  asset: string;
  box: LayoutBox;
  z: number;
  mirror?: boolean;
  mode: 'mask' | 'image';
  patternImage: string | null;
  color: string | null;
  transition: Transition;
}

export interface GarmentDesign {
  category: Category;
  parts: Record<string, string>;
  /** pattern/สี ราย part — fallback ที่ global */
  partPattern: Record<string, string>;
  partColor: Record<string, string>;
  pattern: string;
  color: string;
}

/** แปลง design + catalog → ชุด layer สำหรับ renderer (หัวใจของระบบ) */
export function resolveLayers(catalog: Catalog, design: GarmentDesign): RenderLayer[] {
  const cat = catalog.categories[design.category];
  if (!cat) return [];

  const layers: RenderLayer[] = [];
  for (const part of cat.parts) {
    const optionId = design.parts[part.key];
    if (!optionId || optionId === 'none') continue;
    const option = (catalog.options[part.options] ?? []).find(o => o.id === optionId);
    if (!option) continue;

    const patternId = design.partPattern[part.key] ?? design.pattern;
    const pattern = catalog.patterns.find(pt => pt.id === patternId);
    const color = design.partColor[part.key] ?? design.color;
    const boxes = option.layout ? [option.layout] : part.layouts;

    boxes.forEach((box, i) => {
      layers.push({
        id: `${part.key}-${i}`,
        partKey: part.key,
        label: part.name,
        asset: option.asset,
        box,
        z: part.z,
        mirror: box.mirror,
        mode: part.render === 'image' ? 'image' : 'mask',
        patternImage: pattern?.image ?? null,
        color: color ?? null,
        transition: part.transition,
      });
    });
  }
  return layers.sort((a, b) => a.z - b.z);
}

/** ราคาโดยประมาณจาก config (base + options + ลายผ้า) */
export function calcPrice(catalog: Catalog, design: GarmentDesign): number {
  const cat = catalog.categories[design.category];
  if (!cat) return 0;
  let total = cat.basePrice;

  for (const part of cat.parts) {
    const optionId = design.parts[part.key];
    if (!optionId || optionId === 'none') continue;
    const option = (catalog.options[part.options] ?? []).find(o => o.id === optionId);
    total += option?.price ?? 0;
  }
  const pattern = catalog.patterns.find(pt => pt.id === design.pattern);
  total += Math.round((pattern?.pricePerM ?? 0) * 2);
  return total;
}
