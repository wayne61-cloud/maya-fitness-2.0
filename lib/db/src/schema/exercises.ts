import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const exercisesTable = pgTable("exercises", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  module: text("module").notNull(), // "runner" | "workout" | "yoga" | "nutrition"
  youtubeUrl: text("youtube_url"),
  image: text("image"),
  muscles: jsonb("muscles").$type<string[]>().default([]),
  difficulty: text("difficulty").notNull().default("Débutant"),
  category: text("category"),
  description: text("description"),
  durationMin: integer("duration_min"),
  calories: integer("calories"),
  instructions: jsonb("instructions").$type<string[]>().default([]),
  benefits: jsonb("benefits").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExerciseSchema = createInsertSchema(exercisesTable).omit({ id: true, createdAt: true });
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercisesTable.$inferSelect;
