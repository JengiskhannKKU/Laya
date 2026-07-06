'use client';

/**
 * Asset Library (ซ้าย) — คลังสไตล์ / ผ้า (ลากวางได้) / งานตกแต่ง / แบบโปรด
 * Property Panel (ขวา) — เปลี่ยนตามชิ้นส่วนที่เลือก แสดงเฉพาะ property ที่เกี่ยวข้อง
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Sparkles, Trash2, ChevronUp, ChevronDown, MousePointerClick, Heart, Shirt,
} from 'lucide-react';
import { useCreator } from './store';
import {
  GARMENTS, FABRICS, DECORATIONS, COLOR_SWATCHES, STITCHES, SUGGESTIONS,
  componentDef, fabricById, isPartVisible, FabricDef, DecorationDef,
} from './config';

// ─── Shared controls ─────────────────────────────────────────────────────────
export function SliderRow({ label, value, min, max, step = 1, minLabel, maxLabel, unit, onChange }: {
  label: string; value: number; min: number; max: number; step?: number;
  minLabel?: string; maxLabel?: string; unit?: string; onChange: (n: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-[#1B2A4A]/70">{label}</span>
        <span className="text-[11px] font-semibold text-[#1B2A4A]">
          {unit ? `${value} ${unit}` : minLabel && pct <= 25 ? minLabel : maxLabel && pct >= 75 ? maxLabel : `${Math.round(pct)}%`}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#C5A55A]"
        style={{ background: `linear-gradient(to right, #C5A55A 0%, #C5A55A ${pct}%, #E5DFD6 ${pct}%, #E5DFD6 100%)` }}
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[9px] text-[#9CA3AF] mt-0.5">
          <span>{minLabel}</span><span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Draggable cards ─────────────────────────────────────────────────────────
function FabricCard({ fabric }: { fabric: FabricDef }) {
  const { startDrag, setFabric, showToast } = useCreator.getState();
  const selectedPart = useCreator(s => s.selectedPart);
  return (
    <button
      onPointerDown={e => {
        e.preventDefault();
        startDrag({ kind: 'fabric', id: fabric.id, image: fabric.image, label: fabric.name });
      }}
      onClick={() => {
        // click เฉยๆ (ไม่ลาก) = ใส่ให้ชิ้นที่เลือกอยู่
        if (selectedPart) { setFabric(selectedPart, fabric.id); }
        else showToast('เลือกชิ้นส่วนก่อน หรือลากผ้าไปวางบนตัวเสื้อ');
      }}
      className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-[#C5A55A]/60 bg-white text-left transition-all cursor-grab active:cursor-grabbing active:scale-95"
      title={`ลากไปวางบนชิ้นส่วน หรือคลิกเพื่อใส่ให้ชิ้นที่เลือก · ${fabric.pricePerMeter.toLocaleString()} บาท/ม.`}
    >
      <div className="aspect-square relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fabric.image} alt={fabric.name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </div>
      <div className="px-1.5 py-1">
        <p className="text-[10px] font-semibold text-[#1B2A4A] leading-tight truncate">{fabric.name}</p>
        <p className="text-[9px] text-[#9CA3AF] truncate">{fabric.origin} · ฿{fabric.pricePerMeter.toLocaleString()}/ม.</p>
      </div>
    </button>
  );
}

function DecoCard({ deco }: { deco: DecorationDef }) {
  const { startDrag, addDecoration, showToast } = useCreator.getState();
  const selectedPart = useCreator(s => s.selectedPart);
  const garment = useCreator(s => s.garment);
  return (
    <button
      onPointerDown={e => {
        e.preventDefault();
        startDrag({ kind: 'decoration', id: deco.id, color: deco.color, label: deco.label });
      }}
      onClick={() => {
        if (selectedPart && componentDef(garment.type, selectedPart)?.acceptsDecoration) addDecoration(selectedPart, deco.id);
        else showToast('ลากไปวางบนชิ้นส่วน หรือเลือกชิ้นที่รับงานตกแต่งได้ก่อน');
      }}
      className="flex items-center gap-2 w-full p-2 rounded-xl border-2 border-transparent hover:border-[#C5A55A]/60 bg-white transition-all cursor-grab active:cursor-grabbing active:scale-95 text-left"
    >
      <span className="w-7 h-7 rounded-lg shrink-0 border border-black/10" style={{ backgroundColor: deco.color }} />
      <span className="flex-1 min-w-0">
        <span className="block text-[11px] font-semibold text-[#1B2A4A] truncate">{deco.label}</span>
        <span className="block text-[9px] text-[#9CA3AF]">+฿{deco.price}{deco.moq ? ` · ขั้นต่ำ ${deco.moq} ตัว` : ''}</span>
      </span>
      <Sparkles className="w-3.5 h-3.5 text-[#C5A55A] shrink-0" />
    </button>
  );
}

// ─── Asset Library ───────────────────────────────────────────────────────────
type LibTab = 'styles' | 'fabrics' | 'deco' | 'favs';

export function AssetLibrary() {
  const [tab, setTab] = useState<LibTab>('styles');
  const [fabTab, setFabTab] = useState<'silk' | 'cotton' | 'blend'>('silk');
  const garment = useCreator(s => s.garment);
  const selectedPart = useCreator(s => s.selectedPart);
  const favorites = useCreator(s => s.favorites);
  const { setPreset, select, applyFavorite, deleteFavorite } = useCreator.getState();

  const gdef = GARMENTS[garment.type];
  const activeDef = selectedPart ? componentDef(garment.type, selectedPart) : undefined;

  const TABS: { v: LibTab; label: string }[] = [
    { v: 'styles', label: 'สไตล์' },
    { v: 'fabrics', label: 'ผ้า' },
    { v: 'deco', label: 'ตกแต่ง' },
    { v: 'favs', label: 'โปรด' },
  ];

  return (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur rounded-2xl border border-[#E5DFD6] shadow-sm overflow-hidden">
      <div className="flex p-1.5 gap-1 border-b border-[#E5DFD6]/60 shrink-0">
        {TABS.map(({ v, label }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all
              ${tab === v ? 'bg-[#1B2A4A] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F0EBE3]'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {tab === 'styles' && (
          !activeDef ? (
            <div className="space-y-1.5">
              <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1 px-1">
                <MousePointerClick className="w-3 h-3" /> คลิกชิ้นส่วนบนโมเดล หรือเลือกจากรายการ
              </p>
              {gdef.components.map(c => (
                <button key={c.id} onClick={() => select(c.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E5DFD6] hover:border-[#C5A55A] transition-all text-left">
                  <Shirt className="w-3.5 h-3.5 text-[#C5A55A] shrink-0" />
                  <span className="text-[11px] font-medium text-[#1B2A4A]">{c.label}</span>
                  {!isPartVisible(garment, c.id) && <span className="ml-auto text-[9px] text-[#9CA3AF]">ซ่อนอยู่</span>}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-bold text-[#1B2A4A] mb-1.5 px-1">{activeDef.label} — {activeDef.presets?.length ?? 0} สไตล์</p>
              <div className="grid grid-cols-2 gap-1.5">
                {activeDef.presets?.map(p => {
                  const active = garment.parts[selectedPart!]?.preset === p.id;
                  return (
                    <motion.button key={p.id} whileTap={{ scale: 0.92 }}
                      onClick={() => setPreset(selectedPart!, p.id)}
                      className={`relative p-2 rounded-xl border-2 text-[11px] font-medium leading-tight transition-all min-h-[52px] flex flex-col items-center justify-center gap-0.5
                        ${active ? 'border-[#C5A55A] bg-[#C5A55A]/10 text-[#1B2A4A] shadow-sm' : 'border-[#E5DFD6] bg-white text-[#6B7280] hover:border-[#C5A55A]/50'}`}>
                      {active && <Check className="absolute top-1 right-1 w-3 h-3 text-[#C5A55A]" />}
                      <span>{p.label}</span>
                      {p.price ? <span className="text-[9px] text-[#C5A55A]">+฿{p.price}</span> : null}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )
        )}

        {tab === 'fabrics' && (
          <>
            <div className="flex gap-1">
              {(['silk', 'cotton', 'blend'] as const).map(t => (
                <button key={t} onClick={() => setFabTab(t)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-semibold border transition-all
                    ${fabTab === t ? 'bg-[#1B2A4A] border-[#1B2A4A] text-white' : 'bg-white border-[#E5DFD6] text-[#6B7280]'}`}>
                  {t === 'silk' ? 'ไหม' : t === 'cotton' ? 'ฝ้าย' : 'ผสม'}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-[#9CA3AF] px-1">ลากผ้าไปวางบนชิ้นส่วนของชุดได้เลย</p>
            <div className="grid grid-cols-2 gap-1.5">
              {FABRICS.filter(f => f.tab === fabTab).map(f => <FabricCard key={f.id} fabric={f} />)}
            </div>
          </>
        )}

        {tab === 'deco' && (
          <>
            <p className="text-[9px] text-[#9CA3AF] px-1">ลากไปวางบนชิ้นส่วน — เฉพาะชิ้นที่เลือกเท่านั้นที่ได้รับงานตกแต่ง</p>
            {DECORATIONS.map(d => <DecoCard key={d.id} deco={d} />)}
          </>
        )}

        {tab === 'favs' && (
          favorites.length === 0 ? (
            <p className="text-[10px] text-[#9CA3AF] text-center py-6">ยังไม่มีแบบโปรด<br />กดปุ่มหัวใจด้านบนเพื่อบันทึกแบบปัจจุบัน</p>
          ) : (
            favorites.map(f => (
              <div key={f.id} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E5DFD6]">
                <Heart className="w-3.5 h-3.5 text-[#C5A55A] shrink-0" />
                <button onClick={() => applyFavorite(f.id)} className="flex-1 min-w-0 text-left">
                  <span className="block text-[11px] font-semibold text-[#1B2A4A] truncate">{f.name}</span>
                  <span className="block text-[9px] text-[#9CA3AF]">{GARMENTS[f.garment.type].label} · {new Date(f.savedAt).toLocaleDateString('th-TH')}</span>
                </button>
                <button onClick={() => deleteFavorite(f.id)} className="p-1 rounded hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

// ─── Property Panel ──────────────────────────────────────────────────────────
export function PropertyPanel() {
  const garment = useCreator(s => s.garment);
  const selectedPart = useCreator(s => s.selectedPart);
  const {
    select, setParam, setColor, setStitch, setFabric, setPreset,
    removeDecoration, moveDecoration,
  } = useCreator.getState();

  const def = selectedPart ? componentDef(garment.type, selectedPart) : undefined;
  const part = selectedPart ? garment.parts[selectedPart] : undefined;

  return (
    <AnimatePresence mode="wait">
      {def && part ? (
        <motion.div
          key={selectedPart}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col h-full bg-white/90 backdrop-blur rounded-2xl border-2 border-[#C5A55A] shadow-[0_4px_24px_rgba(197,165,90,0.18)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#E5DFD6]/60 shrink-0">
            <h2 className="text-[13px] font-bold text-[#1B2A4A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C5A55A]" />{def.label}
            </h2>
            <button onClick={() => select(null)} className="p-1 rounded-lg hover:bg-[#F0EBE3] text-[#9CA3AF] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Modifier sliders — อัปเดตแบบเรียลไทม์ */}
            {def.sliders && def.sliders.length > 0 && (
              <div className="space-y-3">
                {def.sliders.map(s => (
                  <SliderRow key={s.id} label={s.label} value={part.params[s.id] ?? s.def}
                    min={s.min} max={s.max} step={s.step} minLabel={s.minLabel} maxLabel={s.maxLabel} unit={s.unit}
                    onChange={n => setParam(selectedPart!, s.id, n)} />
                ))}
              </div>
            )}

            {/* ผ้าของชิ้นนี้ */}
            {def.acceptsFabric && (
              <div>
                <p className="text-[10px] font-semibold text-[#1B2A4A]/60 uppercase tracking-wide mb-1.5">ผ้าของชิ้นนี้</p>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF6F0] border border-[#E5DFD6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fabricById(part.fabricId ?? garment.parts.body?.fabricId).image} alt=""
                    className="w-9 h-9 rounded-lg object-cover border border-[#E5DFD6]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-[#1B2A4A] truncate">
                      {fabricById(part.fabricId ?? garment.parts.body?.fabricId).name}
                    </p>
                    <p className="text-[9px] text-[#9CA3AF]">
                      {part.fabricId ? 'กำหนดเฉพาะชิ้นนี้' : 'ตามผ้าหลักของชุด'} · ลากผ้าใหม่จากคลังมาวางได้
                    </p>
                  </div>
                  {part.fabricId && (
                    <button onClick={() => setFabric(selectedPart!, undefined)}
                      title="กลับไปใช้ผ้าหลัก"
                      className="p-1 rounded hover:bg-white text-[#9CA3AF] transition-colors"><X className="w-3 h-3" /></button>
                  )}
                </div>
              </div>
            )}

            {/* สี */}
            <div>
              <p className="text-[10px] font-semibold text-[#1B2A4A]/60 uppercase tracking-wide mb-1.5">โทนสี</p>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_SWATCHES.map(({ hex, name }) => (
                  <motion.button key={hex} whileTap={{ scale: 0.85 }} title={name}
                    onClick={() => setColor(selectedPart!, part.color === hex ? undefined : hex)}
                    className={`w-6 h-6 rounded-full border-2 transition-all
                      ${part.color === hex ? 'border-[#1B2A4A] scale-110 shadow' : 'border-black/10 hover:scale-105'}`}
                    style={{ backgroundColor: hex }} />
                ))}
              </div>
            </div>

            {/* ตะเข็บ */}
            <div>
              <p className="text-[10px] font-semibold text-[#1B2A4A]/60 uppercase tracking-wide mb-1.5">ตะเข็บ</p>
              <div className="grid grid-cols-3 gap-1.5">
                {STITCHES.map(s => (
                  <button key={s.id} onClick={() => setStitch(selectedPart!, s.id)}
                    className={`py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all
                      ${part.stitch === s.id ? 'border-[#1B2A4A] bg-[#1B2A4A]/5 text-[#1B2A4A]' : 'border-[#E5DFD6] text-[#6B7280] hover:border-[#1B2A4A]/30'}`}>
                    {s.label}{s.price ? <span className="block text-[8px] text-[#C5A55A]">+฿{s.price}</span> : null}
                  </button>
                ))}
              </div>
            </div>

            {/* เลเยอร์ตกแต่ง (เรียงลำดับแบบ Photoshop) */}
            {part.decorations.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#1B2A4A]/60 uppercase tracking-wide mb-1.5">
                  เลเยอร์ตกแต่ง ({part.decorations.length})
                </p>
                <div className="space-y-1">
                  {[...part.decorations].reverse().map(dId => {
                    const dec = DECORATIONS.find(d => d.id === dId);
                    if (!dec) return null;
                    return (
                      <div key={dId} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#FAF6F0] border border-[#E5DFD6]">
                        <span className="w-4 h-4 rounded border border-black/10 shrink-0" style={{ backgroundColor: dec.color }} />
                        <span className="flex-1 text-[10px] font-medium text-[#1B2A4A] truncate">{dec.label}</span>
                        <button onClick={() => moveDecoration(selectedPart!, dId, 1)} className="p-0.5 rounded hover:bg-white text-[#9CA3AF]"><ChevronUp className="w-3 h-3" /></button>
                        <button onClick={() => moveDecoration(selectedPart!, dId, -1)} className="p-0.5 rounded hover:bg-white text-[#9CA3AF]"><ChevronDown className="w-3 h-3" /></button>
                        <button onClick={() => removeDecoration(selectedPart!, dId)} className="p-0.5 rounded hover:bg-red-50 text-[#9CA3AF] hover:text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Smart suggestions */}
            {(() => {
              const sugg = SUGGESTIONS[selectedPart!]?.[part.preset];
              if (!sugg?.length) return null;
              return (
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-[#C5A55A]/25 p-2.5">
                  <p className="text-[10px] font-bold text-[#1B2A4A] flex items-center gap-1 mb-1.5">
                    <Sparkles className="w-3 h-3 text-[#C5A55A]" /> เข้ากันกับ{def.label}นี้
                  </p>
                  <div className="space-y-1">
                    {sugg.map((sg, i) => (
                      <button key={i}
                        onClick={() => {
                          if (sg.presetId) setPreset(sg.targetPart, sg.presetId);
                          if (sg.fabricId) setFabric(sg.targetPart, sg.fabricId);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-transparent hover:border-[#C5A55A]/40 text-[10px] font-medium text-[#1B2A4A] transition-all">
                        + {sg.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      ) : (
        <motion.div key="empty"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center h-full bg-white/60 backdrop-blur rounded-2xl border border-dashed border-[#E5DFD6] p-6 text-center"
        >
          <MousePointerClick className="w-8 h-8 text-[#C5A55A] mb-3" />
          <p className="text-[13px] font-bold text-[#1B2A4A] mb-1">ชุดคือเมนู</p>
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            ชี้ชิ้นส่วนบนโมเดล = ขอบฟ้า<br />คลิกเลือก = ขอบทอง<br />แล้วแผงนี้จะเปลี่ยนเป็นการตั้งค่าของชิ้นนั้นทันที
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
