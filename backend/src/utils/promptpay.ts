/**
 * PromptPay QR payload generator — EMVCo Merchant-Presented QR (Thai QR Payment standard)
 * รองรับเบอร์โทรศัพท์ (10 หลัก), เลขบัตรประชาชน (13 หลัก), e-Wallet ID (15 หลัก)
 *
 * ใช้สร้าง payload string สำหรับนำไป render เป็น QR Code ให้ลูกค้าสแกนจ่ายด้วยแอปธนาคาร
 */

/** TLV encode: ID (2) + Length (2) + Value */
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

/** แปลง PromptPay ID เป็น sub-field ตามประเภท (01=เบอร์โทร, 02=บัตรประชาชน, 03=e-Wallet) */
export function formatPromptPayTarget(target: string): { subId: string; value: string } {
  const digits = target.replace(/\D/g, "");
  if (digits.length >= 15) return { subId: "03", value: digits };
  if (digits.length >= 13) return { subId: "02", value: digits };
  // เบอร์โทร: 0812345678 → 0066812345678 (13 หลัก, ขึ้นต้นรหัสประเทศ)
  return { subId: "01", value: ("0000000000000" + digits.replace(/^0/, "66")).slice(-13) };
}

/**
 * สร้าง PromptPay payload
 * @param target  PromptPay ID (เบอร์โทร / บัตรประชาชน / e-Wallet)
 * @param amount  จำนวนเงิน (บาท) — ถ้าระบุจะเป็น dynamic QR (จ่ายได้ครั้งเดียวตามยอด)
 */
export function generatePromptPayPayload(target: string, amount?: number): string {
  const { subId, value } = formatPromptPayTarget(target);
  const merchantInfo = tlv("00", "A000000677010111") + tlv(subId, value);

  let payload =
    tlv("00", "01") +                              // Payload format indicator
    tlv("01", amount != null ? "12" : "11") +      // 12 = dynamic (มียอด), 11 = static
    tlv("29", merchantInfo) +                      // Merchant account info (PromptPay AID)
    tlv("58", "TH") +                              // Country code
    tlv("53", "764") +                             // Currency: THB (ISO 4217)
    (amount != null ? tlv("54", amount.toFixed(2)) : "");

  payload += "6304"; // CRC field header — CRC คำนวณรวม "6304" ด้วย
  return payload + crc16(payload);
}
