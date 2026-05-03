// ─── Weight Log Service ───
// Business logic for tracking weight over time.

import { db } from "@/database";
import { type CreateWeightLogInput } from "@/lib";

/**
 * Log a new weight entry
 */
export async function addWeightLog(data: CreateWeightLogInput) {
  return db.weightLog.create({ data });
}

/**
 * Get all weight logs for a user, ordered by date
 */
export async function getWeightLogsByUser(userId: string) {
  return db.weightLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get the latest weight log for a user
 */
export async function getLatestWeight(userId: string) {
  return db.weightLog.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Delete a weight log by ID
 */
export async function deleteWeightLog(id: string) {
  return db.weightLog.delete({ where: { id } });
}
