'use client';

/**
 * GarmentCanvas — พรีวิวเสื้อผ้าแบบ interactive
 * ทุกชิ้นส่วน (part) คลิกเลือกได้: hover = ขอบน้ำเงิน, เลือก = ขอบทอง
 * รูปทรงวาดแบบ parametric ตามค่า config จริง (คอ/แขน/ความยาว/กระเป๋า ฯลฯ)
 */

import { useMemo } from 'react';
import {
  DesignState, fabricOf, colorOf, FABRICS,
  showCuffSection, showButtonSection,
} from './data';

export type CanvasView = 'front' | 'back';

interface GarmentCanvasProps {
  state: DesignState;
  view: CanvasView;
  flip?: boolean;
  selectedPart: string | null;
  hoveredPart: string | null;
  onSelect: (part: string) => void;
  onHover: (part: string | null) => void;
}

interface PartShape {
  key: string;
  /** path หลัก (คลิกได้ + เติมลายผ้า) */
  d?: string;
  /** element ประกอบเพิ่ม (เส้น/จุด ไม่รับ event) */
  extras?: React.ReactNode;
  /** ใช้สีทึบแทนลายผ้า (เช่น กระดุม) */
  solidFill?: string;
  /** ไม่เติมลายผ้า (โครงเส้นอย่างเดียว) */
  outlineOnly?: boolean;
}

// ─── Shirt geometry ──────────────────────────────────────────────────────────
const SLEEVE_RATIO: Record<string, number> = {
  sleeveless: 0, short: 0.3, elbow: 0.48, threeq: 0.66, long: 0.85,
  balloon: 0.85, puff: 0.85, bishop: 0.85, bell: 0.85, raglan: 0.85,
};

function shirtHemY(garmentType: string): number {
  return { shirt: 190, jacket: 198, blouse: 186, polo: 186, dress: 232 }[garmentType] ?? 190;
}

function hemEdge(hem: string, hemY: number, x1: number, x2: number): string {
  // เส้นชายเสื้อ จากขวา (x2) ไปซ้าย (x1)
  switch (hem) {
    case 'rounded': return `L${x2} ${hemY - 8} Q${x2} ${hemY} ${x2 - 12} ${hemY} L${x1 + 12} ${hemY} Q${x1} ${hemY} ${x1} ${hemY - 8}`;
    case 'highlow': return `L${x2} ${hemY + 8} Q${(x1 + x2) / 2} ${hemY - 14} ${x1} ${hemY + 8}`;
    case 'curved': return `L${x2} ${hemY - 4} Q${(x1 + x2) / 2} ${hemY + 10} ${x1} ${hemY - 4}`;
    default: return `L${x2} ${hemY} L${x1} ${hemY}`;
  }
}

