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

export async function deleteWorkout(id: string, userId: string) {
  return db.workout.deleteMany({ where: { id, userId } });
}
