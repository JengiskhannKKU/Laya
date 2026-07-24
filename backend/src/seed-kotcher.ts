import dotenv from "dotenv";
dotenv.config();
import { pool } from "./db";

export const kotcherProducts = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'เสื้อแจ็คเก็ตลายมัดหมี่หัวใจทูโทน "Kotcher Heart Mudmee"',
    name_en: "Kotcher Heart Mudmee Two-Tone Jacket",
    description:
      "เสื้อแจ็คเก็ตทรงคอกลมตัดเย็บพิถีพิถันจากผ้าไหมมัดหมี่ลายหัวใจทูโทนสีเทา-ชมพู ตกแต่งขอบสีชมพูพาสเทลและกระดุมโลหะสีทองรูปหัวใจ ดีไซน์ผสมผสานความร่วมสมัยกับความประณีตของงานทอมือไทยได้อย่างลงตัว",
    description_en:
      "Elegantly tailored round-neck jacket crafted from two-tone grey & pink heart mudmee silk fabric, featuring pastel pink trims and golden heart-shaped metal buttons.",
    category: "clothing",
    price: 4890,
    price_unit: "ชิ้น",
    stock: 12,
    fabric_type: "ผ้าไหมมัดหมี่",
    has_gi: true,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_1.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'สูทเบลเซอร์มัดหมี่กระดุมคู่ "Monochrome Mudmee Double Suit"',
    name_en: "Monochrome Mudmee Double-Breasted Suit",
    description:
      "สูทเบลเซอร์กระดุมคู่ลายมัดหมี่ขาว-ดำ สไตล์เทเลอร์หรูหรา ปกคอเทเลอร์ (Notched Lapel) ตัดเย็บเข้ารูป มีกระเป๋าข้างพร้อมฝาปิด เหมาะสำหรับการแต่งตัวลุคสมาร์ทบิสซิเนสและงานที่เป็นทางการ",
    description_en:
      "Sophisticated double-breasted blazer tailored from black & white monochrome mudmee silk, featuring notched lapels and flap pockets for a smart business look.",
    category: "clothing",
    price: 5900,
    price_unit: "ชิ้น",
    stock: 8,
    fabric_type: "ผ้าไหมมัดหมี่",
    has_gi: false,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_2.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'เสื้อแจ็คเก็ตผ้าไหมลายริ้วพาสเทลกระดุมมุก "Pastel Sunrise Silk Jacket"',
    name_en: "Pastel Sunrise Handwoven Silk Jacket",
    description:
      "เสื้อแจ็คเก็ตแขนยาวคอกลมผ้าไหมทอมือลายริ้วสีพาสเทล (ชมพู, เขียว, ส้มอ่อน, ม่วง) ตกแต่งกระดุมมุกเม็ดโตขอบทอง เสริมลุคหวานละมุน มีคลาส สวมใส่สบาย เหมาะสำหรับทุกโอกาส",
    description_en:
      "Long-sleeved round-neck jacket woven with pastel stripe silk yarns (pink, mint green, soft peach, purple), accented with gold-bordered pearl buttons.",
    category: "clothing",
    price: 4250,
    price_unit: "ชิ้น",
    stock: 15,
    fabric_type: "ผ้าไหมทอมือ",
    has_gi: true,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_3.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'เบลเซอร์เอวลอยผ้าไหมสีชมพู "Chic Pink Silk Crop Blazer"',
    name_en: "Chic Pink Silk Crop Blazer",
    description:
      "เสื้อเบลเซอร์ทรงเอวลอย (Crop Blazer) ลายผ้าไหมชมพูไล่เฉดสีพาสเทลช่วงลำตัว แขนและปกเสื้อสีชมพูนู้ดเรียบหรู เสริมความสดใส ทันสมัยแมตช์เข้ากับกางเกงเอวสูงหรือกระโปรงได้อย่างเพอร์เฟกต์",
    description_en:
      "Modern cropped blazer featuring gradient pastel pink Thai silk pattern across the torso, paired with solid nude-pink lapels and long sleeves.",
    category: "clothing",
    price: 3950,
    price_unit: "ชิ้น",
    stock: 10,
    fabric_type: "ผ้าไหมทอมือ",
    has_gi: true,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_4.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'กระเป๋าถือผ้าไหมมัดหมี่สีเหลืองเลมอน "Lemon Silk Mudmee Handbag"',
    name_en: "Lemon Silk Mudmee Leather Handbag",
    description:
      "กระเป๋าถือทรงโบว์ลิ่งผ้าไหมมัดหมี่ทอมือสีเหลืองพาสเทลตัดสลับลายมัดหมี่ขาว ตัดแต่งด้วยหนังพรีเมียมสีเหลืองสดใส พร้อมกระเป๋าใส่เหรียญทรงกลมเข้าชุดและสายสะพายไหล่กว้าง",
    description_en:
      "Vibrant bowling-shaped handbag crafted from lemon yellow mudmee woven silk and premium yellow leather trim, accompanied by a matching circular coin pouch.",
    category: "bag",
    price: 2890,
    price_unit: "ใบ",
    stock: 20,
    fabric_type: "ผ้าไหมมัดหมี่",
    has_gi: false,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_5.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'กระเป๋าถือผ้าทอลายขัดสีน้ำตาลช็อกโกแลต "Chocolate Basketweave Tote"',
    name_en: "Chocolate Basketweave Silk Tote Bag",
    description:
      "กระเป๋าถือผ้าไหมทอลายขัดสีน้ำตาลช็อกโกแลตโทนเข้ม หรูหราคลาสสิก พร้อมพวงกุญแจเชือกถักประดับมุกและกระเป๋าเหรียญหนังสีน้ำตาลขนาดเล็ก จุของได้เยอะ เหมาะสำหรับการใช้งานประจำวัน",
    description_en:
      "Classic deep chocolate brown tote featuring textured silk basketweave pattern, genuine leather handles, pearl charm attachment, and detachable round coin zip pouch.",
    category: "bag",
    price: 3150,
    price_unit: "ใบ",
    stock: 14,
    fabric_type: "ผ้าไหมทอมือ",
    has_gi: false,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_6.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'กระเป๋าถือผ้าไหมมัดหมี่สีชมพูขอบดำ "Rose Silk Black Edging Handbag"',
    name_en: "Rose Silk Black Edging Handbag",
    description:
      "กระเป๋าถือทรงครึ่งวงกลมตัดเย็บจากผ้าไหมมัดหมี่สีชมพูกลีบบัว ลวดลายมัดหมี่ไทยดั้งเดิม กุนขอบและสายสะพายด้วยหนังสีดำเพิ่มความโดดเด่นตัดกันอย่างลงตัว มาพร้อมกระเป๋าเหรียญสีดำเข้าชุด",
    description_en:
      "Elegant lotus pink mudmee silk handbag trimmed with sleek black leather borders, double shoulder straps, and a matching black coin purse.",
    category: "bag",
    price: 2990,
    price_unit: "ใบ",
    stock: 18,
    fabric_type: "ผ้าไหมมัดหมี่",
    has_gi: true,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_7.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'กระเป๋าถือผ้าทอลายสก๊อตสีเขียว-เหลือง "Olive Plaid Woven Handbag"',
    name_en: "Olive Plaid Woven Silk Handbag",
    description:
      "กระเป๋าถือทรงโบว์ลิ่งผ้าทอมือลายตารางสก๊อตสีเขียวไพลตัดเหลืองมัสตาร์ด แต่งขอบหนังสีน้ำตาลเข้ม ให้ความรู้สึกสตรีทแฟชั่นผสมผสานกลิ่นอายคราฟต์พื้นบ้าน สะพายคล่องตัว",
    description_en:
      "Casual chic bowling handbag with olive green and mustard yellow plaid handwoven silk fabric, structured dark brown leather piping, and a mini coin charm.",
    category: "bag",
    price: 2650,
    price_unit: "ใบ",
    stock: 25,
    fabric_type: "ผ้าฝ้ายผสมไหม",
    has_gi: false,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_8.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'กระเป๋าถือผ้าไหมมัดหมี่สีชมพูโรสโกลด์ "Rose Gold Silk Mudmee Bag"',
    name_en: "Rose Gold Silk Mudmee Luxury Bag",
    description:
      "กระเป๋าถือเรียบหรูสีชมพูโรสโกลด์ ผลิตจากผ้าไหมมัดหมี่ทอมือเส้นไหมแท้ละเอียด คุมโทนสีชมพูนุ่มนวล สายสะพายยาวหนังนุ่มน่าสัมผัส พร้อมแท็กป้ายแบรนด์ Kotcher และกระเป๋าเหรียญสีชมพูเข้าชุด",
    description_en:
      "Luxurious rose gold pink handbag crafted from premium fine-spun mudmee silk and supple pink leather, featuring an embossed logo tag and coin holder.",
    category: "bag",
    price: 3350,
    price_unit: "ใบ",
    stock: 16,
    fabric_type: "ผ้าไหมมัดหมี่",
    has_gi: true,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_9.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'กระเป๋าสะพายผ้าไหมสีชมพูหูหิ้วเขียวมะนาว "Pink & Lime Duo Silk Bag"',
    name_en: "Pink & Lime Duo Silk Handbag",
    description:
      "กระเป๋าสะพายผ้าไหมมัดหมี่สีชมพูสดใส ตัดโทนด้วยหูหิ้วและขอบหนังสีเขียวมะนาว (Lime Green) เพิ่มความสนุกสนานขี้เล่น มีพวงกุญแจดอกไม้และกระเป๋าเหรียญสีเขียวเข้าชุด",
    description_en:
      "Playful duo-tone handbag blending vibrant pink mudmee silk with pop-color lime green leather handles, complete with a yellow flower accessory and green pouch.",
    category: "bag",
    price: 2950,
    price_unit: "ใบ",
    stock: 11,
    fabric_type: "ผ้าไหมมัดหมี่",
    has_gi: true,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_10.webp"],
  },
  {
    id: "10000000-0000-4000-8000-000000000011",
    shop_id: "8fb8c465-e62a-43a7-9007-2f79ad78b5e0",
    name: 'กระเป๋าสะพายผ้าไหมมัดหมี่สีเขียวมะนาว "Full Lime Mudmee Silk Bag"',
    name_en: "Full Lime Mudmee Silk Shoulder Bag",
    description:
      "กระเป๋าสะพายทรงสวยสีเขียวมะนาวออร่า ผ้าไหมมัดหมี่ทอมือลายลูกแก้วผสมมัดหมี่โทนสีเขียว-ทอง สายสะพายยาวสะพายไหล่สะดวก พร้อมกระเป๋าใส่เหรียญทรงกลมเข้าชุด เพิ่มความมั่นใจโดดเด่นในทุกวัน",
    description_en:
      "Eye-catching shoulder bag in electric lime green, showcasing diamond mudmee silk weaving, matching lime leather straps, and an attached coin purse.",
    category: "bag",
    price: 3100,
    price_unit: "ใบ",
    stock: 14,
    fabric_type: "ผ้าไหมมัดหมี่",
    has_gi: true,
    images: ["/images/photo/LINE_ALBUM_ภาพสินค้า_260723_11.webp"],
  },
];

async function run() {
  console.log("🚀 Upserting 11 Kotcher products into DB...");
  for (const p of kotcherProducts) {
    await pool.query(
      `INSERT INTO products (
        id, shop_id, name, name_en, description, description_en, category, price, price_unit, stock, fabric_type, has_gi, images, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        name_en = EXCLUDED.name_en,
        description = EXCLUDED.description,
        description_en = EXCLUDED.description_en,
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        price_unit = EXCLUDED.price_unit,
        stock = EXCLUDED.stock,
        fabric_type = EXCLUDED.fabric_type,
        has_gi = EXCLUDED.has_gi,
        images = EXCLUDED.images,
        is_active = true`,
      [
        p.id,
        p.shop_id,
        p.name,
        p.name_en,
        p.description,
        p.description_en,
        p.category,
        p.price,
        p.price_unit,
        p.stock,
        p.fabric_type,
        p.has_gi,
        p.images,
      ]
    );
  }
  console.log("✅ Successfully seeded all 11 Kotcher products!");
  process.exit(0);
}

if (require.main === module) {
  run().catch((err) => {
    console.error("❌ Error seeding products:", err);
    process.exit(1);
  });
}
