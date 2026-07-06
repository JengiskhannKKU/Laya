'use client';

/**
 * LAYA Garment Configurator (v2)
 * ปรับจากหน้าออกแบบเดิม: ผู้ใช้ปรับแต่งได้ทุกชิ้นส่วน (คอ/แขน/กระดุม/กระเป๋า/ชาย ฯลฯ)
 * - คลิกชิ้นส่วนบนโมเดล → เปิด property panel + section ที่เกี่ยวข้อง
 * - กำหนดผ้า/สีแยกรายชิ้นส่วนได้
 * - ราคา/เวลาผลิตคำนวณสดทุกการปรับ
 * คงธีม Navy+Gold, layout 3 คอลัมน์, header/stepper เดิม
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, RotateCcw, RotateCw, Clock, Maximize2, Search,
  Check, Plus, X, ChevronDown, ChevronUp, Bookmark, ArrowRight, Lightbulb, Heart, Layers,
} from 'lucide-react';

import {
  DesignState, DEFAULT_STATE, Category, Opt, FabricTab,
  GARMENT_TYPES, COLLARS, SLEEVES, CUFFS, SHOULDERS, OPENINGS,
  BUTTON_SHAPES, BUTTON_SIZES, BUTTON_MATERIALS, BUTTON_COLORS,
  POCKET_LOCATIONS, POCKET_TYPES, HEMS, DECORATIONS,
  PANTS_TYPES, PANTS_TYPE_PRESETS, WAISTS, WAISTBANDS, FLIES, PLEATS, PANT_LENGTH_LABELS, PANT_CUFFS,
  SKIRT_TYPES, SKIRT_PLEATS, SKIRT_HEMS,
  FABRICS, COLOR_SWATCHES, STITCHES,
  getParts, showCuffSection, showButtonSection, fabricOf, colorOf,
  calcPricing, buildSummaryTags, labelOf,
} from './configurator/data';
import GarmentCanvas, { CanvasView } from './configurator/GarmentCanvas';

type ViewAngle = 'front' | 'left' | 'back' | 'right' | 'fabric' | 'pattern';
type Step = 0 | 1 | 2 | 3 | 4;

const STEPS = [
  { label: 'เลือกประเภท' },
  { label: 'เลือกดีเทล' },
  { label: 'ผ้า & สี' },
  { label: 'ปรับดีไซน์' },
  { label: 'รายละเอียด & สั่งผลิต' },
];

const VIEW_ANGLES: { key: ViewAngle; label: string }[] = [
  { key: 'front', label: 'ด้านหน้า' },
  { key: 'left', label: 'ด้านข้างซ้าย' },
  { key: 'back', label: 'ด้านหลัง' },
  { key: 'right', label: 'ด้านข้างขวา' },
  { key: 'fabric', label: 'ซูมผ้า' },
  { key: 'pattern', label: 'แพทเทิร์น' },
];

const CATEGORY_TABS: { v: Category; label: string }[] = [
  { v: 'shirt', label: 'เสื้อ' },
  { v: 'pants', label: 'กางเกง' },
  { v: 'skirt', label: 'กระโปรง' },
];

const CATEGORY_TITLES: Record<Category, { title: string; subtitle: string }> = {
  shirt: { title: 'ออกแบบเสื้อผ้าของคุณ', subtitle: 'เลือกทุกดีเทล ปรับดีไซน์ และสร้างสรรค์ชุดที่เป็นตัวคุณ' },
  pants: { title: 'ออกแบบกางเกงของคุณ', subtitle: 'เลือกทุกดีเทล ปรับดีไซน์ และสร้างสรรค์กางเกงในแบบของคุณ' },
  skirt: { title: 'ออกแบบกระโปรงของคุณ', subtitle: 'เลือกทุกดีเทล ปรับดีไซน์ และสร้างสรรค์กระโปรงในแบบของคุณ' },
};

/** ชิ้นส่วน → accordion section ที่เกี่ยวข้อง */
const PART_TO_SECTION: Record<Category, Record<string, string>> = {
  shirt: { body: 'type', collar: 'collar', sleeves: 'sleeves', cuffs: 'cuff', placket: 'opening', buttons: 'buttons', pocket: 'pocket', hem: 'hem' },
  pants: { body: 'type', waistband: 'waistband', pocket: 'pockets', cuffs: 'cuff' },
  skirt: { body: 'type', waistband: 'waist', hem: 'hem' },
};

