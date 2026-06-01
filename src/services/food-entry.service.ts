// ─── Food Entry Service ───
// Business logic for creating, reading, updating, and deleting food log entries.

import { db } from "@/database";
import { type CreateFoodLogInput, type DailySummary, getTodayISO, toDateKey, calculateDailySummary } from "@/lib";
import { type MealType } from "@/generated/prisma/client";

/**
 * Log a new food entry
 */
export async function addFoodEntry(data: CreateFoodLogInput) {
  return db.foodLog.create({ data });
}

/**
 * Get all entries for a specific date
 */
export async function getEntriesByDate(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end   = new Date(`${date}T23:59:59.999`);

  return db.foodLog.findMany({
    where: {
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get entries for a user on a specific date
 */
export async function getEntriesByUserAndDate(userId: string, date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end   = new Date(`${date}T23:59:59.999`);

  return db.foodLog.findMany({
    where: {
      userId,
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get entries filtered by meal type for a user
 */
export async function getEntriesByMealType(
  userId: string,
  date: string,
  mealType: MealType,
) {
  const start = new Date(`${date}T00:00:00`);
  const end   = new Date(`${date}T23:59:59.999`);

  return db.foodLog.findMany({
    where: {
      userId,
      mealType,
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Delete a food entry by ID
 */
export async function deleteFoodEntry(id: string) {
  return db.foodLog.delete({ where: { id } });
}

/**
 * Get the daily summary for a given user and date
 */
export async function getDailySummary(
  userId: string,
  date?: string,
): Promise<DailySummary> {
  const targetDate = date ?? getTodayISO();
  const entries = await getEntriesByUserAndDate(userId, targetDate);
  return calculateDailySummary(targetDate, entries);
}

// ─── Chart helpers ───────────────────────────────

export interface DailyCaloriePoint {
  date: string;      // "Mon", "Tue", …
  fullDate: string;  // "YYYY-MM-DD"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Return per-day calorie + macro totals for the last `days` days (including today).
 * Sorted chronologically (oldest → newest).
 */
export async function getCalorieHistory(
  userId: string,
  days = 7,
): Promise<DailyCaloriePoint[]> {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const entries = await db.foodLog.findMany({
    where: {
      userId,
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: "asc" },
  });

  // Bucket entries by YYYY-MM-DD
  const buckets = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();

  // Pre-fill all days so we get zeroes for days with no entries
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = toDateKey(d);
    buckets.set(key, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }

  for (const e of entries) {
    const key = toDateKey(e.createdAt);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.calories += e.calories;
      bucket.protein += e.protein;
      bucket.carbs += e.carbs;
      bucket.fat += e.fat;
    }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return Array.from(buckets.entries()).map(([fullDate, totals]) => ({
    date: dayNames[new Date(`${fullDate}T12:00:00`).getDay()],
    fullDate,
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
  }));
}

/**
 * Return raw food entries for a user over the last `days` days, newest first.
 * Used by the history timeline to render individual food items per day.
 */
export async function getFoodEntriesSince(userId: string, days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return db.foodLog.findMany({
    where: { userId, createdAt: { gte: start } },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Daily history (grouped by date) ─────────────

export interface DailyHistoryEntry {
  date: string;       // "YYYY-MM-DD"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entryCount: number;
}

/**
 * Return real per-day nutrition summaries for a user, newest day first.
 * Only days that actually have logged entries are included.
 */
export async function getDailyNutritionHistory(
  userId: string,
  days = 30,
): Promise<DailyHistoryEntry[]> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const entries = await db.foodLog.findMany({
    where: { userId, createdAt: { gte: start } },
    orderBy: { createdAt: "desc" },
  });

  const buckets = new Map<string, DailyHistoryEntry>();

  for (const e of entries) {
    const key = toDateKey(e.createdAt);
    const bucket = buckets.get(key) ?? {
      date: key,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      entryCount: 0,
    };
    bucket.calories += e.calories;
    bucket.protein += e.protein;
    bucket.carbs += e.carbs;
    bucket.fat += e.fat;
    bucket.entryCount += 1;
    buckets.set(key, bucket);
  }

  // Map preserves insertion order; entries are already newest-first.
  return Array.from(buckets.values()).map((b) => ({
    ...b,
    calories: Math.round(b.calories),
    protein: Math.round(b.protein),
    carbs: Math.round(b.carbs),
    fat: Math.round(b.fat),
  }));
}
