"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Papa from "papaparse";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";
import { PRODUCT_CATEGORIES } from "@/components/merchant/ProductForm";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

interface BulkRow {
  localId: string;
  name: string;
  category: string;
  price: string;
  priceUnit: string;
  stock: string;
  fabricType: string;
}

const emptyRow = (): BulkRow => ({
  localId: crypto.randomUUID(), name: "", category: "fabric", price: "", priceUnit: "ชิ้น", stock: "", fabricType: "",
});

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF", borderRadius: "8px", fontFamily: FONT, fontSize: "0.85rem",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
  },
};

function normalizeCsvRow(raw: Record<string, string>): BulkRow {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) lower[k.trim().toLowerCase()] = (v ?? "").trim();
  const pick = (...keys: string[]) => keys.map((k) => lower[k]).find((v) => v) ?? "";
  const categoryRaw = pick("category", "หมวดหมู่");
  const matchedCategory = PRODUCT_CATEGORIES.find((c) => c.value === categoryRaw || c.label === categoryRaw)?.value ?? "fabric";
  return {
    localId: crypto.randomUUID(),
    name: pick("name", "ชื่อ", "ชื่อสินค้า"),
    category: matchedCategory,
    price: pick("price", "ราคา"),
    priceUnit: pick("priceunit", "unit", "หน่วย") || "ชิ้น",
    stock: pick("stock", "สต็อก", "จำนวน"),
    fabricType: pick("fabrictype", "ประเภทผ้า"),
  };
}

export default function BulkCreateProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateRow = (localId: string, field: keyof BulkRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.localId === localId ? { ...r, [field]: value } : r)));
  };

  const addRows = (count: number) => setRows((prev) => [...prev, ...Array.from({ length: count }, emptyRow)]);

  const deleteRow = (localId: string) => setRows((prev) => prev.filter((r) => r.localId !== localId));

  const handleCsvFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map(normalizeCsvRow).filter((r) => r.name);
        if (parsed.length) setRows((prev) => [...prev, ...parsed]);
        else setError("ไม่พบข้อมูลที่นำเข้าได้จากไฟล์ CSV นี้");
      },
      error: () => setError("อ่านไฟล์ CSV ไม่สำเร็จ"),
    });
  };

  const saveAll = async () => {
    setError("");
    const validRows = rows.filter((r) => r.name.trim());
    if (validRows.length === 0) { setError("กรุณากรอกอย่างน้อย 1 รายการ"); return; }
    for (const r of validRows) {
      if (!r.price || Number(r.price) <= 0) { setError(`"${r.name}": ราคาต้องมากกว่า 0`); return; }
      if (r.stock === "" || Number(r.stock) < 0 || !Number.isInteger(Number(r.stock))) { setError(`"${r.name}": จำนวนสต็อกไม่ถูกต้อง`); return; }
    }
    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/api/products/bulk`, {
        method: "POST",
        body: JSON.stringify({
          products: validRows.map((r) => ({
            name: r.name.trim(), category: r.category, price: Number(r.price),
            priceUnit: r.priceUnit, stock: Number(r.stock), fabricType: r.fabricType || undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      router.push("/merchant/products");
    } catch (err) {
      if (err instanceof SessionExpiredError) { router.push("/auth/login"); return; }
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton onClick={() => router.back()} sx={{ color: "#1B2A4A" }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography sx={{ fontFamily: FONT, fontSize: "1.2rem", fontWeight: 700, color: "#1B2A4A" }}>
          เพิ่มสินค้าหลายรายการ
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>}

      <Alert severity="info" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT, fontSize: "0.82rem" }}>
        เพิ่มได้เฉพาะข้อมูลพื้นฐาน — เพิ่มรูปภาพและรายละเอียดเพิ่มเติมได้หลังบันทึกโดยแก้ไขสินค้าแต่ละรายการ
      </Alert>

      <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <Button onClick={() => addRows(1)} startIcon={<AddRoundedIcon />} sx={{ fontFamily: FONT, color: "#1B2A4A", textTransform: "none" }}>
          เพิ่มแถว
        </Button>
        <Button onClick={() => addRows(5)} sx={{ fontFamily: FONT, color: "#1B2A4A", textTransform: "none" }}>
          เพิ่ม 5 แถว
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} startIcon={<UploadFileRoundedIcon />} sx={{ fontFamily: FONT, color: "#1B2A4A", textTransform: "none" }}>
          นำเข้า CSV
        </Button>
        <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); e.target.value = ""; }}
        />
        <Button onClick={saveAll} disabled={saving} variant="contained" startIcon={saving ? undefined : <SaveRoundedIcon />}
          sx={{ ml: "auto", bgcolor: "#1B2A4A", borderRadius: "10px", fontFamily: FONT, fontWeight: 600, textTransform: "none" }}>
          {saving ? <CircularProgress size={20} color="inherit" /> : "บันทึกทั้งหมด"}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { fontFamily: FONT, fontWeight: 600, color: "#1B2A4A", bgcolor: "#F8F5F0" } }}>
              <TableCell>ชื่อสินค้า *</TableCell>
              <TableCell>หมวดหมู่</TableCell>
              <TableCell>ประเภทผ้า</TableCell>
              <TableCell>ราคา *</TableCell>
              <TableCell>หน่วย</TableCell>
              <TableCell>สต็อก *</TableCell>
              <TableCell align="right">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.localId} hover>
                <TableCell>
                  <TextField size="small" value={row.name} onChange={(e) => updateRow(row.localId, "name", e.target.value)} sx={{ ...fieldSx, minWidth: 160 }} />
                </TableCell>
                <TableCell>
                  <Select size="small" value={row.category} onChange={(e) => updateRow(row.localId, "category", e.target.value)} sx={{ ...fieldSx, minWidth: 110, fontFamily: FONT, fontSize: "0.85rem" }}>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <MenuItem key={c.value} value={c.value} sx={{ fontFamily: FONT }}>{c.label}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField size="small" value={row.fabricType} onChange={(e) => updateRow(row.localId, "fabricType", e.target.value)} sx={{ ...fieldSx, minWidth: 110 }} />
                </TableCell>
                <TableCell>
                  <TextField size="small" type="number" inputProps={{ min: 0, step: "0.01" }} value={row.price}
                    onChange={(e) => updateRow(row.localId, "price", e.target.value)} sx={{ ...fieldSx, width: 100 }} />
                </TableCell>
                <TableCell>
                  <Select size="small" value={row.priceUnit} onChange={(e) => updateRow(row.localId, "priceUnit", e.target.value)} sx={{ ...fieldSx, minWidth: 80, fontFamily: FONT, fontSize: "0.85rem" }}>
                    {["เมตร", "ชิ้น", "ผืน", "คู่"].map((u) => <MenuItem key={u} value={u} sx={{ fontFamily: FONT }}>{u}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField size="small" type="number" inputProps={{ min: 0 }} value={row.stock}
                    onChange={(e) => updateRow(row.localId, "stock", e.target.value)} sx={{ ...fieldSx, width: 90 }} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => deleteRow(row.localId)} sx={{ color: "#EF4444" }} title="ลบ">
                    <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, fontFamily: FONT, color: "#9CA3AF" }}>
                  ยังไม่มีแถว — กด &quot;เพิ่มแถว&quot; หรือ &quot;นำเข้า CSV&quot; เพื่อเริ่มต้น
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
