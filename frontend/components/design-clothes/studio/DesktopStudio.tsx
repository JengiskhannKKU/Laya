'use client';

/**
 * DesktopStudio — layout เดสก์ท็อปแบบ single-screen studio (ตาม design-mockup.jpg)
 * ต่างจาก ClothingDesigner (mobile wizard) ตรงที่ทุกส่วนแก้ไขได้พร้อมกันตลอดเวลา ไม่ gate เป็นขั้นๆ
 * ใช้ store/resolveLayers/calcPrice/catalog เดียวกับ mobile ทุกประการ — ไม่แตะ business logic เดิม
 */

import { useEffect, useMemo, useState } from 'react';

import { useGarmentStore } from '@/lib/stores/garment-store';
import { GarmentDesign, resolveLayers, calcPrice, calcPriceBreakdown } from '../builder/types';
import StudioHeader from './StudioHeader';
import StudioStepBar from './StudioStepBar';
import StudioLeftPanel from './StudioLeftPanel';
import StudioCenterPreview from './StudioCenterPreview';
import StudioRightPanel from './StudioRightPanel';
import StudioSummaryBar from './StudioSummaryBar';

const DRAFT_KEY = 'laya-garment-builder-v1';

export default function DesktopStudio() {
  const store = useGarmentStore();
  const { catalog, loading, category, parts, partPattern, partColor, pattern, color, templateId } = store;

  const [savedNote, setSavedNote] = useState('');
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => { store.loadCatalog(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { setHasDraft(!!localStorage.getItem(DRAFT_KEY)); }, []);

  useEffect(() => {
    if (!savedNote) return;
    const t = setTimeout(() => setSavedNote(''), 2200);
    return () => clearTimeout(t);
  }, [savedNote]);

  const design: GarmentDesign = useMemo(
    () => ({ category, parts, partPattern, partColor, pattern, color }),
    [category, parts, partPattern, partColor, pattern, color],
  );
  const layers = useMemo(() => (catalog ? resolveLayers(catalog, design) : []), [catalog, design]);
  const price = useMemo(() => (catalog ? calcPrice(catalog, design) : 0), [catalog, design]);
  const breakdown = useMemo(() => (catalog ? calcPriceBreakdown(catalog, design) : { base: 0, options: 0, fabric: 0, total: 0 }), [catalog, design]);
  const categoryDef = catalog?.categories[category];

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ category, parts, partPattern, partColor, pattern, color, templateId }));
    setHasDraft(true);
    setSavedNote('บันทึกแล้ว');
  };

  const loadDraft = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      store.loadDesign(JSON.parse(raw));
      setSavedNote('โหลดแบบเดิมแล้ว');
    } catch {
      setSavedNote('โหลดแบบร่างไม่สำเร็จ');
    }
  };

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
      <StudioHeader onSaveDraft={saveDraft} onLoadDraft={loadDraft} hasDraft={hasDraft} savedNote={savedNote} />
      <StudioStepBar />

      <div className="max-w-screen-2xl w-full mx-auto px-6 py-4 flex-1 space-y-4">
        <div className="grid grid-cols-[300px_1fr_320px] gap-4 items-start">
          <div className="bg-white rounded-2xl border border-border p-3 max-h-[calc(100vh-160px)] overflow-y-auto">
            <StudioLeftPanel catalog={catalog} categoryDef={categoryDef} design={design} />
          </div>

          <div className="h-[calc(100vh-160px)] min-h-[560px]">
            <StudioCenterPreview catalog={catalog} categoryDef={categoryDef} design={design} layers={layers} price={price} />
          </div>

          <div className="bg-white rounded-2xl border border-border p-3 max-h-[calc(100vh-160px)] overflow-y-auto">
            <StudioRightPanel catalog={catalog} design={design} />
          </div>
        </div>

        <StudioSummaryBar catalog={catalog} categoryDef={categoryDef} design={design} breakdown={breakdown} onSave={saveDraft} savedNote={savedNote} />
      </div>
    </div>
  );
}
