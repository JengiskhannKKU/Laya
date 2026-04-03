import { Router, Request, Response } from "express";
import { query } from "../db";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT id, name, province, image, member_count, product_count
       FROM communities ORDER BY id`
    );
    res.json(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        province: r.province,
        image: r.image,
        memberCount: Number(r.member_count),
        productCount: Number(r.product_count),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});

export default router;
