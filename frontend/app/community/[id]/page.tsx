import type { Metadata } from "next";
import { communities } from "@/lib/mock-data";
import CommunityDetailView from "@/components/community/CommunityDetailView";
import MobileLayout from "@/components/layout/MobileLayout";
import { notFound } from "next/navigation";
import { absoluteUrl, createPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return communities.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const community = communities.find((c) => c.id === id);

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
    description: `${community.name} ชุมชนช่างทอจากจังหวัด${community.province} มีสมาชิก ${community.memberCount} คน และสินค้า ${community.productCount} รายการบน LAYA`,
    path: `/community/${community.id}`,
    image: community.image,
  });
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const community = communities.find((c) => c.id === id);

  if (!community) {
    notFound();
  }

  const communityJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: community.name,
    image: absoluteUrl(community.image),
    url: absoluteUrl(`/community/${community.id}`),
    address: {
      "@type": "PostalAddress",
      addressRegion: community.province,
      addressCountry: "TH",
    },
  };

  return (
    <MobileLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(communityJsonLd) }}
      />
      <CommunityDetailView community={community} />
    </MobileLayout>
  );
}
