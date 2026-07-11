'use client';

/**
 * StudioHeader — แถบบนของสตูดิโอเดสก์ท็อป
 * ใช้ AppTopNav (components/layout/TopNav.tsx) จริงเป็นแถบเนวี่บนสุด — ไม่ปั้น nav bar ปลอมซ้อน
 * ใต้นั้นเป็น breadcrumb/ชื่อหน้า (ผูกกับ category จริงจาก catalog) + ปุ่มบันทึกแบบร่าง/โหลดแบบเดิม/บันทึก & ต่อไป
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, FolderOpen, ArrowRight } from 'lucide-react';

import AppTopNav from '@/components/layout/TopNav';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { Category, CategoryDef } from '../builder/types';

interface Props {
  category: Category;
  categoryDef: CategoryDef;
  onSaveDraft: () => void;
  onLoadDraft: () => void;
  hasDraft: boolean;
  savedNote?: string;
}

const CATEGORY_SHORT_NAME: Record<Category, string> = {
  top: 'เสื้อผ้า',
  pants: 'กางเกง',
  skirt: 'กระโปรง',
};

export default function StudioHeader({ category, categoryDef, onSaveDraft, onLoadDraft, hasDraft, savedNote }: Props) {
  const router = useRouter();
  const shortName = CATEGORY_SHORT_NAME[category];

  const handleSaveAndContinue = () => {
    onSaveDraft();
    router.push('/tailor/with-fabric');
  };

  return (
    <div className="sticky top-0 z-30">
      <AppTopNav />

      <div className="bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-6 pt-3 pb-2">
          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
            <div className="min-w-0">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">หน้าแรก</Link></BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink asChild><Link href="/design-clothes">ออกแบบเสื้อผ้า</Link></BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  {category === 'top' ? (
                    <BreadcrumbItem><BreadcrumbPage>สร้างแบบของคุณ</BreadcrumbPage></BreadcrumbItem>
                  ) : (
                    <>
                      <BreadcrumbItem><BreadcrumbPage>สร้างแบบของคุณ</BreadcrumbPage></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage>{shortName}</BreadcrumbPage></BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>

              <h1 className="text-xl font-bold text-primary mt-1">ออกแบบ{shortName}ของคุณ</h1>
              <p className="text-xs text-muted-foreground">เลือกทรง{shortName} เลือกผ้า ปรับดีไซน์ และสร้างสรรค์ชิ้นงานในแบบของคุณ</p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {savedNote && <span className="text-[11px] text-secondary font-medium">{savedNote}</span>}
              <button onClick={onSaveDraft}
                className="px-3 py-2.5 rounded-xl border border-border text-xs font-semibold text-primary flex items-center gap-1.5 hover:bg-muted transition-colors">
                <Bookmark className="w-3.5 h-3.5" /> บันทึกแบบร่าง
              </button>
              <button onClick={onLoadDraft} disabled={!hasDraft} title={hasDraft ? undefined : 'ยังไม่มีแบบร่างที่บันทึกไว้'}
                className="px-3 py-2.5 rounded-xl border border-border text-xs font-semibold text-primary flex items-center gap-1.5 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                <FolderOpen className="w-3.5 h-3.5" /> โหลดแบบเดิม
              </button>
              <button onClick={handleSaveAndContinue}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm whitespace-nowrap">
                บันทึก & ต่อไป <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
