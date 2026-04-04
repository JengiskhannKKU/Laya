import { Router, Request, Response } from "express";

const router = Router();

const NB_BASE = "https://api.nanobananaapi.ai/api/v1/nanobanana";
const API_KEY = process.env.NANO_BANANA_API_KEY ?? "";

async function pollTask(taskId: string, maxWait = 120_000, interval = 3_000): Promise<string> {
  const deadline = Date.now() + maxWait;
  while (Date.now() < deadline) {
    const res = await fetch(`${NB_BASE}/record-info?taskId=${taskId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
    const body = await res.json() as any;
    const data = body.data;

    if (!data) throw new Error("No data in polling response");

    // successFlag: 0 = pending, 1 = success, 2 (or other) = failed?
    if (data.successFlag === 1 || data.successFlag === true) {
      if (!data.response) throw new Error("Task successful but no response field found");
      const respObj = typeof data.response === "string" ? JSON.parse(data.response) : data.response;
      
      const url = 
        respObj?.resultImageUrl ||
        respObj?.results_urls?.[0] || 
        respObj?.imageUrl || 
        respObj?.output;
        
      if (url) return url;
      throw new Error(`No image URL in the successful response. Keys: ${JSON.stringify(Object.keys(respObj))}`);
    }

    if (data.successFlag === 2 || data.errorMessage) {
      throw new Error(`Generation failed: ${data.errorMessage || "Unknown error"}`);
    }

    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error("Timed out waiting for Nano Banana generation");
}

/**
 * POST /api/nanobanana/generate
 * Body: { prompt: string, imageUrls?: string[] }
 *
 * Submits a generation task and polls until a result URL is returned.
 */
router.post("/generate", async (req: Request, res: Response) => {
  const { prompt, imageUrls = [] } = req.body as { prompt?: string; imageUrls?: string[] };

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }
  if (!API_KEY) {
    res.status(500).json({ error: "NANO_BANANA_API_KEY is not configured" });
    return;
  }

  try {
    // 1. Submit task
    const submitRes = await fetch(`${NB_BASE}/generate-2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        imageUrls,
        aspectRatio: "1:1",
        resolution: "1K",
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      throw new Error(`Submit failed ${submitRes.status}: ${errText}`);
    }

    const submitData = await submitRes.json() as any;
    
    // Graceful fallback if credits are exhausted
    if (submitData?.code === 402 || submitData?.msg?.includes("insufficient")) {
      console.warn("[nanobanana] Credits exhausted! Returning mock fabric for demo.");
      return res.json({ success: true, imageUrl: "/images/fabric1.jpg", mock: true });
    }

    const taskId: string =
      submitData?.taskId ?? submitData?.data?.taskId ?? submitData?.id ?? "";

    if (!taskId) {
      throw new Error(`No task ID returned: ${JSON.stringify(submitData)}`);
    }

    console.log(`[nanobanana] Task submitted: ${taskId}`);

    // 2. Poll for result
    const imageUrl = await pollTask(taskId);

    res.json({ success: true, imageUrl });
  } catch (err: any) {
    console.error("[nanobanana] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
