import { communities } from "@/lib/mock-data";
import CommunityDetailView from "@/components/community/CommunityDetailView";
import MobileLayout from "@/components/layout/MobileLayout";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return communities.map((c) => ({ id: c.id }));
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

  return (
    <MobileLayout>
      <CommunityDetailView community={community} />
    </MobileLayout>
  );
}
