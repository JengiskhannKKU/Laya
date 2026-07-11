import type { Metadata } from "next";
import { fetchLiveProduct, fetchLiveProducts } from "@/lib/live-products";
import PassportPage from "@/components/passport/PassportPage";
import MobileLayout from "@/components/layout/MobileLayout";
import { notFound } from "next/navigation";
import { absoluteUrl, createPageMetadata, siteName, truncateDescription } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export async function generateStaticParams() {
  try {
    const products = await fetchLiveProducts();
    return products.map((p) => ({ id: p.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchLiveProduct(id);

  if (!product) {
    return createPageMetadata({
      title: "ไม่พบ Digital Textile Passport",
      description: "ไม่พบข้อมูลผ้าที่คุณกำลังค้นหาใน LAYA",
      path: `/passport/${id}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `Digital Textile Passport — ${product.name}`,
    description: truncateDescription(
      `ที่มาและเรื่องราวของ ${product.name} จาก ${product.community} จังหวัด${product.province} ${product.story}`
    ),
    path: `/passport/${product.id}`,
    image: product.images[0],
  });
}

export default async function PassportRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchLiveProduct(id);

  if (!product) {
    notFound();
  }

  const passportJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `Digital Textile Passport — ${product.name}`,
    description: truncateDescription(product.story, 500),
    image: product.images.map((image) => absoluteUrl(image)),
    creator: { "@type": "Organization", name: product.community },
    about: product.name,
    publisher: { "@type": "Organization", name: siteName },
    url: absoluteUrl(`/passport/${product.id}`),
  };

  return (
    <MobileLayout>
      <JsonLd data={passportJsonLd} />
      <PassportPage product={product} />
    </MobileLayout>
  );
}
