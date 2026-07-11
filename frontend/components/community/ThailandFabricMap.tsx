"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X, ChevronRight, ShoppingBag, Store, BookOpen } from "lucide-react";
import { fetchLiveProducts, type Product } from "@/lib/live-products";
import { fetchCommunities, type LiveCommunity } from "@/lib/communities";
import { REGIONS, PROVINCES, type Province } from "@/lib/fabric-origins";


// Build lookup: GeoJSON English name → Province
const GEO_NAME_MAP: Record<string, Province> = {};
PROVINCES.forEach((p) => { if (p.geoName) GEO_NAME_MAP[p.geoName] = p; });

// ─────────────────────────────────────────────
// Simple Mercator projection (zero dependency)
// ─────────────────────────────────────────────
function mercatorProject(
  lon: number, lat: number,
  cx: number, cy: number, scale: number
): [number, number] {
  const x = (lon - cx) * scale;
  const y = -(Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)) -
    Math.log(Math.tan(Math.PI / 4 + (cy * Math.PI / 180) / 2))) * (scale * 180 / Math.PI);
  return [x, y];
}

function coordsToPath(coords: number[][][], cx: number, cy: number, scale: number): string {
  return coords.map(ring => {
    const pts = ring.map(([lon, lat]) => mercatorProject(lon, lat, cx, cy, scale));
    return "M" + pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L") + "Z";
  }).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function featureToPath(geometry: any, cx: number, cy: number, scale: number): string {
  if (geometry.type === "Polygon") {
    return coordsToPath(geometry.coordinates, cx, cy, scale);
  } else if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((poly: number[][][]) => coordsToPath(poly, cx, cy, scale)).join("");
  }
  return "";
}

