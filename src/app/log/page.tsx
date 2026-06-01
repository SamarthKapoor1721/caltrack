import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEntriesByUserAndDate, getUserById } from "@/services";
import { getTodayISO } from "@/lib";
import { Card, ProgressBar } from "@/components/ui";
import { Egg, Apple, Drop, Star } from "@/components/icons";
import { AddFoodButton } from "@/components/food-search-modal";
import { DeleteFoodEntry } from "./delete-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log Food — CalTrack" };

const MEALS = [
  { value: "BREAKFAST", label: "Breakfast", Icon: Egg, color: "#f59e0b" },
  { value: "LUNCH", label: "Lunch", Icon: Apple, color: "#16a34a" },
  { value: "DINNER", label: "Dinner", Icon: Drop, color: "#6366f1" },
  { value: "SNACK", label: "Snack", Icon: Star, color: "#ec4899" },
] as const;

function fmtDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default async function LogFoodPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = getTodayISO();
  const [entries, user] = await Promise.all([
    getEntriesByUserAndDate(session.user.id, today),
    getUserById(session.user.id),
  ]);

  const goal = user?.calorieGoal ?? 2000;
  const totals = entries.reduce(
    (a, e) => ({ cal: a.cal + e.calories, p: a.p + e.protein, c: a.c + e.carbs, fat: a.fat + e.fat }),
    { cal: 0, p: 0, c: 0, fat: 0 },
  );

  return (
    <div data-density="regular" className="stagger mx-auto grid w-full max-w-3xl gap-[var(--gap,18px)] px-5 py-6 pb-28 sm:px-6 lg:py-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-[27px] font-extrabold tracking-tight">
            <span className="grad-text">Food</span> Log
          </h1>
          <div className="mt-1 text-[13.5px] font-semibold text-muted">
            {fmtDate(today)} · {entries.length} entries
          </div>
        </div>
        <AddFoodButton variant="primary" />
      </div>

      {/* ── Day total ── */}
      <Card glass>
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="grad-text font-mono text-3xl font-extrabold">{totals.cal}</span>
            <span className="font-semibold text-muted">/ {goal} kcal</span>
          </div>
          <div className="flex gap-[18px]">
            <MacroTag label="Protein" value={Math.round(totals.p)} color="var(--protein)" />
            <MacroTag label="Carbs" value={Math.round(totals.c)} color="var(--carbs)" />
            <MacroTag label="Fat" value={Math.round(totals.fat)} color="var(--fat)" />
          </div>
        </div>
        <ProgressBar value={totals.cal} goal={goal} height={9} />
      </Card>

      {/* ── Meals ── */}
      {MEALS.map(({ value, label, Icon, color }) => {
        const items = entries.filter((e) => e.mealType === value);
        const mealCal = items.reduce((s, e) => s + e.calories, 0);
        return (
          <Card key={value} glass pad={false}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: items.length ? "1px solid var(--border)" : "none" }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                  style={{ background: `color-mix(in oklab,${color} 15%,transparent)`, color }}
                >
                  <Icon width={18} height={18} />
                </span>
                <div>
                  <div className="text-[15px] font-bold">{label}</div>
                  <div className="text-xs text-muted">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[15px] font-bold">
                  {mealCal}
                  <span className="text-[11px] font-medium text-muted"> kcal</span>
                </span>
                <AddFoodButton meal={value} iconOnly />
              </div>
            </div>
            {items.length === 0 ? (
              <div className="px-5 py-3.5 text-[13px] text-muted">Nothing logged yet.</div>
            ) : (
              <div>
                {items.map((f) => (
                  <div
                    key={f.id}
                    className="ct-foodrow flex items-center justify-between px-5 py-3 transition-colors"
                    style={{ borderTop: "1px solid var(--border-soft)" }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{f.foodName}</div>
                      <div className="mt-1 flex gap-3 font-mono text-[11.5px] text-muted">
                        <span style={{ color: "var(--protein)" }}>P {Math.round(f.protein)}g</span>
                        <span style={{ color: "var(--carbs)" }}>C {Math.round(f.carbs)}g</span>
                        <span style={{ color: "var(--fat)" }}>F {Math.round(f.fat)}g</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-[15px] font-bold">
                        {f.calories}
                        <span className="text-[10.5px] font-medium text-muted"> kcal</span>
                      </span>
                      <DeleteFoodEntry id={f.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function MacroTag({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-right">
      <div className="font-mono text-[15px] font-bold" style={{ color }}>
        {value}g
      </div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
