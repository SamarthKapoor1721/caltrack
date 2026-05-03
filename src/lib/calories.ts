// ─── Calorie Calculations ─────────────────────────
// Reusable BMR and maintenance-calorie utilities based on the
// Mifflin-St Jeor equation.
//
// BMR (Male)   = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5
// BMR (Female) = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161
// BMR (Other)  = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 78
//
// Maintenance (TDEE) = BMR × activity multiplier

// ─── Types ────────────────────────────────────────
export type GenderValue = "MALE" | "FEMALE" | "OTHER";

export type ActivityLevelValue =
  | "SEDENTARY"
  | "LIGHTLY_ACTIVE"
  | "MODERATELY_ACTIVE"
  | "VERY_ACTIVE"
  | "EXTRA_ACTIVE";

export interface BMRInput {
  /** Body weight in kilograms */
  weight: number;
  /** Height in centimetres */
  height: number;
  /** Age in years */
  age: number;
  /** Biological gender (affects the gender offset constant) */
  gender: GenderValue;
}

export interface MaintenanceCaloriesInput extends BMRInput {
  /** Self-reported activity level */
  activityLevel: ActivityLevelValue;
}

// ─── Constants ────────────────────────────────────
/** Harris-Benedict-style multipliers keyed by activity level */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevelValue, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

const GENDER_OFFSETS: Record<GenderValue, number> = {
  MALE: 5,
  FEMALE: -161,
  OTHER: -78, // average of male & female offsets
};

// ─── Functions ────────────────────────────────────

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 *
 * @returns BMR in kcal/day (rounded to the nearest integer)
 */
export function calculateBMR({ weight, height, age, gender }: BMRInput): number {
  const offset = GENDER_OFFSETS[gender] ?? GENDER_OFFSETS.OTHER;
  return Math.round(10 * weight + 6.25 * height - 5 * age + offset);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE / maintenance calories)
 * by multiplying BMR by an activity-level factor.
 *
 * @returns Maintenance calories in kcal/day (rounded to the nearest integer)
 */
export function calculateMaintenanceCalories({
  weight,
  height,
  age,
  gender,
  activityLevel,
}: MaintenanceCaloriesInput): number {
  const bmr = calculateBMR({ weight, height, age, gender });
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.SEDENTARY;
  return Math.round(bmr * multiplier);
}