// ─── Small controls ──────────────────────────────────────────────────────────
function PillGrid({ options, value, onChange, cols = 3 }: {
  options: Opt[]; value: string; onChange: (v: string) => void; cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map(({ v, label }) => (
        <button key={v} onClick={() => onChange(v)}
          className={`py-2 px-1.5 rounded-xl border-2 text-[11px] font-medium transition-all leading-tight
            ${value === v ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border hover:border-primary/30 text-muted-foreground bg-white'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function CheckGrid({ options, values, onToggle }: {
  options: Opt[]; values: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(({ v, label, price }) => {
        const on = values.includes(v);
        return (
          <button key={v} onClick={() => onToggle(v)}
            className={`flex items-center gap-1.5 py-2 px-2 rounded-xl border-2 text-[11px] font-medium transition-all leading-tight text-left
              ${on ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border hover:border-primary/30 text-muted-foreground bg-white'}`}>
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0
              ${on ? 'bg-primary border-primary' : 'border-border bg-white'}`}>
              {on && <Check className="w-2.5 h-2.5 text-white" />}
            </span>
            <span className="flex-1">{label}</span>
            {price ? <span className="text-[9px] text-secondary">+{price}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, display, onChange }: {
  label: string; value: number; min: number; max: number; step?: number;
  display: string; onChange: (n: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-primary/70">{label}</span>
        <span className="text-[11px] font-semibold text-primary">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#C5A55A]"
        style={{ background: `linear-gradient(to right, #C5A55A 0%, #C5A55A ${pct}%, #E5DFD6 ${pct}%, #E5DFD6 100%)` }} />
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full transition-colors ${on ? 'bg-secondary' : 'bg-border'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  );
}

function Accordion({ id, label, open, onToggle, highlight, children }: {
  id: string; label: string; open: boolean; onToggle: () => void; highlight?: boolean; children: React.ReactNode;
}) {
  return (
    <div id={`acc-${id}`}
      className={`border rounded-xl overflow-hidden transition-all ${highlight ? 'border-secondary shadow-[0_0_0_2px_rgba(197,165,90,0.25)]' : 'border-border'}`}>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold text-primary hover:bg-muted/50 transition-colors">
        {label}
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function ClothingDesigner() {
  const [state, setState] = useState<DesignState>(DEFAULT_STATE);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [fabricTarget, setFabricTarget] = useState<string>('all');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ type: true, collar: true });
  const [viewAngle, setViewAngle] = useState<ViewAngle>('front');
  const [is3D, setIs3D] = useState(true);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [savedNote, setSavedNote] = useState('');

  const upd = useCallback((patch: Partial<DesignState>) =>
    setState(s => ({ ...s, ...patch })), []);
  const updShirt = useCallback((patch: Partial<DesignState['shirt']>) =>
    setState(s => ({ ...s, shirt: { ...s.shirt, ...patch } })), []);
  const updPants = useCallback((patch: Partial<DesignState['pants']>) =>
    setState(s => ({ ...s, pants: { ...s.pants, ...patch } })), []);
  const updSkirt = useCallback((patch: Partial<DesignState['skirt']>) =>
    setState(s => ({ ...s, skirt: { ...s.skirt, ...patch } })), []);

  const parts = useMemo(() => getParts(state), [state]);
  const pricing = useMemo(() => calcPricing(state), [state]);
  const summaryTags = useMemo(() => buildSummaryTags(state), [state]);
  const titles = CATEGORY_TITLES[state.category];

  // เลือกชิ้นส่วน (จากโมเดล / tree) → เปิด section ที่เกี่ยวข้อง + ตั้งเป้าหมายผ้า
  const selectPart = useCallback((part: string | null) => {
    setSelectedPart(part);
    if (!part) return;
    setFabricTarget(part);
    const section = PART_TO_SECTION[state.category][part];
    if (section) {
      setOpenSections(p => ({ ...p, [section]: true }));
      setTimeout(() => document.getElementById(`acc-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
    }
  }, [state.category]);

  const switchCategory = (c: Category) => {
    setState(s => ({ ...s, category: c }));
    setSelectedPart(null);
    setFabricTarget('all');
    setViewAngle('front');
    setOpenSections({ type: true });
  };

  // ผ้า/สี รายชิ้นส่วน
  const assignFabric = (fabricId: string) => {
    setState(s => {
      if (fabricTarget === 'all') return { ...s, partFabric: { body: fabricId } };
      return { ...s, partFabric: { ...s.partFabric, [fabricTarget]: fabricId } };
    });
  };
  const assignColor = (hex: string) => {
    setState(s => {
      if (fabricTarget === 'all') return { ...s, partColor: { body: hex } };
      return { ...s, partColor: { ...s.partColor, [fabricTarget]: hex } };
    });
  };

  // ล้างชิ้นส่วนที่หายไปเมื่อ config เปลี่ยน (เช่น เปลี่ยนเป็นแขนกุด)
  useEffect(() => {
    const keys = new Set(parts.map(p => p.key));
    if (selectedPart && !keys.has(selectedPart)) setSelectedPart(null);
    if (fabricTarget !== 'all' && !keys.has(fabricTarget)) setFabricTarget('all');
  }, [parts, selectedPart, fabricTarget]);

  // Draft
  const DRAFT_KEY = 'laya-configurator-draft-v2';
  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    setSavedNote('บันทึกแบบร่างแล้ว');
  };
  const loadDraft = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) { setSavedNote('ยังไม่มีแบบร่างที่บันทึกไว้'); return; }
    try {
      setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
      setSavedNote('โหลดแบบเดิมแล้ว');
    } catch { setSavedNote('โหลดแบบร่างไม่สำเร็จ'); }
  };
  useEffect(() => {
    if (!savedNote) return;
    const t = setTimeout(() => setSavedNote(''), 2500);
    return () => clearTimeout(t);
  }, [savedNote]);

  const bodyFabric = fabricOf(state, 'body');
  const canvasView: CanvasView = viewAngle === 'back' ? 'back' : 'front';
  const flip = viewAngle === 'left' || viewAngle === 'right';

  // ─── Accordion เนื้อหาต่อหมวด ────────────────────────────────────────────
  const toggleSection = (k: string) => setOpenSections(p => ({ ...p, [k]: !p[k] }));
  const secProps = (id: string, label: string) => ({
    id, label,
    open: !!openSections[id],
    onToggle: () => toggleSection(id),
    highlight: selectedPart !== null && PART_TO_SECTION[state.category][selectedPart] === id,
  });

  const shirtAccordions = (
    <>
      <Accordion {...secProps('type', 'ประเภทเสื้อ')}>
        <PillGrid options={GARMENT_TYPES} value={state.shirt.garmentType} onChange={v => updShirt({ garmentType: v })} />
        <div className="pt-1">
          <p className="text-[10px] text-muted-foreground mb-1.5">ไหล่</p>
          <PillGrid options={SHOULDERS} value={state.shirt.shoulder} onChange={v => updShirt({ shoulder: v })} cols={2} />
        </div>
      </Accordion>

      <Accordion {...secProps('collar', 'คอเสื้อ / ปก')}>
        <PillGrid options={COLLARS} value={state.shirt.collar} onChange={v => updShirt({ collar: v })} />
      </Accordion>

      <Accordion {...secProps('sleeves', 'แขนเสื้อ')}>
        <PillGrid options={SLEEVES} value={state.shirt.sleeves} onChange={v => updShirt({ sleeves: v })} />
      </Accordion>

      {showCuffSection(state.shirt) && (
        <Accordion {...secProps('cuff', 'ปลายแขน / ข้อมือ')}>
          <PillGrid options={CUFFS} value={state.shirt.cuff} onChange={v => updShirt({ cuff: v })} />
        </Accordion>
      )}

      <Accordion {...secProps('opening', 'สาบหน้า / การเปิด')}>
        <PillGrid options={OPENINGS} value={state.shirt.opening} onChange={v => updShirt({ opening: v })} />
      </Accordion>

      {showButtonSection(state.shirt) && (
        <Accordion {...secProps('buttons', 'กระดุม')}>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5">รูปทรง</p>
            <PillGrid options={BUTTON_SHAPES} value={state.shirt.buttonShape} onChange={v => updShirt({ buttonShape: v })} cols={2} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5">ขนาด</p>
            <PillGrid options={BUTTON_SIZES} value={state.shirt.buttonSize} onChange={v => updShirt({ buttonSize: v })} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5">วัสดุ</p>
            <PillGrid options={BUTTON_MATERIALS} value={state.shirt.buttonMaterial} onChange={v => updShirt({ buttonMaterial: v })} cols={2} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5">สีกระดุม</p>
            <div className="flex gap-2">
              {BUTTON_COLORS.map(hex => (
                <button key={hex} onClick={() => updShirt({ buttonColor: hex })}
                  className={`w-6 h-6 rounded-full border-2 transition-all
                    ${state.shirt.buttonColor === hex ? 'border-primary scale-110 shadow' : 'border-border hover:scale-105'}`}
                  style={{ backgroundColor: hex }} />
              ))}
            </div>
          </div>
        </Accordion>
      )}

      <Accordion {...secProps('pocket', `กระเป๋า (${state.shirt.pockets.length})`)}>
        {state.shirt.pockets.map((pk, idx) => (
          <div key={pk.id} className="border border-border rounded-xl p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-primary">กระเป๋า #{idx + 1}</span>
              <button onClick={() => updShirt({ pockets: state.shirt.pockets.filter(x => x.id !== pk.id) })}
                className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'ตำแหน่ง', value: pk.location, opts: POCKET_LOCATIONS, key: 'location' as const },
                { label: 'ชนิด', value: pk.type, opts: POCKET_TYPES, key: 'type' as const },
              ].map(({ label, value, opts, key }) => (
                <div key={key}>
                  <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                  <div className="relative">
                    <select value={value}
                      onChange={e => updShirt({
                        pockets: state.shirt.pockets.map(x => x.id === pk.id ? { ...x, [key]: e.target.value } : x),
                      })}
                      className="w-full appearance-none bg-white border border-border rounded-lg px-2 py-1.5 text-[11px] text-primary pr-6 focus:outline-none focus:border-secondary">
                      {opts.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {state.shirt.pockets.length < 4 && (
          <button
            onClick={() => updShirt({
              pockets: [...state.shirt.pockets, { id: Date.now(), location: 'chest', type: 'patch' }],
            })}
            className="w-full py-2 rounded-xl border-2 border-dashed border-border text-[11px] font-medium text-muted-foreground hover:border-secondary hover:text-primary transition-colors flex items-center justify-center gap-1">
            <Plus className="w-3.5 h-3.5" /> เพิ่มกระเป๋า (+120 บาท)
          </button>
        )}
      </Accordion>

      <Accordion {...secProps('hem', 'ชายเสื้อ')}>
        <PillGrid options={HEMS} value={state.shirt.hem} onChange={v => updShirt({ hem: v })} cols={2} />
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-primary/70">ผ่าข้าง</span>
          <Toggle on={state.shirt.slitOn} onChange={v => updShirt({ slitOn: v })} />
        </div>
        {state.shirt.slitOn && (
          <SliderRow label="ความยาวผ่า" value={state.shirt.slitLength} min={5} max={25}
            display={`${state.shirt.slitLength} ซม.`} onChange={n => updShirt({ slitLength: n })} />
        )}
      </Accordion>

      <Accordion {...secProps('deco', 'งานตกแต่ง')}>
        <CheckGrid options={DECORATIONS} values={state.shirt.decorations}
          onToggle={v => updShirt({
            decorations: state.shirt.decorations.includes(v)
              ? state.shirt.decorations.filter(d => d !== v)
              : [...state.shirt.decorations, v],
          })} />
      </Accordion>
    </>
  );

  const pantsAccordions = (
    <>
      <Accordion {...secProps('type', 'ทรงกางเกง')}>
        <PillGrid options={PANTS_TYPES} value={state.pants.type}
          onChange={v => updPants({ type: v, ...(PANTS_TYPE_PRESETS[v] ?? {}) })} />
        <SliderRow label="ความกว้างปลายขา" value={state.pants.legOpening} min={0} max={100}
          display={state.pants.legOpening <= 25 ? 'แคบ' : state.pants.legOpening >= 75 ? 'กว้าง' : 'กลาง'}
          onChange={n => updPants({ legOpening: n })} />
        <SliderRow label="ความยาว" value={state.pants.length} min={0} max={4}
          display={PANT_LENGTH_LABELS[state.pants.length]}
          onChange={n => updPants({ length: n })} />
      </Accordion>

      <Accordion {...secProps('waistband', 'เอว & ขอบเอว')}>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5">ระดับเอว</p>
          <PillGrid options={WAISTS} value={state.pants.waist} onChange={v => updPants({ waist: v })} />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5">ขอบเอว</p>
          <PillGrid options={WAISTBANDS} value={state.pants.waistband} onChange={v => updPants({ waistband: v })} cols={2} />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5">ซิปหน้า (Fly)</p>
          <PillGrid options={FLIES} value={state.pants.fly} onChange={v => updPants({ fly: v })} />
        </div>
      </Accordion>

      <Accordion {...secProps('pockets', 'กระเป๋า')}>
        {([
          ['pocketFront', 'กระเป๋าหน้า', '+100'],
          ['pocketBack', 'กระเป๋าหลัง', '+100'],
          ['pocketCoin', 'กระเป๋าเหรียญ', '+60'],
          ['pocketCargo', 'กระเป๋าคาร์โก้', '+180'],
        ] as const).map(([key, label, price]) => (
          <div key={key} className="flex items-center justify-between py-0.5">
            <span className="text-[11px] font-medium text-primary/80">{label} <span className="text-[9px] text-secondary">{price}</span></span>
            <Toggle on={state.pants[key]} onChange={v => updPants({ [key]: v } as Partial<DesignState['pants']>)} />
          </div>
        ))}
      </Accordion>

      <Accordion {...secProps('pleats', 'จีบหน้า')}>
        <PillGrid options={PLEATS} value={state.pants.pleats} onChange={v => updPants({ pleats: v })} />
      </Accordion>

      {state.pants.length > 0 && (
        <Accordion {...secProps('cuff', 'ปลายขา')}>
          <PillGrid options={PANT_CUFFS} value={state.pants.cuff} onChange={v => updPants({ cuff: v })} />
        </Accordion>
      )}
    </>
  );

  const skirtAccordions = (
    <>
      <Accordion {...secProps('type', 'ทรงกระโปรง')}>
        <PillGrid options={SKIRT_TYPES} value={state.skirt.type} onChange={v => updSkirt({ type: v })} />
      </Accordion>
      <Accordion {...secProps('waist', 'ระดับเอว')}>
        <PillGrid options={WAISTS} value={state.skirt.waist} onChange={v => updSkirt({ waist: v })} />
      </Accordion>
      <Accordion {...secProps('pleats', 'จีบ')}>
        <PillGrid options={SKIRT_PLEATS} value={state.skirt.pleats} onChange={v => updSkirt({ pleats: v })} cols={2} />
      </Accordion>
      <Accordion {...secProps('layers', 'จำนวนชั้น')}>
        <SliderRow label="ชั้นผ้า" value={state.skirt.layers} min={1} max={5}
          display={`${state.skirt.layers} ชั้น`} onChange={n => updSkirt({ layers: n })} />
      </Accordion>
      <Accordion {...secProps('hem', 'ชายกระโปรง')}>
        <PillGrid options={SKIRT_HEMS} value={state.skirt.hem} onChange={v => updSkirt({ hem: v })} cols={2} />
      </Accordion>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <Link href="/" className="hover:text-primary transition-colors shrink-0">หน้าแรก</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="shrink-0">ออกแบบเสื้อผ้า</span>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-primary font-medium truncate">สร้างแบบของคุณ</span>
            </nav>
            <div className="flex items-center gap-1.5 shrink-0">
              {savedNote && <span className="text-[11px] text-secondary font-medium hidden sm:block">{savedNote}</span>}
              <button onClick={saveDraft}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-primary hover:bg-muted transition-colors hidden sm:flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" /> บันทึกแบบร่าง
              </button>
              <button onClick={loadDraft}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-primary hover:bg-muted transition-colors hidden sm:block">
                โหลดแบบเดิม
              </button>
              <Link href="/tailor/with-fabric"
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1 shadow-sm">
                บันทึก & ต่อไป <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="py-2.5 space-y-2.5">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-primary leading-tight">{titles.title}</h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block">{titles.subtitle}</p>
            </div>
            {/* Stepper */}
            <div className="flex items-center w-full">
              {STEPS.map((step, i) => {
                const isActive = i === currentStep;
                const isDone = i < currentStep;
                return (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <button onClick={() => setCurrentStep(i as Step)} className="flex items-center gap-1.5 sm:gap-2">
                      <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 shrink-0 transition-all
                        ${isActive ? 'bg-primary border-primary text-white shadow-md'
                          : isDone ? 'bg-secondary border-secondary text-white'
                          : 'bg-white border-border text-muted-foreground'}`}>
                        {isDone ? <Check className="w-3 h-3" /> : i + 1}
                      </span>
                      <span className={`hidden md:block text-xs font-medium whitespace-nowrap
                        ${isActive ? 'text-primary font-semibold' : isDone ? 'text-secondary' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 sm:mx-3 rounded-full ${isDone ? 'bg-secondary' : 'bg-border'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* ── Left: Configurator accordion ── */}
          <div className="lg:w-64 xl:w-72 shrink-0">
            <button onClick={() => setLeftOpen(p => !p)}
              className="lg:hidden w-full flex items-center justify-between p-3 bg-white rounded-xl border border-border shadow-sm mb-2">
              <span className="text-sm font-semibold text-primary">ปรับแต่งชิ้นงาน</span>
              {leftOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <div className={`lg:block ${leftOpen ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-2xl border border-border shadow-sm p-3 space-y-3">
                {/* Category tabs */}
                <div className="flex bg-muted rounded-xl p-1">
                  {CATEGORY_TABS.map(({ v, label }) => (
                    <button key={v} onClick={() => switchCategory(v)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${state.category === v ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-primary'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {state.category === 'shirt' && shirtAccordions}
                  {state.category === 'pants' && pantsAccordions}
                  {state.category === 'skirt' && skirtAccordions}
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-secondary/20 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-primary/70 leading-relaxed">
                      <span className="font-semibold text-primary">เคล็ดลับ</span> — คลิกชิ้นส่วนบนโมเดลโดยตรง
                      เพื่อเปิดการตั้งค่าของส่วนนั้น และกำหนดผ้า/สีแยกรายชิ้นได้
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Center: Model + Component tree ── */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-3 sm:p-4">
              <div className="relative bg-gradient-to-b from-stone-50 to-stone-100 rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] w-full"
                onClick={() => setSelectedPart(null)}>
                {/* Toolbar */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1 bg-white/85 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-white">
                    {[RotateCcw, RotateCw, Clock, Maximize2].map((Icon, i) => (
                      <button key={i} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    ))}
                    <button onClick={e => { e.stopPropagation(); setViewAngle('front'); selectPart(null); }}
                      className="text-xs text-muted-foreground px-1.5 hover:text-primary transition-colors">รีเซ็ต</button>
                  </div>
                  <div className="flex items-center bg-white/85 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-white">
                    {['2D', '3D'].map(mode => (
                      <button key={mode} onClick={e => { e.stopPropagation(); setIs3D(mode === '3D'); }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                          ${(mode === '3D') === is3D ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-primary'}`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* สถานะชิ้นที่ hover/เลือก */}
                {(hoveredPart || selectedPart) && (
                  <div className="absolute top-14 left-3 z-10 pointer-events-none">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm border
                      ${selectedPart ? 'bg-secondary/95 text-white border-secondary' : 'bg-white/90 text-primary border-white'}`}>
                      {parts.find(p => p.key === (selectedPart ?? hoveredPart))?.label ?? ''}
                    </span>
                  </div>
                )}

                {/* Canvas */}
                <div className="absolute inset-0 flex items-center justify-center px-8 pt-12 pb-24">
                  {viewAngle === 'fabric' || viewAngle === 'pattern' ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={bodyFabric.image} alt={bodyFabric.name}
                      className={`w-full h-full object-cover rounded-2xl shadow-inner ${viewAngle === 'pattern' ? 'saturate-0 contrast-125' : ''}`} />
                  ) : (
                    <GarmentCanvas
                      state={state} view={canvasView} flip={flip}
                      selectedPart={selectedPart} hoveredPart={hoveredPart}
                      onSelect={selectPart} onHover={setHoveredPart}
                    />
                  )}
                </div>

                {/* View thumbnails */}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">มุมมองตัวอย่าง</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                    {VIEW_ANGLES.map(({ key, label }) => (
                      <button key={key} onClick={e => { e.stopPropagation(); setViewAngle(key); }}
                        className="shrink-0 flex flex-col items-center gap-1">
                        <div className={`w-12 h-14 rounded-lg overflow-hidden border-2 transition-all bg-stone-100
                          ${viewAngle === key ? 'border-secondary shadow-md' : 'border-white/70 hover:border-secondary/40'}`}>
                          {key === 'fabric' || key === 'pattern' ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={bodyFabric.image} alt="" className={`w-full h-full object-cover ${key === 'pattern' ? 'saturate-0' : ''}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className={`text-[8px] font-medium ${viewAngle === key ? 'text-secondary' : 'text-muted-foreground'}`}>{label}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Component tree */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-3">
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <Layers className="w-3.5 h-3.5 text-secondary" />
                <h3 className="text-xs font-bold text-primary">โครงสร้างชิ้นงาน</h3>
              </div>
              <div className="space-y-0.5">
                <div className="px-2 py-1 text-[11px] font-semibold text-primary/80">
                  {labelOf(CATEGORY_TABS as unknown as Opt[], state.category) || CATEGORY_TABS.find(c => c.v === state.category)?.label}
                </div>
                {parts.map((p, i) => {
                  const fab = fabricOf(state, p.key);
                  const col = colorOf(state, p.key);
                  const isSel = selectedPart === p.key;
                  return (
                    <button key={p.key}
                      onClick={() => selectPart(isSel ? null : p.key)}
                      onMouseEnter={() => setHoveredPart(p.key)}
                      onMouseLeave={() => setHoveredPart(null)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all
                        ${isSel ? 'bg-secondary/15 ring-1 ring-secondary' : hoveredPart === p.key ? 'bg-blue-50' : 'hover:bg-muted/60'}`}>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0 w-6">
                        {i === parts.length - 1 ? '└─' : '├─'}
                      </span>
                      <span className={`text-[11px] font-medium flex-1 truncate ${isSel ? 'text-primary' : 'text-primary/80'}`}>{p.label}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fab.image} alt="" className="w-4 h-4 rounded object-cover border border-border" />
                      {col && <span className="w-3 h-3 rounded-full border border-border shrink-0" style={{ backgroundColor: col }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: Property panel + Fabric & Color ── */}
          <div className="lg:w-72 xl:w-80 shrink-0">
            <button onClick={() => setRightOpen(p => !p)}
              className="lg:hidden w-full flex items-center justify-between p-3 bg-white rounded-xl border border-border shadow-sm mb-2">
              <span className="text-sm font-semibold text-primary">ผ้า & สี</span>
              {rightOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <div className={`lg:block space-y-4 ${rightOpen ? 'block' : 'hidden'}`}>
              {/* Property panel — แสดงเมื่อเลือกชิ้นส่วน */}
              {selectedPart && (
                <PropertyPanel
                  state={state} part={selectedPart}
                  onClose={() => setSelectedPart(null)}
                  onStitch={(v) => setState(s => ({ ...s, partStitch: { ...s.partStitch, [selectedPart]: v } }))}
                />
              )}

              {/* Fabric & Color */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
                <h2 className="text-sm font-bold text-primary mb-3 pb-2 border-b border-border/50">ผ้า & สี</h2>

                {/* เป้าหมายการกำหนด */}
                <p className="text-[10px] text-muted-foreground mb-1.5">กำหนดให้ส่วน</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button onClick={() => setFabricTarget('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all
                      ${fabricTarget === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/40'}`}>
                    ทั้งชุด
                  </button>
                  {parts.map(p => (
                    <button key={p.key} onClick={() => setFabricTarget(p.key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all
                        ${fabricTarget === p.key ? 'bg-secondary text-white border-secondary' : 'bg-white text-muted-foreground border-border hover:border-secondary/50'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>

                <FabricPicker
                  activeFabricId={fabricTarget === 'all' ? (state.partFabric.body ?? 'f3') : (state.partFabric[fabricTarget] ?? state.partFabric.body ?? 'f3')}
                  onPick={assignFabric}
                />

                {/* สี */}
                <div className="mt-4">
                  <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-2">โทนสี</h3>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_SWATCHES.map(({ hex, name }) => {
                      const active = (fabricTarget === 'all' ? state.partColor.body : state.partColor[fabricTarget]) === hex;
                      return (
                        <button key={hex} onClick={() => assignColor(hex)} title={name}
                          className={`w-7 h-7 rounded-full transition-all border-2
                            ${active ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:scale-105 hover:shadow-sm'}`}
                          style={{ backgroundColor: hex }} />
                      );
                    })}
                    <button
                      onClick={() => setState(s => {
                        const pc = { ...s.partColor };
                        if (fabricTarget === 'all') return { ...s, partColor: {} };
                        delete pc[fabricTarget];
                        return { ...s, partColor: pc };
                      })}
                      title="ล้างสี"
                      className="w-7 h-7 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-secondary transition-colors">
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <SliderRow label="ความเข้มของสี" value={state.intensity} min={0} max={100}
                    display={`${state.intensity}%`} onChange={n => upd({ intensity: n })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary tags + Pricing + CTA ── */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_320px] gap-3 items-stretch">
          {/* Summary as tags */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">สรุปแบบของคุณ</h3>
            <div className="flex flex-wrap gap-1.5">
              {summaryTags.map((t, i) => (
                <span key={i} className="inline-flex items-center rounded-lg overflow-hidden border border-border text-[11px]">
                  <span className="px-2 py-1 bg-muted text-muted-foreground font-medium">{t.group}</span>
                  <span className="px-2 py-1 bg-white text-primary font-semibold">{t.value}</span>
                </span>
              ))}
            </div>
            {/* ผ้ารายชิ้น */}
            <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
              {pricing.partCosts.map(pc => (
                <div key={pc.label} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{pc.label} · {pc.fabricName}</span>
                  <span className="text-primary font-medium">{pc.cost.toLocaleString()} บาท</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">ราคาประมาณการ</h3>
            <div className="space-y-2">
              {[
                { label: 'ค่าวัสดุ (ผ้า)', value: pricing.material },
                { label: 'ค่าตัดเย็บ', value: pricing.tailoring },
                { label: 'ค่าความซับซ้อน / ดีเทล', value: pricing.complexity },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium text-primary">{value.toLocaleString()} บาท</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">รวมทั้งหมด</span>
                  <span className="text-xl font-bold text-primary">
                    {pricing.total.toLocaleString()} <span className="text-sm font-medium">บาท</span>
                  </span>
                </div>
              </div>
              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">ระยะเวลาผลิตโดยประมาณ</span>
                  <span className="text-primary font-semibold">{pricing.days[0]} - {pricing.days[1]} วันทำการ</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">จำนวนสั่งขั้นต่ำ (MOQ)</span>
                  <span className="text-primary font-semibold">{pricing.moq} ตัว</span>
                </div>
                <p className="text-[10px] text-muted-foreground">*ราคานี้ขึ้นอยู่กับการยืนยันการสั่งผลิต</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-[#1B2A4A] to-[#14213a] rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-white mb-2.5">พร้อมสั่งผลิต</p>
              <div className="space-y-1.5 mb-4">
                {['บันทึกแบบของคุณแล้ว', 'คุณสามารถสั่งผลิตหรือติดต่อช่างทอได้เลย', `ระยะเวลาผลิตโดยประมาณ ${pricing.days[0]} - ${pricing.days[1]} วันทำการ`].map(t => (
                  <div key={t} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-secondary mt-0.5 shrink-0" />
                    <span className="text-[11px] text-white/75 leading-relaxed">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Link href="/tailor/with-fabric"
                className="w-full py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-secondary/90 active:scale-95 transition-all shadow-sm">
                ดำเนินการต่อ <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="w-full py-2 rounded-xl border border-white/30 text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                <Heart className="w-3.5 h-3.5" /> บันทึกไว้ในรายการโปรด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Property panel (แสดงเฉพาะ property ของชิ้นที่เลือก) ─────────────────────
function PropertyPanel({ state, part, onClose, onStitch }: {
  state: DesignState; part: string; onClose: () => void; onStitch: (v: string) => void;
}) {
  const partDef = getParts(state).find(p => p.key === part);
  const fab = fabricOf(state, part);
  const col = colorOf(state, part);
  const stitch = state.partStitch[part] ?? 'standard';

  return (
    <div className="bg-white rounded-2xl border-2 border-secondary shadow-[0_4px_20px_rgba(197,165,90,0.2)] p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
        <h2 className="text-sm font-bold text-primary flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          {partDef?.label ?? part}
        </h2>
        <button onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fab.image} alt={fab.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-primary truncate">{fab.name} · {fab.origin}</p>
            <p className="text-[10px] text-muted-foreground">{fab.pricePerMeter.toLocaleString()} บาท/เมตร</p>
          </div>
          {col && <span className="w-6 h-6 rounded-full border-2 border-border shrink-0" style={{ backgroundColor: col }} />}
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5">ตะเข็บ</p>
          <div className="grid grid-cols-3 gap-1.5">
            {STITCHES.map(({ v, label }) => (
              <button key={v} onClick={() => onStitch(v)}
                className={`py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all leading-tight
                  ${stitch === v ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          เลือกผ้า/สีของส่วนนี้ได้จากแผง &ldquo;ผ้า &amp; สี&rdquo; ด้านล่าง
          หรือปรับตัวเลือกรูปทรงจากแผงซ้าย (เปิดให้อัตโนมัติแล้ว)
        </p>
      </div>
    </div>
  );
}

// ─── Fabric picker ───────────────────────────────────────────────────────────
function FabricPicker({ activeFabricId, onPick }: {
  activeFabricId: string; onPick: (id: string) => void;
}) {
  const [tab, setTab] = useState<FabricTab>('silk');
  const [region, setRegion] = useState('ทั้งหมด');
  const [technique, setTechnique] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const visible = FABRICS.filter(f => f.tab === tab)
    .filter(f => !search || f.name.includes(search) || f.origin.includes(search));

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {(['silk', 'cotton', 'blend'] as FabricTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border-2
              ${tab === t ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-border text-muted-foreground hover:border-primary/30'}`}>
            {t === 'silk' ? 'ผ้าไหม' : t === 'cotton' ? 'ผ้าฝ้าย' : 'ผ้าผสม'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'ภูมิภาค', value: region, set: setRegion, opts: ['ทั้งหมด', 'เหนือ', 'อีสาน', 'ใต้', 'กลาง'] },
          { label: 'เทคนิคการทอ', value: technique, set: setTechnique, opts: ['ทั้งหมด', 'มัดหมี่', 'ขิด', 'ยกดอก', 'จก'] },
        ].map(({ label, value, set, opts }) => (
          <div key={label}>
            <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
            <div className="relative">
              <select value={value} onChange={e => set(e.target.value)}
                className="w-full appearance-none bg-white border border-border rounded-lg px-2.5 py-1.5 text-[11px] text-primary pr-6 focus:outline-none focus:border-secondary">
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาลายผ้า หรือชื่อผ้า"
          className="w-full bg-white border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {visible.map(fabric => {
          const selected = activeFabricId === fabric.id;
          return (
            <button key={fabric.id} onClick={() => onPick(fabric.id)}
              className={`relative rounded-xl overflow-hidden text-left transition-all border-2 bg-white
                ${selected ? 'border-primary shadow-[0_0_0_3px_rgba(197,165,90,0.25)]' : 'border-transparent hover:border-secondary/40'}`}>
              <div className="aspect-square relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fabric.image} alt={fabric.name} className="absolute inset-0 w-full h-full object-cover" />
                {selected && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-primary" />
                  </span>
                )}
              </div>
              <div className="px-2 py-1.5">
                <p className="text-[11px] font-semibold text-primary leading-tight truncate">{fabric.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{fabric.origin} · {fabric.pricePerMeter.toLocaleString()}/ม.</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1">
        <button onClick={() => setPage(p => Math.max(1, p - 1))}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        {[1, 2, 3, '...', 8].map((p, i) => (
          <button key={i} onClick={() => typeof p === 'number' && setPage(p)}
            className={`w-7 h-7 rounded-lg text-xs font-medium transition-all
              ${page === p ? 'bg-primary text-white shadow-sm' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => setPage(p => Math.min(8, p + 1))}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
