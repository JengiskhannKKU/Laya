'use client';

/**
 * Parametric garment meshes — ทุกชิ้นส่วนเป็น mesh อิสระ สร้างจาก config JSON
 * hover = ฟ้า, เลือก = ทอง, ลากผ้ามาวาง = เขียว (emissive glow)
 * เปลี่ยน preset → pop animation, exploded view → ชิ้นส่วนแยกออกอย่างนุ่มนวล
 */

import { createContext, useContext, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useCreator } from './store';
import {
  GarmentState, PartState, fabricById, isPartVisible, componentDef, DECORATIONS,
} from './config';

// ─── Interaction context ─────────────────────────────────────────────────────
const PartCtx = createContext<{ emissive: string | null; partId: string }>({ emissive: null, partId: '' });

const HOVER_BLUE = '#3B82F6';
const SELECT_GOLD = '#C5A55A';
const DROP_GREEN = '#22C55E';

function easeOutBack(t: number) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Wrapper ของทุกชิ้นส่วน: จัดการ pointer, glow, pop animation, exploded offset */
export function Part({ partId, explode, popKey, children }: {
  partId: string;
  explode?: [number, number, number];
  /** เมื่อค่านี้เปลี่ยน → เล่น pop animation */
  popKey: string;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const selected = useCreator(s => s.selectedPart === partId);
  const hovered = useCreator(s => s.hoveredPart === partId);
  const dragging = useCreator(s => !!s.drag);
  const isDrop = useCreator(s => s.dropTarget === partId && !!s.drag);
  const exploded = useCreator(s => s.exploded);
  const { select, hover, setDropTarget } = useCreator.getState();

  const emissive = isDrop ? DROP_GREEN : selected ? SELECT_GOLD : hovered ? HOVER_BLUE : null;

  // pop animation เมื่อ preset เปลี่ยน
  const prevPop = useRef(popKey);
  const popT = useRef(1);
  if (prevPop.current !== popKey) { prevPop.current = popKey; popT.current = 0; }

  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    // exploded offset (lerp นุ่มๆ)
    const [ex, ey, ez] = explode ?? [0, 0, 0];
    target.set(exploded ? ex * 0.45 : 0, exploded ? ey * 0.45 : 0, exploded ? ez * 0.45 : 0);
    g.position.lerp(target, 1 - Math.exp(-8 * dt));
    // pop
    if (popT.current < 1) {
      popT.current = Math.min(1, popT.current + dt * 3);
      g.scale.setScalar(0.88 + 0.12 * easeOutBack(popT.current));
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        hover(partId);
        if (dragging) setDropTarget(partId);
        document.body.style.cursor = 'pointer';
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (dragging) { e.stopPropagation(); setDropTarget(partId); }
      }}
      onPointerOut={() => {
        hover(null);
        setDropTarget(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); select(selected ? null : partId); }}
    >
      <PartCtx.Provider value={{ emissive, partId }}>{children}</PartCtx.Provider>
    </group>
  );
}

/** วัสดุผ้า: texture จริง + tint สี + glow ตามสถานะ interaction */
export function FabricMat({ image, color, repeat = 2.4 }: { image: string; color?: string; repeat?: number }) {
  const { emissive } = useContext(PartCtx);
  const wireframe = useCreator(s => s.wireframe);
  const base = useTexture(image);
  // clone เพราะ useTexture แคช texture ต่อ URL — แต่ละชิ้นใช้ repeat ต่างกัน
  const tex = useMemo(() => {
    const t = base.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [base, repeat]);
  return (
    <meshStandardMaterial
      map={tex}
      color={color ?? '#ffffff'}
      roughness={0.88}
      metalness={0.04}
      side={THREE.DoubleSide}
      wireframe={wireframe}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissive ? 0.38 : 0}
    />
  );
}

