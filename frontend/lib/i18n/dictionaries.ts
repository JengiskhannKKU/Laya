export type Locale = "th" | "en";

export const locales: Locale[] = ["th", "en"];
export const defaultLocale: Locale = "th";

const th = {
  nav: {
    home: "หน้าหลัก",
    explore: "สำรวจ",
    categories: "หมวดหมู่",
    community: "ชุมชน",
    services: "สั่งตัด/สั่งทอ",
    login: "เข้าสู่ระบบ",
    search: "ค้นหา",
    wishlist: "รายการโปรด",
    cart: "ตะกร้าสินค้า",
    messages: "ข้อความ",
  },
  bottomNav: {
    home: "หน้าหลัก",
    community: "ชุมชน",
    services: "สั่งตัด/ทอ",
    categories: "หมวดหมู่",
    profile: "โปรไฟล์",
  },
  common: {
    seeAll: "ดูทั้งหมด",
  },
  home: {
    hero: {
      eyebrow: "The LAYA Marketplace",
      title: "ผ้าไทยทอมือ",
      accent: "A Curated Heritage Collection",
      subtitle:
        "เลือกสรรผ้าทอมือจากชุมชนช่างฝีมือทั่วไทย — สั่งตัด สั่งทอ และสะสมลวดลายอันเป็นเอกลักษณ์",
      searchPlaceholder: "ค้นหาผ้าไหม ชุมชนทอผ้า หรือลวดลาย…",
      searchButton: "ค้นหา",
      popular: "ยอดนิยม",
      tags: ["ผ้าไหม", "ผ้าฝ้าย", "คราม", "กระเป๋า", "ผ้าทอมือ", "Community Collection"],
    },
    banner: {
      featured: "Featured Collection",
    },
    mission: {
      quote:
        "“แพลตฟอร์ม Laya มีเป้าหมายในการต่อยอดพระราชปณิธานในการอนุรักษ์และส่งเสริมผ้าไหมไทย”",
    },
    category: {
      eyebrow: "Browse",
      title: "หมวดหมู่",
      subtitle: "Explore by craft and creation",
    },
    recommended: {
      eyebrow: "Curated",
      title: "คัดสรรสำหรับคุณ",
      subtitle: "Handpicked based on your interests",
    },
    editorial: {
      eyebrow: "The Heritage Collection",
      title: "The Story Behind Thai Silk",
      body: "ผ้าไหมไทยแต่ละผืนคือเรื่องราวของช่างทอที่สืบทอดภูมิปัญญาผ่านหลายชั่วอายุคน จากเส้นใยธรรมชาติ สีย้อมจากพืชพรรณ สู่ลวดลายที่บอกเล่าตัวตนของแต่ละชุมชน",
      cta: "อ่านเรื่องราว",
    },
    communities: {
      eyebrow: "Community",
      title: "ชุมชนทอผ้า",
      subtitle: "Discover authentic weaving villages across Thailand",
      products: "ผลิตภัณฑ์",
    },
    inspiration: {
      eyebrow: "Our Inspiration",
      title: "แรงบันดาลใจของ Laya",
      tag: "โครงการในพระราชดำริ",
      heading: "แรงบันดาลใจของ Laya",
      body: "จากพระราชดำริ…สู่ผ้าไหมที่คุณออกแบบได้วันนี้",
    },
  },
  footer: {
    tagline: "Fashion Tech Marketplace ที่เชื่อมโยงผู้บริโภค นักออกแบบ ช่างทอ และชุมชนผ้าไทยผ่านเทคโนโลยี AI",
    marketplace: {
      label: "Marketplace",
      exploreProducts: "สำรวจสินค้า",
      categories: "หมวดหมู่",
      newArrivals: "สินค้าใหม่",
      wishlist: "Wishlist",
    },
    services: {
      label: "บริการ",
      tailorWeave: "สั่งตัด / สั่งทอ",
      designClothes: "ออกแบบเสื้อผ้า",
      aiTryOn: "AI Try-On",
      aiPattern: "AI ออกแบบลาย",
    },
    community: {
      label: "ชุมชน",
      community: "Community",
      designers: "นักออกแบบ",
      weavers: "ช่างทอ",
      heritage: "ผ้าไทย Heritage",
    },
    merchant: {
      label: "สำหรับร้านค้า",
      openShop: "เปิดร้านค้า",
      manageShop: "จัดการร้าน",
      trackOrders: "ติดตามออเดอร์",
    },
    legal: {
      label: "About",
      privacyPolicy: "นโยบายความเป็นส่วนตัว",
      terms: "ข้อกำหนดการใช้งาน",
    },
    copyright: "© 2026 LAYA. All Rights Reserved.",
    slogan: "Every Pattern Tells a Story.  Preserving Thai Heritage Through Technology.",
  },
} as const;

