/**
 * Client กลางสำหรับ FASHN AI virtual try-on (https://fashn.ai) — submit prediction + poll ผลลัพธ์
 * ใช้แทน kie.ai สำหรับโหมดที่มีรูปตัวเองจริง (bodyPhotoUrl) เพราะ FASHN สร้างมาสำหรับใส่เสื้อผ้าลง
 * บนรูปคนจริงโดยเฉพาะ (คงหน้าตา/ท่าทาง/แสงเดิมไว้แม่นกว่า image-editing ทั่วไปแบบ gpt4o-image)
 */

const FASHN_BASE = "https://api.fashn.ai/v1";
const API_KEY = process.env.FASHN_API_KEY ?? "";

type FashnStatus = "starting" | "in_queue" | "processing" | "completed" | "failed" | "canceled" | "time_out";

class CreditsExhaustedError extends Error {
  constructor() { super("FASHN API key out of credits"); }
}

function isCreditsError(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes("insufficient") || m.includes("credit") || m.includes("quota") || m.includes("balance");
}

async function pollPrediction(id: string, maxWait = 120_000, interval = 3_000): Promise<string> {
  const deadline = Date.now() + maxWait;
  while (Date.now() < deadline) {
    const res = await fetch(`${FASHN_BASE}/status/${id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) throw new Error(`FASHN poll failed: ${res.status}`);
    const body = (await res.json()) as { id: string; status: FashnStatus; output?: string[]; error?: { name?: string; message?: string } | string };

    if (body.status === "completed") {
      const url = body.output?.[0];
      if (!url) throw new Error("FASHN: completed but no output image");
      return url;
    }
    if (body.status === "failed" || body.status === "canceled" || body.status === "time_out") {
      const errMsg = typeof body.error === "string" ? body.error : body.error?.message ?? body.status;
      if (isCreditsError(errMsg)) throw new CreditsExhaustedError();
      throw new Error(`FASHN generation failed: ${errMsg}`);
    }

    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`FASHN generation timed out after ${Math.round(maxWait / 1000)}s`);
}

export interface RunTryOnParams {
  /** URL รูปคนจริง (ต้องเข้าถึงได้จากอินเทอร์เน็ต) */
  modelImageUrl: string;
  /** URL รูปเสื้อผ้า/ทรงที่ผสมลายผ้าแล้ว (product image) */
  productImageUrl: string;
}

export interface RunTryOnResult {
  imageUrl: string;
  /** true = เครดิต API หมด ใช้รูปตัวอย่างในเครื่องแทนแบบ graceful (ไม่ error ให้ผู้ใช้เห็น) */
  mock?: boolean;
}

export async function runTryOn(params: RunTryOnParams): Promise<RunTryOnResult> {
  if (!API_KEY) throw new Error("FASHN_API_KEY is not configured");

  try {
    const submitRes = await fetch(`${FASHN_BASE}/run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_name: "tryon-max",
        inputs: {
          model_image: params.modelImageUrl,
          product_image: params.productImageUrl,
          output_format: "png",
        },
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      if (isCreditsError(errText)) throw new CreditsExhaustedError();
      throw new Error(`FASHN submit failed ${submitRes.status}: ${errText}`);
    }

    const submitData = (await submitRes.json()) as { id?: string; error?: string };
    if (submitData.error) {
      if (isCreditsError(submitData.error)) throw new CreditsExhaustedError();
      throw new Error(`FASHN submit error: ${submitData.error}`);
    }
    if (!submitData.id) throw new Error(`FASHN: no prediction id returned: ${JSON.stringify(submitData)}`);

    console.log(`[fashn] Prediction submitted: ${submitData.id}`);
    const imageUrl = await pollPrediction(submitData.id);
    return { imageUrl };
  } catch (err) {
    if (err instanceof CreditsExhaustedError) {
      console.warn("[fashn] Credits exhausted! Returning placeholder mock image.");
      return { imageUrl: "/images/fabric1.webp", mock: true };
    }
    throw err;
  }
}