function buildShirtParts(state: DesignState, view: CanvasView): PartShape[] {
  const s = state.shirt;
  const hemY = shirtHemY(s.garmentType);
  const drop = s.shoulder === 'drop' ? 6 : 0;
  const shoulderY = 46 + drop;
  const armY = 52 + drop;
  const isBack = view === 'back';
  const parts: PartShape[] = [];

  // ลำตัว
  const neckTop = isBack
    ? `L80 ${shoulderY - 6} Q100 ${shoulderY} 120 ${shoulderY - 6}`
    : `L80 ${shoulderY - 6} Q100 ${shoulderY + 8} 120 ${shoulderY - 6}`;
  const bodyD =
    `M62 ${armY} ${neckTop} L138 ${armY} L138 ${hemY - 10} ` +
    hemEdge(s.hem, hemY, 62, 138) + ` Z`;

  // แรกลัน: เส้นตะเข็บเฉียง
  const raglanSeams = (s.shoulder === 'raglan' || s.sleeves === 'raglan') ? (
    <>
      <path d={`M80 ${shoulderY - 4} L62 ${armY + 18}`} stroke="#1B2A4A" strokeOpacity="0.25" strokeWidth="1" fill="none" />
      <path d={`M120 ${shoulderY - 4} L138 ${armY + 18}`} stroke="#1B2A4A" strokeOpacity="0.25" strokeWidth="1" fill="none" />
    </>
  ) : null;
  const structuredLines = s.shoulder === 'structured' ? (
    <>
      <path d={`M62 ${armY} L80 ${shoulderY - 7}`} stroke="#1B2A4A" strokeOpacity="0.4" strokeWidth="2.4" fill="none" />
      <path d={`M138 ${armY} L120 ${shoulderY - 7}`} stroke="#1B2A4A" strokeOpacity="0.4" strokeWidth="2.4" fill="none" />
    </>
  ) : null;
  parts.push({ key: 'body', d: bodyD, extras: <>{raglanSeams}{structuredLines}</> });

  // แขนเสื้อ
  const ratio = SLEEVE_RATIO[s.sleeves] ?? 0.85;
  if (ratio > 0) {
    const endY = armY + ratio * 165;
    const bulge = ['balloon', 'puff'].includes(s.sleeves) ? 16 : s.sleeves === 'bishop' ? 12 : 0;
    const bellFlare = s.sleeves === 'bell' ? 12 : 0;
    const gathered = ['balloon', 'bishop', 'puff'].includes(s.sleeves);
    const endOuterR = 168 + bellFlare - (gathered ? 6 : 0);
    const endInnerR = 146 - bellFlare * 0.3 + (gathered ? 4 : 0);
    const midY = (armY + endY) / 2;

    const rightSleeve =
      `M138 ${armY} L162 ${armY + 10} ` +
      (bulge
        ? `Q${172 + bulge} ${midY} ${endOuterR} ${endY} L${endInnerR} ${endY} Q${152 - bulge * 0.4} ${midY} 140 ${armY + 24} Z`
        : `L${endOuterR} ${endY} L${endInnerR} ${endY} L140 ${armY + 24} Z`);
    const leftSleeve =
      `M62 ${armY} L38 ${armY + 10} ` +
      (bulge
        ? `Q${28 - bulge} ${midY} ${200 - endOuterR} ${endY} L${200 - endInnerR} ${endY} Q${48 + bulge * 0.4} ${midY} 60 ${armY + 24} Z`
        : `L${200 - endOuterR} ${endY} L${200 - endInnerR} ${endY} L60 ${armY + 24} Z`);

    parts.push({ key: 'sleeves', d: `${rightSleeve} ${leftSleeve}` });

    // ข้อมือ
    if (showCuffSection(s) && s.cuff !== 'plain' && ratio >= 0.6) {
      const cuffD =
        `M${endInnerR - 2} ${endY} L${endOuterR + 2} ${endY} L${endOuterR + 1} ${endY + 10} L${endInnerR - 1} ${endY + 10} Z ` +
        `M${200 - endOuterR - 2} ${endY} L${200 - endInnerR + 2} ${endY} L${200 - endInnerR + 1} ${endY + 10} L${200 - endOuterR - 1} ${endY + 10} Z`;
      const cuffMarks = s.cuff === 'button' ? (
        <>
          <circle cx={(endInnerR + endOuterR) / 2} cy={endY + 5} r="1.8" fill="#1B2A4A" opacity="0.6" />
          <circle cx={200 - (endInnerR + endOuterR) / 2} cy={endY + 5} r="1.8" fill="#1B2A4A" opacity="0.6" />
        </>
      ) : s.cuff === 'elastic' ? (
        <>
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1={endInnerR + 3 + i * 5} y1={endY + 2} x2={endInnerR + 3 + i * 5} y2={endY + 8}
              stroke="#1B2A4A" strokeOpacity="0.3" strokeWidth="0.8" />
          ))}
        </>
      ) : s.cuff === 'french' ? (
        <>
          <line x1={endInnerR} y1={endY + 5} x2={endOuterR} y2={endY + 5} stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="0.8" />
          <line x1={200 - endOuterR} y1={endY + 5} x2={200 - endInnerR} y2={endY + 5} stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="0.8" />
        </>
      ) : null;
      parts.push({ key: 'cuffs', d: cuffD, extras: cuffMarks });
    }
  }

  // คอ / ปกเสื้อ
  if (s.collar !== 'none' && !isBack) {
    const collarShapes: Record<string, string> = {
      mandarin: `M78 ${shoulderY - 12} Q100 ${shoulderY - 2} 122 ${shoulderY - 12} L122 ${shoulderY - 5} Q100 ${shoulderY + 6} 78 ${shoulderY - 5} Z`,
      stand: `M78 ${shoulderY - 16} Q100 ${shoulderY - 6} 122 ${shoulderY - 16} L122 ${shoulderY - 5} Q100 ${shoulderY + 6} 78 ${shoulderY - 5} Z`,
      shirt: `M80 ${shoulderY - 8} L100 ${shoulderY + 12} L86 ${shoulderY - 16} Z M120 ${shoulderY - 8} L100 ${shoulderY + 12} L114 ${shoulderY - 16} Z`,
      spread: `M78 ${shoulderY - 8} L100 ${shoulderY + 10} L72 ${shoulderY - 14} Z M122 ${shoulderY - 8} L100 ${shoulderY + 10} L128 ${shoulderY - 14} Z`,
      round: `M82 ${shoulderY - 6} Q100 ${shoulderY + 8} 118 ${shoulderY - 6} Q100 ${shoulderY + 14} 82 ${shoulderY - 6} Z`,
      v: `M84 ${shoulderY - 6} L100 ${shoulderY + 26} L116 ${shoulderY - 6} L112 ${shoulderY - 6} L100 ${shoulderY + 18} L88 ${shoulderY - 6} Z`,
      boat: `M70 ${shoulderY - 6} Q100 ${shoulderY + 2} 130 ${shoulderY - 6} Q100 ${shoulderY + 8} 70 ${shoulderY - 6} Z`,
      square: `M84 ${shoulderY - 6} L84 ${shoulderY + 14} L116 ${shoulderY + 14} L116 ${shoulderY - 6} L111 ${shoulderY - 6} L111 ${shoulderY + 9} L89 ${shoulderY + 9} L89 ${shoulderY - 6} Z`,
      sweetheart: `M84 ${shoulderY - 6} Q92 ${shoulderY + 12} 100 ${shoulderY + 4} Q108 ${shoulderY + 12} 116 ${shoulderY - 6} L100 ${shoulderY + 22} Z`,
      offshoulder: `M56 ${armY + 2} L144 ${armY + 2} L144 ${armY + 12} L56 ${armY + 12} Z`,
      halter: `M90 ${shoulderY - 4} L98 ${shoulderY - 26} L102 ${shoulderY - 26} L110 ${shoulderY - 4} L104 ${shoulderY - 4} L100 ${shoulderY - 18} L96 ${shoulderY - 4} Z`,
      hood: `M76 ${shoulderY - 4} C68 ${shoulderY - 42} 132 ${shoulderY - 42} 124 ${shoulderY - 4} L116 ${shoulderY - 6} C120 ${shoulderY - 32} 80 ${shoulderY - 32} 84 ${shoulderY - 6} Z`,
    };
    const d = collarShapes[s.collar];
    if (d) parts.push({ key: 'collar', d });
  } else if (s.collar !== 'none' && isBack) {
    parts.push({ key: 'collar', d: `M80 ${shoulderY - 12} Q100 ${shoulderY - 4} 120 ${shoulderY - 12} L120 ${shoulderY - 5} Q100 ${shoulderY + 2} 80 ${shoulderY - 5} Z` });
  }

  // สาบหน้า (เฉพาะด้านหน้า)
  if (s.opening !== 'none' && !isBack) {
    const topY = shoulderY + 12;
    const botY = hemY - 8;
    const placketD = `M96 ${topY} L104 ${topY} L104 ${botY} L96 ${botY} Z`;
    let marks: React.ReactNode = null;
    if (s.opening === 'zipper') {
      marks = (
        <>
          <line x1="100" y1={topY} x2="100" y2={botY} stroke="#1B2A4A" strokeOpacity="0.5" strokeWidth="1" />
          {Array.from({ length: Math.floor((botY - topY) / 8) }).map((_, i) => (
            <line key={i} x1="98" y1={topY + 4 + i * 8} x2="102" y2={topY + 4 + i * 8} stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="0.8" />
          ))}
        </>
      );
    } else if (s.opening === 'hidden') {
      marks = <line x1="100" y1={topY} x2="100" y2={botY} stroke="#1B2A4A" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="4 3" />;
    } else if (s.opening === 'wrap') {
      marks = <path d={`M84 ${topY + 4} L124 ${botY - 6}`} stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="1.2" fill="none" />;
    } else {
      marks = <line x1="100" y1={topY} x2="100" y2={botY} stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="1" />;
    }
    parts.push({ key: 'placket', d: placketD, extras: marks });

    // กระดุม
    if (showButtonSection(s) && ['button', 'hidden'].includes(s.opening)) {
      const r = { s: 2, m: 2.6, l: 3.3 }[s.buttonSize] ?? 2.6;
      const count = 5;
      const gap = (botY - topY - 16) / (count - 1);
      const circles = Array.from({ length: count }).map((_, i) => {
        const cy = topY + 8 + i * gap;
        if (s.buttonShape === 'square') {
          return <rect key={i} x={100 - r} y={cy - r} width={r * 2} height={r * 2} fill={s.buttonColor} stroke="#1B2A4A" strokeOpacity="0.4" strokeWidth="0.5" />;
        }
        return <circle key={i} cx="100" cy={cy} r={r} fill={s.buttonColor} stroke="#1B2A4A" strokeOpacity="0.4" strokeWidth="0.5" />;
      });
      parts.push({
        key: 'buttons',
        d: `M${100 - r - 2} ${topY + 4} L${100 + r + 2} ${topY + 4} L${100 + r + 2} ${botY - 4} L${100 - r - 2} ${botY - 4} Z`,
        outlineOnly: true,
        extras: circles,
      });
    }
  }

  // กระเป๋า
  if (s.pockets.length > 0 && !isBack) {
    const locRect: Record<string, [number, number]> = {
      chest: [106, 86],
      left: [70, hemY - 46],
      right: [106, hemY - 46],
      lower: [88, hemY - 36],
      sleeve: [148, 104],
    };
    const w = 24, h = 19;
    const ds: string[] = [];
    const extras: React.ReactNode[] = [];
    s.pockets.forEach((pk, i) => {
      const [x, y] = locRect[pk.location] ?? locRect.left;
      if (pk.type === 'welt') {
        ds.push(`M${x} ${y + 4} L${x + w} ${y + 4} L${x + w} ${y + 9} L${x} ${y + 9} Z`);
      } else if (pk.type === 'hidden') {
        extras.push(<path key={`h${i}`} d={`M${x} ${y + 4} L${x + w} ${y + 4}`} stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 2" fill="none" />);
        ds.push(`M${x} ${y} L${x + w} ${y} L${x + w} ${y + 8} L${x} ${y + 8} Z`);
      } else {
        ds.push(`M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} Q${x + w} ${y + h + 3} ${x + w - 4} ${y + h + 3} L${x + 4} ${y + h + 3} Q${x} ${y + h + 3} ${x} ${y + h} Z`);
        if (pk.type === 'flap') {
          extras.push(<path key={`f${i}`} d={`M${x - 1} ${y} L${x + w + 1} ${y} L${x + w + 1} ${y + 6} L${x + w / 2} ${y + 9} L${x - 1} ${y + 6} Z`}
            fill="#1B2A4A" opacity="0.15" stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="0.7" />);
        }
      }
    });
    parts.push({ key: 'pocket', d: ds.join(' '), extras: <>{extras}</> });
  }

  // ชายเสื้อ (แถบล่าง + ผ่าข้าง)
  const hemBandTop = hemY - 10;
  const hemD = `M62 ${hemBandTop} L138 ${hemBandTop} L138 ${hemY - 10} ` + hemEdge(s.hem, hemY, 62, 138) + ' Z';
  const slitLen = s.slitOn ? Math.min(30, s.slitLength * 1.4) : 0;
  const slitMarks = s.slitOn ? (
    <>
      <line x1="62" y1={hemY - slitLen} x2="62" y2={hemY} stroke="#FFFFFF" strokeWidth="2.4" />
      <line x1="138" y1={hemY - slitLen} x2="138" y2={hemY} stroke="#FFFFFF" strokeWidth="2.4" />
    </>
  ) : null;
  parts.push({ key: 'hem', d: hemD, extras: slitMarks });

  return parts;
}

