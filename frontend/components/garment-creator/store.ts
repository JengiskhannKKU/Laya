/**
 * Garment Creator store — Zustand
 * - garment: สถานะชิ้นงาน (undo/redo ได้, autosave ลง localStorage)
 * - selection/hover/drag: สถานะ interaction (ไม่เข้า history)
 */
import { create } from 'zustand';
import {
  GarmentState, GarmentType, defaultGarmentState, componentDef, GARMENTS,
} from './config';

export type CameraView = 'front' | 'back' | 'left' | 'right' | 'iso';

export interface DragPayload {
  kind: 'fabric' | 'decoration';
  id: string;
  image?: string;
  color?: string;
  label: string;
}

export interface FavoriteEntry {
  id: string;
  name: string;
  garment: GarmentState;
  savedAt: string;
}

interface CreatorStore {
  garment: GarmentState;
  past: GarmentState[];
  future: GarmentState[];

  selectedPart: string | null;
  hoveredPart: string | null;
  drag: DragPayload | null;
  dropTarget: string | null;

  view: CameraView;
  exploded: boolean;
  wireframe: boolean;
  showAvatar: boolean;
  avatarBuild: number; // 0-100 ผอม→ใหญ่
  toast: string;

  // mutations (เข้า history)
  commit: (fn: (g: GarmentState) => GarmentState) => void;
  setType: (t: GarmentType) => void;
  setPreset: (partId: string, presetId: string) => void;
  setParam: (partId: string, sliderId: string, value: number) => void;
  setFabric: (partId: string, fabricId?: string) => void;
  setColor: (partId: string, color?: string) => void;
  setStitch: (partId: string, stitch: string) => void;
  addDecoration: (partId: string, decoId: string) => void;
  removeDecoration: (partId: string, decoId: string) => void;
  moveDecoration: (partId: string, decoId: string, dir: -1 | 1) => void;

  undo: () => void;
  redo: () => void;

  // interaction (ไม่เข้า history)
  select: (partId: string | null) => void;
  hover: (partId: string | null) => void;
  startDrag: (p: DragPayload) => void;
  endDrag: () => void;
  setDropTarget: (partId: string | null) => void;
  setView: (v: CameraView) => void;
  toggleExploded: () => void;
  toggleWireframe: () => void;
  toggleAvatar: () => void;
  setAvatarBuild: (n: number) => void;
  showToast: (msg: string) => void;

  // favorites / snapshots
  favorites: FavoriteEntry[];
  saveFavorite: (name: string) => void;
  applyFavorite: (id: string) => void;
  deleteFavorite: (id: string) => void;
}

const AUTOSAVE_KEY = 'laya-creator-v2-autosave';
const FAV_KEY = 'laya-creator-v2-favorites';
const HISTORY_CAP = 60;

function loadAutosave(): GarmentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GarmentState;
    if (!GARMENTS[parsed.type]) return null;
    // merge กับ default กัน schema เปลี่ยน
    const base = defaultGarmentState(parsed.type);
    Object.keys(base.parts).forEach(k => {
      if (parsed.parts?.[k]) base.parts[k] = { ...base.parts[k], ...parsed.parts[k] };
    });
    return base;
  } catch { return null; }
}

function loadFavorites(): FavoriteEntry[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]'); } catch { return []; }
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleAutosave(g: GarmentState) {
  if (typeof window === 'undefined') return;
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(g)); } catch { /* quota */ }
  }, 600);
}

