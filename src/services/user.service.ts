// ─── User Service ───
// Business logic for managing users, profiles, and nutrition goals.

import { db } from "@/database";
import { type CreateUserInput } from "@/lib";

/**
 * Create a new user
 */
export async function createUser(data: CreateUserInput) {
  return db.user.create({ data });
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

/**
 * Update a user's calorie goal
 */
export async function updateCalorieGoal(userId: string, calorieGoal: number) {
  return db.user.update({
    where: { id: userId },
    data: { calorieGoal },
  });
}

/**
 * Update a user's profile (age, height, weight, gender, activityLevel)
 */
export async function updateUserProfile(
  userId: string,
  data: {
    age?: number;
    height?: number;
    weight?: number;
    gender?: "MALE" | "FEMALE" | "OTHER";
    activityLevel?: "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE" | "EXTRA_ACTIVE";
    calorieGoal?: number;
  },
) {
  return db.user.update({
    where: { id: userId },
    data,
  });
}
