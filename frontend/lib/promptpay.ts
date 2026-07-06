/**
 * PromptPay QR payload generator — EMVCo Merchant-Presented QR (Thai QR Payment standard)
 * ใช้ฝั่ง client เพื่อเจน QR ตามยอดสั่งซื้อได้ทันทีโดยไม่ต้องรอ backend
 * (ตรงกับ backend/src/utils/promptpay.ts — เทียบผลกับไลบรารี promptpay-qr แล้วตรงกัน)
 */

function tlv(id: string, value: string): string {
  return id + value.length.toString().padStart(2, "0") + value;
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) — ตามสเปค EMVCo field 63 */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatTarget(target: string): { subId: string; value: string } {
  const digits = target.replace(/\D/g, "");
  if (digits.length >= 15) return { subId: "03", value: digits };          // e-Wallet
  if (digits.length >= 13) return { subId: "02", value: digits };          // บัตรประชาชน
  return { subId: "01", value: ("0000000000000" + digits.replace(/^0/, "66")).slice(-13) }; // เบอร์โทร
}

/**
 * สร้าง PromptPay payload สำหรับ render เป็น QR Code
 * @param target PromptPay ID (เบอร์โทร / บัตรประชาชน / e-Wallet)
 * @param amount จำนวนเงินบาท — ระบุแล้วจะเป็น dynamic QR ตามยอด
 */
export function generatePromptPayPayload(target: string, amount?: number): string {
  const { subId, value } = formatTarget(target);
  const merchantInfo = tlv("00", "A000000677010111") + tlv(subId, value);

  let payload =
    tlv("00", "01") +
    tlv("01", amount != null ? "12" : "11") +
    tlv("29", merchantInfo) +
    tlv("58", "TH") +
    tlv("53", "764") +
    (amount != null ? tlv("54", amount.toFixed(2)) : "");

  payload += "6304";
  return payload + crc16(payload);
}

/** PromptPay ID ของแพลตฟอร์ม (ตั้งผ่าน NEXT_PUBLIC_PROMPTPAY_ID) */
export const PROMPTPAY_ID =
  process.env.NEXT_PUBLIC_PROMPTPAY_ID ?? "0812345678";

/** จัดรูปแบบ PromptPay ID สำหรับแสดงผล เช่น 081-234-5678 */
export function formatPromptPayIdDisplay(id: string): string {
  const digits = id.replace(/\D/g, "");
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 13) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
  return digits;
}
