import type { Metadata } from 'next';
import ClothingDesigner from '@/components/design-clothes/ClothingDesigner';

export const metadata: Metadata = {
  title: 'ออกแบบเสื้อผ้าของคุณ | LAYA',
  description: 'เลือกทรงเสื้อ เลือกผ้า ปรับดีไซน์ และสร้างสรรค์ชิ้นงานในแบบของคุณ',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function DesignClothesPage() {
  return <ClothingDesigner />;
}
