/**
 * In-memory job store สำหรับงาน AI ที่ใช้เวลานาน (kie.ai/FASHN generate ใช้เวลาได้ถึง ~5 นาที) —
 * เดิม endpoint พวกนี้เป็น request/response เดียวจบ (ค้าง HTTP connection ทั้ง 5 นาที) ถ้าผู้ใช้สลับแท็บ/
 * ปิดหน้า/เน็ตสะดุดระหว่างรอ ผลลัพธ์ที่ backend สร้างเสร็จแล้วก็หายไปเปล่าๆ เพราะไม่มีที่เก็บให้กลับมาดึงทีหลัง
 *
 * เปลี่ยนมาใช้ pattern submit-then-poll แทน: POST เริ่มงาน คืน jobId ทันที แล้วให้ frontend poll
 * GET /status/:jobId เอาเอง — ผลลัพธ์ยังอยู่ใน store แม้ผู้ใช้จะสลับแท็บ/โหลดหน้าใหม่ก็ตาม (แค่ browser ต้องจำ
 * jobId ไว้เอง เช่นใน sessionStorage — ดู useAsyncJob.ts ฝั่ง frontend)
 *
 * เป็น in-memory (Map) ไม่ persist ข้าม process restart — เพียงพอสำหรับ use case นี้ (งานมีอายุสั้นเป็นนาที
 * ไม่ใช่ persistent job queue จริงจัง) ถ้าในอนาคตต้องรองรับหลาย process/restart บ่อย ค่อยย้ายไป Redis/DB
 */

export type JobStatus = "pending" | "done" | "error";

export interface Job<T = any> {
  status: JobStatus;
  result?: T;
  error?: string;
  createdAt: number;
}

const JOB_TTL_MS = 15 * 60 * 1000; // เก็บผลลัพธ์ไว้ 15 นาทีหลังสร้าง เผื่อผู้ใช้สลับแท็บนานๆ ค่อยกลับมาดู
const jobs = new Map<string, Job>();

function cleanupExpired() {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS) jobs.delete(id);
  }
}

export function createJob(id: string): void {
  cleanupExpired();
  jobs.set(id, { status: "pending", createdAt: Date.now() });
}

export function resolveJob<T>(id: string, result: T): void {
  const job = jobs.get(id);
  if (job) { job.status = "done"; job.result = result; }
}

export function rejectJob(id: string, error: string): void {
  const job = jobs.get(id);
  if (job) { job.status = "error"; job.error = error; }
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}
