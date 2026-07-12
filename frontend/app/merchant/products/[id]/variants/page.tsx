"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Papa from "papaparse";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const FONT = '"Kanit", sans-serif';

interface VariantRow {
  localId: string;
  id?: string;
  sku: string;
  color: string;
  size: string;
  pattern: string;
  length: string;
  material: string;
  price: string;
  stock: string;
  selected: boolean;
}

type EditableField = "sku" | "color" | "size" | "pattern" | "length" | "material" | "price" | "stock";

const emptyRow = (): VariantRow => ({
  localId: crypto.randomUUID(),
  sku: "", color: "", size: "", pattern: "", length: "", material: "", price: "", stock: "",
  selected: false,
});

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF", borderRadius: "8px", fontFamily: FONT, fontSize: "0.85rem",
    "& fieldset": { borderColor: "#E5DFD6" },
    "&.Mui-focused fieldset": { borderColor: "#C5A55A" },
  },
};

function normalizeCsvRow(raw: Record<string, string>): VariantRow {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) lower[k.trim().toLowerCase()] = (v ?? "").trim();
  const pick = (...keys: string[]) => keys.map((k) => lower[k]).find((v) => v) ?? "";
  return {
    localId: crypto.randomUUID(),
    sku: pick("sku", "รหัส"),
    color: pick("color", "สี"),
    size: pick("size", "ไซส์", "ขนาด"),
    pattern: pick("pattern", "ลาย"),
    length: pick("length", "ความยาว"),
    material: pick("material", "วัสดุ"),
    price: pick("price", "ราคา"),
    stock: pick("stock", "สต็อก", "จำนวน"),
    selected: false,
  };
}

