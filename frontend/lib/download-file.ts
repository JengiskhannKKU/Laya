/** ดาวน์โหลดไฟล์จาก Response (เช่น PDF) โดยไม่ต้อง navigate ออกจากหน้า — ใช้กับ endpoint ที่ต้องแนบ Authorization header */
export async function downloadBlob(res: Response, filename: string): Promise<void> {
  if (!res.ok) {
    let message = "ดาวน์โหลดไฟล์ไม่สำเร็จ";
    try {
      const data = await res.json();
      message = data.error ?? message;
    } catch {
      // response ไม่ใช่ JSON (เช่น PDF error stream) — ใช้ข้อความ default
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