/** วัสดุสีล้วน (กระดุม/ตกแต่ง) — ยัง glow ตามชิ้นส่วนแม่ */
export function SolidMat({ color, metalness = 0.1, roughness = 0.6 }: { color: string; metalness?: number; roughness?: number }) {
  const { emissive } = useContext(PartCtx);
  const wireframe = useCreator(s => s.wireframe);
  return (
    <meshStandardMaterial
      color={color} metalness={metalness} roughness={roughness}
      side={THREE.DoubleSide} wireframe={wireframe}
      emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.38 : 0}
    />
  );
}

// ─── Geometry helpers ────────────────────────────────────────────────────────
function lathe(points: [number, number][], segments = 40, zScale = 1): THREE.BufferGeometry {
  const geo = new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(Math.max(0.001, x), y)), segments);
  if (zScale !== 1) geo.scale(1, 1, zScale);
  geo.computeVertexNormals();
  return geo;
}

/** คลื่นรอบแกน (จีบพลีท) */
function ripple(geo: THREE.BufferGeometry, freq = 22, amp = 0.035) {
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const k = 1 + amp * Math.sin(a * freq);
    pos.setX(i, x * k);
    pos.setZ(i, z * k);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

const Z = 0.62; // elliptical scale ลำตัว

// ─── Decoration layers ───────────────────────────────────────────────────────
/** เลเยอร์ตกแต่ง วางซ้อนตามลำดับ layer (เรียงใหม่ได้แบบ Photoshop) */
function DecorationRings({ part, radius, y, zScale = Z }: {
  part: PartState; radius: number; y: number; zScale?: number;
}) {
  return (
    <>
      {part.decorations.map((decoId, i) => {
        const dec = DECORATIONS.find(d => d.id === decoId);
        if (!dec) return null;
        const ry = y + i * 0.055;
        if (decoId === 'embroidery') {
          // ปัก = เม็ดทองรอบวง
          return (
            <group key={decoId} position={[0, ry, 0]}>
              {Array.from({ length: 14 }).map((_, j) => {
                const a = (j / 14) * Math.PI * 2;
                return (
                  <mesh key={j} position={[Math.cos(a) * radius * 1.01, 0, Math.sin(a) * radius * zScale * 1.01]}>
                    <sphereGeometry args={[0.018, 8, 8]} />
                    <SolidMat color={dec.color} metalness={0.7} roughness={0.3} />
                  </mesh>
                );
              })}
            </group>
          );
        }
        return (
          <mesh key={decoId} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, zScale, 1]}>
            <torusGeometry args={[radius * 1.015, decoId === 'lace' ? 0.028 : 0.018, 10, 48]} />
            <SolidMat
              color={dec.color}
              metalness={decoId === 'goldborder' ? 0.85 : 0.1}
              roughness={decoId === 'goldborder' ? 0.25 : 0.7}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Shirt parts ─────────────────────────────────────────────────────────────
function bodyDims(p: PartState) {
  const len = p.params.length ?? 50;
  const fit = p.params.fit ?? 50;
  const hemY = -0.35 - 0.9 * (len / 100);
  const waistR = 0.42 + 0.18 * (fit / 100);
  const hemR = 0.46 + 0.14 * (fit / 100);
  return { hemY, waistR, hemR };
}

function ShirtBody({ part, fabricImage }: { part: PartState; fabricImage: string }) {
  const { hemY, waistR, hemR } = bodyDims(part);
  const geo = useMemo(() => lathe([
    [hemR, hemY], [waistR, 0.05], [0.48, 0.55], [0.5, 0.72], [0.34, 0.8], [0.19, 0.86],
  ], 44, Z), [hemY, waistR, hemR]);
  return (
    <>
      <mesh geometry={geo}><FabricMat image={fabricImage} color={part.color} /></mesh>
      <DecorationRings part={part} radius={hemR * 0.98} y={hemY + 0.12} />
    </>
  );
}

function Collar({ part, fabricImage }: { part: PartState; fabricImage: string }) {
  const h = 0.05 + 0.09 * ((part.params.height ?? 40) / 100);
  const w = 0.06 + 0.1 * ((part.params.width ?? 50) / 100);
  const geo = useMemo(() => {
    if (part.preset === 'shirt' || part.preset === 'spread') {
      // ปกพับ: ขึ้นแล้วกางออกลง
      return lathe([[0.19, 0], [0.2, h], [0.2 + w, h - 0.02], [0.22 + w, -0.05]], 40, Z * 1.05);
    }
    if (part.preset === 'hood') {
      const g = new THREE.SphereGeometry(0.34, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.62);
      g.scale(1, 1.05, 0.95);
      return g;
    }
    // คอจีน / คอตั้ง: แถบวง
    return lathe([[0.195, 0], [0.2, h], [0.185, h]], 40, Z * 1.05);
  }, [part.preset, h, w]);
  const pos: [number, number, number] = part.preset === 'hood' ? [0, 0.78, -0.12] : [0, 0.86, 0];
  return (
    <>
      <mesh geometry={geo} position={pos}><FabricMat image={fabricImage} color={part.color} repeat={4} /></mesh>
      <DecorationRings part={part} radius={0.21} y={0.9} />
    </>
  );
}

function Placket({ part, bodyPart, fabricImage }: { part: PartState; bodyPart: PartState; fabricImage: string }) {
  const { hemY } = bodyDims(bodyPart);
  const len = 0.8 - hemY;
  const hidden = part.preset === 'hidden';
  return (
    <mesh position={[0, (0.8 + hemY) / 2, 0.47 * Z + 0.155]}>
      <boxGeometry args={[hidden ? 0.05 : 0.1, len, 0.025]} />
      <FabricMat image={fabricImage} color={part.color} repeat={5} />
    </mesh>
  );
}

const BUTTON_COLORS: Record<string, { color: string; metalness: number }> = {
  round: { color: '#F5F0E8', metalness: 0.1 },
  pearl: { color: '#FDF6EC', metalness: 0.55 },
  wood: { color: '#8B5E3C', metalness: 0.05 },
  gold: { color: '#D4AF37', metalness: 0.9 },
  knot: { color: '#C5A55A', metalness: 0.35 },
};

function Buttons({ part, bodyPart }: { part: PartState; bodyPart: PartState }) {
  const { hemY } = bodyDims(bodyPart);
  const count = Math.round(part.params.count ?? 6);
  const size = 0.02 + 0.02 * ((part.params.size ?? 40) / 100);
  const style = BUTTON_COLORS[part.preset] ?? BUTTON_COLORS.round;
  const top = 0.74, bottom = hemY + 0.15;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const y = top - (i / Math.max(1, count - 1)) * (top - bottom);
        return (
          <mesh key={i} position={[0, y, 0.47 * Z + 0.17]} rotation={[Math.PI / 2, 0, 0]}>
            {part.preset === 'knot'
              ? <torusKnotGeometry args={[size * 0.7, size * 0.28, 32, 6]} />
              : <cylinderGeometry args={[size, size, 0.015, 16]} />}
            <SolidMat color={style.color} metalness={style.metalness} roughness={0.35} />
          </mesh>
        );
      })}
    </>
  );
}

function sleeveProfile(preset: string, len01: number, wid01: number): [number, number][] {
  const len = 0.08 + 1.0 * len01;
  const w = 0.14 + 0.15 * wid01;
  switch (preset) {
    case 'puff': return [[0.17, 0], [w * 1.4, -len * 0.45], [0.13, -len]];
    case 'balloon': return [[0.17, 0], [w * 1.35, -len * 0.55], [0.1, -len]];
    case 'bell': return [[0.17, 0], [w * 0.8, -len * 0.55], [w * 1.4, -len]];
    default: return [[0.18, 0], [w, -len * 0.5], [w * 0.88, -len]];
  }
}

function Sleeve({ part, fabricImage, side }: { part: PartState; fabricImage: string; side: 1 | -1 }) {
  const len01 = (part.params.length ?? 100) / 100;
  const wid01 = (part.params.width ?? 35) / 100;
  const geo = useMemo(
    () => lathe(sleeveProfile(part.preset, len01, wid01), 26, 0.85),
    [part.preset, len01, wid01],
  );
  if (len01 <= 0.02) {
    // แขนกุด: ขอบวงแขนเล็กๆ
    return (
      <mesh position={[side * 0.48, 0.68, 0]} rotation={[0, 0, side * -0.4]}>
        <torusGeometry args={[0.17, 0.02, 8, 24]} />
        <FabricMat image={fabricImage} color={part.color} repeat={4} />
      </mesh>
    );
  }
  return (
    <group position={[side * 0.5, 0.72, 0]} rotation={[0, 0, side * -0.32]}>
      <mesh geometry={geo}><FabricMat image={fabricImage} color={part.color} repeat={3} /></mesh>
      <DecorationRings part={part} radius={0.16} y={-(0.08 + len01) + 0.08} zScale={0.85} />
    </group>
  );
}

function ChestPocket({ part, fabricImage }: { part: PartState; fabricImage: string }) {
  const s = 0.14 + 0.12 * ((part.params.size ?? 45) / 100);
  const y = 0.15 + 0.4 * ((part.params.y ?? 60) / 100);
  return (
    <group position={[0.24, y, 0.44 * Z + 0.15]} rotation={[-0.06, 0, 0]}>
      <mesh>
        <boxGeometry args={[s, s * 1.1, 0.02]} />
        <FabricMat image={fabricImage} color={part.color} repeat={6} />
      </mesh>
      {part.preset === 'flap' && (
        <mesh position={[0, s * 0.62, 0.005]}>
          <boxGeometry args={[s * 1.04, s * 0.36, 0.022]} />
          <FabricMat image={fabricImage} color={part.color} repeat={6} />
        </mesh>
      )}
      {part.preset === 'welt' && (
        <mesh position={[0, s * 0.55, 0.012]}>
          <boxGeometry args={[s * 1.02, 0.03, 0.01]} />
          <SolidMat color="#3E3A34" />
        </mesh>
      )}
      <DecorationRings part={part} radius={s * 0.6} y={-s * 0.4} zScale={0.3} />
    </group>
  );
}

function ShirtHem({ part, bodyPart, fabricImage }: { part: PartState; bodyPart: PartState; fabricImage: string }) {
  const { hemY, hemR } = bodyDims(bodyPart);
  const curve = (part.params.curve ?? 0) / 100;
  const rot: [number, number, number] =
    part.preset === 'asym' ? [Math.PI / 2 + 0.18, 0, 0.12] : [Math.PI / 2 + curve * 0.25, 0, 0];
  return (
    <group position={[0, hemY, 0]}>
      <mesh rotation={rot} scale={[1, Z, 1]}>
        <torusGeometry args={[hemR * 1.005, 0.028, 10, 48]} />
        <FabricMat image={fabricImage} color={part.color} repeat={5} />
      </mesh>
      {part.preset === 'slit' && (
        <mesh position={[hemR * 0.95, 0.08, 0]}>
          <boxGeometry args={[0.02, 0.18, 0.03]} />
          <SolidMat color="#3E3A34" />
        </mesh>
      )}
    </group>
  );
}

// ─── Pants parts ─────────────────────────────────────────────────────────────
function Waistband({ part, fabricImage }: { part: PartState; fabricImage: string }) {
  const rise = (part.params.rise ?? 60) / 100;
  const h = part.preset === 'paperbag' || part.preset === 'wide' ? 0.14 : 0.07;
  const y = 0.42 + 0.14 * rise;
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <cylinderGeometry args={[0.43, 0.42, h, 40, 1, true]} />
        <FabricMat image={fabricImage} color={part.color} repeat={5} />
      </mesh>
      {part.preset === 'drawstring' && (
        <mesh position={[0, -h * 0.2, 0.42 * Z + 0.16]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.05, 0.012, 8, 20]} />
          <SolidMat color="#F5F0E8" />
        </mesh>
      )}
      <DecorationRings part={part} radius={0.44} y={0} />
    </group>
  );
}

