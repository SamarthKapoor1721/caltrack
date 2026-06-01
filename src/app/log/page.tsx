import { Card, CardHeader } from "@/components/ui";
import { MEAL_TYPES, MACRO_COLORS, getTodayISO } from "@/lib";
import { Clock, Apple } from "@/components/icons";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEntriesByUserAndDate } from "@/services";
import { FoodSearchWrapper } from "@/components/food-search-wrapper";
import { DeleteFoodEntry } from "./delete-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Log Food — CalTrack",
};

function mealLabel(type: string): string {
  return MEAL_TYPES.find((m) => m.value === type)?.label ?? type;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const MEAL_EMOJI: Record<string, string> = {
  BREAKFAST: "🌅",
  LUNCH: "☀️",
  DINNER: "🌙",
  SNACK: "🍿",
};

export default async function LogFoodPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = getTodayISO();
  const entries = await getEntriesByUserAndDate(session.user.id, today);
  const totalCal = entries.reduce((s, e) => s + e.calories, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
      {/* ── Header ──────────────────────────── */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Log Food</h1>
        <p className="mt-1 text-sm text-muted">
          Search for a food item to add it to your daily log.
        </p>
      </div>

      {/* ── Food Search ─────────────────────── */}
      <div className="animate-slide-up">
        <FoodSearchWrapper />
      </div>

      {/* ── Today's Entries ──────────────────── */}
      {entries.length > 0 && (
        <Card className="mt-8 animate-fade-in">
          <CardHeader
            title="Today's Log"
            subtitle={`${entries.length} ${entries.length === 1 ? "entry" : "entries"} · ${totalCal.toLocaleString()} kcal`}
          />
          <div className="stagger-children divide-y divide-border-light">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 sm:gap-4"
              >
                {/* Meal emoji badge */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/6 text-lg sm:h-11 sm:w-11">
                  {MEAL_EMOJI[entry.mealType] ?? "🍽️"}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{entry.foodName}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                    <span>{mealLabel(entry.mealType).split(" ").slice(1).join(" ")}</span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Macros mini */}
                <div className="hidden shrink-0 items-center gap-2 text-xs sm:flex">
                  <span className="rounded-md bg-blue-500/8 px-2 py-0.5 font-medium text-blue-600 dark:text-blue-400">
                    P {Math.round(entry.protein)}g
                  </span>
                  <span className="rounded-md bg-amber-500/8 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                    C {Math.round(entry.carbs)}g
                  </span>
                  <span className="rounded-md bg-rose-500/8 px-2 py-0.5 font-medium text-rose-600 dark:text-rose-400">
                    F {Math.round(entry.fat)}g
                  </span>
                </div>

                {/* Calories */}
                <div className="shrink-0 text-right">
                  <span className="text-sm font-bold">{entry.calories}</span>
                  <span className="ml-0.5 text-xs text-muted">kcal</span>
                </div>

                {/* Delete */}
                <DeleteFoodEntry id={entry.id} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="mt-10 flex flex-col items-center text-center animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
            <Apple className="h-8 w-8 text-primary" />
          </div>
          <p className="text-base font-semibold">No entries yet today</p>
          <p className="mt-1 text-sm text-muted">Use the search above to log your first meal.</p>
        </div>
      )}
    </div>
  );
}
