import { Card } from "@/components/ui";
import { Clock } from "@/components/icons";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById, getDailyNutritionHistory } from "@/services";
import { dateLabel, getTodayISO } from "@/lib";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "History — CalTrack",
};

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/login");

  const [days] = await Promise.all([getDailyNutritionHistory(user.id, 30)]);
  const goal = user.calorieGoal ?? null;
  const today = getTodayISO();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">History</h1>
        <p className="mt-1 text-sm text-muted">
          Review your past daily nutrition summaries.
        </p>
      </div>

      {days.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <p className="text-base font-semibold">No history yet</p>
          <p className="mt-1 text-sm text-muted">
            Log some meals and they&apos;ll show up here, grouped by day.
          </p>
        </div>
      ) : (
        <div className="stagger-children space-y-3">
          {days.map((day) => {
            const percent = goal ? Math.round((day.calories / goal) * 100) : null;
            const over = goal ? day.calories > goal : false;

            return (
              <Card key={day.date}>
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
                        {dateLabel(day.date, today)}
                      </p>
                      <p className="text-xs text-muted">
                        {day.entryCount} {day.entryCount === 1 ? "entry" : "entries"} · {day.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold tabular-nums">
                      {day.calories.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted">kcal</span>
                    </p>
                    {percent != null && (
                      <p className={`text-xs font-semibold ${over ? "text-red-500" : "text-primary"}`}>
                        {percent}% of goal
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar (only when a goal is set) */}
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
