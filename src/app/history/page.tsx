import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFoodEntriesSince, getWorkoutsByUserSince } from "@/services";
import { getTodayISO, toDateKey, dateLabel } from "@/lib";
import { Apple } from "@/components/icons";
import { EmptyState } from "@/components/ui";
import { HistoryTimeline, type HistoryDay } from "@/components/history-timeline";

export const dynamic = "force-dynamic";
export const metadata = { title: "History — CalTrack" };

const HISTORY_DAYS = 30;

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [foods, workouts] = await Promise.all([
    getFoodEntriesSince(session.user.id, HISTORY_DAYS),
    getWorkoutsByUserSince(session.user.id, HISTORY_DAYS),
  ]);

  const today = getTodayISO();

  // bucket by day
  const map = new Map<string, HistoryDay>();
  const ensure = (key: string): HistoryDay => {
    let d = map.get(key);
    if (!d) {
      d = {
        date: key,
        label: dateLabel(key, today),
        dayNum: new Date(`${key}T12:00:00`).getDate(),
        calories: 0,
        burned: 0,
        foods: [],
        workouts: [],
      };
      map.set(key, d);
    }
    return d;
  };

  for (const f of foods) {
    const d = ensure(toDateKey(f.createdAt));
    d.calories += f.calories;
    d.foods.push({ id: f.id, foodName: f.foodName, calories: f.calories, mealType: f.mealType });
  }
  for (const w of workouts) {
    const d = ensure(toDateKey(w.createdAt));
    d.burned += w.caloriesBurned ?? 0;
    d.workouts.push({
      id: w.id,
      exerciseName: w.exerciseName,
      sets: w.sets,
      reps: w.reps,
      weight: w.weight,
      intensity: w.intensity,
      toFailure: w.toFailure,
    });
  }

  const days = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div data-density="regular" className="stagger mx-auto grid w-full max-w-3xl gap-[var(--gap,18px)] px-5 py-6 pb-28 sm:px-6 lg:py-8">
      {days.length === 0 ? (
        <>
          <div>
            <h1 className="m-0 text-[27px] font-extrabold tracking-tight">
              Activity <span className="grad-text">History</span>
            </h1>
            <div className="mt-1 text-[13.5px] font-semibold text-muted">No records yet</div>
          </div>
          <EmptyState
            icon={<Apple width={26} height={26} />}
            title="No history yet"
            hint="Log meals or workouts and they'll show up here, grouped by day."
          />
        </>
      ) : (
        <HistoryTimeline days={days} today={today} />
      )}
    </div>
  );
}
