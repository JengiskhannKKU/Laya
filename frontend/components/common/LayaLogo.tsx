import Image from "next/image";

interface LayaLogoProps {
  variant: "navy" | "white";
  height: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

/**
 * โลโก้ "LAYA" (SVG) — ไฟล์ต้นฉบับเป็น canvas สี่เหลี่ยมจัตุรัส แต่ตัวอักษรมีแค่แถบกลาง
 * ~34% ของความสูง จึงต้อง object-fit: cover ครอปแนวตั้งแทนการปล่อย width: auto
 * (ไม่งั้นโลโก้จะเล็กจิ๋วอยู่กลางกรอบสี่เหลี่ยมเปล่าๆ) อัตราส่วนที่ครอปแล้ว ≈ 2.95:1
 */
export default function LayaLogo({ variant, height, className, style, priority }: LayaLogoProps) {
  const width = Math.round(height * 2.95);
  return (
    <Image
      src={variant === "navy" ? "/laya-logo-navy.svg" : "/laya-logo-white.svg"}
      alt="LAYA"
      width={width}
      height={height}
      className={className}
      priority={priority}
      style={{ height, width, objectFit: "cover", objectPosition: "center", ...style }}
    />
  );
}
