"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
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
        if (!res.ok) throw new Error(data.error ?? "Product not found");
        setInitial({
          name: data.name,
          nameEn: data.nameEn ?? "",
          category: data.category ?? "fabric",
          fabricType: data.fabricType ?? "",
          price: String(data.price),
          priceUnit: data.priceUnit ?? "Piece",
          stock: String(data.stock),
          lowStockThreshold: data.lowStockThreshold != null ? String(data.lowStockThreshold) : "5",
          description: data.description ?? "",
          descriptionEn: data.descriptionEn ?? "",
          images: data.images ?? [],
          hasGI: !!data.hasGI,
          hasVariants: !!data.hasVariants,
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load product data");
      }
    })();
  }, [params.id]);

  const handleSubmit = async (values: ProductFormValues) => {
    const res = await authFetch(`${API_BASE}/api/products/${params.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: values.name,
        nameEn: values.nameEn || undefined,
        category: values.category,
        fabricType: values.fabricType || undefined,
        price: Number(values.price),
        priceUnit: values.priceUnit,
        stock: Number(values.stock),
        lowStockThreshold: values.lowStockThreshold ? Number(values.lowStockThreshold) : undefined,
        description: values.description || undefined,
        descriptionEn: values.descriptionEn || undefined,
        images: values.images,
        hasGI: values.hasGI,
        hasVariants: values.hasVariants,
      }),
    }).catch((err) => {
      if (err instanceof SessionExpiredError) { router.push("/auth/login"); }
      throw err;
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to update product");
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
    <Box>
      {initial.hasVariants && (
        <Button
          component={Link} href={`/merchant/products/${params.id}/variants`}
          variant="outlined" startIcon={<TuneRoundedIcon />}
          sx={{ mb: 2, borderColor: "#C5A55A", color: "#1B2A4A", borderRadius: "10px", fontFamily: '"Kanit", sans-serif', fontWeight: 600, textTransform: "none" }}
        >
          Manage Product SKU
        </Button>
      )}
      <ProductForm
        title="Edit Product"
        initial={initial}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
