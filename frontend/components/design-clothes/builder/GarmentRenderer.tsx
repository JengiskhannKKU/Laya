'use client';

/**
 * GarmentRenderer — layer-based rendering
 * UI ไม่ผูกกับเทคนิคการเรนเดอร์: เลือก renderer จาก prop (วันนี้ svg-layer,
 * อนาคตเพิ่ม png/3d ได้โดย business logic ไม่เปลี่ยน)
 *
 * แต่ละ layer = asset ภายนอก (SVG/PNG โปร่งใส) วางซ้อนด้วย absolute position
 * โหมด mask: asset เป็นรูปทรง → เติมลายผ้า (CSS background repeat) + สีทับ
 * โหมด image: แสดง asset ตรงๆ (เช่น กระดุมที่มีสีในตัว)
 */

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { RenderLayer, Transition } from './types';

export type RendererKind = 'svg-layer'; // | 'png' | '3d' (อนาคต)

export interface GarmentRendererProps {
  layers: RenderLayer[];
  canvas: { width: number; height: number };
  selectedPart?: string | null;
  hoveredPart?: string | null;
  onSelectPart?: (partKey: string) => void;
  onHoverPart?: (partKey: string | null) => void;
  /** ปิด interaction (ใช้ทำ thumbnail template) */
  interactive?: boolean;
  renderer?: RendererKind;
  /** เนื้อหาเสริมวางซ้อนในกรอบ aspect-ratio เดียวกับ layer (เช่น hotspot overlay) — ตำแหน่ง % จะตรงกับ layer.box เป๊ะ */
  overlay?: React.ReactNode;
}

const TRANSITION_VARIANTS: Record<Transition, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: -14 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 14 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.55 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.55 },
  },
};

export default function GarmentRenderer(props: GarmentRendererProps) {
  // จุดสลับ renderer ในอนาคต — UI ภายนอกเรียกแค่ GarmentRenderer เสมอ
  switch (props.renderer ?? 'svg-layer') {
    case 'svg-layer':
    default:
      return <SvgLayerRenderer {...props} />;
  }
}

// ─── SVG/PNG Layer Renderer ──────────────────────────────────────────────────
function SvgLayerRenderer({
  layers, canvas, selectedPart, hoveredPart, onSelectPart, onHoverPart, interactive = true, overlay,
}: GarmentRendererProps) {
  return (
    <div className="relative w-full h-full" style={{ aspectRatio: `${canvas.width} / ${canvas.height}` }}>
      <AnimatePresence>
        {layers.map(layer => {
          const isSelected = selectedPart === layer.partKey;
          const isHovered = !isSelected && hoveredPart === layer.partKey;
          const v = TRANSITION_VARIANTS[layer.transition];
          const maskStyle: React.CSSProperties = {
            WebkitMaskImage: `url("${layer.asset}")`,
            maskImage: `url("${layer.asset}")`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
          };

          return (
            <motion.div
              key={`${layer.id}-${layer.asset}`}
              variants={v}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className={interactive ? 'cursor-pointer' : undefined}
              style={{
                position: 'absolute',
                left: `${layer.box.left}%`,
                top: `${layer.box.top}%`,
                width: `${layer.box.width}%`,
                height: `${layer.box.height}%`,
                zIndex: layer.z,
                transform: layer.mirror ? 'scaleX(-1)' : undefined,
                filter: 'drop-shadow(0 2px 3px rgba(27,42,74,0.18))',
              }}
              onClick={interactive ? (e) => { e.stopPropagation(); onSelectPart?.(layer.partKey); } : undefined}
              onMouseEnter={interactive ? () => onHoverPart?.(layer.partKey) : undefined}
              onMouseLeave={interactive ? () => onHoverPart?.(null) : undefined}
            >
              {layer.mode === 'image' ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={layer.asset} alt={layer.label} className="w-full h-full" draggable={false} />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    ...maskStyle,
                    backgroundColor: layer.color ?? '#E8DCC8',
                    backgroundImage: layer.patternImage ? `url("${layer.patternImage}")` : undefined,
                    backgroundSize: '130px 130px',
                    backgroundRepeat: 'repeat',
                    backgroundBlendMode: layer.patternImage ? 'multiply' : undefined,
                  }}
                />
              )}

              {/* Highlight: hover = ฟ้า, เลือก = ทอง */}
              {(isHovered || isSelected) && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    ...maskStyle,
                    backgroundColor: isSelected ? 'rgba(197,165,90,0.45)' : 'rgba(59,130,246,0.35)',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {overlay}
    </div>
  );
}

/** พรีวิวชิ้นส่วนเดี่ยว (การ์ดใน component library) — ใช้เทคนิค mask เดียวกัน */
export function PartPreview({ asset, patternImage, color, mode }: {
  asset: string; patternImage: string | null; color: string | null; mode: 'mask' | 'image';
}) {
  if (mode === 'image') {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={asset} alt="" className="w-full h-full object-contain" draggable={false} />;
  }
  return (
    <div
      className="w-full h-full"
      style={{
        WebkitMaskImage: `url("${asset}")`,
        maskImage: `url("${asset}")`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        backgroundColor: color ?? '#C9B896',
        backgroundImage: patternImage ? `url("${patternImage}")` : undefined,
        backgroundSize: '90px 90px',
        backgroundRepeat: 'repeat',
        backgroundBlendMode: patternImage ? 'multiply' : undefined,
        // ระบุ mask-mode ตรงๆ ว่าใช้ alpha channel ของรูป — เดิมปล่อยเป็นค่า default (match-source) ตอนใช้ SVG
        // placeholder แบบ solid fill ไม่มีปัญหา แต่พอเปลี่ยนมาใช้ PNG จริง (เส้นขอบ anti-alias, สี navy เข้ม)
        // บางเบราว์เซอร์/บาง engine ตีความ default เป็น luminance mask แทน ทำให้พื้นที่สีเข้ม (navy) กับพื้นหลัง
        // โปร่งใสมี luminance ใกล้เคียงกัน (ทั้งคู่ต่ำ) จนมาสก์ทั้งรูปดูเหมือนหายไปหมด — บังคับ alpha ชัดเจนกันปัญหานี้
        ...({ WebkitMaskMode: 'alpha', maskMode: 'alpha' } as React.CSSProperties),
      }}
    />
  );
}
