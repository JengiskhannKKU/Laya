/**
 * โมเมนต์ = คอนเทนต์แบบ Lemon8 (บทความ/กระทู้/รีวิว) ที่ผู้ใช้ล็อกอินเขียนได้ — ไม่ใช่สินค้า
 *
 * ยังไม่มี backend สำหรับโพสต์ จึงเก็บโพสต์ของผู้ใช้ไว้ใน localStorage (ต้นแบบ) —
 * โพสต์จริงจะอยู่แค่ในเบราว์เซอร์เครื่องนั้น ยังไม่ sync ข้ามเครื่อง/ผู้ใช้
 * seed ด้านล่างเป็นคอนเทนต์บรรณาธิการของ LAYA เอง (official) ใช้รูปจริงในเว็บ —
 * ไม่ได้ปลอมเป็นรีวิวของผู้ใช้รายบุคคล
 */

export type MomentType = "blog" | "review";

export interface Moment {
  id: string;
  type: MomentType;
  title: string;
  body: string;
  cover: string;
  topic: string;
  authorName: string;
  /** true = คอนเทนต์ทางการของ LAYA (seed) */
  official?: boolean;
  /** เฉพาะรีวิว */
  rating?: number;
  taggedProduct?: string;
  likeCount: number;
  createdAt: number;
}

/** หัวข้อ (topic) ให้เลือกตอนเขียน + ใช้เป็นชิปกรองในฟีด */
export const MOMENT_TOPICS = ["ผ้าไหม", "ผ้าฝ้าย", "แฟชั่น", "ดูแลรักษา", "ทั่วไป"] as const;

/** รูปปกสำเร็จรูปให้เลือก (ต้นแบบ — ยังไม่มีอัปโหลดไฟล์จริง) */
export const COVER_PRESETS = [
  "/images/fabric1.webp",
  "/images/fabric2.webp",
  "/images/fabric3.webp",
  "/images/fabric4.webp",
  "/images/fabric5.webp",
  "/teenager1.webp",
];

const DAY = 24 * 60 * 60 * 1000;

/** seed: บทความ/รีวิวบรรณาธิการของ LAYA เอง (official) — คอนเทนต์แพลตฟอร์ม ไม่ใช่รีวิวปลอมของบุคคล */
export const SEED_MOMENTS: Moment[] = [
  {
    id: "seed-praewa",
    type: "blog",
    title: "ผ้าแพรวา ราชินีแห่งผ้าไหมอีสาน",
    body: "ผ้าแพรวาขึ้นชื่อเรื่องลวดลายขิดอันซับซ้อนที่ทอด้วยมือล้วน แต่ละผืนใช้เวลาหลายสัปดาห์ ลายดั้งเดิมกว่าสิบลายถูกสืบทอดจากรุ่นสู่รุ่นในชุมชนบ้านเขว้า จังหวัดชัยภูมิ ความวิจิตรของเส้นไหมและการจัดวางลายทำให้ผ้าแพรวาเป็นงานที่คู่ควรกับโอกาสพิเศษที่สุด",
    cover: "/images/fabric5.webp",
    topic: "ผ้าไหม",
    authorName: "LAYA",
    official: true,
    likeCount: 128,
    createdAt: Date.now() - 1 * DAY,
  },
  {
    id: "seed-kram",
    type: "review",
    title: "รีวิว ผ้าฝ้ายย้อมคราม สีครามแท้ที่ยิ่งใช้ยิ่งสวย",
    body: "ผ้าฝ้ายย้อมครามธรรมชาติจากชุมชนเชียงใหม่ เนื้อผ้านุ่ม ระบายอากาศดี สีครามเข้มสม่ำเสมอและค่อย ๆ เฟดเป็นเอกลักษณ์เมื่อใช้ไปนาน ๆ เหมาะทั้งตัดเสื้อและทำของตกแต่ง คุ้มค่ามากสำหรับคนรักผ้าธรรมชาติ",
    cover: "/images/fabric4.webp",
    topic: "ผ้าฝ้าย",
    authorName: "LAYA",
    official: true,
    rating: 5,
    likeCount: 96,
    createdAt: Date.now() - 2 * DAY,
  },
  {
    id: "seed-care",
    type: "blog",
    title: "ดูแลผ้าทอมือให้อยู่กับเราไปนาน ๆ",
    body: "ผ้าทอมือควรซักมือด้วยน้ำเย็นและน้ำยาซักอ่อนโยน หลีกเลี่ยงการบิดแรง ๆ ตากในที่ร่มให้พ้นแดดจัดเพื่อคงสีธรรมชาติ และรีดด้วยไฟอ่อนขณะผ้าหมาด เพียงเท่านี้ผ้าผืนโปรดก็จะสวยงามไปได้อีกหลายปี",
    cover: "/images/fabric3.webp",
    topic: "ดูแลรักษา",
    authorName: "LAYA",
    official: true,
    likeCount: 74,
    createdAt: Date.now() - 3 * DAY,
  },
  {
    id: "seed-kinnari",
    type: "review",
    title: "ผ้าไหมยกลายกินรีหริภุญชัย งานลำพูนที่ต้องมี",
    body: "ลายกินรีอันวิจิตรเล่าตำนานนางกินรีและหงส์ลำพูน ทอยกด้วยเทคนิคชั้นสูง เนื้อไหมเงางามจับแล้วรู้เลยว่าเป็นงานฝีมือระดับพรีเมียม เหมาะกับชุดไทยงานพิธีการ",
    cover: "/images/fabric1.webp",
    topic: "ผ้าไหม",
    authorName: "LAYA",
    official: true,
    rating: 4.8,
    likeCount: 143,
    createdAt: Date.now() - 4 * DAY,
  },
  {
    id: "seed-style",
    type: "blog",
    title: "แต่งลุคผ้าไทยให้ร่วมสมัย ใส่ได้ทุกวัน",
    body: "ใครว่าผ้าไทยใส่ได้แค่งานพิธี? ลองจับผ้าซิ่นมาแมตช์กับเสื้อยืดเรียบ ๆ หรือใช้ผ้าพันคอไหมเพิ่มสีสันให้ลุคเดนิม การผสมผ้าไทยกับเสื้อผ้าสมัยใหม่ช่วยให้มรดกวัฒนธรรมมีที่ยืนในชีวิตประจำวันอย่างมีสไตล์",
    cover: "/teenager1.webp",
    topic: "แฟชั่น",
    authorName: "LAYA",
    official: true,
    likeCount: 201,
    createdAt: Date.now() - 5 * DAY,
  },
];

