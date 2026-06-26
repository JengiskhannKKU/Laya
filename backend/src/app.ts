import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

dotenv.config();

import healthRouter from "./routes/health";
import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import bannersRouter from "./routes/banners";
import communitiesRouter from "./routes/communities";
import ordersRouter from "./routes/orders";
import aiRouter from "./routes/ai";
import nanobananaRouter from "./routes/nanobanana";

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger UI ────────────────────────────────────────────────────────────────
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "LAYA API Docs",
  customCss: ".swagger-ui .topbar { background-color: #1B2A4A; } .swagger-ui .topbar-wrapper img { display: none; } .swagger-ui .topbar-wrapper::before { content: 'LAYA API'; color: #C5A55A; font-size: 1.2rem; font-weight: 700; }",
}));
app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/health", healthRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/banners", bannersRouter);
app.use("/api/communities", communitiesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/ai", aiRouter);
app.use("/api/nanobanana", nanobananaRouter);

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
