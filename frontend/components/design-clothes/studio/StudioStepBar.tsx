'use client';

/**
 * StudioStepBar — แถบ 4 ขั้นตอน (ไม่ gate การแก้ไข) ต่างจาก mobile wizard
 * ขั้นที่ active มาจาก scroll spy จริง (IntersectionObserver บน section ids) ไม่ใช่ค่าคงที่
 * คลิกแล้ว scroll-anchor ไปยัง section นั้น ทุก section แก้ไขได้พร้อมกันตลอดเวลา
 */

import { useEffect, useState } from 'react';

const STEPS = [
  { id: 'studio-parts', label: 'เลือกรูปแบบ' },
  { id: 'studio-fabric', label: 'เลือกผ้า' },
  { id: 'studio-design', label: 'ปรับแต่ง' },
  { id: 'studio-summary', label: 'รายละเอียด & สั่งผลิต' },
] as const;

export default function StudioStepBar() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const elements = STEPS.map(s => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (!visible.length) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        const idx = STEPS.findIndex(s => s.id === topMost.target.id);
        if (idx !== -1) setActiveIndex(idx);
      },
      { rootMargin: '-160px 0px -60% 0px', threshold: 0 },
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 pt-3">
      <div className="flex items-center bg-white border border-border rounded-2xl p-2 shadow-sm w-fit">
        {STEPS.map((s, i) => {
          const active = i === activeIndex;
          const done = i < activeIndex;
          return (
            <div key={s.id} className="flex items-center">
              <button onClick={() => scrollTo(s.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                  ${active ? 'bg-primary text-white' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                  ${active ? 'bg-white text-primary' : done ? 'bg-secondary text-white' : 'bg-muted text-primary'}`}>
                  {i + 1}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className="w-6 h-px bg-border mx-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const STUDIO_SECTION_IDS = STEPS.map(s => s.id);
