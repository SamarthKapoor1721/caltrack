import { type DailySummary } from "./types";
import type { FoodLog } from "@/generated/prisma/client";

/**
 * Format a number as a calorie string (e.g. "1,200 kcal")
 */
export function formatCalories(value: number): string {
  return `${value.toLocaleString()} kcal`;
}

/**
 * Convert a Date (or date-like value) to a YYYY-MM-DD key in the
 * server's local timezone.
 *
 * IMPORTANT: every place that buckets entries "by day" must use this
 * helper so that the day a record belongs to is computed consistently.
 * Mixing this with `toISOString()` (which is UTC) causes entries to land
 * in a different day on non-UTC servers — e.g. food logged today showing
 * up under yesterday and never counting toward today's totals.
 */
export function toDateKey(date: Date | string | number): string {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayISO(): string {
  return toDateKey(new Date());
}

/**
 * Human-friendly label for a YYYY-MM-DD key: "Today", "Yesterday", or a
 * formatted date like "Mon, Jun 1".
 */
export function dateLabel(key: string, today: string = getTodayISO()): string {
  if (key === today) return "Today";

  const yesterday = toDateKey(new Date(new Date(`${today}T12:00:00`).getTime() - 86_400_000));
  if (key === yesterday) return "Yesterday";

  return new Date(`${key}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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
