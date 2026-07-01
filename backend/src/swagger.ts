import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LAYA API",
      version: "1.0.0",
      description: "LAYA Thai Textile Marketplace — REST API",
      contact: { name: "LAYA Dev Team" },
    },
    servers: [
      { url: "http://localhost:4000", description: "Local" },
      { url: "https://api.laya.th", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "string", example: "prod_001" },
            name: { type: "string", example: "ผ้าไหมมัดหมี่ ลายขอ" },
            community: { type: "string", example: "ชุมชนบ้านเชียง" },
            province: { type: "string", example: "อุดรธานี" },
            price: { type: "number", example: 1200 },
            priceUnit: { type: "string", example: "เมตร" },
            rating: { type: "number", example: 4.8 },
            reviewCount: { type: "integer", example: 42 },
            images: { type: "array", items: { type: "string" }, example: ["/p1.jpg"] },
            hasGI: { type: "boolean", example: true },
            productionTime: { type: "string", example: "2-3 สัปดาห์" },
            availableLength: { type: "number", example: 50 },
            fabricType: { type: "string", example: "ผ้าไหม" },
            story: { type: "string" },
            weaverName: { type: "string", example: "แม่บัวผัน สีทอง" },
            certificateId: { type: "string", example: "GI-TH-001" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "ผ้าไหม" },
            icon: { type: "string", example: "🧵" },
          },
        },
        Banner: {
          type: "object",
          properties: {
            id: { type: "string" },
            image: { type: "string" },
            title: { type: "string" },
            subtitle: { type: "string" },
          },
        },
        Community: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "ชุมชนทอผ้าเชียงใหม่" },
            province: { type: "string", example: "เชียงใหม่" },
            image: { type: "string" },
            memberCount: { type: "integer", example: 24 },
            productCount: { type: "integer", example: 18 },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "string", example: "user_001" },
            productId: { type: "string", example: "prod_001" },
            quantity: { type: "integer", example: 2 },
            totalPrice: { type: "number", example: 2400 },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
              example: "pending",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateOrderBody: {
          type: "object",
          required: ["userId", "productId", "quantity", "totalPrice"],
          properties: {
            userId: { type: "string" },
            productId: { type: "string" },
            quantity: { type: "integer", minimum: 1 },
            totalPrice: { type: "number", minimum: 0 },
          },
        },
        AIGenerateRequest: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: { type: "string", example: "ผ้าลายดอกบัวสีทอง" },
            basePatterns: { type: "array", items: { type: "string" } },
            colorPalette: { type: "array", items: { type: "string" }, example: ["#C5A55A", "#1B2A4A"] },
          },
        },
        AIGenerateResponse: {
          type: "object",
          properties: {
            patternId: { type: "string", example: "PAT-1234567890" },
            prompt: { type: "string" },
            matchedProducts: { type: "array", items: { $ref: "#/components/schemas/Product" } },
            estimatedPrice: { type: "number", example: 1350 },
            suggestedColors: { type: "array", items: { type: "string" } },
            generatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Not found" },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": { description: "Server is running", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" }, timestamp: { type: "string" } } } } } },
          },
        },
      },

      // ── Auth ─────────────────────────────────────────────────────────────────
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "สมัครสมาชิกใหม่",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string", example: "สมชาย มั่นคง" }, email: { type: "string", format: "email", example: "user@example.com" }, password: { type: "string", minLength: 8, example: "MyPass123" }, phone: { type: "string", example: "081-234-5678" } } } } },
          },
          responses: {
            "201": { description: "สมัครสำเร็จ คืน token + user", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, user: { type: "object", properties: { id: { type: "string" }, email: { type: "string" }, name: { type: "string" }, role: { type: "string" } } } } } } } },
            "400": { description: "ข้อมูลไม่ครบหรือรหัสผ่านสั้นเกินไป" },
            "409": { description: "อีเมลซ้ำ" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "เข้าสู่ระบบ",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email", example: "admin@laya.com" }, password: { type: "string", example: "Admin@1234" } } } } },
          },
          responses: {
            "200": { description: "Login สำเร็จ", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, user: { type: "object", properties: { id: { type: "string" }, email: { type: "string" }, name: { type: "string" }, role: { type: "string" }, merchantId: { type: "string" }, avatar: { type: "string" } } } } } } } },
            "401": { description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "ดึงข้อมูลผู้ใช้ปัจจุบัน (ต้องมี JWT)",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "ข้อมูลผู้ใช้", content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" }, email: { type: "string" }, name: { type: "string" }, role: { type: "string" } } } } } },
            "401": { description: "ไม่มี token หรือ token หมดอายุ" },
          },
        },
      },

      // ── Products ──────────────────────────────────────────────────────────────
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "รายการสินค้าทั้งหมด",
          parameters: [
            { name: "fabricType", in: "query", schema: { type: "string" }, description: "กรองตามประเภทผ้า เช่น ผ้าไหม" },
            { name: "hasGI", in: "query", schema: { type: "boolean" }, description: "กรองสินค้าที่มีเครื่องหมาย GI" },
            { name: "province", in: "query", schema: { type: "string" }, description: "กรองตามจังหวัด" },
            { name: "search", in: "query", schema: { type: "string" }, description: "ค้นหาจากชื่อ, ชุมชน, จังหวัด" },
          ],
          responses: {
            "200": { description: "รายการสินค้า", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } } } },
            "500": { description: "Server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "ข้อมูลสินค้าตาม ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "ข้อมูลสินค้า", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
            "404": { description: "ไม่พบสินค้า", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "500": { description: "Server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── Categories ────────────────────────────────────────────────────────────
      "/api/categories": {
        get: {
          tags: ["Categories"],
          summary: "หมวดหมู่สินค้าทั้งหมด",
          responses: {
            "200": { description: "รายการหมวดหมู่", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Category" } } } } },
          },
        },
      },

      // ── Banners ───────────────────────────────────────────────────────────────
      "/api/banners": {
        get: {
          tags: ["Banners"],
          summary: "แบนเนอร์หน้าหลัก",
          responses: {
            "200": { description: "รายการแบนเนอร์", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Banner" } } } } },
          },
        },
      },

      // ── Communities ───────────────────────────────────────────────────────────
      "/api/communities": {
        get: {
          tags: ["Communities"],
          summary: "ชุมชนทอผ้าทั้งหมด",
          responses: {
            "200": { description: "รายการชุมชน", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Community" } } } } },
          },
        },
      },

      // ── Orders ────────────────────────────────────────────────────────────────
      "/api/orders": {
        get: {
          tags: ["Orders"],
          summary: "รายการออเดอร์",
          parameters: [
            { name: "userId", in: "query", schema: { type: "string" }, description: "กรองออเดอร์ตาม userId (ไม่ใส่ = ดูทั้งหมด)" },
          ],
          responses: {
            "200": { description: "รายการออเดอร์", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Order" } } } } },
            "500": { description: "Server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["Orders"],
          summary: "สร้างออเดอร์ใหม่",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateOrderBody" } } },
          },
          responses: {
            "201": { description: "ออเดอร์ที่สร้างแล้ว", content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } } },
            "400": { description: "ข้อมูลไม่ครบ", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "500": { description: "Server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── AI ────────────────────────────────────────────────────────────────────
      "/api/ai/generate": {
        post: {
          tags: ["AI"],
          summary: "สร้าง pattern ผ้าจาก prompt",
          description: "รับ prompt ภาษาไทย คืนค่าสีแนะนำ, ราคาประมาณ และสินค้าที่ match",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/AIGenerateRequest" } } },
          },
          responses: {
            "200": { description: "ผลลัพธ์ AI", content: { "application/json": { schema: { $ref: "#/components/schemas/AIGenerateResponse" } } } },
            "400": { description: "ไม่มี prompt", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "500": { description: "Server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
    },
  },
  apis: [], // ใช้ definition แบบ inline ทั้งหมดด้านบน
};

export const swaggerSpec = swaggerJsdoc(options);