// ─── Pants geometry ──────────────────────────────────────────────────────────
const PANT_HEM_Y = [128, 172, 200, 220, 238];

function buildPantsParts(state: DesignState, view: CanvasView): PartShape[] {
  const p = state.pants;
  const isBack = view === 'back';
  const waistY = { high: 26, mid: 34, low: 40 }[p.waist] ?? 30;
  const bandB = waistY + 12;
  const hemY = PANT_HEM_Y[p.length] ?? 220;
  const halfW = 7 + (p.legOpening / 100) * 25;
  const crotchY = bandB + 62;
  const parts: PartShape[] = [];

  // ขากางเกง (ชิ้นเดียวสองขา)
  const leftLeg = `M60 ${bandB} L100 ${bandB} L100 ${crotchY} L${80 + halfW} ${hemY} L${Math.max(46, 80 - halfW)} ${hemY} Z`;
  const rightLeg = `M100 ${bandB} L140 ${bandB} L${Math.min(154, 120 + halfW)} ${hemY} L${120 - halfW} ${hemY} L100 ${crotchY} Z`;
  const pleatLines = p.pleats !== 'none' ? (
    <>
      <line x1="86" y1={bandB} x2="85" y2={bandB + 26} stroke="#1B2A4A" strokeOpacity="0.3" strokeWidth="0.9" />
      <line x1="114" y1={bandB} x2="115" y2={bandB + 26} stroke="#1B2A4A" strokeOpacity="0.3" strokeWidth="0.9" />
      {p.pleats === 'double' && (
        <>
          <line x1="92" y1={bandB} x2="91" y2={bandB + 22} stroke="#1B2A4A" strokeOpacity="0.3" strokeWidth="0.9" />
          <line x1="108" y1={bandB} x2="109" y2={bandB + 22} stroke="#1B2A4A" strokeOpacity="0.3" strokeWidth="0.9" />
        </>
      )}
    </>
  ) : null;
  parts.push({ key: 'body', d: `${leftLeg} ${rightLeg}`, extras: pleatLines });

  // ขอบเอว
  const wbD = `M58 ${waistY} L142 ${waistY} L142 ${bandB} L58 ${bandB} Z`;
  let wbMarks: React.ReactNode = null;
  if (p.waistband === 'belt') {
    wbMarks = (
      <>
        {[66, 84, 112, 130].map(x => (
          <rect key={x} x={x} y={waistY - 2} width="4" height={bandB - waistY + 4} fill="none" stroke="#1B2A4A" strokeOpacity="0.4" strokeWidth="0.8" />
        ))}
      </>
    );
  } else if (p.waistband === 'drawstring') {
    wbMarks = (
      <>
        <path d={`M96 ${bandB} L93 ${bandB + 14}`} stroke="#1B2A4A" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
        <path d={`M104 ${bandB} L107 ${bandB + 14}`} stroke="#1B2A4A" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
      </>
    );
  } else if (p.waistband === 'elastic') {
    wbMarks = (
      <>
        {[64, 74, 84, 94, 104, 114, 124, 134].map(x => (
          <line key={x} x1={x} y1={waistY + 2} x2={x} y2={bandB - 2} stroke="#1B2A4A" strokeOpacity="0.25" strokeWidth="0.8" />
        ))}
      </>
    );
  } else {
    wbMarks = <circle cx="100" cy={(waistY + bandB) / 2} r="2.2" fill="#1B2A4A" opacity="0.55" />;
  }
  parts.push({ key: 'waistband', d: wbD, extras: wbMarks });

  // ซิป/กระดุมหน้า (fly) — ด้านหน้าเท่านั้น (ผูกกับ waistband แต่วาดเป็นเส้น)
  if (!isBack) {
    const flyMarks = p.fly === 'zip' ? (
      <>
        <line x1="100" y1={bandB} x2="100" y2={bandB + 26} stroke="#1B2A4A" strokeOpacity="0.4" strokeWidth="1" />
        {[6, 12, 18].map(dy => <line key={dy} x1="98.5" y1={bandB + dy} x2="101.5" y2={bandB + dy} stroke="#1B2A4A" strokeOpacity="0.3" strokeWidth="0.8" />)}
      </>
    ) : p.fly === 'buttons' ? (
      <>
        {[7, 15, 23].map(dy => <circle key={dy} cx="100" cy={bandB + dy} r="1.6" fill="#1B2A4A" opacity="0.5" />)}
      </>
    ) : (
      <line x1="100" y1={bandB} x2="100" y2={bandB + 26} stroke="#1B2A4A" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />
    );
    parts.push({ key: 'waistband-fly', extras: flyMarks });
  }

  // กระเป๋า
  const pocketExtras: React.ReactNode[] = [];
  const pocketDs: string[] = [];
  if (!isBack && p.pocketFront) {
    pocketExtras.push(
      <path key="pfl" d={`M62 ${bandB + 2} Q78 ${bandB + 8} 78 ${bandB + 26}`} stroke="#1B2A4A" strokeOpacity="0.4" strokeWidth="1" fill="none" />,
      <path key="pfr" d={`M138 ${bandB + 2} Q122 ${bandB + 8} 122 ${bandB + 26}`} stroke="#1B2A4A" strokeOpacity="0.4" strokeWidth="1" fill="none" />,
    );
    pocketDs.push(`M60 ${bandB + 2} Q78 ${bandB + 8} 78 ${bandB + 28} L60 ${bandB + 28} Z`);
    pocketDs.push(`M140 ${bandB + 2} Q122 ${bandB + 8} 122 ${bandB + 28} L140 ${bandB + 28} Z`);
  }
  if (isBack && p.pocketBack) {
    pocketDs.push(`M68 ${bandB + 8} L92 ${bandB + 8} L91 ${bandB + 24} L69 ${bandB + 24} Z`);
    pocketDs.push(`M108 ${bandB + 8} L132 ${bandB + 8} L131 ${bandB + 24} L109 ${bandB + 24} Z`);
  }
  if (!isBack && p.pocketCoin) {
    pocketDs.push(`M108 ${bandB + 3} L122 ${bandB + 3} L122 ${bandB + 12} L108 ${bandB + 12} Z`);
  }
  if (p.pocketCargo) {
    const cx = 120 + halfW * 0.45;
    const cy = (crotchY + hemY) / 2 - 10;
    pocketDs.push(`M${cx - 12} ${cy} L${cx + 12} ${cy} L${cx + 12} ${cy + 24} L${cx - 12} ${cy + 24} Z`);
    pocketExtras.push(
      <path key="cargo-flap" d={`M${cx - 13} ${cy} L${cx + 13} ${cy} L${cx + 13} ${cy + 7} L${cx - 13} ${cy + 7} Z`}
        fill="#1B2A4A" opacity="0.12" stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="0.7" />,
    );
  }
  if (pocketDs.length || pocketExtras.length) {
    parts.push({ key: 'pocket', d: pocketDs.join(' ') || undefined, extras: <>{pocketExtras}</> });
  }

  // ปลายขา
  if (p.length > 0 && p.cuff !== 'plain') {
    const cuffH = 9;
    const cuffD =
      `M${Math.max(46, 80 - halfW)} ${hemY - cuffH} L${80 + halfW} ${hemY - cuffH} L${80 + halfW} ${hemY} L${Math.max(46, 80 - halfW)} ${hemY} Z ` +
      `M${120 - halfW} ${hemY - cuffH} L${Math.min(154, 120 + halfW)} ${hemY - cuffH} L${Math.min(154, 120 + halfW)} ${hemY} L${120 - halfW} ${hemY} Z`;
    const cuffMarks = p.cuff === 'fold' ? (
      <>
        <line x1={Math.max(46, 80 - halfW)} y1={hemY - cuffH - 2} x2={80 + halfW} y2={hemY - cuffH - 2} stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="1" />
        <line x1={120 - halfW} y1={hemY - cuffH - 2} x2={Math.min(154, 120 + halfW)} y2={hemY - cuffH - 2} stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="1" />
      </>
    ) : (
      <>
        {[-8, -3, 2, 7].map(dx => (
          <g key={dx}>
            <line x1={80 + dx} y1={hemY - cuffH + 2} x2={80 + dx} y2={hemY - 2} stroke="#1B2A4A" strokeOpacity="0.25" strokeWidth="0.8" />
            <line x1={120 + dx} y1={hemY - cuffH + 2} x2={120 + dx} y2={hemY - 2} stroke="#1B2A4A" strokeOpacity="0.25" strokeWidth="0.8" />
          </g>
        ))}
      </>
    );
    parts.push({ key: 'cuffs', d: cuffD, extras: cuffMarks });
  }

  return parts;
}