function PantsLeg({ part, hipPart, fabricImage, side }: {
  part: PartState; hipPart: PartState; fabricImage: string; side: 1 | -1;
}) {
  const len01 = ((part.params.length ?? 100) - 15) / 85;
  const open01 = (part.params.opening ?? 45) / 100;
  const legLen = 0.35 + 1.3 * Math.max(0, len01);
  const ankleR = 0.09 + 0.2 * open01;
  const rise = (hipPart.params.rise ?? 60) / 100;
  const topY = 0.42 + 0.14 * rise - 0.04;
  const geo = useMemo(() => lathe([
    [0.24, 0], [0.22, -legLen * 0.45], [ankleR, -legLen],
  ], 26, 0.9), [legLen, ankleR]);
  return (
    <group position={[side * 0.2, topY, 0]}>
      {/* สะโพกช่วงบน */}
      <mesh position={[side * -0.06, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.26, 0.28, 26, 1, true]} />
        <FabricMat image={fabricImage} color={part.color} repeat={4} />
      </mesh>
      <mesh geometry={geo} position={[0, -0.12, 0]}>
        <FabricMat image={fabricImage} color={part.color} repeat={3.2} />
      </mesh>
      <DecorationRings part={part} radius={ankleR * 1.05} y={-0.12 - legLen + 0.08} zScale={0.9} />
    </group>
  );
}

