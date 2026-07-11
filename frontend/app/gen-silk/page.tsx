import { redirect } from "next/navigation";

/**
 * /gen-silk เดิมเป็นหน้า AI fabric pattern generator เดี่ยวๆ — ตอนนี้รวมเข้ากับ /custom
 * (Guided Custom / Prompt Custom) ซึ่งมี flow ครบกว่า (ทอผ้ากับร้านจริง + จับคู่ช่างทอ) แล้ว
 * เก็บ route นี้ไว้ redirect กันลิงก์เก่า/บุ๊กมาร์กพัง
 */
export default function GenSilkPage() {
  redirect("/custom");
}