// ─────────────────────────────────────────────
// Fabric Swatch - using actual fabric pattern image
// ─────────────────────────────────────────────
function FabricSwatch({ colors, image, size = 48 }: { colors: string[]; image?: string; size?: number }) {
  if (image) {
    return (
      <div
        className="rounded-lg overflow-hidden"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }
  // Fallback to generated pattern if no image
  const [c1, c2, c3] = colors;
  const id = `p${c1.replace("#","")}_${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={id} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={c1} />
          <rect x="0" y="0" width="6" height="6" fill={c2} opacity="0.7" />
          <rect x="6" y="6" width="6" height="6" fill={c2} opacity="0.7" />
          <line x1="0" y1="0" x2="12" y2="12" stroke={c3} strokeWidth="0.8" opacity="0.5" />
          <line x1="12" y1="0" x2="0" y2="12" stroke={c3} strokeWidth="0.8" opacity="0.5" />
          <circle cx="6" cy="6" r="1.5" fill={c3} opacity="0.8" />
        </pattern>
      </defs>
      <rect width="48" height="48" rx="8" fill={`url(#${id})`} />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Image Lightbox (full screen zoom)
// ─────────────────────────────────────────────
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center animate-[fadeIn_0.2s_ease]"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", zIndex: 2000 }}
      onClick={onClose}
    >
      {/* ปุ่มปิด — ใหญ่พอสำหรับนิ้ว + safe area */}
      <button
        className="absolute z-10 flex items-center justify-center rounded-full"
        style={{
          top: "max(20px, env(safe-area-inset-top, 20px))",
          right: "max(16px, env(safe-area-inset-right, 16px))",
          width: 48,
          height: 48,
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        <X size={22} color="#fff" />
      </button>
      <img
        src={src}
        alt={alt}
        className="rounded-2xl shadow-2xl animate-[scaleIn_0.2s_ease]"
        style={{
          objectFit: "contain",
          maxWidth: "92vw",
          maxHeight: "80dvh",
          display: "block",
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <p
        className="absolute left-0 right-0 text-center text-xs px-4"
        style={{
          bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {alt}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Province Card (list view)
// ─────────────────────────────────────────────
function ProvinceCard({ province, onClick }: { province: Province; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 border-b active:bg-[#F0EBE3] transition-colors text-left"
      style={{ borderColor: "#F0EBE3" }}>
      <div className="flex-shrink-0"><FabricSwatch colors={province.colors} image={province.image} size={48} /></div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: "#1B2A4A" }}>{province.name}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: "#6B7280" }}>{province.fabric}</p>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block"
          style={{ background: REGIONS[province.region].color + "18", color: REGIONS[province.region].color }}>
          {REGIONS[province.region].label}
        </span>
        
      </div>
      <ChevronRight size={16} color="#C5A55A" />
    </button>
  );
}

// ─────────────────────────────────────────────
// Interactive GeoJSON Thailand Map
// ─────────────────────────────────────────────
// เดิม fetch จาก raw.githubusercontent.com ตรงๆ — ช้า/พังในบางเครือข่าย (external dependency ไม่มี fallback)
// เก็บไฟล์ไว้ในเครื่องเองแทน โหลดเร็วกว่าและไม่พังเวลาเน็ตหลุด/GitHub ช้า
const GEOJSON_URL = "/thai-geo/thailand-provinces.geojson";

interface GeoFeature {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geometry: any;
  properties: { name: string };
}

function ThailandGeoMap({
  regionFilter,
  onSelect,
}: {
  regionFilter: string;
  onSelect: (p: Province) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoData, setGeoData] = useState<any>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    fetch(GEOJSON_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { if (cancelled) return; setGeoData(d); setLoading(false); })
      .catch(() => { if (cancelled) return; setLoading(false); setLoadError(true); });
    return () => { cancelled = true; };
  }, [retryKey]);

  const cx = 101.5, cy = 13.2, scale = 56;
  const baseW = 520, baseH = 700;

  // viewBox changes with zoom & pan
  const viewBox = useMemo(() => {
    const w = baseW / zoom;
    const h = baseH / zoom;
    const x = -w / 2 + pan.x;
    const y = -h / 2 + pan.y;
    return `${x} ${y} ${w} ${h}`;
  }, [zoom, pan]);

  const { paths, patterns } = useMemo(() => {
    if (!geoData) return { paths: [], patterns: [] };

    const pats: React.ReactNode[] = [];
    const ps: { geoName: string; d: string; province: Province | null }[] = [];

    geoData.features.forEach((f: GeoFeature) => {
      const geoName = f.properties.name;
      const province = GEO_NAME_MAP[geoName] || null;

      // Filter by region
      if (regionFilter !== "all" && (!province || province.region !== regionFilter)) return;

      const d = featureToPath(f.geometry, cx, cy, scale);
      if (!d) return;

      const patId = `geo_${geoName.replace(/\s+/g, "_")}`;
      const [c1, c2, c3] = province
        ? province.colors
        : ["#C0B090", "#A89878", "#E8DCC8"];

      // Use image pattern if available, otherwise fallback to color pattern
      if (province?.image) {
        pats.push(
          <pattern key={patId} id={patId} patternUnits="userSpaceOnUse" width="100" height="100">
            <image href={province.image} width="100" height="100" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        );
      } else {
        pats.push(
          <pattern key={patId} id={patId} patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill={c1} />
            <rect x="0" y="0" width="4" height="4" fill={c2} opacity="0.55" />
            <rect x="4" y="4" width="4" height="4" fill={c2} opacity="0.55" />
            <line x1="0" y1="0" x2="8" y2="8" stroke={c3} strokeWidth="0.8" opacity="0.45" />
            <line x1="8" y1="0" x2="0" y2="8" stroke={c3} strokeWidth="0.6" opacity="0.3" />
          </pattern>
        );
      }

      ps.push({ geoName, d, province });
    });

    return { paths: ps, patterns: pats };
  }, [geoData, regionFilter]);

  const handleClick = useCallback((province: Province | null) => {
    if (province) onSelect(province);
  }, [onSelect]);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.4, 5));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.4, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Drag handlers for panning
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ ...pan });
    (e.target as SVGSVGElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    // Convert pixel delta to viewBox delta
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const vbW = baseW / zoom;
    const vbH = baseH / zoom;
    const dx = ((e.clientX - dragStart.x) / rect.width) * vbW;
    const dy = ((e.clientY - dragStart.y) / rect.height) * vbH;
    setPan({ x: panStart.x - dx, y: panStart.y - dy });
  };

  const handlePointerUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z * 1.15, 5));
    } else {
      setZoom(z => Math.max(z / 1.15, 0.5));
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-4 rounded-full animate-spin"
            style={{ borderColor: "#E5DFD6", borderTopColor: "#8B4513" }} />
          <p className="text-xs" style={{ color: "#9CA3AF" }}>กำลังโหลดแผนที่...</p>
        </div>
      </div>
    );
  }

  if (loadError || !geoData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center px-6">
          <p className="text-sm font-medium mb-2" style={{ color: "#6B4423" }}>โหลดแผนที่ไม่สำเร็จ</p>
          <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง</p>
          <button onClick={() => setRetryKey(k => k + 1)}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "#1B2A4A", color: "#C5A55A" }}>
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col" style={{ background: "#F0EBE3", borderRadius: 16, overflow: "hidden" }}>
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
          style={{ background: "rgba(27,42,74,0.88)", color: "#C5A55A", backdropFilter: "blur(6px)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          +
        </button>
        <button onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
          style={{ background: "rgba(27,42,74,0.88)", color: "#C5A55A", backdropFilter: "blur(6px)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          −
        </button>
        {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
          <button onClick={handleReset}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold active:scale-90 transition-transform"
            style={{ background: "rgba(27,42,74,0.88)", color: "#FFD700", backdropFilter: "blur(6px)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            ↺
          </button>
        )}
      </div>

      {/* Zoom level indicator */}
      {zoom !== 1 && (
        <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-lg text-[10px] font-semibold"
          style={{ background: "rgba(27,42,74,0.8)", color: "#C5A55A" }}>
          {Math.round(zoom * 100)}%
        </div>
      )}

      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="w-full flex-1 min-h-0"
        style={{ display: "block", cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <defs>{patterns}</defs>
        {paths.map(({ geoName, d, province }) => {
          const isHovered = hovered === geoName;
          const patId = `geo_${geoName.replace(/\s+/g, "_")}`;
          return (
            <path
              key={geoName}
              d={d}
              fill={`url(#${patId})`}
              stroke={isHovered ? "#FFD700" : "#FFFFFF"}
              strokeWidth={isHovered ? 1.8 : 0.5}
              style={{
                cursor: province ? "pointer" : "default",
                transition: "stroke-width 0.15s, opacity 0.15s",
                opacity: hovered && !isHovered ? 0.65 : 1,
                filter: isHovered ? "brightness(1.15)" : "none",
              }}
              onMouseEnter={() => setHovered(geoName)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(province)}
            />
          );
        })}
      </svg>

      {/* Hover label */}
      {hovered && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-2 rounded-xl pointer-events-none min-w-[140px] animate-[slideUp_0.2s_ease]"
          style={{ background: "rgba(27,42,74,0.95)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-bold" style={{ color: "#FFD700" }}>
              {GEO_NAME_MAP[hovered]?.name || hovered}
            </p>
          </div>
          {GEO_NAME_MAP[hovered] && (
            <div className="flex gap-2 items-center mt-1 pt-1 border-t border-white/10">
              <div className="w-6 h-6 rounded bg-gray-500 flex-shrink-0" style={{ backgroundImage: `url(${GEO_NAME_MAP[hovered].image})`, backgroundSize: "cover" }} />
              <p className="text-[10px] font-semibold truncate flex-1" style={{ color: "#C5A55A" }}>
                ลาย{GEO_NAME_MAP[hovered].fabric}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="p-2 flex-shrink-0 flex flex-wrap gap-2 justify-center border-t" style={{ borderColor: "#E5DFD6" }}>
        {Object.entries(REGIONS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: val.color }} />
            <span className="text-[10px]" style={{ color: "#6B7280" }}>{val.label.replace("ภาค","")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Province Detail Panel (Desktop SidePanel / Mobile BottomSheet)
// ─────────────────────────────────────────────
function ProvinceDetailPanel({ province, onClose }: { province: Province; onClose: () => void }) {
  const region = REGIONS[province.region];
  const [activeTab, setActiveTab] = useState<"products" | "shops" | "story">("products");

  // Data Fetching — สินค้า/ร้านค้าจริงจาก backend กรองตามจังหวัด
  const [provinceProducts, setProvinceProducts] = useState<Product[]>([]);
  const [provinceShops, setProvinceShops] = useState<LiveCommunity[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchLiveProducts({ province: province.name })
      .then((list) => { if (!cancelled) setProvinceProducts(list); })
      .catch(() => { if (!cancelled) setProvinceProducts([]); });
    fetchCommunities()
      .then((list) => { if (!cancelled) setProvinceShops(list.filter((c) => c.province === province.name)); })
      .catch(() => { if (!cancelled) setProvinceShops([]); });
    return () => { cancelled = true; };
  }, [province]);

  const renderProducts = () => (
    <div className="grid grid-cols-2 gap-3 p-4">
      {provinceProducts.length > 0 ? provinceProducts.map(p => (
        <a key={p.id} href={`/product/${p.id}`} className="bg-white rounded-xl shadow-sm border border-[#E5DFD6] overflow-hidden flex flex-col">
          <div className="h-32 bg-gray-100" style={{ backgroundImage: `url(${p.images[0]})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="p-3 flex-1 flex flex-col">
            <p className="text-xs font-bold text-[#1B2A4A] line-clamp-2 mb-1">{p.name}</p>
            <p className="text-[10px] text-[#8B4513] font-semibold mt-auto mb-2">฿{p.price.toLocaleString()}</p>
            <span className="block w-full text-center py-1.5 bg-[#1B2A4A] text-[#C5A55A] text-[10px] font-bold rounded-lg">
              ดูสินค้า
            </span>
          </div>
        </a>
      )) : (
        <div className="col-span-2 text-center py-8">
          <p className="text-xs text-[#9CA3AF]">ยังไม่มีสินค้าที่จัดจำหน่ายจากจังหวัดนี้</p>
        </div>
      )}
    </div>
  );

  const renderShops = () => (
    <div className="p-4 flex flex-col gap-3">
      {provinceShops.length > 0 ? provinceShops.map(c => (
        <a key={c.id} href={`/community/${c.id}`} className="bg-white rounded-xl p-3 border border-[#E5DFD6] flex gap-3 items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0" style={{ backgroundImage: c.image ? `url(${c.image})` : undefined, backgroundSize: "cover" }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#1B2A4A] truncate">{c.name}</p>
            <p className="text-[10px] text-[#6B7280] truncate">{c.productCount} สินค้า · {c.rating.toFixed(1)} ★ ({c.reviewCount})</p>
          </div>
        </a>
      )) : (
        <div className="text-center py-8">
          <p className="text-xs text-[#9CA3AF]">กำลังรวบรวมข้อมูลร้านค้าในพื้นที่นี้</p>
        </div>
      )}
    </div>
  );

  const renderStory = () => (
    <div className="p-4">
      {province.story ? (
        <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#E5DFD6]">
          <p className="text-[11px] font-semibold mb-2 uppercase tracking-wide text-[#9CA3AF]">ประวัติและเรื่องราว</p>
          <p className="text-sm leading-relaxed text-[#374151] mb-4">{province.story.history}</p>
          
          <p className="text-[11px] font-semibold mb-2 uppercase tracking-wide text-[#9CA3AF]">กรรมวิธีการทอ</p>
          <p className="text-sm leading-relaxed text-[#374151]">{province.story.weaving}</p>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with Image Background */}
      <div className="relative h-40 flex-shrink-0" style={{ backgroundImage: province.image ? `url(${province.image})` : `linear-gradient(135deg, ${province.colors[0]}, ${province.colors[1]})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A] to-transparent opacity-90" />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:bg-white/40">
          <X size={18} />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mb-1" style={{ background: region.color, color: "#FFF" }}>{region.label}</span>
          <h2 className="text-2xl font-bold text-white">{province.name}</h2>
          <p className="text-sm text-[#C5A55A] font-semibold truncate">ลาย{province.fabric}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5DFD6] flex-shrink-0">
        {[
          { id: "products", label: "สินค้า", icon: ShoppingBag },
          { id: "shops", label: "ร้าน/ชุมชน", icon: Store },
          { id: "story", label: "เรื่องราว", icon: BookOpen },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 flex justify-center items-center gap-1.5 text-xs font-bold transition-colors ${activeTab === tab.id ? "text-[#1B2A4A] border-b-2 border-[#1B2A4A]" : "text-[#9CA3AF]"}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content scrollable area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[100px] md:pb-0">
        {activeTab === "products" && renderProducts()}
        {activeTab === "shops" && renderShops()}
        {activeTab === "story" && renderStory()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Embeddable section — แผนที่ลายผ้าประจำจังหวัดทั่วประเทศ
// ใช้เป็นหนึ่งในเรื่องราวของผ้าในหน้า /community/heritage (เดิมเคยเป็นหน้า /map แยกต่างหาก)
// ─────────────────────────────────────────────
export default function ThailandFabricMap() {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [regionFilter, setRegionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"map" | "list">("map");

  // Filter effect logic for AI matching
  const [aiFilter, setAiFilter] = useState<string | null>(null);

  const filtered = PROVINCES.filter((p) => {
    // If AI filter active, simulate matching (e.g. pastel colors matching north)
    if (aiFilter === "pastel" && p.region !== "north") return false;
    if (aiFilter === "earth" && p.region !== "northeast") return false;

    const matchRegion = regionFilter === "all" || p.region === regionFilter;
    const matchSearch = searchQuery === "" || p.name.includes(searchQuery) || p.fabric.includes(searchQuery);
    return matchRegion && matchSearch;
  });

  return (
    <div className="relative rounded-[24px] overflow-hidden border" style={{ borderColor: "#E5DFD6" }}>
      <div className="w-full flex flex-col md:flex-row overflow-hidden relative" style={{ height: "min(78vh, 640px)" }}>

        {/* LEFT COLUMN: Map & Filters */}
        <div className="flex-1 flex flex-col h-full relative z-0">
          {/* Header */}
          <div className="flex flex-col gap-3 px-4 pt-4 pb-3 flex-shrink-0 bg-[#FAF6F0] z-10 relative">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-[#1B2A4A]">แผนที่ลายผ้าทั่วประเทศ</h1>
                <p className="text-[10px] text-[#6B7280]">ลายผ้าเอกลักษณ์ประจำจังหวัด 77 จังหวัด</p>
              </div>
              <div className="flex rounded-xl overflow-hidden border border-[#E5DFD6]">
                {(["map","list"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-bold transition-colors ${view === v ? "bg-[#1B2A4A] text-[#C5A55A]" : "bg-white text-[#6B7280]"}`}>
                    {v === "map" ? "แผนที่" : "รายการ"}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Filters (AI Matching / Colors) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setAiFilter(aiFilter === "pastel" ? null : "pastel")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${aiFilter === "pastel" ? "border-pink-300 bg-pink-50 text-pink-700" : "border-[#E5DFD6] bg-white text-[#6B7280]"}`}
              >
                ✨ สไตล์พาสเทล
              </button>
              <button 
                onClick={() => setAiFilter(aiFilter === "earth" ? null : "earth")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${aiFilter === "earth" ? "border-amber-300 bg-amber-50 text-amber-700" : "border-[#E5DFD6] bg-white text-[#6B7280]"}`}
              >
                🍂 เอิร์ธโทน
              </button>
              <div className="w-[1px] h-6 bg-[#E5DFD6] mx-1" />
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[120px] bg-white border border-[#E5DFD6] rounded-full px-3 py-1.5 text-xs outline-none" 
              />
            </div>
          </div>

          {/* Map Container */}
          {view === "map" && (
            <div className="flex-1 relative bg-[#F0EBE3] overflow-hidden md:rounded-tr-2xl flex items-center justify-center">
               {/* Wrapper แคบพอดีสัดส่วนแผนที่ (520:700) กันไม่ให้ preserveAspectRatio "meet" เหลือขอบว่างข้างเยอะจนดูเหมือนซูมออก */}
               <div className="relative h-full" style={{ aspectRatio: "520 / 700", maxWidth: "100%" }}>
                 <ThailandGeoMap regionFilter={regionFilter} onSelect={setSelectedProvince} />

                 {/* Map Filter Overrides for AI matching dimming */}
                 {aiFilter && (
                   <div className="pointer-events-none absolute inset-0 bg-[#F0EBE3]/40 z-[5] animate-[fadeIn_0.3s_ease]" />
                 )}
               </div>
            </div>
          )}

          {/* List Container */}
          {view === "list" && (
            <div className="flex-1 overflow-y-auto pb-[120px] md:pb-0 px-4">
              <p className="py-2 text-xs font-semibold text-[#6B7280]">{filtered.length} จังหวัด</p>
              {filtered.map((p) => (
                <ProvinceCard key={p.id} province={p} onClick={() => setSelectedProvince(p)} />
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Desktop Side Panel or Mobile Bottom Sheet */}
        {selectedProvince && (
          <>
            {/* Desktop SidePanel */}
            <div className="hidden md:block w-[400px] border-l border-[#E5DFD6] bg-white z-20 overflow-hidden shadow-[-4px_0_24px_rgba(0,0,0,0.05)] animate-[fadeIn_0.2s_ease]">
              <ProvinceDetailPanel province={selectedProvince} onClose={() => setSelectedProvince(null)} />
            </div>

            {/* Mobile BottomSheet (using fixed overlay) */}
            <div className="md:hidden">
              <div className="fixed inset-0 bg-black/40 z-[1000] animate-[fadeIn_0.2s_ease]" onClick={() => setSelectedProvince(null)} />
              <div className="fixed bottom-[64px] left-0 right-0 h-[80vh] bg-white z-[1001] rounded-t-2xl overflow-hidden animate-[slideUp_0.3s_ease] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
                <ProvinceDetailPanel province={selectedProvince} onClose={() => setSelectedProvince(null)} />
              </div>
            </div>
          </>
        )}

      </div>

      <style>{`
        @keyframes slideUp { from { transform:translateY(100%);opacity:0 } to { transform:translateY(0);opacity:1 } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { transform:scale(0.88);opacity:0 } to { transform:scale(1);opacity:1 } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* ป้องกัน overscroll ตอน sheet เปิด */
        body:has(.province-sheet-open) { overflow: hidden; touch-action: none; }
      `}</style>
    </div>
  );
}