function PantsPocket({ part, fabricImage }: { part: PartState; fabricImage: string }) {
  const s = 0.12 + 0.12 * ((part.params.size ?? 50) / 100);
  if (part.preset === 'cargo') {
    return (
      <>
        {[1, -1].map(side => (
          <mesh key={side} position={[side * 0.34, -0.15, 0.1]} rotation={[0, side * 0.5, 0]}>
            <boxGeometry args={[s * 1.2, s * 1.4, 0.05]} />
            <FabricMat image={fabricImage} color={part.color} repeat={6} />
          </mesh>
        ))}
      </>
    );
  }
  if (part.preset === 'coin') {
    return (
      <mesh position={[0.14, 0.42, 0.28]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[s * 0.6, s * 0.5, 0.02]} />
        <FabricMat image={fabricImage} color={part.color} repeat={8} />
      </mesh>
    );
  }
  // side pockets
  return (
    <>
      {[1, -1].map(side => (
        <mesh key={side} position={[side * 0.3, 0.32, 0.16]} rotation={[0, side * 0.35, side * -0.35]}>
          <boxGeometry args={[0.02, s * 1.2, 0.06]} />
          <SolidMat color="#3E3A34" />
        </mesh>
      ))}
    </>
  );
}

// ─── Skirt parts ─────────────────────────────────────────────────────────────
function SkirtBody({ part, waistPart, fabricImage }: { part: PartState; waistPart: PartState; fabricImage: string }) {
  const len01 = ((part.params.length ?? 65) - 20) / 80;
  const flare01 = (part.params.flare ?? 55) / 100;
  const layers = Math.round(part.params.layers ?? 1);
  const rise = (waistPart.params.rise ?? 70) / 100;
  const topY = 0.42 + 0.14 * rise - 0.03;
  const skLen = 0.55 + 1.15 * Math.max(0, len01);
  const hemR = 0.43 + 0.85 * flare01;

  const geos = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (let i = 0; i < layers; i++) {
      const f = 1 - i * (0.55 / Math.max(1, layers)); // ชั้นในสั้นกว่า
      const L = skLen * (i === 0 ? 1 : 1 - i * 0.22);
      const r = 0.43 + (hemR - 0.43) * f + i * 0.03;
      let g = lathe([[0.42, 0], [0.44 + (r - 0.44) * 0.35, -L * 0.4], [r, -L]], 48, 0.95);
      if (part.preset === 'pleated') g = ripple(g, 26, 0.03);
      out.push(g);
    }
    return out;
  }, [layers, skLen, hemR, part.preset]);

  return (
    <group position={[0, topY, 0]}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <FabricMat image={fabricImage} color={part.color} repeat={3 + i} />
        </mesh>
      ))}
      {part.preset === 'wrap' && (
        <mesh position={[0.2, -skLen * 0.5, 0.36]} rotation={[0, 0.25, 0.06]}>
          <boxGeometry args={[0.03, skLen * 0.92, 0.02]} />
          <SolidMat color="#3E3A34" />
        </mesh>
      )}
      <DecorationRings part={part} radius={hemR * 0.97} y={-skLen + 0.1} zScale={0.95} />
    </group>
  );
}

