export {
  addFoodEntry,
  getEntriesByDate,
  getEntriesByUserAndDate,
  getEntriesByMealType,
  deleteFoodEntry,
  getDailySummary,
  getCalorieHistory,
  getDailyNutritionHistory,
  type DailyCaloriePoint,
  type DailyHistoryEntry,
} from "./food-entry.service";

export {
  createUser,
  getUserById,
  getUserByEmail,
  updateCalorieGoal,
  updateUserProfile,
} from "./user.service";

export {
  addWeightLog,
  getWeightLogsByUser,
  getLatestWeight,
  deleteWeightLog,
} from "./weight-log.service";

export {
  addWorkout,
  getWorkoutsByUser,
  getWorkoutsByUserSince,
  deleteWorkout,
  type CreateWorkoutInput,
} from "./workout.service";

