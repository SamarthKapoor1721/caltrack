import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { addWorkout, deleteWorkout } from "@/services";
import { COMMON_EXERCISES } from "@/lib/exercise-list";

const EXERCISE_API_KEY = process.env.EXERCISE_API_KEY ?? "";

interface NinjaExercise {
  name: string;
  type?: string;
  muscle?: string;
  difficulty?: string;
}

async function fetchFromApiNinjas(query: string): Promise<string[]> {
  if (!EXERCISE_API_KEY) return [];
  try {
    const url = `https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "X-Api-Key": EXERCISE_API_KEY },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("[WORKOUT_SEARCH] api-ninjas error", res.status);
      return [];
    }
    const data = (await res.json()) as NinjaExercise[];
    return data
      .map((e) => e.name)
      .filter((n): n is string => typeof n === "string" && n.length > 0)
      .map((n) => n.replace(/\b\w/g, (c) => c.toUpperCase()));
  } catch (err) {
    console.error("[WORKOUT_SEARCH] api-ninjas fetch failed", err);
    return [];
  }
}

function searchLocal(query: string): string[] {
  const q = query.toLowerCase();
  return COMMON_EXERCISES.filter((name) => name.toLowerCase().includes(q));
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const local = searchLocal(q);
    const remote = await fetchFromApiNinjas(q);

    const seen = new Set<string>();
    const results: { name: string }[] = [];
    for (const name of [...local, ...remote]) {
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ name });
      if (results.length >= 10) break;
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[WORKOUT_GET]", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const exerciseName = typeof body.exerciseName === "string" ? body.exerciseName.trim() : "";

    if (!exerciseName) {
      return NextResponse.json({ error: "Exercise name is required." }, { status: 400 });
    }

    const toNum = (v: unknown) => (v == null || v === "" ? null : Number(v));

    const durationMin = toNum(body.durationMinutes ?? body.durationMin);
    const sets         = toNum(body.sets);
    const reps         = toNum(body.reps);
    const intensity    = toNum(body.intensity);
    const caloriesBurned = toNum(body.caloriesBurned);
    const toFailure    = body.toFailure === true;
    const notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;

    if (durationMin != null && (!Number.isFinite(durationMin) || durationMin <= 0 || durationMin > 24 * 60)) {
      return NextResponse.json({ error: "Duration must be between 1 and 1440 minutes." }, { status: 400 });
    }
    if (sets != null && (!Number.isInteger(sets) || sets < 1 || sets > 100)) {
      return NextResponse.json({ error: "Sets must be between 1 and 100." }, { status: 400 });
    }
    if (reps != null && (!Number.isInteger(reps) || reps < 1 || reps > 10000)) {
      return NextResponse.json({ error: "Reps must be a positive number." }, { status: 400 });
    }
    if (intensity != null && (!Number.isInteger(intensity) || intensity < 1 || intensity > 10)) {
      return NextResponse.json({ error: "Intensity (RPE) must be between 1 and 10." }, { status: 400 });
    }
    if (caloriesBurned != null && (!Number.isFinite(caloriesBurned) || caloriesBurned < 0)) {
      return NextResponse.json({ error: "Calories must be a non-negative number." }, { status: 400 });
    }

    const workout = await addWorkout({
      userId: session.user.id,
      exerciseName,
      durationMin: durationMin != null ? Math.round(durationMin) : null,
      sets: sets != null ? Math.round(sets) : null,
      reps: reps != null ? Math.round(reps) : null,
      toFailure,
      intensity: intensity != null ? Math.round(intensity) : null,
      caloriesBurned: caloriesBurned != null ? Math.round(caloriesBurned) : null,
      notes,
    });

    revalidatePath("/workout");
    revalidatePath("/");

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error("[WORKOUT_POST]", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing workout id." }, { status: 400 });
    }

    await deleteWorkout(id, session.user.id);
    revalidatePath("/workout");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WORKOUT_DELETE]", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
