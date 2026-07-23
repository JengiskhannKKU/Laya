/**
 * โมเมนต์ = คอนเทนต์แบบ Lemon8/Pinterest (บทความ/กระทู้/รีวิว/ไอเดียแต่งตัว) ที่ผู้ใช้ล็อกอินเขียนได้ — ไม่ใช่สินค้า
 *
 * ยังไม่มี backend สำหรับโพสต์ จึงเก็บโพสต์/ไลก์/บันทึก/ติดตามของผู้ใช้ไว้ใน localStorage (ต้นแบบ) —
 * ข้อมูลจะอยู่แค่ในเบราว์เซอร์เครื่องนั้น ยังไม่ sync ข้ามเครื่อง/ผู้ใช้
 * seed ด้านล่างเป็นคอนเทนต์บรรณาธิการของ LAYA เอง (official) ใช้รูปจริงในเว็บ —
 * ไม่ได้ปลอมเป็นรีวิว/บัญชีของบุคคลจริง
 */

export type MomentType = "blog" | "review";

export interface Moment {
  id: string;
  type: MomentType;
  title: string;
  body: string;
  cover: string;
  /** รูปเพิ่มเติม (>1 = การ์ดแบบ carousel/หลายลุค) */
  images?: string[];
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

/** หัวข้อ (topic) ให้เลือกตอนเขียน + ใช้เป็นชิปกรอง/แฮชแท็กในฟีด */
export const MOMENT_TOPICS = [
  "แฟชั่น",
  "ผ้าไทย",
  "Mix & Match",
  "OOTD",
  "ชุดทำงาน",
  "ชุดพื้นเมือง",
  "กระเป๋า",
  "ดูแลรักษา",
] as const;

/** รูปปกสำเร็จรูปให้เลือก (ต้นแบบ — ยังไม่มีอัปโหลดไฟล์จริง) */
export const COVER_PRESETS = [
  "/mom1.webp",
  "/mom2.webp",
  "/mom3.webp",
  "/mom4.webp",
  "/mom5.webp",
  "/mom6.webp",
  "/images/fabric1.webp",
  "/images/fabric2.webp",
  "/images/fabric4.webp",
  "/teenager1.webp",
  "/bag1.webp",
  "/SILQ1.webp",
];

const DAY = 24 * 60 * 60 * 1000;

/** seed: คอนเทนต์บรรณาธิการของ LAYA (official) — คอนเทนต์แพลตฟอร์ม ไม่ใช่รีวิว/บัญชีปลอมของบุคคล */
export const SEED_MOMENTS: Moment[] = [
  {
    id: "seed-workwear",
    type: "blog",
    title: "ลุคทำงานแบบไทยโมเดิร์น ผ้าไหมลายขอนครราชสีมา",
    body: "หยิบเบลเซอร์ผ้าไหมลายขอมาจับคู่กระโปรงทรงเอเรียบ ๆ ได้ลุคทำงานที่ดูแพงและยังคงกลิ่นอายไทย เคล็ดลับคือเลือกลายผ้าโทนเดียวทั้งชุดแล้วปล่อยให้เท็กซ์เจอร์ของไหมเป็นพระเอก เหมาะทั้งประชุมและงานเลี้ยงหลังเลิกงาน",
    cover: "/mom1.webp",
    topic: "ชุดทำงาน",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 1 * DAY,
  },
  {
    id: "seed-mixmatch-tee",
    type: "blog",
    title: "Mix & Match ผ้าซิ่นกับเสื้อยืดธรรมดา",
    body: "สูตรง่ายที่ไม่มีวันพลาด: ผ้าซิ่นลายจัด + เสื้อยืดสีพื้น + รองเท้าผ้าใบขาว ความคอนทราสต์ระหว่างของทอมือกับสตรีทแวร์ทำให้ลุคดูตั้งใจแต่ไม่พยายามเกินไป ใส่เดินเล่นวันเสาร์หรือไปคาเฟ่ได้สบาย",
    cover: "/mom2.webp",
    topic: "Mix & Match",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 2 * DAY,
  },
  {
    id: "seed-detail-story",
    type: "blog",
    title: "ความงามที่อยู่ในรายละเอียด ทุกลายผ้ามีเรื่องเล่า",
    body: "ก่อนจะเป็นผืนผ้า ลายมัดหมี่แต่ละลายถูกมัดย้อมทีละเส้นด้วยมือ ลายหนึ่งอาจใช้เวลาหลายวันกว่าจะขึ้นกี่ได้ ครั้งต่อไปที่เลือกผ้าไทย ลองถามถึงชื่อลายและที่มา แล้วผ้าผืนนั้นจะไม่ใช่แค่เสื้อผ้า แต่เป็นเรื่องราวที่สวมใส่ได้",
    cover: "/mom3.webp",
    topic: "ผ้าไทย",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 3 * DAY,
  },
  {
    id: "seed-accessories",
    type: "blog",
    title: "ไอเดียแมตช์ผ้าไทยกับ Accessories สุดปัง",
    body: "กระเป๋าผ้าทอลายพื้นเมืองคู่กับแว่นกันแดดทรงคลาสสิกและเครื่องประดับทองอ่อน ๆ — ของชิ้นเล็กที่ทำให้ลุคธรรมดากลายเป็นลุคมีเรื่องราว ลองเริ่มจากกระเป๋าหรือผ้าพันคอก่อนถ้ายังไม่กล้าใส่ผ้าไทยทั้งตัว",
    cover: "/bag1.webp",
    images: ["/bag1.webp", "/bag2.webp"],
    topic: "กระเป๋า",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 4 * DAY,
  },
  {
    id: "seed-dress",
    type: "blog",
    title: "เดรสผ้าไทยสุดเรียบหรู ใส่สบาย ใส่ได้ทุกโอกาส",
    body: "เดรสทรงคลุมเข่าจากผ้าไหมผสมฝ้ายลายพื้นเมืองโทนน้ำตาล เนื้อผ้าพลิ้วไม่ร้อน ทรงเรียบแต่ลายผ้าทำงานหนักให้เอง ใส่ไปงานก็ได้ ใส่เที่ยวเมืองเก่าก็สวย จับคู่รองเท้าส้นเตี้ยกับต่างหูมุกคือจบ",
    cover: "/mom4.webp",
    topic: "แฟชั่น",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 5 * DAY,
  },
  {
    id: "seed-ootd-casual",
    type: "blog",
    title: "OOTD วันสบาย ๆ กับเสื้อคลุมผ้าไทย",
    body: "เสื้อคลุมผ้าฝ้ายทอลายขิดตัวเดียว เปลี่ยนเสื้อยืดกางเกงยีนส์ให้กลายเป็นลุคที่มีคนถามว่าซื้อที่ไหน เลือกตัวที่ทรงโอเวอร์ไซส์นิด ๆ จะได้ใส่ทับได้ทั้งปี",
    cover: "/mom5.webp",
    topic: "OOTD",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 6 * DAY,
  },
  {
    id: "seed-silk-vintage",
    type: "blog",
    title: "ผ้าไหมยกดอก ลายโบราณ สีใหม่มาแรงปีนี้",
    body: "ลายยกดอกที่เคยเห็นแต่ในงานพิธี ตอนนี้ชุมชนทอเริ่มย้อมโทนใหม่ ๆ อย่างชมพูอมม่วงและครีมทอง ทำให้ผ้าลายโบราณเข้ากับตู้เสื้อผ้าสมัยใหม่ได้แบบไม่ต้องพยายาม ใครหาผ้าตัดชุดออกงานอยู่ ลองดูโทนนี้",
    cover: "/mom6.webp",
    topic: "ผ้าไทย",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 7 * DAY,
  },
  {
    id: "seed-5-looks",
    type: "blog",
    title: "5 ไอเดียแต่งตัวด้วยผ้าไทยในชีวิตประจำวัน",
    body: "รวม 5 ลุคจากผ้าไทยที่ใส่ได้จริงทุกวัน — ซิ่นกับเสื้อเชิ้ตขาว, ผ้าพันคอไหมกับเดนิม, เบลเซอร์ลายขอ, กระโปรงป้ายผ้าฝ้าย และเดรสมัดหมี่โทนเอิร์ธ เลื่อนดูครบแล้วจะรู้ว่าผ้าไทยไม่เคยตกเทรนด์",
    cover: "/teenager1.webp",
    images: ["/teenager1.webp", "/teenager2.webp", "/teenager3.webp", "/teenager4.webp", "/teenager5.webp"],
    topic: "Mix & Match",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 8 * DAY,
  },
  {
    id: "seed-linen-work",
    type: "blog",
    title: "ความเรียบง่ายที่มีเสน่ห์ ผ้าฝ้ายทอมือ ใส่สบายทุกวัน",
    body: "เซ็ตผ้าฝ้ายทอมือโทนครีมทั้งชุด ระบายอากาศดีสู้แดดเมืองไทยได้จริง ความไม่เรียบของเนื้อผ้าทอมือคือเสน่ห์ที่ผ้าโรงงานเลียนแบบไม่ได้ เหมาะกับสายมินิมอลที่อยากสนับสนุนงานคราฟต์",
    cover: "/SILQ2.webp",
    topic: "แฟชั่น",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 9 * DAY,
  },
  {
    id: "seed-tone-trend",
    type: "blog",
    title: "โทนสีผ้าไทยยอดนิยมประจำฤดูกาลนี้",
    body: "คราม น้ำตาลดิน ทองอ่อน และชมพูกลีบบัว — สี่โทนที่ชุมชนทอทั่วประเทศย้อมมากที่สุดฤดูกาลนี้ ล้วนเป็นสีย้อมธรรมชาติที่เข้ากันเองได้หมด จับคู่ข้ามโทนได้ไม่มีพลาด",
    cover: "/images/fabric6.webp",
    images: ["/images/fabric6.webp", "/images/fabric4.webp", "/images/fabric2.webp", "/images/fabric5.webp"],
    topic: "ผ้าไทย",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 10 * DAY,
  },
  {
    id: "seed-praewa",
    type: "blog",
    title: "ผ้าแพรวา ราชินีแห่งผ้าไหมอีสาน",
    body: "ผ้าแพรวาขึ้นชื่อเรื่องลวดลายขิดอันซับซ้อนที่ทอด้วยมือล้วน แต่ละผืนใช้เวลาหลายสัปดาห์ ลายดั้งเดิมกว่าสิบลายถูกสืบทอดจากรุ่นสู่รุ่นในชุมชนบ้านเขว้า จังหวัดชัยภูมิ ความวิจิตรของเส้นไหมและการจัดวางลายทำให้ผ้าแพรวาเป็นงานที่คู่ควรกับโอกาสพิเศษที่สุด",
    cover: "/heritage/praewa-shoulder-cloth.webp",
    topic: "ชุดพื้นเมือง",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 11 * DAY,
  },
  {
    id: "seed-kram",
    type: "review",
    title: "รีวิว ผ้าฝ้ายย้อมคราม สีครามแท้ที่ยิ่งใช้ยิ่งสวย",
    body: "ผ้าฝ้ายย้อมครามธรรมชาติจากชุมชนเชียงใหม่ เนื้อผ้านุ่ม ระบายอากาศดี สีครามเข้มสม่ำเสมอและค่อย ๆ เฟดเป็นเอกลักษณ์เมื่อใช้ไปนาน ๆ เหมาะทั้งตัดเสื้อและทำของตกแต่ง คุ้มค่ามากสำหรับคนรักผ้าธรรมชาติ",
    cover: "/images/fabric4.webp",
    topic: "ผ้าไทย",
    authorName: "LAYA",
    official: true,
    rating: 5,
    likeCount: 0,
    createdAt: Date.now() - 12 * DAY,
  },
  {
    id: "seed-care",
    type: "blog",
    title: "ดูแลผ้าทอมือให้อยู่กับเราไปนาน ๆ",
    body: "ผ้าทอมือควรซักมือด้วยน้ำเย็นและน้ำยาซักอ่อนโยน หลีกเลี่ยงการบิดแรง ๆ ตากในที่ร่มให้พ้นแดดจัดเพื่อคงสีธรรมชาติ และรีดด้วยไฟอ่อนขณะผ้าหมาด เพียงเท่านี้ผ้าผืนโปรดก็จะสวยงามไปได้อีกหลายปี",
    cover: "/heritage/weaving-hands-mudmee.webp",
    topic: "ดูแลรักษา",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 13 * DAY,
  },
  {
    id: "seed-kinnari",
    type: "review",
    title: "ผ้าไหมยกลายกินรีหริภุญชัย งานลำพูนที่ต้องมี",
    body: "ลายกินรีอันวิจิตรเล่าตำนานนางกินรีและหงส์ลำพูน ทอยกด้วยเทคนิคชั้นสูง เนื้อไหมเงางามจับแล้วรู้เลยว่าเป็นงานฝีมือระดับพรีเมียม เหมาะกับชุดไทยงานพิธีการ",
    cover: "/images/fabric1.webp",
    topic: "ชุดพื้นเมือง",
    authorName: "LAYA",
    official: true,
    rating: 4.8,
    likeCount: 0,
    createdAt: Date.now() - 14 * DAY,
  },
  {
    id: "seed-style",
    type: "blog",
    title: "แต่งลุคผ้าไทยให้ร่วมสมัย ใส่ได้ทุกวัน",
    body: "ใครว่าผ้าไทยใส่ได้แค่งานพิธี? ลองจับผ้าซิ่นมาแมตช์กับเสื้อยืดเรียบ ๆ หรือใช้ผ้าพันคอไหมเพิ่มสีสันให้ลุคเดนิม การผสมผ้าไทยกับเสื้อผ้าสมัยใหม่ช่วยให้มรดกวัฒนธรรมมีที่ยืนในชีวิตประจำวันอย่างมีสไตล์",
    cover: "/SILQ3.webp",
    topic: "OOTD",
    authorName: "LAYA",
    official: true,
    likeCount: 0,
    createdAt: Date.now() - 15 * DAY,
  },
];

const STORAGE_KEY = "laya_moments_v1";
const LIKES_KEY = "laya_moment_likes_v1";
const SAVES_KEY = "laya_moment_saves_v1";
const FOLLOWS_KEY = "laya_moment_follows_v1";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* เต็มหรือปิด localStorage — ต้นแบบ ปล่อยผ่าน */
  }
}

