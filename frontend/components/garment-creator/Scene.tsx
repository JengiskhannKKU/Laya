'use client';

/**
 * 3D Viewport — React Three Fiber
 * หมุน/แพน/ซูมได้อิสระ + ปุ่มมุมมอง (หมุนแท่นโชว์แบบ turntable ให้เข้ากับ OrbitControls)
 */

import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { useCreator, CameraView } from './store';
import { GarmentAssembly, Avatar } from './meshes';

const VIEW_ROTATION: Record<CameraView, number> = {
  front: 0,
  right: Math.PI / 2,
  back: Math.PI,
  left: -Math.PI / 2,
  iso: -Math.PI / 7,
};

function Turntable({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const view = useCreator(s => s.view);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const target = VIEW_ROTATION[view];
    // หมุนไปทางที่ใกล้ที่สุด
    let diff = target - g.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    g.rotation.y += diff * (1 - Math.exp(-7 * dt));
  });
  return <group ref={group}>{children}</group>;
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-[#1B2A4A]">
        <div className="w-8 h-8 border-4 border-[#C5A55A] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium whitespace-nowrap">กำลังเตรียมห้องเสื้อ…</span>
      </div>
    </Html>
  );
}

export default function Scene() {
  const garment = useCreator(s => s.garment);
  const showAvatar = useCreator(s => s.showAvatar);
  const select = useCreator(s => s.select);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0.6, 0.6, 4.4], fov: 38 }}
      onPointerMissed={() => select(null)}
      className="touch-none"
    >
      {/* แสงสตูดิโอ */}
      <hemisphereLight args={['#FFF8EE', '#8A8078', 0.9]} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} color="#FFF4E0" />
      <directionalLight position={[-5, 3, -4]} intensity={0.5} color="#DCE8FF" />

      <Suspense fallback={<Loader />}>
        <Turntable>
          {showAvatar && <Avatar type={garment.type} />}
          <GarmentAssembly garment={garment} />
        </Turntable>
        <ContactShadows position={[0, -1.85, 0]} opacity={0.35} scale={7} blur={2.4} far={2.2} />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.92}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
