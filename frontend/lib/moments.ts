/**
 * โมเมนต์ = คอนเทนต์แบบ Lemon8/Pinterest (บทความ/กระทู้/รีวิว/ไอเดียแต่งตัว/เรื่องราวผ้าไทย)
 * ที่ผู้ใช้และทีมงาน LAYA โพสต์แชร์เรื่องราวทรงคุณค่า
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

/** รูปปกสำเร็จรูปให้เลือก */
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
  "/images/Gallery/image copy.webp",
  "/images/Gallery/image copy 5.webp",
  "/images/Gallery/LINE_ALBUM_29669_260724_4.webp",
];

const DAY = 24 * 60 * 60 * 1000;

/** seed: โพสต์เรื่องราวแฟชั่น & มรดกผ้าไทย ผสมผสานเรื่องราวการลงพื้นที่และภาพจริงในคอลเลกชันอย่างสมบูรณ์แบบ */
export const SEED_MOMENTS: Moment[] = [
  {
    id: "story-hackathon-finalist",
    type: "blog",
    title: "นาทีแห่งความภาคภูมิใจ! LAYA คว้า Finalists 3 ทีมสุดท้ายในงาน AI Preneur Day 2026 🏆✨",
    body: "เมื่อนวัตกรรมปัญญาประดิษฐ์ (AI) โคจรมาพบกับมรดกวัฒนธรรมผ้าไทย... ทีม LAYA รู้สึกเป็นเกียรติอย่างยิ่งที่คว้ารางวัล Finalists 3 ทีมสุดท้ายในงาน AI Preneur Day 2026 จากผู้เข้าแข่งขันทั่วประเทศ! พวกเรามุ่งมั่นเปลี่ยนโจทย์หัตถศิลป์ไทยสู่แพลตฟอร์ม AI Fashion Tech เพื่อช่วยเหลือช่างทอชุมชนและยกระดับผ้าไทยสู่อินเตอร์",
    cover: "/images/Gallery/image copy.webp",
    images: ["/images/Gallery/image copy.webp", "/images/Gallery/image copy 2.webp", "/images/Gallery/image.webp"],
    topic: "ผ้าไทย",
    authorName: "LAYA Team",
    official: true,
    likeCount: 142,
    createdAt: Date.now() - 0.2 * DAY,
  },
  {
    id: "story-trakanta-blazer",
    type: "blog",
    title: "สวมสูทผ้ามัดหมี่สตรีทกูตูร์จากแบรนด์ 'ตระการตา' (Trakanta) อุดรธานี 💖",
    body: "เบลเซอร์เข้ารูปตัดเย็บจากผ้ามัดหมี่ทอมือสีน้ำเงินม่วง ลายเรขาคณิตสุดโฉบเฉี่ยวจากแบรนด์ตระการตา (Trakanta) จ.อุดรธานี เปลี่ยนภาพจำผ้าไทยทรงโบราณให้กลายเป็นลุคสมาร์ตเวิร์กกิ้งวูแมนสุดทันสมัย ใส่ไปทำงานทรงพลัง ใส่ไปงานปาร์ตี้ก็โดดเด่น!",
    cover: "/images/Gallery/LINE_ALBUM_29669_260724_4.webp",
    images: ["/images/Gallery/LINE_ALBUM_29669_260724_4.webp", "/images/Gallery/LINE_ALBUM_29669_260724_7.webp", "/images/Gallery/LINE_ALBUM_29669_260724_9.jpg"],
    topic: "ชุดทำงาน",
    authorName: "Trakanta Fashion",
    official: true,
    likeCount: 115,
    createdAt: Date.now() - 0.5 * DAY,
  },
  {
    id: "seed-workwear",
    type: "blog",
    title: "ลุคทำงานแบบไทยโมเดิร์น ผ้าไหมลายขอนครราชสีมา",
    body: "หยิบเบลเซอร์ผ้าไหมลายขอมาจับคู่กระโปรงทรงเอเรียบ ๆ ได้ลุคทำงานที่ดูแพงและยังคงกลิ่นอายไทย เคล็ดลับคือเลือกลายผ้าโทนเดียวทั้งชุดแล้วปล่อยให้เท็กซ์เจอร์ของไหมเป็นพระเอก เหมาะทั้งประชุมและงานเลี้ยงหลังเลิกงาน",
    cover: "/mom1.webp",
    topic: "ชุดทำงาน",
    authorName: "LAYA Stylist",
    official: true,
    likeCount: 88,
    createdAt: Date.now() - 1 * DAY,
  },
  {
    id: "story-artisan-field-work",
    type: "blog",
    title: "ลงพื้นที่สัมผัสภูมิปัญญาช่างทอ ร่วมพูดคุยกับคุณยายใต้ถุนเรือนไทย 🧵👵",
    body: "หนึ่งในวันที่มีความสุขที่สุดของทีมงาน LAYA คือการได้ลงพื้นที่นั่งล้อมวงคุยกับกลุ่มคุณยายช่างทอมืออาชีพใต้ถุนบ้านเรือนไทย คุณยายเล่าให้ฟังตั้งแต่การต้มเส้นไหม การคัดมัดหมี่ทีละเปลาะ ไปจนถึงความประณีตของการเหยียบกี่ทอมือ ทำให้รู้ว่าผ้าไหมมัดหมี่ผืนหนึ่งไม่ได้มีแค่ราคา แต่ทรงคุณค่าและเต็มไปด้วยความอบอุ่น",
    cover: "/images/Gallery/image copy 5.webp",
    topic: "ชุดพื้นเมือง",
    authorName: "LAYA Storyteller",
    official: true,
    likeCount: 96,
    createdAt: Date.now() - 1.2 * DAY,
  },
  {
    id: "story-trakanta-magenta-dress",
    type: "blog",
    title: "เดรสผ้าไหมมัดหมี่สีบานเย็นร่วมสมัย สวยสง่าท้าทุกสายตา ✨💃",
    body: "เดรสผ้าไหมทอมือโทนสีบานเย็นสดใส โดดเด่นด้วยลวดลายมัดหมี่เรขาคณิตประยุกต์ ตัดเย็บสไตล์มินิมอลโมเดิร์นจากช่างฝีมือจังหวัดอุดรธานี สวมใส่ออกงานเลี้ยงคืนสำคัญได้อย่างมั่นใจและทรงเสน่ห์",
    cover: "/images/Gallery/LINE_ALBUM_29669_260724_2.webp",
    images: ["/images/Gallery/LINE_ALBUM_29669_260724_2.webp", "/images/Gallery/LINE_ALBUM_29669_260724_5.webp"],
    topic: "แฟชั่น",
    authorName: "Silk Lover Club",
    official: true,
    likeCount: 108,
    createdAt: Date.now() - 1.5 * DAY,
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
    likeCount: 64,
    createdAt: Date.now() - 1.8 * DAY,
  },
  {
    id: "story-governor-chadchart",
    type: "blog",
    title: "โอกาสอันทรงเกียรติ! ทีม LAYA เข้าพบและนำเสนอแนวคิดมรดกผ้าไทยแก่ท่านผู้ว่าฯ ชัชชาติ 🏛️",
    body: "ได้รับพลังและแรงบันดาลใจเต็มเปี่ยม! ทีมงาน LAYA ได้มีโอกาสเข้าพบและถ่ายภาพร่วมกับคุณชัชชาติ สิทธิพันธุ์ ผู้ว่าราชการกรุงเทพมหานคร เพื่อนำเสนอแนวคิดแพลตฟอร์ม AI เชื่อมโยงผ้าไทยพื้นบ้านกับคนรุ่นใหม่ พร้อมส่งเสริมซอฟต์พาวเวอร์ผ้าไทยไปสู่ระดับโลก",
    cover: "/images/Gallery/image copy 6.webp",
    topic: "แฟชั่น",
    authorName: "LAYA Team",
    official: true,
    likeCount: 156,
    createdAt: Date.now() - 2 * DAY,
  },
  {
    id: "story-celebration-of-silk",
    type: "blog",
    title: "พาชมบรรยากาศนิทรรศการ Celebration of Silk มหกรรมไหมไทยสู่เส้นทางโลก ครั้งที่ 15 🇹🇭✨",
    body: "ตื่นตาตื่นใจกับผลงานการออกแบบชุดราตรีและชุดไทยประยุกต์ร่วมสมัยจากดีไซเนอร์รุ่นใหม่ทั่วโลก การนำผ้ามัดหมี่และผ้ายกทองของช่างฝีมือชั้นครูมาตีความใหม่บนรันเวย์ระดับสากล พิสูจน์ให้เห็นว่าผ้าไหมไทยสวยประณีตติดอันดับโลกจริงๆ",
    cover: "/images/Gallery/LINE_ALBUM_14669_260724_1.webp",
    images: ["/images/Gallery/LINE_ALBUM_14669_260724_1.webp", "/images/Gallery/LINE_ALBUM_14669_260724_2.webp", "/images/Gallery/LINE_ALBUM_14669_260724_3.webp"],
    topic: "แฟชั่น",
    authorName: "Silk Fashion Critic",
    official: true,
    likeCount: 132,
    createdAt: Date.now() - 2.5 * DAY,
  },
  {
    id: "story-bronze-suit",
    type: "review",
    title: "ชุดสูทผ้าไหมมัดหมี่ทองบรอนซ์พรีเมียม ตัดเย็บสุดเนี๊ยบระดับไฮเอนด์ 🧥💫",
    body: "รีวิวชุดสูทผ้าไหมมัดหมี่โทนสีทองบรอนซ์อันเลอค่า ทอลายประณีตระดับครูช่าง ผสมผสานคัตติ้งเนี้ยบกริบสไตล์อิตาเลียน ใส่ไปงานทางการแล้วดูทรงอำนาจและมีรสนิยมลึกล้ำมากๆ",
    cover: "/images/Gallery/LINE_ALBUM_14669_260724_11.webp",
    topic: "ชุดทำงาน",
    authorName: "Master Tailor Review",
    official: true,
    rating: 5,
    likeCount: 124,
    createdAt: Date.now() - 2.8 * DAY,
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
    likeCount: 75,
    createdAt: Date.now() - 3 * DAY,
  },
  {
    id: "story-master-artisan-sisaket",
    type: "blog",
    title: "คุยกับอาจารย์บุญโรช ศรีละพันธ์ — ครูช่างผู้สืบสานมรดกผ้าไหมลูกแก้วย้อมครามแห่งศรีสะเกษ 💙",
    body: "เรื่องราวทรงคุณค่าของอาจารย์บุญโรช ศรีละพันธ์ ครูช่างผ้าไหมแห่ง อ.อุทุมพรพิสัย จ.ศรีสะเกษ ผู้ทุ่มเททั้งชีวิตรักษาเทคนิคการทอผ้าไหมลูกแก้วย้อมครามโบราณ ท่านถ่ายทอดให้ฟังว่า 'การทอผ้าคือการฝึกจิตสมาธิและส่งต่อความรักสู่ผู้สวมใส่'",
    cover: "/images/Gallery/LINE_ALBUM_14669_260724_10.webp",
    images: ["/images/Gallery/LINE_ALBUM_14669_260724_10.webp", "/images/Gallery/LINE_ALBUM_14669_260724_9.webp"],
    topic: "ชุดพื้นเมือง",
    authorName: "Heritage Collector",
    official: true,
    likeCount: 104,
    createdAt: Date.now() - 3.5 * DAY,
  },
  {
    id: "seed-accessories",
    type: "blog",
    title: "ไอเดียแมตช์ผ้าไทยกับ Accessories สุดปัง",
    body: "กระเป๋าผ้าทอลายพื้นเมืองคู่กับแว่นกันแดดทรงคลาสสิกและเครื่องประดับทองอ่อน ๆ — ของชิ้นเล็กที่ทำให้ลุคธรรมดากลายเป็นลุคมีเรื่องราว ลองเริ่มจากกระเป๋าหรือผ้าพันคอก่อนถ้ายังไม่กล้าใส่ผ้าไทยทั้งตัว",
    cover: "/bag1.webp",
    images: ["/bag1.webp", "/bag2.webp"],
    topic: "กระเป๋า",
    authorName: "LAYA Stylist",
    official: true,
    likeCount: 59,
    createdAt: Date.now() - 4 * DAY,
  },
  {
    id: "story-silk-spinning-wheel",
    type: "blog",
    title: "เสน่ห์แห่งภูมิปัญญา: เครื่องหมุนกวักเส้นไหมไม้ยกโบราณ 🧵💫",
    body: "ก่อนที่ผืนผ้าไหมเงางามจะไปอวดลวดลายบนรันเวย์... เบื้องหลังคือเครื่องกวักเส้นไหมไม้ยกโบราณ เครื่องมือพื้นบ้านทรงคุณค่าที่ผ่านกาลเวลามาหลายชั่วอายุคน ทุกรอบของการหมุนคือความใจเย็นและความตั้งใจของช่างฝีมือไทย",
    cover: "/images/Gallery/image copy 7.webp",
    topic: "ผ้าไทย",
    authorName: "Artisan Explorer",
    official: true,
    likeCount: 82,
    createdAt: Date.now() - 4.5 * DAY,
  },
  {
    id: "story-gold-couture-dress",
    type: "blog",
    title: "เดรสผ้ายกทองมัดหมี่ชั้นสูง หัตถศิลป์ทรงคุณค่าระดับพิพิธภัณฑ์ 👑✨",
    body: "ตื่นตะลึงกับเดรสผ้ายกทองมัดหมี่สไตล์กูตูร์ การผสมสอดเส้นทองคำลงในลวดลายมัดหมี่โบราณ สะท้อนความวิจิตรบรรจงและคุณค่าอันประเมินค่าไม่ได้ของผ้าไทยชั้นครู",
    cover: "/images/Gallery/LINE_ALBUM_14669_260724_12.webp",
    images: ["/images/Gallery/LINE_ALBUM_14669_260724_12.webp", "/images/Gallery/LINE_ALBUM_14669_260724_14.webp"],
    topic: "ชุดพื้นเมือง",
    authorName: "Haute Couture Asia",
    official: true,
    likeCount: 118,
    createdAt: Date.now() - 5 * DAY,
  },
  {
    id: "story-surin-prowpha",
    type: "blog",
    title: "พราวผ้า — กลุ่มทอผ้าไหมลายโบราณ จ.สุรินทร์ เสน่ห์สีย้อมธรรมชาติ 🌿",
    body: "พามาอุดหนุนผลงานผ้าไหมทอมือลายโบราณและเสื้อผ้าฝ้ายแต่งลูกไม้สีพาสเทลจากกลุ่มช่างฝีมือ 'พราวผ้า' จังหวัดสุรินทร์ สีย้อมจากเปลือกไม้และครามธรรมชาติ นุ่มนวล ปลอดภัย อบอุ่นหัวใจทุกครั้งที่ได้สวมใส่",
    cover: "/images/Gallery/LINE_ALBUM_14669_260724_4.jpg",
    images: ["/images/Gallery/LINE_ALBUM_14669_260724_4.jpg", "/images/Gallery/LINE_ALBUM_14669_260724_6.webp", "/images/Gallery/LINE_ALBUM_14669_260724_8.webp"],
    topic: "Mix & Match",
    authorName: "Surin Weaver",
    official: true,
    likeCount: 91,
    createdAt: Date.now() - 5.5 * DAY,
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
    likeCount: 68,
    createdAt: Date.now() - 6 * DAY,
  },
  {
    id: "story-pitching-insight",
    type: "blog",
    title: "สรุปเซสชัน Pitching: เปลี่ยนโจทย์ผ้าไทยสู่ธุรกิจ AI Fashion Tech มูลค่าหลายล้าน 💡🚀",
    body: "แชร์ตกผลึกจากเซสชัน Pitching เวทีระดับประเทศ! ทีม LAYA นำเสนอวิธีใช้ AI Generator ลายผ้า และ Virtual Try-On ช่วยยกระดับแบรนด์ผ้าไทย เพิ่มยอดขายให้ชุมชนช่างทอได้จริง การนำเทคโนโลยีมาเสริมมรดกเดิมคือหัวใจสำคัญของการเติบโตยั่งยืน",
    cover: "/images/Gallery/image copy 3.webp",
    topic: "แฟชั่น",
    authorName: "LAYA Founder",
    official: true,
    likeCount: 128,
    createdAt: Date.now() - 6.5 * DAY,
  },
  {
    id: "story-behind-the-scenes",
    type: "blog",
    title: "เบื้องหลังรอยยิ้มและความมุ่งมั่นของทีมผู้ก่อตั้ง LAYA 🤍✨",
    body: "ภาพเก็บตกความประทับใจของพวกเราทีม LAYA ในทุกวันของการลุยงานพัฒนาแพลตฟอร์ม ตั้งแต่เช้าจรดค่ำ เหนื่อยแต่มีความสุขทุกครั้งที่เห็นผลงานผ้าไทยถูกนำเสนออย่างทรงคุณค่า รอยยิ้มของช่างทอคือพลังขับเคลื่อนที่สำคัญที่สุดของเรา",
    cover: "/images/Gallery/image copy 4.webp",
    topic: "OOTD",
    authorName: "LAYA Team",
    official: true,
    likeCount: 110,
    createdAt: Date.now() - 7 * DAY,
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
    likeCount: 54,
    createdAt: Date.now() - 7.5 * DAY,
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
    likeCount: 47,
    createdAt: Date.now() - 8 * DAY,
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
    likeCount: 92,
    createdAt: Date.now() - 8.5 * DAY,
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
    likeCount: 61,
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
    likeCount: 78,
    createdAt: Date.now() - 9.5 * DAY,
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
    likeCount: 89,
    createdAt: Date.now() - 10 * DAY,
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
    likeCount: 42,
    createdAt: Date.now() - 11 * DAY,
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
    likeCount: 51,
    createdAt: Date.now() - 12 * DAY,
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
    likeCount: 58,
    createdAt: Date.now() - 13 * DAY,
  },
];

