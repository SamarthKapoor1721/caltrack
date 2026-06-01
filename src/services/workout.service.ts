import { db } from "@/database";

export interface CreateWorkoutInput {
  userId: string;
  exerciseName: string;
  durationMin?: number | null;
  sets?: number | null;
  reps?: number | null;
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
