import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

/** GET /api/notifications */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT id, type, title, body, data, is_read, created_at
       FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 50`,
      [req.user!.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/** PATCH /api/notifications/:id/read */
router.patch("/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    await query(
      "UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user!.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

/** PATCH /api/notifications/read-all */
router.patch("/read-all", requireAuth, async (req: Request, res: Response) => {
  try {
    await query(
      "UPDATE notifications SET is_read=true WHERE user_id=$1 AND is_read=false",
      [req.user!.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

export default router;