const STORAGE_KEY = "laya_moments_v3";

export function getAllMoments(): Moment[] {
  if (typeof window === "undefined") return SEED_MOMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const userMoments: Moment[] = raw ? JSON.parse(raw) : [];
    // กรองเอาเฉพาะโพสต์ที่ผู้ใช้สร้างเพิ่มจริงๆ (ไม่เอาโพสต์ seed เก่าที่ติดแคช browser)
    const seedIds = new Set(SEED_MOMENTS.map((s) => s.id));
    const customUserMoments = userMoments.filter((u) => u.id && !seedIds.has(u.id));
    const combined = [...SEED_MOMENTS, ...customUserMoments];
    return combined.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return SEED_MOMENTS;
  }
}

export function getMomentById(id: string): Moment | undefined {
  const all = getAllMoments();
  return all.find((m) => m.id === id);
}

export function saveUserMoment(input: {
  type: MomentType;
  title: string;
  body: string;
  cover: string;
  images?: string[];
  topic: string;
  authorName: string;
  rating?: number;
  taggedProduct?: string;
}): Moment {
  const newMoment: Moment = {
    id: `user-${Date.now()}`,
    type: input.type,
    title: input.title,
    body: input.body,
    cover: input.cover || "/mom1.webp",
    images: input.images?.length ? input.images : undefined,
    topic: input.topic || "ผ้าไทย",
    authorName: input.authorName || "คุณผู้ใช้ LAYA",
    official: false,
    rating: input.rating,
    taggedProduct: input.taggedProduct,
    likeCount: 0,
    createdAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const userMoments: Moment[] = raw ? JSON.parse(raw) : [];
      userMoments.unshift(newMoment);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userMoments));
    } catch (e) {
      console.error("Failed to save user moment:", e);
    }
  }

  return newMoment;
}

export function toggleLike(id: string): boolean {
  if (typeof window === "undefined") return false;
  const liked = loadLikedIds();
  const next = new Set(liked);
  let isNowLiked = false;
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
    isNowLiked = true;
  }
  localStorage.setItem("laya_liked_moments", JSON.stringify(Array.from(next)));
  return isNowLiked;
}

export function loadLikedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("laya_liked_moments");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSave(id: string): boolean {
  if (typeof window === "undefined") return false;
  const saved = loadSavedIds();
  const next = new Set(saved);
  let isNowSaved = false;
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
    isNowSaved = true;
  }
  localStorage.setItem("laya_saved_moments", JSON.stringify(Array.from(next)));
  return isNowSaved;
}

export function loadSavedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("laya_saved_moments");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFollow(authorName: string): boolean {
  if (typeof window === "undefined") return false;
  const list = loadFollowedAuthors();
  const next = new Set(list);
  let isNowFollowed = false;
  if (next.has(authorName)) {
    next.delete(authorName);
  } else {
    next.add(authorName);
    isNowFollowed = true;
  }
  localStorage.setItem("laya_followed_authors", JSON.stringify(Array.from(next)));
  return isNowFollowed;
}

export function loadFollowedAuthors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("laya_followed_authors");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
