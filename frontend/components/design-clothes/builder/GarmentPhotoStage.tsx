'use client';

/**
 * GarmentPhotoStage — โชว์ภาพถ่ายจริงของนางแบบเมื่อมี, fallback ไป GarmentRenderer (SVG) เมื่อไม่มี
 * ใช้ร่วมกันทั้ง mobile wizard และ desktop studio กันสองที่พฤติกรรม fallback ไม่ตรงกัน
 */

import { useEffect, useState } from 'react';
import type { GarmentDesign, RenderLayer } from './types';
import { getThaiDressPhotoUrl, hasThaiDressPhotoShape } from '@/lib/thai-dress-photo';
import GarmentRenderer, { type GarmentRendererProps } from './GarmentRenderer';

interface Props {
  design: GarmentDesign;
  layers: RenderLayer[];
  canvas: { width: number; height: number };
  rendererProps?: Partial<GarmentRendererProps>;
  /** ซ่อนข้อความ fallback (ใช้กับ thumbnail เล็กที่ไม่มีที่พอ) */
  hideCaption?: boolean;
}

export default function GarmentPhotoStage({ design, layers, canvas, rendererProps, hideCaption }: Props) {
  const photoUrl = getThaiDressPhotoUrl(design);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  useEffect(() => { setFailedUrl(null); }, [photoUrl]);

  if (photoUrl && failedUrl !== photoUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={photoUrl}
        alt="นางแบบสวมชุดไทยร่วมสมัยตามแบบที่เลือก"
        className="w-full h-full object-contain"
        draggable={false}
        onError={() => setFailedUrl(photoUrl)}
      />
    );
  }

  const shapeOk = hasThaiDressPhotoShape(design);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <GarmentRenderer layers={layers} canvas={canvas} {...rendererProps} />
      </div>
      {!hideCaption && shapeOk && (
        <p className="text-center text-[10px] text-muted-foreground pt-1.5">
          ยังไม่มีภาพตัวอย่างสำหรับสีนี้ — แสดงพรีวิวภาพร่างแทน
        </p>
      )}
    </div>
  );
}
