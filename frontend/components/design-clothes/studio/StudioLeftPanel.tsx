'use client';

/**
 * StudioLeftPanel — "1. เลือกรูปแบบ"
 * ประเภทชิ้นงาน (top/pants/skirt) มาจาก catalog.categories จริง — สลับด้วย applyTemplate(template แรกของหมวดนั้น)
 * ส่วน "ทรง.../รายละเอียดคอเสื้อ" ถูกดึง part 'body'/'collar' ออกมาเป็นกริดไอคอนเด่น ๆ ก่อน accordion ของ part ที่เหลือ
 * ไม่มีข้อมูล gender/ความยาว/ชายเสื้อจริงใน catalog เลยไม่ใส่ตัวเลือกที่ไม่มีข้อมูลรองรับ (กันข้อมูลปลอม)
 */

import type { ReactElement } from 'react';
import { motion } from 'framer-motion';
import { Check, Ban, Lightbulb } from 'lucide-react';

import { useGarmentStore } from '@/lib/stores/garment-store';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { Catalog, GarmentDesign, CategoryDef, Category } from '../builder/types';
import { PartPreview } from '../builder/GarmentRenderer';

interface Props {
  catalog: Catalog;
  categoryDef: CategoryDef;
  design: GarmentDesign;
}

const CATEGORY_ORDER: Category[] = ['top', 'pants', 'skirt'];

const CATEGORY_ICON: Record<Category, ReactElement> = {
  top: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3l4 2 4-2 4 4-3 3v11H7V10L4 7l4-4z" />
    </svg>
  ),
  pants: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l1 6-1.5 12H14l-2-9-2 9H6.5L5 9l1-6z" />
    </svg>
  ),
  skirt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6l1 5 4 12H4L8 8l1-5z" />
      <path d="M9 3h6" />
    </svg>
  ),
};

const BODY_HEADING: Record<Category, string> = {
  top: 'ทรงเสื้อ',
  pants: 'ทรงกางเกง',
  skirt: 'ทรงกระโปรง',
};

export default function StudioLeftPanel({ catalog, categoryDef, design }: Props) {
  const store = useGarmentStore();
  const selectedPart = useGarmentStore(s => s.selectedPart);

  const bodyPart = categoryDef.parts.find(p => p.key === 'body');
  const collarPart = categoryDef.parts.find(p => p.key === 'collar');
  const restParts = categoryDef.parts.filter(p => p.key !== 'body' && p.key !== 'collar');

  const handleSwitchCategory = (cat: Category) => {
    if (cat === design.category) return;
    const first = catalog.templates.find(t => t.category === cat);
    if (first) store.applyTemplate(first);
  };

  const cycleTemplate = () => {
    const pool = catalog.templates.filter(t => t.category === design.category);
    if (pool.length < 2) return;
    const currentIdx = pool.findIndex(t => t.id === store.templateId);
    const next = pool[(currentIdx + 1 + pool.length) % pool.length];
    store.applyTemplate(next);
  };

  const renderOptionGrid = (part: NonNullable<typeof bodyPart>) => {
    const options = catalog.options[part.options] ?? [];
    const currentId = design.parts[part.key];
    return (
      <div className="grid grid-cols-3 gap-2">
        {options.map(opt => {
          const active = currentId === opt.id;
          const pt = catalog.patterns.find(p => p.id === (design.partPattern[part.key] ?? design.pattern));
          return (
            <motion.button key={opt.id} whileTap={{ scale: 0.95 }}
              onClick={() => store.setPart(part.key, opt.id)}
              onMouseEnter={() => store.hoverPart(part.key)}
              onMouseLeave={() => store.hoverPart(null)}
              className={`relative rounded-xl border-2 p-2 flex flex-col items-center gap-1 transition-all bg-white
                ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-secondary/50'}`}>
              <div className="w-full aspect-square">
                <PartPreview asset={opt.asset} mode={part.render === 'image' ? 'image' : 'mask'}
                  patternImage={pt?.image ?? null} color={design.partColor[part.key] ?? design.color} />
              </div>
              {active && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
              <span className="text-[10px] font-medium leading-tight text-center text-muted-foreground truncate w-full">
                {opt.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    );
  };

  return (
    <div id="studio-parts" className="space-y-4 scroll-mt-56">
      <div>
        <h2 className="text-sm font-bold text-primary">1. เลือกรูปแบบ{design.category === 'top' ? 'เสื้อ' : ''}</h2>
        <p className="text-[11px] text-muted-foreground">{categoryDef.name} — ปรับแต่งทีละชิ้นส่วนได้เลย</p>
      </div>

      {/* ประเภทชิ้นงาน */}
      <div>
        <p className="text-[11px] font-semibold text-primary mb-1.5">ประเภทชิ้นงาน</p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORY_ORDER.map(cat => {
            const active = cat === design.category;
            return (
              <button key={cat} onClick={() => handleSwitchCategory(cat)}
                className={`rounded-xl border-2 py-2.5 flex flex-col items-center gap-1 transition-all bg-white
                  ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-secondary/50'}`}>
                <span className={`w-6 h-6 ${active ? 'text-primary' : 'text-muted-foreground'}`}>{CATEGORY_ICON[cat]}</span>
                <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {catalog.categories[cat].name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ทรง... — โปรโมท part 'body' ขึ้นมาเป็นกริดเด่น */}
      {bodyPart && (
        <div>
          <p className="text-[11px] font-semibold text-primary mb-1.5">{BODY_HEADING[design.category]}</p>
          {renderOptionGrid(bodyPart)}
        </div>
      )}

      {/* รายละเอียดคอเสื้อ — โปรโมท part 'collar' (มีเฉพาะหมวดเสื้อ) */}
      {collarPart && (
        <div>
          <p className="text-[11px] font-semibold text-primary mb-1.5">รายละเอียดคอเสื้อ</p>
          {renderOptionGrid(collarPart)}
        </div>
      )}

      {/* ชิ้นส่วนที่เหลือ — accordion ต่อ part */}
      {restParts.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-primary mb-1">รายละเอียดเพิ่มเติม</p>
          <Accordion type="single" collapsible defaultValue={restParts[0]?.key} className="border border-border rounded-2xl bg-white px-3">
            {restParts.map(part => {
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
      )}

      {/* เคล็ดลับ */}
      <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Lightbulb className="w-3.5 h-3.5 text-secondary" />
          <p className="text-[11px] font-bold text-primary">เคล็ดลับ</p>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">
          คุณสามารถเลือกส่วนต่าง ๆ และปรับแต่งได้อิสระ ลองดูตัวอย่างแบบสำเร็จรูปเพื่อเป็นไอเดีย
        </p>
        <button onClick={cycleTemplate}
          className="w-full text-center text-[11px] font-semibold text-primary bg-white border border-border rounded-xl py-2 hover:bg-muted transition-colors">
          ดูตัวอย่างแบบทั้งหมด
        </button>
      </div>
    </div>
  );
}
