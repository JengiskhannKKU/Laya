import type { Metadata } from "next";
import { fetchCommunity } from "@/lib/communities";
import CommunityDetailView from "@/components/community/CommunityDetailView";
import MobileLayout from "@/components/layout/MobileLayout";
import { notFound } from "next/navigation";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const community = await fetchCommunity(id);

  if (!community) {
    return createPageMetadata({
      title: "ไม่พบชุมชน",
      description: "ไม่พบชุมชนช่างทอที่คุณกำลังค้นหาใน LAYA",
      path: `/community/${id}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${community.name} จังหวัด${community.province}`,
    description: community.description ?? `${community.name} ชุมชนช่างทอจากจังหวัด${community.province} บน LAYA`,
    path: `/community/${community.id}`,
    image: community.image ?? undefined,
  });
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const community = await fetchCommunity(id);

  if (!community) {
    notFound();
  }

  const communityJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: community.name,
    image: community.image ? absoluteUrl(community.image) : undefined,
    url: absoluteUrl(`/community/${community.id}`),
    address: {
      "@type": "PostalAddress",
      addressRegion: community.province,
      addressCountry: "TH",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "ชุมชน", item: absoluteUrl("/community") },
      { "@type": "ListItem", position: 3, name: community.name, item: absoluteUrl(`/community/${community.id}`) },
    ],
  };

  return (
    <MobileLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(communityJsonLd) }}
      />
      <JsonLd data={breadcrumbJsonLd} />
      <CommunityDetailView community={community} />
    </MobileLayout>
  );
}