export const useCreator = create<CreatorStore>((set, get) => ({
  garment: loadAutosave() ?? defaultGarmentState('shirt'),
  past: [],
  future: [],

  selectedPart: null,
  hoveredPart: null,
  drag: null,
  dropTarget: null,

  view: 'iso',
  exploded: false,
  wireframe: false,
  showAvatar: true,
  avatarBuild: 50,
  toast: '',

  commit: (fn) => {
    const { garment, past } = get();
    const next = fn(garment);
    if (next === garment) return;
    set({
      garment: next,
      past: [...past.slice(-HISTORY_CAP + 1), garment],
      future: [],
    });
    scheduleAutosave(next);
  },

  setType: (t) => {
    const { garment } = get();
    if (garment.type === t) return;
    get().commit(() => defaultGarmentState(t));
    set({ selectedPart: null, hoveredPart: null });
  },

  setPreset: (partId, presetId) => {
    get().commit(g => {
      const def = componentDef(g.type, partId);
      const preset = def?.presets?.find(p => p.id === presetId);
      if (!def || !preset) return g;
      const part = g.parts[partId];
      return {
        ...g,
        parts: {
          ...g.parts,
          [partId]: { ...part, preset: presetId, params: { ...part.params, ...(preset.params ?? {}) } },
        },
      };
    });
  },

  setParam: (partId, sliderId, value) => {
    get().commit(g => {
      const part = g.parts[partId];
      if (!part || part.params[sliderId] === value) return g;
      return {
        ...g,
        parts: { ...g.parts, [partId]: { ...part, params: { ...part.params, [sliderId]: value } } },
      };
    });
  },

  setFabric: (partId, fabricId) => {
    get().commit(g => {
      const part = g.parts[partId];
      if (!part) return g;
      return { ...g, parts: { ...g.parts, [partId]: { ...part, fabricId } } };
    });
  },

  setColor: (partId, color) => {
    get().commit(g => {
      const part = g.parts[partId];
      if (!part) return g;
      return { ...g, parts: { ...g.parts, [partId]: { ...part, color } } };
    });
  },

  setStitch: (partId, stitch) => {
    get().commit(g => {
      const part = g.parts[partId];
      if (!part) return g;
      return { ...g, parts: { ...g.parts, [partId]: { ...part, stitch } } };
    });
  },

  addDecoration: (partId, decoId) => {
    get().commit(g => {
      const part = g.parts[partId];
      if (!part || part.decorations.includes(decoId)) return g;
      return { ...g, parts: { ...g.parts, [partId]: { ...part, decorations: [...part.decorations, decoId] } } };
    });
  },

  removeDecoration: (partId, decoId) => {
    get().commit(g => {
      const part = g.parts[partId];
      if (!part) return g;
      return { ...g, parts: { ...g.parts, [partId]: { ...part, decorations: part.decorations.filter(d => d !== decoId) } } };
    });
  },

  moveDecoration: (partId, decoId, dir) => {
    get().commit(g => {
      const part = g.parts[partId];
      if (!part) return g;
      const arr = [...part.decorations];
      const i = arr.indexOf(decoId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return g;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...g, parts: { ...g.parts, [partId]: { ...part, decorations: arr } } };
    });
  },

  undo: () => {
    const { past, garment, future } = get();
    if (!past.length) return;
    const prev = past[past.length - 1];
    set({ garment: prev, past: past.slice(0, -1), future: [garment, ...future].slice(0, HISTORY_CAP) });
    scheduleAutosave(prev);
  },

  redo: () => {
    const { past, garment, future } = get();
    if (!future.length) return;
    const next = future[0];
    set({ garment: next, past: [...past, garment].slice(-HISTORY_CAP), future: future.slice(1) });
    scheduleAutosave(next);
  },

  select: (partId) => set({ selectedPart: partId }),
  hover: (partId) => set({ hoveredPart: partId }),
  startDrag: (p) => set({ drag: p }),
  endDrag: () => set({ drag: null, dropTarget: null }),
  setDropTarget: (partId) => set({ dropTarget: partId }),
  setView: (v) => set({ view: v }),
  toggleExploded: () => set(s => ({ exploded: !s.exploded })),
  toggleWireframe: () => set(s => ({ wireframe: !s.wireframe })),
  toggleAvatar: () => set(s => ({ showAvatar: !s.showAvatar })),
  setAvatarBuild: (n) => set({ avatarBuild: n }),
  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => { if (get().toast === msg) set({ toast: '' }); }, 2200);
  },

  favorites: loadFavorites(),
  saveFavorite: (name) => {
    const entry: FavoriteEntry = {
      id: `fav-${Date.now()}`,
      name: name || `แบบที่ ${get().favorites.length + 1}`,
      garment: get().garment,
      savedAt: new Date().toISOString(),
    };
    const favorites = [entry, ...get().favorites].slice(0, 20);
    set({ favorites });
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch { /* quota */ }
    get().showToast(`บันทึก "${entry.name}" แล้ว`);
  },
  applyFavorite: (id) => {
    const fav = get().favorites.find(f => f.id === id);
    if (!fav) return;
    get().commit(() => fav.garment);
    set({ selectedPart: null });
    get().showToast(`โหลด "${fav.name}" แล้ว`);
  },
  deleteFavorite: (id) => {
    const favorites = get().favorites.filter(f => f.id !== id);
    set({ favorites });
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch { /* quota */ }
  },
}));
