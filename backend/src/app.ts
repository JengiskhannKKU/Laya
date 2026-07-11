import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

dotenv.config();

import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import shopsRouter from "./routes/shops";
import measurementsRouter from "./routes/measurements";
import addressesRouter from "./routes/addresses";
import wishlistRouter from "./routes/wishlist";
import notificationsRouter from "./routes/notifications";
import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import bannersRouter from "./routes/banners";
import communitiesRouter from "./routes/communities";
import ordersRouter from "./routes/orders";
import productOrdersRouter from "./routes/product-orders";
import paymentsRouter from "./routes/payments";
import weavingOrdersRouter from "./routes/weaving-orders";
import weavePatternsRouter from "./routes/weave-patterns";
import aiRouter from "./routes/ai";
import nanobananaRouter from "./routes/nanobanana";
import tryonRouter from "./routes/tryon";
import patternsRouter from "./routes/patterns";
import weavingRequestsRouter from "./routes/weaving-requests";
import uploadRouter from "./routes/upload";

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// Production: จำกัดเฉพาะโดเมนใน ALLOWED_ORIGINS (comma-separated ใน .env)
// Development: เปิดกว้าง (origin: true) เพื่อความสะดวกตอน dev หลายพอร์ต/เครื่อง
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? (origin, callback) => {
            // อนุญาต request ที่ไม่มี origin (curl, server-to-server, mobile app)
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error(`CORS blocked: ${origin} not in ALLOWED_ORIGINS`));
            }
          }
        : true,
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ── Swagger UI ────────────────────────────────────────────────────────────────
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "LAYA API Docs",
  customCss: ".swagger-ui .topbar { background-color: #1B2A4A; } .swagger-ui .topbar-wrapper img { display: none; } .swagger-ui .topbar-wrapper::before { content: 'LAYA API'; color: #C5A55A; font-size: 1.2rem; font-weight: 700; }",
}));
app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/shops", shopsRouter);
app.use("/api/measurements", measurementsRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/banners", bannersRouter);
app.use("/api/communities", communitiesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/product-orders", productOrdersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/weaving-orders", weavingOrdersRouter);
app.use("/api/weave-patterns", weavePatternsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/nanobanana", nanobananaRouter);
app.use("/api/tryon", tryonRouter);
app.use("/api/patterns", patternsRouter);
app.use("/api/weaving-requests", weavingRequestsRouter);
app.use("/api/upload", uploadRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export default app;
