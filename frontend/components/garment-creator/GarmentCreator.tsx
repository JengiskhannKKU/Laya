'use client';

/**
 * LAYA Garment Creator V2 — หน้าหลัก
 * Layout: TopBar / [Asset Library | 3D Viewport | Property Panel] / BottomBar (tree + ราคา)
 * ชุดคือเมนู: hover ขอบฟ้า, คลิกขอบทอง, ลากผ้า-ตกแต่งมาวางบนชิ้นส่วนได้เลย
 */

import { useEffect, useState } from 'react';
import { useCreator } from './store';
import { componentDef } from './config';
import Scene from './Scene';
import { AssetLibrary, PropertyPanel } from './panels';
import { TopBar, BottomBar, AIAssistant, DragGhost, Toast } from './chrome';

export default function GarmentCreator() {
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'library' | 'props' | null>(null);
  const drag = useCreator(s => s.drag);
  const selectedPart = useCreator(s => s.selectedPart);

  // ── Global drag: ghost ตามเมาส์ + วางบนชิ้นส่วน ──
  useEffect(() => {
    if (!drag) { setGhostPos(null); return; }
    const move = (e: PointerEvent) => setGhostPos({ x: e.clientX, y: e.clientY });
    const up = () => {
      const { drag: d, dropTarget, garment, setFabric, addDecoration, endDrag, showToast } = useCreator.getState();
      if (d && dropTarget) {
        const def = componentDef(garment.type, dropTarget);
        if (d.kind === 'fabric' && def?.acceptsFabric) {
          setFabric(dropTarget, d.id);
          showToast(`เปลี่ยนผ้า "${def.label}" เป็น ${d.label}`);
        } else if (d.kind === 'decoration' && def?.acceptsDecoration) {
          addDecoration(dropTarget, d.id);
          showToast(`เพิ่ม${d.label}ให้ "${def.label}"`);
        } else if (d.kind === 'decoration') {
          showToast('ชิ้นนี้รับงานตกแต่งไม่ได้');
        } else {
          showToast('ชิ้นนี้เปลี่ยนผ้าไม่ได้');
        }
      }
      endDrag();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag]);

  // ── Keyboard: Ctrl+Z / Ctrl+Y / Esc ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const { undo, redo, select } = useCreator.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        select(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // มือถือ: เลือกชิ้นส่วน → เปิดแผง property อัตโนมัติ
  useEffect(() => {
    if (selectedPart && window.innerWidth < 1024) setMobilePanel('props');
  }, [selectedPart]);

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-b from-[#FAF6F0] to-[#F0EBE3] overflow-hidden select-none">
      <TopBar />

      <div className="flex-1 relative flex min-h-0">
        {/* Asset Library — ซ้าย (desktop) */}
        <div className="hidden lg:block w-60 xl:w-64 shrink-0 p-2.5 pr-0 min-h-0">
          <AssetLibrary />
        </div>

        {/* 3D Viewport — ศูนย์กลางของทุกอย่าง */}
        <div className="flex-1 relative min-w-0">
          <Scene />
          <Toast />
          <AIAssistant />

          {/* ปุ่มเปิดแผงบนมือถือ */}
          <div className="lg:hidden absolute top-2 left-2 z-20 flex gap-1.5">
            <button onClick={() => setMobilePanel(p => p === 'library' ? null : 'library')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold shadow-sm border transition-all
                ${mobilePanel === 'library' ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]' : 'bg-white/90 text-[#1B2A4A] border-[#E5DFD6]'}`}>
              คลัง
            </button>
            <button onClick={() => setMobilePanel(p => p === 'props' ? null : 'props')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold shadow-sm border transition-all
                ${mobilePanel === 'props' ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]' : 'bg-white/90 text-[#1B2A4A] border-[#E5DFD6]'}`}>
              ปรับแต่ง
            </button>
          </div>

          {/* แผง overlay บนมือถือ */}
          {mobilePanel && (
            <div className="lg:hidden absolute inset-y-2 left-2 right-14 z-20 max-w-[300px]">
              {mobilePanel === 'library' ? <AssetLibrary /> : <PropertyPanel />}
            </div>
          )}
        </div>

        {/* Property Panel — ขวา (desktop) */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0 p-2.5 pl-0 min-h-0">
          <PropertyPanel />
        </div>
      </div>

      <BottomBar />
      <DragGhost pos={ghostPos} />
    </div>
  );
}
