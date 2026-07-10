'use client';

/**
 * StudioCenterPreview — พรีวิวกลางของสตูดิโอเดสก์ท็อป
 * มุมมองตัวอย่าง 4 แบบที่ตรงกับข้อมูลจริงที่มี (ดู viewModes.ts):
 * หน้า (live) / หลัง (derived) / ผ้า (close-up) / แพทเทิร์น (technical sketch)
 * ไม่มีสวิตช์ 2D/3D เพราะไม่มีโมเดล 3D จริงรองรับ
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, Redo2, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

import { useGarmentStore } from '@/lib/stores/garment-store';
import type { Catalog, CategoryDef, GarmentDesign, RenderLayer } from '../builder/types';
import GarmentRenderer from '../builder/GarmentRenderer';
import GarmentPhotoStage from '../builder/GarmentPhotoStage';
import { buildBackLayers, toSketchLayers } from './viewModes';

export type PreviewMode = 'front' | 'back' | 'fabric' | 'sketch';

const MODES: { key: PreviewMode; label: string }[] = [
  { key: 'front', label: 'ด้านหน้า' },
  { key: 'back', label: 'ด้านหลัง' },
  { key: 'fabric', label: 'ซูมผ้า' },
  { key: 'sketch', label: 'แพทเทิร์น' },
];

interface Props {
  catalog: Catalog;
  categoryDef: CategoryDef;
  design: GarmentDesign;
  layers: RenderLayer[];
  price: number;
}

export default function StudioCenterPreview({ catalog, categoryDef, design, layers, price }: Props) {
  const selectedPart = useGarmentStore(s => s.selectedPart);
  const hoveredPart = useGarmentStore(s => s.hoveredPart);
  const selectPart = useGarmentStore(s => s.selectPart);
  const hoverPart = useGarmentStore(s => s.hoverPart);
  const applyTemplate = useGarmentStore(s => s.applyTemplate);

  const [mode, setMode] = useState<PreviewMode>('front');
  const [fullscreen, setFullscreen] = useState(false);

  const backLayers = useMemo(() => buildBackLayers(layers), [layers]);
  const sketchLayers = useMemo(() => toSketchLayers(layers), [layers]);
  const fabricImage = catalog.patterns.find(p => p.id === design.pattern)?.image ?? null;

  const activeLabel = categoryDef.parts.find(p => p.key === (selectedPart ?? hoveredPart))?.name;

  const handleReset = () => {
    const t = catalog.templates.find(tp => tp.id === 'thai-contemporary');
    if (t) applyTemplate(t);
  };

  const renderStage = (m: PreviewMode, interactive: boolean) => {
    if (m === 'fabric') {
      return (
        <div className="w-full h-full rounded-2xl overflow-hidden bg-[#EFE9DD]">
          {fabricImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={fabricImage} alt="ลายผ้าที่เลือก" className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              ผ้าเรียบ ไม่มีลาย
            </div>
          )}
        </div>
      );
    }

    // หน้า: ใช้ภาพถ่ายจริงถ้ามี (ดู lib/thai-dress-photo.ts), fallback SVG อัตโนมัติถ้าไม่มี
    if (m === 'front') {
      return (
        <GarmentPhotoStage
          design={design}
          layers={layers}
          canvas={catalog.canvas}
          hideCaption={!interactive}
          rendererProps={{
            selectedPart: interactive ? selectedPart : null,
            hoveredPart: interactive ? hoveredPart : null,
            onSelectPart: interactive ? selectPart : undefined,
            onHoverPart: interactive ? hoverPart : undefined,
            interactive,
          }}
        />
      );
    }

    const activeLayers = m === 'back' ? backLayers : sketchLayers;
    if (!activeLayers.length) {
      return (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground text-center px-6">
          ยังไม่มีชิ้นส่วนที่แสดงในมุมมองนี้
        </div>
      );
    }
    return (
      <div
        className={m === 'sketch' ? 'w-full h-full [&_*]:!filter-none grayscale contrast-[3] invert' : 'w-full h-full'}
      >
        <GarmentRenderer
          layers={activeLayers}
          canvas={catalog.canvas}
          selectedPart={interactive ? selectedPart : null}
          hoveredPart={interactive ? hoveredPart : null}
          onSelectPart={interactive ? selectPart : undefined}
          onHoverPart={interactive ? hoverPart : undefined}
          interactive={interactive}
        />
      </div>
    );
  };

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 bg-white p-6 flex flex-col' : 'flex flex-col h-full'}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <button disabled title="เร็วๆ นี้"
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground/50 cursor-not-allowed">
            <Undo2 className="w-4 h-4" />
          </button>
          <button disabled title="เร็วๆ นี้"
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground/50 cursor-not-allowed">
            <Redo2 className="w-4 h-4" />
          </button>
          <button onClick={handleReset} title="รีเซ็ตกลับไปแบบเริ่มต้น"
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-primary hover:bg-muted transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'ออกจากเต็มจอ' : 'ดูเต็มจอ'}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-primary hover:bg-muted transition-colors">
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Stage */}
      <div className="relative flex-1 min-h-0 bg-gradient-to-b from-stone-50 to-stone-100 rounded-3xl border border-border/60 shadow-sm overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-full h-full max-w-[420px] max-h-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }} className="w-full h-full">
                {renderStage(mode, mode === 'front')}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Callout label */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <AnimatePresence>
            {mode === 'front' && (hoveredPart || selectedPart) && (
              <motion.span initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border
                  ${selectedPart ? 'bg-secondary text-white border-secondary' : 'bg-white/95 text-primary border-white'}`}>
                {activeLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Price */}
        <div className="absolute top-4 right-4">
          <motion.div key={price} initial={{ scale: 1.08 }} animate={{ scale: 1 }}
            className="bg-white/95 backdrop-blur rounded-full px-4 py-1.5 shadow-sm border border-white">
            <span className="text-sm font-bold text-primary">{price.toLocaleString()}</span>
            <span className="text-[11px] text-muted-foreground ml-1">บาท</span>
          </motion.div>
        </div>
      </div>

      {/* มุมมองตัวอย่าง — 4 มุมสด */}
      <div className="mt-3">
        <p className="text-[11px] text-muted-foreground mb-1.5">มุมมองตัวอย่าง</p>
        <div className="grid grid-cols-4 gap-2">
          {MODES.map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className={`rounded-xl border-2 overflow-hidden bg-white transition-all
                ${mode === m.key ? 'border-secondary shadow-[0_0_0_2px_rgba(197,165,90,0.25)]' : 'border-border hover:border-secondary/50'}`}>
              <div className="aspect-square p-2 pointer-events-none bg-stone-50">
                {renderStage(m.key, false)}
              </div>
              <p className={`text-[10px] py-1 text-center font-medium ${mode === m.key ? 'text-primary' : 'text-muted-foreground'}`}>
                {m.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
