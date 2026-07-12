"use client";

import { useRouter } from "next/navigation";
import ProductForm, { emptyProductForm, ProductFormValues } from "@/components/merchant/ProductForm";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function CreateProductPage() {
  const router = useRouter();

  const handleSubmit = async (values: ProductFormValues) => {
    const res = await authFetch(`${API_BASE}/api/products`, {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        category: values.category,
        fabricType: values.fabricType || undefined,
        price: Number(values.price),
        priceUnit: values.priceUnit,
        stock: Number(values.stock),
        lowStockThreshold: values.lowStockThreshold ? Number(values.lowStockThreshold) : undefined,
        description: values.description || undefined,
        images: values.images,
        hasGI: values.hasGI,
        hasVariants: values.hasVariants,
      }),
    }).catch((err) => {
      if (err instanceof SessionExpiredError) { router.push("/auth/login"); }
      throw err;
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "เพิ่มสินค้าไม่สำเร็จ");
    router.push(values.hasVariants ? `/merchant/products/${data.id}/variants` : "/merchant/products");
  };

  return (
    <ProductForm
      title="เพิ่มสินค้าใหม่"
      initial={emptyProductForm}
      submitLabel="บันทึกสินค้า"
      onSubmit={handleSubmit}
    />
  );
}