// ─── Skirt geometry ──────────────────────────────────────────────────────────
interface SkirtShapeParam { spread: number; hemY: number; mermaid?: boolean }
const SKIRT_PARAMS: Record<string, SkirtShapeParam> = {
  pencil: { spread: -4, hemY: 195 },
  aline: { spread: 26, hemY: 195 },
  pleated: { spread: 20, hemY: 195 },
  circle: { spread: 48, hemY: 205 },
  mermaid: { spread: 44, hemY: 225, mermaid: true },
  wrap: { spread: 24, hemY: 195 },
  tiered: { spread: 26, hemY: 200 },
  mini: { spread: 16, hemY: 135 },
  midi: { spread: 22, hemY: 190 },
  maxi: { spread: 30, hemY: 240 },
};

function skirtHemEdge(hem: string, hemY: number, x1: number, x2: number): string {
  const w = x2 - x1;
  switch (hem) {
    case 'wave':
      return `L${x2} ${hemY} Q${x2 - w / 6} ${hemY + 9} ${x2 - w / 3} ${hemY} Q${x2 - w / 2} ${hemY + 9} ${x1 + w / 3} ${hemY} Q${x1 + w / 6} ${hemY + 9} ${x1} ${hemY}`;
    case 'scallop': {
      const seg = w / 4;
      let d = `L${x2} ${hemY}`;
      for (let i = 0; i < 4; i++) d += ` Q${x2 - seg * (i + 0.5)} ${hemY + 10} ${x2 - seg * (i + 1)} ${hemY}`;
      return d;
    }
    case 'asymmetric':
      return `L${x2} ${hemY - 2} L${x1} ${hemY - 22}`;
    default:
      return `L${x2} ${hemY} L${x1} ${hemY}`;
  }
}

