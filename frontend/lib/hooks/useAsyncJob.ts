"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook สำหรับเรียก AI generate ที่ใช้เวลานาน (kie.ai/FASHN ~1-5 นาที) แบบทนต่อการสลับแท็บ/โหลดหน้าใหม่
 *
 * ปัญหาเดิม: endpoint พวกนี้เป็น fetch เดียวค้างรอจนกว่าจะเสร็จ ถ้าผู้ใช้สลับแท็บนานๆ (browser อาจ suspend/
 * discard แท็บพื้นหลัง โดยเฉพาะมือถือ) หรือโหลดหน้าใหม่ระหว่างรอ — component unmount ทำให้ .then() ที่จะ
 * อัปเดต state ไม่ทำงาน ผลลัพธ์ที่ backend generate เสร็จแล้วก็หายไปเปล่าๆ เพราะไม่มีที่เก็บ jobId ไว้กลับมาถาม
 *
 * แก้โดยเปลี่ยนเป็น pattern submit-then-poll: submitFn ต้อง POST ไปที่ backend endpoint ที่ตอบ { jobId }
 * กลับทันที (ไม่รอ generate เสร็จ) แล้ว hook นี้จะ persist jobId ไว้ใน sessionStorage + poll
 * GET /api/tryon/job/:jobId เอง ทุก 4 วิ จนกว่าจะเสร็จ/error — ถ้าหน้าโหลดใหม่หรือ component remount
 * ระหว่างรอ useEffect ตอน mount จะเจอ jobId เดิมใน sessionStorage แล้ว resume poll ต่อได้เลย ไม่ต้องเริ่มใหม่
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
const POLL_INTERVAL_MS = 4000;

export type AsyncJobStatus = "idle" | "loading" | "done" | "error";

interface JobState<T> {
  status: AsyncJobStatus;
  result?: T;
  error?: string;
}

export function useAsyncJob<T = any>(storageKey: string) {
  const [state, setState] = useState<JobState<T>>({ status: "idle" });
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollJob = useCallback((jobId: string) => {
    stopPolling();

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tryon/job/${jobId}`);
        const json = await res.json();
        if (!mountedRef.current) return;

        if (!res.ok) {
          stopPolling();
          sessionStorage.removeItem(storageKey);
          setState({ status: "error", error: json.error ?? "ตรวจสอบสถานะงานไม่สำเร็จ" });
          return;
        }
        if (json.status === "done") {
          stopPolling();
          sessionStorage.removeItem(storageKey);
          setState({ status: "done", result: json.result });
        } else if (json.status === "error") {
          stopPolling();
          sessionStorage.removeItem(storageKey);
          setState({ status: "error", error: json.error ?? "สร้างไม่สำเร็จ" });
        }
        // status === "pending" — poll ต่อรอบถัดไป
      } catch {
        // network error ชั่วคราว (เช่น ตอนสลับแท็บกลับมาแล้วเน็ตยังไม่พร้อม) — ปล่อยให้ลอง poll รอบถัดไปต่อ
        // ไม่ถือว่า error ทันที เพราะ job อาจยังรันอยู่เบื้องหลัง backend ปกติ แค่ poll ครั้งนี้เชื่อมต่อไม่ได้
      }
    };

    check();
    pollTimerRef.current = setInterval(check, POLL_INTERVAL_MS);
  }, [storageKey, stopPolling]);

  // ตอน mount เช็คว่ามีงานค้างอยู่จากก่อนหน้าไหม (สลับแท็บมา/โหลดหน้าใหม่ระหว่างรอ) — ถ้ามี resume poll ต่อทันที
  useEffect(() => {
    mountedRef.current = true;
    const savedJobId = sessionStorage.getItem(storageKey);
    if (savedJobId) {
      setState({ status: "loading" });
      pollJob(savedJobId);
    }
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const submit = useCallback(async (submitFn: () => Promise<{ jobId: string }>) => {
    setState({ status: "loading" });
    try {
      const { jobId } = await submitFn();
      sessionStorage.setItem(storageKey, jobId);
      pollJob(jobId);
    } catch (err: any) {
      setState({ status: "error", error: err.message ?? "เริ่มงานไม่สำเร็จ" });
    }
  }, [storageKey, pollJob]);

  const reset = useCallback(() => {
    stopPolling();
    sessionStorage.removeItem(storageKey);
    setState({ status: "idle" });
  }, [storageKey, stopPolling]);

  return { status: state.status, result: state.result, error: state.error, submit, reset };
}
