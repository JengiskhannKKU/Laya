import type { Metadata } from "next";
import ProductDetailView from "@/components/product/ProductDetailView";
import MobileLayout from "@/components/layout/MobileLayout";
import { notFound } from "next/navigation";
import {
  absoluteUrl,
  createPageMetadata,
  siteName,
  truncateDescription,
} from "@/lib/seo";

import { fetchLiveProduct, fetchLiveProducts } from "@/lib/live-products";
import JsonLd from "@/components/seo/JsonLd";

async function findProduct(id: string) {
  return fetchLiveProduct(id, { next: { revalidate: 60 } });
}

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
  const product = await findProduct(id);

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
  const product = await findProduct(id);

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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "สินค้าทั้งหมด", item: absoluteUrl("/search") },
      { "@type": "ListItem", position: 3, name: product.name, item: absoluteUrl(`/product/${product.id}`) },
    ],
  };

  return (
    <MobileLayout hideBottomNav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetailView product={product} />
    </MobileLayout>
  );
}
