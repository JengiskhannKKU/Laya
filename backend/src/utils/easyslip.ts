/**
 * Client กลางสำหรับ EasySlip (easyslip.com) — ตรวจสอบสลิปการโอนเงินไทย (PromptPay/ธนาคาร)
 * ส่ง URL รูปสลิป + ยอดเงินที่คาดหวังไปให้ EasySlip ตรวจ แล้วคืนผลว่าสลิปถูกต้องหรือไม่
 *
 * ตั้งค่าผ่าน env: EASYSLIP_API_KEY
 * ถ้ายังไม่ตั้งค่า → easySlipConfigured=false (ระบบจะเก็บสลิปไว้ให้ตรวจเองแทน)
 *
 * Docs: https://document.easyslip.com/en/v2/verify/bank/url
 */

const EASYSLIP_API_KEY = process.env.EASYSLIP_API_KEY ?? "";

export const easySlipConfigured = Boolean(EASYSLIP_API_KEY);

export interface SlipVerifyResult {
  ok: boolean;
  transRef?: string;
  reason?: string;
}

/**
 * ตรวจสอบสลิปกับ EasySlip
 * @param url    - URL รูปสลิป (public URL ที่ EasySlip เข้าถึงได้)
 * @param amount - ยอดเงินที่คาดหวัง (บาท) — EasySlip จะตรวจว่าตรงกันไหม (matchAmount)
 */
export async function verifySlip(url: string, amount: number): Promise<SlipVerifyResult> {
  if (!easySlipConfigured) return { ok: false, reason: "EasySlip not configured" };

  try {
    const res = await fetch("https://api.easyslip.com/v2/verify/bank", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EASYSLIP_API_KEY}`,
      },
      body: JSON.stringify({ url, matchAmount: amount, checkDuplicate: true }),
    });

    const body: any = await res.json().catch(() => ({}));

    if (!res.ok || body?.success !== true) {
      const reason = body?.error?.message ?? `EasySlip returned ${res.status}`;
      console.error("[easyslip] verify failed:", res.status, JSON.stringify(body).slice(0, 500));
      return { ok: false, reason };
    }

    const data = body?.data ?? {};
    if (data.isAmountMatched === false) {
      console.error("[easyslip] amount mismatch:", JSON.stringify(data).slice(0, 500));
      return { ok: false, reason: "amount mismatch" };
    }
    if (data.isDuplicate === true) {
      console.error("[easyslip] duplicate slip:", JSON.stringify(data).slice(0, 500));
      return { ok: false, reason: "duplicate slip" };
    }

    const transRef: string | undefined = data?.rawSlip?.transRef;
    return { ok: true, transRef };
  } catch (err) {
    console.error("[easyslip] verify error:", (err as Error).message);
    return { ok: false, reason: "network error" };
  }
}
