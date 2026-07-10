'use client';

/**
 * StudioRightPanel — "2. เลือกผ้า" + "3. ปรับดีไซน์"
 * ค้นหาผ้าเป็นของจริง (client-side filter ชื่อ/คำโปรย) — แท็บผ้าไหม/ผ้าฝ้าย และ filter ภูมิภาค/เทคนิค
 * เป็น decorative-but-inert เพราะ catalog.json ไม่มี metadata ประเภท/ภูมิภาค/เทคนิครองรับจริง (ไม่ปั้นข้อมูลปลอม)
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Search } from 'lucide-react';

import { useGarmentStore } from '@/lib/stores/garment-store';
import type { Catalog, GarmentDesign } from '../builder/types';

/** คำโปรยผ้าแบบเข้าใจง่าย (UI copy เท่านั้น — เหมือน ClothingDesigner.tsx) */
const PATTERN_SUBTITLE: Record<string, string> = {
  plain: 'เนื้อเรียบ เข้าได้กับทุกลุค',
  cotton: 'ฝ้ายทอมือ · เชียงใหม่',
  thaisilk: 'ไหมแท้เงางาม · กาฬสินธุ์',
  mudmee: 'ลายมรดกอีสาน · สุรินทร์',
  indigo: 'ย้อมครามธรรมชาติ · สกลนคร',
  linen: 'เนื้อโปร่งใส่สบาย',
};

interface Props {
  catalog: Catalog;
  design: GarmentDesign;
}

export default function StudioRightPanel({ catalog, design }: Props) {
  const store = useGarmentStore();
  const [search, setSearch] = useState('');

  const patterns = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog.patterns;
    return catalog.patterns.filter(
      p => p.name.toLowerCase().includes(q) || (PATTERN_SUBTITLE[p.id] ?? '').toLowerCase().includes(q),
    );
  }, [catalog.patterns, search]);

  return (
    <div className="space-y-4">
      {/* เลือกผ้า */}
      <div id="studio-fabric" className="scroll-mt-40">
        <h2 className="text-sm font-bold text-primary mb-2">2. เลือกผ้า</h2>

        {/* แท็บ/filter ตกแต่ง — ยังไม่มีข้อมูลประเภท/ภูมิภาค/เทคนิครองรับจริงใน catalog */}
        <div className="flex gap-1.5 mb-2 opacity-50 pointer-events-none select-none" title="ยังไม่เปิดใช้งาน">
          <span className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-lg bg-primary text-white">ผ้าไหม</span>
          <span className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-lg bg-muted text-muted-foreground">ผ้าฝ้าย</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mb-2 opacity-50 pointer-events-none select-none" title="ยังไม่เปิดใช้งาน">
          <span className="text-[11px] px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground bg-white">ภูมิภาค: ทั้งหมด</span>
          <span className="text-[11px] px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground bg-white">เทคนิค: ทั้งหมด</span>
        </div>

        {/* ค้นหา — ทำงานจริง */}
        <div className="relative mb-2.5">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาลายผ้า หรือชื่อผ้า"
            className="w-full bg-stone-50 border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary" />
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-0.5">
          {patterns.map(pt => {
            const active = design.pattern === pt.id;
            return (
              <motion.button key={pt.id} whileTap={{ scale: 0.96 }} onClick={() => store.setPattern(pt.id)}
                className={`relative rounded-xl overflow-hidden border-2 text-left transition-all bg-white
                  ${active ? 'border-secondary shadow-[0_0_0_2px_rgba(197,165,90,0.3)]' : 'border-border hover:border-secondary/50'}`}>
                <div className="aspect-[4/3] bg-[#EFE9DD]">
                  {pt.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={pt.image} alt={pt.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: '#E8DCC8' }} />
                  )}
                </div>
                {active && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
                <div className="px-2 py-1.5">
                  <p className="text-[11px] font-semibold text-primary truncate">{pt.name}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{PATTERN_SUBTITLE[pt.id] ?? ''}</p>
                </div>
              </motion.button>
            );
          })}
          {patterns.length === 0 && (
            <p className="col-span-2 text-center text-xs text-muted-foreground py-6">ไม่พบผ้าที่ค้นหา</p>
          )}
        </div>
      </div>

      {/* ปรับดีไซน์ — สี */}
      <div id="studio-design" className="scroll-mt-40">
        <h2 className="text-sm font-bold text-primary mb-2">3. ปรับดีไซน์</h2>
        <p className="text-[11px] text-muted-foreground mb-1.5">โทนสีผ้า</p>
        <div className="grid grid-cols-6 gap-2">
          {catalog.colors.map(c => {
            const active = design.color === c.hex;
            return (
              <button key={c.hex} onClick={() => store.setColor(c.hex)} title={c.name}
                className="flex flex-col items-center gap-1">
                <span className={`relative w-8 h-8 rounded-full border-2 shadow-inner transition-all
                  ${active ? 'border-primary scale-110 shadow' : 'border-white hover:scale-105'}`}
                  style={{ backgroundColor: c.hex }}>
                  {active && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-secondary flex items-center justify-center shadow">
                      <Check className="w-2 h-2 text-white" />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
