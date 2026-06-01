export {
  addFoodEntry,
  getEntriesByDate,
  getEntriesByUserAndDate,
  getEntriesByMealType,
  deleteFoodEntry,
  getDailySummary,
  getCalorieHistory,
  getDailyNutritionHistory,
  getFoodEntriesSince,
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
  getExerciseWeightHistory,
  deleteWorkout,
  type CreateWorkoutInput,
  type ExerciseWeightPoint,
  type ExerciseWeightHistory,
} from "./workout.service";

