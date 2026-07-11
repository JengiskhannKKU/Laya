'use client';

/**
 * StudioSummaryBar — ล่างสุด แบ่งเป็น 3 การ์ด: สรุปแบบของคุณ / ราคาประมาณการ / พร้อมสั่งผลิต
 * หมายเหตุ: ปุ่ม "บันทึกไว้ในรายการโปรด" ผูกกับ localStorage draft เดิม (onSave) ไม่ใช่ wishlist-context —
 * wishlist ผูกกับ product_id จริงในฐานข้อมูล ใช้กับดีไซน์ที่กำลังปรับแต่งอยู่ (ยังไม่มี id จริง) ไม่ได้
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Shirt, CircleDot, MoveHorizontal, Package, Circle, Sparkles, Layers, Palette, Tag, CheckCircle2 } from 'lucide-react';

import type { Catalog, CategoryDef, GarmentDesign, PriceBreakdown } from '../builder/types';

interface Props {
  catalog: Catalog;
  categoryDef: CategoryDef;
  design: GarmentDesign;
  breakdown: PriceBreakdown;
  onSave: () => void;
  savedNote?: string;
}

function tagIcon(group: string) {
  if (group.includes('ตัว')) return Shirt;
  if (group.includes('คอ')) return CircleDot;
  if (group.includes('แขน')) return MoveHorizontal;
  if (group.includes('กระเป๋า')) return Package;
  if (group.includes('กระดุม')) return Circle;
  if (group.includes('ตกแต่ง')) return Sparkles;
  if (group === 'ผ้า') return Layers;
  if (group === 'สี') return Palette;
  return Tag;
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
    <div id="studio-summary" className="scroll-mt-56 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* สรุปแบบของคุณ */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
        <p className="text-xs font-bold text-primary mb-3">สรุปแบบของคุณ</p>
        {tags.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">ยังไม่ได้เลือกชิ้นส่วน</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {tags.map((t, i) => {
              const Icon = tagIcon(t.group);
              return (
                <div key={i} className="flex items-start gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center shrink-0 text-primary">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] text-muted-foreground truncate">{t.group}</span>
                    <span className="block text-[11px] font-semibold text-primary truncate">{t.value}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ราคาประมาณการ */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
        <p className="text-xs font-bold text-primary mb-3">ราคาประมาณการ</p>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
            <span>ผ้า ({breakdown.fabric > 0 ? '2.0 เมตร' : 'เนื้อเรียบ'})</span>
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
        </div>
        <div className="flex items-baseline justify-between mt-2.5 pt-2.5 border-t border-border/60">
          <span className="text-xs font-semibold text-primary">รวมทั้งหมด</span>
          <span className="text-lg font-bold text-primary">{breakdown.total.toLocaleString()} <span className="text-xs font-medium">บาท</span></span>
        </div>
      </div>

      {/* พร้อมสั่งผลิต */}
      <div className="bg-primary rounded-2xl shadow-sm p-4 flex flex-col">
        <p className="text-xs font-bold text-white mb-3">พร้อมสั่งผลิต</p>
        <ul className="space-y-1.5 mb-4 flex-1">
          <li className="flex items-center gap-2 text-[11px] text-white/85">
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" /> บันทึกแบบของคุณแล้ว
          </li>
          <li className="flex items-center gap-2 text-[11px] text-white/85">
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" /> คุณสามารถสั่งผลิตหรือติดต่อช่างผลิตได้เลย
          </li>
          <li className="flex items-center gap-2 text-[11px] text-white/85">
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" /> ระยะเวลาผลิตโดยประมาณ 15–25 วันทำการ
          </li>
        </ul>

        {savedNote && <span className="text-[11px] text-secondary font-medium mb-2">{savedNote}</span>}
        <div className="flex flex-col gap-2">
          <Link href="/tailor/with-fabric"
            className="px-4 py-3 rounded-xl bg-secondary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 active:scale-[0.99] transition-all shadow-md">
            ดำเนินการต่อ <ArrowRight className="w-4 h-4" />
          </Link>
          <button onClick={onSave}
            className="px-3.5 py-2.5 rounded-xl border border-white/25 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors">
            <Heart className="w-3.5 h-3.5" /> บันทึกไว้ในรายการโปรด
          </button>
        </div>
      </div>
    </div>
  );
}
