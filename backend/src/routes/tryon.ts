import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { uploadBase64AsWebP, BUCKETS } from "../utils/imageUtils";
import { supabaseAdminConfigured } from "../utils/supabaseAdmin";
import { generateImage } from "../utils/kieImage";
import { runTryOn } from "../utils/fashn";
import { generateGarmentProductImage } from "../utils/garmentProduct";
import { createJob, resolveJob, rejectJob, getJob } from "../utils/jobStore";

const router = Router();

/**
 * GET /api/tryon/job/:jobId — เช็คสถานะงาน AI ที่ generate อยู่เบื้องหลัง (composite-preview, generate)
 * frontend poll endpoint นี้แทนการรอ HTTP response ค้างตรงๆ — กันเคสสลับแท็บ/โหลดหน้าใหม่แล้วผลลัพธ์หาย
 * (ดู useAsyncJob.ts ฝั่ง frontend — เก็บ jobId ไว้ใน sessionStorage แล้ว poll endpoint นี้จนกว่าจะเสร็จ)
 */
router.get("/job/:jobId", (req: Request, res: Response) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "ไม่พบงานนี้ (อาจหมดอายุแล้ว — เกิน 15 นาที)" });
    return;
  }
  res.json({ status: job.status, result: job.result, error: job.error });
});

/**
 * POST /api/tryon/upload — body: { imageBase64 } → { url }
 * แปลงรูปเป็น WebP แล้วเก็บไว้ที่ Supabase Storage (public bucket "tryon-uploads")
 * เพราะ kie.ai gpt4o-image ต้องการ URL ที่เข้าถึงได้จากอินเทอร์เน็ต ไม่รับ base64 ตรงๆ
 */
