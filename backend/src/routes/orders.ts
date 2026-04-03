import { Router, Request, Response } from "express";
import { query } from "../db";

const router = Router();

// GET /api/orders?userId=<id>
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const sql = userId
      ? `SELECT id, user_id, product_id, quantity, total_price, status, created_at
         FROM orders WHERE user_id = $1 ORDER BY created_at DESC`
      : `SELECT id, user_id, product_id, quantity, total_price, status, created_at
         FROM orders ORDER BY created_at DESC`;

    const rows = await query<Record<string, unknown>>(
      sql,
      userId ? [userId] : undefined
    );
    res.json(rows.map(mapOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// POST /api/orders
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, productId, quantity, totalPrice } = req.body as {
      userId: string;
      productId: string;
      quantity: number;
      totalPrice: number;
    };

    if (!userId || !productId || !quantity || !totalPrice) {
      res.status(400).json({ error: "userId, productId, quantity and totalPrice are required" });
      return;
    }

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO orders (user_id, product_id, quantity, total_price, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, user_id, product_id, quantity, total_price, status, created_at`,
      [userId, productId, quantity, totalPrice]
    );
    res.status(201).json(mapOrder(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

function mapOrder(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    quantity: Number(row.quantity),
    totalPrice: Number(row.total_price),
    status: row.status,
    createdAt: row.created_at,
  };
}

export default router;
