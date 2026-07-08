"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ProductForm, { ProductFormValues } from "@/components/merchant/ProductForm";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<ProductFormValues | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "ไม่พบสินค้านี้");
        setInitial({
          name: data.name,
          category: data.category ?? "fabric",
          fabricType: data.fabricType ?? "",
          price: String(data.price),
          priceUnit: data.priceUnit ?? "ชิ้น",
          stock: String(data.stock),
          description: data.description ?? "",
          images: data.images ?? [],
          hasGI: !!data.hasGI,
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "โหลดข้อมูลสินค้าไม่สำเร็จ");
      }
    })();
  }, [params.id]);

  const handleSubmit = async (values: ProductFormValues) => {
    const res = await authFetch(`${API_BASE}/api/products/${params.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: values.name,
        category: values.category,
        fabricType: values.fabricType || undefined,
        price: Number(values.price),
        priceUnit: values.priceUnit,
        stock: Number(values.stock),
        description: values.description || undefined,
        images: values.images,
        hasGI: values.hasGI,
      }),
    }).catch((err) => {
      if (err instanceof SessionExpiredError) { router.push("/auth/login"); }
      throw err;
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "แก้ไขสินค้าไม่สำเร็จ");
    router.push("/merchant/products");
  };

  if (loadError) {
    return <Alert severity="error" sx={{ borderRadius: "12px", fontFamily: '"Kanit", sans-serif' }}>{loadError}</Alert>;
  }
  if (!initial) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#C5A55A" }} />
      </Box>
    );
  }

  return (
    <ProductForm
      title="แก้ไขสินค้า"
      initial={initial}
      submitLabel="บันทึกการแก้ไข"
      onSubmit={handleSubmit}
    />
  );
}
