'use client';

/**
 * StudioHeader — แถบบนของสตูดิโอเดสก์ท็อป (เฉพาะหน้านี้ ไม่แตะ components/layout/TopNav.tsx)
 * breadcrumb + ชื่อหน้า + ปุ่มบันทึกแบบร่าง/โหลดแบบเดิม + ไอคอนตะกร้า/แจ้งเตือนที่ผูกจำนวนจริง
 */

import Link from 'next/link';
import { Bookmark, FolderOpen, ShoppingBag, Bell } from 'lucide-react';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useCartStore } from '@/lib/cart-store';
import { useNotifications } from '@/lib/notification-context';

interface Props {
  onSaveDraft: () => void;
  onLoadDraft: () => void;
  hasDraft: boolean;
  savedNote?: string;
}

export default function StudioHeader({ onSaveDraft, onLoadDraft, hasDraft, savedNote }: Props) {
  const cartCount = useCartStore(s => s.items.length);
  const { unreadCount } = useNotifications();

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-6 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-base font-bold text-primary tracking-wide">LAYA</Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">หน้าแรก</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>ออกแบบเสื้อผ้า</BreadcrumbPage></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>สร้างแบบของคุณ</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            {savedNote && <span className="text-[11px] text-secondary font-medium">{savedNote}</span>}
            <button onClick={onSaveDraft}
              className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-primary flex items-center gap-1.5 hover:bg-muted transition-colors">
              <Bookmark className="w-3.5 h-3.5" /> บันทึกแบบร่าง
            </button>
            <button onClick={onLoadDraft} disabled={!hasDraft} title={hasDraft ? undefined : 'ยังไม่มีแบบร่างที่บันทึกไว้'}
              className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-primary flex items-center gap-1.5 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
              <FolderOpen className="w-3.5 h-3.5" /> โหลดแบบเดิม
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            <Link href="/notifications" className="relative w-9 h-9 rounded-xl border border-border flex items-center justify-center text-primary hover:bg-muted transition-colors">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-secondary text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative w-9 h-9 rounded-xl border border-border flex items-center justify-center text-primary hover:bg-muted transition-colors">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-secondary text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-primary">ออกแบบเสื้อผ้าของคุณ</h1>
          <p className="text-xs text-muted-foreground">เลือกทรงเสื้อ เลือกผ้า ปรับดีไซน์ และสร้างสรรค์ชิ้นงานในแบบของคุณ</p>
        </div>
      </div>
    </div>
  );
}
