import { type NutritionGoals } from "./types";

// ─── App-wide constants ───

export const APP_NAME = "CalTrack";

export const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

export const MEAL_TYPES = [
  { value: "BREAKFAST", label: "🌅 Breakfast" },
  { value: "LUNCH", label: "☀️ Lunch" },
  { value: "DINNER", label: "🌙 Dinner" },
  { value: "SNACK", label: "🍿 Snack" },
] as const;

export const MACRO_COLORS = {
  protein: "#3b82f6", // blue
  carbs: "#f59e0b", // amber
  fat: "#ef4444", // red
} as const;