export default function ProductVariantsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productName, setProductName] = useState("");
  const [rows, setRows] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bulkDialog, setBulkDialog] = useState<"price" | "stock" | null>(null);
  const [bulkValue, setBulkValue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productRes, variantsRes] = await Promise.all([
        fetch(`${API_BASE}/api/products/${params.id}`),
        authFetch(`${API_BASE}/api/products/${params.id}/variants`),
      ]);
      const product = await productRes.json();
      if (!productRes.ok) throw new Error(product.error ?? "ไม่พบสินค้านี้");
      setProductName(product.name);

      const variants = await variantsRes.json();
      if (!variantsRes.ok) throw new Error(variants.error ?? "โหลด SKU ไม่สำเร็จ");
      setRows(
        variants.map((v: Record<string, unknown>): VariantRow => ({
          localId: crypto.randomUUID(),
          id: v.id as string,
          sku: (v.sku as string) ?? "",
          color: (v.color as string) ?? "",
          size: (v.size as string) ?? "",
          pattern: (v.pattern as string) ?? "",
          length: (v.length as string) ?? "",
          material: (v.material as string) ?? "",
          price: String(v.price ?? ""),
          stock: String(v.stock ?? ""),
          selected: false,
        }))
      );
    } catch (err) {
      setError(err instanceof SessionExpiredError ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" : (err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const updateRow = (localId: string, field: EditableField, value: string) => {
    setRows((prev) => prev.map((r) => (r.localId === localId ? { ...r, [field]: value } : r)));
  };

  const addRows = (count: number) => {
    setRows((prev) => [...prev, ...Array.from({ length: count }, emptyRow)]);
  };

  const duplicateRow = (row: VariantRow) => {
    setRows((prev) => [...prev, { ...row, localId: crypto.randomUUID(), id: undefined, sku: "", selected: false }]);
  };

  const toggleSelect = (localId: string) => {
    setRows((prev) => prev.map((r) => (r.localId === localId ? { ...r, selected: !r.selected } : r)));
  };

  const toggleSelectAll = () => {
    const allSelected = rows.length > 0 && rows.every((r) => r.selected);
    setRows((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  };

  const selectedRows = rows.filter((r) => r.selected);

  const deleteRow = async (row: VariantRow) => {
    if (row.id) {
      try {
        const res = await authFetch(`${API_BASE}/api/products/${params.id}/variants/bulk`, {
          method: "DELETE",
          body: JSON.stringify({ variantIds: [row.id] }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "ลบไม่สำเร็จ");
      } catch (err) {
        setError(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
        return;
      }
    }
    setRows((prev) => prev.filter((r) => r.localId !== row.localId));
  };

  const deleteSelected = async () => {
    const serverIds = selectedRows.filter((r) => r.id).map((r) => r.id as string);
    if (serverIds.length) {
      try {
        const res = await authFetch(`${API_BASE}/api/products/${params.id}/variants/bulk`, {
          method: "DELETE",
          body: JSON.stringify({ variantIds: serverIds }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "ลบไม่สำเร็จ");
      } catch (err) {
        setError(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
        return;
      }
    }
    setRows((prev) => prev.filter((r) => !r.selected));
  };

  const applyBulkEdit = async () => {
    if (!bulkDialog || !bulkValue.trim()) return;
    const field = bulkDialog;
    const numValue = Number(bulkValue);
    if (!Number.isFinite(numValue) || numValue < 0 || (field === "price" && numValue <= 0)) {
      setError(field === "price" ? "ราคาต้องมากกว่า 0" : "จำนวนสต็อกไม่ถูกต้อง");
      return;
    }

    const serverIds = selectedRows.filter((r) => r.id).map((r) => r.id as string);
    if (serverIds.length) {
      try {
        const res = await authFetch(`${API_BASE}/api/products/${params.id}/variants/bulk`, {
          method: "PATCH",
          body: JSON.stringify({ variantIds: serverIds, [field]: numValue }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "แก้ไขไม่สำเร็จ");
      } catch (err) {
        setError(err instanceof Error ? err.message : "แก้ไขไม่สำเร็จ");
        return;
      }
    }
    // ใช้กับแถวที่ยังไม่บันทึก (ไม่มี server id) ด้วย — อัปเดตใน state ตรงๆ
    setRows((prev) => prev.map((r) => (r.selected ? { ...r, [field]: bulkValue } : r)));
    setBulkDialog(null);
    setBulkValue("");
  };

  const handleCsvFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map(normalizeCsvRow).filter((r) => r.price || r.sku || r.color);
        if (parsed.length) setRows((prev) => [...prev, ...parsed]);
        else setError("ไม่พบข้อมูลที่นำเข้าได้จากไฟล์ CSV นี้");
      },
      error: () => setError("อ่านไฟล์ CSV ไม่สำเร็จ"),
    });
  };

  const saveAll = async () => {
    setError("");
    for (const r of rows) {
      if (!r.price || Number(r.price) <= 0) { setError("ทุกแถวต้องระบุราคามากกว่า 0"); return; }
      if (r.stock === "" || Number(r.stock) < 0 || !Number.isInteger(Number(r.stock))) { setError("ทุกแถวต้องระบุจำนวนสต็อกที่ถูกต้อง"); return; }
    }
    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/api/products/${params.id}/variants/bulk`, {
        method: "POST",
        body: JSON.stringify({
          variants: rows.map((r) => ({
            id: r.id, sku: r.sku || undefined, color: r.color || undefined, size: r.size || undefined,
            pattern: r.pattern || undefined, length: r.length || undefined, material: r.material || undefined,
            price: Number(r.price), stock: Number(r.stock),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setSuccess("บันทึก SKU เรียบร้อยแล้ว");
      setTimeout(() => setSuccess(""), 3000);
      await load();
    } catch (err) {
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
        <Box>
          <Typography sx={{ fontFamily: FONT, fontSize: "1.2rem", fontWeight: 700, color: "#1B2A4A" }}>
            จัดการ SKU สินค้า
          </Typography>
          {productName && (
            <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#6B7280" }}>{productName}</Typography>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: "12px", fontFamily: FONT }}>{success}</Alert>}

      {/* Mobile: desktop/tablet only notice */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Alert severity="info" sx={{ borderRadius: "12px", fontFamily: FONT }}>
          จัดการ SKU สินค้า (Multi-SKU) ได้บนคอมพิวเตอร์หรือแท็บเล็ตเท่านั้น
        </Alert>
      </Box>

      {/* Desktop/tablet: table UI */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#C5A55A" }} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              <Button onClick={() => addRows(1)} startIcon={<AddRoundedIcon />}
                sx={{ fontFamily: FONT, color: "#1B2A4A", textTransform: "none" }}>
                เพิ่มแถว
              </Button>
              <Button onClick={() => addRows(5)} sx={{ fontFamily: FONT, color: "#1B2A4A", textTransform: "none" }}>
                เพิ่ม 5 แถว
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} startIcon={<UploadFileRoundedIcon />}
                sx={{ fontFamily: FONT, color: "#1B2A4A", textTransform: "none" }}>
                นำเข้า CSV
              </Button>
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); e.target.value = ""; }}
              />

              {selectedRows.length > 0 && (
                <>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: "#6B7280", ml: 1 }}>
                    เลือก {selectedRows.length} รายการ
                  </Typography>
                  <Button onClick={() => { setBulkDialog("price"); setBulkValue(""); }}
                    sx={{ fontFamily: FONT, color: "#C5A55A", textTransform: "none" }}>
                    แก้ไขราคา
                  </Button>
                  <Button onClick={() => { setBulkDialog("stock"); setBulkValue(""); }}
                    sx={{ fontFamily: FONT, color: "#C5A55A", textTransform: "none" }}>
                    แก้ไขสต็อก
                  </Button>
                  <Button onClick={deleteSelected} startIcon={<DeleteRoundedIcon />}
                    sx={{ fontFamily: FONT, color: "#EF4444", textTransform: "none" }}>
                    ลบที่เลือก
                  </Button>
                </>
              )}

              <Button onClick={saveAll} disabled={saving || rows.length === 0} variant="contained" startIcon={saving ? undefined : <SaveRoundedIcon />}
                sx={{ ml: "auto", bgcolor: "#1B2A4A", borderRadius: "10px", fontFamily: FONT, fontWeight: 600, textTransform: "none" }}>
                {saving ? <CircularProgress size={20} color="inherit" /> : "บันทึกทั้งหมด"}
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ border: "1px solid #E5DFD6", borderRadius: "14px", boxShadow: "none" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontFamily: FONT, fontWeight: 600, color: "#1B2A4A", bgcolor: "#F8F5F0" } }}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={rows.length > 0 && rows.every((r) => r.selected)} onChange={toggleSelectAll} />
                    </TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>สี</TableCell>
                    <TableCell>ขนาด</TableCell>
                    <TableCell>ลาย</TableCell>
                    <TableCell>ความยาว</TableCell>
                    <TableCell>วัสดุ</TableCell>
                    <TableCell>ราคา *</TableCell>
                    <TableCell>สต็อก *</TableCell>
                    <TableCell align="right">จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.localId} hover>
                      <TableCell padding="checkbox">
                        <Checkbox size="small" checked={row.selected} onChange={() => toggleSelect(row.localId)} />
                      </TableCell>
                      {(["sku", "color", "size", "pattern", "length", "material"] as const).map((field) => (
                        <TableCell key={field}>
                          <TextField size="small" value={row[field]} onChange={(e) => updateRow(row.localId, field, e.target.value)} sx={{ ...fieldSx, minWidth: 90 }} />
                        </TableCell>
                      ))}
                      <TableCell>
                        <TextField size="small" type="number" inputProps={{ min: 0, step: "0.01" }} value={row.price}
                          onChange={(e) => updateRow(row.localId, "price", e.target.value)} sx={{ ...fieldSx, width: 100 }} />
                      </TableCell>
                      <TableCell>
                        <TextField size="small" type="number" inputProps={{ min: 0 }} value={row.stock}
                          onChange={(e) => updateRow(row.localId, "stock", e.target.value)} sx={{ ...fieldSx, width: 90 }} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => duplicateRow(row)} sx={{ color: "#6B7280" }} title="คัดลอก SKU">
                          <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteRow(row)} sx={{ color: "#EF4444" }} title="ลบ">
                          <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4, fontFamily: FONT, color: "#9CA3AF" }}>
                        ยังไม่มี SKU — กด &quot;เพิ่มแถว&quot; หรือ &quot;นำเข้า CSV&quot; เพื่อเริ่มต้น
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      <Dialog open={!!bulkDialog} onClose={() => setBulkDialog(null)} PaperProps={{ sx: { borderRadius: "16px", minWidth: 320 } }}>
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, color: "#1B2A4A" }}>
          {bulkDialog === "price" ? "แก้ไขราคา" : "แก้ไขสต็อก"} ({selectedRows.length} รายการ)
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth type="number" label={bulkDialog === "price" ? "ราคาใหม่ (บาท)" : "จำนวนสต็อกใหม่"}
            value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} sx={{ mt: 1, ...fieldSx }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setBulkDialog(null)} sx={{ fontFamily: FONT, color: "#6B7280", textTransform: "none" }}>ยกเลิก</Button>
          <Button onClick={applyBulkEdit} variant="contained" sx={{ bgcolor: "#1B2A4A", borderRadius: "10px", fontFamily: FONT, fontWeight: 600, textTransform: "none" }}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 2 }}>
        <Link href="/merchant/products" style={{ fontFamily: FONT, fontSize: "0.82rem", color: "#6B7280" }}>
          ← กลับไปหน้าสินค้าทั้งหมด
        </Link>
      </Box>
    </Box>
  );
}
