import { Router, Request, Response } from "express";
import { query } from "../db";
import { AIGenerateRequest, AIGenerateResponse, Product } from "../types";

const router = Router();

const MOCK_COLORS: Record<string, string[]> = {
  default: ["#1B2A4A", "#C5A55A", "#F0EBE3", "#8B5E52", "#3D6B57"],
  นาค: ["#C5A55A", "#8B7355", "#4A3728", "#D4AF6B", "#1B2A4A"],
  ทอง: ["#F5C842", "#C5A55A", "#8B6914", "#FFE566", "#3A2E0F"],
  คราม: ["#1A3A5C", "#2E6B9E", "#4A9ED6", "#0D2340", "#6BB8E8"],
  แดง: ["#8B1A1A", "#C5383B", "#E06B6B", "#4A0E0E", "#F5A0A0"],
};

function pickColors(prompt: string): string[] {
  for (const key of Object.keys(MOCK_COLORS)) {
    if (prompt.includes(key)) return MOCK_COLORS[key];
  }
  return MOCK_COLORS.default;
}

// POST /api/ai/generate
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, basePatterns, colorPalette } =
      req.body as AIGenerateRequest;

    if (!prompt || prompt.trim().length === 0) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    // ── If real OpenAI key is present, you can call it here ──────────────────
    // if (process.env.OPENAI_API_KEY) { ... }

    // ── Mock path: deterministic, instant ────────────────────────────────────
    // Simulate a short processing delay
    await new Promise((r) => setTimeout(r, 500));

    // Fetch up to 3 matched products from DB (highest-rated)
    const productRows = await query<Record<string, unknown>>(
      `SELECT id, name, community, province, price, price_unit,
              rating, review_count, images, has_gi, production_time,
              available_length, fabric_type, story, weaver_name,
              certificate_id, passport
       FROM products ORDER BY rating DESC LIMIT 3`
    );

    const matchedProducts: Product[] = productRows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      community: r.community as string,
      province: r.province as string,
      price: Number(r.price),
      priceUnit: r.price_unit as string,
      rating: Number(r.rating),
      reviewCount: Number(r.review_count),
      images: r.images as string[],
      hasGI: r.has_gi as boolean,
      productionTime: r.production_time as string,
      availableLength: Number(r.available_length),
      fabricType: r.fabric_type as string,
      story: r.story as string,
      weaverName: r.weaver_name as string,
      certificateId: r.certificate_id as string,
      passport: r.passport as Product["passport"],
    }));

    const avgPrice =
      matchedProducts.reduce((s, p) => s + p.price, 0) /
      (matchedProducts.length || 1);

    const response: AIGenerateResponse = {
      patternId: `PAT-${Date.now()}`,
      prompt: prompt.trim(),
      matchedProducts,
      estimatedPrice: Math.round(avgPrice),
      suggestedColors:
        colorPalette && colorPalette.length > 0
          ? colorPalette
          : pickColors(prompt),
      generatedAt: new Date().toISOString(),
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