function SkirtHem({ part, bodyPart, waistPart, fabricImage }: {
  part: PartState; bodyPart: PartState; waistPart: PartState; fabricImage: string;
}) {
  const len01 = ((bodyPart.params.length ?? 65) - 20) / 80;
  const flare01 = (bodyPart.params.flare ?? 55) / 100;
  const rise = (waistPart.params.rise ?? 70) / 100;
  const topY = 0.42 + 0.14 * rise - 0.03;
  const skLen = 0.55 + 1.15 * Math.max(0, len01);
  const hemR = 0.43 + 0.85 * flare01;
  const gold = part.preset === 'goldtrim';
  return (
    <group position={[0, topY - skLen, 0]}>
      <mesh rotation={[Math.PI / 2 + (part.preset === 'asym' ? 0.2 : 0), 0, 0]} scale={[1, 0.95, 1]}>
        <torusGeometry args={[hemR * 1.005, part.preset === 'ruffle' ? 0.05 : 0.03, 10, 56]} />
        {gold
          ? <SolidMat color="#D4AF37" metalness={0.85} roughness={0.25} />
          : <FabricMat image={fabricImage} color={part.color} repeat={6} />}
      </mesh>
    </group>
  );
}

// ─── Assembly ────────────────────────────────────────────────────────────────
export function GarmentAssembly({ garment }: { garment: GarmentState }) {
  const bodyKey = garment.type === 'pants' ? 'waistband' : 'body';
  const bodyFabric = garment.parts[bodyKey]?.fabricId;
  const img = (p: PartState) => fabricById(p.fabricId ?? bodyFabric).image;
  const P = garment.parts;
  const def = (id: string) => componentDef(garment.type, id);
  const vis = (id: string) => isPartVisible(garment, id);
  const popKey = (id: string) => `${P[id]?.preset}`;

  if (garment.type === 'shirt') {
    return (
      <group position={[0, 0.15, 0]}>
        {vis('body') && (
          <Part partId="body" explode={def('body')?.explode} popKey={popKey('body')}>
            <ShirtBody part={P.body} fabricImage={img(P.body)} />
          </Part>
        )}
        {vis('collar') && (
          <Part partId="collar" explode={def('collar')?.explode} popKey={popKey('collar')}>
            <Collar part={P.collar} fabricImage={img(P.collar)} />
          </Part>
        )}
        {vis('placket') && P.placket.preset !== 'none' && (
          <Part partId="placket" explode={def('placket')?.explode} popKey={popKey('placket')}>
            <Placket part={P.placket} bodyPart={P.body} fabricImage={img(P.placket)} />
          </Part>
        )}
        {vis('buttons') && (
          <Part partId="buttons" explode={def('buttons')?.explode} popKey={popKey('buttons') + P.buttons.params.count}>
            <Buttons part={P.buttons} bodyPart={P.body} />
          </Part>
        )}
        {vis('sleeveL') && (
          <Part partId="sleeveL" explode={def('sleeveL')?.explode} popKey={popKey('sleeveL')}>
            <Sleeve part={P.sleeveL} fabricImage={img(P.sleeveL)} side={1} />
          </Part>
        )}
        {vis('sleeveR') && (
          <Part partId="sleeveR" explode={def('sleeveR')?.explode} popKey={popKey('sleeveR')}>
            <Sleeve part={P.sleeveR} fabricImage={img(P.sleeveR)} side={-1} />
          </Part>
        )}
        {vis('pocket') && (
          <Part partId="pocket" explode={def('pocket')?.explode} popKey={popKey('pocket')}>
            <ChestPocket part={P.pocket} fabricImage={img(P.pocket)} />
          </Part>
        )}
        {vis('hem') && (
          <Part partId="hem" explode={def('hem')?.explode} popKey={popKey('hem')}>
            <ShirtHem part={P.hem} bodyPart={P.body} fabricImage={img(P.hem)} />
          </Part>
        )}
      </group>
    );
  }

  if (garment.type === 'pants') {
    return (
      <group position={[0, 0.35, 0]}>
        {vis('waistband') && (
          <Part partId="waistband" explode={def('waistband')?.explode} popKey={popKey('waistband')}>
            <Waistband part={P.waistband} fabricImage={img(P.waistband)} />
          </Part>
        )}
        {vis('legL') && (
          <Part partId="legL" explode={def('legL')?.explode} popKey={popKey('legL')}>
            <PantsLeg part={P.legL} hipPart={P.waistband} fabricImage={img(P.legL)} side={1} />
          </Part>
        )}
        {vis('legR') && (
          <Part partId="legR" explode={def('legR')?.explode} popKey={popKey('legR')}>
            <PantsLeg part={P.legR} hipPart={P.waistband} fabricImage={img(P.legR)} side={-1} />
          </Part>
        )}
        {vis('pocket') && (
          <Part partId="pocket" explode={def('pocket')?.explode} popKey={popKey('pocket')}>
            <PantsPocket part={P.pocket} fabricImage={img(P.pocket)} />
          </Part>
        )}
      </group>
    );
  }

  // skirt
  return (
    <group position={[0, 0.35, 0]}>
      {vis('waistband') && (
        <Part partId="waistband" explode={def('waistband')?.explode} popKey={popKey('waistband')}>
          <Waistband part={P.waistband} fabricImage={img(P.waistband)} />
        </Part>
      )}
      {vis('body') && (
        <Part partId="body" explode={def('body')?.explode} popKey={popKey('body') + P.body.params.layers}>
          <SkirtBody part={P.body} waistPart={P.waistband} fabricImage={img(P.body)} />
        </Part>
      )}
      {vis('hem') && (
        <Part partId="hem" explode={def('hem')?.explode} popKey={popKey('hem')}>
          <SkirtHem part={P.hem} bodyPart={P.body} waistPart={P.waistband} fabricImage={img(P.hem)} />
        </Part>
      )}
    </group>
  );
}