router.post("/upload", async (req: Request, res: Response) => {
  try {
    if (!supabaseAdminConfigured) {
      console.error("[tryon/upload] Supabase storage not configured (missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)");
      res.status(500).json({ error: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จ กรุณาติดต่อฝ่ายบริการลูกค้า" });
      return;
    }
    const { imageBase64 } = req.body as { imageBase64?: string };
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    // แปลงเป็น WebP ก่อน upload (sharp resize + compress)
    const result = await uploadBase64AsWebP(imageBase64, BUCKETS.tryonUploads);
    res.json({ url: result.url });
  } catch (err: any) {
    console.error("[tryon/upload] error:", err.message);
    res.status(500).json({ error: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จ กรุณาติดต่อฝ่ายบริการลูกค้า" });
  }
});

/**
 * POST /api/tryon/composite-preview — body: { fabricImageBase64, shape: { id }, perspective? } → { previewImage }
 * ให้ AI (kie.ai image-to-image) generate รูปชุดจริงจากทรงเทมเพลตที่เลือกไว้แล้ว (ChooseShapeStep มาก่อน
 * UploadFabricStep เสมอ) ผสมกับลายผ้าที่เพิ่งอัปโหลด แล้วส่ง URL รูปตัวอย่างกลับ — ให้ลูกค้าเห็นภาพชุดจริง
 * ก่อนจะไปขั้นถ่ายรูปตัวเอง/สัดส่วน (เดิมใช้ sharp mask compositing ตรงๆ แต่ขอบภาพเบลอ/หยาบเกินไป)
 */
router.post("/composite-preview", (req: Request, res: Response) => {
  const { fabricImageBase64, shape, perspective } = req.body as {
    fabricImageBase64?: string;
    shape?: { id?: string };
    perspective?: "front" | "back";
  };
  if (!fabricImageBase64) {
    res.status(400).json({ error: "fabricImageBase64 is required" });
    return;
  }
  if (!shape?.id) {
    res.status(400).json({ error: "shape.id is required" });
    return;
  }

  // ตอบ jobId กลับทันที ไม่รอ generate เสร็จ (ใช้เวลาได้ถึง ~5 นาที) — กันเคสสลับแท็บ/โหลดหน้าใหม่แล้ว
  // ผลลัพธ์หายเพราะ HTTP request ถูกตัดขาดกลางทาง ส่วนงานจริงทำต่อเบื้องหลัง ผลลัพธ์เก็บไว้ใน jobStore
  // ให้ frontend poll GET /job/:jobId เอาเอง (ดู useAsyncJob.ts)
  const jobId = randomUUID();
  createJob(jobId);
  res.json({ jobId });

  (async () => {
    try {
      // AI generate ต้องการ URL อินเทอร์เน็ตของรูปผ้า ไม่รับ base64 ตรงๆ — อัปโหลดขึ้น Storage ก่อน
      const fabricUpload = await uploadBase64AsWebP(fabricImageBase64, BUCKETS.tryonUploads, "fabric-previews");
      const product = await generateGarmentProductImage(shape.id!, perspective ?? "front", fabricUpload.url);
      resolveJob(jobId, { success: true, previewImage: product.url, mock: product.mock });
    } catch (err: any) {
      console.error("[tryon/composite-preview] error:", err.message);
      rejectJob(jobId, err.message ?? "สร้างตัวอย่างชุดไม่สำเร็จ");
    }
  })();
});

type Perspective = "front" | "back" | "side";

const PERSPECTIVE_DESC: Record<Perspective, string> = {
  front: "front-facing, looking directly at the camera, full body visible head to toe",
  back: "from behind, back view, full body visible head to toe",
  side: "from the side, profile / side view, full body visible head to toe",
};

interface BodyMeasurements {
  gender: "male" | "female";
  height: number; // cm
  weight: number; // kg
  chest: number; // cm
  waist: number; // cm
  hip: number; // cm
  /** id ของสวอตช์สีผิวที่เลือกไว้ (ดู SKIN_TONES ใน MeasurementsStep.tsx ฝั่ง frontend — tone1..tone6) */
  skinTone?: string;
}

// ต้อง sync id ให้ตรงกับ SKIN_TONES ใน frontend/components/tailor/steps/MeasurementsStep.tsx เป๊ะ
const SKIN_TONE_DESC: Record<string, string> = {
  tone1: "fair/light skin tone",
  tone2: "light skin tone with warm undertone",
  tone3: "golden tan skin tone",
  tone4: "tan skin tone",
  tone5: "deep honey/brown skin tone",
  tone6: "dark skin tone",
};

/** บรรยายรูปร่างจากสัดส่วนเป็นข้อความให้ AI ใช้สร้างแบบจำลอง (ไม่ใช้รูปจริงของผู้ใช้) */
function describeBodyBuild(m: BodyMeasurements): string {
  const bmi = m.weight / (m.height / 100) ** 2;
  const build = bmi < 18.5 ? "slender" : bmi < 25 ? "average" : bmi < 30 ? "fuller-figured" : "plus-size";
  const genderWord = m.gender === "male" ? "male" : "female";
  // ไม่มีรูปตัวเองให้ AI อ้างอิงสีผิวได้ในโหมดนี้ — ถ้าผู้ใช้ไม่ได้ระบุ ให้ AI เลือกเองตามความเหมาะสมกับคนไทย
  // (fallback นี้ไม่ควรเกิดขึ้นจริงเพราะ frontend บังคับเลือกสีผิวก่อนถึงจะกด "ถัดไป" ได้)
  const skinDesc = m.skinTone ? SKIN_TONE_DESC[m.skinTone] ?? "medium skin tone" : "a skin tone typical of Thai people";
  return `a Thai ${genderWord} model with a ${build} build and ${skinDesc}, approximately ${m.height}cm tall and ${m.weight}kg, `
    + `with a chest measurement of ${m.chest}cm, waist ${m.waist}cm, and hip ${m.hip}cm`;
}

// แปล template id (LAYA Template Library — backend/_seed_templates.js) เป็นคำอธิบายทรงเสื้อภาษาอังกฤษ
// ให้ AI เข้าใจชัดเจนว่าต้องตัดเย็บเป็นทรงไหน แทนคำกว้างๆ ว่า "outfit" เดิม — ใช้ชื่อไทย (shape.name) เป็น fallback
// เผื่อมี template ใหม่ที่ยังไม่ได้เพิ่มในนี้
const GARMENT_SHAPE_DESC: Record<string, string> = {
  shirt: "a tailored button-up shirt",
  blazer: "a tailored blazer jacket",
  jacket: "a tailored jacket",
  dress: "a fitted dress",
  polo: "a polo shirt",
  crop: "a cropped top",
  vest: "a fitted vest (waistcoat)",
  kimono: "a kimono-style outer layer",
};

function describeGarmentShape(shape?: { id?: string; name?: string }): string {
  if (!shape) return "outfit";
  return (shape.id && GARMENT_SHAPE_DESC[shape.id]) || `a ${shape.name ?? "tailored"} garment`;
}

/**
 * POST /api/tryon/generate
 * body: { bodyPhotoUrl?, bodyMeasurements?, fabricImageUrl?, perspective, analysisResult?, occasion?, shape? }
 * ให้ AI (kie.ai gpt4o-image, image-to-image) ใส่ชุดจากผ้าอ้างอิงลงบนคนตามมุมที่ระบุ — รับได้ 2 ทาง:
 *  - bodyPhotoUrl: ใช้รูปตัวเองจริงของผู้ใช้เป็นต้นแบบ (คงหน้าตา/สัดส่วนเดิมไว้เป๊ะ)
 *  - bodyMeasurements: ไม่มีรูปจริง — ให้ AI สร้างแบบจำลองใหม่ตามสัดส่วนที่ระบุแทน (ไม่ใช่ตัวผู้ใช้จริง)
 * ต้องมีอย่างใดอย่างหนึ่งเสมอ
 *
 * shape: { id, name } ของเทมเพลตที่เลือกไว้ใน ChooseShapeStep — ใช้ระบุทรงเสื้อผ้าจริงในพรอมต์
 * (เดิมพรอมต์เขียนแค่ "outfit" กว้างๆ ไม่สนใจว่าลูกค้าเลือกทรงไหนไว้ — ทำให้ผลลัพธ์ไม่ตรงกับทรงที่เลือก)
 */
router.post("/generate", (req: Request, res: Response) => {
  const { bodyPhotoUrl, bodyMeasurements, fabricImageUrl, perspective, analysisResult, occasion, shape } = req.body as {
    bodyPhotoUrl?: string;
    bodyMeasurements?: BodyMeasurements;
    fabricImageUrl?: string;
    perspective?: Perspective;
    analysisResult?: { type?: string; technique?: string; pattern?: string; tone?: string };
    occasion?: string;
    shape?: { id?: string; name?: string };
  };

  if (!bodyPhotoUrl && !bodyMeasurements) {
    res.status(400).json({ error: "bodyPhotoUrl or bodyMeasurements is required" });
    return;
  }
  if (!perspective || !PERSPECTIVE_DESC[perspective]) {
    res.status(400).json({ error: "perspective must be one of: front, back, side" });
    return;
  }

  // ตอบ jobId กลับทันที ไม่รอ generate เสร็จ (ใช้เวลาได้ถึง ~5 นาที) — กันเคสสลับแท็บ/โหลดหน้าใหม่แล้ว
  // ผลลัพธ์หายเพราะ HTTP request ถูกตัดขาดกลางทาง ส่วนงานจริงทำต่อเบื้องหลัง ผลลัพธ์เก็บไว้ใน jobStore
  // ให้ frontend poll GET /job/:jobId เอาเอง (ดู useAsyncJob.ts)
  const jobId = randomUUID();
  createJob(jobId);
  res.json({ jobId });

  (async () => {
    try {
      // มีรูปตัวเองจริง + เลือกทรงเทมเพลตไว้แล้ว + มีรูปผ้า → ใช้ FASHN virtual try-on (ทำมาสำหรับใส่เสื้อผ้า
      // ลงบนรูปคนจริงโดยเฉพาะ ผลลัพธ์แม่นกว่า image-editing ทั่วไปแบบ kie.ai) แทน
      // ต้องสร้างรูป "ชุดจริง" จากทรงเทมเพลต + ผ้าก่อน (generateGarmentProductImage — ใช้ AI generate ไม่ใช่
      // sharp mask compositing เพราะขอบภาพเบลอ/หยาบ) เพราะ FASHN ต้องการรูปเสื้อผ้าจริง ไม่ใช่ line art เปล่าๆ
      // ถ้าไม่มีเงื่อนไขครบ (เช่น โหมด measurements หรือยังไม่เลือกทรง/ผ้า) fallback ไป kie.ai เดิม
      if (bodyPhotoUrl && shape?.id && fabricImageUrl) {
        try {
          const product = await generateGarmentProductImage(shape.id, perspective, fabricImageUrl);
          const result = await runTryOn({ modelImageUrl: bodyPhotoUrl, productImageUrl: product.url });
          resolveJob(jobId, { success: true, perspective, ...result });
          return;
        } catch (fashnErr: any) {
          console.error("[tryon/generate] FASHN path failed, falling back to kie.ai:", fashnErr.message);
          // ตกไปใช้ kie.ai เดิมด้านล่างต่อ (ไม่ throw ทันที กันเคสไม่มี artwork ของทรงนี้ หรือ FASHN ล่มชั่วคราว)
        }
      }

      const fabricDesc = analysisResult
        ? `${analysisResult.type ?? "ผ้าไทย"} ลาย${analysisResult.pattern ?? "ทอมือ"} โทนสี${analysisResult.tone ?? ""} เทคนิค${analysisResult.technique ?? ""}`.trim()
        : "the Thai fabric shown in the reference image";

      const garmentDesc = describeGarmentShape(shape);

      const subjectInstruction = bodyPhotoUrl
        ? "Using the first reference image as the exact person — preserve their face, hair, skin tone, and body proportions exactly, do not change their identity —"
        : `Generate ${describeBodyBuild(bodyMeasurements!)} as a photorealistic fashion model (not a real specific person, a newly generated model matching these proportions) —`;

      const prompt = [
        subjectInstruction,
        fabricImageUrl ? `and the ${bodyPhotoUrl ? "second" : "first"} reference image as the fabric texture and color reference,` : "",
        `generate a photorealistic full-body fashion photograph of this person wearing ${garmentDesc}, tailored Thai-style, made from ${fabricDesc}`,
        occasion ? `, appropriate for the occasion: ${occasion}` : "",
        `. Camera angle: ${PERSPECTIVE_DESC[perspective]}. Studio lighting, professional fashion photography, plain neutral background, natural standing pose.`,
      ].filter(Boolean).join(" ");

      const filesUrl = [bodyPhotoUrl, fabricImageUrl].filter(Boolean) as string[];

      const result = await generateImage({ prompt, filesUrl, size: "2:3" });
      resolveJob(jobId, { success: true, perspective, ...result });
    } catch (err: any) {
      console.error("[tryon/generate] error:", err.message);
      rejectJob(jobId, err.message ?? "Generation failed");
    }
  })();
});

export default router;
