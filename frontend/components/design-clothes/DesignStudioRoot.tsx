'use client';

/**
 * DesignStudioRoot — สวิตช์ mobile wizard / desktop studio ตามความกว้างจอ
 * ทั้งสองฝั่งอ่าน/เขียน useGarmentStore ตัวเดียวกัน ทำให้ resize ข้าม breakpoint กลางเซสชันแบบไม่เสียแบบ
 * รอ mounted ก่อนค่อยเลือก branch กัน hydration mismatch และกัน "mobile กระพริบก่อนสลับเป็น desktop"
 */

import { useEffect, useState } from 'react';

import { useIsDesktop } from '@/hooks/use-desktop';
import ClothingDesigner from './ClothingDesigner';
import DesktopStudio from './studio/DesktopStudio';

export default function DesignStudioRoot() {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isDesktop ? <DesktopStudio /> : <ClothingDesigner />;
}
