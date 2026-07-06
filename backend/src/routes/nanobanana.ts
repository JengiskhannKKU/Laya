import { Router, Request, Response } from "express";

const router = Router();

const NB_BASE = "https://api.kie.ai/api/v1/gpt4o-image";
const API_KEY = process.env.NANO_BANANA_API_KEY ?? "";

/** Patterns that indicate credits/quota exhaustion in API responses */
function isCreditsError(body: any): boolean {
  const msg: string = (body?.msg ?? body?.message ?? body?.error ?? "").toLowerCase();
  return (
    body?.code === 402 ||
    body?.code === 429 ||
    msg.includes("insufficient") ||
    msg.includes("credit") ||
    msg.includes("quota") ||
    msg.includes("limit") ||
    msg.includes("out of") ||
    msg.includes("balance")
  );
}

/** Custom error class to distinguish credits exhaustion from other failures */
class CreditsExhaustedError extends Error {
  constructor() { super("API key out of credits"); }
}

async function pollTask(taskId: string, maxWait = 30_000, interval = 3_000): Promise<string> {
  const deadline = Date.now() + maxWait;
  while (Date.now() < deadline) {
    const res = await fetch(`${NB_BASE}/record-info?taskId=${taskId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
    const body = await res.json() as any;

    // Check if the poll response itself signals a credits issue
    if (isCreditsError(body)) throw new CreditsExhaustedError();

    const data = body.data;
    if (!data) throw new Error("No data in polling response");

    // successFlag: 0 = pending, 1 = success, 2 = failed
    if (data.successFlag === 1 || data.successFlag === true) {
      if (!data.response) throw new Error("Task successful but no response field found");
      const respObj = typeof data.response === "string" ? JSON.parse(data.response) : data.response;
      const url = 
        respObj?.resultUrls?.[0] ||
        respObj?.resultImageUrl ||
        respObj?.results_urls?.[0] ||
        respObj?.imageUrl ||
        respObj?.output;

      if (url) return url;
      throw new Error(`No image URL in successful response. Keys: ${JSON.stringify(Object.keys(respObj))}`);
    }

    if (data.successFlag === 2 || data.errorMessage) {
      // If the failure reason is credits, surface it clearly
      if (isCreditsError({ msg: data.errorMessage })) throw new CreditsExhaustedError();
      throw new Error(`Generation failed: ${data.errorMessage || "Unknown error"}`);
    }

    await new Promise((r) => setTimeout(r, interval));
  }
  // Treat a timeout as a credits issue (Nano Banana hangs tasks when no credits)
  throw new CreditsExhaustedError();
}

/**
 * POST /api/nanobanana/generate
 * Body: { prompt: string, imageUrls?: string[] }
 *
 * Submits a generation task and polls until a result URL is returned.
 * Falls back to a local mock image if the API key is out of credits.
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
    const submitRes = await fetch(`${NB_BASE}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        size: "1:1"
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      throw new Error(`Submit failed ${submitRes.status}: ${errText}`);
    }

    const submitData = await submitRes.json() as any;

    // Immediately detect credits exhaustion in the submit response
    if (isCreditsError(submitData)) throw new CreditsExhaustedError();

    const taskId: string =
      submitData?.taskId ?? submitData?.data?.taskId ?? submitData?.id ?? "";

    if (!taskId) {
      throw new Error(`No task ID returned: ${JSON.stringify(submitData)}`);
    }

    console.log(`[nanobanana] Task submitted: ${taskId}`);

    // 2. Poll for result (30s max)
    const imageUrl = await pollTask(taskId);
    res.json({ success: true, imageUrl });

  } catch (err: any) {
    if (err instanceof CreditsExhaustedError) {
      // Return mock gracefully — don't 500
      console.warn("[nanobanana] Credits exhausted! Displaying placeholder mock fabric for demo purposes.");
      return res.json({ success: true, imageUrl: "/images/fabric1.webp", mock: true });
    }
    console.error("[nanobanana] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
