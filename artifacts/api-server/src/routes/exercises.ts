import { Router } from "express";
import { db, exercisesTable, insertExerciseSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/exercises — list all, optional ?module=runner&difficulty=Débutant
router.get("/exercises", async (req, res) => {
  try {
    const { module: mod, difficulty, category } = req.query;
    let query = db.select().from(exercisesTable).$dynamic();

    if (typeof mod === "string") {
      query = query.where(eq(exercisesTable.module, mod));
    }

    const rows = await query;

    let result = rows;
    if (typeof difficulty === "string") {
      result = result.filter((r) => r.difficulty === difficulty);
    }
    if (typeof category === "string") {
      result = result.filter((r) => r.category === category);
    }

    res.json({ data: result, total: result.length });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// GET /api/exercises/:id
router.get("/exercises/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [row] = await db.select().from(exercisesTable).where(eq(exercisesTable.id, id));
    if (!row) return res.status(404).json({ error: "Exercice non trouvé" });
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// POST /api/exercises
router.post("/exercises", async (req, res) => {
  try {
    const parsed = insertExerciseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [created] = await db.insert(exercisesTable).values(parsed.data).returning();
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// PUT /api/exercises/:id
router.put("/exercises/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const parsed = insertExerciseSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [updated] = await db.update(exercisesTable).set(parsed.data).where(eq(exercisesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Exercice non trouvé" });
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// DELETE /api/exercises/:id
router.delete("/exercises/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(exercisesTable).where(eq(exercisesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

export default router;
