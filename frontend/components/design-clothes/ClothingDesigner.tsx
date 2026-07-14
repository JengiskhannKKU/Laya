'use client';

/**
 * LAYA Creative Studio — ประสบการณ์แบบ "เลือกสไตล์ที่ชอบ" ไม่ใช่ "ตั้งค่าสินค้า"
 *
 * หลักการ (UX pass — business logic/store/renderer เดิมทั้งหมด):
 * - ทีละการตัดสินใจ: เลือกสไตล์ → ปรับแต่ง → ผ้า → สี → สรุป
 * - ชุดคือพระเอก: พรีวิวใหญ่ที่สุดเสมอ
 * - การ์ดรูปใหญ่ กดง่าย ไม่มี dropdown/accordion
 * - Progressive disclosure: ลาย/สีเฉพาะจุดซ่อนไว้จนกว่าจะขอ
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import LayaLogo from '@/components/common/LayaLogo';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Check, X, Bookmark, ArrowRight, Sparkles, Wand2, Ban, Heart, Pencil,
} from 'lucide-react';

import { useGarmentStore } from '@/lib/stores/garment-store';
import {
  Catalog, GarmentDesign, PartDef,
  resolveLayers, calcPrice,
} from './builder/types';
import { PartPreview } from './builder/GarmentRenderer';
import GarmentPhotoStage from './builder/GarmentPhotoStage';

// ─── Flow ────────────────────────────────────────────────────────────────────
// เหลือแค่ชุดไทยร่วมสมัย (thai-contemporary) ตัวเดียว — ตัดขั้น "เลือกสไตล์" ออก ไม่มีให้เลือกทรงอื่น/กางเกง/กระโปรง
const STEPS = [
  { key: 'customize', label: 'ปรับแต่ง' },
  { key: 'fabric', label: 'เลือกผ้า' },
  { key: 'color', label: 'เลือกสี' },
  { key: 'done', label: 'สรุป' },
] as const;
type StepKey = typeof STEPS[number]['key'];

/** คำโปรยผ้าแบบเข้าใจง่าย (UI copy เท่านั้น) */
const PATTERN_SUBTITLE: Record<string, string> = {
  plain: 'เนื้อเรียบ เข้าได้กับทุกลุค',
  cotton: 'ฝ้ายทอมือ · เชียงใหม่',
  thaisilk: 'ไหมแท้เงางาม · กาฬสินธุ์',
  mudmee: 'ลายมรดกอีสาน · สุรินทร์',
  indigo: 'ย้อมครามธรรมชาติ · สกลนคร',
  linen: 'เนื้อโปร่งใส่สบาย',
};

// ─── AI Design Assistant (logic เดิม) ────────────────────────────────────────
interface AiSuggestionItem { label: string; detail: string; apply: () => void }

