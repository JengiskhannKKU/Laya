/**
 * Client กลางสำหรับ SlipOk (slipok.com) — ตรวจสอบสลิปการโอนเงินไทย (PromptPay/ธนาคาร)
 * ส่ง URL รูปสลิป ให้ SlipOk อ่าน/ตรวจ แล้วเทียบยอดเงินที่คาดหวังเอง (ไม่พึ่งพา provider ให้ enforce ให้)
 *
 * ตั้งค่าผ่าน env: SLIPOK_API_KEY, SLIPOK_BRANCH_ID
 * ถ้ายังไม่ตั้งค่า → slipOkConfigured=false (ระบบจะเก็บสลิปไว้ให้แอดมินตรวจเองแทน)
 *
 * Docs: https://developer.slipok.com/
 */

const SLIPOK_API_KEY = process.env.SLIPOK_API_KEY ?? "";
const SLIPOK_BRANCH_ID = process.env.SLIPOK_BRANCH_ID ?? "";

export const slipOkConfigured = Boolean(SLIPOK_API_KEY && SLIPOK_BRANCH_ID);

export interface SlipVerifyResult {
  ok: boolean;
  transRef?: string;
  reason?: string;
}

/**
 * ตรวจสอบสลิปกับ SlipOk
 * @param url    - URL รูปสลิป (public URL ที่ SlipOk เข้าถึงได้)
 * @param amount - ยอดเงินที่คาดหวัง (บาท) — เทียบเองจากยอดที่ SlipOk อ่านได้จากรูป (data.amount)
 */
export async function verifySlip(url: string, amount: number): Promise<SlipVerifyResult> {
  if (!slipOkConfigured) return { ok: false, reason: "SlipOk not configured" };

  try {
    const res = await fetch(`https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-authorization": SLIPOK_API_KEY,
      },
      body: JSON.stringify({ url }),
    });

    const body: any = await res.json().catch(() => ({}));

    if (!res.ok || body?.success !== true) {
      const reason = body?.message ?? `SlipOk returned ${res.status}`;
      console.error("[slipok] verify failed:", res.status, JSON.stringify(body).slice(0, 500));
      return { ok: false, reason };
    }

    const data = body?.data ?? {};

    // SlipOk ไม่รับประกันว่าจะเช็ค amount ให้เสมอ — เทียบเองกับยอดที่คาดหวัง
    if (typeof data.amount === "number" && Math.abs(data.amount - amount) > 0.01) {
      console.error("[slipok] amount mismatch:", JSON.stringify(data).slice(0, 500));
      return { ok: false, reason: "amount mismatch" };
    }
    if (body?.message === "Duplicate Slip" || data.duplicate === true) {
      console.error("[slipok] duplicate slip:", JSON.stringify(data).slice(0, 500));
      return { ok: false, reason: "duplicate slip" };
    }

    const transRef: string | undefined = data?.transRef;
    return { ok: true, transRef };
  } catch (err) {
    console.error("[slipok] verify error:", (err as Error).message);
    return { ok: false, reason: "network error" };
  }
}
