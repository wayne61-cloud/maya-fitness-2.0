import { Router } from "express";
import { db, recipesTable, insertRecipeSchema } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";

const router = Router();

// GET /api/recipes — list all, optional ?category=Déjeuner&diet=végétarien&q=search
router.get("/recipes", async (req, res) => {
  try {
    const { category, diet, q } = req.query;
    const rows = await db.select().from(recipesTable);

    let result = rows;
    if (typeof category === "string") {
      result = result.filter((r) => r.category === category);
    }
    if (typeof diet === "string") {
      result = result.filter((r) => r.diet === diet);
    }
    if (typeof q === "string" && q.length > 0) {
      const lq = q.toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(lq) || r.description?.toLowerCase().includes(lq));
    }

    res.json({ data: result, total: result.length });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// GET /api/recipes/:id
router.get("/recipes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [row] = await db.select().from(recipesTable).where(eq(recipesTable.id, id));
    if (!row) return res.status(404).json({ error: "Recette non trouvée" });
    res.json({ data: row });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// POST /api/recipes
router.post("/recipes", async (req, res) => {
  try {
    const parsed = insertRecipeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [created] = await db.insert(recipesTable).values(parsed.data).returning();
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// PUT /api/recipes/:id
router.put("/recipes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const parsed = insertRecipeSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [updated] = await db
      .update(recipesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(recipesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Recette non trouvée" });
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

// DELETE /api/recipes/:id
router.delete("/recipes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(recipesTable).where(eq(recipesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err) });
  }
});

export default router;