const STORAGE_KEY = "laya_moments_v1";
const LIKES_KEY = "laya_moment_likes_v1";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** โพสต์ของผู้ใช้ (localStorage) — ใหม่สุดก่อน */
export function loadUserMoments(): Moment[] {
  return readJSON<Moment[]>(STORAGE_KEY, []);
}

/** โพสต์ทั้งหมด = โพสต์ผู้ใช้ + seed บรรณาธิการ เรียงใหม่→เก่า */
export function getAllMoments(): Moment[] {
  return [...loadUserMoments(), ...SEED_MOMENTS].sort((a, b) => b.createdAt - a.createdAt);
}

/** หาโมเมนต์ตาม id (รวม seed + โพสต์ผู้ใช้ใน localStorage) */
export function getMomentById(id: string): Moment | undefined {
  return getAllMoments().find((m) => m.id === id);
}

export interface NewMomentInput {
  type: MomentType;
  title: string;
  body: string;
  cover: string;
  topic: string;
  rating?: number;
  taggedProduct?: string;
  authorName: string;
}

/** บันทึกโพสต์ใหม่ลง localStorage แล้วคืนรายการโพสต์ทั้งหมดที่อัปเดตแล้ว */
export function saveUserMoment(input: NewMomentInput): Moment[] {
  const moment: Moment = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    likeCount: 0,
    createdAt: Date.now(),
    ...input,
  };
  const next = [moment, ...loadUserMoments()];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* เต็มหรือปิด localStorage — ต้นแบบ ปล่อยผ่าน */
    }
  }
  return getAllMoments();
}

export function loadLikedIds(): string[] {
  return readJSON<string[]>(LIKES_KEY, []);
}

/** สลับไลก์ (localStorage) — คืน set ใหม่ของ id ที่ไลก์ */
export function toggleLike(id: string): string[] {
  const set = new Set(loadLikedIds());
  if (set.has(id)) set.delete(id);
  else set.add(id);
  const next = Array.from(set);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LIKES_KEY, JSON.stringify(next));
    } catch {
      /* ต้นแบบ */
    }
  }
  return next;
}
