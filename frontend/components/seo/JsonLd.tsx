/**
 * JsonLd — helper เดียวสำหรับฝัง structured data (schema.org) ผ่าน <script type="application/ld+json">
 * Server component ล้วนๆ ไม่มี "use client" จึงใช้ได้ทั้งใน server component และถูก import โดย client component ได้เช่นกัน
 * ใช้แทนการเขียน <script dangerouslySetInnerHTML={...}> ซ้ำๆ ทุกหน้า (ของเดิมที่มีอยู่แล้วใน product/[id], community/[id] ไม่ต้องแก้ ยังทำงานเหมือนเดิม)
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
