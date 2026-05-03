import { type DailySummary } from "./types";
import type { FoodLog } from "@/generated/prisma/client";

/**
 * Format a number as a calorie string (e.g. "1,200 kcal")
 */
export function formatCalories(value: number): string {
  return `${value.toLocaleString()} kcal`;
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculate a daily summary from a list of food entries
 */
export function calculateDailySummary(
  date: string,
  entries: FoodLog[],
): DailySummary {
  return entries.reduce<DailySummary>(
    (acc, entry) => ({
      ...acc,
      totalCalories: acc.totalCalories + entry.calories,
      totalProtein: acc.totalProtein + entry.protein,
      totalCarbs: acc.totalCarbs + entry.carbs,
      totalFat: acc.totalFat + entry.fat,
      entries: [...acc.entries, entry],
    }),
    {
      date,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      entries: [],
    },
  );
}

/**
 * Generate a random UUID (for client-side IDs before a real DB)
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

import { calculateMaintenanceCalories, type MaintenanceCaloriesInput } from "./calories";

/**
 * Calculate Total Daily Energy Expenditure (TDEE) using the
 * Mifflin-St Jeor equation.
 *
 * This is a convenience alias for {@link calculateMaintenanceCalories}.
 * Prefer using `calculateBMR` / `calculateMaintenanceCalories` from
 * `@/lib/calories` directly for new code.
 */
export function calculateTDEE(input: MaintenanceCaloriesInput): number {
  return calculateMaintenanceCalories(input);
}
