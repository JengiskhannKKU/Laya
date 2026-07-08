'use client';

/**
 * Zustand store ของ Garment Builder
 * ทุกอย่าง reactive: เปลี่ยน part/pattern/สี → renderer อัปเดตทันที
 */

import { create } from 'zustand';
import type { Catalog, Category, GarmentDesign, TemplateDef } from '@/components/design-clothes/builder/types';

interface GarmentStore extends GarmentDesign {
  catalog: Catalog | null;
  loading: boolean;
  templateId: string | null;
  selectedPart: string | null;
  hoveredPart: string | null;

  loadCatalog: () => Promise<void>;
  applyTemplate: (t: TemplateDef) => void;
  setPart: (partKey: string, optionId: string) => void;
  setPattern: (patternId: string, partKey?: string | null) => void;
  setColor: (hex: string, partKey?: string | null) => void;
  clearPartOverride: (partKey: string) => void;
  selectPart: (partKey: string | null) => void;
  hoverPart: (partKey: string | null) => void;
  loadDesign: (d: Partial<GarmentDesign> & { templateId?: string | null }) => void;
}

export const useGarmentStore = create<GarmentStore>((set, get) => ({
  catalog: null,
  loading: true,
  templateId: null,
  selectedPart: null,
  hoveredPart: null,

  // design state
  category: 'top' as Category,
  parts: {},
  partPattern: {},
  partColor: {},
  pattern: 'thaisilk',
  color: '#C9A227',

  loadCatalog: async () => {
    if (get().catalog) return;
    try {
      const res = await fetch('/assets/garments/catalog.json');
      const catalog = (await res.json()) as Catalog;
      set({ catalog, loading: false });
      // ห้ามเริ่มจากผ้าใบเปล่า — ใส่ template แรกให้เสมอ
      if (Object.keys(get().parts).length === 0 && catalog.templates.length) {
        get().applyTemplate(catalog.templates.find(t => t.id === 'thai-contemporary') ?? catalog.templates[0]);
      }
    } catch (err) {
      console.error('โหลด catalog ไม่สำเร็จ:', err);
      set({ loading: false });
    }
  },

  applyTemplate: (t) => set({
    templateId: t.id,
    category: t.category,
    parts: { ...t.parts },
    partPattern: {},
    partColor: {},
    pattern: t.pattern,
    color: t.color,
    selectedPart: null,
  }),

  setPart: (partKey, optionId) => set(s => ({
    parts: { ...s.parts, [partKey]: optionId },
  })),

  setPattern: (patternId, partKey) => set(s =>
    partKey
      ? { partPattern: { ...s.partPattern, [partKey]: patternId } }
      : { pattern: patternId, partPattern: {} }
  ),

  setColor: (hex, partKey) => set(s =>
    partKey
      ? { partColor: { ...s.partColor, [partKey]: hex } }
      : { color: hex, partColor: {} }
  ),

  clearPartOverride: (partKey) => set(s => {
    const pp = { ...s.partPattern };
    const pc = { ...s.partColor };
    delete pp[partKey];
    delete pc[partKey];
    return { partPattern: pp, partColor: pc };
  }),

  selectPart: (partKey) => set({ selectedPart: partKey }),
  hoverPart: (partKey) => set({ hoveredPart: partKey }),

  loadDesign: (d) => set(s => ({
    category: d.category ?? s.category,
    parts: d.parts ?? s.parts,
    partPattern: d.partPattern ?? {},
    partColor: d.partColor ?? {},
    pattern: d.pattern ?? s.pattern,
    color: d.color ?? s.color,
    templateId: d.templateId ?? s.templateId,
    selectedPart: null,
  })),
}));
