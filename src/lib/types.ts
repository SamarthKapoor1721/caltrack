// ─── Shared Types for CalTrack ───
// Prisma-generated types live in @/generated/prisma.
// This file holds app-level DTOs and derived types used across the UI.

import type { FoodLog, WeightLog, User } from "@/generated/prisma/client";

// Re-export Prisma model types for convenience
export type { FoodLog, WeightLog, User } from "@/generated/prisma/client";
export { Gender, ActivityLevel, MealType } from "@/generated/prisma/client";

/** Input for creating a new food log entry (no id/timestamps) */
export type CreateFoodLogInput = Omit<FoodLog, "id" | "createdAt">;

/** Input for creating a new weight log entry */
export type CreateWeightLogInput = Omit<WeightLog, "id" | "createdAt">;


/** Input for registering / creating a user */
export type CreateUserInput = Pick<User, "email" | "password"> &
  Partial<
    Pick<User, "age" | "height" | "weight" | "gender" | "activityLevel" | "calorieGoal">
  >;

/** Daily nutrition summary (computed, not stored) */
export interface DailySummary {
  date: string; // ISO date string YYYY-MM-DD
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  entries: FoodLog[];
}

/** User-defined daily nutrition goals (subset of User) */
export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
