"use client";

import { useRouter } from "next/navigation";
import PatternForm, { emptyPatternForm, PatternFormValues } from "@/components/merchant/PatternForm";
import { authFetch, SessionExpiredError } from "@/lib/api-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function CreatePatternPage() {
  const router = useRouter();

  const handleSubmit = async (values: PatternFormValues) => {
    const res = await authFetch(`${API_BASE}/api/weave-patterns`, {
      method: "POST",
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
    if (!res.ok) throw new Error(data.error ?? "เพิ่มลายผ้าไม่สำเร็จ");
    router.push("/merchant/patterns");
  };

  return (
    <PatternForm
      title="เพิ่มลายผ้าใหม่"
      initial={emptyPatternForm}
      submitLabel="บันทึกลายผ้า"
      onSubmit={handleSubmit}
    />
  );
}
