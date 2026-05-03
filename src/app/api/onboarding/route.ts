// ─── Onboarding API Route ───
// Accepts user profile data, calculates TDEE via Mifflin-St Jeor, and
// stores the profile + calorie goal in the database.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUserProfile } from "@/services";
import { calculateTDEE } from "@/lib";

const VALID_GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
const VALID_ACTIVITY_LEVELS = [
  "SEDENTARY",
  "LIGHTLY_ACTIVE",
  "MODERATELY_ACTIVE",
  "VERY_ACTIVE",
  "EXTRA_ACTIVE",
] as const;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weight, height, age, gender, activityLevel } = body;

    // ── Validation ────────────────────────────────────
    const errors: string[] = [];

    if (typeof weight !== "number" || weight <= 0 || weight > 500) {
      errors.push("Weight must be a number between 1 and 500 kg.");
    }
    if (typeof height !== "number" || height <= 0 || height > 300) {
      errors.push("Height must be a number between 1 and 300 cm.");
    }
    if (typeof age !== "number" || !Number.isInteger(age) || age < 1 || age > 150) {
      errors.push("Age must be an integer between 1 and 150.");
    }
    if (!VALID_GENDERS.includes(gender)) {
      errors.push(`Gender must be one of: ${VALID_GENDERS.join(", ")}.`);
    }
    if (!VALID_ACTIVITY_LEVELS.includes(activityLevel)) {
      errors.push(`Activity level must be one of: ${VALID_ACTIVITY_LEVELS.join(", ")}.`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    // ── Calculate TDEE ────────────────────────────────
    const calorieGoal = calculateTDEE({ weight, height, age, gender, activityLevel });

    // ── Persist profile ───────────────────────────────
    await updateUserProfile(session.user.id, {
      weight,
      height,
      age,
      gender,
      activityLevel,
      calorieGoal,
    });

    return NextResponse.json({ calorieGoal }, { status: 200 });
  } catch (error) {
    console.error("[ONBOARDING]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