function buildAiSuggestions(prompt: string, catalog: Catalog): { theme: string; items: AiSuggestionItem[] } {
  const s = useGarmentStore.getState();
  const p = prompt.toLowerCase();
  const mk = (label: string, detail: string, apply: () => void): AiSuggestionItem => ({ label, detail, apply });
  const ensureTop = () => {
    if (useGarmentStore.getState().category !== 'top') {
      const t = catalog.templates.find(tp => tp.id === 'thai-contemporary');
      if (t) s.applyTemplate(t);
    }
  };

  const themes = [
    {
      match: /หรู|สง่า|elegant|งานพิธี|ราตรี/,
      theme: 'ชุดไทยหรูหรา',
      items: [
        mk('คอเสื้อ', 'คอจีน — สง่างามแบบไทย', () => { ensureTop(); s.setPart('collar', 'mandarin'); }),
        mk('แขนเสื้อ', 'แขนยาว — เรียบร้อยเป็นทางการ', () => { ensureTop(); s.setPart('sleeves', 'long'); }),
        mk('ลายผ้า', 'ไหมไทย — เนื้อเงางาม', () => s.setPattern('thaisilk')),
        mk('สี', 'ทอง — หรูหราโดดเด่น', () => s.setColor('#C9A227')),
        mk('กระดุม', 'กระดุมไม้ — เข้ากับงานหัตถกรรม', () => { ensureTop(); s.setPart('buttons', 'wood'); }),
      ],
    },
    {
      match: /ออฟฟิศ|ทำงาน|ทางการ|office|formal/,
      theme: 'ลุคออฟฟิศ',
      items: [
        mk('คอเสื้อ', 'คอปกเชิ้ต — ดูเป็นมืออาชีพ', () => { ensureTop(); s.setPart('collar', 'shirt'); }),
        mk('แขนเสื้อ', 'แขนยาว', () => { ensureTop(); s.setPart('sleeves', 'long'); }),
        mk('ลายผ้า', 'ลินิน — เรียบสุภาพ', () => s.setPattern('linen')),
        mk('สี', 'กรมท่า — คลาสสิก', () => s.setColor('#1B2A4A')),
      ],
    },
    {
      match: /สบาย|ลำลอง|เที่ยว|casual|ชิล|ซัมเมอร์|summer/,
      theme: 'ลุคลำลอง',
      items: [
        mk('คอเสื้อ', 'คอกลม — ใส่สบาย', () => { ensureTop(); s.setPart('collar', 'round'); }),
        mk('แขนเสื้อ', 'แขนสั้น — คล่องตัว', () => { ensureTop(); s.setPart('sleeves', 'short'); }),
        mk('ลายผ้า', 'ฝ้ายทอมือ — ระบายอากาศดี', () => s.setPattern('cotton')),
        mk('สี', 'เขียวหม่น — สบายตา', () => s.setColor('#5F7470')),
      ],
    },
    {
      match: /หวาน|น่ารัก|ชมพู|ผู้หญิง|feminine/,
      theme: 'ลุคหวานละมุน',
      items: [
        mk('ตัวเสื้อ', 'เบลาส์ — ทรงพลิ้ว', () => { ensureTop(); s.setPart('body', 'blouse'); }),
        mk('แขนเสื้อ', 'แขนบอลลูน — น่ารักมีมิติ', () => { ensureTop(); s.setPart('sleeves', 'balloon'); }),
        mk('ลายผ้า', 'ฝ้ายทอมือ', () => s.setPattern('cotton')),
        mk('สี', 'ชมพู', () => s.setColor('#F4A7B9')),
      ],
    },
    {
      match: /คราม|น้ำเงิน|indigo|ฟ้า/,
      theme: 'โทนครามธรรมชาติ',
      items: [
        mk('ลายผ้า', 'ครามสกลนคร — ย้อมธรรมชาติ', () => s.setPattern('indigo')),
        mk('สี', 'กรมท่า', () => s.setColor('#1B2A4A')),
      ],
    },
  ];

  const hit = themes.find(t => t.match.test(p));
  if (hit) return { theme: hit.theme, items: hit.items };
  return {
    theme: 'ชุดไทยร่วมสมัย',
    items: [
      mk('คอเสื้อ', 'คอจีน — เอกลักษณ์ไทย', () => { ensureTop(); s.setPart('collar', 'mandarin'); }),
      mk('ลายผ้า', 'มัดหมี่ — ลายมรดกอีสาน', () => s.setPattern('mudmee')),
      mk('สี', 'แดงเข้ม', () => s.setColor('#8B1A2D')),
    ],
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function ClothingDesigner() {
  const store = useGarmentStore();
  const {
    catalog, loading, category, parts, partPattern, partColor, pattern, color,
    templateId, selectedPart, hoveredPart,
  } = store;

  const [step, setStep] = useState<StepKey>('customize');
  const [savedNote, setSavedNote] = useState('');
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => { store.loadCatalog(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const design: GarmentDesign = useMemo(
    () => ({ category, parts, partPattern, partColor, pattern, color }),
    [category, parts, partPattern, partColor, pattern, color],
  );
  const layers = useMemo(() => (catalog ? resolveLayers(catalog, design) : []), [catalog, design]);
  const price = useMemo(() => (catalog ? calcPrice(catalog, design) : 0), [catalog, design]);
  const categoryDef = catalog?.categories[category];

  useEffect(() => {
    if (!savedNote) return;
    const t = setTimeout(() => setSavedNote(''), 2200);
    return () => clearTimeout(t);
  }, [savedNote]);

  const DRAFT_KEY = 'laya-garment-builder-v1';
  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ category, parts, partPattern, partColor, pattern, color, templateId }));
    setSavedNote('บันทึกแล้ว');
  };

  const stepIndex = STEPS.findIndex(s => s.key === step);
  const goNext = () => { store.selectPart(null); setStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].key); };
  const goBack = () => { store.selectPart(null); setStep(STEPS[Math.max(0, stepIndex - 1)].key); };

  if (loading || !catalog || !categoryDef) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">กำลังเตรียมห้องออกแบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top bar: เบาที่สุด ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <Link href="/" className="shrink-0 flex items-center">
            <LayaLogo variant="navy" height={18} />
          </Link>

          {/* Stepper — จุดเดินทาง 5 ขั้น */}
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0">
            {STEPS.map((s, i) => {
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <button key={s.key}
                  onClick={() => done && setStep(s.key)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${done ? 'cursor-pointer hover:bg-muted' : 'cursor-default'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                    ${active ? 'bg-primary text-white scale-110 shadow' : done ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground'}`}>
                    {done ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  <span className={`text-[11px] font-medium hidden sm:block ${active ? 'text-primary font-semibold' : done ? 'text-secondary' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {savedNote && <span className="text-[11px] text-secondary font-medium">{savedNote}</span>}
            <button onClick={saveDraft} title="บันทึกแบบร่าง"
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-primary hover:bg-muted transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 max-w-screen-xl w-full mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}>

            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 items-start">
                {/* ── ชุดคือพระเอก ── */}
                <div className="lg:sticky lg:top-16">
                  <div className="relative bg-gradient-to-b from-stone-50 to-stone-100 rounded-3xl overflow-hidden shadow-sm border border-border/60">
                    <div className="mx-auto max-w-[460px] px-8 pt-8 pb-4">
                      <GarmentPhotoStage
                        design={design}
                        layers={layers}
                        canvas={catalog.canvas}
                        rendererProps={{
                          selectedPart,
                          hoveredPart,
                          onSelectPart: k => {
                            if (step !== 'customize') setStep('customize');
                            store.selectPart(selectedPart === k ? null : k);
                          },
                          onHoverPart: k => store.hoverPart(k),
                        }}
                      />
                    </div>

                    {/* ป้ายชิ้นที่ชี้ */}
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <AnimatePresence>
                        {(hoveredPart || selectedPart) && (
                          <motion.span initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border
                              ${selectedPart ? 'bg-secondary text-white border-secondary' : 'bg-white/95 text-primary border-white'}`}>
                            {categoryDef.parts.find(pt => pt.key === (selectedPart ?? hoveredPart))?.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ราคา — feedback ทันทีทุกการปรับ */}
                    <div className="absolute top-4 right-4">
                      <motion.div key={price} initial={{ scale: 1.08 }} animate={{ scale: 1 }}
                        className="bg-white/95 backdrop-blur rounded-full px-4 py-1.5 shadow-sm border border-white">
                        <span className="text-sm font-bold text-primary">{price.toLocaleString()}</span>
                        <span className="text-[11px] text-muted-foreground ml-1">บาท</span>
                      </motion.div>
                    </div>

                    {step === 'customize' && (
                      <p className="text-center text-xs text-muted-foreground pb-4">
                        แตะที่ชุดเพื่อปรับส่วนนั้นได้เลย
                      </p>
                    )}
                  </div>
                </div>

                {/* ── แผงของขั้นปัจจุบัน (ทีละเรื่อง) ── */}
                <div className="min-w-0">
                  {step === 'customize' && (
                    <StepCustomize catalog={catalog} categoryDef={categoryDef} design={design}
                      onOpenAi={() => setAiOpen(true)} />
                  )}
                  {step === 'fabric' && <StepFabric catalog={catalog} design={design} />}
                  {step === 'color' && <StepColor catalog={catalog} design={design} />}
                  {step === 'done' && (
                    <StepDone catalog={catalog} categoryDef={categoryDef} design={design} price={price}
                      onEdit={() => setStep('customize')} onSave={saveDraft} />
                  )}

                  {/* ปุ่มเดินหน้า/ถอยหลัง — ใหญ่ ชัด */}
                  <div className="flex items-center gap-2 mt-4">
                    {stepIndex > 0 && (
                      <button onClick={goBack}
                        className="px-4 py-3 rounded-2xl border border-border text-sm font-medium text-primary hover:bg-muted transition-colors flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
                      </button>
                    )}
                    {step !== 'done' && (
                      <button onClick={goNext}
                        className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2">
                        {step === 'customize' ? 'ต่อไป — เลือกผ้า' : step === 'fabric' ? 'ต่อไป — เลือกสี' : 'ดูสรุปชุดของฉัน'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── AI Assistant (bottom sheet — เรียกเมื่ออยากได้แรงบันดาลใจ) ── */}
      <AiSheet open={aiOpen} onClose={() => setAiOpen(false)} catalog={catalog} />
    </div>
  );
}

// ─── Step 1: ปรับแต่ง (ทีละส่วน — ไม่มี accordion) ───────────────────────────
function StepCustomize({ catalog, categoryDef, design, onOpenAi }: {
  catalog: Catalog; categoryDef: { name: string; parts: PartDef[] }; design: GarmentDesign; onOpenAi: () => void;
}) {
  const store = useGarmentStore();
  const selectedPart = useGarmentStore(s => s.selectedPart);
  const part = categoryDef.parts.find(p => p.key === selectedPart) ?? null;
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => { setShowAdvanced(false); }, [selectedPart]);

  // ── ยังไม่เลือกส่วน: โชว์เมนูส่วนต่างๆ เป็นการ์ดใหญ่ ──
  if (!part) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary">อยากปรับส่วนไหน?</h2>
            <p className="text-xs text-muted-foreground">แตะที่ชุด หรือเลือกจากรายการนี้</p>
          </div>
          <button onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#1B2A4A] to-[#2B4575] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-secondary" /> ให้ AI จัดให้
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {categoryDef.parts.map(p => {
            const currentId = design.parts[p.key];
            const opt = (catalog.options[p.options] ?? []).find(o => o.id === currentId);
            const pt = catalog.patterns.find(x => x.id === (design.partPattern[p.key] ?? design.pattern));
            return (
              <motion.button key={p.key} whileTap={{ scale: 0.97 }}
                onClick={() => store.selectPart(p.key)}
                className="rounded-2xl border-2 border-border hover:border-secondary/60 bg-white p-3 flex items-center gap-3 text-left transition-all hover:shadow-md">
                <div className="w-14 h-14 rounded-xl bg-stone-50 p-1.5 shrink-0">
                  {opt ? (
                    <PartPreview asset={opt.asset} mode={p.render === 'image' ? 'image' : 'mask'}
                      patternImage={pt?.image ?? null} color={design.partColor[p.key] ?? design.color} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Ban className="w-5 h-5 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{opt?.name ?? 'ไม่ใส่'}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── เลือกส่วนแล้ว: โชว์เฉพาะตัวเลือกของส่วนนั้น (การ์ดใหญ่) ──
  const options = catalog.options[part.options] ?? [];
  const current = design.parts[part.key];
  const pt = catalog.patterns.find(x => x.id === (design.partPattern[part.key] ?? design.pattern));
  const hasOverride = design.partPattern[part.key] !== undefined || design.partColor[part.key] !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => store.selectPart(null)}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-primary hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-primary">เลือก{part.name}</h2>
          <p className="text-xs text-muted-foreground">กดแบบที่ชอบ เห็นผลบนชุดทันที</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {part.allowNone && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => store.setPart(part.key, 'none')}
            className={`rounded-2xl border-2 p-2.5 flex flex-col items-center gap-1.5 transition-all bg-white
              ${current === 'none' || !current ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-secondary/50'}`}>
            <div className="w-full aspect-square flex items-center justify-center">
              <Ban className="w-7 h-7 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">ไม่ใส่</span>
          </motion.button>
        )}
        {options.map(opt => {
          const active = current === opt.id;
          return (
            <motion.button key={opt.id} whileTap={{ scale: 0.95 }} onClick={() => store.setPart(part.key, opt.id)}
              className={`relative rounded-2xl border-2 p-2.5 flex flex-col items-center gap-1.5 transition-all bg-white
                ${active ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-secondary/50 hover:shadow-md'}`}>
              <div className="w-full aspect-square">
                <PartPreview asset={opt.asset} mode={part.render === 'image' ? 'image' : 'mask'}
                  patternImage={pt?.image ?? null} color={design.partColor[part.key] ?? design.color} />
              </div>
              {active && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
              <span className={`text-xs font-medium leading-tight text-center ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {opt.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Progressive disclosure: ตัวเลือกขั้นสูงซ่อนไว้ */}
      {part.render !== 'image' && (
        <div className="pt-1">
          {!showAdvanced ? (
            <button onClick={() => setShowAdvanced(true)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Pencil className="w-3 h-3" /> อยากให้ส่วนนี้ใช้ผ้า/สีต่างจากทั้งชุด?
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden space-y-3 bg-stone-50 rounded-2xl p-3 border border-border/60">
              <div>
                <p className="text-xs font-semibold text-primary mb-1.5">ผ้าเฉพาะ{part.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {catalog.patterns.map(p2 => (
                    <button key={p2.id} onClick={() => store.setPattern(p2.id, part.key)} title={p2.name}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all
                        ${(design.partPattern[part.key] ?? design.pattern) === p2.id ? 'border-primary shadow' : 'border-border hover:border-secondary/50'}`}>
                      {p2.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p2.image} alt="" className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full" style={{ backgroundColor: '#E8DCC8' }} />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary mb-1.5">สีเฉพาะ{part.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {catalog.colors.map(c => (
                    <button key={c.hex} onClick={() => store.setColor(c.hex, part.key)} title={c.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all
                        ${(design.partColor[part.key] ?? design.color) === c.hex ? 'border-primary scale-110 shadow' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>
              {hasOverride && (
                <button onClick={() => store.clearPartOverride(part.key)}
                  className="text-[11px] text-muted-foreground underline hover:text-primary transition-colors">
                  กลับไปใช้ผ้า/สีเดียวกับทั้งชุด
                </button>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: เลือกผ้า (เหมือนเลื่อนดู Pinterest) ─────────────────────────────
function StepFabric({ catalog, design }: { catalog: Catalog; design: GarmentDesign }) {
  const store = useGarmentStore();
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-primary">เลือกผ้าที่ใช่สำหรับคุณ</h2>
        <p className="text-xs text-muted-foreground">ผ้าทอมือจากชุมชนทั่วไทย — กดเพื่อลองกับชุดของคุณ</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {catalog.patterns.map(pt => {
          const active = design.pattern === pt.id;
          return (
            <motion.button key={pt.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              onClick={() => store.setPattern(pt.id)}
              className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all shadow-sm
                ${active ? 'border-secondary shadow-[0_0_0_3px_rgba(197,165,90,0.3)]' : 'border-transparent hover:shadow-lg'}`}>
              <div className="aspect-[4/3] bg-[#EFE9DD]">
                {pt.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={pt.image} alt={pt.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: '#E8DCC8' }} />
                )}
              </div>
              {active && (
                <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-secondary flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 text-white" />
                </span>
              )}
              <div className="px-3 py-2.5 bg-white">
                <p className="text-sm font-semibold text-primary">{pt.name}</p>
                <p className="text-[11px] text-muted-foreground">{PATTERN_SUBTITLE[pt.id] ?? ''}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4: เลือกสี (โทนคัดสรร — ไม่มี RGB) ─────────────────────────────────
function StepColor({ catalog, design }: { catalog: Catalog; design: GarmentDesign }) {
  const store = useGarmentStore();
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-primary">เลือกโทนสี</h2>
        <p className="text-xs text-muted-foreground">โทนสีคัดสรรให้เข้ากับผ้าไทย — กดแล้วเห็นผลทันที</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {catalog.colors.map(c => {
          const active = design.color === c.hex;
          return (
            <motion.button key={c.hex} whileTap={{ scale: 0.94 }} onClick={() => store.setColor(c.hex)}
              className={`rounded-2xl border-2 p-3 flex flex-col items-center gap-2 transition-all bg-white
                ${active ? 'border-primary shadow-sm bg-primary/5' : 'border-border hover:border-secondary/50 hover:shadow-md'}`}>
              <span className="relative w-12 h-12 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: c.hex }}>
                {active && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </span>
              <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{c.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 5: สรุป & สั่งตัด ──────────────────────────────────────────────────
function StepDone({ catalog, categoryDef, design, price, onEdit, onSave }: {
  catalog: Catalog; categoryDef: { name: string; parts: PartDef[] }; design: GarmentDesign;
  price: number; onEdit: () => void; onSave: () => void;
}) {
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-primary">ชุดของคุณพร้อมแล้ว</h2>
        <p className="text-xs text-muted-foreground">ตรวจดูอีกครั้ง แล้วส่งให้ช่างตัดเย็บได้เลย</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((t, i) => (
            <span key={i} className="inline-flex items-center rounded-full overflow-hidden border border-border text-[11px]">
              <span className="px-2 py-1 bg-muted text-muted-foreground font-medium">{t.group}</span>
              <span className="px-2 py-1 bg-white text-primary font-semibold">{t.value}</span>
            </span>
          ))}
        </div>
        <div className="flex items-end justify-between pt-3 border-t border-border/60">
          <div>
            <p className="text-xs text-muted-foreground">ราคาประมาณการ</p>
            <p className="text-[10px] text-muted-foreground">ยืนยันราคาสุดท้ายกับช่างก่อนตัด</p>
          </div>
          <p className="text-2xl font-bold text-primary">{price.toLocaleString()} <span className="text-sm font-medium">บาท</span></p>
        </div>
      </div>

      <div className="space-y-2">
        <Link href="/tailor/with-fabric"
          className="w-full py-3.5 rounded-2xl bg-secondary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 active:scale-[0.99] transition-all shadow-md">
          สั่งตัดชุดนี้ <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onEdit}
            className="py-2.5 rounded-2xl border border-border text-primary text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted transition-colors">
            <Pencil className="w-3.5 h-3.5" /> แก้ไขเพิ่ม
          </button>
          <button onClick={onSave}
            className="py-2.5 rounded-2xl border border-border text-primary text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted transition-colors">
            <Heart className="w-3.5 h-3.5" /> เก็บแบบนี้ไว้
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI bottom sheet ─────────────────────────────────────────────────────────
function AiSheet({ open, onClose, catalog }: { open: boolean; onClose: () => void; catalog: Catalog }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{ theme: string; items: AiSuggestionItem[] } | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set());

  const run = (q?: string) => {
    const text = q ?? prompt;
    setResult(buildAiSuggestions(text, catalog));
    setApplied(new Set());
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl p-5 max-h-[75vh] overflow-y-auto">
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-secondary" /> ให้ AI ช่วยจัดชุด
              </h2>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">บอกลุคที่อยากได้ แล้วเลือกใช้คำแนะนำได้ทีละข้อ</p>

            <div className="flex gap-2 mb-2">
              <input value={prompt} onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && run()}
                placeholder="เช่น อยากได้ชุดไทยดูหรูหรา"
                className="flex-1 bg-stone-50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary" />
              <button onClick={() => run()}
                className="px-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors">
                <Wand2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['ชุดไทยหรูหรา', 'ลุคออฟฟิศ', 'ลำลองสบายๆ', 'โทนคราม', 'หวานละมุน'].map(q => (
                <button key={q} onClick={() => { setPrompt(q); run(q); }}
                  className="px-3 py-1.5 rounded-full border border-border text-xs text-primary hover:bg-muted transition-colors">
                  {q}
                </button>
              ))}
            </div>

            {result && (
              <div className="space-y-2 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-secondary">{result.theme}</p>
                  <button
                    onClick={() => { result.items.forEach(i => i.apply()); setApplied(new Set(result.items.map((_, i) => i))); }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-secondary text-white font-semibold hover:bg-secondary/90 transition-colors">
                    ใช้ทั้งหมด
                  </button>
                </div>
                {result.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-stone-50 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <button
                      onClick={() => { item.apply(); setApplied(prev => new Set(prev).add(i)); }}
                      disabled={applied.has(i)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0
                        ${applied.has(i) ? 'bg-secondary/15 text-secondary' : 'border border-border text-primary hover:bg-muted'}`}>
                      {applied.has(i) ? <Check className="w-3.5 h-3.5" /> : 'ใช้'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
