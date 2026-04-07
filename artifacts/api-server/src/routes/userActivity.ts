import { Router } from "express";
import { db, userActivityTable, insertUserActivitySchema } from "@workspace/db";
import { eq, and, gte, desc } from "drizzle-orm";

const router = Router();

// GET /api/activity — list activities, optional ?userId=&type=run&from=2025-01-01&limit=50
router.get("/activity", async (req, res) => {
  try {
    const { userId = "local", type, from, limit = "50" } = req.query;

    const rows = await db
      .select()
      .from(userActivityTable)
      .where(eq(userActivityTable.userId, String(userId)))
      .orderBy(desc(userActivityTable.date))
      .limit(Math.min(parseInt(String(limit), 10) || 50, 500));

    let result = rows;
    if (typeof type === "string") {
      result = result.filter((r) => r.type === type);
    }
    if (typeof from === "string") {
      const fromDate = new Date(from);
      result = result.filter((r) => new Date(r.date) >= fromDate);
    }

    // Summary stats
    const totalCalories = result.reduce((s, r) => s + (r.calories ?? 0), 0);
    const totalDurationSec = result.reduce((s, r) => s + r.durationSec, 0);
    const totalDistanceKm = result
      .filter((r) => r.type === "run")
      .reduce((s, r) => s + (r.distanceKm ?? 0), 0);

    res.json({
      data: result,
      total: result.length,
      summary: {
        totalCalories,
        totalDurationSec,
        totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// GET /api/activity/:id
router.get("/activity/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [row] = await db.select().from(userActivityTable).where(eq(userActivityTable.id, id));
    if (!row) return res.status(404).json({ error: "Activité non trouvée" });
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// POST /api/activity — log a new activity
router.post("/activity", async (req, res) => {
  try {
    const parsed = insertUserActivitySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [created] = await db.insert(userActivityTable).values(parsed.data).returning();
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// DELETE /api/activity/:id
router.delete("/activity/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(userActivityTable).where(eq(userActivityTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// GET /api/activity/stats/weekly — weekly stats per module
router.get("/activity/stats/weekly", async (req, res) => {
  try {
    const { userId = "local" } = req.query;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const rows = await db
      .select()
      .from(userActivityTable)
      .where(
        and(
          eq(userActivityTable.userId, String(userId)),
          gte(userActivityTable.date, weekAgo)
        )
      );

    const stats = {
      runs: rows.filter((r) => r.type === "run").length,
      workouts: rows.filter((r) => r.type === "workout").length,
      yoga: rows.filter((r) => r.type === "yoga").length,
      distanceKm: rows.filter((r) => r.type === "run").reduce((s, r) => s + (r.distanceKm ?? 0), 0),
      caloriesBurned: rows.filter((r) => r.type !== "nutrition").reduce((s, r) => s + (r.calories ?? 0), 0),
      caloriesConsumed: rows.filter((r) => r.type === "nutrition").reduce((s, r) => s + (r.calories ?? 0), 0),
      totalMinutes: Math.round(rows.reduce((s, r) => s + r.durationSec, 0) / 60),
    };

    res.json({ data: stats });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

export default router;
