'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, RotateCcw, RotateCw, Clock, Maximize2, ZoomIn, Check, Plus, ChevronDown, ChevronUp, ShoppingCart, Bookmark, ArrowRight } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type ViewAngle = 'front' | 'left' | 'back' | 'right' | 'fabric' | 'pattern';
type ShirtType = 'women' | 'men' | 'unisex';
type ShirtShape = 'fitted' | 'straight' | 'loose';
type ShirtStyle = 'full' | 'crop' | 'tuck' | 'dress' | 'skirt' | 'other';
type CollarType = 'round' | 'v-neck' | 'chinese' | 'keyhole' | 'square' | 'boat';
type FabricTab = 'silk' | 'cotton';
type Step = 0 | 1 | 2 | 3;

interface Fabric {
  id: string;
  name: string;
  origin: string;
  image: string;
  selected?: boolean;
}

interface ColorSwatch {
  hex: string;
  name: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'เลือกรูปแบบเสื้อ', short: 'รูปแบบ' },
  { label: 'เลือกผ้า', short: 'ผ้า' },
  { label: 'ปรับดีไซน์', short: 'ดีไซน์' },
  { label: 'รายละเอียด & สั่งผลิต', short: 'สั่งผลิต' },
];

const VIEW_ANGLES: { key: ViewAngle; label: string }[] = [
  { key: 'front', label: 'ด้านหน้า' },
  { key: 'left', label: 'ด้านข้างซ้าย' },
  { key: 'back', label: 'ด้านหลัง' },
  { key: 'right', label: 'ด้านข้างขวา' },
  { key: 'fabric', label: 'ซูมผ้า' },
  { key: 'pattern', label: 'แพทเกิร์น' },
];

const FABRICS: Fabric[] = [
  { id: 'f1', name: 'ไหมมัดหมี่', origin: 'สุรินทร์', image: '/fabrics/f1.jpg' },
  { id: 'f2', name: 'ไหมยกดอก', origin: 'ลำพูน', image: '/fabrics/f2.jpg' },
  { id: 'f3', name: 'ไหมแพรวา', origin: 'กาฬสินธุ์', image: '/fabrics/f3.jpg', selected: true },
  { id: 'f4', name: 'ไหมมูล', origin: 'นครราชสีมา', image: '/fabrics/f4.jpg', selected: true },
  { id: 'f5', name: 'ไหมลายขอ', origin: 'เชียงใหม่', image: '/fabrics/f5.jpg' },
  { id: 'f6', name: 'ไหมทองก', origin: 'อุบลราชธานี', image: '/fabrics/f6.jpg' },
];

