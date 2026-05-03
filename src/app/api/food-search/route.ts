// ─── Food Search API Route ───
// Proxies search queries to the USDA FoodData Central API
// and returns a normalised list of food items with macros.
//
// GET  /api/food-search?q=chicken+breast   → type-ahead search
// POST /api/food-search  { fdcId: 12345 }  → single-food detail lookup

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FDC_API_KEY = process.env.FDC_API_KEY ?? "";
const FDC_BASE = "https://api.nal.usda.gov/fdc/v1";

// Normalised shape returned to the client
export interface FDCFood {
  fdcId: number;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

// ─── Helpers ─────────────────────────────────────

/** Extract a nutrient value from the FDC `foodNutrients` array */
function nutrient(
  nutrients: Array<Record<string, unknown>>,
  nutrientId: number,
): number {
  // The search endpoint nests the id under `nutrientId` or `nutrient.nutrientId`
  const entry = nutrients.find((n) => {
    const id =
      (n.nutrientId as number) ??
      ((n.nutrient as Record<string, unknown>)?.nutrientId as number) ??
      (n.nutrientNumber as string);
    return Number(id) === nutrientId;
  });
  if (!entry) return 0;
  const v = (entry.value as number) ?? (entry.amount as number) ?? 0;
  return Math.round(v * 10) / 10;
}

/** Map a raw FDC food object → our normalised shape */
function mapFood(item: Record<string, unknown>): FDCFood {
  const nutrients = (item.foodNutrients ?? []) as Array<Record<string, unknown>>;
  return {
    fdcId: (item.fdcId as number) ?? 0,
    name: ((item.description ?? item.lowercaseDescription ?? "") as string),
    brand: ((item.brandName ?? item.brandOwner ?? "") as string),
    // USDA nutrient IDs: 1008=Energy(kcal), 1003=Protein, 1005=Carbs, 1004=Fat
    calories: Math.round(nutrient(nutrients, 1008)),
    protein: nutrient(nutrients, 1003),
    carbs: nutrient(nutrients, 1005),
    fat: nutrient(nutrients, 1004),
    servingSize: (item.servingSize as number) ?? 100,
    servingUnit: ((item.servingSizeUnit ?? "g") as string),
  };
}

// ─── GET  /api/food-search?q=… ─────────────────
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ foods: [] });
    }

    if (!FDC_API_KEY) {
      return NextResponse.json(
        { error: "FoodData Central API key is not configured." },
        { status: 503 },
      );
    }

  const url = new URL(`${FDC_BASE}/foods/search`);
url.searchParams.set("api_key", FDC_API_KEY);
url.searchParams.set("query", query);
url.searchParams.set("pageSize", "12");

    const res = await fetch(url.toString());

    if (!res.ok) {
      console.error("[FOOD_SEARCH] FDC search error", res.status);
      const errMsg =
        res.status === 403
          ? "Invalid FDC API key. Please get a new key at https://fdc.nal.usda.gov/api-key-signup and update your .env file."
          : "Failed to search for foods.";
      return NextResponse.json(
        { error: errMsg },
        { status: 502 },
      );
    }

    const data = await res.json();
    const foods: FDCFood[] = ((data.foods ?? []) as Array<Record<string, unknown>>)
      .slice(0, 12)
      .map(mapFood);

    return NextResponse.json({ foods });
  } catch (error) {
    console.error("[FOOD_SEARCH]", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

// ─── POST /api/food-search ─────────────────────
// Detailed single-food lookup by FDC ID.
// Body: { fdcId: 12345 }
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const fdcId = body.fdcId as number;

    if (!fdcId || typeof fdcId !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid fdcId." },
        { status: 400 },
      );
    }

    if (!FDC_API_KEY) {
      return NextResponse.json(
        { error: "FoodData Central API key is not configured." },
        { status: 503 },
      );
    }

    const res = await fetch(`${FDC_BASE}/food/${fdcId}?api_key=${FDC_API_KEY}`);

    if (!res.ok) {
      console.error("[FOOD_SEARCH] FDC detail error", res.status);
      return NextResponse.json(
        { error: "Could not look up nutrition info." },
        { status: 502 },
      );
    }

    const item = (await res.json()) as Record<string, unknown>;
    const food = mapFood(item);

    return NextResponse.json({ food });
  } catch (error) {
    console.error("[FOOD_SEARCH]", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
