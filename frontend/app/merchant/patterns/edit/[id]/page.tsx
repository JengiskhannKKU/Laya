"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import PatternForm, { PatternFormValues } from "@/components/merchant/PatternForm";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function EditPatternPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<PatternFormValues | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/weave-patterns/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "ไม่พบลายผ้านี้");
        setInitial({
          name: data.name,
          region: data.region ?? "",
          originProvince: data.originProvince ?? "",
          community: data.community ?? "",
          description: data.description ?? "",
          storyHistory: data.storyHistory ?? "",
          storyWeaving: data.storyWeaving ?? "",
          patternImages: data.patternImages ?? [],
          weavingProcessImages: data.weavingProcessImages ?? [],
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "โหลดข้อมูลลายผ้าไม่สำเร็จ");
      }
    })();
  }, [params.id]);

  const handleSubmit = async (values: PatternFormValues) => {
    const res = await authFetch(`${API_BASE}/api/weave-patterns/${params.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: values.name,
        region: values.region || undefined,
        originProvince: values.originProvince || undefined,
        community: values.community || undefined,
        description: values.description || undefined,
        storyHistory: values.storyHistory || undefined,
        storyWeaving: values.storyWeaving || undefined,
        patternImages: values.patternImages,
        weavingProcessImages: values.weavingProcessImages,
      }),
    }).catch((err) => {
      if (err instanceof SessionExpiredError) { router.push("/auth/login"); }
      throw err;
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "แก้ไขลายผ้าไม่สำเร็จ");
    router.push("/merchant/patterns");
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
    <PatternForm
      title="แก้ไขลายผ้า"
      initial={initial}
      submitLabel="บันทึกการแก้ไข"
      onSubmit={handleSubmit}
    />
  );
}
