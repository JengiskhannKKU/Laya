import { products } from "@/lib/mock-data";
import PassportPage from "@/components/passport/PassportPage";
import MobileLayout from "@/components/layout/MobileLayout";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function PassportRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <MobileLayout>
      <PassportPage product={product} />
    </MobileLayout>
  );
}
