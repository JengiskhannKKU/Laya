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

// POST /api/ai/analyze-fabric
router.post("/analyze-fabric", async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const apiKey = process.env.GEN_AI_KKU_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Mock response if no API key is configured
      await new Promise(r => setTimeout(r, 2000));
      res.json({
        type: "ผ้าไหม (Mock)",
        technique: "มัดหมี่",
        pattern: "ลายดอกแก้ว",
        tone: "ม่วง, ชมพู",
        thickness: "ปานกลาง"
      });
      return;
    }

    // Call OpenAI-compatible LLM Vision API using the KKU proxy
    const response = await fetch("https://gen.ai.kku.ac.th/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        // gemini-2.5-flash-lite เดิมใช้ไม่ได้แล้ว — KKU gateway ตอบ 200 แต่ error "No endpoints found for
        // google/gemini-2.5-flash-lite-preview-09-2025" ข้างใน (route ไปรุ่นที่ปลดระวางแล้ว) ทดสอบตรงแล้วว่า
        // gemini-2.5-flash ใช้งานได้จริง
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert in Thai textiles. Analyze the provided image of a Thai fabric. Extract the following 5 attributes in Thai language: 1) type (ประเภทผ้า e.g. ผ้าไหม, ผ้าฝ้าย), 2) technique (เทคนิคการทอ e.g. มัดหมี่, ยกขิด), 3) pattern (ลาย e.g. ลายดอกแก้ว), 4) tone (โทนสี e.g. ม่วง, ชมพู), 5) thickness (ความหนา e.g. บาง, ปานกลาง, หนา). Return ONLY a valid JSON object with the keys: type, technique, pattern, tone, thickness."
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:image") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("LLM API Error:", err);
      // Fallback to mock if API fails
      res.json({
        type: "ผ้าไหม (API Error)",
        technique: "มัดหมี่",
        pattern: "ลายดอกแก้ว",
        tone: "ม่วง, ชมพู",
        thickness: "ปานกลาง"
      });
      return;
    }

    const data = await response.json() as { choices?: { message: { content: string } }[]; error?: { message?: string } };

    // KKU gateway ตอบ HTTP 200 ได้แม้ตัว body เป็น error จริง (เช่นโมเดลปลดระวาง) — response.ok เช็คไม่เจอ
    // ต้องเช็ค shape ของ body เองด้วย ไม่งั้น data.choices[0] จะ throw แล้วเสีย mock fallback ที่ตั้งใจไว้
    if (!data.choices?.[0]) {
      console.error("LLM API returned unexpected shape:", data.error?.message ?? JSON.stringify(data));
      res.json({
        type: "ผ้าไหม (API Error)",
        technique: "มัดหมี่",
        pattern: "ลายดอกแก้ว",
        tone: "ม่วง, ชมพู",
        thickness: "ปานกลาง"
      });
      return;
    }

    let resultText = data.choices[0].message.content;
    
    // Strip markdown formatting if the LLM returns wrapped JSON
    resultText = resultText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(resultText);

    res.json(parsed);
  } catch (err) {
    console.error("Fabric analysis error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
