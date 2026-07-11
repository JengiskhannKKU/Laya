import { redirect } from "next/navigation";

/**
 * เดิมหน้านี้แสดงโปรไฟล์ "ช่างทอ" รายบุคคล (mock ล้วน — ไม่มีตารางช่างทอรายบุคคลจริงใน backend)
 * ข้อมูลจริงมีแค่ระดับร้านค้า/ชุมชน จึงรีไดเรกต์ไปหน้าโปรไฟล์ร้าน/ชุมชนแทน
 */
export default async function WeaverProfileRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/community/${id}`);
}
