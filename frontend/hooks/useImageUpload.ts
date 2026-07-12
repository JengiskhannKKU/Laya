"use client";

import { useState, useCallback } from "react";

/** Bucket names ที่รองรับ — ต้องตรงกับที่ backend กำหนด */
export type UploadBucket =
  | "avatars"
  | "shop-images"
  | "product-images"
  | "fabric-uploads"
  | "post-images"
  | "tryon-uploads"
  | "pattern-images"
  | "chat-attachments"
  | "payment-slips";

export interface UploadResult {
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
}

interface UseImageUploadOptions {
  bucket: UploadBucket;
  /** subfolder ภายใน bucket เช่น userId หรือ shopId */
  folder?: string;
  /** ขนาดไฟล์สูงสุดที่รับได้ (bytes) — default 20MB */
  maxBytes?: number;
  /** callback เมื่ออัปโหลดสำเร็จ */
  onSuccess?: (result: UploadResult) => void;
  /** callback เมื่อเกิด error */
  onError?: (message: string) => void;
}

interface UseImageUploadReturn {
  /** เริ่ม upload จาก File object (ได้จาก input[type=file]) */
  uploadFile: (file: File) => Promise<UploadResult | null>;
  /** เริ่ม upload จาก base64 data URL (ได้จาก FileReader / canvas) */
  uploadBase64: (base64: string) => Promise<UploadResult | null>;
  /** กำลัง upload อยู่ */
  uploading: boolean;
  /** ข้อความ error ล่าสุด */
  error: string | null;
  /** URL ล่าสุดที่ upload สำเร็จ */
  lastUrl: string | null;
  /** preview dataURL (ก่อน upload — สำหรับแสดงผล optimistic) */
  previewUrl: string | null;
  /** clear state */
  reset: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Hook กลางสำหรับ upload รูปภาพขึ้น Supabase Storage ผ่าน backend
 *
 * Flow:
 * 1. User เลือกไฟล์ → FileReader → base64
 * 2. POST /api/upload/image { imageBase64, bucket, folder }
 * 3. Backend แปลง → WebP → Supabase Storage
 * 4. คืน { url, width, height, sizeBytes }
 *
 * @example
 * const { uploadFile, uploading, lastUrl } = useImageUpload({ bucket: "avatars", folder: userId });
 */
export function useImageUpload(options: UseImageUploadOptions): UseImageUploadReturn {
  const { bucket, folder, maxBytes = 20 * 1024 * 1024, onSuccess, onError } = options;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setLastUrl(null);
    setPreviewUrl(null);
  }, []);

  /** แปลง File → base64 data URL */
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
      reader.readAsDataURL(file);
    });

  const doUpload = useCallback(
    async (base64: string): Promise<UploadResult | null> => {
      setUploading(true);
      setError(null);

      try {
        // ดึง access token จาก Supabase auth session
        const { data: sessionData } = await import("@/lib/supabase").then(
          (m) => m.supabase.auth.getSession()
        );
        const token = sessionData?.session?.access_token ?? "";

        const res = await fetch(`${API_BASE}/api/upload/image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ imageBase64: base64, bucket, folder }),
        });

        const json = await res.json();

        if (!res.ok) {
          const msg = json.error ?? `Upload failed (${res.status})`;
          setError(msg);
          onError?.(msg);
          return null;
        }

        const result: UploadResult = {
          url: json.url,
          width: json.width ?? 0,
          height: json.height ?? 0,
          sizeBytes: json.sizeBytes ?? 0,
        };

        setLastUrl(result.url);
        onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, onSuccess, onError]
  );

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      if (!file.type.startsWith("image/")) {
        const msg = "กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP, GIF ฯลฯ)";
        setError(msg);
        onError?.(msg);
        return null;
      }
      if (file.size > maxBytes) {
        const mb = (maxBytes / 1024 / 1024).toFixed(0);
        const msg = `ไฟล์ขนาดใหญ่เกินไป (สูงสุด ${mb}MB)`;
        setError(msg);
        onError?.(msg);
        return null;
      }

      try {
        // สร้าง preview ก่อน upload เพื่อ UX
        const base64 = await fileToBase64(file);
        setPreviewUrl(base64);
        return await doUpload(base64);
      } catch {
        const msg = "ไม่สามารถอ่านไฟล์ได้";
        setError(msg);
        onError?.(msg);
        return null;
      }
    },
    [doUpload, maxBytes, onError]
  );

  const uploadBase64 = useCallback(
    async (base64: string): Promise<UploadResult | null> => {
      setPreviewUrl(base64);
      return doUpload(base64);
    },
    [doUpload]
  );

  return { uploadFile, uploadBase64, uploading, error, lastUrl, previewUrl, reset };
}

/**
 * อ่าน Supabase access token จาก localStorage
 * Supabase client เก็บ token ใน key `sb-<projectRef>-auth-token`
 */
export function getSupabaseToken(): string {
  if (typeof window === "undefined") return "";
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) ?? "";
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      try {
        const val = JSON.parse(localStorage.getItem(key) ?? "{}");
        return val?.access_token ?? "";
      } catch {
        return "";
      }
    }
  }
  return "";
}
