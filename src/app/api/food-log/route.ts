// ─── Food Log API Route ───
// CRUD operations for the authenticated user's food log entries.
//
// GET    /api/food-log?date=YYYY-MM-DD  → list today's (or specified date's) entries + summary
// POST   /api/food-log                  → create a new entry
// DELETE  /api/food-log?id=<entryId>    → delete an entry by id

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  addFoodEntry,
  deleteFoodEntry,
  getDailySummary,
} from "@/services";
import { getTodayISO } from "@/lib";

const VALID_MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;

/** Revalidate every page that shows food-log data */
function revalidatePages() {
  revalidatePath("/");     // dashboard
  revalidatePath("/log");  // log page
}

// ─── GET /api/food-log ─────────────────────────────
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? getTodayISO();

    const summary = await getDailySummary(session.user.id, date);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[FOOD_LOG_GET]", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

// ─── POST /api/food-log ────────────────────────────
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { foodName, calories, protein, carbs, fat, mealType } = body;

    // ── Validation ──────────────────────────────
    const errors: string[] = [];

    if (!foodName || typeof foodName !== "string" || foodName.trim().length === 0) {
      errors.push("Food name is required.");
    }
    if (typeof calories !== "number" || calories < 0) {
      errors.push("Calories must be a non-negative number.");
    }
    if (typeof protein !== "number" || protein < 0) {
      errors.push("Protein must be a non-negative number.");
    }
    if (typeof carbs !== "number" || carbs < 0) {
      errors.push("Carbs must be a non-negative number.");
    }
    if (typeof fat !== "number" || fat < 0) {
      errors.push("Fat must be a non-negative number.");
    }
    if (!VALID_MEAL_TYPES.includes(mealType)) {
      errors.push(`Meal type must be one of: ${VALID_MEAL_TYPES.join(", ")}.`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    // ── Persist ─────────────────────────────────
    const entry = await addFoodEntry({
      userId: session.user.id,
      foodName: foodName.trim(),
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      mealType,
    });

    // ── Revalidate dashboard + log page ─────────
    revalidatePages();

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("[FOOD_LOG_POST]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/food-log?id=<entryId> ─────────────
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Missing entry id." },
        { status: 400 },
      );
    }

    await deleteFoodEntry(id);

    // ── Revalidate dashboard + log page ─────────
    revalidatePages();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FOOD_LOG_DELETE]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