function buildSkirtParts(state: DesignState): PartShape[] {
  const k = state.skirt;
  const waistY = { high: 26, mid: 32, low: 38 }[k.waist] ?? 30;
  const bandB = waistY + 13;
  const prm = SKIRT_PARAMS[k.type] ?? SKIRT_PARAMS.aline;
  const hemY = prm.hemY;
  const hemHalf = 34 + prm.spread;
  const x1 = 100 - hemHalf;
  const x2 = 100 + hemHalf;
  const parts: PartShape[] = [];

  // ตัวกระโปรง
  let bodyD: string;
  if (prm.mermaid) {
    const kneeY = bandB + (hemY - bandB) * 0.62;
    bodyD =
      `M66 ${bandB} L134 ${bandB} Q132 ${kneeY} 122 ${kneeY} Q${x2} ${hemY - 16} ${x2} ${hemY} ` +
      skirtHemEdge(k.hem, hemY, x1, x2).replace(/^L[\d.\s-]+/, '') +
      ` Q${x1} ${hemY - 16} 78 ${kneeY} Q68 ${kneeY} 66 ${bandB} Z`;
    // แบบง่าย: สร้างใหม่ให้ปิด path ถูกต้อง
    bodyD =
      `M66 ${bandB} L134 ${bandB} Q133 ${kneeY} 122 ${kneeY} Q${x2} ${hemY - 18} ${x2} ${hemY} L${x1} ${hemY} Q${x1} ${hemY - 18} 78 ${kneeY} Q67 ${kneeY} 66 ${bandB} Z`;
  } else {
    bodyD = `M66 ${bandB} L134 ${bandB} L${x2} ${hemY - 1} ` + skirtHemEdge(k.hem, hemY, x1, x2) + ' Z';
  }

  const extras: React.ReactNode[] = [];
  // จีบ
  if (k.pleats !== 'none') {
    const n = k.pleats === 'sunburst' ? 9 : 6;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const topX = 66 + t * 68;
      const botX = x1 + t * (x2 - x1);
      extras.push(<line key={`pl${i}`} x1={topX} y1={bandB} x2={botX} y2={hemY - 4}
        stroke="#1B2A4A" strokeOpacity={k.pleats === 'box' ? 0.35 : 0.22} strokeWidth={k.pleats === 'box' ? 1.1 : 0.8} />);
    }
  }
  // ชั้น (tiered/layers)
  if (k.layers > 1) {
    for (let i = 1; i < k.layers; i++) {
      const t = i / k.layers;
      const y = bandB + t * (hemY - bandB);
      const lx1 = 66 + t * (x1 - 66);
      const lx2 = 134 + t * (x2 - 134);
      extras.push(<path key={`ly${i}`} d={`M${lx1} ${y} Q100 ${y + 7} ${lx2} ${y}`}
        stroke="#1B2A4A" strokeOpacity="0.3" strokeWidth="1" fill="none" />);
    }
  }
  // ป้าย (wrap)
  if (k.type === 'wrap') {
    extras.push(<path key="wrap" d={`M88 ${bandB} L${x2 - 14} ${hemY - 8}`} stroke="#1B2A4A" strokeOpacity="0.35" strokeWidth="1.2" fill="none" />);
  }
  parts.push({ key: 'body', d: bodyD, extras: <>{extras}</> });

  // ขอบเอว
  parts.push({ key: 'waistband', d: `M64 ${waistY} L136 ${waistY} L136 ${bandB} L64 ${bandB} Z` });

  // ชายกระโปรง
  const hemBandY = prm.mermaid ? hemY - 14 : hemY - 12;
  const hx1 = x1 + (k.hem === 'asymmetric' ? 0 : 2);
  const hx2 = x2 - 2;
  parts.push({
    key: 'hem',
    d: `M${hx1} ${hemBandY} L${hx2} ${hemBandY} L${x2} ${hemY - 1} ` + skirtHemEdge(k.hem, hemY, x1, x2) + ' Z',
  });

  return parts;
}

