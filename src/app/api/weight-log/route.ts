// ─── Weight Log API Route ───
// CRUD operations for the authenticated user's weight log entries.
//
// GET    /api/weight-log              → list all entries (newest first)
// POST   /api/weight-log              → create a new entry
// DELETE  /api/weight-log?id=<id>     → delete an entry by id

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  addWeightLog,
  getWeightLogsByUser,
  deleteWeightLog,
} from "@/services";

/** Revalidate every page that displays weight data */
function revalidatePages() {
  revalidatePath("/");
  revalidatePath("/weight");
}

// ─── GET /api/weight-log ───────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await getWeightLogsByUser(session.user.id);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[WEIGHT_LOG_GET]", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

// ─── POST /api/weight-log ──────────────────────────
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weight } = body;

    // ── Validation ──────────────────────────────
    if (typeof weight !== "number" || weight <= 0 || weight > 700) {
      return NextResponse.json(
        { error: "Weight must be a number between 0 and 700 kg." },
        { status: 400 },
      );
    }

    // ── Persist ─────────────────────────────────
    const entry = await addWeightLog({
      userId: session.user.id,
      weight: Math.round(weight * 10) / 10, // round to 1 decimal
    });

    // ── Revalidate ──────────────────────────────
    revalidatePages();

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("[WEIGHT_LOG_POST]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/weight-log?id=<id> ────────────────
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

    await deleteWeightLog(id);

    // ── Revalidate ──────────────────────────────
    revalidatePages();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WEIGHT_LOG_DELETE]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
