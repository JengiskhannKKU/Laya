'use client';

/**
 * โหลด Garment Creator เฉพาะฝั่ง client — 3D viewport (React Three Fiber) ใช้ WebGL
 */

import dynamic from 'next/dynamic';

const GarmentCreator = dynamic(() => import('./GarmentCreator'), {
  ssr: false,
  loading: () => (
    <div className="h-[100dvh] flex flex-col items-center justify-center gap-3 bg-[#FAF6F0]">
      <div className="w-10 h-10 border-4 border-[#C5A55A] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-[#1B2A4A]">กำลังเปิดห้องออกแบบ…</p>
    </div>
  ),
});

export default function GarmentCreatorLoader() {
  return <GarmentCreator />;
}
