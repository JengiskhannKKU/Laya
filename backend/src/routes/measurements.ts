import { Router, Request, Response } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

/** GET /api/measurements — own profiles */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await query<Record<string, unknown>>(
      `SELECT id, label, height_cm, weight_kg, chest_cm, waist_cm, hip_cm,
              shoulder_cm, arm_length_cm, dress_length_cm, notes, is_default, created_at
       FROM body_measurements WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC`,
      [req.user!.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch measurements" });
  }
});

/** POST /api/measurements */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      label = "ขนาดตัวหลัก",
      heightCm, weightKg, chestCm, waistCm, hipCm,
      shoulderCm, armLengthCm, dressLengthCm, notes, isDefault = false,
    } = req.body as Record<string, unknown>;

    const rows = await query<{ id: string }>(
      `INSERT INTO body_measurements
         (user_id, label, height_cm, weight_kg, chest_cm, waist_cm, hip_cm,
          shoulder_cm, arm_length_cm, dress_length_cm, notes, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [
        req.user!.userId, label, heightCm ?? null, weightKg ?? null,
        chestCm ?? null, waistCm ?? null, hipCm ?? null,
        shoulderCm ?? null, armLengthCm ?? null, dressLengthCm ?? null,
        notes ?? null, isDefault,
      ]
    );

    if (isDefault) {
      await query(
        "UPDATE body_measurements SET is_default=false WHERE user_id=$1 AND id<>$2",
        [req.user!.userId, rows[0].id]
      );
    }

    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create measurement" });
  }
});

/** PATCH /api/measurements/:id */
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      label, heightCm, weightKg, chestCm, waistCm, hipCm,
      shoulderCm, armLengthCm, dressLengthCm, notes, isDefault,
    } = req.body as Record<string, unknown>;

    await query(
      `UPDATE body_measurements SET
         label=$1, height_cm=$2, weight_kg=$3, chest_cm=$4, waist_cm=$5, hip_cm=$6,
         shoulder_cm=$7, arm_length_cm=$8, dress_length_cm=$9, notes=$10,
         is_default=$11, updated_at=NOW()
       WHERE id=$12 AND user_id=$13`,
      [
        label, heightCm ?? null, weightKg ?? null, chestCm ?? null, waistCm ?? null,
        hipCm ?? null, shoulderCm ?? null, armLengthCm ?? null, dressLengthCm ?? null,
        notes ?? null, isDefault ?? false, req.params.id, req.user!.userId,
      ]
    );

    if (isDefault) {
      await query(
        "UPDATE body_measurements SET is_default=false WHERE user_id=$1 AND id<>$2",
        [req.user!.userId, req.params.id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update measurement" });
  }
});

/** DELETE /api/measurements/:id */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await query(
      "DELETE FROM body_measurements WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user!.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete measurement" });
  }
});

export default router;
