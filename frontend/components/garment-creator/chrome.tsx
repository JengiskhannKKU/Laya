'use client';

/**
 * Chrome — Top bar / Component tree + ราคา / AI assistant / Drag ghost / Toast
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LayaLogo from '@/components/common/LayaLogo';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Undo2, Redo2, Heart, ArrowRight, Layers, Sparkles, Send, X,
  PersonStanding, Grid3X3, Expand, ChevronRight, Bot,
} from 'lucide-react';
import { useCreator, CameraView } from './store';
import { GARMENTS, GarmentType, calcPricing, isPartVisible, fabricById, AI_RULES, componentDef } from './config';
import { SliderRow } from './panels';

const VIEWS: { v: CameraView; label: string }[] = [
  { v: 'front', label: 'หน้า' },
  { v: 'left', label: 'ซ้าย' },
  { v: 'back', label: 'หลัง' },
  { v: 'right', label: 'ขวา' },
  { v: 'iso', label: '45°' },
];

// ─── Top bar ─────────────────────────────────────────────────────────────────
export function TopBar() {
  const garment = useCreator(s => s.garment);
  const canUndo = useCreator(s => s.past.length > 0);
  const canRedo = useCreator(s => s.future.length > 0);
  const view = useCreator(s => s.view);
  const exploded = useCreator(s => s.exploded);
  const wireframe = useCreator(s => s.wireframe);
  const showAvatar = useCreator(s => s.showAvatar);
  const avatarBuild = useCreator(s => s.avatarBuild);
  const {
    setType, undo, redo, setView, toggleExploded, toggleWireframe, toggleAvatar,
    setAvatarBuild, saveFavorite,
  } = useCreator.getState();
  const [bodyOpen, setBodyOpen] = useState(false);

  return (
    <div className="shrink-0 bg-white/95 backdrop-blur border-b border-[#E5DFD6] px-3 py-2 flex items-center gap-2 flex-wrap z-20">
      <nav className="flex items-center gap-1 text-[11px] text-[#9CA3AF] mr-1">
        <Link href="/" className="flex items-center">
          <LayaLogo variant="navy" height={15} />
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1B2A4A] font-medium">ห้องออกแบบ</span>
      </nav>

      {/* ประเภทชุด */}
      <div className="flex bg-[#F0EBE3] rounded-xl p-0.5">
        {(Object.keys(GARMENTS) as GarmentType[]).map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all
              ${garment.type === t ? 'bg-[#1B2A4A] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1B2A4A]'}`}>
            {GARMENTS[t].label}
          </button>
        ))}
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 bg-white rounded-xl border border-[#E5DFD6] p-0.5">
        <button onClick={undo} disabled={!canUndo} title="ย้อนกลับ (Ctrl+Z)"
          className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-[#F0EBE3] text-[#1B2A4A] transition-colors">
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={redo} disabled={!canRedo} title="ทำซ้ำ (Ctrl+Y)"
          className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-[#F0EBE3] text-[#1B2A4A] transition-colors">
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* มุมกล้อง */}
      <div className="hidden sm:flex items-center bg-white rounded-xl border border-[#E5DFD6] p-0.5">
        {VIEWS.map(({ v, label }) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all
              ${view === v ? 'bg-[#C5A55A] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1B2A4A]'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* โหมดพิเศษ */}
      <div className="flex items-center gap-0.5 bg-white rounded-xl border border-[#E5DFD6] p-0.5">
        <button onClick={toggleExploded} title="แยกชิ้นส่วน (Exploded view)"
          className={`p-1.5 rounded-lg transition-colors ${exploded ? 'bg-[#C5A55A] text-white' : 'hover:bg-[#F0EBE3] text-[#1B2A4A]'}`}>
          <Expand className="w-3.5 h-3.5" />
        </button>
        <button onClick={toggleWireframe} title="โครงตะเข็บ (Wireframe)"
          className={`p-1.5 rounded-lg transition-colors ${wireframe ? 'bg-[#C5A55A] text-white' : 'hover:bg-[#F0EBE3] text-[#1B2A4A]'}`}>
          <Grid3X3 className="w-3.5 h-3.5" />
        </button>
        <div className="relative">
          <button onClick={() => setBodyOpen(o => !o)} title="หุ่น / สัดส่วน"
            className={`p-1.5 rounded-lg transition-colors ${showAvatar ? 'bg-[#1B2A4A] text-white' : 'hover:bg-[#F0EBE3] text-[#1B2A4A]'}`}>
            <PersonStanding className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence>
            {bodyOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl border border-[#E5DFD6] shadow-lg p-3 z-30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#1B2A4A]">แสดงหุ่นลอง</span>
                  <button onClick={toggleAvatar}
                    className={`relative w-9 h-5 rounded-full transition-colors ${showAvatar ? 'bg-[#C5A55A]' : 'bg-[#E5DFD6]'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${showAvatar ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
                <SliderRow label="รูปร่าง" value={avatarBuild} min={0} max={100}
                  minLabel="เพรียว" maxLabel="ใหญ่" onChange={setAvatarBuild} />
                <p className="text-[9px] text-[#9CA3AF]">ระบบจะแนะนำไซซ์ที่พอดีจากสัดส่วนจริงในขั้นตอนสั่งตัด</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1" />

      <button onClick={() => saveFavorite('')} title="บันทึกเป็นแบบโปรด"
        className="p-1.5 rounded-xl border border-[#E5DFD6] hover:border-[#C5A55A] hover:bg-[#C5A55A]/5 text-[#C5A55A] transition-all">
        <Heart className="w-4 h-4" />
      </button>
      <Link href="/tailor/with-fabric"
        className="px-3.5 py-1.5 rounded-xl bg-[#1B2A4A] text-white text-[12px] font-semibold hover:bg-[#0F1A30] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm">
        สั่งตัดแบบนี้ <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ─── Component tree + Pricing ────────────────────────────────────────────────
export function BottomBar() {
  const garment = useCreator(s => s.garment);
  const selectedPart = useCreator(s => s.selectedPart);
  const hoveredPart = useCreator(s => s.hoveredPart);
  const { select, hover } = useCreator.getState();
  const pricing = calcPricing(garment);
  const gdef = GARMENTS[garment.type];

  return (
    <div className="shrink-0 bg-white/95 backdrop-blur border-t border-[#E5DFD6] px-3 py-2 flex items-center gap-3 z-20 overflow-x-auto">
      {/* Component tree (แนวนอน) */}
      <div className="flex items-center gap-1 shrink-0">
        <Layers className="w-3.5 h-3.5 text-[#C5A55A] mr-0.5" />
        {gdef.components.map(c => {
          const visible = isPartVisible(garment, c.id);
          const isSel = selectedPart === c.id;
          const isHov = hoveredPart === c.id;
          const fab = fabricById(garment.parts[c.id]?.fabricId ?? garment.parts.body?.fabricId ?? garment.parts.waistband?.fabricId);
          return (
            <button key={c.id}
              onClick={() => select(isSel ? null : c.id)}
              onMouseEnter={() => hover(c.id)}
              onMouseLeave={() => hover(null)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium whitespace-nowrap transition-all
                ${isSel ? 'border-[#C5A55A] bg-[#C5A55A]/10 text-[#1B2A4A] shadow-sm'
                  : isHov ? 'border-blue-300 bg-blue-50 text-[#1B2A4A]'
                  : 'border-[#E5DFD6] bg-white text-[#6B7280] hover:border-[#C5A55A]/40'}
                ${!visible ? 'opacity-40' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fab.image} alt="" className="w-3.5 h-3.5 rounded object-cover" draggable={false} />
              {c.label}
              {garment.parts[c.id]?.decorations.length ? <Sparkles className="w-2.5 h-2.5 text-[#C5A55A]" /> : null}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-w-4" />

      {/* ราคา + การผลิต */}
      <div className="flex items-center gap-3 shrink-0 text-right">
        <div className="hidden md:block">
          <p className="text-[9px] text-[#9CA3AF] leading-tight">ผลิต {pricing.days[0]}-{pricing.days[1]} วัน{pricing.moq > 1 ? ` · ขั้นต่ำ ${pricing.moq} ตัว` : ''}</p>
          <p className="text-[9px] text-[#9CA3AF] leading-tight">วัสดุ ฿{pricing.material.toLocaleString()} + ตัดเย็บ ฿{pricing.base.toLocaleString()} + ดีเทล ฿{pricing.complexity.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[9px] text-[#9CA3AF] leading-none mb-0.5">ราคาประมาณการ</p>
          <motion.p key={pricing.total} initial={{ scale: 1.12, color: '#C5A55A' }} animate={{ scale: 1, color: '#1B2A4A' }}
            className="text-lg font-bold leading-none">
            ฿{pricing.total.toLocaleString()}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

// ─── AI Assistant ────────────────────────────────────────────────────────────
interface ChatMsg { role: 'user' | 'ai'; text: string }

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'ai', text: 'สวัสดีค่ะ บอกสไตล์ที่อยากได้มาเลย เช่น "อยากได้คอแบบไทยโมเดิร์น" หรือ "ขอลุคหรูหรา" — ถ้าเลือกชิ้นส่วนอยู่ จะปรับเฉพาะชิ้นนั้นให้ค่ะ' },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedPart = useCreator(s => s.selectedPart);
  const garment = useCreator(s => s.garment);
  const { setPreset, setFabric, setColor, addDecoration, showToast } = useCreator.getState();

  useEffect(() => { listRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [msgs, open]);

  const run = () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    const rule = AI_RULES.find(r => r.keywords.some(k => q.toLowerCase().includes(k)));
    let reply: string;
    if (!rule) {
      reply = 'ยังจับสไตล์ไม่ได้ค่ะ ลองคำว่า: ไทยโมเดิร์น / หรูหรา / มินิมอล / สตรีท / หวาน';
    } else {
      const targetParts = selectedPart ? [selectedPart] : Object.keys(garment.parts);
      targetParts.forEach(pid => {
        const presetId = rule.apply.preset?.[pid];
        if (presetId && componentDef(garment.type, pid)?.presets?.some(p => p.id === presetId)) {
          setPreset(pid, presetId);
        }
        if (rule.apply.fabricId && componentDef(garment.type, pid)?.acceptsFabric) setFabric(pid, rule.apply.fabricId);
        if (rule.apply.color) setColor(pid, rule.apply.color);
        if (rule.apply.addDecoration && componentDef(garment.type, pid)?.acceptsDecoration && pid === (selectedPart ?? 'body')) {
          addDecoration(pid, rule.apply.addDecoration);
        }
      });
      reply = selectedPart
        ? `${rule.reply} (เฉพาะชิ้น "${componentDef(garment.type, selectedPart)?.label}")`
        : rule.reply;
      showToast('AI ปรับแบบให้แล้ว — กด Ctrl+Z เพื่อย้อนได้');
    }
    setMsgs(m => [...m, { role: 'user', text: q }, { role: 'ai', text: reply }]);
  };

  return (
    <>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(o => !o)}
        className="absolute bottom-4 right-4 z-30 w-11 h-11 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#2A4073] text-[#C5A55A] shadow-lg flex items-center justify-center border border-[#C5A55A]/40"
        title="ผู้ช่วย AI">
        {open ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="absolute bottom-[68px] right-4 z-30 w-72 bg-white rounded-2xl border border-[#E5DFD6] shadow-xl overflow-hidden flex flex-col"
            style={{ maxHeight: '55%' }}
          >
            <div className="px-3 py-2 bg-gradient-to-r from-[#1B2A4A] to-[#2A4073] flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A55A]" />
              <span className="text-[11px] font-bold text-white">ผู้ช่วยดีไซน์ LAYA</span>
              {selectedPart && (
                <span className="ml-auto text-[9px] text-[#C5A55A] bg-white/10 px-1.5 py-0.5 rounded">
                  แก้เฉพาะ: {componentDef(garment.type, selectedPart)?.label}
                </span>
              )}
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-[120px]">
              {msgs.map((m, i) => (
                <div key={i} className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[11px] leading-relaxed
                  ${m.role === 'user' ? 'ml-auto bg-[#1B2A4A] text-white rounded-br-sm' : 'bg-[#F0EBE3] text-[#1B2A4A] rounded-bl-sm'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-[#E5DFD6]/60 flex gap-1.5 shrink-0">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && run()}
                placeholder="เช่น อยากได้ลุคไทยโมเดิร์น…"
                className="flex-1 bg-[#FAF6F0] border border-[#E5DFD6] rounded-lg px-2.5 py-1.5 text-[11px] text-[#1B2A4A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#C5A55A]" />
              <button onClick={run} className="p-1.5 rounded-lg bg-[#C5A55A] text-white hover:bg-[#B39348] transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Drag ghost + Toast ──────────────────────────────────────────────────────
export function DragGhost({ pos }: { pos: { x: number; y: number } | null }) {
  const drag = useCreator(s => s.drag);
  const dropTarget = useCreator(s => s.dropTarget);
  if (!drag || !pos) return null;
  return (
    <div className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
      style={{ left: pos.x, top: pos.y }}>
      <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl shadow-lg border-2 bg-white/95 backdrop-blur transition-colors
        ${dropTarget ? 'border-green-500' : 'border-[#C5A55A]'}`}>
        {drag.image
          /* eslint-disable-next-line @next/next/no-img-element */
          ? <img src={drag.image} alt="" className="w-6 h-6 rounded object-cover" draggable={false} />
          : <span className="w-5 h-5 rounded" style={{ backgroundColor: drag.color }} />}
        <span className="text-[10px] font-semibold text-[#1B2A4A]">{drag.label}</span>
      </div>
    </div>
  );
}

export function Toast() {
  const toast = useCreator(s => s.toast);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 px-3.5 py-2 rounded-xl bg-[#1B2A4A]/95 text-white text-[11px] font-medium shadow-lg whitespace-nowrap">
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
