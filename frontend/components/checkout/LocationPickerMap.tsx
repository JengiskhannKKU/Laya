"use client";

/**
 * ปักหมุดตำแหน่งจัดส่งบนแผนที่ (OpenStreetMap ผ่าน Leaflet — ฟรี ไม่ต้องใช้ API key)
 * แตะ/ลากหมุดเพื่อระบุตำแหน่ง แล้วพยายาม reverse-geocode ให้ผู้ใช้ (ผ่าน Nominatim)
 */

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import IconButton from "@mui/material/IconButton";

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018]; // กรุงเทพฯ
const FONT = '"Kanit", sans-serif';

export interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerMapProps {
  value: LatLng | null;
  onChange: (pos: LatLng) => void;
  /** เรียกเมื่อ reverse-geocode ได้ผลลัพธ์ที่อยู่แบบข้อความ (best-effort, ไม่ block) */
  onAddressGuess?: (label: string) => void;
  height?: number;
}

export default function LocationPickerMap({ value, onChange, onAddressGuess, height = 220 }: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const onAddressGuessRef = useRef(onAddressGuess);
  const [locating, setLocating] = useState(false);
  const [ready, setReady] = useState(false);

  onChangeRef.current = onChange;
  onAddressGuessRef.current = onAddressGuess;

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) onAddressGuessRef.current?.(data.display_name as string);
    } catch {
      // reverse geocode ล้มเหลวไม่เป็นไร — ผู้ใช้กรอกที่อยู่เองได้อยู่แล้ว
    }
  };

  const placeMarker = (lat: number, lng: number, fly: boolean) => {
    const L = (window as unknown as { L: typeof import("leaflet") }).L;
    if (!mapRef.current) return;
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLatLng();
        onChangeRef.current({ lat: pos.lat, lng: pos.lng });
        reverseGeocode(pos.lat, pos.lng);
      });
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (fly) mapRef.current.setView([lat, lng], 16);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      const L = leaflet;
      // ไอคอนหมุด default ของ leaflet อ้าง path รูปแบบเก่าที่ bundler จับไม่ได้ — ชี้ไป CDN แทน
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const start = value ?? { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };
      const map = L.map(containerRef.current, {
        center: [start.lat, start.lng],
        zoom: value ? 16 : 6,
        scrollWheelZoom: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        placeMarker(e.latlng.lat, e.latlng.lng, false);
        onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      (window as unknown as { L: typeof import("leaflet") }).L = L;
      if (value) placeMarker(value.lat, value.lng, false);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync เมื่อ value เปลี่ยนจากภายนอก (เช่น "ใช้ตำแหน่งของฉัน")
  useEffect(() => {
    if (!ready || !value) return;
    placeMarker(value.lat, value.lng, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, value?.lat, value?.lng]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChangeRef.current({ lat: latitude, lng: longitude });
        placeMarker(latitude, longitude, true);
        reverseGeocode(latitude, longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <Box sx={{ position: "relative", borderRadius: "14px", overflow: "hidden", border: "1px solid #E5DFD6" }}>
      <Box ref={containerRef} sx={{ width: "100%", height }} />
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 500 }}>
        <IconButton
          onClick={useMyLocation}
          size="small"
          sx={{ bgcolor: "#FFFFFF", boxShadow: "0 2px 6px rgba(27,42,74,0.2)", "&:hover": { bgcolor: "#FDF8F0" } }}
        >
          {locating ? <CircularProgress size={16} sx={{ color: "#C5A55A" }} /> : <MyLocationRoundedIcon sx={{ fontSize: 18, color: "#1B2A4A" }} />}
        </IconButton>
      </Box>
      <Box sx={{ position: "absolute", bottom: 6, left: 8, zIndex: 500, bgcolor: "rgba(255,255,255,0.9)", borderRadius: "6px", px: 1, py: 0.2 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "0.62rem", color: "#6B7280" }}>
          แตะบนแผนที่เพื่อปักหมุด
        </Typography>
      </Box>
    </Box>
  );
}