/** สลับสมาชิกใน set ที่เก็บเป็น array ใน localStorage — คืน array ใหม่ */
function toggleInSet(key: string, value: string): string[] {
  const set = new Set(readJSON<string[]>(key, []));
  if (set.has(value)) set.delete(value);
  else set.add(value);
  const next = Array.from(set);
  writeJSON(key, next);
  return next;
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
  /** รูปทั้งหมดของโพสต์ (รวม cover) — ถ้ามีมากกว่า 1 รูป โพสต์จะแสดงเป็นการ์ดแบบ carousel ในฟีด */
  images?: string[];
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
  writeJSON(STORAGE_KEY, next);
  return getAllMoments();
}

export function loadLikedIds(): string[] {
  return readJSON<string[]>(LIKES_KEY, []);
}

/** สลับไลก์ (localStorage) — คืน set ใหม่ของ id ที่ไลก์ */
export function toggleLike(id: string): string[] {
  return toggleInSet(LIKES_KEY, id);
}

export function loadSavedIds(): string[] {
  return readJSON<string[]>(SAVES_KEY, []);
}

/** สลับบันทึกเข้าคอลเลกชัน (localStorage) — คืน set ใหม่ของ id ที่บันทึก */
export function toggleSave(id: string): string[] {
  return toggleInSet(SAVES_KEY, id);
}

export function loadFollowedAuthors(): string[] {
  return readJSON<string[]>(FOLLOWS_KEY, []);
}

/** สลับติดตามผู้เขียน (localStorage) — คืน set ใหม่ของชื่อผู้เขียนที่ติดตาม */
export function toggleFollow(authorName: string): string[] {
  return toggleInSet(FOLLOWS_KEY, authorName);
}
