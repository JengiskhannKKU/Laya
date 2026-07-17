/**
 * Client กลางสำหรับ kie.ai gpt4o-image (Nano Banana) — submit task + poll ผลลัพธ์
 * แยกออกมาจาก routes/nanobanana.ts เดิม เพราะ routes/tryon.ts ต้องใช้ path เดียวกัน
 * (ก่อนหน้านี้ nanobanana.ts รับ `imageUrls` มาจาก body แต่ไม่เคยส่งต่อให้ kie.ai จริงๆ เลย —
 * ที่ถูกต้องคือฟิลด์ `filesUrl` ตาม kie.ai docs และรูปต้องเป็น URL ที่เข้าถึงได้จากอินเทอร์เน็ตจริง
 * ไม่ใช่ base64/data URL)
 */

const NB_BASE = "https://api.kie.ai/api/v1/gpt4o-image";
const API_KEY = process.env.KIE_IMAGE_API_KEY ?? "";

function isCreditsError(body: any): boolean {
  const msg: string = (body?.msg ?? body?.message ?? body?.error ?? "").toLowerCase();
  return (
    body?.code === 402 ||
    body?.code === 429 ||
    msg.includes("insufficient") ||
    msg.includes("credit") ||
    msg.includes("quota") ||
    msg.includes("limit") ||
    msg.includes("out of") ||
    msg.includes("balance")
  );
}

class CreditsExhaustedError extends Error {
  constructor() { super("API key out of credits"); }
}

/**
 * ทดสอบจริงกับ key ที่มีเครดิตแล้วพบว่า gpt4o-image ใช้เวลา generate จริงได้ถึง ~2.5 นาที (ไม่ใช่ไม่กี่วินาที) —
 * เดิม maxWait=55s แล้วถือว่า timeout = หมดเครดิตนั้นผิด ตอนนี้แยกกรณีชัดเจน: หมดเครดิตจริงต้องเจอ code 402
 * ทันทีตอน submit/poll (ยืนยันด้วย curl ตรงแล้ว) ส่วน timeout คือแค่ยัง generate ไม่เสร็จ ไม่ใช่หมดเครดิต
 */
async function pollTask(taskId: string, maxWait = 330_000, interval = 4_000): Promise<string> {
  const deadline = Date.now() + maxWait;
  while (Date.now() < deadline) {
    // ตั้ง timeout ต่อการเรียกแต่ละครั้ง (ไม่ใช่ทั้งลูป) กัน fetch ค้างตลอดไปถ้า kie.ai ไม่ตอบ —
    // เจอเคสจริงที่ fetch ค้างเกิน maxWait ไปมาก เพราะ deadline check ใน while ไม่มีทางถูกเช็คถ้า
    // await fetch(...) เองไม่เคย resolve/reject เลย ต้อง abort แล้ว retry รอบถัดไปแทน
    let body: any;
    try {
      const res = await fetch(`${NB_BASE}/record-info?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
      body = await res.json();
    } catch (err: any) {
      // timeout/network error ต่อการเรียกครั้งเดียว — ไม่ใช่ error จริงจากงาน ให้ retry รอบถัดไปแทน
      if (err?.name === "TimeoutError" || err?.name === "AbortError" || err instanceof TypeError) {
        await new Promise((r) => setTimeout(r, interval));
        continue;
      }
      throw err;
    }

    if (isCreditsError(body)) throw new CreditsExhaustedError();

    const data = body.data;
    if (!data) throw new Error("No data in polling response");

    // successFlag: 0 = pending, 1 = success, 2 = failed
    if (data.successFlag === 1 || data.successFlag === true) {
      if (!data.response) throw new Error("Task successful but no response field found");
      const respObj = typeof data.response === "string" ? JSON.parse(data.response) : data.response;
      const url =
        respObj?.resultUrls?.[0] ||
        respObj?.resultImageUrl ||
        respObj?.results_urls?.[0] ||
        respObj?.imageUrl ||
        respObj?.output;

      if (url) return url;
      throw new Error(`No image URL in successful response. Keys: ${JSON.stringify(Object.keys(respObj))}`);
    }

    if (data.successFlag === 2 || data.errorMessage) {
      if (isCreditsError({ msg: data.errorMessage })) throw new CreditsExhaustedError();
      throw new Error(`Generation failed: ${data.errorMessage || "Unknown error"}`);
    }

    await new Promise((r) => setTimeout(r, interval));
  }
  // Timeout ≠ หมดเครดิต (เครดิตหมดจะเจอ code 402 ทันทีที่ submit/poll อยู่แล้ว) — แค่ generate ไม่เสร็จในเวลาที่ให้
  throw new Error(`Generation timed out after ${Math.round(maxWait / 1000)}s`);
}

export interface GenerateImageParams {
  /** ข้อความบรรยาย — อย่างน้อยต้องมี prompt หรือ filesUrl อย่างใดอย่างหนึ่ง (ตาม kie.ai) */
  prompt?: string;
  /** รูปอ้างอิงสำหรับ image-to-image/editing — ต้องเป็น URL public เข้าถึงได้จริง สูงสุด 5 รูป */
  filesUrl?: string[];
  size?: "1:1" | "3:2" | "2:3";
}

export interface GenerateImageResult {
  imageUrl: string;
  /** true = เครดิต API หมด ใช้รูปตัวอย่างในเครื่องแทนแบบ graceful (ไม่ error ให้ผู้ใช้เห็น) */
  mock?: boolean;
}

export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  if (!API_KEY) throw new Error("KIE_IMAGE_API_KEY is not configured");
  if (!params.prompt && !(params.filesUrl && params.filesUrl.length)) {
    throw new Error("ต้องมี prompt หรือ filesUrl อย่างน้อยหนึ่งอย่าง");
  }

  try {
    const submitRes = await fetch(`${NB_BASE}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: params.prompt,
        filesUrl: params.filesUrl,
        size: params.size ?? "1:1",
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      throw new Error(`Submit failed ${submitRes.status}: ${errText}`);
    }

    const submitData = (await submitRes.json()) as any;
    if (isCreditsError(submitData)) throw new CreditsExhaustedError();

    const taskId: string = submitData?.taskId ?? submitData?.data?.taskId ?? submitData?.id ?? "";
    if (!taskId) throw new Error(`No task ID returned: ${JSON.stringify(submitData)}`);

    console.log(`[kie-image] Task submitted: ${taskId}`);
    const imageUrl = await pollTask(taskId);
    return { imageUrl };
  } catch (err) {
    if (err instanceof CreditsExhaustedError) {
      console.warn("[kie-image] Credits exhausted! Returning placeholder mock image.");
      return { imageUrl: "/images/fabric1.webp", mock: true };
    }
    throw err;
  }
}