const COLOR_SWATCHES: ColorSwatch[] = [
  { hex: '#F5E6D3', name: 'ครีม' },
  { hex: '#F4A7B9', name: 'ชมพู' },
  { hex: '#8B1A2D', name: 'แดงเข้ม' },
  { hex: '#1B2A4A', name: 'กรมท่า' },
  { hex: '#4A5568', name: 'เทา' },
  { hex: '#2D6A4F', name: 'เขียว' },
  { hex: '#2C3E50', name: 'เขียวเข้ม' },
  { hex: '#3D2B1F', name: 'น้ำตาล' },
  { hex: '#7B2D8B', name: 'ม่วง' },
  { hex: '#1A5276', name: 'น้ำเงิน' },
  { hex: '#78866B', name: 'เขียวมะกอก' },
  { hex: '#D4A017', name: 'ทอง' },
  { hex: '#8B4513', name: 'น้ำตาลแดง' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepIndicator({ currentStep, onStepClick }: { currentStep: Step; onStepClick: (s: Step) => void }) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={i} className="flex items-center flex-1">
            <button
              onClick={() => isDone && onStepClick(i as Step)}
              className={`flex items-center gap-1.5 sm:gap-2 transition-all ${isDone ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all shrink-0
                  ${isActive ? 'bg-primary border-primary text-white shadow-md' :
                    isDone ? 'bg-secondary border-secondary text-white' :
                    'bg-white border-border text-muted-foreground'}`}
              >
                {isDone ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className={`hidden sm:block text-xs font-medium transition-all whitespace-nowrap
                ${isActive ? 'text-primary font-semibold' : isDone ? 'text-secondary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
              <span className={`sm:hidden text-[10px] font-medium transition-all
                ${isActive ? 'text-primary font-semibold' : isDone ? 'text-secondary' : 'text-muted-foreground'}`}>
                {step.short}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-all
                ${isDone ? 'bg-secondary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FabricCard({ fabric, selected, onSelect }: { fabric: Fabric; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`relative rounded-xl overflow-hidden aspect-square transition-all duration-200 border-2
        ${selected
          ? 'border-secondary shadow-[0_0_0_3px_rgba(197,165,90,0.3)]'
          : 'border-transparent hover:border-secondary/40'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200" />
      <div className={`absolute inset-0 flex items-end p-1.5`}>
        <div className="w-full">
          <p className="text-[10px] sm:text-xs font-semibold text-primary leading-tight truncate">{fabric.name}</p>
          <p className="text-[9px] sm:text-[10px] text-primary/60 truncate">{fabric.origin}</p>
        </div>
      </div>
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow-sm">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
}

// ─── Step 1: เลือกรูปแบบเสื้อ ────────────────────────────────────────────────

function Step1Panel({
  shirtType, setShirtType,
  shirtShape, setShirtShape,
  shirtStyle, setShirtStyle,
  collarType, setCollarType,
}: {
  shirtType: ShirtType; setShirtType: (v: ShirtType) => void;
  shirtShape: ShirtShape; setShirtShape: (v: ShirtShape) => void;
  shirtStyle: ShirtStyle; setShirtStyle: (v: ShirtStyle) => void;
  collarType: CollarType; setCollarType: (v: CollarType) => void;
}) {
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setShowMore(p => ({ ...p, [k]: !p[k] }));

  const SectionHeader = ({ title, sectionKey }: { title: string; sectionKey: string }) => (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wide">{title}</h3>
      <button onClick={() => toggle(sectionKey)} className="text-muted-foreground p-0.5 rounded hover:text-primary transition-colors">
        {showMore[sectionKey] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  const TypeBtn = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) => (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all
        ${active ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 bg-white'}`}>
      <span className="text-xl">{icon}</span>
      <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <SectionHeader title="ประเภทเสื้อ" sectionKey="type" />
        <div className="grid grid-cols-3 gap-2">
          <TypeBtn active={shirtType === 'women'} onClick={() => setShirtType('women')} icon="👗" label="เสื้อผู้หญิง" />
          <TypeBtn active={shirtType === 'men'} onClick={() => setShirtType('men')} icon="👔" label="เสื้อผู้ชาย" />
          <TypeBtn active={shirtType === 'unisex'} onClick={() => setShirtType('unisex')} icon="🧥" label="เสื้อยูนิเซ็กส์" />
        </div>
      </div>

      <div>
        <SectionHeader title="ทรงเสื้อ" sectionKey="shape" />
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: 'fitted' as ShirtShape, icon: '👚', label: 'ทรงเข้ารูป' },
            { v: 'straight' as ShirtShape, icon: '👕', label: 'ทรงตรง' },
            { v: 'loose' as ShirtShape, icon: '🧥', label: 'ทรงปล่อย' },
          ].map(({ v, icon, label }) => (
            <TypeBtn key={v} active={shirtShape === v} onClick={() => setShirtShape(v)} icon={icon} label={label} />
          ))}
        </div>
        {showMore['shape'] && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { v: 'full' as ShirtStyle, icon: '🥼', label: 'เสื้อคลุม' },
              { v: 'crop' as ShirtStyle, icon: '👙', label: 'เสื้อก็ก' },
              { v: 'tuck' as ShirtStyle, icon: '👗', label: 'เสื้อเซ็ต' },
            ].map(({ v, icon, label }) => (
              <TypeBtn key={v} active={shirtStyle === v} onClick={() => setShirtStyle(v)} icon={icon} label={label} />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader title="รายละเอียดคอเสื้อ" sectionKey="collar" />
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: 'round' as CollarType, label: 'คอกลม' },
            { v: 'v-neck' as CollarType, label: 'คอวี' },
            { v: 'chinese' as CollarType, label: 'คอจีน' },
          ].map(({ v, label }) => (
            <button key={v} onClick={() => setCollarType(v)}
              className={`py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all
                ${collarType === v ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border hover:border-primary/30 text-muted-foreground bg-white'}`}>
              {label}
            </button>
          ))}
        </div>
        {showMore['collar'] && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { v: 'keyhole' as CollarType, label: 'คอปกเชิ้ต' },
              { v: 'square' as CollarType, label: 'คอเหลี่ยม' },
              { v: 'boat' as CollarType, label: 'คอบ้าย' },
            ].map(({ v, label }) => (
              <button key={v} onClick={() => setCollarType(v)}
                className={`py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all
                  ${collarType === v ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border hover:border-primary/30 text-muted-foreground bg-white'}`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Collapsibles */}
      {[
        { label: 'รายละเอียดแขนเสื้อ', key: 'sleeve' },
        { label: 'ความยาวเสื้อ', key: 'length' },
        { label: 'ดีเทลเพิ่มเติม', key: 'detail' },
      ].map(({ label, key }) => (
        <div key={key} className="border border-border rounded-xl overflow-hidden">
          <button onClick={() => toggle(key)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-primary hover:bg-muted/50 transition-colors">
            {label}
            {showMore[key] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showMore[key] && (
            <div className="px-3 pb-3 text-xs text-muted-foreground">ตัวเลือกเพิ่มเติมจะแสดงที่นี่</div>
          )}
        </div>
      ))}

      {/* Tip */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-secondary/20 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <span className="text-base shrink-0">💡</span>
          <div>
            <p className="text-xs font-semibold text-primary mb-0.5">เคล็ดลับ</p>
            <p className="text-[11px] text-primary/70 leading-relaxed">คุณสามารถปรับแต่งได้หลายส่วนๆ และปรับแต่งได้ตลอดเวลา</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: เลือกผ้า ────────────────────────────────────────────────────────

function Step2Panel({ selectedFabrics, toggleFabric }: {
  selectedFabrics: Set<string>;
  toggleFabric: (id: string) => void;
}) {
  const [tab, setTab] = useState<FabricTab>('silk');
  const [region, setRegion] = useState('ทั้งหมด');
  const [technique, setTechnique] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2">
        {(['silk', 'cotton'] as FabricTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border-2
              ${tab === t ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-border text-muted-foreground hover:border-primary/30'}`}>
            {t === 'silk' ? 'ผ้าไหม' : 'ผ้าฝ้าย'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'ภูมิภาค', value: region, set: setRegion, opts: ['ทั้งหมด', 'เหนือ', 'อีสาน', 'ใต้', 'กลาง'] },
          { label: 'เทคนิคการทอ', value: technique, set: setTechnique, opts: ['ทั้งหมด', 'มัดหมี่', 'ขิด', 'ยกดอก', 'จก'] },
        ].map(({ label, value, set, opts }) => (
          <div key={label} className="relative">
            <select value={value} onChange={e => set(e.target.value)}
              className="w-full appearance-none bg-white border border-border rounded-lg px-3 py-2 text-xs text-primary pr-7 focus:outline-none focus:border-secondary">
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <ZoomIn className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาผ้า หรือชื่อผ้า"
          className="w-full bg-white border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-primary placeholder:text-muted-foreground focus:outline-none focus:border-secondary" />
      </div>

      {/* Fabric Grid */}
      <div className="grid grid-cols-2 gap-2">
        {FABRICS.filter(f => !search || f.name.includes(search)).map(fabric => (
          <FabricCard key={fabric.id} fabric={fabric}
            selected={selectedFabrics.has(fabric.id)}
            onSelect={() => toggleFabric(fabric.id)} />
        ))}
      </div>

      {/* Pagination */}
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
        <button onClick={() => setPage(p => p + 1)}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: ปรับดีไซน์ ──────────────────────────────────────────────────────

function Step3Panel({ selectedColor, setSelectedColor, opacity, setOpacity }: {
  selectedColor: string; setSelectedColor: (c: string) => void;
  opacity: number; setOpacity: (n: number) => void;
}) {
  const actions = [
    { icon: '🔄', label: 'เปลี่ยนสี' },
    { icon: '↕️', label: 'สลับชั้นผ้า' },
    { icon: '✏️', label: 'เพิ่มสมุดนัก' },
    { icon: '👥', label: 'เพิ่มลายนูน' },
  ];

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="grid grid-cols-4 gap-2">
        {actions.map(({ icon, label }) => (
          <button key={label} className="flex flex-col items-center gap-1 p-2 rounded-xl border border-border hover:border-secondary/50 hover:bg-muted/30 transition-all">
            <span className="text-lg">{icon}</span>
            <span className="text-[9px] text-muted-foreground text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* Color Picker */}
      <div>
        <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-2">โทนสีผ้า</h3>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map(({ hex, name }) => (
            <button key={hex} onClick={() => setSelectedColor(hex)} title={name}
              className={`w-7 h-7 rounded-full transition-all border-2
                ${selectedColor === hex
                  ? 'border-primary scale-110 shadow-md'
                  : 'border-transparent hover:scale-105 hover:shadow-sm'}`}
              style={{ backgroundColor: hex }} />
          ))}
          <button className="w-7 h-7 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-secondary transition-colors">
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wide">ความเข้มของสี</h3>
          <span className="text-xs font-semibold text-primary">{opacity}%</span>
        </div>
        <div className="relative">
          <input type="range" min={0} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--secondary) 0%, var(--secondary) ${opacity}%, var(--border) ${opacity}%, var(--border) 100%)`,
            }} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: รายละเอียด ──────────────────────────────────────────────────────

function Step4Panel() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">พร้อมสั่งผลิต</p>
            <p className="text-xs text-green-600">บันทึกแบบของคุณแล้ว</p>
          </div>
        </div>
        <div className="space-y-1.5 text-xs text-green-700">
          {['คุณสามารถส่งให้ผู้ผลิตหรือดำเนินต่อด้วยตัวเองได้', 'ระยะเวลาผลิตโดยประมาณ 15 - 25 วันทำการ'].map(t => (
            <div key={t} className="flex items-start gap-1.5">
              <Check className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Model Viewer ────────────────────────────────────────────────────────────

function ModelViewer({ viewAngle, setViewAngle, is3D, setIs3D }: {
  viewAngle: ViewAngle; setViewAngle: (v: ViewAngle) => void;
  is3D: boolean; setIs3D: (v: boolean) => void;
}) {
  const LABELS: Record<string, string> = {
    front: 'คอเสื้อ',
    left: 'ลำตัวหน้า',
    back: 'แขนเสื้อ',
    right: 'ลำตัวหลัง',
    fabric: 'กระเป๋า',
    pattern: 'ชายเสื้อ',
  };

  return (
    <div className="relative bg-gradient-to-b from-stone-50 to-stone-100 rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[2/3] w-full">
      {/* Top toolbar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-white">
          {[RotateCcw, RotateCw, Clock, Maximize2].map((Icon, i) => (
            <button key={i} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          ))}
          <span className="text-xs text-muted-foreground px-1.5">รีเซ็ต</span>
        </div>

        {/* 2D / 3D Toggle */}
        <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-white">
          {['2D', '3D'].map(mode => (
            <button key={mode} onClick={() => setIs3D(mode === '3D')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                ${(mode === '3D') === is3D ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-primary'}`}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Model placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-40 sm:w-32 sm:h-52 mx-auto bg-gradient-to-b from-amber-200 to-amber-300 rounded-2xl opacity-40" />
          <p className="text-xs text-muted-foreground mt-2">โมเดล 3D กำลังโหลด</p>
        </div>
      </div>

      {/* Hotspot labels */}
      {viewAngle === 'front' && (
        <>
          <div className="absolute top-[18%] right-4 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[11px] font-medium text-primary/80 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-white">{LABELS['front']}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm" />
          </div>
          <div className="absolute top-[35%] right-3 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[11px] font-medium text-primary/80 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-white">{LABELS['left']}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm" />
          </div>
          <div className="absolute top-[35%] left-3 flex items-center gap-1.5 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm" />
            <span className="text-[11px] font-medium text-primary/80 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-white">แบบเสื้อ</span>
          </div>
          <div className="absolute top-[55%] left-3 flex items-center gap-1.5 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm" />
            <span className="text-[11px] font-medium text-primary/80 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-white">{LABELS['fabric']}</span>
          </div>
          <div className="absolute bottom-[22%] right-3 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[11px] font-medium text-primary/80 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-white">{LABELS['right']}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm" />
          </div>
          <div className="absolute bottom-[15%] right-3 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[11px] font-medium text-primary/80 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-white">{LABELS['pattern']}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm" />
          </div>
        </>
      )}

      {/* Bottom thumbnails */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {VIEW_ANGLES.map(({ key, label }) => (
            <button key={key} onClick={() => setViewAngle(key)}
              className={`shrink-0 flex flex-col items-center gap-1 transition-all`}>
              <div className={`w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden border-2 transition-all
                ${viewAngle === key ? 'border-secondary shadow-md' : 'border-white/60 hover:border-secondary/40'}`}>
                <div className={`w-full h-full bg-gradient-to-b ${viewAngle === key ? 'from-amber-300 to-amber-400' : 'from-stone-200 to-stone-300'}`} />
              </div>
              <span className={`text-[9px] font-medium whitespace-nowrap
                ${viewAngle === key ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Summary Bar ─────────────────────────────────────────────────────────────

function SummaryBar({ currentStep }: { currentStep: Step }) {
  const items = [
    { icon: '👗', label: 'ประเภทเสื้อ', value: 'เสื้อผู้หญิง · ทรงปล่อย' },
    { icon: '🪡', label: 'คอเสื้อ', value: 'คอจีน' },
    { icon: '📏', label: 'แขนเสื้อ', value: 'แขนยาว' },
    { icon: '📐', label: 'ความยาวเสื้อ', value: 'ระดับสะโพก' },
    { icon: '🧵', label: 'ผ้า', value: 'ไหมแพรวา กาฬสินธุ์', extraIcon: '🎨' },
    { icon: '🖌️', label: 'โทนสี', value: 'น้ำตาล - เบจ' },
    { icon: '✨', label: 'ดีเทลเพิ่มเติม', value: 'กระเป๋าข้าง, กระดุมผ้าหุ้ม' },
  ];

  const pricing = [
    { label: 'ผ้า (2.5 เมตร)', value: '2,950 บาท' },
    { label: 'ตัดเย็บ', value: '1,800 บาท' },
    { label: 'ดีเทลเพิ่มเติม', value: '350 บาท' },
  ];

  return (
    <div className="mt-4 space-y-3">
      {/* Summary items */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-primary">สรุปแบบของคุณ</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y divide-border/30">
          {items.slice(0, 4).map(({ icon, label, value }) => (
            <div key={label} className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">{icon}</span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
              <p className="text-xs font-medium text-primary truncate">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-x divide-y divide-border/30 border-t border-border/30">
          {items.slice(4).map(({ icon, label, value }) => (
            <div key={label} className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">{icon}</span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
              <p className="text-xs font-medium text-primary truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing + Order */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Pricing */}
        <div className="flex-1 bg-white rounded-2xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-primary mb-3">ราคาประมาณการ</h3>
          <div className="space-y-2">
            {pricing.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-medium text-primary">{value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">รวมทั้งหมด</span>
                <span className="text-lg font-bold text-primary">5,100 <span className="text-sm font-medium">บาท</span></span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">*ราคาอยู่ภายใต้การยืนยันจากผู้ผลิต</p>
            </div>
          </div>
        </div>

        {/* Order actions */}
        <div className="sm:w-64 bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-white/80 mb-2">พร้อมสั่งผลิต</p>
            <div className="space-y-1.5 mb-4">
              {['บันทึกแบบของคุณแล้ว', 'คุณสามารถส่งให้ผู้ผลิตหรือดำเนินต่อด้วยตัวเองได้', 'ระยะเวลาผลิตโดยประมาณ 15 - 25 วันทำการ'].map(t => (
                <div key={t} className="flex items-start gap-1.5">
                  <Check className="w-3 h-3 text-secondary mt-0.5 shrink-0" />
                  <span className="text-[10px] text-white/70 leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <button className="w-full py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-secondary/90 active:scale-95 transition-all shadow-sm">
              ดำเนินการต่อ
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full py-2 rounded-xl border border-white/30 text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <Bookmark className="w-3.5 h-3.5" />
              บันทึกไว้ในรายการโปรด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClothingDesigner() {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [shirtType, setShirtType] = useState<ShirtType>('women');
  const [shirtShape, setShirtShape] = useState<ShirtShape>('loose');
  const [shirtStyle, setShirtStyle] = useState<ShirtStyle>('full');
  const [collarType, setCollarType] = useState<CollarType>('chinese');
  const [selectedFabrics, setSelectedFabrics] = useState<Set<string>>(new Set(['f3', 'f4']));
  const [selectedColor, setSelectedColor] = useState('#1A5276');
  const [opacity, setOpacity] = useState(80);
  const [viewAngle, setViewAngle] = useState<ViewAngle>('front');
  const [is3D, setIs3D] = useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const toggleFabric = useCallback((id: string) => {
    setSelectedFabrics(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const nextStep = () => setCurrentStep(s => Math.min(3, s + 1) as Step);
  const prevStep = () => setCurrentStep(s => Math.max(0, s - 1) as Step);

  const renderRightPanel = () => {
    switch (currentStep) {
      case 0: return null;
      case 1: return <Step2Panel selectedFabrics={selectedFabrics} toggleFabric={toggleFabric} />;
      case 2: return <Step3Panel selectedColor={selectedColor} setSelectedColor={setSelectedColor} opacity={opacity} setOpacity={setOpacity} />;
      case 3: return <Step4Panel />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Breadcrumb + Actions */}
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="hover:text-primary cursor-pointer transition-colors">หน้าแรก</span>
              <ChevronRight className="w-3 h-3" />
              <span className="hover:text-primary cursor-pointer transition-colors">ออกแบบเสื้อผ้า</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary font-medium">สร้างแบบของคุณ</span>
            </nav>
            <div className="flex items-center gap-1.5">
              <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-primary hover:bg-muted transition-colors hidden sm:flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" />
                บันทึกแบบร่าง
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-primary hover:bg-muted transition-colors hidden sm:flex items-center gap-1">
                โหลดแบบเดิม
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1 shadow-sm">
                บันทึก & ต่อไป
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title + Step indicator */}
          <div className="py-2.5 space-y-2.5">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-primary leading-tight">ออกแบบเสื้อผ้าของคุณ</h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block">เลือกทรงเสื้อ เลือกผ้า ปรับดีไซน์ และสร้างสรรค์ชิ้นงานในแบบของคุณ</p>
            </div>
            <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-6 py-4">

        {/* Desktop 3-column / Mobile stacked */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* ── Left Panel ── */}
          <div className="lg:w-56 xl:w-64 shrink-0">
            {/* Mobile toggle */}
            <button onClick={() => setLeftPanelOpen(p => !p)}
              className="lg:hidden w-full flex items-center justify-between p-3 bg-white rounded-xl border border-border shadow-sm mb-2">
              <span className="text-sm font-semibold text-primary">1. เลือกรูปแบบเสื้อ</span>
              {leftPanelOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <div className={`lg:block ${leftPanelOpen ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
                <h2 className="hidden lg:block text-sm font-bold text-primary mb-4 pb-2 border-b border-border/50">
                  1. เลือกรูปแบบเสื้อ
                </h2>
                <Step1Panel
                  shirtType={shirtType} setShirtType={setShirtType}
                  shirtShape={shirtShape} setShirtShape={setShirtShape}
                  shirtStyle={shirtStyle} setShirtStyle={setShirtStyle}
                  collarType={collarType} setCollarType={setCollarType}
                />
              </div>
            </div>
          </div>

          {/* ── Center: Model Viewer ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-3 sm:p-4">
              <ModelViewer
                viewAngle={viewAngle} setViewAngle={setViewAngle}
                is3D={is3D} setIs3D={setIs3D}
              />
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="lg:w-64 xl:w-72 shrink-0">
            {/* Mobile toggles */}
            <button onClick={() => setRightPanelOpen(p => !p)}
              className="lg:hidden w-full flex items-center justify-between p-3 bg-white rounded-xl border border-border shadow-sm mb-2">
              <span className="text-sm font-semibold text-primary">
                {currentStep === 0 ? '2. เลือกผ้า' : currentStep === 1 ? '2. เลือกผ้า' : currentStep === 2 ? '3. ปรับดีไซน์' : '4. รายละเอียด'}
              </span>
              {rightPanelOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <div className={`lg:block space-y-4 ${rightPanelOpen ? 'block' : 'hidden'}`}>
              {/* Fabric Panel - always visible */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
                <h2 className="hidden lg:flex items-center justify-between text-sm font-bold text-primary mb-4 pb-2 border-b border-border/50">
                  <span>2. เลือกผ้า</span>
                </h2>
                <Step2Panel selectedFabrics={selectedFabrics} toggleFabric={toggleFabric} />
              </div>

              {/* Design Panel */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
                <h2 className="hidden lg:block text-sm font-bold text-primary mb-4 pb-2 border-b border-border/50">
                  3. ปรับดีไซน์
                </h2>
                <Step3Panel
                  selectedColor={selectedColor} setSelectedColor={setSelectedColor}
                  opacity={opacity} setOpacity={setOpacity}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <SummaryBar currentStep={currentStep} />

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-border shadow-lg px-4 py-3 safe-area-inset-bottom">
          <div className="flex items-center gap-3 max-w-screen-xl mx-auto">
            <button onClick={prevStep} disabled={currentStep === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-primary disabled:opacity-40 hover:bg-muted transition-all">
              <ChevronLeft className="w-4 h-4" />
              ย้อนกลับ
            </button>
            <div className="flex-1 text-center">
              <p className="text-xs text-muted-foreground">ขั้นตอน {currentStep + 1} จาก {STEPS.length}</p>
              <p className="text-xs font-semibold text-primary">{STEPS[currentStep].label}</p>
            </div>
            <button onClick={nextStep} disabled={currentStep === 3}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all shadow-sm">
              ต่อไป
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom padding for mobile nav */}
        <div className="lg:hidden h-20" />
      </div>
    </div>
  );
}