// ─── Canvas ──────────────────────────────────────────────────────────────────
export default function GarmentCanvas({
  state, view, flip, selectedPart, hoveredPart, onSelect, onHover,
}: GarmentCanvasProps) {
  const parts = useMemo(() => {
    if (state.category === 'shirt') return buildShirtParts(state, view);
    if (state.category === 'pants') return buildPantsParts(state, view);
    return buildSkirtParts(state);
  }, [state, view]);

  // pattern ต่อผ้าที่ถูกใช้จริง
  const usedFabricIds = useMemo(() => {
    const ids = new Set<string>();
    parts.forEach(p => ids.add(fabricOf(state, normalizePartKey(p.key)).id));
    return [...ids];
  }, [parts, state]);

  return (
    <svg viewBox="0 0 200 260" className="h-full max-w-full drop-shadow-xl select-none"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      <defs>
        {usedFabricIds.map(id => {
          const f = FABRICS.find(fb => fb.id === id);
          return (
            <pattern key={id} id={`pf-${id}`} patternUnits="userSpaceOnUse" width="80" height="80">
              <image href={f?.image} width="80" height="80" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          );
        })}
      </defs>

      {parts.map(part => {
        const partKey = normalizePartKey(part.key);
        const fab = fabricOf(state, partKey);
        const col = colorOf(state, partKey);
        const isSelected = selectedPart === partKey;
        const isHovered = !isSelected && hoveredPart === partKey;
        const stroke = isSelected ? '#C5A55A' : isHovered ? '#3B82F6' : 'rgba(27,42,74,0.28)';
        const strokeWidth = isSelected ? 2.4 : isHovered ? 2 : 1;

        return (
          <g key={part.key}
            className="cursor-pointer"
            onClick={e => { e.stopPropagation(); onSelect(partKey); }}
            onMouseEnter={() => onHover(partKey)}
            onMouseLeave={() => onHover(null)}>
            {part.d && (
              <>
                <path d={part.d}
                  fill={part.solidFill ?? (part.outlineOnly ? 'transparent' : `url(#pf-${fab.id})`)}
                  stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
                {!part.outlineOnly && col && (
                  <path d={part.d} fill={col} opacity={(state.intensity / 100) * 0.35}
                    style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }} />
                )}
              </>
            )}
            {part.extras && <g style={{ pointerEvents: 'none' }}>{part.extras}</g>}
          </g>
        );
      })}
    </svg>
  );
}

/** map part ที่วาดแยก (เช่น waistband-fly) กลับไป part หลักสำหรับ selection/ผ้า */
function normalizePartKey(key: string): string {
  if (key.startsWith('waistband')) return 'waistband';
  return key;
}
