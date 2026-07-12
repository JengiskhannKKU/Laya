import PDFDocument from "pdfkit";
import path from "path";
import { Response } from "express";

const FONT_DIR = path.join(__dirname, "..", "assets", "fonts");
const REGULAR_FONT = path.join(FONT_DIR, "Sarabun-Regular.ttf");
const BOLD_FONT = path.join(FONT_DIR, "Sarabun-Bold.ttf");

/** สี/ระยะที่ใช้ร่วมกันทุกเอกสาร */
export const PDF_COLORS = { text: "#1B2A4A", muted: "#6B7280", rule: "#E5DFD6", accent: "#C5A55A" };

/** สร้างเอกสาร PDF พร้อมฟอนต์ไทย (Sarabun) — ใช้เป็นจุดเริ่มของทุกเอกสาร */
export function createThaiDoc(options: PDFKit.PDFDocumentOptions = {}): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 40, ...options });
  doc.registerFont("Sarabun", REGULAR_FONT);
  doc.registerFont("Sarabun-Bold", BOLD_FONT);
  doc.font("Sarabun");
  return doc;
}

/** เลขที่เอกสาร — สร้างจาก id แบบ deterministic ไม่ต้องมี sequence ในฐานข้อมูล */
export function formatDocNumber(prefix: string, id: string, date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${prefix}-${y}${m}${d}-${id.slice(0, 8).toUpperCase()}`;
}

interface DocHeaderOptions {
  shopName: string;
  shopAddress?: string | null;
  shopPhone?: string | null;
  docTitle: string;
  docNumber: string;
  docDate: Date;
}

/** ส่วนหัวเอกสาร — ชื่อร้าน/ที่อยู่ฝั่งซ้าย, ชื่อเอกสาร/เลขที่/วันที่ฝั่งขวา + เส้นคั่น */
export function drawDocHeader(doc: PDFKit.PDFDocument, opts: DocHeaderOptions): number {
  const top = doc.y;
  const rightX = doc.page.width - doc.page.margins.right - 200;

  doc.font("Sarabun-Bold").fontSize(14).fillColor(PDF_COLORS.text).text(opts.shopName, doc.page.margins.left, top, { width: 300 });
  doc.font("Sarabun").fontSize(9).fillColor(PDF_COLORS.muted);
  if (opts.shopAddress) doc.text(opts.shopAddress, { width: 300 });
  if (opts.shopPhone) doc.text(`โทร ${opts.shopPhone}`, { width: 300 });

  doc.font("Sarabun-Bold").fontSize(16).fillColor(PDF_COLORS.text).text(opts.docTitle, rightX, top, { width: 200, align: "right" });
  doc.font("Sarabun").fontSize(9).fillColor(PDF_COLORS.muted)
    .text(`เลขที่ ${opts.docNumber}`, rightX, doc.y, { width: 200, align: "right" })
    .text(opts.docDate.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" }), rightX, doc.y, { width: 200, align: "right" });

  const afterY = Math.max(doc.y, top + 60) + 10;
  doc.moveTo(doc.page.margins.left, afterY).lineTo(doc.page.width - doc.page.margins.right, afterY).strokeColor(PDF_COLORS.rule).stroke();
  doc.y = afterY + 14;
  return doc.y;
}

/** บล็อกข้อมูล label: value เรียงเป็นแถว — ใช้กับ Bill To / Ship To */
export function drawKeyValueBlock(doc: PDFKit.PDFDocument, x: number, y: number, title: string, lines: string[]): number {
  doc.font("Sarabun-Bold").fontSize(10).fillColor(PDF_COLORS.text).text(title, x, y, { width: 250 });
  doc.font("Sarabun").fontSize(10).fillColor(PDF_COLORS.text);
  for (const line of lines) {
    if (line) doc.text(line, x, doc.y, { width: 250 });
  }
  return doc.y;
}

export interface TableColumn {
  header: string;
  width: number;
  align?: "left" | "right" | "center";
}

/** ตารางแบบเรียบง่าย (pdfkit ไม่มี table primitive ในตัว) — คืนค่า y หลังวาดเสร็จ */
export function drawTable(doc: PDFKit.PDFDocument, x: number, y: number, columns: TableColumn[], rows: string[][]): number {
  let curY = y;
  const rowHeight = 20;

  doc.font("Sarabun-Bold").fontSize(9).fillColor(PDF_COLORS.text);
  let colX = x;
  for (const col of columns) {
    doc.text(col.header, colX, curY, { width: col.width, align: col.align ?? "left" });
    colX += col.width;
  }
  curY += rowHeight;
  doc.moveTo(x, curY - 4).lineTo(colX, curY - 4).strokeColor(PDF_COLORS.rule).stroke();

  doc.font("Sarabun").fontSize(9).fillColor(PDF_COLORS.text);
  for (const row of rows) {
    colX = x;
    let maxLines = 1;
    for (let i = 0; i < columns.length; i++) {
      const height = doc.heightOfString(row[i] ?? "", { width: columns[i].width });
      maxLines = Math.max(maxLines, Math.ceil(height / rowHeight));
    }
    colX = x;
    for (let i = 0; i < columns.length; i++) {
      doc.text(row[i] ?? "", colX, curY, { width: columns[i].width, align: columns[i].align ?? "left" });
      colX += columns[i].width;
    }
    curY += rowHeight * maxLines;
  }

  doc.moveTo(x, curY).lineTo(colX, curY).strokeColor(PDF_COLORS.rule).stroke();
  return curY + 10;
}

/** ส่ง PDF ที่สร้างเสร็จแล้วออกเป็น response (ดาวน์โหลด) */
export function streamPdf(res: Response, doc: PDFKit.PDFDocument, filename: string): void {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);
  doc.end();
}
