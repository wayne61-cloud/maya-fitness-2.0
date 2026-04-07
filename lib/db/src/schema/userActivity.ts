import { pgTable, serial, text, real, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userActivityTable = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("local"), // for future multi-user support
  type: text("type").notNull(), // "run" | "workout" | "yoga" | "nutrition"
  title: text("title"),
  date: timestamp("date").notNull().defaultNow(),
  durationSec: integer("duration_sec").notNull().default(0),
  calories: integer("calories").default(0),
  // Runner specific
  distanceKm: real("distance_km"),
  paceMinKm: real("pace_min_km"),
  route: jsonb("route").$type<{ latitude: number; longitude: number }[]>(),
  // Workout specific
  exercises: jsonb("exercises").$type<{ name: string; sets: number; reps: number }[]>(),
  sessionId: text("session_id"),
  // Yoga specific
  yogaCategory: text("yoga_category"),
  yogaExerciseId: text("yoga_exercise_id"),
  // Nutrition specific
  mealType: text("meal_type"),
  recipeId: text("recipe_id"),
  protein: real("protein"),
  carbs: real("carbs"),
  fat: real("fat"),
  // Meta
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserActivitySchema = createInsertSchema(userActivityTable).omit({ id: true, createdAt: true });
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivityTable.$inferSelect;
