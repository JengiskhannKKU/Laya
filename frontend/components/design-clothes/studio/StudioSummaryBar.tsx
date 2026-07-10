'use client';

/**
 * StudioSummaryBar — แถบล่างสุด: สรุปแบบเป็น tags + ราคาแยกรายการ + สั่งตัด
 * หมายเหตุ: ปุ่ม "บันทึกไว้ในรายการโปรด" ผูกกับ localStorage draft เดิม (onSave) ไม่ใช่ wishlist-context —
 * wishlist ผูกกับ product_id จริงในฐานข้อมูล ใช้กับดีไซน์ที่กำลังปรับแต่งอยู่ (ยังไม่มี id จริง) ไม่ได้
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';

import type { Catalog, CategoryDef, GarmentDesign, PriceBreakdown } from '../builder/types';

interface Props {
  catalog: Catalog;
  categoryDef: CategoryDef;
  design: GarmentDesign;
  breakdown: PriceBreakdown;
  onSave: () => void;
  savedNote?: string;
}

export default function StudioSummaryBar({ catalog, categoryDef, design, breakdown, onSave, savedNote }: Props) {
  const tags = useMemo(() => {
    const out: { group: string; value: string }[] = [];
    for (const part of categoryDef.parts) {
      const optId = design.parts[part.key];
      if (!optId || optId === 'none') continue;
      const opt = (catalog.options[part.options] ?? []).find(o => o.id === optId);
      if (opt) out.push({ group: part.name, value: opt.name });
    }
    const pt = catalog.patterns.find(x => x.id === design.pattern);
    if (pt) out.push({ group: 'ผ้า', value: pt.name });
    const cl = catalog.colors.find(x => x.hex === design.color);
    if (cl) out.push({ group: 'สี', value: cl.name });
    return out;
  }, [catalog, categoryDef, design]);

  return (
    <div id="studio-summary" className="scroll-mt-40 bg-white rounded-2xl border border-border shadow-sm p-4 flex flex-col lg:flex-row lg:items-center gap-4">
      {/* สรุปแบบของคุณ */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-primary mb-1.5">สรุปแบบของคุณ</p>
        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 && <span className="text-[11px] text-muted-foreground">ยังไม่ได้เลือกชิ้นส่วน</span>}
          {tags.map((t, i) => (
            <span key={i} className="inline-flex items-center rounded-full overflow-hidden border border-border text-[11px]">
              <span className="px-2 py-1 bg-muted text-muted-foreground font-medium">{t.group}</span>
              <span className="px-2 py-1 bg-white text-primary font-semibold">{t.value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ราคาประมาณการ */}
      <div className="lg:w-56 shrink-0 lg:border-l lg:border-border/60 lg:pl-4">
        <p className="text-[11px] text-muted-foreground">ราคาประมาณการ</p>
        <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
          <span>ผ้า ({(breakdown.fabric > 0 ? '2.0 เมตร' : 'เนื้อเรียบ')})</span>
          <span>{breakdown.fabric.toLocaleString()} บาท</span>
        </div>
        <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
          <span>ตัดเย็บพื้นฐาน</span>
          <span>{breakdown.base.toLocaleString()} บาท</span>
        </div>
        {breakdown.options > 0 && (
          <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
            <span>ดีเทลเพิ่มเติม</span>
            <span>{breakdown.options.toLocaleString()} บาท</span>
          </div>
        )}
        <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-border/60">
          <span className="text-xs font-semibold text-primary">รวมทั้งหมด</span>
          <span className="text-lg font-bold text-primary">{breakdown.total.toLocaleString()} <span className="text-xs font-medium">บาท</span></span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 shrink-0">
        {savedNote && <span className="text-[11px] text-secondary font-medium">{savedNote}</span>}
        <button onClick={onSave}
          className="px-3.5 py-3 rounded-xl border border-border text-primary text-xs font-semibold flex items-center gap-1.5 hover:bg-muted transition-colors">
          <Heart className="w-3.5 h-3.5" /> บันทึกไว้ในรายการโปรด
        </button>
        <Link href="/tailor/with-fabric"
          className="px-5 py-3 rounded-xl bg-secondary text-white text-sm font-bold flex items-center gap-2 hover:bg-secondary/90 active:scale-[0.99] transition-all shadow-md whitespace-nowrap">
          สั่งตัดชุดนี้ <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
