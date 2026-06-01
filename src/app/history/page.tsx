import { Card } from "@/components/ui";
import { Clock } from "@/components/icons";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getUserById,
  getDailyNutritionHistory,
  getWorkoutsByUserSince,
  type DailyHistoryEntry,
} from "@/services";
import { dateLabel, getTodayISO, toDateKey } from "@/lib";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "History — CalTrack",
};

const HISTORY_DAYS = 30;

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/login");

  const [days, workouts] = await Promise.all([
    getDailyNutritionHistory(user.id, HISTORY_DAYS),
    getWorkoutsByUserSince(user.id, HISTORY_DAYS),
  ]);

  const goal = user.calorieGoal ?? null;
  const today = getTodayISO();

  // Food summaries keyed by date.
  const foodByDay = new Map<string, DailyHistoryEntry>(days.map((d) => [d.date, d]));

  // Workouts grouped by the day they were performed, collapsing repeats of the
  // same exercise into a count (e.g. "Bench Press × 2").
  const workoutsByDay = new Map<string, Map<string, number>>();
  for (const w of workouts) {
    const key = toDateKey(w.createdAt);
    const exercises = workoutsByDay.get(key) ?? new Map<string, number>();
    exercises.set(w.exerciseName, (exercises.get(w.exerciseName) ?? 0) + 1);
    workoutsByDay.set(key, exercises);
  }

  // Union of every day that has food and/or workouts, newest first.
  const allDates = Array.from(
    new Set<string>([...foodByDay.keys(), ...workoutsByDay.keys()]),
  ).sort((a, b) => b.localeCompare(a));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">History</h1>
        <p className="mt-1 text-sm text-muted">
          Your daily nutrition and workouts, grouped by day.
        </p>
      </div>

      {allDates.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <p className="text-base font-semibold">No history yet</p>
          <p className="mt-1 text-sm text-muted">
            Log meals or workouts and they&apos;ll show up here, grouped by day.
          </p>
        </div>
      ) : (
        <div className="stagger-children space-y-3">
          {allDates.map((date) => {
            const food = foodByDay.get(date);
            const exercises = workoutsByDay.get(date);
            const percent = food && goal ? Math.round((food.calories / goal) * 100) : null;
            const over = food && goal ? food.calories > goal : false;
            const workoutCount = exercises
              ? Array.from(exercises.values()).reduce((s, n) => s + n, 0)
              : 0;

            return (
              <Card key={date}>
                {/* ── Day header ── */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        over ? "bg-red-500/8" : "bg-primary/8"
                      }`}
                    >
                      <Clock className={`h-5 w-5 ${over ? "text-red-500" : "text-primary"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold sm:text-base">
                        {dateLabel(date, today)}
                      </p>
                      <p className="text-xs text-muted">
                        {food ? `${food.entryCount} ${food.entryCount === 1 ? "meal" : "meals"}` : "No meals"}
                        {workoutCount > 0 && ` · ${workoutCount} ${workoutCount === 1 ? "workout" : "workouts"}`}
                        {" · "}{date}
                      </p>
                    </div>
                  </div>

                  {food && (
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums">
                        {food.calories.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-muted">kcal</span>
                      </p>
                      {percent != null && (
                        <p className={`text-xs font-semibold ${over ? "text-red-500" : "text-primary"}`}>
                          {percent}% of goal
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Calorie progress bar ── */}
                {percent != null && (
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-border/50">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: over ? "var(--color-red-500)" : "var(--primary)",
                        boxShadow: over
                          ? "0 0 8px rgba(239,68,68,0.3)"
                          : "0 0 8px var(--primary-glow)",
                      }}
                    />
                  </div>
                )}

                {/* ── Exercises done that day ── */}
                {exercises && exercises.size > 0 && (
                  <div className="mt-3 border-t border-border-light pt-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
                      <span>💪</span> Workout
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(exercises.entries()).map(([name, count]) => (
                        <span
                          key={name}
                          className="rounded-md bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {name}
                          {count > 1 && ` × ${count}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
