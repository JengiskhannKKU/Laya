'use client';

/**
 * StudioStepBar — แถบบอกทิศทาง 4 จุด (ไม่ gate การแก้ไข) ต่างจาก mobile wizard
 * คลิกแล้ว scroll-anchor ไปยัง section นั้น ทุก section แก้ไขได้พร้อมกันตลอดเวลา
 */

const STEPS = [
  { id: 'studio-parts', label: 'เลือกรูปแบบเสื้อ' },
  { id: 'studio-fabric', label: 'เลือกผ้า' },
  { id: 'studio-design', label: 'ปรับดีไซน์' },
  { id: 'studio-summary', label: 'รายละเอียด & สั่งผลิต' },
] as const;

export default function StudioStepBar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 pt-3">
      <div className="flex items-center gap-2 bg-white border border-border rounded-2xl p-1.5 shadow-sm w-fit">
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => scrollTo(s.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
            <span className="w-5 h-5 rounded-full bg-muted text-primary flex items-center justify-center text-[10px] font-bold">
              {i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const STUDIO_SECTION_IDS = STEPS.map(s => s.id);