// ─── Avatar (mannequin) ──────────────────────────────────────────────────────
export function Avatar({ type }: { type: GarmentState['type'] }) {
  const build = useCreator(s => s.avatarBuild);
  const s = 0.9 + 0.25 * (build / 100);
  const skin = '#D9CFC4';
  const showLegs = type !== 'shirt';
  return (
    <group scale={[s, 1, s]}>
      {/* หัว + คอ */}
      <mesh position={[0, 1.32, 0]}>
        <sphereGeometry args={[0.155, 24, 20]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.06, 0.075, 0.22, 16]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      {/* ลำตัว (บางกว่าเสื้อเล็กน้อย) */}
      <mesh position={[0, 0.45, 0]} scale={[1, 1, 0.6]}>
        <capsuleGeometry args={[0.36, 0.7, 8, 20]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      {/* แขน */}
      {[1, -1].map(side => (
        <mesh key={side} position={[side * 0.48, 0.35, 0]} rotation={[0, 0, side * -0.18]}>
          <capsuleGeometry args={[0.075, 0.85, 6, 14]} />
          <meshStandardMaterial color={skin} roughness={0.9} />
        </mesh>
      ))}
      {/* ขา */}
      {showLegs && [1, -1].map(side => (
        <mesh key={side} position={[side * 0.17, -0.85, 0]}>
          <capsuleGeometry args={[0.1, 1.15, 6, 14]} />
          <meshStandardMaterial color={skin} roughness={0.9} />
        </mesh>
      ))}
      {/* ขาตั้งหุ่น */}
      <mesh position={[0, showLegs ? -1.62 : -1.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, showLegs ? 0.25 : 0.9, 12]} />
        <meshStandardMaterial color="#9A938A" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, showLegs ? -1.75 : -1.75, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.04, 24]} />
        <meshStandardMaterial color="#9A938A" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}