const en = {
  nav: {
    home: "Home",
    explore: "Explore",
    categories: "Categories",
    community: "Community",
    services: "Tailor/Weave",
    login: "Log in",
    search: "Search",
    wishlist: "Wishlist",
    cart: "Cart",
    messages: "Messages",
  },
  bottomNav: {
    home: "Home",
    community: "Community",
    services: "Tailor/Weave",
    categories: "Categories",
    profile: "Profile",
  },
  common: {
    seeAll: "See all",
  },
  home: {
    hero: {
      eyebrow: "The LAYA Marketplace",
      title: "Handwoven Thai Fabric",
      accent: "A Curated Heritage Collection",
      subtitle:
        "Curated handwoven fabric from artisan communities across Thailand — order tailoring, order weaving, and collect signature patterns",
      searchPlaceholder: "Search Thai silk, weaving communities, or patterns…",
      searchButton: "Search",
      popular: "Popular",
      tags: ["Thai Silk", "Cotton", "Indigo", "Bags", "Handwoven", "Community Collection"],
    },
    banner: {
      featured: "Featured Collection",
    },
    mission: {
      quote:
        "“The Laya platform aims to carry forward the royal vision of preserving and promoting Thai silk.”",
    },
    category: {
      eyebrow: "Browse",
      title: "Categories",
      subtitle: "Explore by craft and creation",
    },
    recommended: {
      eyebrow: "Curated",
      title: "Curated For You",
      subtitle: "Handpicked based on your interests",
    },
    editorial: {
      eyebrow: "The Heritage Collection",
      title: "The Story Behind Thai Silk",
      body: "Every piece of Thai silk tells the story of weavers who have passed down their craft through generations — from natural fibers and plant-based dyes to patterns that speak to each community's identity.",
      cta: "Read the story",
    },
    communities: {
      eyebrow: "Community",
      title: "Weaving Communities",
      subtitle: "Discover authentic weaving villages across Thailand",
      products: "products",
    },
    inspiration: {
      eyebrow: "Our Inspiration",
      title: "The Inspiration Behind Laya",
      tag: "A Royal Initiative Project",
      heading: "The Inspiration Behind Laya",
      body: "From a royal initiative… to Thai silk you can design today.",
    },
  },
  footer: {
    tagline: "A Fashion Tech Marketplace connecting consumers, designers, weavers, and Thai fabric communities through AI technology",
    marketplace: {
      label: "Marketplace",
      exploreProducts: "Explore Products",
      categories: "Categories",
      newArrivals: "New Arrivals",
      wishlist: "Wishlist",
    },
    services: {
      label: "Services",
      tailorWeave: "Tailor / Weave",
      designClothes: "Design Clothing",
      aiTryOn: "AI Try-On",
      aiPattern: "AI Pattern Design",
    },
    community: {
      label: "Community",
      community: "Community",
      designers: "Designers",
      weavers: "Weavers",
      heritage: "Thai Fabric Heritage",
    },
    merchant: {
      label: "For Merchants",
      openShop: "Open a Shop",
      manageShop: "Manage Shop",
      trackOrders: "Track Orders",
    },
    legal: {
      label: "About",
      privacyPolicy: "Privacy Policy",
      terms: "Terms of Use",
    },
    copyright: "© 2026 LAYA. All Rights Reserved.",
    slogan: "Every Pattern Tells a Story.  Preserving Thai Heritage Through Technology.",
  },
} as const;

export const dictionaries = { th, en };

export type Dictionary = typeof th;
