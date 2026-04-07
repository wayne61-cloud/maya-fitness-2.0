import { pgTable, serial, text, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  youtubeUrl: text("youtube_url"),
  calories: integer("calories").notNull().default(0),
  protein: real("protein").notNull().default(0),
  carbs: real("carbs").notNull().default(0),
  fat: real("fat").notNull().default(0),
  prepTimeMin: integer("prep_time_min").default(15),
  cookTimeMin: integer("cook_time_min").default(20),
  servings: integer("servings").default(2),
  category: text("category"), // "Petit-déjeuner" | "Déjeuner" | "Dîner" | "Snack"
  diet: text("diet"), // "végétarien" | "vegan" | "sans-gluten" | "normal"
  ingredients: jsonb("ingredients").$type<{ name: string; amount: string; unit: string }[]>().default([]),
  steps: jsonb("steps").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRecipeSchema = createInsertSchema(recipesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipesTable.$inferSelect;
