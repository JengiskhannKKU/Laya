import type { Metadata } from "next";
import { products } from "@/lib/mock-data";
import ProductDetailView from "@/components/product/ProductDetailView";
import MobileLayout from "@/components/layout/MobileLayout";
import { notFound } from "next/navigation";
import {
  absoluteUrl,
  createPageMetadata,
  siteName,
  truncateDescription,
} from "@/lib/seo";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return createPageMetadata({
      title: "ไม่พบสินค้า",
      description: "ไม่พบสินค้าที่คุณกำลังค้นหาใน LAYA",
      path: `/product/${id}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: product.name,
    description: truncateDescription(
      `${product.name} จาก ${product.community} จังหวัด${product.province} ราคา ${product.price.toLocaleString()} ${product.priceUnit}. ${product.story}`
    ),
    path: `/product/${product.id}`,
    image: product.images[0],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: truncateDescription(product.story, 500),
    image: product.images.map((image) => absoluteUrl(image)),
    brand: {
      "@type": "Brand",
      name: siteName,
    },
    category: product.fabricType,
    sku: product.certificateId,
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.id}`),
      priceCurrency: "THB",
      price: product.price,
      availability:
        product.availableLength > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: product.community,
      },
    },
  };

  return (
    <MobileLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailView product={product} />
    </MobileLayout>
  );
}
