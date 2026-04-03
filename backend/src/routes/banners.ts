import { Router, Request, Response } from "express";
import { query } from "../db";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await query("SELECT id, image, title, subtitle FROM banners ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

export default router;
