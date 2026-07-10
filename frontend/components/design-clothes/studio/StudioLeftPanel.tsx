'use client';

/**
 * StudioLeftPanel — "1. เลือกรูปแบบเสื้อ"
 * ประเภทชุด (top/pants/skirt — ข้อมูลจริงจาก catalog.categories) → ทรงเริ่มต้น (เทมเพลต) → ชิ้นส่วนแต่ละจุด (accordion)
 * ไม่มี "ประเภทเสื้อผู้หญิง/ผู้ชาย/ยูนิเซ็กส์" แบบใน mockup เพราะ catalog ไม่มีข้อมูลนี้จริง
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Ban } from 'lucide-react';

import { useGarmentStore } from '@/lib/stores/garment-store';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { Catalog, Category, GarmentDesign, CategoryDef } from '../builder/types';
import { PartPreview } from '../builder/GarmentRenderer';

interface Props {
  catalog: Catalog;
  categoryDef: CategoryDef;
  design: GarmentDesign;
}

const CATEGORY_ORDER: Category[] = ['top', 'pants', 'skirt'];

export default function StudioLeftPanel({ catalog, categoryDef, design }: Props) {
  const store = useGarmentStore();
  const selectedPart = useGarmentStore(s => s.selectedPart);
  const templateId = useGarmentStore(s => s.templateId);

  const templatesInCategory = useMemo(
    () => catalog.templates.filter(t => t.category === design.category),
    [catalog, design.category],
  );

  return (
    <div id="studio-parts" className="space-y-4 scroll-mt-40">
      <div>
        <h2 className="text-sm font-bold text-primary">1. เลือกรูปแบบเสื้อ</h2>
        <p className="text-[11px] text-muted-foreground">เลือกประเภท ทรง แล้วปรับแต่งทีละชิ้นส่วน</p>
      </div>

      {/* ประเภท */}
      <div>
        <p className="text-[11px] font-semibold text-primary mb-1.5">ประเภทชุด</p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORY_ORDER.filter(c => catalog.categories[c]).map(c => {
            const active = design.category === c;
            const t = catalog.templates.find(tp => tp.category === c);
            return (
              <button key={c} onClick={() => t && store.applyTemplate(t)}
                className={`rounded-xl border-2 p-2 flex flex-col items-center gap-1 transition-all bg-white
                  ${active ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-secondary/50'}`}>
                <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {catalog.categories[c].name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ทรง — เทมเพลตเริ่มต้นของประเภทนี้ */}
      {templatesInCategory.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-primary mb-1.5">ทรง{categoryDef.name}</p>
          <div className="grid grid-cols-3 gap-2">
            {templatesInCategory.map(t => (
              <button key={t.id} onClick={() => store.applyTemplate(t)}
                className={`rounded-xl border-2 px-2 py-2.5 text-center transition-all bg-white
                  ${templateId === t.id ? 'border-secondary bg-secondary/5 shadow-sm' : 'border-border hover:border-secondary/50'}`}>
                <span className="text-[11px] font-medium text-primary leading-tight block truncate">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ชิ้นส่วน — accordion ต่อ part */}
      <div>
        <p className="text-[11px] font-semibold text-primary mb-1">รายละเอียดแต่ละส่วน</p>
        <Accordion type="single" collapsible defaultValue={categoryDef.parts[0]?.key} className="border border-border rounded-2xl bg-white px-3">
          {categoryDef.parts.map(part => {
            const options = catalog.options[part.options] ?? [];
            const currentId = design.parts[part.key];
            const isActive = selectedPart === part.key;
            return (
              <AccordionItem key={part.key} value={part.key} className={isActive ? 'bg-secondary/5 -mx-3 px-3 rounded-xl' : undefined}>
                <AccordionTrigger onClick={() => store.selectPart(part.key)} className="text-xs font-semibold text-primary">
                  {part.name}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-4 gap-2">
                    {part.allowNone && (
                      <button onClick={() => store.setPart(part.key, 'none')}
                        className={`rounded-xl border-2 p-1.5 flex flex-col items-center gap-1 transition-all bg-white
                          ${currentId === 'none' || !currentId ? 'border-primary bg-primary/5' : 'border-border hover:border-secondary/50'}`}>
                        <div className="w-full aspect-square flex items-center justify-center">
                          <Ban className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-[9px] text-muted-foreground">ไม่ใส่</span>
                      </button>
                    )}
                    {options.map(opt => {
                      const active = currentId === opt.id;
                      const pt = catalog.patterns.find(p => p.id === (design.partPattern[part.key] ?? design.pattern));
                      return (
                        <motion.button key={opt.id} whileTap={{ scale: 0.95 }} onClick={() => store.setPart(part.key, opt.id)}
                          className={`relative rounded-xl border-2 p-1.5 flex flex-col items-center gap-1 transition-all bg-white
                            ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-secondary/50'}`}>
                          <div className="w-full aspect-square">
                            <PartPreview asset={opt.asset} mode={part.render === 'image' ? 'image' : 'mask'}
                              patternImage={pt?.image ?? null} color={design.partColor[part.key] ?? design.color} />
                          </div>
                          {active && (
                            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-secondary flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </span>
                          )}
                          <span className="text-[9px] font-medium leading-tight text-center text-muted-foreground truncate w-full">
                            {opt.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
