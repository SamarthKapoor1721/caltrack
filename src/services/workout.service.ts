import { db } from "@/database";
import { toDateKey } from "@/lib";

export interface CreateWorkoutInput {
  userId: string;
  exerciseName: string;
  durationMin?: number | null;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  toFailure?: boolean;
  intensity?: number | null;
  caloriesBurned?: number | null;
  notes?: string | null;
}

export async function addWorkout(data: CreateWorkoutInput) {
  return db.workout.create({
    data: {
      userId: data.userId,
      exerciseName: data.exerciseName,
      durationMin: data.durationMin ?? null,
      sets: data.sets ?? null,
      reps: data.reps ?? null,
      weight: data.weight ?? null,
      toFailure: data.toFailure ?? false,
      intensity: data.intensity ?? null,
      caloriesBurned: data.caloriesBurned ?? null,
      notes: data.notes ?? null,
    },
  });
}

export async function getWorkoutsByUser(userId: string, limit = 50) {
  return db.workout.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get a user's workouts from the last `days` days (newest first), so the
 * history page can group them by the day they were performed.
 */
export async function getWorkoutsByUserSince(userId: string, days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return db.workout.findMany({
    where: { userId, createdAt: { gte: start } },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteWorkout(id: string, userId: string) {
  return db.workout.deleteMany({ where: { id, userId } });
}

// ─── Strength progress (weight lifted per exercise over time) ─────

export interface ExerciseWeightPoint {
  date: string;   // "YYYY-MM-DD"
  weight: number; // heaviest weight lifted that day, in kg
}

export interface ExerciseWeightHistory {
  exercise: string;
  points: ExerciseWeightPoint[];
}

/**
 * For each exercise the user has logged a weight for, return that exercise's
 * heaviest weight per day, oldest → newest. Exercises are ordered by how
 * recently they were trained (most recent first), so the dashboard can
 * default to the latest one.
 */
export async function getExerciseWeightHistory(
  userId: string,
  days = 90,
): Promise<ExerciseWeightHistory[]> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const workouts = await db.workout.findMany({
    where: { userId, weight: { not: null }, createdAt: { gte: start } },
    orderBy: { createdAt: "asc" },
    select: { exerciseName: true, weight: true, createdAt: true },
  });

  // exercise → (dateKey → heaviest weight that day)
  const byExercise = new Map<string, Map<string, number>>();
  const lastTrained = new Map<string, number>();

  for (const w of workouts) {
    if (w.weight == null) continue;
    const dayMap = byExercise.get(w.exerciseName) ?? new Map<string, number>();
    const key = toDateKey(w.createdAt);
    dayMap.set(key, Math.max(dayMap.get(key) ?? 0, w.weight));
    byExercise.set(w.exerciseName, dayMap);
    lastTrained.set(w.exerciseName, w.createdAt.getTime());
  }

  return Array.from(byExercise.entries())
    .map(([exercise, dayMap]) => ({
      exercise,
      points: Array.from(dayMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, weight]) => ({ date, weight })),
    }))
    // Only exercises with at least one data point; most-recently trained first.
    .filter((e) => e.points.length > 0)
    .sort((a, b) => (lastTrained.get(b.exercise) ?? 0) - (lastTrained.get(a.exercise) ?? 0));
}
