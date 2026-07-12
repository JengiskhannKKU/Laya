"use client";

/**
 * เลือกจังหวัด → อำเภอ → ตำบล แบบ cascading (ข้อมูลราชการจริง 77/930/7,452 รายการ)
 * เลือกตำบลแล้วเติมรหัสไปรษณีย์ให้อัตโนมัติ (ตำบลบางแห่งมีหลายรหัส ผู้ใช้ปรับได้ถ้าจำเป็น)
 */

import { useEffect, useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import {
  loadThaiGeo, districtsOf, subdistrictsOf,
  ThaiProvince, ThaiDistrict, ThaiSubdistrict,
} from "@/lib/thai-geo";

const FONT = '"Kanit", sans-serif';

export interface AddressGeoValue {
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
}

interface AddressGeoFieldsProps {
  value: AddressGeoValue;
  onChange: (next: AddressGeoValue) => void;
  fieldSx: object;
}

export default function AddressGeoFields({ value, onChange, fieldSx }: AddressGeoFieldsProps) {
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<ThaiProvince[]>([]);
  const [districts, setDistricts] = useState<ThaiDistrict[]>([]);
  const [subdistricts, setSubdistricts] = useState<ThaiSubdistrict[]>([]);

  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadThaiGeo().then((geo) => {
      if (cancelled) return;
      // เก็บ dataset เต็มไว้เสมอ (ไม่ใช่แค่ตอนมีค่าเดิม) — ใช้กรองด้วย useMemo ด้านล่าง
      setProvinces(geo.provinces);
      setDistricts(geo.districts);
      setSubdistricts(geo.subdistricts);

      // ถ้ามีค่าเดิม (เช่นโหลดจากแบบร่าง) พยายาม match ชื่อกลับเป็น id
      const p = geo.provinces.find((x) => x.th === value.province);
      if (p) {
        setProvinceId(p.id);
        const d = districtsOf(geo, p.id).find((x) => x.th === value.district);
        if (d) setDistrictId(d.id);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เมื่อ value.province/district ถูกเปลี่ยนจากภายนอก (เช่น prefill จากแผนที่) หลัง mount แล้ว
  // ให้ re-derive id ของจังหวัด/อำเภอ เพื่อให้ dropdown อำเภอ/ตำบล populate ตามค่าที่เติมมา
  useEffect(() => {
    if (loading) return;
    const p = provinces.find((x) => x.th === value.province);
    const nextProvinceId = p?.id ?? null;
    if (nextProvinceId !== provinceId) setProvinceId(nextProvinceId);

    const d = p ? districtsOf({ provinces, districts, subdistricts }, p.id).find((x) => x.th === value.district) : undefined;
    const nextDistrictId = d?.id ?? null;
    if (nextDistrictId !== districtId) setDistrictId(nextDistrictId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.province, value.district, loading]);

  const districtOptions = useMemo(
    () => (provinceId ? districtsOf({ provinces, districts, subdistricts }, provinceId) : []),
    [provinceId, provinces, districts, subdistricts]
  );
  const subdistrictOptions = useMemo(
    () => (districtId ? subdistrictsOf({ provinces, districts, subdistricts }, districtId) : []),
    [districtId, provinces, districts, subdistricts]
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2, justifyContent: "center" }}>
        <CircularProgress size={16} sx={{ color: "#C5A55A" }} />
        <Box component="span" sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#9CA3AF" }}>
          กำลังโหลดข้อมูลจังหวัด/อำเภอ/ตำบล...
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
      <Autocomplete
        size="small"
        options={provinces}
        getOptionLabel={(o) => o.th}
        value={provinces.find((p) => p.id === provinceId) ?? null}
        onChange={(_, opt) => {
          setProvinceId(opt?.id ?? null);
          setDistrictId(null);
          onChange({ ...value, province: opt?.th ?? "", district: "", subdistrict: "", postalCode: "" });
        }}
        renderInput={(params) => <TextField {...params} label="จังหวัด" required sx={fieldSx} />}
        noOptionsText="ไม่พบจังหวัด"
      />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.8 }}>
        <Autocomplete
          size="small"
          options={districtOptions}
          disabled={!provinceId}
          getOptionLabel={(o) => o.th}
          value={districtOptions.find((d) => d.id === districtId) ?? null}
          onChange={(_, opt) => {
            setDistrictId(opt?.id ?? null);
            onChange({ ...value, district: opt?.th ?? "", subdistrict: "", postalCode: "" });
          }}
          renderInput={(params) => <TextField {...params} label="เขต/อำเภอ" required sx={fieldSx} />}
          noOptionsText="เลือกจังหวัดก่อน"
        />
        <Autocomplete
          size="small"
          options={subdistrictOptions}
          disabled={!districtId}
          getOptionLabel={(o) => o.th}
          value={subdistrictOptions.find((s) => s.th === value.subdistrict) ?? null}
          onChange={(_, opt) => {
            onChange({
              ...value,
              subdistrict: opt?.th ?? "",
              postalCode: opt ? String(opt.zip) : "",
            });
          }}
          renderInput={(params) => <TextField {...params} label="แขวง/ตำบล" required sx={fieldSx} />}
          noOptionsText="เลือกอำเภอก่อน"
        />
      </Box>
      <TextField
        size="small" label="รหัสไปรษณีย์" required
        value={value.postalCode}
        inputProps={{ maxLength: 5, inputMode: "numeric" }}
        onChange={(e) => onChange({ ...value, postalCode: e.target.value.replace(/\D/g, "") })}
        helperText={value.subdistrict ? "เติมให้อัตโนมัติจากตำบลที่เลือก — แก้ไขได้หากไม่ตรง" : undefined}
        sx={fieldSx}
      />
    </Box>
  );
}
